'use strict'

/**
 * EXTERNAL PACKAGE
 */
const ObjectID = require('mongoose').Types.ObjectId
const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { uploadFileS3 } = require('../../../tools/s3')

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
    CF_ACTIONS_BUDGET,
} = require('../../budget/helper/budget.actions-constant')
const {
    CF_ACTIONS_ANALYSIS,
} = require('../../analysis/helper/analysis.actions-constant')

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const {
    checkObjectIDs,
    _isValid,
    IsJsonString,
} = require('../../../tools/utils/utils')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys/index')
const { VOUCHER_TYPES } = require('../helper/accounting.keys-constant')

/**
 * COLLECTIONS
 */
const ITEM_ACCOUNT_COLL = require('../../item/database/item.account-coll')
const ITEM__GOODS_COLL = require('../../item/database/item.goods-coll')
const ITEM__CONTACT_COLL = require('../../item/database/item.contact-coll')
const FINANCIAL_VOUCHER_COLL = require('../database/accounting.financial_voucher-coll')
const FINANCIAL_GENERAL_JOURNAL_COLL = require('../database/accounting.financial_general_journal-coll')
const BUDGET_WORK_COLL = require('../../budget/database/budget.work-coll')

/**
 * MODELS
 */
const ACCOUNT_MODEL =
    require('../.../../../item/model/item.account-model').MODEL
const AUTH__APP_USER = require('../.../../../auth/model/auth.app_users').MODEL

let dataTF = {
    appID: '61e049aefdebf77b072d1b12', // ACCOUNTING
    menuID: '623f1f49e998e94feda0cd74', //
    type: 1,
    action: 1, // Xem
}
let dataTF2 = {
    appID: '61e049aefdebf77b072d1b12', // ACCOUNTING
    menuID: '623f1f49e998e94feda0cd74', //
    type: 1,
    action: 2, // Thêm
}

class Model extends BaseModel {
    constructor() {
        super(FINANCIAL_GENERAL_JOURNAL_COLL)
    }

    /**
     * Name: Insert
     * Code: Hiepnh
     * Date: 9/4/2022
     */
    insert({
        authorID,
        companyID,
        fundaID,
        voucherID,
        date,
        forward,
        forwardIs,
        returning,
        advancePayment,
        cancel,
        vat,
        type,
        source,
        orderNew,
        pricePolicy,
        debit,
        credit,
        customerDebit,
        customerCredit,
        updown,
        quantity,
        unitprice,
        amount,
        fcuExRate,
        fcuAmount,
        goods,
        warehouse,
        contract,
        project,
        budgetWork,
        subtype,
        parentSubtype,
        note,
        ctx,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * VALIDATE DỮ LIỆU
                 * 1-Kiểm tra ObjectID
                 * 2-Kiểm tra Danh mục thuộc công ty
                 * 3-Kiểm tra khác
                 */
                if (
                    !checkObjectIDs([
                        authorID,
                        companyID,
                        fundaID,
                        voucherID,
                        customerDebit,
                        customerCredit,
                    ])
                )
                    return {
                        error: true,
                        message: 'params_invalid',
                        status: 400,
                    }

                // Kiểm tra để đảm bảo "debit, credit, customerDebit, customerCredit, goods, warehouse, contract" thuộc companyID

                // Kiểm tra check trùng tài khoản đối ứng
                if (debit && credit && debit.toString() === credit.toString())
                    return resolve({
                        error: false,
                        message: 'debit/credit is duplicated',
                        status: 400,
                    })

                // Lấy thông tin của hợp đồng => Gán kèm dự án

                /**
                 * Lấy đơn giá sản phẩm (sau fix phía FE)
                 */
                let unitpriceNew = 0,
                    amountNew = 0
                if (goods && Number(unitprice) == 0) {
                    // console.log('===========================')
                    let infoWoods = await ITEM__GOODS_COLL.findById(
                        goods
                    ).select('unitprice sellingUnitprice')

                    // Phiếu nhập
                    if (type == 4) {
                        if (infoWoods && infoWoods.unitprice) {
                            unitpriceNew = Number(infoWoods.unitprice)
                            amountNew = Number(quantity * unitpriceNew)
                        }
                    }

                    // Phiếu xuất
                    if (type == 5) {
                        if (infoWoods && infoWoods.sellingUnitprice) {
                            unitpriceNew = Number(infoWoods.sellingUnitprice)
                            amountNew = Number(quantity * unitpriceNew)
                        }
                    }
                } else {
                    unitpriceNew = unitprice
                    amountNew = amount
                }

                // TẠO CHI TIẾT CHỨNG TỪ
                const dataInsert = {
                    userCreate: authorID,
                    company: companyID,
                    funda: fundaID,
                    voucher: voucherID,
                    date,
                    forward,
                    forwardIs,
                    returning,
                    advancePayment,
                    cancel,
                    vat,
                    type,
                    source,
                    orderNew,
                    pricePolicy,
                    debit,
                    credit,
                    customerDebit,
                    customerCredit,
                    updown,
                    quantity,
                    unitprice: unitpriceNew,
                    amount: amountNew,
                    fcuExRate,
                    fcuAmount,
                    goods,
                    warehouse,
                    contract,
                    project,
                    budgetWork,
                    subtype,
                    parentSubtype,
                    note,
                }

                /**
                 * GÁN MÃ NGÂN SÁCH
                 */
                let budget, budgetItem, budgetGroup
                if (budgetWork && _isValid(budgetWork)) {
                    let infoWork = await BUDGET_WORK_COLL.findById(budgetWork)

                    if (infoWork) {
                        if (infoWork.budget) {
                            budget = infoWork.budget
                            dataInsert.budget = infoWork.budget
                        }
                        if (infoWork.item) {
                            budgetItem = infoWork.item
                            dataInsert.budgetItem = infoWork.item
                        }
                        if (infoWork.group) {
                            budgetGroup = infoWork.group
                            dataInsert.budgetGroup = infoWork.group
                        }
                    }
                }

                let infoAfterInsert = await that.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm bút toán thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                        status: 403,
                    })

                /**
                 * Cập nhật cho mảng phần tử của phiếu
                 */
                await FINANCIAL_VOUCHER_COLL.findByIdAndUpdate(
                    voucherID,
                    {
                        $addToSet: { journals: infoAfterInsert._id },
                    },
                    { new: true }
                )

