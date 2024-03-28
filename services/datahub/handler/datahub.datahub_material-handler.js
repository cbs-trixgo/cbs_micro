/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const DATAHUB_MATERIAL_MODEL                   = require('../model/datahub.datahub_material-model').MODEL;

module.exports = {
    /**
	 * Dev: HiepNH
	 * Func: Thêm datahub profile
	 */
    insert: {
        params: {
            company             : { type: "string" },
            name                : { type: "string" },
            files             : { type: "array",  optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { company, name, files } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await DATAHUB_MATERIAL_MODEL.insert({
                    company, name, files, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: Sửa datahub profile
	 */
    update: {
        params: {
            datahubProfileID    : { type: "string" },
            name                : { type: "string",  optional: true },
            files               : { type: "array",   optional: true  },
            filesRemove         : { type: "array",   optional: true  },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  datahubProfileID, name, files, filesRemove } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await DATAHUB_MATERIAL_MODEL.update({
                    datahubProfileID, name, files, filesRemove, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: Xóa datahub profile
     */
    remove: {
        params: {
            datahubProfileID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { datahubProfileID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await DATAHUB_MATERIAL_MODEL.remove({
                    datahubProfileID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: get info and get list datahub profile
     */
    getInfoAndGetList: {
        params: {
            datahubProfileID    : { type: "string", optional: true },
            contractorID        : { type: "string", optional: true },

            // Field mặc định
            keyword             : { type: "string", optional: true },
            limit               : { type: "string", optional: true },
            lastestID           : { type: "string", optional: true },
            select              : { type: "string", optional: true },
            populates           : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { datahubProfileID, contractorID, lastestID, keyword, limit, select, populates } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler;
                if(datahubProfileID){
                    resultAfterCallHandler = await DATAHUB_MATERIAL_MODEL.getInfo({
                        datahubProfileID, select, populates
                    });
                }else{
                    resultAfterCallHandler = await DATAHUB_MATERIAL_MODEL.getList({
                        contractorID, userID, lastestID, keyword, limit: +limit, select, populates
                    });
                }

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
}