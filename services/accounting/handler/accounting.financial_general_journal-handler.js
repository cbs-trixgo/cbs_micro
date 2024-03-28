/**
 * EXTERNAL PACKAGE
 */
const moment = require('moment');

/**
 * TOOLS
 */
const { renderStatusCodeAndResponse } = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const FINANCIAL_GENERAL_JOURNAL_MODEL = require('../model/accounting.financial_general_journal-model').MODEL;

module.exports = {
    /**
     * Name: Insert 
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    insert: {
        auth: "required",
        params: {
            
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;

                const resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.insert({});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Update 
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    update: {
        auth: "required",
        params: {

        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { } = ctx.params;

                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.update({});
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Remove
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    remove: {
        auth: "required",
        params: {
            
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { cashBooksID } = ctx.params;
                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.remove({});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Get info and Get list 
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getInfoAndGetList: {
        auth: "required",
        params: {
            journalID: { type: "string", optional: true },
            companyID: { type: "string", optional: true },
            fundaID: { type: "string", optional: true },
            projectID: { type: "string", optional: true },
            voucherID: { type: "string", optional: true },
            accountID: { type: "string", optional: true },
            contactID: { type: "string", optional: true },
            contractID: { type: "string", optional: true },
            budgetID: { type: "string", optional: true },
            budgetItemID: { type: "string", optional: true },
            budgetGroupID: { type: "string", optional: true },
            budgetWorkID: { type: "string", optional: true },
            forward: { type: "string", optional: true },
            
            // Field mặc định
            keyword: { type: "string", optional: true },
            limit: { type: "string", optional: true },
            lastestID: { type: "string", optional: true },
            select: { type: "string", optional: true },
            populates: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { option, journalID, companyID, fundaID, projectID, contractID, warehouseID, goodsID, voucherID, accountID, contactID, budgetID, budgetItemID, budgetGroupID, budgetWorkID, fromDate, toDate, forward, cancel, keyword, limit, lastestID, populates, select, sortKey } = ctx.params;

                // console.log('=====Danh sách bút toán===================')
                // console.log({option, journalID, companyID, fundaID, projectID, contractID, voucherID, accountID, contactID, warehouseID, goodsID, budgetID, budgetItemID, budgetGroupID, budgetWorkID, fromDate, toDate, keyword, limit, lastestID, populates, select, sortKey})

                // console.log(ctx.params)

                const { _id: userID, company, contacts } = ctx.meta.infoUser;

                if(!companyID){
                    companyID = company._id
                }

                let resultAfterCallHandler;
                if (journalID) {
                    resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.getInfo({
                        journalID, userID, select, populates, ctx
                    });
                } else {
                    resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.getList({
                        option, forward, cancel, companyID, fundaID, projectID, contractID, warehouseID, goodsID, voucherID, accountID, contactID, budgetID, budgetItemID, budgetGroupID, budgetWorkID, fromDate, toDate, userID, contacts, keyword, limit, lastestID, select, populates, sortKey, ctx
                    })
                }
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Dev: Hiepnh 
     * Func: Tổng hợp ngân sách đã thực hiện
     * Date: 30/4/2022
     */
    calImpleBudget: {
        auth: "required",
        params: {
            workID : { type: "string", optional: true },
            groupID : { type: "string", optional: true },
            itemID : { type: "string", optional: true },
            budgetID : { type: "string", optional: true },
        },
        async handler(ctx) {  
            try {
                await this.validateEntity(ctx.params);
                let { workID, groupID, itemID, budgetID } = ctx.params;
            
                const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.calImpleBudget({
                    workID, groupID, itemID, budgetID, userID, ctx
                });
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Name: Lấy số dư tài khoản
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getAccountBalance: {
        auth: "required",
        params: {
            fromDate        : { type: "string" },
            toDate          : { type: "string" },
            option          : { type: "string", optional: true },
            optionGroup     : { type: "string", optional: true },
            name            : { type: "string", optional: true },
            arrAccNames     : { type: "array", optional: true },
            arrAccIDs       : { type: "array", optional: true },
            arrCompanyIDs   : { type: "array", optional: true },
            arrFundaIDs     : { type: "array", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { companyID, fundaID, contractID, accountID, fromDate, toDate, name, option, optionGroup, arrAccNames, arrAccIDs, arrCompanyIDs, arrFundaIDs } = ctx.params;
                
                const { _id: userID, company } = ctx.meta.infoUser;

                if(!companyID){
                    companyID = company._id
                }

                /**
                 * Convert dữ liệu ngày tháng để theo chuẩn chung
                 */
                fromDate   = moment(fromDate).startOf('day').format();// <=== fix ISODate here
                toDate     = moment(toDate).endOf('day').format();// <=== fix ISODate here

                let resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.getAccountBalance({
                    userID, ctx, companyID, fundaID, contractID, accountID, fromDate, toDate, name,  option, optionGroup, arrAccNames, arrAccIDs, arrCompanyIDs, arrFundaIDs
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Lấy số dư tài khoản
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getListByProperty: {
        auth: "required",
        params: {
            option          : { type: "string", optional: true },
            optionAccount   : { type: "string", optional: true },
            optionTerm      : { type: "string", optional: true },
            fromDate        : { type: "string", optional: true },
            toDate          : { type: "string", optional: true },
            companyID       : { type: "string", optional: true },
            name            : { type: "string", optional: true },
            arrAccNames     : { type: "array", optional: true },
            arrAccIDs       : { type: "array", optional: true },
            arrCompanyIDs   : { type: "array", optional: true },
            arrFundaIDs     : { type: "array", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { option, optionAccount, optionTerm, optionCal, companyID, fundaID, contractID, contactID, fromDate, toDate, name, arrAccNames, arrAccIDs, arrCompanyIDs, goodsID, warehouseID } = ctx.params;
                
                const { _id: userID, company, contacts } = ctx.meta.infoUser;

                // console.log({option, optionAccount, optionTerm, optionCal, companyID, fundaID, contractID, contactID, fromDate, toDate, name, arrAccNames, arrAccIDs, arrCompanyIDs, goodsID, warehouseID})

                if(!companyID){
                    companyID = company._id
                }

                /**
                 * Convert dữ liệu ngày tháng để theo chuẩn chung
                 */
                fromDate   = moment(fromDate).startOf('day').format();// <=== fix ISODate here
                toDate     = moment(toDate).endOf('day').format();// <=== fix ISODate here

                let resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.getListByProperty({
                    userID, contacts, option, optionAccount, optionTerm, optionCal, companyID, fundaID, contractID, contactID, fromDate, toDate, name, arrAccNames, arrAccIDs, arrCompanyIDs, goodsID, warehouseID, ctx
                })

                // console.log(resultAfterCallHandler)

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Cập nhật giá vốn cho hàng hóa cho các phiếu xuất trong 1 khoảng thời gian
     * Code: Hiepnh
     * Date: 3/1/2024
     */
    analysePrimeCostOfAllVouchers: {
        auth: 'required',
        params: {
            companyID: { type: "string", optional: true },
            option: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, company } = ctx.meta.infoUser;

                let { companyID, fundaID, accountID, fromDate, toDate } = ctx.params;

                if(!companyID) {
                    companyID = company._id;
                }

                const resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.analysePrimeCostOfAllVouchers({
                    companyID, fundaID, accountID, fromDate, toDate, userID, queue: this.metadata.queue
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx })
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Name: exportExcel
     * Author: HiepNH
     * Date: 1/1/2024
     */
    exportExcel: {
        auth: 'required',
        params: {
            companyID: { type: "string", optional: true },
            option: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, email, company } = ctx.meta.infoUser;
                let { companyID, filterParams, type, voucherID } = ctx.params;

                // console.log(ctx.params)

                if(!companyID) {
                    companyID = company._id;
                }

                const resultAfterCallHandler = await FINANCIAL_GENERAL_JOURNAL_MODEL.exportExcelByFilter({
                    userID, companyID, filterParams, type, voucherID, ctx
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },
}