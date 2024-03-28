/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__ACCOUNT_MODEL = require('../model/item.account-model').MODEL

module.exports = {
    /**
     * Name: Insert ✅
     * Author : Hiepnh
     * Date: 03/5/2022
     */
    insert: {
        params: {
            name: { type: 'string' },
            description: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                const { name, description, parentID } = ctx.params
                const resultAfterCallHandler = await ITEM__ACCOUNT_MODEL.insert(
                    {
                        companyID: company._id,
                        parentID,
                        name,
                        description,
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
     * Name: Update ✅
     * Author : Hiepnh
     * Date: 03/5/2022
     */
    update: {
        params: {
            accountID: { type: 'string' },
            name: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                const { accountID, name, description } = ctx.params
                const resultAfterCallHandler = await ITEM__ACCOUNT_MODEL.update(
                    { accountID, name, description, userID }
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
     * Name: Get info and get list ✅
     * Author : Hiepnh
     * Date: 03/5/2022
     */
    getInfoAndGetList: {
        params: {
            accountID: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            arrNames: { type: 'array', optional: true },
            isListParentOfListChilds: { type: 'string', optional: true },

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
                    option,
                    accountID,
                    companyID,
                    keyword,
                    parentID,
                    arrNames,
                    isListParentOfListChilds,
                    limit,
                    lastestID,
                    select,
                    populates,
                    status,
                    type,
                    level,
                    isAccountingService,
                } = ctx.params
                // console.log(ctx.params)

                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }
                let resultAfterCallHandler
                if (accountID) {
                    resultAfterCallHandler = await ITEM__ACCOUNT_MODEL.getInfo({
                        accountID,
                        select,
                        populates,
                    })
                } else {
                    resultAfterCallHandler = await ITEM__ACCOUNT_MODEL.getList({
                        option,
                        companyID,
                        lastestID,
                        keyword,
                        select,
                        limit,
                        populates,
                        status,
                        type,
                        level,
                        isAccountingService,
                        parentID,
                        arrNames,
                        isListParentOfListChilds,
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
     * Name : Danh sách tài khoản + con cháu của 1 tài khoản ✅
     * Author : Hiepnh
     * Date: 03/5/2022
     */
    getListNestedItem: {
        params: {
            accountID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                const {
                    accountID,
                    status,
                    showInReportMonth,
                    isNestedOfCompany,
                } = ctx.params

                console.log({
                    accountID,
                    status,
                    showInReportMonth,
                    isNestedOfCompany,
                })

                let resultAfterCallHandler
                if (!isNestedOfCompany) {
                    resultAfterCallHandler =
                        await ITEM__ACCOUNT_MODEL.getListByCompany({
                            companyID: company._id,
                            status,
                            showInReportMonth,
                        })
                }
                if (isNestedOfCompany) {
                    resultAfterCallHandler =
                        await ITEM__ACCOUNT_MODEL.getListNestedItem({
                            accountID,
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

    getInfoAccountWithName: {
        params: {
            companyID: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { companyID, name } = ctx.params
                const resultAfterCallHandler =
                    await ITEM__ACCOUNT_MODEL.getInfoAccountWithName({
                        companyID,
                        name,
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
     * Dev: HuynhVinh
     * Func:
     */
    getInfoAccount: {
        params: {
            accountID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { accountID } = ctx.params
                const resultAfterCallHandler =
                    await ITEM__ACCOUNT_MODEL.getInfoAccount({ accountID })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    getListWithKey: {
        params: {
            accountID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { key, lastestID, limit } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser
                const resultAfterCallHandler =
                    await ITEM__ACCOUNT_MODEL.getListWithKey({
                        companyID: company._id,
                        key,
                        limit,
                        lastestID,
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
}
