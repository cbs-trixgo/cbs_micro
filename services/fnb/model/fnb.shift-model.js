'use strict'
const BaseModel = require('../../../tools/db/base_model')
const {
    checkObjectIDs,
    checkNumberIsValidWithRange,
    checkNumberValid,
    IsJsonString,
    validateParamsObjectID,
} = require('../../../tools/utils/utils')
const stringUtils = require('../../../tools/utils/string_utils')
const { setTimeZone } = require('../../../tools/utils/time_utils')
const { KEY_ERROR } = require('../../../tools/keys')

const {
    getCurrentPage,
} = require('../../../tools/utils/calculate_current_page')
const ObjectID = require('mongoose').Types.ObjectId

const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { template } = require('lodash')

/**
 * Import inter-coll, exter-coll
 */
const USER_COLL = require('../../auth/database/auth.user-coll')
const ITEM__FUNDA_COLL = require('../../item/database/item.funda-coll')
const ITEM__CONTACT_COLL = require('../../item/database/item.contact-coll')
const FNB_ORDER_COLL = require('../database/fnb.order-coll')
const FNB_SHIFT_COLL = require('../database/fnb.shift-coll')
const FNB_MISTAKE_COLL = require('../database/fnb.mistake-coll')
const TIMESHEET__EXPERT_TIMESHEET_COLL = require('../../timesheet/database/timesheet.expert_timesheet-coll')

const TIMESHEET__EXPERT_TIMESHEET_MODEL =
    require('../../timesheet/model/timesheet.expert_timesheet-model').MODEL

const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const { uploadFileS3 } = require('../../../tools/s3')
const moment = require('moment')

const { FNB_ACC } = require('../helper/fnb.keys-constant')

/**
 * Import inter-model, exter-model
 */

