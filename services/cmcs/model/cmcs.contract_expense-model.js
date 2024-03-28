"use strict";

const ObjectID                          = require('mongoose').Types.ObjectId;
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }  = require('../../../tools/utils/utils');
const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_ITEM } 		        = require('../../item/helper/item.actions-constant');

/**
 * import inter-coll, exter-coll
 */
const CMCS__CONTRACT_EXPENSE_COLL       = require('../database/cmcs.contract_expense-coll');

const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');
const { KEY_ERROR }                     = require('../../../tools/keys/index');

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
    constructor() {
        super(CMCS__CONTRACT_EXPENSE_COLL);
    }
    /**
     * Name: insert contract payment 
     * Author: Depv
     */
    insert({ contractID, subtype, date, name, note, value, userID, ctx  }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * Bước 1: Cập nhật thông tin vào Hợp đồng
                 * Bước 2: Cập nhật thông tin vào Dự án
                 */
                const infoContract = await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_INFO_AND_GET_LIST}`, {
                    contractID
                })

                if(infoContract.error)
                    return resolve({ error: true, message: "Hợp đồng không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID });

                const { outin, real, field, dependentUnit, personInCharge, chair, buyerInfo, sellerInfo, company, project } = infoContract.data;

                let dataInsert = { userCreate: userID, outin, real, field, dependentUnit, personInCharge, chair, buyerInfo, sellerInfo, company, project, contract: contractID };

                if(!isNaN(subtype) && Number(subtype) > 0){
                    dataInsert.subtype = Number(subtype)
                }

                if(date){
                    dataInsert.date = date;
                }

                if(name){
                    dataInsert.name = name;
                }

                if(note){
                    dataInsert.note = note;
                }

                if(!isNaN(value) && Number(value) >= 0){
                    dataInsert.value = Number(value)
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: "Thêm thất bại", keyError: KEY_ERROR.INSERT_FAILED });

                /**
                 * CẬP NHẬT CHO PHẦN HỢP ĐỒNG
                 */   
                await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_UPDATE_VALUE}`, {
                    option: 3,
                    contractID,
                    userID
                }) 

                return resolve({ error: false, data: infoAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: update contract payment 
     * Author: Depv
     */
    update({ expenseID, subtype, date, name, note, value, userID, ctx  }){
        console.log({ expenseID, subtype, date, name, note, value, userID })
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * Bước 1: Cập nhật thông tin vào Hợp đồng
                 * Bước 2: Cập nhật thông tin vào dự án => Nếu là dòng tiền của hợp đồng mua vào
                 */
                
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { userUpdate: userID };
                if(!checkObjectIDs(expenseID))
                    return resolve({ error: true, message: "expenseID không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID })

                let infoExpense = await CMCS__CONTRACT_EXPENSE_COLL.findById(expenseID);
                if(!infoExpense)
                    return resolve({ error: true, message: "Payment không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID });

                let contractID = infoExpense.contract;

                if(!isNaN(subtype) && Number(subtype) > 0){
                    dataUpdate.subtype = Number(subtype)
                }

                if(date){
                    dataUpdate.date = date;
                }

                if(name){
                    dataUpdate.name = name;
                }

                if(note){
                    dataUpdate.note = note;
                }

                if(!isNaN(value) && Number(value) >= 0){
                    dataUpdate.value = Number(value)
                }

                let infoAfterUpdate = await CMCS__CONTRACT_EXPENSE_COLL.findByIdAndUpdate(expenseID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: KEY_ERROR.UPDATE_FAILED });

                /**
                 * CẬP NHẬT CHO PHẦN HỢP ĐỒNG
                 */   
                await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_UPDATE_VALUE}`, {
                    option: 3,
                    contractID: `${contractID}`,
                    userID
                }) 

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Remove contract payment 
     * Author: Depv
     */

    /**
     * Name: get info contract payment 
     * Author: Depv
     */
    getInfo({ expenseID, select, populates }){
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(expenseID))
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

                let infoExpense = await CMCS__CONTRACT_EXPENSE_COLL.findById(expenseID)
                                .select(select)
                                .populate(populates)

				if (!infoExpense) return resolve({ error: true, message: 'cannot_get' });

                return resolve({ error: false, data: infoExpense });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name  : Danh sách contract payment 
     * Author: Depv
     */
    getList({ contractID,
        keyword, limit = 10, lastestID, select, populates= {} }) {
        return new Promise(async (resolve) => {
            try {
                if(limit > 20){
                    limit = 20;
                } else{
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

                if(contractID && checkObjectIDs(contractID)){
                    conditionObj.contract = contractID;
                }

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    let regExpSearch = RegExp(keyword, 'i');
                    conditionObj.name = regExpSearch;
                }

                let conditionObjOrg = { ...conditionObj };
                if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await CMCS__CONTRACT_EXPENSE_COLL.findById(lastestID);
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

                let infoDataAfterGet = await CMCS__CONTRACT_EXPENSE_COLL.find(conditionObj)
                    .limit(limit+1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data" });

                let nextCursor	= null;
                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await CMCS__CONTRACT_EXPENSE_COLL.count(conditionObjOrg);
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
     * Name: Danh sách theo tháng trong năm
     * Author: Hiepnh
     * Date: 05/04/2022
     */
     getListByMonth({ userID, companyID, projectID, contractID, month, year, type, outin, real, field, dependentUnit, personInCharge, chair, buyerInfo, sellerInfo, 
        keyword, limit = 20, lastestID, select, populates= {} }){
        return new Promise(async resolve => {
            try {
                if(limit > 20){
                    limit = 20;
                } else{
                    limit = +limit;
                }

                let sortBy;
                let conditionObj = {};
                let keys	     = ['createAt__-1', '_id__-1'];

                // Điều kiện để Aggregate
                let conditionObjAgg = {}, conditionObjYear = {}

                if(month && Number(month) > 0){
                    conditionObjYear.month = Number(month)
                    conditionObjYear.year = Number(year)
                }else{
                    conditionObjYear.year = Number(year)
                }

                if(type && Number(type) > 0){
                    conditionObjAgg.type = Number(type)
                }

                if(outin && Number(outin) > 0){
                    conditionObjAgg.outin = Number(outin)
                }

                if(real && Number(real) > 0){
                    conditionObjAgg.real = Number(real)
                }

                if(field && checkObjectIDs(field)){
                    conditionObjAgg.field = ObjectID(field)
                }

                if(dependentUnit && checkObjectIDs(dependentUnit)){
                    conditionObjAgg.dependentUnit = ObjectID(dependentUnit)
                }

                if(chair && checkObjectIDs(chair)){
                    conditionObjAgg.chair = ObjectID(chair)
                }

                if(personInCharge && checkObjectIDs(personInCharge)){
                    conditionObjAgg.personInCharge = ObjectID(personInCharge)
                }

                if(buyerInfo && checkObjectIDs(buyerInfo)){
                    conditionObjAgg.buyerInfo = ObjectID(buyerInfo)
                }

                if(sellerInfo && checkObjectIDs(sellerInfo)){
                    conditionObjAgg.sellerInfo = ObjectID(sellerInfo)
                }

                if(contractID && checkObjectIDs(contractID)){
                    conditionObjAgg.contract = ObjectID(contractID)
                }else{
                    if(projectID && checkObjectIDs(projectID)){
                        conditionObjAgg.project = ObjectID(projectID)
                    }else{
                        if(companyID && checkObjectIDs(companyID)){
                            conditionObjAgg.company = ObjectID(companyID)
                        }
                    }
                }

                console.log('++++++++++++++++++++++++++++++')
                console.log(conditionObjAgg)
                console.log(conditionObjYear)

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

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    let regExpSearch = RegExp(keyword, 'i');
                    conditionObj.name = regExpSearch;
                }

                // Danh sách các Payment trong tháng, năm của công ty
                let listData = await CMCS__CONTRACT_EXPENSE_COLL.aggregate([
                    {
                        $match: conditionObjAgg
                    },
                    {
                        $project : {
                            year : {$year : "$date"},
                            month : {$month : "$date"},
                        }
                    },
                    {
                        $match: conditionObjYear
                    },
                    {$sort: {"date": 1}}
                ])

                console.log(conditionObjAgg)
                console.log(listData)

                conditionObj._id = {$in: listData.map(item=>item._id)}

                // Trả về danh sách mẩu tin
                let conditionObjOrg = { ...conditionObj };

                if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await CMCS__CONTRACT_EXPENSE_COLL.findById(lastestID);
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

                let infoDataAfterGet = await CMCS__CONTRACT_EXPENSE_COLL.find(conditionObj)
                    .limit(limit+1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data" });

                let nextCursor	= null;
                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await CMCS__CONTRACT_EXPENSE_COLL.count(conditionObjOrg);
                let totalPage   = Math.ceil(totalRecord/limit);

                return resolve({ error: false, data: {
                    listRecords: infoDataAfterGet,
                    limit: +limit,
                    totalRecord,
                    totalPage,
                    nextCursor,
                }, status: 200 });

            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    } 

    /**
     * Name: Gom nhóm theo tháng trong năm (BỎ)
     * Author: Hiepnh
     * Date: 04/04/2022
     */
    getAmountByMonth({ userID, companyID, projectID, outin, year, ctx }){
        console.log({userID, companyID, projectID, outin, year})
        return new Promise(async resolve => {
            try {
                /**
                 * BA
                 * 1-Áp dụng cho công ty
                 * 2-Áp dụng cho dự án
                 */
                let conditionObj = {}, conditionGroup = {}, conditionObjYear = {}

                if(projectID && checkObjectIDs(projectID)){
                    conditionObj.project = ObjectID(projectID)

                    conditionGroup = {
                        _id: { month: "$month", year: "$year" },
                        amount: { $sum: "$amount" },
                    }
                }else{
                    if(companyID && checkObjectIDs(companyID)){
                        conditionObj.company = ObjectID(companyID)
    
                        conditionGroup = {
                            _id: { month: "$month" },
                            amount: { $sum: "$amount" },
                        }
                    }
                }

                if(!isNaN(outin) && Number(outin) > 0){
                    conditionObj.outin = Number(outin)
                }

                if(!isNaN(year) && Number(year) > 0){
                    conditionObjYear = {
                        "year": Number(year),
                    }
                }

                // console.log(conditionObj)
                // console.log(conditionObjYear)
                // console.log(conditionGroup)

                let listData = await CMCS__CONTRACT_EXPENSE_COLL.aggregate([
                    {
                        $match: conditionObj
                    }, 
                    {
                        $project : { 
                            year : {$year : "$date"},
                            month : {$month : "$date"},
                            amount: { $sum: ["$value"] },
                        }
                    },
                    {
                        $match: conditionObjYear
                    }, 
                    {
                        $group: conditionGroup
                    },
                    {
                        $sort: {
                            "_id.year": 1,
                            "_id.month": 1,
                        }
                    } 
                ])
                console.log(listData)

                return resolve({ error: false, data: listData });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Gom nhóm theo đối tượng 
     * Author: Hiepnh
     * Date: 16/04/2022
     */
    getAmountByObject({ userID, outin, companyID, projectID, contractID }){
        console.log('=================EXPENSE:getAmountByObject==>>>>>>>>>>>')
        console.log({ userID, outin, companyID, projectID, contractID })
        return new Promise(async resolve => {
            try {
                /**
                 * BA
                 * Phục vụ cập nhật thông tin cho hợp đồng, dự án, công ty
                 */
                let value = 0

                let conditionObj = { }

                // if(!isNaN(outin) && Number(outin) >= 0){
                //     conditionObj.outin = outin
                // }

                if(contractID && checkObjectIDs(contractID)){
                    conditionObj.contract = ObjectID(contractID)
                }else{
                    if(projectID && checkObjectIDs(projectID)){
                        conditionObj.project = ObjectID(projectID)
                    }else{
                        if(companyID && checkObjectIDs(companyID)){
                            conditionObj.company = ObjectID(companyID)
                        }
                    }
                }

                console.log(conditionObj)

                let listData = await CMCS__CONTRACT_EXPENSE_COLL.aggregate([
                    {
                        $match: conditionObj
                    }, 
                    {
                        $group: {
                            _id: { },
                            value: { $sum: "$value" },
                        }
                    }, 
                ])

                if(listData && listData.length){
                    value = Number(listData[0].value)
                }

                return resolve({ error: false, data: { value } });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Gom nhóm theo thuộc tính 
     * Author: Hiepnh
     * Date: 17/04/2022
     */
    getAmountByProperty({ userID, type, outin, real, companyID, projectID, contractID, year, optionTime, optionProperty, ctx }){
        console.log({ userID, type, outin, real, companyID, projectID, contractID, year, optionTime, optionProperty })
        return new Promise(async resolve => {
            try {
                /**
                 * BA
                 * optionTime: Báo cáo theo trục thời gian
                 * optionProperty: Báo cáo theo tính chất/phân loại
                 * 1-Báo cáo theo phân loại: Giá trị ký, Sản lượng, Doanh thu, Tiền về
                 * 2.1-Tính tổng Tất cả-Theo năm (1)/Theo tháng (2)
                 * 2.2-Tính tổng theo thuộc tính: Lĩnh vực (1)/Người mua (2)/Người bán (3)/Đơn vị (4)/Chủ trì (5)
                 * 2.3-Tính tổng kết hợp
                 */
                let conditionObj = {}, conditionGroup = {}, conditionObjYear = {}, conditionPopulate = {}, sortBy = {"amount": 1}

                if(type && Number(type) > 0){
                    conditionObj.type = Number(type)
                }

                if(outin && Number(outin) > 0){
                    conditionObj.outin = Number(outin)
                }

                if(real && Number(real) > 0){
                    conditionObj.real = Number(real)
                }

                if(contractID && checkObjectIDs(contractID)){
                    conditionObj.contract = ObjectID(contractID)
                }else{
                    if(projectID && checkObjectIDs(projectID)){
                        conditionObj.project = ObjectID(projectID)
                    }else{
                        if(companyID && checkObjectIDs(companyID)){
                            conditionObj.company = ObjectID(companyID)
                        }
                    }
                }

                console.log(conditionObj)

                // TÍNH TỔNG THEO TẤT CẢ/THEO NĂM
                if(Number(optionTime) === 1){
                    conditionGroup = {
                        _id: { },
                        amount: { $sum: "$amount" },
                    }

                    if(!isNaN(year) && Number(year) >= 0){
                        conditionObjYear = {
                            "year": Number(year),
                        }
                    }

                    // Theo Lĩnh vực
                    if(Number(optionProperty) === 1){
                        conditionGroup = {
                            _id: { field: "$field" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.field',
                            select: '_id name sign',
                            model: 'doctype'
                        }

                        sortBy = {
                            "_id.field": 1,
                        }
                    }

                    // Theo Người mua
                    if(Number(optionProperty) === 2){
                        conditionGroup = {
                            _id: { buyerInfo: "$buyerInfo" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.buyerInfo',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.buyerInfo": 1,
                        }
                    }

                    // Theo Người bán
                    if(Number(optionProperty) === 3){
                        conditionGroup = {
                            _id: { sellerInfo: "$sellerInfo" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.sellerInfo',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.sellerInfo": 1,
                        }
                    }

                    // Theo Phụ trách
                    if(Number(optionProperty) === 4){
                        conditionGroup = {
                            _id: { personInCharge: "$personInCharge" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.personInCharge',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.personInCharge": 1,
                        }
                    }

                    // Theo Chủ trì
                    if(Number(optionProperty) === 5){
                        conditionGroup = {
                            _id: { chair: "$chair" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.chair',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.chair": 1,
                        }
                    }

                    // Theo Đơn vị
                    if(Number(optionProperty) === 6){
                        conditionGroup = {
                            _id: { dependentUnit: "$dependentUnit" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.dependentUnit',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.dependentUnit": 1,
                        }
                    }
                }

                // TÍNH TỔNG THEO THÁNG
                if(Number(optionTime) === 2){
                    conditionGroup = {
                        _id: { month: "$month", year: "$year" },
                        amount: { $sum: "$amount" },
                    }

                    // Theo tháng trong một năm cụ thể
                    if(!isNaN(year) && Number(year) >= 0){
                        conditionObjYear = {
                            "year": Number(year),
                        }
                    }

                    // Theo Lĩnh vực
                    if(Number(optionProperty) === 1){
                        conditionGroup = {
                            _id: { field: "$field", month: "$month", year: "$year" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.field',
                            select: '_id name sign',
                            model: 'doctype'
                        }

                        sortBy = {
                            "_id.field": 1,
                        }
                    }

                    // Theo Người mua
                    if(Number(optionProperty) === 2){
                        conditionGroup = {
                            _id: { buyerInfo: "$buyerInfo", month: "$month", year: "$year" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.buyerInfo',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.buyerInfo": 1,
                        }
                    }

                    // Theo Người bán
                    if(Number(optionProperty) === 3){
                        conditionGroup = {
                            _id: { sellerInfo: "$sellerInfo", month: "$month", year: "$year" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.sellerInfo',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.sellerInfo": 1,
                        }
                    }

                    // Theo Phụ trách
                    if(Number(optionProperty) === 4){
                        conditionGroup = {
                            _id: { personInCharge: "$personInCharge", month: "$month", year: "$year" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.personInCharge',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.personInCharge": 1,
                        }
                    }

                    // Theo Chủ trì
                    if(Number(optionProperty) === 5){
                        conditionGroup = {
                            _id: { chair: "$chair", month: "$month", year: "$year" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.chair',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.chair": 1,
                        }
                    }

                    // Theo Đơn vị
                    if(Number(optionProperty) === 6){
                        conditionGroup = {
                            _id: { dependentUnit: "$dependentUnit", month: "$month", year: "$year" },
                            amount: { $sum: "$amount" },
                        }

                        conditionPopulate = {
                            path: '_id.dependentUnit',
                            select: '_id name sign',
                            model: 'contact'
                        }

                        sortBy = {
                            "_id.dependentUnit": 1,
                        }
                    }
                }

                console.log(conditionObj)
                console.log(conditionObjYear)
                console.log(conditionGroup)

                let listData = await CMCS__CONTRACT_EXPENSE_COLL.aggregate([
                    {
                        $match: conditionObj
                    }, 
                    {
                        $project : { 
                            year : {$year : "$date"},
                            month : {$month : "$date"},
                            amount: { $sum: ["$value"] },
                            type: 1,
                            outin: 1,
                            real: 1,
                            field: 1,
                            buyerInfo: 1,
                            chair: 1,
                            personInCharge: 1,
                            dependentUnit: 1
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

                if(!isNaN(optionProperty) && Number(optionProperty) > 0){
                    await CMCS__CONTRACT_EXPENSE_COLL.populate(listData, conditionPopulate)
                }

                return resolve({ error: false, data: listData });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;