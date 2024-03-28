const BASE_ROUTE = '/fnb';
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */

const ORDER                 = '/orders';
const PRODUCT               = '/products';
const ORDER_PRODUCT         = '/order_products';
const ORDER_GOODS           = '/order_goods';
const SHIFT                 = '/shifts';
const MISTAKE               = '/mistakes';
const VOUCHER               = '/vouchers';
const ZALOOA                = '/zalooas';
const CUSTOMER_CARE         = '/customer_cares';
const NETWORK_COM           = '/network_coms';
const CUSTOMER_BOOKING      = '/customer_bookings';
const AFFILIATE_SIGNUP      = '/affiliate_signups';

const CF_ROUTINGS_FNB = {
    ORIGIN_APP: BASE_ROUTE,

    //================================FNB_ORDER=======================================//
    ORDERS                                  : `${BASE_ROUTE}${ORDER}`,
    ORDER_GET_LIST_BY_PROPERTY              : `${BASE_ROUTE}${ORDER}/get-list-by-property`,
    ORDER_UPDATE_VALUE                      : `${BASE_ROUTE}${ORDER}/update-value`,
    ORDER_DOWNLOAD_TEMPLATE_EXCEL           : `${BASE_ROUTE}${ORDER}/download-template-excel`,
    ORDER_IMPORT_FROM_EXCEL                 : `${BASE_ROUTE}${ORDER}/import-from-excel`,
    ORDER_EXPORT_EXCEL                      : `${BASE_ROUTE}${ORDER}/export-excel`,
    ORDER_EXPORT_EXCEL2                     : `${BASE_ROUTE}${ORDER}/export-excel2`,
    ORDER_EXPORT_EXCEL3                     : `${BASE_ROUTE}${ORDER}/export-excel3`,
    ORDER_RESET_ALL_DATA                    : `${BASE_ROUTE}${ORDER}/reset-all-data`,
    ORDER_CONVERT_ALL_DATA                  : `${BASE_ROUTE}${ORDER}/convert-all-data`,

    //================================FNB_PRODUCT=======================================//
    PRODUCTS                                : `${BASE_ROUTE}${PRODUCT}`,
    PRODUCT_DOWNLOAD_TEMPLATE_EXCEL         : `${BASE_ROUTE}${PRODUCT}/download-template-excel`,
    PRODUCT_IMPORT_FROM_EXCEL               : `${BASE_ROUTE}${PRODUCT}/import-from-excel`,
    PRODUCT_EXPORT_EXCEL                    : `${BASE_ROUTE}${PRODUCT}/export-excel`,

    //================================FNB_ORDER_PRODUCT=======================================//
    ORDER_PRODUCTS                          : `${BASE_ROUTE}${ORDER_PRODUCT}`,
    ORDER_PRODUCT_GET_LIST_BY_PROPERTY      : `${BASE_ROUTE}${ORDER_PRODUCT}/get-list-by-property`,
    ORDER_PRODUCT_DOWNLOAD_TEMPLATE_EXCEL   : `${BASE_ROUTE}${ORDER_PRODUCT}/download-template-excel`,
    ORDER_PRODUCT_IMPORT_FROM_EXCEL         : `${BASE_ROUTE}${ORDER_PRODUCT}/import-from-excel`,
    ORDER_PRODUCT_EXPORT_EXCEL              : `${BASE_ROUTE}${ORDER_PRODUCT}/export-excel`,

    //================================FNB_SHIFT=======================================//
    SHIFTS                                  : `${BASE_ROUTE}${SHIFT}`,
    SHIFT_UPDATE_SALARY                     : `${BASE_ROUTE}${SHIFT}/update-salary`,
    SHIFT_GET_LIST_BY_PROPERTY              : `${BASE_ROUTE}${SHIFT}/get-list-by-property`,
    SHIFT_DOWNLOAD_TEMPLATE_EXCEL           : `${BASE_ROUTE}${SHIFT}/download-template-excel`,
    SHIFT_IMPORT_FROM_EXCEL                 : `${BASE_ROUTE}${SHIFT}/import-from-excel`,
    SHIFT_EXPORT_EXCEL                      : `${BASE_ROUTE}${SHIFT}/export-excel`,
    SHIFT_EXPORT_EXCEL2                      : `${BASE_ROUTE}${SHIFT}/export-excel2`,

    //================================FNB_MISTAKE=======================================//
    MISTAKES                                : `${BASE_ROUTE}${MISTAKE}`,
    MISTAKE_UPDATE_KPI                      : `${BASE_ROUTE}${MISTAKE}/update-kpi`,
    MISTAKE_GET_LIST_BY_PROPERTY            : `${BASE_ROUTE}${MISTAKE}/get-list-by-property`,
    MISTAKE_DOWNLOAD_TEMPLATE_EXCEL         : `${BASE_ROUTE}${MISTAKE}/download-template-excel`,
    MISTAKE_IMPORT_FROM_EXCEL               : `${BASE_ROUTE}${MISTAKE}/import-from-excel`,
    MISTAKE_EXPORT_EXCEL                    : `${BASE_ROUTE}${MISTAKE}/export-excel`,

    //================================FNB_VOUCHER=======================================//
    VOUCHERS                                : `${BASE_ROUTE}${VOUCHER}`,
    VOUCHER_DOWNLOAD_TEMPLATE_EXCEL         : `${BASE_ROUTE}${VOUCHER}/download-template-excel`,
    VOUCHER_IMPORT_FROM_EXCEL               : `${BASE_ROUTE}${VOUCHER}/import-from-excel`,
    VOUCHER_EXPORT_EXCEL                    : `${BASE_ROUTE}${VOUCHER}/export-excel`,

    //================================FNB_ZALOOA=======================================//
    ZALOOAS                                : `${BASE_ROUTE}${ZALOOA}`,
    ZALOOA_DOWNLOAD_TEMPLATE_EXCEL         : `${BASE_ROUTE}${ZALOOA}/download-template-excel`,
    ZALOOA_IMPORT_FROM_EXCEL               : `${BASE_ROUTE}${ZALOOA}/import-from-excel`,
    ZALOOA_EXPORT_EXCEL                    : `${BASE_ROUTE}${ZALOOA}/export-excel`,

    //================================FNB_CUSTOMER_CARE=======================================//
    CUSTOMER_CARES                                : `${BASE_ROUTE}${CUSTOMER_CARE}`,
    CUSTOMER_CARE_GET_LIST_BY_PROPERTY            : `${BASE_ROUTE}${CUSTOMER_CARE}/get-list-by-property`,
    CUSTOMER_CARE_DOWNLOAD_TEMPLATE_EXCEL         : `${BASE_ROUTE}${CUSTOMER_CARE}/download-template-excel`,
    CUSTOMER_CARE_IMPORT_FROM_EXCEL               : `${BASE_ROUTE}${CUSTOMER_CARE}/import-from-excel`,
    CUSTOMER_CARE_EXPORT_EXCEL                    : `${BASE_ROUTE}${CUSTOMER_CARE}/export-excel`,

    //================================FNB_NETWORK_COM=======================================//
    NETWORK_COMS                                : `${BASE_ROUTE}${NETWORK_COM}`,
    NETWORK_COM_GET_LIST_BY_PROPERTY            : `${BASE_ROUTE}${NETWORK_COM}/get-list-by-property`,
    NETWORK_COM_DOWNLOAD_TEMPLATE_EXCEL         : `${BASE_ROUTE}${NETWORK_COM}/download-template-excel`,
    NETWORK_COM_IMPORT_FROM_EXCEL               : `${BASE_ROUTE}${NETWORK_COM}/import-from-excel`,
    NETWORK_COM_EXPORT_EXCEL                    : `${BASE_ROUTE}${NETWORK_COM}/export-excel`,

    //================================FNB_ORDER_GOODS=======================================//
    ORDER_GOODS                           : `${BASE_ROUTE}${ORDER_GOODS}`,
    ORDER_GOODS_GET_LIST_BY_PROPERTY      : `${BASE_ROUTE}${ORDER_GOODS}/get-list-by-property`,
    ORDER_GOODS_DOWNLOAD_TEMPLATE_EXCEL   : `${BASE_ROUTE}${ORDER_GOODS}/download-template-excel`,
    ORDER_GOODS_IMPORT_FROM_EXCEL         : `${BASE_ROUTE}${ORDER_GOODS}/import-from-excel`,
    ORDER_GOODS_EXPORT_EXCEL              : `${BASE_ROUTE}${ORDER_GOODS}/export-excel`,

    //================================FNB_CUSTOMER_BOOKING=======================================//
    CUSTOMER_BOOKINGS                                : `${BASE_ROUTE}${CUSTOMER_BOOKING}`,
    CUSTOMER_BOOKING_GET_LIST_BY_PROPERTY            : `${BASE_ROUTE}${CUSTOMER_BOOKING}/get-list-by-property`,
    CUSTOMER_BOOKING_DOWNLOAD_TEMPLATE_EXCEL         : `${BASE_ROUTE}${CUSTOMER_BOOKING}/download-template-excel`,
    CUSTOMER_BOOKING_IMPORT_FROM_EXCEL               : `${BASE_ROUTE}${CUSTOMER_BOOKING}/import-from-excel`,
    CUSTOMER_BOOKING_EXPORT_EXCEL                    : `${BASE_ROUTE}${CUSTOMER_BOOKING}/export-excel`,

    //================================FNB_AFFILIATE_SIGNUP=======================================//
    AFFILIATE_SIGNUPS                                : `${BASE_ROUTE}${AFFILIATE_SIGNUP}`,
    AFFILIATE_SIGNUP_GET_LIST_BY_PROPERTY            : `${BASE_ROUTE}${AFFILIATE_SIGNUP}/get-list-by-property`,
    AFFILIATE_SIGNUP_DOWNLOAD_TEMPLATE_EXCEL         : `${BASE_ROUTE}${AFFILIATE_SIGNUP}/download-template-excel`,
    AFFILIATE_SIGNUP_IMPORT_FROM_EXCEL               : `${BASE_ROUTE}${AFFILIATE_SIGNUP}/import-from-excel`,
    AFFILIATE_SIGNUP_EXPORT_EXCEL                    : `${BASE_ROUTE}${AFFILIATE_SIGNUP}/export-excel`,
}

exports.CF_ROUTINGS_FNB = CF_ROUTINGS_FNB;