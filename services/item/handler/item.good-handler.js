/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__GOODS_MODEL = require('../model/item.good-model').MODEL

module.exports = {
    /**
     * Dev: HiepNH ✅
     * Func: Thêm goods
     */
    insert: {
        params: {
            parentID: { type: 'string', optional: true },
            name: { type: 'string' },
            sign: { type: 'string', optional: true },
            unit: { type: 'string', optional: true },
            unitprice: { type: 'number', optional: true },
            sellingUnitprice: { type: 'number', optional: true },
            note: { type: 'string', optional: true },
            type: { type: 'number', optional: true },
            unitPrice: { type: 'number', optional: true },
            unitPrice2: { type: 'number', optional: true },
            unitPrice3: { type: 'number', optional: true },
            unitPrice4: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const {
                    name,
                    sign,
                    unit,
                    unitprice,
                    sellingUnitprice,
                    note,
                    type,
                    unitPrice,
                    unitPrice2,
                    unitPrice3,
                    unitPrice4,
                    parentID,
                    convertID,
                    convertQuantity,
                    status,
                    usage,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                // console.log(ctx.params)

                const resultAfterCallHandler = await ITEM__GOODS_MODEL.insert({
                    companyID: company._id,
                    parentID,
                    convertID,
                    convertQuantity,
                    status,
                    usage,
                    name,
                    sign,
                    unit,
                    unitprice,
                    sellingUnitprice,
                    note,
                    type,
                    unitPrice,
                    unitPrice2,
                    unitPrice3,
                    unitPrice4,
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
     * Dev: HiepNH ✅
     * Func: Cập nhật goods
     */
    update: {
        params: {
            goodsID: { type: 'string' },
            name: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            unit: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            unitprice: { type: 'number', optional: true },
            sellingUnitprice: { type: 'number', optional: true },
            type: { type: 'number', optional: true },
            unitPrice: { type: 'number', optional: true },
            unitPrice2: { type: 'number', optional: true },
            unitPrice3: { type: 'number', optional: true },
            unitPrice4: { type: 'number', optional: true },
            imagesID: { type: 'array', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const {
                    goodsID,
                    name,
                    sign,
                    unit,
                    unitprice,
                    sellingUnitprice,
                    note,
                    type,
                    unitPrice,
                    unitPrice2,
                    unitPrice3,
                    unitPrice4,
                    convertID,
                    convertQuantity,
                    status,
                    usage,
                    imagesID,
                } = ctx.params

                // console.log(ctx.params)

                const resultAfterCallHandler = await ITEM__GOODS_MODEL.update({
                    goodsID,
                    name,
                    sign,
                    unit,
                    unitprice,
                    sellingUnitprice,
                    note,
                    type,
                    unitPrice,
                    unitPrice2,
                    unitPrice3,
                    unitPrice4,
                    userID,
                    convertID,
                    convertQuantity,
                    status,
                    usage,
                    imagesID,
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
     * Func: Danh sách goods
     */
    getInfoAndGetList: {
        params: {
            goodsID: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
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
                    goodsID,
                    companyID,
                    parentID,
                    fundaID,
                    type,
                    isParent,
                    status,
                    usage,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    isListParentOfListChilds,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler
                if (goodsID) {
                    resultAfterCallHandler = await ITEM__GOODS_MODEL.getInfo({
                        goodsID,
                        select,
                        populates,
                    })
                } else {
                    resultAfterCallHandler = await ITEM__GOODS_MODEL.getList({
                        companyID,
                        parentID,
                        fundaID,
                        type,
                        isParent,
                        status,
                        usage,
                        lastestID,
                        keyword,
                        select,
                        limit,
                        populates,
                        parentID,
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
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 8/12/2022
     */
    downloadTemplateExcel: {
        auth: 'required',
        params: {},
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await ITEM__GOODS_MODEL.downloadTemplateExcel({
                        companyID: company._id,
                        userID,
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
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 9/12/2022
     */
    importFromExcel: {
        auth: 'required',
        params: {
            dataImport: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { dataImport } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await ITEM__GOODS_MODEL.importFromExcel({
                        companyID: company._id,
                        dataImport,
                        userID,
                        ctx,
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
     * Func: Download Excel Contact
     * Date: 21/06/2022
     */
    exportExcel: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                let { companyID, filterParams } = ctx.params

                if (!companyID) {
                    companyID = company._id
                }

                const resultAfterCallHandler =
                    await ITEM__GOODS_MODEL.exportExcel({
                        userID,
                        companyID,
                        filterParams,
                        ctx,
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
}
