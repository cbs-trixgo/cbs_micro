"use strict";

/**
 * EXTERNAL PACKAGE
 */
const ObjectID                                  	= require('mongoose').Types.ObjectId;
const PromisePool									= require('@supercharge/promise-pool');

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } 						= require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_REMINDER } 						= require('../../reminder/helper/reminder.actions-constant');
const { CF_ACTIONS_FILE } 							= require('../../file/helper/file.actions-constant');

/**
 * TOOLS
 */
const { RANGE_BASE_PAGINATION } 					= require('../../../tools/cursor_base/playground/index');
const {
	checkObjectIDs,
	checkNumberIsValidWithRange,
	IsJsonString
} = require('../../../tools/utils/utils');

/**
 * BASE
 */
const BaseModel                                     = require('../../../tools/db/base_model');

/**
 * COLLECTIONS
 */
const CHATTING__MESSAGE_COLL                        = require('../database/chatting.message-coll');
const CHATTING__CONVERSATION_COLL                   = require('../database/chatting.conversation-coll');

/**
 * MODELS
 */
const CHATTING__CONVERSATION_MEMBER_COLL			= require('../database/chatting.conversation_member-coll');
const CHATTING__CONVERSATION_FILE_MODEL				= require('../model/chatting.conversation_file-model').MODEL;
const CHATTING__CONVERSATION_LINK_MODEL				= require('../model/chatring.conversation_link-model').MODEL;


class Model extends BaseModel {

