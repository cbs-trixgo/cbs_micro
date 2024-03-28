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
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')

/**
 * COLLECTIONS
 */
const DATAHUB_CONTACT_COLL = require('../database/datahub_contact-coll')

class Model extends BaseModel {
    constructor() {
        super(DATAHUB_CONTACT_COLL)
    }

    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert({ name, sign, address, taxid, note, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!name || !checkObjectIDs(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                let dataInsert = { name, taxid, userCreate: userID }

                let info = await DATAHUB_CONTACT_COLL.findOne({ taxid: taxid })
                if (info)
                    return resolve({
                        error: true,
                        message: 'Mã số thuế đã tồn tại',
                        keyError: 'cannot_insert',
                    })

                if (sign) {
                    dataInsert.sign = sign
                }

                if (address) {
                    dataInsert.address = address
                }

                if (note) {
                    dataInsert.note = note
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Tạo mới thất bại',
                        keyError: 'cannot_insert',
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
     * Name: Update
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    update({ datahubContactID, name, sign, address, taxid, note, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!name || !checkObjectIDs(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                let info = await DATAHUB_CONTACT_COLL.findOne({
                    taxid: taxid,
                    _id: { $nin: [datahubContactID] },
                })
                if (info)
                    return resolve({
                        error: true,
                        message: 'Mã số thuế đã tồn tại',
                        keyError: 'cannot_update',
                    })

                let dataUpdate = { name, taxid, userUpdate: userID }

                if (sign) {
                    dataUpdate.sign = sign
                }

                if (address) {
                    dataUpdate.address = address
                }

                if (note) {
                    dataUpdate.note = note
                }

                let infoAfterUpdate =
                    await DATAHUB_CONTACT_COLL.findByIdAndUpdate(
                        datahubContactID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: 'cannot_update',
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
     * Date: 9/4/2022
     */

    /**
     * Name: Get info
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getInfo({ datahubContactID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(datahubContactID))
                    return resolve({ error: true, message: 'param_invalid' })

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

                let info = await DATAHUB_CONTACT_COLL.findById(datahubContactID)
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
     * Date: 9/4/2022
     */
    getList({
        userID,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                if (limit > 20) {
                    limit = 20
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

                // POPULATE
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
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */

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
                        await DATAHUB_CONTACT_COLL.findById(lastestID)
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

                let infoDataAfterGet = await DATAHUB_CONTACT_COLL.find(
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
                    await DATAHUB_CONTACT_COLL.count(conditionObjOrg)
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
