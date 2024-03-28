/**
 * Build-in
 */
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')
const DbService = require('../../tools/mixins/db.mixin')

/**
 * Constants
 */
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_ZALO } = require('./helper/zalo.actions')

/**
 * Handlers
 */
const ZALO_HANDLER = require('./handler/zalo.handler')

/**
 * Collections
 */
const ZALOOA_FOLLOWER_COLL = require('./database/zalooa.follower-coll')

module.exports = {
    name: CF_DOMAIN_SERVICES.ZALO,
    mixins: [
        DbService(ZALOOA_FOLLOWER_COLL),
        CacheCleaner([CF_DOMAIN_SERVICES.ZALO]),
    ],
    actions: {
        [CF_ACTIONS_ZALO.ZALO_REQUEST_PERMISSION]:
            ZALO_HANDLER.requestZaloOAPermission,
        [CF_ACTIONS_ZALO.ZALO_RENEW_TOKEN]: ZALO_HANDLER.renewAccessToken,
        [CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE]: ZALO_HANDLER.sendMessage,
        [CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS]: ZALO_HANDLER.sendMessageZNS,
        [CF_ACTIONS_ZALO.ZALO_CALLBACK]: ZALO_HANDLER.zaloOACallback,
        [CF_ACTIONS_ZALO.ZALO_WEBHOOK]: ZALO_HANDLER.zaloOAWebhook,
    },
}
