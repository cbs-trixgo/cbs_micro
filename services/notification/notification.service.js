'use strict'

const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const {
  CF_ACTIONS_NOTIFICATION,
} = require('./helper/notification.actions-constant')
const {
  LIST_EVENTS_SUBSCRIBE,
} = require('./helper/notification.events-constant')
const NOTIFICATION_LOG_HANDLER = require('./handler/notification.log-handler')
const NOTIFICATION_LOG_COLL = require('./database/notification.log-coll')

module.exports = {
  name: CF_DOMAIN_SERVICES.NOTIFICATION,
  mixins: [
    DbService(NOTIFICATION_LOG_COLL),
    CacheCleaner([CF_DOMAIN_SERVICES.NOTIFICATION]),
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
    [CF_ACTIONS_NOTIFICATION.INSERT_NOTIFICATION]:
      NOTIFICATION_LOG_HANDLER.insert,
    [CF_ACTIONS_NOTIFICATION.UPDATE_NOTIFICATION]:
      NOTIFICATION_LOG_HANDLER.update,
    [CF_ACTIONS_NOTIFICATION.MARK_ALL_READ_NOTIFICATION]:
      NOTIFICATION_LOG_HANDLER.markAllRead,
    [CF_ACTIONS_NOTIFICATION.GET_INFO_AND_GET_LIST_NOTIFICATION]:
      NOTIFICATION_LOG_HANDLER.getInfoAndGetList,
  },

  /**
   * Events
   */
  events: {
    ...LIST_EVENTS_SUBSCRIBE,
  },

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
