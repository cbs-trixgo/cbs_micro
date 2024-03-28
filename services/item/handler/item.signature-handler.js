/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__SIGNATURE_MODEL = require('../model/item.signature-model').MODEL

module.exports = {
    /**
     * Dev: MinhVH
     * Func: Thêm signature
     * Date: 25/03/2022
     */
    insert: {
        params: {
            companyID: { type: 'string' },
            projectID: { type: 'string' },
            // coll            : { type: "string" },
            title: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { companyID, projectID, coll, title, note } = ctx.params

                console.log(companyID, projectID, coll, title, note)

                const resultAfterCallHandler =
                    await ITEM__SIGNATURE_MODEL.insert({
                        companyID,
                        projectID,
                        coll,
                        title,
                        note,
                        authorID,
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
     * Func: Danh sách signature
     * Date: 25/03/2022
     */
    getInfoAndGetList: {
        params: {
            signatureID: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            // Field mặc định
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    signatureID,
                    companyID,
                    projectID,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params
                let { _id: authorID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (signatureID) {
                    resultAfterCallHandler =
                        await ITEM__SIGNATURE_MODEL.getInfo({
                            signatureID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await ITEM__SIGNATURE_MODEL.getList({
                            companyID,
                            projectID,
                            lastestID,
                            keyword,
                            limit,
                            select,
                            populates,
                            authorID,
                        })
                }

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
