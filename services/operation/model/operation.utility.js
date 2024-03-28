'use strict'
const BaseModel = require('../../../tools/db/base_model')
const {
    checkObjectIDs,
    checkNumberIsValidWithRange,
    checkNumberValid,
    IsJsonString,
} = require('../../../tools/utils/utils')
const stringUtils = require('../../../tools/utils/string_utils')
const { setTimeZone } = require('../../../tools/utils/time_utils')

const {
    getCurrentPage,
} = require('../../../tools/utils/calculate_current_page')
const ObjectID = require('mongoose').Types.ObjectId

/**
 * import inter-coll, exter-coll
 */
const OPERATION__UTILITY_COLL = require('../database/operation.utility-coll')
const {
    RANGE_BASE_PAGINATION,
} = require('../../../tools/cursor_base/playground/index')
const { template } = require('lodash')

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
    constructor() {
        super(OPERATION__UTILITY_COLL)
    }

    /**
     * Name: insert utility
     * Author: Depv
     * Code:
     */
    insert({ name, description, latitude, longtitude, userID }) {
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

                let dataInsert = { name, description, userCreate: userID }

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: "can't_insert",
                        status: 403,
                    })

                return resolve({
                    error: false,
                    data: infoAfterInsert,
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

    /**
     * Name: update utility
     * Author: Depv
     * Code:
     */
    update({ utilityID, name, description, latitude, longtitude, userID }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { userUpdate: userID }

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (!checkObjectIDs(utilityID))
                    return resolve({
                        error: true,
                        message: 'Request params utilityID invalid',
                        status: 400,
                    })

                if (name) {
                    dataUpdate.name = name
                }

                if (description) {
                    dataUpdate.description = description
                }

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */

                let infoAfterUpdate =
                    await OPERATION__UTILITY_COLL.findByIdAndUpdate(
                        utilityID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: "can't_insert",
                        status: 403,
                    })

                return resolve({
                    error: false,
                    data: infoAfterUpdate,
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

    /**
     * Name: Remove utility
     * Author: Depv
     * Code:
     */
    remove({ utilityID }) {
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
                if (!checkObjectIDs(utilityID))
                    return resolve({
                        error: true,
                        message: 'Request params utilityID invalid',
                        status: 400,
                    })

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAterRemove =
                    await OPERATION__UTILITY_COLL.findByIdAndDelete(utilityID)
                if (!infoAterRemove)
                    return resolve({
                        error: true,
                        message: "can't_remove",
                        status: 403,
                    })

                return resolve({
                    error: false,
                    data: infoAterRemove,
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

    /**
     * Name: get utility
     * Author: Depv
     * Code:
     */
    getInfo({ utilityID }) {
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
                if (!checkObjectIDs(utilityID))
                    return resolve({
                        error: true,
                        message: 'Request params utilityID invalid',
                        status: 400,
                    })

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAterRemove =
                    await OPERATION__UTILITY_COLL.findById(utilityID)
                if (!infoAterRemove)
                    return resolve({
                        error: true,
                        message: "can't_remove",
                        status: 403,
                    })

                return resolve({
                    error: false,
                    data: infoAterRemove,
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

    /**
     * Name  : Danh sách utility
     * Author: Depv
     * Code  :
     */
    getList({
        latitude,
        longtitude,
        keyword,
        limit = 10,
        lastestID,
        filter = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let conditionObj = {
                    // state: 1,
                }

                let conditionFind = {}
                let sortBy = { createAt: -1 }
                let objSort = {}

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */

                // LẤY NHỮNG TRƯỜNG CẦN THIẾT
                if (filter && typeof filter === 'string') {
                    if (!IsJsonString(filter))
                        return resolve({
                            error: true,
                            message: 'Request params filter invalid',
                            status: 400,
                        })

                    filter = JSON.parse(filter)
                }

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await OPERATION__UTILITY_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info last message",
                            status: 400,
                        })

                    let nextInfo = `${infoData.createAt}_${infoData._id}`
                    // Lưu ý nêu sắp xếp tăng dần thì sửa lại ['createAt__1', '_id__1'];
                    let keys = ['createAt__-1', '_id__-1']
                    let dataPagingAndSort = await RANGE_BASE_PAGINATION({
                        nextInfo,
                        keys,
                    })
                    if (!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({
                            error: true,
                            message: "Can't get range pagination",
                            status: 400,
                        })
                    conditionFind = dataPagingAndSort.data.find
                    sortBy = dataPagingAndSort.data.sort
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    conditionObj.name = new RegExp(keyword, 'i')
                }

                let infoDataAfterGet = await OPERATION__UTILITY_COLL.find(
                    { ...conditionObj, ...conditionFind },
                    { ...filter, ...objSort }
                )
                    .limit(+limit + 1)
                    .sort(sortBy)
                    .lean()

                // GET TOTAL RECORD
                let totalCurrentPage =
                    await OPERATION__UTILITY_COLL.count(conditionFind)
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
                    await OPERATION__UTILITY_COLL.countDocuments(conditionObj)
                let totalPage = Math.ceil(totalRecord / limit)

                let currentPage =
                    getCurrentPage({ totalRecord, totalCurrentPage, limit }) + 1
                if (!lastestID) {
                    currentPage = 1
                }

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit: +limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                        currentPage,
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
