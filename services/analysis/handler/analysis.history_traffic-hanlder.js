/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const ANALYSIS__HISTORY_TRAFFIC_MODEL             = require('../model/analysis.history_traffic').MODEL;

module.exports = {
    /**
	 * Dev: HiepNH 
	 * Func: Insert history traffic
	 */
    insert: {
        auth: "required",
        params: {
            appID             : { type: "string" },
            menuID            : { type: "string", option: "true" },
            type              : { type: "number", option: "true" },
            // action            : { type: "number", option: "true" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  appID, menuID, type, action } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler = await ANALYSIS__HISTORY_TRAFFIC_MODEL.insert({
                    appID, menuID, type, action, companyOfAuthor: company._id, userCreate: userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH 
	 * Func: Thống kê thiết bị truy cập theo năm
	 */
    statisticsDeviceAccessByYear: {
        auth: "required",
        params: {
            year : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { year } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;
                let resultAfterCallHandler = await ANALYSIS__HISTORY_TRAFFIC_MODEL.statisticsDeviceAccessByYear({
                   year
                });
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH 
	 * Func: Thống kê thiết bị truy cập
	 */
    statisticsByDeviceAccess: {
        auth: "required",
        params: {
            fromDate      : { type: "string" },
            toDate        : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { fromDate, toDate } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;
                let resultAfterCallHandler = await ANALYSIS__HISTORY_TRAFFIC_MODEL.statisticsByDeviceAccess({
                    fromDate, toDate
                });
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

     /**
	 * Dev: HiepNH 
	 * Func: Thống kê truy cập theo app
	 */
    statisticsAccessByApp: {
        auth: "required",
        params: {
            fromDate      : { type: "string", optional: true },
            toDate        : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { option, appID, fromDate, toDate, year } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler = await ANALYSIS__HISTORY_TRAFFIC_MODEL.statisticsAccessByApp({
                    option, appID, fromDate, toDate, year
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
    
    /**
     * Dev: HiepNH 
     * Func: Thống kê truy cập theo app và thiết bị
     */
    statisticsAccessByAppAndDevice: {
        auth: "required",
        params: {
            fromDate      : { type: "string" },
            toDate        : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { fromDate, toDate } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;
                let resultAfterCallHandler = await ANALYSIS__HISTORY_TRAFFIC_MODEL.statisticsAccessByAppAndDeveice({
                    fromDate, toDate
                });
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH 
	 * Func: Thống kê truy cập theo công ty
	 */
    statisticsAccessByCompany: {
        auth: "required",
        params: {
            fromDate      : { type: "string" },
            toDate        : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { fromDate, toDate } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;
                let resultAfterCallHandler = await ANALYSIS__HISTORY_TRAFFIC_MODEL.statisticsAccessByCompany({
                    fromDate, toDate
                });
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },


    /**
	 * Dev: HiepNH 
	 * Func: Danh sách và thông tin history traffic
	 */
    getInfoAndGetList: {
        params: {
            historyTrafficID: { type: "string", optional: true },
            companyID       : { type: "string", optional: true },
            type            : { type: "string", optional: true },
            appID           : { type: "string", optional: true },
            menuID          : { type: "string", optional: true },
            userID          : { type: "string", optional: true },
            // Field mặc định
            fromDate        : { type: "string", optional: true },
            toDate          : { type: "string", optional: true },
            limit           : { type: "string", optional: true },
            lastestID       : { type: "string", optional: true },
            keyword         : { type: "string", optional: true },
            select          : { type: "string", optional: true },
            populates       : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { historyTrafficID, companyID, type, appID, menuID, fromDate, toDate, userID, keyword, limit, lastestID, select, filter, populates } = ctx.params;
                // const { _id: userID, company } = ctx.meta.infoUser;
                let resultAfterCallHandler;
                if(historyTrafficID){
                    resultAfterCallHandler = await ANALYSIS__HISTORY_TRAFFIC_MODEL.getInfo({
                        historyTrafficID, select, populates
                    });
                }else{
                    resultAfterCallHandler = await ANALYSIS__HISTORY_TRAFFIC_MODEL.getList({
                        companyID, type, appID, menuID, userID, fromDate, toDate, lastestID, keyword, limit, select, populates
                    });
                }
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },
}