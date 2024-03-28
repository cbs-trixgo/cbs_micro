/**
 * CONSTANTS
 */
const { EVENT_SOCKET_CONSTANT_CHATTING } 		= require('./helper/chatting.events-socket-constant');
const { CF_DOMAIN_SERVICES } 					= require('../gateway/helper/domain.constant');
const { CF_ACTIONS_AUTH } 						= require('../auth/helper/auth.actions-constant');

/**
 * TOOLS
 */
const { sendDataToMultilSocketsOfListUser } 	= require('../../tools/socket');
const { IsJsonString } 							= require('../../tools/utils/utils');

/**
 * COLLECTIONS
 */
const CHATTING__CONVERSATION_COLL 				= require('./database/chatting.conversation-coll');
const CHATTING__MESSAGE_COLL 					= require('./database/chatting.message-coll');

/**
 * MODELS
 */
const CHATTING__MESSAGE_MODEL 					= require('./model/chatting.message-model').MODEL;
const CHATTING__MESSAGE_POLL_MODEL 				= require('./model/chatting.message_poll-model').MODEL;
const CHATTING__MESSAGE_REMINDER_MODEL 			= require('./model/chatting.message_reminder-model').MODEL;
const CHATTING__MESSAGE_NPS_MODEL 				= require('./model/chatting.message_nps-model').MODEL;
const CHATTING__REACTION_MESSAGE_MODEL			= require('./model/chatting.message_reaction-model').MODEL;
const { ENV_DEVICE_APP_TEASER } 				= require('../notification/helper/notification.keys-constant')

