"use strict";
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString, validateParamsObjectID }
                                        = require('../../../tools/utils/utils');
const stringUtils					    = require('../../../tools/utils/string_utils');
const { setTimeZone  }                  = require('../../../tools/utils/time_utils');
const { KEY_ERROR }			            = require('../../../tools/keys');
const ObjectID                          = require('mongoose').Types.ObjectId;

const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_ITEM } 		        = require('../../item/helper/item.actions-constant');
const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');
const { template } = require('lodash');

/**s
 * import inter-coll, exter-coll
 */
const ITEM__FUNDA_COLL            			   = require('../../item/database/item.funda-coll'); 
const FNB_ORDER_COLL                           = require('../database/fnb.order-coll');
const FNB_SHIFT_COLL                           = require('../database/fnb.shift-coll');
const FNB_MISTAKE_COLL                         = require('../database/fnb.mistake-coll');

/**
 * import inter-model, exter-model
 */
const XlsxPopulate                      = require('xlsx-populate');
const fs                                = require('fs');
const path                              = require('path');
const { uploadFileS3 }                  = require('../../../tools/s3');

class Model extends BaseModel {

    constructor() {
        super(FNB_MISTAKE_COLL);
    }

    /**
     * Name: Insert 
     * Author: HiepNH
     * Code: 24/11/2022
     */
    insert({ mistakeID, executorID, fundaID, orderID, type, amount, bonus, note, files, userID, companyID, date }) {
        // console.log({ mistakeID, executorID, fundaID, orderID, type, amount, bonus, note, files, userID, date })
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs(mistakeID) || !checkObjectIDs(executorID) || !checkObjectIDs(userID))
                    return resolve({ error: true, message: 'orderID|userID invalid', keyError: KEY_ERROR.PARAMS_INVALID })

                let infoFunda    
                if(checkObjectIDs(fundaID)){
                    infoFunda = await ITEM__FUNDA_COLL.findById(fundaID)
                }else{
                    infoFunda = await ITEM__FUNDA_COLL.findOne({company: companyID})
                }

                let countMistake = await FNB_MISTAKE_COLL.count({executor: executorID, mistake: mistakeID})
                // console.log({countMistake})

                let dataInsert = { 
                    userCreate: userID,
                    mistake: mistakeID,
                    executor: executorID, 
                    number: countMistake | 1, 
                    funda: infoFunda._id, 
                    company: infoFunda.company,
                }

                let infoOrder;
                if(orderID && checkObjectIDs(orderID)){
                    infoOrder = await FNB_ORDER_COLL.findById(orderID)
                    if(!infoOrder)
                        return resolve({ error: true, message: "Đơn hàng không tồn tại", keyError: KEY_ERROR.ITEM_EXISTED })
                    
                    let infoShift = await FNB_SHIFT_COLL.findById(infoOrder.shift)
                    if(!infoShift)
                        return resolve({ error: true, message: "Ca làm việc không tồn tại", keyError: KEY_ERROR.ITEM_EXISTED })
                    
                    dataInsert.order            = orderID
                    dataInsert.customer         = infoOrder.customer
                }

                if(checkObjectIDs(files)) {
                    dataInsert.files = files;
                }

                if(!isNaN(type)){
                    dataInsert.type = Number(type);
                }

                if(!isNaN(amount)){
                    dataInsert.amount = Number(amount);
                }

                if(!isNaN(bonus)){
                    dataInsert.bonus = Number(bonus);
                }

                if(date && date != ""){
                    dataInsert.date = date;
                }

                if(note && note != ""){
                    dataInsert.note = note;
                }
              
                let infoAfterInsert = await this.insertData(dataInsert);
                if (!infoAfterInsert)
                    return resolve({ error: true, message: 'Thêm thất bại', keyError: KEY_ERROR.INSERT_FAILED })

                /**
                 * CẬP NHẬT SỐ LỖI VÀO ĐƠN VỊ CƠ SỞ, CA LÀM VIỆC, ĐƠN HÀNG
                 */
                await ITEM__FUNDA_COLL.findByIdAndUpdate(infoFunda._id, { $inc: 
                    { numberOfMistakes: 1, amountOfMistakes: Number(amount) | 0, amountOfBonus: Number(bonus) | 0 }}, 
                    { new: true })

