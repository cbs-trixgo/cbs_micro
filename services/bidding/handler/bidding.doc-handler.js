/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')

/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BIDDING__DOC_MODEL = require('../model/bidding.doc-model').MODEL

module.exports = {
    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    insert: {
        auth: 'required',
        params: {
            planID: { type: 'string' },
            name: { type: 'string' },
            note: { type: 'string', optional: true },
            releaseTime: { type: 'string', optional: true },
            closingTime: { type: 'string', optional: true },
            amount: { type: 'number', optional: true },
            factor1: { type: 'number', optional: true },
            factor2: { type: 'number', optional: true },
            factor3: { type: 'number', optional: true },
            factor4: { type: 'number', optional: true },
            factor5: { type: 'number', optional: true },
            vatValue: { type: 'number', optional: true },
        },

        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const {
                    planID,
                    parentID,
                    name,
                    sign,
                    note,
                    releaseTime,
                    closingTime,
                    amount,
                    assigneeID,
                    agreeStatus,
                    bidPrice,
                    bidPriceDiscount,
                    bidPriceAdjustment,
                    openedStatus,
                    bidderID,
                    tenderPrice,
                    vatTenderPrice,
                    factor1,
                    factor2,
                    factor3,
                    factor4,
                    factor5,
                    vat,
                    vatValue,
                } = ctx.params

                // Hồ sơ dự thầu
                let companyOfAssigneeID
                if (parentID && assigneeID) {
                    let infoCompanyOfAssigneeID = await ctx.call(
                        `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`,
                        { userID: assigneeID }
                    )

                    if (infoCompanyOfAssigneeID) {
                        companyOfAssigneeID =
                            infoCompanyOfAssigneeID.data.company
                    }
                }

                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler = await BIDDING__DOC_MODEL.insert({
                    userID,
                    ctx,
                    planID,
                    parentID,
                    name,
                    sign,
                    note,
                    releaseTime,
                    closingTime,
                    amount,
                    companyOfAssigneeID,
                    assigneeID,
                    agreeStatus,
                    bidPrice,
                    bidPriceDiscount,
                    bidPriceAdjustment,
                    openedStatus,
                    bidderID,
                    tenderPrice,
                    vatTenderPrice,
                    factor1,
                    factor2,
                    factor3,
                    factor4,
                    factor5,
                    vat,
                    vatValue,
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
     * Date: 30/4/2022
     */
    update: {
        auth: 'required',
        params: {
            docID: { type: 'string' },
            name: { type: 'string' },
            note: { type: 'string', optional: true },
            releaseTime: { type: 'string', optional: true },
            closingTime: { type: 'string', optional: true },
            amount: { type: 'number', optional: true },
            factor1: { type: 'number', optional: true },
            factor2: { type: 'number', optional: true },
            factor3: { type: 'number', optional: true },
            factor4: { type: 'number', optional: true },
            factor5: { type: 'number', optional: true },
            vatValue: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const {
                    docID,
                    name,
                    sign,
                    note,
                    releaseTime,
                    closingTime,
                    amount,
                    agreeStatus,
                    bidPrice,
                    bidPriceDiscount,
                    bidPriceAdjustment,
                    openedStatus,
                    bidderID,
                    tenderPrice,
                    vatTenderPrice,
                    timeApproved,
                    factor1,
                    factor2,
                    factor3,
                    factor4,
                    factor5,
                    vat,
                    vatValue,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser
                console.log({
                    docID,
                    name,
                    sign,
                    note,
                    releaseTime,
                    closingTime,
                    amount,
                    agreeStatus,
                    bidPrice,
                    bidPriceDiscount,
                    bidPriceAdjustment,
                    openedStatus,
                    bidderID,
                    tenderPrice,
                    vatTenderPrice,
                    timeApproved,
                    factor1,
                    factor2,
                    factor3,
                    factor4,
                    factor5,
                    vat,
                    vatValue,
                })
                const resultAfterCallHandler = await BIDDING__DOC_MODEL.update({
                    docID,
                    userID,
                    ctx,
                    name,
                    sign,
                    note,
                    releaseTime,
                    closingTime,
                    amount,
                    agreeStatus,
                    bidPrice,
                    bidPriceDiscount,
                    bidPriceAdjustment,
                    openedStatus,
                    bidderID,
                    tenderPrice,
                    vatTenderPrice,
                    timeApproved,
                    factor1,
                    factor2,
                    factor3,
                    factor4,
                    factor5,
                    vat,
                    vatValue,
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
     * Date: 30/4/2022
     */
    remove: {
        auth: 'required',
        params: {
            docID: { type: 'array' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { docID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler = await BIDDING__DOC_MODEL.remove({
                    docID,
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
     * Date: 30/4/2022
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            docID: { type: 'string', optional: true },
            // parentID: { type: "string", optional: true },
            // accountID: { type: "string", optional: true },
            // customerID: { type: "string", optional: true },
            // contractID: { type: "string", optional: true },
            // sortKey: { type: "string", optional: true },
            // outin: { type: "string", optional: true },

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
                    docID,
                    clientID,
                    projectID,
                    planID,
                    parentID,
                    bidderID,
                    contractID,
                    keyword,
                    limit,
                    lastestID,
                    populates,
                    select,
                    sortKey,
                } = ctx.params

                const { _id: userID, company } = ctx.meta.infoUser

                if (!clientID) {
                    clientID = company._id
                }

                let resultAfterCallHandler
                if (docID) {
                    resultAfterCallHandler = await BIDDING__DOC_MODEL.getInfo({
                        docID,
                        userID,
                        select,
                        populates,
                    })
                } else {
                    resultAfterCallHandler = await BIDDING__DOC_MODEL.getList({
                        clientID,
                        projectID,
                        planID,
                        parentID,
                        bidderID,
                        contractID,
                        userID,
                        keyword,
                        limit,
                        lastestID,
                        populates,
                        select,
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
