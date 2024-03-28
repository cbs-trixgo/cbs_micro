const BASE_ROUTE = '/item'
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const DEPARTMENT = '/departments'
const CONTRACT = '/contracts'
const DOCTYPE = '/doctypes'
const CONTACT = '/contacts'
const WAREHOUSE = '/warehouses'
const AREA = '/areas'
const POSITION = '/positions'
const STORAGE = '/storages'
const ACCOUNT = '/accounts'
const GOODS = '/goods'
const FUNDA = '/fundas'
const SIGNATURE = '/signatures'
const DEPARTMENT_DIRECTORIES = '/department_directories'
const CONFIG = '/configs'

const CF_ROUTINGS_ITEM = {
    ORIGIN_APP: BASE_ROUTE,

    // ================================DEPARTMENT=======================================//
    DEPARTMENTS: `${BASE_ROUTE}${DEPARTMENT}`,
    DEPARTMENT_UPDATE_VALUE: `${BASE_ROUTE}${DEPARTMENT}/update-value`,
    LIST_DEPARTMENT_IS_MEMBERS: `${BASE_ROUTE}/list-department-is-members`,
    DEPARTMENTS_ANALYSIS_ONTIME_ONBUDGET: `${BASE_ROUTE}${DEPARTMENT}/analysis`,

    // ================================CONTRACT=========================================//
    CONTRACTS: `${BASE_ROUTE}${CONTRACT}`,
    CONTRACT_UPDATE_VALUE: `${BASE_ROUTE}${CONTRACT}/update-value`,
    LIST_CONTRACT_IS_MEMBERS: `${BASE_ROUTE}/list-contract-is-members`,
    CONTRACT_GET_LIST_BY_FILTER: `${BASE_ROUTE}/list-contract-by-filter`,
    CONTRACT_GET_LIST_GUARANTEE: `${BASE_ROUTE}${CONTRACT}/get-list-guarantee`,
    CONTRACT_GET_AMOUNT_BY_MONTH: `${BASE_ROUTE}${CONTRACT}/get-amount-by-month`,
    CONTRACT_GET_LIST_BY_MONTH: `${BASE_ROUTE}${CONTRACT}/get-list-by-month`,
    CONTRACT_GET_AMOUNT_BY_PROPERTY: `${BASE_ROUTE}${CONTRACT}/get-amount-by-property`,
    CONTRACT_GET_RETAIN_PRODUCE: `${BASE_ROUTE}${CONTRACT}/get-retain-produce`,
    CONTRACT_GET_INVENTORY: `${BASE_ROUTE}${CONTRACT}/get-inventory`,
    CONTRACT_STATISTICAL_STATUS_BY_ONTIME_ON_BUDGET: `${BASE_ROUTE}${CONTRACT}/statistical-status-by-ontime-onbudget`,
    CONTRACT_IMPORT_FROM_EXCEL: `${BASE_ROUTE}${CONTRACT}/import-from-excel`,
    CONTRACT_EXPORT: `${BASE_ROUTE}${CONTRACT}/export`,

    // ================================DOCTYPE==========================================//
    DOCTYPES: `${BASE_ROUTE}${DOCTYPE}`,
    DOCTYPES_IMPORT_FROM_EXCEL: `${BASE_ROUTE}${DOCTYPE}/import-from-excel`,

    // ================================CONTACT==========================================//
    CONTACTS: `${BASE_ROUTE}${CONTACT}`,
    CONTACTS_PRODUCT_GET_LIST_BY_PROPERTY: `${BASE_ROUTE}${CONTACT}/get-list-by-property`,
    CONTACTS_GET_LIST_BY_FILTER: `${BASE_ROUTE}${CONTACT}/filter-human`,
    CONTACTS_GET_LIST_OF_SYSTEM: `${BASE_ROUTE}${CONTACT}/contact-of-system`,
    CONTACTS_GET_LIST_ACCESS_BY_CONTRACT: `${BASE_ROUTE}${CONTACT}/list-access-by-contract`,
    CONTACT_DOWNLOAD_TEMPLATE_IMPORT_EXCEL: `${BASE_ROUTE}${CONTACT}/download-template-import-excel`,
    CONTACT_IMPORT_FROM_EXCEL: `${BASE_ROUTE}${CONTACT}/import-from-excel`,
    CONTACT_EXPORT_EXCEL: `${BASE_ROUTE}${CONTACT}/export-excel`,
    CONTACT_EXPORT_EXCEL_BY_FILTER: `${BASE_ROUTE}${CONTACT}/export-excel-by-filter`,

    // ================================WAREHOUSE=======================================//
    WAREHOUSES: `${BASE_ROUTE}${WAREHOUSE}`,

    // ================================AREA============================================//
    AREA: `${BASE_ROUTE}${AREA}`,

    // ================================POSITION========================================//
    POSITION: `${BASE_ROUTE}${POSITION}`,

    // ================================STORAGE=========================================//
    STORAGE: `${BASE_ROUTE}${STORAGE}`,

    // ================================ACCOUNT=========================================//
    ACCOUNT: `${BASE_ROUTE}${ACCOUNT}`,
    ACCOUNT_GET_LIST_NESTED: `${BASE_ROUTE}${ACCOUNT}/get-list-nested-item`,

    // ================================GOOD============================================//
    GOODS: `${BASE_ROUTE}${GOODS}`,
    GOOD_DOWNLOAD_TEMPLATE_EXCEL: `${BASE_ROUTE}${GOODS}/download-template-excel`,
    GOOD_IMPORT_FROM_EXCEL: `${BASE_ROUTE}${GOODS}/import-from-excel`,
    GOOD_EXPORT_EXCEL: `${BASE_ROUTE}${GOODS}/export-excel`,

    // ================================FUNDA===========================================//
    FUNDA: `${BASE_ROUTE}${FUNDA}`,

    // ================================SIGNATURE===========================================//
    SIGNATURE: `${BASE_ROUTE}${SIGNATURE}`,

    // ================================SIGNATURE===========================================//
    DEPARTMENT_DIRECTORIES: `${BASE_ROUTE}${DEPARTMENT_DIRECTORIES}`,

    // ================================CONFIG============================================//
    CONFIG: `${BASE_ROUTE}${CONFIG}`,
}

exports.CF_ROUTINGS_ITEM = CF_ROUTINGS_ITEM
