"use strict";

const ApiService            					= require("moleculer-web");
const SocketIOService       					= require('moleculer-io');
const redis                 					= require('redis');
const redisAdapter          					= require('socket.io-redis');
const express               					= require('express');
const app                   					= express();
const server                					= require('http').Server(app);

/**
 * MODELS
 */
const USER_MODEL           						= require('../../services/auth/model/auth.user-model').MODEL;

/**
 * TOOLS
 */
const { REDIS_SEPERATOR }   					= require('../../tools/cache/cf_redis');
const { sendDataToMultilSocketsOfListUser } 	= require('../../tools/socket/index');
const { CF_DOMAIN_SERVICES } 		    		= require('../gateway/helper/domain.constant');
const { CF_ACTIONS_AUTH } 		    		    = require('../auth/helper/auth.actions-constant');

/**
 * mỗi service có thể có 1/n event socket -> cách đặt tên [service].[socket]
 */
const { NOTIFICATION_SOCKET } 					= require('../notification/notification.socket');
const { CHATTING_SOCKET } 						= require('../chatting/chatting.socket');
const { MEDIA_SOCKET } 						    = require('../media/media.socket');
const { REACTION_SOCKET }                       = require('../reaction/reaction.socket');
const { SUBJECT_SOCKET }                        = require('../subject_pcm/subject_pcm.socket');
const { FNB_SOCKET }                            = require('../fnb/fnb.socket');
const { ACCOUNTING_SOCKET }                     = require('../accounting/accounting.socket');
const { ITEM_SOCKET }                           = require('../item/item.socket');

let pub = redis.createClient({
    host: REDIS_SEPERATOR.HOST,
    port: REDIS_SEPERATOR.PORT,
    auth_pass: REDIS_SEPERATOR.PWD
});

let sub = pub.duplicate({
    host: REDIS_SEPERATOR.HOST,
    port: REDIS_SEPERATOR.PORT,
    auth_pass: REDIS_SEPERATOR.PWD
})

/**
 * socket-io service
 */
