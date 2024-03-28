'use strict'

/**
 * EXTERNAL PACKAGE
 */
const ObjectID = require('mongoose').Types.ObjectId

/**
 * CONSTANTS
 */
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')

/**
 * TOOLS
 */
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const BaseModel = require('../../../tools/db/base_model')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys/index')

/**
 * COLLECTIONS
 */
const BIDDING__PLAN_COLL = require('../database/bidding.plan-coll')
const BIDDING__DOC_COLL = require('../database/bidding.doc-coll')
const BIDDING__REQUEST_COLL = require('../database/bidding.request-coll')
const BIDDING__APPLY_COLL = require('../database/bidding.apply-coll')

/**
 * MODELS
 */

class Model extends BaseModel {
    constructor() {
        super(BIDDING__APPLY_COLL)
    }

    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 28/4/2022
     */
    insert({ requestID, userID, contractorID, name, description, note }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                if (
                    !checkObjectIDs(userID) ||
                    !checkObjectIDs(requestID) ||
                    !checkObjectIDs(contractorID)
                )
                    return resolve({
                        error: true,
                        message:
                            'Request params requestID|contractorID|userID invalid',
                        status: 400,
                    })

                // Kiểm tra sự tồn tại của dữ liệu
                let infoApply = await BIDDING__APPLY_COLL.findOne({
                    contractor: contractorID,
                    request: requestID,
                })
                console.log(infoApply)

                if (infoApply)
                    return resolve({
                        error: true,
                        message: 'Dữ liệu đã tồn tại',
                        status: 400,
                    })

                let dataInsert = {
                    userCreate: userID,
                    contractor: contractorID,
                    request: requestID,
                }

                if (name) {
                    dataInsert.name = name
                }

                if (description) {
                    dataInsert.description = description
                }

                if (note) {
                    dataInsert.note = note
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                        status: 403,
                    })
                console.log(infoAfterInsert)

                /**
                 * CẬP NHẬT LẠI YÊU CẦU CỦA HỒ SƠ
                 */
                let infoRequest = await BIDDING__REQUEST_COLL.findByIdAndUpdate(
                    requestID,
                    {
                        $addToSet: { details: infoAfterInsert._id },
                    },
                    { new: true }
                )

                console.log(infoRequest)

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
     * Name: Update
     * Author: Hiepnh
     * Date: 28/4/2022
     */
    update({ applyID, name, description, note, userID }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { userUpdate: userID }

                if (!checkObjectIDs(applyID))
                    return resolve({
                        error: true,
                        message: 'Mã không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })
                if (name) {
                    dataUpdate.name = name
                }

                if (description) {
                    dataUpdate.description = description
                }

                if (note) {
                    dataUpdate.note = note
                }

                let infoAfterUpdate =
                    await BIDDING__APPLY_COLL.findByIdAndUpdate(
                        applyID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: KEY_ERROR.UPDATE_FAILED,
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
     * Name: Remove
     * Author: Hiepnh
     * Date: 28/4/2022
     */

    /**
     * Name: Get info
     * Author: Hiepnh
     * Date: 28/4/2022
     */
    getInfo({ applyID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(applyID))
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

                let info = await BIDDING__APPLY_COLL.findById(applyID)
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
     * Name  : Get list
     * Author: Hiepnh
     * Date: 28/4/2022
     */
    getList({
        requestID,
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
                // Chỉ hiển thị sổ quỹ mà user là member
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
                if (checkObjectIDs(requestID)) {
                    conditionObj.request = requestID
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
                    let infoData = await BIDDING__APPLY_COLL.findById(lastestID)
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

                let infoDataAfterGet = await BIDDING__APPLY_COLL.find(
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
                    await BIDDING__APPLY_COLL.count(conditionObjOrg)
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
