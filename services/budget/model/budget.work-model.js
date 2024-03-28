"use strict";
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }                        
                                        = require('../../../tools/utils/utils');
const stringUtils					    = require('../../../tools/utils/string_utils');
const { KEY_ERROR }                     = require('../../../tools/keys/index')
const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_ACCOUNTING } 		= require('../../accounting/helper/accounting.actions-constant');

const XlsxPopulate                      = require('xlsx-populate');
const fs                                = require('fs');
const path                              = require('path');
const { uploadFileS3 }                  = require('../../../tools/s3');

/**
 * import inter-coll, exter-coll
 */
const BUDGET_COLL                       = require('../database/budget-coll');
const BUDGET__ITEM_COLL                 = require('../database/budget.item-coll');
const BUDGET__GROUP_COLL                = require('../database/budget.group-coll');
const BUDGET__WORK_COLL                 = require('../database/budget.work-coll');

const BUDGET_MODEL                      = require('./budget-model').MODEL;
const BUDGET__ITEM_MODEL                = require('./budget.item-model').MODEL;
const BUDGET__GROUP_MODEL               = require('./budget.group-model').MODEL;

const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {               
    constructor() {
        super(BUDGET__WORK_COLL);
    }
    
    /**
     * Name  : Insert 
     * Author: Hiepnh
     * Date  : 10/4/2022 
     */
    insert({ userID, groupID, plus, reasonID, name, sign, unit, description, note, type, quantity, unitPrice, vatUnitPrice, amount, forecastQuantity, forecastUnitPrice, forecastAmount }) {
        // console.log({ userID, groupID, plus, reasonID, name, sign, unit, description, note, type, quantity, unitPrice, vatUnitPrice, amount, forecastQuantity, forecastUnitPrice, forecastAmount })
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Khi tạo mới/cập nhật khối lượng, đơn giá công việc-budgetWork (cả phần dự kiến còn lại):
                 * +++Cập nhật Group, Item và Budget của nó tương ứng (viết sẵn hàm Cập nhật để triệu gọi)
                 * 2-Khi có hoạch toán ngân sách: tăng, giảm (từ Accounting) => phần ngân sách đã thực hiện sẽ:
                 * +++Cập nhật cho công việc
                 * +++Cập nhật cho Group, Item và Budget
                 * 3. Không cho sửa giá trị của Item, Group và Budget => Tất cả tính theo cập nhật của BudgetWork và Accounting
                 */    
                
                if(!name || !checkObjectIDs(groupID))
                    return resolve({ error: true, message: 'date|groupID invalid', keyError: KEY_ERROR.PARAMS_INVALID, status: 400 })

                
                let infoGroup = await BUDGET__GROUP_COLL.findById(groupID);
                if(!infoGroup)
                    return resolve({ error: true, message: "groupID không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID });

                let dataInsert = { userCreate: userID, company: infoGroup.company, budget: infoGroup.budget, item: infoGroup.item, group: groupID, name };

                if(checkObjectIDs(infoGroup.project)){
                    dataInsert.project = infoGroup.project
                }
                if(checkObjectIDs(infoGroup.contract)){
                    dataInsert.contract = infoGroup.contract
                }

                if(checkObjectIDs(reasonID)){
                    dataInsert.reason = reasonID
                }

                if(plus && [0,1,2].includes(Number(plus))){
                    dataInsert.plus = plus;
                }

                if(sign && sign != ""){
                    dataInsert.sign = sign;
                }

                if(unit && unit != ""){
                    dataInsert.unit = unit;
                }

                if(description && description != ""){
                    dataInsert.description = description;
                }

                if(note && note != ""){
                    dataInsert.note = note;
                }

                let convertStr = ''
                if(name && name != ""){
                    convertStr = stringUtils.removeAccents(name)
                }
                if(sign && sign != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(sign)
                }
                if(description && description != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(description)
                }
                if(note && note != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(note)
                }
                dataInsert.namecv = convertStr

                if(!isNaN(type) && Number(type) >= 0){
                    dataInsert.type     = type;
                }

                //______Giá trị
                if(!isNaN(quantity) && Number(quantity) >= 0){
                    dataInsert.quantity     = quantity;
                }
                if(!isNaN(unitPrice) && Number(unitPrice) >= 0){
                    dataInsert.unitPrice     = unitPrice;
                    dataInsert.amount       = Number(quantity)*Number(unitPrice);
                }
                if(!isNaN(vatUnitPrice) && Number(vatUnitPrice) >= 0){
                    dataInsert.vatUnitPrice     = vatUnitPrice;
                    dataInsert.vatAmount     = Number(quantity)*Number(vatUnitPrice);
                }

                if(!isNaN(forecastQuantity) && Number(forecastQuantity) >= 0){
                    dataInsert.forecastQuantity     = forecastQuantity;
                }
                if(!isNaN(forecastUnitPrice) && Number(forecastUnitPrice) >= 0){
                    dataInsert.forecastUnitPrice     = forecastUnitPrice;
                    dataInsert.forecastAmount       = Number(forecastQuantity)*Number(forecastUnitPrice);
                }
                
                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: "can't_insert_budget_work", keyError: "can't_insert_budget_work" });

                /**
                 * CẬP NHẬT GIÁ TRỊ NGÂN SÁCH, DỰ KIẾN NGÂN SÁCH
                 */
                let InfoGroupAfterUpdate         = await BUDGET__GROUP_MODEL.updateValue({ option: 1, groupID, userID })
                let InfoItemAfterUpdate          = await BUDGET__ITEM_MODEL.updateValue({ option: 1, itemID: infoGroup.item, userID })
                let InfoBudgetAfterUpdate        = await BUDGET_MODEL.updateValue({ option: 1, budgetID: infoGroup.budget, userID })

                return resolve({ error: false, data: infoAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name  : Update 
     * Author: Hiepnh
     * Date  : 10/4/2022 
     */
    update({ 
        workID, plus, reasonID, name, sign, unit, description, note, type, quantity, unitPrice, vatUnitPrice, amount, vatAmount, forecastQuantity, forecastUnitPrice, forecastVatUnitPrice, forecastAmount, forecastVatAmount, userID
    }){ 
        // console.log({workID, plus, reasonID, name, sign, unit, description, note, type, quantity, unitPrice, vatUnitPrice, amount, vatAmount, forecastQuantity, forecastUnitPrice, forecastVatUnitPrice, forecastAmount, forecastVatAmount, userID})
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Khi tạo mới/cập nhật khối lượng, đơn giá công việc-budgetWork (cả phần dự kiến còn lại):
                 * +++Cập nhật Group, Item và Budget của nó tương ứng (viết sẵn hàm Cập nhật để triệu gọi)
                 * 2-Khi có hoạch toán ngân sách: tăng, giảm (từ Accounting) => phần ngân sách đã thực hiện sẽ:
                 * +++Cập nhật cho công việc
                 * +++Cập nhật cho Group, Item và Budget
                 * 3. Không cho sửa giá trị của Item, Group và Budget => Tất cả tính theo cập nhật của BudgetWork và Accounting
                 */  
                if(!name || !checkObjectIDs(workID))
                    return resolve({ error: true, message: "date|workID invalid", keyError: KEY_ERROR.PARAMS_INVALID, status: 400 });
                
                let infoWork = await BUDGET__WORK_COLL.findById(workID);
                if(!infoWork)
                    return resolve({ error: true, message: "workID không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID });

                let dataUpdate = { userUpdate: userID, modifyAt: new Date(), name };

                if(checkObjectIDs(reasonID)){
                    dataUpdate.reason = reasonID
                }
             
                if(plus && [0,1,2].includes(Number(plus))){
                    dataUpdate.plus = plus;
                }

                if(sign && sign != ""){
                    dataUpdate.sign = sign;
                }

                if(unit && unit != ""){
                    dataUpdate.unit = unit;
                }

                if(description && description != ""){
                    dataUpdate.description = description;
                }

                if(note && note != ""){
                    dataUpdate.note = note;
                }

                let convertStr = ''
                if(name && name != ""){
                    convertStr = stringUtils.removeAccents(name)
                }
                if(sign && sign != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(sign)
                }
                if(description && description != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(description)
                }
                if(note && note != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(note)
                }
                dataUpdate.namecv = convertStr
                
                if(!isNaN(type) && Number(type) >= 0){
                    dataUpdate.type     = type;
                }
                
                //______Giá trị
                if(!isNaN(quantity) && Number(quantity) >= 0){
                    dataUpdate.quantity     = quantity;
                }
                if(!isNaN(unitPrice) && Number(unitPrice) >= 0){
                    dataUpdate.unitPrice     = unitPrice;
                    dataUpdate.amount       = Number(quantity)*Number(unitPrice);
                }
                if(!isNaN(vatUnitPrice) && Number(vatUnitPrice) >= 0){
                    dataUpdate.vatUnitPrice     = vatUnitPrice;
                    dataUpdate.vatAmount     = Number(quantity)*Number(vatUnitPrice);
                }
                if(!isNaN(forecastQuantity) && Number(forecastQuantity) >= 0){
                    dataUpdate.forecastQuantity     = forecastQuantity;
                }
                if(!isNaN(forecastUnitPrice) && Number(forecastUnitPrice) >= 0){
                    dataUpdate.forecastUnitPrice     = forecastUnitPrice;
                    dataUpdate.forecastAmount       = Number(forecastQuantity)*Number(forecastUnitPrice);
                }
                if(!isNaN(forecastVatUnitPrice) && Number(forecastVatUnitPrice) >= 0){
                    dataUpdate.forecastVatUnitPrice     = forecastVatUnitPrice;
                    dataUpdate.forecastVatAmount       = Number(forecastQuantity)*Number(forecastVatUnitPrice);
                }                

                let infoAfterUpdate = await BUDGET__WORK_COLL.findByIdAndUpdate(workID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: "can't_update_budget_work", status: 403 });

                /**
                 * CẬP NHẬT GIÁ TRỊ NGÂN SÁCH, DỰ KIẾN NGÂN SÁCH
                 */
                 let InfoGroupAfterUpdate         = await BUDGET__GROUP_MODEL.updateValue({ option: 1, groupID: infoWork.group, userID })
                 let InfoItemAfterUpdate          = await BUDGET__ITEM_MODEL.updateValue({ option: 1, itemID: infoWork.item, userID })
                 let InfoBudgetAfterUpdate        = await BUDGET_MODEL.updateValue({ option: 1, budgetID: infoWork.budget, userID })                  

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
    getInfo({ workID, 
        select, populates }){
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(workID))
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

                let info = await BUDGET__WORK_COLL.findById(workID)
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
     * Date  : 10/4/2022
     */
    getList({ groupID, itemID, budgetID, companyID, userID,
        keyword, limit = 100, lastestID, select, populates= {} }) { 
        // console.log({ groupID, itemID, budgetID, companyID, userID,
        //     keyword, limit, lastestID, select, populates })
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

                if(groupID && checkObjectIDs(groupID)){
                    conditionObj.group = groupID;
                }else{
                    if(itemID && checkObjectIDs(itemID)){
                        conditionObj.item = itemID;
                    }else{
                        if(budgetID && checkObjectIDs(budgetID)){
                            conditionObj.budget = budgetID;
                        }else{
                            conditionObj.company = companyID;
                        }
                    }
                }                

                if(keyword){
                    keyword = stringUtils.removeAccents(keyword)
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    let regExpSearch = RegExp(keyword, 'i');
                   
                    conditionObj.namecv = regExpSearch;
                }
                // console.log(conditionObj)
                let conditionObjOrg = { ...conditionObj };

                // PHÂN TRANG KIỂU MỚI
                if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await BUDGET__WORK_COLL.findById(lastestID);
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
                
                let infoDataAfterGet = await BUDGET__WORK_COLL.find(conditionObj)
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

                let totalRecord = await BUDGET__WORK_COLL.count(conditionObjOrg);
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
        option, workID, userID, ctx
    }){ 
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Cập nhật giá trị ngân sách
                 * 2-Cập nhật dự báo ngân sách
                 * 3-Cập nhật thực hiện ngân sách
                 */
                if(!checkObjectIDs(workID))
                    return resolve({ error: true, message: "Mã hiệu không đúng", keyError: "workID_invalid" });
                
                let dataUpdate = { userUpdate: userID };
                
                // Cập nhật Ngân sách theo kế hoạch và dự báo ngân sách
                if(option && Number(option) === 1){
                    //
                }

                // Cập nhật Ngân sách thực hiện
                if(option && Number(option) === 2){
                    const infoImpleBudget = await ctx.call(`${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_CAL_IMPLE_BUDGET}`, {
                        workID
                    })
                    // console.log('COONG VIỆC NGÂN SÁCH ĐÃ THỰC HIỆN')
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

                let infoAfterUpdate = await BUDGET__WORK_COLL.findByIdAndUpdate(workID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: "can't_update_contract_ipc", status: 403 })

                return resolve({ error: false, data: infoAfterUpdate, status: 200 })
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 })
            }
        })
    }

    /**
     * Name: Download Template Excel
     * Author: HiepNH
     * Date: 21/3/2023
     */
    downloadTemplateExcel({ option, itemID, userID }) {
        return new Promise(async resolve => {
            try {
                // Modify the workbook.
                XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/budget_import.xlsm')))
                .then(async workbook => {

                    const now = new Date();
                    const filePath = '../../../files/temporary_uploads/';
                    const fileName = `budget_import_${now.getTime()}.xlsm`;
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

    /**
     * Dev: HiepNH
     * Func: Tạo task từ dữ liệu excel
     * Date: 15/09/2022
     */
    importExcel({ option, budgetID, dataImport, userID }) {
        // console.log({option, budgetID, userID})
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs(budgetID))
                    return resolve({ error: true, message: 'budgetID_invalid', status: 400 })

                const dataImportJSON = JSON.parse(dataImport);
                let index = 0;
                let errorNumber = 0;
                let groupID;

                /**
                 * XÁC THỰC DỮ LIỆU
                 */
                let indexCheck = 0
                let errorValidate = 0;
                let arrItems = []
                for (const data of dataImportJSON) {
                    if(index > 0){
                        if(data?.__EMPTY_16 && data?.__EMPTY_16 != ""){
                            if(!arrItems.includes(data?.__EMPTY_16)){
                                arrItems.push(data?.__EMPTY_16)
                            }
                        }
                    }

                    index ++;
                }
                // console.log(arrItems)
                let listItems = await BUDGET__ITEM_COLL.find({_id: {$in: arrItems}})
                // console.log(listItems)
                // console.log(listItems.map(item => item.budget))
                // console.log(!listItems.map(item => item.budget).includes(budgetID))

                if(listItems){
                    for(const item of listItems){
                        if(item.budget.toString() != budgetID.toString() ){
                            errorValidate++
                        }
                    }
                }
                // console.log(errorValidate)

                if(errorValidate != 0)
                    return resolve({ error: true, message: "Nhóm dữ liệu không hợp lệ" })
                

                /**
                 * IMPORT DỮ LIỆU
                 */
                for (const data of dataImportJSON) {
                    if(index > 0){

                        if(data?.__EMPTY_1 && data?.__EMPTY_1 != ""){
                            // console.log(data)
                            let dataGroupInsert = {
                                userID,
                                name: data?.__EMPTY_1,
                                itemID: data?.__EMPTY_16,
                            }

                            let infoGroup = await BUDGET__GROUP_MODEL.insert(dataGroupInsert)
                            // console.log(infoGroup)

                            groupID = infoGroup?.data?._id
                        }

                        if(data?.__EMPTY_2 && data?.__EMPTY_2 != "" && groupID){
                            let dataInsert = {userID}
                            // console.log(data)
                            // console.log({groupID})
                            dataInsert.groupID = groupID;
                            dataInsert.name = data.__EMPTY_2;
                            dataInsert.sign = data.__EMPTY_3;
                            dataInsert.type = data.__EMPTY_4;
                            dataInsert.unit = data.__EMPTY_5;
                            dataInsert.quantity = data.__EMPTY_6;
                            dataInsert.unitPrice = data.__EMPTY_7;
                            dataInsert.amount = data.__EMPTY_8;
                            dataInsert.note = data.__EMPTY_15;

                            let infoWork = await this.insert(dataInsert)
                            // console.log(infoWork)
                        }
                    }

                    index ++;
                }

                if(errorNumber != 0)
                return resolve({ error: true, message: "import failed" });

                return resolve({ error: false, message: "import success" });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: copy
     * Dev: HiepNH
     * Date: 13/1/2024
     */
    copy({ option, budgetID, userID }) {
        // console.log({ option, budgetID, userID })
        const that = this
        return new Promise(async resolve => {
            try {
                let infoBudget = await BUDGET_COLL.findById(budgetID).select('company name sign type')
                if(!infoBudget)
                    return resolve({ error: true, message: 'budgetID_invalid', status: 400 })

                let year = new Date().getFullYear()
                let month = new Date().getMonth() + 1
                let prefix = `Y${year}M${month}`

                let companyID = infoBudget.company

                let infoBudgetNew = await BUDGET_MODEL.insert({ 
                    userID, 
                    companyID, 
                    type: infoBudget.type, 
                    name: `${infoBudget.name}_Copy`, 
                    sign: infoBudget.sign, 
                })
                // console.log(infoBudgetNew)

                if(infoBudgetNew){
                    let listItem = await BUDGET__ITEM_COLL.find({budget: budgetID})
                    // console.log(listItem)

                    for(const item of listItem){
                        // console.log(item)
                        let infoItemNew = await BUDGET__ITEM_MODEL.insert({
                            userID, 
                            budgetID: infoBudgetNew.data._id, 
                            plus: item.plus, 
                            name: item.name, 
                            sign: item.sign, 
                            unit: item.unit, 
                            description: item.description, 
                            note: item.note, 
                            type: item.type, 
                        })

                        if(infoItemNew){
                            let listGroup = await BUDGET__GROUP_COLL.find({item: item._id})
                            // console.log(listGroup)

                            for(const group of listGroup){
                                // console.log(group)
                                let infoGroupNew = await BUDGET__GROUP_MODEL.insert({
                                    userID, 
                                    itemID: infoItemNew.data._id, 
                                    plus: group.plus, 
                                    name: group.name, 
                                    sign: group.sign, 
                                    unit: group.unit, 
                                    description: group.description, 
                                    note: group.note, 
                                    type: group.type, 
                                })

                                if(infoGroupNew){
                                    let listWork = await BUDGET__WORK_COLL.find({group: group._id})
                                    // console.log(listWork)

                                    for(const work of listWork){
                                        // console.log(work)

                                        let infoWorkNew = await that.insert({
                                            userID, 
                                            groupID: infoGroupNew.data._id, 
                                            plus: work.plus, 
                                            name: work.name, 
                                            sign: `${prefix}${work.sign}`, 
                                            unit: work.unit ? work.unit : '', 
                                            description: work.description, 
                                            note: work.note, 
                                            type: work.type, 
                                            quantity: work.quantity, 
                                            unitPrice: work.unitPrice, 
                                            forecastQuantity: work.forecastQuantity, 
                                            forecastUnitPrice: work.forecastUnitPrice,
                                        })
                                    }
                                }
                            }
                            
                        }
                    }
                }
            

                return resolve({ error: false, message: "Copy success" });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model;