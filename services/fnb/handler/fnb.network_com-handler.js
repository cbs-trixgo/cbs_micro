/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')
const moment = require('moment')
const { isValidDate } = require('../../../tools/utils/time_utils')

/**
 * MODELS
 */
const FNB_NETWORK_COM_MODEL = require('../model/fnb.network_com-model').MODEL

module.exports = {
    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 24/11/2022
     */
    insert: {
        auth: 'required',
        params: {
            orderID: { type: 'string' },
            customerID: { type: 'string', optional: true },
            saleID: { type: 'string', optional: true },
            amount: { type: 'number', optional: true },
            uplineID: { type: 'string', optional: true },
            level: { type: 'number', optional: true },
            rate: { type: 'number', optional: true },
            commission: { type: 'number', optional: true },
            note: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    orderID,
                    customerID,
                    saleID,
                    amount,
                    uplineID,
                    level,
                    rate,
                    commission,
                    note,
                } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler = await FNB_NETWORK_COM_MODEL.insert(
                    {
                        userID,
                        companyID: company._id,
                        orderID,
                        customerID,
                        saleID,
                        amount,
                        uplineID,
                        level,
                        rate,
                        commission,
                        note,
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
     * Dev: HiepNH
     * Func: update Group
     */
    update: {
        auth: 'required',
        params: {
            networkID: { type: 'string', optional: true },
            customerID: { type: 'string', optional: true },
            saleID: { type: 'string', optional: true },
            amount: { type: 'number', optional: true },
            uplineID: { type: 'string', optional: true },
            level: { type: 'number', optional: true },
            rate: { type: 'number', optional: true },
            commission: { type: 'number', optional: true },
            note: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    networkID,
                    orderID,
                    customerID,
                    saleID,
                    amount,
                    uplineID,
                    level,
                    rate,
                    commission,
                    note,
                } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler = await FNB_NETWORK_COM_MODEL.update(
                    {
                        userID,
                        companyID: company._id,
                        networkID,
                        orderID,
                        customerID,
                        saleID,
                        amount,
                        uplineID,
                        level,
                        rate,
                        commission,
                        note,
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
     * Dev: HiepNH
     * Func: remove Group
     */
    remove: {
        auth: 'required',
        params: {
            networkID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { networkID } = ctx.params

                let resultAfterCallHandler = await FNB_NETWORK_COM_MODEL.remove(
                    {
                        networkID,
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
     * Dev: HiepNH
     * Func: getList and getInfo pcm_plan_report
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            networkID: { type: 'string', optional: true },
            option: { type: 'string', optional: true },

            //==============================================
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
                    option,
                    networkID,
                    orderID,
                    customerID,
                    saleID,
                    uplineID,
                    fromDate,
                    toDate,
                    status,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    sortKey,
                } = ctx.params

                // console.log(ctx.params)

                const { _id: userID, contacts, company } = ctx.meta.infoUser

                if (isValidDate(fromDate) && isValidDate(toDate)) {
                    // Convert dữ liệu ngày tháng để theo chuẩn chung: startOf của ngày bắt đầu, endOf của ngày kết thúc
                    fromDate = moment(fromDate).startOf('day').format() // <=== fix ISODate here
                    toDate = moment(toDate).endOf('day').format() // <=== fix ISODate here
                }

                let resultAfterCallHandler
                if (networkID) {
                    resultAfterCallHandler =
                        await FNB_NETWORK_COM_MODEL.getInfo({
                            networkID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await FNB_NETWORK_COM_MODEL.getList({
                            userID,
                            contacts,
                            companyID: company._id,
                            option,
                            orderID,
                            customerID,
                            saleID,
                            uplineID,
                            fromDate,
                            toDate,
                            status,
                            keyword,
                            limit,
                            lastestID,
                            select,
                            populates,
                            sortKey,
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
     * Name: Lấy số dư tài khoản
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getListByProperty: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    option,
                    optionGroup,
                    companyID,
                    orderID,
                    customerID,
                    saleID,
                    uplineID,
                    fromDate,
                    toDate,
                    status,
                } = ctx.params

                // console.log(ctx.params)

                const { _id: userID, contacts, company } = ctx.meta.infoUser

                if (isValidDate(fromDate) && isValidDate(toDate)) {
                    // Convert dữ liệu ngày tháng để theo chuẩn chung: startOf của ngày bắt đầu, endOf của ngày kết thúc
                    fromDate = moment(fromDate).startOf('day').format() // <=== fix ISODate here
                    toDate = moment(toDate).endOf('day').format() // <=== fix ISODate here
                }

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler =
                    await FNB_NETWORK_COM_MODEL.getListByProperty({
                        userID,
                        contacts,
                        option,
                        optionGroup,
                        companyID,
                        orderID,
                        customerID,
                        saleID,
                        uplineID,
                        fromDate,
                        toDate,
                        status,
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
     * Func: Download Template Excel
     * Date: 8/12/2022
     */
    downloadTemplateExcel: {
        auth: 'required',
        params: {},
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                const resultAfterCallHandler =
                    await FNB_NETWORK_COM_MODEL.downloadTemplateExcel({
                        companyID: company._id,
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
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 9/12/2022
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

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log(dataImport)

                const resultAfterCallHandler =
                    await FNB_NETWORK_COM_MODEL.importFromExcel({
                        companyID: company._id,
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
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 9/12/2022
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
                const { _id: userID, company } = ctx.meta.infoUser
                let { companyID, filterParams } = ctx.params
                // console.log({ companyID, option, filterParams })

                if (!companyID) {
                    companyID = company._id
                }

                const resultAfterCallHandler =
                    await FNB_NETWORK_COM_MODEL.exportExcel({
                        userID,
                        companyID,
                        filterParams,
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
