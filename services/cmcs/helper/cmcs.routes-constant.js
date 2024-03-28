const BASE_ROUTE = '/cmcs'
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const CONTRACT_IPC = '/contract_ipcs'
const CONTRACT_PRODUCTION = '/contract_productions'
const CONTRACT_PAYMENT = '/contract_payments'
const CONTRACT_EXPENSE = '/contract_expenses'
const CONTRACT_BILL_ITEM = '/contract_bill_items'
const CONTRACT_BILL_GROUP = '/contract_bill_groups'
const CONTRACT_BILL_JOB = '/contract_bill_jobs'
const CONTRACT_IPC_DETAIL = '/contract_ipc_details'
const CONTRACT_SUBMITTAL = '/contract_submittals'

const CF_ROUTINGS_CMCS = {
  ORIGIN_APP: BASE_ROUTE,

  // ================================CONTRACT PRODUCTION=====================================//
  CONTRACT_PRODUCTION: `${BASE_ROUTE}${CONTRACT_PRODUCTION}`,
  CONTRACT_PRODUCTION_GET_LIST_BY_MONTH: `${BASE_ROUTE}${CONTRACT_PRODUCTION}/get-list-by-month`,
  CONTRACT_PRODUCTION_GET_AMOUNT_BY_MONTH: `${BASE_ROUTE}${CONTRACT_PRODUCTION}/get-amount-by-month`,
  CONTRACT_PRODUCTION_GET_AMOUNT_BY_OBJECT: `${BASE_ROUTE}${CONTRACT_PRODUCTION}/get-amount-by-object`,
  CONTRACT_PRODUCTION_GET_AMOUNT_BY_PROPERTY: `${BASE_ROUTE}${CONTRACT_PRODUCTION}/get-amount-by-property`,

  // ================================CONTRACT IPC============================================//
  CONTRACT_IPC: `${BASE_ROUTE}${CONTRACT_IPC}`,
  CONTRACT_IPC_GET_LIST_BY_MONTH: `${BASE_ROUTE}${CONTRACT_IPC}/get-list-by-month`,
  CONTRACT_IPC_GET_AMOUNT_BY_MONTH: `${BASE_ROUTE}${CONTRACT_IPC}/get-amount-by-month`,
  CONTRACT_IPC_GET_AMOUNT_BY_OBJECT: `${BASE_ROUTE}${CONTRACT_IPC}/get-amount-by-object`,
  CONTRACT_IPC_GET_AMOUNT_BY_PROPERTY: `${BASE_ROUTE}${CONTRACT_IPC}/get-amount-by-property`,
  CONTRACT_IPC_DOWNLOAD_EXCEL: `${BASE_ROUTE}${CONTRACT_IPC}/download-excel`,

  // ================================CONTRACT PAYMENT=====================================//
  CONTRACT_PAYMENT: `${BASE_ROUTE}${CONTRACT_PAYMENT}`,
  CONTRACT_PAYMENT_GET_LIST_BY_MONTH: `${BASE_ROUTE}${CONTRACT_PAYMENT}/get-list-by-month`,
  CONTRACT_PAYMENT_GET_AMOUNT_BY_MONTH: `${BASE_ROUTE}${CONTRACT_PAYMENT}/get-amount-by-month`,
  CONTRACT_PAYMENT_GET_AMOUNT_CONTRACT_VALUE_GROUP_BY_DATE: `${BASE_ROUTE}${CONTRACT_PAYMENT}/get-amount-contract-value-group-by-date`,
  CONTRACT_PAYMENT_GET_AMOUNT_BY_OBJECT: `${BASE_ROUTE}${CONTRACT_PAYMENT}/get-amount-by-object`,
  CONTRACT_PAYMENT_GET_AMOUNT_BY_PROPERTY: `${BASE_ROUTE}${CONTRACT_PAYMENT}/get-amount-by-property`,

  // ================================CONTRACT EXPENSE=====================================//
  CONTRACT_EXPENSE: `${BASE_ROUTE}${CONTRACT_EXPENSE}`,
  CONTRACT_EXPENSE_GET_LIST_BY_MONTH: `${BASE_ROUTE}${CONTRACT_EXPENSE}/get-list-by-month`,
  CONTRACT_EXPENSE_GET_AMOUNT_BY_MONTH: `${BASE_ROUTE}${CONTRACT_EXPENSE}/get-amount-by-month`,
  CONTRACT_EXPENSE_GET_AMOUNT_BY_OBJECT: `${BASE_ROUTE}${CONTRACT_EXPENSE}/get-amount-by-object`,
  CONTRACT_EXPENSE_GET_AMOUNT_BY_PROPERTY: `${BASE_ROUTE}${CONTRACT_EXPENSE}/get-amount-by-property`,

  // ================================CONTRACT BILL ITEM============================================//
  CONTRACT_BILL_ITEM: `${BASE_ROUTE}${CONTRACT_BILL_ITEM}`,
  CONTRACT_BILL_ITEM_UPDATE_VALUE: `${BASE_ROUTE}${CONTRACT_BILL_ITEM}/update-value`,

  // ================================CONTRACT BILL ITEM============================================//
  CONTRACT_BILL_GROUP: `${BASE_ROUTE}${CONTRACT_BILL_GROUP}`,
  CONTRACT_BILL_GROUP_UPDATE_VALUE: `${BASE_ROUTE}${CONTRACT_BILL_GROUP}/update-value`,

  // ================================CONTRACT BILL JOB=======================================//
  CONTRACT_BILL_JOB: `${BASE_ROUTE}${CONTRACT_BILL_JOB}`,
  CONTRACT_BILL_JOB_UPDATE_VALUE: `${BASE_ROUTE}${CONTRACT_BILL_JOB}/update-value`,

  // ================================CONTRACT IPC DETAIL=======================================//
  CONTRACT_IPC_DETAIL: `${BASE_ROUTE}${CONTRACT_IPC_DETAIL}`,

  // ================================CONTRACT_SUBMITTAL=======================================//
  CONTRACT_SUBMITTAL: `${BASE_ROUTE}${CONTRACT_SUBMITTAL}`,
  CONTRACT_SUBMITTAL_GET_LIST_BY_PROPERTY: `${BASE_ROUTE}${CONTRACT_SUBMITTAL}/get-list-by-property`,
}

exports.CF_ROUTINGS_CMCS = CF_ROUTINGS_CMCS
