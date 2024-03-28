const BASE_ROUTE = '/budget'
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const BUDGET_ITEM = '/budget_items'
const BUDGET_GROUP = '/budget_groups'
const BUDGET_WORK = '/budget_works'
const BUDGET_SUBMITTAL = '/budget_submittals'

const CF_ROUTINGS_BUDGET = {
    ORIGIN_APP: BASE_ROUTE,

    // ================================BUDGET============================================//
    BUDGET: `${BASE_ROUTE}`,
    BUDGET_UPDATE_VALUE: `${BASE_ROUTE}/update-value`,
    BUDGET_DOWNLOAD_TEMPLATE_EXCEL: `${BASE_ROUTE}/download-template-excel`,
    BUDGET_IMPORT_EXCEL: `${BASE_ROUTE}/import-excel`,
    BUDGET_EXPORT_EXCEL: `${BASE_ROUTE}/export-excel`,

    // ================================BUDGET_ITEM============================================//
    BUDGET_ITEM: `${BASE_ROUTE}${BUDGET_ITEM}`,
    BUDGET_ITEM_UPDATE_VALUE: `${BASE_ROUTE}${BUDGET_ITEM}/update-value`,

    // ================================BUDGET_GROUP============================================//
    BUDGET_GROUP: `${BASE_ROUTE}${BUDGET_GROUP}`,
    BUDGET_GROUP_UPDATE_VALUE: `${BASE_ROUTE}${BUDGET_GROUP}/update-value`,

    // ================================BUDGET_WORK============================================//
    BUDGET_WORK: `${BASE_ROUTE}${BUDGET_WORK}`,
    BUDGET_WORK_UPDATE_VALUE: `${BASE_ROUTE}${BUDGET_WORK}/update-value`,
    BUDGET_WORK_DOWNLOAD_TEMPLATE_EXCEL: `${BASE_ROUTE}${BUDGET_WORK}/download-template-excel`,
    BUDGET_WORK_IMPORT_EXCEL: `${BASE_ROUTE}${BUDGET_WORK}/import-excel`,
    BUDGET_WORK_EXPORT_EXCEL: `${BASE_ROUTE}${BUDGET_WORK}/export-excel`,
    BUDGET_WORK_COPY: `${BASE_ROUTE}${BUDGET_WORK}/copy`,

    // ================================BUDGET_SUBMITTAL============================================//
    BUDGET_SUBMITTAL: `${BASE_ROUTE}${BUDGET_SUBMITTAL}`,
    BUDGET_SUBMITTAL_GET_LIST_BY_PROPERTY: `${BASE_ROUTE}${BUDGET_SUBMITTAL}/get-list-by-property`,
}

exports.CF_ROUTINGS_BUDGET = CF_ROUTINGS_BUDGET
