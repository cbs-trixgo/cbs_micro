/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BUDGET_MODEL = require('../model/budget-model').MODEL

module.exports = {
    /**
     * Dev: Hiepnh
     * Func: Thêm
     * Date: 9/4/2022
     */
    insert: {
        auth: 'required',
        params: {
            type: { type: 'number', optional: true },
            projectID: { type: 'string', optional: true }, // Để lại sau
            contractID: { type: 'string', optional: true }, // Để lại sau
            name: { type: 'string' },
            sign: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            date: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            revenue: { type: 'number', optional: true },
            vatRevenue: { type: 'number', optional: true },
            forecastRevenue: { type: 'number', optional: true },
            forecastVatRevenue: { type: 'number', optional: true },
            finalRevenue: { type: 'number', optional: true },
            finalVatRevenue: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
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
                } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler = await BUDGET_MODEL.insert({
                    ctx,
                    userID,
                    companyID: company._id,
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
     * Func: Sửa
     * Date: 9/4/2022
     */
    update: {
        auth: 'required',
        params: {
            budgetID: { type: 'string' },
            type: { type: 'number', optional: true },
            projectID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            name: { type: 'string' },
            sign: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            date: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            revenue: { type: 'number', optional: true },
            vatRevenue: { type: 'number', optional: true },
            forecastRevenue: { type: 'number', optional: true },
            forecastVatRevenue: { type: 'number', optional: true },
            finalRevenue: { type: 'number', optional: true },
            finalVatRevenue: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
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
                } = ctx.params

                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await BUDGET_MODEL.update({
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
     * Dev: Hiepnh
     * Func: Xóa
     * Date: 9/4/2022
     */
    remove: {
        auth: 'required',
        params: {
            budgetsID: { type: 'array' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { budgetsID } = ctx.params

                const resultAfterCallHandler = await BUDGET_MODEL.remove({
                    budgetsID,
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
     * Dev: Hiepnh
     * Func: get info and get list
     * Date: 9/4/2022
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            type: { type: 'string', optional: true },
            isMember: { type: 'string', optional: true },
            budgetID: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
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
                    budgetID,
                    isMember,
                    companyID,
                    projectID,
                    contractID,
                    type,
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

                let resultAfterCallHandler
                if (budgetID) {
                    resultAfterCallHandler = await BUDGET_MODEL.getInfo({
                        budgetID,
                        userID,
                        select,
                        populates,
                    })
                } else {
                    resultAfterCallHandler = await BUDGET_MODEL.getList({
                        isMember,
                        companyID,
                        projectID,
                        contractID,
                        type,
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
     * Dev: Hiepnh
     * Func: Cập nhật giá trị (ngân sách, thực hiện, dự báo)
     * Date: 9/4/2022
     */
    updateValue: {
        auth: 'required',
        params: {
            option: { type: 'number' },
            budgetID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { option, budgetID } = ctx.params

                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await BUDGET_MODEL.updateValue({
                    option,
                    budgetID,
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
     * Name: downloadTemplateExcel
     * Dev: HiepNH
     * Date: 4/8/2023
     */
    downloadTemplateExcel: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                let { projectID } = ctx.params
                // console.log(ctx.params)

                const resultAfterCallHandler =
                    await BUDGET_MODEL.downloadTemplateExcel({
                        companyID: company._id,
                        projectID,
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
     * Name: importExcel
     * Dev: HiepNH
     * Date: 4/8/2023
     */
    importExcel: {
        auth: 'required',
        params: {
            projectID: { type: 'string', optional: true },
            dataImport: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { projectID, dataImport } = ctx.params
                const { _id: userID } = ctx.meta.infoUser
                // console.log(dataImport)

                const resultAfterCallHandler = await BUDGET_MODEL.importExcel({
                    projectID,
                    dataImport,
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
     * Name: exportExcel
     * Dev: HiepNH
     * Date: 4/8/2023
     */
    exportExcel: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            option: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, email, company } = ctx.meta.infoUser
                let { companyID, option, month, year, filterParams } =
                    ctx.params
                // console.log({ companyID, option, filterParams })

                if (!companyID) {
                    companyID = company._id
                }

                const resultAfterCallHandler = await BUDGET_MODEL.exportExcel({
                    userID,
                    email,
                    companyID,
                    option,
                    month,
                    year,
                    filterParams,
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
