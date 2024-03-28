"use strict";
const DbService                	    	= require("../../tools/mixins/db.mixin");
const CacheCleaner                	    = require("../../tools/mixins/cache.cleaner.mixin");
const { CF_DOMAIN_SERVICES } 		    = require('../gateway/helper/domain.constant');
const { CF_ACTIONS_OPERATION } 	       	= require('./helper/operation.actions-constant');

const OPERATION__UTILITY_HANDLER  	= require('./handler/operation.utility-hanlder');
const OPERATION__UTILITY_COLL		= require('./database/operation.utility-coll');

module.exports = {
	name: CF_DOMAIN_SERVICES.OPERATION,
	mixins: [
		// gọi tất cả các function dùng ở đây
		DbService(OPERATION__UTILITY_COLL),  
		CacheCleaner([CF_DOMAIN_SERVICES.OPERATION])
    ],

	/**
	* Service metadata
	*/
	metadata: {

	},

	/**
	* Service dependencies
	*/
	dependencies: [],

	/**
	* Actions
	*/
	actions: {	
		//==========================================   TRAINING SUBJECT ACTIONS   ================================
		[CF_ACTIONS_OPERATION.UTILITY_INSERT]   				: OPERATION__UTILITY_HANDLER.insert,
		[CF_ACTIONS_OPERATION.UTILITY_UPDATE]   				: OPERATION__UTILITY_HANDLER.update,
		[CF_ACTIONS_OPERATION.UTILITY_REMOVE]   				: OPERATION__UTILITY_HANDLER.remove,
		[CF_ACTIONS_OPERATION.UTILITY_GET_INFO_AND_GET_LIST]   	: OPERATION__UTILITY_HANDLER.getInfoAndGetList,
	},
	
	/**
	* Events
	*/
	events: {
	},

	/**
	* Methods
	*/
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	*/
	created() {

	},

	/**
	* Service started lifecycle event handler
	*/
	async started() {

	},

	/**
	* Service stopped lifecycle event handler
	*/
	async stopped() {

	}
};
