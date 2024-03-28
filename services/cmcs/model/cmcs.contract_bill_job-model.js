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
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')
const { KEY_ERROR } = require('../../../tools/keys/index')

/**
 * import inter-coll, exter-coll
 */
const CMCS__CONTRACT_PRODUCTION_COLL = require('../database/cmcs.contract_production-coll')
const CMCS__CONTRACT_PAYMENT_COLL = require('../database/cmcs.contract_payment-coll')
const CMCS__CONTRACT_BILL_ITEM_COLL = require('../database/cmcs.contract_bill_item-coll')
const CMCS__CONTRACT_BILL_GROUP_COLL = require('../database/cmcs.contract_bill_group-coll')
const CMCS__CONTRACT_BILL_JOB_COLL = require('../database/cmcs.contract_bill_job-coll')
const CMCS__CONTRACT_IPC_DETAIL_COLL = require('../database/cmcs.contract_ipc_detail-coll')

const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { template } = require('lodash')
const { ResumeToken } = require('mongodb')

/**
 * import inter-model, exter-model
 */
const CMCS__CONTRACT_BILL_ITEM_MODEL =
    require('./cmcs.contract_bill_item-model').MODEL
const CMCS__CONTRACT_BILL_GROUP_MODEL =
    require('./cmcs.contract_bill_group-model').MODEL

