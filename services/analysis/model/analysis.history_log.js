'use strict'
const BaseModel = require('../../../tools/db/base_model')
const {
    checkObjectIDs,
    checkNumberIsValidWithRange,
    checkNumberValid,
    IsJsonString,
} = require('../../../tools/utils/utils')
// const stringUtils					    = require('../../../tools/utils/string_utils');
// const { setTimeZone  }                  = require('../../../tools/utils/time_utils');
// const ObjectID                          = require('mongoose').Types.ObjectId;
const moment = require('moment')

/**
 * DOMAIN AND ACTIONS
 */
// const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
// const { CF_ACTIONS_SUBJECT_PCM } 	    = require('../../subject_pcm/helper/subject_pcm.actions-constant');

/**
 * TOOLS
 */
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
// const { getCurrentPage }			    = require('../../../tools/utils/calculate_current_page');

/**
 * COLLECTIONS
 */
const ANALYSIS__HISTORY_LOG_COLL = require('../database/analysis.history_log-coll')
const PCM_PLAN_TASK_COLL = require('../../subject_pcm/database/subject_pcm.pcm_plan_task-coll')

class Model extends BaseModel {
    constructor() {
        super(ANALYSIS__HISTORY_LOG_COLL)
    }

    /**
     * Dev: HiepNH
     * Func: Tạo history log
     * Date: 13/12/2021
     */
    insert({ taskID, documentID, type, title, content, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!title) {
                    return resolve({ error: true, message: 'title_invalid' })
                }

                let dataInsert = { title, userCreate: userID }

                /**
                 * Ghi log cho chủ đề
                 */
                if (checkObjectIDs(taskID)) {
                    const infoTask = await PCM_PLAN_TASK_COLL.findById(taskID)
                    if (!infoTask) {
                        return resolve({
                            error: true,
                            message: 'taskID_invalid',
                        })
                    }
                    const { project, contract } = infoTask

                    dataInsert.task = taskID
                    if (checkObjectIDs(project)) {
                        dataInsert.project = project
                    }

                    if (checkObjectIDs(contract)) {
                        dataInsert.contract = contract
                    }
                }

                /**
                 * Ghi log cho hồ sơ
                 */

                if (content) {
                    dataInsert.content = content
                }

                if (type) {
                    dataInsert.type = type
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'cannot_insert_history_log',
                    })

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: get info history log
     * Author: Depv
     * Code:
     */
    getInfo({ historyLogID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(historyLogID))
                    return resolve({
                        error: true,
                        message: 'Request params historyLogID invalid',
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

                let infoAterGet = await ANALYSIS__HISTORY_LOG_COLL.findById(
                    historyLogID
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
     * Name  : Danh sách history log
     * Author: Depv
     * Code  :
     */
    getList({
        taskID,
        projectID,
        contractID,
        fromDate,
        toDate,
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
                // PHÂN TRANG KIỂU MỚI
                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await ANALYSIS__HISTORY_LOG_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastest",
                            status: 200,
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
                            status: 200,
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

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    conditionObj.name = new RegExp(keyword, 'i')
                }

                if (taskID) {
                    conditionObj.task = taskID
                }

                if (projectID) {
                    conditionObj.project = projectID
                }

                if (contractID) {
                    conditionObj.contract = contractID
                }

                if (fromDate && toDate) {
                    conditionObj.createAt = {
                        $gte: new Date(fromDate),
                        $lt: moment(toDate, 'YYYY-MM-DD').endOf('day')._d,
                    }
                }

                let infoDataAfterGet = await ANALYSIS__HISTORY_LOG_COLL.find(
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

                let totalRecord =
                    await ANALYSIS__HISTORY_LOG_COLL.countDocuments(
                        conditionObj
                    )
                let totalPage = Math.ceil(totalRecord / limit)

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit,
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
