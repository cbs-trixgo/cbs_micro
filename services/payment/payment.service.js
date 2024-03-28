"use strict";
const DbService                	    	= require("../../tools/mixins/db.mixin");
const CacheCleaner                	    = require("../../tools/mixins/cache.cleaner.mixin");
const { CF_DOMAIN_SERVICES } 		    = require('../gateway/helper/domain.constant');
const { CF_ACTIONS_PAYMENT } 	        = require('./helper/payment.actions-constant');
const PAYMENT__TRANSACTION_HANLDER      = require('./handler/payment.transaction-hanlder');

module.exports = {
	name: CF_DOMAIN_SERVICES.PAYMENT,
	mixins: [
		DbService('payment_transactions'),  
		CacheCleaner([CF_DOMAIN_SERVICES.PAYMENT])
    ],
	/**
	* Service settings
	*/
	/**
	 * * Dữ liệu 1 - 1 => Populate 
	 * * Dữ liệu 1 - N hoặc N-N -> cần phải tách API (cần phải tách ra 1 bảng riêng, thay vì lưu [objectID])
	 */
	// settings: {
	// 	fields: ["_id", "name", "products"],
	// 	populates : {
	// 		"products": {
	// 			action: "products.get",
	// 			params: ["name"]
	// 		}
	// 	},
	// 	entityValidator: {
	// 		name: { type: "string"}
	// 	}
	// },

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
		[CF_ACTIONS_PAYMENT.GET_LIST_TRANSACTION					] 		: PAYMENT__TRANSACTION_HANLDER.getListTransactions,
		[CF_ACTIONS_PAYMENT.GET_LIST_TRANSACTION_BY_USER_WITH_STATUS] 		: PAYMENT__TRANSACTION_HANLDER.getListTransactionsByUserWithStatus,
		[CF_ACTIONS_PAYMENT.CREATE_URL_PAYMENT] 		                    : PAYMENT__TRANSACTION_HANLDER.createURLPayment,
		[CF_ACTIONS_PAYMENT.URL_RETURN_PAYMENT] 		                    : PAYMENT__TRANSACTION_HANLDER.URL_RETURN,
		[CF_ACTIONS_PAYMENT.UPDATE_STATUS] 		                            : PAYMENT__TRANSACTION_HANLDER.updateStatusTransaction,
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
