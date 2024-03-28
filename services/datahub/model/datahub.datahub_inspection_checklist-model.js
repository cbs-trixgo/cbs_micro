'use strict'

/**
 * EXTERNAL PACKAGE
 */
const stringUtils = require('../../../tools/utils/string_utils')
const ObjectID = require('mongoose').Types.ObjectId
const { KEY_ERROR } = require('../../../tools/keys/index')

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
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')

/**
 * COLLECTIONS
 */
const DATAHUB_INSPECTION_CHECKLIST_COLL = require('../database/datahub_inspection_checklist-coll')

class Model extends BaseModel {
    constructor() {
        super(DATAHUB_INSPECTION_CHECKLIST_COLL)
    }

    /**
     * Name: Insert
     * Author: Depv
     * Code: 26/10/2021
     */
    insert({ inspectionDocID, name, sign, description, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!name)
                    return resolve({
                        error: true,
                        message: 'Tên datahub inspection không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                if (!checkObjectIDs(inspectionDocID))
                    return resolve({
                        error: true,
                        message: 'inspectionDocID không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let dataInsert = {
                    inspection: inspectionDocID,
                    name,
                    userCreate: userID,
                }

                if (sign) {
                    let checkSign =
                        await DATAHUB_INSPECTION_CHECKLIST_COLL.findOne({
                            sign,
                        })
                    if (checkSign)
                        return resolve({
                            error: true,
                            message: 'Mã hiệu đã tồn tại',
                            keyError: KEY_ERROR.ITEM_EXISTED,
                        })
                    dataInsert.sign = sign
                }

                if (description) {
                    dataInsert.description = description
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Tạo mới thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                    })

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Update
     * Author: Depv
     * Code: 26/10/2021
     */
    update({ inspectionChecklistID, name, sign, description, userID }) {
        return new Promise(async (resolve) => {
            try {
                let dataUpdate = { userUpdate: userID }

                if (sign) {
                    let checkSign =
                        await DATAHUB_INSPECTION_CHECKLIST_COLL.findOne({
                            _id: { $ne: inspectionChecklistID },
                            sign,
                        })
                    if (checkSign)
                        return resolve({
                            error: true,
                            message: 'Mã hiệu đã tồn tại',
                            keyError: KEY_ERROR.ITEM_EXISTED,
                        })
                    dataUpdate.sign = sign
                }

                if (name) {
                    dataUpdate.name = name
                }

                if (description) {
                    dataUpdate.description = description
                }

                let infoAfterUpdate =
                    await DATAHUB_INSPECTION_CHECKLIST_COLL.findByIdAndUpdate(
                        inspectionChecklistID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: 'cannot_update',
                    })

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Remove
     * Author: Depv
     * Code: 26/10/2021
     */
    remove({ inspectionChecklistID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(inspectionChecklistID))
                    return resolve({
                        error: true,
                        message: 'Mã datahub không hợp lệ',
                        keyError: 'inspectionChecklistID_invalid',
                        status: 400,
                    })

                let infoAterRemove =
                    await DATAHUB_INSPECTION_CHECKLIST_COLL.findByIdAndDelete(
                        inspectionChecklistID
                    )
                if (!infoAterRemove)
                    return resolve({
                        error: true,
                        message: 'Xoá thất bại',
                        keyError: 'remove_failed',
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
     * Name: Getinfo
     * Author: Depv
     * Code: 26/10/2021
     */
    getInfo({ inspectionChecklistID, select, populates }) {
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
                if (!checkObjectIDs(inspectionChecklistID))
                    return resolve({
                        error: true,
                        message: 'Request params inspectionChecklistID invalid',
                        status: 400,
                    })

                // populates
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
                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAterGet =
                    await DATAHUB_INSPECTION_CHECKLIST_COLL.findById(
                        inspectionChecklistID
                    )
                        .select(select)
                        .populate(populates)
                if (!infoAterGet)
                    return resolve({
                        error: true,
                        message: "can't_get_info",
                        status: 403,
                    })

                return resolve({ error: false, data: infoAterGet, status: 200 })
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
     * Dev: HiepNH
     * Func: Getlist
     * Date: 26/10/2021
     */
    getList({
        inspectionID,
        userID,
        lastestID,
        keyword,
        limit = 10,
        select,
        populates = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(inspectionID))
                    return resolve({
                        error: true,
                        message: 'Request params inspectionID invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })
                let conditionObj = { inspection: inspectionID }
                let sortBy
                let keys = ['createAt__-1', '_id__-1']

                if (limit > 20) {
                    limit = 20
                } else {
                    limit = +limit
                }
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
                // SEARCH TEXT
                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    let regSearch = new RegExp(keyword, 'i')
                    conditionObj.name = regSearch
                }

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await DATAHUB_INSPECTION_CHECKLIST_COLL.findById(
                            lastestID
                        )
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastestID",
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

                let listPackages = await DATAHUB_INSPECTION_CHECKLIST_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .select(select)
                    .populate(populates)
                    .sort(sortBy)
                    .lean()

                // GET TOTAL RECORD
                let totalRecord =
                    await DATAHUB_INSPECTION_CHECKLIST_COLL.count(
                        conditionObjOrg
                    )
                let totalPage = Math.ceil(totalRecord / limit)
                let nextCursor = null

                if (listPackages && listPackages.length) {
                    if (listPackages.length > limit) {
                        nextCursor = listPackages[limit - 1]._id
                        listPackages.length = limit
                    }
                }

                return resolve({
                    error: false,
                    status: 200,
                    data: {
                        listRecords: listPackages,
                        limit: +limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    },
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
