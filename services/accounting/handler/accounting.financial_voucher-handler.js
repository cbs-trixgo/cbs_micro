/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } 	        = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM }              = require('../../item/helper/item.actions-constant')

/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }   = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ACCOUNTING__FINANCIAL_VOUCHER_MODEL = require('../model/accounting.financial_voucher-model').MODEL

module.exports = {
    /**
     * Name: Insert 
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    insert: {
        auth: "required",
        async handler(ctx) {
            try {
                let { 
                    fundaID, 
                    customerID,
                    contract, 
                    storageID, 
                    linkFundaID,
                    warehouseID,
                    subtypeID,
                    date, name, sign, signInvoice, dateInvoice, vat, type, source, orderNew, pricePolicy,
                    receiver, note, 
                    forward, forwardIs, returning, advancePayment, cancel, 
                    fcuExRate, 
                    selectedJournals, 
                    isImport,
                } = ctx.params;
                // console.log(ctx.params)
                //  return

                const { _id: userID } = ctx.meta.infoUser;

                let  resultAfterCallHandler;

                if(!fundaID){
                    let infoFundaCompany = await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.FUNDA_GET_INFO_AND_GET_LIST}`,{ })
                
                    if(infoFundaCompany.error){
                        resultAfterCallHandler.message = 'Not found funda comany ';
                        return renderStatusCodeAndResponse({ resultAfterCallHandler: infoFundaCompany, ctx })
                    }
    
                    fundaID = infoFundaCompany.data && infoFundaCompany.data.listRecords[infoFundaCompany.data.listRecords.length-1]._id
                }
                
                resultAfterCallHandler = await ACCOUNTING__FINANCIAL_VOUCHER_MODEL.insert({ 
                    authorID : userID, 
                    fundaID,
                    customerID,
                    contractID: contract, 
                    storageID, 
                    linkFundaID,
                    warehouseID,
                    subtypeID,
                    type, date, name, sign, signInvoice, dateInvoice, vat, source, orderNew, pricePolicy,
                    receiver, note,
                    forward: (!isNaN(forward) && [0,1].includes(Number(forward))) ? Number(forward) : 0,
                    forwardIs: (!isNaN(forwardIs) && [0,1].includes(Number(forwardIs))) ? Number(forwardIs) : 0,
                    returning: (!isNaN(returning) && [0,1].includes(Number(returning))) ? Number(returning) : 0,
                    advancePayment: (!isNaN(advancePayment) && [0,1].includes(Number(advancePayment))) ? Number(advancePayment) : 0,
                    cancel: (!isNaN(cancel) && [0,1].includes(Number(cancel))) ? Number(cancel) : 0,
                    source: (!isNaN(source) && [1,2,3,4].includes(Number(source))) ? Number(source) : 1,
                    orderNew: (!isNaN(orderNew) && [0,1,2].includes(Number(orderNew))) ? Number(orderNew) : 1,
                    pricePolicy: (!isNaN(pricePolicy) && [0,1,2].includes(Number(pricePolicy))) ? Number(pricePolicy) : 1,
                    fcuExRate: !isNaN(fcuExRate) ? Number(fcuExRate) : 0,
                    selectedJournals, 
                    isImport,
                    ctx,
                }) 

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx })
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
            voucherID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { 
                    voucherID,
                    fundaID,
                    customerID,
                    contract, 
                    storageID, 
                    warehouseID,
                    subtypeID,
                    date, name, sign, signInvoice, dateInvoice, vat, type, source, orderNew, pricePolicy,
                    receiver, note, 
                    forward, forwardIs, returning, advancePayment, cancel, 
                    fcuExRate, 
                    selectedJournals, 
                    deletedJournals,
                } = ctx.params;

                // console.log(ctx.params)
                //  return

                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await ACCOUNTING__FINANCIAL_VOUCHER_MODEL.update({
                    authorID: userID, 
                    voucherID,
                    fundaID,
                    customerID,
                    contractID: contract, 
                    storageID,
                    warehouseID,
                    subtypeID,
                    date, name, sign, signInvoice, dateInvoice, vat, type, source, orderNew, pricePolicy,
                    receiver, note,
                    forward, forwardIs, returning, advancePayment, cancel, 
                    fcuExRate, 
                    selectedJournals, 
                    deletedJournals,
                    ctx
                });
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Convert phiếu xuất nội bộ
     * Author: Hiepnh
     * Date: 6/1/2024
     */
    convertVoucher: {
        auth: "required",
        params: {
            docID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { docID } = ctx.params;
                // console.log('===========OK=======================')
                // console.log(ctx.params)

                const { _id: userID, company } = ctx.meta.infoUser;

                const resultAfterCallHandler = await ACCOUNTING__FINANCIAL_VOUCHER_MODEL.convertVoucher({ companyID: company._id, docID, userID, ctx });
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
     updateFromVoucherToJournal: {
        auth: "required",
        params: {
            companyID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { companyID } = ctx.params;

                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await ACCOUNTING__FINANCIAL_VOUCHER_MODEL.updateFromVoucherToJournal({ companyID, userID, ctx });
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
    updateFromJournalToVoucher: {
        auth: "required",
        params: {
            companyID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { companyID } = ctx.params;

                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await ACCOUNTING__FINANCIAL_VOUCHER_MODEL.updateFromJournalToVoucher({ companyID, userID, ctx });
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
            voucherID: { type: "array" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { voucherID } = ctx.params;
                const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await ACCOUNTING__FINANCIAL_VOUCHER_MODEL.remove({
                    voucherID, userID
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
     * Date: 30/4/2022
     */
    getInfoAndGetList: {
        auth: "required",
        params: {
            voucherID       : { type: "string", optional: true },
            companyID       : { type: "string", optional: true },
            fundaID         : { type: "string", optional: true },
            projectID       : { type: "string", optional: true },
            contractID      : { type: "string", optional: true },
            customerID      : { type: "string", optional: true },
            fromDate        : { type: "string", optional: true },
            toDate          : { type: "string", optional: true },
            type            : { type: "string", optional: true },
            userCreateID      : { type: "string", optional: true },

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
                let { voucherID, companyID, fundaID, projectID, customerID, contractID, fromDate, toDate, type, vat, userCreateID, keyword, limit, lastestID, populates, select, sortKey } = ctx.params;
                
                const { _id: userID, company } = ctx.meta.infoUser;

                if(!companyID){
                    companyID = company._id
                }

                // console.log({ voucherID, companyID, fundaID, projectID, customerID, contractID, fromDate, toDate, type, vat, userCreateID, keyword, limit, lastestID, populates, select, sortKey })

                let resultAfterCallHandler;
                if (voucherID) {
                    resultAfterCallHandler = await ACCOUNTING__FINANCIAL_VOUCHER_MODEL.getInfo({
                        voucherID, userID, select, populates, ctx
                    });
                } else {
                    resultAfterCallHandler = await ACCOUNTING__FINANCIAL_VOUCHER_MODEL.getList({
                        userID, companyID, fundaID, projectID, customerID, contractID, fromDate, toDate, type, vat, userCreateID, 
                        keyword, limit, lastestID, select, populates, sortKey, ctx
                    })

                    // console.log(resultAfterCallHandler)
                }
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },
}