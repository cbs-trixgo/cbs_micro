'use strict'

const { Queue } = require('bullmq')
const IORedis = require('ioredis')
const { REDIS_SEPERATOR } = require('../../tools/cache/cf_redis')
const { isProd } = require('../../tools/utils/utils')

const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')

/**
 * DOMAIN AND ACTIONS
 */
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('./helper/item.actions-constant')

/**
 * HANDLERS
 */
const ITEM__CONTRACT_HANDLER = require('./handler/item.contract-handler')
const ITEM__DEPARTMENT_HANDLER = require('./handler/item.department-handler')
const ITEM__DOCTYPE_HANDLER = require('./handler/item.doctype-handler')
const ITEM__CONTACT_HANDLER = require('./handler/item.contact-handler')
const ITEM__WAREHOUSE_HANDLER = require('./handler/item.warehouse-handler')
const ITEM__AREA_HANDLER = require('./handler/item.area-handler')
const ITEM__POSITION_HANDLER = require('./handler/item.position-handler')
const ITEM__STORAGE_HANDLER = require('./handler/item.storage-handler')
const ITEM__ACCOUNT_HANDLER = require('./handler/item.account-handler')
const ITEM__FUNDA_HANDLER = require('./handler/item.funda-handler')
const ITEM__GOOD_HANDLER = require('./handler/item.good-handler')
const ITEM__SIGNATURE_HANDLER = require('./handler/item.signature-handler')
const ITEM__DEPARTMENT_DIRECTORY_HANDLER = require('./handler/item.department_directory-handler')
const ITEM__CONFIG_HANDLER = require('./handler/item.config-handler')

/**
 * COLLECTIONS
 */
const ITEM__CONTRACT_COLL = require('./database/item.contract-coll')
const ITEM__DEPARTMENT_COLL = require('./database/item.department-coll')
const ITEM__AREA_COLL = require('./database/item.area-coll')
const ITEM__DOCTYPE_COLL = require('./database/item.doctype-coll')
const ITEM__CONTACT_COLL = require('./database/item.contact-coll')
const ITEM__WAREHOUSE_COLL = require('./database/item.warehouse-coll')
const ITEM__POSITION_COLL = require('./database/item.position-coll')
const ITEM__STORAGE_COLL = require('./database/item.storage-coll')
const ITEM__SIGNATURE_COLL = require('./database/item.signature-coll')
const ITEM__ACCOUNT_COLL = require('./database/item.account-coll')
const ITEM__DEPARTMENT_DIRECTORY_COLL = require('./database/item.department_directory-coll')
const ITEM__CONFIG_COLL = require('./database/item.config-coll')