                if(orderID && checkObjectIDs(orderID)){
                    await FNB_SHIFT_COLL.findByIdAndUpdate(infoOrder.shift, { $inc: { numberOfMistakes: 1, amountOfMistakes: Number(amount) | 0 }}, { new: true })

                    await FNB_ORDER_COLL.findByIdAndUpdate(orderID, { $inc: { numberOfMistakes: 1, amountOfMistakes: Number(amount) | 0 }}, { new: true })
                }

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        });
    }

    /**
     * Name: Update 
     * Author: HiepNH
     * Code: 24/11/2022
     */
    update({ orderMistakeID, type, amount, bonus, note, userID}) {
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs(orderMistakeID))
                    return resolve({ error: true, message: 'orderMistakeID invalid', keyError: KEY_ERROR.PARAMS_INVALID });

                let dataUpdate = { userUpdate: userID, modifyAt: new Date() };
             
                if(!isNaN(type)){
                    dataUpdate.type = Number(type);
                }

                if(!isNaN(amount)){
                    dataUpdate.amount = Number(amount);
                }

                if(!isNaN(bonus)){
                    dataUpdate.bonus = Number(bonus);
                }

                if(note && note != ""){
                    dataUpdate.note = note;
                }
                // console.log({ dataUpdate })

                let infoAfterUpdate = await FNB_MISTAKE_COLL.findByIdAndUpdate(orderMistakeID, dataUpdate, { new: true });

                if (!infoAfterUpdate)
                    return resolve({ error: true, message: 'Cập nhật thất bại', keyError: KEY_ERROR.UPDATE_FAILED });

                /**
                 * THÔNG BÁO SOCKET VÀ CLOUD MSS
                 */

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        });
    }

    /**
     * Name: Cập nhật KPI 
     * Author: HiepNH
     * Code: 28/3/2023
     */
    updateKpi({ month, year, executorID, workingHours, quantity, score, userID, companyID }) {
        // console.log({ month, year, executorID, quantity, score, userID, companyID })
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs(executorID))
                    return resolve({ error: true, message: 'executorID invalid', keyError: KEY_ERROR.PARAMS_INVALID });

                let dataInsert, dataUpdate
                let info = await FNB_MISTAKE_COLL.findOne({ company: companyID, month, year, executor: executorID })
                
                // Thêm mới mẩu tin
                if(!info){
                    // console.log('==========TẠO MỚI KPI============')
                    dataInsert = { 
                        userCreate: userID,
                        company: companyID,
                        month,
                        year,
                        executor: executorID
                    }

                    if(!isNaN(workingHours)){
                        dataInsert.workingHours = Number(workingHours)
                    }

                    if(!isNaN(quantity)){
                        dataInsert.quantity = Number(quantity)
                    }

                    if(!isNaN(score)){
                        dataInsert.score = Number(score)
                    }

                    let infoAfterInsert = await this.insertData(dataInsert)
                    if (!infoAfterInsert)
                        return resolve({ error: true, message: 'Thêm thất bại', keyError: KEY_ERROR.INSERT_FAILED })

                    return resolve({ error: false, data: infoAfterInsert })
                }

                // Cập nhật mẩu tin
                else{
                    // console.log('==========CẬP NHẬT KPI============')
                    dataUpdate = { 
                        userUpdate: userID, 
                        modifyAt: new Date() 
                    }

                    if(!isNaN(workingHours)){
                        dataUpdate.workingHours = Number(workingHours)
                    }
                        
                    if(!isNaN(quantity)){
                        dataUpdate.quantity = Number(quantity)
                    }

                    if(!isNaN(score)){
                        dataUpdate.score = Number(score)
                    }

                    let infoAfterUpdate = await FNB_MISTAKE_COLL.findByIdAndUpdate(info._id, dataUpdate, { new: true })
                    if (!infoAfterUpdate)
                        return resolve({ error: true, message: 'Cập nhật thất bại', keyError: KEY_ERROR.UPDATE_FAILED })

                    return resolve({ error: false, data: infoAfterUpdate })
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Get info 
     * Author: HiepNH
     * Code: 24/11/2022
     */
    getInfo({ orderMistakeID, select, populates={} }) {
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs(orderMistakeID))
                    return resolve({ error: true, message: 'param_invalid' });

                // populate
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

                let infoPlanGroup = await FNB_MISTAKE_COLL.findById(orderMistakeID)
                                    .select(select)
                                    .populate(populates)

                if (!infoPlanGroup) return resolve({ error: true, message: 'cannot_get', keyError: KEY_ERROR.GET_INFO_FAILED });

                return resolve({ error: false, data: infoPlanGroup });
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        });
    }

    /**
     * Name  : Get list
     * Author: HiepNH
     * Code: 24/11/2022
     */
    getList({ companyID, fundasID, executorID, orderID, mistakeID, fromDate, toDate, salesChannel, keyword, limit = 10, lastestID, select, populates, sortKey, month, year, userID, option }) {
        // console.log({ companyID, fundasID, orderID, mistakeID, fromDate, toDate, salesChannel, keyword, limit, lastestID, select, populates, sortKey, userID, option })
        return new Promise(async (resolve) => {
            try {
                if(Number(limit) > 20){
                    limit = 20;
                } else{
                    limit = +Number(limit);
                }

                let conditionObj = {company: companyID}
                let sortBy;
                let keys	 = ['createAt__-1', '_id__-1'];
                // console.log(keys)
                // keys = JSON.parse(sortKey)
                // console.log(keys)

                // Gom nhóm theo đơn vị cơ sở
                if(fundasID && fundasID.length ){
                    const validation = validateParamsObjectID({
                        fundasID            : { value: fundasID, isRequire: false },
                    });
                    if(validation.error) return resolve(validation);

                    let arrFun = fundasID.map(item=>ObjectID(item))
                    conditionObj.funda = { $in: arrFun }
                }

                // Gom nhóm theo đơn hàng cụ thể
                if(orderID && checkObjectIDs(orderID)){
                    conditionObj.order = ObjectID(orderID)
                }
                
                // Gom nhóm theo lỗi cụ thể
                if(mistakeID && checkObjectIDs(mistakeID)){
                    conditionObj.mistake = ObjectID(mistakeID)
                }

                // Gom nhóm theo Nhân sự mắc lỗi
                if(executorID && checkObjectIDs(executorID)){
                    conditionObj.executor = ObjectID(executorID)
                }

                // Phân loại kênh bán hàng
                if(salesChannel && Number(salesChannel) > 0){
                    conditionObj.salesChannel = Number(salesChannel)
                }

                // Phân loại theo thời khoảng
                if(fromDate && toDate){
                    conditionObj.createAt = {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate),
                    }
                }

                // Chi tiết lỗi của userID
                if(option && option == 1){
                    if(month & year){
                        conditionObj.$where = `return this.createAt.getMonth() === ${Number(month - 1)} && this.createAt.getFullYear() === ${Number(year)}`
                    }
                }	

                /**
                 * ĐIỀU KIỆN KHÁC
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

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    const regSearch = new RegExp(keyword, 'i');

                    conditionObj.$or = [
                        { name: regSearch },
                        { sign: regSearch },
                    ]
                }

                if(select && typeof select === 'string'){
                    if(!IsJsonString(select))
                        return resolve({ error: true, message: 'Request params select invalid', status: 400 });

                    select = JSON.parse(select);
                }
                // console.log(conditionObj)
 
                let conditionObjOrg = { ...conditionObj };

                if(lastestID && checkObjectIDs(lastestID)){
                    let infoData = await FNB_MISTAKE_COLL.findById(lastestID);
                    if(!infoData)
                        return resolve({ error: true, message: "Can't get info last message", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
                    if(!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({ error: true, message: "Can't get range pagination", status: 400 });
                    conditionObj  = dataPagingAndSort.data.find;
                    sortBy        = dataPagingAndSort.data.sort;
                }else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy                = dataPagingAndSort.data.sort;
                }
                // console.log({sortBy})

                let infoDataAfterGet = await FNB_MISTAKE_COLL.find(conditionObj)
                    .limit(limit+1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();
                    // console.log(infoDataAfterGet)

                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data", status: 403 });

                let nextCursor	= null;
                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]?._id;
                        infoDataAfterGet.length = limit;
                    }
                }
                let totalRecord = await FNB_MISTAKE_COLL.count(conditionObjOrg);
                let totalPage   = Math.ceil(totalRecord/limit);

                return resolve({ error: false, data: {
                    listRecords: infoDataAfterGet,
                    limit: limit,
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
     * Name: Danh sách theo phân loại
     * Author: HiepNH
     * Code: 24/11/2022
     */
    getListByProperty({ option, companyID, mistakeID, executorID, optionGroup, optionTime, fundasID, year, month, fromDate, toDate, userID }) { 
        // console.log({ option, mistakeID, executorID, optionGroup, optionTime, fundasID, year, fromDate, toDate, userID })
        return new Promise(async (resolve) => {
            try {
                if(!option){
                    // Danh sách

                }else{
                    let conditionObj = {
                        company: ObjectID(companyID),
                        mistake: { $exists: true, $ne: null }
                    }
                    let conditionGroup = {}
                    let conditionObjYear = {}, conditionPopulate = {}, sortBy = {"quantity": -1}

                    const validation = validateParamsObjectID({
                        fundasID            : { value: fundasID, isRequire: false },
                    });
                    if(validation.error) return resolve(validation);

                    // Gom nhóm theo đơn vị cơ sở
                    if(fundasID && fundasID.length ){
                        let arrFun = fundasID.map(item=>ObjectID(item))
                        conditionObj.funda = { $in: arrFun }
                    }

                    // Phân loại theo thời khoảng
                    if(fromDate && toDate){
                        conditionObj.createAt = {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate),
                        }
                    }

                    /**
                     * Gom nhóm theo các loại lỗi
                     */
                    if(option && Number(option) == 1){
                        conditionGroup = {
                            _id: { mistake: "$mistake" },
                            quantity: { $sum: 1 },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.mistake',
                            select: '_id name sign',
                            model: 'doctype'
                        }
                    }

                    /**
                     * Gom nhóm theo thời gian
                     */
                    else if(option && Number(option) == 2){
                        // Theo năm
                        if(optionTime && Number(optionTime) == 1){
                            conditionGroup = {
                                _id: { year: "$year" },
                                quantity: { $sum: 1 },
                            }
                        }
                        
                        // Theo tháng trong năm
                        if(optionTime && Number(optionTime) == 2){
                            if(!isNaN(year) && Number(year) >= 0){
                                conditionObjYear = {
                                    "year": Number(year),
                                }
                            }
    
                            conditionGroup = {
                                _id: { month: "$month", year: "$year" },
                                quantity: { $sum: 1 },
                            }
                        }  

                        // Theo giờ trong ngày
                        if(optionTime && Number(optionTime) == 3){    
                            conditionGroup = {
                                _id: { hour: "$hour" },
                                quantity: { $sum: 1 },
                            }
                        } 
                    }

                    /**
                     * Gom nhóm theo đơn vị cơ sở
                     */
                    else if(option && Number(option) == 3){
                        if(mistakeID && checkObjectIDs(mistakeID)){
                            conditionObj.mistake = ObjectID(mistakeID)

                            conditionGroup = {
                                _id: { funda: "$funda" },
                                quantity: { $sum: 1 },
                            }
    
                            conditionPopulate = {
                                path: '_id.funda',
                                select: '_id name sign image',
                                model: 'funda'
                            }
                        }else{
                            conditionGroup = {
                                _id: { funda: "$funda" },
                                quantity: { $sum: 1 },
                            }
    
                            conditionPopulate = {
                                path: '_id.funda',
                                select: '_id name sign image',
                                model: 'funda'
                            }
                        }
                    }

                     /**
                     * Gom nhóm theo Nhân sự + Lỗi mắc phải
                     */
                     else if(option && Number(option) == 4){
                        if(mistakeID){
                            conditionObj.mistake = ObjectID(mistakeID)
                        }

                        if(executorID){
                            conditionObj.executor = ObjectID(executorID)
                        }

                        conditionGroup = {
                            _id: { mistake: "$mistake" },
                            quantity: { $sum: 1 },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.mistake',
                            select: '_id name sign',
                            model: 'doctype'
                        }
                    }

                    /**
                     * Gom nhóm theo Nhân sự mắc lỗi/Lỗi của tôi
                     */
                    else if(option && Number(option) == 5){
                        conditionObj.executor = ObjectID(userID)

                        conditionGroup = {
                            _id: { mistake: "$mistake" },
                            quantity: { $sum: 1 },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.mistake',
                            select: '_id name sign',
                            model: 'doctype'
                        }
                    }

                    /**
                     * KPI nhân sự
                     */
                    else if(option && Number(option) == 6){
                        conditionObj = {
                            company: ObjectID(companyID),
                            executor: ObjectID(executorID),
                            year: Number(year),
                        }

                        // Theo năm
                        if(optionTime && Number(optionTime) == 1){
                            conditionGroup = {
                                _id: { year: "$year" },
                                number: { $sum: 1 },
                                workingHours: { $sum: "$workingHours" },
                                quantity: { $sum: "$quantity" },
                                score: { $sum: "$score" }
                            }
                        }
                        
                        // Theo tháng trong năm
                        if(optionTime && Number(optionTime) == 2){
                            if(!isNaN(year) && Number(year) >= 0){
                                conditionObjYear = {
                                    "year": Number(year),
                                }
                            }

                            if(!isNaN(month) && Number(month) >= 0){
                                conditionObjYear = {
                                    "year": Number(year),
                                    "month": Number(month),
                                }
                            }
    
                            conditionGroup = {
                                _id: { month: "$month", year: "$year" },
                                number: { $sum: 1 },
                                workingHours: { $sum: "$workingHours" },
                                quantity: { $sum: "$quantity" },
                                score: { $sum: "$score" }
                            }
                        }  

                        sortBy = {"_id.month": 1}
                    }

                    // Tổng hợp KPI theo user/tháng/năm
                    else if(option && Number(option) == 7){
                        if(executorID && checkObjectIDs(executorID)){
                            conditionObj.executor = ObjectID(executorID)
                        }

                        conditionObjYear = {
                            "year": Number(year),
                        }

                        conditionGroup = {
                            _id: { month: "$month", year: "$year" },
                            quantity: { $sum: 1 },
                            amount: { $sum: "$amount" },
                            bonus: { $sum: "$bonus" },
                        } 
                    }

                    // console.log(conditionObj)
                    // console.log(conditionPopulate)
                    // console.log(conditionObjYear)
                    // console.log(conditionGroup)

                    let listData

                    if(option != 6){
                        listData = await FNB_MISTAKE_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $project : {
                                    year : {$year : "$createAt"},
                                    month : {$month : "$createAt"},
                                    hour : {$hour : "$createAt"},
                                    funda : 1,
                                    mistake : 1,
                                    order : 1,
                                    product : 1,
                                    executor : 1,
                                    type : 1,
                                    customer : 1,
                                    internal : 1,
                                    area1 : 1,
                                    area2 : 1,
                                    area3 : 1,
                                    seasons : 1,
                                    shift : 1,
                                    shiftType : 1,
                                    salesChannel : 1,
                                    service : 1,
                                    status : 1,
                                    amount : 1,
                                    quantity : 1,
                                    score : 1,
                                    bonus : 1,
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
                    }else{
                        listData = await FNB_MISTAKE_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $project : {
                                    year: 1,
                                    month: 1,
                                    executor : 1,
                                    workingHours : 1,
                                    quantity : 1,
                                    score : 1,
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
                    }

                    if(!isNaN(option) && [1,3,4,5].includes(Number(option))){
                        await FNB_MISTAKE_COLL.populate(listData, conditionPopulate)
                    }

                    return resolve({ error: false, data: listData });
                }
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Import Excel
     * Code: Hiepnh
     * Date: 21/3/2024
     */
    importFromExcel({ option, companyID, dataImport, userID }) {
        // console.log({option, companyID, dataImport, userID})
        return new Promise(async resolve => {
            try {
                const dataImportJSON = JSON.parse(dataImport);
                let index = 0;
                let errorNumber = 0;

                if(!option){
                    for (const data of dataImportJSON) {
                        if(index > 0 && index <= 100){
                            // console.log(data)
                            let dataInsert = {
                                userID, 
                                companyID,
                                type: data?.__EMPTY_2, 
                                fundaID: data?.__EMPTY_6, 
                                executorID: data?.__EMPTY_7, 
                                mistakeID: data?.__EMPTY_8, 
                                date: data?.__EMPTY_9, 
                                amount: data?.__EMPTY_3, 
                                bonus: data?.__EMPTY_4, 
                                note: data?.__EMPTY_5, 
                            }
                            // console.log(dataInsert)
    
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
                    
                }
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Dev: HiepNH
     * Func: Tải dữ liệu
     * Date: 15/2/2023
     */
    exportExcel({ companyID, userID, fundaID, fromDate, toDate, month, year }) {
        // console.log({ companyID, year, month, userID })
        return new Promise(async resolve => {
            try {
                let yearFilter
                let currentYear = new Date().getFullYear()
                let currentMonth = new Date().getMonth() + 1

                if(fromDate && toDate){
                    currentMonth = new Date(toDate).getMonth() + 1
                    currentYear = new Date(toDate).getFullYear()
                }

                if(year && !isNaN(year)){
                    yearFilter = Number(year)
                }else{
                    yearFilter = Number(currentYear)
                }

                let conditionObjYear = {
                    "year": Number(yearFilter)
                }

                let conditionPopulate = {
                    path: '_id.executor',
                    select: '_id fullname department',
                    populate: {
                        path: 'department',
                        select: '_id name',
                        model: 'department',
                    },
                    model: 'user'
                }
                
                let listDataErrCombine3 = await FNB_MISTAKE_COLL.aggregate([
                    {
                        $match: {
                            company: ObjectID(companyID),
                        }
                    },
                    {
                        $project :  {
                            year : {$year : "$createAt"},
                            month : {$month : "$createAt"},
                            createAt: 1,
                            company : 1,
                            funda : 1,
                            mistake : 1,
                            executor: 1,
                            amount: 1,
                            userCreate: 1,
                        }
                    },
                    {
                        $match: conditionObjYear
                    },
                    {
                        $group: {
                            _id: { executor: "$userCreate" },
                            number: { $sum: 1 },
                            amount: { $sum: "$amount"},
                        }
                    },
                    {
                        $sort: { "number": -1, "_id.executor": -1}
                    }
                ])
                await FNB_MISTAKE_COLL.populate(listDataErrCombine3, conditionPopulate)
                // console.log(listDataErrCombine3)

                let listDataErrCombine4 = await FNB_MISTAKE_COLL.aggregate([
                    {
                        $match: {
                            company: ObjectID(companyID),
                        }
                    },
                    {
                        $project :  {
                            year : {$year : "$createAt"},
                            month : {$month : "$createAt"},
                            createAt: 1,
                            company : 1,
                            funda : 1,
                            mistake : 1,
                            executor: 1,
                            amount: 1,
                            userCreate: 1,
                        }
                    },
                    {
                        $match: conditionObjYear
                    },
                    {
                        $group: {
                            _id: { executor: "$userCreate", month: "$month" },
                            number: { $sum: 1 },
                            amount: { $sum: "$amount"},
                        }
                    },
                    {
                        $sort: { "number": -1, "_id.executor": -1}
                    }
                ])
                await FNB_MISTAKE_COLL.populate(listDataErrCombine4, conditionPopulate)
               
                // Modify the workbook.
                XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/fnb_export_mistake.xlsx')))
                .then(async workbook => {
                    workbook.sheet("DashBoard").row(1).cell(1).value(`BÁO CÁO TỔNG HỢP ${yearFilter}`)

                    var i = 4;
                    listDataErrCombine3?.forEach((item, index) => {
                        workbook.sheet("DashBoard").row(i).cell(1).value(Number(index+1));
                        workbook.sheet("DashBoard").row(i).cell(2).value(item?._id?.executor?.fullname);
                        i++
                    });

                    var i = 4;
                    listDataErrCombine3?.forEach((item, index) => {
                        for(var m=1; m<=12; m++){
                            listDataErrCombine4?.forEach((mistake) => {
                                if(mistake._id.executor._id.toString() === item._id.executor._id.toString() && Number(mistake._id.month) === Number(m)){
                                    workbook.sheet("DashBoard").row(i).cell(m*2+2).value(mistake?.number)
                                    workbook.sheet("DashBoard").row(i).cell(m*2+3).value(mistake?.amount)
                                }
                            })
                        }
                        i++
                    });
                   
                    const now = new Date();
                    const filePath = '../../../files/temporary_uploads/';
                    const fileName = `BaoCaoLoi_${now.getTime()}.xlsx`;
                    const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                    await workbook.toFileAsync(pathWriteFile);
                    const result = await uploadFileS3(pathWriteFile, fileName);

                    fs.unlinkSync(pathWriteFile);
                    return resolve({ error: false, data: result?.Location, status: 200 });
                });

            } catch (error) {
                console.log({ error })
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model;