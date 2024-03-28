'use strict'

const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const ObjectID = require('mongoose').Types.ObjectId

// const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
// const { CF_ACTIONS_AUTH } 		        = require('../../auth/helper/auth.actions-constant');

const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const { uploadFileS3 } = require('../../../tools/s3')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys/index')
const { FNB_ACC } = require('../../fnb/helper/fnb.keys-constant')

/**
 * import inter-coll, exter-coll
 */
const FIN__CASH_PAYMENT_COLL = require('../database/fin.cash_payment-coll')
const CONTACT_COLL = require('../../item/database/item.contact-coll')

/**
 * import inter-model, exter-model
 */
const AUTH__APP_USER = require('../.../../../auth/model/auth.app_users').MODEL
const FNB_ORDER_MODEL = require('../../fnb/model/fnb.order-model').MODEL

class Model extends BaseModel {
    constructor() {
        super(FIN__CASH_PAYMENT_COLL)
    }

    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert({
        companyID,
        userID,
        email,
        customerID,
        name,
        note,
        amount,
        payment,
    }) {
        // const that = this
        return new Promise(async (resolve) => {
            try {
                if (FNB_ACC.cskh.includes(email.toString())) {
                    /**
                     * BA
                     * 1. Tạo data Ví payment
                     * 2. Tính toán: tổng tích điểm, tổng còn lại theo BE
                     * 3. Cộng thêm Payment vào Tích điểm
                     * 4. Khi khách sử dụng mua hàng từ Tích điểm thì trừ tiền như bình thường
                     */
                    if (
                        !name ||
                        !checkObjectIDs(userID) ||
                        !checkObjectIDs(customerID) ||
                        !checkObjectIDs(companyID)
                    )
                        return resolve({
                            error: true,
                            message: 'param_not_valid',
                        })

                    //___________Quyền truy cập ứng dụng Tài chính
                    let infoAppUser =
                        await AUTH__APP_USER.checkPermissionsAccessApp({
                            appID: '5dfe4bc751dc622100bb9d8a',
                            userID,
                        })

                    // Chỉ admin ứng dụng mới có quyền
                    if (infoAppUser && infoAppUser.data.level == 0) {
                        let dataInsert = {
                            company: companyID,
                            userCreate: userID,
                            userUpdate: userID,
                            modifyAt: new Date(),
                            customer: customerID,
                            name,
                        }

                        if (note) {
                            dataInsert.note = note
                        }

                        if (!isNaN(amount)) {
                            dataInsert.amount = amount
                        }

                        if (!isNaN(payment)) {
                            dataInsert.payment = payment
                        }

                        let infoAfterInsert = await this.insertData(dataInsert)
                        if (!infoAfterInsert)
                            return resolve({
                                error: true,
                                message: 'Thêm thất bại',
                                keyError: KEY_ERROR.INSERT_FAILED,
                                status: 403,
                            })

                        await FNB_ORDER_MODEL.updateCustomer({
                            customerID,
                            userID,
                        })

                        return resolve({
                            error: false,
                            data: infoAfterInsert,
                            status: 200,
                        })
                    } else {
                        return resolve({
                            error: true,
                            message: 'Bạn không có quyền',
                            status: 500,
                        })
                    }
                } else {
                    return resolve({
                        error: true,
                        message: 'Bạn không có quyền',
                        status: 500,
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
     * Name: Update
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    update({
        cashPaymentID,
        userID,
        email,
        name,
        note,
        amount,
        payment,
        active,
    }) {
        // console.log({ cashPaymentID, userID, email, name, note, amount, payment })
        // const that = this
        return new Promise(async (resolve) => {
            try {
                if (FNB_ACC.cskh.includes(email.toString())) {
                    if (
                        !name ||
                        !checkObjectIDs(userID) ||
                        !checkObjectIDs(cashPaymentID)
                    )
                        return resolve({
                            error: true,
                            message: 'param_not_valid',
                        })

                    let dataUpdate = {
                        userUpdate: userID,
                        modifyAt: new Date(),
                        name,
                    }

                    if (note) {
                        dataUpdate.note = note
                    }

                    if (!isNaN(amount)) {
                        dataUpdate.amount = amount
                    }

                    if (!isNaN(payment)) {
                        dataUpdate.payment = payment
                    }

                    if (!isNaN(active) && [1, 2].includes(Number(active))) {
                        dataUpdate.active = active
                    }

                    let infoAfterUpdate =
                        await FIN__CASH_PAYMENT_COLL.findByIdAndUpdate(
                            cashPaymentID,
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

                    // Cập nhật Tích điểm + Gói trả trước
                    if (!isNaN(active) && [1, 2].includes(Number(active))) {
                        await FNB_ORDER_MODEL.updateCustomer({
                            customerID: infoAfterUpdate.customer,
                            userID,
                        })
                    }

                    return resolve({
                        error: false,
                        data: infoAfterUpdate,
                        status: 200,
                    })
                } else {
                    return resolve({
                        error: true,
                        message: 'Bạn không có quyền',
                        status: 500,
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
     * Name: Get info
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getInfo({ cashPaymentID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(cashPaymentID))
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

                let infoContractIPC = await FIN__CASH_PAYMENT_COLL.findById(
                    cashPaymentID
                )
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
     * Name  : Get list
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getList({
        companyID,
        active,
        customerID,
        userCreateID,
        keyword,
        limit = 30,
        lastestID,
        select,
        populates = {},
        sortKey,
    }) {
        return new Promise(async (resolve) => {
            try {
                let sortBy
                let conditionObj = { company: companyID }
                let keys = ['createAt__-1', '_id__-1']

                if (limit > 30) {
                    limit = 30
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

                if (checkObjectIDs(customerID)) {
                    conditionObj.customer = customerID
                }

                if (checkObjectIDs(userCreateID)) {
                    conditionObj.userCreate = userCreateID
                }

                if (active) {
                    conditionObj.active = Number(active)
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    conditionObj.name = RegExp(keyword, 'i')
                }

                let conditionObjOrg = { ...conditionObj }

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await FIN__CASH_PAYMENT_COLL.findById(lastestID)
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

                let infoDataAfterGet = await FIN__CASH_PAYMENT_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
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
                    await FIN__CASH_PAYMENT_COLL.count(conditionObjOrg)
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

    /*
     * Name: Gom nhóm theo thuộc tính
     * Code: Hiepnh
     * Date: 17/04/2022
     */
    getAmountByProperty({ companyID, customerID, option, year }) {
        // console.log({ companyID, customerID, option, year })
        return new Promise(async (resolve) => {
            try {
                let yearFilter
                let currentYear = new Date().getFullYear()
                if (year && !isNaN(year)) {
                    yearFilter = Number(year)
                } else {
                    yearFilter = Number(currentYear)
                }

                let conditionObj = {},
                    conditionGroup = {},
                    conditionObjYear = {}

                if (
                    !option ||
                    isNaN(option) ||
                    ![1, 2, 3, 4].includes(Number(option))
                )
                    return resolve({
                        error: true,
                        message: 'Tham số option không hợp lệ',
                        keyError: 'option_invalid',
                    })

                if (Number(option) === 1) {
                    // Không truyền companyID do gắn token chết cứng với linkProfile (phân vùng kiểm thử)
                    conditionObj.active = 1
                    conditionObj.customer = ObjectID(customerID)

                    conditionGroup = {
                        _id: {},
                        amount: { $sum: '$amount' },
                    }
                } else if (Number(option) === 2) {
                    conditionObj.company = ObjectID(companyID)
                    conditionObj.active = 1

                    conditionObjYear = {
                        year: Number(yearFilter),
                    }

                    conditionGroup = {
                        _id: { month: '$month' },
                        amount: { $sum: '$amount' },
                    }
                } else if (Number(option) === 3) {
                    conditionObj.company = ObjectID(companyID)
                    conditionObj.active = 1

                    conditionObjYear = {
                        year: Number(yearFilter),
                    }

                    conditionGroup = {
                        _id: {},
                        amount: { $sum: '$amount' },
                    }
                }

                // console.log(conditionObj)
                // console.log(conditionObjYear)
                // console.log(conditionGroup)

                let listData = await FIN__CASH_PAYMENT_COLL.aggregate([
                    {
                        $match: conditionObj,
                    },
                    {
                        $project: {
                            year: { $year: '$date' },
                            month: { $month: '$date' },
                            date: 1,
                            customer: 1,
                            active: 1,
                            amount: 1,
                            payment: 1,
                        },
                    },
                    {
                        $match: conditionObjYear,
                    },
                    {
                        $group: conditionGroup,
                    },
                ])

                // console.log(listData)

                return resolve({ error: false, data: listData })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Download Template Excel
     * Code: Hiepnh
     * Date: 25/7/2023
     */
    downloadTemplateExcel({ option, companyID, parentID, year, userID }) {
        // console.log({ option, companyID, parentID, userID })
        return new Promise(async (resolve) => {
            try {
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
     * Name: Import Excel
     * Code: Hiepnh
     * Date: 25/7/2023
     */
    importFromExcel({ option, companyID, parentID, dataImport, userID, ctx }) {
        // console.log({option, companyID, parentID, dataImport, userID})
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(parentID))
                    return resolve({
                        error: true,
                        message: 'parentID_invalid',
                        status: 400,
                    })

                const dataImportJSON = JSON.parse(dataImport)
                let index = 0
                let errorNumber = 0

                for (const data of dataImportJSON) {
                    if (index > 0) {
                        // console.log('===================')
                        // console.log(data)
                        let dataInsert = {
                            companyID,
                            userID,
                            parentID,
                            accountID: data?.__EMPTY_14,
                            customerID: data?.__EMPTY_15,
                            contractID: data?.__EMPTY_16,
                            name: data?.__EMPTY_1,
                            note: data?.__EMPTY_7,
                            date: data?.__EMPTY_13,
                            income: data?.__EMPTY_5,
                            expense: data?.__EMPTY_6,
                        }
                        // console.log(dataInsert)

                        let infoAfterInsert = await this.insert(dataInsert)
                        // console.log(infoAfterInsert)
                        if (infoAfterInsert.error) {
                            errorNumber++
                        }
                    }
                    index++
                }

                if (errorNumber != 0)
                    return resolve({ error: true, message: 'import field' })

                // Update timeImportExcel trick reload việc con
                // await FIN__CASH_PAYMENT_COLL.findByIdAndUpdate(parentID, { $set: { timeImportExcel: new Date() }}, { new: true });

                return resolve({ error: false, message: 'import success' })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    exportExcel({ customerID, userCreateID }) {
        // console.log({ customerID, userCreateID })
        return new Promise(async (resolve) => {
            try {
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
