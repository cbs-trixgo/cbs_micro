/**
 * TOOLS
 */
const { renderStatusCodeAndResponse } = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const FIN__CASH_BOOK_MODEL = require('../model/fin.cash_book-model').MODEL;

module.exports = {
    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert: {
        auth: "required",
        params: {
            parentID: { type: "string", optional: true },
            accountID: { type: "string", optional: true },
            customerID: { type: "string", optional: true },
            contractID: { type: "string", optional: true },
            name: { type: "string" },
            sign: { type: "string", optional: true },
            note: { type: "string", optional: true },
            date: { type: "string", optional: true },
            income: { type: "number", optional: true },
            expense: { type: "number", optional: true },
            arising: { type: "number", optional: true },
            openingBalance: { type: "number", optional: true },
            closingBalance: { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { parentID, accountID, customerID, contractID, name, sign, note, date, income, expense, arising, openingBalance, closingBalance } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;

                const resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.insert({
                    companyID: company._id, userID, parentID, accountID, customerID, contractID, name, sign, note, date, income, expense, arising, openingBalance, closingBalance
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Update
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    update: {
        auth: "required",
        params: {
            cashBookID  : { type: "string" },
            accountID   : { type: "string", optional: true },
            customerID  : { type: "string", optional: true },
            contractID  : { type: "string", optional: true },
            name        : { type: "string", optional: true },
            sign        : { type: "string", optional: true },
            note        : { type: "string", optional: true },
            date        : { type: "string", optional: true },
            income      : { type: "number", optional: true },
            expense     : { type: "number", optional: true },
            active      : { type: "number", optional: true },
            members     : { type: "array", optional: true },
            admins      : { type: "array", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { cashBookID, accountID, customerID, contractID, name, sign, note, date, income, expense, active, members, admins, } = ctx.params;
                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.update({
                    cashBookID, accountID, customerID, contractID, name, sign, note, date, income, expense, active, members, admins, userID
                });
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Remove
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    remove: {
        auth: "required",
        params: {
            cashBooksID: { type: "array" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { cashBooksID } = ctx.params;
                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.remove({
                    cashBooksID, userID
                });

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
            cashBookID      : { type: "string", optional: true },
            parentID        : { type: "string", optional: true },
            accountID       : { type: "string", optional: true },
            customerID      : { type: "string", optional: true },
            contractID      : { type: "string", optional: true },
            sortKey         : { type: "string", optional: true },
            outin           : { type: "string", optional: true },
            isCompanyOther  : { type: "string", optional: true },

            // Field mặc định
            keyword         : { type: "string", optional: true },
            limit           : { type: "string", optional: true },
            lastestID       : { type: "string", optional: true },
            select          : { type: "string", optional: true },
            populates       : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {
                    outin, cashBookID, companyID, accountID, customerID, contractID, parentID, isCompanyOther,
                    keyword, limit, lastestID, populates, select, sortKey
                } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;

                if(!companyID){
                    companyID = company._id
                }

                let resultAfterCallHandler;
                if (cashBookID) {
                    resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.getInfo({
                        cashBookID, userID, select, populates
                    });
                } else {
                    resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.getList({
                        outin, companyID, accountID, customerID, contractID, parentID, userID, isCompanyOther,
                        keyword, limit, lastestID, select, populates, sortKey, companyOfUser: company._id
                    });
                }

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
    * Name  : Lấy tổng thu và chi theo sổ
    * Author: MinhVH
    * Date  : 18/4/2022
    */
    getAmountIncomeAndExpenseByParent: {
        auth: "required",
        params: {
            parentID: { type: "string" }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { parentID } = ctx.params;

                const resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.getAmountIncomeAndExpenseByParent({
                    parentID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Name: Gom nhóm theo thuộc tính
     * Author: Hiepnh
     * Date: 17/04/2022
     */
    getAmountByProperty: {
        auth: "required",
        params: {
            companyID       : { type: "string", optional: true },
            parentID        : { type: "string", optional: true },
            accountID       : { type: "string", optional: true },
            year            : { type: "string", optional: true },
            option          : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { companyID, parentID, accountID, year, option } = ctx.params;

                const { _id: userID, company } = ctx.meta.infoUser;

                if(!companyID){
                    companyID = company._id
                }

                let resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.getAmountByProperty({
                    userID, companyID, parentID, accountID, year, option, ctx
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
     * Date: 8/12/2022
     */
    downloadTemplateExcel: {
        auth: 'required',
        params: {
            parentID    : { type: 'string', optional: true },
            option      : { type: "string", optional: true }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { parentID, option, year } = ctx.params;
				const { _id: userID, company} = ctx.meta.infoUser;
                // console.log(ctx.params)
                
                // console.log({parentID})
                const resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.downloadTemplateExcel({
                    companyID: company._id, parentID, userID, option, year
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
            parentID: { type: 'string' },
            dataImport: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { option, parentID, dataImport } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;
                
                // console.log(ctx.params)

                const resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.importFromExcel({
                    companyID: company._id, option, parentID, dataImport, userID
                })
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: exportExcel
     * Date: 14/1/2024
     */
    exportExcel: {
        auth: 'required',
        params: {
            parentID    : { type: 'string', optional: true  },
            option: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, email, company } = ctx.meta.infoUser;
                let { parentID, option, year, fromDate, toDate } = ctx.params;
                // console.log(ctx.params)

                const resultAfterCallHandler = await FIN__CASH_BOOK_MODEL.exportExcel({
                    userID, companyID: company._id, parentID, userID, option, year, fromDate, toDate
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },
}