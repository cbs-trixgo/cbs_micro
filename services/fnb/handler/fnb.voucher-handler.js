/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

 /**
  * MODELS
  */
 const FNB_VOUCHER_MODEL            = require('../model/fnb.voucher-model').MODEL;

 module.exports = {
    /**
     * Name: Insert
     * Author: HiepNH
     * Date: 21/3/2023
     */
     insert: {
         auth: "required",
         params: {
            template            : { type: "number", optional: true },
            type                : { type: "number", optional: true },
            name                : { type: "string" },
            sign                : { type: "string" },
            note                : { type: "string", optional: true },
            minOrderAmount      : { type: "number", optional: true },
            salesoffAmount      : { type: "number", optional: true },
            salesoffRate        : { type: "number", optional: true },
            expired             : { type: "string", optional: true },
            status              : { type: "number", optional: true }
         },
         async handler(ctx) {
             try {
                await this.validateEntity(ctx.params);
                let { template, type, name, sign, note, minOrderAmount, salesoffAmount, salesoffRate, expired } = ctx.params;
                // console.log({ template, type, name, sign, note, minOrderAmount, salesoffAmount, salesoffRate, expired })

                const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FNB_VOUCHER_MODEL.insert({
                    userID, companyID: company._id, template, type, name, sign, note, minOrderAmount, salesoffAmount, salesoffRate, expired
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
             } catch (error) {
                 return { error:  true, message: error.message };
             }
         }
     },

    /**
     * Name: Update
     * Author: HiepNH
     * Date: 21/3/2023
     */
     update: {
         auth: "required",
         params: {
            voucherID           : { type: "string" },
            template            : { type: "number", optional: true },
            template            : { type: "number", optional: true },
            type                : { type: "number", optional: true },
            name                : { type: "string", optional: true  },
            sign                : { type: "string", optional: true  },
            note                : { type: "string", optional: true },
            minOrderAmount      : { type: "number", optional: true },
            salesoffAmount      : { type: "number", optional: true },
            salesoffRate        : { type: "number", optional: true },
            expired             : { type: "string", optional: true  },
            status              : { type: "number", optional: true },
            receivers           : { type: "array", optional: true },
            buyers              : { type: "array", optional: true },
            membersAdd          : { type: "array", optional: true },
            membersRemove       : { type: "array", optional: true },
         },
         async handler(ctx) {
             try {
                 await this.validateEntity(ctx.params);
                 let { voucherID, template, type, name, sign, note, minOrderAmount, salesoffAmount, salesoffRate, expired, receivers, buyers, membersAdd, membersRemove } = ctx.params;
                 
                //  console.log({voucherID, template, type, name, sign, note, minOrderAmount, salesoffAmount, salesoffRate, expired, receivers, buyers, membersAdd, membersRemove })

                 const { _id: userID, company } = ctx.meta.infoUser;

                 let resultAfterCallHandler = await FNB_VOUCHER_MODEL.update({
                    companyID: company._id, userID, voucherID, template, type, name, sign, note, minOrderAmount, salesoffAmount, salesoffRate, expired, receivers, buyers, membersAdd, membersRemove
                 });

                 return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
             } catch (error) {
                 return { error:  true, message: error.message };
             }
         }
     },

    /**
     * Name: Remove
     * Author: HiepNH
     * Date: 21/3/2023
     */
     remove: {
         auth: "required",
         params: {
            voucherID   : { type: "string" }
         },
         async handler(ctx) {
             try {
                 await this.validateEntity(ctx.params);
                 let {  voucherID } = ctx.params;

                 let resultAfterCallHandler = await FNB_VOUCHER_MODEL.remove({
                    voucherID
                 });

                 return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
             } catch (error) {
                 return { error:  true, message: error.message };
             }
         }
     },

    /**
     * Name: Get
     * Author: HiepNH
     * Date: 21/3/2023
     */
     getInfoAndGetList: {
         auth: "required",
         params: {
            voucherID   : { type: "string", optional: true },
            sign        : { type: "string", optional: true },
            customerID  : { type: "string", optional: true },
            template    : { type: "string", optional: true },
            type        : { type: "string", optional: true },
            status      : { type: "string", optional: true },

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
                 let { voucherID, sign, customerID, template, type, status, keyword, limit, lastestID, select, populates, isMember } = ctx.params;

                 const { _id: userID, company } = ctx.meta.infoUser;

                 let resultAfterCallHandler;
                 if(voucherID || sign){
                     resultAfterCallHandler = await FNB_VOUCHER_MODEL.getInfo({
                        companyID: company._id, voucherID, sign, select, populates,
                     })
                 }else{
                     resultAfterCallHandler = await FNB_VOUCHER_MODEL.getList({
                         companyID: company._id, userID, customerID, template,  type, status, keyword, limit, lastestID, select, populates, isMember
                     })
                 }

                 return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
             } catch (error) {
                 return { error:  true, message: error.message };
             }
         }
     },

     /**
     * Name: Download Template Excel
     * Author: HiepNH
     * Date: 21/3/2023
     */
    downloadTemplateExcel: {
        auth: 'required',
        params: {
            option     : { type: "string", optional: true }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { option } = ctx.params;

				const { _id: userID, company } = ctx.meta.infoUser;

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                const resultAfterCallHandler = await FNB_VOUCHER_MODEL.downloadTemplateExcel({
                    option, companyID: company._id, userID 
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Name: Download Template Excel
     * Author: HiepNH
     * Date: 21/3/2023
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
				const { _id: userID, company, email } = ctx.meta.infoUser;
                // console.log(dataImport)

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')

                // console.log(dataImport)

                const resultAfterCallHandler = await FNB_VOUCHER_MODEL.importFromExcel({
                    companyID: company._id, dataImport, userID, email
                })
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Name: Download Template Excel
     * Author: HiepNH
     * Date: 21/3/2023
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
				const { _id: userID, company } = ctx.meta.infoUser;
                let { companyID, filterParams } = ctx.params;
                // console.log({ companyID, option, filterParams })

                if(!companyID) {
                    companyID = company._id;
                }

                const resultAfterCallHandler = await FNB_VOUCHER_MODEL.exportExcel({
                    userID, companyID, filterParams, ctx
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    }
 }