class Model extends BaseModel {
    constructor() {
        super(CMCS__CONTRACT_BILL_JOB_COLL)
    }

    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 12/9/2022
     */
    insert({
        groupID,
        plus,
        name,
        sign,
        description,
        unit,
        orgQuantity,
        orgUnitPrice,
        note,
        userID,
        ctx,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 */

                if (!name || !checkObjectIDs(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                const infoGroup =
                    await CMCS__CONTRACT_BILL_GROUP_COLL.findById(groupID)
                // console.log(infoGroup)

                if (!infoGroup)
                    return resolve({
                        error: true,
                        message: 'Mã không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                const { company, project, contract, item } = infoGroup

                let dataInsert = {
                    userCreate: userID,
                    company,
                    project,
                    contract,
                    item,
                    group: groupID,
                    name,
                }

                if (!isNaN(plus)) {
                    dataInsert.plus = Number(plus)
                }

                if (sign) {
                    dataInsert.sign = sign
                }

                if (description) {
                    dataInsert.description = description
                }

                if (unit) {
                    dataInsert.unit = unit
                }

                if (note) {
                    dataInsert.note = note
                }

                if (!isNaN(orgQuantity) && !isNaN(orgUnitPrice)) {
                    dataInsert.orgQuantity = Number(orgQuantity)
                    dataInsert.currentQuantity = Number(orgQuantity)
                    dataInsert.estimateQuantity = Number(orgQuantity)

                    dataInsert.orgUnitPrice = Number(orgUnitPrice)
                    dataInsert.currentUnitPrice = Number(orgUnitPrice)
                    dataInsert.estimateUnitPrice = Number(orgUnitPrice)

                    dataInsert.orgAmount = Number(
                        orgQuantity * orgUnitPrice
                    ).toFixed(0)
                    dataInsert.currentAmount = Number(
                        orgQuantity * orgUnitPrice
                    ).toFixed(0)
                    dataInsert.estimateAmount = Number(
                        orgQuantity * orgUnitPrice
                    ).toFixed(0)
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Không thể thêm mẩu tin',
                        keyError: "can't_insert",
                    })

                /**
                 * CẬP NHẬT GIÁ TRỊ HỢP ĐỒNG CỦA ITEM, GROUP
                 */
                let infoItemNew =
                    await CMCS__CONTRACT_BILL_ITEM_MODEL.updateValue({
                        option: 1,
                        itemID: item,
                        userID,
                    })
                // console.log(infoItemNew)
                let infoGroupNew =
                    await CMCS__CONTRACT_BILL_GROUP_MODEL.updateValue({
                        option: 1,
                        groupID,
                        userID,
                    })
                // console.log(infoGroupNew)

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
     * Author: HiepNH
     * Code: 12/9/2022
     */
    update({
        jobID,
        plus,
        name,
        sign,
        description,
        unit,
        currentQuantity,
        estimateQuantity,
        currentAmount,
        currentUnitPrice,
        estimateUnitPrice,
        estimateAmount,
        note,
        userID,
        ctx,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 */
                const infoJob =
                    await CMCS__CONTRACT_BILL_JOB_COLL.findById(jobID)
                if (!infoJob)
                    return resolve({
                        error: true,
                        message: 'Mã không hợp kệ',
                        keyError: 'id_invalid',
                    })
                console.log(infoJob)

                const { item, group } = infoJob

                if (!name || !checkObjectIDs(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                let dataUpdate = {
                    userUpdate: userID,
                    name,
                    modifyAt: Date.now(),
                }

                if (!isNaN(plus)) {
                    dataUpdate.plus = Number(plus)
                }

                if (sign) {
                    dataUpdate.sign = sign
                }

                if (description) {
                    dataUpdate.description = description
                }

                if (unit) {
                    dataUpdate.unit = unit
                }

                if (note) {
                    dataUpdate.note = note
                }

                if (!isNaN(currentQuantity)) {
                    dataUpdate.currentQuantity = Number(currentQuantity)
                }
                if (!isNaN(estimateQuantity)) {
                    dataUpdate.estimateQuantity = Number(estimateQuantity)
                }

                if (!isNaN(currentUnitPrice)) {
                    dataUpdate.currentUnitPrice = Number(currentUnitPrice)
                }
                if (!isNaN(estimateUnitPrice)) {
                    dataUpdate.estimateUnitPrice = Number(estimateUnitPrice)
                }

                if (!isNaN(currentAmount)) {
                    dataUpdate.currentAmount = Number(currentAmount)
                }
                if (!isNaN(estimateAmount)) {
                    dataUpdate.estimateAmount = Number(estimateAmount)
                }

                let infoAfterUpdate =
                    await CMCS__CONTRACT_BILL_JOB_COLL.findByIdAndUpdate(
                        jobID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: "can't_update",
                        status: 403,
                    })

                /**
                 * CẬP NHẬT GIÁ TRỊ HỢP ĐỒNG CỦA ITEM, GROUP
                 */
                let infoItemNew =
                    await CMCS__CONTRACT_BILL_ITEM_MODEL.updateValue({
                        option: 1,
                        itemID: item,
                        userID,
                    })
                // console.log(infoItemNew)
                let infoGroupNew =
                    await CMCS__CONTRACT_BILL_GROUP_MODEL.updateValue({
                        option: 1,
                        groupID: group,
                        userID,
                    })
                // console.log(infoGroupNew)

                return resolve({
                    error: false,
                    data: infoAfterUpdate,
                    status: 200,
                })
            } catch (error) {
                console.log(error)
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Name: Update value
     * Author: HiepNH
     * Code: 13/9/2022
     */
    updateValue({ option, jobID, userID }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Cập nhật giá trị hợp đồng
                 * 2-Cập nhật giá trị nghiệm thu (tổng lũy kế)
                 */

                if (!checkObjectIDs(jobID))
                    return resolve({
                        error: true,
                        message: 'Mã hiệu không đúng',
                        keyError: 'id_invalid',
                    })

                let dataUpdate = { userUpdate: userID, modifyAt: Date.now() }

                //_____CẬP NHẬT GIÁ TRỊ NGHIỆM THU HOÀN THÀNH
                if (option && Number(option) === 2) {
                    let listData =
                        await CMCS__CONTRACT_IPC_DETAIL_COLL.aggregate([
                            {
                                $match: {
                                    job: ObjectID(jobID),
                                },
                            },
                            {
                                $group: {
                                    _id: {},
                                    totalQuantity: { $sum: '$quantity' },
                                    totalAmount: { $sum: '$amount' },
                                    // totalAmount: { $sum: { $multiply: [ "$planQuantity", "$planUnitPrice" ] } },
                                },
                            },
                        ])
                    // console.log(listData)

                    if (listData && listData.length) {
                        dataUpdate.inspecQuantity = Number(
                            listData[0].totalQuantity
                        )
                        dataUpdate.inspecAmount = Number(
                            listData[0].totalAmount
                        )
                    }
                }

                let infoAfterUpdate =
                    await CMCS__CONTRACT_BILL_JOB_COLL.findByIdAndUpdate(
                        jobID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: "can't_update",
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
     * Author: HiepNH
     * Code: 13/9/2022
     */

    /**
     * Name: Getinfo
     * Author: HiepNH
     * Code: 13/9/2022
     */
    getInfo({ jobID, select, populates }) {
        console.log('===========>>>>>>>>>>>>>>')
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(jobID))
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
                    await CMCS__CONTRACT_BILL_JOB_COLL.findById(jobID)
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
     * Name  : Getlist
     * Author: HiepNH
     * Code: 13/9/2022
     */
    getList({
        groupID,
        plus,
        userID,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates = {},
    }) {
        console.log({
            groupID,
            userID,
            keyword,
            limit,
            lastestID,
            select,
            populates,
        })
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

                if (groupID && checkObjectIDs(groupID)) {
                    conditionObj.group = ObjectID(groupID)
                } else {
                    if (itemID && checkObjectIDs(itemID)) {
                        conditionObj.item = ObjectID(itemID)
                    } else {
                        conditionObj.contract = ObjectID(contractID)
                    }
                }

                if (!isNaN(plus)) {
                    conditionObj.plus = Number(plus)
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
                        await CMCS__CONTRACT_BILL_JOB_COLL.findById(lastestID)
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

                let infoDataAfterGet = await CMCS__CONTRACT_BILL_JOB_COLL.find(
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
                    await CMCS__CONTRACT_BILL_JOB_COLL.count(conditionObjOrg)
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
