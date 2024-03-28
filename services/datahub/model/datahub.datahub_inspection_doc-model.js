"use strict";

/**
 * EXTERNAL PACKAGE
 */
const stringUtils						 = require('../../../tools/utils/string_utils');
const ObjectID                           = require('mongoose').Types.ObjectId;
const { KEY_ERROR }                      = require('../../../tools/keys/index');

/**
 * CONSTANTS
 */

/**
 * TOOLS
 */
const BaseModel                                 	= require('../../../tools/db/base_model');
const { RANGE_BASE_PAGINATION_V2 } 					= require('../../../tools/cursor_base/playground/index');
const {
    checkObjectIDs,
    IsJsonString,
} = require('../../../tools/utils/utils');

/**
 * COLLECTIONS
 */
const DATAHUB_INSPECTION_DOC_COLL           				= require('../database/datahub_inspection_doc-coll');

class Model extends BaseModel {

    constructor() {
        super(DATAHUB_INSPECTION_DOC_COLL);
    }

    /**
	 * Name:Insert
	 * Author: Depv
	 * Code: 26/10/2021
	 */
    insert({ type, name, sign, description, userID }) {
        return new Promise(async resolve => {
            try { 
                if(!name)
                    return resolve({ error: true, message: "Tên datahub inspection không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID });
                
                if(!type)
                    return resolve({ error: true, message: "Loại datahub inspection không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID });

                let dataInsert = { type, name, userCreate: userID };

                if(sign){
                    let checkSign = await DATAHUB_INSPECTION_DOC_COLL.findOne({ sign });
                    if(checkSign)
                        return resolve({ error: true, message: "Mã hiệu đã tồn tại", keyError: KEY_ERROR.ITEM_EXISTED });
                    dataInsert.sign = sign;
                }

                if(description){
                    dataInsert.description = description;
                }
              
                let infoAfterInsert = await this.insertData(dataInsert);
                if (!infoAfterInsert) 
                    return resolve({ error: true, message: "Tạo mới thất bại", keyError: KEY_ERROR.INSERT_FAILED });
                
                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
	 * Name: Update
	 * Author: Depv
	 * Code: 26/10/2021
	 */
    update({ inspectionDocID, name, sign, description, userID }) {
        return new Promise(async resolve => {
            try {
                
                let dataUpdate = { userUpdate: userID };

                if(name){
                    dataUpdate.name = name;
                }

                if(sign){
                    let checkSign = await DATAHUB_INSPECTION_DOC_COLL.findOne({ _id: { $ne: inspectionDocID }, sign });
                    if(checkSign)
                        return resolve({ error: true, message: "Mã hiệu đã tồn tại", keyError: KEY_ERROR.ITEM_EXISTED });
                    dataUpdate.sign = sign;
                }

                if(description){
                    dataUpdate.description = description;
                }

                let infoAfterUpdate = await DATAHUB_INSPECTION_DOC_COLL.findByIdAndUpdate(inspectionDocID, dataUpdate, { new: true });
                if (!infoAfterUpdate) 
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: 'cannot_update' });
                
                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
	 * Name: Remove
	 * Author: Depv
	 * Code: 26/10/2021
	 */
	// remove({ inspectionDocID }) { 
    //     return new Promise(async (resolve) => {
    //         try {
    //             if(!checkObjectIDs(inspectionDocID))
    //                 return resolve({ error: true, message: 'Mã datahub không hợp lệ', keyError: "inspectionDocID_invalid", status: 400 });
                
    //             let infoAterRemove = await DATAHUB_INSPECTION_DOC_COLL.findByIdAndDelete(inspectionDocID)
    //             if(!infoAterRemove)
    //                 return resolve({ error: true, message: "Xoá thất bại", keyError: "remove_failed", status: 403 });
 
    //             return resolve({ error: false, data: infoAterRemove, status: 200 });
    //         } catch (error) {               
    //             return resolve({ error: true, message: error.message, status: 500 });
    //         }
    //     })
    // }

	/**
	 * Name: GetInfo 
	 * Author: Depv
	 * Code: 26/10/2021
	 */
	getInfo({ inspectionDocID, select, populates }) { 
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                /** 
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if(!checkObjectIDs(inspectionDocID))
                    return resolve({ error: true, message: 'Request params inspectionDocID invalid', status: 400 });
                
                 // populates
                 if(populates && typeof populates === 'string'){
					if(!IsJsonString(populates))
						return resolve({ error: true, message: 'Request params populates invalid', status: 400 });

					populates = JSON.parse(populates);
				}else{
                    populates = {
                        path: "",
                        select: ""
                    }
                }
                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAterGet = await DATAHUB_INSPECTION_DOC_COLL.findById(inspectionDocID)
                                    .select(select)
                                    .populate(populates)
                if(!infoAterGet)
                    return resolve({ error: true, message: "can't_get_info", status: 403 });
 
                return resolve({ error: false, data: infoAterGet, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
	 * Dev: HiepNH
	 * Func: Getlist
	 * Date: 26/10/2021
	 */
    getList({ type, userID, lastestID, keyword, limit = 10, select, populates = {}}){
        return new Promise(async resolve => {
            try {
                let conditionObj = {};
                let sortBy; 
                let keys	     = ['createAt__-1', '_id__-1'];

                if(limit > 20){
                    limit = 20;
                }else{
                    limit = +limit
                }

                if(type){
                    conditionObj.type = type;
                }

				if(!checkObjectIDs(userID))
                    return resolve({ error: true, message: 'Request params userID invalid', status: 400 });

				if(populates && typeof populates === 'string'){
					if(!IsJsonString(populates))
						return resolve({ error: true, message: 'Request params populates invalid', status: 400 });

					populates = JSON.parse(populates);
				}else{
					populates = {
						path: "",
						select: ""
					}
				}
                // SEARCH TEXT
                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    let regSearch = new RegExp(keyword, 'i');
                    conditionObj.name = regSearch;
                }

                let conditionObjOrg = { ...conditionObj };
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await DATAHUB_INSPECTION_DOC_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastestID", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
                    if(!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({ error: true, message: "Can't get range pagination", status: 400 });
                    conditionObj  = dataPagingAndSort.data.find;
                    sortBy        = dataPagingAndSort.data.sort;
                }else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy        = dataPagingAndSort.data.sort;
                }

                let listPackages = await DATAHUB_INSPECTION_DOC_COLL
					.find(conditionObj)
					.limit(limit + 1)
					.select(select)
					.populate(populates)
                    .sort(sortBy)
					.lean();

				// GET TOTAL RECORD
                let totalRecord = await DATAHUB_INSPECTION_DOC_COLL.count(conditionObjOrg);
                let totalPage   = Math.ceil(totalRecord/limit);
				let nextCursor	= null;

				if(listPackages && listPackages.length){
					if(listPackages.length > limit){
						nextCursor = listPackages[limit - 1]._id;
						listPackages.length = limit;
					}
				}

                return resolve({
					error: false,
					status: 200,
					data: {
						listRecords: listPackages,
						limit: +limit,
						totalRecord,
                        totalPage,
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