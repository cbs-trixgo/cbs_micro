"use strict";

const DbService                	    	= require("../../tools/mixins/db.mixin");
const CacheCleaner                	    = require("../../tools/mixins/cache.cleaner.mixin");

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } 		    = require('../gateway/helper/domain.constant');
const { CF_ACTIONS_MEDIA } 	            = require('./helper/media.actions-constant');

/**
 * HANDLERS
 */
const MEDIA_HANDLER    					= require('./handler/media-handler');
const MEDIA__FILE_HANDLER    			= require('./handler/media.file-handler');
const MEDIA__COMMENT_HANDLER    		= require('./handler/media.comment-handler');
const MEDIA__REACTION_HANDLER    		= require('./handler/media.reaction-handler');
const MEDIA__REACTION_COMMENT_HANDLER	= require('./handler/media.reaction_comment-handler');

module.exports = {
	name: CF_DOMAIN_SERVICES.MEDIA,
	mixins: [
		DbService('media'),
		DbService('media_file'),  
		DbService('media_reaction'),  
		DbService('media_reaction_file'),  
		DbService('media_reaction_file'),  
		DbService('media_reaction_comment'),
		DbService('media_comment'),  
		CacheCleaner([CF_DOMAIN_SERVICES.MEDIA])
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

		// ================================  MEDIA  ================================

		// THÊM BÀI VIẾT MỚI
		[CF_ACTIONS_MEDIA.INSERT_MEDIA] 		            			: MEDIA_HANDLER.insertMedia,

		// CHỈNH SỬA BÀI VIẾT
		[CF_ACTIONS_MEDIA.UPDATE_MEDIA] 		            			: MEDIA_HANDLER.updateMedia,

		// XÓA BÀI VIẾT	
		[CF_ACTIONS_MEDIA.DELETE_MEDIA] 		            			: MEDIA_HANDLER.deleteMedia,

		// CHI TIẾT BÀI VIẾT	
		[CF_ACTIONS_MEDIA.INFO_MEDIA] 		            				: MEDIA_HANDLER.getInfoMedia,

		// LẤY DANH SÁCH BÀI VIẾT 	
		[CF_ACTIONS_MEDIA.LIST_MEDIA] 		            			    : MEDIA_HANDLER.getListMedia,

		// CẬP NHẬT LƯỢT XEM BÀI VIẾT
		[CF_ACTIONS_MEDIA.UPDATE_VIEW_MEDIA] 		            		: MEDIA_HANDLER.updateView,

		// LẤY DANH SÁCH NGƯỜI XEM BÀI VIẾT 	
		[CF_ACTIONS_MEDIA.LIST_SEEN_MEDIA] 		            			: MEDIA_HANDLER.getListUsersSeen,

		// LƯU BÀI VIẾT
		[CF_ACTIONS_MEDIA.SAVE_MEDIA] 		            				: MEDIA_HANDLER.saveMedia,
		
		// LẤY DANH SÁCH BÀI VIẾT ĐÃ LƯU
		[CF_ACTIONS_MEDIA.LIST_SAVE_MEDIA] 		            			: MEDIA_HANDLER.getListSaveMedia,
		
		// GHIM BÀI VIẾT
		[CF_ACTIONS_MEDIA.PIN_MEDIA] 		            				: MEDIA_HANDLER.pinMedia,

		// LẤY DANH SÁCH BÀI VIẾT ĐÃ PIN
		[CF_ACTIONS_MEDIA.LIST_PIN_MEDIA] 		            			: MEDIA_HANDLER.getListPinMedia,

		// ================================  MEDIA FILE  ================================
		[CF_ACTIONS_MEDIA.GET_INFO_AND_GET_LIST_MEMDIA_FILE]			: MEDIA__FILE_HANDLER.getInfoAndGetListMediaFile,


		// ================================  MEDIA COMMENT  ================================

		[CF_ACTIONS_MEDIA.INSERT_COMMENT_MEDIA]   						: MEDIA__COMMENT_HANDLER.insert,
		[CF_ACTIONS_MEDIA.UPDATE_COMMENT_MEDIA]            				: MEDIA__COMMENT_HANDLER.update,
		[CF_ACTIONS_MEDIA.DELETE_COMMENT_MEDIA]            				: MEDIA__COMMENT_HANDLER.delete,
		[CF_ACTIONS_MEDIA.GET_INFO_AND_GET_LIST_COMMENT_MEDIA]			: MEDIA__COMMENT_HANDLER.getInfoAndGetList,

		[CF_ACTIONS_MEDIA.INSERT_COMMENT_FILE]   						: MEDIA__COMMENT_HANDLER.insertCommentFile,
		[CF_ACTIONS_MEDIA.UPDATE_COMMENT_FILE]            				: MEDIA__COMMENT_HANDLER.updateCommentFile,
		[CF_ACTIONS_MEDIA.DELETE_COMMENT_FILE]            				: MEDIA__COMMENT_HANDLER.deleteCommentFile,
		[CF_ACTIONS_MEDIA.GET_INFO_AND_GET_LIST_COMMENT_FILE]			: MEDIA__COMMENT_HANDLER.getInfoAndGetListCommentFile,

		// ================================  MEDIA REACTION  ================================

		[CF_ACTIONS_MEDIA.REACTION_MEDIA] 		            			: MEDIA__REACTION_HANDLER.reaction,
		[CF_ACTIONS_MEDIA.GET_LIST_REACTION_MEDIA]						: MEDIA__REACTION_HANDLER.getListReaction,

		[CF_ACTIONS_MEDIA.REACTION_FILE]            					: MEDIA__REACTION_HANDLER.reactionFile,
		[CF_ACTIONS_MEDIA.GET_LIST_REACTION_FILE]   					: MEDIA__REACTION_HANDLER.getListReactionFile,

		[CF_ACTIONS_MEDIA.REACTION_COMMENT_MEDIA] 		            	: MEDIA__REACTION_COMMENT_HANDLER.reactionCommentMedia,
		[CF_ACTIONS_MEDIA.REACTION_COMMENT_FILE] 		            	: MEDIA__REACTION_COMMENT_HANDLER.reactionCommentFile,
		[CF_ACTIONS_MEDIA.GET_LIST_REACTION_COMMENT]					: MEDIA__REACTION_COMMENT_HANDLER.getListReactionComment,
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
