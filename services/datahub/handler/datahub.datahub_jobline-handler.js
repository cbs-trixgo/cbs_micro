/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const DATAHUB_JOBLINE_MODEL =
    require('../model/datahub.datahub_jobline-model').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: Thêm datahub
     */
    insert: {
        params: {
            jobID: { type: 'string' },
            productID: { type: 'string' },
            quantity: { type: 'number' },
            note: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { jobID, productID, quantity, note } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await DATAHUB_JOBLINE_MODEL.insert(
                    {
                        jobID,
                        productID,
                        quantity,
                        note,
                        userID,
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
     * Func: Sửa datahub
     */
    update: {
        params: {
            joblineID: { type: 'string' },
            quantity: { type: 'number' },
            note: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { joblineID, quantity } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await DATAHUB_JOBLINE_MODEL.update(
                    {
                        joblineID,
                        quantity,
                        userID,
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
     * Func: Xóa datahub
     */
    remove: {
        params: {
            joblineID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { joblineID } = ctx.params
                console.log(joblineID)

                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await DATAHUB_JOBLINE_MODEL.remove(
                    {
                        joblineID,
                        userID,
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
     * Func: get info and get list datahub
     */
    getInfoAndGetList: {
        params: {
            joblineID: { type: 'string', optional: true },
            jobID: { type: 'string', optional: true },

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
                    joblineID,
                    jobID,
                    lastestID,
                    keyword,
                    limit,
                    select,
                    populates,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (joblineID) {
                    resultAfterCallHandler =
                        await DATAHUB_JOBLINE_MODEL.getInfo({
                            joblineID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await DATAHUB_JOBLINE_MODEL.getList({
                            jobID,
                            userID,
                            lastestID,
                            keyword,
                            limit,
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
