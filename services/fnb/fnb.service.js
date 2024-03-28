'use strict'

const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_FNB } = require('./helper/fnb.actions-constant')

const FNB__ORDER_HANDLER = require('./handler/fnb.order-handler')
const FNB__PRODUCT_HANDLER = require('./handler/fnb.product-handler')
const FNB__ORDER_PRODUCT_HANDLER = require('./handler/fnb.order_product-handler')
const FNB__ORDER_GOODS_HANDLER = require('./handler/fnb.order_goods-handler')
const FNB__SHIFT_HANDLER = require('./handler/fnb.shift-handler')
const FNB__MISTAKE_HANDLER = require('./handler/fnb.mistake-handler')
const FNB__VOUCHER_HANDLER = require('./handler/fnb.voucher-handler')
const FNB__CUSTOMER_CARE_HANDLER = require('./handler/fnb.customer_care-handler')
const FNB__NETWORK_COM_HANDLER = require('./handler/fnb.network_com-handler')
const FNB__CUSTOMER_BOOKING_HANDLER = require('./handler/fnb.customer_booking-handler')
const FNB__AFFILIATE_SIGNUP_HANDLER = require('./handler/fnb.affiliate_signup-handler')

const FNB__ORDER_COLL = require('./database/fnb.order-coll')
const FNB__PRODUCT_COLL = require('./database/fnb.product-coll')
const FNB__ORDER_PRODUCT_COLL = require('./database/fnb.order_product-coll')
const FNB__ORDER_GOODS_COLL = require('./database/fnb.order_goods-coll')
const FNB__SHIFT_COLL = require('./database/fnb.shift-coll')
const FNB__MISTAKE_COLL = require('./database/fnb.mistake-coll')
const FNB__VOUCHER_COLL = require('./database/fnb.voucher-coll')
const FNB__CUSTOMER_CARE_COLL = require('./database/fnb.customer_care-coll')
const FNB__NETWORK_COM_COLL = require('./database/fnb.network_com-coll')
const FNB__CUSTOMER_BOOKING_COLL = require('./database/fnb.customer_booking-coll')
const FNB__AFFILIATE_SIGNUP_COLL = require('./database/fnb.affiliate_signup-coll')

