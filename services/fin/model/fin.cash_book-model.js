"use strict";

const BaseModel = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils');
const ObjectID = require('mongoose').Types.ObjectId;

const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_AUTH } 		        = require('../../auth/helper/auth.actions-constant');

const XlsxPopulate                      = require('xlsx-populate');
const fs                                = require('fs');
const path                              = require('path');
const { uploadFileS3 }                  = require('../../../tools/s3');

/**
 * import inter-coll, exter-coll
 */
const USER_COLL                          = require('../../auth/database/auth.user-coll')
const ITEM__DEPARTMENT_COLL              = require('../../item/database/item.department-coll')
const ITEM__POSITION_COLL                = require('../../item/database/item.position-coll')
const FIN__CASH_BOOK_COLL                = require('../database/fin.cash_book-coll');
const ACCOUNT_COLL                       = require('../../item/database/item.account-coll')
const CONTACT_COLL                       = require('../../item/database/item.contact-coll')
const CONTRACT_COLL                      = require('../../item/database/item.contract-coll')
const FINANCIAL_GENERAL_JOURNAL_COLL     = require('../.../../../accounting/database/accounting.financial_general_journal-coll')
const TIMESHEET__EXPERT_TIMESHEET_COLL   = require('../../timesheet/database/timesheet.expert_timesheet-coll')
const TIMESHEET__EXPERT_SALARY_COLL      = require('../../timesheet/database/timesheet.expert_salary-coll')

const { RANGE_BASE_PAGINATION_V2 } = require('../../../tools/cursor_base/playground/index');
const { KEY_ERROR } = require('../../../tools/keys/index');

/**
 * import inter-model, exter-model
 */
const FINANCIAL_GENERAL_JOURNAL_MODEL   = require('../.../../../accounting/model/accounting.financial_general_journal-model').MODEL
const ACCOUNT_MODEL                     = require('../.../../../item/model/item.account-model').MODEL
const AUTH__APP_USER                    = require('../../auth/model/auth.app_users').MODEL
const TIMESHEET__EXPERT_TIMESHEET_MODEL = require('../.../../../timesheet/model/timesheet.expert_timesheet-model').MODEL;
const TIMESHEET__EXPERT_SALARY_MODEL    = require('../.../../../timesheet/model/timesheet.expert_salary-model').MODEL;

class Model extends BaseModel {
    constructor() {
        super(FIN__CASH_BOOK_COLL);
    }

