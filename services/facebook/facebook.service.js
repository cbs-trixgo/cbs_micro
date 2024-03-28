/**
 * Build-in
 */
const CacheCleaner                  = require("../../tools/mixins/cache.cleaner.mixin");
const DbService                     = require("../../tools/mixins/db.mixin");

/**
 * Constants
 */
const { CF_DOMAIN_SERVICES }        = require("../gateway/helper/domain.constant");
const { CF_ACTIONS_FACEBOOK }       = require('./helper/facebook.actions');

/**
 * Handlers
 */
const FACEBOOK_HANDLER              = require('./handler/facebook.handler');

/**
 * Collections
 */
const FACEBOOK_CONVERSATION_COLL    = require("./database/facebook.conversation-coll");
const FACEBOOK_MESSAGE_COLL         = require("./database/facebook.message-coll");

module.exports = {
    name: CF_DOMAIN_SERVICES.FACEBOOK,
    mixins: [
		DbService(FACEBOOK_CONVERSATION_COLL),
		DbService(FACEBOOK_MESSAGE_COLL),
        CacheCleaner([CF_DOMAIN_SERVICES.FACEBOOK])
    ],
    actions: {
        [CF_ACTIONS_FACEBOOK.FACEBOOK_CALLBACK]             : FACEBOOK_HANDLER.callback,
        [CF_ACTIONS_FACEBOOK.FACEBOOK_SEND_MESSAGE]         : FACEBOOK_HANDLER.sendMessage,
        [CF_ACTIONS_FACEBOOK.FACEBOOK_GET_LONG_LIVED_UAT]   : FACEBOOK_HANDLER.getLongLivedUAT,
        [CF_ACTIONS_FACEBOOK.FACEBOOK_GET_LONG_LIVED_PAT]   : FACEBOOK_HANDLER.getLongLivedPAT,
    },
}