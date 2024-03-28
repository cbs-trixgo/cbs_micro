/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const DATAHUB_TYPE_MODEL                        = require('../model/datahub.datahub_type-model').MODEL;

module.exports = {
    /**
	 * Dev: HiepNH 
	 * Func: Thêm datahub
	 */
    insert: {
        params: {
            name          : { type: "string" },
            popular       : { type: "number" },
            type          : { type: "number" },
            description   : { type: "string", optional: true },
            parent        : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { type, parent, name, description, popular } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_TYPE_MODEL.insert({
                    type, parent, name, description, popular, userID
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
            datahubID   : { type: "string" },
            name        : { type: "string", optional: true },
            description : { type: "string", optional: true },
            popular     : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { datahubID, name, description, popular } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_TYPE_MODEL.update({
                    datahubID, name, description, popular, userID
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
            datahubID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { datahubID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await DATAHUB_TYPE_MODEL.remove({
                    datahubID 
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
            datahubTypeID : { type: "string", optional: true },
            type      : { type: "string", optional: true },
            popular     : { type: "string", optional: true },
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
                let { datahubTypeID, type, popular, parentID, lastestID, keyword, limit, select, populates } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler;
                if(datahubTypeID){
                    resultAfterCallHandler = await DATAHUB_TYPE_MODEL.getInfo({
                        datahubTypeID, select, populates
                    });
                }else{
                    resultAfterCallHandler = await DATAHUB_TYPE_MODEL.getList({
                        type, popular, parentID, userID, lastestID, keyword, limit, select, populates
                    });
                }
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
}