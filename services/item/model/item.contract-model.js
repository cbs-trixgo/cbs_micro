'use strict'

const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const ObjectID = require('mongoose').Types.ObjectId

const BaseModel = require('../../../tools/db/base_model')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
    CF_ACTIONS_ANALYSIS,
} = require('../../analysis/helper/analysis.actions-constant')
const { CF_ACTIONS_ITEM } = require('../helper/item.actions-constant')
const { CF_ACTIONS_CMCS } = require('../../cmcs/helper/cmcs.actions-constant')
const { addDate } = require('../../../tools/utils/time_utils')

/**
 * TOOLS
 */
const {
    checkObjectIDs,
    IsJsonString,
    validateParamsObjectID,
} = require('../../../tools/utils/utils')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { uploadFileS3 } = require('../../../tools/s3')

/**
 * COLLECTIONS
 */
const AUTH__USER_COLL = require('../../auth/database/auth.user-coll')
const ITEM__CONTRACT_COLL = require('../database/item.contract-coll')

/**
 * SAU BỎ ĐI, CALL QUA SERVICE
 */
const CMCS__CONTRACT_PRODUCTION_COLL = require('../../cmcs/database/cmcs.contract_production-coll')
const CMCS__CONTRACT_IPC_COLL = require('../../cmcs/database/cmcs.contract_ipc-coll')
const CMCS__CONTRACT_PAYMENT_COLL = require('../../cmcs/database/cmcs.contract_payment-coll')
const CMCS__CONTRACT_EXPENSE_COLL = require('../../cmcs/database/cmcs.contract_expense-coll')

let dataTF = {
    appID: '6131d6f83f4b736dc93253b2', // CMCS
    menuID: '623f22b1e998e94feda0cd8b', //
    type: 1,
    action: 1, // Xem
}
let dataTF2 = {
    appID: '6131d6f83f4b736dc93253b2', // CMCS
    menuID: '623f22b1e998e94feda0cd8b', //
    type: 1,
    action: 2, // Thêm
}
class Model extends BaseModel {
    constructor() {
        super(ITEM__CONTRACT_COLL)
    }

