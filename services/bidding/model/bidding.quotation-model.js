"use strict";

const BaseModel = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils');
const ObjectID = require('mongoose').Types.ObjectId;

const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_AUTH } 		        = require('../../auth/helper/auth.actions-constant');

/**
 * import inter-coll, exter-coll
 */
const BIDDING__QUOTATION_COLL = require('../database/bidding.quotation-coll');

const { RANGE_BASE_PAGINATION_V2 } = require('../../../tools/cursor_base/playground/index');
const { KEY_ERROR } = require('../../../tools/keys/index');

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
    constructor() {
        super(BIDDING__QUOTATION_COLL);
    }

    /**
     * Name: Insert 
     * Author: Hiepnh
     * Date: 28/4/2022
     */
    insert({ companyID, userID, parentID, accountID, customerID, contractID, name, sign, note, date, income, expense, arising, openingBalance, closingBalance }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                let dataInsert = { userCreate: userID, company: companyID, admins: [userID], members: [userID] };

                if (checkObjectIDs(parentID)) {
                    dataInsert.parent = parentID;
                }

                if (checkObjectIDs(accountID)) {
                    dataInsert.account = accountID;
                }

                if (checkObjectIDs(customerID)) {
                    dataInsert.customer = customerID;
                }

                if (checkObjectIDs(contractID)) {
                    dataInsert.contract = contractID;
                }

                if (name) {
                    dataInsert.name = name;
                }

                if (date) {
                    dataInsert.date = date;
                }

                if (sign) {
                    dataInsert.sign = sign;
                }

                if (note) {
                    dataInsert.note = note;
                }

                if (!isNaN(arising) && Number(arising) >= 0) {
                    dataInsert.arising = arising;
                }

                if (!isNaN(openingBalance) && Number(openingBalance) >= 0) {
                    dataInsert.openingBalance = openingBalance;
                }

                if (!isNaN(closingBalance) && Number(closingBalance) >= 0) {
                    dataInsert.closingBalance = closingBalance;
                }

                if (!isNaN(income) && Number(income) >= 0) {
                    dataInsert.income = income;
                }

                if (!isNaN(expense) && Number(expense) >= 0) {
                    dataInsert.expense = expense;
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if (!infoAfterInsert)
                    return resolve({ error: true, message: "Thêm thất bại", keyError: KEY_ERROR.INSERT_FAILED, status: 403 });

                // Cập nhật lại phần tử cha
                if(checkObjectIDs(parentID)){
                    await that.updateValue({cashBookID: parentID, userID})
                }

                return resolve({ error: false, data: infoAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Update 
     * Author: Hiepnh
     * Date: 28/4/2022
     */
    update({ cashBookID, accountID, customerID, contractID, name, sign, note, date, income, expense, active, userID }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { userUpdate: userID };

                if (!checkObjectIDs(cashBookID))
                    return resolve({ error: true, message: "Mã không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID })

                if (checkObjectIDs(accountID)) {
                    dataUpdate.account = accountID;
                }

                if (checkObjectIDs(customerID)) {
                    dataUpdate.customer = customerID;
                }

                if (checkObjectIDs(contractID)) {
                    dataUpdate.contract = contractID;
                }

                if (name) {
                    dataUpdate.name = name;
                }

                if (date) {
                    dataUpdate.date = date;
                }

                if (sign) {
                    dataUpdate.sign = sign;
                }

                if (note) {
                    dataUpdate.note = note;
                }

                if (income >= 0) {
                    dataUpdate.income = income;
                }

                if (expense >= 0) {
                    dataUpdate.expense = expense;
                }

                if (!isNaN(active) && Number(active) > 0) {
                    dataUpdate.active = active;
                }

                let infoAfterUpdate = await BIDDING__QUOTATION_COLL.findByIdAndUpdate(cashBookID, dataUpdate, { new: true });
                if (!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: KEY_ERROR.UPDATE_FAILED, status: 403 });

                // Cập nhật lại phần tử cha
                if(checkObjectIDs(infoAfterUpdate.parent)){
                    await that.updateValue({cashBookID: infoAfterUpdate.parent, userID})
                }

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Remove
     * Author: Hiepnh
     * Date: 28/4/2022
     */

    /**
     * Name: Get info 
     * Author: Hiepnh
     * Date: 28/4/2022
     */
    getInfo({ cashBookID, select, populates }) {
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(cashBookID))
                    return resolve({ error: true, message: 'param_invalid' });

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({ error: true, message: 'Request params populates invalid', status: 400 });
                    populates = JSON.parse(populates);
                } else {
                    populates = {
                        path: "",
                        select: ""
                    }
                }

                let infoContractIPC = await BIDDING__QUOTATION_COLL.findById(cashBookID)
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
     * Name  : Get list 
     * Author: Hiepnh
     * Date: 28/4/2022
     */
    getList({ outin, userID, companyID, accountID, customerID, contractID, parentID,
        keyword, limit = 50, lastestID, select, populates = {}, sortKey }) {
        return new Promise(async (resolve) => {
            try {
                if (limit > 50) {
                    limit = 50
                } else {
                    limit = +limit;
                }

                /**
                 * DECALARTION VARIABLE (1)
                 */
                // Chỉ hiển thị sổ quỹ mà user là member
                let sortBy;
                let conditionObj = { };
                let keys = ['createAt__-1', '_id__-1'];

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({ error: true, message: 'Request params populates invalid', status: 400 });

                    populates = JSON.parse(populates);
                } else {
                    populates = {
                        path: "",
                        select: ""
                    }
                }

                if (sortKey && typeof sortKey === 'string') {
                    if (!IsJsonString(sortKey))
                        return resolve({ error: true, message: 'Request params sortKey invalid', status: 400 });

                    keys = JSON.parse(sortKey);
                }

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */
                if (checkObjectIDs(parentID)) {
                    conditionObj.parent = parentID

                    if (checkObjectIDs(accountID)) {
                        conditionObj.account = accountID
                    }
                } else {
                    conditionObj = { members: { $in: [userID] } }  // Lấy theo công ty
                    conditionObj.company = companyID
                    conditionObj.parent = { $exists: false } // Lấy theo công ty
                }

                // Lấy dòng tiền vào ra (có giá trị income > 0)
                if(Number(outin) === 1){
                    conditionObj.income = { $gt: 0 }
                }

                // Lấy dòng tiền vào ra (có giá trị income > 0)
                if(Number(outin) === 2){
                    conditionObj.expense = { $gt: 0 }
                }

                console.log(conditionObj)

                if (keyword) {
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    let regExpSearch = RegExp(keyword, 'i');
                    conditionObj.name = regExpSearch;
                }
                let conditionObjOrg = { ...conditionObj };

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await BIDDING__QUOTATION_COLL.findById(lastestID);
                    if (!infoData)
                        return resolve({ error: true, message: "Can't get info lastest", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
                    if (!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj = dataPagingAndSort.data.find;
                    sortBy = dataPagingAndSort.data.sort;
                } else {
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy = dataPagingAndSort.data.sort;
                }

                let infoDataAfterGet = await BIDDING__QUOTATION_COLL.find(conditionObj)
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                // GET TOTAL RECORD
                if (!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data", status: 403 });

                let nextCursor = null;
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await BIDDING__QUOTATION_COLL.count(conditionObjOrg);
                let totalPage = Math.ceil(totalRecord / limit);

                return resolve({
                    error: false, data: {
                        listRecords: infoDataAfterGet,
                        limit: +limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    }, status: 200
                });

            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model;