class Model extends BaseModel {
    constructor() {
        super(FNB_SHIFT_COLL)
    }

    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 24/11/2022
     */
    insert({
        fundaID,
        email,
        fullname,
        name,
        note,
        campaign,
        seasons,
        shiftType,
        paidStatus,
        workingHours,
        staffsID,
        subWorkingHours,
        subStaffsID,
        openingCash,
        incurredCash,
        closingCash,
        numberOfOpeningSizeM,
        numberOfOpeningSizeL,
        numberOfEotSizeM,
        numberOfEotSizeL,
        userID,
    }) {
        // console.log({ fundaID, name, note, campaign, seasons, shiftType, paidStatus, workingHours, staffsID, subWorkingHours, subStaffsID, openingCash, incurredCash, closingCash, userID })
        const that = this
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(fundaID) || !name)
                    return resolve({
                        error: true,
                        message: 'fundaID|name invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let infoFunda = await ITEM__FUNDA_COLL.findById(fundaID)
                if (!infoFunda)
                    return resolve({
                        error: true,
                        message: 'cannot_get_info_funda',
                    })

                let dataInsert = {
                    company: infoFunda.company,
                    funda: fundaID,
                    name,
                    userCreate: userID,
                    note: `${fullname} - ${moment(new Date()).format('DD/MM/YYYY HH:mm')}`,
                }

                // Chi phí ca làm việc
                let a1 = Number(infoFunda.officialStaffSalar) || 0
                let a2 = Number(infoFunda.trialStaffSalary) || 0
                let a3 = Number(workingHours) || 0
                let a4 = Number(subWorkingHours) || 0
                let a5 = Number(staffsID.length) || 0
                let a6 = Number(subStaffsID.length) || 0

                dataInsert.officialStaffSalar = a1
                dataInsert.trialStaffSalary = a2
                dataInsert.staffSalaryTotal = a1 * a3 * a5 + a2 * a4 * a6

                if (note && note != '') {
                    dataInsert.note = note
                }

                if (staffsID && checkObjectIDs(staffsID)) {
                    dataInsert.staffs = staffsID
                }

                if (subStaffsID && checkObjectIDs(subStaffsID)) {
                    dataInsert.subStaffs = subStaffsID
                }

                if (campaign && !isNaN(campaign)) {
                    dataInsert.campaign = Number(campaign)
                }

                if (seasons && !isNaN(seasons)) {
                    dataInsert.seasons = Number(seasons)
                }

                if (shiftType && !isNaN(shiftType)) {
                    dataInsert.shiftType = Number(shiftType)
                }

                if (paidStatus && !isNaN(paidStatus)) {
                    dataInsert.paidStatus = Number(paidStatus)
                }

                if (workingHours && !isNaN(workingHours)) {
                    dataInsert.workingHours = Number(workingHours)
                }

                if (subWorkingHours && !isNaN(subWorkingHours)) {
                    dataInsert.subWorkingHours = Number(subWorkingHours)
                }

                if (openingCash && !isNaN(openingCash)) {
                    dataInsert.openingCash = Number(openingCash)
                }

                if (incurredCash && !isNaN(incurredCash)) {
                    dataInsert.incurredCash = Number(incurredCash)
                }

                if (closingCash && !isNaN(closingCash)) {
                    dataInsert.closingCash = Number(closingCash)
                }

                if (numberOfOpeningSizeM && !isNaN(numberOfOpeningSizeM)) {
                    dataInsert.numberOfOpeningSizeM =
                        Number(numberOfOpeningSizeM)
                }

                if (numberOfOpeningSizeL && !isNaN(numberOfOpeningSizeL)) {
                    dataInsert.numberOfOpeningSizeL =
                        Number(numberOfOpeningSizeL)
                }

                if (numberOfEotSizeM && !isNaN(numberOfEotSizeM)) {
                    dataInsert.numberOfEotSizeM = Number(numberOfEotSizeM)
                }

                if (numberOfEotSizeL && !isNaN(numberOfEotSizeL)) {
                    dataInsert.numberOfEotSizeL = Number(numberOfEotSizeL)
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                    })

                // Cập nhật vào bảng chấm công
                // await that.updateTimesheet({ companyID: infoFunda.company, shiftID: infoAfterInsert._id, userID })

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: update
     * Author:
     * Code:
     */
    update({
        companyID,
        shiftID,
        email,
        fullname,
        name,
        note,
        campaign,
        seasons,
        shiftType,
        paidStatus,
        workingHours,
        staffsID,
        subWorkingHours,
        subStaffsID,
        openingCash,
        incurredCash,
        closingCash,
        numberOfOpeningSizeM,
        numberOfOpeningSizeL,
        numberOfEotSizeM,
        numberOfEotSizeL,
        userID,
    }) {
        // console.log({ shiftID, email, fullname, name, note, campaign, seasons, shiftType, paidStatus, workingHours, staffsID, subWorkingHours, subStaffsID, openingCash, incurredCash, closingCash, numberOfOpeningSizeM, numberOfOpeningSizeL, numberOfEotSizeM, numberOfEotSizeL, userID })
        const that = this
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(shiftID))
                    return resolve({
                        error: true,
                        message: 'shiftID__invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let infoShift =
                    await FNB_SHIFT_COLL.findById(shiftID).select('_id funda')
                let infoFunda = await ITEM__FUNDA_COLL.findById(
                    infoShift.funda
                ).select(
                    '_id company name manager trialStaffSalary officialStaffSalar'
                )

                let dataUpdate = {
                    userUpdate: userID,
                    modifyAt: new Date(),
                }

                if (name && name != '') {
                    dataUpdate.name = name
                }

                if (note && note != '') {
                    dataUpdate.note = note
                }

                if (campaign && !isNaN(campaign)) {
                    dataUpdate.campaign = Number(campaign)
                }

                if (seasons && !isNaN(seasons)) {
                    dataUpdate.seasons = Number(seasons)
                }

                if (shiftType && !isNaN(shiftType)) {
                    dataUpdate.shiftType = Number(shiftType)
                }

                if (paidStatus && !isNaN(paidStatus)) {
                    dataUpdate.paidStatus = Number(paidStatus)
                }

                if (openingCash && !isNaN(openingCash)) {
                    dataUpdate.openingCash = Number(openingCash)
                }

                if (incurredCash && !isNaN(incurredCash)) {
                    dataUpdate.incurredCash = Number(incurredCash)
                }

                if (closingCash && !isNaN(closingCash)) {
                    dataUpdate.closingCash = Number(closingCash)
                }

                if (
                    FNB_ACC.man.includes(email.toString()) ||
                    FNB_ACC.cskh.includes(email.toString())
                ) {
                    // console.log('==========111111111111')
                    if (staffsID && checkObjectIDs(staffsID)) {
                        dataUpdate.staffs = staffsID
                    }

                    if (subStaffsID && checkObjectIDs(subStaffsID)) {
                        dataUpdate.subStaffs = subStaffsID
                    }

                    if (!isNaN(workingHours)) {
                        dataUpdate.workingHours = Number(workingHours)
                    }

                    if (!isNaN(subWorkingHours)) {
                        dataUpdate.subWorkingHours = Number(subWorkingHours)
                    }

                    // Chi phí ca làm việc
                    if (
                        checkObjectIDs(staffsID) ||
                        checkObjectIDs(subStaffsID)
                    ) {
                        dataUpdate.officialStaffSalar = Number(
                            infoFunda.officialStaffSalar
                        )
                        dataUpdate.trialStaffSalary = Number(
                            infoFunda.trialStaffSalary
                        )
                        dataUpdate.staffSalaryTotal =
                            Number(infoFunda.officialStaffSalar) *
                                Number(workingHours) *
                                Number(staffsID.length) +
                            Number(infoFunda.trialStaffSalary) *
                                Number(subWorkingHours) *
                                Number(subStaffsID.length)
                    }

                    if (!isNaN(numberOfOpeningSizeM)) {
                        dataUpdate.numberOfOpeningSizeM =
                            Number(numberOfOpeningSizeM)
                    }

                    if (!isNaN(numberOfOpeningSizeL)) {
                        dataUpdate.numberOfOpeningSizeL =
                            Number(numberOfOpeningSizeL)
                    }

                    if (!isNaN(numberOfEotSizeM)) {
                        dataUpdate.numberOfEotSizeM = Number(numberOfEotSizeM)
                    }

                    if (!isNaN(numberOfEotSizeL)) {
                        dataUpdate.numberOfEotSizeL = Number(numberOfEotSizeL)
                    }
                } else {
                    // console.log('==========2222222222222222')
                    if (!isNaN(numberOfOpeningSizeM)) {
                        dataUpdate.numberOfOpeningSizeM =
                            Number(numberOfOpeningSizeM)
                    }

                    if (!isNaN(numberOfOpeningSizeL)) {
                        dataUpdate.numberOfOpeningSizeL =
                            Number(numberOfOpeningSizeL)
                    }

                    if (!isNaN(numberOfEotSizeM)) {
                        dataUpdate.numberOfEotSizeM = Number(numberOfEotSizeM)
                    }

                    if (!isNaN(numberOfEotSizeL)) {
                        dataUpdate.numberOfEotSizeL = Number(numberOfEotSizeL)
                    }
                }
                // console.log({ dataUpdate })

                let infoAfterUpdate = await FNB_SHIFT_COLL.findByIdAndUpdate(
                    shiftID,
                    dataUpdate,
                    { new: true }
                )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: KEY_ERROR.UPDATE_FAILED,
                    })

                /**
                 * CẬP NHẬT LẠI DOANH SỐ CỦA NHÂN VIÊN
                 * CẬP NHẬT LẠI CHI PHÍ GIỜ LÀM CỦA NHÂN VIÊN
                 */
                if (
                    FNB_ACC.man.includes(email.toString()) ||
                    FNB_ACC.cskh.includes(email.toString())
                ) {
                    // console.log('==========OKKKKKKKKKKKKKKKK1111111111111')
                    // Doanh số nhân viên
                    let listOrders = await FNB_ORDER_COLL.find({
                        shift: shiftID,
                    })
                    for (const item of listOrders) {
                        let dataOrderUpdate = {
                            userUpdate: userID,
                            modifyAt: new Date(),
                        }

                        let numberStaff = 0
                        if (
                            staffsID &&
                            checkObjectIDs(staffsID) &&
                            staffsID.length
                        ) {
                            numberStaff = staffsID.length
                            let arrStaffs = staffsID

                            if (subStaffsID && subStaffsID.length) {
                                arrStaffs = [...arrStaffs, ...subStaffsID]

                                numberStaff =
                                    Number(numberStaff) +
                                    Number(subStaffsID.length)
                            }

                            // Nhân viên thực hiện
                            dataOrderUpdate.assignee = arrStaffs

                            // Doanh số trung bình/đầu nhân viên (nhiều nhân viên)
                            if (Number(numberStaff) != 0) {
                                dataOrderUpdate.avgTotalPerStaff = Number(
                                    item.amount / Number(numberStaff)
                                ).toFixed(0)
                            } else {
                                dataOrderUpdate.avgTotalPerStaff = 1
                            }

                            dataOrderUpdate.avgQuantityPerStaff = Number(
                                item.numberOfProducts / numberStaff
                            ).toFixed(2)
                        } else {
                            numberStaff = 1
                            dataOrderUpdate.assignee = [userID]

                            // Doanh số trung bình/đầu nhân viên (1 nhân viên)
                            dataOrderUpdate.avgTotalPerStaff = Number(
                                item.amount / Number(numberStaff)
                            ).toFixed(0)

                            dataOrderUpdate.avgQuantityPerStaff = Number(
                                item.numberOfProducts / numberStaff
                            ).toFixed(2)
                        }

                        // console.log(dataOrderUpdate)
                        let infoOrder = await FNB_ORDER_COLL.findByIdAndUpdate(
                            item._id,
                            dataOrderUpdate,
                            { new: true }
                        )
                    }
                }
                // console.log(infoAfterUpdate)

                // Cập nhật vào bảng chấm công
                // await that.updateTimesheet({ companyID, shiftID, userID })

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Cập nhật bảng chấm công => Khối gián tiếp
     * Author: HiepNH
     * Code  : 2/4/2023
     */
    updateTimesheet({ companyID, shiftID, userID }) {
        // console.log({ companyID, shiftID, userID })
        return new Promise(async (resolve) => {
            try {
                /**
                 * 1. Tìm bảng chấm công trong tháng/chưa có thì tạo
                    2. Tìm user trong bảng chấm công/chưa có thì tạo/có thì update
                    3. Update chấm công sang (KL, đơn giá, thành tiền,...)
                 */
                // Bảng chấm công trong tháng
                let infoShift = await FNB_SHIFT_COLL.findById(shiftID).populate(
                    {
                        path: 'funda',
                        select: 'name sign',
                    }
                )
                // console.log(infoShift)
                // console.log({___________:infoShift.createAt.getMonth()})
                // console.log({___________:infoShift.createAt.getFullYear()})

                let infoTimesheet =
                    await TIMESHEET__EXPERT_TIMESHEET_COLL.findOne({
                        company: companyID,
                        type: 2,
                        parent: { $exists: false },
                        $where: `return this.date.getMonth() === ${Number(infoShift.createAt.getMonth())} && this.date.getFullYear() === ${Number(infoShift.createAt.getFullYear())}`,
                    })
                // console.log({___________:infoTimesheet})

                if (infoTimesheet) {
                    for (const item of infoShift.staffs) {
                        let checkExist =
                            await TIMESHEET__EXPERT_TIMESHEET_COLL.findOne({
                                parent: { $exists: true, $ne: null },
                                shift: shiftID,
                                assignee: item,
                                $where: `return this.date.getMonth() === ${Number(infoShift.createAt.getMonth())} && this.date.getFullYear() === ${Number(infoShift.createAt.getFullYear())}`,
                            })
                        // console.log({checkExist})

                        if (!checkExist) {
                            // console.log('111111111111111111111111111')
                            // Tạo mới
                            let info =
                                await TIMESHEET__EXPERT_TIMESHEET_MODEL.insert({
                                    userCreate: userID,
                                    companyID,
                                    parentID: infoTimesheet._id,
                                    name: `${infoShift.name}_${infoShift.funda.name}`,
                                    date: infoShift.createAt,
                                    type: 2,
                                    hours: infoShift.workingHours,
                                    unitprice: infoShift.officialStaffSalar,
                                    fundaID: infoShift.funda._id,
                                    shiftID,
                                    assigneeID: item,
                                })
                            // console.log({___________:info})
                        } else {
                            // console.log('222222222222222222222222222')
                            // Cập nhật
                            let info =
                                await TIMESHEET__EXPERT_TIMESHEET_COLL.findOneAndUpdate(
                                    {
                                        shift: shiftID,
                                        assignee: item,
                                        $where: `return this.date.getMonth() === ${Number(infoShift.createAt.getMonth())} && this.date.getFullYear() === ${Number(infoShift.createAt.getFullYear())}`,
                                    },
                                    {
                                        name: `${infoShift.name}_${infoShift.funda.name}_updated`,
                                        hours: infoShift.workingHours,
                                        unitprice: infoShift.officialStaffSalar,
                                        amount: Number(
                                            infoShift.workingHours *
                                                infoShift.officialStaffSalar
                                        ),
                                    },
                                    { new: true }
                                )

                            // console.log(info)
                        }
                    }

                    for (const item of infoShift.subStaffs) {
                        let checkExist =
                            await TIMESHEET__EXPERT_TIMESHEET_COLL.findOne({
                                parent: { $exists: true, $ne: null },
                                shift: shiftID,
                                assignee: item,
                                $where: `return this.date.getMonth() === ${Number(infoShift.createAt.getMonth())} && this.date.getFullYear() === ${Number(infoShift.createAt.getFullYear())}`,
                            })
                        // console.log({checkExist})

                        if (!checkExist) {
                            // console.log('333333333333333333333333333')
                            // Tạo mới
                            let info =
                                await TIMESHEET__EXPERT_TIMESHEET_MODEL.insert({
                                    userCreate: userID,
                                    companyID,
                                    parentID: infoTimesheet._id,
                                    name: `${infoShift.name}_ca gãy_${infoShift.funda.name}`,
                                    date: infoShift.createAt,
                                    type: 2,
                                    hours: infoShift.subWorkingHours,
                                    unitprice: infoShift.trialStaffSalary,
                                    fundaID: infoShift.funda._id,
                                    shiftID,
                                    assigneeID: item,
                                })
                            // console.log({___________:info})
                        } else {
                            // console.log('44444444444444444444444444444')
                            // Cập nhật
                            let info =
                                await TIMESHEET__EXPERT_TIMESHEET_COLL.findOneAndUpdate(
                                    {
                                        shift: shiftID,
                                        assignee: item,
                                        $where: `return this.date.getMonth() === ${Number(infoShift.createAt.getMonth())} && this.date.getFullYear() === ${Number(infoShift.createAt.getFullYear())}`,
                                    },
                                    {
                                        name: `${infoShift.name}_ca gãy_${infoShift.funda.name}_updated`,
                                        hours: infoShift.subWorkingHours,
                                        unitprice: infoShift.trialStaffSalary,
                                        amount: Number(
                                            infoShift.subWorkingHours *
                                                infoShift.trialStaffSalary
                                        ),
                                    },
                                    { new: true }
                                )
                            // console.log(info)
                        }
                    }
                }

                return resolve({ error: false })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name:
     * Author: Depv
     * Code:
     */
    getInfo({ shiftID, select, populates = {} }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(shiftID))
                    return resolve({ error: true, message: 'param_invalid' })

                // populate
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

                let infoPlanGroup = await FNB_SHIFT_COLL.findById(shiftID)
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
     * Name  : Danh sách
     * Author: HiepNH
     * Code  :
     */
    getList({
        companyID,
        fundaID,
        staffID,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates,
        sortKey,
        fromDate,
        toDate,
        userID,
    }) {
        // console.log({ companyID, fundaID, staffID, keyword, limit, lastestID, select, populates, sortKey, fromDate, toDate, userID })
        return new Promise(async (resolve) => {
            try {
                if (Number(limit) > 20) {
                    limit = 20
                } else {
                    limit = +Number(limit)
                }

                let conditionObj = { company: ObjectID(companyID) }
                let sortBy
                let nextCursor = null
                let keys = ['createAt__-1', '_id__-1']

                // Gom nhóm theo đơn vị cơ sở
                if (fundaID) {
                    conditionObj.funda = ObjectID(fundaID)
                } else {
                    if (staffID) {
                        conditionObj.$or = [
                            { staffs: { $in: [staffID] } },
                            { subStaffs: { $in: [staffID] } },
                        ]
                    } else {
                        conditionObj.company = ObjectID(companyID)
                    }
                }

                // Làm rõ mục đích để làm gì?
                if (sortKey && typeof sortKey === 'string') {
                    if (!IsJsonString(sortKey))
                        return resolve({
                            error: true,
                            message: 'Request params sortKey invalid',
                            status: 400,
                        })

                    keys = JSON.parse(sortKey)
                }
                // console.log(conditionObj)

                /**
                 * ĐIỀU KIỆN KHÁC
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

                // Phân loại theo thời khoảng
                if (fromDate && toDate) {
                    conditionObj.createAt = {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate),
                    }
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    const regSearch = new RegExp(keyword, 'i')

                    conditionObj.$or = [
                        { name: regSearch },
                        { sign: regSearch },
                    ]
                }

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
                    let infoData = await FNB_SHIFT_COLL.findById(lastestID)
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

                let infoDataAfterGet = await FNB_SHIFT_COLL.find(conditionObj)
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

                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]?._id
                        infoDataAfterGet.length = limit
                    }
                }
                let totalRecord = await FNB_SHIFT_COLL.count(conditionObjOrg)
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
     * Name: Danh sách
     * Author: HiepNH
     * Code: 2/10/2022
     */
    getListByProperty({
        companyID,
        fundasID,
        option,
        optionGroup,
        optionStatus,
        optionTime,
        year,
        fromDate,
        toDate,
        userID,
    }) {
        // console.log({ companyID, fundasID, option, optionGroup, optionStatus, optionTime, year, fromDate, toDate, userID })
        return new Promise(async (resolve) => {
            try {
                if (!option) {
                } else {
                    let conditionObj = { company: ObjectID(companyID) }
                    let conditionGroup = {}
                    let conditionObjYear = {},
                        conditionPopulate = {},
                        sortBy = { cashAmount: -1 }

                    const validation = validateParamsObjectID({
                        fundasID: { value: fundasID, isRequire: false },
                    })
                    if (validation.error) return resolve(validation)

                    // Gom nhóm theo đơn vị cơ sở
                    if (fundasID && fundasID.length) {
                        let arrFun = fundasID.map((item) => ObjectID(item))
                        conditionObj.funda = { $in: arrFun }
                    } else {
                        let listFundaIsMember = await ITEM__FUNDA_COLL.find({
                            members: { $in: [userID] },
                        })

                        let fundasIDIsMember = listFundaIsMember.map((item) =>
                            ObjectID(item._id)
                        )
                        if (fundasIDIsMember.length) {
                            conditionObj.funda = { $in: fundasIDIsMember }
                        } else {
                            conditionObj.funda = { $in: [] }
                        }
                    }

                    /**
                     * Tính tổng TIỀN MẶT ĐANG TỒN Ở ĐIỂM BÁN CHƯA CHUYỂN VỀ
                     */
                    if (option && Number(option) == 1) {
                        conditionObj.paidStatus = 1 // Chưa nộp
                        delete conditionObj.funda // Tính tổng tại tất cả các điểm bán
                        conditionGroup = {
                            _id: {},
                            quantity: { $sum: 1 },
                            cashAmount: { $sum: '$cashAmount' },
                        }
                    }

                    /**
                     * Tính tổng số lỗi mắc phải, thất thoát cốc M, L
                     */
                    if (option && Number(option) == 2) {
                        delete conditionObj.funda // Tính tổng tại tất cả các điểm bán

                        if (fromDate && toDate) {
                            conditionObj.createAt = {
                                $gte: new Date(fromDate),
                                $lte: new Date(toDate),
                            }
                        }

                        conditionGroup = {
                            _id: {},
                            numberOfMistakes: { $sum: '$numberOfMistakes' },
                            numberOfOpeningSizeM: {
                                $sum: '$numberOfOpeningSizeM',
                            },
                            numberOfOpeningSizeL: {
                                $sum: '$numberOfOpeningSizeL',
                            },
                            numberOfEotSizeM: { $sum: '$numberOfEotSizeM' },
                            numberOfEotSizeL: { $sum: '$numberOfEotSizeL' },
                            numberOfSizeM: { $sum: '$numberOfSizeM' },
                            numberOfSizeL: { $sum: '$numberOfSizeL' },
                        }
                    }

                    /**
                     * Tính tổng tiền chưa nộp
                     */
                    if (option && Number(option) == 3) {
                        conditionObj.paidStatus = 1 // Chưa nộp

                        if (fromDate && toDate) {
                            conditionObj.createAt = {
                                $gte: new Date(fromDate),
                                $lte: new Date(toDate),
                            }
                        }

                        conditionGroup = {
                            _id: { funda: '$funda' },
                            cashAmount: { $sum: '$cashAmount' },
                            numberOfMistakes: { $sum: '$numberOfMistakes' },
                            numberOfOpeningSizeM: {
                                $sum: '$numberOfOpeningSizeM',
                            },
                            numberOfOpeningSizeL: {
                                $sum: '$numberOfOpeningSizeL',
                            },
                            numberOfEotSizeM: { $sum: '$numberOfEotSizeM' },
                            numberOfEotSizeL: { $sum: '$numberOfEotSizeL' },
                            numberOfSizeM: { $sum: '$numberOfSizeM' },
                            numberOfSizeL: { $sum: '$numberOfSizeL' },
                        }

                        conditionPopulate = {
                            path: '_id.funda',
                            select: '_id name sign image',
                            model: 'funda',
                        }
                    }

                    /**
                     * Phân loại theo năm
                     */
                    if (option && Number(option) == 4) {
                        // // Theo năm
                        // if(optionTime && Number(optionTime) == 1){
                        //     conditionGroup = {
                        //         _id: { year: "$year" },
                        //         quantity: { $sum: 1 },
                        //         amount: { $sum: "$amount" },
                        //         numberOfProducts: { $sum: "$numberOfProducts" },
                        //     }
                        // }
                        // // Theo tháng
                        // if(optionTime && Number(optionTime) == 2){
                        //     if(!isNaN(year) && Number(year) >= 0){
                        //         conditionObjYear = {
                        //             "year": Number(year),
                        //         }
                        //     }
                        //     conditionGroup = {
                        //         _id: { month: "$month", year: "$year" },
                        //         quantity: { $sum: 1 },
                        //         amount: { $sum: "$amount" },
                        //         numberOfProducts: { $sum: "$numberOfProducts" },
                        //     }
                        // }
                        // // Theo giờ
                        // if(optionTime && Number(optionTime) == 3){
                        //     if(!isNaN(year) && Number(year) >= 0){
                        //         conditionObjYear = {
                        //             "year": Number(year),
                        //         }
                        //     }
                        //     conditionGroup = {
                        //         _id: { funda: "$funda", hour: "$hour" },
                        //         quantity: { $sum: 1 },
                        //         amount: { $sum: "$amount" },
                        //         numberOfProducts: { $sum: "$numberOfProducts" },
                        //     }
                        // }
                    }

                    // console.log(conditionObj)
                    // console.log(conditionObjYear)
                    // console.log(conditionPopulate)
                    // console.log(conditionGroup)

                    // Danh sách đang triển khai
                    let listData = await FNB_SHIFT_COLL.aggregate([
                        {
                            $match: conditionObj,
                        },
                        {
                            $project: {
                                year: { $year: '$createAt' },
                                month: { $month: '$createAt' },
                                hour: { $hour: '$createAt' },
                                funda: 1,
                                amount: 1,
                                vatAmount: 1,
                                cashAmount: 1,
                                paidStatus: 1,
                                numberOfMistakes: 1,
                                numberOfOpeningSizeM: 1,
                                numberOfOpeningSizeL: 1,
                                numberOfEotSizeM: 1,
                                numberOfEotSizeL: 1,
                                numberOfSizeM: 1,
                                numberOfSizeL: 1,
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

                    if (!isNaN(option) && [3].includes(Number(option))) {
                        await FNB_SHIFT_COLL.populate(
                            listData,
                            conditionPopulate
                        )
                    }

                    return resolve({ error: false, data: listData })
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
     * Func: Tải Bảng chấm công
     * Date: 15/1/2023
     */
    exportExcel({
        companyID,
        email,
        fundaID,
        fromDate,
        toDate,
        month,
        year,
        userID,
    }) {
        // console.log({ companyID, fundaID, fromDate, toDate, month, year, userID })
        return new Promise(async (resolve) => {
            try {
                if (
                    FNB_ACC.cskh.includes(email.toString()) ||
                    FNB_ACC.man.includes(email.toString())
                ) {
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

                    /**
                     * BẢNG CHẤM CÔNG CHO TỪNG ĐIỂM BÁN
                     */
                    if (fundaID) {
                        let infoFunda = await ITEM__FUNDA_COLL.findById(
                            fundaID
                        ).populate({
                            path: 'company',
                            select: 'name sign',
                        })

                        let conditionObj = {
                            funda: ObjectID(fundaID),
                        }

                        let projectObj = {
                            year: { $year: '$createAt' },
                            month: { $month: '$createAt' },
                            day: { $dayOfMonth: '$createAt' },
                            company: 1,
                            funda: 1,
                            staffs: 1,
                            workingHours: 1,
                            subStaffs: 1,
                            subWorkingHours: 1,
                            createAt: 1,
                        }

                        let lookupObj = {
                            from: 'users',
                            localField: 'staffs',
                            foreignField: '_id',
                            as: 'staff',
                        }

                        let lookupSubObj = {
                            from: 'users',
                            localField: 'subStaffs',
                            foreignField: '_id',
                            as: 'staff',
                        }

                        let conditionObjYear = {
                            year: Number(yearFilter),
                        }

                        let conditionPopulate = {},
                            sortBy = { day: 1 }

                        let conditionGroup = {
                            _id: {
                                staff: '$staff._id',
                                day: '$day',
                                month: '$month',
                                year: '$year',
                            },
                            number: { $sum: 1 },
                            workingHours: { $sum: '$workingHours' },
                            subWorkingHours: { $sum: '$subWorkingHours' },
                        }

                        // Danh sách nhân sự ca chính
                        let listData1 = await FNB_SHIFT_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $lookup: lookupObj,
                            },
                            {
                                $unwind: '$staff',
                            },
                            {
                                $group: {
                                    _id: { staff: '$staff' },
                                },
                            },
                        ])

                        // Danh sách nhân sự ca phụ
                        let listData2 = await FNB_SHIFT_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $lookup: lookupSubObj,
                            },
                            {
                                $unwind: '$staff',
                            },
                            {
                                $group: {
                                    _id: { staff: '$staff' },
                                },
                            },
                        ])

                        let listDataTimesheet1 = await FNB_SHIFT_COLL.aggregate(
                            [
                                {
                                    $match: conditionObj,
                                },
                                {
                                    $project: projectObj,
                                },
                                {
                                    $lookup: lookupObj,
                                },
                                {
                                    $unwind: '$staff',
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
                            ]
                        )

                        let listDataTimesheet2 = await FNB_SHIFT_COLL.aggregate(
                            [
                                {
                                    $match: conditionObj,
                                },
                                {
                                    $project: projectObj,
                                },
                                {
                                    $lookup: lookupSubObj,
                                },
                                {
                                    $unwind: '$staff',
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
                            ]
                        )
                        // console.log(listDataTimesheet1)
                        // console.log(listDataTimesheet2)

                        let listData3 = [...listData1, ...listData2]
                        let listStaffs = await USER_COLL.find({
                            _id: {
                                $in: listData3.map((item) => item._id.staff),
                            },
                        }).select('_id fullname')

                        // Modify the workbook.
                        XlsxPopulate.fromFileAsync(
                            path.resolve(
                                __dirname,
                                '../../../files/templates/excels/fnb_shift_export_salary.xlsx'
                            )
                        ).then(async (workbook) => {
                            workbook
                                .sheet(`QuyCheLuong`)
                                .row(3)
                                .cell(3)
                                .value(infoFunda?.trainStaffSalar)
                            workbook
                                .sheet(`QuyCheLuong`)
                                .row(4)
                                .cell(3)
                                .value(infoFunda?.trialStaffSalary)
                            workbook
                                .sheet(`QuyCheLuong`)
                                .row(5)
                                .cell(3)
                                .value(infoFunda?.officialStaffSalar)
                            workbook
                                .sheet(`QuyCheLuong`)
                                .row(6)
                                .cell(3)
                                .value(infoFunda?.lunchStaffAllowance)

                            // Lặp qua 12 tháng
                            for (var m = 1; m <= 12; m++) {
                                workbook
                                    .sheet(`T${m}`)
                                    .row(1)
                                    .cell(4)
                                    .value(Number(yearFilter))
                                workbook
                                    .sheet(`T${m}`)
                                    .row(2)
                                    .cell(1)
                                    .value(`Điểm bán: ${infoFunda.name}`)

                                var j = 2
                                listStaffs?.forEach((item, index) => {
                                    workbook
                                        .sheet(`T${m}`)
                                        .row(3)
                                        .cell(j)
                                        .value(item.fullname)
                                    workbook
                                        .sheet(`T${m}`)
                                        .row(4)
                                        .cell(j)
                                        .value(`${item._id}`)
                                    j++
                                })
                            }

                            listDataTimesheet1?.forEach((item, index) => {
                                for (var m = 1; m <= 12; m++) {
                                    if (Number(item._id.month) === Number(m)) {
                                        for (let i = 5; i <= 35; i++) {
                                            for (
                                                let j = 2;
                                                j <=
                                                Number(listStaffs.length + 1);
                                                j++
                                            ) {
                                                let staffID = workbook
                                                    .sheet(`T${m}`)
                                                    .row(4)
                                                    .cell(j)
                                                    .value()

                                                if (
                                                    item._id.staff.toString() ===
                                                        staffID.toString() &&
                                                    Number(i - 4) ===
                                                        Number(item._id.day)
                                                ) {
                                                    workbook
                                                        .sheet(`T${m}`)
                                                        .row(i)
                                                        .cell(j)
                                                        .value(
                                                            item.workingHours
                                                        )
                                                }
                                            }
                                        }
                                    }
                                }
                            })

                            listDataTimesheet2?.forEach((item, index) => {
                                for (var m = 1; m <= 12; m++) {
                                    if (Number(item._id.month) === Number(m)) {
                                        for (let i = 5; i <= 35; i++) {
                                            for (
                                                let j = 2;
                                                j <=
                                                Number(listStaffs.length + 1);
                                                j++
                                            ) {
                                                let staffID = workbook
                                                    .sheet(`T${m}`)
                                                    .row(4)
                                                    .cell(j)
                                                    .value()

                                                if (
                                                    item._id.staff.toString() ===
                                                        staffID.toString() &&
                                                    Number(i - 4) ===
                                                        Number(item._id.day)
                                                ) {
                                                    let timesheet =
                                                        workbook
                                                            .sheet(`T${m}`)
                                                            .row(i)
                                                            .cell(j)
                                                            .value() | 0

                                                    workbook
                                                        .sheet(`T${m}`)
                                                        .row(i)
                                                        .cell(j)
                                                        .value(
                                                            Number(timesheet) +
                                                                Number(
                                                                    item.subWorkingHours
                                                                )
                                                        )
                                                }
                                            }
                                        }
                                    }
                                }
                            })

                            const now = new Date()
                            const filePath = '../../../files/temporary_uploads/'
                            const fileName = `${infoFunda.company.sign}.${infoFunda.sign}-BangChamCong_${now.getTime()}.xlsx`
                            const pathWriteFile = path.resolve(
                                __dirname,
                                filePath,
                                fileName
                            )

                            await workbook.toFileAsync(pathWriteFile)
                            const result = await uploadFileS3(
                                pathWriteFile,
                                fileName
                            )

                            fs.unlinkSync(pathWriteFile)
                            return resolve({
                                error: false,
                                data: result?.Location,
                                status: 200,
                            })
                        })
                    } else {

                    /**
                     * BẢNG CHẤM CÔNG TOÀN BỘ NHÂN SỰ
                     */
                        if (
                            FNB_ACC.bod.includes(email.toString()) ||
                            FNB_ACC.cskh.includes(email.toString())
                        ) {
                            let conditionObj = {
                                company: ObjectID(companyID),
                            }

                            let projectObj = {
                                year: { $year: '$createAt' },
                                month: { $month: '$createAt' },
                                day: { $dayOfMonth: '$createAt' },
                                company: 1,
                                funda: 1,
                                staffs: 1,
                                workingHours: 1,
                                subStaffs: 1,
                                subWorkingHours: 1,
                                createAt: 1,
                            }

                            let lookupObj = {
                                from: 'users',
                                localField: 'staffs',
                                foreignField: '_id',
                                as: 'staff',
                            }

                            let lookupSubObj = {
                                from: 'users',
                                localField: 'subStaffs',
                                foreignField: '_id',
                                as: 'staff',
                            }

                            let conditionObjYear = {
                                year: Number(yearFilter),
                                month: {
                                    $in: [currentMonth - 1, currentMonth],
                                },
                            }

                            let sortBy = { day: 1 }

                            let conditionGroup = {
                                _id: { staff: '$staff._id', month: '$month' },
                                workingHours: { $sum: '$workingHours' },
                                subWorkingHours: { $sum: '$subWorkingHours' },
                            }

                            /**
                             * DOANH SỐ CÁ NHÂN
                             */
                            let conditionOrderObj = {
                                company: ObjectID(companyID),
                                status: 5,
                                avgTotalPerStaff: {
                                    $exists: true,
                                    $ne: null,
                                    $gte: 0,
                                },
                            }
                            let projectOrderObj = {
                                year: { $year: '$createAt' },
                                month: { $month: '$createAt' },
                                day: { $dayOfMonth: '$createAt' },
                                company: 1,
                                funda: 1,
                                createAt: 1,
                                assignee: 1,
                                executor: 1,
                                total: 1,
                                amount: 1,
                                avgTotalPerStaff: 1,
                                avgQuantityPerStaff: 1,
                            }
                            let lookupOrderObj = {
                                from: 'users',
                                localField: 'assignee',
                                foreignField: '_id',
                                as: 'staff',
                            }
                            let conditionOrderGroup = {
                                _id: { staff: '$staff._id', month: '$month' },
                                number: { $sum: 1 },
                                avgTotalPerStaff: { $sum: '$avgTotalPerStaff' },
                            }
                            let conditionOrderPopulate = {
                                path: '_id.staff',
                                select: '_id fullname department',
                                populate: {
                                    path: 'department',
                                    select: '_id name',
                                    model: 'department',
                                },
                                model: 'user',
                            }

                            let listDataRevenue =
                                await FNB_ORDER_COLL.aggregate([
                                    {
                                        $match: conditionOrderObj,
                                    },
                                    {
                                        $project: projectOrderObj,
                                    },
                                    {
                                        $match: conditionObjYear,
                                    },
                                    {
                                        $lookup: lookupOrderObj,
                                    },
                                    {
                                        $unwind: '$staff',
                                    },
                                    {
                                        $group: conditionOrderGroup,
                                    },
                                    {
                                        $sort: {
                                            '_id.month': -1,
                                            '_id.funda': 1,
                                        },
                                    },
                                ])
                            await FNB_ORDER_COLL.populate(
                                listDataRevenue,
                                conditionOrderPopulate
                            )

                            /**
                             * THƯỞNG PHẠT
                             */
                            let conditionGroupErr = {
                                _id: { executor: '$executor', month: '$month' },
                                number: { $sum: 1 },
                                amount: { $sum: '$amount' },
                            }
                            let conditionPopulateErr = {
                                path: '_id.executor',
                                select: '_id fullname',
                                populate: {
                                    path: 'department',
                                    select: '_id name',
                                    model: 'department',
                                },
                                model: 'user',
                            }

                            let listDataErr = await FNB_MISTAKE_COLL.aggregate([
                                {
                                    $match: {
                                        company: ObjectID(companyID),
                                    },
                                },
                                {
                                    $project: projectOrderObj,
                                },
                                {
                                    $match: conditionObjYear,
                                },
                                {
                                    $group: conditionGroupErr,
                                },
                                {
                                    $sort: { '_id.month': -1 },
                                },
                            ])
                            await FNB_MISTAKE_COLL.populate(
                                listDataErr,
                                conditionPopulateErr
                            )

                            // Danh sách nhân sự ca chính
                            let listData1 = await FNB_SHIFT_COLL.aggregate([
                                {
                                    $match: conditionObj,
                                },
                                {
                                    $lookup: lookupObj,
                                },
                                {
                                    $unwind: '$staff',
                                },
                                {
                                    $group: {
                                        _id: { staff: '$staff' },
                                    },
                                },
                            ])

                            // Danh sách nhân sự ca phụ
                            let listData2 = await FNB_SHIFT_COLL.aggregate([
                                {
                                    $match: conditionObj,
                                },
                                {
                                    $lookup: lookupSubObj,
                                },
                                {
                                    $unwind: '$staff',
                                },
                                {
                                    $group: {
                                        _id: { staff: '$staff' },
                                    },
                                },
                            ])

                            let listDataTimesheet1 =
                                await FNB_SHIFT_COLL.aggregate([
                                    {
                                        $match: conditionObj,
                                    },
                                    {
                                        $project: projectObj,
                                    },
                                    {
                                        $lookup: lookupObj,
                                    },
                                    {
                                        $unwind: '$staff',
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

                            let listDataTimesheet2 =
                                await FNB_SHIFT_COLL.aggregate([
                                    {
                                        $match: conditionObj,
                                    },
                                    {
                                        $project: projectObj,
                                    },
                                    {
                                        $lookup: lookupSubObj,
                                    },
                                    {
                                        $unwind: '$staff',
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

                            let listData3 = [...listData1, ...listData2]
                            let listStaffs = await USER_COLL.find({
                                _id: {
                                    $in: listData3.map(
                                        (item) => item._id.staff
                                    ),
                                },
                            })
                                .select('_id fullname department')
                                .populate({
                                    path: 'department',
                                    select: '_id name',
                                })
                                .sort({ department: 1 })
                            // console.log(listStaffs)

                            XlsxPopulate.fromFileAsync(
                                path.resolve(
                                    __dirname,
                                    '../../../files/templates/excels/fnb_export_staff_salary.xlsx'
                                )
                            ).then(async (workbook) => {
                                // Danh sách nhân viên
                                var i = 4
                                listStaffs?.forEach((item, index) => {
                                    workbook
                                        .sheet(`NhanVien`)
                                        .row(i)
                                        .cell(1)
                                        .value(Number(index + 1))
                                    workbook
                                        .sheet(`NhanVien`)
                                        .row(i)
                                        .cell(2)
                                        .value(item.fullname)
                                    workbook
                                        .sheet(`NhanVien`)
                                        .row(i)
                                        .cell(3)
                                        .value(item?.department?.name)
                                    workbook
                                        .sheet(`NhanVien`)
                                        .row(i)
                                        .cell(6)
                                        .value(`${item._id}`)
                                    i++
                                })

                                // Doanh số cá nhân
                                var i = 3
                                listDataRevenue?.forEach((item, index) => {
                                    workbook
                                        .sheet(`DoanhSo`)
                                        .row(i)
                                        .cell(1)
                                        .value(Number(index + 1))
                                    workbook
                                        .sheet(`DoanhSo`)
                                        .row(i)
                                        .cell(2)
                                        .value(item._id.staff.fullname)
                                    workbook
                                        .sheet(`DoanhSo`)
                                        .row(i)
                                        .cell(3)
                                        .value(item._id.staff?.department?.name)
                                    workbook
                                        .sheet(`DoanhSo`)
                                        .row(i)
                                        .cell(4)
                                        .value(Number(item._id.month))
                                    workbook
                                        .sheet(`DoanhSo`)
                                        .row(i)
                                        .cell(5)
                                        .value(Number(item.number))
                                    workbook
                                        .sheet(`DoanhSo`)
                                        .row(i)
                                        .cell(6)
                                        .value(Number(item.avgTotalPerStaff))
                                    workbook
                                        .sheet(`DoanhSo`)
                                        .row(i)
                                        .cell(7)
                                        .value(`${item._id.staff._id}`)
                                    i++
                                })

                                // Thưởng phạt
                                var i = 3
                                listDataErr?.forEach((item, index) => {
                                    workbook
                                        .sheet(`ThuongPhat`)
                                        .row(i)
                                        .cell(1)
                                        .value(Number(index + 1))
                                    workbook
                                        .sheet(`ThuongPhat`)
                                        .row(i)
                                        .cell(2)
                                        .value(item._id.executor.fullname)
                                    workbook
                                        .sheet(`ThuongPhat`)
                                        .row(i)
                                        .cell(3)
                                        .value(
                                            item._id.executor.department.name
                                        )
                                    workbook
                                        .sheet(`ThuongPhat`)
                                        .row(i)
                                        .cell(4)
                                        .value(Number(item._id.month))
                                    workbook
                                        .sheet(`ThuongPhat`)
                                        .row(i)
                                        .cell(5)
                                        .value(Number(item.number))
                                    workbook
                                        .sheet(`ThuongPhat`)
                                        .row(i)
                                        .cell(7)
                                        .value(Number(item.amount))
                                    workbook
                                        .sheet(`ThuongPhat`)
                                        .row(i)
                                        .cell(8)
                                        .value(`${item._id.executor._id}`)
                                    i++
                                })

                                // Bảng chấm công theo tháng
                                for (var m = 1; m <= 12; m++) {
                                    workbook
                                        .sheet(`T${m}`)
                                        .row(1)
                                        .cell(5)
                                        .value(Number(yearFilter)) //

                                    var i = 4
                                    listStaffs?.forEach((item, index) => {
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(1)
                                            .value(Number(index + 1))
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(2)
                                            .value(item.fullname)
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(3)
                                            .value(item?.department?.name)
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(19)
                                            .value(`${item._id}`)
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(20)
                                            .value(`${item?.department?._id}`)
                                        i++
                                    })
                                }

                                listDataTimesheet1?.forEach((item, index) => {
                                    for (var m = 1; m <= 12; m++) {
                                        if (
                                            Number(item._id.month) === Number(m)
                                        ) {
                                            for (
                                                let i = 4;
                                                i <=
                                                Number(listStaffs.length + 3);
                                                i++
                                            ) {
                                                let staffID = workbook
                                                    .sheet(`T${m}`)
                                                    .row(i)
                                                    .cell(19)
                                                    .value()

                                                if (
                                                    item._id.staff.toString() ===
                                                    staffID.toString()
                                                ) {
                                                    workbook
                                                        .sheet(`T${m}`)
                                                        .row(i)
                                                        .cell(6)
                                                        .value(
                                                            item.workingHours
                                                        )
                                                }
                                            }
                                        }
                                    }
                                })

                                listDataTimesheet2?.forEach((item, index) => {
                                    for (var m = 1; m <= 12; m++) {
                                        if (
                                            Number(item._id.month) === Number(m)
                                        ) {
                                            for (
                                                let i = 4;
                                                i <=
                                                Number(listStaffs.length + 3);
                                                i++
                                            ) {
                                                let staffID = workbook
                                                    .sheet(`T${m}`)
                                                    .row(i)
                                                    .cell(19)
                                                    .value()

                                                if (
                                                    item._id.staff.toString() ===
                                                    staffID.toString()
                                                ) {
                                                    let timesheet =
                                                        workbook
                                                            .sheet(`T${m}`)
                                                            .row(i)
                                                            .cell(6)
                                                            .value() | 0

                                                    workbook
                                                        .sheet(`T${m}`)
                                                        .row(i)
                                                        .cell(6)
                                                        .value(
                                                            Number(timesheet) +
                                                                Number(
                                                                    item.subWorkingHours
                                                                )
                                                        )
                                                }
                                            }
                                        }
                                    }
                                })

                                const now = new Date()
                                const filePath =
                                    '../../../files/temporary_uploads/'
                                const fileName = `TongHopBangLuong_${now.getTime()}.xlsx`
                                const pathWriteFile = path.resolve(
                                    __dirname,
                                    filePath,
                                    fileName
                                )

                                await workbook.toFileAsync(pathWriteFile)
                                const result = await uploadFileS3(
                                    pathWriteFile,
                                    fileName
                                )

                                fs.unlinkSync(pathWriteFile)
                                return resolve({
                                    error: false,
                                    data: result?.Location,
                                    status: 200,
                                })
                            })
                        } else {
                            return resolve({
                                error: true,
                                message: 'Bạn không có quyền',
                                status: 500,
                            })
                        }
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
     * Dev: HiepNH
     * Func: Tải Báo cáo doanh số
     * Date: 15/1/2023
     */
    exportExcel2({
        option,
        email,
        companyID,
        fundaID,
        fromDate,
        toDate,
        month,
        year,
        userID,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (
                    FNB_ACC.cskh.includes(email.toString()) ||
                    FNB_ACC.man.includes(email.toString())
                ) {
                    if (!option) {
                        if (fundaID) {
                            let infoFunda = await ITEM__FUNDA_COLL.findById(
                                fundaID
                            )
                                .select('_id name sign company')
                                .populate({
                                    path: 'company',
                                    select: 'name sign',
                                })

                            let yearFilter
                            let currentYear = new Date().getFullYear()
                            if (year && !isNaN(year)) {
                                yearFilter = Number(year)
                            } else {
                                yearFilter = Number(currentYear)
                            }

                            // Modify the workbook.
                            XlsxPopulate.fromFileAsync(
                                path.resolve(
                                    __dirname,
                                    '../../../files/templates/excels/fnb_shift_export_revenue.xlsx'
                                )
                            ).then(async (workbook) => {
                                // workbook.sheet("Timesheet").row(2).cell(1).value(`Điểm bán: ${infoFunda.name}`);

                                const now = new Date()
                                const filePath =
                                    '../../../files/temporary_uploads/'
                                const fileName = `${infoFunda.company.sign}.${infoFunda.sign}-BaoCaoDoanhSo_${now.getTime()}.xlsx`
                                const pathWriteFile = path.resolve(
                                    __dirname,
                                    filePath,
                                    fileName
                                )

                                await workbook.toFileAsync(pathWriteFile)
                                const result = await uploadFileS3(
                                    pathWriteFile,
                                    fileName
                                )

                                fs.unlinkSync(pathWriteFile)
                                return resolve({
                                    error: false,
                                    data: result?.Location,
                                    status: 200,
                                })
                            })
                        } else {
                            let yearFilter
                            let currentYear = new Date().getFullYear()
                            if (year && !isNaN(year)) {
                                yearFilter = Number(year)
                            } else {
                                yearFilter = Number(currentYear)
                            }

                            // Modify the workbook.
                            XlsxPopulate.fromFileAsync(
                                path.resolve(
                                    __dirname,
                                    '../../../files/templates/excels/fnb_shift_export_revenue.xlsx'
                                )
                            ).then(async (workbook) => {
                                var i = workbook
                                    .sheet(`Data`)
                                    .row(3)
                                    .cell(3)
                                    .value(infoFunda?.trainStaffSalar)

                                const now = new Date()
                                const filePath =
                                    '../../../files/temporary_uploads/'
                                const fileName = `TongHopBaoCaoDoanhSo_${now.getTime()}.xlsx`
                                const pathWriteFile = path.resolve(
                                    __dirname,
                                    filePath,
                                    fileName
                                )

                                await workbook.toFileAsync(pathWriteFile)
                                const result = await uploadFileS3(
                                    pathWriteFile,
                                    fileName
                                )

                                fs.unlinkSync(pathWriteFile)
                                return resolve({
                                    error: false,
                                    data: result?.Location,
                                    status: 200,
                                })
                            })
                        }
                    } else {
                        if (option == 1) {
                            // console.log('==========12345=============')
                            // let conditionObj = { company: companyID, shiftType: 3, workingHours: { $gt: 5.5 }}
                            let conditionObj = {}
                            conditionObj.$and = [
                                {
                                    company: companyID,
                                },
                                {
                                    $or: [
                                        {
                                            shiftType: 1,
                                            workingHours: { $gt: 5 },
                                        }, // Ca sáng,
                                        {
                                            shiftType: 2,
                                            workingHours: { $gt: 5 },
                                        }, // Ca chiều,
                                        {
                                            shiftType: 3,
                                            workingHours: { $gt: 5.5 },
                                        }, // Ca tối
                                    ],
                                },
                            ]
                            // console.log(conditionObj)

                            let listData = await FNB_SHIFT_COLL.find(
                                conditionObj
                            )
                                .select(
                                    '_id shiftType name funda workingHours subWorkingHours createAt staffs subStaffs note'
                                )
                                .populate({
                                    path: 'funda',
                                    select: '_id name',
                                })
                                .limit(500)
                                .sort({ funda: -1, createAt: -1 })
                            // console.log(listData)

                            XlsxPopulate.fromFileAsync(
                                path.resolve(
                                    __dirname,
                                    '../../../files/templates/excels/fnb_shift_export_bug.xlsx'
                                )
                            ).then(async (workbook) => {
                                var i = 3
                                listData?.forEach((item, index) => {
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(1)
                                        .value(Number(index + 1))
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(2)
                                        .value(item?.createAt)
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(3)
                                        .value(item?.name)
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(4)
                                        .value(item?.shiftType)
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(5)
                                        .value(item?.funda.name)
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(6)
                                        .value(item?.workingHours)
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(7)
                                        .value(item?.staffs?.length)
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(8)
                                        .value(item?.subWorkingHours)
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(9)
                                        .value(item?.subStaffs?.length)
                                    workbook
                                        .sheet(`Data`)
                                        .row(i)
                                        .cell(10)
                                        .value(item?.note)
                                    i++
                                })

                                const now = new Date()
                                const filePath =
                                    '../../../files/temporary_uploads/'
                                const fileName = `BaoCaoBatThuong_${now.getTime()}.xlsx`
                                const pathWriteFile = path.resolve(
                                    __dirname,
                                    filePath,
                                    fileName
                                )

                                await workbook.toFileAsync(pathWriteFile)
                                const result = await uploadFileS3(
                                    pathWriteFile,
                                    fileName
                                )

                                fs.unlinkSync(pathWriteFile)
                                return resolve({
                                    error: false,
                                    data: result?.Location,
                                    status: 200,
                                })
                            })
                        }
                    }
                } else {
                    return resolve({
                        error: true,
                        message: 'Bạn không có quyền',
                        status: 500,
                    })
                }
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
