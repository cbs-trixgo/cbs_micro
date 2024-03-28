'use strict'

const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_PERSONAL } = require('./helper/personal.actions-constant')

/**
 * HANDLERS
 */
const FRIEND_REQUEST_HANDLER = require('./handler/personal.friend_request-handler')
const NOTE_HANDLER = require('./handler/personal.note')

/**
 * COLLECTIONS
 */
const FRIEND_REQUEST_COLL = require('./database/personal.friend_request-coll')
const NOTE_COLL = require('./database/personal.note-coll')

module.exports = {
    name: CF_DOMAIN_SERVICES.PERSONAL,
    mixins: [
        DbService(FRIEND_REQUEST_COLL),
        DbService(NOTE_COLL),
        CacheCleaner([CF_DOMAIN_SERVICES.PERSONAL]),
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
        // ==================== FRIEND REQUEST ========================
        [CF_ACTIONS_PERSONAL.FRIEND_REQUEST_GET_CODE]:
            FRIEND_REQUEST_HANDLER.getCode,
        [CF_ACTIONS_PERSONAL.FRIEND_REQUEST_CHECK_CODE]:
            FRIEND_REQUEST_HANDLER.checkCodeFriendRequest,

        // ==================== NOTE ========================
        [CF_ACTIONS_PERSONAL.NOTE_INSERT]: NOTE_HANDLER.insert,
        [CF_ACTIONS_PERSONAL.NOTE_UPDATE]: NOTE_HANDLER.update,
        [CF_ACTIONS_PERSONAL.NOTE_GET_INFO_AND_GET_LIST]:
            NOTE_HANDLER.getInfoAndGetList,
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
