/*******************************************************
 *    TÊN MODULE : APP COMPANY                         *
 *    NGƯỜI VIÊT : PHAN VĂN ĐỆ                         *
 *    LIỆN HỆ    : lucdeit1997@gmail.com - 0393553224  *
 *    THỜI GIAN  : 27/01/2022                          *
 ********************************************************/
/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const AUTH__APP_COMPANY = require('../model/auth.app_company').MODEL

module.exports = {
    insert: {
        auth: 'required',
        params: {
            app: { type: 'string' },
            company: { type: 'string' },
            maxCount: { type: 'number' },
            maxData: { type: 'number' },
            startTime: { type: 'string' },
            endTime: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { _id: userID } = ctx.meta.infoUser
                let { app, company, maxCount, maxData, startTime, endTime } =
                    ctx.params

                let resultAfterCallHandler = await AUTH__APP_COMPANY.insert({
                    app,
                    company,
                    maxCount,
                    maxData,
                    startTime,
                    endTime,
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

    update: {
        auth: 'required',
        params: {
            appCompanyID: { type: 'string' },
            maxCount: { type: 'number', optional: true },
            maxData: { type: 'number', optional: true },
            startTime: { type: 'string', optional: true },
            endTime: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { _id: userID } = ctx.meta.infoUser
                let { appCompanyID, maxCount, maxData, startTime, endTime } =
                    ctx.params

                let resultAfterCallHandler = await AUTH__APP_COMPANY.update({
                    appCompanyID,
                    maxCount,
                    maxData,
                    startTime,
                    endTime,
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

    remove: {
        auth: 'required',
        params: {
            appCompanyID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { _id: userID } = ctx.meta.infoUser
                let { appCompanyID } = ctx.params
                let resultAfterCallHandler = await AUTH__APP_COMPANY.remove({
                    appCompanyID,
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

    getInfoAndGetList: {
        auth: 'required',
        params: {
            appCompanyID: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },

            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    appCompanyID,
                    companyID,
                    select,
                    populates,
                    limit,
                    lastestID,
                } = ctx.params
                let resultAfterCallHandler

                if (appCompanyID) {
                    resultAfterCallHandler = await AUTH__APP_COMPANY.getInfo({
                        appCompanyID,
                        select,
                        populates,
                    })
                } else {
                    resultAfterCallHandler = await AUTH__APP_COMPANY.getList({
                        companyID,
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
}