    constructor() {
        super(CHATTING__MESSAGE_COLL);
    }

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật user miss tin nhắn của cuộc hội thoại
	 * Date: 29/08/2021
	 */
	updateUserMissMessage({ conversationID, userID, numberMissMessage }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID]))
                    return resolve({ error: true, message: 'Request Params invalid', status: 400 });

				// CHECK USER IS MEMBER OF CONVERSATION
				let infoConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $in: [userID] }
				});

				// If usersMissMessage not exist or [] then add members conversation into usersMissMessage
				if(!infoConversation.usersMissMessage || !infoConversation.usersMissMessage.length){
					let usersMissMessage = [];

					infoConversation.members.filter(memberID => {
						if(memberID.toString() === userID.toString()){
							usersMissMessage = [...usersMissMessage, {
								userID: memberID,
								amount: 0
							}];
						} else{
							usersMissMessage = [...usersMissMessage, {
								userID: memberID,
								amount: numberMissMessage
							}];
						}
					})

					// UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
					await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
						$addToSet: { usersMissMessage }
					});
				} else{
					// Update miss message except current user
					await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
						$inc: {
							"usersMissMessage.$[elem].amount": numberMissMessage
						}
					}, {
						arrayFilters: [{
							"elem.userID": { $nin: [userID] }
						}]
					})

					// Update miss message my self
					await CHATTING__CONVERSATION_COLL.findOneAndUpdate({
						_id: conversationID,
						"usersMissMessage.userID": userID
					}, {
						$set: { "usersMissMessage.$.amount": 0 }
					});
				}

				return resolve({ error: false, message: 'success', status: 200 });
			} catch(error){
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Thêm tin nhắn trong cuộc hội thoại
	 * Date: 06/08/2021
	 */
    insertMessage({
		conversationID, senderID, content, receiversID, parentID, usersAssigned, files, location, type = 0, ctx
	}) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([senderID, conversationID])) {
					return resolve({
						error: true,
						message: "Tham số senderID hoặc conversationID không hợp lệ",
						keyError: "params_senderID_or_conversationID_invalid",
						status: 400
					})
				}

				// CHECK SENDER IS MEMBER OF CONVERSATION
                let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $in: [senderID] }
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
				if(checkExistConversation.config && checkExistConversation.config.configSendMessage === 2){
					const listAuthorsID = checkExistConversation.authors.map(author => author.toString());

					// User is not author of conversation
					if(!listAuthorsID.includes(senderID)) {
						return resolve({
							error: true,
							message: "Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này, vui lòng liên hệ người tạo nhóm chat",
							keyError: "you_do_not_have_permission_to_send_message",
							status: 403
						})
					}
				}

				if(!receiversID || !receiversID.length){
					receiversID = checkExistConversation.members;
				} else if(!checkObjectIDs(receiversID)){
					return resolve({
						error: true,
						message: "Tham số receiversID không hợp lệ",
						keyError: "param_receiversID_invalid",
						status: 400
					})
				}

				if(parentID && !checkObjectIDs([parentID])) {
					return resolve({
						error: true,
						message: "Tham số parentID không hợp lệ",
						keyError: "param_parentID_invalid",
						status: 400
					})
				}

				if(usersAssigned && usersAssigned.length && !checkObjectIDs(usersAssigned)) {
					return resolve({
						error: true,
						message: "Tham số usersAssigned không hợp lệ",
						keyError: "param_usersAssigned_invalid",
						status: 400
					})
				}

				let dataInsertMessage = {
					usersSeen: [senderID],
					sender: senderID,
					content,
					conversation: conversationID,
					receivers: receiversID,
					type
				}
				parentID 		&& (dataInsertMessage.parent 		= parentID);
				usersAssigned 	&& (dataInsertMessage.usersAssigned = usersAssigned);

				// MESSAGE IMAGES, FILES
				if(files && files.length && checkNumberIsValidWithRange({ arrValid: [1,2], val: type })){
					let { results } = await PromisePool
						.for(files)
						.withConcurrency(2)
						.process(async file => {
							const infoFileCore = await ctx.call(`${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`, {
								fileID: file._id
							}, {
								meta: {
									infoUser: { _id: senderID }
								}
							});

							if(!infoFileCore.error) {
								const {
									app, company, name, nameOrg, description, path, size, mimeType, type, author
								} = infoFileCore.data;

								const infoAfterInserted = await CHATTING__CONVERSATION_FILE_MODEL.insert({
									conversationID,
									fileID: file._id,
									description,
									appID: app, companyID: company, authorID: author,
									name, nameOrg, path, size, mimeType, type
								});

								return { file: infoAfterInserted.data && infoAfterInserted.data._id }
							}
						})

					if(results.length) {
						results = results.filter(Boolean);
						dataInsertMessage.files = results;
					}
				}

				let infoMessageAfterInserted = null;
				let numberMissMessage		 = 1;

				switch (+type) {
					case 6: // MESSAGE SHARE LOCATION
						infoMessageAfterInserted = await this.insertData({
							...dataInsertMessage,
							location: {
								type: "Point",
								coordinates: [parseFloat(location.lng), parseFloat(location.lat)]
							}
						})
						break;
					case 7: // MESSAGE SHARE CONTACT
						if(!usersAssigned || !usersAssigned.length || !checkObjectIDs(usersAssigned)) {
							return resolve({
								error: true,
								message: "Tham số usersAssigned không hợp lệ",
								keyError: "param_usersAssigned_invalid",
								status: 400
							})
						}

						let listMessageShareContact = usersAssigned.map(memberID => ({
							usersSeen: [senderID],
							sender: senderID,
							receivers: receiversID,
							conversation: conversationID,
							usersAssigned: [memberID],
							type: 7
						}))

						const { results } = await PromisePool
							.for(listMessageShareContact)
							.withConcurrency(2)
							.process(async message => this.insertData(message))

						numberMissMessage 		 = results.length;
						infoMessageAfterInserted = results[results.length - 1];
						break;
					default: // MESSAGE NORMAL OR NOTI
						infoMessageAfterInserted = await this.insertData(dataInsertMessage);
						break;
				}

                if(!infoMessageAfterInserted) {
					return resolve({
						error: true,
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục",
						keyError: "error_occured",
						status: 422
					})
				}

				// MESSAGE LINK
				if(content){
					let urlRegex = /((((https|http|HTTP|HTTPS|ftp)?:\/\/)|(www\.))[^\s]+)/g;
					let allLinks = content.match(urlRegex);

					if(allLinks && allLinks.length){
						await PromisePool
							.for(allLinks)
							.withConcurrency(2)
							.process(async link => CHATTING__CONVERSATION_LINK_MODEL.insert({
								conversationID,
								messageID: infoMessageAfterInserted._id,
								authorID: senderID,
								link
							}))
					}
				}

				// UPDATE LAST MESSAGE & UPDATE SHOW CONVERSATION HIDE
                await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
					$set: {
						lastMessage: infoMessageAfterInserted._id,
						usersHide: [],
						modifyAt: Date.now()
					}
                });

				// UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
				await this.updateUserMissMessage({ conversationID, userID: senderID, numberMissMessage });

                return resolve({ error: false, data: infoMessageAfterInserted, status: 200 });
            } catch (error) {
				console.error(error)
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật Danh sách đã xem tin nhắn trong cuộc hội thoại
	 * Date: 30/08/2021
	 */
	updateSeenMessage({ conversationID, messagesID, userID }){
        return new Promise(async(resolve) => {
            try {
				if(!checkObjectIDs([userID])) {
					return resolve({
						error: true,
						message: "Tham số userID không hợp lệ",
						keyError: "params_userID_invalid",
						status: 400
					})
				}

                if(!checkObjectIDs([conversationID, ...messagesID])) {
					return resolve({
						error: true,
						message: "Tham số conversationID hoặc messagesID không hợp lệ",
						keyError: "params_conversationID_or_messagesID_invalid",
						status: 400
					})
				}

				// CHECK USER IS MEMBER OF CONVERSATION
				let infoConversation = await CHATTING__CONVERSATION_COLL
					.findOne({
						_id: conversationID,
						members: { $in: [userID] }
					})
					.select('members')
					.lean();

				if(!infoConversation) {
					return resolve({
						error: true,
						message: "Bạn không phải thành viên của cuộc hội thoại",
						keyError: "you_are_not_member_of_conversation",
						status: 403
					})
				}

				let amountUpdateMissMessage = 0;
				const { results } = await PromisePool
					.for(messagesID)
					.withConcurrency(2)
					.process(async messageID => {
						let infoMessageAfterUpdate = await CHATTING__MESSAGE_COLL.findByIdAndUpdate(messageID, {
							$addToSet: {
								usersSeen: userID
							}
						}, { new: true });

						// Cập nhật trạng thái đã xem (khi tất cả thành viên đều đã xem)
						if(infoConversation.members.length === infoMessageAfterUpdate.usersSeen.length) {
							infoMessageAfterUpdate = await CHATTING__MESSAGE_COLL.findByIdAndUpdate(messageID, {
								$set: { status: 2 }
							}, { new: true });
						}

						amountUpdateMissMessage++;
						return infoMessageAfterUpdate;
					})

				if(!results || !results.length) {
					return resolve({
						error: true,
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục",
						keyError: "error_occurred",
						status: 422
					})
				}

				await CHATTING__CONVERSATION_MEMBER_COLL.findOneAndUpdate({
					conversation: conversationID,
					member: userID
				}, {
					$set: {
						timeLastSeen: Date.now()
					}
				})

				await CHATTING__CONVERSATION_COLL.findOneAndUpdate({
					_id: conversationID,
					usersMissMessage: {
						$elemMatch: {
							userID,
							amount: { $gte: amountUpdateMissMessage }
						}
					}
				}, {
					$inc: {
						"usersMissMessage.$.amount": -amountUpdateMissMessage
					}
				})

				return resolve({ error: false, data: results, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

	/**
	 * Dev: MinhVH
	 * Func: Xoá tin nhắn của cuộc hội thoại (media, text)
	 * Date: 16/08/2021
	 */
	deleteMessage({ conversationID, userID, messagesID, filesID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([...messagesID, userID, conversationID])) {
					return resolve({
						error: true,
						message: "Tham số messagesID hoặc conversationID không hợp lệ",
						keyError: "params_messagesID_or_conversationID_invalid",
						status: 400
					})
				}

				// CHECK USERID IS MEMBER OF CONVERSATION
                let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $all: [userID] }
                }).lean();

                if(!checkExistConversation) {
					return resolve({
						error: true,
						message: "Bạn không phải thành viên của cuộc hội thoại này",
						keyError: "you_are_not_member_of_conversation",
						status: 403
					})
				}

				if(filesID && !checkObjectIDs(filesID)) {
					return resolve({
						error: true,
						message: "Tham số filesID không hợp lệ",
						keyError: "params_filesID_invalid",
						status: 400
					})
				}

				// Get list message will delete
				let listMessages = await CHATTING__MESSAGE_COLL
					.find({
						_id: { $in: messagesID },
						conversation: conversationID
					})
					.select('_id type')
					.lean();

				const { results: infoMessageAfterUpdated } = await PromisePool
					.for(listMessages)
					.withConcurrency(2)
					.process(async message => {
						let infoMessageAfterUpdated = null;

						switch (message.type) {
							case 0: // Delete message normal (text message)
							case 6: // Delete message location
							case 7: // Delete message contact
								infoMessageAfterUpdated = await CHATTING__MESSAGE_COLL.findOneAndUpdate({
									_id: message._id,
									conversation: conversationID
								}, {
									$addToSet: {
										usersDelete: userID
									}
								}, { new: true });
								break;
							case 1: // Delete message image
							case 2: // Delete message file

								if(!filesID || !filesID.length) {
									infoMessageAfterUpdated = await CHATTING__MESSAGE_COLL.findOneAndUpdate({
										_id: message._id,
										conversation: conversationID
									}, {
										$addToSet: {
											usersDelete: userID
										}
									}, { new: true });
								} else {
									infoMessageAfterUpdated = await CHATTING__MESSAGE_COLL.findOneAndUpdate({
										_id: message._id,
										conversation: conversationID,
										files: {
											$elemMatch: {
												_id: { $in: filesID }
											}
										}
									}, {
										$addToSet: {
											"files.$.usersDelete": userID
										}
									}, { new: true });
								}

								break;
							default:
								break;
						}

						return infoMessageAfterUpdated;
					})

				if(!infoMessageAfterUpdated) {
					return resolve({
						error: true,
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục",
						keyError: "error_occurred",
						status: 422
					})
				}

				return resolve({ error: false, data: infoMessageAfterUpdated, status: 200 });
			} catch(error){
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Thu hồi tin nhắn của cuộc hội thoại (media, text)
	 * Date: 16/08/2021
	 */
	revokeMessage({ conversationID, userID, messagesID, filesID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([...messagesID, userID, conversationID])) {
					return resolve({
						error: true,
						message: 'Tham số không hợp lệ',
						keyError: 'params_invalid',
						status: 400
					});
				}

                let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $all: [userID] }
                }).lean();

                if(!checkExistConversation) {
					return resolve({
						error: true,
						message: 'Bạn không phải thành viên của cuộc hội thoại',
						keyError: 'you_are_not_member_of_conversation',
						status: 403
					});
				}

				if(filesID && !checkObjectIDs(filesID)) {
					return resolve({
						error: true,
						message: 'Tham số filesID không hợp lệ',
						keyError: 'params_filesID_invalid',
						status: 400
					});
				}

				// Get list message will delete
				let listMessages = await CHATTING__MESSAGE_COLL
					.find({
						_id: { $in: messagesID },
						conversation: conversationID
						// sender: userID
					})
					.select('_id type createAt')
					.lean();

				if(!listMessages || !listMessages.length) {
					return resolve({
						error: true,
						message: 'Tin nhắn không thuộc cuộc hội thoại hoặc tin nhắn không tồn tại',
						keyError: 'message_is_not_belong_conversation',
						status: 403
					});
				}

				// Get list message not expire recall
				let listMessagesNotExpire = [];
				listMessages.map(message => {
					const expireTime = new Date(message.createAt).addHours(1);
					const now 		 = new Date(Date.now());

					if(expireTime > now){
						listMessagesNotExpire[listMessagesNotExpire.length] = message;
					}
				})

				// Recall 1 message and message is expired recall
				if(messagesID.length === 1 && !listMessagesNotExpire.length) {
					return resolve({
						error: true,
						message: 'Tin nhắn đã hết hạn thu hồi (1 tiếng)',
						keyError: 'time_to_recall_messages_has_expired',
						status: 403
					});
				}

				const { results } = await PromisePool
					.for(listMessagesNotExpire)
					.withConcurrency(2)
					.process(async message => {
						let infoMessageAfterUpdated = null;

						switch (message.type) {
							case 0: // Recall message normal (text message)
							case 6: // Recall message location
							case 7: // Recall message share contact
								infoMessageAfterUpdated = await CHATTING__MESSAGE_COLL.findByIdAndDelete(message._id);
								break;
							case 1: // Recall message images
							case 2: // Recall message files
								infoMessageAfterUpdated = await CHATTING__MESSAGE_COLL.findByIdAndDelete(message._id);

								// infoMessageAfterUpdated = await CHATTING__MESSAGE_COLL.findByIdAndUpdate(message._id, {
								// 	$pullAll: {
								// 		files: {
								// 			_id: { $in: filesID }
								// 		}
								// 	},
								// }, { new: true });

								// if(infoMessageAfterUpdated && !infoMessageAfterUpdated.files.length){
								// 	await CHATTING__MESSAGE_COLL.findByIdAndDelete(message._id);
								// }

								// infoMessageAfterUpdated = await CHATTING__MESSAGE_COLL.findOneAndUpdate({
								// 	_id: message._id,
								// 	files: {
								// 		$elemMatch: {
								// 			file: { $in: filesID }
								// 		}
								// 	}
								// }, {
								// 	$set: {
								// 		"files.$.status": 2
								// 	}
								// }, { new: true });
								break;
							default:
								break;
						}

						// Update last message for conversation
						let isLastMessage = checkExistConversation.lastMessage?.toString() === message._id.toString();

						if(isLastMessage){
							let lastMessageOfConversation = await CHATTING__MESSAGE_COLL
								.findOne({ conversation: conversationID })
								.select('_id')
								.sort({ _id: -1 })

							await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
								$set: { lastMessage: lastMessageOfConversation._id }
							})
						}

						return infoMessageAfterUpdated;
					})

				if(!results || !results.length) {
					return resolve({
						error: true,
						message: 'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
						keyError: 'error_occurred',
						status: 422
					});
				}

				return resolve({ error: false, data: results, status: 200 });
			} catch(error){
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Tự động xoá tất cả tin nhắn của cuộc hội thoại
	 * Date: 28/09/2021
	 */
	autoDeleteMessagesConversation({ conversationID, messageID, userID, time, isDelete = false, ctx }){
		return new Promise(async resolve => {
			try {
                if (!checkObjectIDs([userID, conversationID])) {
					return resolve({
						error: true,
						message: 'Tham số conversationID không hợp lệ',
						keyError: 'params_userID_or_conversationID_invalid',
						status: 400
					})
				}

                let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					authors: { $in: [userID] }
                }).lean();

                if(!checkExistConversation) {
					return resolve({
						error: true,
						message: 'Bạn không phải admin cuộc hội thoại',
						keyError: 'you_are_not_admin_of_conversation',
						status: 403
					})
				}

				console.log({ conversationID, messageID, isDelete })
				if(isDelete){
					await CHATTING__MESSAGE_COLL.deleteMany({
						_id: { $gte: messageID },
						conversation: conversationID
					})
				} else{
					const lastMessage = await CHATTING__MESSAGE_COLL
						.find({
							conversation: conversationID
						})
						.sort({ _id: -1 })
						.limit(1)
						.select('_id')
						.lean();

					console.log({ lastMessage })

					await ctx.call(`${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.DELETE_JOB_AUTO_DELETE_MESSAGE_CONVERSATION}`, {
						conversationID,
					});

					// !Off auto delete message
					if(+time !== 0){
						await ctx.call(`${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.ADD_JOB_AUTO_DELETE_MESSAGE_CONVERSATION}`, {
							conversationID,
							messageID: lastMessage.length ? lastMessage[0]._id?.toString() : '',
							userID,
							time
						})
					}
				}

				resolve({ error: false, message: 'success', status: 200 });
			} catch (error) {
				console.error(error);
				resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Chia sẻ tin nhắn đến các cuộc hội thoại
	 * Date: 25/08/2021
	 */
	shareMessageConversation({ conversationsID, messagesID, userID }){
		return new Promise(async resolve => {
			try {
				if (!checkObjectIDs([...conversationsID, ...messagesID, userID]))
                    return resolve({ error: true, message: 'Request Params invalid', status: 400 });

				// CHECK USER ID IS MEMBER OF CONVERSATION
				let listConversations = await CHATTING__CONVERSATION_COLL
					.find({
						_id: { $in: conversationsID },
						members: { $all: [userID] }
					})
					.select('_id members')
					.lean();

				if(!listConversations)
					return resolve({ error: true, message: "You aren't member of conversations", status: 403 });

				const { results } = await PromisePool
					.for(listConversations)
					.withConcurrency(2)
					.process(async conversation => {

						const values = await PromisePool
							.for(messagesID)
							.withConcurrency(2)
							.process(async messageID => {
								// Get info message share
								let infoMessageShare = await CHATTING__MESSAGE_COLL.findById(messageID);
								let { content, files, type } = infoMessageShare;

								// Insert message to conversation
								let infoAfterInserted = await this.insertData({
									conversation: conversation._id,
									sender: userID,
									usersSeen: [userID],
									receivers: conversation.members,
									content,
									files,
									type
								});

								// Update last message
								await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversation._id, {
									lastMessage: infoAfterInserted._id, modifyAt: Date.now()
								}, { new: true });

								// UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
								await this.updateUserMissMessage({ conversationID: conversation._id, userID, numberMissMessage: 1 });

								return infoAfterInserted;
							})

						return values;
					})

				return resolve({ error: false, data: results, status: 200 });
			} catch (error) {
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật pin tin nhắn
	 * Date: 28/08/2021
	 */
	updatePinMessageConversation({ conversationID, messageID, userID, isPin }) {
        return new Promise(async (resolve) => {
            try {
				if(!checkObjectIDs([conversationID, messageID, userID])) {
					return resolve({
						error: true,
						message: "Tham số không hợp lệ",
						keyEror: 'params_conversationID_or_messageID_invalid',
						status: 400
					});
				}

                let infoConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $in: [userID] }
				}).lean();

				if(!infoConversation) {
					return resolve({
						error: true,
						message: "Bạn không phải thành viên của cuộc hội thoại",
						keyEror: 'you_are_not_member_of_conversation',
						status: 403
					});
				}

				// Check config admin conversation
				if(infoConversation.config && infoConversation.config.configPinMessage === 2){
					const listAuthorsID = infoConversation.authors.map(author => author.toString());
					// User is not author of conversation
					if(!listAuthorsID.includes(userID)) {
						return resolve({
							error: true,
							message: "Bạn không có quyền pin tin nhắn",
							keyEror: 'you_do_not_have_permission_to_pin_message',
							status: 403
						});
					}
				}

				const TYPE_PIN_MESSAGE = 108;
				const TYPE_UNPIN_MESSAGE = 109;
				let infoConversationAfterUpdate = null;
				let typeMessage = 0;

				if(isPin){

					if(infoConversation.messagesPin.includes(messageID)) {
						return resolve({
							error: true,
							message: "Tin nhắn đã được pin",
							keyEror: 'message_is_pined',
							status: 400
						});
					}

					// Pin tối đa 20 tin nhắn (pull last, push first)
					if(infoConversation.messagesPin.length >= 20){
						infoConversationAfterUpdate = await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
							$push: {
								messagesPin: {
									$each: [messageID],
									$position: 0,
									$slice: 20
								}
							}
						}, { new: true });
					} else{
						infoConversationAfterUpdate = await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
							$push: {
								messagesPin: {
									$each: [messageID],
									$position: 0
								}
							}
						}, { new: true });
					}

					typeMessage = TYPE_PIN_MESSAGE;

				} else{
					infoConversationAfterUpdate = await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
						$pull: { messagesPin: messageID }
					}, { new: true });

					typeMessage = TYPE_UNPIN_MESSAGE;
				}

				if(!infoConversationAfterUpdate) {
					return resolve({
						error: true,
						message: "Đã xảy ra lỗi",
						keyEror: 'error_occurred',
						status: 422
					});
				}

				const infoMessageNotification = await this.insertData({
					conversation: conversationID,
					sender: userID,
					type: typeMessage,
					receivers: infoConversation.members,
				})

				// UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
				await this.updateUserMissMessage({ conversationID, userID, numberMissMessage: 1 });

				infoConversationAfterUpdate = await CHATTING__CONVERSATION_COLL
					.findById(conversationID)
					.populate({
						path: 'messagesPin',
						populate: {
							path: 'sender poll reminder files.file',
							select: '_id fullname bizfullname email image name options status content',
							populate: {
								path: 'options.usersVote file',
								select: '_id bizfullname fullname image name nameOrg path size'
							},
						},
					})
					.lean();

				return resolve({
					error: false,
					data: {
						infoConversation: infoConversationAfterUpdate,
						infoMessage: infoMessageNotification
					},
					status: 200
				});
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 })
            }
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Danh sách tin nhắn được pin trong cuộc hội thoại (phân trang)
	 * Date: 28/08/2021
	 */
	getListMessagePinConversation({ conversationID, page, limit, userID, filter = {}, select = {} }) {
        return new Promise(async (resolve) => {
            try {
				if(!checkObjectIDs([conversationID, userID]))
                    return resolve({ error: true, message: 'Request params invalid', status: 400 });

				if(filter && typeof filter === 'string'){
					if(!IsJsonString(filter))
						return resolve({ error: true, message: 'Request params filter invalid', status: 400 });

					filter = JSON.parse(filter);
				}

				if(select && typeof select === 'string'){
					if(!IsJsonString(select))
						return resolve({ error: true, message: 'Request params select invalid', status: 400 });

					select = JSON.parse(select);
				}

                let infoConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $in: [userID] }
				}).lean();

				if(!infoConversation)
					return resolve({ error: true, message: "You aren't member of conversation", status: 403 });

				if(!page || isNaN(page))
					page = 1;

				if(!limit || isNaN(limit))
					limit = 10;

				page  = +page;
				limit = +limit;

				let	listMessagesPined = await CHATTING__MESSAGE_COLL
					.find({
						_id: { $in: infoConversation.messagesPin },
						conversation: conversationID
					}, filter)
					.populate({
						path: 'poll',
						populate: {
							path: 'options.usersVote',
							select: '_id bizfullname fullname image'
						},
						select: select.poll
					})
					.populate({
						path: 'reactions',
						select: '_id type author',
						populate: {
							path: 'author',
							select: '_id bizfullname image'
						}
					})
					.populate('reminder', select.reminder)
					.populate('sender', select.sender)
					.populate({
						path: 'files.file',
						select: '_id file',
						populate: {
							path: 'file',
							select: select.file
						},
					})
					.limit(limit)
					.skip((page * limit) - limit)
					.lean();

				if(!listMessagesPined)
					return resolve({ error: true, message: "Can't get list message pin", status: 403 });

				return resolve({
					error: false,
					status: 200,
					data: {
						listRecords: listMessagesPined,
						currentPage: page,
						limit,
						totalRecord: infoConversation.messagesPin?.length
					}
				});
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 })
            }
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Danh sách tin nhắn nhắc hẹn trong cuộc hội thoại
	 * Date: 02/09/2021
	 */
	getListMessageReminder({ conversationID, lastestID, userID, isJoined, limit = 10 }) {
		return new Promise(async (resolve) => {
			try {
				if(!checkObjectIDs([userID])) {
					return resolve({
						error: true,
						message: 'Tham số user ID',
						keyError: 'params_userID_invalid',
						status: 400
					});
				}

				if(isNaN(limit)) {
					limit = 10;
				} else{
					limit = +limit;
				}

				let conditionFind = {};
				let conditionJoined = {};
				let conditionObj  = { type: 4 };
				let sortBy = {
					modifyAt: -1,
					createAt: -1,
				}

				if(conversationID && checkObjectIDs([conversationID])) {
					let infoConversation = await CHATTING__CONVERSATION_COLL.findOne({
						_id: conversationID,
						members: { $in: [userID] }
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

				// GET CONDITION PAGINATION
				if(lastestID && checkObjectIDs(lastestID)){
					let infoMessage = await CHATTING__MESSAGE_COLL.findById(lastestID);
					if(!infoMessage)
						return resolve({ error: true, message: "Can't get info last message", status: 403 });

					let nextInfo = `${infoMessage.modifyAt}_${infoMessage._id}`;
					let keys	 = ['modifyAt__-1', '_id__-1'];

					let dataPagingAndSort = await RANGE_BASE_PAGINATION({ nextInfo, keys });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });

					conditionFind = dataPagingAndSort.data.find;
				}

				if(isJoined) {
					conditionJoined["reminder.accepts"] = { $in: [ObjectID(userID)] };
				}

				let	listMessagesReminder = await CHATTING__MESSAGE_COLL.aggregate([
					{
						$match: { ...conditionObj, ...conditionFind }
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
				let totalRecord = await CHATTING__MESSAGE_COLL.countDocuments(conditionObj);
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
						limit: +limit,
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
