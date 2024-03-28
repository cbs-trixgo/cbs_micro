/**
 * TOOLS
 */
const { renderStatusCodeAndResponse } = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const FIN__CASH_PAYMENT_MODEL = require('../model/fin.cash_payment-model').MODEL;

module.exports = {
    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert: {
        auth: "required",
        params: {
            customerID: { type: "string", optional: true },
            name: { type: "string" },
            note: { type: "string", optional: true },
            amount: { type: "number", optional: true },
            payment: { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { customerID, name, note, amount, payment } = ctx.params;

                const { _id: userID, email, company } = ctx.meta.infoUser;

                const resultAfterCallHandler = await FIN__CASH_PAYMENT_MODEL.insert({
                    companyID: company._id, userID, email, customerID, name, note, amount, payment
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
            cashPaymentID  : { type: "string" },
            name: { type: "string" },
            note: { type: "string", optional: true },
            amount: { type: "number", optional: true },
            active: { type: "number", optional: true },
            payment: { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { cashPaymentID, name, note, amount, payment, active } = ctx.params;
                const { _id: userID, email } = ctx.meta.infoUser;

                // console.log(ctx.params)

                const resultAfterCallHandler = await FIN__CASH_PAYMENT_MODEL.update({
                    cashPaymentID, userID, email, name, note, amount, payment, active
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
            cashPaymentID: { type: "array" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { cashPaymentID } = ctx.params;
                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await FIN__CASH_PAYMENT_MODEL.remove({
                    cashPaymentID, userID
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
            cashPaymentID     : { type: "string", optional: true },
            customerID        : { type: "string", optional: true },
            userCreateID      : { type: "string", optional: true },

            // Field mặc định
            keyword         : { type: "string", optional: true },
            limit           : { type: "string", optional: true },
            lastestID       : { type: "string", optional: true },
            select          : { type: "string", optional: true },
            populates       : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {
                    cashPaymentID, customerID, userCreateID, active,
                    keyword, limit, lastestID, populates, select, sortKey
                } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;


                let resultAfterCallHandler;
                if (cashPaymentID) {
                    resultAfterCallHandler = await FIN__CASH_PAYMENT_MODEL.getInfo({
                        cashPaymentID, userID, select, populates
                    });
                } else {
                    resultAfterCallHandler = await FIN__CASH_PAYMENT_MODEL.getList({
                        companyID: company._id, active, customerID, userCreateID,
                        keyword, limit, lastestID, select, populates, sortKey
                    });
                }

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Gom nhóm theo thuộc tính
     * Author: Hiepnh
     * Date: 17/04/2022
     */
    getAmountByProperty: {
        auth: "required",
        params: {
            option          : { type: "string", optional: true },
            customerID      : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { customerID, option, year  } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FIN__CASH_PAYMENT_MODEL.getAmountByProperty({
                    companyID: company._id, customerID, option, year 
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
     * Date: 8/12/2022
     */
    downloadTemplateExcel: {
        auth: 'required',
        params: {
            parentID    : { type: 'string', optional: true  },
            option      : { type: "string", optional: true }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { parentID, option, year } = ctx.params;
				const { _id: userID, company} = ctx.meta.infoUser;
                
                // console.log({parentID})
                const resultAfterCallHandler = await FIN__CASH_PAYMENT_MODEL.downloadTemplateExcel({
                    companyID: company._id, parentID, userID, option, year
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
            parentID: { type: 'string' },
            dataImport: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { parentID, dataImport } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;
                // console.log(ctx.params)

                const resultAfterCallHandler = await FIN__CASH_PAYMENT_MODEL.importFromExcel({
                    companyID: company._id, parentID, dataImport, userID, ctx
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
            // companyID: { type: "string", optional: true },
            // option: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, email, company } = ctx.meta.infoUser;
                let { customerID, userCreateID } = ctx.params;
                // console.log(ctx.params)

                const resultAfterCallHandler = await FIN__CASH_PAYMENT_MODEL.exportExcel({
                    customerID, userCreateID
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },
}