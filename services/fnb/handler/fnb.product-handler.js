/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

 /**
  * MODELS
  */
 const FNB_PRODUCT_MODEL            = require('../model/fnb.product-model').MODEL;

 module.exports = {
    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 24/11/2022
     */
     insert: {
         auth: "required",
         params: {
            parentID            : { type: "string", optional: true },
            name                : { type: "string" },
            sign                : { type: "string", optional: true },
            unit                : { type: "string", optional: true },
            note                : { type: "string", optional: true },
            quantity            : { type: "number", optional: true },
            unitPrice           : { type: "number", optional: true },
            unitPrice2          : { type: "number", optional: true },
            unitPrice3          : { type: "number", optional: true },
            unitPrice4          : { type: "number", optional: true },
            type                : { type: "number", optional: true },
         },
         async handler(ctx) {
             try {
                await this.validateEntity(ctx.params);
                let { parentID, name, sign, unit, note, quantity, unitPrice, unitPrice2, unitPrice3, unitPrice4, type } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FNB_PRODUCT_MODEL.insert({
                    userID, companyID: company._id, parentID, name, sign, unit, note, quantity, unitPrice, unitPrice2, unitPrice3, unitPrice4, type
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
            productID       : { type: "string", optional: true },
            parentID        : { type: "string", optional: true },
            name            : { type: "string", optional: true },
            sign            : { type: "string", optional: true },
            unit            : { type: "string", optional: true },
            note            : { type: "string", optional: true },
            imagesID        : { type: "array", optional: true },
            fundasID        : { type: "array", optional: true },
            type            : { type: "number", optional: true },
            quantity        : { type: "number", optional: true },
            unitPrice       : { type: "number", optional: true },
            unitPrice2      : { type: "number", optional: true },
            unitPrice3      : { type: "number", optional: true },
            unitPrice4      : { type: "number", optional: true },
            option          : { type: "number", optional: true },
            convertOption   : { type: "number", optional: true },
            status          : { type: "number", optional: true },
         },
         async handler(ctx) {
             try {
                 await this.validateEntity(ctx.params);
                 let {  productID, parentID, type, name, sign, unit, note, quantity, unitPrice, unitPrice2, unitPrice3, unitPrice4, imagesID, fundasID, option, convertOption, status } = ctx.params;
                 
                 const { _id: userID, company } = ctx.meta.infoUser;

                 let resultAfterCallHandler = await FNB_PRODUCT_MODEL.update({
                    companyID: company._id, productID, userID, parentID, type, name, sign, unit, note, quantity, unitPrice, unitPrice2, unitPrice3, unitPrice4, imagesID, fundasID, option, convertOption, status
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
            productID   : { type: "string" }
         },
         async handler(ctx) {
             try {
                 await this.validateEntity(ctx.params);
                 let {  productID } = ctx.params;

                 let resultAfterCallHandler = await FNB_PRODUCT_MODEL.remove({
                    productID
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
            productID   : { type: "string", optional: true },
            fundaID     : { type: "string", optional: true },
            parentID    : { type: "string", optional: true },
            type        : { type: "string", optional: true },
            isParent    : { type: "string", optional: true },
            convertOption    : { type: "string", optional: true },
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
                 let { productID, parentID, fundaID, type, isParent, convertOption, keyword, limit, lastestID, select, populates, status } = ctx.params;

                 const { _id: userID, company } = ctx.meta.infoUser;

                 let resultAfterCallHandler;
                 if(productID){
                     resultAfterCallHandler = await FNB_PRODUCT_MODEL.getInfo({
                        productID, select, populates,
                     });
                 }else{
                     resultAfterCallHandler = await FNB_PRODUCT_MODEL.getList({
                         companyID: company._id, parentID, fundaID, type, isParent, convertOption, keyword, limit, lastestID, select, populates, userID, status
                     });
                 }

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
                const resultAfterCallHandler = await FNB_PRODUCT_MODEL.downloadTemplateExcel({
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
				const { _id: userID, company } = ctx.meta.infoUser;
                // console.log(dataImport)

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log(dataImport)

                const resultAfterCallHandler = await FNB_PRODUCT_MODEL.importFromExcel({
                    companyID: company._id, dataImport, userID, ctx
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
				const { _id: userID, company } = ctx.meta.infoUser;
                let { companyID, filterParams } = ctx.params;
                // console.log({ companyID, option, filterParams })

                if(!companyID) {
                    companyID = company._id;
                }

                const resultAfterCallHandler = await FNB_PRODUCT_MODEL.exportExcel({
                    userID, companyID, filterParams
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

 }