"use strict";

/**
 * EXTERNAL PACKAGE
 */
const ObjectID                                  	= require('mongoose').Types.ObjectId;
const moment										= require('moment');

/**
 * CONSTANTS
 */
const { REMINDER_NOTIFY_FOR, REMINDER_REPEAT } 		= require('../helper/chatting.keys-constant');
const { CF_DOMAIN_SERVICES } 						= require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_REMINDER } 						= require('../../reminder/helper/reminder.actions-constant');

/**
 * TOOLS
 */
const BaseModel                                 	= require('../../../tools/db/base_model');
const { RANGE_BASE_PAGINATION_V2 } 					= require('../../../tools/cursor_base/playground/index');
const { checkObjectIDs, IsJsonString }				= require('../../../tools/utils/utils');

/**
 * COLLECTIONS, MODELS
 */
const CHATTING__MESSAGE_COLL						= require('../database/chatting.message-coll');
const CHATTING__MESSAGE_REMINDER_COLL				= require('../database/chatting.message_reminder-coll');
const CHATTING__CONVERSATION_COLL               	= require('../database/chatting.conversation-coll');
const CHATTING__MESSAGE_MODEL               		= require('../model/chatting.message-model').MODEL;

class Model extends BaseModel {

    constructor() {
        super(CHATTING__MESSAGE_REMINDER_COLL);
    }

	/**
	 * Dev: MinhVH
	 * Func: Thêm tin nhắn reminder mới
	 * Date: 01/09/2021
	 */
	insert({ conversationID, content, notifyFor, remindTime, repeat, authorID, ctx }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([authorID, conversationID])) {
					return resolve({
						error: true,
						message: "Tham số authorID hoặc conversationID không hợp lệ",
						keyError: "params_authorID_or_conversationID_invalid",
						status: 400,
					})
				}

				if(!REMINDER_NOTIFY_FOR.includes(notifyFor)) {
					return resolve({
						error: true,
						message: "Tham số notifyFor không hợp lệ",
						keyError: "params_notifyFor_invalid",
						status: 400,
					})
				}

				if(!REMINDER_REPEAT.includes(repeat)) {
					return resolve({
						error: true,
						message: "Tham số repeat không hợp lệ",
						keyError: "params_repeat_invalid",
						status: 400,
					})
				}

				if(!moment(remindTime).isValid()) {
					return resolve({
						error: true,
						message: "Tham số remindTime không hợp lệ",
						keyError: "params_remindTime_invalid",
						status: 400,
					})
				}

