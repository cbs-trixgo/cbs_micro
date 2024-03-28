"use strict";
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, checkNumberIsValidWithRange, checkNumberValid, IsJsonString }                        
                                        = require('../../../tools/utils/utils');
const stringUtils					    = require('../../../tools/utils/string_utils');
const { setTimeZone  }                  = require('../../../tools/utils/time_utils');

const { getCurrentPage }			    = require('../../../tools/utils/calculate_current_page');
const ObjectID                          = require('mongoose').Types.ObjectId;
const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_ITEM } 		        = require('../../item/helper/item.actions-constant');
const { KEY_ERROR }                     = require('../../../tools/keys/index')

/**
 * import inter-coll, exter-coll
 */
const CMCS__CONTRACT_PRODUCTION_COLL    = require('../database/cmcs.contract_production-coll');
const CMCS__CONTRACT_PAYMENT_COLL       = require('../database/cmcs.contract_payment-coll');
const CMCS__CONTRACT_BILL_ITEM_COLL     = require('../database/cmcs.contract_bill_item-coll');
const CMCS__CONTRACT_BILL_GROUP_COLL    = require('../database/cmcs.contract_bill_group-coll');
const CMCS__CONTRACT_BILL_JOB_COLL      = require('../database/cmcs.contract_bill_job-coll');
const CMCS__CONTRACT_IPC_DETAIL_COLL    = require('../database/cmcs.contract_ipc_detail-coll');

const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');
const { template }                      = require('lodash');
const { ResumeToken }                   = require('mongodb');

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {               
    constructor() {
        super(CMCS__CONTRACT_BILL_GROUP_COLL);
    }
    
    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 12/9/2022
     */
    insert({ itemID, name, sign, description, unit, quantity, note, userID, ctx  }) { 
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 */

                if(!name || !checkObjectIDs(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                const infoItem = await CMCS__CONTRACT_BILL_ITEM_COLL.findById(itemID)
                console.log(infoItem)

                if(!infoItem)
                    return resolve({ error: true, message: "Mã không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID });

                const { company, project, contract } = infoItem;

                let dataInsert = { userCreate: userID, company, project, contract, item: itemID, name };
                
                if(sign){
                    dataInsert.sign = sign;
                }

                if(description){
                    dataInsert.description = description;
                }

                if(unit){
                    dataInsert.unit = unit;
                }

                if(quantity && !isNaN(quantity)){
                    dataInsert.quantity = Number(quantity);
                }

                if(note){
                    dataInsert.note = note;
                }
                
                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: "Không thể thêm mẩu tin" ,keyError: "can't_insert" });

                return resolve({ error: false, data: infoAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Update
     * Author: HiepNH
     * Code: 12/9/2022
     */
    update({ 
        groupID, name, sign, description, unit, quantity, note, userID, ctx
    }){
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 */

                if(!name || !checkObjectIDs(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                let dataUpdate = { userUpdate: userID, name, modifyAt: Date.now() };

                if(!checkObjectIDs(groupID))
                    return resolve({ error: true, message: "Mã không hợp kệ", keyError: "id_invalid" })

                if(sign){
                    dataUpdate.sign = sign;
                }

                if(description){
                    dataUpdate.description = description;
                }

                if(unit){
                    dataUpdate.unit = unit;
                }

                if(quantity && !isNaN(quantity)){
                    dataUpdate.quantity = Number(quantity);
                }

                if(note){
                    dataUpdate.note = note;
                }

                let infoAfterUpdate = await CMCS__CONTRACT_BILL_GROUP_COLL.findByIdAndUpdate(groupID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại" ,keyError: "can't_update", status: 403 });

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                console.log(error)   
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Update value
     * Author: HiepNH
     * Code: 12/9/2022
     */
    updateValue({ 
        option, groupID, userID
    }){ 
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Cập nhật giá trị hợp đồng
                 * 2-Cập nhật giá trị nghiệm thu (tổng lũy kế)
                 */

                if(!checkObjectIDs(groupID))
                    return resolve({ error: true, message: "Mã hiệu không đúng", keyError: "id_invalid" })

                let dataUpdate = { userUpdate: userID, modifyAt: Date.now() };

                //_____CẬP NHẬT GIÁ TRỊ HỢP ĐỒNG CỦA GROUP
                if(option && Number(option) === 1){
                    let listData = await CMCS__CONTRACT_BILL_JOB_COLL.aggregate([
                        {
                            $match: {
                                group: ObjectID(groupID),
                            }
                        }, 
                        {
                            $group: {
                                _id: { },
                                // totalAmount: { $sum: "$currentUnitPrice" },
                                totalAmount: { $sum: { $multiply: [ "$currentQuantity", "$currentUnitPrice" ] } },
                            }
                        }, 
                    ])

                    console.log(listData)

                    if(listData && listData.length){
                        dataUpdate.currentAmount = Number(listData[0].totalAmount)
                    }
                }

                //_____CẬP NHẬT GIÁ TRỊ NGHIỆM THU HOÀN THÀNH
                if(option && Number(option) === 2){
                    let listData = await CMCS__CONTRACT_IPC_DETAIL_COLL.aggregate([
                        {
                            $match: {
                                group: ObjectID(groupID),
                            }
                        }, 
                        {
                            $group: {
                                _id: { },
                                totalAmount: { $sum: "$amount" },
                                // totalAmount: { $sum: { $multiply: [ "$planQuantity", "$planUnitPrice" ] } },
                            }
                        }, 
                    ])
                    // console.log(listData)

                    if(listData && listData.length){
                        dataUpdate.inspecAmount = Number(listData[0].totalAmount)
                    }
                } 

                let infoAfterUpdate = await CMCS__CONTRACT_BILL_GROUP_COLL.findByIdAndUpdate(groupID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: "can't_update", status: 403 });

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Remove
     * Author: HiepNH
     * Code: 13/9/2022
     */
    
    /**
     * Name: Getinfo
     * Author: HiepNH
     * Code: 13/9/2022
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

                let infoContractIPC = await CMCS__CONTRACT_BILL_GROUP_COLL.findById(groupID)
                                .select(select)
                                .populate(populates)

				if (!infoContractIPC) return resolve({ error: true, message: 'cannot_get' });

                return resolve({ error: false, data: infoContractIPC });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name  : Getlist
     * Author: HiepNH
     * Code: 13/9/2022
     */
    getList({ itemID, userID,
        keyword, limit = 10, lastestID, select, populates= {} }) { 
            console.log({itemID, userID,
                keyword, limit, lastestID, select, populates})
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

                if(itemID && checkObjectIDs(itemID)){
                    conditionObj.item = ObjectID(itemID)
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
					let infoData = await CMCS__CONTRACT_BILL_GROUP_COLL.findById(lastestID);
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
                
                let infoDataAfterGet = await CMCS__CONTRACT_BILL_GROUP_COLL.find(conditionObj)
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

                let totalRecord = await CMCS__CONTRACT_BILL_GROUP_COLL.count(conditionObjOrg);
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
}

exports.MODEL = new Model;