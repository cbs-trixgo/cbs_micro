"use strict";

/**
 * EXTERNAL PACKAGE
 */
const moment									= require('moment');

/**
 * TOOLS
 */
const BaseModel                                 = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }			= require('../../../tools/utils/utils');
const { RANGE_BASE_PAGINATION_V2 }              = require('../../../tools/cursor_base/playground/index');
const { FILE_TYPE } 							= require('../helper/chatting.keys-constant');

/**
 * COLLECTIONS
 */
const CHATTING__CONVERSATION_COLL               = require('../database/chatting.conversation-coll');
const CHATTING__CONVERSATION_FILE_COLL          = require('../database/chatting.conversation_file-coll');

class Model extends BaseModel {

    constructor() {
        super(CHATTING__CONVERSATION_FILE_COLL);
    }

	/**
	 * Dev: MinhVH
	 * Func: Thêm file trong cuộc hội thoại
	 * Date: ...
	 * Updated: 22/02/2022
	 */
    insert({ companyID, appID, name, nameOrg, description, path, size, mimeType, type, conversationID, fileID, authorID }){
        return new Promise(async (resolve) => {
            try {
				if(!checkObjectIDs([conversationID, fileID, authorID]))
					return resolve({ error: true, message: "Request Params Invalid", status: 400 });

                let infoMessageAfterInserted = await this.insertData({ 
					company: companyID, 
					app: appID,
					name,
					nameOrg,
					description,
					path,
					size,
					mimeType,
					type,
					conversation: conversationID, 
					file: fileID, 
					author: authorID
				});

				if(!infoMessageAfterInserted)
					return resolve({ error: true, message: "Can't create file", status: 422 });

				return resolve({ error: false, data: infoMessageAfterInserted, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
	 * Dev: MinhVH
	 * Func: Lấy danh sách file trong cuộc hội thoại
	 * Date: 04/01/2022
	 */
	getList({ userID, lastestID, conversationID, authorID, fromDate, toDate, type, keyword, limit = 100, select, populates }){
        return new Promise(async resolve => {
            try {
				if(!checkObjectIDs([userID])) {
					return resolve({
						error: true,
						message: "Tham số userID không hợp lệ",
						keyError: "params_userID_invalid",
						status: 400
					})
				}

				if(!checkObjectIDs([conversationID])) {
					return resolve({
						error: true,
						message: "Tham số conversationID không hợp lệ",
						keyError: "params_conversationID_invalid",
						status: 400
					})
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

				// Check user exist in conversation
				let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
					_id: conversationID,
					members: { $in: [userID] }
				}).lean();

				if(!checkExistConversation) {
					return resolve({ 
						error: true, 
						message: "Bạn không phải thành viên của cuộc hội thoại", 
						keyEror: 'you_are_not_member_of_conversation',
						status: 403
					});
				}

				if(isNaN(limit) || +limit > 100) {
					limit = 100;
				} else{
					limit = +limit;
				}

				let conditionObj = { conversation: conversationID };
                let keys = ['createAt__-1', 'modifyAt__-1'];
                let sortBy = {
					createAt: -1,
                    modifyAt: -1,
                }

				if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj.nameOrg = new RegExp(keyword, 'i');
                }

				if(type && FILE_TYPE.includes(+type)) {
					conditionObj.type = type;
				}

				if(authorID && checkObjectIDs([authorID])) {
					conditionObj.author = authorID;
				}

				if(fromDate && toDate){
					conditionObj.createAt = {
						$gte: new Date(moment(fromDate).startOf('day').format()),
						$lte: new Date(moment(toDate).endOf('day').format())
					}
				}

				let conditionObjOrg = { ...conditionObj };
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await CHATTING__CONVERSATION_FILE_COLL.findById(lastestID);
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

                let listFileConversation = await CHATTING__CONVERSATION_FILE_COLL
					.find(conditionObj)
					.limit(limit + 1)
					.sort(sortBy)
					.select(select)
					.populate(populates)
					.lean();

				// GET TOTAL RECORD
                let totalRecord = await CHATTING__CONVERSATION_FILE_COLL.count(conditionObjOrg);
				let nextCursor	= null;

				if(listFileConversation && listFileConversation.length){
					if(listFileConversation.length > limit){
						nextCursor = listFileConversation[limit - 1]._id;
						listFileConversation.length = limit;
					}
				}

                return resolve({
					error: false,
					status: 200,
					data: {
						listRecords: listFileConversation,
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
