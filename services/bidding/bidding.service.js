'use strict'

const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')

/**
 * DOMAIN AND ACTIONS
 */
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_BIDDING } = require('./helper/bidding.actions-constant')

/**
 * HANDLERS
 */
const BIDDING__PLAN_HANDLER = require('./handler/bidding.plan-handler')
const BIDDING__DOC_HANDLER = require('./handler/bidding.doc-handler')
const BIDDING__REQUEST_HANDLER = require('./handler/bidding.request-handler')
const BIDDING__APPLY_HANDLER = require('./handler/bidding.apply-handler')
const BIDDING__QUOTATION_HANDLER = require('./handler/bidding.quotation-handler')
const BIDDING__BILL_ITEM_HANDLER = require('./handler/bidding.bill_item-handler')
const BIDDING__BILL_GROUP_HANDLER = require('./handler/bidding.bill_group-handler')
const BIDDING__BILL_WORK_HANDLER = require('./handler/bidding.bill_work-handler')
const BIDDING__BILL_WORKLINE_HANDLER = require('./handler/bidding.bill_workline-handler')
const BIDDING__BILL_PRODUCT_HANDLER = require('./handler/bidding.bill_product-handler')

/**
 * COLLECTIONS
 */
const BIDDING__PLAN_COLL = require('./database/bidding.plan-coll')
const BIDDING__DOC_COLL = require('./database/bidding.doc-coll')
const BIDDING__REQUEST_COLL = require('./database/bidding.request-coll')
const BIDDING__APPLY_COLL = require('./database/bidding.apply-coll')
const BIDDING__QUOTATION_COLL = require('./database/bidding.quotation-coll')
const BIDDING__BILL_ITEM_COLL = require('./database/bidding.bill_item-coll')
const BIDDING__BILL_GROUP_COLL = require('./database/bidding.bill_group-coll')
const BIDDING__BILL_WORK_COLL = require('./database/bidding.bill_work-coll')
const BIDDING__BILL_WORKLINE_COLL = require('./database/bidding.bill_workline-coll')
const BIDDING__BILL_PRODUCT_COLL = require('./database/bidding.bill_product-coll')

module.exports = {
    name: CF_DOMAIN_SERVICES.BIDDING,
    mixins: [
        DbService(BIDDING__PLAN_COLL),
        DbService(BIDDING__DOC_COLL),
        DbService(BIDDING__REQUEST_COLL),
        DbService(BIDDING__APPLY_COLL),
        DbService(BIDDING__QUOTATION_COLL),
        DbService(BIDDING__BILL_ITEM_COLL),
        DbService(BIDDING__BILL_GROUP_COLL),
        DbService(BIDDING__BILL_WORK_COLL),
        DbService(BIDDING__BILL_WORKLINE_COLL),
        DbService(BIDDING__BILL_PRODUCT_COLL),
        CacheCleaner([CF_DOMAIN_SERVICES.BIDDING]),
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
        //========================================== BIIDING_PLAN  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_PLAN_INSERT]: BIDDING__PLAN_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_PLAN_UPDATE]: BIDDING__PLAN_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_PLAN_REMOVE]: BIDDING__PLAN_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_PLAN_GET_INFO_AND_GET_LIST]:
            BIDDING__PLAN_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_BIDDING.BIIDING_PLAN_CONTRACTOR_SELECTION]:
            BIDDING__PLAN_HANDLER.contractorSelection,

        //========================================== BIIDING_DOC  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_DOC_INSERT]: BIDDING__DOC_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_DOC_UPDATE]: BIDDING__DOC_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_DOC_REMOVE]: BIDDING__DOC_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_DOC_GET_INFO_AND_GET_LIST]:
            BIDDING__DOC_HANDLER.getInfoAndGetList,

        //==========================================  BIIDING_REQUEST  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_REQUEST_INSERT]:
            BIDDING__REQUEST_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_REQUEST_UPDATE]:
            BIDDING__REQUEST_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_REQUEST_REMOVE]:
            BIDDING__REQUEST_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_REQUEST_GET_INFO_AND_GET_LIST]:
            BIDDING__REQUEST_HANDLER.getInfoAndGetList,

        //==========================================  BIIDING_APPLY  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_APPLY_INSERT]:
            BIDDING__APPLY_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_APPLY_UPDATE]:
            BIDDING__APPLY_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_APPLY_REMOVE]:
            BIDDING__APPLY_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_APPLY_GET_INFO_AND_GET_LIST]:
            BIDDING__APPLY_HANDLER.getInfoAndGetList,

        //==========================================  BIIDING_QUOTATION  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_QUOTATION_INSERT]:
            BIDDING__QUOTATION_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_QUOTATION_UPDATE]:
            BIDDING__QUOTATION_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_QUOTATION_REMOVE]:
            BIDDING__QUOTATION_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_QUOTATION_GET_INFO_AND_GET_LIST]:
            BIDDING__QUOTATION_HANDLER.getInfoAndGetList,

        //==========================================  BIIDING_BILL_ITEM  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_BILL_ITEM_INSERT]:
            BIDDING__BILL_ITEM_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_ITEM_UPDATE]:
            BIDDING__BILL_ITEM_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_ITEM_REMOVE]:
            BIDDING__BILL_ITEM_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_ITEM_GET_INFO_AND_GET_LIST]:
            BIDDING__BILL_ITEM_HANDLER.getInfoAndGetList,

        //==========================================  BIIDING_BILL_GROUP  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_BILL_GROUP_INSERT]:
            BIDDING__BILL_GROUP_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_GROUP_UPDATE]:
            BIDDING__BILL_GROUP_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_GROUP_REMOVE]:
            BIDDING__BILL_GROUP_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_GROUP_GET_INFO_AND_GET_LIST]:
            BIDDING__BILL_GROUP_HANDLER.getInfoAndGetList,

        //==========================================  BIIDING_BILL_WORK  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_INSERT]:
            BIDDING__BILL_WORK_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_UPDATE]:
            BIDDING__BILL_WORK_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_REMOVE]:
            BIDDING__BILL_WORK_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_GET_INFO_AND_GET_LIST]:
            BIDDING__BILL_WORK_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_ASSIGN_TEMPLATE]:
            BIDDING__BILL_WORK_HANDLER.assignJobInTemplate,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_UPDATE_PRODUCT_PRICE]:
            BIDDING__BILL_WORK_HANDLER.updateProductPrice,

        //==========================================  BIIDING_BILL_WORKLINE  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORKLINE_INSERT]:
            BIDDING__BILL_WORKLINE_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORKLINE_UPDATE]:
            BIDDING__BILL_WORKLINE_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORKLINE_REMOVE]:
            BIDDING__BILL_WORKLINE_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_WORKLINE_GET_INFO_AND_GET_LIST]:
            BIDDING__BILL_WORKLINE_HANDLER.getInfoAndGetList,

        //==========================================  BIIDING_BILL_PRODUCT  ==================================
        [CF_ACTIONS_BIDDING.BIIDING_BILL_PRODUCT_INSERT]:
            BIDDING__BILL_PRODUCT_HANDLER.insert,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_PRODUCT_UPDATE]:
            BIDDING__BILL_PRODUCT_HANDLER.update,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_PRODUCT_REMOVE]:
            BIDDING__BILL_PRODUCT_HANDLER.remove,
        [CF_ACTIONS_BIDDING.BIIDING_BILL_PRODUCT_GET_INFO_AND_GET_LIST]:
            BIDDING__BILL_PRODUCT_HANDLER.getInfoAndGetList,
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
