'use strict'
const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const { isValidDate } = require('../../../tools/utils/time_utils')

const ObjectID = require('mongoose').Types.ObjectId
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
    CF_ACTIONS_ACCOUNTING,
} = require('../../accounting/helper/accounting.actions-constant')

const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const { uploadFileS3 } = require('../../../tools/s3')

/**
 * import inter-coll, exter-coll
 */
const BUDGET_COLL = require('../database/budget-coll')
const BUDGET__ITEM_COLL = require('../database/budget.item-coll')
const BUDGET__GROUP_COLL = require('../database/budget.group-coll')
const BUDGET__WORK_COLL = require('../database/budget.work-coll')

const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys/index')

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
    constructor() {
        super(BUDGET_COLL)
    }

    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert({
        userID,
        companyID,
        type,
        projectID,
        contractID,
        name,
        sign,
        description,
        date,
        note,
        revenue,
        vatRevenue,
        forecastRevenue,
        forecastVatRevenue,
        finalRevenue,
        finalVatRevenue,
    }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataInsert = {
                    userCreate: userID,
                    company: companyID,
                    admins: [userID],
                    members: [userID],
                }

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (checkObjectIDs(projectID)) {
                    dataInsert.project = projectID
                }

                if (checkObjectIDs(contractID)) {
                    dataInsert.contract = contractID
                }

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                if (type && [1, 2, 3].includes(Number(type))) {
                    dataInsert.type = type
                }

                if (name) {
                    dataInsert.name = name
                }

                if (sign) {
                    dataInsert.sign = sign
                }

                if (description) {
                    dataInsert.description = description
                }

                if (date && isValidDate(date)) {
                    dataInsert.date = new Date(date)
                }

                if (note) {
                    dataInsert.note = note
                }

                //______Giá trị
                if (!isNaN(revenue) && Number(revenue) >= 0) {
                    dataInsert.revenue = revenue
                }
                if (!isNaN(vatRevenue) && Number(vatRevenue) >= 0) {
                    dataInsert.vatRevenue = vatRevenue
                }
                if (!isNaN(forecastRevenue) && Number(forecastRevenue) >= 0) {
                    dataInsert.forecastRevenue = forecastRevenue
                }
                if (
                    !isNaN(forecastVatRevenue) &&
                    Number(forecastVatRevenue) >= 0
                ) {
                    dataInsert.forecastVatRevenue = forecastVatRevenue
                }
                if (!isNaN(finalRevenue) && Number(finalRevenue) >= 0) {
                    dataInsert.finalRevenue = finalRevenue
                }
                if (!isNaN(finalVatRevenue) && Number(finalVatRevenue) >= 0) {
                    dataInsert.finalVatRevenue = finalVatRevenue
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                        status: 403,
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
    update({
        budgetID,
        type,
        projectID,
        contractID,
        name,
        sign,
        description,
        date,
        note,
        revenue,
        vatRevenue,
        forecastRevenue,
        forecastVatRevenue,
        finalRevenue,
        finalVatRevenue,
        userID,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(budgetID))
                    return resolve({
                        error: true,
                        message: 'Mã không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (checkObjectIDs(projectID)) {
                    dataUpdate.project = projectID
                }

                if (checkObjectIDs(contractID)) {
                    dataUpdate.contract = contractID
                }

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                if (type && [1, 2, 3].includes(Number(type))) {
                    dataUpdate.type = type
                }

                if (name) {
                    dataUpdate.name = name
                }

                if (sign) {
                    dataUpdate.sign = sign
                }

                if (description) {
                    dataUpdate.description = description
                }

                if (date) {
                    dataUpdate.date = date
                }

                if (note) {
                    dataUpdate.note = note
                }

                //______Giá trị
                if (!isNaN(revenue) && Number(revenue) >= 0) {
                    dataUpdate.revenue = revenue
                }
                if (!isNaN(vatRevenue) && Number(vatRevenue) >= 0) {
                    dataUpdate.vatRevenue = vatRevenue
                }
                if (!isNaN(forecastRevenue) && Number(forecastRevenue) >= 0) {
                    dataUpdate.forecastRevenue = forecastRevenue
                }
                if (
                    !isNaN(forecastVatRevenue) &&
                    Number(forecastVatRevenue) >= 0
                ) {
                    dataUpdate.forecastVatRevenue = forecastVatRevenue
                }
                if (!isNaN(finalRevenue) && Number(finalRevenue) >= 0) {
                    dataUpdate.finalRevenue = finalRevenue
                }
                if (!isNaN(finalVatRevenue) && Number(finalVatRevenue) >= 0) {
                    dataUpdate.finalVatRevenue = finalVatRevenue
                }

                let infoAfterUpdate = await BUDGET_COLL.findByIdAndUpdate(
                    budgetID,
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
    getInfo({ budgetID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(budgetID))
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

                let info = await BUDGET_COLL.findById(budgetID)
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
        isMember,
        companyID,
        projectID,
        contractID,
        type,
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

                if (type) {
                    conditionObj.type = type
                }

                if (contractID) {
                    conditionObj.contract = contractID
                } else {
                    if (projectID) {
                        conditionObj.project = projectID
                    } else {
                        if (companyID) {
                            conditionObj.company = companyID
                            // conditionObj.members = { $in: [userID] }
                        }
                    }
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    let regExpSearch = RegExp(keyword, 'i')
                    conditionObj.name = regExpSearch
                }
                let conditionObjOrg = { ...conditionObj }

                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await BUDGET_COLL.findById(lastestID)
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

                let infoDataAfterGet = await BUDGET_COLL.find(conditionObj)
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

                let totalRecord = await BUDGET_COLL.count(conditionObjOrg)
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
     * Name  : Cập nhật giá trị (ngân sách, thực hiện, dự báo)
     * Author: Hiepnh
     * Date  : 10/4/2022
     */
    updateValue({ option, budgetID, userID, ctx }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Cập nhật giá trị ngân sách
                 * 2-Cập nhật dự báo ngân sách
                 * 3-Cập nhật thực hiện ngân sách
                 */
                if (!checkObjectIDs(budgetID))
                    return resolve({
                        error: true,
                        message: 'Mã hiệu không đúng',
                        keyError: 'budgetID_invalid',
                    })

                let dataUpdate = { userUpdate: userID }

                // Cập nhật Ngân sách theo kế hoạch và dự báo ngân sách
                if (option && Number(option) === 1) {
                    let listDataWork = await BUDGET__WORK_COLL.aggregate([
                        {
                            $match: {
                                budget: ObjectID(budgetID),
                            },
                        },
                        {
                            $group: {
                                _id: {},
                                amount: { $sum: '$amount' },
                                forecastAmount: { $sum: '$forecastAmount' },
                            },
                        },
                    ])
                    if (listDataWork && listDataWork.length) {
                        dataUpdate.budget = Number(listDataWork[0].amount)
                        dataUpdate.forecastBudget = Number(
                            listDataWork[0].forecastAmount
                        )
                    }
                }

                // Cập nhật Ngân sách thực hiện
                if (option && Number(option) === 2) {
                    const infoImpleBudget = await ctx.call(
                        `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_CAL_IMPLE_BUDGET}`,
                        {
                            budgetID,
                        }
                    )
                    // console.log(infoImpleBudget)
                    if (infoImpleBudget) {
                        dataUpdate.finalBudget = Number(
                            infoImpleBudget.data.amount
                        )
                    }
                }

                let infoAfterUpdate = await BUDGET_COLL.findByIdAndUpdate(
                    budgetID,
                    dataUpdate,
                    { new: true }
                )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: "can't_update_budget",
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
     * Name: Download Template Excel
     * Author: HiepNH
     * Date: 21/3/2023
     */
    downloadTemplateExcel({ option, projectID, userID }) {
        // console.log({ option, projectID, userID })
        return new Promise(async (resolve) => {
            try {
                // let listData  = await PCM_PLAN_GROUP_COLL.find({ project: projectID }).select('name sign members')
                // .sort({_id: -1})
                // .limit(200)
                // console.log(listData)

                // Modify the workbook.
                XlsxPopulate.fromFileAsync(
                    path.resolve(
                        __dirname,
                        '../../../files/templates/excels/budget_import.xlsm'
                    )
                ).then(async (workbook) => {
                    var i = 4
                    // infoProject.members?.forEach((item, index) => {
                    //     workbook.sheet("ThanhVienDuAn").row(i).cell(1).value(Number(index+1))
                    //     workbook.sheet("ThanhVienDuAn").row(i).cell(2).value(item.fullname)
                    //     workbook.sheet("ThanhVienDuAn").row(i).cell(3).value(`${item._id}`)

                    //     if(infoProject?.admins.includes(item._id)){
                    //         workbook.sheet("ThanhVienDuAn").row(i).cell(4).value(1)
                    //     }

                    //     workbook.sheet("ThanhVienDuAn").row(i).cell(5).value(1)

                    //     i++
                    // });

                    const now = new Date()
                    const filePath = '../../../files/temporary_uploads/'
                    const fileName = `budget_import_${now.getTime()}.xlsm`
                    const pathWriteFile = path.resolve(
                        __dirname,
                        filePath,
                        fileName
                    )

                    await workbook.toFileAsync(pathWriteFile)
                    const result = await uploadFileS3(pathWriteFile, fileName)

                    fs.unlinkSync(pathWriteFile)
                    return resolve({
                        error: false,
                        data: result?.Location,
                        status: 200,
                    })
                })
            } catch (error) {
                console.log({ error })
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
     * Func: Tạo task từ dữ liệu excel
     * Date: 15/09/2022
     */
    importExcel({ option, projectID, dataImport, userID }) {
        // console.log({option, projectID, userID})
        return new Promise(async (resolve) => {
            try {
                // if(!checkObjectIDs(projectID))
                //     return resolve({ error: true, message: 'projectID_invalid', status: 400 })

                const dataImportJSON = JSON.parse(dataImport)
                let index = 0
                let errorNumber = 0

                for (const data of dataImportJSON) {
                    if (index > 0) {
                        let dataInsert = {
                            name: data?.__EMPTY_1,
                            groupID: data?.__EMPTY_12,
                            authorID: userID,
                            sign: data?.__EMPTY_8,
                            type: data?.__EMPTY_9,
                            description: data?.__EMPTY_10,
                            startTime: data?.__EMPTY_14,
                            expiredTime: data?.__EMPTY_15,
                            assigneeID: data?.__EMPTY_13,
                            draft: data?.__EMPTY_17,
                            contractID: data?.__EMPTY_16,
                            subType: data?.__EMPTY_9,
                        }
                        // console.log(dataInsert)
                    }

                    index++
                }

                if (errorNumber != 0)
                    return resolve({ error: true, message: 'import field' })

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
}

exports.MODEL = new Model()
