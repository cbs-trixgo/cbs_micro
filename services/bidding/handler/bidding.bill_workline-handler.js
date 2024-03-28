/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BIDDING__BILL_WORKLINE_MODEL =
    require('../model/bidding.bill_workline-model').MODEL

module.exports = {
    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert: {
        auth: 'required',
        params: {},
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {} = ctx.params

                let { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                const resultAfterCallHandler =
                    await BIDDING__BILL_WORKLINE_MODEL.insert({})

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
     * Name: Update
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    update: {
        auth: 'required',
        params: {
            worklineID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { worklineID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await BIDDING__BILL_WORKLINE_MODEL.update({
                        worklineID,
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
     * Name: Remove
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    remove: {
        auth: 'required',
        params: {
            worklineID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { worklineID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await BIDDING__BILL_WORKLINE_MODEL.remove({
                        worklineID,
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
     * Name: Get info and get list
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            worklineID: { type: 'string', optional: true },
            productID: { type: 'string', optional: true },
            workID: { type: 'string', optional: true },
            groupID: { type: 'string', optional: true },
            itemID: { type: 'string', optional: true },
            docID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },

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
                    worklineID,
                    productID,
                    workID,
                    groupID,
                    itemID,
                    docID,
                    projectID,
                    keyword,
                    limit,
                    lastestID,
                    populates,
                    select,
                    sortKey,
                } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (worklineID) {
                    resultAfterCallHandler =
                        await BIDDING__BILL_WORKLINE_MODEL.getInfo({
                            worklineID,
                            userID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await BIDDING__BILL_WORKLINE_MODEL.getList({
                            productID,
                            workID,
                            groupID,
                            itemID,
                            docID,
                            projectID,
                            userID,
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
}
