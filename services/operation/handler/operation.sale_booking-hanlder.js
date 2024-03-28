/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

 /**
  * MODELS
  */
 const OPERATION__SALE_BOOKING_MODEL             = require('../model/operation.sale_booking-model').MODEL;

//QUẢN LÝ TIỆN ÍCH GẦN CĂN HỘ

module.exports = {
    /**
	 * Dev: HiepNH 
	 * Func: Thêm SALE BOOKING
	 * Date: 19/08/2021
	 */
    insert: {
        auth: "required",
        params: {
			projectID   : { type: "string" },
            name        : { type: "string" },
            date        : { type: "string" },
            bookingValue: { type: "string" },
            note        : { type: "string", optional: true },
            departmentID: { type: "string", optional: true },
            contractID  : { type: "string", optional: true },
            depositValue  : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { projectID, name, note, departmentID, contractID, date, bookingValue, depositValue } = ctx.params;

                const resultAfterCallHandler = await OPERATION__SALE_BOOKING_MODEL.insert({
					projectID, name, note, departmentID, contractID, date, bookingValue, depositValue, userID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: HiepNH 
	 * Func: Cập nhật SALE BOOKING
	 * Date: 19/08/2021
	 */
    update: {
        auth: "required",
        params: {
            saleBookingID   : { type: "string" },
            projectID       : { type: "string", optional: true },
            name            : { type: "string", optional: true },
            note            : { type: "string", optional: true },
            departmentID    : { type: "string", optional: true },
            contractID      : { type: "string", optional: true },
            date            : { type: "string", optional: true },
            bookingValue    : { type: "string", optional: true },
            depositValue    : { type: "string", optional: true },
            lock            : { type: "string", optional: true },
            lockTime        : { type: "string", optional: true },
            userDeposit     : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { saleBookingID, projectID, name, note, departmentID, contractID, date, bookingValue, depositValue, lock, lockTime, userDeposit } = ctx.params;

                const resultAfterCallHandler = await OPERATION__SALE_BOOKING_MODEL.update({
                   saleBookingID, projectID, name, note, departmentID, contractID, date, bookingValue, depositValue, lock, lockTime, userDeposit, userID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },


    /**
	 * Dev: HiepNH 
	 * Func: Xóa SALE BOOKING
	 * Date: 19/08/2021
	 */
    remove: {
        auth: "required",
        params: {
            saleBookingID    : { type: "string" },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { saleBookingID  } = ctx.params;
                const resultAfterCallHandler = await OPERATION__SALE_BOOKING_MODEL.remove({
					saleBookingID  
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: HiepNH 
	 * Func: Xóa SALE BOOKING
	 * Date: 19/08/2021
	 */
    getInfoAndGetList: {
        auth: "required",
        params: {
            saleBookingID    : { type: "string", optional: true },
            projectID        : { type: "string", optional: true },
            type             : { type: "number", optional: true },
            sale             : { type: "number", optional: true },
            bookingID        : { type: "number", optional: true },
            contactID        : { type: "number", optional: true },
            lock             : { type: "number", optional: true },
            userDepositID    : { type: "number", optional: true },
            contractID       : { type: "number", optional: true },
            // Mặc định
            keyword         : { type: "string", optional: true },
            limit           : { type: "string", optional: true },
            lastestID       : { type: "string", optional: true },
            select          : { type: "string", optional: true },
            filter          : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { saleBookingID, projectID, type, status, sale, bookingID, contactID, lock, userDepositID, contractID, keyword, limit, lastestID, filter  } = ctx.params;
                let resultAfterCallHandler;
                if(saleBookingID ){
                    resultAfterCallHandler = await OPERATION__SALE_BOOKING_MODEL.getInfo({
                        saleBookingID 
                    });
                }else{  
                    resultAfterCallHandler = await OPERATION__SALE_BOOKING_MODEL.getList({
                        projectID, type, status, sale, bookingID, contactID, lock, userDepositID, contractID, keyword, limit, lastestID, filter
                    });
                }
              
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },
}