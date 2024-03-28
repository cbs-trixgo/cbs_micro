/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const FNB_ORDER_PRODUCT_MODEL            = require('../model/fnb.order_product-model.js').MODEL;

module.exports = {
    /**
     * Name: Insert 
     * Author: HiepNH
     * Code: 24/11/2022
     */
    insert: {
        auth: "required",
        params: {
            orderID             : { type: "string" },
            productID           : { type: "string" },
            subProductsID       : { type: "string" },
            size                : { type: "number", optional: true },
            sugar               : { type: "number", optional: true },
            ice                 : { type: "number", optional: true },
            quantity            : { type: "number", optional: true },
            unitPrice           : { type: "number", optional: true },
            note                : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { orderID,  productID, size, sugar, ice, subProductsID, quantity, unitPrice, note } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FNB_ORDER_PRODUCT_MODEL.insert({
                    orderID, productID, size, sugar, ice, subProductsID, quantity, unitPrice, note, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: update Group
	 */
    update: {
        auth: "required",
        params: {
            orderID             : { type: "string" },
            mistakeID           : { type: "string", optional: true },
            customerID          : { type: "string", optional: true },
            shiftID             : { type: "string" },
            name                : { type: "string" },
            sign                : { type: "string" },
            appOrderSign        : { type: "string", optional: true },
            note                : { type: "string", optional: true },
            salesChannel        : { type: "number" },
            paymentMethod       : { type: "number" },
            shiftType           : { type: "number", optional: true },
            total               : { type: "number", optional: true },
            discount            : { type: "number", optional: true },
            salesoff            : { type: "number", optional: true },
            amount              : { type: "number", optional: true },
            vatAmount           : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  orderID, mistakeID, customerID, shiftID, name, sign, appOrderSign, note, shiftType, salesChannel, paymentMethod, total, discount, salesoff, amount, vatAmount } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FNB_ORDER_PRODUCT_MODEL.update({
                    orderID, userID,
                    mistakeID, customerID, shiftID, name, sign, appOrderSign, note, shiftType, salesChannel, paymentMethod, total, discount, salesoff, amount, vatAmount
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: remove Group
	 */
    remove: {
        auth: "required",
        params: {
            orderID   : { type: "string" }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  orderID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FNB_ORDER_PRODUCT_MODEL.remove({
                    orderID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: getList and getInfo pcm_plan_report
	 */
    getInfoAndGetList: {
        auth: "required",
        params: {
            companyID           : { type: "string", optional: true },
            fundaID             : { type: "string", optional: true },
            orderID             : { type: "string", optional: true },
            fromDate            : { type: "string", optional: true },
            toDate              : { type: "string", optional: true },
            salesChannel        : { type: "string", optional: true },

            //==============================================
            keyword     : { type: "string", optional: true },
            limit       : { type: "string", optional: true },
            lastestID   : { type: "string", optional: true },
            select      : { type: "string", optional: true },
            populates   : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { companyID, fundaID, orderID, fromDate, toDate, salesChannel, keyword, limit, lastestID, select, populates, sortKey } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FNB_ORDER_PRODUCT_MODEL.getList({
                        companyID, fundaID, orderID, fromDate, toDate, salesChannel, keyword, limit, lastestID, select, populates, sortKey, userID
                    });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Name: Danh sách theo phân loại
     * Author: HiepNH
     * Code: 14/10/2022
     */
    getListByProperty: {
        params: {
            fundasID        : { type: "array", optional: true },
            option          : { type: "string", optional: true },
            optionGroup     : { type: "string", optional: true },
            optionTime      : { type: "string", optional: true },
            year            : { type: "string", optional: true },
            fromDate        : { type: "string", optional: true },
            toDate          : { type: "string", optional: true },
            
            //_____________THÔNG SỐ MẶC ĐỊNH________________
            keyword         : { type: "string", optional: true },
            limit           : { type: "string", optional: true },
            lastestID       : { type: "string", optional: true },
            select          : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                let { option, optionGroup, optionTime, fundasID, year, fromDate, toDate,
                     keyword, limit, lastestID, select, populates, sortKey } = ctx.params;

                let resultAfterCallHandler = await FNB_ORDER_PRODUCT_MODEL.getListByProperty({
                    option, optionGroup, optionTime, fundasID, year, fromDate, toDate,
                     keyword, limit, lastestID, select, populates, sortKey, 
                     userID
                    });
             
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 8/12/2022
     */
    downloadTemplateExcel: {
        auth: 'required',
        params: {

        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, company } = ctx.meta.infoUser;

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                const resultAfterCallHandler = await FNB_ORDER_PRODUCT_MODEL.downloadTemplateExcel({
                    companyID: company._id, userID 
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 9/12/2022
     */
    importFromExcel: {
        auth: 'required',
        params: {
            // taskID    : { type: 'string', optional: true },
            dataImport: { type: 'string' }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { dataImport } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                // console.log(dataImport)

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')

                // console.log(dataImport)

                const resultAfterCallHandler = await FNB_ORDER_PRODUCT_MODEL.importFromExcel({
                    taskID, dataImport, userID, ctx
                })
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 9/12/2022
     */
    exportExcel: {
        auth: 'required',
        params: {
            companyID: { type: "string", optional: true },
            option: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                
				const { _id: userID, email, company } = ctx.meta.infoUser;
                let { companyID, option, month, year, filterParams } = ctx.params;

                if(!companyID) {
                    companyID = company._id;
                }

                const resultAfterCallHandler = await FNB_ORDER_PRODUCT_MODEL.exportExcel2({
                    userID, email, companyID, option, month, year, filterParams
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },
}