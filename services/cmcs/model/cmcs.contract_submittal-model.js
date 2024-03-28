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
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
    CF_ACTIONS_BUDGET,
} = require('../../budget/helper/budget.actions-constant')

/**
 * import inter-coll, exter-coll
 */
const CMCS__CONTRACT_SUBMITTAL_COLL = require('../database/cmcs.contract_submittal-coll')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const PCM_PLAN_TASK_COLL = require('../.../../../subject_pcm/database/subject_pcm.pcm_plan_task-coll')

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
    constructor() {
        super(CMCS__CONTRACT_SUBMITTAL_COLL)
    }

    /**
     * Name: Insert
     * Author: Hiepnh
     * Code:
     */
    insert({
        userID,
        plus,
        taskID,
        workID,
        name,
        sign,
        note,
        quantity,
        unitPrice,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                let infoTask = await PCM_PLAN_TASK_COLL.findById(taskID)
                if (!infoTask)
                    return resolve({
                        error: true,
                        message: 'taskID không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let dataInsert = {
                    userCreate: userID,
                    task: taskID,
                    company: infoTask.company,
                }

                if (checkObjectIDs(workID)) {
                    dataInsert.work = workID
                }

                if (plus && [1, 2, 3].includes(Number(plus))) {
                    dataInsert.plus = plus
                }

                if (!isNaN(quantity) && !isNaN(unitPrice)) {
                    dataInsert.quantity = quantity
                    dataInsert.unitPrice = unitPrice
                    dataInsert.amount = quantity * unitPrice
                }

                if (name) {
                    dataInsert.name = name
                }

                if (sign) {
                    dataInsert.sign = sign
                }

                if (note) {
                    dataInsert.note = note
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Không thể thêm',
                        keyError: "can't_insert_budget_submittal ",
                    })

                await that.updateValue({ taskID, userID })

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
     * Code:
     */
    update({
        submitID,
        userID,
        plus,
        workID,
        name,
        sign,
        note,
        quantity,
        unitPrice,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(submitID))
                    return resolve({
                        error: true,
                        message: 'submitID_invalid',
                        keyError: 'submitID_invalid',
                    })

                let inforSubmit =
                    await CMCS__CONTRACT_SUBMITTAL_COLL.findById(submitID)
                // console.log(inforSubmit)

                let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

                if (checkObjectIDs(workID)) {
                    dataUpdate.work = workID
                }

                if (plus && [1, 2, 3].includes(Number(plus))) {
                    dataUpdate.plus = plus
                }

                if (!isNaN(quantity) && !isNaN(unitPrice)) {
                    dataUpdate.quantity = quantity
                    dataUpdate.unitPrice = unitPrice
                    dataUpdate.amount = quantity * unitPrice
                }

                if (name) {
                    dataUpdate.name = name
                }

                if (sign) {
                    dataUpdate.sign = sign
                }

                if (note) {
                    dataUpdate.note = note
                }

                let infoAfterUpdate =
                    await CMCS__CONTRACT_SUBMITTAL_COLL.findByIdAndUpdate(
                        submitID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: "can't_update_submittal",
                        status: 403,
                    })

                if (inforSubmit.task) {
                    await that.updateValue({ taskID: inforSubmit.task, userID })
                }

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
     * Name: Cập nhật giá trị của Task
     * Author: Hiepnh
     * Code:
     */
    updateValue({ taskID, userID }) {
        return new Promise(async (resolve) => {
            try {
                let infoTask = await PCM_PLAN_TASK_COLL.findById(taskID)
                if (!infoTask)
                    return resolve({
                        error: true,
                        message: 'taskID không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

                let listData = await CMCS__CONTRACT_SUBMITTAL_COLL.aggregate([
                    {
                        $match: {
                            task: ObjectID(taskID),
                        },
                    },
                    {
                        $group: {
                            _id: {},
                            amount: { $sum: '$amount' },
                        },
                    },
                ])
                // console.log(listData)
                let newAmount = 0
                if (listData[0]) {
                    newAmount = listData[0].amount
                }
                dataUpdate.amount = Number(newAmount)

                let infoAfterUpdate =
                    await PCM_PLAN_TASK_COLL.findByIdAndUpdate(
                        taskID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: "can't_update_task",
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
     * Code:
     */

    /**
     * Name: Get info
     * Author: Hiepnh
     * Code:
     */
    getInfo({ submitID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(submitID))
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

                let infoContractIPC =
                    await CMCS__CONTRACT_SUBMITTAL_COLL.findById(submitID)
                        .select(select)
                        .populate(populates)

                if (!infoContractIPC)
                    return resolve({ error: true, message: 'cannot_get' })

                return resolve({ error: false, data: infoContractIPC })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Danh sách
     * Author: Hiepnh
     * Code  :
     */
    getList({
        taskID,
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

                let sortBy
                let conditionObj = {}
                let keys = ['createAt__1', '_id__1']

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

                if (taskID && checkObjectIDs(taskID)) {
                    conditionObj.task = taskID
                }

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
                        await CMCS__CONTRACT_SUBMITTAL_COLL.findById(lastestID)
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

                let infoDataAfterGet = await CMCS__CONTRACT_SUBMITTAL_COLL.find(
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
                    await CMCS__CONTRACT_SUBMITTAL_COLL.count(conditionObjOrg)
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

    /**
     * Name: Gom nhóm theo thuộc tính
     * Author: Hiepnh
     * Date: 21/9/2022
     */
    getListByProperty({ userID, option, taskID, companyID }) {
        return new Promise(async (resolve) => {
            try {
                let conditionObj = {}
                if (!option) {
                    conditionObj = {
                        task: ObjectID(taskID),
                    }
                    let listData =
                        await CMCS__CONTRACT_SUBMITTAL_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $group: {
                                    _id: { work: '$work' },
                                    quantity: { $sum: '$quantity' },
                                    amount: { $sum: '$amount' },
                                },
                            },
                        ])

                    return resolve({ error: false, data: listData })
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }
}

exports.MODEL = new Model()
