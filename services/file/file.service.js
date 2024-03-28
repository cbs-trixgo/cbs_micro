"use strict";
const DbService                	    	= require("../../tools/mixins/db.mixin");
const CacheCleaner                	    = require("../../tools/mixins/cache.cleaner.mixin");
const { CF_DOMAIN_SERVICES } 		    = require('../gateway/helper/domain.constant');
const { CF_ACTIONS_FILE } 	        = require('./helper/file.actions-constant');
const FILE__CORE_HANDLER            = require('./handler/file.core-handler');

module.exports = {
	name: CF_DOMAIN_SERVICES.FILE,
	mixins: [
		DbService('files'),  
		CacheCleaner([CF_DOMAIN_SERVICES.FILE])
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
		[CF_ACTIONS_FILE.INSERT_FILE] 								: FILE__CORE_HANDLER.insert,
		[CF_ACTIONS_FILE.UPDATE_FILE] 								: FILE__CORE_HANDLER.update,
		[CF_ACTIONS_FILE.DELETE_FILE] 								: FILE__CORE_HANDLER.deleteFiles,
		[CF_ACTIONS_FILE.GET_INFO_FILE] 							: FILE__CORE_HANDLER.getInfoFile,
		[CF_ACTIONS_FILE.GET_LIST_FILE_OF_USER_WITH_STATUS] 		: FILE__CORE_HANDLER.getListFileWithStatus,
		[CF_ACTIONS_FILE.GENERATE_LINK_S3] 							: FILE__CORE_HANDLER.generateLinkS3,
		[CF_ACTIONS_FILE.DOWNLOAD_FILE_BY_URL] 						: FILE__CORE_HANDLER.downloadFileByURL,
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