module.exports = {
    name: "socket-io",
    mixins: [ApiService, SocketIOService], // Should after moleculer-web
    settings: {
        io: {
            options: {
                adapter: redisAdapter({
                    pubClient: pub,
                    subClient: sub
                })
            },
            namespaces: {
                '/': {
                    authorization: true,
                    middlewares: [async function(socket, next){
                        /**
                         * userID: lấy resp từ socketAuthorize
                         */
                        const userID        = socket.client.user;
                        const newSocketID   = socket.id;

                        if (!userID) {
                            return next();
                        }

                        this.userID = userID;
                        this.addNewUserIntoListConnected(newSocketID);

                        // Xét user Online
                        const _infoUser = await USER_MODEL.getDataById(userID);
                        this.setUserOnline({ _infoUser });

                        // this.bizfullname = _infoUser.bizfullname;
                        // this.sendUserOnline({ _infoUser });

                        next();
                    }],
                    events: {
                        'call': {
                            whitelist: [
                                // 'users.*',
                                // 'rooms.*',
                                // 'io.*'
                            ],
                            aliases: {
                                // 'login': 'users.login'
                            },
                            // onBeforeCall: async function(ctx, socket, action, params, callOptions){
                            //     console.log('before hook:', { action, params, callOptions });
                            // },
                            // onAfterCall: async function(ctx, socket, res){
                            //     console.log('after hook', res);
                            // }
                        },

                        /**
                         *  passing all event of all services
                         */
                        ...NOTIFICATION_SOCKET,
                        ...REACTION_SOCKET,
                        ...CHATTING_SOCKET,
                        ...MEDIA_SOCKET,
                        ...SUBJECT_SOCKET,
                        ...FNB_SOCKET,
                        ...ACCOUNTING_SOCKET,
                        ...ITEM_SOCKET,

                        // 'CLIENT_SEND_CHATTING_TEST': async function(data) {
                        //     let socket                      = this;
                        //     let userID                      = socket.client.user;
                        //     let listUserActive              = socket.$service.listUserConnected;
                        //     let io                          = socket.$service.io;

                        //     const allUsers = await USER_COLL.find({}).select('_id').lean();
                        //     const listUserID = allUsers.map(user => user._id);
                        //     console.log({ data })

                        //     // this.emit('HELLO_WORLD', data);
                        //     sendDataToMultilSocketsOfListUser({
                        //         listUserConnected: listUserActive,
                        //         arrReceiver: listUserID,
                        //         data: {
                        //             data,
                        //             message: "Hi Client!! I'm server...",
                        //             userID,
                        //             listUserActive
                        //         },
                        //         event: 'SERVER_SEND_CHATTING_TEST', io
                        //     })
                        // },

                        'disconnect': async function() {
                            const socketDisconnectID = this.id;

							console.log({ ['disconnect']: socketDisconnectID });
                            this.$service.removeUserDisconnectIntoListConnected(socketDisconnectID);

                            // Xét user Offline
                            const userID = this.client.user;

                            if (userID) {
                                const _infoUser = await USER_MODEL.getDataById(userID);
                                this.$service.setUserOffline({ _infoUser });
                            }

                            // ---> ví dụ emit
                            // this.$service.io.to(user.socketID).emit("USER_LOGOUT", {listUserConnected, socketLogout});
                        },

                    }
                }
            }
        },
    },
    methods: {
        async socketAuthorize(socket){
            try {
                let token = socket.handshake.query.token;
                let accessKey = socket.handshake.query.access_key;

                if(accessKey === process.env.SOCKET_ACCESS_KEY){
                    return Promise.resolve("");
                }

                let checkAuthorization = await this.broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.RESOLVE_TOKEN}`, { token });

                if(checkAuthorization.error){
                    return Promise.reject(checkAuthorization.message);
                }
                let infoUser = checkAuthorization.data && checkAuthorization.data.infoUser;

                this.logger.info("Authenticated via JWT: ", infoUser.bizfullname);
                this.userID = infoUser._id;
                this.bizfullname = infoUser.bizfullname;

                return Promise.resolve(this.userID);
            } catch (error) {
                console.error(error);
                return Promise.reject(error.message);
            }
        },

        addNewUserIntoListConnected(socketID){
            let listUserConnected 	= this.listUserConnected;
            let _userID 			= this.userID?.toString();
            socketID 				= socketID.toString();

            if(!listUserConnected[_userID]){
                listUserConnected[_userID]          = {};
                listUserConnected[_userID].sockets  = [];
                listUserConnected[_userID].sockets  = [...listUserConnected[_userID].sockets, socketID];
            }

            if(listUserConnected[_userID]){
                listUserConnected[_userID].sockets = listUserConnected[_userID].sockets.filter(_socketID => _socketID != socketID);
                listUserConnected[_userID].sockets = [...listUserConnected[_userID].sockets, socketID];
            }

            this.listUserConnected = listUserConnected;
            return listUserConnected;
        },

        removeUserDisconnectIntoListConnected(socketDisconnectID){
            const userID                                       = this.userID?.toString();
            let listUserConnected                              = this.listUserConnected;
            socketDisconnectID                                 = socketDisconnectID && socketDisconnectID.toString();

            if(userID) {
                listUserConnected[userID].sockets  = listUserConnected[userID].sockets.filter(_socketID => _socketID != socketDisconnectID);
            }

            return listUserConnected;
        },

        setUserOnline({ _infoUser }){
            if(!_infoUser) return;

            let friends             = _infoUser && _infoUser.friends;
            let listFriendOnline    = [];
            let listUserActive      = this.listUserConnected || [];
            let io                  = this.io;

			friends && friends.forEach(friendID => {
                if(listUserActive[friendID]){
					listFriendOnline[listFriendOnline.length] = friendID;
                }
            });

            // Gửi tín hiệu kết nối cho những người bạn
            sendDataToMultilSocketsOfListUser({
				io,
				event: 'SSC_ONLINE_USER',
				arrReceiver: [_infoUser._id],
				listUserConnected: listUserActive,
				data: {
					friendOnline: listFriendOnline,
					disconnect: false,
					isFirstTime: false
				}
			})

			// console.log({ SOCKET_CURRENT_USER: listUserActive[_infoUser._id].sockets, userID: _infoUser._id })
			// console.log({ listFriendOnline, listUserActive, userID: _infoUser._id })
        },

        setUserOffline({ _infoUser }){
            if (!_infoUser) return;

            let friends             = _infoUser && _infoUser.friends;
            let listFriendOnline    = [];
            let listUserActive      = this.listUserConnected || [];
            let io                  = this.io;

            // Xử lý hiển thị offline khi disconect
            if(listUserActive[_infoUser._id]){

                friends && friends.forEach(friendID => {
                    if(listUserActive[friendID]){
                        listFriendOnline[listFriendOnline.length] = friendID;
                    }
                });

                sendDataToMultilSocketsOfListUser({
					io,
					event: 'SSC_OFFLINE_USER',
					arrReceiver: listFriendOnline,
					listUserConnected: listUserActive,
					data: {
						friendOffline: _infoUser._id,
						disconnect: true,
						isFirstTime: false
					}
				})
            }

        },

        sendUserOnline({ _infoUser }){
            if (!_infoUser) return;

            let friends             = _infoUser && _infoUser.friends;
            let listFriendOnline    = [];
            let listUserActive      = this.listUserConnected || [];
            let io                  = this.io;

			friends && friends.forEach(friendID => {
                if(listUserActive[friendID]){
					listFriendOnline[listFriendOnline.length] = friendID;
                }
            });

            // Gửi tín hiệu kết nối cho những người bạn
            sendDataToMultilSocketsOfListUser({
				io,
				event: 'SSC_USER_ONLINE',
				arrReceiver: listFriendOnline,
				listUserConnected: listUserActive,
				data: {
					friendOnline: _infoUser._id,
					disconnect: false,
					isFirstTime: false
				}
			})
        },
    },

    dependencies: [
		CF_DOMAIN_SERVICES.AUTH
	],

    /**
     * Service created lifecycle event handler
     */
    created() {
        this.initSocketIO(server);
        this.listUserConnected = [];
        this.userID = "";
        this.bizfullname = "";
    },

    /**
     * Service started lifecycle event handler
     */
    async started() {
        // this.app.listen(Number(this.settings.port), err => {
        //  if (err)
        //      return this.broker.fatal(err);
        //  this.logger.info(`WWW server started on port ${this.settings.port}`);
        // });

        server.listen(4000);
    },

    /**
     * Service stopped lifecycle event handler
     */
    async stopped() {}
};
