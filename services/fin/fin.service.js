'use strict'

const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')

/**
 * DOMAIN AND ACTIONS
 */
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_FIN } = require('./helper/fin.actions-constant')

/**
 * HANDLERS
 */
const FIN__CASH_FLOW_PLAN_HANDLER = require('./handler/fin.cash_flow_plan-handler')
const FIN__CASH_BOOK_HANDLER = require('./handler/fin.cash_book-handler')
const FIN__CASH_PAYMENT_HANDLER = require('./handler/fin.cash_payment-handler')

/**
 * COLLECTIONS
 */
const FIN__CASH_FLOW_PLAN_COLL = require('./database/fin.cash_flow_plan-coll')
const FIN__CASH_BOOK_COLL = require('./database/fin.cash_book-coll')
const FIN__CASH_PAYMENT_COLL = require('./database/fin.cash_payment-coll')

module.exports = {
    name: CF_DOMAIN_SERVICES.FIN,
    mixins: [
        DbService(FIN__CASH_FLOW_PLAN_COLL),
        DbService(FIN__CASH_BOOK_COLL),
        DbService(FIN__CASH_PAYMENT_COLL),
        CacheCleaner([CF_DOMAIN_SERVICES.FIN]),
    ],

    /**
     * Service metadata
     */
    metadata: {},

    /**
     * Service dependencies
     */
    dependencies: [],

    /**
     * Actions
     */
    actions: {
        //==========================================  CASH_FLOW_PLAN  ==================================
        [CF_ACTIONS_FIN.CASH_FLOW_PLAN_INSERT]:
            FIN__CASH_FLOW_PLAN_HANDLER.insert,
        [CF_ACTIONS_FIN.CASH_FLOW_PLAN_UPDATE]:
            FIN__CASH_FLOW_PLAN_HANDLER.update,
        [CF_ACTIONS_FIN.CASH_FLOW_PLAN_REMOVE]:
            FIN__CASH_FLOW_PLAN_HANDLER.remove,
        [CF_ACTIONS_FIN.CASH_FLOW_PLAN_GET_INFO_AND_GET_LIST]:
            FIN__CASH_FLOW_PLAN_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_FIN.CASH_FLOW_PLAN_GET_AMOUNT_BY_PROPERTY]:
            FIN__CASH_FLOW_PLAN_HANDLER.getAmountByProperty,

        //==========================================  CASH_BOOK  ==================================
        [CF_ACTIONS_FIN.CASH_BOOK_INSERT]: FIN__CASH_BOOK_HANDLER.insert,
        [CF_ACTIONS_FIN.CASH_BOOK_UPDATE]: FIN__CASH_BOOK_HANDLER.update,
        [CF_ACTIONS_FIN.CASH_BOOK_REMOVE]: FIN__CASH_BOOK_HANDLER.remove,
        [CF_ACTIONS_FIN.CASH_BOOK_GET_INFO_AND_GET_LIST]:
            FIN__CASH_BOOK_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_FIN.CASH_BOOK_GET_AMOUNT_BY_PROPERTY]:
            FIN__CASH_BOOK_HANDLER.getAmountByProperty,
        [CF_ACTIONS_FIN.CASH_BOOK_GET_AMOUNT_BY_PARENT]:
            FIN__CASH_BOOK_HANDLER.getAmountIncomeAndExpenseByParent,
        [CF_ACTIONS_FIN.CASH_BOOK_DOWNLOAD_TEMPLATE_EXCEL]:
            FIN__CASH_BOOK_HANDLER.downloadTemplateExcel,
        [CF_ACTIONS_FIN.CASH_BOOK_IMPORT_FROM_EXCEL]:
            FIN__CASH_BOOK_HANDLER.importFromExcel,
        [CF_ACTIONS_FIN.CASH_BOOK_EXPORT_EXCEL]:
            FIN__CASH_BOOK_HANDLER.exportExcel,

        //==========================================  CASH_FLOW_PLAN  ==================================
        [CF_ACTIONS_FIN.CASH_PAYMENT_INSERT]: FIN__CASH_PAYMENT_HANDLER.insert,
        [CF_ACTIONS_FIN.CASH_PAYMENT_UPDATE]: FIN__CASH_PAYMENT_HANDLER.update,
        [CF_ACTIONS_FIN.CASH_PAYMENT_REMOVE]: FIN__CASH_PAYMENT_HANDLER.remove,
        [CF_ACTIONS_FIN.CASH_PAYMENT_GET_INFO_AND_GET_LIST]:
            FIN__CASH_PAYMENT_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_FIN.CASH_PAYMENT_GET_AMOUNT_BY_PROPERTY]:
            FIN__CASH_PAYMENT_HANDLER.getAmountByProperty,
        [CF_ACTIONS_FIN.CASH_PAYMENT_EXPORT_EXCEL]:
            FIN__CASH_PAYMENT_HANDLER.exportExcel,
    },

    /**
     * Events
     */
    events: {},

    /**
     * Methods
     */
    methods: {},

    /**
     * Service created lifecycle event handler
     */
    created() {},

    /**
     * Service started lifecycle event handler
     */
    async started() {},

    /**
     * Service stopped lifecycle event handler
     */
    async stopped() {},
}
