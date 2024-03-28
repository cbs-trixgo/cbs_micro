/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const FNB_CUSTOMER_BOOKING_MODEL            = require('../model/fnb.customer_booking-model').MODEL;

module.exports = {
    /**
     * Name: Insert 
     * Author: HiepNH
     * Code: 12/2/2024
     */
    insert: {
        auth: "required",
        params: {
            customerID          : { type: "string" },
            orderID             : { type: "string", optional: true },
            name                : { type: "string" },
            note                : { type: "string", optional: true },
            date                : { type: "string", optional: true },
            status              : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { customerID, orderID, businessID, assigneeID, name, note, date, alert, status, files } = ctx.params;
                
                // console.log(ctx.params)

                const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FNB_CUSTOMER_BOOKING_MODEL.insert({
                    userID, companyID: company._id, customerID, orderID, businessID, assigneeID, name, note, date, alert, status, files  
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
     * Code: 12/2/2024
     */
    update: {
        auth: "required",
        params: {
            customerCareID      : { type: "string", optional: true },
            customerID          : { type: "string", optional: true },
            orderID             : { type: "string", optional: true },
            name                : { type: "string", optional: true },
            note                : { type: "string", optional: true },
            date                : { type: "string", optional: true },
            status              : { type: "number", optional: true },
            imagesID            : { type: "array", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const {  customerCareID, customerID, orderID, businessID, assigneeID, name, note, date, alert, status, imagesID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                // console.log(ctx.params)

                const resultAfterCallHandler = await FNB_CUSTOMER_BOOKING_MODEL.update({
                    userID, customerCareID, customerID, orderID, businessID, assigneeID, name, note, date, alert, status, imagesID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: remove
	 */
    remove: {
        auth: "required",
        params: {
            orderMistakeID   : { type: "string" }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  orderMistakeID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FNB_CUSTOMER_BOOKING_MODEL.remove({
                    orderMistakeID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Name: getList and getInfo
     * Author: HiepNH
     * Code: 12/2/2024
	 */
    getInfoAndGetList: {
        auth: "required",
        params: {
            companyID           : { type: "string", optional: true },
            fundasID            : { type: "array", optional: true },
            customerID          : { type: "string", optional: true },
            userCreateID        : { type: "string", optional: true },
            channelID           : { type: "string", optional: true },
            businessID          : { type: "string", optional: true },
            fromDate            : { type: "string", optional: true },
            toDate              : { type: "string", optional: true },
            type                : { type: "string", optional: true },
            channel             : { type: "string", optional: true },

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
                let { companyID, orderMistakeID, fundasID, customerID, userCreateID, assigneeID, channelID, businessID, fromDate, toDate, status, keyword, limit, lastestID, select, populates } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;

                if(!companyID){
                    companyID = company._id
                }

                // console.log(ctx.params)

                let resultAfterCallHandler;
                if(orderMistakeID){
                    resultAfterCallHandler = await FNB_CUSTOMER_BOOKING_MODEL.getInfo({
                        orderMistakeID, select, populates,
                    });
                }else{
                    resultAfterCallHandler = await FNB_CUSTOMER_BOOKING_MODEL.getList({
                        companyID, userID, fundasID, customerID, userCreateID, channelID, businessID, assigneeID, fromDate, toDate, status, keyword, limit, lastestID, select, populates
                    });
                }

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Name: Danh sách theo phân loại
     * Author: HiepNH
     * Code: 15/2/2024
     */
    getListByProperty: {
        params: {
            fundasID        : { type: "array", optional: true },
            option          : { type: "string", optional: true },
            optionTime      : { type: "string", optional: true },
            year            : { type: "string", optional: true },
            month           : { type: "string", optional: true },
            fromDate        : { type: "string", optional: true },
            toDate          : { type: "string", optional: true },
            
            //_____________THÔNG SỐ MẶC ĐỊNH________________
            keyword         : { type: "string", optional: true },
            limit           : { type: "string", optional: true },
            lastestID       : { type: "string", optional: true },
            select          : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, company } = ctx.meta.infoUser;

                let { option, optionGroup, optionTime, fundasID, year, month, fromDate, toDate, status } = ctx.params;

                let resultAfterCallHandler = await FNB_CUSTOMER_BOOKING_MODEL.getListByProperty({
                    option, optionGroup, companyID: company._id, optionTime, fundasID, year, month, fromDate, toDate, status, userID
                    });
             
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
                await this.validateEntity(ctx.params)
				const { _id: userID, company } = ctx.meta.infoUser

                const resultAfterCallHandler = await FNB_CUSTOMER_BOOKING_MODEL.downloadTemplateExcel({
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
            dataImport: { type: 'string' }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { dataImport } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await FNB_CUSTOMER_BOOKING_MODEL.importFromExcel({
                    taskID, dataImport, userID, ctx
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx })
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx })
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: Download Excel
     * Date: 5/2/2024
     */
    exportExcel: {
        auth: 'required',
        params: {
            year: { type: "string", optional: true },
            month: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, company } = ctx.meta.infoUser;
                let { companyID, fundaID, fromDate, toDate, month, year } = ctx.params;

                if(!companyID) {
                    companyID = company._id;
                }

                const resultAfterCallHandler = await FNB_CUSTOMER_BOOKING_MODEL.exportExcel({
                    userID, companyID, fundaID, fromDate, toDate, month, year
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    }
}