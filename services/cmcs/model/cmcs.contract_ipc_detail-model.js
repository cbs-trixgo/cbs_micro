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
const CMCS__CONTRACT_BILL_JOB_MODEL =
    require('./cmcs.contract_bill_job-model').MODEL

class Model extends BaseModel {
    constructor() {
        super(CMCS__CONTRACT_IPC_DETAIL_COLL)
    }

    /**
     * Name: insert contract ipc
     * Author: Depv
     * Code:
     */
    insert({
        ipcID,
        jobID,
        plus,
        quantity,
        unitPrice,
        amount,
        note,
        userID,
        ctx,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * - Kiểm tra mỗi Kỳ thực hiện, 1 công việc chỉ tồn tại 1 mẩu tin duy nhất
                 */
                let info = await CMCS__CONTRACT_IPC_DETAIL_COLL.findOne({
                    ipc: ipcID,
                    job: jobID,
                })
                // console.log(info)
                if (!info) {
                    // Thông tin công việc của hợp đồng
                    const infoJob =
                        await CMCS__CONTRACT_BILL_JOB_COLL.findById(jobID)

                    if (!infoJob)
                        return resolve({
                            error: true,
                            message: 'Mã không hợp lệ',
                            keyError: KEY_ERROR.PARAMS_INVALID,
                        })

                    const { company, project, contract, item, group, plus } =
                        infoJob

                    let dataInsert = {
                        userCreate: userID,
                        company,
                        project,
                        contract,
                        item,
                        group,
                        job: jobID,
                        ipc: ipcID,
                        plus,
                    }

                    if (!isNaN(quantity)) {
                        dataInsert.quantity = Number(quantity)
                    }

                    if (!isNaN(unitPrice)) {
                        dataInsert.unitPrice = Number(unitPrice)
                    }

                    if (!isNaN(amount)) {
                        dataInsert.amount = Number(amount)
                    }

                    if (note) {
                        dataInsert.note = note
                    }

                    let infoAfterInsert = await this.insertData(dataInsert)
                    if (!infoAfterInsert)
                        return resolve({
                            error: true,
                            message: 'Không thể thêm contract ipc',
                            keyError: "can't_insert_contract_ipc ",
                        })

                    /**
                     * CẬP NHẬT THÔNG TIN NGHIỆM THU HOÀN THÀNH
                     */
                    let infoItemNew =
                        await CMCS__CONTRACT_BILL_ITEM_MODEL.updateValue({
                            option: 2,
                            itemID: item,
                            userID,
                        })
                    // console.log(infoItemNew)
                    let infoGroupNew =
                        await CMCS__CONTRACT_BILL_GROUP_MODEL.updateValue({
                            option: 2,
                            groupID: group,
                            userID,
                        })
                    // console.log(infoGroupNew)
                    let infoJobNew =
                        await CMCS__CONTRACT_BILL_JOB_MODEL.updateValue({
                            option: 2,
                            jobID,
                            userID,
                        })
                    // console.log(infoJobNew)

                    return resolve({
                        error: false,
                        data: infoAfterInsert,
                        status: 200,
                    })
                } else {
                    return resolve({
                        error: true,
                        message: 'Data exists',
                        keyError: "can't_insert",
                    })
                }
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
     * Name: update contract ipc
     * Author: Depv
     * Code:
     */
    update({ detailID, quantity, unitPrice, amount, note, userID, ctx }) {
        console.log({ detailID, quantity, unitPrice, amount, note, userID })
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                // Thông tin công việc của hợp đồng
                const infoDetail =
                    await CMCS__CONTRACT_IPC_DETAIL_COLL.findById(detailID)
                if (!infoDetail)
                    return resolve({
                        error: true,
                        message: 'Mã không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                const { item, group, job } = infoDetail

                let dataUpdate = { userUpdate: userID, modifyAt: Date.now() }

                if (!isNaN(quantity)) {
                    dataUpdate.quantity = Number(quantity)
                }

                if (!isNaN(unitPrice)) {
                    dataUpdate.unitPrice = Number(unitPrice)
                }

                if (!isNaN(amount)) {
                    dataUpdate.amount = Number(amount)
                }

                if (note) {
                    dataUpdate.note = note
                }

                let infoAfterUpdate =
                    await CMCS__CONTRACT_IPC_DETAIL_COLL.findByIdAndUpdate(
                        detailID,
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
                 * CẬP NHẬT THÔNG TIN NGHIỆM THU HOÀN THÀNH
                 */
                let infoItemNew =
                    await CMCS__CONTRACT_BILL_ITEM_MODEL.updateValue({
                        option: 2,
                        itemID: item,
                        userID,
                    })
                // console.log(infoItemNew)
                let infoGroupNew =
                    await CMCS__CONTRACT_BILL_GROUP_MODEL.updateValue({
                        option: 2,
                        groupID: group,
                        userID,
                    })
                // console.log(infoGroupNew)
                let infoJobNew =
                    await CMCS__CONTRACT_BILL_JOB_MODEL.updateValue({
                        option: 2,
                        jobID: job,
                        userID,
                    })
                // console.log(infoJobNew)

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
}

exports.MODEL = new Model()
