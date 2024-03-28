/**
 * CONSTANTS
 */
// const { EVENT_SOCKET_CONSTANT_MEDIA } 			= require('./helper/media.events-socket-constant');
// const { CF_DOMAIN_SERVICES } 					= require('../gateway/helper/domain.constant');
// const { CF_ACTIONS_AUTH } 						= require('../auth/helper/auth.actions-constant');
// const { CF_ACTIONS_MEDIA } 						= require('../media/helper/media.actions-constant');

/**
 * TOOLS
 */
const { sendDataToMultilSocketsOfListUser } = require('../../tools/socket')

/**
 * COLLECTIONS
 */
// const MEDIA_COLL					        	= require('./database/media-coll');
exports.MEDIA_SOCKET = {
    CLIENT_SEND_MEDIA_TEST: async function (data, ack) {
        let socket = this
        let userID = socket.client.user
        let listUserActive = socket.$service.listUserConnected
        let io = socket.$service.io

        sendDataToMultilSocketsOfListUser({
            listUserConnected: listUserActive,
            arrReceiver: [userID],
            data: {
                message: "Hi Client!! I'm server...",
                userID,
                listUserActive,
            },
            event: 'SERVER_SEND_MEDIA_TEST',
            io,
        })
    },

    // =============================== MEDIA ==================================
}
