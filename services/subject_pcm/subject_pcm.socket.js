/**
 * Constants
 */
const { EVENT_SOCKET_CONSTANT_SUBJECT_PCM }		= require('./helper/subject_pcm.events-socket-constant');
// const { CF_DOMAIN_SERVICES } 					= require('../gateway/helper/domain.constant');
// const { CF_ACTIONS_NOTIFICATION }               = require('../notification/helper/notification.actions-constant');
// const { CF_ACTIONS_AUTH } 						= require('../auth/helper/auth.actions-constant');
// const { CF_ACTIONS_MEDIA }						= require('../media/helper/media.actions-constant');
// const { CF_ACTIONS_ITEM }						= require('../item/helper/item.actions-constant');
const { APP_KEYS, LANGUAGE_KEYS }				= require('../../tools/keys');
const { ENV_DEVICE_WEB_CBS } 					= require('../notification/helper/notification.keys-constant')
/**
 * Utils
 */
const PromisePool								= require('@supercharge/promise-pool');
const { sendDataToMultilSocketsOfListUser } 	= require('../../tools/socket');
const PCM_PLAN_TASK_COLL                		= require('./database/subject_pcm.pcm_plan_task-coll');
const PCM_PLAN_TASK_MODEL                		= require('./model/subject_pcm.pcm_plan_task').MODEL;

