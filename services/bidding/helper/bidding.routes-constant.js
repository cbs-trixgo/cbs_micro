const BASE_ROUTE = '/bidding'
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const BIIDING_PLAN = '/bidding_plans'
const BIIDING_DOC = '/bidding_docs'
const BIIDING_REQUEST = '/bidding_requests'
const BIIDING_APPLY = '/bidding_applies'
const BIIDING_QUOTATION = '/bidding_quotations'
const BIIDING_BILL_ITEM = '/bidding_bill_items'
const BIIDING_BILL_GROUP = '/bidding_bill_groups'
const BIIDING_BILL_WORK = '/bidding_bill_works'
const BIIDING_BILL_WORKLINE = '/bidding_bill_worklines'
const BIIDING_BILL_PRODUCT = '/bidding_bill_products'

const CF_ROUTINGS_BIDDING = {
    ORIGIN_APP: BASE_ROUTE,

    // ================================BIIDING_PLAN=======================================//
    BIIDING_PLAN: `${BASE_ROUTE}${BIIDING_PLAN}`,
    BIIDING_PLAN_CONTRACTOR_SELECTION: `${BASE_ROUTE}${BIIDING_PLAN}/contractor-selection`,

    // ================================BIIDING_PLAN=======================================//
    BIIDING_DOC: `${BASE_ROUTE}${BIIDING_DOC}`,

    // ================================BIIDING_REQUEST=======================================//
    BIIDING_REQUEST: `${BASE_ROUTE}${BIIDING_REQUEST}`,

    // ================================BIIDING_APPLY=======================================//
    BIIDING_APPLY: `${BASE_ROUTE}${BIIDING_APPLY}`,

    // ================================BIIDING_QUOTATION=======================================//
    BIIDING_QUOTATION: `${BASE_ROUTE}${BIIDING_QUOTATION}`,

    // ================================BIIDING_BILL_ITEM=======================================//
    BIIDING_BILL_ITEM: `${BASE_ROUTE}${BIIDING_BILL_ITEM}`,

    // ================================BIIDING_BILL_GROUP=======================================//
    BIIDING_BILL_GROUP: `${BASE_ROUTE}${BIIDING_BILL_GROUP}`,

    // ================================BIIDING_BILL_WORK=======================================//
    BIIDING_BILL_WORK: `${BASE_ROUTE}${BIIDING_BILL_WORK}`,
    BIIDING_BILL_WORK_ASSIGN_TEMPLATE: `${BASE_ROUTE}${BIIDING_BILL_WORK}/assign-job-in-template`,
    BIIDING_BILL_WORK_UPDATE_PRODUCT_PRICE: `${BASE_ROUTE}${BIIDING_BILL_WORK}/update-product-price`,

    // ================================BIIDING_BILL_WORKLINE=======================================//
    BIIDING_BILL_WORKLINE: `${BASE_ROUTE}${BIIDING_BILL_WORKLINE}`,

    // ================================BIIDING_BILL_PRODUCT=======================================//
    BIIDING_BILL_PRODUCT: `${BASE_ROUTE}${BIIDING_BILL_PRODUCT}`,
}

exports.CF_ROUTINGS_BIDDING = CF_ROUTINGS_BIDDING
