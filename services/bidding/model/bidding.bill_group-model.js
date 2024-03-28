"use strict";

/**
 * EXTERNAL PACKAGE
 */
 const ObjectID                                 = require('mongoose').Types.ObjectId;

 /**
  * CONSTANTS
  */
const { CF_DOMAIN_SERVICES } 				    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_AUTH } 		                = require('../../auth/helper/auth.actions-constant');
const { CF_ACTIONS_ITEM } 					    = require('../../item/helper/item.actions-constant');
 
 /**
  * TOOLS
  */
const BaseModel                                 = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString, _isValid }= require('../../../tools/utils/utils');
const { RANGE_BASE_PAGINATION_V2 }              = require('../../../tools/cursor_base/playground/index');
const { KEY_ERROR }                             = require('../../../tools/keys/index')
 
 /**
  * COLLECTIONS
  */
const BIDDING__DOC_COLL                         = require('../database/bidding.doc-coll');
const BIDDING__BILL_ITEM_COLL                   = require('../database/bidding.bill_item-coll');
const BIDDING__BILL_GROUP_COLL                  = require('../database/bidding.bill_group-coll');
const BIDDING__BILL_WORK_COLL                   = require('../database/bidding.bill_work-coll');
const BIDDING__BILL_WORKLINE_COLL               = require('../database/bidding.bill_workline-coll');
const BIDDING__BILL_PRODUCT_COLL                = require('../database/bidding.bill_product-coll');
const BIDDING__QUOTATION_COLL                   = require('../database/bidding.quotation-coll');
 
 /**
  * MODELS
  */

class Model extends BaseModel {
    constructor() {
        super(BIDDING__BILL_GROUP_COLL);
    }

