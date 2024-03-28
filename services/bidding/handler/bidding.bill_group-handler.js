/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BIDDING__BILL_GROUP_MODEL =
    require('../model/bidding.bill_group-model').MODEL

module.exports = {
    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert: {
        auth: 'required',
        params: {
            itemID: { type: 'string' },
            name: { type: 'string' },
            sign: { type: 'string', optional: true },
            unit: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            quantity: { type: 'number', optional: true },
            unitprice: { type: 'number', optional: true },
            amount: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const {
                    itemID,
                    name,
                    sign,
                    unit,
                    description,
                    note,
                    quantity,
                    unitprice,
                    amount,
                } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await BIDDING__BILL_GROUP_MODEL.insert({
                        userID,
                        ctx,
                        itemID,
                        name,
                        sign,
                        unit,
                        description,
                        note,
                        quantity,
                        unitprice,
                        amount,
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
     * Name: Update
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    update: {
        auth: 'required',
        params: {
            groupID: { type: 'string' },
            name: { type: 'string' },
            sign: { type: 'string', optional: true },
            unit: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            quantity: { type: 'number', optional: true },
            unitprice: { type: 'number', optional: true },
            amount: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const {
                    groupID,
                    name,
                    sign,
                    unit,
                    description,
                    note,
                    quantity,
                    unitprice,
                    amount,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await BIDDING__BILL_GROUP_MODEL.update({
                        groupID,
                        userID,
                        name,
                        sign,
                        unit,
                        description,
                        note,
                        quantity,
                        unitprice,
                        amount,
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
            groupID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { groupID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await BIDDING__BILL_GROUP_MODEL.remove({
                        groupID,
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
     * Name: Get info and Get list
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            groupID: { type: 'string', optional: true },
            itemID: { type: 'string', optional: true },

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
                    groupID,
                    itemID,
                    keyword,
                    limit,
                    lastestID,
                    populates,
                    select,
                    sortKey,
                } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (groupID) {
                    resultAfterCallHandler =
                        await BIDDING__BILL_GROUP_MODEL.getInfo({
                            groupID,
                            userID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await BIDDING__BILL_GROUP_MODEL.getList({
                            itemID,
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
