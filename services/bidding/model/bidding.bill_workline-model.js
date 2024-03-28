'use strict'

/**
 * EXTERNAL PACKAGE
 */
const stringUtils = require('../../../tools/utils/string_utils')
const ObjectID = require('mongoose').Types.ObjectId

/**
 * CONSTANTS
 */

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const {
    checkObjectIDs,
    IsJsonString,
    _isValid,
} = require('../../../tools/utils/utils')

/**
 * COLLECTIONS
 */
const BIDDING__BILL_WORK_COLL = require('../database/bidding.bill_work-coll')
const BIDDING__BILL_WORKLINE_COLL = require('../database/bidding.bill_workline-coll')
const BIDDING__BILL_PRODUCT_COLL = require('../database/bidding.bill_product-coll')

class Model extends BaseModel {
    constructor() {
        super(BIDDING__BILL_WORKLINE_COLL)
    }

    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    insert({ workID, productID, type, quantity, unitprice, note, userID }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                if (
                    !_isValid(workID) ||
                    !_isValid(productID) ||
                    !_isValid(userID)
                )
                    return resolve({ error: true, message: 'param_not_valid' })

                // Kiểm tra sự tồn tại của product trong job
                let info = await BIDDING__BILL_WORKLINE_COLL.findOne({
                    work: workID,
                    product: productID,
                })
                if (info) {
                    return resolve({
                        error: true,
                        message: 'data_product_exists_in_work',
                    })
                } else {
                    let infoWork =
                        await BIDDING__BILL_WORK_COLL.findById(workID)
                    if (!infoWork)
                        return resolve({
                            error: true,
                            message: 'cannot_get_info',
                        })

                    let dataInsert = {
                        userCreate: userID,
                        project: infoWork.project,
                        doc: infoWork.doc,
                        item: infoWork.item,
                        group: infoWork.group,
                        work: workID,
                        product: productID,
                        type: type && !isNaN(type) ? Number(type) : 1,
                        quantity:
                            quantity && !isNaN(quantity)
                                ? Number(quantity).toFixed(3)
                                : 0,
                        unitprice:
                            unitprice && !isNaN(unitprice)
                                ? Number(unitprice).toFixed(3)
                                : 0,
                        note,
                    }

                    let infoAfterInsert = await that.insertData(dataInsert)
                    if (!infoAfterInsert)
                        return resolve({
                            error: true,
                            message: 'cannot_insert',
                        })

                    return resolve({ error: false, data: infoAfterInsert })
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Get info
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    getInfo({ worklineID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(worklineID))
                    return resolve({ error: true, message: 'param_invalid' })

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request params populates invalid',
                            status: 400,
                        })
                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                let info = await BIDDING__BILL_WORKLINE_COLL.findById(
                    worklineID
                )
                    .select(select)
                    .populate(populates)

                if (!info)
                    return resolve({ error: true, message: 'cannot_get' })

                return resolve({ error: false, data: info })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Remove
     * Author: Hiepnh
     * Date: 02/5/2022
     */

    /**
     * Name  : Get list
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    getList({
        productID,
        workID,
        groupID,
        itemID,
        docID,
        projectID,
        userID,
        keyword,
        limit = 50,
        lastestID,
        select,
        populates = {},
        sortKey,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (limit > 50) {
                    limit = 50
                } else {
                    limit = +limit
                }

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let sortBy
                let conditionObj = {}
                let keys = ['createAt__-1', '_id__-1']

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request params populates invalid',
                            status: 400,
                        })

                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                if (sortKey && typeof sortKey === 'string') {
                    if (!IsJsonString(sortKey))
                        return resolve({
                            error: true,
                            message: 'Request params sortKey invalid',
                            status: 400,
                        })

                    keys = JSON.parse(sortKey)
                }

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */
                if (checkObjectIDs(productID)) {
                    conditionObj.product = productID
                } else {
                    if (checkObjectIDs(workID)) {
                        conditionObj.work = workID
                    } else {
                        if (checkObjectIDs(groupID)) {
                            conditionObj.group = groupID
                        } else {
                            if (checkObjectIDs(itemID)) {
                                conditionObj.item = itemID
                            } else {
                                if (checkObjectIDs(docID)) {
                                    conditionObj.doc = docID
                                } else {
                                    if (checkObjectIDs(projectID)) {
                                        conditionObj.project = projectID
                                    }
                                }
                            }
                        }
                    }
                }
                console.log(conditionObj)

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    let regExpSearch = RegExp(keyword, 'i')
                    conditionObj.name = regExpSearch
                }

                let conditionObjOrg = { ...conditionObj }

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await BIDDING__BILL_WORKLINE_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastest",
                            status: 400,
                        })

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: infoData,
                        objectQuery: conditionObjOrg,
                    })
                    if (!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({
                            error: true,
                            message: "Can't get range pagination",
                            status: 400,
                        })

                    conditionObj = dataPagingAndSort.data.find
                    sortBy = dataPagingAndSort.data.sort
                } else {
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: null,
                        objectQuery: conditionObjOrg,
                    })
                    sortBy = dataPagingAndSort.data.sort
                }

                let infoDataAfterGet = await BIDDING__BILL_WORKLINE_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                // GET TOTAL RECORD
                if (!infoDataAfterGet)
                    return resolve({
                        error: true,
                        message: "Can't get data",
                        status: 403,
                    })

                let nextCursor = null
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id
                        infoDataAfterGet.length = limit
                    }
                }

                let totalRecord =
                    await BIDDING__BILL_WORKLINE_COLL.count(conditionObjOrg)
                let totalPage = Math.ceil(totalRecord / limit)

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit: +limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    },
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }
}

exports.MODEL = new Model()
