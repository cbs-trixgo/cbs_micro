"use strict";
const DbService                	    	= require("../../tools/mixins/db.mixin");
const CacheCleaner                	    = require("../../tools/mixins/cache.cleaner.mixin");
const { CF_DOMAIN_SERVICES } 		    = require('../gateway/helper/domain.constant');
const { CF_ACTIONS_TRAINING } 	        	= require('./helper/training.actions-constant');

const TRAINING__SUBJECT_HANDLER   = require('./handler/training.subject-hanlder');
const TRAINING__SUBJECT_COLL		= require('./database/training.subject-coll');

const TRAINING__SUBJECT_RATING_HANDLER   = require('./handler/training.subject_rating-hanlder');
const TRAINING__SUBJECT_RATING_COLL		 = require('./database/training.subject_rating-coll');

module.exports = {
	name: CF_DOMAIN_SERVICES.TRAINING,
	mixins: [
		// gọi tất cả các function dùng ở đây
		DbService(TRAINING__SUBJECT_COLL),  
		DbService(TRAINING__SUBJECT_RATING_COLL),  
		CacheCleaner([CF_DOMAIN_SERVICES.TRAINING])
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
		[CF_ACTIONS_TRAINING.TRAINING__SUBJECT_INSERT]   				: TRAINING__SUBJECT_HANDLER.insert,
		[CF_ACTIONS_TRAINING.TRAINING__SUBJECT_UPDATE]   				: TRAINING__SUBJECT_HANDLER.update,
		[CF_ACTIONS_TRAINING.TRAINING__SUBJECT_REMOVE]   				: TRAINING__SUBJECT_HANDLER.remove,
		[CF_ACTIONS_TRAINING.TRAINING__SUBJECT_GET_INFO_AND_GET_LIST]   : TRAINING__SUBJECT_HANDLER.getInfoAndGetList,

		//==========================================   TRAINING SUBJECT RATING ACTIONS   ================================
		[CF_ACTIONS_TRAINING.TRAINING__SUBJECT_RATING_INSERT]   		: TRAINING__SUBJECT_RATING_HANDLER.insert,
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
