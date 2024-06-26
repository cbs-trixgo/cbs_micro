"use strict";
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }
                                        = require('../../../tools/utils/utils');
const stringUtils					    = require('../../../tools/utils/string_utils');
const { setTimeZone  }                  = require('../../../tools/utils/time_utils');

const { getCurrentPage }			    = require('../../../tools/utils/calculate_current_page');
const ObjectID                          = require('mongoose').Types.ObjectId;
const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_BUDGET } 		    = require('../../budget/helper/budget.actions-constant');
const { CF_ACTIONS_ACCOUNTING } 		= require('../../accounting/helper/accounting.actions-constant');

/**
 * import inter-coll, exter-coll
 */
 const BUDGET_COLL                       = require('../database/budget-coll');
 const BUDGET__ITEM_COLL                 = require('../database/budget.item-coll');
 const BUDGET__GROUP_COLL                = require('../database/budget.group-coll');
 const BUDGET__WORK_COLL                 = require('../database/budget.work-coll');

const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');
const { template }                      = require('lodash');
const { ResumeToken }                   = require('mongodb');

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
    constructor() {
        super(BUDGET__GROUP_COLL);
    }

    /**
     * Name: Insert 
     * Author: Hiepnh
     * Date: 10/4/2022
     */
    insert({ userID, itemID, plus, reasonID, name, sign, unit, unitPrice, forecastAmount, forecastQuantity, description, note, type, quantity }) {
        return new Promise(async (resolve) => {
            try {

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let infoItem = await BUDGET__ITEM_COLL.findById(itemID);
                if(!infoItem)
                    return resolve({ error: true, message: "Item không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID });

                let dataInsert = { userCreate: userID, company: infoItem.company, budget: infoItem.budget, item: itemID };

                if(checkObjectIDs(infoItem.project)){
                    dataInsert.project = infoItem.project
                }

                if(checkObjectIDs(infoItem.contract)){
                    dataInsert.contract = infoItem.contract
                }

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if(checkObjectIDs(reasonID)){
                    dataInsert.reason = reasonID
                }

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                if(plus && [0,1,2].includes(Number(plus))){
                    dataInsert.plus = plus;
                }

                if(name){
                    dataInsert.name = name;
                }

                if(sign){
                    dataInsert.sign = sign;
                }

                if(unit){
                    dataInsert.unit = unit;
                }

                if(!isNaN(type) && Number(type) >= 0){
                    dataInsert.type     = type;
                }

                if(unitPrice){
                    dataInsert.unitPrice = unitPrice;
                }

                if(!isNaN(forecastAmount) && +forecastAmount >= 0){
                    dataInsert.forecastAmount = forecastAmount;
                }

                if(!isNaN(forecastQuantity) && +forecastQuantity >= 0){
                    dataInsert.forecastQuantity = forecastQuantity;
                }

                //______Giá trị
                if(!isNaN(quantity) && Number(quantity) >= 0){
                    dataInsert.quantity     = quantity;
                }

                if(description){
                    dataInsert.description = description;
                }

                if(note){
                    dataInsert.note = note;
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: "Không thể thêm contract ipc" ,keyError: "can't_insert_budget_group" });

                return resolve({ error: false, data: infoAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Update 
     * Author: Hiepnh
     * Date: 10/4/2022
     */
    update({
        groupID, plus, reasonID, name, sign, unit, unitPrice, forecastAmount, forecastQuantity, description, note, type, quantity, userID
    }){
        return new Promise(async (resolve) => {
            try {

                if(!checkObjectIDs(groupID))
                    return resolve({ error: true, message: "Mã không đúng", keyError: "groupID_invalid" });

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { userUpdate: userID, modifyAt: new Date() };

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if(checkObjectIDs(reasonID)){
                    dataInsert.reason = reasonID
                }

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                if(plus && [0,1,2].includes(Number(plus))){
                    dataUpdate.plus = plus;
                }

                if(name){
                    dataUpdate.name = name;
                }

                if(sign){
                    dataUpdate.sign = sign;
                }

                if(unit){
                    dataUpdate.unit = unit;
                }

                if(!isNaN(type) && Number(type) >= 0){
                    dataUpdate.type     = type;
                }

                if(unitPrice){
                    dataUpdate.unitPrice = unitPrice;
                }

                if(!isNaN(forecastAmount) && +forecastAmount >= 0){
                    dataUpdate.forecastAmount = forecastAmount;
                }

                if(!isNaN(forecastQuantity) && +forecastQuantity >= 0){
                    dataUpdate.forecastQuantity = forecastQuantity;
                }

                //______Giá trị
                if(!isNaN(quantity) && Number(quantity) >= 0){
                    dataUpdate.quantity     = quantity;
                }

                if(description){
                    dataUpdate.description = description;
                }

                if(note){
                    dataUpdate.note = note;
                }

                let infoAfterUpdate = await BUDGET__GROUP_COLL.findByIdAndUpdate(groupID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: "can't_update_budget_group", status: 403 });

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Get info 
     * Author: Hiepnh
     * Date: 10/4/2022
     */
    getInfo({ groupID, select, populates }){
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(groupID))
                    return resolve({ error: true, message: 'param_invalid' });

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

                let info = await BUDGET__GROUP_COLL.findById(groupID)
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
     * Name  : Danh sách
     * Author: Hiepnh
     * Date  : 10/4/2022
     */
    getList({ itemID, budgetID, userID,
        keyword, limit = 100, lastestID, select, populates= {} }) {
        return new Promise(async (resolve) => {
            try {

                if(limit > 100){
                    limit = 100
                }else{
                    limit = +limit;
                }

                let sortBy;
                let conditionObj = {};
                let keys	     = ['createAt__-1', '_id__-1'];

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
                    conditionObj.item = itemID;
                }
                if(budgetID && checkObjectIDs(budgetID)){
                    conditionObj.budget = budgetID;
                }

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    let regExpSearch = RegExp(keyword, 'i');
                    conditionObj.name = regExpSearch;
                }
                let conditionObjOrg = { ...conditionObj };

                if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await BUDGET__GROUP_COLL.findById(lastestID);
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

                let infoDataAfterGet = await BUDGET__GROUP_COLL.find(conditionObj)
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

                let totalRecord = await BUDGET__GROUP_COLL.count(conditionObjOrg);
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
     * Name  : Cập nhật giá trị (ngân sách, thực hiện, dự báo) 
     * Author: Hiepnh
     * Date  : 10/4/2022
     */
    updateValue({
        option, groupID, userID, ctx
    }){
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Cập nhật giá trị ngân sách
                 * 2-Cập nhật dự báo ngân sách
                 * 3-Cập nhật thực hiện ngân sách
                 */
                if(!checkObjectIDs(groupID))
                    return resolve({ error: true, message: "Mã hiệu không đúng", keyError: "groupID_invalid" });

                let dataUpdate = { userUpdate: userID };

                // Cập nhật Ngân sách theo kế hoạch và dự báo ngân sách
                if(option && Number(option) === 1){
                    let listDataWork = await BUDGET__WORK_COLL.aggregate([
                        {
                            $match: {
                                group: ObjectID(groupID),
                            }
                        },
                        {
                            $group: {
                                _id: { },
                                amount: { $sum: "$amount" },
                                forecastAmount: { $sum: "$forecastAmount" },
                            }
                        },
                    ])
                    if(listDataWork && listDataWork.length){
                        dataUpdate.amount = Number(listDataWork[0].amount)
                        dataUpdate.forecastAmount = Number(listDataWork[0].forecastAmount)
                    }
                }

                // Cập nhật Ngân sách thực hiện
                if(option && Number(option) === 2){
                    const infoImpleBudget = await ctx.call(`${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_CAL_IMPLE_BUDGET}`, {
                        groupID
                    })
                    // console.log(infoImpleBudget)
                    if(infoImpleBudget){
                        dataUpdate.impleQuantity = Number(infoImpleBudget.data.quantity)
                        dataUpdate.impleAmount = Number(infoImpleBudget.data.amount)
                        if(Number(infoImpleBudget.data.quantity) != 0){
                            dataUpdate.impleUnitPrice = Number(infoImpleBudget.data.amount)/Number(infoImpleBudget.data.quantity)
                        }else{
                            dataUpdate.impleUnitPrice = 0
                        }
                    }
                }

                let infoAfterUpdate = await BUDGET__GROUP_COLL.findByIdAndUpdate(groupID, dataUpdate, { new: true });
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