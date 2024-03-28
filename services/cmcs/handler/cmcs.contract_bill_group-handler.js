/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

 /**
  * MODELS
  */
 const CMCS__CONTRACT_BILL_GROUP_MODEL                 = require('../model/cmcs.contract_bill_group-model').MODEL;
 
 module.exports = {
     /**
      * Name: Insert
      * Author: HiepNH
      * Date: 11/9/2022 
      */
     insert: {
         auth: "required",
         params: {
             itemID              : { type: "string" },
             name                : { type: "string" },
             sign                : { type: "string", optional: true },
             description         : { type: "string", optional: true },
             unit                : { type: "string", optional: true },
             quantity            : { type: "number", optional: true },
             note                : { type: "string", optional: true },
         },
         async handler(ctx) {
             try {
                 await this.validateEntity(ctx.params);
                 let { itemID, name, sign, description, unit, quantity, note } = ctx.params;
                 const { _id: userID } = ctx.meta.infoUser;
 
                 let resultAfterCallHandler = await CMCS__CONTRACT_BILL_GROUP_MODEL.insert({
                     itemID, name, sign, description, unit, quantity, note, userID, ctx
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
             groupID             : { type: "string" },
             name                : { type: "string" },
             sign                : { type: "string", optional: true },
             description         : { type: "string", optional: true },
             unit                : { type: "string", optional: true },
             quantity            : { type: "number", optional: true },
             note                : { type: "string", optional: true }
         },
         async handler(ctx) {  
             try {
                 await this.validateEntity(ctx.params);
                 let { groupID, name, sign, description, unit, quantity, note } = ctx.params;
                 const { _id: userID } = ctx.meta.infoUser;
 
                 let resultAfterCallHandler = await CMCS__CONTRACT_BILL_GROUP_MODEL.update({
                    groupID, name, sign, description, unit, quantity, note, userID, ctx
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
             groupID : { type: "string" },
         },
         async handler(ctx) {  
             try {
                 await this.validateEntity(ctx.params);
                 let { option, groupID } = ctx.params;
             
                 const { _id: userID } = ctx.meta.infoUser;

                 console.log({option, groupID})
 
                 let resultAfterCallHandler = await CMCS__CONTRACT_BILL_GROUP_MODEL.updateValue({
                     option, groupID, userID, ctx
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
            groupID       : { type: "string" },
         },
         async handler(ctx) {
             try {
                 await this.validateEntity(ctx.params);
                 let { groupID } = ctx.params;
                 const { _id: userID } = ctx.meta.infoUser;
 
                 let resultAfterCallHandler = await CMCS__CONTRACT_BILL_GROUP_MODEL.remove({
                    groupID
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
            groupID      : { type: "string", optional: true },
             itemID      : { type: "string", optional: true },
 
             // Field mặc định
             keyword     : { type: "string", optional: true },
             limit       : { type: "string", optional: true },
             lastestID   : { type: "string", optional: true },
             select      : { type: "string", optional: true },
             populates   : { type: "string", optional: true },
         },
         async handler(ctx) {
             try {
                

                 await this.validateEntity(ctx.params);
                 let { groupID, itemID, keyword, limit, lastestID, populates, select } = ctx.params;
                 
                 const { _id: userID, company } = ctx.meta.infoUser;

                 console.log({itemID, keyword, limit, lastestID, select, populates})
 
                 let resultAfterCallHandler;
                 if(groupID){
                     resultAfterCallHandler = await CMCS__CONTRACT_BILL_GROUP_MODEL.getInfo({
                        groupID, userID, select, populates
                     });
                 }else{
                    console.log('===========List')
                     resultAfterCallHandler = await CMCS__CONTRACT_BILL_GROUP_MODEL.getList({
                         itemID, userID, keyword, limit, lastestID, select, populates
                     });
                 }
                 
                 return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
             } catch (error) {
                 return { error:  true, message: error.message };
             }
         }
     },
 
 }