module.exports = {
  name: CF_DOMAIN_SERVICES.FNB,
  mixins: [
    DbService(FNB__ORDER_COLL),
    DbService(FNB__PRODUCT_COLL),
    DbService(FNB__ORDER_PRODUCT_COLL),
    DbService(FNB__ORDER_GOODS_COLL),
    DbService(FNB__SHIFT_COLL),
    DbService(FNB__MISTAKE_COLL),
    DbService(FNB__VOUCHER_COLL),
    DbService(FNB__CUSTOMER_CARE_COLL),
    DbService(FNB__NETWORK_COM_COLL),
    DbService(FNB__CUSTOMER_BOOKING_COLL),
    DbService(FNB__AFFILIATE_SIGNUP_COLL),
    CacheCleaner([CF_DOMAIN_SERVICES.FNB]),
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
    //========================================== FNB_ORDER ==============================================//
    [CF_ACTIONS_FNB.ORDER_INSERT]: FNB__ORDER_HANDLER.insert,
    [CF_ACTIONS_FNB.ORDER_UPDATE]: FNB__ORDER_HANDLER.update,
    [CF_ACTIONS_FNB.ORDER_REMOVE]: FNB__ORDER_HANDLER.remove,
    [CF_ACTIONS_FNB.ORDER_GET_INFO_AND_GET_LIST]:
      FNB__ORDER_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.ORDER_GET_LIST_BY_PROPERTY]:
      FNB__ORDER_HANDLER.getListByProperty,
    [CF_ACTIONS_FNB.ORDER_UPDATE_VALUE]: FNB__ORDER_HANDLER.updateValue,
    [CF_ACTIONS_FNB.ORDER_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__ORDER_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.ORDER_IMPORT_FROM_EXCEL]:
      FNB__ORDER_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.ORDER_EXPORT_EXCEL]: FNB__ORDER_HANDLER.exportExcel,
    [CF_ACTIONS_FNB.ORDER_EXPORT_EXCEL2]: FNB__ORDER_HANDLER.exportExcel2,
    [CF_ACTIONS_FNB.ORDER_EXPORT_EXCEL3]: FNB__ORDER_HANDLER.exportExcel3,
    [CF_ACTIONS_FNB.ORDER_RESET_ALL_DATA]: FNB__ORDER_HANDLER.resetAllData,
    [CF_ACTIONS_FNB.ORDER_CONVERT_ALL_DATA]: FNB__ORDER_HANDLER.convertAllData,

    //========================================== FNB_PRODUCT ==============================================//
    [CF_ACTIONS_FNB.PRODUCT_INSERT]: FNB__PRODUCT_HANDLER.insert,
    [CF_ACTIONS_FNB.PRODUCT_UPDATE]: FNB__PRODUCT_HANDLER.update,
    [CF_ACTIONS_FNB.PRODUCT_REMOVE]: FNB__PRODUCT_HANDLER.remove,
    [CF_ACTIONS_FNB.PRODUCT_GET_INFO_AND_GET_LIST]:
      FNB__PRODUCT_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.PRODUCT_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__PRODUCT_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.PRODUCT_IMPORT_FROM_EXCEL]:
      FNB__PRODUCT_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.PRODUCT_EXPORT_EXCEL]: FNB__PRODUCT_HANDLER.exportExcel,

    //========================================== FNB_ORDER_PRODUCT ==============================================//
    [CF_ACTIONS_FNB.ORDER_PRODUCT_INSERT]: FNB__ORDER_PRODUCT_HANDLER.insert,
    [CF_ACTIONS_FNB.ORDER_PRODUCT_UPDATE]: FNB__ORDER_PRODUCT_HANDLER.update,
    [CF_ACTIONS_FNB.ORDER_PRODUCT_REMOVE]: FNB__ORDER_PRODUCT_HANDLER.remove,
    [CF_ACTIONS_FNB.ORDER_PRODUCT_GET_INFO_AND_GET_LIST]:
      FNB__ORDER_PRODUCT_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.ORDER_PRODUCT_GET_LIST_BY_PROPERTY]:
      FNB__ORDER_PRODUCT_HANDLER.getListByProperty,
    [CF_ACTIONS_FNB.ORDER_PRODUCT_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__ORDER_PRODUCT_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.ORDER_PRODUCT_IMPORT_FROM_EXCEL]:
      FNB__ORDER_PRODUCT_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.ORDER_PRODUCT_EXPORT_EXCEL]:
      FNB__ORDER_PRODUCT_HANDLER.exportExcel,

    //========================================== FNB_SHIFT ==============================================//
    [CF_ACTIONS_FNB.SHIFT_INSERT]: FNB__SHIFT_HANDLER.insert,
    [CF_ACTIONS_FNB.SHIFT_UPDATE]: FNB__SHIFT_HANDLER.update,
    [CF_ACTIONS_FNB.SHIFT_UPDATE_SALARY]: FNB__SHIFT_HANDLER.updateSalary,
    [CF_ACTIONS_FNB.SHIFT_REMOVE]: FNB__SHIFT_HANDLER.remove,
    [CF_ACTIONS_FNB.SHIFT_GET_INFO_AND_GET_LIST]:
      FNB__SHIFT_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.SHIFT_GET_LIST_BY_PROPERTY]:
      FNB__SHIFT_HANDLER.getListByProperty,
    [CF_ACTIONS_FNB.SHIFT_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__SHIFT_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.SHIFT_IMPORT_FROM_EXCEL]:
      FNB__SHIFT_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.SHIFT_EXPORT_EXCEL]: FNB__SHIFT_HANDLER.exportExcel,
    [CF_ACTIONS_FNB.SHIFT_EXPORT_EXCEL2]: FNB__SHIFT_HANDLER.exportExcel2,

    //========================================== FNB_MISTAKE ==============================================//
    [CF_ACTIONS_FNB.MISTAKE_INSERT]: FNB__MISTAKE_HANDLER.insert,
    [CF_ACTIONS_FNB.MISTAKE_UPDATE]: FNB__MISTAKE_HANDLER.update,
    [CF_ACTIONS_FNB.MISTAKE_UPDATE_KPI]: FNB__MISTAKE_HANDLER.updateKpi,
    [CF_ACTIONS_FNB.MISTAKE_REMOVE]: FNB__MISTAKE_HANDLER.remove,
    [CF_ACTIONS_FNB.MISTAKE_GET_INFO_AND_GET_LIST]:
      FNB__MISTAKE_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.MISTAKE_GET_LIST_BY_PROPERTY]:
      FNB__MISTAKE_HANDLER.getListByProperty,
    [CF_ACTIONS_FNB.MISTAKE_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__MISTAKE_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.MISTAKE_IMPORT_FROM_EXCEL]:
      FNB__MISTAKE_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.MISTAKE_EXPORT_EXCEL]: FNB__MISTAKE_HANDLER.exportExcel,

    //========================================== FNB_VOUCHER ==============================================//
    [CF_ACTIONS_FNB.VOUCHER_INSERT]: FNB__VOUCHER_HANDLER.insert,
    [CF_ACTIONS_FNB.VOUCHER_UPDATE]: FNB__VOUCHER_HANDLER.update,
    [CF_ACTIONS_FNB.VOUCHER_REMOVE]: FNB__VOUCHER_HANDLER.remove,
    [CF_ACTIONS_FNB.VOUCHER_GET_INFO_AND_GET_LIST]:
      FNB__VOUCHER_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.VOUCHER_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__VOUCHER_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.VOUCHER_IMPORT_FROM_EXCEL]:
      FNB__VOUCHER_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.VOUCHER_EXPORT_EXCEL]: FNB__VOUCHER_HANDLER.exportExcel,

    //========================================== FNB_CUSTOMER_CARE ==============================================//
    [CF_ACTIONS_FNB.CUSTOMER_CARE_INSERT]: FNB__CUSTOMER_CARE_HANDLER.insert,
    [CF_ACTIONS_FNB.CUSTOMER_CARE_UPDATE]: FNB__CUSTOMER_CARE_HANDLER.update,
    [CF_ACTIONS_FNB.CUSTOMER_CARE_REMOVE]: FNB__CUSTOMER_CARE_HANDLER.remove,
    [CF_ACTIONS_FNB.CUSTOMER_CARE_GET_INFO_AND_GET_LIST]:
      FNB__CUSTOMER_CARE_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.CUSTOMER_CARE_GET_LIST_BY_PROPERTY]:
      FNB__CUSTOMER_CARE_HANDLER.getListByProperty,
    [CF_ACTIONS_FNB.CUSTOMER_CARE_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__CUSTOMER_CARE_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.CUSTOMER_CARE_IMPORT_FROM_EXCEL]:
      FNB__CUSTOMER_CARE_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.CUSTOMER_CARE_EXPORT_EXCEL]:
      FNB__CUSTOMER_CARE_HANDLER.exportExcel,

    //========================================== FNB_NETWORK_COM ==============================================//
    [CF_ACTIONS_FNB.NETWORK_COM_INSERT]: FNB__NETWORK_COM_HANDLER.insert,
    [CF_ACTIONS_FNB.NETWORK_COM_UPDATE]: FNB__NETWORK_COM_HANDLER.update,
    [CF_ACTIONS_FNB.NETWORK_COM_REMOVE]: FNB__NETWORK_COM_HANDLER.remove,
    [CF_ACTIONS_FNB.NETWORK_COM_GET_INFO_AND_GET_LIST]:
      FNB__NETWORK_COM_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.NETWORK_COM_GET_LIST_BY_PROPERTY]:
      FNB__NETWORK_COM_HANDLER.getListByProperty,
    [CF_ACTIONS_FNB.NETWORK_COM_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__NETWORK_COM_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.NETWORK_COM_IMPORT_FROM_EXCEL]:
      FNB__NETWORK_COM_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.NETWORK_COM_EXPORT_EXCEL]:
      FNB__NETWORK_COM_HANDLER.exportExcel,

    //========================================== FNB_ORDER_GOODS ==============================================//
    [CF_ACTIONS_FNB.ORDER_GOODS_INSERT]: FNB__ORDER_GOODS_HANDLER.insert,
    [CF_ACTIONS_FNB.ORDER_GOODS_UPDATE]: FNB__ORDER_GOODS_HANDLER.update,
    [CF_ACTIONS_FNB.ORDER_GOODS_REMOVE]: FNB__ORDER_GOODS_HANDLER.remove,
    [CF_ACTIONS_FNB.ORDER_GOODS_GET_INFO_AND_GET_LIST]:
      FNB__ORDER_GOODS_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.ORDER_GOODS_GET_LIST_BY_PROPERTY]:
      FNB__ORDER_GOODS_HANDLER.getListByProperty,
    [CF_ACTIONS_FNB.ORDER_GOODS_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__ORDER_GOODS_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.ORDER_GOODS_IMPORT_FROM_EXCEL]:
      FNB__ORDER_GOODS_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.ORDER_GOODS_EXPORT_EXCEL]:
      FNB__ORDER_GOODS_HANDLER.exportExcel,

    //========================================== FNB_CUSTOMER_BOOKING ==============================================//
    [CF_ACTIONS_FNB.CUSTOMER_BOOKING_INSERT]:
      FNB__CUSTOMER_BOOKING_HANDLER.insert,
    [CF_ACTIONS_FNB.CUSTOMER_BOOKING_UPDATE]:
      FNB__CUSTOMER_BOOKING_HANDLER.update,
    [CF_ACTIONS_FNB.CUSTOMER_BOOKING_REMOVE]:
      FNB__CUSTOMER_BOOKING_HANDLER.remove,
    [CF_ACTIONS_FNB.CUSTOMER_BOOKING_GET_INFO_AND_GET_LIST]:
      FNB__CUSTOMER_BOOKING_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.CUSTOMER_BOOKING_GET_LIST_BY_PROPERTY]:
      FNB__CUSTOMER_BOOKING_HANDLER.getListByProperty,
    [CF_ACTIONS_FNB.CUSTOMER_BOOKING_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__CUSTOMER_BOOKING_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.CUSTOMER_BOOKING_IMPORT_FROM_EXCEL]:
      FNB__CUSTOMER_BOOKING_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.CUSTOMER_BOOKING_EXPORT_EXCEL]:
      FNB__CUSTOMER_BOOKING_HANDLER.exportExcel,

    //========================================== FNB_AFFILIATE_SIGNUP ==============================================//
    [CF_ACTIONS_FNB.AFFILIATE_SIGNUP_INSERT]:
      FNB__AFFILIATE_SIGNUP_HANDLER.insert,
    [CF_ACTIONS_FNB.AFFILIATE_SIGNUP_UPDATE]:
      FNB__AFFILIATE_SIGNUP_HANDLER.update,
    [CF_ACTIONS_FNB.AFFILIATE_SIGNUP_REMOVE]:
      FNB__AFFILIATE_SIGNUP_HANDLER.remove,
    [CF_ACTIONS_FNB.AFFILIATE_SIGNUP_GET_INFO_AND_GET_LIST]:
      FNB__AFFILIATE_SIGNUP_HANDLER.getInfoAndGetList,
    [CF_ACTIONS_FNB.AFFILIATE_SIGNUP_GET_LIST_BY_PROPERTY]:
      FNB__AFFILIATE_SIGNUP_HANDLER.getListByProperty,
    [CF_ACTIONS_FNB.AFFILIATE_SIGNUP_DOWNLOAD_TEMPLATE_EXCEL]:
      FNB__AFFILIATE_SIGNUP_HANDLER.downloadTemplateExcel,
    [CF_ACTIONS_FNB.AFFILIATE_SIGNUP_IMPORT_FROM_EXCEL]:
      FNB__AFFILIATE_SIGNUP_HANDLER.importFromExcel,
    [CF_ACTIONS_FNB.AFFILIATE_SIGNUP_EXPORT_EXCEL]:
      FNB__AFFILIATE_SIGNUP_HANDLER.exportExcel,
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
