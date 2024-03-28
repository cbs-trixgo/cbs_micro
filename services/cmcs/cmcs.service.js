'use strict'
const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_CMCS } = require('./helper/cmcs.actions-constant')

const CMCS__CONTRACT_IPC_COLL = require('./database/cmcs.contract_ipc-coll')
const CMCS__CONTRACT_PRODUCTION_COLL = require('./database/cmcs.contract_production-coll')
const CMCS__CONTRACT_PAYMENT_COLL = require('./database/cmcs.contract_payment-coll')
const CMCS__CONTRACT_EXPENSE_COLL = require('./database/cmcs.contract_expense-coll')
const CMCS__CONTRACT_BILL_ITEM_COLL = require('./database/cmcs.contract_bill_item-coll')
const CMCS__CONTRACT_BILL_GROUP_COLL = require('./database/cmcs.contract_bill_group-coll')
const CMCS__CONTRACT_BILL_JOB_COLL = require('./database/cmcs.contract_bill_job-coll')
const CMCS__CONTRACT_IPC_DETAIL_COLL = require('./database/cmcs.contract_ipc_detail-coll.js')
const CMCS__CONTRACT_SUBMITTAL_COLL = require('./database/cmcs.contract_submittal-coll.js')

const CMCS__CONTRACT_IPC_HANDLER = require('./handler/cmcs.contract_ipc-handler')
const CMCS__CONTRACT_PRODUCTION_HANDLER = require('./handler/cmcs.contract_production-handler')
const CMCS__CONTRACT_PAYMENT_HANDLER = require('./handler/cmcs.contract_payment-handler')
const CMCS__CONTRACT_EXPENSE_HANDLER = require('./handler/cmcs.contract_expense-handler')
const CMCS__CONTRACT_BILL_ITEM_HANDLER = require('./handler/cmcs.contract_bill_item-handler')
const CMCS__CONTRACT_BILL_GROUP_HANDLER = require('./handler/cmcs.contract_bill_group-handler')
const CMCS__CONTRACT_BILL_JOB_HANDLER = require('./handler/cmcs.contract_bill_job-handler')
const CMCS__CONTRACT_IPC_DETAIL_HANDLER = require('./handler/cmcs.contract_ipc_detail-handler')
const CMCS__CONTRACT_SUBMITTAL_HANDLER = require('./handler/cmcs.contract_submittal-handler')

