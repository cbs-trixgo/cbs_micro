'use strict'

const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const _isValid = require('mongoose').Types.ObjectId
const ObjectID = require('mongoose').Types.ObjectId

/**
 * TOOLS
 */
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

/**
 * DOMAIN AND ACTIONS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
    CF_ACTIONS_ANALYSIS,
} = require('../../analysis/helper/analysis.actions-constant')

/**
 * COLLECTIONS
 */
const USER_COLL = require('../../auth/database/auth.user-coll')
const TIMESHEET__EXPERT_TIMESHEET_COLL = require('../database/timesheet.expert_timesheet-coll')
const BUDGET__WORK_COLL = require('../../budget/database/budget.work-coll')

const AUTH__APP_USER = require('../../auth/model/auth.app_users').MODEL

let dataTF = {
    appID: '61e049cffdebf77b072d1b14', // TIMESHEET
    menuID: '623f1ecae998e94feda0cd70', //
    type: 1,
    action: 1,
}

class Model extends BaseModel {
    constructor() {
        super(TIMESHEET__EXPERT_TIMESHEET_COLL)
    }

    /**
     * Name: Insert expert timesheet
     * Author: Depv
     * Code:
     */
    insert({
        userCreate,
        companyID,
        parentID,
        name,
        date,
        type,
        note,
        hours,
        unitprice,
        projectID,
        assigneeID,
        shiftID,
        fundaID,
    }) {
        // console.log({ userCreate, companyID, parentID, name, date, type, note, hours, unitprice, projectID, assigneeID, shiftID, fundaID })
        return new Promise(async (resolve) => {
            try {
                if (!name) {
                    return resolve({
                        error: true,
                        message: 'Name invalid',
                        keyError: 'name_invalid',
                    })
                }

                //__________Khai báo và validate dữ liệu
                let dataInsert = {
                    userCreate,
                    name,
                    admins: [userCreate],
                    members: [userCreate],
                }

                if (companyID) {
                    dataInsert.company = companyID
                }

                if (checkObjectIDs(parentID)) {
                    let infoParent =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.findById(
                            parentID
                        ).populate({
                            path: 'assignee',
                            select: '_id department position',
                        })

                    dataInsert.company = infoParent.company
                    dataInsert.parent = parentID
                    dataInsert.assignee = infoParent.assignee
                    dataInsert.type = infoParent.type

                    if (infoParent.assignee) {
                        dataInsert.project = infoParent.assignee.department
                        dataInsert.position = infoParent.assignee.position
                    }
                }

                if (assigneeID) {
                    dataInsert.assignee = assigneeID
                    let infoAssignee = await USER_COLL.findById(
                        assigneeID
                    ).select('department position')
                    if (infoAssignee) {
                        dataInsert.project = infoAssignee.department
                        dataInsert.position = infoAssignee.position
                    }
                }

                if (checkObjectIDs(projectID)) {
                    dataInsert.project = projectID
                }

                if (checkObjectIDs(fundaID)) {
                    dataInsert.funda = fundaID
                }

                if (checkObjectIDs(shiftID)) {
                    dataInsert.shift = shiftID
                }

                if (date) {
                    dataInsert.date = date
                }

                if (type) {
                    dataInsert.type = type
                }

                if (note) {
                    dataInsert.note = note
                }

                if (hours) {
                    dataInsert.hours = hours
                }

                let unitprice2 = 0
                if (unitprice) {
                    unitprice2 = Number(unitprice)
                }
                if (unitprice2 != 0) {
                    let amount = hours * unitprice2

                    dataInsert.unitprice = unitprice2
                    dataInsert.amount = amount
                }
                // console.log(dataInsert)

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({ error: true, message: 'cannot_insert' })

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Update expert timesheet
     * Author: Depv
     * Code:
     */
    update({
        expertTimesheetID,
        projectID,
        name,
        type,
        assigneeID,
        hours,
        unitprice,
        status,
        approver,
        note,
        date,
        admins,
        members,
        userID,
        workID,
        subtype,
    }) {
        // console.log({ expertTimesheetID, projectID, name, type, assigneeID, hours, unitprice, status, approver, note, date, admins, members, userID, workID, subtype })
        return new Promise(async (resolve) => {
            const that = this
            try {
                let infoTimeSheetID =
                    await TIMESHEET__EXPERT_TIMESHEET_COLL.findById(
                        expertTimesheetID
                    )
                if (!infoTimeSheetID) {
                    return resolve({
                        error: true,
                        message: 'Timesheet không tồn tại',
                        keyError: 'timesheet_not_exists',
                        status: 400,
                    })
                }

                let dataUpdate = {
                    userUpdate: userID,
                    modifyAt: Date.now(),
                }

                if (projectID) {
                    dataUpdate.project = projectID
                }

                if (checkObjectIDs(assigneeID)) {
                    dataUpdate.assignee = assigneeID

                    let infoAssignee = await USER_COLL.findById(
                        assigneeID
                    ).select('department position')
                    if (infoAssignee) {
                        dataUpdate.project = infoAssignee.department
                        dataUpdate.position = infoAssignee.position
                    }
                }

                if (name) {
                    dataUpdate.name = name
                }

                if (date) {
                    dataUpdate.date = date
                }

                if (infoTimeSheetID.parent) {
                    if (hours) {
                        dataUpdate.hours = hours
                    }

                    let unitprice2 = Number(unitprice)
                    if (checkObjectIDs(workID)) {
                        dataUpdate.work = workID

                        let infoWork =
                            await BUDGET__WORK_COLL.findById(workID).select(
                                'unitPrice'
                            )
                        if (infoWork) {
                            unitprice2 = Number(infoWork.unitPrice)
                        }
                    }

                    let amount = hours * unitprice2
                    dataUpdate.unitprice = unitprice2
                    dataUpdate.amount = amount
                }

                if (status) {
                    dataUpdate.status = status
                }

                if (
                    subtype &&
                    Number(subtype) != Number(infoTimeSheetID.subtype)
                ) {
                    dataUpdate.subtype = subtype

                    // Ngày nghỉ phép, lễ/tết
                    if ([2, 3, 4].includes(Number(subtype))) {
                        let newAssigneeID
                        if (assigneeID) {
                            newAssigneeID = assigneeID
                        } else {
                            newAssigneeID = infoTimeSheetID.assignee
                        }
                        // console.log(newAssigneeID)

                        let infoUser = await USER_COLL.findById(newAssigneeID)
                            .select('contacts')
                            .populate({
                                path: 'contacts',
                                select: 'company sallaryBasic insuranceFee union share',
                            })
                        // console.log(infoUser)

                        let unitprice2New = 0
                        if (infoUser.contacts && infoUser.contacts.length) {
                            for (const contact of infoUser.contacts) {
                                if (
                                    contact.company.toString() ===
                                        infoTimeSheetID.company.toString() &&
                                    contact.sallaryBasic
                                ) {
                                    // Tính toán cho 1 năm 365 ngày - 52 ngày nghỉ (tuần nghỉ 1 ngày)*8h. Tổng lương cơ bản * 12 tháng
                                    unitprice2New =
                                        Number(unitprice2New) +
                                        Number(
                                            (contact.sallaryBasic * 12) /
                                                (8 * (365 - 52))
                                        )
                                }
                            }
                        }
                        // console.log(unitprice2New)

                        let amount = hours * Number(unitprice2New).toFixed(0)
                        dataUpdate.unitprice = Number(unitprice2New).toFixed(0)
                        dataUpdate.amount = amount
                    }
                }

                if (approver) {
                    dataUpdate.approver = approver
                    dataUpdate.timeApprover = Date.now()
                }

                if (note) {
                    dataUpdate.note = note
                }

                let adminsID = [
                    ...infoTimeSheetID.admins?.map((item) => item?.toString()),
                ]
                if (adminsID.includes(userID.toString())) {
                    if (admins) {
                        if (admins.length && checkObjectIDs(admins)) {
                            admins = [...new Set(admins)]
                            dataUpdate.admins = admins
                        } else {
                            dataUpdate.admins = []
                        }
                    }

                    if (members) {
                        if (members.length && checkObjectIDs(members)) {
                            members = [...new Set(members)]
                            dataUpdate.members = members
                        } else {
                            dataUpdate.members = []
                        }
                    }
                } else {
                    if (checkObjectIDs(admins)) {
                        return resolve({
                            error: true,
                            message: 'Bạn không có quyền chia sẻ',
                            keyError: 'permission_denined',
                            status: 403,
                        })
                    }

                    if (checkObjectIDs(members)) {
                        return resolve({
                            error: true,
                            message: 'Bạn không có quyền chia sẻ',
                            keyError: 'permission_denined',
                            status: 403,
                        })
                    }
                }
                // console.log(dataUpdate)

                let infoAfterUpdate =
                    await TIMESHEET__EXPERT_TIMESHEET_COLL.findByIdAndUpdate(
                        expertTimesheetID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate) {
                    return resolve({
                        error: true,
                        message: 'Cannot update',
                        keyError: 'cannot_update',
                    })
                }

                // Cập nhật cho mẩu tin cha
                if (infoAfterUpdate.parent) {
                    await that.updateValue({
                        parentID: infoAfterUpdate.parent,
                        userID,
                    })
                }

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    // Cập nhật giá trị cho mẩu tin cha
    updateValue({ parentID, userID }) {
        // console.log({ parentID, userID })
        return new Promise(async (resolve) => {
            try {
                let listData = await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate(
                    [
                        {
                            $match: {
                                parent: ObjectID(parentID),
                            },
                        },
                        {
                            $group: {
                                _id: {},
                                hours: { $sum: '$hours' },
                                amount: { $sum: '$amount' },
                            },
                        },
                    ]
                )
                // console.log(listData)

                let dataUpdate = {
                    userUpdate: userID,
                    modifyAt: Date.now(),
                    hours: listData[0].hours,
                    amount: listData[0].amount,
                    unitprice:
                        listData[0].hours != 0
                            ? Number(listData[0].amount / listData[0].hours)
                            : 0,
                }
                // console.log(dataUpdate)

                let infoAfterUpdate =
                    await TIMESHEET__EXPERT_TIMESHEET_COLL.findByIdAndUpdate(
                        parentID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate) {
                    return resolve({
                        error: true,
                        message: 'Cannot update',
                        keyError: 'cannot_update',
                    })
                }

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: get info expert timesheet
     * Author: Depv
     * Code:
     */
    getInfo({ expertTimesheetID, userID, select, populates, ctx }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(expertTimesheetID))
                    return resolve({
                        error: true,
                        message: 'Request params expertTimesheetID invalid',
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

                let infoAterGet =
                    await TIMESHEET__EXPERT_TIMESHEET_COLL.findById(
                        expertTimesheetID
                    )
                        .select(select)
                        .populate(populates)

                if (!infoAterGet)
                    return resolve({
                        error: true,
                        message: "can't_get_info",
                        status: 403,
                    })

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

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
     * Name  : Danh sách expert timesheet
     * Author: HiepNH
     */
    getList({
        sortOption,
        parentID,
        workID,
        userID,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates = {},
        option,
        month,
        year,
        assigneeID,
        humanID,
        companyID,
        type,
        subtype,
        ctx,
    }) {
        // console.log({sortOption, parentID, workID, userID, keyword, limit, lastestID, select, populates, option, month, year, assigneeID, humanID, companyID, type})
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                if (Number(limit) > 50) {
                    limit = 50
                } else {
                    limit = +Number(limit)
                }

                let conditionObj = {}
                let nextCursor = null
                let sortBy = null
                let keys = ['date__1', '_id__1']

                if (sortOption == 1) {
                    keys = ['date__-1', '_id__-1']
                }

                if (sortOption == 2) {
                    keys = ['createAt__-1', '_id__-1']
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

                if (checkObjectIDs(parentID)) {
                    conditionObj.parent = parentID

                    if (humanID && checkObjectIDs(humanID)) {
                        conditionObj.assignee = humanID
                    }
                    // if(assigneeID && checkObjectIDs(assigneeID)){
                    //     conditionObj.assignee = assigneeID;
                    // }
                } else {
                    // Danh sách bảng chấm công
                    if (!option) {
                        let getInfoUserApp =
                            await AUTH__APP_USER.checkPermissionsAccessApp({
                                appID: '61e049cffdebf77b072d1b14',
                                userID,
                            })

                        // Nếu là Admin ứng dụng
                        if (
                            !getInfoUserApp.error &&
                            Number(getInfoUserApp.data.level) == 0
                        ) {
                            conditionObj.company = companyID
                            conditionObj.parent = { $exists: false }
                        }

                        // Được phân quyền
                        else {
                            conditionObj.$or = [
                                { admins: { $in: [userID] } },
                                { members: { $in: [userID] } },
                            ]
                            conditionObj.company = companyID
                            conditionObj.parent = { $exists: false }
                        }
                    }

                    // Chi tiết chấm công của userID
                    else if (option == 1) {
                        conditionObj.parent = { $exists: true, $ne: null }
                        conditionObj.assignee = assigneeID
                        if (month & year) {
                            conditionObj.$where = `return this.date.getMonth() === ${Number(month - 1)} && this.date.getFullYear() === ${Number(year)}`
                        }
                    }

                    // Chi tiết chấm công của Công ty
                    else if (option == 2) {
                        conditionObj.parent = { $exists: true, $ne: null }
                        conditionObj.assignee = userID
                        if (month & year) {
                            conditionObj.$where = `return this.date.getMonth() === ${Number(month - 1)} && this.date.getFullYear() === ${Number(year)}`
                        }
                    }

                    // Chi tiết chấm công theo workID
                    else if (option == 3) {
                        conditionObj.work = workID
                    }
                }

                // Chi tiết chấm công của user đang truy cập
                if (type && type == 2) {
                    conditionObj.parent = { $exists: true, $ne: null }
                    conditionObj.assignee = userID

                    delete conditionObj.$or
                }

                // Chi tiết chấm công của 1 nhân sự
                if (type && type == 3) {
                    conditionObj.parent = { $exists: true, $ne: null }
                    conditionObj.assignee = humanID

                    delete conditionObj.$or
                }

                if (subtype) {
                    conditionObj.subtype = Number(subtype)
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    conditionObj.name = new RegExp(keyword, 'i')
                }
                // console.log(conditionObj)

                let conditionObjOrg = { ...conditionObj }

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.findById(
                            lastestID
                        )
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

                let infoDataAfterGet =
                    await TIMESHEET__EXPERT_TIMESHEET_COLL.find(conditionObj)
                        .select(select)
                        .limit(+limit + 1)
                        .sort(sortBy)
                        .populate(populates)
                        .lean()

                if (!infoDataAfterGet)
                    return resolve({
                        error: true,
                        message: "Can't get data",
                        status: 403,
                    })

                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id
                        infoDataAfterGet.length = limit
                    }
                }

                let totalRecord =
                    await TIMESHEET__EXPERT_TIMESHEET_COLL.count(
                        conditionObjOrg
                    )
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
    getListByProperty({
        userID,
        option,
        year,
        month,
        companyID,
        assigneeID,
        projectID,
        ctx,
    }) {
        // console.log({ userID, option, year, companyID })
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                let yearFilter
                let currentYear = new Date().getFullYear()
                if (year && !isNaN(year)) {
                    yearFilter = Number(year)
                } else {
                    yearFilter = Number(currentYear)
                }

                // Tổng hợp chấm công của công ty theo tháng
                if (!option) {
                    let conditionObj = {
                        company: ObjectID(companyID),
                        parent: { $exists: true, $ne: null },
                    }

                    let listData =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$date' },
                                    month: { $month: '$date' },
                                    hours: 1,
                                    amount: 1,
                                },
                            },
                            {
                                $match: {
                                    year: Number(yearFilter),
                                },
                            },
                            {
                                $group: {
                                    _id: { month: '$month' },
                                    quantity: { $sum: '$hours' },
                                    amount: { $sum: '$amount' },
                                },
                            },
                        ])

                    return resolve({ error: false, data: listData })
                }

                // Bảng chấm công của assigneeID theo tháng
                else if (option == 1) {
                    let conditionObj = {
                        assignee: ObjectID(assigneeID),
                        parent: { $exists: true, $ne: null },
                    }

                    let listData =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$date' },
                                    month: { $month: '$date' },
                                    hours: 1,
                                    amount: 1,
                                },
                            },
                            {
                                $match: {
                                    year: Number(yearFilter),
                                },
                            },
                            {
                                $group: {
                                    _id: { month: '$month' },
                                    quantity: { $sum: '$hours' },
                                    amount: { $sum: '$amount' },
                                },
                            },
                        ])
                    // console.log(listData)

                    return resolve({ error: false, data: listData })
                }

                // Báo cáo chấm công theo ngày
                else if (option == 2) {
                    let start = new Date()
                    start.setHours(0, 0, 0, 0)
                    let end = new Date()
                    end.setHours(23, 59, 59, 999)

                    let conditionObj = {
                        company: ObjectID(companyID),
                        parent: { $exists: true, $ne: null },
                        date: { $gte: start, $lte: end },
                    }

                    let numberUser = await USER_COLL.count({
                        company: companyID,
                    })
                    let numberToday = 0
                    let listData =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $group: {
                                    _id: { assignee: '$assignee' },
                                },
                            },
                        ])
                    if (listData.length) {
                        numberToday = Number(listData.length)
                    }
                    // console.log({numberUser})
                    // console.log(listData)

                    return resolve({ error: false, numberUser, numberToday })
                }

                // Danh sách user chấm công/chưa chấm ngày nay
                else if (option == 3) {
                    let start = new Date()
                    start.setHours(0, 0, 0, 0)
                    let end = new Date()
                    end.setHours(23, 59, 59, 999)

                    let conditionPopulateUser = {
                        path: '_id.assignee',
                        select: '_id image fullname department',
                        model: 'user',
                        populate: {
                            path: 'department',
                            select: '_id name',
                            model: 'department',
                        },
                    }

                    let conditionObj = {
                        company: ObjectID(companyID),
                        parent: { $exists: true, $ne: null },
                        date: { $gte: start, $lte: end },
                    }

                    let listData1 =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $group: {
                                    _id: { assignee: '$assignee' },
                                },
                            },
                        ])

                    let listData2 = await USER_COLL.find({
                        company: companyID,
                        _id: {
                            $nin: listData1.map((item) => item._id.assignee),
                        },
                    })
                        .select('image fullname department')
                        .populate({
                            path: 'department',
                            select: '_id name',
                        })

                    if (listData1.length) {
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.populate(
                            listData1,
                            conditionPopulateUser
                        )
                    }

                    return resolve({ error: false, listData1, listData2 })
                }

                // Gom nhóm theo Dự án/Bộ phận
                else if (option == 4) {
                    let sortBy = { '_id.project': 1 }

                    let conditionPopulate1 = {
                        path: '_id.project',
                        select: '_id name',
                        model: 'department',
                    }

                    let conditionObj = {
                        company: ObjectID(companyID),
                        parent: { $exists: true, $ne: null },
                    }

                    let listData1 =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$date' },
                                    month: { $month: '$date' },
                                    project: 1,
                                    position: 1,
                                    hours: 1,
                                    amount: 1,
                                },
                            },
                            {
                                $match: {
                                    year: Number(yearFilter),
                                    month: Number(month),
                                },
                            },
                            {
                                $group: {
                                    _id: { project: '$project' },
                                    quantity: { $sum: '$hours' },
                                    amount: { $sum: '$amount' },
                                },
                            },
                            {
                                $sort: sortBy,
                            },
                        ])

                    if (listData1.length) {
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.populate(
                            listData1,
                            conditionPopulate1
                        )
                    }

                    return resolve({ error: false, data: listData1 })
                }

                // Gom nhóm theo Ngày trong tháng
                else if (option == 5) {
                    let conditionObj = {
                        company: ObjectID(companyID),
                        parent: { $exists: true, $ne: null },
                    }

                    let listData1 =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$date' },
                                    month: { $month: '$date' },
                                    day: { $dayOfMonth: '$date' },
                                    hours: 1,
                                    amount: 1,
                                },
                            },
                            {
                                $match: {
                                    year: Number(yearFilter),
                                    month: Number(month),
                                },
                            },
                            {
                                $group: {
                                    _id: { day: '$day' },
                                    quantity: { $sum: '$hours' },
                                    amount: { $sum: '$amount' },
                                },
                            },
                        ])

                    return resolve({ error: false, data: listData1 })
                }

                // Gom nhóm theo Nhân sự trong bộ phận
                else if (option == 6) {
                    let sortBy = { '_id.assignee': 1 }

                    let conditionPopulate1 = {
                        path: '_id.assignee',
                        select: '_id fullname image',
                        model: 'user',
                    }

                    let conditionObj = {
                        project: ObjectID(projectID),
                        parent: { $exists: true, $ne: null },
                    }

                    let listData1 =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$date' },
                                    month: { $month: '$date' },
                                    project: 1,
                                    assignee: 1,
                                    hours: 1,
                                    amount: 1,
                                },
                            },
                            {
                                $match: {
                                    year: Number(yearFilter),
                                    month: Number(month),
                                },
                            },
                            {
                                $group: {
                                    _id: { assignee: '$assignee' },
                                    quantity: { $sum: '$hours' },
                                    amount: { $sum: '$amount' },
                                },
                            },
                            {
                                $sort: sortBy,
                            },
                        ])

                    if (listData1.length) {
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.populate(
                            listData1,
                            conditionPopulate1
                        )
                    }

                    return resolve({ error: false, data: listData1 })
                }

                // Góm nhóm theo ngân sách
                else if (option == 7) {
                    // Tổng hợp theo Sản lượng
                    let listData =
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
                            {
                                $match: {
                                    work: { $exists: true, $ne: null },
                                    company: ObjectID(companyID),
                                },
                            },
                            {
                                $group: {
                                    _id: { work: '$work' },
                                    quantity: { $sum: '$hours' },
                                    amount: { $sum: '$amount' },
                                },
                            },
                        ])
                    let conditionPopulate = {
                        path: '_id.work',
                        select: '_id name unit unitPrice',
                        model: 'budget_work',
                    }

                    if (listData.length) {
                        await TIMESHEET__EXPERT_TIMESHEET_COLL.populate(
                            listData,
                            conditionPopulate
                        )
                    }

                    // console.log(listData)

                    return resolve({ error: false, data: listData })
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }
}

exports.MODEL = new Model()
