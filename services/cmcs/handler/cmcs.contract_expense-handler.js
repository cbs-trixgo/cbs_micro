/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const CMCS__CONTRACT_EXPENSE_MODEL =
    require('../model/cmcs.contract_expense-model').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: Thêm contract payment
     */
    insert: {
        auth: 'required',
        params: {
            contractID: { type: 'string' },
            subtype: { type: 'number' },
            date: { type: 'string' },
            name: { type: 'string' },
            note: { type: 'string', optional: true },
            value: { type: 'number' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { contractID, subtype, date, name, note, value } =
                    ctx.params

                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await CMCS__CONTRACT_EXPENSE_MODEL.insert({
                        contractID,
                        subtype: Number(subtype),
                        date,
                        name,
                        note,
                        value: Number(value),
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
     * Func: Sửa contract payment
     */
    update: {
        auth: 'required',
        params: {
            expenseID: { type: 'string' },
            subtype: { type: 'number' },
            date: { type: 'string' },
            name: { type: 'string' },
            note: { type: 'string', optional: true },
            value: { type: 'number' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { expenseID, subtype, date, name, note, value } =
                    ctx.params
                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await CMCS__CONTRACT_EXPENSE_MODEL.update({
                        expenseID,
                        subtype: Number(subtype),
                        date,
                        name,
                        note,
                        value: Number(value),
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
     * Func: Xóa contract payment
     */
    remove: {
        auth: 'required',
        params: {
            expenseID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { expenseID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser
                let resultAfterCallHandler =
                    await CMCS__CONTRACT_EXPENSE_MODEL.remove({
                        expenseID,
                        userID,
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
     * Func: get info and get list contract payment
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            expenseID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },

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
                    expenseID,
                    contractID,
                    keyword,
                    limit,
                    lastestID,
                    populates,
                    select,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (expenseID) {
                    resultAfterCallHandler =
                        await CMCS__CONTRACT_EXPENSE_MODEL.getInfo({
                            expenseID,
                            userID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await CMCS__CONTRACT_EXPENSE_MODEL.getList({
                            contractID,
                            userID,
                            keyword,
                            limit,
                            lastestID,
                            select,
                            populates,
                        })
                }
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
     * Date: 18/04/2022
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
                    personInCharge,
                    chair,
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
                    await CMCS__CONTRACT_EXPENSE_MODEL.getListByMonth({
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
                        personInCharge,
                        chair,
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
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { companyID, projectID, year, outin } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }
                console.log({ companyID })

                let resultAfterCallHandler =
                    await CMCS__CONTRACT_EXPENSE_MODEL.getAmountByMonth({
                        userID,
                        companyID,
                        projectID,
                        outin: Number(outin),
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
     * Name: Gom nhóm theo đối tượng
     * Author: Hiepnh
     * Date: 16/04/2022
     */
    getAmountByObject: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            outin: { type: 'number', optional: true },
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
                    await CMCS__CONTRACT_EXPENSE_MODEL.getAmountByObject({
                        userID,
                        outin: Number(outin),
                        companyID,
                        projectID,
                        contractID,
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
                    await CMCS__CONTRACT_EXPENSE_MODEL.getAmountByProperty({
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
}
