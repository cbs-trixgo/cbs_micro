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
const ObjectID = require('mongoose').Types.ObjectId

/**
 * DOMAIN AND ACTIONS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../helper/item.actions-constant')

/**
 * TOOLS
 */
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const {
    getCurrentPage,
} = require('../../../tools/utils/calculate_current_page')

/**
 * COLLECTIONS
 */
const ITEM__AREA_COLL = require('../database/item.area-coll')

class Model extends BaseModel {
    constructor() {
        super(ITEM__AREA_COLL)
    }

    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 19/9/2022
     */
    insert({ name, sign, userID, parentID }) {
        // console.log({ name, sign, userID, parentID })
        return new Promise(async (resolve) => {
            try {
                if (!name || !checkObjectIDs(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                let dataInsert = {
                    userCreate: userID,
                    name,
                    sign,
                }

                if (parentID && checkObjectIDs(parentID)) {
                    let infoMenuParent =
                        await ITEM__AREA_COLL.findById(parentID)
                    dataInsert.parent = parentID
                    dataInsert.level = infoMenuParent.level + 1
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurred',
                        status: 422,
                    })
                }

                if (parentID) {
                    await ITEM__AREA_COLL.findByIdAndUpdate(
                        parentID,
                        {
                            $addToSet: { childs: infoAfterInsert._id },
                        },
                        { new: true }
                    )
                }

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Update
     * Author: HiepNH
     * Code: 19/9/2022
     */
    update({ areaID, name, sign, userID }) {
        console.log({ areaID, name, sign, userID })
        return new Promise(async (resolve) => {
            try {
                if (!name || !checkObjectIDs(userID) || !checkObjectIDs(areaID))
                    return resolve({ error: true, message: 'param_not_valid' })

                let dataUpdate = {
                    name,
                    sign,
                    userUpdate: userID,
                    modifyAt: Date.now(),
                }

                let infoAfterUpdate = await ITEM__AREA_COLL.findByIdAndUpdate(
                    areaID,
                    dataUpdate,
                    { new: true }
                )
                if (!infoAfterUpdate)
                    return resolve({ error: true, message: 'cannot_update' })

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: get info area
     * Author: Depv
     * Code:
     */
    getInfo({ areaID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(areaID))
                    return resolve({
                        error: true,
                        message: 'Request params areaID invalid',
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

                let infoAterGet = await ITEM__AREA_COLL.findById(areaID)
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
     * Name  : Danh sách area
     * Author: Depv
     * Code  :
     */
    getList({ keyword, limit = 10, lastestID, select, populates = {} }) {
        // console.log({keyword, limit, lastestID, select, populates})
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                if (limit > 20) {
                    limit = 20
                } else {
                    limit = +limit
                }

                let sortBy
                // let conditionObj = { level: 3 };
                let conditionObj = {}
                let keys = ['createAt__-1', '_id__-1']

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

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    conditionObj.name = new RegExp(keyword, 'i')
                }

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await ITEM__AREA_COLL.findById(lastestID)
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

                let infoDataAfterGet = await ITEM__AREA_COLL.find(conditionObj)
                    .select(select)
                    .limit(limit + 1)
                    .sort(sortBy)
                    .populate(populates)
                    .lean()

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

                let totalRecord = await ITEM__AREA_COLL.count(conditionObjOrg)
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
