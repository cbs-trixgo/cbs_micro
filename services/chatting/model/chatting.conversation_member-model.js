"use strict";

/**
 * EXTERNAL PACKAGE
 */

/**
 * TOOLS
 */
const BaseModel                                 = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }			= require('../../../tools/utils/utils');
const { RANGE_BASE_PAGINATION_V2 }              = require('../../../tools/cursor_base/playground/index');

/**
 * COLLECTIONS
 */
const CHATTING__CONVERSATION_MEMBER_COLL		= require('../database/chatting.conversation_member-coll');

class Model extends BaseModel {

    constructor() {
        super(CHATTING__CONVERSATION_MEMBER_COLL);
    }

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật tên thành viên (service call service)
	 * Date: 14/03/2022
	 */
	update({ userID, bizfullname }) {
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

				const infoAfterUpdate = await CHATTING__CONVERSATION_MEMBER_COLL.updateMany({
					member: userID
				}, {
					$set: {
						name: bizfullname
					}
				})

				if(!infoAfterUpdate) {
					return resolve({
						error: true,
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục",
						keyError: "error_occurred",
						status: 422
					})
				}

				return resolve({ error: false, data: infoAfterUpdate, status: 200 });
			} catch (error) {
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

	/**
	 * Dev: MinhVH
	 * Func: Lấy danh sách members cuộc hội thoại
	 * Date: ...
	 * Updated: 10/08/2021 - MinhVH
	 */
	getList({ conversationID, authorID, lastestID, keyword, type, limit = 15, select, populates }){
        return new Promise(async resolve => {
			try {
				/**
                 * DECALARTION VARIABLE (1)
                 */
				let conditionObj = { conversation: conversationID };
				let keys = ['createAt__-1', '_id__-1'];
				let sortBy = {};
				let nextCursor	= null;

				/** 
				 * VALIDATION STEP (2)
				 *  - Kiểm tra valid từ các input
				 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
				 */
				if(!checkObjectIDs([conversationID])) {
					return resolve({
						error: true,
						message: "Tham số conversationID không hợp lệ",
						keyError: "params_conversationID_invalid",
						status: 400
					})
				}

				if(!checkObjectIDs([authorID])) {
					return resolve({
						error: true,
						message: "Tham số authorID không hợp lệ",
						keyError: "params_authorID_invalid",
						status: 400
					})
				}

				if(limit > 20 || isNaN(limit)){
					limit = 20;
				} else {
					limit = +limit;
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

				if(keyword) {
					keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj.name = new RegExp(keyword, 'i');
				}

				type && (conditionObj.type = type);

				let conditionObjOrg = { ...conditionObj };
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await CHATTING__CONVERSATION_MEMBER_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastestID", status: 400 });

					let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });

					conditionObj  = dataPagingAndSort.data.find;
					sortBy        = dataPagingAndSort.data.sort;
				} else{
					let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
					sortBy        = dataPagingAndSort.data.sort;
				}

				let infoDataAfterGet = await CHATTING__CONVERSATION_MEMBER_COLL
					.find(conditionObj)
					.limit(limit + 1)
					.sort(sortBy)
					.select(select)
					.populate(populates)
					.lean();

				if(!infoDataAfterGet) {
					return resolve({
						error: true,
						message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục",
						keyError: "error_occurs",
						status: 422
					})
				}

				if(infoDataAfterGet && infoDataAfterGet.length){
					if(infoDataAfterGet.length > limit){
						nextCursor = infoDataAfterGet[limit - 1]._id;
						infoDataAfterGet.length = limit;
					}
				}

				let totalRecord = await CHATTING__CONVERSATION_MEMBER_COLL.count(conditionObjOrg);

				return resolve({ error: false, data: {
					listRecords: infoDataAfterGet,
					limit,
					totalRecord,
					nextCursor,
				}, status: 200 });
			} catch (error) {
				console.error(error);
				return resolve({ error: true, error: error.message, status: 500 });
			}
		})
    }
}

exports.MODEL = new Model;