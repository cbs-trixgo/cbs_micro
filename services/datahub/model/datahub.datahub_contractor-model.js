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
const DATAHUB_CONTRACTOR_COLL = require('../database/datahub_contractor-coll')

class Model extends BaseModel {
    constructor() {
        super(DATAHUB_CONTRACTOR_COLL)
    }

    /**
     * Name: insert datahub contractor
     * Author: Depv
     * Code:
     */
    insert({ field, areas, contractor, ranking, note, status, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(field, contractor))
                    return resolve({
                        error: true,
                        message: 'Tham số không đúng định dạng',
                        keyError: 'params_invalid',
                    })
                let dataInsert = {
                    field,
                    contractor,
                    userCreate: userID,
                    userUpdate: userID,
                }

                if (checkObjectIDs(areas)) {
                    dataInsert.$addToSet = { areas }
                }

                if (ranking) {
                    dataInsert.ranking = ranking
                }

                if (note) {
                    dataInsert.note = note
                }

                if (status) {
                    dataInsert.status = status
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Tạo mới thất bại',
                        keyError: 'cannot_insert',
                    })

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: update datahub contractor
     * Author: Depv
     * Code:
     */
    update({
        datahubContractorID,
        field,
        areas,
        areasRemove,
        contractor,
        ranking,
        note,
        status,
        userID,
    }) {
        return new Promise(async (resolve) => {
            try {
                let dataUpdate = { userUpdate: userID }

                if (checkObjectIDs(field)) {
                    dataUpdate.field = field
                }

                if (checkObjectIDs(contractor)) {
                    dataUpdate.contractor = contractor
                }

                if (checkObjectIDs(areas)) {
                    dataUpdate.$addToSet = { areas }
                }

                if (checkObjectIDs(areasRemove)) {
                    dataUpdate.$pullAll = { areas: areasRemove }
                }

                if (ranking) {
                    dataUpdate.ranking = ranking
                }

                if (note) {
                    dataUpdate.note = note
                }

                if (status) {
                    dataUpdate.status = status
                }

                let infoAfterUpdate =
                    await DATAHUB_CONTRACTOR_COLL.findByIdAndUpdate(
                        datahubContractorID,
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
     * Name: Remove datahub contractor
     * Author: Depv
     * Code:
     */
    remove({ datahubContractorID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(datahubContractorID))
                    return resolve({
                        error: true,
                        message: 'Mã datahubContractorID không hợp lệ',
                        keyError: 'datahubContractorID_invalid',
                        status: 400,
                    })

                let infoAterRemove =
                    await DATAHUB_CONTRACTOR_COLL.findByIdAndDelete(
                        datahubContractorID
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
     * Name: get info datahub contractor
     * Author: Depv
     * Code:
     */
    getInfo({ datahubContractorID, select, populates }) {
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
                if (!checkObjectIDs(datahubContractorID))
                    return resolve({
                        error: true,
                        message: 'Request params datahubContractorID invalid',
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
                let infoAterGet = await DATAHUB_CONTRACTOR_COLL.findById(
                    datahubContractorID
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
     * Func: Lấy danh sách datahub contractor
     * Date: 26/10/2021
     */
    getList({
        userID,
        lastestID,
        keyword,
        limit = 10,
        select,
        populates = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                let conditionObj = {}
                let sortBy
                let keys = ['createAt__-1', '_id__-1']

                if (limit > 20) {
                    limit = 20
                }

                if (!checkObjectIDs(userID))
                    return resolve({
                        error: true,
                        message: 'Request params userID invalid',
                        status: 400,
                    })

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
                // if(keyword){
                //     keyword = keyword.split(" ");
                //     keyword = '.*' + keyword.join(".*") + '.*';
                //     let regSearch = new RegExp(keyword, 'i');
                //     conditionObj.name = regSearch;
                // }

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await DATAHUB_CONTRACTOR_COLL.findById(lastestID)
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

                let listPackages = await DATAHUB_CONTRACTOR_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .select(select)
                    .populate(populates)
                    .sort(sortBy)
                    .lean()

                // GET TOTAL RECORD
                let totalRecord =
                    await DATAHUB_CONTRACTOR_COLL.count(conditionObjOrg)
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
