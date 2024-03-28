/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const DATAHUB_INSPECTION_CHECKLIST_MODEL                = require('../model/datahub.datahub_inspection_checklist-model').MODEL;

module.exports = {
    /**
	 * Dev: HiepNH 
	 * Func: Thêm datahub inspection checklist
	 */
    insert: {
        params: {
            inspectionDocID : { type: "string" },
            name            : { type: "string" },
            sign            : { type: "string", optional: true },
            description     : { type: "string", optional: true },
        },  
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { inspectionDocID, name, sign, description } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_INSPECTION_CHECKLIST_MODEL.insert({
                    inspectionDocID, name, sign, description, userID
                });
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH 
	 * Func: Sửa datahub inspection checklist
	 */
    update: {
        params: {
            inspectionChecklistID   : { type: "string" },
            name                    : { type: "string", optional: true },
            sign                    : { type: "string", optional: true },
            description             : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { inspectionChecklistID, name, sign, description } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_INSPECTION_CHECKLIST_MODEL.update({
                    inspectionChecklistID, name, sign, description, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
    
    /**
     * Dev: HiepNH 
     * Func: Xóa datahub inspection checklist
     */
    remove: {
        params: {
            inspectionChecklistID  : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { inspectionChecklistID  } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_INSPECTION_CHECKLIST_MODEL.remove({
                    inspectionChecklistID   
                });
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Dev: HiepNH 
     * Func: get info and get list datahub checklist
     */
    getInfoAndGetList: {
        params: {
            inspectionChecklistID : { type: "string", optional: true },
            inspectionID          : { type: "string" },

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
                let {  inspectionChecklistID, inspectionID, lastestID, keyword, limit, select, populates } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler;
                if(inspectionChecklistID){
                    resultAfterCallHandler = await DATAHUB_INSPECTION_CHECKLIST_MODEL.getInfo({
                        inspectionChecklistID, select, populates
                    });
                }else{
                    resultAfterCallHandler = await DATAHUB_INSPECTION_CHECKLIST_MODEL.getList({
                        inspectionID, userID, lastestID, keyword, limit, select, populates 
                    });
                }
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
}