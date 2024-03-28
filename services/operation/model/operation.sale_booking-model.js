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
/**
 * import inter-coll, exter-coll
 */
const OPERATION__SALE_BOOKING_COLL          = require('../database/operation.sale_booking-coll');
const { RANGE_BASE_PAGINATION } 	        = require('../../../tools/cursor_base/playground/index');
const { template }                          = require('lodash');

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {               
    constructor() {
        super(OPERATION__SALE_BOOKING_COLL);
    }
    
    /**
     * Name: insert sale booking 
     * Author: Depv
     * Code: 
     */
    insert({ projectID, name, note, departmentID, contractID, date, bookingValue, depositValue, userID }) { 
        return new Promise(async (resolve) => {
            try {
                
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataInsert = { userCreate: userID };
                
                /** 
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */

                dataInsert = { name, date , project: projectID, bookingValue };
                    
                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */

                let infoProject = await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`, {
                    departmentID: projectID
                })

                if(!infoProject || infoProject.error)
					return resolve({ error: true, message: 'Request params projectID invalid', status: 400 });
                
                let { company } = infoProject.data;
                dataInsert.company = company;
                dataInsert.sign    = sign;
                if(note){
                    dataInsert.note    = note;
                }

                if(note){
                    dataInsert.note    = note;
                }

                if(checkObjectIDs(departmentID)){
                    dataInsert.department = departmentID;
                }

                if(checkObjectIDs(contractID)){
                    dataInsert.contract = contractID;
                }

                if(depositValue){
                    dataInsert.depositValue = depositValue;
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: "can't_insert", status: 403 });
 
                return resolve({ error: false, data: infoAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: update sale booking 
     * Author: Depv
     * Code: 
     */
    update({ saleBookingID,projectID, name, note, departmentID, contractID, date, bookingValue, depositValue, lock, lockTime, userDeposit, userID }) { 
        return new Promise(async (resolve) => {
            try {
                
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { userUpdate: userID };
                
                /** 
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if(!checkObjectIDs(saleBookingID))
                    return resolve({ error: true, message: 'Request params saleBookingID invalid', status: 400 });
                
                if(name){
                    dataUpdate.name = name;
                }

                if(description){
                    dataUpdate.description = description;
                }

                if(note){
                    dataUpdate.note = note;
                }
                
                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                if(checkObjectIDs(projectID)){

                    let infoProject = await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`, {
                        departmentID: projectID
                    })

                    if(!infoProject || infoProject.error)
                        return resolve({ error: true, message: 'Request params projectID invalid', status: 400 });

                    let { company } = infoProject.data;
                    dataUpdate.company = company;
                    dataUpdate.project = projectID;
                }

                if(checkObjectIDs(departmentID)){
                    dataUpdate.department = departmentID;
                }

                if(checkObjectIDs(contractID)){
                    dataUpdate.contract = contractID;
                }

                if(date){
                    dataUpdate.date = date;
                }

                if(bookingValue){
                    dataUpdate.bookingValue = bookingValue;
                }

                if(depositValue){
                    dataUpdate.depositValue = depositValue;
                }

                if(lock){
                    dataUpdate.lock = lock;
                }

                if(lockTime){
                    dataUpdate.lockTime = lockTime;
                }

                if(userDeposit){
                    dataUpdate.userDeposit = userDeposit;
                }
                
                let infoAfterUpdate = await OPERATION__SALE_BOOKING_COLL.findByIdAndUpdate(saleBookingID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "can't_insert", status: 403 });
 
                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Remove sale booking 
     * Author: Depv
     * Code: 
     */
    remove({ saleBookingID }) { 
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
                if(!checkObjectIDs(saleBookingID))
                    return resolve({ error: true, message: 'Request params saleBookingID invalid', status: 400 });
                    
                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAterRemove = await OPERATION__SALE_BOOKING_COLL.findByIdAndDelete(saleBookingID);
                if(!infoAterRemove)
                    return resolve({ error: true, message: "can't_remove", status: 403 });
 
                return resolve({ error: false, data: infoAterRemove, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: get sale booking 
     * Author: Depv
     * Code: 
     */
    getInfo({ saleBookingID }) { 
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
                if(!checkObjectIDs(saleBookingID))
                    return resolve({ error: true, message: 'Request params saleBookingID invalid', status: 400 });
                    
                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAterRemove = await OPERATION__SALE_BOOKING_COLL.findById(saleBookingID);
                if(!infoAterRemove)
                    return resolve({ error: true, message: "can't_remove", status: 403 });
 
                return resolve({ error: false, data: infoAterRemove, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name  : Danh sách sale booking
     * Author: Depv
     * Code  : 
     */
    getList({ projectID, type, status, sale bookingID, contactID, lock, userDepositID, contractID,
        keyword, limit = 10, lastestID, filter = {} }) { 
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let conditionObj = { 
                    // state: 1,
                };

                let conditionFind = { };
                let sortBy   = { createAt: -1 };
				let objSort  = {};
              
                /** 
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */

                // LẤY NHỮNG TRƯỜNG CẦN THIẾT
                if(filter && typeof filter === 'string'){
					if(!IsJsonString(filter))
						return resolve({ error: true, message: 'Request params filter invalid', status: 400 });

					filter = JSON.parse(filter);
				}
               
                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */  

                if(type){
                    conditionObj.type = type;
                }

                if(lock){
                    conditionObj.lock = lock;
                }

                if(status){
                    conditionObj.status = status;
                }

                if(checkObjectIDs(projectID)){
                    conditionObj.project = projectID;
                }
               

                if(checkObjectIDs(sale bookingID)){
                    conditionObj.sale booking = sale bookingID;
                }

                if(checkObjectIDs(contactID)){
                    conditionObj.contact = contactID;
                }

                if(checkObjectIDs(userDepositID)){
                    conditionObj.userDeposit = userDepositID;
                }

                if(checkObjectIDs(contractID)){
                    conditionObj.contract = contractID;
                }

                // PHÂN TRANG KIỂU MỚI
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await OPERATION__SALE_BOOKING_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info last message", status: 400 });

					let nextInfo = `${infoData.createAt}_${infoData._id}`;
                    // Lưu ý nêu sắp xếp tăng dần thì sửa lại ['createAt__1', '_id__1'];
					let keys	 = ['createAt__-1', '_id__-1'];
					let dataPagingAndSort = await RANGE_BASE_PAGINATION({ nextInfo, keys });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });
					conditionFind = dataPagingAndSort.data.find;
					sortBy = dataPagingAndSort.data.sort;
				}

				if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj.name = new RegExp(keyword, 'i');
                }
                
                let infoDataAfterGet = await OPERATION__SALE_BOOKING_COLL.find({...conditionObj, ...conditionFind }, { ...filter, ...objSort })
                    .limit(+limit+1)
                    .sort(sortBy)
                    .lean(); 

                  // GET TOTAL RECORD
                let totalCurrentPage = await OPERATION__SALE_BOOKING_COLL.count(conditionFind);
                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data", status: 403 });
                    
                let nextCursor	= null;
                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await OPERATION__SALE_BOOKING_COLL.countDocuments(conditionObj);
                let totalPage = Math.ceil(totalRecord/limit);

                let currentPage = getCurrentPage({ totalRecord, totalCurrentPage, limit }) + 1;
                if(!lastestID){
                    currentPage =  1
                }

                return resolve({ error: false, data: {
                    listRecords: infoDataAfterGet,
                    limit: +limit,
                    totalRecord,
                    totalPage,
                    nextCursor,
                    currentPage
                }, status: 200 });
                
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model;