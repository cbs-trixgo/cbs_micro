/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const DATAHUB_JOB_MODEL                        = require('../model/datahub.datahub_job-model').MODEL;

module.exports = {
    /**
	 * Dev: HiepNH 
	 * Func: Thêm datahub
	 */
    insert: {
        params: {
            parentID        : { type: "string", optional: true },
            name            : { type: "string" },
            sign            : { type: "string" },
            unit            : { type: "string" },
            description     : { type: "string", optional: true },
            note            : { type: "string", optional: true },
            unitprice       : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  parentID, sign, name, description, unit, note, unitprice } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_JOB_MODEL.insert({
                    parentID, sign, name, description, unit, note, unitprice, userID
                });
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH 
	 * Func: Sửa datahub
	 */
    update: {
        params: {
            jobID           : { type: "string" },
            name            : { type: "string" },
            sign            : { type: "string" },
            unit            : { type: "string" },
            description     : { type: "string", optional: true },
            note            : { type: "string", optional: true },
            unitprice       : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { jobID, sign, name, description, unit, note, unitprice } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_JOB_MODEL.update({
                    jobID, sign, name, description, unit, note, unitprice, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
    
    /**
     * Dev: HiepNH 
     * Func: Xóa datahub
     */
    remove: {
        params: {
            jobsID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { jobsID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_JOB_MODEL.remove({
                    jobsID 
                });
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Dev: HiepNH 
     * Func: get info and get list datahub
     */
    getInfoAndGetList: {
        params: {
            jobID       : { type: "string", optional: true },
            parentID    : { type: "string", optional: true },

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
                let { jobID, parentID, lastestID, keyword, limit, select, populates } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler;
                if(jobID){
                    resultAfterCallHandler = await DATAHUB_JOB_MODEL.getInfo({
                        jobID, select, populates
                    });
                }else{
                    resultAfterCallHandler = await DATAHUB_JOB_MODEL.getList({
                        jobID, parentID, userID, lastestID, keyword, limit, select, populates
                    });
                }
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
}