module.exports = {
  name: CF_DOMAIN_SERVICES.ITEM,
  mixins: [
    DbService(ITEM__CONTRACT_COLL),
    DbService(ITEM__DEPARTMENT_COLL),
    DbService(ITEM__AREA_COLL),
    DbService(ITEM__DOCTYPE_COLL),
    DbService(ITEM__CONTACT_COLL),
    DbService(ITEM__WAREHOUSE_COLL),
    DbService(ITEM__POSITION_COLL),
    DbService(ITEM__STORAGE_COLL),
    DbService(ITEM__SIGNATURE_COLL),
    DbService(ITEM__ACCOUNT_COLL),
    DbService(ITEM__DEPARTMENT_DIRECTORY_COLL),
    DbService(ITEM__CONFIG_COLL),
    CacheCleaner([CF_DOMAIN_SERVICES.ITEM]),
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
    //==========================================  DEPARTMENT  ================================
    [CF_ACTIONS_ITEM.DEPARTMENT_INSERT]: ITEM__DEPARTMENT_HANDLER.insert,
    [CF_ACTIONS_ITEM.DEPARTMENT_UPDATE]: ITEM__DEPARTMENT_HANDLER.update,
    [CF_ACTIONS_ITEM.DEPARTMENT_UPDATE_VALUE]:
      ITEM__DEPARTMENT_HANDLER.updateValue,
    [CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST]:
      ITEM__DEPARTMENT_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST_IS_MEMBERS]:
      ITEM__DEPARTMENT_HANDLER.getListByMembers,
    [CF_ACTIONS_ITEM.DEPARTMENT_ANALYSIS_ONTIME_ON_BUDGET]:
      ITEM__DEPARTMENT_HANDLER.analysisOntimeOnbudget,

    //==========================================  CONTRACT  ==================================
    [CF_ACTIONS_ITEM.CONTRACT_INSERT]: ITEM__CONTRACT_HANDLER.insert,
    [CF_ACTIONS_ITEM.CONTRACT_UPDATE]: ITEM__CONTRACT_HANDLER.update,
    [CF_ACTIONS_ITEM.CONTRACT_UPDATE_VALUE]: ITEM__CONTRACT_HANDLER.updateValue,
    [CF_ACTIONS_ITEM.CONTRACT_GET_INFO_AND_GET_LIST]:
      ITEM__CONTRACT_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_ITEM.CONTRACT_GET_LIST_GUARANTEE]:
      ITEM__CONTRACT_HANDLER.getListGuarantee,
    [CF_ACTIONS_ITEM.CONTRACT_GET_LIST_CONTRACT_IS_MEMBERS]:
      ITEM__CONTRACT_HANDLER.getListIsMembers,
    [CF_ACTIONS_ITEM.CONTRACT_GET_LIST_BY_FILTER]:
      ITEM__CONTRACT_HANDLER.getListByFilter,
    [CF_ACTIONS_ITEM.CONTRACT_GET_AMOUNT_BY_MONTH]:
      ITEM__CONTRACT_HANDLER.getAmountByMonth,
    [CF_ACTIONS_ITEM.CONTRACT_GET_LIST_BY_MONTH]:
      ITEM__CONTRACT_HANDLER.getListByMonth,
    [CF_ACTIONS_ITEM.CONTRACT_GET_AMOUNT_BY_PROPERTY]:
      ITEM__CONTRACT_HANDLER.getAmountByProperty,
    [CF_ACTIONS_ITEM.CONTRACT_GET_RETAIN_PRODUCE]:
      ITEM__CONTRACT_HANDLER.getRetainProduce,
    [CF_ACTIONS_ITEM.CONTRACT_GET_INVENTORY]:
      ITEM__CONTRACT_HANDLER.getInventory,
    [CF_ACTIONS_ITEM.CONTRACT_STATISTICAL_STATUS_BY_ONTIME_ON_BUDGET]:
      ITEM__CONTRACT_HANDLER.statisticalStatusByOntimeOnbudget,
    [CF_ACTIONS_ITEM.CONTRACT_IMPORT_FROM_EXCEL]:
      ITEM__CONTRACT_HANDLER.importFromExcel,
    [CF_ACTIONS_ITEM.CONTRACT_EXPORT]: ITEM__CONTRACT_HANDLER.exportContract,

    //==========================================  DOCTYPE  ===================================
    [CF_ACTIONS_ITEM.DOCTYPE_INSERT]: ITEM__DOCTYPE_HANDLER.insert,
    [CF_ACTIONS_ITEM.DOCTYPE_UPDATE]: ITEM__DOCTYPE_HANDLER.update,
    [CF_ACTIONS_ITEM.DOCTYPE_REMOVE]: ITEM__DOCTYPE_HANDLER.remove,
    [CF_ACTIONS_ITEM.DOCTYPE_GET_INFO_AND_GET_LIST]:
      ITEM__DOCTYPE_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_ITEM.DOCTYPE_IMPORT_FROM_EXCEL]:
      ITEM__DOCTYPE_HANDLER.importFromExcel,

    //==========================================  CONTACT  ===================================
    [CF_ACTIONS_ITEM.CONTACT_INSERT]: ITEM__CONTACT_HANDLER.insert,
    [CF_ACTIONS_ITEM.CONTACT_UPDATE]: ITEM__CONTACT_HANDLER.update,
    [CF_ACTIONS_ITEM.CONTACT_GET_INFO_AND_GET_LIST]:
      ITEM__CONTACT_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_ITEM.CONTACT_GET_LIST_BY_FILTER]:
      ITEM__CONTACT_HANDLER.getListByFilter,
    [CF_ACTIONS_ITEM.CONTACT_GET_LIST_BY_PROPERTY]:
      ITEM__CONTACT_HANDLER.getListByProperty,
    [CF_ACTIONS_ITEM.CONTACT_GET_LIST_OF_SYSTEM]:
      ITEM__CONTACT_HANDLER.getListOfSystem,
    [CF_ACTIONS_ITEM.CONTACT_GET_LIST_ACCESS_BY_CONTRACT]:
      ITEM__CONTACT_HANDLER.getListAccessByContract,
    [CF_ACTIONS_ITEM.CONTACT_DOWNLOAD_TEMPLATE_IMPORT_EXCEL]:
      ITEM__CONTACT_HANDLER.downloadTemplateImportExcel,
    [CF_ACTIONS_ITEM.CONTACT_IMPORT_FROM_EXCEL]:
      ITEM__CONTACT_HANDLER.importFromExcel,
    [CF_ACTIONS_ITEM.CONTACT_EXPORT_EXCEL]: ITEM__CONTACT_HANDLER.exportExcel,
    [CF_ACTIONS_ITEM.CONTACT_EXPORT_EXCEL_BY_FILTER]:
      ITEM__CONTACT_HANDLER.exportExcelByFilter,

    //==========================================  WAREHOUSE  =================================
    [CF_ACTIONS_ITEM.WAREHOUSE_INSERT]: ITEM__WAREHOUSE_HANDLER.insert,
    [CF_ACTIONS_ITEM.WAREHOUSE_UPDATE]: ITEM__WAREHOUSE_HANDLER.update,
    [CF_ACTIONS_ITEM.WAREHOUSE_GET_INFO_AND_GET_LIST]:
      ITEM__WAREHOUSE_HANDLER.getInfoAndGetList,

    //==========================================  AREA  ======================================
    [CF_ACTIONS_ITEM.AREA_INSERT]: ITEM__AREA_HANDLER.insert,
    [CF_ACTIONS_ITEM.AREA_UPDATE]: ITEM__AREA_HANDLER.update,
    [CF_ACTIONS_ITEM.AREA_GET_INFO_AND_GET_LIST]:
      ITEM__AREA_HANDLER.getInfoAndGetList,

    //==========================================  POSITION  ==================================
    [CF_ACTIONS_ITEM.POSITION_INSERT]: ITEM__POSITION_HANDLER.insert,
    [CF_ACTIONS_ITEM.POSITION_UPDATE]: ITEM__POSITION_HANDLER.update,
    [CF_ACTIONS_ITEM.POSITION_GET_INFO_AND_GET_LIST]:
      ITEM__POSITION_HANDLER.getInfoAndGetList,

    //==========================================  STORAGE  ===================================
    [CF_ACTIONS_ITEM.STORAGE_INSERT]: ITEM__STORAGE_HANDLER.insert,
    [CF_ACTIONS_ITEM.STORAGE_UPDATE]: ITEM__STORAGE_HANDLER.update,
    [CF_ACTIONS_ITEM.STORAGE_GET_INFO_AND_GET_LIST]:
      ITEM__STORAGE_HANDLER.getInfoAndGetList,

    //==========================================  ACCOUNT  ===================================
    [CF_ACTIONS_ITEM.ACCOUNT_INSERT]: ITEM__ACCOUNT_HANDLER.insert,
    [CF_ACTIONS_ITEM.ACCOUNT_UPDATE]: ITEM__ACCOUNT_HANDLER.update,
    [CF_ACTIONS_ITEM.ACCOUNT_GET_INFO_AND_GET_LIST]:
      ITEM__ACCOUNT_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_ITEM.ACCOUNT_GET_INFO_WITH_NAME]:
      ITEM__ACCOUNT_HANDLER.getInfoAccountWithName,
    [CF_ACTIONS_ITEM.ACCOUNT_GET_INFO_WITH_ID]:
      ITEM__ACCOUNT_HANDLER.getInfoAccount,
    [CF_ACTIONS_ITEM.ACCOUNT_GET_LIST_NESTED]:
      ITEM__ACCOUNT_HANDLER.getListNestedItem,
    [CF_ACTIONS_ITEM.ACCOUNT_SEARCH_WITH_KEY]:
      ITEM__ACCOUNT_HANDLER.getListWithKey,

    //==========================================  FUNDA  ================================
    [CF_ACTIONS_ITEM.FUNDA_INSERT]: ITEM__FUNDA_HANDLER.insert,
    [CF_ACTIONS_ITEM.FUNDA_UPDATE]: ITEM__FUNDA_HANDLER.update,
    [CF_ACTIONS_ITEM.FUNDA_GET_INFO_AND_GET_LIST]:
      ITEM__FUNDA_HANDLER.getInfoAndGetList,

    //==========================================  GOOD  ======================================
    [CF_ACTIONS_ITEM.GOOD_INSERT]: ITEM__GOOD_HANDLER.insert,
    [CF_ACTIONS_ITEM.GOOD_UPDATE]: ITEM__GOOD_HANDLER.update,
    [CF_ACTIONS_ITEM.GOOD_GET_INFO_AND_GET_LIST]:
      ITEM__GOOD_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_ITEM.GOOD_DOWNLOAD_TEMPLATE_EXCEL]:
      ITEM__GOOD_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_ITEM.GOOD_IMPORT_FROM_EXCEL]:
      ITEM__GOOD_HANDLER.importFromExcel,
    [CF_ACTIONS_ITEM.GOOD_EXPORT_EXCEL]: ITEM__GOOD_HANDLER.exportExcel,

    //==========================================  SIGNATURE  ======================================
    [CF_ACTIONS_ITEM.SIGNATURE_INSERT]: ITEM__SIGNATURE_HANDLER.insert,
    [CF_ACTIONS_ITEM.SIGNATURE_GET_INFO_AND_GET_LIST]:
      ITEM__SIGNATURE_HANDLER.getInfoAndGetList,

    //==========================================  DEPARTMENT DIRECTORY  ======================================
    [CF_ACTIONS_ITEM.DEPARTMENT_DIRECTORY_INSERT]:
      ITEM__DEPARTMENT_DIRECTORY_HANDLER.insert,
    [CF_ACTIONS_ITEM.DEPARTMENT_DIRECTORY_UPDATE]:
      ITEM__DEPARTMENT_DIRECTORY_HANDLER.update,
    [CF_ACTIONS_ITEM.DEPARTMENT_DIRECTORY_GET_INFO_AND_GET_LIST]:
      ITEM__DEPARTMENT_DIRECTORY_HANDLER.getInfoAndGetList,

    //==========================================  CONFIG  ======================================
    [CF_ACTIONS_ITEM.CONFIG_INSERT]: ITEM__CONFIG_HANDLER.insert,
    [CF_ACTIONS_ITEM.CONFIG_UPDATE]: ITEM__CONFIG_HANDLER.update,
    [CF_ACTIONS_ITEM.CONFIG_GET_INFO_AND_GET_LIST]:
      ITEM__CONFIG_HANDLER.getInfoAndGetList,
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
  async started() {
    const initQueueEvents = (queue) => {
      queue.on('error', (err) => {
        console.error({ err })
      })
    }

    const connection = new IORedis({
      host: REDIS_SEPERATOR.HOST,
      port: REDIS_SEPERATOR.PORT,
      ...(isProd() && {
        username: REDIS_SEPERATOR.USR,
        password: REDIS_SEPERATOR.PWD,
      }),
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    })

    const queue = new Queue('export_excel', {
      connection,
    })

    this.metadata = {
      ...this.metadata,
      queue,
    }

    initQueueEvents(queue)
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
}
