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
const {
  CF_ACTIONS_ACCOUNTING,
} = require('./helper/accounting.actions-constant')

/**
 * HANDLERS
 */
const ACCOUNTING__FINANCIAL_VOUCHER_HANDLER = require('./handler/accounting.financial_voucher-handler')
const ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER = require('./handler/accounting.financial_general_journal-handler')

/**
 * COLLECTIONS
 */
const ACCOUNTING__FINANCIAL_VOUCHER_COLL = require('./database/accounting.financial_voucher-coll')
const ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_COLL = require('./database/accounting.financial_general_journal-coll')

module.exports = {
  name: CF_DOMAIN_SERVICES.ACCOUNTING,
  mixins: [
    DbService(ACCOUNTING__FINANCIAL_VOUCHER_COLL),
    DbService(ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_COLL),
    CacheCleaner([CF_DOMAIN_SERVICES.ACCOUNTING]),
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
    //==========================================  VOUCHER  ==================================
    [CF_ACTIONS_ACCOUNTING.VOUCHER_INSERT]:
      ACCOUNTING__FINANCIAL_VOUCHER_HANDLER.insert,
    [CF_ACTIONS_ACCOUNTING.VOUCHER_UPDATE]:
      ACCOUNTING__FINANCIAL_VOUCHER_HANDLER.update,
    [CF_ACTIONS_ACCOUNTING.VOUCHER_REMOVE]:
      ACCOUNTING__FINANCIAL_VOUCHER_HANDLER.remove,
    [CF_ACTIONS_ACCOUNTING.VOUCHER_GET_INFO_AND_GET_LIST]:
      ACCOUNTING__FINANCIAL_VOUCHER_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_ACCOUNTING.VOUCHER_UPDATE_TO_JOURNAL]:
      ACCOUNTING__FINANCIAL_VOUCHER_HANDLER.updateFromVoucherToJournal,
    [CF_ACTIONS_ACCOUNTING.VOUCHER_UPDATE_TO_VOUCHER]:
      ACCOUNTING__FINANCIAL_VOUCHER_HANDLER.updateFromJournalToVoucher,
    [CF_ACTIONS_ACCOUNTING.VOUCHER_CONVERT]:
      ACCOUNTING__FINANCIAL_VOUCHER_HANDLER.convertVoucher,

    //========================================== JOURNAL  ==================================
    [CF_ACTIONS_ACCOUNTING.JOURNAL_INSERT]:
      ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER.insert,
    [CF_ACTIONS_ACCOUNTING.JOURNAL_UPDATE]:
      ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER.update,
    [CF_ACTIONS_ACCOUNTING.JOURNAL_REMOVE]:
      ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER.remove,
    [CF_ACTIONS_ACCOUNTING.JOURNAL_GET_INFO_AND_GET_LIST]:
      ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_ACCOUNTING.JOURNAL_CAL_IMPLE_BUDGET]:
      ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER.calImpleBudget,
    [CF_ACTIONS_ACCOUNTING.JOURNAL_GET_ACCOUNT_BALANCE]:
      ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER.getAccountBalance,
    [CF_ACTIONS_ACCOUNTING.JOURNAL_GET_LIST_BY_PROPERTY]:
      ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER.getListByProperty,
    [CF_ACTIONS_ACCOUNTING.JOURNAL_EXPORT_EXCEL]:
      ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER.exportExcel,
    [CF_ACTIONS_ACCOUNTING.JOURNAL_ANALYSE_PRIME_COST]:
      ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_HANDLER.analysePrimeCostOfAllVouchers,
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

    const queue = new Queue('price_analyze', {
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
