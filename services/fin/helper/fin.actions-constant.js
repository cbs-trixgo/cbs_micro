// liệt kê các actions của hệ thống
const BASE_ACTIONS = 'ACT_FIN';
/**
 * CASE_1, CASE_2 tương ứng trong phần AUTH SERVICE, có 2 coll: user, company
 */
const CASH_FLOW_PLAN = 'CASH_FLOW_PLAN';
const CASH_BOOK = 'CASH_BOOK';
const CASH_PAYMENT = 'CASH_PAYMENT';

const CF_ACTIONS_FIN = {
    /**
    * CASH_FLOW_PLAN
    */
    CASH_FLOW_PLAN_INSERT                   : `${BASE_ACTIONS}_${CASH_FLOW_PLAN}_INSERT`,
    CASH_FLOW_PLAN_UPDATE                   : `${BASE_ACTIONS}_${CASH_FLOW_PLAN}_UPDATE`,
    CASH_FLOW_PLAN_REMOVE                   : `${BASE_ACTIONS}_${CASH_FLOW_PLAN}_REMOVE`,
    CASH_FLOW_PLAN_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${CASH_FLOW_PLAN}_GET_INFO_AND_GET_LIST`,
    CASH_FLOW_PLAN_GET_AMOUNT_BY_PROPERTY   : `${BASE_ACTIONS}_${CASH_FLOW_PLAN}_GET_AMOUNT_BY_PROPERTY`,

    /**
    * CASH_BOOK
    */
    CASH_BOOK_INSERT                            : `${BASE_ACTIONS}_${CASH_BOOK}_INSERT`,
    CASH_BOOK_UPDATE                            : `${BASE_ACTIONS}_${CASH_BOOK}_UPDATE`,
    CASH_BOOK_REMOVE                            : `${BASE_ACTIONS}_${CASH_BOOK}_REMOVE`,
    CASH_BOOK_GET_INFO_AND_GET_LIST             : `${BASE_ACTIONS}_${CASH_BOOK}_GET_INFO_AND_GET_LIST`,   
    CASH_BOOK_GET_AMOUNT_BY_PROPERTY            : `${BASE_ACTIONS}_${CASH_BOOK}_GET_AMOUNT_BY_PROPERTY`,
    CASH_BOOK_GET_AMOUNT_BY_PARENT              : `${BASE_ACTIONS}_${CASH_BOOK}_GET_AMOUNT_BY_PARENT`,
    CASH_BOOK_DOWNLOAD_TEMPLATE_EXCEL           : `${BASE_ACTIONS}_${CASH_BOOK}_DOWNLOAD_TEMPLATE_EXCEL`,
    CASH_BOOK_IMPORT_FROM_EXCEL                 : `${BASE_ACTIONS}_${CASH_BOOK}_IMPORT_FROM_EXCEL`,
    CASH_BOOK_EXPORT_EXCEL                      : `${BASE_ACTIONS}_${CASH_BOOK}_EXPORT_EXCEL`,

    /**
    * CASH_PAYMENT_PLAN
    */
    CASH_PAYMENT_INSERT                   : `${BASE_ACTIONS}_${CASH_PAYMENT}_INSERT`,
    CASH_PAYMENT_UPDATE                   : `${BASE_ACTIONS}_${CASH_PAYMENT}_UPDATE`,
    CASH_PAYMENT_REMOVE                   : `${BASE_ACTIONS}_${CASH_PAYMENT}_REMOVE`,
    CASH_PAYMENT_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${CASH_PAYMENT}_GET_INFO_AND_GET_LIST`,
    CASH_PAYMENT_GET_AMOUNT_BY_PROPERTY   : `${BASE_ACTIONS}_${CASH_PAYMENT}_GET_AMOUNT_BY_PROPERTY`,
    CASH_PAYMENT_EXPORT_EXCEL             : `${BASE_ACTIONS}_${CASH_PAYMENT}_EXPORT_EXCEL`,
}

exports.CF_ACTIONS_FIN = CF_ACTIONS_FIN;