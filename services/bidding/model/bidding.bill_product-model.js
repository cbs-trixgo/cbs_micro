"use strict";

/**
 * EXTERNAL PACKAGE
 */
const stringUtils						 = require('../../../tools/utils/string_utils');
const ObjectID                           = require('mongoose').Types.ObjectId;

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
    _isValid
} = require('../../../tools/utils/utils');

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

class Model extends BaseModel {

    constructor() {
        super(BIDDING__BILL_PRODUCT_COLL);
    }

     /**
     * Name: Insert 
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    insert({ docID, productID, type, unitprice, userID }) {
        console.log('Insert Product in Package=========>>>>>>>>>>>>>')
        console.log({ docID, productID, type, unitprice, userID })
        return new Promise(async resolve => {
            try {
                if(!_isValid(docID) || !_isValid(productID) || !_isValid(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                // Kiểm tra sự tồn tại của task, product
                let info = await BIDDING__BILL_PRODUCT_COLL.findOne({doc: docID, product: productID})
                if(info){
                    console.log('Product: Vật tư đã tồn tại in Package=========>>>>>>>>>>>>>')
                    return resolve({ error: true, message: 'data_exists222222222222222' })
                }else{
                    console.log('Product: Vật tư chưa tồn tại in Package=========>>>>>>>>>>>>>')
                    let infoDoc = await BIDDING__DOC_COLL.findById(docID)
                    console.log({infoDoc: infoDoc})
                    if(infoDoc){
                        let dataInsert = {
                            area: infoDoc.area,
                            client: infoDoc.client,
                            project: infoDoc.project,
                            doc: docID,
                            product: productID,
                            type,
                            unitprice
                        }
        
                        let infoAfterInsert = await this.insertData(dataInsert)
                        if (!infoAfterInsert) 
                            return resolve({ error: true, message: 'cannot_insert' })
                        
                        return resolve({ error: false, data: infoAfterInsert })
                    }else{
                        return resolve({ error: true, message: 'cannot_insert' })
                    }
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Update 
     * Author: Hiepnh
     * Date: 02/5/2022
     */
     update({ userID, docProductID, note, ctx }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                let dataUpdate = { 
                    userUpdate: userID,
                    modifyAt: Date.now(),
                };

                if (note) {
                    dataUpdate.note = note;
                }

                let infoAfterUpdate = await BIDDING__BILL_PRODUCT_COLL.findByIdAndUpdate(docProductID, dataUpdate, { new: true });
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
     * Author: Hiepnh
     * Date: 02/5/2022
     */

    /**
     * Name: Get info 
     * Author: Hiepnh
     * Date: 02/5/2022
     */
     getInfo({ docProductID, select, populates }) {
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(docProductID))
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

                let info = await BIDDING__BILL_PRODUCT_COLL.findById(docProductID)
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
     * Date: 02/5/2022
     */
    getList({ docID, projectID,
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
                if (checkObjectIDs(docID)) {
                    conditionObj.doc = docID
                }else{
                    if (checkObjectIDs(projectID)) {
                        conditionObj.project = projectID
                    }
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
                    let infoData = await BIDDING__BILL_PRODUCT_COLL.findById(lastestID);
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

                let infoDataAfterGet = await BIDDING__BILL_PRODUCT_COLL.find(conditionObj)
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

                let totalRecord = await BIDDING__BILL_PRODUCT_COLL.count(conditionObjOrg);
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

    // //__________Tạo danh mục vật tư cho gói thầu (nếu chưa có)
    // // Author: HiepNH
    // createBiddingAllProduct({ task, authorID }) {
    //     const that = this
    //     return new Promise(async resolve => {
    //         try {
    //             if(!_isValid(task) || !_isValid(authorID))
    //                 return resolve({ error: true, message: 'param_not_valid' })

    //             // Lấy danh sách các vật tư của gói thầu (theo Phân tích nguồn lực)
    //             let listData = await BIDDING_JOBLINE_COLL.aggregate([
    //                 {
    //                     $match: {
    //                         task: ObjectID(task)
    //                     }
    //                 }, 
    //                 {
    //                     $group: {
    //                         _id: { product: '$product' },
    //                     }
    //                 } 
    //             ])
    //             // console.log(task)

    //             // Thêm bổ sung nếu chưa có
    //             for(const item of listData){
    //                 // Kiểm tra xem tồn tại hay chưa
    //                 await that.insert({ task, product: item._id.product, authorID })
    //             }

    //             return resolve({ error: false, data: listData });
    //         } catch (error) {
    //             return resolve({ error: true, message: error.message })
    //         }
    //     })
    // }

    // updateNote({ task, product, note, authorID }){
    //     return new Promise(async (resolve) => {
    //         try {
    //             if(!_isValid(task) || !_isValid(product) || !_isValid(authorID) )
    //                 return resolve({ error: true, message: 'param_not_valid' })

    //             await BIDDING__BILL_PRODUCT_COLL.findOneAndUpdate(
    //                 {
    //                     task: ObjectID(task),
    //                     product: ObjectID(product),
    //                 }, 
    //                 {
    //                     note: note,
    //                 }, { new: true });
              
    //             return resolve({ error: false, message: 'successfull' })
    //         } catch (error) {
    //             return resolve({ error: true, message: error.message });
    //         }
    //     })
    // }
}

exports.MODEL = new Model;