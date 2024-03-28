/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__CONTRACT_MODEL = require('../model/item.contract-model').MODEL

module.exports = {
    updateContractByCondition: {
        async handler(ctx) {
            try {
                let { condition, update } = ctx.params

                const resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.updateContractByCondition({
                        condition,
                        update,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Thêm contract
     * Date: 19/08/2021
     */
    insert: {
        auth: 'required',
        params: {
            projectID: { type: 'string' },
            parentID: { type: 'string', optional: true },
            admins: { type: 'string', optional: true },
            members: { type: 'string', optional: true },
            draft: { type: 'number', optional: true },
            outin: { type: 'number', optional: true },
            status: { type: 'number', optional: true },
            real: { type: 'number', optional: true },
            type: { type: 'number', optional: true },
            subType: { type: 'number', optional: true },
            field: { type: 'string', optional: true },
            dependentUnit: { type: 'string', optional: true },
            chair: { type: 'string', optional: true },
            personInCharge: { type: 'string', optional: true },
            debtStatus: { type: 'string', optional: true },
            warehouse: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            storeSign: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            note1: { type: 'string', optional: true },
            date: { type: 'string', optional: true },
            startTime: { type: 'string', optional: true },
            endTime: { type: 'string', optional: true },
            buyerInfo: { type: 'string', optional: true },
            buyerBank: { type: 'string', optional: true },
            sellerBank: { type: 'string', optional: true },
            packageName: { type: 'string', optional: true },
            lock: { type: 'number', optional: true },
            value: { type: 'number', optional: true },
            plus: { type: 'number', optional: true },
            vatValue: { type: 'number', optional: true },
            advancePayment: { type: 'number', optional: true },
            produce: { type: 'number', optional: true },
            plusProduce: { type: 'number', optional: true },
            vatProduce: { type: 'number', optional: true },
            acceptance: { type: 'number', optional: true },
            plusAcceptance: { type: 'number', optional: true },
            vatAcceptance: { type: 'number', optional: true },
            retainedValue: { type: 'number', optional: true },
            advancePaymentDeduction: { type: 'number', optional: true },
            otherDeduction: { type: 'number', optional: true },
            recommendedPayment: { type: 'number', optional: true },
            advancePaymentPaid: { type: 'number', optional: true },
            amountPaid: { type: 'number', optional: true },
            remainingPayment: { type: 'number', optional: true },
            advancePaymentOverage: { type: 'number', optional: true },
            finalValue: { type: 'number', optional: true },
            budget: { type: 'number', optional: true },
            vatBudget: { type: 'number', optional: true },
            forecastBudget: { type: 'number', optional: true },
            forecastVatBudget: { type: 'number', optional: true },
            managementFee: { type: 'number', optional: true },
            subcontractFee: { type: 'number', optional: true },
            expenses: { type: 'number', optional: true },
            profit: { type: 'number', optional: true },

            cgValue: { type: 'number', optional: true },
            expiredCg: { type: 'string', optional: true },
            alertCg: { type: 'number', optional: true },

            agValue: { type: 'number', optional: true },
            expiredAg: { type: 'string', optional: true },
            alertAg: { type: 'number', optional: true },

            insuranceValue: { type: 'number', optional: true },
            expiredInsurance: { type: 'string', optional: true },
            alertInsurance: { type: 'number', optional: true },

            remainingProduce: { type: 'number', optional: true },
            ontime: { type: 'number', optional: true },
            onbudget: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const {
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
                    cgValue,
                    expiredCg,
                    agValue,
                    expiredAg,
                    remainingProduce,
                    ontime,
                    onbudget,
                    alertAg,
                    alertCg,
                    insuranceValue,
                    expiredInsurance,
                    alertInsurance,
                } = ctx.params

                const resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.insert({
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
                        cgValue,
                        expiredCg,
                        agValue,
                        expiredAg,
                        userID,
                        remainingProduce,
                        ontime,
                        onbudget,
                        alertAg,
                        alertCg,
                        insuranceValue,
                        expiredInsurance,
                        alertInsurance,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Cập nhật hợp đồng
     * Date: 19/08/2021
     */
    update: {
        auth: 'required',
        params: {
            contractID: { type: 'string' },
            projectID: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            admins: { type: 'array', optional: true },
            adminsRemove: { type: 'array', optional: true },
            members: { type: 'array', optional: true },
            membersRemove: { type: 'array', optional: true },
            draft: { type: 'number', optional: true },
            outin: { type: 'number', optional: true },
            status: { type: 'number', optional: true },
            real: { type: 'number', optional: true },
            type: { type: 'number', optional: true },
            subType: { type: 'number', optional: true },
            field: { type: 'string', optional: true },
            dependentUnit: { type: 'string', optional: true },
            chair: { type: 'string', optional: true },
            personInCharge: { type: 'string', optional: true },
            debtStatus: { type: 'string', optional: true },
            warehouse: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            storeSign: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            note1: { type: 'string', optional: true },
            date: { type: 'string', optional: true },
            startTime: { type: 'string', optional: true },
            endTime: { type: 'string', optional: true },
            buyerInfo: { type: 'string', optional: true },
            buyerBank: { type: 'string', optional: true },
            sellerBank: { type: 'string', optional: true },
            packageName: { type: 'string', optional: true },
            lock: { type: 'number', optional: true },
            value: { type: 'number', optional: true },
            plus: { type: 'number', optional: true },
            vatValue: { type: 'number', optional: true },
            advancePayment: { type: 'number', optional: true },
            produce: { type: 'number', optional: true },
            plusProduce: { type: 'number', optional: true },
            vatProduce: { type: 'number', optional: true },
            acceptance: { type: 'number', optional: true },
            plusAcceptance: { type: 'number', optional: true },
            vatAcceptance: { type: 'number', optional: true },
            retainedValue: { type: 'number', optional: true },
            advancePaymentDeduction: { type: 'number', optional: true },
            otherDeduction: { type: 'number', optional: true },
            recommendedPayment: { type: 'number', optional: true },
            advancePaymentPaid: { type: 'number', optional: true },
            amountPaid: { type: 'number', optional: true },
            remainingPayment: { type: 'number', optional: true },
            advancePaymentOverage: { type: 'number', optional: true },
            finalValue: { type: 'number', optional: true },
            budget: { type: 'number', optional: true },
            vatBudget: { type: 'number', optional: true },
            forecastBudget: { type: 'number', optional: true },
            forecastVatBudget: { type: 'number', optional: true },
            managementFee: { type: 'number', optional: true },
            subcontractFee: { type: 'number', optional: true },
            expenses: { type: 'number', optional: true },
            profit: { type: 'number', optional: true },

            cgValue: { type: 'number', optional: true },
            expiredCg: { type: 'string', optional: true },
            alertCg: { type: 'number', optional: true },

            agValue: { type: 'number', optional: true },
            expiredAg: { type: 'string', optional: true },
            alertAg: { type: 'number', optional: true },

            insuranceValue: { type: 'number', optional: true },
            expiredInsurance: { type: 'string', optional: true },
            alertInsurance: { type: 'number', optional: true },

            dataInc: { type: 'object', optional: true },
            photos: { type: 'array', optional: true },
            remainingProduce: { type: 'number', optional: true },
            ontime: { type: 'number', optional: true },
            onbudget: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const {
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
                    remainingProduce,
                    ontime,
                    onbudget,
                    alertAg,
                    alertCg,
                    insuranceValue,
                    expiredInsurance,
                    alertInsurance,
                } = ctx.params

                const resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.update({
                        contractID,
                        projectID,
                        parentID,
                        admins,
                        members,
                        adminsRemove,
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
                        userID,
                        dataInc,
                        photos,
                        ctx,
                        remainingProduce,
                        ontime,
                        onbudget,
                        alertAg,
                        alertCg,
                        insuranceValue,
                        expiredInsurance,
                        alertInsurance,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Name: Cập nhật giá trị
     * Author: Hiepnh
     * Date: 15/04/2022
     */
    updateValue: {
        auth: 'required',
        params: {
            option: { type: 'number', optional: true },
            contractID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                let { option, contractID } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                console.log({ option, contractID })

                let resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.updateValue({
                        option,
                        contractID,
                        userID,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: XÓA HỢP ĐỒNG => KHÔNG CHO PHÉP XÓA CÁC DANH MỤC
     * Date: 19/08/2021
     */

    /**
     * Dev: HiepNH
     * Func: LẤY THÔNG TIN HOẶC LẤY DANH SACH HỢP ĐỒNG
     * Date: 19/08/2021
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            draft: { type: 'string', optional: true },
            outin: { type: 'string', optional: true },
            status: { type: 'string', optional: true },
            real: { type: 'string', optional: true },
            subType: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
            field: { type: 'string', optional: true },
            dependentUnit: { type: 'string', optional: true },
            chair: { type: 'string', optional: true },
            personInCharge: { type: 'string', optional: true },
            debtStatus: { type: 'string', optional: true },
            warehouse: { type: 'string', optional: true },
            isExpiredAg: { type: 'string', optional: true },
            isExpiredCg: { type: 'string', optional: true },
            isExpiredInsurance: { type: 'string', optional: true },

            // Field mặc định
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    companyID,
                    contractID,
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
                    date,
                    startTime,
                    endTime,
                    buyerInfo,
                    buyerBank,
                    sellerInfo,
                    sellerBank,
                    lock,
                    isExpiredAg,
                    isExpiredCg,
                    isExpiredInsurance,
                    isMember,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler
                if (contractID) {
                    resultAfterCallHandler = await ITEM__CONTRACT_MODEL.getInfo(
                        {
                            contractID,
                            userID,
                            select,
                            populates,
                            ctx,
                        }
                    )
                } else {
                    resultAfterCallHandler = await ITEM__CONTRACT_MODEL.getList(
                        {
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
                            date,
                            startTime,
                            endTime,
                            buyerInfo,
                            buyerBank,
                            sellerInfo,
                            sellerBank,
                            lock,
                            userID,
                            isExpiredAg,
                            isExpiredCg,
                            isExpiredInsurance,
                            isMember,
                            keyword,
                            limit,
                            lastestID,
                            select,
                            populates,
                            ctx,
                        }
                    )
                }

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: LẤY DANH SÁCH HỢP ĐỒNG MÀ USER LÀ MEMBERS
     * Date: 19/08/2021
     */
    getListIsMembers: {
        auth: 'required',
        params: {
            projectID: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            draft: { type: 'string', optional: true },
            outin: { type: 'string', optional: true },
            status: { type: 'string', optional: true },
            real: { type: 'string', optional: true },
            subType: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
            field: { type: 'string', optional: true },
            dependentUnit: { type: 'string', optional: true },
            chair: { type: 'string', optional: true },
            personInCharge: { type: 'string', optional: true },
            debtStatus: { type: 'string', optional: true },
            warehouse: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            isExpiredAg: { type: 'string', optional: true },
            isExpiredCg: { type: 'string', optional: true },

            // Field mặc định
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
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
                    date,
                    startTime,
                    endTime,
                    buyerInfo,
                    buyerBank,
                    sellerInfo,
                    sellerBank,
                    lock,
                    isExpiredAg,
                    isExpiredCg,
                    isMember,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params

                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.getListIsMembers({
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
                        date,
                        startTime,
                        endTime,
                        buyerInfo,
                        buyerBank,
                        sellerInfo,
                        sellerBank,
                        lock,
                        userID,
                        isExpiredAg,
                        isExpiredCg,
                        isMember,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Name  : Danh sách hợp đồng (mẫu chuẩn sử dụng cho các tình huống)
     * Author: HiepNH
     * Code  : 7/9/2022
     */
    getListByFilter: {
        auth: 'required',
        params: {
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
            companysID: { type: 'array', optional: true },
            projectsID: { type: 'array', optional: true },
            buyerInfosID: { type: 'array', optional: true },
            sellerInfosID: { type: 'array', optional: true },
            statuss: { type: 'array', optional: true },
            ontimes: { type: 'array', optional: true },
            onbudgets: { type: 'array', optional: true },

            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const {
                    fromDate,
                    toDate,
                    companysID,
                    projectsID,
                    buyerInfosID,
                    sellerInfosID,
                    statuss,
                    ontimes,
                    onbudgets,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params

                const resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.getListByFilter({
                        fromDate,
                        toDate,
                        companysID,
                        projectsID,
                        buyerInfosID,
                        sellerInfosID,
                        statuss,
                        ontimes,
                        onbudgets,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        userID,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: Hiepnh
     * Func: get amount by month
     */
    getAmountByMonth: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            year: { type: 'string', optional: true },
            outin: { type: 'string', optional: true },
            real: { type: 'string', optional: true },
            option: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                let { companyID, projectID, year, outin, real, option } =
                    ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.getAmountByMonth({
                        userID,
                        companyID,
                        projectID,
                        outin,
                        real,
                        option,
                        year,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Danh sách theo tháng trong năm
     * Author: Hiepnh
     * Date: 05/04/2022
     */
    getListByMonth: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
            outin: { type: 'string', optional: true },
            real: { type: 'string', optional: true },
            field: { type: 'string', optional: true },
            dependentUnit: { type: 'string', optional: true },
            chair: { type: 'string', optional: true },
            personInCharge: { type: 'string', optional: true },
            buyerInfo: { type: 'string', optional: true },
            sellerInfo: { type: 'string', optional: true },
            month: { type: 'string', optional: true },
            year: { type: 'string', optional: true },

            // Field mặc định
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                let {
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
                    limit,
                    lastestID,
                    populates,
                    select,
                } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.getListByMonth({
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
                        limit,
                        lastestID,
                        select,
                        populates,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Gom nhóm theo thuộc tính
     * Author: Hiepnh
     * Date: 18/04/2022
     */
    getAmountByProperty: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
            outin: { type: 'string', optional: true },
            real: { type: 'string', optional: true },
            year: { type: 'string', optional: true },
            optionTime: { type: 'string', optional: true },
            optionProperty: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                let {
                    companyID,
                    projectID,
                    contractID,
                    type,
                    outin,
                    real,
                    year,
                    optionTime,
                    optionProperty,
                    debt,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }
                console.log({ companyID })

                let resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.getAmountByProperty({
                        userID,
                        companyID,
                        projectID,
                        contractID,
                        type: Number(type),
                        outin: Number(outin),
                        real: Number(real),
                        year: Number(year),
                        optionTime: Number(optionTime),
                        optionProperty: Number(optionProperty),
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Tổng hợp số liệu bảo lãnh và lấy danh sách bảo lãnh
     * Author: HiepNH
     * Code: 2/20/2022
     */
    getListGuarantee: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            outin: { type: 'string', optional: true },
            option: { type: 'string', optional: true },
            guaranteeType: { type: 'string', optional: true },
            subType: { type: 'string', optional: true },

            // Field mặc định
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                let {
                    companyID,
                    projectID,
                    contractID,
                    outin,
                    option,
                    guaranteeType,
                    keyword,
                    limit,
                    lastestID,
                    populates,
                    select,
                    subType,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }
                console.log({ companyID })

                let resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.getListGuarantee({
                        userID,
                        companyID,
                        projectID,
                        contractID,
                        outin,
                        option,
                        guaranteeType,
                        keyword,
                        limit,
                        lastestID,
                        populates,
                        select,
                        subType,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Tính sản lượng còn lại chưa thực hiện
     * Author: Hiepnh
     * Date: 18/04/2022
     */
    getRetainProduce: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            outin: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                let { companyID, projectID, contractID, outin } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }
                console.log({ companyID })

                let resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.getRetainProduce({
                        userID,
                        companyID,
                        projectID,
                        contractID,
                        outin: Number(outin),
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Tính tồn kho
     * Author: Hiepnh
     * Date: 16/5/2022
     */
    getInventory: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            outin: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                let { companyID, projectID, contractID, outin } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }
                console.log({ companyID })

                let resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.getInventory({
                        userID,
                        companyID,
                        projectID,
                        contractID,
                        outin: Number(outin),
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Thống kê trạng thái theo(ontime, onbuget)
     * Author: Depv
     * Date: 16/5/2022
     */
    statisticalStatusByOntimeOnbudget: {
        auth: 'required',
        params: {
            projectID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { projectID } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser
                let resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.statisticalStatusByOntimeOnbudget(
                        {
                            projectID,
                        }
                    )

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Import Excel
     * Code: HiepNH
     * Date: 2/12/2023
     */
    importFromExcel: {
        auth: 'required',
        params: {
            // taskID    : { type: 'string', optional: true },
            dataImport: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { dataImport } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser
                // console.log(dataImport)

                const resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.importFromExcel({
                        companyID: company._id,
                        dataImport,
                        userID,
                    })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Download Excel Contract
     * Date: 04/07/2022
     */
    exportContract: {
        auth: 'required',
        params: {
            type: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                const { filterParams, type } = ctx.params
                const companyID = company._id

                // console.log('=============>>>>>>>>>>>>>>>')
                // console.log(ctx.params)

                const resultAfterCallHandler =
                    await ITEM__CONTRACT_MODEL.exportContract({
                        userID,
                        companyID,
                        filterParams,
                        type,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },
}