module.exports = {
    name: CF_DOMAIN_SERVICES.CMCS,
    mixins: [
        DbService(CMCS__CONTRACT_IPC_COLL),
        DbService(CMCS__CONTRACT_PRODUCTION_COLL),
        DbService(CMCS__CONTRACT_PAYMENT_COLL),
        DbService(CMCS__CONTRACT_EXPENSE_COLL),
        DbService(CMCS__CONTRACT_BILL_ITEM_COLL),
        DbService(CMCS__CONTRACT_BILL_GROUP_COLL),
        DbService(CMCS__CONTRACT_BILL_JOB_COLL),
        DbService(CMCS__CONTRACT_IPC_DETAIL_HANDLER),
        DbService(CMCS__CONTRACT_SUBMITTAL_HANDLER),
        CacheCleaner([CF_DOMAIN_SERVICES.CMCS]),
    ],

    /**
     * Service metadata
     */
    metadata: {},
    /**
     * Service dependencies
     */
    dependencies: [CF_DOMAIN_SERVICES.AUTH],

    /**
     * Actions
     */
    actions: {
        //==========================================   CONTRACT PRODUCTION   ================================
        [CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_INSERT]:
            CMCS__CONTRACT_PRODUCTION_HANDLER.insert,
        [CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_UPDATE]:
            CMCS__CONTRACT_PRODUCTION_HANDLER.update,
        [CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_REMOVE]:
            CMCS__CONTRACT_PRODUCTION_HANDLER.remove,
        [CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_INFO_AND_GET_LIST]:
            CMCS__CONTRACT_PRODUCTION_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_LIST_BY_MONTH]:
            CMCS__CONTRACT_PRODUCTION_HANDLER.getListByMonth,
        [CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_AMOUNT_BY_MONTH]:
            CMCS__CONTRACT_PRODUCTION_HANDLER.getAmountByMonth,
        [CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_AMOUNT_BY_OBJECT]:
            CMCS__CONTRACT_PRODUCTION_HANDLER.getAmountByObject,
        [CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_AMOUNT_BY_PROPERTY]:
            CMCS__CONTRACT_PRODUCTION_HANDLER.getAmountByProperty,

        //==========================================   CONTRACT IPC   ================================
        [CF_ACTIONS_CMCS.CONTRACT_IPC_INSERT]:
            CMCS__CONTRACT_IPC_HANDLER.insert,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_UPDATE]:
            CMCS__CONTRACT_IPC_HANDLER.update,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_REMOVE]:
            CMCS__CONTRACT_IPC_HANDLER.remove,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_GET_INFO_AND_GET_LIST]:
            CMCS__CONTRACT_IPC_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_GET_LIST_BY_MONTH]:
            CMCS__CONTRACT_IPC_HANDLER.getListByMonth,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_MONTH]:
            CMCS__CONTRACT_IPC_HANDLER.getAmountByMonth,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_OBJECT]:
            CMCS__CONTRACT_IPC_HANDLER.getAmountByObject,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_PROPERTY]:
            CMCS__CONTRACT_IPC_HANDLER.getAmountByProperty,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_DOWNLOAD_EXCEL]:
            CMCS__CONTRACT_IPC_HANDLER.downloadExcelIpc,

        //==========================================   CONTRACT PAYMENT   ================================
        [CF_ACTIONS_CMCS.CONTRACT_PAYMENT_INSERT]:
            CMCS__CONTRACT_PAYMENT_HANDLER.insert,
        [CF_ACTIONS_CMCS.CONTRACT_PAYMENT_UPDATE]:
            CMCS__CONTRACT_PAYMENT_HANDLER.update,
        [CF_ACTIONS_CMCS.CONTRACT_PAYMENT_REMOVE]:
            CMCS__CONTRACT_PAYMENT_HANDLER.remove,
        [CF_ACTIONS_CMCS.CONTRACT_PAYMENT_GET_INFO_AND_GET_LIST]:
            CMCS__CONTRACT_PAYMENT_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_CMCS.CONTRACT_PAYMENT_GET_LIST_BY_MONTH]:
            CMCS__CONTRACT_PAYMENT_HANDLER.getListByMonth,
        [CF_ACTIONS_CMCS.CONTRACT_PAYMENT_GET_AMOUNT_BY_MONTH]:
            CMCS__CONTRACT_PAYMENT_HANDLER.getAmountByMonth,
        [CF_ACTIONS_CMCS.CONTRACT_PAYMENT_AMOUNT_BY_OBJECT]:
            CMCS__CONTRACT_PAYMENT_HANDLER.getAmountByObject,
        [CF_ACTIONS_CMCS.CONTRACT_PAYMENT_GET_AMOUNT_BY_PROPERTY]:
            CMCS__CONTRACT_PAYMENT_HANDLER.getAmountByProperty,

        //==========================================   CONTRACT EXPENSE   ================================
        [CF_ACTIONS_CMCS.CONTRACT_EXPENSE_INSERT]:
            CMCS__CONTRACT_EXPENSE_HANDLER.insert,
        [CF_ACTIONS_CMCS.CONTRACT_EXPENSE_UPDATE]:
            CMCS__CONTRACT_EXPENSE_HANDLER.update,
        [CF_ACTIONS_CMCS.CONTRACT_EXPENSE_REMOVE]:
            CMCS__CONTRACT_EXPENSE_HANDLER.remove,
        [CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_INFO_AND_GET_LIST]:
            CMCS__CONTRACT_EXPENSE_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_LIST_BY_MONTH]:
            CMCS__CONTRACT_EXPENSE_HANDLER.getListByMonth,
        [CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_AMOUNT_BY_MONTH]:
            CMCS__CONTRACT_EXPENSE_HANDLER.getAmountByMonth,
        [CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_AMOUNT_BY_OBJECT]:
            CMCS__CONTRACT_EXPENSE_HANDLER.getAmountByObject,
        [CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_AMOUNT_BY_PROPERTY]:
            CMCS__CONTRACT_EXPENSE_HANDLER.getAmountByProperty,

        //==========================================  CONTRACT_BILL_ITEM   ================================
        [CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_INSERT]:
            CMCS__CONTRACT_BILL_ITEM_HANDLER.insert,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_UPDATE]:
            CMCS__CONTRACT_BILL_ITEM_HANDLER.update,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_REMOVE]:
            CMCS__CONTRACT_BILL_ITEM_HANDLER.remove,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_GET_INFO_AND_GET_LIST]:
            CMCS__CONTRACT_BILL_ITEM_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_UPDATE_VALUE]:
            CMCS__CONTRACT_BILL_ITEM_HANDLER.updateValue,

        //==========================================  CONTRACT_BILL_GROUP  ================================
        [CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_INSERT]:
            CMCS__CONTRACT_BILL_GROUP_HANDLER.insert,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_UPDATE]:
            CMCS__CONTRACT_BILL_GROUP_HANDLER.update,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_REMOVE]:
            CMCS__CONTRACT_BILL_GROUP_HANDLER.remove,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_GET_INFO_AND_GET_LIST]:
            CMCS__CONTRACT_BILL_GROUP_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_UPDATE_VALUE]:
            CMCS__CONTRACT_BILL_GROUP_HANDLER.updateValue,

        //==========================================  CONTRACT_BILL_JOB  ================================
        [CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_INSERT]:
            CMCS__CONTRACT_BILL_JOB_HANDLER.insert,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_UPDATE]:
            CMCS__CONTRACT_BILL_JOB_HANDLER.update,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_REMOVE]:
            CMCS__CONTRACT_BILL_JOB_HANDLER.remove,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_GET_INFO_AND_GET_LIST]:
            CMCS__CONTRACT_BILL_JOB_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_UPDATE_VALUE]:
            CMCS__CONTRACT_BILL_JOB_HANDLER.updateValue,

        //==========================================  CONTRACT_IPC_DETAIL   ================================
        [CF_ACTIONS_CMCS.CONTRACT_IPC_DETAIL_INSERT]:
            CMCS__CONTRACT_IPC_DETAIL_HANDLER.insert,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_DETAIL_UPDATE]:
            CMCS__CONTRACT_IPC_DETAIL_HANDLER.update,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_DETAIL_REMOVE]:
            CMCS__CONTRACT_IPC_DETAIL_HANDLER.remove,
        [CF_ACTIONS_CMCS.CONTRACT_IPC_DETAIL_GET_INFO_AND_GET_LIST]:
            CMCS__CONTRACT_IPC_DETAIL_HANDLER.getInfoAndGetList,

        //==========================================   CONTRACT_SUBMITTAL   ================================//
        [CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_INSERT]:
            CMCS__CONTRACT_SUBMITTAL_HANDLER.insert,
        [CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_UPDATE]:
            CMCS__CONTRACT_SUBMITTAL_HANDLER.update,
        [CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_REMOVE]:
            CMCS__CONTRACT_SUBMITTAL_HANDLER.remove,
        [CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_GET_INFO_AND_GET_LIST]:
            CMCS__CONTRACT_SUBMITTAL_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_GET_LIST_BY_PROPERTY]:
            CMCS__CONTRACT_SUBMITTAL_HANDLER.getListByProperty,
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
