/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const DATAHUB_CONTRACTOR_MODEL                   = require('../model/datahub.datahub_contractor-model').MODEL;

module.exports = {
    /**
	 * Dev: HiepNH 
	 * Func: Thêm datahub contractor
	 */
    insert: {
        params: {
            field             : { type: "string" },
            contractor        : { type: "string" },
            areas             : { type: "array",  optional: true },
            ranking           : { type: "number", optional: true },
            note              : { type: "string", optional: true },
            status            : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { field, areas, contractor, ranking, note, status } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_CONTRACTOR_MODEL.insert({
                    field, areas, contractor, ranking, note, status, userID
                });
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH 
	 * Func: Sửa datahub contractor
	 */
    update: {
        params: {
            datahubContractorID: { type: "string" },
            field             : { type: "string" },
            contractor        : { type: "string" },
            areas             : { type: "array", optional: true },
            ranking           : { type: "number", optional: true },
            note              : { type: "string", optional: true },
            status            : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  datahubContractorID, field, areas, areasRemove, contractor, ranking, note, status } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_CONTRACTOR_MODEL.update({
                    datahubContractorID, field, areas, areasRemove, contractor, ranking, note, status, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
    
    /**
     * Dev: HiepNH 
     * Func: Xóa datahub contractor
     */
    remove: {
        params: {
            datahubContractorID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { datahubContractorID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_CONTRACTOR_MODEL.remove({
                    datahubContractorID 
                });
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Dev: HiepNH 
     * Func: get info and get list datahub contractor
     */
    getInfoAndGetList: {
        params: {
            datahubContractorID : { type: "string", optional: true },
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
                let { datahubContractorID, lastestID, keyword, limit, select, populates } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler;
                if(datahubContractorID){
                    resultAfterCallHandler = await DATAHUB_CONTRACTOR_MODEL.getInfo({
                        datahubContractorID, select, populates
                    });
                }else{
                    resultAfterCallHandler = await DATAHUB_CONTRACTOR_MODEL.getList({
                        userID, lastestID, keyword, limit: +limit, select, populates
                    });
                }
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
}