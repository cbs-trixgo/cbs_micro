/**
 * TOOLS
 */
const { renderStatusCodeAndResponse } = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const BIDDING__BILL_ITEM_MODEL = require('../model/bidding.bill_item-model').MODEL;

module.exports = {
    /**
     * Name: Insert 
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert: {
        auth: "required",
        params: {
            docID       : { type: "string" },
            name        : { type: "string" },
            sign        : { type: "string", optional: true },
            unit        : { type: "string", optional: true },
            description : { type: "string", optional: true },
            note        : { type: "string", optional: true },
            quantity    : { type: "number", optional: true },
            unitprice   : { type: "number", optional: true },
            amount      : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { docID, name, sign, unit, description, note, quantity, unitprice, amount } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;

                const resultAfterCallHandler = await BIDDING__BILL_ITEM_MODEL.insert({
                    userID, ctx, docID, name, sign, unit, description, note, quantity, unitprice, amount
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Update 
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    update: {
        auth: "required",
        params: {
            itemID      : { type: "string" },
            name        : { type: "string" },
            sign        : { type: "string", optional: true },
            unit        : { type: "string", optional: true },
            description : { type: "string", optional: true },
            note        : { type: "string", optional: true },
            quantity    : { type: "number", optional: true },
            unitprice   : { type: "number", optional: true },
            amount      : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { itemID, name, sign, unit, description, note, quantity, unitprice, amount } = ctx.params;
                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await BIDDING__BILL_ITEM_MODEL.update({
                    itemID, userID, name, sign, unit, description, note, quantity, unitprice, amount
                });
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Remove
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    remove: {
        auth: "required",
        params: {
            itemID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { itemID } = ctx.params;
                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await BIDDING__BILL_ITEM_MODEL.remove({
                    itemID, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Get info and Get list 
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getInfoAndGetList: {
        auth: "required",
        params: {
            itemID: { type: "string", optional: true },
            docID: { type: "string", optional: true },

            // Field mặc định
            keyword: { type: "string", optional: true },
            limit: { type: "string", optional: true },
            lastestID: { type: "string", optional: true },
            select: { type: "string", optional: true },
            populates: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { itemID, docID, keyword, limit, lastestID, populates, select, sortKey } = ctx.params;
                
                const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler;
                if (itemID) {
                    resultAfterCallHandler = await BIDDING__BILL_ITEM_MODEL.getInfo({
                        itemID, userID, select, populates
                    });
                } else {
                    resultAfterCallHandler = await BIDDING__BILL_ITEM_MODEL.getList({
                        docID, userID, keyword, limit, lastestID, select, populates, sortKey
                    });
                }
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    }
}