exports.CHATTING_SOCKET = {

    // 'CLIENT_SEND_CHATTING_TEST': async function(data, ack) {
    //     let socket                      = this;
    //     let userID                      = socket.client.user;
    //     let listUserActive              = socket.$service.listUserConnected;
    //     let io                          = socket.$service.io;

    //     sendDataToMultilSocketsOfListUser({
	// 		listUserConnected: listUserActive,
	// 		arrReceiver: [userID],
	// 		data: {
	// 			message: "Hi Client!! I'm server...",
	// 			userID,
	// 			listUserActive
	// 		},
	// 		event: 'SERVER_SEND_CHATTING_TEST', io
	// 	})
    // },

    // =============================== CONVERSATION ==================================

	/**
	 * Dev: MinhVH
	 * Func: Tạo cuộc hội thoại mới
	 * Date: ...
	 */
    [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_NEW_CONVERSATION]: async function(data, ack) {
        let socket                      = this;
        let listUserActive              = socket.$service.listUserConnected;
        let userID                      = socket.client.user;
        let io                          = socket.$service.io;
		let { conversationID } 			= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL
			.findById(conversationID)
			.populate({
				path: 'authors',
				select: '_id fullname bizfullname image'
			})
			.lean();

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_NEW_CONVERSATION], io
			});
		}

		const { authors, members } 	= infoConversation;
		const arrReceiver 			= members.filter(memberID => memberID.toString() !== userID.toString());

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver,
			data: {
				error: false,
				data: {
					infoConversation,
					infoAuthor: {
						_id      : authors[0]._id,
						fullname : authors[0].fullname,
						image    : authors[0].image,
					}
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_NEW_CONVERSATION], io
		});
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật cuộc hội thoại
	 * Date: ...
	 */
    [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_UPDATE_INFO_CONVERSATION]: async function(data, ack) {
        let socket                 	= this;
        let listUserActive         	= socket.$service.listUserConnected;
        let io                     	= socket.$service.io;
        let userID                 	= socket.client.user;
        let { conversationID } 		= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL
			.findById(conversationID)
			.select('members')
			.lean();

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_INFO_CONVERSATION], io
			});
		}

		const infoConversationResponse = await CHATTING__CONVERSATION_COLL
			.findById(conversationID)
			.populate('members', '_id bizfullname image')
			.lean();

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver: infoConversation.members,
			data: { error: false, data: infoConversationResponse },
			event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_INFO_CONVERSATION], io
		});

    },

	/**
	 * Dev: MinhVH
	 * Func: Thêm thành viên vào cuộc hội thoại
	 * Date: ...
	 */
    [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_ADD_MEMBER_CONVERSATION]: async function(data, ack) {
        let socket                      	= this;
		let broker                      	= socket.$service.broker;
        let listUserActive              	= socket.$service.listUserConnected;
        let io                          	= socket.$service.io;
        let userID                      	= socket.client.user;
        let { conversationID, membersID } 	= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID);

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_ADD_MEMBER_CONVERSATION], io
			});
		}

		const infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname fullname image'
		});
		const addedMembers = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_USER_WITH_CONDITION}`, {
			condition: { _id: { $in: membersID } },
			select: '_id bizfullname fullname image'
		});

		const { members, usersMute } = infoConversation;
		const listMemberIDMuteConversation = usersMute.map(userID => userID.toString());

		// Không gửi đến user tắt thông báo cuộc hội thoại
		const arrReceiver = members.filter(memberID => {
			return memberID.toString() !== userID.toString() && !listMemberIDMuteConversation.includes(memberID.toString())
		});

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver,
			data: {
				error: false,
				data: {
					infoConversation,
					infoSender: infoSender.data,
					addedMembers: addedMembers.data,
				}
			},
			event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_ADD_MEMBER_CONVERSATION], io
		});

    },

	/**
	 * Dev: MinhVH
	 * Func: Xoá thành viên khỏi cuộc hội thoại
	 * Date: ...
	 */
    [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_REMOVE_MEMBER_CONVERSATION]: async function(data, ack) {
        let socket                      	= this;
		let broker                      	= socket.$service.broker;
        let listUserActive              	= socket.$service.listUserConnected;
        let io                          	= socket.$service.io;
        let userID                      	= socket.client.user;
		let { conversationID, memberID } 	= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID).lean();

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_REMOVE_MEMBER_CONVERSATION], io
			});
		}

		const infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname fullname image'
		});
		const removedMember = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_USER_WITH_CONDITION}`, {
			condition: { _id: memberID },
			select: '_id bizfullname fullname image'
		});

		// const { members, usersMute } = infoConversation;
		// const listMemberIDMuteConversation = usersMute.map(userID => userID.toString());

		// Không gửi đến user tắt thông báo cuộc hội thoại
		// const arrReceiver = members.filter(memberID => {
		// 	return memberID.toString() !== userID.toString() && !listMemberIDMuteConversation.includes(memberID.toString())
		// });

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver: [...infoConversation.members, memberID],
			data: {
				error: false,
				data: {
					infoConversation,
					infoSender: infoSender.data,
					removedMember: removedMember.data,
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_REMOVE_MEMBER_CONVERSATION], io
		});

    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật admin cho cuộc hội thoại
	 * Date: 11/08/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_UPDATE_ADMIN_CONVERSATION]: async function(data, ack) {
		let socket                         	= this;
		let broker                      	= socket.$service.broker;
		let listUserActive                 	= socket.$service.listUserConnected;
		let userID                         	= socket.client.user;
		let io                             	= socket.$service.io;
		let { conversationID, memberID, isSetAdmin } = data;

		const infoConversation = await CHATTING__CONVERSATION_COLL
			.findById(conversationID)
			.populate('members', '_id bizfullname image')
			.lean();

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_ADMIN_CONVERSATION], io
			});
		}

		const infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname fullname image'
		});
		const infoMember = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID: memberID,
			select: '_id bizfullname fullname image'
		});

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver: infoConversation.members,
			data: {
				error: false,
				data: {
					infoConversation,
					infoSender: infoSender.data,
					infoMember: infoMember.data,
					isSetAdmin
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_ADMIN_CONVERSATION], io
		});

	},

	/**
	 * Dev: MinhVH
	 * Func: Member rời khỏi cuộc hội thoại
	 * Date: 15/08/2021
	 */
    [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_MEMBER_LEAVE_CONVERSATION]: async function(data, ack) {
        try {
			let socket                      	= this;
			let broker                      	= socket.$service.broker;
			let listUserActive              	= socket.$service.listUserConnected;
			let userID                      	= socket.client.user;
			let io                          	= socket.$service.io;
			let { conversationID, memberID } 	= data;

			const infoConversation = await CHATTING__CONVERSATION_COLL
				.findById(conversationID)
				.select('_id name members usersMute')
				.populate({
					path: 'members',
					select: '_id bizfullname image',
					options: {
						limit: 5
					}
				})
				.lean();

			if(!infoConversation){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Can't get info conversation" },
					event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_MEMBER_LEAVE_CONVERSATION], io
				});
			}

			const infoMember = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
				userID: memberID,
				select: '_id bizfullname fullname image'
			});

			const { name, members, usersMute } = infoConversation;
			const listMemberIDMuteConversation = usersMute.map(userID => userID.toString());

			// Không gửi đến user tắt thông báo cuộc hội thoại
			const membersID = members.map(member => member._id);
			const arrReceiver = membersID.filter(memberID => {
				return memberID.toString() !== userID.toString() && !listMemberIDMuteConversation.includes(memberID.toString())
			});

			const infoConversationResponse = await CHATTING__CONVERSATION_COLL
				.findById(conversationID)
				.populate({
					path: 'members',
					select: '_id bizfullname image',
					options: { limit: 5 }
				})
				.lean();

			broker.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
				users: arrReceiver,
				title: name,
				description: `${infoMember?.data?.bizfullname} vừa rời khỏi cuộc trò chuyện`,
				dataSend: {
					conversationID
				},
				web_url: `https://app.trixgo.com/messages#${conversationID}`,
				env: ENV_DEVICE_APP_TEASER
			});

			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: membersID,
				data: {
					error: false,
					data: {
						infoConversation: infoConversationResponse,
						infoMember: infoMember.data
					}
				}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_MEMBER_LEAVE_CONVERSATION], io
			});
		} catch (error) {
			console.info('CHATTING_CSS_MEMBER_LEAVE_CONVERSATION');
			console.error(error)
		}
    },

	/**
	 * Dev: MinhVH
	 * Func: Giải tán cuộc hội thoại (xóa nhóm)
	 * Date: 15/08/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_REMOVE_CONVERSATION]: async function(data, ack) {
        let socket               = this;
        let listUserActive       = socket.$service.listUserConnected;
        let io                   = socket.$service.io;
        let { infoConversation } = data;

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver: infoConversation.members,
			data: {
				error: false,
				data: infoConversation
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_REMOVE_CONVERSATION], io
		});
    },


    //========================= MESSAGE ===============================

	/**
	 * Dev: MinhVH
	 * Func: Thêm tin nhắn trong cuộc hội thoại (text, emoij, tag name)
	 * Date: 17/08/2021
	 */
    [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_SEND_MESSAGE]: async function(data) {
        try {
			let socket                      = this;
			let broker                      = socket.$service.broker;
			let listUserActive              = socket.$service.listUserConnected;
			let io                          = socket.$service.io;
			let userID                      = socket.client.user;

			let {
				tmpid, conversationID, content, parentID, usersAssigned, files, location, type, usersTag,
				notifyFor, remindTime, repeat,
				name, options,
				serviceID, typeNps
			} = data;

			let infoMessageAfterInsert = {};

			switch (+type) {
				case 4:
					infoMessageAfterInsert = await CHATTING__MESSAGE_REMINDER_MODEL.insert({
						conversationID, content, notifyFor, remindTime, repeat, authorID: userID, ctx: broker
					});
					break;
				case 5:
					infoMessageAfterInsert = await CHATTING__MESSAGE_POLL_MODEL.insert({
						conversationID, name, options, authorID: userID
					});
					break;
				case 8:
					infoMessageAfterInsert = await CHATTING__MESSAGE_NPS_MODEL.insert({
						conversationID, serviceID, type: typeNps, userID
					});
					break;
				default:
					infoMessageAfterInsert = await CHATTING__MESSAGE_MODEL.insertMessage({
						conversationID,
						senderID: userID,
						content,
						parentID,
						usersAssigned,
						files,
						location,
						type,
						ctx: broker
					})
					break;
			}

			if(infoMessageAfterInsert.error){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: {
						tmpid,
						infoMessage: infoMessageAfterInsert,
					},
					event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_RECEIVE_MESSAGE], io
				});
			}

			const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID).lean();
			const { members, usersMute } = infoConversation;
			const listMemberIDMuteConversation = usersMute?.map(userID => userID.toString()) || [];

			// Không gửi thông báo đến user tắt thông báo cuộc hội thoại
			// const arrReceiver = members.filter(memberID => {
			// 	return memberID.toString() !== userID.toString() && !listMemberIDMuteConversation.includes(memberID.toString())
			// });

			if(usersTag && usersTag.length){
				usersTag = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_USER_WITH_CONDITION}`, {
					condition: { _id: { $in: usersTag } },
					select: '_id bizfullname fullname image'
				});
				usersTag = usersTag?.data;
			}

			let infoMessage = null;
			let listMemberWithAmountMissMessage = [];

			if(infoMessageAfterInsert.data){
				infoMessage = await CHATTING__MESSAGE_COLL
					.findById(infoMessageAfterInsert.data?._id, { createdAt: 0, updatedAt: 0, __v: 0 })
					.populate({
						path: 'sender receivers usersAssigned',
						select: '_id fullname bizfullname image email phone'
					})
					.populate({
						path: 'reactions',
						select: '_id type',
						populate: {
							path: 'userCreate',
							select: '_id fullname image'
						}
					})
					.populate({
						path: 'parent',
						populate: {
							path: 'sender usersAssigned files.file',
							populate: {
								path: 'file',
								select: 'name path size'
							},
							select: '_id bizfullname fullname image'
						}
					})
					.populate({
						path: 'reminder',
						populate: {
							path: 'accepts rejects',
							select: '_id bizfullname fullname image'
						}
					})
					.populate({
						path: 'poll',
						populate: {
							path: 'options.usersVote',
							select: '_id bizfullname fullname image'
						}
					})
					.populate({
						path: 'nps',
						populate: {
							path: 'service',
							populate: {
								path: 'childs',
								select: 'name description type'
							}
						}
					})
					.populate({
						path: 'files.file',
						populate: {
							path: 'file',
							select: 'name nameOrg path size'
						},
					})
					.lean();
			}

			// Get member and amount miss message of member
			for (const memberID of members) {
				let amountMissMessage = 0;

				const listAllConversation = await CHATTING__CONVERSATION_COLL.find({
					members: { $in: [memberID] }
				}).select('usersMissMessage').lean();

				listAllConversation.map(conversation => {
					const user = conversation.usersMissMessage?.find(user =>
						user.userID.toString() === memberID.toString());

					user && (amountMissMessage += user.amount);
				})

				listMemberWithAmountMissMessage[listMemberWithAmountMissMessage.length] = {
					memberID,
					amountMissMessage
				}
			}

			let infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
				userID,
				select: 'fullname bizfullname'
			});

			let senderFullname = infoSender?.data?.bizfullname;
			let description = '';

			switch (infoMessage.type) {
				case 1:
					description = `đã gửi 1 ảnh`;
					break;
				case 2:
					description = `đã gửi 1 file`;
					break;
				case 4:
					description = `đã tạo 1 nhắc hẹn`;
					break;
				case 5:
					description = `đã tạo 1 cuộc bình chọn`;
					break;
				case 8:
					description = `đã tạo 1 tin nhắn NPS`;
					break;
				default:
					description = infoMessage.content;
					break;
			}

			if(!infoConversation.isPrivate) {
				if(usersTag && usersTag.length) {
					description = description.replaceAll(/[@]\[(.*?)\]\((.*?)\)/g, replacement => {
						const matchs = (/[@]\[(.*?)\]\((.*?)\)/g).exec(replacement);
						if (matchs) {
							const fullName = matchs[1];

							return `@${fullName}`;
						} else {
							return replacement;
						}
					})
				}

				description = `${senderFullname}: ${description}`;
				senderFullname = infoConversation.name;
			}

			listMemberWithAmountMissMessage.map(({ memberID, amountMissMessage }) => {
				// SEND SOCKET
				sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [memberID],
					data: {
						tmpid,
						amountMissMessage: amountMissMessage,
						usersTag,
						infoMessage,
					},
					event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_RECEIVE_MESSAGE], io
				});

				if(memberID.toString() !== userID.toString() && !listMemberIDMuteConversation?.includes(memberID.toString())) {
					// SEND CLOUD-MSG
					broker.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
						users: [memberID],
						title: senderFullname,
						description,
						amountNoti: amountMissMessage,
						dataSend: {
							conversationID: infoConversation._id
						},
						web_url: `https://app.trixgo.com/messages#${infoMessage._id}`,
						env: ENV_DEVICE_APP_TEASER
					});
				}
			})
		} catch (error) {
			console.info('EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_SEND_MESSAGE');
			console.error(error);
		}
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật người seen tin nhắn
	 * Date: 20/02/2022
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_UPDATE_SEEN_MESSAGE]: async function(data, ack) {
		let socket                      	= this;
		let broker                      	= socket.$service.broker;
		let listUserActive              	= socket.$service.listUserConnected;
		let userID                      	= socket.client.user;
		let io                          	= socket.$service.io;
		let { conversationID, messagesID } 	= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID);

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_SEEN_MESSAGE], io
			});
		}

		const infoUserSeen = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname fullname image'
		});

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver: infoConversation.members,
			data: {
				error: false,
				data: {
					infoConversation,
					infoUserSeen: infoUserSeen.data,
					messagesID
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_SEEN_MESSAGE], io
		});
	},

	/**
	 * Dev: MinhVH
	 * Func: Chia sẻ tin nhắn đến các cuộc hội thoại
	 * Date: 25/08/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_SHARE_MESSAGE]: async function(data, ack) {
		let socket                      = this;
		let listUserActive              = socket.$service.listUserConnected;
		let io                          = socket.$service.io;
		let userID                      = socket.client.user;
		let { conversationsID, messagesID } = data;
		let listConversationShare = [];

		if(!conversationsID || !conversationsID.length || !messagesID || !messagesID.length){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation or message" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_SHARE_MESSAGE], io
			});
		}

		for (const conversationID of conversationsID) {
			const infoConversation = await CHATTING__CONVERSATION_COLL
				.findById(conversationID)
				.populate({
					path: 'lastMessage',
					populate: {
						path: 'sender',
						select: '_id fullname bizfullname image email phone',
					},
				})
				.populate({
					path: 'avatar',
					populate: {
						path: 'file',
						select: 'name nameOrg size path'
					},
				})
				.lean();

			const listMessagesShared = await CHATTING__MESSAGE_COLL
				.find({
					_id: { $in: messagesID }
				})
				.populate({
					path: 'parent poll reminder files.file',
					populate: 'file'
				})
				.populate({
					path: 'sender usersAssigned',
					select: '_id bizfullname fullname image email phone',
				})
				.lean();

			listConversationShare[listConversationShare.length] = {
				infoConversation,
				listMessagesShared
			}
		}

		listConversationShare.map(item => {
			const { infoConversation, listMessagesShared } = item;

			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: infoConversation.members,
				data: {
					error: false,
					data: {
						infoConversation,
						listMessagesShared
					}
				}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_SHARE_MESSAGE], io
			});
		})

	},

	/**
	 * Dev: MinhVH
	 * Func: Thu hồi tin nhắn của cuộc hội thoại (media, text)
	 * Date: 11/01/2022
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_REVOKE_MESSAGE]: async function(data) {
		let socket                      = this;
		let listUserActive              = socket.$service.listUserConnected;
		let io                          = socket.$service.io;
		let userID                      = socket.client.user;
		let { conversationID, messagesID, filesID } = data;

		const infoConversation = await CHATTING__CONVERSATION_COLL
			.findById(conversationID)
			.select('members')
			.lean();

		if(!infoConversation || !messagesID || !messagesID.length){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation or message" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_REVOKE_MESSAGE], io
			});
		}

		const infoAfterRevoke = await CHATTING__MESSAGE_MODEL.revokeMessage({
			userID, conversationID, messagesID, filesID
		})

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver: infoConversation.members,
			data: infoAfterRevoke,
			event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_REVOKE_MESSAGE], io
		});
	},

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật người tham gia nhắc hẹn
	 * Date: 04/09/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_UPDATE_USER_JOIN_REMINDER]: async function(data, ack) {
		let socket                      	= this;
		let broker                      	= socket.$service.broker;
		let listUserActive              	= socket.$service.listUserConnected;
		let userID                      	= socket.client.user;
		let io                          	= socket.$service.io;
		let { conversationID, memberID, isJoin } = data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID);

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_USER_JOIN_REMINDER], io
			});
		}

		const infoMember = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID: memberID,
			select: '_id bizfullname fullname image'
		});

		const { members, usersMute } = infoConversation;
		const listMemberIDMuteConversation = usersMute.map(userID => userID.toString());

		// Không gửi đến user tắt thông báo cuộc hội thoại
		const arrReceiver = members.filter(memberID => {
			return memberID.toString() !== userID.toString() && !listMemberIDMuteConversation.includes(memberID.toString())
		});

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver,
			data: {
				error: false,
				data: {
					infoConversation,
					infoMember: infoMember.data,
					isJoin
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_USER_JOIN_REMINDER], io
		});
	},

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật tin nhắn nhắc hẹn
	 * Date: 06/09/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_UPDATE_MESSAGE_REMINDER]: async function(data, ack) {
		let socket              			= this;
		let broker              			= socket.$service.broker;
		let listUserActive      			= socket.$service.listUserConnected;
		let userID              			= socket.client.user;
		let io                  			= socket.$service.io;
		let { conversationID, messageID }	= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID);
		const infoMessage	   = await CHATTING__MESSAGE_COLL
			.findById(messageID)
			.populate('reminder')
			.populate({
				path: 'sender',
				select: '_id bizfullname fullname image'
			})
			.lean();

		if(!infoConversation || !infoMessage){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation or message" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_MESSAGE_REMINDER], io
			});
		}

		const infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname fullname image'
		});

		const { members, usersMute } = infoConversation;
		const listMemberIDMuteConversation = usersMute.map(userID => userID.toString());

		// Không gửi đến user tắt thông báo cuộc hội thoại
		const arrReceiver = members.filter(memberID => {
			return memberID.toString() !== userID.toString() && !listMemberIDMuteConversation.includes(memberID.toString())
		});

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver,
			data: {
				error: false,
				data: {
					infoConversation,
					infoMessage,
					infoSender: infoSender.data,
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_MESSAGE_REMINDER], io
		});
	},

	/**
	 * Dev: MinhVH
	 * Func: Xoá tin nhắn nhắc hẹn
	 * Date: 06/09/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_REMOVE_MESSAGE_REMINDER]: async function(data, ack) {
		let socket              			= this;
		let broker              			= socket.$service.broker;
		let listUserActive      			= socket.$service.listUserConnected;
		let userID              			= socket.client.user;
		let io                  			= socket.$service.io;
		let { conversationID, messageID } 	= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID);
		const infoMessage	   = await CHATTING__MESSAGE_COLL
			.findById(messageID)
			.populate('reminder')
			.populate({
				path: 'sender',
				select: '_id bizfullname fullname image'
			})
			.lean();

		if(!infoConversation || !infoMessage){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation or message" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_REMOVE_MESSAGE_REMINDER], io
			});
		}

		const infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname fullname image'
		});

		const { members, usersMute } = infoConversation;
		const listMemberIDMuteConversation = usersMute.map(userID => userID.toString());

		// Không gửi đến user tắt thông báo cuộc hội thoại
		const arrReceiver = members.filter(memberID => {
			return memberID.toString() !== userID.toString() && !listMemberIDMuteConversation.includes(memberID.toString())
		});

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver,
			data: {
				error: false,
				data: {
					infoConversation,
					infoMessage,
					infoSender: infoSender.data,
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_REMOVE_MESSAGE_REMINDER], io
		});
	},

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật tin nhắn bình chọn
	 * Date: 06/09/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_UPDATE_MESSAGE_POLL]: async function(data, ack) {
		let socket              			= this;
		let broker              			= socket.$service.broker;
		let listUserActive      			= socket.$service.listUserConnected;
		let userID              			= socket.client.user;
		let io                  			= socket.$service.io;
		let { conversationID, messageID }	= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID);
		const infoMessage	   = await CHATTING__MESSAGE_COLL
			.findById(messageID)
			.populate('poll')
			.populate({
				path: 'sender',
				select: '_id bizfullname fullname image'
			})
			.lean();

		if(!infoConversation || !infoMessage){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation or message" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_MESSAGE_POLL], io
			});
		}

		const infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname fullname image'
		});

		const { members } = infoConversation;

		// Không gửi đến user tắt thông báo cuộc hội thoại
		const arrReceiver = members.filter(memberID => memberID.toString() !== userID.toString());

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver,
			data: {
				error: false,
				data: {
					infoConversation,
					infoMessage,
					infoSender: infoSender.data,
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_MESSAGE_POLL], io
		});
	},

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật tin nhắn NPS
	 * Date: 04/06/2022
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_UPDATE_MESSAGE_NPS]: async function(data, ack) {
		let socket              			= this;
		let broker              			= socket.$service.broker;
		let listUserActive      			= socket.$service.listUserConnected;
		let userID              			= socket.client.user;
		let io                  			= socket.$service.io;
		let { conversationID, messageID }	= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID);
		const infoMessage	   = await CHATTING__MESSAGE_COLL
			.findById(messageID)
			.populate({
				path: 'nps',
				populate: {
					path: 'usersVote.user usersVote.reason service',
					select: '_id bizfullname image name description type childs',
					populate: {
						path: 'childs',
						select: 'name description type'
					}
				}
			})
			.populate({
				path: 'sender',
				select: '_id bizfullname image'
			})
			.lean();

		if(!infoConversation || !infoMessage){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation or message" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_MESSAGE_NPS], io
			});
		}

		const infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname image'
		});

		const { members } = infoConversation;

		// Không gửi đến user tắt thông báo cuộc hội thoại
		// const arrReceiver = members.filter(memberID => memberID.toString() !== userID.toString());

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver: members,
			data: {
				error: false,
				data: {
					infoConversation,
					infoMessage,
					infoSender: infoSender.data,
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UPDATE_MESSAGE_NPS], io
		});
	},

	/**
	 * Dev: MinhVH
	 * Func: Pin 1 tin nhắn
	 * Date: 06/09/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_PIN_MESSAGE]: async function(data, ack) {
		let socket              = this;
		let broker              = socket.$service.broker;
		let listUserActive      = socket.$service.listUserConnected;
		let userID              = socket.client.user;
		let io                  = socket.$service.io;
		let { conversationID } 	= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID);

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_PIN_MESSAGE], io
			});
		}

		const infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname fullname image'
		});

		const { members, usersMute } = infoConversation;
		const listMemberIDMuteConversation = usersMute.map(userID => userID.toString());

		// Không gửi đến user tắt thông báo cuộc hội thoại
		const arrReceiver = members.filter(memberID => {
			return memberID.toString() !== userID.toString() && !listMemberIDMuteConversation.includes(memberID.toString())
		});

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver,
			data: {
				error: false,
				data: {
					infoConversation,
					infoSender: infoSender.data,
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_PIN_MESSAGE], io
		});
	},

	/**
	 * Dev: MinhVH
	 * Func: Bỏ pin 1 tin nhắn
	 * Date: 06/09/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_UNPIN_MESSAGE]: async function(data, ack) {
		let socket              = this;
		let broker              = socket.$service.broker;
		let listUserActive      = socket.$service.listUserConnected;
		let userID              = socket.client.user;
		let io                  = socket.$service.io;
		let { conversationID } 	= data;

		const infoConversation = await CHATTING__CONVERSATION_COLL.findById(conversationID);

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UNPIN_MESSAGE], io
			});
		}

		const infoSender = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
			userID,
			select: '_id bizfullname fullname image'
		});

		const { members, usersMute } = infoConversation;
		const listMemberIDMuteConversation = usersMute.map(userID => userID.toString());

		// Không gửi đến user tắt thông báo cuộc hội thoại
		const arrReceiver = members.filter(memberID => {
			return memberID.toString() !== userID.toString() && !listMemberIDMuteConversation.includes(memberID.toString())
		});

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver,
			data: {
				error: false,
				data: {
					infoConversation,
					infoSender: infoSender.data,
				}
			}, event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_UNPIN_MESSAGE], io
		});
	},

    /**
	 * Dev: MinhVH
	 * Func: Thông báo nhắc hẹn
	 * Date: 13/09/2021
	 */
    [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_NOTIFICATION_REMINDER]: async function(data, ack) {
        let socket               					= this;
		let broker                      			= socket.$service.broker;
        // let listUserActive       					= socket.$service.listUserConnected;
        // let io                   					= socket.$service.io;
		let { conversationID, messageID, userID }	= data;

		const infoConversation 	= await CHATTING__CONVERSATION_COLL.findById(conversationID).select('members');
		const infoMessage 		= await CHATTING__MESSAGE_COLL
			.findById(messageID)
			.populate('reminder')
			.lean();

		if(!infoConversation || !infoMessage) return;

		const { members } = infoConversation;
		const { notifyFor, accepts, status, content } = infoMessage.reminder;

		// Reminder deleted
		if(status === 2) return;

		if(notifyFor === 'onlyme'){
			return broker.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
				users: [userID],
				title: 'Thông báo nhắc hẹn',
				description: content,
				web_url: `https://staging.cbs.trixgo.com`,
				env: ENV_DEVICE_APP_TEASER
			});
		}

		// Lọc user không phải member của conversation
		const listMembersIDConversation = members.map(memberID => memberID.toString());
		const arrReceiver = accepts.filter(memberID => listMembersIDConversation.includes(memberID.toString()));
		console.log({ ['NOTIFICATION_FROM_REMINDER']: arrReceiver })

		broker.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
			users: arrReceiver,
			title: 'Thông báo nhắc hẹn',
			description: content,
			web_url: `https://staging.cbs.trixgo.com`,
			env: ENV_DEVICE_APP_TEASER
		});
    },

	/**
	 * Dev: MinhVH
	 * Func: Reaction 1 tin nhắn
	 * Date: 26/10/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_REACTION_MESSAGE]: async function(data) {
        try {
			let socket               		= this;
			let userID              		= socket.client.user;
			let listUserActive       		= socket.$service.listUserConnected;
			let io                   		= socket.$service.io;
			let { messageID, typeReaction }	= data;

			await CHATTING__REACTION_MESSAGE_MODEL.reactionMessage({
				userID,
				messageID,
				typeReaction: +typeReaction
			})

			const infoMessage = await CHATTING__MESSAGE_COLL
				.findById(messageID, { createdAt: 0, updatedAt: 0, __v: 0 })
				.populate({
					path: 'sender receivers usersAssigned',
					select: '_id bizfullname fullname image'
				})
				.populate({
					path: 'conversation',
					select: 'members'
				})
				.populate({
					path: 'reactions',
					select: '_id type author',
					populate: {
						path: 'author',
						select: '_id bizfullname fullname image'
					}
				})
				.populate({
					path: 'parent',
					populate: {
						path: 'sender',
						select: '_id bizfullname fullname image'
					}
				})
				.populate('reminder')
				.populate({
					path: 'poll',
					populate: {
						path: 'options.usersVote',
						select: '_id bizfullname fullname image'
					}
				})
				.populate({
					path: 'files.file',
					populate: {
						path: 'file',
						select: 'name nameOrg path size'
					},
				})
				.lean();

			if(!infoMessage){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Can't get info message" },
					event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_REACTION_MESSAGE], io
				});
			}

			sendDataToMultilSocketsOfListUser({
				arrReceiver: infoMessage?.conversation?.members,
				listUserConnected: listUserActive,
				data: {
					error: false,
					data: infoMessage
				},
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_REACTION_MESSAGE], io
			})
		} catch (error) {
			console.info("EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_REACTION_MESSAGE");
			console.error(error);
		}
    },

	/**
	 * Dev: MinhVH
	 * Func: Danh sách cuộc hội thoại
	 * Date: 04/01/2021
	 */
    [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_GET_INFO_CONVERSATION]: async function(data) {
        try {
			let socket           = this;
			let listUserActive   = socket.$service.listUserConnected;
			let io               = socket.$service.io;
			let userID			 = socket.client.user;
			let { populates, select, conversationID } = data;

			if(populates && typeof populates === 'string'){
				if(!IsJsonString(populates)) {
					return sendDataToMultilSocketsOfListUser({
						listUserConnected: listUserActive,
						arrReceiver: [userID],
						data: {
							message: 'Request params populates invalid',
							error: true
						},
						event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_GET_INFO_CONVERSATION], io
					});
				}

				populates = JSON.parse(populates);
			} else{
				populates = {
					path: "",
					select: ""
				}
			}

			const membersConversation = await CHATTING__CONVERSATION_COLL
				.findById(conversationID)
				.select('members')
				.lean();

			const infoConversation = await CHATTING__CONVERSATION_COLL
				.findById(conversationID)
				.select(select || '')
				.populate(populates)
				.lean();

			if(!infoConversation){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: {
						data: infoConversation,
						error: true
					},
					event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_GET_INFO_CONVERSATION], io
				});
			}

			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: membersConversation.members,
				data: {
					data: infoConversation,
					error: false
				},
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_GET_INFO_CONVERSATION], io
			});
		} catch (error) {
			console.info('EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_GET_INFO_CONVERSATION');
			console.error(error);
		}
    },

	/**
	 * Dev: MinhVH
	 * Func: Bắn tin nhắn thông báo (thêm/xóa thành viên, ghim tin nhắn...)
	 * Date: 16/01/2021
	 */
	[EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_CSS_FIRE_MESSAGE]: async function(data) {
        let socket              = this;
		let userID				= socket.client.user;
        let listUserActive      = socket.$service.listUserConnected;
        let io                  = socket.$service.io;
		let { _id: messageID, conversation: conversationID } = data;

		const infoConversation = await CHATTING__CONVERSATION_COLL
			.findById(conversationID)
			.select('members')
			.lean();

		if(!infoConversation){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get info conversation" },
				event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_FIRE_MESSAGE], io
			});
		}

		const infoMessage = await CHATTING__MESSAGE_COLL
			.findById(messageID)
			.populate({
				path: 'sender receivers usersAssigned',
				select: '_id fullname bizfullname image'
			})
			.populate({
				path: 'parent',
				populate: {
					path: 'sender files.file',
					populate: {
						path: 'file',
						select: 'name path size'
					},
					select: '_id bizfullname fullname image'
				}
			})
			.populate({
				path: 'reminder',
				populate: {
					path: 'accepts rejects',
					select: '_id bizfullname fullname image'
				}
			})
			.populate({
				path: 'poll',
				populate: {
					path: 'options.usersVote',
					select: '_id bizfullname fullname image'
				}
			})
			.populate({
				path: 'nps',
				populate: {
					path: 'usersVote.user usersVote.reason service',
					select: '_id bizfullname image name description type childs',
					populate: {
						path: 'childs',
						select: 'name description type'
					}
				}
			})
			.lean();

        sendDataToMultilSocketsOfListUser({
			arrReceiver: infoConversation.members,
			listUserConnected: listUserActive,
			data: {
				error: false,
				data: infoMessage
			},
			event: [EVENT_SOCKET_CONSTANT_CHATTING.CHATTING_SSC_FIRE_MESSAGE], io
		})
    },

}
