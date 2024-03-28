/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

 /**
  * MODELS
  */
 const CMCS__CONTRACT_BILL_JOB_MODEL                 = require('../model/cmcs.contract_bill_job-model').MODEL;
 
 module.exports = {
     /**
      * Name: Insert
      * Author: HiepNH
      * Date: 11/9/2022 
      */
     insert: {
         auth: "required",
         params: {
            groupID             : { type: "string" },
            plus                : { type: "number" },
            name                : { type: "string" },
            sign                : { type: "string" },
            description         : { type: "string", optional: true },
            unit                : { type: "string" },
            note                : { type: "string", optional: true },
            orgQuantity         : { type: "number", optional: true },
            orgUnitPrice        : { type: "number", optional: true },
         },
         async handler(ctx) {
             try {
                 await this.validateEntity(ctx.params);
                 let { groupID, plus, name, sign, description, date, note, orgQuantity, orgUnitPrice } = ctx.params;
                 const { _id: userID } = ctx.meta.infoUser;

                 let resultAfterCallHandler = await CMCS__CONTRACT_BILL_JOB_MODEL.insert({
                     groupID, plus, name, sign, description, date, note, orgQuantity, orgUnitPrice, userID, ctx
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
      * Date: 11/9/2022 
      */
     update: {
         auth: "required",
         params: {
            jobID               : { type: "string" },
            plus                : { type: "number" },
            name                : { type: "string" },
            sign                : { type: "string" },
            description         : { type: "string", optional: true },
            unit                : { type: "string" },
            note                : { type: "string", optional: true },
            currentQuantity     : { type: "number", optional: true },
            estimateQuantity    : { type: "number", optional: true },
            currentUnitPrice    : { type: "number", optional: true },
            estimateUnitPrice   : { type: "number", optional: true },
            currentAmount       : { type: "number", optional: true },
            estimateAmount      : { type: "number", optional: true },
         },
         async handler(ctx) {  
             try {
                 await this.validateEntity(ctx.params);
                 let { jobID, plus, name, sign, description, unit, note, currentQuantity, estimateQuantity, currentUnitPrice, estimateUnitPrice, currentAmount, estimateAmount } = ctx.params;
                
                 const { _id: userID } = ctx.meta.infoUser;
                 let resultAfterCallHandler = await CMCS__CONTRACT_BILL_JOB_MODEL.update({
                    jobID, plus, name, sign, description, unit, note, currentQuantity, estimateQuantity, currentUnitPrice, estimateUnitPrice, currentAmount, estimateAmount, userID, ctx
                 });
                 
                 return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
             } catch (error) {
                 return { error:  true, message: error.message };
             }
         }
     },
 
     /**
      * Name: Update value
      * Author: HiepNH
      * Date: 11/9/2022 
      */
     updateValue: {
         auth: "required",
         params: {
            option : { type: "number" },
            jobID : { type: "string" },
         },
         async handler(ctx) {  
             try {
                 await this.validateEntity(ctx.params);
                 let { option, jobID } = ctx.params;
             
                 const { _id: userID } = ctx.meta.infoUser;
 
                 let resultAfterCallHandler = await CMCS__CONTRACT_BILL_JOB_MODEL.updateValue({
                     option, jobID, userID, ctx
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
      * Date: 11/9/2022 
      */
     remove: {
         auth: "required",
         params: {
            jobID       : { type: "string" },
         },
         async handler(ctx) {
             try {
                 await this.validateEntity(ctx.params);
                 let { jobID } = ctx.params;
                 const { _id: userID } = ctx.meta.infoUser;
                 let resultAfterCallHandler = await CMCS__CONTRACT_BILL_JOB_MODEL.remove({
                    jobID
                 });
                 
                 return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
             } catch (error) {
                 return { error:  true, message: error.message };
             }
         }
     },
 
    /**
      * Name: Get info and Get list
      * Author: HiepNH
      * Date: 11/9/2022 
      */
    getInfoAndGetList: {
         auth: "required",
         params: {
            jobID        : { type: "string", optional: true },
            contractID   : { type: "string", optional: true },
            itemID       : { type: "string", optional: true },
            groupID      : { type: "string", optional: true },
            plus         : { type: "string", optional: true },

            // Field mặc định
            keyword     : { type: "string", optional: true },
            limit       : { type: "string", optional: true },
            lastestID   : { type: "string", optional: true },
            select      : { type: "string", optional: true },
            populates   : { type: "string", optional: true },
         },
         async handler(ctx) {
             try {
                console.log('===========>>>>>>>>>>>>>>')
                 await this.validateEntity(ctx.params);
                 let { jobID, contractID, itemID, groupID, plus, keyword, limit, lastestID, populates, select } = ctx.params;
                 
                 const { _id: userID, company } = ctx.meta.infoUser;
 
                 let resultAfterCallHandler;
                 if(jobID){
                     resultAfterCallHandler = await CMCS__CONTRACT_BILL_JOB_MODEL.getInfo({
                        jobID, userID, select, populates
                     });
                 }else{
                     resultAfterCallHandler = await CMCS__CONTRACT_BILL_JOB_MODEL.getList({
                        jobID, contractID, itemID, groupID, plus, userID, keyword, limit, lastestID, select, populates
                     });
                 }
                 
                 return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
             } catch (error) {
                 return { error:  true, message: error.message };
             }
         }
     },
 
 }