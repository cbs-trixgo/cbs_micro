const BASE_ROUTE = '/example'
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const CASE_1 = '/case_1'

const CF_ROUTINGS_EXAMPLE = {
  ORIGIN_APP: BASE_ROUTE,

  CASE_1_GET_LIST: `${BASE_ROUTE}${CASE_1}`, // /payment/transactions
}

exports.CF_ROUTINGS_EXAMPLE = CF_ROUTINGS_EXAMPLE
