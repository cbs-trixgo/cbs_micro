"use strict";
const DbService                	    		= require("../../tools/mixins/db.mixin");
const CacheCleaner                	    	= require("../../tools/mixins/cache.cleaner.mixin");
const { CF_DOMAIN_SERVICES } 		    	= require('../gateway/helper/domain.constant');
const { CF_ACTIONS_BUDGET } 	        	= require('./helper/budget.actions-constant');

const BUDGET_COLL							= require('./database/budget-coll');
const BUDGET__ITEM_COLL						= require('./database/budget.item-coll.js');
const BUDGET__GROUP_COLL					= require('./database/budget.group-coll.js');
const BUDGET__WORK_COLL						= require('./database/budget.work-coll.js');
const BUDGET__SUBMITTAL_COLL				= require('./database/budget.submittal-coll.js');

const BUDGET__HANDLER   					= require('./handler/budget-handler');
const BUDGET__ITEM_HANDLER   				= require('./handler/budget.item-handler.js');
const BUDGET__GROUP_HANDLER 				= require('./handler/budget.group-handler');
const BUDGET__WORK_HANDLER 					= require('./handler/budget.work-handler');
const BUDGET__SUBMITTAL_HANDLER 			= require('./handler/budget.submittal-handler');

module.exports = {
	name: CF_DOMAIN_SERVICES.BUDGET,
	mixins: [
		DbService(BUDGET_COLL),   
		DbService(BUDGET__ITEM_COLL),   
		DbService(BUDGET__GROUP_COLL),   
		DbService(BUDGET__WORK_COLL),   
		DbService(BUDGET__SUBMITTAL_COLL),   
		CacheCleaner([CF_DOMAIN_SERVICES.BUDGET])
    ],

	/**
	* Service metadata
	*/
	metadata: {

	},
	/**
	* Service dependencies
	*/
	dependencies: [
		CF_DOMAIN_SERVICES.AUTH
	],

	/**
	* Actions
	*/
	actions: {	
		//==========================================   BUDGET   ================================//
		[CF_ACTIONS_BUDGET.BUDGET_INSERT]   			 							: BUDGET__HANDLER.insert,
		[CF_ACTIONS_BUDGET.BUDGET_UPDATE]   			 							: BUDGET__HANDLER.update,
		[CF_ACTIONS_BUDGET.BUDGET_REMOVE]				 							: BUDGET__HANDLER.remove,
		[CF_ACTIONS_BUDGET.BUDGET_GET_INFO_AND_GET_LIST]							: BUDGET__HANDLER.getInfoAndGetList,
		[CF_ACTIONS_BUDGET.BUDGET_UPDATE_VALUE]										: BUDGET__HANDLER.updateValue,
		[CF_ACTIONS_BUDGET.BUDGET_DOWNLOAD_TEMPLATE_EXCEL]				 			: BUDGET__HANDLER.downloadTemplateExcel,
		[CF_ACTIONS_BUDGET.BUDGET_IMPORT_EXCEL]										: BUDGET__HANDLER.importExcel,
		[CF_ACTIONS_BUDGET.BUDGET_EXPORT_EXCEL]										: BUDGET__HANDLER.exportExcel,

		//==========================================   BUDGET ITEM   ================================//
		[CF_ACTIONS_BUDGET.BUDGET_ITEM_INSERT]   			 						: BUDGET__ITEM_HANDLER.insert,
		[CF_ACTIONS_BUDGET.BUDGET_ITEM_UPDATE]   			 						: BUDGET__ITEM_HANDLER.update,
		[CF_ACTIONS_BUDGET.BUDGET_ITEM_REMOVE]				 						: BUDGET__ITEM_HANDLER.remove,
		[CF_ACTIONS_BUDGET.BUDGET_ITEM_GET_INFO_AND_GET_LIST]						: BUDGET__ITEM_HANDLER.getInfoAndGetList,
		[CF_ACTIONS_BUDGET.BUDGET_ITEM_UPDATE_VALUE]								: BUDGET__ITEM_HANDLER.updateValue,

		//==========================================   BUDGET GROUP   ================================//
		[CF_ACTIONS_BUDGET.BUDGET_GROUP_INSERT]   			 						: BUDGET__GROUP_HANDLER.insert,
		[CF_ACTIONS_BUDGET.BUDGET_GROUP_UPDATE]   			 						: BUDGET__GROUP_HANDLER.update,
		[CF_ACTIONS_BUDGET.BUDGET_GROUP_REMOVE]				 						: BUDGET__GROUP_HANDLER.remove,
		[CF_ACTIONS_BUDGET.BUDGET_GROUP_GET_INFO_AND_GET_LIST]						: BUDGET__GROUP_HANDLER.getInfoAndGetList,
		[CF_ACTIONS_BUDGET.BUDGET_GROUP_UPDATE_VALUE]								: BUDGET__GROUP_HANDLER.updateValue,

		//==========================================   BUDGET WORK   ================================//
		[CF_ACTIONS_BUDGET.BUDGET_WORK_INSERT]   			 						: BUDGET__WORK_HANDLER.insert,
		[CF_ACTIONS_BUDGET.BUDGET_WORK_UPDATE]   			 						: BUDGET__WORK_HANDLER.update,
		[CF_ACTIONS_BUDGET.BUDGET_WORK_REMOVE]				 						: BUDGET__WORK_HANDLER.remove,
		[CF_ACTIONS_BUDGET.BUDGET_WORK_GET_INFO_AND_GET_LIST]						: BUDGET__WORK_HANDLER.getInfoAndGetList,
		[CF_ACTIONS_BUDGET.BUDGET_WORK_UPDATE_VALUE]								: BUDGET__WORK_HANDLER.updateValue,
		[CF_ACTIONS_BUDGET.BUDGET_WORK_DOWNLOAD_TEMPLATE_EXCEL]				 		: BUDGET__WORK_HANDLER.downloadTemplateExcel,
		[CF_ACTIONS_BUDGET.BUDGET_WORK_IMPORT_EXCEL]								: BUDGET__WORK_HANDLER.importExcel,
		[CF_ACTIONS_BUDGET.BUDGET_WORK_EXPORT_EXCEL]								: BUDGET__WORK_HANDLER.exportExcel,
		[CF_ACTIONS_BUDGET.BUDGET_WORK_COPY]										: BUDGET__WORK_HANDLER.copy,

		//==========================================   BUDGET_SUBMITTAL   ================================//
		[CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_INSERT]   			 					: BUDGET__SUBMITTAL_HANDLER.insert,
		[CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_UPDATE]   			 					: BUDGET__SUBMITTAL_HANDLER.update,
		[CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_REMOVE]				 					: BUDGET__SUBMITTAL_HANDLER.remove,
		[CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_GET_INFO_AND_GET_LIST]					: BUDGET__SUBMITTAL_HANDLER.getInfoAndGetList,	
		[CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_GET_LIST_BY_PROPERTY]					: BUDGET__SUBMITTAL_HANDLER.getListByProperty,
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
}