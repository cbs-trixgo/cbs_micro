"use strict";

const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }	= require('../../../tools/utils/utils');
const { RANGE_BASE_PAGINATION_V2 }		= require('../../../tools/cursor_base/playground/index');

const MEDIA__FILE_COLL                  = require('../database/media.file-coll');
const MEDIA__FILE_REACTION_COLL         = require('../database/media.reaction_file-coll');

class Model extends BaseModel {

    constructor() {
        super(MEDIA__FILE_COLL);
    }

    /**
	 * Dev: MinhVH
	 * Func: GET INFO MEDIA FILE
	 * Date: 27/02/2022
	 */
	getInfo({ mediaID, fileID, authorID, select, populates }) {
        return new Promise(async resolve => {
            try {
				if(!checkObjectIDs([mediaID])) {
					return resolve({
						error: true,
						message: "Tham số mediaID không hợp lệ",
						keyError: "params_mediaID_invalid",
						status: 400
					})
				}

				if(!checkObjectIDs([fileID])) {
					return resolve({
						error: true,
						message: "Tham số fileID không hợp lệ",
						keyError: "params_fileID_invalid",
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

				let infoFile = await MEDIA__FILE_COLL
					.findOne({
						_id: fileID,
						media: mediaID
					})
					.select(select)
					.populate(populates)
					.lean();

				if (!infoFile) {
                    return resolve({
						error: true,
						message: "File không tồn tại",
						keyError: "file_not_exists",
						status: 400
					})
				}

				const infoReaction = await MEDIA__FILE_REACTION_COLL
					.findOne({
						file: fileID,
						media: mediaID,
						author: authorID
					}).select('type').lean();

				infoFile.reaction = infoReaction;

				return resolve({
					error: false,
					status: 200,
					data: infoFile
				});
			} catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

	/**
	 * Dev: MinhVH
	 * Func: GET LIST MEDIA FILE
	 * Date: 27/02/2022
	 */
	getList({ authorID, mediaID, lastestID, limit = 20, select, populates }) {
		return new Promise(async resolve => {
			try {
				/**
                 * DECALARTION VARIABLE (1)
                 */
				let conditionObj = { media: mediaID };
				let keys = ['createAt__-1', '_id__-1'];
				let sortBy = {};
				let nextCursor	= null;

				/** 
				 * VALIDATION STEP (2)
				 *  - Kiểm tra valid từ các input
				 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
				 */
				if(!checkObjectIDs([mediaID])) {
					return resolve({
						error: true,
						message: "Tham số mediaID không hợp lệ",
						keyError: "params_mediaID_invalid",
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

				let conditionObjOrg = { ...conditionObj };
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await MEDIA__FILE_COLL.findById(lastestID);
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

				let infoDataAfterGet = await MEDIA__FILE_COLL
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

				let totalRecord = await MEDIA__FILE_COLL.count(conditionObjOrg);

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