'use strict'
const BaseModel = require('../../../tools/db/base_model')
const {
    checkObjectIDs,
    IsJsonString,
    validateParamsObjectID,
} = require('../../../tools/utils/utils')
const stringUtils = require('../../../tools/utils/string_utils')
const { KEY_ERROR } = require('../../../tools/keys')
const ObjectID = require('mongoose').Types.ObjectId
const moment = require('moment')
const { addDate, calculateExpire } = require('../../../tools/utils/time_utils')

const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

/**s
 * import inter-coll, exter-coll
 */
const USER_COLL = require('../../auth/database/auth.user-coll')
const ITEM__DOCTYPE_COLL = require('../../item/database/item.doctype-coll')
const ITEM__CONTACT_COLL = require('../../item/database/item.contact-coll')
const FNB_ORDER_COLL = require('../database/fnb.order-coll')
const FNB_AFFILIATE_SIGNUP_COLL = require('../database/fnb.affiliate_signup-coll')

/**
 * import inter-model, exter-model
 */
const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const { uploadFileS3 } = require('../../../tools/s3')

class Model extends BaseModel {
    constructor() {
        super(FNB_AFFILIATE_SIGNUP_COLL)
    }

    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 12/2/2024
     */
    insert({
        userID,
        companyID,
        customerID,
        orderID,
        name,
        note,
        date,
        status,
        files,
    }) {
        // console.log({ userID, companyID, customerID, orderID, name, note, date, status, files })
        return new Promise(async (resolve) => {
            try {
                if (
                    !name ||
                    name == '' ||
                    !checkObjectIDs(customerID) ||
                    !checkObjectIDs(userID)
                )
                    return resolve({
                        error: true,
                        message: 'name|customerID|userID invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let dataInsert = {
                    userCreate: userID,
                    customer: customerID,
                    company: companyID,
                    name,
                }

                let infoOrder
                if (orderID && checkObjectIDs(orderID)) {
                    infoOrder = await FNB_ORDER_COLL.findById(orderID)
                    if (!infoOrder)
                        return resolve({
                            error: true,
                            message: 'Đơn hàng không tồn tại',
                            keyError: KEY_ERROR.ITEM_EXISTED,
                        })

                    dataInsert.order = orderID
                    dataInsert.company = infoOrder.company
                    dataInsert.funda = infoOrder.funda
                    dataInsert.business = infoOrder.business
                    dataInsert.channel = infoOrder.channel
                    dataInsert.customer = infoOrder.customer
                }

                if (date && date != '') {
                    dataInsert.date = date
                }

                if (!isNaN(status)) {
                    dataInsert.status = Number(status)
                }

                if (note && note != '') {
                    dataInsert.note = note
                }

                if (checkObjectIDs(files)) {
                    dataInsert.images = files
                }

                // Namecv
                let convertStr = ''
                if (name && name != '') {
                    convertStr = stringUtils.removeAccents(name)
                }
                if (note && note != '') {
                    convertStr =
                        convertStr + ' ' + stringUtils.removeAccents(note)
                }
                dataInsert.namecv = convertStr

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                    })

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Update
     * Author: HiepNH
     * Code: 12/2/2024
     */
    update({
        userID,
        customerCareID,
        customerID,
        orderID,
        name,
        note,
        date,
        status,
        imagesID,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(customerCareID))
                    return resolve({
                        error: true,
                        message: 'customerCareID invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let dataUpdate = {
                    userUpdate: userID,
                    modifyAt: new Date(),
                }

                if (checkObjectIDs(customerID)) {
                    dataUpdate.customer = customerID
                }

                let infoOrder
                if (orderID && checkObjectIDs(orderID)) {
                    infoOrder = await FNB_ORDER_COLL.findById(orderID)
                    if (!infoOrder)
                        return resolve({
                            error: true,
                            message: 'Đơn hàng không tồn tại',
                            keyError: KEY_ERROR.ITEM_EXISTED,
                        })

                    dataUpdate.order = orderID
                    dataUpdate.company = infoOrder.company
                    dataUpdate.funda = infoOrder.funda
                    dataUpdate.business = infoOrder.business
                    dataUpdate.channel = infoOrder.channel
                    dataUpdate.customer = infoOrder.customer
                }

                if (name && name != '') {
                    dataUpdate.name = name
                }

                if (date && date != '') {
                    dataUpdate.date = date
                }

                if (!isNaN(status)) {
                    dataUpdate.status = Number(status)
                }

                if (note && note != '') {
                    dataUpdate.note = note
                }

                if (imagesID && imagesID.length) {
                    dataUpdate.$addToSet = {
                        images: imagesID,
                    }
                }

                // Namecv
                let convertStr = ''
                if (name && name != '') {
                    convertStr = stringUtils.removeAccents(name)
                }
                if (note && note != '') {
                    convertStr =
                        convertStr + ' ' + stringUtils.removeAccents(note)
                }
                dataUpdate.namecv = convertStr

                const infoAfterUpdate =
                    await FNB_AFFILIATE_SIGNUP_COLL.findByIdAndUpdate(
                        customerCareID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: KEY_ERROR.UPDATE_FAILED,
                    })

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Get info
     * Author: HiepNH
     * Code: 24/11/2022
     */
    getInfo({ customerCareID, select, populates = {} }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(customerCareID))
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

                let infoPlanGroup = await FNB_AFFILIATE_SIGNUP_COLL.findById(
                    customerCareID
                )
                    .select(select)
                    .populate(populates)

                if (!infoPlanGroup)
                    return resolve({
                        error: true,
                        message: 'cannot_get',
                        keyError: KEY_ERROR.GET_INFO_FAILED,
                    })

                return resolve({ error: false, data: infoPlanGroup })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Get list
     * Author: HiepNH
     * Code: 24/11/2022
     */
    getList({
        companyID,
        userID,
        fundasID,
        customerID,
        userCreateID,
        channelID,
        businessID,
        fromDate,
        toDate,
        status,
        keyword,
        limit = 20,
        lastestID,
        select,
        populates,
    }) {
        // console.log({ companyID, userID, fundasID, customerID, userCreateID, channelID, businessID, fromDate, toDate, status, keyword, limit, lastestID, select, populates })
        return new Promise(async (resolve) => {
            try {
                if (Number(limit) > 20) {
                    limit = 20
                } else {
                    limit = +Number(limit)
                }

                let conditionObj = { company: companyID }
                let sortBy
                let keys = ['createAt__-1', '_id__-1']

                // Gom nhóm theo đơn vị cơ sở
                if (fundasID && fundasID.length) {
                    const validation = validateParamsObjectID({
                        fundasID: { value: fundasID, isRequire: false },
                    })
                    if (validation.error) return resolve(validation)

                    let arrFun = fundasID.map((item) => ObjectID(item))
                    conditionObj.funda = { $in: arrFun }
                }

                if (customerID && checkObjectIDs(customerID)) {
                    conditionObj.customer = ObjectID(customerID)
                }

                if (userCreateID && checkObjectIDs(userCreateID)) {
                    conditionObj.userCreate = ObjectID(userCreateID)
                }

                if (!isNaN(status) && [1, 2].includes(Number(status))) {
                    conditionObj.status = Number(status)
                } else {
                    conditionObj.status = { $in: [1, 2] }
                }

                if (channelID && checkObjectIDs(channelID)) {
                    conditionObj.channel = ObjectID(channelID)
                }

                if (businessID && checkObjectIDs(businessID)) {
                    conditionObj.business = ObjectID(businessID)
                }

                if (fromDate && toDate) {
                    conditionObj.date = {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate),
                    }
                }
                // console.log(conditionObj)

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
                    keyword = stringUtils.removeAccents(keyword)
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    const regSearch = new RegExp(keyword, 'i')

                    conditionObj.namecv = regSearch
                }
                // console.log(conditionObj)

                if (select && typeof select === 'string') {
                    if (!IsJsonString(select))
                        return resolve({
                            error: true,
                            message: 'Request params select invalid',
                            status: 400,
                        })

                    select = JSON.parse(select)
                }
                let conditionObjOrg = { ...conditionObj }

                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await FNB_AFFILIATE_SIGNUP_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info last message",
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

                let infoDataAfterGet = await FNB_AFFILIATE_SIGNUP_COLL.find(
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
                        nextCursor = infoDataAfterGet[limit - 1]?._id
                        infoDataAfterGet.length = limit
                    }
                }
                let totalRecord =
                    await FNB_AFFILIATE_SIGNUP_COLL.count(conditionObjOrg)
                let totalPage = Math.ceil(totalRecord / limit)

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit: limit,
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
     * Name: Danh sách theo phân loại
     * Author: HiepNH
     * Code: 15/2/2024
     */
    getListByProperty({
        option,
        optionGroup,
        companyID,
        optionTime,
        fundasID,
        year,
        month,
        fromDate,
        toDate,
        status,
        userID,
    }) {
        // console.log({ option, optionGroup, companyID, optionTime, fundasID, year, month, fromDate, toDate, status, userID })
        return new Promise(async (resolve) => {
            try {
                let yearFilter
                let currentYear = new Date().getFullYear()
                if (year && !isNaN(year)) {
                    yearFilter = Number(year)
                } else {
                    yearFilter = Number(currentYear)
                }

                if (!option) {
                    // Danh sách
                } else {
                    let conditionObj = {
                        company: ObjectID(companyID),
                    }
                    let conditionGroup = {}
                    let conditionObjYear = {},
                        conditionPopulate = {},
                        sortBy = { quantity: -1 }
                    let amount1 = 0,
                        amount2 = 0,
                        amount3 = 0

                    const validation = validateParamsObjectID({
                        fundasID: { value: fundasID, isRequire: false },
                    })
                    if (validation.error) return resolve(validation)

                    // Gom nhóm theo đơn vị cơ sở
                    if (fundasID && fundasID.length) {
                        let arrFun = fundasID.map((item) => ObjectID(item))
                        conditionObj.funda = { $in: arrFun }
                    }

                    // Phân loại theo thời khoảng
                    if (fromDate && toDate) {
                        conditionObj.createAt = {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate),
                        }
                    }

                    // Gom nhóm theo thời gian
                    else if (option && Number(option) == 1) {
                        // Theo năm
                        if (optionTime && Number(optionTime) == 1) {
                            conditionGroup = {
                                _id: { year: '$year' },
                                quantity: { $sum: 1 },
                            }
                        }

                        // Theo tháng trong năm
                        if (optionTime && Number(optionTime) == 2) {
                            conditionObjYear = {
                                year: Number(yearFilter),
                            }

                            conditionGroup = {
                                _id: { month: '$month', year: '$year' },
                                quantity: { $sum: 1 },
                            }
                        }

                        // Theo giờ trong ngày
                        if (optionTime && Number(optionTime) == 3) {
                            conditionGroup = {
                                _id: { hour: '$hour' },
                                quantity: { $sum: 1 },
                            }
                        }
                    }

                    // Gom nhóm theo Đơn vị cơ sở
                    else if (option && Number(option) == 2) {
                        conditionObj.funda = { $exists: true, $ne: null }
                        conditionGroup = {
                            _id: { funda: '$funda' },
                            quantity: { $sum: 1 },
                        }

                        conditionPopulate = {
                            path: '_id.funda',
                            select: '_id name sign image',
                            model: 'funda',
                        }
                    }

                    // Gom nhóm theo Lĩnh vực kinh doanh
                    else if (option && Number(option) == 2) {
                        conditionObj.business = { $exists: true, $ne: null }
                        conditionGroup = {
                            _id: { business: '$business' },
                            quantity: { $sum: 1 },
                        }

                        conditionPopulate = {
                            path: '_id.business',
                            select: '_id name sign image',
                            model: 'doctype',
                        }
                    }

                    // Gom nhóm theo Kênh bán hàng
                    else if (option && Number(option) == 3) {
                        conditionObj.channel = { $exists: true, $ne: null }
                        conditionGroup = {
                            _id: { channel: '$channel' },
                            quantity: { $sum: 1 },
                        }

                        conditionPopulate = {
                            path: '_id.channel',
                            select: '_id name sign image',
                            model: 'doctype',
                        }
                    }

                    // Gom nhóm theo Khách hàng
                    else if (option && Number(option) == 4) {
                        conditionObj.customer = { $exists: true, $ne: null }
                        conditionGroup = {
                            _id: { customer: '$customer' },
                            quantity: { $sum: 1 },
                        }

                        conditionPopulate = {
                            path: '_id.customer',
                            select: '_id name sign image',
                            model: 'doctype',
                        }
                    }

                    // Gom nhóm theo Người thực hiện
                    else if (option && Number(option) == 4) {
                        conditionObj.assignee = { $exists: true, $ne: null }

                        conditionGroup = {
                            _id: { assignee: '$assignee' },
                            quantity: { $sum: 1 },
                        }

                        conditionPopulate = {
                            path: '_id.assignee',
                            select: '_id fullname image email phone',
                            model: 'user',
                        }
                    }

                    // Phân loại theo cấp độ
                    else if (option && Number(option) == 5) {
                    } else if (option && Number(option) == 10) {

                    /**
                     * Gom nhóm theo user: OK
                     */
                        if (!optionGroup) {
                            conditionGroup = {
                                _id: { user: '$userCreate' },
                            }
                        } else if (optionGroup == 1) {
                            conditionGroup = {
                                _id: { user: '$manager' },
                            }
                        }
                    }

                    // console.log(conditionObj)
                    // console.log(conditionPopulate)
                    // console.log(conditionObjYear)
                    // console.log(conditionGroup)

                    let listData

                    if (option != 5) {
                        listData = await FNB_AFFILIATE_SIGNUP_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$date' },
                                    month: { $month: '$date' },
                                    hour: { $hour: '$date' },
                                    funda: 1,
                                    business: 1,
                                    channel: 1,
                                    customer: 1,
                                    assignee: 1,
                                    area3: 1,
                                    seasons: 1,
                                    userCreate: 1,
                                    manager: 1,
                                },
                            },
                            {
                                $match: conditionObjYear,
                            },
                            {
                                $group: conditionGroup,
                            },
                            {
                                $sort: sortBy,
                            },
                        ])

                        if (
                            !isNaN(option) &&
                            [2, 3, 4].includes(Number(option))
                        ) {
                            await FNB_AFFILIATE_SIGNUP_COLL.populate(
                                listData,
                                conditionPopulate
                            )
                        }

                        if (option == 10) {
                            let listUser = await USER_COLL.find({
                                _id: {
                                    $in: listData.map((item) => item._id.user),
                                },
                            }).select('fullname')
                            return resolve({ error: false, data: listUser })
                        }

                        return resolve({ error: false, data: listData })
                    } else {
                    }
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
     * Dev: HiepNH
     * Func: Tải dữ liệu
     * Date: 15/2/2023
     */
    exportExcel({ companyID, userID, fundaID, fromDate, toDate, month, year }) {
        // console.log({ companyID, userID, fundaID, fromDate, toDate, month, year })
        return new Promise(async (resolve) => {
            try {
                let yearFilter
                let currentYear = new Date().getFullYear()
                let currentMonth = new Date().getMonth() + 1

                if (fromDate && toDate) {
                    currentMonth = new Date(toDate).getMonth() + 1
                    currentYear = new Date(toDate).getFullYear()
                }

                if (year && !isNaN(year)) {
                    yearFilter = Number(year)
                } else {
                    yearFilter = Number(currentYear)
                }

                let conditionObjYear = {
                    year: Number(yearFilter),
                }

                // let listData = await FNB_AFFILIATE_SIGNUP_COLL.aggregate([
                //     {
                //         $match: {
                //             company: ObjectID(companyID),
                //             journey: {$exists: true, $ne: null},
                //         }
                //     },
                //     {
                //         $project :  {
                //             year : {$year : "$createAt"},
                //             month : {$month : "$createAt"},
                //             createAt: 1,
                //             userCreate: 1,
                //             company : 1,
                //             funda : 1,
                //             journey : 1,
                //             customer: 1,
                //             mistake: 1,
                //             manager: 1
                //         }
                //     },
                //     {
                //         $match: conditionObjYear
                //     },
                //     {
                //         $group: {
                //             _id: { userCreate: "$userCreate", journey: "$journey" },
                //             quantity: { $sum: 1 }
                //         }
                //     },
                // ])
                // await FNB_AFFILIATE_SIGNUP_COLL.populate(listData, conditionPopulate)
                // console.log(listData)

                // let listUser = await USER_COLL.find({_id: {$in: listData.map(item => item._id.userCreate)}}).select('fullname')
                // let listJourney = await ITEM__DOCTYPE_COLL.find({company: ObjectID(companyID), type: 11}).select('name')

                let listData = await ITEM__CONTACT_COLL.find({
                    company: companyID,
                    parent: { $exists: true, $ne: null },
                })
                    .populate({
                        path: 'dataSource parent',
                        select: 'level name sign phone',
                    })
                    .limit(10000)

                let listData2 = await ITEM__CONTACT_COLL.aggregate([
                    {
                        $match: {
                            company: ObjectID(companyID),
                            dataSource: { $exists: true, $ne: null },
                            // childs: { $exists: true, $type: 'array', $ne: [] },
                        },
                    },
                    {
                        $project: {
                            year: { $year: '$joinedDate' },
                            month: { $month: '$joinedDate' },
                            joinedDate: 1,
                            dataSource: 1,
                            level: 1,
                        },
                    },
                    {
                        $match: conditionObjYear,
                    },
                    // {
                    //     $group: {
                    //         _id: { dataSource: "$dataSource", level: "$level" },
                    //         quantity: { $sum: 1 }
                    //     }
                    // },
                    {
                        $group: {
                            _id: { dataSource: '$dataSource', month: '$month' },
                            quantity: { $sum: 1 },
                        },
                    },
                ])
                // console.log(listData2)
                let listAff = await ITEM__CONTACT_COLL.find({
                    _id: { $in: listData2.map((item) => item._id.dataSource) },
                }).select('name phone email')
                // console.log(listAff)

                // Modify the workbook.
                XlsxPopulate.fromFileAsync(
                    path.resolve(
                        __dirname,
                        '../../../files/templates/excels/crm_export_affiliate.xlsx'
                    )
                ).then(async (workbook) => {
                    workbook
                        .sheet('Report')
                        .row(1)
                        .cell(1)
                        .value(`BÁO CÁO TỔNG HỢP ${yearFilter}`)

                    var i = 4
                    listData?.forEach((item, index) => {
                        workbook
                            .sheet('Data')
                            .row(i)
                            .cell(1)
                            .value(Number(index + 1))
                        workbook.sheet('Data').row(i).cell(2).value(item?.name)
                        workbook.sheet('Data').row(i).cell(3).value(item?.level)
                        workbook.sheet('Data').row(i).cell(4).value(item?.phone)
                        workbook.sheet('Data').row(i).cell(5).value(item?.email)
                        workbook.sheet('Data').row(i).cell(6).value(item?.taxid)
                        workbook
                            .sheet('Data')
                            .row(i)
                            .cell(7)
                            .value(item?.joinedDate)
                        workbook
                            .sheet('Data')
                            .row(i)
                            .cell(8)
                            .value(
                                `${item?.parent?.name}-${item?.parent?.phone}`
                            )
                        workbook
                            .sheet('Data')
                            .row(i)
                            .cell(9)
                            .value(item?.parent?.level)
                        workbook.sheet('Data').row(i).cell(10).value(item?.note)

                        i++
                    })

                    var i = 4
                    listAff?.forEach((user, uid) => {
                        workbook
                            .sheet('Report')
                            .row(i)
                            .cell(1)
                            .value(Number(uid + 1))
                        workbook.sheet('Report').row(i).cell(2).value(user.name)
                        workbook
                            .sheet('Report')
                            .row(i)
                            .cell(3)
                            .value(`${user._id}`)

                        i++
                    })

                    listData2?.forEach((item, index) => {
                        for (var i = 4; i <= listAff.length + 3; i++) {
                            let userID = workbook
                                .sheet('Report')
                                .row(i)
                                .cell(3)
                                .value()

                            for (var j = 1; j <= 12; j++) {
                                if (
                                    item._id.month == j &&
                                    userID.toString() ===
                                        item._id.dataSource.toString()
                                ) {
                                    workbook
                                        .sheet('Report')
                                        .row(i)
                                        .cell(j + 3)
                                        .value(item.quantity)
                                }
                            }
                        }
                    })

                    const now = new Date()
                    const filePath = '../../../files/temporary_uploads/'
                    const fileName = `crm_affiliate_report_${now.getTime()}.xlsx`
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
}

exports.MODEL = new Model()