    /**
     * Name: insert 
     * Author: Hiepnh
     * Date: 01/5/2022
     */
    insert({
        userID, itemID, name, sign, unit, description, note, quantity, unitprice, amount
    }) {
        return new Promise(async (resolve) => {
            try {
                if(!name || !checkObjectIDs(userID) || !checkObjectIDs(itemID))
                    return resolve({ error: true, message: 'Request params name|userID|itemID invalid', status: 400 })

                let infoItem = await BIDDING__BILL_ITEM_COLL.findById(itemID);
                if(!infoItem)
                    return resolve({ error: true, message: "infoItem không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID, status: 400 });

                let dataInsert = { 
                    userCreate: userID, 
                    area: infoItem.area, 
                    client: infoItem.client, 
                    project: infoItem.project, 
                    doc: infoItem.doc,
                    item: itemID,
                    name
                };

                if(sign){
                    dataInsert.sign = sign;
                }

                if(unit){
                    dataInsert.unit = unit;
                }

                if(description){
                    dataInsert.description = description;
                }

                if(note){
                    dataInsert.note = note;
                }

                if(!isNaN(quantity) && Number(quantity) >= 0){
                    dataInsert.quantity = quantity;
                }

                if(!isNaN(amount) && Number(amount) >= 0){
                    dataInsert.amount = amount;

                    if(quantity != 0){
                        dataInsert.unitprice = Number(amount)/Number(quantity)
                    }else{
                        dataInsert.unitprice = 0
                    }
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: "Thêm thất bại", keyError: KEY_ERROR.INSERT_FAILED, status: 403 });

                return resolve({ error: false, data: infoAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Update 
     * Author: Hiepnh
     * Date:  01/5/2022
     */
    update({
        groupID, userID, name, sign, unit, description, note, quantity, unitprice, amount, ctx
    }){
        return new Promise(async (resolve) => {
            try {

                if(!checkObjectIDs(groupID))
                    return resolve({ error: true, message: "Mã hiệu không đúng", keyError: "groupID_invalid", status: 400 });

                let dataUpdate = { 
                    userUpdate: userID,
                    modifyAt: Date.now(),
                    name
                };

                if(sign){
                    dataUpdate.sign = sign;
                }

                if(unit){
                    dataUpdate.unit = unit;
                }

                if(description){
                    dataUpdate.description = description;
                }

                if(note){
                    dataUpdate.note = note;
                }

                if(!isNaN(quantity) && Number(quantity) >= 0){
                    dataUpdate.quantity = quantity;
                }

                if(!isNaN(amount) && Number(amount) >= 0){
                    dataUpdate.amount = amount;

                    if(quantity != 0){
                        dataUpdate.unitprice = Number(amount)/Number(quantity)
                    }else{
                        dataUpdate.unitprice = 0
                    }
                }

                let infoAfterUpdate = await BIDDING__BILL_GROUP_COLL.findByIdAndUpdate(groupID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: "can't_update_budget_item", status: 403 });

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Remove 
     * Author: Hiepnh
     * Date:  01/5/2022
     */

    /**
     * Name: Get info 
     * Author: Hiepnh
     * Date:  01/5/2022
     */
    getInfo({ groupID,
        select, populates }){
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(groupID))
                    return resolve({ error: true, message: 'param_invalid' });

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

                let info = await BIDDING__BILL_GROUP_COLL.findById(groupID)
                                .select(select)
                                .populate(populates)

				if (!info) return resolve({ error: true, message: 'cannot_get' });

                return resolve({ error: false, data: info });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name  : Get list
     * Author: Hiepnh
     * Date:  01/5/2022
     */
    getList({ itemID, userID,
        keyword, limit = 10, lastestID, select, populates= {} }) {
        return new Promise(async (resolve) => {
            try {

                if(limit > 20){
                    limit = 20
                }else{
                    limit = +limit;
                }

                /**
                 * DECALARTION VARIABLE (1)
                 */
                 let sortBy;
                 let conditionObj = {};
                 let keys	     = ['createAt__-1', '_id__-1'];

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */

                // POPULATE
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
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */
                if(itemID && checkObjectIDs(itemID)){
                    conditionObj.doc = itemID;
                }

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    let regExpSearch = RegExp(keyword, 'i');
                    conditionObj.name = regExpSearch;
                }
                
                let conditionObjOrg = { ...conditionObj };

                // PHÂN TRANG KIỂU MỚI
                if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await BIDDING__BILL_GROUP_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastest", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj = dataPagingAndSort.data.find;
					sortBy       = dataPagingAndSort.data.sort;
				}else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy       = dataPagingAndSort.data.sort;
                }

                let infoDataAfterGet = await BIDDING__BILL_GROUP_COLL.find(conditionObj)
                    .limit(limit+1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                // GET TOTAL RECORD
                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data", status: 403 });

                let nextCursor	= null;
                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await BIDDING__BILL_GROUP_COLL.count(conditionObjOrg);
                let totalPage   = Math.ceil(totalRecord/limit);

                return resolve({ error: false, data: {
                    listRecords: infoDataAfterGet,
                    limit: +limit,
                    totalRecord,
                    totalPage,
                    nextCursor,
                }, status: 200 });

            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name  : Cập nhật giá trị
     * Author: Hiepnh
     * Date  : 02/5/2022
     */
    updateValue({
        option, groupID, userID, ctx
    }){
        return new Promise(async (resolve) => {
            try {
                let info = await BIDDING__BILL_GROUP_COLL.findById(groupID)
                if(!info)
                    return resolve({ error: true, message: "info không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID, status: 400 });

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { 
                    userUpdate: userID 
                };

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                // Cập nhật Theo thay đổi của công việc
                if(option && Number(option) === 1){
                    let listDataWork = await BIDDING__BILL_WORK_COLL.aggregate([
                        {
                            $match: {
                                group: ObjectID(groupID),
                            }
                        },
                        {
                            $group: {
                                _id: { },
                                amount: { $sum: "$amount" },
                            }
                        },
                    ])
                    console.log(listDataWork)

                    if(listDataWork && listDataWork.length){
                        dataUpdate.amount = Number(listDataWork[0].amount)

                        if(info.quantity != 0){
                            dataUpdate.unitprice = Number(listDataWork[0].amount)/Number(info.quantity)
                        }else{
                            dataUpdate.unitprice = 0
                        }
                    }
                }

                let infoAfterUpdate = await BIDDING__BILL_GROUP_COLL.findByIdAndUpdate(groupID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: "can't_update_contract_ipc", status: 403 });

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model;