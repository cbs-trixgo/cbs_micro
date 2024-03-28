'use strict'
const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_EXAMPLE } = require('./helper/example.actions-constant')
const EXAMPLE__CASE1_HANLDER = require('./handler/example.case1-hanlder')

module.exports = {
    name: CF_DOMAIN_SERVICES.EXAMPLE,
    mixins: [
        DbService('example_case1'),
        CacheCleaner([CF_DOMAIN_SERVICES.EXAMPLE]),
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
        [CF_ACTIONS_EXAMPLE.CASE_1_GET_LIST]: EXAMPLE__CASE1_HANLDER.getList,
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
