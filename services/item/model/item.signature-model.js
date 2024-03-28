"use strict";

/**
 * TOOLS
 */
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }  = require('../../../tools/utils/utils');
const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');

/**
 * COLLECTIONS
 */
const ITEM__SIGNATURE_COLL				= require('../database/item.signature-coll');

class Model extends BaseModel {

    constructor() {
        super(ITEM__SIGNATURE_COLL);
    }

    /**
     * Func: Insert signature
     * Dev: MinhVH
     * Date: 25/03/2022
     */
    insert({ companyID, projectID, coll, title, note, authorID }) {
        return new Promise(async resolve => {
            try {
                const dataInsert = {
                    coll,
                    project: projectID,
                    company: companyID,
                    author: authorID
                }

                if(!checkObjectIDs([authorID])) {
                    return resolve({
                        error: true,
                        message: "Tham số authorID không hợp lệ",
                        keyError: "params_authorID_invalid",
                        status: 400
                    })
                }

                if(!coll || !coll.item || !checkObjectIDs([coll.item])) {
                    return resolve({
                        error: true,
                        message: "Tham số collection không hợp lệ",
                        keyError: "params_collection_invalid",
                        status: 400
                    })
                }

                if(!checkObjectIDs([projectID])) {
                    return resolve({
                        error: true,
                        message: "Tham số projectID không hợp lệ",
                        keyError: "params_projectID_invalid",
                        status: 400
                    })
                }

                if(!checkObjectIDs([companyID])) {
                    return resolve({
                        error: true,
                        message: "Tham số companyID không hợp lệ",
                        keyError: "params_companyID_invalid",
                        status: 400
                    })
                }

                const checkSignature = await ITEM__SIGNATURE_COLL
                    .findOne({
                        "coll.kind": coll.kind,
                        "coll.item": coll.item,
                        project: projectID,
                        company: companyID,
                        author: authorID
                    })
                    .lean();

                if(checkSignature) {
                    return resolve({
                        error: true,
                        message: "Chữ ký đã tồn tại",
                        keyError: "signature_is_exists",
                        status: 403
                    })
                }

                title && (dataInsert.title = title);
                note  && (dataInsert.note  = note);

                const infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert) {
                    return resolve({
                        error: true,
                        message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục",
                        keyError: "error_occurred",
                        status: 422
                    })
                }

                return resolve({ error: false, data: infoAfterInsert, status: 201 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Func: Get info signature
     * Dev: MinhVH
     * Date: 25/03/2022
     */
    getInfo({ signatureID, select, populates }) {
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs([signatureID])) {
                    return resolve({
                        error: true,
                        message: "Tham số signatureID không hợp lệ",
                        keyError: "params_signatureID_invalid",
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

                let infoAterGet = await ITEM__SIGNATURE_COLL
                    .findById(signatureID)
                    .select(select)
                    .populate(populates)
                    .lean();

                if(!infoAterGet) {
                    return resolve({
                        error: true,
                        message: "Chữ ký không tồn tại",
                        keyError: "signature_not_exists",
                        status: 400
                    })
                }

                return resolve({ error: false, data: infoAterGet, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

   /**
     * Func: Get list signature
     * Dev: MinhVH
     * Date: 25/03/2022
     */
    getList({ companyID, projectID, authorID, keyword, limit = 10, lastestID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if(!isNaN(limit) || +limit > 20){
                    limit = 20;
                } else{
                    limit = +limit;
                }

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let conditionObj = {};
                let keys	 = ['createAt__-1', '_id__-1'];
                let sortBy;

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
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

                if(!checkObjectIDs([authorID])) {
                    return resolve({
                        error: true,
                        message: "Tham số authorID không hợp lệ",
                        keyError: "params_authorID_invalid",
                        status: 400
                    })
                }

                if(companyID) {
                    if(!checkObjectIDs([companyID])) {
                        return resolve({
                            error: true,
                            message: "Tham số companyID không hợp lệ",
                            keyError: "params_companyID_invalid",
                            status: 400
                        })
                    }

                    conditionObj.company = companyID;
                }

                if(projectID) {
                    if(!checkObjectIDs([projectID])) {
                        return resolve({
                            error: true,
                            message: "Tham số projectID không hợp lệ",
                            keyError: "params_projectID_invalid",
                            status: 400
                        })
                    }

                    conditionObj.project = projectID;
                }

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */
                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj.title = new RegExp(keyword, 'i');
                }

                let conditionObjOrg = { ...conditionObj }

				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await ITEM__SIGNATURE_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastest", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });

					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });
                    conditionObj = dataPagingAndSort.data.find;
					sortBy = dataPagingAndSort.data.sort;
				} else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
					sortBy = dataPagingAndSort.data.sort;
                }

                let infoDataAfterGet = await ITEM__SIGNATURE_COLL
                    .find(conditionObj)
                    .limit(limit+1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                let totalRecord = await ITEM__SIGNATURE_COLL.count(conditionObjOrg);
                let nextCursor	= null;

                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                return resolve({ error: false, data: {
                    listRecords: infoDataAfterGet,
                    limit,
                    totalRecord,
                    nextCursor,
                }, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model;