    /**
     * Dev: HiepNH
     * Func: Tạo hợp đồng
     * Date: 13/12/2021
     */
    insert({
        projectID,
        parentID,
        admins,
        members,
        draft,
        outin,
        status,
        real,
        subType,
        type,
        field,
        dependentUnit,
        chair,
        personInCharge,
        debtStatus,
        warehouse,
        name,
        sign,
        storeSign,
        description,
        note,
        note1,
        date,
        startTime,
        endTime,
        buyerInfo,
        buyerBank,
        sellerInfo,
        sellerBank,
        packageName,
        lock,
        value,
        plus,
        vatValue,
        advancePayment,
        produce,
        plusProduce,
        vatProduce,
        acceptance,
        plusAcceptance,
        vatAcceptance,
        retainedValue,
        advancePaymentDeduction,
        otherDeduction,
        recommendedPayment,
        advancePaymentPaid,
        amountPaid,
        remainingPayment,
        advancePaymentOverage,
        finalValue,
        budget,
        vatBudget,
        forecastBudget,
        forecastVatBudget,
        managementFee,
        subcontractFee,
        expenses,
        profit,
        userID,
        remainingProduce,
        ontime,
        onbudget,
        cgValue,
        expiredCg,
        alertCg,
        agValue,
        alertAg,
        expiredAg,
        insuranceValue,
        expiredInsurance,
        alertInsurance,
        ctx,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (
                    !checkObjectIDs(projectID) ||
                    !checkObjectIDs(buyerInfo) ||
                    !checkObjectIDs(sellerInfo) ||
                    !checkObjectIDs(dependentUnit) ||
                    !checkObjectIDs(chair) ||
                    !checkObjectIDs(personInCharge) ||
                    !checkObjectIDs(field)
                )
                    return resolve({
                        error: true,
                        message:
                            'Request params projectID|buyerInfo|sellerInfo|dependentUnit|chair|personInCharge|field invalid',
                        status: 400,
                    })

                let dataInsert = {
                    project: projectID,
                    buyerInfo: buyerInfo,
                    sellerInfo: sellerInfo,
                    dependentUnit: dependentUnit,
                    personInCharge: personInCharge,
                    chair: chair,
                    field: field,
                    userCreate: userID,
                    members: [userID],
                    admins: [userID],
                    name,
                    sign,
                    date,
                }

                let infoProject = await ctx.call(
                    `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
                    {
                        departmentID: projectID,
                    }
                )

                if (infoProject.error)
                    return resolve({
                        error: true,
                        message: 'Request params project invalid',
                    })

                dataInsert.company = infoProject.data.company

                // company lấy theo product
                if (checkObjectIDs(parentID)) {
                    dataInsert.parent = parentID
                    let infoContractParent =
                        await ITEM__CONTRACT_COLL.findById(parentID)
                    if (infoContractParent) {
                        dataInsert.level = infoContractParent.level + 1
                    }
                }

                if (checkObjectIDs(admins)) {
                    dataInsert.admins = admins
                }

                if (checkObjectIDs(members)) {
                    dataInsert.members = members
                }

                if (draft) {
                    dataInsert.draft = draft
                }

                if (outin) {
                    dataInsert.outin = outin
                }

                if (status) {
                    dataInsert.status = status
                }

                if (real) {
                    dataInsert.real = real
                }

                if (subType) {
                    dataInsert.subType = subType
                }

                if (type) {
                    dataInsert.form = type
                }

                if (debtStatus) {
                    dataInsert.debtStatus = debtStatus
                }

                if (warehouse) {
                    dataInsert.warehouse = warehouse
                }

                if (name) {
                    dataInsert.name = name
                }

                if (sign) {
                    dataInsert.sign = sign
                }

                if (storeSign) {
                    dataInsert.storeSign = storeSign
                }

                if (description) {
                    dataInsert.description = description
                }

                if (note) {
                    dataInsert.note = note
                }

                if (note1) {
                    dataInsert.note1 = note1
                }

                if (date) {
                    dataInsert.date = date
                }

                if (startTime) {
                    dataInsert.startTime = startTime
                }

                if (endTime) {
                    dataInsert.endTime = endTime
                }

                if (buyerBank) {
                    dataInsert.buyerBank = buyerBank
                }

                if (buyerBank) {
                    dataInsert.buyerBank = buyerBank
                }

                if (sellerBank) {
                    dataInsert.sellerBank = sellerBank
                }

                if (packageName) {
                    dataInsert.packageName = packageName
                }

                if (lock) {
                    dataInsert.lock = lock
                }

                if (value) {
                    dataInsert.value = value
                }

                if (plus) {
                    dataInsert.plus = plus
                }

                if (vatValue) {
                    dataInsert.vatValue = vatValue
                }

                if (advancePayment) {
                    dataInsert.advancePayment = advancePayment
                }

                if (produce) {
                    dataInsert.produce = produce
                }

                if (plusProduce) {
                    dataInsert.plusProduce = plusProduce
                }

                if (vatProduce) {
                    dataInsert.vatProduce = vatProduce
                }

                if (acceptance) {
                    dataInsert.acceptance = acceptance
                }

                if (plusAcceptance) {
                    dataInsert.plusAcceptance = plusAcceptance
                }

                if (vatAcceptance) {
                    dataInsert.vatAcceptance = vatAcceptance
                }

                if (retainedValue) {
                    dataInsert.retainedValue = retainedValue
                }

                if (advancePaymentDeduction) {
                    dataInsert.advancePaymentDeduction = advancePaymentDeduction
                }

                if (otherDeduction) {
                    dataInsert.otherDeduction = otherDeduction
                }

                if (recommendedPayment) {
                    dataInsert.recommendedPayment = recommendedPayment
                }

                if (advancePaymentPaid) {
                    dataInsert.advancePaymentPaid = advancePaymentPaid
                }

                if (amountPaid) {
                    dataInsert.amountPaid = amountPaid
                }

                if (remainingPayment) {
                    dataInsert.remainingPayment = remainingPayment
                }

                if (advancePaymentOverage) {
                    dataInsert.advancePaymentOverage = advancePaymentOverage
                }

                if (finalValue) {
                    dataInsert.finalValue = finalValue
                }

                if (budget) {
                    dataInsert.budget = budget
                }

                if (vatBudget) {
                    dataInsert.vatBudget = vatBudget
                }

                if (forecastBudget) {
                    dataInsert.forecastBudget = forecastBudget
                }

                if (forecastVatBudget) {
                    dataInsert.forecastVatBudget = forecastVatBudget
                }

                if (managementFee) {
                    dataInsert.managementFee = managementFee
                }

                if (subcontractFee) {
                    dataInsert.subcontractFee = subcontractFee
                }

                if (expenses) {
                    dataInsert.expenses = expenses
                }

                if (profit) {
                    dataInsert.profit = profit
                }

                if (expiredCg != '') {
                    dataInsert.expiredCg = expiredCg
                } else {
                    dataInsert.expiredCg = null
                }

                if (!isNaN(cgValue) && Number(cgValue) >= 0) {
                    dataInsert.cgValue = cgValue
                }

                if (!isNaN(alertCg) && Number(alertCg) >= 0) {
                    dataInsert.alertCg = alertCg
                }

                if (expiredAg != '') {
                    dataInsert.expiredAg = expiredAg
                } else {
                    dataInsert.expiredAg = null
                }

                if (!isNaN(agValue) && Number(agValue) >= 0) {
                    dataInsert.agValue = agValue
                }

                if (!isNaN(alertAg) && Number(alertAg) >= 0) {
                    dataInsert.alertAg = alertAg
                }

                if (expiredInsurance != '') {
                    dataInsert.expiredInsurance = expiredInsurance
                } else {
                    dataInsert.expiredInsurance = null
                }

                if (!isNaN(insuranceValue) && Number(insuranceValue) >= 0) {
                    dataInsert.insuranceValue = insuranceValue
                }

                if (!isNaN(alertInsurance) && Number(alertInsurance) >= 0) {
                    dataInsert.alertInsurance = alertInsurance
                }

                if (remainingProduce) {
                    dataInsert.remainingProduce = remainingProduce
                }

                if (ontime) {
                    dataInsert.ontime = ontime
                }

                if (onbudget) {
                    dataInsert.onbudget = onbudget
                }

                let infoAfterInsert = await this.insertData(dataInsert)

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF2)

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Dev: HiepNH
     * Func: Cập nhật hợp đồng
     * Date: 13/12/2021
     */
    update({
        contractID,
        projectID,
        parentID,
        admins,
        adminsRemove,
        members,
        membersRemove,
        draft,
        outin,
        status,
        real,
        subType,
        type,
        field,
        dependentUnit,
        chair,
        personInCharge,
        debtStatus,
        warehouse,
        name,
        sign,
        storeSign,
        description,
        note,
        note1,
        date,
        startTime,
        endTime,
        buyerInfo,
        buyerBank,
        sellerInfo,
        sellerBank,
        packageName,
        lock,
        value,
        plus,
        vatValue,
        advancePayment,
        produce,
        plusProduce,
        vatProduce,
        acceptance,
        plusAcceptance,
        vatAcceptance,
        retainedValue,
        advancePaymentDeduction,
        otherDeduction,
        recommendedPayment,
        advancePaymentPaid,
        amountPaid,
        remainingPayment,
        advancePaymentOverage,
        finalValue,
        budget,
        vatBudget,
        forecastBudget,
        forecastVatBudget,
        managementFee,
        subcontractFee,
        expenses,
        profit,
        cgValue,
        expiredCg,
        agValue,
        expiredAg,
        dataInc,
        photos,
        ctx,
        remainingProduce,
        ontime,
        onbudget,
        userID,
        alertAg,
        alertCg,
        insuranceValue,
        expiredInsurance,
        alertInsurance,
    }) {
        // console.log({ contractID, projectID, parentID, admins, adminsRemove, members, membersRemove, draft, outin, status, real, subType, type, field, dependentUnit, chair, personInCharge, debtStatus, warehouse,
        //     name, sign, storeSign, description, note, note1, date, startTime, endTime, buyerInfo, buyerBank, sellerInfo, sellerBank, packageName, lock,
        //     value, plus, vatValue, advancePayment, produce, plusProduce, vatProduce, acceptance, plusAcceptance, vatAcceptance, retainedValue, advancePaymentDeduction, otherDeduction, recommendedPayment, advancePaymentPaid, amountPaid, remainingPayment, advancePaymentOverage, finalValue,
        //     budget, vatBudget, forecastBudget, forecastVatBudget, managementFee, subcontractFee, expenses, profit,
        //     cgValue, expiredCg, agValue, expiredAg, dataInc, photos, remainingProduce,  ontime, onbudget, userID
        //     })
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * CẬP NHẬT LẠI CÁC THUỘC TÍNH CHO SẢN LƯỢNG, NGHIỆM THU, TIỀN VỀ
                 * - outin,...
                 * - projectID
                 * - field
                 * - chair
                 * - personInCharge
                 * - buyerInfo
                 * - sellerInfo
                 */

                // if(!checkObjectIDs(contractID) || !checkObjectIDs(projectID) || !checkObjectIDs(buyerInfo) || !checkObjectIDs(sellerInfo) || !checkObjectIDs(dependentUnit) || !checkObjectIDs(chair) || !checkObjectIDs(personInCharge) || !checkObjectIDs(field))
                //     return resolve({ error: true, message: 'Request params projectID|buyerInfo|sellerInfo|dependentUnit|chair|personInCharge|field invalid', status: 400 });
                let dataUpdate = {}
                let dataAddToSet = {}
                let dataPull = {}

                const infoContract =
                    await ITEM__CONTRACT_COLL.findById(contractID).lean()

                if (!infoContract) {
                    return resolve({
                        error: true,
                        message: 'Hợp đồng không tồn tại',
                        keyError: 'contract_not_exists',
                        status: 400,
                    })
                }

                if (checkObjectIDs(parentID)) {
                    dataUpdate.parent = parentID
                    let infoContractParent =
                        await ITEM__CONTRACT_COLL.findById(parentID)
                    if (infoContractParent) {
                        dataUpdate.level = infoContractParent.level + 1
                    }
                }

                /**
                 * TẠM THỜI CHƯA KIỂM SOÁT ĐƯỢC THÔNG TIN => CHƯA CHO UPDATE TRƯỜNG NÀY
                 */
                // if(checkObjectIDs(projectID)){
                //     dataUpdate.projectID = projectID;
                // }

                if (name) {
                    dataUpdate.name = name
                }

                if (sign) {
                    dataUpdate.sign = sign
                }

                if (date) {
                    dataUpdate.date = date
                }

                if (checkObjectIDs(admins)) {
                    dataAddToSet.admins = admins
                }

                if (checkObjectIDs(members)) {
                    dataAddToSet.members = members
                }

                if (checkObjectIDs(adminsRemove)) {
                    dataPull.admins = adminsRemove
                }

                if (checkObjectIDs(membersRemove)) {
                    dataPull.members = membersRemove
                }

                if (draft) {
                    dataUpdate.draft = draft
                }

                if (outin) {
                    dataUpdate.outin = outin
                }

                if (status) {
                    dataUpdate.status = status
                }

                if (real) {
                    dataUpdate.real = real
                }

                if (subType) {
                    dataUpdate.subType = subType
                }

                if (type) {
                    dataUpdate.form = type
                }

                if (checkObjectIDs(field)) {
                    dataUpdate.field = field
                }

                if (checkObjectIDs(dependentUnit)) {
                    dataUpdate.dependentUnit = dependentUnit
                }

                if (checkObjectIDs(personInCharge)) {
                    dataUpdate.personInCharge = personInCharge
                }

                if (checkObjectIDs(chair)) {
                    dataUpdate.chair = chair
                }

                if (debtStatus) {
                    dataUpdate.debtStatus = debtStatus
                }

                if (warehouse) {
                    dataUpdate.warehouse = warehouse
                }

                if (name) {
                    dataUpdate.name = name
                }

                if (sign) {
                    dataUpdate.sign = sign
                }

                if (storeSign) {
                    dataUpdate.storeSign = storeSign
                }

                if (description) {
                    dataUpdate.description = description
                }

                if (note) {
                    dataUpdate.note = note
                }

                if (note1) {
                    dataUpdate.note1 = note1
                }

                if (date) {
                    dataUpdate.date = date
                }

                if (startTime) {
                    dataUpdate.startTime = startTime
                }

                if (endTime) {
                    dataUpdate.endTime = endTime
                }

                if (checkObjectIDs(buyerInfo)) {
                    dataUpdate.buyerInfo = buyerInfo
                }

                if (buyerBank) {
                    dataUpdate.buyerBank = buyerBank
                }

                if (checkObjectIDs(sellerInfo)) {
                    dataUpdate.sellerInfo = sellerInfo
                }

                if (buyerBank) {
                    dataUpdate.buyerBank = buyerBank
                }

                if (sellerBank) {
                    dataUpdate.sellerBank = sellerBank
                }

                if (packageName) {
                    dataUpdate.packageName = packageName
                }

                if (lock) {
                    dataUpdate.lock = lock
                }

                if (!isNaN(value) && Number(value) >= 0) {
                    dataUpdate.value = value
                }

                if (!isNaN(plus) && Number(plus) >= 0) {
                    dataUpdate.plus = plus
                }

                if (!isNaN(vatValue) && Number(vatValue) >= 0) {
                    dataUpdate.vatValue = vatValue
                }

                if (!isNaN(advancePayment) && Number(advancePayment) >= 0) {
                    dataUpdate.advancePayment = advancePayment
                }

                if (!isNaN(produce) && Number(produce) >= 0) {
                    dataUpdate.produce = produce
                }

                if (!isNaN(plusProduce) && Number(plusProduce) >= 0) {
                    dataUpdate.plusProduce = plusProduce
                }

                if (!isNaN(vatProduce) && Number(vatProduce) >= 0) {
                    dataUpdate.vatProduce = vatProduce
                }

                if (!isNaN(acceptance) && Number(acceptance) >= 0) {
                    dataUpdate.acceptance = acceptance
                }

                if (!isNaN(vatAcceptance) && Number(vatAcceptance) >= 0) {
                    dataUpdate.vatAcceptance = vatAcceptance
                }

                if (!isNaN(plusAcceptance) && Number(plusAcceptance) >= 0) {
                    dataUpdate.plusAcceptance = plusAcceptance
                }

                // if(!isNaN(vatPlusAcceptance) && Number(vatPlusAcceptance) >= 0){
                //     dataUpdate.vatPlusAcceptance = vatPlusAcceptance;
                // }

                if (!isNaN(retainedValue) && Number(retainedValue) >= 0) {
                    dataUpdate.retainedValue = retainedValue
                }

                if (
                    !isNaN(advancePaymentDeduction) &&
                    Number(advancePaymentDeduction) >= 0
                ) {
                    dataUpdate.advancePaymentDeduction = advancePaymentDeduction
                }

                if (!isNaN(otherDeduction) && Number(otherDeduction) >= 0) {
                    dataUpdate.otherDeduction = otherDeduction
                }

                if (
                    !isNaN(recommendedPayment) &&
                    Number(recommendedPayment) >= 0
                ) {
                    dataUpdate.recommendedPayment = recommendedPayment
                }

                if (
                    !isNaN(advancePaymentPaid) &&
                    Number(advancePaymentPaid) >= 0
                ) {
                    dataUpdate.advancePaymentPaid = advancePaymentPaid
                }

                if (!isNaN(amountPaid) && Number(amountPaid) >= 0) {
                    dataUpdate.amountPaid = amountPaid
                }

                if (!isNaN(remainingPayment) && Number(remainingPayment) >= 0) {
                    dataUpdate.remainingPayment = remainingPayment
                }

                if (
                    !isNaN(advancePaymentOverage) &&
                    Number(advancePaymentOverage) >= 0
                ) {
                    dataUpdate.advancePaymentOverage = advancePaymentOverage
                }

                if (!isNaN(finalValue) && Number(finalValue) >= 0) {
                    dataUpdate.finalValue = finalValue
                }

                if (!isNaN(budget) && Number(budget) >= 0) {
                    dataUpdate.budget = budget
                }

                if (!isNaN(vatBudget) && Number(vatBudget) >= 0) {
                    dataUpdate.vatBudget = vatBudget // fix lại chỗ này
                }

                if (!isNaN(forecastBudget) && Number(forecastBudget) >= 0) {
                    dataUpdate.forecastBudget = forecastBudget
                }

                if (
                    !isNaN(forecastVatBudget) &&
                    Number(forecastVatBudget) >= 0
                ) {
                    dataUpdate.forecastVatBudget = forecastVatBudget
                }

                if (!isNaN(managementFee) && Number(managementFee) >= 0) {
                    dataUpdate.managementFee = managementFee
                }

                if (!isNaN(subcontractFee) && Number(subcontractFee) >= 0) {
                    dataUpdate.subcontractFee = subcontractFee
                }

                if (!isNaN(expenses) && Number(expenses) >= 0) {
                    dataUpdate.expenses = expenses
                }

                if (!isNaN(profit) && Number(profit) >= 0) {
                    dataUpdate.profit = profit
                }

                if (expiredCg != '') {
                    dataUpdate.expiredCg = expiredCg
                } else {
                    dataUpdate.expiredCg = null
                }

                if (!isNaN(cgValue) && Number(cgValue) >= 0) {
                    dataUpdate.cgValue = cgValue
                }

                if (!isNaN(alertCg) && Number(alertCg) >= 0) {
                    dataUpdate.alertCg = alertCg
                }

                if (expiredAg != '') {
                    dataUpdate.expiredAg = expiredAg
                } else {
                    dataUpdate.expiredAg = null
                }

                if (!isNaN(agValue) && Number(agValue) >= 0) {
                    dataUpdate.agValue = agValue
                }

                if (!isNaN(alertAg) && Number(alertAg) >= 0) {
                    dataUpdate.alertAg = alertAg
                }

                if (expiredInsurance != '') {
                    dataUpdate.expiredInsurance = expiredInsurance
                } else {
                    dataUpdate.expiredInsurance = null
                }

                if (!isNaN(insuranceValue) && Number(insuranceValue) >= 0) {
                    dataUpdate.insuranceValue = insuranceValue
                }

                if (!isNaN(alertInsurance) && Number(alertInsurance) >= 0) {
                    dataUpdate.alertInsurance = alertInsurance
                }

                if (dataAddToSet) {
                    dataUpdate.$addToSet = dataAddToSet
                }

                if (dataPull) {
                    dataUpdate.$pullAll = dataPull
                }

                if (dataInc) {
                    dataUpdate.$inc = dataInc
                }

                if (photos && photos.length) {
                    if (infoContract.photos.length >= 10) {
                        await ITEM__CONTRACT_COLL.findByIdAndUpdate(
                            contractID,
                            {
                                $push: {
                                    photos: {
                                        $each: photos,
                                        $position: 0,
                                        $slice: 10,
                                    },
                                },
                            }
                        )
                    } else {
                        await ITEM__CONTRACT_COLL.findByIdAndUpdate(
                            contractID,
                            {
                                $push: {
                                    photos: {
                                        $each: photos,
                                        $position: 0,
                                    },
                                },
                            }
                        )
                    }
                }

                if (remainingProduce) {
                    dataUpdate.remainingProduce = remainingProduce
                }

                if (ontime) {
                    dataUpdate.ontime = ontime
                }

                if (onbudget) {
                    dataUpdate.onbudget = onbudget
                }

                // console.log(dataUpdate)

                let infoAfterInsert =
                    await ITEM__CONTRACT_COLL.findByIdAndUpdate(
                        contractID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Cannot update contract',
                        status: 422,
                    })

                // console.log(infoAfterInsert)

                /**
                 * CẬP NHẬT LẠI CÁC THUỘC TÍNH CHO SẢN LƯỢNG, NGHIỆM THU, TIỀN VỀ
                 * 24/4/2022: Hiepnh => Đệ viết giúp anh API bên các service của CMCS để call sang, thay vì anh đang call trực tiếp theo Collection nhé
                 * - projectID
                 * - field
                 * - dependentUnit
                 * - personInCharge
                 * - chair
                 * - buyerInfo
                 * - sellerInfo
                 */
                let {
                    outin: outinAfterUpdate,
                    real: realAfterUpdate,
                    field: fieldAfterUpdate,
                    dependentUnit: dependentUnitAfterUpdate,
                    personInCharge: personInChargeAfterUpdate,
                    chair: chairAfterUpdate,
                    buyerInfo: buyerInfoAfterUpdate,
                    sellerInfo: sellerInfoAfterUpdate,
                    // project: projectAfterUpdate
                } = infoAfterInsert

                let fieldUpdate = {
                    outin: Number(outinAfterUpdate),
                    real: Number(realAfterUpdate),
                    field: ObjectID(fieldAfterUpdate),
                    dependentUnit: ObjectID(dependentUnitAfterUpdate),
                    personInCharge: ObjectID(personInChargeAfterUpdate),
                    chair: ObjectID(chairAfterUpdate),
                    buyerInfo: ObjectID(buyerInfoAfterUpdate),
                    sellerInfo: ObjectID(sellerInfoAfterUpdate),
                    // "project" : ObjectID(projectAfterUpdate)
                }

                // HiepNH: Dùng tạm theo cách này, sau bổ theo call Service
                await CMCS__CONTRACT_PRODUCTION_COLL.updateMany(
                    { contract: ObjectID(contractID) },
                    { $set: fieldUpdate }
                )

                await CMCS__CONTRACT_IPC_COLL.updateMany(
                    { contract: ObjectID(contractID) },
                    { $set: fieldUpdate }
                )

                await CMCS__CONTRACT_PAYMENT_COLL.updateMany(
                    { contract: ObjectID(contractID) },
                    { $set: fieldUpdate }
                )

                await CMCS__CONTRACT_EXPENSE_COLL.updateMany(
                    { contract: ObjectID(contractID) },
                    { $set: fieldUpdate }
                )

                /**
                 * CẬP NHẬT LẠI THÔNG TIN CHO DỰ ÁN
                 */
                let infoProject = await ctx.call(
                    `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE_VALUE}`,
                    {
                        option: 2,
                        projectID: `${projectID}`,
                        userID,
                    }
                )

                return resolve({
                    error: false,
                    data: infoAfterInsert,
                    status: 200,
                })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Cập nhật giá trị
     * Author: Hiepnh
     * Date  : 16/4/2022
     */
    updateValue({ contractID, userID, option, ctx }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Cập nhật giá trị ngân sách
                 * 2-Cập nhật dự báo ngân sách
                 * 3-Cập nhật thực hiện ngân sách
                 */

                if (!checkObjectIDs(contractID))
                    return resolve({
                        error: true,
                        message: 'Mã hiệu không đúng',
                        keyError: 'contractID_invalid',
                    })

                let infoContract =
                    await ITEM__CONTRACT_COLL.findById(contractID)
                // console.log({infoContract})

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = { userUpdate: userID, modifyAt: Date.now() }

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */

                //1-Cập nhật Sản lượng
                if (option && Number(option) === 1) {
                    // console.log('1-Cập nhật Sản lượng')
                    let infoIpcContract = await ctx.call(
                        `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_AMOUNT_BY_OBJECT}`,
                        {
                            userID,
                            contractID,
                        }
                    )

                    // Sản lượng còn lại chưa thực hiện
                    let totalValue = 0,
                        remainingProduce = 0
                    totalValue =
                        Number(infoContract.value | 0) +
                        Number(infoContract.vatValue | 0) +
                        Number(infoContract.plus | 0) +
                        Number(infoContract.vatPlus | 0)

                    remainingProduce =
                        Number(totalValue) -
                        Number(infoIpcContract.data.produce) -
                        Number(infoIpcContract.data.vatProduce) -
                        Number(infoIpcContract.data.plusProduce) -
                        Number(infoIpcContract.data.vatPlusProduce)
                    // console.log({totalValue})
                    // console.log({remainingProduce})

                    // console.log(infoIpcContract)
                    if (infoIpcContract) {
                        dataUpdate.produce = Number(
                            infoIpcContract.data.produce
                        )
                        dataUpdate.vatProduce = Number(
                            infoIpcContract.data.vatProduce
                        )
                        dataUpdate.plusProduce = Number(
                            infoIpcContract.data.plusProduce
                        )
                        dataUpdate.vatPlusProduce = Number(
                            infoIpcContract.data.vatPlusProduce
                        )
                        dataUpdate.remainingProduce = Number(remainingProduce)
                    }
                }

                //2-Cập nhật Doanh thu, tiền về
                if (option && Number(option) === 2) {
                    // console.log('2-Cập nhật Doanh thu, tiền về HỢP ĐỒNG=====>>>>>')
                    let infoIpcContract = await ctx.call(
                        `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_OBJECT}`,
                        {
                            userID,
                            contractID,
                        }
                    )
                    // console.log(infoIpcContract)

                    if (infoIpcContract) {
                        dataUpdate.acceptance = Number(
                            infoIpcContract.data.acceptance
                        )
                        dataUpdate.vatAcceptance = Number(
                            infoIpcContract.data.vatAcceptance
                        )
                        dataUpdate.plusAcceptance = Number(
                            infoIpcContract.data.plusAcceptance
                        )
                        dataUpdate.vatPlusAcceptance = Number(
                            infoIpcContract.data.vatPlusAcceptance
                        )
                        dataUpdate.retainedValue = Number(
                            infoIpcContract.data.retainedValue
                        )
                        dataUpdate.advancePaymentDeduction = Number(
                            infoIpcContract.data.advancePaymentDeduction
                        )
                        dataUpdate.otherDeduction = Number(
                            infoIpcContract.data.otherDeduction
                        )
                        dataUpdate.recommendedPayment = Number(
                            infoIpcContract.data.recommendedPayment
                        )
                        dataUpdate.advancePaymentPaid = Number(
                            infoIpcContract.data.advancePaymentPaid
                        )
                        dataUpdate.amountPaid = Number(
                            infoIpcContract.data.amountPaid
                        )
                        dataUpdate.remainingPayment =
                            Number(infoIpcContract.data.recommendedPayment) -
                            Number(infoIpcContract.data.advancePaymentPaid) -
                            Number(infoIpcContract.data.amountPaid)
                    }

                    // console.log(dataUpdate)
                }

                //3-Cập nhật Chi phí
                if (option && Number(option) === 3) {
                    // console.log('3-Cập nhật Chi phí')
                    let infoExpenseContract = await ctx.call(
                        `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_AMOUNT_BY_OBJECT}`,
                        {
                            userID,
                            contractID,
                        }
                    )
                    // console.log(infoExpenseContract)
                    if (infoExpenseContract) {
                        dataUpdate.expense = Number(
                            infoExpenseContract.data.value
                        )
                    }
                }

                //4-Cập nhật Ngân sách

                let infoAfterUpdate =
                    await ITEM__CONTRACT_COLL.findByIdAndUpdate(
                        contractID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: "can't_update_contract_ipc",
                        status: 403,
                    })

                // console.log(infoAfterUpdate)

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
     * Name: Remove Hợp đồng KHÔNG CHO PHÉP XÓA CÁC DANH MỤC
     * Author: Depv
     * Code:
     */

    /**
     * Name: get Hợp đồng
     * Author: Depv/HiepNH
     * Code: 22/9/2022
     */
    getInfo({ contractID, userID, select, populates, ctx }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(contractID))
                    return resolve({
                        error: true,
                        message: 'Request params contractID invalid',
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

                let infoUser =
                    await AUTH__USER_COLL.findById(userID).select('company')
                await ITEM__CONTRACT_COLL.findByIdAndUpdate(
                    contractID,
                    {
                        $inc: {
                            numberOfViews: 1,
                        },
                        $addToSet: {
                            companyViews: infoUser.company,
                            userViews: userID,
                        },
                    },
                    { new: true }
                )

                let info = await ITEM__CONTRACT_COLL.findById(contractID)
                    .select(select)
                    .populate(populates)
                if (!info)
                    return resolve({
                        error: true,
                        message: "can't_get_info",
                        status: 403,
                    })

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                return resolve({ error: false, data: info, status: 200 })
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
     * Name  : Danh sách hợp đồng
     * Author: Depv
     * Code  :
     */
    getList({
        companyID,
        projectID,
        parentID,
        draft,
        outin,
        status,
        real,
        subType,
        type,
        field,
        dependentUnit,
        chair,
        personInCharge,
        debtStatus,
        warehouse,
        isExportExcel = false,
        startTime,
        endTime,
        buyerInfo,
        sellerInfo,
        lock,
        userID,
        isExpiredAg,
        isExpiredCg,
        isExpiredInsurance,
        isMember,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates = {},
        ctx,
    }) {
        // console.log({companyID, projectID, parentID, draft, outin, status, real, subType, type, field, dependentUnit, chair, personInCharge, debtStatus, warehouse, isExportExcel,
        //     startTime, endTime, buyerInfo, sellerInfo, lock, userID, isExpiredAg, isExpiredCg, isMember,
        //     keyword})
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                let conditionObj = {}
                let keys = ['date__-1', '_id__-1']
                let sortBy

                if (limit > 20) {
                    limit = 20
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

                if (!checkObjectIDs(companyID) && !checkObjectIDs(projectID))
                    return resolve({
                        error: true,
                        message:
                            'Bắt buộc phải truyền companyID hoặc projectID',
                        keyError: 'params_invalid',
                    })

                if (checkObjectIDs(projectID)) {
                    conditionObj.project = projectID
                } else if (checkObjectIDs(companyID)) {
                    conditionObj.company = companyID
                }

                if (parentID) {
                    conditionObj.parent = parentID
                }

                if (draft && Number(draft) > 0) {
                    conditionObj.draft = Number(draft)
                }

                if (outin && Number(outin) > 0) {
                    conditionObj.outin = Number(outin)
                }

                if (status && Number(status) > 0) {
                    conditionObj.status = Number(status)
                }

                if (real && Number(real) > 0) {
                    conditionObj.real = Number(real)
                }

                if (subType && Number(subType) > 0) {
                    conditionObj.subType = Number(subType)
                }

                if (type && Number(type) > 0) {
                    conditionObj.type = Number(type)
                }

                if (field && checkObjectIDs(field)) {
                    conditionObj.field = ObjectID(field)
                }

                if (chair && checkObjectIDs(chair)) {
                    conditionObj.chair = ObjectID(chair)
                }

                if (dependentUnit && checkObjectIDs(dependentUnit)) {
                    conditionObj.dependentUnit = ObjectID(dependentUnit)
                }

                if (personInCharge && checkObjectIDs(personInCharge)) {
                    conditionObj.personInCharge = ObjectID(personInCharge)
                }

                if (buyerInfo && checkObjectIDs(buyerInfo)) {
                    conditionObj.buyerInfo = ObjectID(buyerInfo)
                }

                if (sellerInfo && checkObjectIDs(sellerInfo)) {
                    conditionObj.sellerInfo = ObjectID(sellerInfo)
                }

                if (debtStatus && checkObjectIDs(debtStatus)) {
                    conditionObj.debtStatus = ObjectID(debtStatus)
                }

                if (warehouse && checkObjectIDs(warehouse)) {
                    conditionObj.warehouse = ObjectID(warehouse)
                }

                if (startTime) {
                    conditionObj.startTime = startTime
                }

                if (endTime) {
                    conditionObj.endTime = endTime
                }

                if (lock) {
                    conditionObj.lock = lock
                }

                // Theo dõi bảo lãnh tạm ứng
                if (isExpiredAg == 1) {
                    keys = ['expiredAg__1', '_id__-1']

                    conditionObj.expiredAg = { $exists: true, $ne: null }
                    conditionObj.status = { $ne: 3 } // Chỉ lấy các hợp đồng chưa hoàn thành
                }

                // Theo dõi bảo lãnh thực hiện hợp đồng
                if (isExpiredCg == 1) {
                    keys = ['expiredCg__1', '_id__-1']

                    conditionObj.expiredCg = { $exists: true, $ne: null }
                    conditionObj.status = { $ne: 3 } // Chỉ lấy các hợp đồng chưa hoàn thành
                }

                // Theo dõi bảo lãnh bảo hành
                if (isExpiredInsurance == 1) {
                    keys = ['expiredInsurance__1', '_id__-1']

                    conditionObj.expiredInsurance = { $exists: true, $ne: null }
                    conditionObj.status = { $ne: 3 } // Chỉ lấy các hợp đồng chưa hoàn thành
                }

                if (isMember == 1) {
                    conditionObj.members = { $in: [userID] }
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    const regSearch = new RegExp(keyword, 'i')

                    conditionObj.$or = [
                        { name: regSearch },
                        { sign: regSearch },
                        { storeSign: regSearch },
                    ]
                }

                // console.log('==============>>>>>>>>>>>>>')
                // console.log(conditionObj)

                /**
                 * Purpose: Sử dụng trong export excel (hoặc theo bộ lọc)
                 * Function: exportContract (model)
                 */
                if (isExportExcel) {
                    return resolve({ data: conditionObj, error: false })
                }

                let conditionObjOrg = { ...conditionObj }

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await ITEM__CONTRACT_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastestID",
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

                    conditionObj = dataPagingAndSort?.data?.find
                    sortBy = dataPagingAndSort?.data?.sort
                } else {
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: null,
                        objectQuery: conditionObjOrg,
                    })
                    sortBy = dataPagingAndSort?.data?.sort
                }

                let infoDataAfterGet = await ITEM__CONTRACT_COLL.find(
                    conditionObj
                )
                    .limit(+limit + 1)
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
                    await ITEM__CONTRACT_COLL.count(conditionObjOrg)
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
     * Name: Tổng hợp số liệu bảo lãnh và lấy danh sách bảo lãnh
     * Author: HiepNH
     * Code: 2/10/2022
     */
    getListGuarantee({
        userID,
        companyID,
        projectID,
        contractID,
        outin,
        option,
        guaranteeType,
        subType,
        keyword,
        limit,
        lastestID,
        populates,
        select,
    }) {
        // console.log({userID, companyID, projectID, contractID, outin, option, guaranteeType})
        return new Promise(async (resolve) => {
            try {
                let conditionObj = { status: { $ne: 3 } }
                let conditionObj1 = { status: { $ne: 3 } }
                let conditionObj2 = { status: { $ne: 3 } }
                let conditionObj3 = { status: { $ne: 3 } }
                let conditionObj4 = { status: { $ne: 3 } }
                let conditionGuaranteeObj = {}

                if (checkObjectIDs(contractID)) {
                    conditionObj.contract = ObjectID(contractID)
                    conditionObj1.contract = ObjectID(contractID)
                    conditionObj2.contract = ObjectID(contractID)
                    conditionObj3.contract = ObjectID(contractID)
                    conditionObj4.contract = ObjectID(contractID)
                } else {
                    if (checkObjectIDs(projectID)) {
                        conditionObj.project = ObjectID(projectID)
                        conditionObj1.project = ObjectID(projectID)
                        conditionObj2.project = ObjectID(projectID)
                        conditionObj3.project = ObjectID(projectID)
                        conditionObj4.project = ObjectID(projectID)
                    } else {
                        conditionObj.company = ObjectID(companyID)
                        conditionObj1.company = ObjectID(companyID)
                        conditionObj2.company = ObjectID(companyID)
                        conditionObj3.company = ObjectID(companyID)
                        conditionObj4.company = ObjectID(companyID)
                    }
                }

                if (outin && Number(outin) > 0) {
                    conditionObj.outin = Number(outin)
                    conditionObj1.outin = Number(outin)
                    conditionObj2.outin = Number(outin)
                    conditionObj3.outin = Number(outin)
                    conditionObj4.outin = Number(outin)
                }

                let start = new Date()
                start.setHours(0, 0, 0, 0)

                if (!option) {
                    // console.log('===============Danh sách bảo lãnh===================')

                    // Danh sách mẩu tin theo điều kiện
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

                    if (!isNaN(outin) && Number(outin) > 0) {
                        conditionObj.outin = Number(outin)
                    }

                    if (projectID && checkObjectIDs(projectID)) {
                        conditionObj.project = ObjectID(projectID)
                    } else {
                        if (companyID && checkObjectIDs(companyID)) {
                            conditionObj.company = ObjectID(companyID)
                        }
                    }

                    // Bảo lãnh tạm ứng
                    if (guaranteeType && Number(guaranteeType) == 1) {
                        // console.log('===============Bảo lãnh tạm ứng===================')
                        conditionObj.status = { $ne: 3 }
                        conditionObj.expiredAg = {
                            $exists: true,
                            $ne: null,
                        }

                        if (subType && Number(subType) == 1) {
                            conditionObj.expiredAg = {
                                $exists: true,
                                $ne: null,
                                $lt: start,
                            }
                        }
                        if (subType && Number(subType) == 2) {
                            conditionObj.expiredAg = {
                                $exists: true,
                                $ne: null,
                                $gte: start,
                                $lt: addDate(7),
                            }
                        }
                        if (subType && Number(subType) == 3) {
                            conditionObj.expiredAg = {
                                $exists: true,
                                $ne: null,
                                $gte: addDate(7),
                                $lte: addDate(30),
                            }
                        }
                        if (subType && Number(subType) == 4) {
                            conditionObj.expiredAg = {
                                $exists: true,
                                $ne: null,
                                $gt: addDate(30),
                            }
                        }
                    }

                    // Bảo lãnh hợp đồng
                    if (guaranteeType && Number(guaranteeType) == 2) {
                        // console.log('===============Bảo lãnh hợp đồng===================')
                        conditionObj.status = { $ne: 3 }
                        conditionObj.expiredCg = {
                            $exists: true,
                            $ne: null,
                        }

                        if (subType && Number(subType) == 1) {
                            conditionObj.expiredCg = {
                                $exists: true,
                                $ne: null,
                                $lt: start,
                            }
                        }
                        if (subType && Number(subType) == 2) {
                            conditionObj.expiredCg = {
                                $exists: true,
                                $ne: null,
                                $gte: start,
                                $lt: addDate(7),
                            }
                        }
                        if (subType && Number(subType) == 3) {
                            conditionObj.expiredCg = {
                                $exists: true,
                                $ne: null,
                                $gte: addDate(7),
                                $lte: addDate(30),
                            }
                        }
                        if (subType && Number(subType) == 4) {
                            conditionObj.expiredCg = {
                                $exists: true,
                                $ne: null,
                                $gt: addDate(30),
                            }
                        }
                    }

                    // Bảo lãnh bảo hành
                    if (guaranteeType && Number(guaranteeType) == 3) {
                        // console.log('===============Bảo lãnh bảo hành===================')
                        conditionObj.status = { $ne: 3 }
                        conditionObj.expiredInsurance = {
                            $exists: true,
                            $ne: null,
                        }

                        if (subType && Number(subType) == 1) {
                            conditionObj.expiredInsurance = {
                                $exists: true,
                                $ne: null,
                                $lt: start,
                            }
                        }
                        if (subType && Number(subType) == 2) {
                            conditionObj.expiredInsurance = {
                                $exists: true,
                                $ne: null,
                                $gte: start,
                                $lt: addDate(7),
                            }
                        }
                        if (subType && Number(subType) == 3) {
                            conditionObj.expiredInsurance = {
                                $exists: true,
                                $ne: null,
                                $gte: addDate(7),
                                $lte: addDate(30),
                            }
                        }
                        if (subType && Number(subType) == 4) {
                            conditionObj.expiredInsurance = {
                                $exists: true,
                                $ne: null,
                                $gt: addDate(30),
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

                    // PHÂN TRANG KIỂU MỚI
                    if (lastestID && checkObjectIDs(lastestID)) {
                        let infoData =
                            await ITEM__CONTRACT_COLL.findById(lastestID)
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

                    let infoDataAfterGet = await ITEM__CONTRACT_COLL.find(
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
                        await ITEM__CONTRACT_COLL.count(conditionObjOrg)
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
                } else {
                    // console.log('==============Tổng hợp phân loại bảo lãnh===================')

                    // Bảo lãnh tạm ứng
                    if (guaranteeType && Number(guaranteeType) == 1) {
                        conditionObj1.expiredAg = {
                            $lt: start,
                        }
                        conditionObj2.expiredAg = {
                            $gte: start,
                            $lt: addDate(7),
                        }
                        conditionObj3.expiredAg = {
                            $gte: addDate(7),
                            $lte: addDate(30),
                        }
                        conditionObj4.expiredAg = {
                            $gt: addDate(30),
                        }
                    }

                    // Bảo lãnh hợp đồng
                    if (guaranteeType && Number(guaranteeType) == 2) {
                        conditionObj1.expiredCg = {
                            $lt: start,
                        }
                        conditionObj2.expiredCg = {
                            $gte: start,
                            $lt: addDate(7),
                        }
                        conditionObj3.expiredCg = {
                            $gte: addDate(7),
                            $lte: addDate(30),
                        }
                        conditionObj4.expiredCg = {
                            $gt: addDate(30),
                        }
                    }

                    // Số lượng quá hạn
                    let listAmountOverdue = await ITEM__CONTRACT_COLL.aggregate(
                        [
                            {
                                $match: conditionObj1,
                            },
                            {
                                $group: {
                                    _id: {},
                                    count: { $sum: 1 },
                                },
                            },
                        ]
                    )

                    // Số lượng Tuần tới
                    let listAmountNextWeek =
                        await ITEM__CONTRACT_COLL.aggregate([
                            {
                                $match: conditionObj2,
                            },
                            {
                                $group: {
                                    _id: {},
                                    count: { $sum: 1 },
                                },
                            },
                        ])

                    // Số lượng > 7 ngày tiếp theo
                    let listAmountMoreThan7Days =
                        await ITEM__CONTRACT_COLL.aggregate([
                            {
                                $match: conditionObj3,
                            },
                            {
                                $group: {
                                    _id: {},
                                    count: { $sum: 1 },
                                },
                            },
                        ])

                    // Số lượng > 30 ngày tiếp theo
                    let listAmountMoreThan30Days =
                        await ITEM__CONTRACT_COLL.aggregate([
                            {
                                $match: conditionObj4,
                            },
                            {
                                $group: {
                                    _id: {},
                                    count: { $sum: 1 },
                                },
                            },
                        ])

                    return resolve({
                        error: false,
                        data: {
                            listAmountOverdue,
                            listAmountNextWeek,
                            listAmountMoreThan7Days,
                            listAmountMoreThan30Days,
                        },
                    })
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Danh sách hợp đồng mà user là members
     * Author: Depv
     * Code  :
     */
    getListIsMembers({
        companyID,
        projectID,
        parentID,
        draft,
        outin,
        status,
        real,
        subType,
        type,
        field,
        dependentUnit,
        chair,
        personInCharge,
        debtStatus,
        warehouse,
        isMember,
        isExportExcel = false,
        startTime,
        endTime,
        buyerInfo,
        sellerInfo,
        lock,
        userID,
        isExpiredAg,
        isExpiredCg,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates = {},
        ctx,
    }) {
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                let conditionObj = { members: { $in: [userID] } }
                let keys = ['date__-1', '_id__-1']
                let sortBy

                if (limit > 20) {
                    limit = 20
                }

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

                /**
                 * Hợp đồng của công ty hoặc theo dự án
                 */
                if (checkObjectIDs(projectID)) {
                    conditionObj.project = projectID
                } else {
                    if (companyID) {
                        conditionObj.company = companyID
                    }
                }

                if (checkObjectIDs(parentID)) {
                    conditionObj.parent = parentID
                }

                if (draft && Number(draft) > 0) {
                    conditionObj.draft = Number(draft)
                }

                if (outin && Number(outin) > 0) {
                    conditionObj.outin = Number(outin)
                }

                if (status && Number(status) > 0) {
                    conditionObj.status = Number(status)
                }

                if (real && Number(real) > 0) {
                    conditionObj.real = Number(real)
                }

                if (subType && Number(subType) > 0) {
                    conditionObj.subType = Number(subType)
                }

                if (type && Number(type) > 0) {
                    conditionObj.type = Number(type)
                }

                if (field && checkObjectIDs(field)) {
                    conditionObj.field = ObjectID(field)
                }

                if (chair && checkObjectIDs(chair)) {
                    conditionObj.chair = ObjectID(chair)
                }

                if (dependentUnit && checkObjectIDs(dependentUnit)) {
                    conditionObj.dependentUnit = ObjectID(dependentUnit)
                }

                if (personInCharge && checkObjectIDs(personInCharge)) {
                    conditionObj.personInCharge = ObjectID(personInCharge)
                }

                if (buyerInfo && checkObjectIDs(buyerInfo)) {
                    conditionObj.buyerInfo = ObjectID(buyerInfo)
                }

                if (sellerInfo && checkObjectIDs(sellerInfo)) {
                    conditionObj.sellerInfo = ObjectID(sellerInfo)
                }

                if (debtStatus && checkObjectIDs(debtStatus)) {
                    conditionObj.debtStatus = ObjectID(debtStatus)
                }

                if (warehouse && checkObjectIDs(warehouse)) {
                    conditionObj.warehouse = ObjectID(warehouse)
                }

                if (startTime) {
                    conditionObj.startTime = startTime
                }

                if (endTime) {
                    conditionObj.endTime = endTime
                }

                if (lock) {
                    conditionObj.lock = lock
                }

                // Theo dõi bảo lãnh tạm ứng
                if (isExpiredAg == 1) {
                    keys = ['expiredAg__1', '_id__-1']

                    conditionObj.expiredAg = { $exists: true, $ne: null }
                    conditionObj.status = { $ne: 3 } // Chỉ lấy các hợp đồng chưa hoàn thành
                }

                // Theo dõi bảo lãnh thực hiện hợp đồng
                if (isExpiredCg == 1) {
                    keys = ['expiredCg__1', '_id__-1']

                    conditionObj.expiredCg = { $exists: true, $ne: null }
                    conditionObj.status = { $ne: 3 } // Chỉ lấy các hợp đồng chưa hoàn thành
                }

                if (isMember == 1) {
                    conditionObj.members = { $in: [userID] }
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    let regSearch = new RegExp(keyword, 'i')
                    conditionObj.$or = [
                        { name: regSearch },
                        { sign: regSearch },
                        { storeSign: regSearch },
                    ]
                }

                /**
                 * Purpose: Sử dụng trong export excel (hoặc theo bộ lọc)
                 * Function: exportContract (model)
                 */
                if (isExportExcel) {
                    return resolve({ data: conditionObj, error: false })
                }

                let conditionObjOrg = { ...conditionObj }

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await ITEM__CONTRACT_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastestID",
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

                    conditionObj = dataPagingAndSort?.data?.find
                    sortBy = dataPagingAndSort?.data?.sort
                } else {
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: null,
                        objectQuery: conditionObjOrg,
                    })
                    sortBy = dataPagingAndSort?.data?.sort
                }

                let infoDataAfterGet = await ITEM__CONTRACT_COLL.find(
                    conditionObj
                )
                    .limit(+limit + 1)
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
                    await ITEM__CONTRACT_COLL.count(conditionObjOrg)
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
     * Name  : Danh sách hợp đồng (mẫu chuẩn sử dụng cho các tình huống)
     * Author: HiepNH
     * Code  : 7/9/2022
     */
    getListByFilter({
        fromDate,
        toDate,
        companysID,
        projectsID,
        buyerInfosID,
        sellerInfosID,
        statuss,
        ontimes,
        onbudgets,
        isExportExcel = false,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates = {},
        userID,
        ctx,
    }) {
        // console.log({
        //     fromDate, toDate, companysID, projectsID, buyerInfosID, sellerInfosID, statuss, ontimes, onbudgets, isExportExcel,
        //     keyword, limit, lastestID, select, populates, userID })
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                let conditionObj = { members: { $in: [userID] } }
                let keys = ['date__-1', '_id__-1']
                let sortBy

                if (limit > 20) {
                    limit = 20
                }

                const validation = validateParamsObjectID({
                    companysID: { value: companysID, isRequire: false },
                    projectsID: { value: projectsID, isRequire: false },
                    buyerInfosID: { value: buyerInfosID, isRequire: false },
                    sellerInfosID: { value: sellerInfosID, isRequire: false },
                })
                if (validation.error) return resolve(validation)

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

                /**
                 * Bộ lọc với nhiều lựa chọn
                 */
                companysID &&
                    companysID.length &&
                    (conditionObj.company = { $in: companysID })
                projectsID &&
                    projectsID.length &&
                    (conditionObj.project = { $in: projectsID })
                buyerInfosID &&
                    buyerInfosID.length &&
                    (conditionObj.buyerInfo = { $in: buyerInfosID })
                sellerInfosID &&
                    sellerInfosID.length &&
                    (conditionObj.sellerInfo = { $in: sellerInfosID })
                statuss &&
                    statuss.length &&
                    (conditionObj.status = { $in: statuss })
                ontimes &&
                    ontimes.length &&
                    (conditionObj.ontime = { $in: ontimes })
                onbudgets &&
                    onbudgets.length &&
                    (conditionObj.onbudget = { $in: onbudgets })

                if (fromDate && toDate) {
                    conditionObj.date = {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate),
                    }
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    let regSearch = new RegExp(keyword, 'i')
                    conditionObj.$or = [
                        { name: regSearch },
                        { sign: regSearch },
                    ]
                }

                /**
                 * Purpose: Sử dụng trong export excel (hoặc theo bộ lọc)
                 * Function: exportContract (model)
                 */
                if (isExportExcel) {
                    return resolve({ data: conditionObj, error: false })
                }

                let conditionObjOrg = { ...conditionObj }

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await ITEM__CONTRACT_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastestID",
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

                    conditionObj = dataPagingAndSort?.data?.find
                    sortBy = dataPagingAndSort?.data?.sort
                } else {
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: null,
                        objectQuery: conditionObjOrg,
                    })
                    sortBy = dataPagingAndSort?.data?.sort
                }

                let infoDataAfterGet = await ITEM__CONTRACT_COLL.find(
                    conditionObj
                )
                    .limit(+limit + 1)
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
                    await ITEM__CONTRACT_COLL.count(conditionObjOrg)
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
     * Name: Gom nhóm theo tháng trong năm
     * Author: Hiepnh
     * Date: 05/04/2022
     */
    getAmountByMonth({
        userID,
        form,
        outin,
        real,
        companyID,
        projectID,
        contractID,
        year,
        option,
    }) {
        return new Promise(async (resolve) => {
            try {
                let conditionObj = {},
                    conditionGroup = {},
                    conditionObjYear = {}

                if (outin && Number(outin) > 0) {
                    conditionObj.outin = Number(outin)
                }

                if (real && Number(real) > 0) {
                    conditionObj.real = Number(real)
                }

                /**
                 * Lấy số liệu theo hợp đồng, dự án hoặc theo năm
                 */
                if (contractID && checkObjectIDs(contractID)) {
                    conditionObj.contract = ObjectID(contractID)
                } else {
                    if (projectID && checkObjectIDs(projectID)) {
                        conditionObj.project = ObjectID(projectID)
                    } else {
                        if (companyID && checkObjectIDs(companyID)) {
                            conditionObj.company = ObjectID(companyID)
                        }
                    }
                }

                if (!option) {
                    // console.log('SỐ LIỆU HỢP ĐỒNG NĂM NAY====================================')
                    conditionGroup = {
                        _id: { month: '$month', year: '$year' },
                        amount: { $sum: '$amount' },
                    }

                    if (!isNaN(year) && Number(year) > 0) {
                        conditionObjYear = {
                            year: Number(year),
                        }
                    }

                    let listData = await ITEM__CONTRACT_COLL.aggregate([
                        {
                            $match: conditionObj,
                        },
                        {
                            $project: {
                                year: { $year: '$date' },
                                month: { $month: '$date' },
                                amount: {
                                    $sum: [
                                        '$value',
                                        '$vatValue',
                                        '$plus',
                                        '$vatPlus',
                                    ],
                                },
                            },
                        },
                        {
                            $match: conditionObjYear,
                        },
                        {
                            $group: conditionGroup,
                        },
                        {
                            $sort: {
                                '_id.year': 1,
                                '_id.month': 1,
                            },
                        },
                    ])

                    return resolve({ error: false, data: listData })
                } else {
                    // Số liệu cùng kỳ năm ngoái
                    if (option && option == 1) {
                        // console.log('SỐ LIỆU HỢP ĐỒNG NĂM NGOÁI====================================')

                        conditionGroup = {
                            _id: { year: '$year' },
                            amount: { $sum: '$amount' },
                        }

                        let firstDayOfLastYear = `${Number(year - 1)}-01-01T00:00:00.000Z`
                        let lastDayOfLastYear

                        let thisYear = moment(new Date()).toDate().getFullYear()

                        if (Number(year) == Number(thisYear)) {
                            var today = new Date()
                            //Sunday 4 September 2016 - Week 36
                            // console.log({today})

                            lastDayOfLastYear = new moment(today)
                                .subtract(12, 'months')
                                .toDate()
                            //Friday 4 September 2015 - Week 37
                            // console.log({lastDayOfLastYear})
                        } else {
                            lastDayOfLastYear = `${Number(year - 1)}-12-31T00:00:00.000Z`
                        }

                        conditionObj.date = {
                            // $gte: moment(firstDayOfLastYear).toDate(),
                            // $lt: moment(lastDayOfLastYear).toDate(),
                            $gte: new Date(firstDayOfLastYear),
                            $lte: new Date(lastDayOfLastYear),
                        }

                        let listData = await ITEM__CONTRACT_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$date' },
                                    month: { $month: '$date' },
                                    amount: {
                                        $sum: [
                                            '$value',
                                            '$vatValue',
                                            '$plus',
                                            '$vatPlus',
                                        ],
                                    },
                                },
                            },
                            {
                                $match: conditionObjYear,
                            },
                            {
                                $group: conditionGroup,
                            },
                            {
                                $sort: {
                                    '_id.year': 1,
                                    '_id.month': 1,
                                },
                            },
                        ])

                        return resolve({ error: false, data: listData })
                    }
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Gom nhóm theo thuộc tính
     * Author: Hiepnh
     * Date: 17/04/2022
     */
    getAmountByProperty({
        userID,
        type,
        outin,
        real,
        companyID,
        projectID,
        contractID,
        year,
        optionTime,
        optionProperty,
        ctx,
    }) {
        // console.log({ userID, type, outin, real, companyID, projectID, contractID, year, optionTime, optionProperty })
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * optionTime: Báo cáo theo trục thời gian
                 * optionProperty: Báo cáo theo tính chất/phân loại
                 * 1-Báo cáo theo phân loại: Giá trị ký, Sản lượng, Doanh thu, Tiền về
                 * 2.1-Tính tổng Tất cả-Theo năm (1)/Theo tháng (2)
                 * 2.2-Tính tổng theo thuộc tính: Lĩnh vực (1)/Khách hàng (2)/Đơn vị (3)/Phụ trách (4)
                 * 2.3-Tính tổng kết hợp
                 */
                let conditionObj = {},
                    conditionGroup = {},
                    conditionObjYear = {},
                    conditionPopulate = {},
                    sortBy = { amount: 1 }

                if (type && Number(type) > 0) {
                    conditionObj.type = Number(type)
                }

                if (outin && Number(outin) > 0) {
                    conditionObj.outin = Number(outin)
                }

                if (real && Number(real) > 0) {
                    conditionObj.real = Number(real)
                }

                if (contractID && checkObjectIDs(contractID)) {
                    conditionObj.contract = ObjectID(contractID)
                } else {
                    if (projectID && checkObjectIDs(projectID)) {
                        conditionObj.project = ObjectID(projectID)
                    } else {
                        if (companyID && checkObjectIDs(companyID)) {
                            conditionObj.company = ObjectID(companyID)
                        }
                    }
                }

                // console.log(conditionObj)

                // TÍNH TỔNG THEO TẤT CẢ/THEO NĂM
                if (Number(optionTime) === 1) {
                    conditionGroup = {
                        _id: {},
                        amount: { $sum: '$amount' },
                    }

                    if (!isNaN(year) && Number(year) >= 0) {
                        conditionObjYear = {
                            year: Number(year),
                        }
                    } else {
                        conditionGroup = {
                            _id: { year: '$year' },
                            amount: { $sum: '$amount' },
                        }
                    }

                    // Theo Lĩnh vực
                    if (Number(optionProperty) === 1) {
                        conditionGroup = {
                            _id: { field: '$field' },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.field',
                            select: '_id name sign',
                            model: 'doctype',
                        }

                        sortBy = {
                            '_id.field': 1,
                        }
                    }

                    // Theo Người mua
                    if (Number(optionProperty) === 2) {
                        conditionGroup = {
                            _id: { buyerInfo: '$buyerInfo' },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.buyerInfo',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.buyerInfo': 1,
                        }
                    }

                    // Theo Người bán
                    if (Number(optionProperty) === 3) {
                        conditionGroup = {
                            _id: { sellerInfo: '$sellerInfo' },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.sellerInfo',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.sellerInfo': 1,
                        }
                    }

                    // Theo Phụ trách
                    if (Number(optionProperty) === 4) {
                        conditionGroup = {
                            _id: { personInCharge: '$personInCharge' },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.personInCharge',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.personInCharge': 1,
                        }
                    }

                    // Theo Chủ trì
                    if (Number(optionProperty) === 5) {
                        conditionGroup = {
                            _id: { chair: '$chair' },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.chair',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.chair': 1,
                        }
                    }

                    // Theo Đơn vị
                    if (Number(optionProperty) === 6) {
                        conditionGroup = {
                            _id: { dependentUnit: '$dependentUnit' },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.dependentUnit',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.dependentUnit': 1,
                        }
                    }
                }

                // TÍNH TỔNG THEO THÁNG
                if (Number(optionTime) === 2) {
                    conditionGroup = {
                        _id: { month: '$month', year: '$year' },
                        amount: { $sum: '$amount' },
                    }

                    // Theo tháng trong một năm cụ thể
                    if (!isNaN(year) && Number(year) >= 0) {
                        conditionObjYear = {
                            year: Number(year),
                        }
                    }

                    // Theo Lĩnh vực
                    if (Number(optionProperty) === 1) {
                        conditionGroup = {
                            _id: {
                                field: '$field',
                                month: '$month',
                                year: '$year',
                            },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.field',
                            select: '_id name sign',
                            model: 'doctype',
                        }

                        sortBy = {
                            '_id.field': 1,
                        }
                    }

                    // Theo Người mua
                    if (Number(optionProperty) === 2) {
                        conditionGroup = {
                            _id: {
                                buyerInfo: '$buyerInfo',
                                month: '$month',
                                year: '$year',
                            },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.buyerInfo',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.buyerInfo': 1,
                        }
                    }

                    // Theo Người bán
                    if (Number(optionProperty) === 3) {
                        conditionGroup = {
                            _id: {
                                sellerInfo: '$sellerInfo',
                                month: '$month',
                                year: '$year',
                            },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.sellerInfo',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.sellerInfo': 1,
                        }
                    }

                    // Theo Phụ trách
                    if (Number(optionProperty) === 4) {
                        conditionGroup = {
                            _id: {
                                personInCharge: '$personInCharge',
                                month: '$month',
                                year: '$year',
                            },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.personInCharge',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.personInCharge': 1,
                        }
                    }

                    // Theo Chủ trì
                    if (Number(optionProperty) === 5) {
                        conditionGroup = {
                            _id: {
                                chair: '$chair',
                                month: '$month',
                                year: '$year',
                            },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.chair',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.chair': 1,
                        }
                    }

                    // Theo Đơn vị
                    if (Number(optionProperty) === 6) {
                        conditionGroup = {
                            _id: {
                                dependentUnit: '$dependentUnit',
                                month: '$month',
                                year: '$year',
                            },
                            amount: { $sum: '$amount' },
                        }

                        conditionPopulate = {
                            path: '_id.dependentUnit',
                            select: '_id name sign',
                            model: 'contact',
                        }

                        sortBy = {
                            '_id.dependentUnit': 1,
                        }
                    }
                }

                // console.log('===================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
                // console.log(conditionObj)
                // console.log(conditionObjYear)
                // console.log(conditionGroup)

                let listData = await ITEM__CONTRACT_COLL.aggregate([
                    {
                        $match: conditionObj,
                    },
                    {
                        $project: {
                            year: { $year: '$date' },
                            month: { $month: '$date' },
                            amount: {
                                $sum: [
                                    '$value',
                                    '$vatValue',
                                    '$plus',
                                    '$vatPlus',
                                ],
                            },
                            type: 1,
                            outin: 1,
                            real: 1,
                            field: 1,
                            buyerInfo: 1,
                            chair: 1,
                            personInCharge: 1,
                            dependentUnit: 1,
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

                if (!isNaN(optionProperty) && Number(optionProperty) > 0) {
                    await ITEM__CONTRACT_COLL.populate(
                        listData,
                        conditionPopulate
                    )
                }

                return resolve({ error: false, data: listData })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Danh sách theo tháng trong năm
     * Author: Hiepnh
     * Date: 05/04/2022
     */
    getListByMonth({
        userID,
        companyID,
        projectID,
        contractID,
        month,
        year,
        type,
        outin,
        real,
        field,
        dependentUnit,
        chair,
        personInCharge,
        buyerInfo,
        sellerInfo,
        keyword,
        limit = 20,
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

                // Điều kiện để Aggregate
                let conditionObjAgg = {},
                    conditionObjYear = {}

                if (month && Number(month) > 0) {
                    conditionObjYear.month = Number(month)
                    conditionObjYear.year = Number(year)
                } else {
                    conditionObjYear.year = Number(year)
                }

                if (type && Number(type) > 0) {
                    conditionObjAgg.type = Number(type)
                }

                if (outin && Number(outin) > 0) {
                    conditionObjAgg.outin = Number(outin)
                }

                if (real && Number(real) > 0) {
                    conditionObjAgg.real = Number(real)
                }

                if (field && checkObjectIDs(field)) {
                    conditionObjAgg.field = ObjectID(field)
                }

                if (dependentUnit && checkObjectIDs(dependentUnit)) {
                    conditionObjAgg.dependentUnit = ObjectID(dependentUnit)
                }

                if (chair && checkObjectIDs(chair)) {
                    conditionObjAgg.chair = ObjectID(chair)
                }

                if (personInCharge && checkObjectIDs(personInCharge)) {
                    conditionObjAgg.personInCharge = ObjectID(personInCharge)
                }

                if (buyerInfo && checkObjectIDs(buyerInfo)) {
                    conditionObjAgg.buyerInfo = ObjectID(buyerInfo)
                }

                if (sellerInfo && checkObjectIDs(sellerInfo)) {
                    conditionObjAgg.sellerInfo = ObjectID(sellerInfo)
                }

                if (contractID && checkObjectIDs(contractID)) {
                    conditionObjAgg.contract = ObjectID(contractID)
                } else {
                    if (projectID && checkObjectIDs(projectID)) {
                        conditionObjAgg.project = ObjectID(projectID)
                    } else {
                        if (companyID && checkObjectIDs(companyID)) {
                            conditionObjAgg.company = ObjectID(companyID)
                        }
                    }
                }

                // console.log(conditionObjAgg)
                // console.log(conditionObjYear)
                // console.log(conditionGroup)

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
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    let regExpSearch = RegExp(keyword, 'i')
                    conditionObj.name = regExpSearch
                }

                // Danh sách các Payment trong tháng, năm của công ty
                let listData = await ITEM__CONTRACT_COLL.aggregate([
                    {
                        $match: conditionObjAgg,
                    },
                    {
                        $project: {
                            year: { $year: '$date' },
                            month: { $month: '$date' },
                        },
                    },
                    {
                        $match: conditionObjYear,
                    },
                    { $sort: { date: 1 } },
                ])

                // console.log(conditionObjAgg)
                // console.log(listData)

                conditionObj._id = { $in: listData.map((item) => item._id) }

                // Trả về danh sách mẩu tin
                let conditionObjOrg = { ...conditionObj }

                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await ITEM__CONTRACT_COLL.findById(lastestID)
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

                let infoDataAfterGet = await ITEM__CONTRACT_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                if (!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data" })

                let nextCursor = null
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id
                        infoDataAfterGet.length = limit
                    }
                }

                let totalRecord =
                    await ITEM__CONTRACT_COLL.count(conditionObjOrg)
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
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Tính sản lượng còn lại chưa thực hiện
     * Author: Hiepnh
     * Date: 05/04/2022
     */
    getRetainProduce({ userID, outin, companyID, projectID, contractID, ctx }) {
        // console.log({ userID, outin, companyID, projectID, contractID })
        return new Promise(async (resolve) => {
            try {
                let remainingProduce = 0
                let conditionObj = {},
                    conditionGroup = {}

                if (outin && Number(outin) > 0) {
                    conditionObj.outin = Number(outin)
                }

                conditionGroup = {
                    _id: {},
                    remainingProduce: { $sum: '$remainingProduce' },
                    // value: { $sum: "$value" },
                    // produce: { $sum: "$produce" },
                }

                if (contractID && checkObjectIDs(contractID)) {
                    conditionObj.contract = ObjectID(contractID)
                } else {
                    if (projectID && checkObjectIDs(projectID)) {
                        conditionObj.project = ObjectID(projectID)
                    } else {
                        if (companyID && checkObjectIDs(companyID)) {
                            conditionObj.company = ObjectID(companyID)
                        }
                    }
                }

                let listData = await ITEM__CONTRACT_COLL.aggregate([
                    {
                        $match: conditionObj,
                    },
                    {
                        $project: {
                            year: { $year: '$date' },
                            month: { $month: '$date' },
                            remainingProduce: '$remainingProduce',
                            // value: { $sum: ["$value", "$vatValue", "$plus", "$vatPlus"] },
                            // produce: { $sum: ["$produce", "$vatProduce", "$plusProduce", "$vatPlusProduce"] },
                        },
                    },
                    {
                        $group: conditionGroup,
                    },
                ])

                if (listData && listData.length) {
                    remainingProduce = Number(listData[0].remainingProduce)
                }

                return resolve({ error: false, data: remainingProduce })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Tính tồn kho
     * Author: Hiepnh
     * Date: 16/5/2022
     */
    getInventory({ userID, outin, companyID, projectID, contractID, ctx }) {
        // console.log({ userID, outin, companyID, projectID, contractID })
        return new Promise(async (resolve) => {
            try {
                let inventory = 0
                let conditionObj = {},
                    conditionGroup = {}

                if (outin && Number(outin) > 0) {
                    conditionObj.outin = Number(outin)
                }

                conditionGroup = {
                    _id: {},
                    produce: { $sum: '$produce' },
                    acceptance: { $sum: '$acceptance' },
                }

                if (contractID && checkObjectIDs(contractID)) {
                    conditionObj.contract = ObjectID(contractID)
                } else {
                    if (projectID && checkObjectIDs(projectID)) {
                        conditionObj.project = ObjectID(projectID)
                    } else {
                        if (companyID && checkObjectIDs(companyID)) {
                            conditionObj.company = ObjectID(companyID)
                        }
                    }
                }

                let listData = await ITEM__CONTRACT_COLL.aggregate([
                    {
                        $match: conditionObj,
                    },
                    {
                        $project: {
                            year: { $year: '$date' },
                            month: { $month: '$date' },
                            produce: {
                                $sum: [
                                    '$produce',
                                    '$vatProduce',
                                    '$plusProduce',
                                    '$vatPlusProduce',
                                ],
                            },
                            acceptance: {
                                $sum: [
                                    '$acceptance',
                                    '$vatAcceptance',
                                    '$plusAcceptance',
                                    '$vatPlusAcceptance',
                                ],
                            },
                        },
                    },
                    {
                        $group: conditionGroup,
                    },
                ])
                // console.log(listData)

                if (listData && listData.length) {
                    inventory =
                        Number(listData[0].produce) -
                        Number(listData[0].acceptance)
                }

                return resolve({ error: false, data: inventory })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Thống kê trạng thái hợp đồng theo(ontime, onbudget)
     * Author: Hiepnh
     * Date: 16/5/2022
     */
    statisticalStatusByOntimeOnbudget({ projectID }) {
        return new Promise(async (resolve) => {
            try {
                let conditionObj = {
                    ontime: { $exists: true },
                    onbudget: { $exists: true },
                }

                if (!checkObjectIDs(projectID)) {
                    return resolve({
                        error: true,
                        message: 'projectID không hợp lệ',
                    })
                } else {
                    conditionObj.project = ObjectID(projectID)
                }

                let listData = await ITEM__CONTRACT_COLL.aggregate([
                    {
                        $match: conditionObj,
                    },
                    {
                        $group: {
                            _id: { ontime: '$ontime', onbudget: '$onbudget' }, // Phân loại trạng thái
                            amount: { $sum: 1 },
                        },
                    },
                    {
                        $sort: { '_id.ontime': 1 },
                    },
                ])

                return resolve({ error: false, data: listData })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Download Excel Contract
     * Date: 04/07/2022
     */
    exportContract({ userID, companyID, type, filterParams = {} }) {
        return new Promise(async (resolve) => {
            try {
                const validation = validateParamsObjectID({ userID })
                if (validation.error) return resolve(validation)

                let conditionObj = {}
                let resultGetList = { error: true }

                switch (type) {
                    case 'all':
                        resultGetList = await this.getListByFilter({
                            ...filterParams,
                            userID,
                            companyID,
                            isExportExcel: true,
                        })
                        break
                    case 'project':
                        resultGetList = await this.getList({
                            ...filterParams,
                            userID,
                            companyID,
                            isExportExcel: true,
                        })
                        break
                    case 'out':
                        resultGetList = await this.getList({
                            ...filterParams,
                            outin: 1,
                            userID,
                            companyID,
                            isExportExcel: true,
                        })
                        break
                    case 'in':
                        resultGetList = await this.getList({
                            ...filterParams,
                            outin: 2,
                            userID,
                            companyID,
                            isExportExcel: true,
                        })
                        break
                    case 'partner':
                        resultGetList = await this.getListIsMembers({
                            ...filterParams,
                            userID,
                            isExportExcel: true,
                        })
                        break
                    default:
                        break
                }

                if (!resultGetList.error) {
                    conditionObj = resultGetList.data
                }
                // console.log({conditionObj})

                let keys = ['date__-1', '_id__-1']
                let dataPagingAndSort = await RANGE_BASE_PAGINATION_V2({
                    keys,
                    latestRecord: null,
                    objectQuery: conditionObj,
                })
                let sortBy = dataPagingAndSort?.data?.sort
                const listContract = await ITEM__CONTRACT_COLL.find(
                    conditionObj
                )
                    .populate({
                        path: 'project field buyerInfo dependentUnit chair personInCharge debtStatus',
                        select: 'name sign phone address',
                    })
                    .sort(sortBy)
                    .lean()

                if (!listContract) {
                    return resolve({
                        error: true,
                        message: 'Không tìm thấy hợp đồng',
                        keyError: 'contracts_not_exists',
                        status: 400,
                    })
                }

                XlsxPopulate.fromFileAsync(
                    path.resolve(
                        __dirname,
                        '../../../files/templates/excels/contract_1.xlsm'
                    )
                ).then(async (workbook) => {
                    let indexExcel = 3
                    const DATE_FORMAT = 'DD/MM/YYYY'

                    listContract.map((contract, index) => {
                        const {
                            packageName,
                            name,
                            project,
                            date,
                            field,
                            buyerInfo,
                            value,
                            finalValue,
                            startTime,
                            endTime,
                            status,
                            outin,
                            note,
                            sign,
                            chair,
                            personInCharge,
                            dependentUnit,
                            debtStatus,
                        } = contract

                        // console.log({ contract, buyerInfo })
                        const row = workbook.sheet('Data').row(indexExcel)

                        row.cell(1)
                            .style('horizontalAlignment', 'center')
                            .value(index + 1)

                        // Tên hợp đồng (gói thầu)
                        row.cell(2).value(
                            `${project?.sign}` + `.${name}` + `-${sign}`
                        )

                        // Dự án
                        if (project) {
                            row.cell(3).value(project?.name)
                        }

                        // Số hợp đồng
                        row.cell(4).value(sign)

                        // Ngày ký hợp đồng
                        if (date) {
                            row.cell(5).value(moment(date).format(DATE_FORMAT))
                        }

                        // Lĩnh vực hợp đồng
                        if (field) {
                            row.cell(6).value(field.name)
                        }

                        // Tên CDT (khách hàng)
                        if (buyerInfo) {
                            row.cell(7).value(buyerInfo.name)
                            row.cell(8).value(buyerInfo.phone)
                            row.cell(9).value(buyerInfo.address)
                        }

                        // Giá trị hợp đồng
                        value && row.cell(10).value(value)

                        // Giá trị quyết toán
                        finalValue && row.cell(11).value(finalValue)

                        // Đơn vị tiền tệ
                        // if(dependentUnit) {
                        //     row.cell(12).value(dependentUnit.name);
                        // }

                        // Bắt đầu thực hiện
                        if (startTime) {
                            row.cell(13).value(
                                moment(startTime).format(DATE_FORMAT)
                            )
                        }

                        // Kết thúc thực hiện
                        if (endTime) {
                            row.cell(14).value(
                                moment(endTime).format(DATE_FORMAT)
                            )
                        }

                        // Đợt/GĐ nghiệm thu
                        // value && row.cell(15).value();

                        // Ngày ký BBNT
                        // value && row.cell(16).value();

                        // Ngày thanh lý HĐ
                        // value && row.cell(17).value();

                        // Tình trạng triển khai
                        switch (status) {
                            case 1:
                                row.cell(18).value('Đang triển khai')
                                break
                            case 2:
                                row.cell(18).value('Đang bàn giao')
                                break
                            case 3:
                                row.cell(18).value('Hoàn thành')
                                break
                            case 4:
                                row.cell(18).value('Tạm dừng')
                                break
                            default:
                                break
                        }

                        // Phân loại vào ra
                        outin &&
                            row
                                .cell(19)
                                .value(outin === 1 ? 'Bán ra' : 'Mua vào')

                        // Phân loại theo đơn vị
                        if (dependentUnit) {
                            row.cell(20).value(dependentUnit.name)
                        }

                        // Phân loại theo chủ trì
                        if (chair) {
                            row.cell(21).value(chair.name)
                        }

                        // Phân loại theo phụ trách
                        if (personInCharge) {
                            row.cell(22).value(personInCharge.name)
                        }

                        // Phân loại theo công nợ
                        if (debtStatus) {
                            row.cell(23).value(
                                debtStatus.name || debtStatus.description
                            )
                        }

                        // Ghi chú
                        note && row.cell(24).value(note)

                        indexExcel++
                    })

                    const range = workbook
                        .sheet('Data')
                        .range(`A3:X${listContract.length + 2}`)

                    range.style({
                        fontFamily: 'Times New Roman',
                        fontColor: 'black',
                        fontSize: 13,
                        bold: false,
                        border: true,
                        borderColor: 'black',
                        wrapText: true,
                        // horizontalAlignment: 'center',
                    })

                    const filePath = '../../../files/temporary_uploads/'
                    const fileName = `contracts_${Date.now()}.xlsm`
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
