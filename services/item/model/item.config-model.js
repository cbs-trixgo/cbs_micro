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
const ITEM__CONFIG_COLL = require('../database/item.config-coll')

class Model extends BaseModel {
    constructor() {
        super(ITEM__CONFIG_COLL)
    }

    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 19/9/2022
     */
    insert({
        companyID,
        userID,
        name,
        type,
        active,
        channel,
        template,
        secretKey,
        tokenKey,
    }) {
        // console.log({ userID, name, type, active, channel, template, secretKey, tokenKey })
        return new Promise(async (resolve) => {
            try {
                if (!name || !checkObjectIDs(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                let dataInsert = {
                    company: companyID,
                    userCreate: userID,
                    name,
                    type: +type,
                    active: +active,
                    channel,
                    template,
                    secretKey,
                    tokenKey,
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
    update({
        userID,
        configID,
        name,
        type,
        active,
        channel,
        template,
        secretKey,
        tokenKey,
    }) {
        // console.log({ userID, configID, name, type, active, channel, template, secretKey, tokenKey })
        return new Promise(async (resolve) => {
            try {
                if (
                    !name ||
                    !checkObjectIDs(userID) ||
                    !checkObjectIDs(configID)
                )
                    return resolve({ error: true, message: 'param_not_valid' })

                let dataUpdate = {
                    userUpdate: userID,
                    modifyAt: Date.now(),
                    name,
                    type: +type,
                    active: +active,
                    channel,
                    template,
                    secretKey,
                    tokenKey,
                }

                let infoAfterUpdate = await ITEM__CONFIG_COLL.findByIdAndUpdate(
                    configID,
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
    getInfo({ configID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(configID))
                    return resolve({
                        error: true,
                        message: 'Request params configID invalid',
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

                let infoAterGet = await ITEM__CONFIG_COLL.findById(configID)
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
    getList({
        companyID,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates = {},
    }) {
        // console.log({ companyID, keyword, limit, lastestID, select, populates})
        return new Promise(async (resolve) => {
            try {
                if (limit > 20) {
                    limit = 20
                } else {
                    limit = +limit
                }

                let sortBy
                let conditionObj = { company: companyID }
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
                // console.log(conditionObj)

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await ITEM__CONFIG_COLL.findById(lastestID)
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

                let infoDataAfterGet = await ITEM__CONFIG_COLL.find(
                    conditionObj
                )
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

                let totalRecord = await ITEM__CONFIG_COLL.count(conditionObjOrg)
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
