/**
 * Constants
 */
const { EVENT_SOCKET_CONSTANT_NOTIFICATION }    = require('./helper/notification.events-socket-constant');
const { CF_DOMAIN_SERVICES } 					= require('../gateway/helper/domain.constant');
const { CF_ACTIONS_AUTH } 						= require('../auth/helper/auth.actions-constant');

/**
 * Utils
 */
const { sendDataToMultilSocketsOfListUser } 	= require('../../tools/socket');


exports.NOTIFICATION_SOCKET = {

    [EVENT_SOCKET_CONSTANT_NOTIFICATION.NOTIFICATION_CSS_RECEIVE_NEW_NOTIFICATION]: async function(data) {
        let socket                      = this;
		let broker						= socket.$service.broker;
        let listUserActive              = socket.$service.listUserConnected;
        let userID                      = socket.client.user;
        let io                          = socket.$service.io;
		let { receivers }				= data;

		if(!receivers || !receivers.length){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: "Can't get receivers notification" },
				event: [EVENT_SOCKET_CONSTANT_NOTIFICATION.NOTIFICATION_SSC_RECEIVE_NEW_NOTIFICATION], io
			});
		}

		let listReceivers = await broker.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_USER_WITH_CONDITION}`, {
			condition: { _id: { $in: receivers, $nin: [userID] } },
			select: '_id'
		});

		if(listReceivers.error){
			return sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: listReceivers,
				event: [EVENT_SOCKET_CONSTANT_NOTIFICATION.NOTIFICATION_SSC_RECEIVE_NEW_NOTIFICATION], io
			});
		}

		listReceivers = listReceivers.data.map(receiver => receiver._id);

		sendDataToMultilSocketsOfListUser({
			listUserConnected: listUserActive,
			arrReceiver: listReceivers,
			data: {
				error: false,
				message: 'You get a new notification'
			}, event: [EVENT_SOCKET_CONSTANT_NOTIFICATION.NOTIFICATION_SSC_RECEIVE_NEW_NOTIFICATION], io
		});
	},

}