exports.SUBJECT_SOCKET = {
	/**
	 * Tạo mới việc con
	 */
	[EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_CSS_ADD_TASK]: async function(data) {
        try {
			let socket          = this;
			let listUserActive  = socket.$service.listUserConnected;
			let userID          = socket.client.user;
			let io              = socket.$service.io;
			let { taskID } 		= data;

			if(!taskID){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Tham số taskID không hợp lệ" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_TASK], io
				});
			}

			const infoTask = await PCM_PLAN_TASK_COLL
				.findById(taskID)
				.select('_id author assignee related')
				.lean();

			if(!infoTask) {
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Task không tồn tại" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_TASK], io
				});
			}

			let { author, assignee, related } = infoTask;
			related = related.map(userID => userID.toString());

			const listReceivers = [...new Set([author.toString(), assignee.toString(), ...related])];
			const receivers = listReceivers.filter(receiverID => receiverID !== userID.toString());

			// SEND SOCKET
			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: receivers,
				data: {
					error: false,
					data: {
						infoTask,
						senderID: userID
					}
				}, event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_TASK], io
			});
		} catch (error) {
			console.info('======EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_TASK=====');
			console.error(error);
		}
	},

	/**
	 * Tạo mới checklist
	 */
    [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_CSS_ADD_CHECKLIST]: async function(data) {
        try {
			let socket                     		= this;
			let listUserActive             		= socket.$service.listUserConnected;
			let userID             				= socket.client.user;
			let io                         		= socket.$service.io;
			let { taskID, checklistID } 		= data;

			if(!taskID || !checklistID){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Tham số taskID hoặc checklistID không hợp lệ" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_CHECKLIST], io
				});
			}

			const infoTask = await PCM_PLAN_TASK_COLL
				.findById(taskID)
				.select('_id author assignee related')
				.lean();

			const infoCheckList = await PCM_PLAN_TASK_COLL
				.findById(checklistID)
				.select('_id name assignee expiredTime parent status')
				.populate('assignee', '_id bizfullname fullname image')
				.lean();

			if(!infoCheckList || !infoTask) {
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Task hoặc Checklist không tồn tại" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_CHECKLIST], io
				});
			}

			let { author, assignee, related } = infoTask;
			related = related.map(userID => userID.toString());

			const listReceivers = [...new Set([author.toString(), assignee.toString(), ...related])];
			const receivers = listReceivers.filter(receiverID => receiverID !== userID.toString());

			// SEND SOCKET
			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: receivers,
				data: {
					error: false,
					data: {
						infoTask,
						infoCheckList,
						senderID: userID
					}
				}, event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_CHECKLIST], io
			});
		} catch (error) {
			console.info('======EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_CSS_ADD_CHECKLIST=====');
			console.error(error);
		}
	},

	/**
	 * Tạo mới việc con
	 */
	[EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_CSS_ADD_CHILD_TASK]: async function(data) {
        try {
			let socket                     		= this;
			let listUserActive             		= socket.$service.listUserConnected;
			let userID             				= socket.client.user;
			let io                         		= socket.$service.io;
			let { taskID, childTaskID } 		= data;

			if(!taskID || !childTaskID){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Tham số taskID hoặc childTaskID không hợp lệ" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_CHILD_TASK], io
				});
			}

			const infoTask = await PCM_PLAN_TASK_COLL
				.findById(taskID)
				.select('_id author assignee related')
				.lean();

			const infoChildTask = await PCM_PLAN_TASK_COLL
				.findById(childTaskID)
				.select('_id name assignee expiredTime parent status')
				.populate('assignee', '_id bizfullname fullname image')
				.lean();

			if(!infoChildTask || !infoTask) {
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Task hoặc ChildTask không tồn tại" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_CHILD_TASK], io
				});
			}

			let { author, assignee, related } = infoTask;
			related = related.map(userID => userID.toString());

			const listReceivers = [...new Set([author.toString(), assignee.toString(), ...related])];
			const receivers = listReceivers.filter(receiverID => receiverID !== userID.toString());

			// SEND SOCKET
			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: receivers,
				data: {
					error: false,
					data: {
						infoTask,
						infoChildTask,
						senderID: userID
					}
				}, event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_CHILD_TASK], io
			});
		} catch (error) {
			console.info('======EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_CHILD_TASK=====');
			console.error(error);
		}
	},

	/**
	 * Thêm người liên quan
	 */
	[EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_CSS_ADD_RELATION_USER]: async function(data) {
        try {
			let socket                     		= this;
			let listUserActive             		= socket.$service.listUserConnected;
			let userID             				= socket.client.user;
			let io                         		= socket.$service.io;
			let { taskID, relationUsersID }		= data;

			if(!taskID || !relationUsersID || !relationUsersID.length){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Tham số taskID hoặc relationUsersID không hợp lệ" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_RELATION_USER], io
				});
			}

			const infoTask = await PCM_PLAN_TASK_COLL
				.findById(taskID)
				.select('_id author assignee related')
				.lean();

			if(!infoTask) {
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Task không tồn tại" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_RELATION_USER], io
				});
			}

			let { author, assignee, related } = infoTask;
			related = related.map(userID => userID.toString());

			const listReceivers = [...new Set([author.toString(), assignee.toString(), ...related])];
			const receivers = listReceivers.filter(receiverID => receiverID !== userID.toString());

			// SEND SOCKET
			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: receivers,
				data: {
					error: false,
					data: {
						infoTask,
						relationUsersID,
						senderID: userID
					}
				}, event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_RELATION_USER], io
			});
		} catch (error) {
			console.info('======EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_RELATION_USER=====');
			console.error(error);
		}
	},

	/**
	 * Đồng ý phê duyệt
	 */
	[EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_CSS_ADD_SIGNATURE]: async function(data) {
		let socket                     		= this;
		let broker							= socket.$service.broker;
		let listUserActive             		= socket.$service.listUserConnected;
		let userID             				= socket.client.user;
		let io                         		= socket.$service.io;

        try {
			let { taskID, bizfullname } = data;

			if(!taskID){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Tham số taskID không hợp lệ" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_SIGNATURE], io
				});
			}

			const infoTask = await PCM_PLAN_TASK_COLL
				.findById(taskID)
				.select('_id name sign author assignee related')
				.lean();

			if(!infoTask) {
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Task không tồn tại" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_SIGNATURE], io
				});
			}

			let { author, assignee, related } = infoTask;
			related = related.map(userID => userID.toString());

			const listReceivers = [...new Set([author.toString(), assignee.toString(), ...related])];
			const receivers = listReceivers.filter(receiverID => receiverID !== userID.toString());

			const amountNoti = await PCM_PLAN_TASK_MODEL.getAmountNotification({ userID });

			// SEND CLOUD-MSG
			broker.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
				users: receivers,
				title: infoTask.name,
				description: `${bizfullname} đã phê duyệt 1 công việc`,
				amountNoti: amountNoti?.data?.amountUnreadTask,
				dataSend: {
					app: APP_KEYS.PCM_PLAN_TASK,
					languageKey: LANGUAGE_KEYS.ADD_SIGNATURE_TASK,
					mainColl: {
						kind: 'pcm_plan_task',
						item: { _id: taskID }
					}
				},
				web_url: `/pcm/detail/${taskID}`,
				env: ENV_DEVICE_WEB_CBS
			});
		} catch (error) {
			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: error.message },
				event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_ADD_SIGNATURE], io
			});
		}
	},

	/**
	 * Mở thầu
	 */
	[EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_CSS_OPEN_BIDDING]: async function(data) {
		let socket                     		= this;
		let broker							= socket.$service.broker;
		let listUserActive             		= socket.$service.listUserConnected;
		let userID             				= socket.client.user;
		let io                         		= socket.$service.io;

        try {
			let { taskID, bizfullname } = data;

			if(!taskID){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Tham số taskID không hợp lệ" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_OPEN_BIDDING], io
				});
			}

			const infoTask = await PCM_PLAN_TASK_COLL
				.findById(taskID)
				.select('_id name sign author related')
				.lean();

			if(!infoTask) {
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Task không tồn tại" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_OPEN_BIDDING], io
				});
			}

			let { author, related } = infoTask;
			related = related.map(userID => userID.toString());

			const listReceivers = [...new Set([author.toString(), ...related])];
			const receivers = listReceivers.filter(receiverID => receiverID !== userID.toString());

			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: receivers,
				data: { error: false, data: { taskID, userID } },
				event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_OPEN_BIDDING], io
			});

			const amountNoti = await PCM_PLAN_TASK_MODEL.getAmountNotification({ userID });

			// SEND CLOUD-MSG
			broker.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
				users: receivers,
				title: infoTask.name,
				description: `${bizfullname} đã mở thầu`,
				amountNoti: amountNoti?.data?.amountUnreadTask,
				dataSend: {
					app: APP_KEYS.PCM_PLAN_TASK,
					languageKey: LANGUAGE_KEYS.OPEN_BIDDING,
					mainColl: {
						kind: 'pcm_plan_task',
						item: { _id: taskID }
					}
				},
				web_url: `/pcm/detail/${taskID}`,
				env: ENV_DEVICE_WEB_CBS
			});
		} catch (error) {
			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: [userID],
				data: { error: true, message: error.message },
				event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_OPEN_BIDDING], io
			});
		}
	},

	/**
	 * Cập nhật số lượng thông báo (badge)
	 */
	[EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_CSS_UPDATE_NOTIFICATION]: async function(data) {
        try {
			let socket          						= this;
			let listUserActive  						= socket.$service.listUserConnected;
			let userID          						= socket.client.user;
			let io              						= socket.$service.io;
			let { taskID, isGetCountNotification } 		= data;

			if(!taskID){
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Tham số taskID không hợp lệ" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_UPDATE_NOTIFICATION], io
				});
			}

			const infoTask = await PCM_PLAN_TASK_COLL
				.findById(taskID)
				.select('_id author assignee related')
				.lean();

			if(!infoTask) {
				return sendDataToMultilSocketsOfListUser({
					listUserConnected: listUserActive,
					arrReceiver: [userID],
					data: { error: true, message: "Task không tồn tại" },
					event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_UPDATE_NOTIFICATION], io
				});
			}

			let { author, assignee, related } = infoTask;
			related = related.map(userID => userID.toString());

			const listReceivers = [...new Set([author.toString(), assignee.toString(), ...related])];
			const listReceiversExceptMe = listReceivers.filter(receiverID => receiverID !== userID.toString());

			if (isGetCountNotification) {
				await PromisePool
					.for(listReceivers)
					.withConcurrency(4)
					.process(async userId => {
						const { error, data } = await PCM_PLAN_TASK_MODEL.getAmountNotification({
							userID: userId
						})

						if(error) return !error;

						// SEND SOCKET
						sendDataToMultilSocketsOfListUser({
							listUserConnected: listUserActive,
							arrReceiver: [userId],
							data: {
								error: false,
								data,
							},
							event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_UPDATE_NOTIFICATION],
							io,
						});
					})
			}

			sendDataToMultilSocketsOfListUser({
				listUserConnected: listUserActive,
				arrReceiver: listReceiversExceptMe,
				data: {
					error: false,
					data: { infoTask },
				}, event: [EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_SSC_UPDATE_NOTIFICATION], io
			});
		} catch (error) {
			console.info('======EVENT_SOCKET_CONSTANT_SUBJECT_PCM.SUBJECT_PCM_CSS_UPDATE_NOTIFICATION=====');
			console.error(error);
		}
	},
}