const BASE_ROUTE = '/fin'
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const CASH_FLOW_PLAN = '/cash_flow_plans'
const CASH_BOOK = '/cash_books'
const CASH_PAYMENT = '/cash_payments'

const CF_ROUTINGS_FIN = {
    ORIGIN_APP: BASE_ROUTE,

    // ================================CASH_FLOW_PLAN=======================================//
    CASH_FLOW_PLAN: `${BASE_ROUTE}${CASH_FLOW_PLAN}`,
    CASH_FLOW_PLAN_GET_AMOUNT_BY_PROPERTY: `${BASE_ROUTE}${CASH_FLOW_PLAN}/get-amount-by-property`,

    // ================================CASH_BOOK=======================================//
    CASH_BOOK: `${BASE_ROUTE}${CASH_BOOK}`,
    CASH_BOOK_GET_AMOUNT_BY_PROPERTY: `${BASE_ROUTE}${CASH_BOOK}/get-amount-by-property`,
    CASH_BOOK_GET_AMOUNT_BY_PARENT: `${BASE_ROUTE}${CASH_BOOK}/get-amount-income-expense-by-parent`,
    CASH_BOOK_DOWNLOAD_TEMPLATE_EXCEL: `${BASE_ROUTE}${CASH_BOOK}/download-template-excel`,
    CASH_BOOK_IMPORT_FROM_EXCEL: `${BASE_ROUTE}${CASH_BOOK}/import-from-excel`,
    CASH_BOOK_EXPORT_EXCEL: `${BASE_ROUTE}${CASH_BOOK}/export-excel`,

    // ================================CASH_PAYMENT=======================================//
    CASH_PAYMENT: `${BASE_ROUTE}${CASH_PAYMENT}`,
    CASH_PAYMENT_GET_AMOUNT_BY_PROPERTY: `${BASE_ROUTE}${CASH_PAYMENT}/get-amount-by-property`,
    CASH_PAYMENT_EXPORT_EXCEL: `${BASE_ROUTE}${CASH_PAYMENT}/export-excel`,
}

exports.CF_ROUTINGS_FIN = CF_ROUTINGS_FIN