                /**
                 * CẬP NHẬT LẠI THÔNG TIN NGÂN SÁCH
                 * (CẦN PHẢI XÓA ĐI KHI UPDATE journals SANG JOB MỚI)
                 * 1. Cập nhật ngân sách công việc
                 * 2. Cập nhật ngân sách Nhóm
                 * 3. Cập nhật ngân sách Hạng mục
                 * 4. Cập nhật ngân sách Tổng
                 */
                if (budgetWork && _isValid(budgetWork)) {
                    // Cập nhật Công việc ngân sách đã thực hiện
                    let infoBudgetWork = await ctx.call(
                        `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_UPDATE_VALUE}`,
                        {
                            option: 2,
                            workID: `${budgetWork}`,
                        }
                    )
                    // console.log('1. Update Budget Work==========================>>>>>')
                    // console.log(infoBudgetWork)

                    if (infoBudgetWork) {
                        // Cập nhật Nhóm ngân sách đã thực hiện
                        let infoBudgetGroup = await ctx.call(
                            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_GROUP_UPDATE_VALUE}`,
                            {
                                option: 2,
                                groupID: `${budgetGroup}`,
                            }
                        )

                        // console.log('2. Update Budget Group==========================>>>>>')
                        // console.log(infoBudgetGroup)

                        if (infoBudgetGroup) {
                            // Cập nhật Hạng mục ngân sách đã thực hiện
                            let infoBudgetItem = await ctx.call(
                                `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_ITEM_UPDATE_VALUE}`,
                                {
                                    option: 2,
                                    itemID: `${budgetItem}`,
                                }
                            )

                            // console.log('3. Update Budget Item==========================>>>>>')
                            // console.log(infoBudgetItem)

                            if (infoBudgetItem) {
                                // Cập nhật Ngân sách đã thực hiện
                                let infoBudget = await ctx.call(
                                    `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_UPDATE_VALUE}`,
                                    {
                                        option: 2,
                                        budgetID: `${budget}`,
                                    }
                                )

                                // console.log('4. Update Budget==========================>>>>>')
                                // console.log(infoBudget)
                            }
                        }
                    }
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
     * Code: Hiepnh
     * Date: 9/4/2022
     */
    update({
        authorID,
        journalID,
        fundaID,
        date,
        forward,
        forwardIs,
        returning,
        advancePayment,
        cancel,
        vat,
        type,
        source,
        orderNew,
        pricePolicy,
        debit,
        credit,
        customerDebit,
        customerCredit,
        updown,
        quantity,
        unitprice,
        amount,
        fcuExRate,
        fcuAmount,
        goods,
        warehouse,
        contract,
        project,
        budgetWork,
        subtype,
        parentSubtype,
        note,
        ctx,
    }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * VALIDATE DỮ LIỆU
                 * 1-Kiểm tra ObjectID
                 * 2-Kiểm tra Danh mục thuộc công ty
                 * 3-Kiểm tra khác
                 */
                if (
                    !checkObjectIDs([
                        authorID,
                        journalID,
                        customerDebit,
                        customerCredit,
                        fundaID,
                    ])
                )
                    return {
                        error: true,
                        message: 'params_invalid',
                        status: 400,
                    }

                // Kiểm tra để đảm bảo "debit, credit, customerDebit, customerCredit, goods, warehouse, contract" thuộc companyID

                // Kiểm tra check trùng tài khoản đối ứng
                if (debit && credit && debit.toString() === credit.toString())
                    return resolve({
                        error: false,
                        message: 'debit/credit is duplicated',
                        status: 400,
                    })

                let infoJournal =
                    await FINANCIAL_GENERAL_JOURNAL_COLL.findById(journalID)
                if (!infoJournal)
                    return resolve({
                        error: false,
                        message: 'finacial_journal_exit',
                        status: 400,
                    })

                let voucherID = infoJournal.voucher

                /**
                 * CẬP NHẬT CHI TIẾT CHỨNG TỪ
                 */
                const dataUpdate = {
                    userUpdate: authorID,
                    funda: fundaID,
                    date,
                    forward,
                    forwardIs,
                    returning,
                    advancePayment,
                    cancel,
                    vat,
                    type,
                    source,
                    orderNew,
                    pricePolicy,
                    debit,
                    credit,
                    customerDebit,
                    customerCredit,
                    updown,
                    quantity,
                    unitprice,
                    amount,
                    fcuExRate,
                    fcuAmount,
                    goods,
                    warehouse,
                    contract,
                    project,
                    budgetWork,
                    subtype,
                    parentSubtype,
                    note,
                }

                /**
                 * LẤY THÔNG TIN NGÂN SÁCH CŨ
                 */
                let budgetOld, budgetItemOld, budgetGroupOld, budgetWorkOld
                if (infoJournal.budgetWork) {
                    budgetOld = infoJournal.budget
                    budgetItemOld = infoJournal.budgetItem
                    budgetGroupOld = infoJournal.budgetGroup
                    budgetWorkOld = infoJournal.budgetWork
                }

                /**
                 * GÁN MÃ NGÂN SÁCH: MỚI VÀ CŨ
                 */
                let budget, budgetItem, budgetGroup
                if (budgetWork && _isValid(budgetWork)) {
                    let infoWork = await BUDGET_WORK_COLL.findById(budgetWork)

                    if (infoWork) {
                        if (infoWork.budget) {
                            budget = infoWork.budget
                            dataUpdate.budget = infoWork.budget
                        }
                        if (infoWork.item) {
                            budgetItem = infoWork.item
                            dataUpdate.budgetItem = infoWork.item
                        }
                        if (infoWork.group) {
                            budgetGroup = infoWork.group
                            dataUpdate.budgetGroup = infoWork.group
                        }
                    }
                }

                let infoAfterUpdate =
                    await FINANCIAL_GENERAL_JOURNAL_COLL.findByIdAndUpdate(
                        journalID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'cannot_update',
                        status: 400,
                    })

                /**
                 * CẬP NHẬT LẠI THÔNG TIN NGÂN SÁCH
                 * (CẦN PHẢI XÓA ĐI KHI UPDATE journals SANG JOB MỚI)
                 * 1. Cập nhật ngân sách công việc
                 * 2. Cập nhật ngân sách Nhóm
                 * 3. Cập nhật ngân sách Hạng mục
                 * 4. Cập nhật ngân sách Tổng
                 */
                // Ngân sách mới
                if (budgetWork && _isValid(budgetWork)) {
                    // console.log('===================CẬP NHẬT NGÂN SÁCH MỚI===================')
                    // console.log({ budgetWork, budgetGroup, budgetItem, budget })

                    let infoBudgetWork = await ctx.call(
                        `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_UPDATE_VALUE}`,
                        {
                            option: 2,
                            workID: `${budgetWork}`,
                        }
                    )
                    // console.log('1. Update Budget Work==========================>>>>>')
                    // console.log(infoBudgetWork)

                    if (infoBudgetWork) {
                        let infoBudgetGroup = await ctx.call(
                            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_GROUP_UPDATE_VALUE}`,
                            {
                                option: 2,
                                groupID: `${budgetGroup}`,
                            }
                        )

                        // console.log('2. Update Budget Group==========================>>>>>')
                        // console.log(infoBudgetGroup)

                        if (infoBudgetGroup) {
                            let infoBudgetItem = await ctx.call(
                                `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_ITEM_UPDATE_VALUE}`,
                                {
                                    option: 2,
                                    itemID: `${budgetItem}`,
                                }
                            )

                            // console.log('3. Update Budget Item==========================>>>>>')
                            // console.log(infoBudgetItem)

                            if (infoBudgetItem) {
                                let infoBudget = await ctx.call(
                                    `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_UPDATE_VALUE}`,
                                    {
                                        option: 2,
                                        budgetID: `${budget}`,
                                    }
                                )

                                // console.log('4. Update Budget==========================>>>>>')
                                // console.log(infoBudget)
                            }
                        }
                    }
                }

                // Ngân sách cũ
                if (budgetWorkOld && _isValid(budgetWorkOld)) {
                    // console.log('===================CẬP NHẬT NGÂN SÁCH CŨ===================')
                    // console.log({ budgetWorkOld, budgetGroupOld, budgetItemOld, budgetOld })
                    let infoBudgetWorkOld = await ctx.call(
                        `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_UPDATE_VALUE}`,
                        {
                            option: 2,
                            workID: `${budgetWorkOld}`,
                        }
                    )
                    // console.log('1. Update Budget Work Old==========================>>>>>')
                    // console.log(infoBudgetWorkOld)

                    if (infoBudgetWorkOld) {
                        let infoBudgetGroupOld = await ctx.call(
                            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_GROUP_UPDATE_VALUE}`,
                            {
                                option: 2,
                                groupID: `${budgetGroupOld}`,
                            }
                        )

                        // console.log('2. Update Budget Group Old==========================>>>>>')
                        // console.log(infoBudgetGroupOld)

                        if (infoBudgetGroupOld) {
                            let infoBudgetItemOld = await ctx.call(
                                `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_ITEM_UPDATE_VALUE}`,
                                {
                                    option: 2,
                                    itemID: `${budgetItemOld}`,
                                }
                            )

                            // console.log('3. Update Budget Item Old==========================>>>>>')
                            // console.log(infoBudgetItemOld)

                            if (infoBudgetItemOld) {
                                let infoBudgetOld = await ctx.call(
                                    `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_UPDATE_VALUE}`,
                                    {
                                        option: 2,
                                        budgetID: `${budgetOld}`,
                                    }
                                )

                                // console.log('4. Update Budget Old==========================>>>>>')
                                // console.log(infoBudgetOld)
                            }
                        }
                    }
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
     * Name  : Tổng hợp ngân sách đã thực hiện
     * Code: Hiepnh
     * Date  : 10/4/2022
     */
    calImpleBudget({ workID, groupID, itemID, budgetID }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Tổng hợp ngân sách đã thực hiện của công việc-budgetWork
                 * 2-Tổng hợp ngân sách đã thực hiện của nhóm-budgetGroup
                 * 3-Tổng hợp ngân sách đã thực hiện của hạng mục-budgetItem
                 * 4-Tổng hợp ngân sách đã thực hiện của ngân sách-budget
                 */
                let dataBudget = {
                    quantity: 0,
                    amount: 0,
                }

                let conditionObjUp = { updown: 1 }
                let conditionObjDown = { updown: -1 }

                if (workID) {
                    conditionObjUp.budgetWork = ObjectID(workID)
                    conditionObjDown.budgetWork = ObjectID(workID)
                }
                if (groupID) {
                    conditionObjUp.budgetGroup = ObjectID(groupID)
                    conditionObjDown.budgetGroup = ObjectID(groupID)
                }
                if (itemID) {
                    conditionObjUp.budgetItem = ObjectID(itemID)
                    conditionObjDown.budgetItem = ObjectID(itemID)
                }
                if (budgetID) {
                    conditionObjUp.budget = ObjectID(budgetID)
                    conditionObjDown.budget = ObjectID(budgetID)
                }

                // Dữ liệu tăng ngân sách thực hiện
                let listDataUp = await FINANCIAL_GENERAL_JOURNAL_COLL.aggregate(
                    [
                        {
                            $match: conditionObjUp,
                        },
                        {
                            $group: {
                                _id: {},
                                quantity: { $sum: '$quantity' },
                                amount: { $sum: '$amount' },
                            },
                        },
                    ]
                )

                // Dữ liệu giảm ngân sách thực hiện
                let listDataDown =
                    await FINANCIAL_GENERAL_JOURNAL_COLL.aggregate([
                        {
                            $match: conditionObjDown,
                        },
                        {
                            $group: {
                                _id: {},
                                quantity: { $sum: '$quantity' },
                                amount: { $sum: '$amount' },
                            },
                        },
                    ])
                // console.log(conditionObjUp)
                // console.log(conditionObjDown)
                // console.log(listDataUp)
                // console.log(listDataDown)

                // Tổng hợp giá trị tăng, giảm
                if (listDataUp && listDataUp.length) {
                    dataBudget.quantity =
                        Number(dataBudget.quantity) +
                        Number(listDataUp[0].quantity)
                    dataBudget.amount =
                        Number(dataBudget.amount) + Number(listDataUp[0].amount)
                }

                if (listDataDown && listDataDown.length) {
                    dataBudget.quantity =
                        Number(dataBudget.quantity) -
                        Number(listDataDown[0].quantity)
                    dataBudget.amount =
                        Number(dataBudget.amount) -
                        Number(listDataDown[0].amount)
                }

                return resolve({ error: false, data: dataBudget, status: 200 })
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
     * Name: Info
     * Code: Hiepnh
     * Date: 9/4/2022
     */
    getInfo({ journalID, select, populates, ctx }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(journalID))
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

                let info = await FINANCIAL_GENERAL_JOURNAL_COLL.findById(
                    journalID
                )
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
     * Code: Hiepnh
     * Date: 9/4/2022
     */
    getList({
        option,
        companyID,
        fundaID,
        projectID,
        contractID,
        accountID,
        contactID,
        warehouseID,
        goodsID,
        voucherID,
        budgetID,
        budgetItemID,
        budgetGroupID,
        budgetWorkID,
        fromDate,
        toDate,
        forward,
        cancel,
        userID,
        contacts,
        keyword,
        limit = 50,
        lastestID,
        select,
        populates = {},
        sortKey,
        ctx,
    }) {
        // console.log('==========GET LIST JOURNAL============')
        // console.log({ option, companyID, fundaID, projectID, contractID, accountID, contactID, warehouseID, goodsID, voucherID, budgetID, budgetItemID, budgetGroupID, budgetWorkID, fromDate, toDate,  forward, cancel, userID, keyword, limit, lastestID, select, populates, contacts})
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                if (limit > 50) {
                    limit = 50
                } else {
                    limit = +limit
                }

                let conditionObj = {}
                let sortBy
                let keys = ['date__1', '_id__1']

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

                if (forward) {
                    conditionObj.forward = Number(forward)
                }

                if (cancel) {
                    conditionObj.cancel = Number(cancel)
                }

                if (fromDate && toDate) {
                    conditionObj.date = {
                        $gte: moment(fromDate).toDate(),
                        $lte: moment(toDate).toDate(),
                    }
                }

                if (fromDate && toDate) {
                    conditionObj.date = {
                        $gte: moment(fromDate).toDate(),
                        $lte: moment(toDate).toDate(),
                    }
                }

                if (checkObjectIDs(voucherID)) {
                    conditionObj.voucher = voucherID
                } else {
                    if (checkObjectIDs(contractID)) {
                        conditionObj.contract = contractID
                    } else {
                        if (checkObjectIDs(projectID)) {
                            conditionObj.project = projectID
                        } else {
                            if (checkObjectIDs(fundaID)) {
                                conditionObj.funda = fundaID
                            } else {
                                conditionObj.company = companyID
                            }
                        }
                    }
                }

                if (warehouseID && checkObjectIDs(warehouseID)) {
                    conditionObj.warehouse = ObjectID(warehouseID)
                }

                if (goodsID && checkObjectIDs(goodsID)) {
                    conditionObj.goods = ObjectID(goodsID)
                }

                /**
                 * THEO NGÂN SÁCH
                 */
                if (checkObjectIDs(budgetID)) {
                    conditionObj = {
                        budget: budgetID,
                    }
                }
                if (checkObjectIDs(budgetItemID)) {
                    conditionObj = {
                        budgetItem: budgetItemID,
                    }
                }
                if (checkObjectIDs(budgetGroupID)) {
                    conditionObj = {
                        budgetGroup: budgetGroupID,
                    }
                }
                if (checkObjectIDs(budgetWorkID)) {
                    conditionObj = {
                        budgetWork: budgetWorkID,
                    }
                }

                /**
                 * THEO TÀI KHOẢN
                 */
                if (checkObjectIDs(accountID) && checkObjectIDs(contactID)) {
                    // console.log('=================1111111111111111')
                    let arrObjectID = []
                    let infoAccount =
                        await ITEM_ACCOUNT_COLL.findById(accountID)
                    if (!infoAccount)
                        return resolve({
                            error: true,
                            message: 'cannot_get_account_info',
                        })

                    arrObjectID.push(accountID)
                    arrObjectID = [...arrObjectID, ...infoAccount.nestedChilds]
                    // console.log(arrObjectID)

                    conditionObj.$or = [
                        {
                            debit: { $in: arrObjectID },
                            customerDebit: contactID,
                        },
                        {
                            credit: { $in: arrObjectID },
                            customerCredit: contactID,
                        },
                    ]
                    // console.log(conditionObj)
                } else {
                    if (checkObjectIDs(accountID)) {
                        // console.log('=================22222222222222222')
                        let arrObjectID = []
                        let infoAccount =
                            await ITEM_ACCOUNT_COLL.findById(accountID)
                        if (!infoAccount)
                            return resolve({
                                error: true,
                                message: 'cannot_get_account_info',
                            })

                        arrObjectID.push(accountID)
                        arrObjectID = [
                            ...arrObjectID,
                            ...infoAccount.nestedChilds,
                        ]
                        // console.log(arrObjectID)

                        conditionObj.$or = [
                            {
                                debit: {
                                    $in: arrObjectID,
                                },
                            },
                            {
                                credit: {
                                    $in: arrObjectID,
                                },
                            },
                        ]
                        // console.log(conditionObj)
                    }

                    if (checkObjectIDs(contactID)) {
                        // console.log('=================333333333333333333333')
                        conditionObj.$or = [
                            { customerDebit: contactID },
                            { customerCredit: contactID },
                        ]
                        // console.log(conditionObj)
                    }
                }

                // Báo cáo theo Tài khoản-Mã khách
                if (option == 1) {
                    // console.log('=================1111111111111111')
                    let arrObjectID = []
                    let infoAccount =
                        await ITEM_ACCOUNT_COLL.findById(accountID)
                    if (!infoAccount)
                        return resolve({
                            error: true,
                            message: 'cannot_get_account_info',
                        })

                    arrObjectID.push(accountID)
                    arrObjectID = [...arrObjectID, ...infoAccount.nestedChilds]
                    // console.log(arrObjectID)

                    if (contacts) {
                        // console.log('=================1111111111111111_____11111111111')
                        conditionObj.$or = [
                            {
                                debit: { $in: arrObjectID },
                                customerDebit: {
                                    $in: contacts.map((item) =>
                                        ObjectID(item._id)
                                    ),
                                },
                            },
                            {
                                credit: { $in: arrObjectID },
                                customerCredit: {
                                    $in: contacts.map((item) =>
                                        ObjectID(item._id)
                                    ),
                                },
                            },
                        ]
                    } else {
                        // console.log('=================1111111111111111_____22222222222')
                        conditionObj.$or = [
                            {
                                debit: { $in: arrObjectID },
                                customerDebit: null,
                            },
                            {
                                credit: { $in: arrObjectID },
                                customerCredit: null,
                            },
                        ]
                    }
                    // console.log(conditionObj)
                }

                if (option == 2) {
                    // console.log('=================1111111111111111')
                    let arrObjectID = []
                    let infoAccount =
                        await ITEM_ACCOUNT_COLL.findById(accountID)
                    if (!infoAccount)
                        return resolve({
                            error: true,
                            message: 'cannot_get_account_info',
                        })

                    arrObjectID.push(accountID)
                    arrObjectID = [...arrObjectID, ...infoAccount.nestedChilds]
                    // console.log(arrObjectID)

                    conditionObj.$or = [
                        { debit: { $in: arrObjectID } },
                        { credit: { $in: arrObjectID } },
                    ]
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    let regExpSearch = RegExp(keyword, 'i')
                    conditionObj.name = regExpSearch
                }
                // console.log(conditionObj)

                let conditionObjOrg = { ...conditionObj }

                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await FINANCIAL_GENERAL_JOURNAL_COLL.findById(lastestID)
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

                let infoDataAfterGet =
                    await FINANCIAL_GENERAL_JOURNAL_COLL.find(conditionObj)
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
                    await FINANCIAL_GENERAL_JOURNAL_COLL.count(conditionObjOrg)
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
     * Name  : getListByProperty
     * Code: Hiepnh
     * Date  : 10/4/2022
     */
    getListByProperty({
        option,
        optionAccount,
        optionTerm,
        optionCal,
        arrAccNames,
        arrAccIDs,
        arrCompanyIDs,
        name,
        companyID,
        fundaID,
        projectID,
        contractID,
        contactID,
        warehouseID,
        goodsID,
        fromDate,
        toDate,
        userID,
        contacts,
        ctx,
    }) {
        // console.log('==================getListByProperty>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        // console.log({option, optionAccount, optionTerm, optionCal, arrAccNames, arrAccIDs, arrCompanyIDs, name, companyID, fundaID, projectID, contractID, contactID, warehouseID, goodsID, fromDate, toDate, userID, contacts})
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                /**
                 * BA
                 * Kỳ tra cứu: 30/5/2020 (fromDate) - 15/6/2020 (toDate) - Incurred
                 * Đầu kỳ: Tính từ 1/1 của năm tới ngày [fromDate]
                 * Cuối kỳ: Tính từ [fromDate] tới [toDate]
                 * 1. Lấy mảng chứa Tài khoản + Con cháu
                 * 2. Lấy năm của ngày đầu kỳ
                 * 3. Đầu kỳ = Kết chuyển cuối kỳ năm trước (31/12/2019) + Đầu năm nay đến ngày đầu kỳ (1/1/2020-30/5/2020)
                 */
                let conditionObj = {},
                    conditionDebitObj = {},
                    conditionCreditObj = {},
                    conditionProject = {}
                let conditionGroup = {},
                    conditionGroupDebit = {},
                    conditionGroupCredit = {}
                let conditionMatch = {},
                    conditionMatchO = {},
                    conditionMatchOF = {},
                    conditionMatchFT = {},
                    conditionMatchIn = {}
                let listDataO, listDataOF, listDataFT, listDataIn
                let conditionObjYear = {}
                let conditionPopulate = {}
                let sortBy = { amount: -1 }

                let arrObjectID = [],
                    listAccounts = []

                // Truyền theo ID tài khoản
                if (!optionAccount) {
                    // console.log('============zzzzzzzzzzzz1111111111111111111111')
                    listAccounts = await ITEM_ACCOUNT_COLL.find({
                        _id: { $in: arrAccIDs },
                    })
                    // .select('name description nestedChilds')
                    if (listAccounts) {
                        for (const item of listAccounts) {
                            arrObjectID.push(item._id)
                            arrObjectID = [...arrObjectID, ...item.nestedChilds]
                        }
                    }
                } else {
                    // Theo tên tài khoản
                    if (optionAccount == 1) {
                        if (!arrCompanyIDs) {
                            console.log(
                                '============zzzzzzzzzzzz2222222222222222222'
                            )
                            listAccounts = await ITEM_ACCOUNT_COLL.find({
                                company: companyID,
                                name: { $in: arrAccNames },
                            })
                            // .select('name description nestedChilds')
                            if (listAccounts) {
                                for (const item of listAccounts) {
                                    arrObjectID.push(item._id)
                                    arrObjectID = [
                                        ...arrObjectID,
                                        ...item.nestedChilds,
                                    ]
                                }
                            }
                        } else {
                            console.log(
                                '============zzzzzzzzzzzz333333333333333333'
                            )
                            listAccounts = await ITEM_ACCOUNT_COLL.find({
                                company: { $in: arrCompanyIDs },
                                name: { $in: arrAccNames },
                            })
                            // .select('name description nestedChilds')
                            if (listAccounts) {
                                for (const item of listAccounts) {
                                    arrObjectID.push(item._id)
                                    arrObjectID = [
                                        ...arrObjectID,
                                        ...item.nestedChilds,
                                    ]
                                }
                            }
                        }
                    }

                    // Theo toàn bộ tài khoản của công ty
                    if (optionAccount == 2) {
                        console.log(
                            '============zzzzzzzzzzzz4444444444444444444'
                        )
                        listAccounts = await ITEM_ACCOUNT_COLL.find({
                            company: companyID,
                        })
                        // .select('name description nestedChilds')
                        if (listAccounts) {
                            for (const item of listAccounts) {
                                arrObjectID.push(item._id)
                                arrObjectID = [
                                    ...arrObjectID,
                                    ...item.nestedChilds,
                                ]
                            }
                        }
                    }
                }
                // console.log(listAccounts)
                // console.log(arrObjectID)

                if (contractID && checkObjectIDs(contractID)) {
                    console.log('============1')
                    conditionDebitObj.contract = ObjectID(contractID)
                    conditionCreditObj.contract = ObjectID(contractID)
                } else {
                    if (projectID && checkObjectIDs(projectID)) {
                        console.log('============2')
                        conditionDebitObj.project = ObjectID(projectID)
                        conditionCreditObj.project = ObjectID(projectID)
                    } else {
                        if (fundaID && checkObjectIDs(fundaID)) {
                            console.log('============3')
                            conditionDebitObj.funda = ObjectID(fundaID)
                            conditionCreditObj.funda = ObjectID(fundaID)
                        } else {
                            if (
                                arrCompanyIDs &&
                                checkObjectIDs(arrCompanyIDs)
                            ) {
                                console.log('============4')
                                conditionDebitObj.company = {
                                    $in: arrCompanyIDs.map((item) =>
                                        ObjectID(item)
                                    ),
                                }
                                conditionCreditObj.company = {
                                    $in: arrCompanyIDs.map((item) =>
                                        ObjectID(item)
                                    ),
                                }
                            } else {
                                console.log('============5')
                                conditionDebitObj.company = ObjectID(companyID)
                                conditionCreditObj.company = ObjectID(companyID)
                            }
                        }
                    }
                }

                if (warehouseID && checkObjectIDs(warehouseID)) {
                    console.log('============6')
                    conditionDebitObj.warehouse = ObjectID(warehouseID)
                    conditionCreditObj.warehouse = ObjectID(warehouseID)
                }

                if (goodsID && checkObjectIDs(goodsID)) {
                    console.log('============7')
                    conditionDebitObj.goods = ObjectID(goodsID)
                    conditionCreditObj.goods = ObjectID(goodsID)
                }

                // console.log(conditionDebitObj)
                // console.log(conditionCreditObj)

                /**
                 * Lấy năm của ngày đầu kỳ
                 */
                let year = moment(fromDate).toDate().getFullYear()
                let firstDayOfYear = `${Number(year)}-01-01T00:00:00.000Z`

                conditionProject = {
                    forward: '$forward',
                    cancel: '$cancel',
                    year: { $year: '$date' },
                    amount: 1,
                }

                // Kết chuyển cuối kỳ năm trước sang đầu kỳ năm sau (Original)
                conditionMatchO = {
                    forward: 1,
                    cancel: 0,
                    year: Number(year),
                }

                // Từ đầu năm tới ngày đầu kỳ
                conditionMatchOF = {
                    forward: 0,
                    cancel: 0,
                    date: {
                        $gte: moment(firstDayOfYear).toDate(),
                        $lt: moment(fromDate).toDate(), // $lte (<=), $lt (<)
                    },
                }

                // Từ đầu kỳ tới cuối kỳ
                conditionMatchFT = {
                    forward: 0,
                    cancel: 0,
                    date: {
                        $gte: moment(fromDate).toDate(),
                        $lte: moment(toDate).toDate(),
                    },
                }

                // Từ đầu năm tới đầu kỳ***
                conditionMatchIn = {
                    forward: 0,
                    cancel: 0,
                    date: {
                        $gte: moment(firstDayOfYear).toDate(), // Tính từ firstDayOfYear | fromDate
                        $lte: moment(toDate).toDate(),
                    },
                }

                // Gom nhóm theo công ty -> Báo cáo tổng hợp mô hình công ty thành viên
                if (!arrCompanyIDs) {
                    conditionGroup = {
                        _id: {},
                        amount: { $sum: '$amount' },
                    }
                } else {
                    conditionGroup = {
                        _id: { company: '$company' },
                        amount: { $sum: '$amount' },
                    }
                }

                // 1 tài khoản - Không mã khách
                if (!option) {
                    conditionProject = {
                        year: { $year: '$date' },
                        forward: '$forward',
                        cancel: '$cancel',
                        date: 1,
                        amount: 1,
                    }

                    conditionDebitObj.debit = {
                        $in: arrObjectID,
                    }
                    conditionCreditObj.credit = {
                        $in: arrObjectID,
                    }

                    conditionGroupDebit = {
                        _id: {},
                        amount: { $sum: '$amount' },
                    }
                    conditionGroupCredit = {
                        _id: {},
                        amount: { $sum: '$amount' },
                    }
                } else {
                    // Nhiều tài khoản - Không mã khách
                    if (option == 1) {
                        conditionProject = {
                            year: { $year: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            amount: 1,
                            debit: 1,
                            credit: 1,
                        }

                        conditionDebitObj.debit = {
                            $in: arrObjectID,
                        }
                        conditionCreditObj.credit = {
                            $in: arrObjectID,
                        }

                        conditionGroupDebit = {
                            _id: { account: '$debit' },
                            amount: { $sum: '$amount' },
                        }
                        conditionGroupCredit = {
                            _id: { account: '$credit' },
                            amount: { $sum: '$amount' },
                        }
                    } else if (option == 2) {

                    /**
                     * BÁO CÁO TÀI KHOẢN - MÃ KHÁCH => ÁP DỤNG MOBILE
                     * 1 tài khoản - Nhiều mã khách
                     */
                        conditionProject = {
                            year: { $year: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            amount: 1,
                            customerDebit: 1,
                            customerCredit: 1,
                            debit: 1,
                            credit: 1,
                        }

                        conditionDebitObj.debit = {
                            $in: arrObjectID,
                        }
                        conditionCreditObj.credit = {
                            $in: arrObjectID,
                        }

                        conditionGroupDebit = {
                            _id: { contact: '$customerDebit' },
                            amount: { $sum: '$amount' },
                        }
                        conditionGroupCredit = {
                            _id: { contact: '$customerCredit' },
                            amount: { $sum: '$amount' },
                        }
                    }

                    // Báo cáo theo Tài khoản - Mã khách (quan hệ 1-1)
                    else if (option == 3) {
                        conditionDebitObj.debit = {
                            $in: arrObjectID,
                        }
                        conditionCreditObj.credit = {
                            $in: arrObjectID,
                        }

                        if (contactID && checkObjectIDs(contactID)) {
                            conditionDebitObj.customerDebit =
                                ObjectID(contactID)
                            conditionCreditObj.customerCredit =
                                ObjectID(contactID)
                        }

                        conditionProject = {
                            year: { $year: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            amount: 1,
                            customerDebit: 1,
                            customerCredit: 1,
                            debit: 1,
                            credit: 1,
                        }

                        conditionGroupDebit = {
                            _id: {},
                            amount: { $sum: '$amount' },
                        }

                        conditionGroupCredit = {
                            _id: {},
                            amount: { $sum: '$amount' },
                        }
                    }

                    // Báo cáo Bảng cân đối tài khoản
                    else if (option == 4) {
                        if (optionAccount == 1) {
                            conditionDebitObj.debit = {
                                $in: arrObjectID,
                            }
                            conditionCreditObj.credit = {
                                $in: arrObjectID,
                            }
                        }

                        conditionProject = {
                            year: { $year: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            amount: 1,
                            debit: 1,
                            credit: 1,
                        }

                        conditionGroupDebit = {
                            _id: { account: '$debit' },
                            amount: { $sum: '$amount' },
                        }
                        conditionGroupCredit = {
                            _id: { account: '$credit' },
                            amount: { $sum: '$amount' },
                        }
                    }

                    // Công nợ userID đang truy cập - Tổng hợp theo từng công ty
                    else if (option == 5) {
                        conditionDebitObj.debit = {
                            $in: arrObjectID,
                        }
                        conditionCreditObj.credit = {
                            $in: arrObjectID,
                        }

                        if (contacts) {
                            conditionDebitObj.customerDebit = {
                                $in: contacts.map((item) => ObjectID(item._id)),
                            }
                            conditionCreditObj.customerCredit = {
                                $in: contacts.map((item) => ObjectID(item._id)),
                            }
                        } else {
                            conditionDebitObj.customerDebit = null
                            conditionCreditObj.customerCredit = null
                        }

                        conditionProject = {
                            company: 1,
                            year: { $year: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            amount: 1,
                            debit: 1,
                            credit: 1,
                            customerDebit: 1,
                            customerCredit: 1,
                        }

                        conditionGroupDebit = {
                            _id: { company: '$company', account: '$debit' },
                            amount: { $sum: '$amount' },
                        }
                        conditionGroupCredit = {
                            _id: { company: '$company', account: '$credit' },
                            amount: { $sum: '$amount' },
                        }
                    }

                    // Công nợ userID đang truy cập
                    else if (option == 6) {
                        conditionDebitObj.debit = {
                            $in: arrObjectID,
                        }
                        conditionCreditObj.credit = {
                            $in: arrObjectID,
                        }

                        if (contacts) {
                            conditionDebitObj.customerDebit = {
                                $in: contacts.map((item) => ObjectID(item._id)),
                            }
                            conditionCreditObj.customerCredit = {
                                $in: contacts.map((item) => ObjectID(item._id)),
                            }
                        } else {
                            conditionDebitObj.customerDebit = { $in: [] }
                            conditionCreditObj.customerCredit = { $in: [] }
                        }

                        conditionProject = {
                            year: { $year: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            amount: 1,
                            customerDebit: 1,
                            customerCredit: 1,
                            debit: 1,
                            credit: 1,
                        }

                        conditionGroupDebit = {
                            _id: {},
                            amount: { $sum: '$amount' },
                        }

                        conditionGroupCredit = {
                            _id: {},
                            amount: { $sum: '$amount' },
                        }
                    }

                    // Tổng hợp Tài khoản-Tháng
                    else if (option == 7) {
                        conditionProject = {
                            year: { $year: '$date' },
                            month: { $month: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            amount: 1,
                        }

                        conditionDebitObj.debit = {
                            $in: arrObjectID,
                        }
                        conditionCreditObj.credit = {
                            $in: arrObjectID,
                        }

                        conditionGroupDebit = {
                            _id: { month: '$month' },
                            amount: { $sum: '$amount' },
                        }
                        conditionGroupCredit = {
                            _id: { month: '$month' },
                            amount: { $sum: '$amount' },
                        }
                    }

                    // Tổng hợp Khoản mục phí
                    else if (option == 8) {
                        conditionProject = {
                            year: { $year: '$date' },
                            month: { $month: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            amount: 1,
                            subtype: 1,
                        }

                        conditionDebitObj.debit = {
                            $in: arrObjectID,
                        }
                        conditionCreditObj.credit = {
                            $in: arrObjectID,
                        }

                        conditionGroupDebit = {
                            _id: { subtype: '$subtype' },
                            amount: { $sum: '$amount' },
                        }
                        conditionGroupCredit = {
                            _id: { subtype: '$subtype' },
                            amount: { $sum: '$amount' },
                        }
                    }

                    // Tổng hợp theo Sản phẩm
                    else if (option == 9) {
                        conditionProject = {
                            year: { $year: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            quantity: 1,
                            amount: 1,
                            goods: 1,
                            warehouse: 1,
                            debit: 1,
                            credit: 1,
                        }

                        conditionDebitObj.debit = {
                            $in: arrObjectID,
                        }
                        conditionCreditObj.credit = {
                            $in: arrObjectID,
                        }

                        conditionGroupDebit = {
                            _id: { goods: '$goods' },
                            quantity: { $sum: '$quantity' },
                            amount: { $sum: '$amount' },
                        }
                        conditionGroupCredit = {
                            _id: { goods: '$goods' },
                            quantity: { $sum: '$quantity' },
                            amount: { $sum: '$amount' },
                        }
                    }

                    // Tổng hợp theo Mã khách
                    else if (option == 10) {
                        conditionProject = {
                            year: { $year: '$date' },
                            forward: '$forward',
                            cancel: '$cancel',
                            date: 1,
                            quantity: 1,
                            amount: 1,
                            customerDebit: 1,
                            customerCredit: 1,
                            debit: 1,
                            credit: 1,
                        }

                        conditionDebitObj.debit = {
                            $in: arrObjectID,
                        }
                        conditionCreditObj.credit = {
                            $in: arrObjectID,
                        }

                        if (contactID && checkObjectIDs(contactID)) {
                            conditionDebitObj.customerDebit =
                                ObjectID(contactID)
                            conditionCreditObj.customerCredit =
                                ObjectID(contactID)
                        }

                        conditionGroupDebit = {
                            _id: { customer: '$customerDebit' },
                            amount: { $sum: '$amount' },
                        }
                        conditionGroupCredit = {
                            _id: { customer: '$customerCredit' },
                            amount: { $sum: '$amount' },
                        }
                    }

                    // console.log({arrObjectID})
                    // console.log({conditionGroupDebit})
                    // console.log({conditionGroupCredit})
                    // console.log({conditionDebitObj})
                    // console.log({conditionCreditObj})
                    // console.log({conditionProject})
                    // console.log({conditionMatchO})
                    // console.log({conditionMatchIn})
                }

                /**
                 * DATA KẾT CHUYỂN/ĐẦU NĂM
                 */
                listDataO = await FINANCIAL_GENERAL_JOURNAL_COLL.aggregate([
                    {
                        $facet: {
                            _debit: [
                                {
                                    $match: conditionDebitObj,
                                },
                                {
                                    $project: conditionProject,
                                },
                                {
                                    $match: conditionMatchO,
                                },
                                {
                                    $group: conditionGroupDebit,
                                },
                            ],
                            _credit: [
                                {
                                    $match: conditionCreditObj,
                                },
                                {
                                    $project: conditionProject,
                                },
                                {
                                    $match: conditionMatchO,
                                },
                                {
                                    $group: conditionGroupCredit,
                                },
                            ],
                        },
                    },
                ])
                // console.log('=========MỐC ĐẦU NĂM=========')
                // console.log({_____No: listDataO[0]._debit})
                // console.log({_____Co: listDataO[0]._credit})

                if (!optionTerm) {
                    listDataIn = await FINANCIAL_GENERAL_JOURNAL_COLL.aggregate(
                        [
                            {
                                $facet: {
                                    _debit: [
                                        {
                                            $match: conditionDebitObj,
                                        },
                                        {
                                            $project: conditionProject,
                                        },
                                        {
                                            $match: conditionMatchIn,
                                        },
                                        {
                                            $group: conditionGroupDebit,
                                        },
                                    ],

                                    _credit: [
                                        {
                                            $match: conditionCreditObj,
                                        },
                                        {
                                            $project: conditionProject,
                                        },
                                        {
                                            $match: conditionMatchIn,
                                        },
                                        {
                                            $group: conditionGroupCredit,
                                        },
                                    ],
                                },
                            },
                        ]
                    )
                    // console.log('=========ĐẦU NĂM-CUỐI KỲ=========')
                    // console.log({_____No: listDataIn[0]._debit})
                    // console.log({_____Co: listDataIn[0]._credit})
                } else {
                    listDataOF = await FINANCIAL_GENERAL_JOURNAL_COLL.aggregate(
                        [
                            {
                                $facet: {
                                    _debit: [
                                        {
                                            $match: conditionDebitObj,
                                        },
                                        {
                                            $project: conditionProject,
                                        },
                                        {
                                            $match: conditionMatchOF,
                                        },
                                        {
                                            $group: conditionGroupDebit,
                                        },
                                    ],
                                    _credit: [
                                        {
                                            $match: conditionCreditObj,
                                        },
                                        {
                                            $project: conditionProject,
                                        },
                                        {
                                            $match: conditionMatchOF,
                                        },

                                        {
                                            $group: conditionGroupCredit,
                                        },
                                    ],
                                },
                            },
                        ]
                    )
                    // console.log('=========ĐẦU NĂM - ĐẦU KỲ=========')
                    // console.log({_____No: listDataOF[0]._debit})
                    // console.log({_____Co: listDataOF[0]._credit})

                    listDataFT = await FINANCIAL_GENERAL_JOURNAL_COLL.aggregate(
                        [
                            {
                                $facet: {
                                    _debit: [
                                        {
                                            $match: conditionDebitObj,
                                        },
                                        {
                                            $project: conditionProject,
                                        },
                                        {
                                            $match: conditionMatchFT,
                                        },
                                        {
                                            $group: conditionGroupDebit,
                                        },
                                    ],
                                    _credit: [
                                        {
                                            $match: conditionCreditObj,
                                        },
                                        {
                                            $project: conditionProject,
                                        },
                                        {
                                            $match: conditionMatchFT,
                                        },

                                        {
                                            $group: conditionGroupCredit,
                                        },
                                    ],
                                },
                            },
                        ]
                    )
                    // console.log('=========ĐẦU KỲ - CUỐI KỲ=========')
                    // console.log({_____No: listDataFT[0]._debit})
                    // console.log({_____Co: listDataFT[0]._credit})
                }

                if (!option) {
                    let totalDebitO = 0,
                        totalCreditO = 0,
                        totalDebitOF = 0,
                        totalCreditOF = 0,
                        totalDebitFT = 0,
                        totalCreditFT = 0

                    // Số liệu đầu năm
                    if (listDataO[0]._debit.length > 0) {
                        totalDebitO = listDataO[0]._debit[0].amount
                    }
                    if (listDataO[0]._credit.length > 0) {
                        totalCreditO = listDataO[0]._credit[0].amount
                    }

                    // Số liệu từ đầu năm tới đầu kỳ đang xét
                    if (listDataOF[0]._debit.length > 0) {
                        totalDebitOF = listDataOF[0]._debit[0].amount
                    }
                    if (listDataOF[0]._credit.length > 0) {
                        totalCreditOF = listDataOF[0]._credit[0].amount
                    }

                    // Số liệu đầu kỳ tới cuối kỳ đang xét
                    if (listDataFT[0]._debit.length > 0) {
                        totalDebitFT = listDataFT[0]._debit[0].amount
                    }
                    if (listDataFT[0]._credit.length > 0) {
                        totalCreditFT = listDataFT[0]._credit[0].amount
                    }

                    return resolve({
                        error: false,
                        data: {
                            listAccounts,
                            totalDebitO,
                            totalCreditO,
                            totalDebitOF,
                            totalCreditOF,
                            totalDebitFT,
                            totalCreditFT,
                        },
                    })
                } else {
                    // Nhiều tài khoản - Không mã khách
                    if (option == 1) {
                        return resolve({
                            error: false,
                            data: {
                                listAccounts,
                                debitO: listDataO[0]._debit,
                                creditO: listDataO[0]._credit,
                                debitIn: listDataIn[0]._debit,
                                creditIn: listDataIn[0]._credit,
                            },
                        })
                    } else if (option == 2) {

                    /**
                     * BÁO CÁO TÀI KHOẢN - MÃ KHÁCH => ÁP DỤNG MOBILE
                     */
                        let arrCustomers = []
                        if (listDataO[0]._debit.length > 0) {
                            arrCustomers = [
                                ...arrCustomers,
                                ...listDataO[0]._debit.map(
                                    (item) => item._id.contact
                                ),
                            ]
                        }
                        if (listDataO[0]._credit.length > 0) {
                            arrCustomers = [
                                ...arrCustomers,
                                ...listDataO[0]._credit.map(
                                    (item) => item._id.contact
                                ),
                            ]
                        }
                        if (listDataIn[0]._debit.length > 0) {
                            arrCustomers = [
                                ...arrCustomers,
                                ...listDataIn[0]._debit.map(
                                    (item) => item._id.contact
                                ),
                            ]
                        }
                        if (listDataIn[0]._credit.length > 0) {
                            arrCustomers = [
                                ...arrCustomers,
                                ...listDataIn[0]._credit.map(
                                    (item) => item._id.contact
                                ),
                            ]
                        }

                        let listCustomers = await ITEM__CONTACT_COLL.find({
                            _id: { $in: arrCustomers },
                        }).select('name phone address image')
                        // console.log(listCustomers)

                        /**
                         * XỬ LÝ LOGIC DATA
                         */
                        let arrDebitO = [],
                            arrCreditO = [],
                            arrDebitIn = [],
                            arrCreditIn = []

                        listDataO[0]._debit.forEach((element) => {
                            let key = element._id.contact
                            if (!Array.isArray(arrDebitO[key])) {
                                arrDebitO[key] = []
                            }
                            arrDebitO[key].push(element)
                        })

                        listDataO[0]._credit.forEach((element) => {
                            let key = element._id.contact
                            if (!Array.isArray(arrCreditO[key])) {
                                arrCreditO[key] = []
                            }
                            arrCreditO[key].push(element)
                        })

                        listDataIn[0]._debit.forEach((element) => {
                            let key = element._id.contact
                            if (!Array.isArray(arrDebitIn[key])) {
                                arrDebitIn[key] = []
                            }
                            arrDebitIn[key].push(element)
                        })

                        listDataIn[0]._credit.forEach((element) => {
                            let key = element._id.contact
                            if (!Array.isArray(arrCreditIn[key])) {
                                arrCreditIn[key] = []
                            }
                            arrCreditIn[key].push(element)
                        })
                        // console.log(arrDebitO)
                        // console.log(arrCreditO)
                        // console.log(arrDebitIn)
                        // console.log(arrCreditIn)

                        for (var i = 0; i < listCustomers.length; i++) {
                            listCustomers[i].total = 0
                        }
                        // console.log(listCustomers)

                        listCustomers.forEach((item, index) => {
                            if (arrDebitO[item._id]) {
                                listCustomers[index].total =
                                    listCustomers[index].total +
                                    Number(arrDebitO[item._id][0].amount)
                            }
                            if (arrCreditO[item._id]) {
                                listCustomers[index].total =
                                    listCustomers[index].total -
                                    Number(arrCreditO[item._id][0].amount)
                            }
                            if (arrDebitIn[item._id]) {
                                listCustomers[index].total =
                                    listCustomers[index].total +
                                    Number(arrDebitIn[item._id][0].amount)
                            }
                            if (arrCreditIn[item._id]) {
                                listCustomers[index].total =
                                    listCustomers[index].total -
                                    Number(arrCreditIn[item._id][0].amount)
                            }
                        })

                        // return resolve({ error: false, data: {
                        //     listAccounts,
                        //     listCustomers,
                        //     debitO: listDataO[0]._debit,
                        //     creditO: listDataO[0]._credit,
                        //     debitIn: listDataIn[0]._debit,
                        //     creditIn: listDataIn[0]._credit
                        // }})
                        return resolve({ error: false, data: listCustomers })
                    }

                    // Báo cáo theo Tài khoản - Mã khách (quan hệ 1-1)
                    else if (option == 3) {
                        return resolve({
                            error: false,
                            data: {
                                listAccounts,
                                debitO: listDataO[0]._debit,
                                creditO: listDataO[0]._credit,
                                debitOF: listDataOF[0]._debit,
                                creditOF: listDataOF[0]._credit,
                                debitFT: listDataFT[0]._debit,
                                creditFT: listDataFT[0]._credit,
                            },
                        })
                    }

                    // Báo cáo Bảng cân đối tài khoản
                    else if (option == 4) {
                        let arrCombine = [],
                            listAccounts = []

                        if (arrAccNames && Array.isArray(arrAccNames)) {
                            listAccounts = await ACCOUNT_MODEL.getListRecursive(
                                { companyID, arrAccNames }
                            )
                        } else {
                            listAccounts = await ACCOUNT_MODEL.getListRecursive(
                                { companyID }
                            )
                        }
                        let listAppMenuParent = listAccounts.data

                        let arrDebitO = [],
                            arrCreditO = [],
                            arrDebitOF = [],
                            arrCreditOF = [],
                            arrDebitFT = [],
                            arrCreditFT = []

                        listDataO[0]._debit.forEach((element) => {
                            let key = element._id.account
                            if (!Array.isArray(arrDebitO[key])) {
                                arrDebitO[key] = []
                            }
                            arrDebitO[key].push(element)
                        })

                        listDataO[0]._credit.forEach((element) => {
                            let key = element._id.account
                            if (!Array.isArray(arrCreditO[key])) {
                                arrCreditO[key] = []
                            }
                            arrCreditO[key].push(element)
                        })

                        listDataOF[0]._debit.forEach((element) => {
                            let key = element._id.account
                            if (!Array.isArray(arrDebitOF[key])) {
                                arrDebitOF[key] = []
                            }
                            arrDebitOF[key].push(element)
                        })

                        listDataOF[0]._credit.forEach((element) => {
                            let key = element._id.account
                            if (!Array.isArray(arrCreditOF[key])) {
                                arrCreditOF[key] = []
                            }
                            arrCreditOF[key].push(element)
                        })

                        listDataFT[0]._debit.forEach((element) => {
                            let key = element._id.account
                            if (!Array.isArray(arrDebitFT[key])) {
                                arrDebitFT[key] = []
                            }
                            arrDebitFT[key].push(element)
                        })

                        listDataFT[0]._credit.forEach((element) => {
                            let key = element._id.account
                            if (!Array.isArray(arrCreditFT[key])) {
                                arrCreditFT[key] = []
                            }
                            arrCreditFT[key].push(element)
                        })

                        // console.log(arrDebitO)
                        // console.log(arrCreditO)
                        // console.log(arrDebitOF)
                        // console.log(arrCreditOF)
                        // console.log(arrDebitFT)
                        // console.log(arrCreditFT)

                        /**
                         * ĐỆ QUY XỬ LÝ DỮ LIỆU
                         */
                        let recursive = (arr) => {
                            arr.forEach((item) => {
                                let kcNoDauKy = 0
                                let kcCoDauKy = 0
                                let noDauKy = 0
                                let coDauKy = 0
                                let noTrongKy = 0
                                let coTrongKy = 0
                                let noCuoiKy = 0
                                let coCuoiKy = 0

                                let kcNoDauKySub = 0
                                let kcCoDauKySub = 0
                                let noDauKySub = 0
                                let coDauKySub = 0
                                let noTrongKySub = 0
                                let coTrongKySub = 0
                                let noCuoiKySub = 0
                                let coCuoiKySub = 0

                                // console.log(`${item.name}-${item._id}-${item.description}`)
                                // console.log(item.nestedChilds)

                                // Dữ liệu của Tài khoản
                                if (arrDebitO[item._id]) {
                                    kcNoDauKy = arrDebitO[item._id][0].amount
                                }
                                if (arrCreditO[item._id]) {
                                    kcCoDauKy = arrCreditO[item._id][0].amount
                                }
                                if (arrDebitOF[item._id]) {
                                    noDauKy = arrDebitOF[item._id][0].amount
                                }
                                if (arrCreditOF[item._id]) {
                                    coDauKy = arrCreditOF[item._id][0].amount
                                }
                                if (arrDebitFT[item._id]) {
                                    noTrongKy = arrDebitFT[item._id][0].amount
                                }
                                if (arrCreditFT[item._id]) {
                                    coTrongKy = arrCreditFT[item._id][0].amount
                                }

                                // Dữ liệu các tài khoản con/cháu....
                                if (!optionCal || Number(optionCal) == 1) {
                                    // console.log('==============Tổng toàn bộ============')
                                    for (const subitem of item.nestedChilds) {
                                        if (arrDebitO[`${subitem}`]) {
                                            kcNoDauKySub =
                                                kcNoDauKySub +
                                                Number(
                                                    arrDebitO[subitem][0].amount
                                                )
                                        }
                                        if (arrCreditO[`${subitem}`]) {
                                            kcCoDauKySub =
                                                kcCoDauKySub +
                                                Number(
                                                    arrCreditO[subitem][0]
                                                        .amount
                                                )
                                        }
                                        if (arrDebitOF[`${subitem}`]) {
                                            noDauKySub =
                                                noDauKySub +
                                                Number(
                                                    arrDebitOF[subitem][0]
                                                        .amount
                                                )
                                        }
                                        if (arrCreditOF[`${subitem}`]) {
                                            coDauKySub =
                                                coDauKySub +
                                                Number(
                                                    arrCreditOF[subitem][0]
                                                        .amount
                                                )
                                        }
                                        if (arrDebitFT[`${subitem}`]) {
                                            noTrongKySub =
                                                noTrongKySub +
                                                Number(
                                                    arrDebitFT[subitem][0]
                                                        .amount
                                                )
                                        }
                                        if (arrCreditFT[`${subitem}`]) {
                                            coTrongKySub =
                                                coTrongKySub +
                                                Number(
                                                    arrCreditFT[subitem][0]
                                                        .amount
                                                )
                                        }
                                    }
                                } else {
                                    // console.log('==============Tổng bút toán gốc============')
                                }

                                // console.log({kcNoDauKySub})
                                // console.log({kcCoDauKySub})
                                // console.log({noDauKySub})
                                // console.log({coDauKySub})
                                // console.log({noTrongKySub})
                                // console.log({coTrongKySub})

                                kcNoDauKy = kcNoDauKy + kcNoDauKySub
                                kcCoDauKy = kcCoDauKy + kcCoDauKySub
                                noDauKy = noDauKy + noDauKySub
                                coDauKy = coDauKy + coDauKySub
                                noTrongKy = noTrongKy + noTrongKySub
                                coTrongKy = coTrongKy + coTrongKySub

                                arrCombine.push({
                                    _id: item._id,
                                    name: item.name,
                                    description: item.description,
                                    amountChilds: item.amountChilds,
                                    kcNoDauKy: Number(kcNoDauKy),
                                    kcCoDauKy: Number(kcCoDauKy),
                                    noDauKy: Number(noDauKy),
                                    coDauKy: Number(coDauKy),
                                    noTrongKy: Number(noTrongKy),
                                    coTrongKy: Number(coTrongKy),
                                })

                                if (item.childs && item.childs.length) {
                                    recursive(item.childs)
                                }
                            })
                        }
                        recursive(listAppMenuParent)
                        // console.log(arrCombine)

                        return resolve({
                            error: false,
                            data: {
                                debitO: listDataO[0]._debit,
                                creditO: listDataO[0]._credit,
                                debitOF: listDataOF[0]._debit,
                                creditOF: listDataOF[0]._credit,
                                debitFT: listDataFT[0]._debit,
                                creditFT: listDataFT[0]._credit,
                                arrCombine,
                            },
                        })
                    }

                    // Công nợ userID đang truy cập
                    else if (option == 5) {
                        let listAccountNew = []

                        listAccounts.forEach((item) => {
                            item.total = 0

                            if (
                                [1, 2, 6, 8].includes(
                                    Number(item.name.charAt(0))
                                )
                            ) {
                                listDataO[0]._debit.forEach((element) => {
                                    let key = element._id.account
                                    if (
                                        item?._id.toString() ===
                                            key.toString() ||
                                        item?.nestedChilds.includes(key)
                                    ) {
                                        item.total =
                                            item.total + Number(element.amount)
                                    }
                                })

                                listDataO[0]._credit.forEach((element) => {
                                    let key = element._id.account
                                    if (
                                        item?._id.toString() ===
                                            key.toString() ||
                                        item?.nestedChilds.includes(key)
                                    ) {
                                        item.total =
                                            item.total - Number(element.amount)
                                    }
                                })

                                listDataIn[0]._debit.forEach((element) => {
                                    let key = element._id.account
                                    if (
                                        item?._id.toString() ===
                                            key.toString() ||
                                        item?.nestedChilds.includes(key)
                                    ) {
                                        item.total =
                                            item.total + Number(element.amount)
                                    }
                                })

                                listDataIn[0]._credit.forEach((element) => {
                                    let key = element._id.account
                                    if (
                                        item?._id.toString() ===
                                            key.toString() ||
                                        item?.nestedChilds.includes(key)
                                    ) {
                                        item.total =
                                            item.total - Number(element.amount)
                                    }
                                })
                            } else {
                                listDataO[0]._debit.forEach((element) => {
                                    let key = element._id.account
                                    if (
                                        item?._id.toString() ===
                                            key.toString() ||
                                        item?.nestedChilds.includes(key)
                                    ) {
                                        item.total =
                                            item.total - Number(element.amount)
                                    }
                                })

                                listDataO[0]._credit.forEach((element) => {
                                    let key = element._id.account
                                    if (
                                        item?._id.toString() ===
                                            key.toString() ||
                                        item?.nestedChilds.includes(key)
                                    ) {
                                        item.total =
                                            item.total + Number(element.amount)
                                    }
                                })

                                listDataIn[0]._debit.forEach((element) => {
                                    let key = element._id.account
                                    if (
                                        item?._id.toString() ===
                                            key.toString() ||
                                        item?.nestedChilds.includes(key)
                                    ) {
                                        item.total =
                                            item.total - Number(element.amount)
                                    }
                                })

                                listDataIn[0]._credit.forEach((element) => {
                                    let key = element._id.account
                                    if (
                                        item?._id.toString() ===
                                            key.toString() ||
                                        item?.nestedChilds.includes(key)
                                    ) {
                                        item.total =
                                            item.total + Number(element.amount)
                                    }
                                })
                            }

                            listAccountNew.push({
                                _id: item._id,
                                name: item.name,
                                description: item.description,
                                total: item.total,
                            })
                        })

                        // console.log(arrDebitO)
                        // console.log(arrCreditO)
                        // console.log(arrDebitIn)
                        // console.log(arrCreditIn)

                        return resolve({
                            error: false,
                            data: {
                                listAccountNew,
                                // listAccounts,
                                // debitO: listDataO[0]._debit,
                                // creditO: listDataO[0]._credit,
                                // debitIn: listDataIn[0]._debit,
                                // creditIn: listDataIn[0]._credit,
                            },
                        })
                    }

                    // Chi tiết công nợ theo tài khoản-mã khách
                    else if (option == 6) {
                        return resolve({
                            error: false,
                            data: {
                                listAccounts,
                                debitO: listDataO[0]._debit,
                                creditO: listDataO[0]._credit,
                                debitOF: listDataOF[0]._debit,
                                creditOF: listDataOF[0]._credit,
                                debitFT: listDataFT[0]._debit,
                                creditFT: listDataFT[0]._credit,
                            },
                        })
                    }

                    // Tổng hợp Tài khoản-Tháng
                    else if (option == 7) {
                        return resolve({
                            error: false,
                            data: {
                                listAccounts,
                                debitO: listDataO[0]._debit,
                                creditO: listDataO[0]._credit,
                                debitIn: listDataIn[0]._debit,
                                creditIn: listDataIn[0]._credit,
                            },
                        })
                    }

                    // Tổng hợp Khoản mục phí
                    else if (option == 8) {
                        return resolve({
                            error: false,
                            data: {
                                listAccounts,
                                debitO: listDataO[0]._debit,
                                creditO: listDataO[0]._credit,
                                debitIn: listDataIn[0]._debit,
                                creditIn: listDataIn[0]._credit,
                            },
                        })
                    }

                    // Tổng hợp theo Sản phẩm
                    else if (option == 9) {
                        let arrGoods = [],
                            arrCombine = []

                        for (const item of listDataO[0]._debit) {
                            arrGoods.push(item._id.goods)
                        }
                        for (const item of listDataO[0]._credit) {
                            arrGoods.push(item._id.goods)
                        }
                        for (const item of listDataOF[0]._debit) {
                            arrGoods.push(item._id.goods)
                        }
                        for (const item of listDataOF[0]._credit) {
                            arrGoods.push(item._id.goods)
                        }
                        for (const item of listDataFT[0]._debit) {
                            arrGoods.push(item._id.goods)
                        }
                        for (const item of listDataFT[0]._credit) {
                            arrGoods.push(item._id.goods)
                        }
                        // console.log(arrGoods)

                        let listGoods = await ITEM__GOODS_COLL.find({
                            _id: { $in: arrGoods },
                        }).select('name unit note')
                        // console.log(listGoods)

                        let arrDebitO = [],
                            arrCreditO = [],
                            arrDebitOF = [],
                            arrCreditOF = [],
                            arrDebitFT = [],
                            arrCreditFT = []

                        listDataO[0]._debit.forEach((element) => {
                            let key = element._id.goods
                            if (!Array.isArray(arrDebitO[key])) {
                                arrDebitO[key] = []
                            }
                            arrDebitO[key].push(element)
                        })

                        listDataO[0]._credit.forEach((element) => {
                            let key = element._id.goods
                            if (!Array.isArray(arrCreditO[key])) {
                                arrCreditO[key] = []
                            }
                            arrCreditO[key].push(element)
                        })

                        listDataOF[0]._debit.forEach((element) => {
                            let key = element._id.goods
                            if (!Array.isArray(arrDebitOF[key])) {
                                arrDebitOF[key] = []
                            }
                            arrDebitOF[key].push(element)
                        })

                        listDataOF[0]._credit.forEach((element) => {
                            let key = element._id.goods
                            if (!Array.isArray(arrCreditOF[key])) {
                                arrCreditOF[key] = []
                            }
                            arrCreditOF[key].push(element)
                        })

                        listDataFT[0]._debit.forEach((element) => {
                            let key = element._id.goods
                            if (!Array.isArray(arrDebitFT[key])) {
                                arrDebitFT[key] = []
                            }
                            arrDebitFT[key].push(element)
                        })

                        listDataFT[0]._credit.forEach((element) => {
                            let key = element._id.goods
                            if (!Array.isArray(arrCreditFT[key])) {
                                arrCreditFT[key] = []
                            }
                            arrCreditFT[key].push(element)
                        })

                        for (const item of listGoods) {
                            let kcNoDauKy = 0,
                                klKcNoDauKy = 0
                            let kcCoDauKy = 0,
                                klKcCoDauKy = 0
                            let noDauKy = 0,
                                klNoDauKy = 0
                            let coDauKy = 0,
                                klCoDauKy = 0
                            let noTrongKy = 0,
                                klNoTrongKy = 0
                            let coTrongKy = 0,
                                klCoTrongKy = 0

                            if (arrDebitO[item._id]) {
                                kcNoDauKy = arrDebitO[item._id][0].amount
                                klKcNoDauKy = arrDebitO[item._id][0].quantity
                            }
                            if (arrCreditO[item._id]) {
                                kcCoDauKy = arrCreditO[item._id][0].amount
                                klKcCoDauKy = arrCreditO[item._id][0].quantity
                            }
                            if (arrDebitOF[item._id]) {
                                noDauKy = arrDebitOF[item._id][0].amount
                                klNoDauKy = arrDebitOF[item._id][0].quantity
                            }
                            if (arrCreditOF[item._id]) {
                                coDauKy = arrCreditOF[item._id][0].amount
                                klCoDauKy = arrCreditOF[item._id][0].quantity
                            }
                            if (arrDebitFT[item._id]) {
                                noTrongKy = arrDebitFT[item._id][0].amount
                                klNoTrongKy = arrDebitFT[item._id][0].quantity
                            }
                            if (arrCreditFT[item._id]) {
                                coTrongKy = arrCreditFT[item._id][0].amount
                                klCoTrongKy = arrCreditFT[item._id][0].quantity
                            }

                            arrCombine.push({
                                _id: item._id,
                                name: item.name,
                                unit: item.unit,
                                kcNoDauKy: Number(kcNoDauKy),
                                kcCoDauKy: Number(kcCoDauKy),
                                noDauKy: Number(noDauKy),
                                coDauKy: Number(coDauKy),
                                noTrongKy: Number(noTrongKy),
                                coTrongKy: Number(coTrongKy),

                                klKcNoDauKy: Number(klKcNoDauKy),
                                klKcCoDauKy: Number(klKcCoDauKy),
                                klNoDauKy: Number(klNoDauKy),
                                klCoDauKy: Number(klCoDauKy),
                                klNoTrongKy: Number(klNoTrongKy),
                                klCoTrongKy: Number(klCoTrongKy),
                            })
                        }
                        // console.log(arrCombine)

                        return resolve({
                            error: false,
                            data: {
                                debitO: listDataO[0]._debit,
                                creditO: listDataO[0]._credit,
                                debitOF: listDataOF[0]._debit,
                                creditOF: listDataOF[0]._credit,
                                debitFT: listDataFT[0]._debit,
                                creditFT: listDataFT[0]._credit,
                                arrCombine,
                            },
                        })
                    }

                    // Tổng hợp theo Mã khách
                    else if (option == 10) {
                        let arrCustomers = [],
                            arrCombine = []

                        for (const item of listDataO[0]._debit) {
                            arrCustomers.push(item._id.customer)
                        }
                        for (const item of listDataO[0]._credit) {
                            arrCustomers.push(item._id.customer)
                        }
                        for (const item of listDataOF[0]._debit) {
                            arrCustomers.push(item._id.customer)
                        }
                        for (const item of listDataOF[0]._credit) {
                            arrCustomers.push(item._id.customer)
                        }
                        for (const item of listDataFT[0]._debit) {
                            arrCustomers.push(item._id.customer)
                        }
                        for (const item of listDataFT[0]._credit) {
                            arrCustomers.push(item._id.customer)
                        }
                        // console.log(arrCustomers)

                        let listCustomers = await ITEM__CONTACT_COLL.find({
                            _id: { $in: arrCustomers },
                        }).select('name phone taxid')
                        // console.log(listCustomers)

                        let arrDebitO = [],
                            arrCreditO = [],
                            arrDebitOF = [],
                            arrCreditOF = [],
                            arrDebitFT = [],
                            arrCreditFT = []

                        listDataO[0]._debit.forEach((element) => {
                            let key = element._id.customer
                            if (!Array.isArray(arrDebitO[key])) {
                                arrDebitO[key] = []
                            }
                            arrDebitO[key].push(element)
                        })

                        listDataO[0]._credit.forEach((element) => {
                            let key = element._id.customer
                            if (!Array.isArray(arrCreditO[key])) {
                                arrCreditO[key] = []
                            }
                            arrCreditO[key].push(element)
                        })

                        listDataOF[0]._debit.forEach((element) => {
                            let key = element._id.customer
                            if (!Array.isArray(arrDebitOF[key])) {
                                arrDebitOF[key] = []
                            }
                            arrDebitOF[key].push(element)
                        })

                        listDataOF[0]._credit.forEach((element) => {
                            let key = element._id.customer
                            if (!Array.isArray(arrCreditOF[key])) {
                                arrCreditOF[key] = []
                            }
                            arrCreditOF[key].push(element)
                        })

                        listDataFT[0]._debit.forEach((element) => {
                            let key = element._id.customer
                            if (!Array.isArray(arrDebitFT[key])) {
                                arrDebitFT[key] = []
                            }
                            arrDebitFT[key].push(element)
                        })

                        listDataFT[0]._credit.forEach((element) => {
                            let key = element._id.customer
                            if (!Array.isArray(arrCreditFT[key])) {
                                arrCreditFT[key] = []
                            }
                            arrCreditFT[key].push(element)
                        })

                        for (const item of listCustomers) {
                            let kcNoDauKy = 0
                            let kcCoDauKy = 0
                            let noDauKy = 0
                            let coDauKy = 0
                            let noTrongKy = 0
                            let coTrongKy = 0
                            let noCuoiKy = 0
                            let coCuoiKy = 0

                            if (arrDebitO[item._id]) {
                                kcNoDauKy = arrDebitO[item._id][0].amount
                            }
                            if (arrCreditO[item._id]) {
                                kcCoDauKy = arrCreditO[item._id][0].amount
                            }
                            if (arrDebitOF[item._id]) {
                                noDauKy = arrDebitOF[item._id][0].amount
                            }
                            if (arrCreditOF[item._id]) {
                                coDauKy = arrCreditOF[item._id][0].amount
                            }
                            if (arrDebitFT[item._id]) {
                                noTrongKy = arrDebitFT[item._id][0].amount
                            }
                            if (arrCreditFT[item._id]) {
                                coTrongKy = arrCreditFT[item._id][0].amount
                            }

                            arrCombine.push({
                                _id: item._id,
                                name: item.name,
                                unit: item.unit,
                                kcNoDauKy: Number(kcNoDauKy),
                                kcCoDauKy: Number(kcCoDauKy),
                                noDauKy: Number(noDauKy),
                                coDauKy: Number(coDauKy),
                                noTrongKy: Number(noTrongKy),
                                coTrongKy: Number(coTrongKy),
                            })
                        }
                        // console.log(arrCombine)

                        return resolve({
                            error: false,
                            data: {
                                debitO: listDataO[0]._debit,
                                creditO: listDataO[0]._credit,
                                debitOF: listDataOF[0]._debit,
                                creditOF: listDataOF[0]._credit,
                                debitFT: listDataFT[0]._debit,
                                creditFT: listDataFT[0]._credit,
                                arrCombine,
                            },
                        })
                    }
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Lấy giá vốn của 1 hàng hóa tới 1 thời điểm
     * Code: Hiepnh
     * Date: 3/1/2024
     */
    getPrimeCost({
        companyID,
        fundaID,
        arrObjectID,
        goodsID,
        warehouseID,
        exportQuantity,
        toDate,
    }) {
        // console.log('========ptgv================')
        // console.log({ companyID, fundaID, arrObjectID, goodsID, warehouseID, exportQuantity, toDate })
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA: CÁC NGUYÊN NHÂN DẪN ĐẾN SAI SÓT KHI CHẠY GIÁ VỐN
                 * 1. Giá vốn được tính cho 1 phiếu xuất, tính tới thời điểm của phiếu đó (ví dụ phiếu xuất ngày 30/6/2020)
                 *  Giá vốn = (Tổng giá trị nhập - Tổng giá trị xuất)/(Tổng KL nhập - Tổng KL xuất)
                 * 2. Số liệu về nhập hàng tính tới ngày của phiếu (30/6/2020)
                 * 3. Số liệu xuất hàng tính tới trước thời điểm xuất kho của phiếu (29/6/2020)
                 * 4. Với các phiếu nhập hàng trả lại thì cần điền đầy đủ cả giá nhập hàng (không được bỏ trống)
                 * 5. Khi xuất hàng mà trong kho không có (xuất hàng âm) thì sẽ không chạy được giá vốn
                 * 6. Nhập hàng trả lại thì giá nhập = giá vốn xuất ra của phiếu tương ứng/cùng mã hàng
                 */

                let conditionDebitObj = {
                    debit: {
                        $in: arrObjectID,
                    },
                    warehouse: ObjectID(warehouseID),
                    goods: ObjectID(goodsID),
                }
                let conditionCreditObj = {
                    credit: {
                        $in: arrObjectID,
                    },
                    warehouse: ObjectID(warehouseID),
                    goods: ObjectID(goodsID),
                }
                // console.log(conditionDebitObj)
                // console.log(conditionCreditObj)

                let conditionGroupDebit = {
                    _id: { goods: '$goods' },
                    quantity: { $sum: '$quantity' },
                    amount: { $sum: '$amount' },
                }
                let conditionGroupCredit = {
                    _id: { goods: '$goods' },
                    quantity: { $sum: '$quantity' },
                    amount: { $sum: '$amount' },
                }

                let conditionProject = {
                    year: { $year: '$date' },
                    forward: '$forward',
                    cancel: '$cancel',
                    date: 1,
                    quantity: 1,
                    amount: 1,
                    goods: 1,
                    warehouse: 1,
                    debit: 1,
                    credit: 1,
                }

                // Lấy năm của ngày đầu kỳ
                let year = moment(toDate).toDate().getFullYear()
                let firstDayOfYear = `${Number(year)}-01-01T00:00:00.000Z`

                // console.log({year})
                // console.log({firstDayOfYear})

                // Kết chuyển cuối kỳ năm trước sang đầu kỳ năm sau (Original)
                let conditionMatchO = {
                    forward: 1,
                    cancel: 0,
                    year: Number(year),
                }

                // Từ đầu năm tới đầu kỳ***
                let conditionMatchDebitIn = {
                    forward: 0,
                    cancel: 0,
                    date: {
                        $gte: moment(firstDayOfYear).toDate(), // Tính từ firstDayOfYear | fromDate
                        $lte: moment(toDate).toDate(),
                    },
                }

                let conditionMatchCreditIn = {
                    forward: 0,
                    cancel: 0,
                    date: {
                        $gte: moment(firstDayOfYear).toDate(), // Tính từ firstDayOfYear | fromDate
                        $lt: moment(toDate).toDate(), // Không lấy dữ liệu các phiếu xuất cùng ngày (toDate) vì đang chờ để chạy giá vốn
                    },
                }

                /**
                 * DATA KẾT CHUYỂN/ĐẦU NĂM
                 * Không lấy dữ liệu các phiếu xuất cùng ngày (toDate) vì đang chờ để chạy giá vốn
                 * Nếu lấy vào thì sẽ bị hiện tượng:
                 * - Số lượng xuất hàng bị cộng vào
                 * - Giá trị xuất hàng thì = 0 (do chưa gán giá vốn)
                 * ===> dẫn đến dữ liệu không chính xác
                 * Yennt: Trong cùng ngày thì giá xuất vẫn tính cả giá nhập của ngày đó
                 */
                let listDataO = await FINANCIAL_GENERAL_JOURNAL_COLL.aggregate([
                    {
                        $facet: {
                            _debit: [
                                {
                                    $match: conditionDebitObj,
                                },
                                {
                                    $project: conditionProject,
                                },
                                {
                                    $match: conditionMatchO,
                                },
                                {
                                    $group: conditionGroupDebit,
                                },
                            ],
                            _credit: [
                                {
                                    $match: conditionCreditObj,
                                },
                                {
                                    $project: conditionProject,
                                },
                                {
                                    $match: conditionMatchO,
                                },
                                {
                                    $group: conditionGroupCredit,
                                },
                            ],
                        },
                    },
                ])
                // console.log('=========MỐC ĐẦU NĂM=========')
                // console.log({_____: listDataO})
                // console.log({_____No: listDataO[0]._debit})
                // console.log({_____Co: listDataO[0]._credit})

                let listDataIn = await FINANCIAL_GENERAL_JOURNAL_COLL.aggregate(
                    [
                        {
                            $facet: {
                                _debit: [
                                    {
                                        $match: conditionDebitObj,
                                    },
                                    {
                                        $project: conditionProject,
                                    },
                                    {
                                        $match: conditionMatchDebitIn,
                                    },
                                    {
                                        $group: conditionGroupDebit,
                                    },
                                ],

                                _credit: [
                                    {
                                        $match: conditionCreditObj,
                                    },
                                    {
                                        $project: conditionProject,
                                    },
                                    {
                                        $match: conditionMatchCreditIn,
                                    },
                                    {
                                        $group: conditionGroupCredit,
                                    },
                                ],
                            },
                        },
                    ]
                )
                // console.log('=========ĐẦU NĂM-CUỐI KỲ=========')
                // console.log({_____: listDataIn})
                // console.log({_____No: listDataIn[0]._debit})
                // console.log({_____Co: listDataIn[0]._credit})

                let importNum = 0,
                    importVal = 0,
                    exportNum = 0,
                    exportVal = 0

                if (listDataO[0]._debit.length > 0) {
                    importNum = Number(
                        importNum + listDataO[0]._debit[0].quantity
                    )
                    importVal = Number(
                        importVal + listDataO[0]._debit[0].amount
                    )
                }
                if (listDataO[0]._credit.length > 0) {
                    exportNum = Number(
                        exportNum + listDataO[0]._credit[0].quantity
                    )
                    exportVal = Number(
                        exportVal + listDataO[0]._credit[0].amount
                    )
                }

                if (listDataIn[0]._debit.length > 0) {
                    importNum = Number(
                        importNum + listDataIn[0]._debit[0].quantity
                    )
                    importVal = Number(
                        importVal + listDataIn[0]._debit[0].amount
                    )
                }

                if (listDataIn[0]._credit.length > 0) {
                    exportNum = Number(
                        exportNum + listDataIn[0]._credit[0].quantity
                    )
                    exportVal = Number(
                        exportVal + listDataIn[0]._credit[0].amount
                    )
                }

                let primeCost = 0,
                    errGoods = false

                /**
                 * Kiểm tra điều kiện để xuất được hàng:
                 * - Số lượng hàng tồn > 0
                 * - Số lượng xuất hàng <= số lượng hàng tồn
                 */

                // Chỉ tiến hành chạy giá vốn cho trường hợp hợp lệ
                if (Number(importNum - exportNum) > 0) {
                    // Không làm tròn ở đây để giá trị nguyên bản => khi nhân ra thành tiền mới đúng, sau đó mới làm tròn
                    primeCost = Number(
                        (importVal - exportVal) / (importNum - exportNum)
                    )
                }

                // Lấy hàng hóa bị xuất hàng âm để thông báo
                if (
                    Number(
                        (
                            Number(importNum) -
                            Number(exportNum) -
                            Number(exportQuantity)
                        ).toFixed(3)
                    ) < 0
                ) {
                    errGoods = true
                }

                return resolve({
                    error: false,
                    data: {
                        value: importVal - exportVal,
                        number: importNum - exportNum,
                        primeCost,
                        errGoods,
                    },
                })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Cập nhật giá vốn cho hàng hóa cho 01 phiếu xuất
     * Code: Hiepnh
     * Date: 3/1/2024
     */
    updatePrimeCost({
        companyID,
        fundaID,
        accountID,
        voucherID,
        voucherName,
        voucherDate,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                // Mảng đệ quy tài khoản
                let arrObjectID = [ObjectID(accountID)]
                let infoAccount = await ITEM_ACCOUNT_COLL.findById(accountID)
                if (infoAccount) {
                    let nestedChilds = infoAccount.nestedChilds.map((item) =>
                        ObjectID(item._id)
                    )
                    arrObjectID = [...arrObjectID, ...nestedChilds]
                }
                // console.log(arrObjectID)

                /**
                 * Khai báo arr hứng các hàng hóa có việc xuất bị sai
                 */
                let arrGoodsFailed = []

                /**
                 * Lấy danh sách hàng hóa thuộc phiếu xuất
                 * Hàng hoá phải được gắn kèm thuộc kho bãi cụ thể
                 */
                let listJournal = await FINANCIAL_GENERAL_JOURNAL_COLL.find({
                    voucher: voucherID,
                    credit: {
                        $in: arrObjectID,
                    },
                    goods: { $exists: true, $ne: null },
                    warehouse: { $exists: true, $ne: null },
                })

                for (const item of listJournal) {
                    let info = null
                    let unitprice = null
                    let amount = null

                    /**
                     * Lần lượt cập nhật giá vốn cho từng hàng hóa trong phiếu
                     * Giá vốn được tính tới thời điểm là ngày của phiếu đang xét
                     */
                    if (!fundaID) {
                        // Kiểm tra chỉ chạy giá vốn khi tồn tại cả item.goods và item.warehouse
                        info = await that.getPrimeCost({
                            companyID,
                            arrObjectID,
                            goodsID: item.goods,
                            warehouseID: item.warehouse,
                            exportQuantity: item.quantity,
                            toDate: voucherDate,
                        })

                        // Cập nhật giá vốn cho hàng hóa vào trong phiếu xuất
                        unitprice = info.data.primeCost

                        // amount = Number(+item.quantity * +unitprice).toFixed(0); // Bỏ làm tròn đi vì sẽ bị sai số cộng dồn
                        amount = Number(+item.quantity * +unitprice)
                    } else {
                        // Kiểm tra chỉ chạy giá vốn khi tồn tại cả item.goods và item.warehouse
                        info = await that.getPrimeCost({
                            fundaID,
                            arrObjectID,
                            goodsID: item.goods,
                            warehouseID: item.warehouse,
                            exportQuantity: item.quantity,
                            toDate: voucherDate,
                        })

                        // Cập nhật giá vốn cho hàng hóa vào trong phiếu xuất
                        unitprice = info.data.primeCost

                        // amount = Number(+item.quantity * +unitprice).toFixed(0); // Bỏ làm tròn đi vì sẽ bị sai số cộng dồn
                        amount = Number(+item.quantity * +unitprice)
                    }

                    await FINANCIAL_GENERAL_JOURNAL_COLL.findByIdAndUpdate(
                        item._id,
                        {
                            unitprice, // Sau này bỏ trường này đi
                            amount,
                        },
                        { new: true }
                    )

                    // Ghi nhận dữ liệu lỗi
                    if (info.data.errGoods) {
                        arrGoodsFailed.push(item.goods)
                    }
                }

                /**
                 * B3: Lấy thông tin các hàng hóa xuất lỗi để hiển thị cho người dùng
                 */
                let listGoodsFailed = await ITEM__GOODS_COLL.find({
                    _id: { $in: arrGoodsFailed },
                })

                return resolve({ error: false, listGoodsFailed, accountID })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Cập nhật giá vốn cho hàng hóa cho các phiếu xuất trong 1 khoảng thời gian
     * Code: Hiepnh
     * Date: 3/1/2024
     */
    analysePrimeCostOfAllVouchers({
        companyID,
        fundaID,
        accountID,
        fromDate,
        toDate,
        userID,
        queue,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                // Mảng đệ quy tài khoản
                let arrObjectID = [ObjectID(accountID)]
                let infoAccount = await ITEM_ACCOUNT_COLL.findById(accountID)
                // console.log(infoAccount)

                if (['152', '156'].includes(infoAccount.name.toString())) {
                    if (infoAccount) {
                        let nestedChilds = infoAccount.nestedChilds.map(
                            (item) => ObjectID(item._id)
                        )
                        arrObjectID = [...arrObjectID, ...nestedChilds]
                    }

                    /**
                     * B1: Lấy danh sách các phiếu Xuất từ đầu kỳ đến cuối kỳ
                     * - Chỉ chạy giá vốn cho các phiếu Xuất
                     * - Không cần chạy lại các phiếu của kỳ trước, vì giá xuất đã được chạy chuẩn trước đó rồi
                     * - Không chạy giá vốn cho các phiếu kết chuyển cuối kỳ
                     * - Không chạy giá vốn cho các phiếu Huỷ
                     * - Không chạy giá vốn cho các phiếu xuất bán hàng vay mượn
                     */
                    let conditionOb = {}
                    if (!fundaID) {
                        conditionOb = {
                            company: companyID,
                            returning: 0, // Không chạy cho các Phiếu trả lại hàng mượn
                            forward: 0, // Không chạy cho các Phiếu kết chuyển cuối kỳ
                            cancel: 0, // Không chạy cho các Phiếu hủy
                            type: 5, // 5 là Phiếu xuất (cần check lại chỗ này vì đôi khi người dùng chọn nhầm Tên phiếu)
                            date: {
                                $gte: moment(fromDate).toDate(),
                                $lte: moment(toDate).toDate(),
                            },
                        }
                    } else {
                        conditionOb = {
                            funda: fundaID,
                            returning: 0, // Không chạy cho các Phiếu trả lại hàng mượn
                            forward: 0, // Không chạy cho các Phiếu kết chuyển cuối kỳ
                            cancel: 0, // Không chạy cho các Phiếu hủy
                            type: 5, // 5 Chỉ chạy cho các Phiếu xuất (cần check lại chỗ này vì đôi khi người dùng chọn nhầm Tên phiếu)
                            date: {
                                $gte: moment(fromDate).toDate(),
                                $lte: moment(toDate).toDate(),
                            },
                        }
                    }

                    let listVouchers = await FINANCIAL_VOUCHER_COLL.find(
                        conditionOb
                    )
                        .sort({ date: 1 })
                        .select('_id date name')
                        .lean()

                    if (!listVouchers.length) {
                        return resolve({ error: false, data: [] })
                    }

                    /**
                     * Xử lý Worker
                     */
                    for (const voucher of listVouchers) {
                        await queue.add(
                            'price_analyze',
                            {
                                voucher,
                                fundaID,
                                companyID,
                                userID,
                                arrObjectID,
                            },
                            {
                                backoff: 3,
                                attempts: 3,
                            }
                        )
                    }

                    return resolve({
                        error: false,
                        data: listVouchers,
                        status: 200,
                    })

                    // /**
                    //  * Khai báo arr hứng các hàng hóa có việc xuất bị sai
                    //  */
                    // let arrGoodsFailed = [];

                    // for(const voucher of listVouchers){
                    //     /**
                    //      * Lấy danh sách hàng hóa thuộc phiếu xuất
                    //      * Hàng hoá phải được gắn kèm thuộc kho bãi cụ thể
                    //      */
                    //     let listJournal = await FINANCIAL_GENERAL_JOURNAL_COLL.find({
                    //         voucher: voucher._id,
                    //         credit: {
                    //             $in: arrObjectID
                    //         },
                    //         goods: { $exists: true, $ne: null },
                    //         warehouse: { $exists: true, $ne: null }
                    //     })

                    //     for(const item of listJournal){
                    //         let info = null;
                    //         let unitprice = null;
                    //         let amount = null;

                    //         /**
                    //          * Lần lượt cập nhật giá vốn cho từng hàng hóa trong phiếu
                    //          * Giá vốn được tính tới thời điểm là ngày của phiếu đang xét
                    //          */
                    //         if(!fundaID){
                    //             // console.log('11111111111111111111111111')
                    //             // Kiểm tra chỉ chạy giá vốn khi tồn tại cả item.goods và item.warehouse
                    //             info = await that.getPrimeCost({ companyID, arrObjectID, goodsID: item.goods, warehouseID: item.warehouse, exportQuantity: item.quantity, toDate: voucher.date })
                    //             // console.log(info)

                    //             // Cập nhật giá vốn cho hàng hóa vào trong phiếu xuất
                    //             unitprice = info.data.primeCost

                    //             // amount = Number(+item.quantity * +unitprice).toFixed(0); // Bỏ làm tròn đi vì sẽ bị sai số cộng dồn
                    //             amount = Number(+item.quantity * +unitprice)
                    //         } else{
                    //             // console.log('22222222222222222222222222')
                    //             // Kiểm tra chỉ chạy giá vốn khi tồn tại cả item.goods và item.warehouse
                    //             info = await that.getPrimeCost({ fundaID, arrObjectID, goodsID: item.goods, warehouseID: item.warehouse, exportQuantity: item.quantity, toDate: voucher.date })

                    //             // Cập nhật giá vốn cho hàng hóa vào trong phiếu xuất
                    //             unitprice = info.data.primeCost

                    //             // amount = Number(+item.quantity * +unitprice).toFixed(0); // Bỏ làm tròn đi vì sẽ bị sai số cộng dồn
                    //             amount = Number(+item.quantity * +unitprice)
                    //         }

                    //         await FINANCIAL_GENERAL_JOURNAL_COLL.findByIdAndUpdate(item._id, {
                    //             unitprice, // Sau này bỏ trường này đi
                    //             amount
                    //         }, { new: true });

                    //         // Ghi nhận dữ liệu lỗi
                    //         if(info.data.errGoods){
                    //             arrGoodsFailed.push(item.goods);
                    //         }
                    //     }
                    // }

                    // /**
                    //  * B3: Lấy thông tin các hàng hóa xuất lỗi để hiển thị cho người dùng
                    //  */
                    // let listGoodsFailed = await ITEM__GOODS_COLL.find({ _id: { $in: arrGoodsFailed }});

                    // return resolve({ error: false, listGoodsFailed, accountID });
                } else {
                    return resolve({
                        error: true,
                        message:
                            'Tài khoản không hợp lệ: chỉ 152, 156 được phép',
                        status: 400,
                    })
                }
            } catch (error) {
                console.error({ error })
                return resolve({ error: true, message: error.message })
            }
        })
    }

    getListByFilter({
        companyID,
        fundaID,
        projectID,
        contractID,
        accountID,
        contactID,
        warehouseID,
        goodsID,
        voucherID,
        budgetID,
        budgetItemID,
        budgetGroupID,
        budgetWorkID,
        fromDate,
        toDate,
        forward,
        cancel,
        userID,
        contacts,
        limit = 50,
        lastestID,
        select,
        populates = {},
        sortKey,
        isExportExcel,
        ctx,
    }) {
        console.log({
            companyID,
            fundaID,
            projectID,
            contractID,
            accountID,
            contactID,
            warehouseID,
            goodsID,
            voucherID,
            budgetID,
            budgetItemID,
            budgetGroupID,
            budgetWorkID,
            fromDate,
            toDate,
            forward,
            cancel,
            userID,
            contacts,
            limit,
            lastestID,
            select,
            populates,
            sortKey,
            isExportExcel,
        })
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                if (limit > 50) {
                    limit = 50
                } else {
                    limit = +limit
                }

                let conditionObj = {}
                let sortBy
                let keys = ['date__1']

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

                if (!isNaN(forward)) {
                    conditionObj.forward = Number(forward)
                }

                if (!isNaN(cancel)) {
                    conditionObj.cancel = Number(cancel)
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

                if (fromDate && toDate) {
                    conditionObj.date = {
                        $gte: moment(fromDate).toDate(),
                        $lte: moment(toDate).toDate(),
                    }
                }

                if (checkObjectIDs(voucherID)) {
                    conditionObj.voucher = voucherID
                } else {
                    if (checkObjectIDs(contractID)) {
                        conditionObj.contract = contractID
                    } else {
                        if (checkObjectIDs(projectID)) {
                            conditionObj.project = projectID
                        } else {
                            if (checkObjectIDs(fundaID)) {
                                conditionObj.funda = fundaID
                            } else {
                                conditionObj.company = companyID
                            }
                        }
                    }
                }

                /**
                 * Sử dụng trong export excel document (hoặc theo bộ lọc)
                 * Trả về điều kiện tra cứu
                 */
                if (isExportExcel) {
                    // console.log(conditionObj)
                    return resolve({ data: conditionObj, error: false })
                }
                // console.log(conditionObj)
                // console.log({limit})

                let conditionObjOrg = { ...conditionObj }

                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await FINANCIAL_GENERAL_JOURNAL_COLL.findById(lastestID)
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

                let infoDataAfterGet =
                    await FINANCIAL_GENERAL_JOURNAL_COLL.find(conditionObj)
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
                    await FINANCIAL_GENERAL_JOURNAL_COLL.count(conditionObjOrg)
                let totalPage = Math.ceil(totalRecord / limit)

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit: limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                        lastestID,
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

    exportExcelByFilter({
        userID,
        companyID,
        type,
        filterParams,
        voucherID,
        ctx,
    }) {
        // console.log({ userID, companyID, type, filterParams, voucherID })
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                let conditionObj = {}
                let resultGetList = { error: true }

                const populates = JSON.stringify({
                    path: 'voucher debit credit customerCredit customerDebit warehouse goods contract budgetWork funda subtype',
                    select: 'type name sign description unit date parent',
                    populate: {
                        path: 'parent',
                        select: 'name sign',
                    },
                })

                switch (type) {
                    case 1:
                        resultGetList = await this.getListByFilter({
                            ...filterParams,
                            populates,
                            userID,
                            companyID,
                            isExportExcel: true,
                            ctx,
                        })
                        break

                    case 2:
                        resultGetList = await this.getListByFilter({
                            ...filterParams,
                            populates,
                            userID,
                            companyID,
                            isExportExcel: true,
                            ctx,
                        })
                        break

                    case 3:
                        resultGetList = await this.getListByFilter({
                            ...filterParams,
                            populates,
                            userID,
                            companyID,
                            isExportExcel: true,
                            ctx,
                        })
                        break

                    default:
                        resultGetList = await this.getListByFilter({
                            ...filterParams,
                            populates,
                            userID,
                            companyID,
                            isExportExcel: true,
                            ctx,
                        })
                        break
                }
                // console.log({resultGetList})

                if (!resultGetList.error) {
                    conditionObj = resultGetList.data
                }

                let keys = ['date__1', '_id__1']
                let dataPagingAndSort = await RANGE_BASE_PAGINATION_V2({
                    keys,
                    latestRecord: null,
                    objectQuery: conditionObj,
                })
                let sortBy = dataPagingAndSort?.data?.sort
                const listData = await FINANCIAL_GENERAL_JOURNAL_COLL.find(
                    conditionObj
                )
                    .populate(JSON.parse(populates))
                    .sort(sortBy)
                    .limit(10000)
                    .lean()

                if (!listData) {
                    return resolve({
                        error: true,
                        message: 'Không tìm thấy dữ liệu',
                        keyError: 'data_not_exists',
                        status: 400,
                    })
                }

                const result = await this.downloadExcelFile({
                    userID,
                    data: listData,
                    type,
                    voucherID,
                })
                return resolve(result)
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

    downloadExcelFile({ userID, data, type, voucherID }) {
        return new Promise((resolve) => {
            let template
            if (type == 1) {
                template =
                    '../../../files/templates/excels/accounting_journal_export.xlsx'
            } else if (type == 2) {
                template =
                    '../../../files/templates/excels/accounting_journal_export.xlsx'
            } else if (type == 3) {
                template =
                    '../../../files/templates/excels/accounting_voucher_detail.xlsx'
            }

            XlsxPopulate.fromFileAsync(path.resolve(__dirname, template)).then(
                async (workbook) => {
                    if (type == 1) {
                        var i = 3
                        data?.forEach((item, index) => {
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(1)
                                .value(item?.voucher?.date)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(2)
                                .value(item?.subtype?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(3)
                                .value(
                                    item?.voucher?.type &&
                                        item?.voucher?.type >= 1
                                        ? VOUCHER_TYPES[
                                              Number(item?.voucher?.type - 1)
                                          ].text
                                        : ''
                                )
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(4)
                                .value(item?.funda?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(5)
                                .value(item?.voucher?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(6)
                                .value(item?.voucher?.sign)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(7)
                                .value(item?.customerDebit?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(8)
                                .value(item?.customerCredit?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(9)
                                .value(item?.debit?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(10)
                                .value(item?.credit?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(11)
                                .value(Number(item?.quantity))
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(12)
                                .value(Number(item?.unitprice))
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(13)
                                .value(Number(item?.amount))
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(14)
                                .value(item?.contract?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(15)
                                .value(item?.budgetWork?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(16)
                                .value(Number(item?.updown))
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(17)
                                .value(item?.goods?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(18)
                                .value(item?.warehouse?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(19)
                                .value(item.note)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(20)
                                .value(item?.subtype?.parent?.name)
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(21)
                                .value(
                                    `M${item?.voucher?.date.getMonth() + 1}_${item?.voucher?.date.getFullYear()}`
                                )
                            workbook
                                .sheet('orgData')
                                .row(i)
                                .cell(22)
                                .value(item?.funda?.sign)

                            i++
                        })
                    } else if (type == 2) {
                        var i = 3
                        data?.forEach((item, index) => {
                            if (
                                item.debit._id &&
                                checkObjectIDs(item.debit._id)
                            ) {
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(1)
                                    .value(item?.voucher?.date)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(2)
                                    .value(
                                        item?.voucher?.type &&
                                            item?.voucher?.type >= 1
                                            ? VOUCHER_TYPES[
                                                  Number(
                                                      item?.voucher?.type - 1
                                                  )
                                              ].text
                                            : ''
                                    )
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(3)
                                    .value(item?.funda?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(4)
                                    .value(item?.voucher?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(5)
                                    .value(item?.voucher?.sign)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(6)
                                    .value(item?.customerDebit?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(7)
                                    .value(
                                        `${item?.debit?.name}-${item?.debit?.description}`
                                    )
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(8)
                                    .value(Number(item?.amount))
                                workbook.sheet('Data1').row(i).cell(9).value()
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(10)
                                    .value(item?.subtype?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(11)
                                    .value(item?.contract?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(12)
                                    .value(item?.budgetWork?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(13)
                                    .value(item?.goods?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(14)
                                    .value(item?.warehouse?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(15)
                                    .value(item.note)

                                i++
                            }

                            if (
                                item.credit._id &&
                                checkObjectIDs(item.credit._id)
                            ) {
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(1)
                                    .value(item?.voucher?.date)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(2)
                                    .value(
                                        item?.voucher?.type &&
                                            item?.voucher?.type >= 1
                                            ? VOUCHER_TYPES[
                                                  Number(
                                                      item?.voucher?.type - 1
                                                  )
                                              ].text
                                            : ''
                                    )
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(3)
                                    .value(item?.funda?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(4)
                                    .value(item?.voucher?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(5)
                                    .value(item?.voucher?.sign)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(6)
                                    .value(item?.customerCredit?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(7)
                                    .value(
                                        `${item?.credit?.name}-${item?.credit?.description}`
                                    )
                                workbook.sheet('Data1').row(i).cell(8).value()
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(9)
                                    .value(Number(item?.amount))
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(10)
                                    .value(item?.subtype?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(11)
                                    .value(item?.contract?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(12)
                                    .value(item?.budgetWork?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(13)
                                    .value(item?.goods?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(14)
                                    .value(item?.warehouse?.name)
                                workbook
                                    .sheet('Data1')
                                    .row(i)
                                    .cell(15)
                                    .value(item.note)

                                i++
                            }
                        })
                    } else if (type == 3) {
                        let infoAppUser =
                            await AUTH__APP_USER.checkPermissionsAccessApp({
                                appID: '61e049aefdebf77b072d1b12',
                                userID,
                            })
                        // console.log({infoAppUser})

                        let infoVoucher = await FINANCIAL_VOUCHER_COLL.findById(
                            voucherID
                        ).populate({
                            path: 'customer funda',
                            select: 'name sign address phone',
                        })

                        workbook
                            .sheet('Data')
                            .row(2)
                            .cell(1)
                            .value(`Mã hóa đơn: ${infoVoucher.sign}`)
                        workbook
                            .sheet('Data')
                            .row(3)
                            .cell(1)
                            .value(
                                `Ngày: ${moment(infoVoucher.date).format('DD/MM/YYYY')}`
                            )

                        workbook
                            .sheet('Data')
                            .row(5)
                            .cell(1)
                            .value(`Người gửi: ${infoVoucher.funda?.name}`)

                        workbook
                            .sheet('Data')
                            .row(8)
                            .cell(1)
                            .value(`Người nhận: ${infoVoucher.customer?.name}`)
                        workbook
                            .sheet('Data')
                            .row(9)
                            .cell(1)
                            .value(
                                `${infoVoucher.customer?.address} - ${infoVoucher.customer?.phone}`
                            )

                        workbook
                            .sheet('Data')
                            .row(12)
                            .cell(1)
                            .value(`Số sản phẩm: ${data?.length}`)

                        var i = 15
                        data?.forEach((item, index) => {
                            workbook
                                .sheet('Data')
                                .row(i)
                                .cell(1)
                                .value(Number(index + 1))
                            workbook
                                .sheet('Data')
                                .row(i)
                                .cell(2)
                                .value(item?.goods?.name)
                            workbook
                                .sheet('Data')
                                .row(i)
                                .cell(3)
                                .value(item?.goods?.unit)
                            workbook
                                .sheet('Data')
                                .row(i)
                                .cell(4)
                                .value(Number(item?.quantity))

                            // Show giá với Admin ứng dụng
                            if (infoAppUser && infoAppUser.data.level == 0) {
                                workbook
                                    .sheet('Data')
                                    .row(i)
                                    .cell(5)
                                    .value(Number(item?.unitprice))
                                workbook
                                    .sheet('Data')
                                    .row(i)
                                    .cell(6)
                                    .value(Number(item?.amount))
                            }

                            workbook
                                .sheet('Data')
                                .row(i)
                                .cell(7)
                                .value(item?.note)

                            i++
                        })

                        workbook
                            .sheet('Data')
                            .row(i + 2)
                            .cell(2)
                            .value('NGƯỜI GIAO')
                            .style({
                                bold: true,
                            })
                        workbook
                            .sheet('Data')
                            .row(i + 2)
                            .cell(5)
                            .value('NGƯỜI NHẬN')
                            .style({
                                bold: true,
                            })
                    }

                    const now = new Date()
                    const filePath = '../../../files/temporary_uploads/'
                    const fileName = `report_${now.getTime()}.xlsx`
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
                }
            )
        })
    }
}

exports.MODEL = new Model()
