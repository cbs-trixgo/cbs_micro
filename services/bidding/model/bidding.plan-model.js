'use strict'

/**
 * EXTERNAL PACKAGE
 */
const ObjectID = require('mongoose').Types.ObjectId

/**
 * CONSTANTS
 */
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')

/**
 * TOOLS
 */
const {
    checkObjectIDs,
    IsJsonString,
    _isValid,
} = require('../../../tools/utils/utils')
const BaseModel = require('../../../tools/db/base_model')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys/index')

/**
 * COLLECTIONS
 */
const BIDDING__PLAN_COLL = require('../database/bidding.plan-coll')

/**
 * MODELS
 */

class Model extends BaseModel {
    constructor() {
        super(BIDDING__PLAN_COLL)
    }

    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    insert({
        userID,
        parentID,
        fieldID,
        areaID,
        projectID,
        bidderID,
        contractID,
        type,
        name,
        sign,
        description,
        note,
        status,
        percentOfCompletedPackage,
        startTime,
        finishTime,
        actualStartTime,
        closingTime,
        actualFinishTime,
        form,
        contractType,
        duration,
        progress,
        packagePrice,
        tenderPrice,
        vatTenderPrice,
        ctx,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(userID) || !checkObjectIDs(projectID))
                    return resolve({
                        error: true,
                        message:
                            'Request params projectID|companyID|userID invalid',
                    })

                // Thông tin dự án
                let infoProject = await ctx.call(
                    `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
                    {
                        departmentID: projectID,
                        select: '_id name sign company area',
                    }
                )

                if (!infoProject)
                    return resolve({
                        error: true,
                        message: 'Can not get Project info',
                    })

                if (!infoProject.data.area || !_isValid(infoProject.data.area))
                    return resolve({
                        error: true,
                        message: 'Không tồn tại khu vực trong dự án',
                    })

                let dataInsert = {
                    userCreate: userID,
                    area: infoProject.data.area,
                    client: infoProject.data.company,
                    admins: [userID],
                    members: [userID],
                }

                if (checkObjectIDs(parentID)) {
                    dataInsert.parent = parentID
                }

                if (checkObjectIDs(fieldID)) {
                    dataInsert.field = fieldID
                }

                if (checkObjectIDs(areaID)) {
                    dataInsert.area = areaID
                }

                if (checkObjectIDs(projectID)) {
                    dataInsert.project = projectID
                }

                if (checkObjectIDs(bidderID)) {
                    dataInsert.bidder = bidderID
                }

                if (checkObjectIDs(contractID)) {
                    dataInsert.contract = contractID
                }

                if (!isNaN(type) && Number(type) > 0) {
                    dataInsert.type = type
                }

                if (!isNaN(status) && Number(status) > 0) {
                    dataInsert.status = status
                }

                if (
                    !isNaN(percentOfCompletedPackage) &&
                    Number(percentOfCompletedPackage) > 0
                ) {
                    dataInsert.percentOfCompletedPackage =
                        percentOfCompletedPackage
                }

                if (!isNaN(form) && Number(form) > 0) {
                    dataInsert.form = form
                }

                if (!isNaN(contractType) && Number(contractType) > 0) {
                    dataInsert.contractType = contractType
                }

                if (!isNaN(duration) && Number(duration) > 0) {
                    dataInsert.duration = duration
                }

                if (!isNaN(progress) && Number(progress) > 0) {
                    dataInsert.progress = progress
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

                if (note) {
                    dataInsert.note = note
                }

                if (startTime) {
                    dataInsert.startTime = startTime
                }

                if (finishTime) {
                    dataInsert.finishTime = finishTime
                }

                if (actualStartTime) {
                    dataInsert.actualStartTime = actualStartTime
                }

                if (actualFinishTime) {
                    dataInsert.actualFinishTime = actualFinishTime
                }

                if (closingTime) {
                    dataInsert.closingTime = closingTime
                }

                if (!isNaN(packagePrice) && Number(packagePrice) > 0) {
                    dataInsert.packagePrice = packagePrice
                }

                if (!isNaN(tenderPrice) && Number(tenderPrice) > 0) {
                    dataInsert.tenderPrice = tenderPrice
                }

                if (!isNaN(vatTenderPrice) && Number(vatTenderPrice) > 0) {
                    dataInsert.vatTenderPrice = vatTenderPrice
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                        status: 403,
                    })

                /**
                 * CẬP NHẬT THÔNG TIN LẠI VỀ DỰ ÁN
                 */
                // Tính toán số lượng, giá trị
                let infoCal = await that.getAmountByObject({
                    userID,
                    projectID,
                })

                // Cập nhật vào thông tin dự án
                if (infoCal) {
                    infoProject = await ctx.call(
                        `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
                        {
                            departmentID: projectID,
                            numberOfPackage: infoCal.data.numberOfPackage,
                            numberOfUnexecutedPackage:
                                infoCal.data.numberOfUnexecutedPackage,
                            numberOfExecutedPackage:
                                infoCal.data.numberOfExecutedPackage,
                            numberOfCompletedPackage:
                                infoCal.data.numberOfCompletedPackage,
                            amountOfUnexecutedPackage:
                                infoCal.data.amountOfUnexecutedPackage,
                            amountOfExecutedPackage:
                                infoCal.data.amountOfExecutedPackage,
                            amountOfCompletedPackage:
                                infoCal.data.amountOfCompletedPackage,
                            percentOfCompletedPackage:
                                infoCal.data.percentOfCompletedPackage,
                        }
                    )
                }

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
     * Date: 30/4/2022
     */
    update({
        planID,
        userID,
        ctx,
        fieldID,
        bidderID,
        contractID,
        type,
        name,
        sign,
        description,
        note,
        status,
        percentOfCompletedPackage,
        startTime,
        finishTime,
        actualStartTime,
        closingTime,
        actualFinishTime,
        form,
        contractType,
        duration,
        progress,
        packagePrice,
        tenderPrice,
        vatTenderPrice,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { userUpdate: userID }

                if (!checkObjectIDs(planID))
                    return resolve({
                        error: true,
                        message: 'Mã không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                // Thông tin dự án
                let infoPlan = await BIDDING__PLAN_COLL.findById(planID)
                if (!infoPlan)
                    return resolve({
                        error: true,
                        message: 'Can not get info',
                        status: 400,
                    })

                if (checkObjectIDs(fieldID)) {
                    dataUpdate.field = fieldID
                }

                if (checkObjectIDs(bidderID)) {
                    dataUpdate.bidder = bidderID
                }

                if (checkObjectIDs(contractID)) {
                    dataUpdate.contract = contractID
                }

                if (!isNaN(type) && Number(type) > 0) {
                    dataUpdate.type = type
                }

                if (!isNaN(status) && Number(status) > 0) {
                    dataUpdate.status = status
                }

                if (
                    !isNaN(percentOfCompletedPackage) &&
                    Number(percentOfCompletedPackage) > 0
                ) {
                    dataUpdate.percentOfCompletedPackage =
                        percentOfCompletedPackage
                }

                if (!isNaN(form) && Number(form) > 0) {
                    dataUpdate.form = form
                }

                if (!isNaN(contractType) && Number(contractType) > 0) {
                    dataUpdate.contractType = contractType
                }

                if (!isNaN(duration) && Number(duration) > 0) {
                    dataUpdate.duration = duration
                }

                if (!isNaN(progress) && Number(progress) > 0) {
                    dataUpdate.progress = progress
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

                if (note) {
                    dataUpdate.note = note
                }

                if (startTime) {
                    dataUpdate.startTime = startTime
                }

                if (finishTime) {
                    dataUpdate.finishTime = finishTime
                }

                if (actualStartTime) {
                    dataUpdate.actualStartTime = actualStartTime
                }

                if (actualFinishTime) {
                    dataUpdate.actualFinishTime = actualFinishTime
                }

                if (closingTime) {
                    dataUpdate.closingTime = closingTime
                }

                if (!isNaN(packagePrice) && Number(packagePrice) > 0) {
                    dataUpdate.packagePrice = packagePrice
                }

                if (!isNaN(tenderPrice) && Number(tenderPrice) > 0) {
                    dataUpdate.tenderPrice = tenderPrice
                }

                if (!isNaN(vatTenderPrice) && Number(vatTenderPrice) > 0) {
                    dataUpdate.vatTenderPrice = vatTenderPrice
                }

                let infoAfterUpdate =
                    await BIDDING__PLAN_COLL.findByIdAndUpdate(
                        planID,
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

                /**
                 * CẬP NHẬT THÔNG TIN LẠI VỀ DỰ ÁN
                 */
                // Tính toán số lượng, giá trị
                let infoCal = await that.getAmountByObject({
                    userID,
                    projectID: infoPlan.project,
                })

                // Cập nhật vào thông tin dự án
                if (infoCal) {
                    let infoProject = await ctx.call(
                        `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
                        {
                            departmentID: `${infoPlan.project}`,
                            numberOfPackage: infoCal.data.numberOfPackage,
                            numberOfUnexecutedPackage:
                                infoCal.data.numberOfUnexecutedPackage,
                            numberOfExecutedPackage:
                                infoCal.data.numberOfExecutedPackage,
                            numberOfCompletedPackage:
                                infoCal.data.numberOfCompletedPackage,
                            amountOfUnexecutedPackage:
                                infoCal.data.amountOfUnexecutedPackage,
                            amountOfExecutedPackage:
                                infoCal.data.amountOfExecutedPackage,
                            amountOfCompletedPackage:
                                infoCal.data.amountOfCompletedPackage,
                            percentOfCompletedPackage:
                                infoCal.data.percentOfCompletedPackage,
                        }
                    )

                    // console.log(infoProject)
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
     * Name: Remove
     * Author: Hiepnh
     * Date: 30/4/2022
     */

    /**
     * Name: Get info
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    getInfo({ planID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(planID))
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

                let info = await BIDDING__PLAN_COLL.findById(planID)
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
     * Date: 30/4/2022
     */
    getList({
        clientID,
        projectID,
        parentID,
        bidderID,
        contractID,
        type,
        status,
        actualStartTime,
        actualFinishTime,
        closingTime,
        form,
        contractType,
        keyword,
        limit = 50,
        lastestID,
        select,
        populates = {},
        sortKey,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (limit > 50) {
                    limit = 50
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

                if (sortKey && typeof sortKey === 'string') {
                    if (!IsJsonString(sortKey))
                        return resolve({
                            error: true,
                            message: 'Request params sortKey invalid',
                            status: 400,
                        })

                    keys = JSON.parse(sortKey)
                }

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */
                if (checkObjectIDs(parentID)) {
                    conditionObj.parent = parentID
                } else {
                    if (checkObjectIDs(bidderID)) {
                        conditionObj.bidder = bidderID
                    }

                    if (checkObjectIDs(contractID)) {
                        conditionObj.contract = contractID
                    }

                    if (projectID && checkObjectIDs(projectID)) {
                        conditionObj.project = projectID
                    } else {
                        if (checkObjectIDs(clientID)) {
                            conditionObj.client = clientID
                        }
                    }
                }

                if (!isNaN(type) && Number(type) > 0) {
                    conditionObj.type = type
                }

                if (!isNaN(status) && Number(status) > 0) {
                    conditionObj.status = status
                }

                if (!isNaN(form) && Number(form) > 0) {
                    conditionObj.form = form
                }

                if (!isNaN(contractType) && Number(contractType) > 0) {
                    conditionObj.contractType = contractType
                }

                console.log(conditionObj)

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    let regExpSearch = RegExp(keyword, 'i')
                    conditionObj.name = regExpSearch
                }
                let conditionObjOrg = { ...conditionObj }

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await BIDDING__PLAN_COLL.findById(lastestID)
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

                let infoDataAfterGet = await BIDDING__PLAN_COLL.find(
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
                    await BIDDING__PLAN_COLL.count(conditionObjOrg)
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
     * Name: Gom nhóm theo đối tượng
     * Author: Hiepnh
     * Date: 30/04/2022
     */
    getAmountByObject({ userID, projectID }) {
        return new Promise(async (resolve) => {
            try {
                let numberOfPackage = 0,
                    numberOfUnexecutedPackage = 0,
                    numberOfExecutedPackage = 0,
                    numberOfCompletedPackage = 0,
                    amountOfUnexecutedPackage = 0,
                    amountOfExecutedPackage = 0,
                    amountOfCompletedPackage = 0,
                    totalFinishAmount = 0,
                    percentOfCompletedPackage = 0

                let conditionObj = {}

                if (projectID && checkObjectIDs(projectID)) {
                    conditionObj.project = ObjectID(projectID)
                }

                // Tính tổng theo phân loại
                let listData = await BIDDING__PLAN_COLL.aggregate([
                    {
                        $match: conditionObj,
                    },
                    {
                        $group: {
                            _id: { status: '$status' }, // Phân loại trạng thái
                            count: { $sum: 1 }, // Tính tổng số lượng
                            amount: { $sum: '$packagePrice' }, // Tổng giá trị các gói
                            totalFinishAmount: {
                                $sum: {
                                    $multiply: [
                                        '$percentOfCompletedPackage',
                                        '$packagePrice',
                                        0.01,
                                    ],
                                },
                            }, // Tổng giá trị hoàn thành
                        },
                    },
                    {
                        $sort: { '_id.status': 1 },
                    },
                ])
                if (listData && listData.length) {
                    for (const item of listData) {
                        if (Number(item._id.status) === 1) {
                            numberOfUnexecutedPackage = Number(item.count)
                            amountOfUnexecutedPackage = Number(item.amount)
                            totalFinishAmount =
                                Number(totalFinishAmount) +
                                Number(item.totalFinishAmount)
                        }

                        if (Number(item._id.status) === 2) {
                            numberOfExecutedPackage = Number(item.count)
                            amountOfExecutedPackage = Number(item.amount)
                            totalFinishAmount =
                                Number(totalFinishAmount) +
                                Number(item.totalFinishAmount)
                        }

                        if (Number(item._id.status) === 3) {
                            numberOfCompletedPackage = Number(item.count)
                            amountOfCompletedPackage = Number(item.amount)
                            totalFinishAmount =
                                Number(totalFinishAmount) +
                                Number(item.totalFinishAmount)
                        }
                    }

                    numberOfPackage =
                        Number(numberOfUnexecutedPackage) +
                        Number(numberOfExecutedPackage) +
                        Number(numberOfCompletedPackage)
                }

                if (
                    Number(
                        amountOfUnexecutedPackage +
                            amountOfExecutedPackage +
                            amountOfCompletedPackage
                    ) != 0
                ) {
                    percentOfCompletedPackage =
                        100 *
                        (Number(totalFinishAmount) /
                            Number(
                                amountOfUnexecutedPackage +
                                    amountOfExecutedPackage +
                                    amountOfCompletedPackage
                            ))
                }
                percentOfCompletedPackage = percentOfCompletedPackage.toFixed(2)
                // console.log({percentOfCompletedPackage})

                return resolve({
                    error: false,
                    data: {
                        numberOfPackage,
                        numberOfUnexecutedPackage,
                        numberOfExecutedPackage,
                        numberOfCompletedPackage,
                        amountOfUnexecutedPackage,
                        amountOfExecutedPackage,
                        amountOfCompletedPackage,
                        percentOfCompletedPackage,
                    },
                })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Báo cáo lựa chọn nhà thầu
     * Author: Depv
     * Date: 18/05/2022
     */
    contractorSelection({ userID, projectID }) {
        return new Promise(async (resolve) => {
            try {
                let conditionObj = {}

                if (!checkObjectIDs(projectID)) {
                    return resolve({
                        error: true,
                        message: 'projectID không hợp lệ',
                    })
                } else {
                    conditionObj.project = ObjectID(projectID)
                }

                let listData = await BIDDING__PLAN_COLL.aggregate([
                    {
                        $match: conditionObj,
                    },
                    {
                        $group: {
                            _id: { status: '$status' }, // Phân loại trạng thái
                            amount: { $sum: 1 }, // số lượng gói thầu
                            amountPackagePrice: { $sum: '$packagePrice' }, // Tổng giá trị các gói
                        },
                    },
                    {
                        $sort: { '_id.status': 1 },
                    },
                ])

                return resolve({ error: false, data: listData })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }
}

exports.MODEL = new Model()