				// CHECK USER IS MEMBER OF CONVERSATION
                let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $in: [authorID] }
                }).lean();

                if(!checkExistConversation) {
					return resolve({
						error: true,
						message: "Bạn không phải thành viên của cuộc hội thoại",
						keyError: "you_are_not_member_of_conversation",
						status: 403
					})
				}

				// Check config admin conversation
				if(checkExistConversation.config && checkExistConversation.config.configCreateNote === 2){
					const listAuthorsID = checkExistConversation.authors.map(author => author.toString());

					// User is not author of conversation
					if(!listAuthorsID.includes(authorID)) {
						return resolve({ 
							error: true, 
							message: "Bạn không có quyền tạo reminder", 
							keyEror: 'you_do_not_have_permission_to_create_reminder',
							status: 403
						});
					}
				}

				// INSERT MESSAGE REMINDER
				let infoReminderAfterInsert = await this.insertData({
					content,
					notifyFor,
					remindTime: new Date(remindTime),
					repeat
				})

				if(!infoReminderAfterInsert) {
					return resolve({ 
						error: true, 
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục", 
						keyEror: 'error_occurred_(reminder)',
						status: 422
					});
				}

				let dataInsertMessage = {
					usersSeen: [authorID],
					sender: authorID,
					conversation: conversationID,
					receivers: checkExistConversation.members,
					reminder: infoReminderAfterInsert._id,
					type: 4
				}

				// INSERT MESSAGE REMINDER
				let infoMessageReminder = await CHATTING__MESSAGE_MODEL.insertData(dataInsertMessage);

				if(!infoMessageReminder) {
					return resolve({ 
						error: true, 
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục", 
						keyEror: 'error_occurred_(message_reminder)',
						status: 422
					});
				}

				// UPDATE LAST MESSAGE
                await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
                    lastMessage: infoMessageReminder._id, modifyAt: Date.now()
                });

				// UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
				await CHATTING__MESSAGE_MODEL.updateUserMissMessage({ conversationID, userID: authorID, numberMissMessage: 2 });

				// ADD JOB FOR REMINDER
				await ctx.call(`${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.ADD_JOB_REMINDER_CONVERSATION}`, {
					messageID: infoMessageReminder._id.toString(),
					conversationID,
					userID: authorID,
					remindTime,
					repeat,
					notifyFor
				})

				return resolve({
					error: false,
					status: 200,
					data: infoMessageReminder
				});
			} catch(error){
				console.error(error);
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật reminder
	 * Date: 01/09/2022
	 */
	update({ conversationID, messageID, content, remindTime, repeat, authorID, ctx }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([authorID, conversationID, messageID])) {
					return resolve({
						error: true,
						message: "Tham số messageID hoặc conversationID không hợp lệ",
						keyError: "params_messageID_or_conversationID_invalid",
						status: 400,
					})
				}

				if(!REMINDER_REPEAT.includes(repeat)) {
					return resolve({
						error: true,
						message: "Tham số repeat không hợp lệ",
						keyError: "params_repeat_invalid",
						status: 400,
					})
				}

				if(!moment(remindTime).isValid()) {
					return resolve({
						error: true,
						message: "Tham số remindTime không hợp lệ",
						keyError: "params_remindTime_invalid",
						status: 400,
					})
				}

				// CHECK USER IS MEMBER OF CONVERSATION
                let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $in: [authorID] }
                }).lean();

                if(!checkExistConversation) {
					return resolve({
						error: true,
						message: "Bạn không phải thành viên của cuộc hội thoại",
						keyError: "you_are_not_member_of_conversation",
						status: 403
					})
				}

				let infoMessageReminder = await CHATTING__MESSAGE_COLL
					.findById(messageID)
					.populate('reminder')
					.lean();

				if(!infoMessageReminder || !infoMessageReminder.reminder) {
					return resolve({
						error: true,
						message: "Tin nhắn không tồn tại",
						keyError: "message_not_exists",
						status: 400
					})
				}

				let { reminder } = infoMessageReminder;

				// UPDATE MESSAGE REMINDER
				let infoReminderAfterUpdate = await CHATTING__MESSAGE_REMINDER_COLL.findByIdAndUpdate(reminder._id, {
					$set: {
						content,
						remindTime: new Date(remindTime),
						repeat
					}
				}, { new: true })

				if(!infoReminderAfterUpdate) {
					return resolve({ 
						error: true, 
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục", 
						keyEror: 'error_occurred',
						status: 422
					});
				}

				// INSERT MESSAGE NOTIFY UPDATE REMINDER
				let infoMessageNotify = await CHATTING__MESSAGE_MODEL.insertData({
					usersSeen: [authorID],
					sender: authorID,
					conversation: conversationID,
					receivers: checkExistConversation.members,
					reminder: reminder._id,
					type: 115
				})

				// UPDATE LAST MESSAGE & UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
				if(infoMessageNotify) {
					await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
						lastMessage: infoMessageNotify._id, modifyAt: Date.now()
					});

					await CHATTING__MESSAGE_MODEL.updateUserMissMessage({ conversationID, userID: authorID, numberMissMessage: 1 });
				}

				if(remindTime){
					// REMOVE OLD REMINDER JOB
					await ctx.call(`${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.DELETE_JOB_REMINDER_CONVERSATION}`, {
						messageID,
						conversationID,
					})

					// ADD JOB FOR REMINDER
					await ctx.call(`${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.ADD_JOB_REMINDER_CONVERSATION}`, {
						messageID,
						conversationID,
						userID: authorID,
						remindTime,
						repeat
					})
				}

				const infoMessage = await CHATTING__MESSAGE_COLL
					.findById(messageID)
					.populate({
						path: 'sender receivers usersAssigned',
						select: '_id fullname bizfullname image'
					})
					.populate({
						path: 'reminder',
						populate: {
							path: 'accepts rejects',
							select: '_id bizfullname fullname image'
						}
					})
					.lean();

				return resolve({
					error: false,
					status: 200,
					data: {
						infoMessage,
						infoMessageNotification: infoMessageNotify
					}
				});
			} catch(error){
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật thành viên join reminder
	 * Date: 01/09/2021
	 */
	updateUsersJoinReminder({ conversationID, messageID, isJoin, authorID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([authorID, conversationID, messageID])) {
					return resolve({ 
						error: true, 
						message: "Tham số conversationID hoặc messageID không hợp lệ", 
						keyEror: 'params_conversationID_or_messageID_invalid',
						status: 422
					});
				}

				// CHECK USER IS MEMBER OF CONVERSATION
                let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $in: [authorID] }
                }).lean();

                if(!checkExistConversation) {
					return resolve({ 
						error: true, 
						message: "Bạn không phải thành viên của cuộc hội thoại", 
						keyEror: 'you_are_not_member_of_conversation',
						status: 403
					});
				}

				let infoMessageReminder = await CHATTING__MESSAGE_COLL
					.findById(messageID)
					.populate('reminder')
					.lean();

				if(!infoMessageReminder || !infoMessageReminder.reminder) {
					return resolve({ 
						error: true, 
						message: "Tin nhắn không tồn tại", 
						keyEror: 'message_is_not_exists',
						status: 400
					});
				}

				let { reminder } 			= infoMessageReminder;
				let infoReminderAfterUpdate = null;
				let typeMessage 			= 0;

				// USER JOIN REMINDER
				if(isJoin){
					infoReminderAfterUpdate = await CHATTING__MESSAGE_REMINDER_COLL.findByIdAndUpdate(reminder._id, {
						$addToSet: {
							accepts: authorID
						},
						$pull: {
							rejects: authorID
						}
					}, { new: true })

					typeMessage = 116; // Xác nhận tham gia nhắc hẹn

				} else{ // USER NOT JOIN REMINDER
					infoReminderAfterUpdate = await CHATTING__MESSAGE_REMINDER_COLL.findByIdAndUpdate(reminder._id, {
						$addToSet: {
							rejects: authorID
						},
						$pull: {
							accepts: authorID
						}
					}, { new: true })

					typeMessage = 117; // Xác nhận không tham gia nhắc hẹn
				}

				if(!infoReminderAfterUpdate) {
					return resolve({ 
						error: true, 
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục", 
						keyEror: 'error_occurred',
						status: 422
					});
				}

				// INSERT MESSAGE NOTIFY UPDATE USER JOIN REMINDER
				let infoMessageNotify = await CHATTING__MESSAGE_MODEL.insertData({
					usersSeen: [authorID],
					sender: authorID,
					conversation: conversationID,
					receivers: checkExistConversation.members,
					reminder: reminder._id,
					type: typeMessage
				})

				// UPDATE LAST MESSAGE & UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
				if(infoMessageNotify) {
					await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
						lastMessage: infoMessageNotify._id, modifyAt: Date.now()
					});

					await CHATTING__MESSAGE_MODEL.updateUserMissMessage({ conversationID, userID: authorID, numberMissMessage: 1 });
				}

				return resolve({
					error: false,
					status: 200,
					data: {
						infoReminder: infoReminderAfterUpdate,
						infoMessageNotification: infoMessageNotify
					}
				});
			} catch(error){
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Xoá reminder
	 * Date: 01/09/2021
	 */
	delete({ conversationID, messageID, authorID, ctx }) {
		return new Promise(async resolve => {
			try {
				if (!checkObjectIDs([messageID, authorID, conversationID])) {
					return resolve({ 
						error: true, 
						message: "Tham số conversationID hoặc messageID không hợp lệ", 
						keyEror: 'params_conversationID_or_messageID_invalid',
						status: 400
					});
				}

				// CHECK USER IS MEMBER OF CONVERSATION
				let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $in: [authorID] }
				}).lean();

				if(!checkExistConversation) {
					return resolve({ 
						error: true, 
						message: "Bạn không phải thành viên của cuộc hội thoại", 
						keyEror: 'you_are_not_member_of_conversation',
						status: 403
					});
				}

				let infoMessageReminder = await CHATTING__MESSAGE_COLL
					.findById(messageID)
					.select('_id reminder')
					.populate('reminder')
					.lean();

				if(!infoMessageReminder || !infoMessageReminder.reminder) {
					return resolve({ 
						error: true, 
						message: "Tin nhắn không tồn tại", 
						keyEror: 'message_is_not_exists',
						status: 400
					});
				}

				let { reminder } = infoMessageReminder;

				if(reminder.status === 2) {
					return resolve({ 
						error: true, 
						message: "Reminder đã bị xóa", 
						keyEror: 'reminder_is_deleted',
						status: 403
					});
				}

				const infoReminderAfterDelete = await CHATTING__MESSAGE_REMINDER_COLL.findByIdAndUpdate(reminder._id, {
					$set: {
						status: 2
					}
				}, { new: true });

				if(!infoReminderAfterDelete) {
					return resolve({ 
						error: true, 
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục", 
						keyEror: 'error_occurred',
						status: 422
					});
				}

				// REMOVE OLD REMINDER JOB
				await ctx.call(`${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.DELETE_JOB_REMINDER_CONVERSATION}`, {
					messageID,
					conversationID
				})

				// INSERT MESSAGE NOTIFY DELETE REMINDER
				const infoMessageNotify = await CHATTING__MESSAGE_MODEL.insertData({
					usersSeen: [authorID],
					sender: authorID,
					conversation: conversationID,
					receivers: checkExistConversation.members,
					reminder: reminder._id,
					type: 118
				})

				// UPDATE LAST MESSAGE & UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
				if(infoMessageNotify){
					await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
						lastMessage: infoMessageNotify._id, modifyAt: Date.now()
					});

					await CHATTING__MESSAGE_MODEL.updateUserMissMessage({ conversationID, userID: authorID, numberMissMessage: 1 });
				}

				return resolve({
					error: false,
					status: 200,
					data: {
						infoReminder: infoReminderAfterDelete,
						infoMessageNotification: infoMessageNotify
					}
				});
			} catch (error) {
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Lấy danh sách reminder
	 * Date: 02/09/2021
	 */
	getList({ conversationID, lastestID, authorID, isJoined, limit = 10 }) {
		return new Promise(async (resolve) => {
			try {
				if(!checkObjectIDs([authorID])) {
					return resolve({ 
						error: true, 
						message: 'Tham số authorID không hợp lệ', 
						keyError: 'params_authorID_invalid',
						status: 400
					});
				}

				if(isNaN(limit) || +limit > 20) {
					limit = 20;
				} else{
					limit = +limit;
				}

				let conditionJoined = {};
				let conditionObj  = { type: 4 };
				let sortBy = { modifyAt: -1, createAt: -1 };
                let keys = ['modifyAt__-1', 'createAt__-1'];

				if(conversationID && checkObjectIDs([conversationID])) {
					let infoConversation = await CHATTING__CONVERSATION_COLL.findOne({
						_id: conversationID,
						members: { $in: [authorID] }
					}).lean();

					if(!infoConversation) {
						return resolve({ 
							error: true, 
							message: 'Bạn không phải thành viên của cuộc hội thoại', 
							keyError: 'you_are_not_member_of_conversation',
							status: 403
						});
					}

					conditionObj.conversation = ObjectID(conversationID);
				}

				let conditionObjOrg = { ...conditionObj };
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await CHATTING__MESSAGE_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastestID", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj  = dataPagingAndSort.data.find;
					sortBy        = dataPagingAndSort.data.sort;
				} else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
					sortBy = dataPagingAndSort.data.sort;
                }

				if(isJoined) {
					conditionJoined["reminder.accepts"] = { $in: [ObjectID(authorID)] };
				}

				let	listMessagesReminder = await CHATTING__MESSAGE_COLL.aggregate([
					{
						$match: conditionObj
					},
					{ $limit: limit + 1 },
					{ $sort: sortBy },
					{ 
                        $lookup: {
                            from: "users",
                            localField: "sender",
                            foreignField: "_id",
                            as: "sender"
                        } 
                    },
                    {
                        $unwind: {
							path: "$sender",
							preserveNullAndEmptyArrays: true
						},
                    },
					{ 
                        $lookup: {
                            from: "message_message_reminders",
                            localField: "reminder",
                            foreignField: "_id",
                            as: "reminder"
                        } 
                    },
                    {
                        $unwind: {
							path: "$reminder",
							preserveNullAndEmptyArrays: true
						},
                    },
					{
						$match: conditionJoined
					},
					{ 
                        $lookup: {
                            from: "users",
                            localField: "reminder.accepts",
                            foreignField: "_id",
                            as: "reminder.accepts"
                        } 
                    },
					{ 
                        $lookup: {
                            from: "users",
                            localField: "reminder.rejects",
                            foreignField: "_id",
                            as: "reminder.rejects"
                        } 
                    },
					{
                        $project: {
                            _id: 1,
							status: 1,
							type: 1,
							modifyAt: 1,
							createAt: 1,
                            "reminder.repeat": 1,
                            "reminder.status": 1,
                            "reminder.content": 1,
                            "reminder.notifyFor": 1,
                            "reminder.remindTime": 1,
                            "reminder.createdAt": 1,
                            "reminder.accepts._id": 1,
                            "reminder.accepts.fullname": 1,
                            "reminder.accepts.bizfullname": 1,
							"reminder.rejects._id": 1,
                            "reminder.rejects.fullname": 1,
                            "reminder.rejects.bizfullname": 1,
							"sender._id": 1,
                            "sender.fullname": 1,
                            "sender.bizfullname": 1,
                        }
                    }
				])

				// let	listMessagesReminder = await CHATTING__MESSAGE_COLL
				// 	.find({ ...conditionObj, ...conditionFind }, filter)
				// 	.populate('sender', select.sender)
				// 	.populate({
				// 		path: 'reminder',
				// 		populate: {
				// 			path: 'accepts rejects',
				// 			select: select.user,
				// 		},
				// 		select: select.reminder
				// 	})
				// 	.limit(limit + 1)
				// 	.sort(sortBy)
				// 	.lean();

				// GET TOTAL RECORD
				let totalRecord = await CHATTING__MESSAGE_COLL.count(conditionObjOrg);
				let nextCursor	= null;

				if(listMessagesReminder && listMessagesReminder.length){
					if(listMessagesReminder.length > limit){
						nextCursor = listMessagesReminder[limit - 1]._id;
						listMessagesReminder.length = limit;
					}
				}

				return resolve({
					error: false,
					status: 200,
					data: {
						listRecords: listMessagesReminder,
						limit,
						totalRecord,
						nextCursor
					}
				});
			} catch (error) {
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

}

exports.MODEL = new Model;
