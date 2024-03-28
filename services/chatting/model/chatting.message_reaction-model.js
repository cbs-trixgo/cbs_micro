"use strict";

/**
 * EXTERNAL
 */
const ObjectID                                  	= require('mongoose').Types.ObjectId;

/**
 * TOOLS
 */
const BaseModel                                 	= require('../../../tools/db/base_model');
const { RANGE_BASE_PAGINATION_V2 } 					= require('../../../tools/cursor_base/playground/index');
const { checkObjectIDs, IsJsonString }				= require('../../../tools/utils/utils');
const { REACTION_TYPES }							= require('../helper/chatting.keys-constant');

/**
 * COLLECTIONS, MODELS
 */
const CHATTING__MESSAGE_COLL				        = require('../database/chatting.message-coll');
const CHATTING__MESSAGE_REACTION_COLL				= require('../database/chatting.message_reaction-coll');

class Model extends BaseModel {

    constructor() {
        super(CHATTING__MESSAGE_REACTION_COLL);
    }

	/**
	 * Dev: MinhVH
	 * Func: Reaction tin nhắn trong cuộc hội thoại
	 * Date: 26/10/2021
	 */
    reactionMessage({ userID, messageID, typeReaction }){
		return new Promise(async resolve => {
			try {
				if(!typeReaction || !REACTION_TYPES.includes(typeReaction)) {
                    return resolve({
						error: true, 
						message: 'Request params type reaction invalid', 
						keyError: 'params_typeReaction_invalid',
						status: 400
					});
				}

				if(!checkObjectIDs([userID, messageID])) {
                    return resolve({
						error: true, 
						message: 'Request params messageID or userID invalid', 
						keyError: 'params_messageID_or_userID_invalid',
						status: 400
					});
				}

				// Check reaction is exists
				const infoReaction = await CHATTING__MESSAGE_REACTION_COLL
					.findOne({
						message: messageID,
						author: userID
					})
					.lean();

				if(infoReaction){
					await CHATTING__MESSAGE_COLL.findByIdAndUpdate(messageID, {
						$pull: {
							reactions: infoReaction._id
						}
					});

					await CHATTING__MESSAGE_REACTION_COLL.findByIdAndDelete(infoReaction._id);

					if(infoReaction.type === typeReaction) {
						return resolve({
							error: false,
							status: 200,
							message: 'success'
						});
					}
				}

				const infoReactionAfterInsert = await this.insertData({
					type: typeReaction,
					message: messageID,
					author: userID
				});

				if(!infoReactionAfterInsert) {
					return resolve({
						error: true,
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục",
						keyError: "error_occurred",
						status: 422
					});
				}

				await CHATTING__MESSAGE_COLL.findByIdAndUpdate(messageID, {
					$addToSet: {
						reactions: infoReactionAfterInsert._id
					}
				});

                return resolve({ error: false, data: infoReactionAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Danh sách reaction của tin nhắn
	 * Date: 02/09/2021
	 */
	getListReactionMessage({ messageID, type, lastestID, limit = 10, select, populates, userID }){
		return new Promise(async resolve => {
			try {
				let conditionObj = { message: messageID };
                let sortBy = { _id: -1 };
                let keys = ['_id__-1', 'createAt__-1'];

				if(!checkObjectIDs([userID])) {
					return resolve({
						error: true,
						message: "Tham số userID không hợp lệ",
						keyError: "params_userID_invalid",
						status: 400,
					})
				}

				if(!checkObjectIDs([messageID])) {
					return resolve({
						error: true,
						message: "Tham số messageID không hợp lệ",
						keyError: "params_messageID_invalid",
						status: 400,
					})
				}

				if(type) {
					if(!REACTION_TYPES.includes(type)) {
						return resolve({
							error: true, 
							message: 'Request params type invalid', 
							keyError: 'params_type_invalid',
							status: 400
						});
					}

					conditionObj.type = type;
				}

				if(populates && typeof populates === 'string'){
					if(!IsJsonString(populates))
						return resolve({ error: true, message: 'Request params populates invalid', status: 400 });

					populates = JSON.parse(populates);
				} else{
                    populates = {
                        path: "",
                        select: ""
                    }
                }

				if(isNaN(limit) || +limit > 20) {
					limit = 20;
				} else{
					limit = +limit;
				}

				let conditionObjOrg = { ...conditionObj };
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await CHATTING__MESSAGE_REACTION_COLL.findById(lastestID);
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

				let listReactions = await CHATTING__MESSAGE_REACTION_COLL
					.find(conditionObj)
					.limit(limit + 1)
					.sort(sortBy)
					.select(select)
					.populate(populates)
					.lean();

				// GET TOTAL RECORD
				let totalRecord = await CHATTING__MESSAGE_REACTION_COLL.count(conditionObjOrg);
				let nextCursor  = null;

				if(listReactions && listReactions.length){
					if(listReactions.length > limit){
						nextCursor = listReactions[limit - 1]._id;
						listReactions.length = limit;
					}
				}

				return resolve({
					error: false,
					status: 200,
					data: {
						listRecords: listReactions,
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