    /**
     * Name: Insert 
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert({ companyID, userID, parentID, accountID, customerID, contractID, name, sign, note, date, income, expense, arising, openingBalance, closingBalance }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                let dataInsert = { userCreate: userID, admins: [userID], members: [userID] };

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

                // Cập nhật company theo company của parent: áp dụng cho user phân vùng khác thêm sửa mẩu tin
                if(checkObjectIDs(parentID)) {
                    const infoParentCashbook = await FIN__CASH_BOOK_COLL
                        .findById(parentID)
                        .select('company')
                        .lean();

                    dataInsert.company = infoParentCashbook.company;
                } else{
                    dataInsert.company = companyID;
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
     * Date: 9/4/2022
     */
    update({ cashBookID, accountID, customerID, contractID, name, sign, note, date, income, expense, active, members, admins, userID }) {
        // console.log({ cashBookID, accountID, customerID, contractID, name, sign, note, date, income, expense, active, members, admins, userID })
        const that = this
        return new Promise(async (resolve) => {
            try {
                let dataUpdate = { userUpdate: userID, modifyAt: new Date() };

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
                }else{
                    dataUpdate.contract = null
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

                if (active && !isNaN(active) && Number(active) > 0) {
                    dataUpdate.active = active;
                }

                const infoCashBook = await FIN__CASH_BOOK_COLL.findById(cashBookID)
                .populate('parent')
                .lean();
                // console.log(infoCashBook)

                if(!infoCashBook) {
                    return resolve({
                        error: true,
                        message: 'Cashbook không tồn tại',
                        keyError: "cashbook_not_exists",
                        status: 400
                    });
                }

                // Cập nhật company theo company của parent: áp dụng cho user phân vùng khác thêm sửa mẩu tin
                if(infoCashBook.parent && infoCashBook.parent.company){
                    dataUpdate.company = infoCashBook.parent.company
                }
                // console.log(dataUpdate)

                const adminsID = [...infoCashBook.admins?.map(item => item.toString()), infoCashBook.userCreate?.toString()];

                if(adminsID.includes(userID.toString())) {
                    if(admins && admins.length) {
                        if(checkObjectIDs(admins)) {
                            admins = [...new Set(admins)];
                            dataUpdate.admins = admins;
                        } else{
                            dataUpdate.admins = [];
                        }
                    }

                    if(members && members.length) {
                        if(checkObjectIDs(members)) {
                            members = [...new Set(members)];
                            dataUpdate.members = members;
                        } else{
                            dataUpdate.members = [];
                        }
                    }
                } else{
                    if(checkObjectIDs(admins)) {
                        return resolve({
                            error: true,
                            message: 'Bạn không có quyền chia sẻ',
                            keyError: "permission_denined",
                            status: 403
                        });
                    }

                    if(checkObjectIDs(members)) {
                        return resolve({
                            error: true,
                            message: 'Bạn không có quyền chia sẻ',
                            keyError: "permission_denined",
                            status: 403
                        });
                    }
                }

                let infoAfterUpdate = await FIN__CASH_BOOK_COLL.findByIdAndUpdate(cashBookID, dataUpdate, { new: true });
                if (!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: KEY_ERROR.UPDATE_FAILED, status: 403 });

                // Cập nhật lại phần tử cha
                if(checkObjectIDs(infoAfterUpdate.parent)){
                    await that.updateValue({cashBookID: infoAfterUpdate.parent, userID})
                }

                // Cập nhật lại trạng thái các phần tử con
                if(!infoAfterUpdate.parent){
                    if (active && !isNaN(active) && Number(active) > 0) {
                        await FIN__CASH_BOOK_COLL.updateMany(
                            { 
                                parent: ObjectID(cashBookID),
                            },
                            { $set: { "active" : Number(active)} }
                        )
                    }
                }

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name  : Cập nhật giá trị khi chi tiết thay đổi 
     * Code: Hiepnh
     * Date  : 14/4/2022
     */
    updateValue({
        cashBookID, userID
    }){
        return new Promise(async (resolve) => {
            try {
                if(!checkObjectIDs(cashBookID))
                    return resolve({ error: true, message: "Mã hiệu không đúng", keyError: "cashBookID_invalid" })
                let infoCashBook = await FIN__CASH_BOOK_COLL.findById(cashBookID)

                let dataUpdate = { userUpdate: userID };

                let listData = await FIN__CASH_BOOK_COLL.aggregate([
                    {
                        $match: {
                            parent: ObjectID(cashBookID),
                        }
                    },
                    {
                        $group: {
                            _id: { },
                            income: { $sum: "$income" },
                            expense: { $sum: "$expense" },
                        }
                    },
                ])
                if(listData && listData.length){

                    let arising = Number(listData[0].income) - Number(listData[0].expense)
                    let closingBalance = Number(infoCashBook.openingBalance) + Number(arising)

                    dataUpdate.arising = Number(arising)
                    dataUpdate.closingBalance = Number(closingBalance)
                    dataUpdate.income = Number(listData[0].income)
                    dataUpdate.expense = Number(listData[0].expense)
                }

                let infoAfterUpdate = await FIN__CASH_BOOK_COLL.findByIdAndUpdate(cashBookID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: "can't_update_budget", status: 403 });

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Get info 
     * Author: Hiepnh
     * Date: 9/4/2022
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

                let infoContractIPC = await FIN__CASH_BOOK_COLL.findById(cashBookID)
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
     * Date: 9/4/2022
     */
    getList({ outin, userID, companyID, accountID, parentID, companyOfUser,
        keyword, limit = 30, lastestID, select, populates = {}, sortKey, isCompanyOther }) {
        return new Promise(async (resolve) => {
            try {
                let sortBy;
                let conditionObj = {};
                let keys = ['createAt__-1', '_id__-1'];

                if (limit > 30) {
                    limit = 30
                } else {
                    limit = +limit;
                }

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

                if (checkObjectIDs(parentID)) {
                    conditionObj.parent = parentID;

                    if (checkObjectIDs(accountID)) {
                        conditionObj.account = accountID;
                    }
                } else {
                    // Chỉ hiển thị sổ quỹ mà user là member
                    conditionObj = { members: { $in: [userID] } }  // Lấy theo công ty
                    conditionObj.parent = { $exists: false } // Lấy theo công ty

                    // Lấy sổ quỹ khác (không thuộc công ty của user hiện tại)
                    if(isCompanyOther === 'true') {
                        conditionObj.company = {
                            $nin: [companyOfUser]
                        }
                    } else{
                        conditionObj.company = companyID;
                    }
                }

                // Lấy dòng tiền vào ra (có giá trị income > 0)
                if(Number(outin) === 1){
                    conditionObj.income = { $gt: 0 }
                }

                // Lấy dòng tiền vào ra (có giá trị income > 0)
                if(Number(outin) === 2){
                    conditionObj.expense = { $gt: 0 }
                }

                if (keyword) {
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj.name = RegExp(keyword, 'i');
                }

                let conditionObjOrg = { ...conditionObj };

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await FIN__CASH_BOOK_COLL.findById(lastestID);
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

                let infoDataAfterGet = await FIN__CASH_BOOK_COLL.find(conditionObj)
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                if (!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data", status: 403 });

                let nextCursor = null;
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await FIN__CASH_BOOK_COLL.count(conditionObjOrg);
                let totalPage = Math.ceil(totalRecord / limit);

                return resolve({
                    error: false, data: {
                        listRecords: infoDataAfterGet,
                        limit,
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

    /**
    * Name  : Lấy tổng thu và chi theo sổ
    * Author: MinhVH
    * Date  : 18/4/2022
    */
    getAmountIncomeAndExpenseByParent({ parentID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(parentID))
                    return resolve({ error: true, message: "Tham số parentID không hợp lệ", keyError: "parentID_invalid" });

                let listData = await FIN__CASH_BOOK_COLL.aggregate([
                    {
                        $match: {
                            parent: ObjectID(parentID),
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            income: { $sum: "$income" },
                            expense: { $sum: "$expense" },
                        }
                    },
                ])

                if (listData && listData.length) {
                    listData = {
                        income: Number(listData[0].income),
                        expense: Number(listData[0].expense)
                    }
                } else{
                    listData = null;
                }

                return resolve({ error: false, data: listData, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /*
     * Name: Gom nhóm theo thuộc tính 
     * Code: Hiepnh
     * Date: 17/04/2022
     */
    getAmountByProperty({ userID, companyID, parentID, accountID, year, option, ctx }){
        // console.log({ userID, companyID, parentID, accountID, year, option })
        return new Promise(async resolve => {
            try {
                /**
                 * BA
                 * Tham số của option:
                 * 1-Tổng hợp các công ty mà user được quyền truy cập báo cáo quản trị
                 * 2-Tổng hợp của công ty user
                 * 3-Tổng hợp theo sổ quỹ cụ thể
                 */
                let conditionObj = {}, conditionGroup = {}, conditionObjYear = {}, conditionPopulate = {}, sortBy = {"income": -1}

                if (!option || isNaN(option) || ![1,2,3,4].includes(Number(option)))
                    return resolve({ error: true, message: "Tham số option không hợp lệ", keyError: "option_invalid" })

                // Cấu hình gom nhóm mặc định
                conditionGroup = {
                    _id: {},
                    income: { $sum: "$income" },
                    expense: { $sum: "$expense" },
                    date: { $first: "$date" },
                }

                // 1-Tổng hợp các công ty mà user được quyền truy cập báo cáo quản trị
                if(Number(option) === 1){
                    // console.log('1-Tổng hợp các công ty mà user được quyền truy cập báo cáo quản trị 556688')
                    let listCompany = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_MENU_GET_LIST_COMPANY}`, {
                        appID: "5dfe4bc751dc622100bb9d8a",
                        menuID: "623f2465e998e94feda0cdaa",
                        type: "1"
                    })

                    let listActiveParent = await FIN__CASH_BOOK_COLL.find({
                        active: 1,
                        parent: {$exists: false},
                        company: {$in: listCompany.data.map(item=>item._id.company._id)}
                    })

                    conditionObj.parent = {$in: listActiveParent.map(item=>item._id)}

                    conditionGroup = {
                        _id: { account: "$account", company: "$company" },
                        income: { $sum: "$income" },
                        expense: { $sum: "$expense" },
                        date: { $first: "$date" },
                    }

                    conditionPopulate = {
                        path: '_id.account',
                        select: '_id name description company',
                        model: 'account'
                    }

                    sortBy = {
                        "_id.account": 1,
                    }
                }

                // 2-Tổng hợp theo công ty cụ thể
                if(Number(option) === 2){
                    // console.log('2-Tổng hợp của công ty user')
                    let listActiveParent = await FIN__CASH_BOOK_COLL.find({
                        active: 1,
                        parent: {$exists: false},
                        company: companyID
                    })
                    conditionObj.parent = {$in: listActiveParent.map(item=>item._id)}

                    conditionGroup = {
                        _id: { account: "$account" },
                        income: { $sum: "$income" },
                        expense: { $sum: "$expense" },
                        date: { $first: "$date" },
                    }

                    conditionPopulate = {
                        path: '_id.account',
                        select: '_id name description',
                        model: 'account'
                    }

                    sortBy = {
                        "_id.account": 1,
                    }
                }

                // 3-Tổng hợp theo sổ quỹ cụ thể
                if(Number(option) === 3){
                    // console.log('3-Tổng hợp theo sổ quỹ cụ thể')
                    if(parentID && checkObjectIDs(parentID)){
                        conditionObj.parent = ObjectID(parentID)

                        // Gom nhóm theo các loại tài khoản
                        if(accountID && checkObjectIDs(accountID)){
                            conditionObj.account = ObjectID(accountID)
                        }
                    }

                    conditionGroup = {
                        _id: { account: "$account" },
                        income: { $sum: "$income" },
                        expense: { $sum: "$expense" },
                        date: { $first: "$date" },
                    }

                    conditionPopulate = {
                        path: '_id.account',
                        select: '_id name description',
                        model: 'account'
                    }

                    sortBy = {
                        "_id.account": 1,
                    }
                }

                /**
                 * TỔNG HỢP THEO CÁC CÔNG TY MÀ USER ĐƯỢC TRUY CẬP
                 */
                if(Number(option) === 4){
                    let listCompany = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_MENU_GET_LIST_COMPANY}`, {
                        appID: "5dfe4bc751dc622100bb9d8a",
                        menuID: "623f2465e998e94feda0cdaa",
                        type: "1"
                    })

                    // Danh sách các sổ quỹ còn hoạt động thuộc các công ty user được truy cập
                    let listActiveParent = await FIN__CASH_BOOK_COLL.find({
                        active: 1,
                        parent: {$exists: false},
                        company: {$in: listCompany.data.map(item=>item._id.company._id)}
                    })

                    conditionObj.parent = {$in: listActiveParent.map(item=>item._id)}

                    conditionGroup = {
                        _id: { company: "$company" },
                        income: { $sum: "$income" },
                        expense: { $sum: "$expense" }
                    }

                    conditionPopulate = {
                        path: '_id.company',
                        select: '_id name sign image',
                        model: 'company'
                    }

                    sortBy = {
                        "_id.company": 1,
                    }
                }

                // Thống kê theo biểu đồ (tháng/năm)
                if(!isNaN(year) && Number(year) > 0){
                    conditionObjYear = {
                        "year": Number(year),
                    }

                    conditionGroup = {
                        _id: { month: "$month", year: "$year" },
                        income: { $sum: "$income" },
                        expense: { $sum: "$expense" },
                        date: { $first: "$date" },
                    }
                }

                let listData = await FIN__CASH_BOOK_COLL.aggregate([
                    {
                        $match: conditionObj
                    },
                    {
                        $project : {
                            year : {$year : "$date"},
                            month : {$month : "$date"},
                            parent: 1,
                            company: 1,
                            account: 1,
                            income: 1,
                            expense: 1,
                            date: 1,
                        }
                    },
                    {
                        $match: conditionObjYear
                    },
                    {
                        $group: conditionGroup
                    },
                    {
                        $sort: sortBy
                    }
                ])
                // listData.map(item => console.log({ item }))
                // console.log(conditionObj)

                // Pop lấy thông tin tài khoản
                if(!isNaN(option) && Number(option) > 0){
                    await FIN__CASH_BOOK_COLL.populate(listData, conditionPopulate)
                }
                // console.log(listData)

                return resolve({ error: false, data: listData });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Download Template Excel
     * Code: Hiepnh
     * Date: 25/7/2023
     */
    downloadTemplateExcel({ option, companyID, parentID, year, userID }) {
        // console.log({ option, companyID, parentID, userID })
        return new Promise(async resolve => {
            try {
                // let option = 3
                /**
                 * IMPORT SỔ QUỸ
                 */
                if(!option){
                    let listItems1 = await ACCOUNT_COLL.find({company: companyID})
                    .limit(200)
                    .select('name')
                    // .populate({
                    //     path: 'members',
                    //     select: 'fullname'
                    // })
                    // console.log(listItems1)
    
                    let listItems2 = await CONTACT_COLL.find({company: companyID})
                    .limit(200)
                    .select('name phone taxid')
    
                    let listItems3 = await CONTRACT_COLL.find({company: companyID})
                    .limit(200)
                    .select('name sign')
    
                    /**
                     * DỮ LIỆU SỔ QUỸ
                     */
                    let listData = await FIN__CASH_BOOK_COLL.find({parent: parentID})
                    .limit(2000)
                    .select('date name account customer contract income expense note')
                    .populate({
                        path: 'account customer contract',
                        select: 'name phone'
                    })
                    .sort({date: 1})
                    // console.log(listData)
    
                    // Modify the workbook.
                    XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/fin_cashbook_import.xlsm')))
                    .then(async workbook => {
                        var i = 3
                        listItems1?.forEach((item, index) => {
                            workbook.sheet("Export").row(i).cell(1).value(`${item._id}`)
                            workbook.sheet("Export").row(i).cell(2).value(`${item.name}`)
                            i++
                        })
    
                        var i = 3
                        listItems2?.forEach((item, index) => {
                            workbook.sheet("Export").row(i).cell(3).value(`${item._id}`)
                            workbook.sheet("Export").row(i).cell(4).value(`${item.name}_${item?.phone}_${item?.taxid}`)
                            i++
                        })
    
                        var i = 3
                        listItems3?.forEach((item, index) => {
                            workbook.sheet("Export").row(i).cell(5).value(`${item._id}`)
                            workbook.sheet("Export").row(i).cell(6).value(`${item.name}_${item?.sign}`)
                            i++
                        })
    
                        var i = 3
                        listData?.forEach((item, index) => {
                            workbook.sheet("DataImport").row(i).cell(1).value(Number(index+1))
                            workbook.sheet("DataImport").row(i).cell(2).value(item.date)
                            workbook.sheet("DataImport").row(i).cell(3).value(`${item.name}`)
                            workbook.sheet("DataImport").row(i).cell(4).value(`${item?.account?.name}`)
                            workbook.sheet("DataImport").row(i).cell(5).value(`${(item?.customer && item?.customer != null) ? item.customer.name : ""}`)
                            workbook.sheet("DataImport").row(i).cell(6).value(`${(item?.contract && item?.contract != null) ? item.contract.name : ""}`)
                            workbook.sheet("DataImport").row(i).cell(7).value(Number(item.income))
                            workbook.sheet("DataImport").row(i).cell(8).value(Number(item.expense))
                            workbook.sheet("DataImport").row(i).cell(9).value(`${(item?.note && item?.note != "") ? item?.note : ""}`)
                            i++
                        })
    
                        const now = new Date();
                        const filePath = '../../../files/temporary_uploads/';
                        const fileName = `fin_cashbook_import_${now.getTime()}.xlsm`;
                        const pathWriteFile = path.resolve(__dirname, filePath, fileName);
    
                        await workbook.toFileAsync(pathWriteFile);
                        const result = await uploadFileS3(pathWriteFile, fileName);
    
                        fs.unlinkSync(pathWriteFile);
                        return resolve({ error: false, data: result?.Location, status: 200 });
                    })
                }else{
                    /**
                     * TẢI BẢNG CHẤM CÔNG
                     */
                    if(option == 1){
                        // Danh sách ngân sách
                        let infoParent = await TIMESHEET__EXPERT_TIMESHEET_COLL.findById(parentID).select('name hours unitprice amount status date note')

                        let listData = await TIMESHEET__EXPERT_TIMESHEET_COLL.find({parent: parentID})
                        .populate({
                            path: 'work assignee',
                            select:'fullname name unit unitPrice'
                        })
                        .select('name hours unitprice amount status date note')
                        // console.log(listData)

                        // Tổng hợp theo Sản lượng
                        let listData1 = await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: {
                                    work: { $exists: true, $ne: null },
                                    company: ObjectID(companyID),
                                }
                            },
                            {
                                $group: {
                                    _id: { work: "$work" },
                                    quantity: { $sum: "$hours" },
                                }
                            },
                        ])
                        let  conditionPopulate1 = {
                            path: '_id.work',
                            select: '_id name unit unitPrice',
                            model: 'budget_work'
                        }
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.populate(listData1, conditionPopulate1)
                        // console.log(listData1)

                        // Tổng hợp theo người thực hiện
                        let listData2 = await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: {
                                    assignee: { $exists: true, $ne: null },
                                    parent: ObjectID(parentID),
                                }
                            },
                            {
                                $group: {
                                    _id: { assignee: "$assignee" },
                                    quantity: { $sum: "$hours" },
                                    amount: { $sum: "$amount" },
                                }
                            },
                        ])
                        let  conditionPopulate2 = {
                            path: '_id.assignee',
                            select: '_id fullname',
                            model: 'user'
                        }
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.populate(listData2, conditionPopulate2)
                        // console.log(listData2)

                        // Tổng hợp theo Sản lượng-Tháng
                        let yearFilter
                        let currentYear = new Date().getFullYear()
                        if(year && !isNaN(year)){
                            yearFilter = Number(year)
                        }else{
                            yearFilter = Number(currentYear)
                        }

                        let listData3 = await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: {
                                    work: { $exists: true, $ne: null },
                                    company: ObjectID(companyID),
                                }
                            },
                            {
                                $project : {
                                    year : {$year : "$date"},
                                    month : {$month : "$date"},
                                    work: 1,
                                    hours: 1,
                                    amount: 1,
                                    date: 1,
                                }
                            },
                            {
                                $match: {
                                    year: Number(yearFilter)
                                }
                            },
                            {
                                $group: {
                                    _id: { work: "$work", month: "$month"},
                                    quantity: { $sum: "$hours" },
                                    amount: { $sum: "$amount" },
                                }
                            },
                        ])
                        // console.log(listData3)

                         // Modify the workbook.
                         XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/timesheet_report.xlsx')))
                         .then(async workbook => {

                            workbook.sheet("Data").row(2).cell(1).value(infoParent.name)
 
                             // NHẬT KÝ CHUNG
                             var i = 4
                             listData.forEach((item, index) =>{
                                let amountBudget = 0
                                if(item?.work?.unitPrice){
                                    amountBudget = Number(item?.work?.unitPrice * item.hours)
                                }
                                 workbook.sheet("Data").row(i).cell(1).value(item.date)
                                 workbook.sheet("Data").row(i).cell(2).value(item.name)
                                 workbook.sheet("Data").row(i).cell(3).value(item?.assignee?.fullname)

                                 workbook.sheet("Data").row(i).cell(4).value(Number(item.hours))
                                 workbook.sheet("Data").row(i).cell(5).value(Number(item.unitprice))
                                 workbook.sheet("Data").row(i).cell(6).value(Number(item.amount))
                                 workbook.sheet("Data").row(i).cell(7).value(item?.note)
                                 workbook.sheet("Data").row(i).cell(8).value(item?.work?.name)
                                 workbook.sheet("Data").row(i).cell(9).value(item?.work?.unit)
                                 workbook.sheet("Data").row(i).cell(10).value(Number(item?.work?.unitPrice) | 0)
                                 workbook.sheet("Data").row(i).cell(11).value(Number(amountBudget))
                                 i++
                             })

                             var i = 4
                             listData1.forEach((item, index) =>{
                                 workbook.sheet("Report1").row(i).cell(1).value(Number(index+1))
                                 workbook.sheet("Report1").row(i).cell(2).value(item._id.work?.name)
                                 workbook.sheet("Report1").row(i).cell(3).value(item._id.work?.unit)
                                 workbook.sheet("Report1").row(i).cell(4).value(Number(item.quantity))
                                 workbook.sheet("Report1").row(i).cell(5).value(Number(item._id.work?.unitPrice))
                                 workbook.sheet("Report1").row(i).cell(6).value(Number(item.quantity * item._id.work?.unitPrice))

                                 workbook.sheet("Report3").row(i).cell(1).value(Number(index+1))
                                 workbook.sheet("Report3").row(i).cell(2).value(item._id.work?.name)
                                 workbook.sheet("Report3").row(i).cell(3).value(`${item._id.work?._id}`)
                                 workbook.sheet("Report3").row(i).cell(4).value(item._id.work?.unit)
                                 workbook.sheet("Report3").row(i).cell(5).value(Number(item.quantity))
                                 workbook.sheet("Report3").row(i).cell(6).value(Number(item._id.work?.unitPrice))
                                 workbook.sheet("Report3").row(i).cell(7).value(Number(item.quantity * item._id.work?.unitPrice))

                                 i++
                             })

                             listData3?.forEach((item, index) => {
                                for(var m = 1; m<=12; m++){
                                    if(Number(item._id.month) === Number(m)){
                                        for(let i=4; i<=Number(listData1.length + 3); i++){

                                            let workID = workbook.sheet(`Report3`).row(i).cell(3).value()
                                            
                                            if(item._id.work.toString() === workID.toString()){

                                                workbook.sheet(`Report3`).row(i).cell(Number(m+7)).value(Number(item.amount))
                                            }
                                        }
                                    }
                                }
                            })

                             var i = 4
                             listData2.forEach((item, index) =>{
                                 workbook.sheet("Report2").row(i).cell(1).value(Number(index+1))
                                 workbook.sheet("Report2").row(i).cell(2).value(item._id.assignee?.fullname)
                                 workbook.sheet("Report2").row(i).cell(3).value(Number(item.quantity))
                                 workbook.sheet("Report2").row(i).cell(4).value(Number(item.amount))

                                 i++
                             })
                   
                             const now = new Date();
                             const filePath = '../../../files/temporary_uploads/';
                             const fileName = `timesheet_report${now.getTime()}.xlsx`;
                             const pathWriteFile = path.resolve(__dirname, filePath, fileName);
 
                             await workbook.toFileAsync(pathWriteFile);
                             const result = await uploadFileS3(pathWriteFile, fileName);
 
                             fs.unlinkSync(pathWriteFile);
                             return resolve({ error: false, data: result?.Location, status: 200 });
                         });
                    }

                     /**
                     * TẢI BẢNG TÍNH LƯƠNG
                     */
                    if(option == 2){
                        let getInfoUserApp = await AUTH__APP_USER.checkPermissionsAccessApp({ 
                            appID: "61e049cffdebf77b072d1b14", 
                            userID
                        })

                        let conditionObj = {};
                        conditionObj.parent = parentID
        
                        let infoParent = await TIMESHEET__EXPERT_SALARY_COLL.findById(parentID)
                        .select('name status date note salary')
                        
                        // Danh sách các phòng ban mà user được quyền truy cập
                        let listDepartment = await ITEM__DEPARTMENT_COLL.find({company:companyID, members: { $in: [userID] }}).select('_id name')
                        let listPosition = await ITEM__POSITION_COLL.find({company:companyID}).select('_id name')

                        if(!getInfoUserApp.error && Number(getInfoUserApp.data.level) == 0){
                            // Admin ứng dụng
                         }else{
                             let listDepartment = await ITEM__DEPARTMENT_COLL.find({company:companyID, members: { $in: [userID] }}).select('_id name')
                             conditionObj.project = { $in: listDepartment.map(item=>item.id) }
                         }

                        let listData = await TIMESHEET__EXPERT_SALARY_COLL.find(conditionObj)
                        .populate({
                            path: 'human project position',
                            select:'fullname name contacts',
                            populate: ({
                                path: 'contacts',
                                select:'bankAccount',
                                
                            })
                        })
                        .sort({project: 1})

                         // Modify the workbook.
                         XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/salary_report.xlsx')))
                         .then(async workbook => {
                            var i = 3
                            listDepartment.forEach((item, index) =>{
                                workbook.sheet("TongHop1").row(i).cell(1).value(Number(index + 1))
                                workbook.sheet("TongHop1").row(i).cell(2).value(item?.name)
                                workbook.sheet("TongHop1").row(i).cell(3).value()
                                workbook.sheet("TongHop1").row(i).cell(4).value(item?.note)
                                
                                i++
                            })

                            var i = 3
                            listPosition.forEach((item, index) =>{
                                workbook.sheet("TongHop2").row(i).cell(1).value(Number(index + 1))
                                workbook.sheet("TongHop2").row(i).cell(2).value(item?.name)
                                workbook.sheet("TongHop2").row(i).cell(3).value()
                                workbook.sheet("TongHop2").row(i).cell(4).value(item?.note)
                                
                                i++
                            })

                            workbook.sheet("BangLuong").row(1).cell(1).value(infoParent.name)

                            var i = 4
                            listData.forEach((item, index) =>{
                                let tongThu = Number(item.salary + item.onLeaveSalary + item.revenueBonus + item.reward + item.mealAllowance)
                                let tongGiamTru = Number(item.punishment + item.insurance + item.pitax + item.union + item.share + item.other)

                                workbook.sheet("BangLuong").row(i).cell(1).value(Number(index + 1))
                                workbook.sheet("BangLuong").row(i).cell(2).value(item?.human?.fullname)
                                workbook.sheet("BangLuong").row(i).cell(3).value(item?.project?.name)
                                workbook.sheet("BangLuong").row(i).cell(4).value(item?.position?.name)
                                workbook.sheet("BangLuong").row(i).cell(5).value(Number(item.salary))
                                workbook.sheet("BangLuong").row(i).cell(6).value(Number(item.convertFactor))
                                workbook.sheet("BangLuong").row(i).cell(7).value(Number(item.onLeaveSalary))
                                workbook.sheet("BangLuong").row(i).cell(8).value(Number(item.revenueBonus))
                                workbook.sheet("BangLuong").row(i).cell(9).value(Number(item.reward))
                                workbook.sheet("BangLuong").row(i).cell(10).value(Number(item.mealAllowance))

                                workbook.sheet("BangLuong").row(i).cell(12).value(Number(item.punishment))
                                workbook.sheet("BangLuong").row(i).cell(13).value(Number(item.insurance))
                                // workbook.sheet("BangLuong").row(i).cell(14).value(Number(item.pitax))
                                // workbook.sheet("BangLuong").row(i).cell(15).value(Number(item.union))
                                workbook.sheet("BangLuong").row(i).cell(16).value(Number(item.share))
                                workbook.sheet("BangLuong").row(i).cell(17).value(Number(item.other))

                                workbook.sheet("BangLuong").row(i).cell(20).value(Number(item.advance))
                                workbook.sheet("BangLuong").row(i).cell(21).value(Number(item.paid))

                                workbook.sheet("BangLuong").row(i).cell(23).value(item?.note)
                                workbook.sheet("BangLuong").row(i).cell(24).value(`${item?._id}`)   
                                workbook.sheet("BangLuong").row(i).cell(25).value(Number(item?.kpiFactor))   

                                if(item?.human.contacts.length){
                                    // console.log(item?.human.contacts[0])
                                    workbook.sheet("BangLuong").row(i).cell(30).value(item?.human.contacts[0].bankAccount)     
                                }
                                    
                                workbook.sheet("BangLuong").row(i).cell(26).value(Number(item?.subAllowance1))   
                                workbook.sheet("BangLuong").row(i).cell(27).value(Number(item?.pependent))   
                                workbook.sheet("BangLuong").row(i).cell(29).value(Number(item?.subAllowance2))   
                                
                                // Bảng lương 2
                                workbook.sheet("BangLuong2").row(i).cell(1).value(Number(index + 1))
                                workbook.sheet("BangLuong2").row(i).cell(2).value(item?.human?.fullname)
                                workbook.sheet("BangLuong2").row(i).cell(3).value(item?.project?.name)
                                workbook.sheet("BangLuong2").row(i).cell(4).value(item?.position?.name)
                                workbook.sheet("BangLuong2").row(i).cell(5).value(Number(item.salary))
                                workbook.sheet("BangLuong2").row(i).cell(6).value(Number(item.convertFactor))
                                workbook.sheet("BangLuong2").row(i).cell(7).value(Number(item.onLeaveSalary))

                                workbook.sheet("BangLuong2").row(i).cell(8).value(Number(item.revenueBonus))
                                workbook.sheet("BangLuong2").row(i).cell(9).value(Number(item.reward))
                                workbook.sheet("BangLuong2").row(i).cell(10).value(Number(item.mealAllowance))
                                workbook.sheet("BangLuong2").row(i).cell(11).value(Number(item.punishment))
                                workbook.sheet("BangLuong2").row(i).cell(12).value(Number(item.insurance))
                                workbook.sheet("BangLuong2").row(i).cell(13).value(Number(item.pitax))
                                workbook.sheet("BangLuong2").row(i).cell(14).value(Number(item.union))
                                workbook.sheet("BangLuong2").row(i).cell(15).value(Number(item.share))
                                workbook.sheet("BangLuong2").row(i).cell(16).value(Number(item.other))

                                workbook.sheet("BangLuong2").row(i).cell(17).value(Number(tongThu))
                                workbook.sheet("BangLuong2").row(i).cell(18).value(Number(tongGiamTru))

                                workbook.sheet("BangLuong2").row(i).cell(19).value(Number(item.advance))
                                workbook.sheet("BangLuong2").row(i).cell(20).value(Number(item.paid))
                                workbook.sheet("BangLuong2").row(i).cell(21).value(Number(item.remaining))
                                workbook.sheet("BangLuong2").row(i).cell(22).value(item?.note)
                                workbook.sheet("BangLuong2").row(i).cell(23).value(`${item?._id}`)   
                                
                                if(item?.human.contacts.length){
                                    workbook.sheet("BangLuong2").row(i).cell(24).value(item?.human.contacts[0].bankAccount)     
                                }
                                
                                i++
                            })
                    
                            const now = new Date();
                            const filePath = '../../../files/temporary_uploads/';
                            const fileName = `salary_report${now.getTime()}.xlsx`;
                            const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                            await workbook.toFileAsync(pathWriteFile);
                            const result = await uploadFileS3(pathWriteFile, fileName);

                            fs.unlinkSync(pathWriteFile);
                            return resolve({ error: false, data: result?.Location, status: 200 });
                         });
                    }

                    // BẢNG CÂN ĐỐI TÀI KHOẢN
                    if(option == 3){
                        /**
                         * NHẬT KÝ CHUNG
                         */
                        let listData = await FINANCIAL_GENERAL_JOURNAL_COLL.find({ company: companyID })
                        // .select('')
                        .populate({
                            path: 'funda contract debit credit customerDebit customerCredit goods warehouse budgetWork',
                            select: 'name'
                        })


                        /**
                         * DANH SÁCH CÂY TÀI KHOẢN
                         */
                        let listAccounts = await ACCOUNT_MODEL.getListRecursive({ companyID })
                        let listAppMenuParent = listAccounts.data

                        let option = 4, optionTerm = 1, fromDate = '2023-07-20', toDate = '2023-12-31'
                        let listDataCombine = await FINANCIAL_GENERAL_JOURNAL_MODEL.getListByProperty({ option, optionTerm, companyID, fromDate, toDate, userID })
                        // console.log(listDataCombine)
                        // console.log(listDataCombine.data.debitO)
                        // console.log(listDataCombine.data.creditO)
                        // console.log('=====================')
                        // console.log(listDataCombine.data.debitFT)
                        // console.log(listDataCombine.data.creditFT)

                        let arrDebitO = [], arrCreditO = [], arrDebitOF = [], arrCreditOF = [], arrDebitFT = [], arrCreditFT = []

                        listDataCombine.data.debitO.forEach(element=>{
                            let key = element._id.account;
                            if (!Array.isArray(arrDebitO[key])) {
                                arrDebitO[key] = [];
                            }
                            arrDebitO[key].push(element)
                        })

                        listDataCombine.data.creditO.forEach(element=>{
                            let key = element._id.account;
                            if (!Array.isArray(arrCreditO[key])) {
                                arrCreditO[key] = [];
                            }
                            arrCreditO[key].push(element)
                        })

                        listDataCombine.data.debitOF.forEach(element=>{
                            let key = element._id.account;
                            if (!Array.isArray(arrDebitOF[key])) {
                                arrDebitOF[key] = [];
                            }
                            arrDebitOF[key].push(element)
                        })

                        listDataCombine.data.creditOF.forEach(element=>{
                            let key = element._id.account;
                            if (!Array.isArray(arrCreditOF[key])) {
                                arrCreditOF[key] = [];
                            }
                            arrCreditOF[key].push(element)
                        })

                        listDataCombine.data.debitFT.forEach(element=>{
                            let key = element._id.account;
                            if (!Array.isArray(arrDebitFT[key])) {
                                arrDebitFT[key] = [];
                            }
                            arrDebitFT[key].push(element)
                        })

                        listDataCombine.data.creditFT.forEach(element=>{
                            let key = element._id.account;
                            if (!Array.isArray(arrCreditFT[key])) {
                                arrCreditFT[key] = [];
                            }
                            arrCreditFT[key].push(element)
                        })

                        // console.log(arrDebitO)
                        // console.log(arrCreditO)
                        // console.log(arrDebitOF)
                        // console.log(arrCreditOF)
                        // console.log(arrDebitFT)
                        // console.log(arrCreditFT)

                        // return resolve({ error: false, data: { arrDebitO, arrCreditO, arrDebitOF, arrCreditOF, arrDebitFT, arrCreditFT } });

                        // Modify the workbook.
                        XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/fin_financial_report.xlsm')))
                        .then(async workbook => {

                            // NHẬT KÝ CHUNG
                            var i = 4
                            listData.forEach((item, index) =>{
                                workbook.sheet("NhatKyChung").row(i).cell(1).value(Number(index+1))
                                workbook.sheet("NhatKyChung").row(i).cell(2).value(`${item?.funda?.name}`)
                                workbook.sheet("NhatKyChung").row(i).cell(3).value()
                                workbook.sheet("NhatKyChung").row(i).cell(4).value(item.date)
                                workbook.sheet("NhatKyChung").row(i).cell(5).value(item.name)
                                workbook.sheet("NhatKyChung").row(i).cell(6).value(item?.debit?.name)
                                workbook.sheet("NhatKyChung").row(i).cell(7).value(item?.credit?.name)
                                workbook.sheet("NhatKyChung").row(i).cell(8).value(item?.customerDebit?.name)
                                workbook.sheet("NhatKyChung").row(i).cell(9).value(item?.customerCredit?.name)
                                workbook.sheet("NhatKyChung").row(i).cell(10).value(item?.goods?.name)
                                workbook.sheet("NhatKyChung").row(i).cell(11).value(item?.warehouse?.name)
                                workbook.sheet("NhatKyChung").row(i).cell(12).value(item?.contract?.name)
                                workbook.sheet("NhatKyChung").row(i).cell(13).value(item?.goods?.unit)
                                workbook.sheet("NhatKyChung").row(i).cell(14).value(Number(item.quantity))
                                workbook.sheet("NhatKyChung").row(i).cell(15).value(Number(item.unitprice))
                                workbook.sheet("NhatKyChung").row(i).cell(16).value(Number(item.amount))
                                workbook.sheet("NhatKyChung").row(i).cell(17).value(item?.budgetWork?.name)
                                workbook.sheet("NhatKyChung").row(i).cell(18).value(Number(item.updown))
                                workbook.sheet("NhatKyChung").row(i).cell(19).value(item?.note)
                                i++
                            })

                            // BẢNG CÂN ĐỐI TÀI KHOẢN
                            var i = 4
                            let recursive = (arr) => {
                                arr.forEach(item => {
                                    workbook.sheet("BangCDTaiKhoan").row(i).cell(1).value(`${item.name}`)
                                    workbook.sheet("BangCDTaiKhoan").row(i).cell(2).value(`${item._id}`)
                                    workbook.sheet("BangCDTaiKhoan").row(i).cell(3).value(`${item.description}`)
                                    // console.log(item.nestedChilds)

                                    // Định dạng bôi đậm nhạt

                                    // Bổ sung tính tổng các phần tử con
                                    let debitFT = 0, allSubDebitFT = 0, totalDebitFT = 0
                                    for(const element of item.nestedChilds){
                                        if(arrDebitFT[`${element}`]){
                                            // console.log('========yessssssssssss')
                                            allSubDebitFT = allSubDebitFT + Number(arrDebitFT[element][0].amount)
                                        }
                                    }
                                    // console.log(allSubDebitFT)

                                    // Hiển thị giá trị
                                    if(arrDebitO[item._id]){
                                        workbook.sheet("BangCDTaiKhoan").row(i+1).cell(4).value(Number(arrDebitO[item._id][0].amount))
                                    }
                                    if(arrCreditO[item._id]){
                                        workbook.sheet("BangCDTaiKhoan").row(i+1).cell(5).value(Number(arrCreditO[item._id][0].amount))
                                    }
                                    if(arrDebitOF[item._id]){
                                        workbook.sheet("BangCDTaiKhoan").row(i+1).cell(6).value(Number(arrDebitOF[item._id][0].amount))
                                    }
                                    if(arrCreditOF[item._id]){
                                        workbook.sheet("BangCDTaiKhoan").row(i+1).cell(7).value(Number(arrCreditOF[item._id][0].amount))
                                    }

                                    if(arrDebitFT[item._id]){
                                        workbook.sheet("BangCDTaiKhoan").row(i+1).cell(8).value(Number(arrDebitFT[item._id][0].amount))
                                        debitFT = Number(arrDebitFT[item._id][0].amount)
                                    }

                                    if(arrCreditFT[item._id]){
                                        workbook.sheet("BangCDTaiKhoan").row(i+1).cell(9).value(Number(arrCreditFT[item._id][0].amount))
                                    }

                                    totalDebitFT = debitFT + allSubDebitFT

                                    // console.log(`${item.name}-${item.description}`)
                                    // console.log({allSubDebitFT})
                                    // console.log({totalDebitFT})
                                    // console.log('===================')

                                    workbook.sheet("BangCDTaiKhoan").row(i).cell(8).value(Number(totalDebitFT))
                                    workbook.sheet("BangCDTaiKhoan").row(i+2).cell(8).value(Number(allSubDebitFT))

                                    if(item.childs.length){
                                        workbook.sheet("BangCDTaiKhoan").row(i).cell(1).style({bold : true, fill: "0000ff"})
                                    }

                                    i = i + 3
            
                                    if (item.childs && item.childs.length) {
                                        recursive(item.childs)
                                    }
                                })
                            }
                            recursive(listAppMenuParent)

                            const now = new Date();
                            const filePath = '../../../files/temporary_uploads/';
                            const fileName = `fin_financial_report${now.getTime()}.xlsm`;
                            const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                            await workbook.toFileAsync(pathWriteFile);
                            const result = await uploadFileS3(pathWriteFile, fileName);

                            fs.unlinkSync(pathWriteFile);
                            return resolve({ error: false, data: result?.Location, status: 200 });
                        });
                    }
                }
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Import Excel
     * Code: Hiepnh
     * Date: 25/7/2023
     */
    importFromExcel({ option, companyID, parentID, dataImport, userID }) {
        // console.log({option, companyID, parentID, userID})
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs(parentID))
                    return resolve({ error: true, message: 'parentID_invalid', status: 400 })

                const dataImportJSON = JSON.parse(dataImport);
                let index = 0;
                let errorNumber = 0;

                if(!option){
                    for (const data of dataImportJSON) {
                        if(index > 0 && index <= 250){
                            let dataInsert = {
                                companyID, 
                                userID, 
                                parentID, 
                                accountID: data?.__EMPTY_14,
                                customerID: data?.__EMPTY_15, 
                                contractID: data?.__EMPTY_16, 
                                name: data?.__EMPTY_1,
                                note: data?.__EMPTY_7, 
                                date: data?.__EMPTY_13, 
                                income: data?.__EMPTY_5, 
                                expense: data?.__EMPTY_6
                            }
    
                            let infoAfterInsert = await this.insert(dataInsert);
                            if(infoAfterInsert.error){
                                errorNumber++;
                            }
                        }
                        index ++;
                    }
    
                    if(errorNumber != 0)
                        return resolve({ error: true, message: "import field" });
    
                    return resolve({ error: false, message: "import success" });
                }else{
                    // IMPORT CẬP NHẬT BẢNG LƯƠNG
                    if(Number(option) === 1){
                        //___________Quyền truy cập ứng dụng Nhân sự
                        let infoAppUser = await AUTH__APP_USER.checkPermissionsAccessApp({
                            appID: "61e049cffdebf77b072d1b14", 
                            userID
                        })

                        if(!infoAppUser.error && infoAppUser.data.level == 0){
                            for (const data of dataImportJSON) {
                                if(index > 1 && index <= 101){    
                                    // console.log(data)
                                    let infoAfterUpdate = await TIMESHEET__EXPERT_SALARY_MODEL.update({
                                        expertSalaryID: data?.__EMPTY_22, 
                                        admins: [userID], 
                                        members: [userID], 
                                        userID, 
                                        note: data?.__EMPTY_21, 
                                        salary:  Number(data?.__EMPTY_3), 
                                        onLeaveSalary:  Number(data?.__EMPTY_5), 
                                        revenueBonus:  Number(data?.__EMPTY_6), 
                                        reward:  Number(data?.__EMPTY_7), 
                                        mealAllowance:  Number(data?.__EMPTY_8), 

                                        punishment:  Number(data?.__EMPTY_10), 
                                        insurance:  Number(data?.__EMPTY_11), 
                                        pitax: Number(data?.__EMPTY_12), 
                                        union:  Number(data?.__EMPTY_13), 
                                        share:  Number(data?.__EMPTY_14), 
                                        other: Number(data?.__EMPTY_15),

                                        advance:  Number(data?.__EMPTY_18), 
                                        paid:  Number(data?.__EMPTY_19), 

                                        kpiFactor:  Number(data?.__EMPTY_23),
                                        subAllowance1:  Number(data?.__EMPTY_24),
                                        pependent:  Number(data?.__EMPTY_25),
                                        subAllowance2:  Number(data?.__EMPTY_27),
                                    })
    
                                    if(infoAfterUpdate.error){
                                        
                                        errorNumber++;
                                    }
                                }

                                index ++;
                            }
            
                            return resolve({ error: false, message: "import success" });
                        }else{
                            return resolve({ error: true, message: "import field" });
                        }
                    }

                    // IMPORT CẬP NHẬT BẢNG CÔNG
                    if(Number(option) === 2){
                        //___________Quyền truy cập ứng dụng Nhân sự
                        let infoAppUser = await AUTH__APP_USER.checkPermissionsAccessApp({
                            appID: "61e049cffdebf77b072d1b14", 
                            userID
                        })

                        if(!infoAppUser.error && infoAppUser.data.level == 0){
                            for (const data of dataImportJSON) {
                                if(index > 0 && index <= 101){    
                                    // console.log(data)
                                    let infoAfterUpdate = await TIMESHEET__EXPERT_TIMESHEET_MODEL.insert({
                                        userCreate: userID, 
                                        companyID: companyID, 
                                        parentID, 
                                        name: data?.__EMPTY, 
                                        date: data?.__EMPTY_9, 
                                        note: data?.__EMPTY_5, 
                                        hours: data?.__EMPTY_2, 
                                        unitprice: data?.__EMPTY_3, 
                                        assigneeID: data?.__EMPTY_7, 
                                    })
    
                                    if(infoAfterUpdate.error){
                                        errorNumber++;
                                    }
                                }

                                index ++;
                            }
            
                            return resolve({ error: false, message: "import success" });
                        }else{
                            return resolve({ error: true, message: "import field" });
                        }
                    }
                }
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /*
    * Name: Download Template Excel
    * Code: Hiepnh
    * Date: 25/7/2023
    */
   exportExcel({ option, companyID, parentID, year, month, userID, fromDate, toDate }) {
    //    console.log({ option, companyID, parentID, year, month, userID, fromDate, toDate })
       return new Promise(async resolve => {
           try {
            let yearFilter, monthFilter
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1

            if(year && !isNaN(year)){
                yearFilter = Number(year)
            }else{
                yearFilter = Number(currentYear)
            }

            if(month && !isNaN(month)){
                monthFilter = Number(month)
            }else{
                monthFilter = Number(currentMonth)
            }

            if(fromDate && toDate){
                yearFilter = new Date(toDate).getFullYear()
                monthFilter = new Date(toDate).getMonth() + 1
            }

            // Tải bảng chấm công
            if(option == 1){
                let infoParent = await TIMESHEET__EXPERT_TIMESHEET_COLL.findById(parentID).select('name hours unitprice amount status date note subtype')

                monthFilter = new Date(infoParent.date).getMonth() + 1
                // console.log({ monthFilter })

                let listData = await TIMESHEET__EXPERT_TIMESHEET_COLL.find({parent: parentID})
                .populate({
                    path: 'work assignee',
                    select:'fullname name unit unitPrice'
                })
                .select('name hours unitprice amount status date note')
                // console.log(listData)

                let listData2 = await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                    {
                        $match: {
                            // company: ObjectID(companyID),
                            parent: ObjectID(parentID),
                            assignee: { $exists: true, $ne: null }
                        }
                    },
                    {
                        $project: {
                            year : {$year : "$date"},
                            month : {$month : "$date"},
                            day: { $dayOfMonth: "$date" },
                            hours: 1,
                            subtype: 1,
                            assignee: 1,
                        }
                    },
                    {
                        $match: {
                            year: Number(yearFilter),
                            month: Number(monthFilter),
                        }
                    },
                    {
                        $group: {
                            _id: { assignee: '$assignee', day: '$day', subtype: '$subtype' },
                            quantity: { $sum: "$hours" },
                        }
                    },
                ])
                // console.log(listData2)
                
                let listUser = await USER_COLL.find({_id: {$in: listData2.map(item=>item._id.assignee)}})
                .select('fullname department position')
                .populate({
                    path:'department position',
                    select:'name',
                })
                // console.log(listUser)

                 // Modify the workbook.
                 XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/timesheet_report.xlsx')))
                 .then(async workbook => {

                    workbook.sheet("Data").row(2).cell(1).value(infoParent.name)

                     var i = 4
                     listData.forEach((item, index) =>{
                         workbook.sheet("Data").row(i).cell(1).value(item.date)
                         workbook.sheet("Data").row(i).cell(2).value(item.name)
                         workbook.sheet("Data").row(i).cell(3).value(item?.assignee?.fullname)

                         workbook.sheet("Data").row(i).cell(4).value(Number(item.hours))
                         workbook.sheet("Data").row(i).cell(5).value(Number(item.unitprice))
                         workbook.sheet("Data").row(i).cell(6).value(Number(item.amount))
                         workbook.sheet("Data").row(i).cell(7).value(item?.note)
                         i++
                     })

                     var i = 4
                     listUser.forEach((item, index) =>{
                         workbook.sheet("Data2").row(i).cell(1).value(Number(index+1))
                         workbook.sheet("Data2").row(i).cell(2).value(item.fullname)
                         workbook.sheet("Data2").row(i).cell(3).value(`${item.department.name}`)
                         workbook.sheet("Data2").row(i).cell(4).value(`${item.position.name}`)
                         workbook.sheet("Data2").row(i).cell(5).value(`${item._id}`)

                         workbook.sheet("Data3").row(i).cell(1).value(Number(index+1))
                         workbook.sheet("Data3").row(i).cell(2).value(item.fullname)
                         workbook.sheet("Data3").row(i).cell(3).value(`${item.department.name}`)
                         workbook.sheet("Data3").row(i).cell(4).value(`${item.position.name}`)
                         workbook.sheet("Data3").row(i).cell(5).value(`${item._id}`)

                         workbook.sheet("Data4").row(i).cell(1).value(Number(index+1))
                         workbook.sheet("Data4").row(i).cell(2).value(item.fullname)
                         workbook.sheet("Data4").row(i).cell(3).value(`${item.department.name}`)
                         workbook.sheet("Data4").row(i).cell(4).value(`${item.position.name}`)
                         workbook.sheet("Data4").row(i).cell(5).value(`${item._id}`)

                         i++
                     })

                     listData2?.forEach((item, index) => {
                        for(var i=4; i<=listUser.length + 3; i++){
                            let userID = workbook.sheet("Data2").row(i).cell(5).value();

                            for(var j=1; j<=31; j++){
                                if(item._id.day == j && userID.toString() === item._id.assignee.toString()){
                                    workbook.sheet("Data2").row(i).cell(j + 5).value(item.quantity);
                                    workbook.sheet("Data3").row(i).cell(j + 5).value(1);

                                    if(item._id.subtype == 1){
                                        workbook.sheet("Data4").row(i).cell(j + 5).value('x');
                                    }

                                    else if(item._id.subtype == 2){
                                        workbook.sheet("Data4").row(i).cell(j + 5).value('p');
                                    }

                                    else if(item._id.subtype == 3){
                                        workbook.sheet("Data4").row(i).cell(j + 5).value('l');
                                    }

                                    else{
                                        workbook.sheet("Data4").row(i).cell(j + 5).value('ct');
                                    }
                                }
                            }
                        }
                    })
           
                     const now = new Date();
                     const filePath = '../../../files/temporary_uploads/';
                     const fileName = `timesheet_report${now.getTime()}.xlsx`;
                     const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                     await workbook.toFileAsync(pathWriteFile);
                     const result = await uploadFileS3(pathWriteFile, fileName);

                     fs.unlinkSync(pathWriteFile);
                     return resolve({ error: false, data: result?.Location, status: 200 });
                 });
            }

            // Tải tổng hợp ngân sách
            else if(option == 2){
                // Tổng hợp theo Sản lượng
                let listData1 = await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                    {
                        $match: {
                            work: { $exists: true, $ne: null },
                            company: ObjectID(companyID),
                        }
                    },
                    {
                        $group: {
                            _id: { work: "$work" },
                            // quantity: { $sum: "$hours" },
                            // amount: { $sum: "$amount" },
                        }
                    },
                ])
                let  conditionPopulate1 = {
                    path: '_id.work',
                    select: '_id name sign unit quantity unitPrice',
                    model: 'budget_work'
                }
                await TIMESHEET__EXPERT_TIMESHEET_COLL.populate(listData1, conditionPopulate1)
                // console.log(listData1)

                let listData2 = await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                    {
                        $match: {
                            work: { $exists: true, $ne: null },
                            company: ObjectID(companyID),
                        }
                    },
                    {
                        $project : {
                            year : {$year : "$date"},
                            month : {$month : "$date"},
                            work: 1,
                            hours: 1,
                            amount: 1,
                            date: 1,
                        }
                    },
                    {
                        $match: {
                            year: Number(yearFilter)
                        }
                    },
                    {
                        $group: {
                            _id: { work: "$work", month: "$month"},
                            quantity: { $sum: "$hours" },
                            amount: { $sum: "$amount" },
                        }
                    },
                ])
                // console.log(listData2)

                XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/budget_report.xlsx')))
                .then(async workbook => {
                    workbook.sheet(`Report1`).row(2).cell(1).value(`Báo cáo tổng hợp năm ${yearFilter}`)
                    workbook.sheet(`Report2`).row(2).cell(1).value(`Báo cáo tổng hợp năm ${yearFilter}`)

                    var i = 4
                    listData1.forEach((item, index) =>{
                        workbook.sheet("Report1").row(i).cell(1).value(Number(index+1))
                        workbook.sheet("Report1").row(i).cell(2).value(`${item._id.work?.sign}-${item._id.work?.name}`)
                        workbook.sheet("Report1").row(i).cell(3).value(`${item._id.work?._id}`)
                        workbook.sheet("Report1").row(i).cell(4).value(item._id.work?.unit)
                        workbook.sheet("Report1").row(i).cell(5).value(Number(item._id.work?.quantity))
                        workbook.sheet("Report1").row(i).cell(6).value(Number(item._id.work?.unitPrice))
                        workbook.sheet("Report1").row(i).cell(7).value(Number(item._id.work?.quantity * item._id.work?.unitPrice))

                        workbook.sheet("Report2").row(i).cell(1).value(Number(index+1))
                        workbook.sheet("Report2").row(i).cell(2).value(`${item._id.work?.sign}-${item._id.work?.name}`)
                        workbook.sheet("Report2").row(i).cell(3).value(`${item._id.work?._id}`)
                        workbook.sheet("Report2").row(i).cell(4).value(item._id.work?.unit)
                        workbook.sheet("Report2").row(i).cell(5).value(Number(item._id.work?.quantity))
                        workbook.sheet("Report2").row(i).cell(6).value(Number(item._id.work?.unitPrice))
                        workbook.sheet("Report2").row(i).cell(7).value(Number(item._id.work?.quantity * item._id.work?.unitPrice))

                        i++
                    })

                    listData2?.forEach((item, index) => {
                        for(var m = 1; m<=12; m++){
                                if(Number(item._id.month) === Number(m)){
                                    for(let i=4; i<=Number(listData1.length + 3); i++){

                                        let workID = workbook.sheet(`Report1`).row(i).cell(3).value()
                                        if(item._id.work.toString() === workID.toString()){
                                            workbook.sheet(`Report1`).row(i).cell(Number(m+7)).value(Number(item.quantity))
                                        }

                                        let workID2 = workbook.sheet(`Report2`).row(i).cell(3).value()
                                        if(item._id.work.toString() === workID2.toString()){
                                            workbook.sheet(`Report2`).row(i).cell(Number(m+7)).value(Number(item.amount))
                                        }
                                    }
                                }
                            }
                        })
        
                    const now = new Date();
                    const filePath = '../../../files/temporary_uploads/';
                    const fileName = `budget_report${now.getTime()}.xlsx`;
                    const pathWriteFile = path.resolve(__dirname, filePath, fileName)

                    await workbook.toFileAsync(pathWriteFile)
                    const result = await uploadFileS3(pathWriteFile, fileName)

                    fs.unlinkSync(pathWriteFile);
                    return resolve({ error: false, data: result?.Location, status: 200 })
                })
            }

           } catch (error) {
               return resolve({ error: true, message: error.message, status: 500 });
           }
       })
   }
}

exports.MODEL = new Model;