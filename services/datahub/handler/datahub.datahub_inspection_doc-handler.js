/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const DATAHUB_INSPECTION_DOC_MODEL =
    require('../model/datahub.datahub_inspection_doc-model').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: Thêm datahub inspection doc
     */
    insert: {
        params: {
            type: { type: 'number' },
            name: { type: 'string' },
            sign: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { type, name, sign, description } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await DATAHUB_INSPECTION_DOC_MODEL.insert({
                        type,
                        name,
                        sign,
                        description,
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
     * Func: Sửa datahub inspection doc
     */
    update: {
        params: {
            inspectionDocID: { type: 'string' },
            name: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { inspectionDocID, name, sign, description } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await DATAHUB_INSPECTION_DOC_MODEL.update({
                        inspectionDocID,
                        name,
                        sign,
                        description,
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
     * Func: Xóa datahub inspection doc
     */
    remove: {
        params: {
            inspectionDocID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { inspectionDocID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await DATAHUB_INSPECTION_DOC_MODEL.remove({
                        inspectionDocID,
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
     * Func: get info and get list datahub
     */
    getInfoAndGetList: {
        params: {
            inspectionDocID: { type: 'string', optional: true },
            type: { type: 'string', optional: true },

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
                    inspectionDocID,
                    type,
                    lastestID,
                    keyword,
                    limit,
                    select,
                    populates,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (inspectionDocID) {
                    resultAfterCallHandler =
                        await DATAHUB_INSPECTION_DOC_MODEL.getInfo({
                            inspectionDocID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await DATAHUB_INSPECTION_DOC_MODEL.getList({
                            type,
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
