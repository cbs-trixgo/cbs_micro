/**
 * TOOLS
 */
const { renderStatusCodeAndResponse } = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const BIDDING__APPLY_MODEL = require('../model/bidding.apply-model').MODEL;

module.exports = {
    /**
     * Name: Insert 
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    insert: {
        auth: "required",
        params: {
            // parentID: { type: "string", optional: true },
            // accountID: { type: "string", optional: true },
            // customerID: { type: "string", optional: true },
            // contractID: { type: "string", optional: true },
            // name: { type: "string" },
            // sign: { type: "string", optional: true },
            // note: { type: "string", optional: true },
            // date: { type: "string", optional: true },
            // income: { type: "number", optional: true },
            // expense: { type: "number", optional: true },
            // arising: { type: "number", optional: true },
            // openingBalance: { type: "number", optional: true },
            // closingBalance: { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { requestID, name, description, note } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;

                const resultAfterCallHandler = await BIDDING__APPLY_MODEL.insert({
                    requestID, userID, contractorID: company._id, name, description, note, ctx
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
     * Date: 30/4/2022
     */
    update: {
        auth: "required",
        params: {
            // cashBookID: { type: "string" },
            // accountID: { type: "string", optional: true },
            // customerID: { type: "string", optional: true },
            // contractID: { type: "string", optional: true },
            // name: { type: "string", optional: true },
            // sign: { type: "string", optional: true },
            // note: { type: "string", optional: true },
            // date: { type: "string", optional: true },
            // income: { type: "number", optional: true },
            // expense: { type: "number", optional: true },
            // active: { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { applyID, name, description, note } = ctx.params;
                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await BIDDING__APPLY_MODEL.update({
                    applyID, name, description, note, userID, ctx
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
     * Date: 30/4/2022
     */
    remove: {
        auth: "required",
        params: {
            appliesID: { type: "array" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { appliesID } = ctx.params;
                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await BIDDING__APPLY_MODEL.remove({
                    appliesID, userID
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
     * Date: 30/4/2022
     */
    getInfoAndGetList: {
        auth: "required",
        params: {
            applyID: { type: "string", optional: true },
            // parentID: { type: "string", optional: true },
            // accountID: { type: "string", optional: true },
            // customerID: { type: "string", optional: true },
            // contractID: { type: "string", optional: true },
            // sortKey: { type: "string", optional: true },
            // outin: { type: "string", optional: true },

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
                let { applyID, requestID, keyword, limit, lastestID, populates, select, sortKey } = ctx.params;
                
                const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler;
                if (applyID) {
                    resultAfterCallHandler = await BIDDING__APPLY_MODEL.getInfo({
                        applyID, userID, select, populates
                    });
                } else {
                    resultAfterCallHandler = await BIDDING__APPLY_MODEL.getList({
                        requestID, userID, keyword, limit, lastestID, select, populates, sortKey
                    });
                }
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    }
}