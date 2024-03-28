"use strict";

const DbService                	    		= require("../../tools/mixins/db.mixin");
const CacheCleaner                	    	= require("../../tools/mixins/cache.cleaner.mixin");
const { CF_DOMAIN_SERVICES } 		    	= require('../gateway/helper/domain.constant');
const { CF_ACTIONS_SUBJECT_PCM } 	    	= require('./helper/subject_pcm.actions-constant');

const PCM_PLAN_REPORT_HANDLER  	 			= require('./handler/subject_pcm.pcm_plan_report');
const USER_PCM_PLAN_REPORT_HANDLER  		= require('./handler/subject_pcm.user_pcm_plan_report');
const PCM_PLAN_TASK_HANDLER  			 	= require('./handler/subject_pcm.pcm_plan_task');
const PCM_PLAN_GROUP_HANDLER  			 	= require('./handler/subject_pcm.pcm_plan_group');
const PCM_COMMENT_HANDLER  				   	= require('./handler/subject_pcm.pcm_comment');
const PCM_COMMENT_REACTION_HANDLER		   	= require('./handler/subject_pcm.pcm_comment_reaction');
const PCM_FILE_HANDLER  				   	= require('./handler/subject_pcm.pcm_file');

module.exports = {
	name: CF_DOMAIN_SERVICES.SUBJECT_PCM,
	mixins: [
		DbService('pcm_plan_reports'),
		DbService('pcm_plan_tasks'),
		DbService('pcm_plan_groups'),
		DbService('pcm_comments'),
		DbService('pcm_files'),
		DbService('pcm_comment_reactions'),
		CacheCleaner([CF_DOMAIN_SERVICES.SUBJECT_PCM])
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
		//==========================================  SUBJECT REPORT ACTIONS  ====================================
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_INSERT]   						: PCM_PLAN_REPORT_HANDLER.insert,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_UPDATE]   						: PCM_PLAN_REPORT_HANDLER.update,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_REMOVE]   						: PCM_PLAN_REPORT_HANDLER.remove,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_GET_INFO_AND_GET_LIST]			: PCM_PLAN_REPORT_HANDLER.getInfoAndGetList,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_EXPORT_TASK_REPORT]				: PCM_PLAN_REPORT_HANDLER.exportTaskReport,

		//========================================== USER SUBJECT REPORT ACTIONS ================================
		[CF_ACTIONS_SUBJECT_PCM.USER_PCM_PLAN_REPORT_INSERT]   					: USER_PCM_PLAN_REPORT_HANDLER.insert,
		[CF_ACTIONS_SUBJECT_PCM.USER_PCM_PLAN_REPORT_UPDATE]   					: USER_PCM_PLAN_REPORT_HANDLER.update,
		[CF_ACTIONS_SUBJECT_PCM.USER_PCM_PLAN_REPORT_REMOVE]   					: USER_PCM_PLAN_REPORT_HANDLER.remove,
		[CF_ACTIONS_SUBJECT_PCM.USER_PCM_PLAN_REPORT_GET_INFO_AND_GET_LIST]		: USER_PCM_PLAN_REPORT_HANDLER.getInfoAndGetList,

		//========================================== PCM_PLAN_TASK ==============================================
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_INSERT]							: PCM_PLAN_TASK_HANDLER.insert,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_UPDATE]							: PCM_PLAN_TASK_HANDLER.update,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_UPDATE_STATUS_MUTIPLE]			: PCM_PLAN_TASK_HANDLER.updateStatusMutiple,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_INFO_AND_GET_LIST]			: PCM_PLAN_TASK_HANDLER.getInfoAndGetList,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_LIST_BY_FILTER]				: PCM_PLAN_TASK_HANDLER.getListByFilter,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_AMOUNT_NOTIFICATION]			: PCM_PLAN_TASK_HANDLER.getAmountNotification,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_DYNAMIC_REPORT]				: PCM_PLAN_TASK_HANDLER.getDynamicReport,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_AMOUNT]						: PCM_PLAN_TASK_HANDLER.getAmountTask,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_BADGE_BIDDING]				: PCM_PLAN_TASK_HANDLER.getBadgeBidding,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_SEND_EMAIL_TO_MEMBER_IN_TASK]		: PCM_PLAN_TASK_HANDLER.sendEmailToMembersInTask,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_TASK_OF_COMPANY_OF_ASSIGNEE]  : PCM_PLAN_TASK_HANDLER.getAmountTaskOfCompanyOfAssignee,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_TASK_OF_COMPANY_OF_AUTHOR]	: PCM_PLAN_TASK_HANDLER.getAmountTaskOfCompanyOfAuthor,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_TASK_OF_MILESTONE]  			: PCM_PLAN_TASK_HANDLER.getAmountTaskOfMilestone,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_PROJECT]  		: PCM_PLAN_TASK_HANDLER.getAmountTaskByProjects,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_MOVE_TASK_TO_PARENT]  			: PCM_PLAN_TASK_HANDLER.moveTaskToParent,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_MOVE_TASK_TO_GROUP]  				: PCM_PLAN_TASK_HANDLER.moveTaskToGroup,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COPY_TASK]  						: PCM_PLAN_TASK_HANDLER.copyTask,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_LIST_BY_PROPERTY]				: PCM_PLAN_TASK_HANDLER.getListByProperty,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_DOWNLOAD_EXCEL]  					: PCM_PLAN_TASK_HANDLER.downloadExcelTask,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_DOWNLOAD_TEMPLATE_IMPORT_EXCEL]   : PCM_PLAN_TASK_HANDLER.downloadTemplateImportExcel,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_IMPORT_TASK_FROM_EXCEL]   		: PCM_PLAN_TASK_HANDLER.importTaskFromExcel,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_REPAIR_DATA]   					: PCM_PLAN_TASK_HANDLER.repairData,

		//========================================== PCM_PLAN_GROUP ==============================================
		[CF_ACTIONS_SUBJECT_PCM.GROUP_INSERT]									: PCM_PLAN_GROUP_HANDLER.insert,
		[CF_ACTIONS_SUBJECT_PCM.GROUP_UPDATE]									: PCM_PLAN_GROUP_HANDLER.update,
		[CF_ACTIONS_SUBJECT_PCM.GROUP_REMOVE]									: PCM_PLAN_GROUP_HANDLER.remove,
		[CF_ACTIONS_SUBJECT_PCM.GROUP_REMOVE_MANY]								: PCM_PLAN_GROUP_HANDLER.removeMany,
		[CF_ACTIONS_SUBJECT_PCM.GROUP_GET_INFO_AND_GET_LIST]					: PCM_PLAN_GROUP_HANDLER.getInfoAndGetList,
		[CF_ACTIONS_SUBJECT_PCM.GROUP_DOWNLOAD_TEMPLATE_EXCEL]   				: PCM_PLAN_GROUP_HANDLER.downloadTemplateExcel,
		[CF_ACTIONS_SUBJECT_PCM.GROUP_IMPORT_FROM_EXCEL]   						: PCM_PLAN_GROUP_HANDLER.importFromExcel,
		[CF_ACTIONS_SUBJECT_PCM.GROUP_EXPORT_EXCEL]   							: PCM_PLAN_GROUP_HANDLER.exportExcel,

		//========================================== PCM_PLAN_TASK_COMMENT   =======================================
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_INSERT]					: PCM_COMMENT_HANDLER.insert,//
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_UPDATE]					: PCM_COMMENT_HANDLER.update,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_UPDATE_MARK]				: PCM_COMMENT_HANDLER.updateMarkResponse,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_REMOVE]					: PCM_COMMENT_HANDLER.delete,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_GET_INFO_AND_GET_LIST]	: PCM_COMMENT_HANDLER.getInfoAndGetList,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_SEARCH_BY_ID]				: PCM_COMMENT_HANDLER.searchCommentById,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_SEARCH_BY_SUBJECT]		: PCM_COMMENT_HANDLER.searchCommentBySubject,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_GET_LIST_BY_PROPERTY]		: PCM_COMMENT_HANDLER.getListByProperty,

		//========================================== PCM_PLAN_TASK_COMMENT REACTION =======================================
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_REACTION]					: PCM_COMMENT_REACTION_HANDLER.reaction,
		[CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_REACTION_GET_LIST]		: PCM_COMMENT_REACTION_HANDLER.getListReaction,

		//========================================== PCM_FILE =======================================
		[CF_ACTIONS_SUBJECT_PCM.PCM_FILE_GET_INFO_AND_GET_LIST]					: PCM_FILE_HANDLER.getInfoAndGetList,
		[CF_ACTIONS_SUBJECT_PCM.PCM_FILE_GET_LIST_BY_FILTER]					: PCM_FILE_HANDLER.getListByFilter,
		[CF_ACTIONS_SUBJECT_PCM.PCM_FILE_GROUP_BY_DATE]							: PCM_FILE_HANDLER.getListFilesGroupByDate,
		[CF_ACTIONS_SUBJECT_PCM.PCM_FILE_GROUP_BY_CONTRACT]						: PCM_FILE_HANDLER.getListFilesGroupByContract,
		[CF_ACTIONS_SUBJECT_PCM.PCM_FILES_DOWNLOAD]								: PCM_FILE_HANDLER.downloadFiles,
		[CF_ACTIONS_SUBJECT_PCM.PCM_FILES_DOWNLOAD_IN_GROUP]					: PCM_FILE_HANDLER.downloadFilesInGroup,
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