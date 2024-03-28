// liệt kê các actions của hệ thống
const BASE_ACTIONS = 'ACT_OPERATION'

/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const UTILITY = 'UTILITY'

/**
 * nguyên tắc chuyển đổi từ method trong .handler
 *  VD: handler(insertFast) -> action(INSERT_FAST)
 */
const CF_ACTIONS_OPERATION = {
  UTILITY_INSERT: `${BASE_ACTIONS}_${UTILITY}_INSERT`,
  UTILITY_UPDATE: `${BASE_ACTIONS}_${UTILITY}_UPDATE`,
  UTILITY_REMOVE: `${BASE_ACTIONS}_${UTILITY}_REMOVE`,
  UTILITY_GET_INFO_AND_GET_LIST: `${BASE_ACTIONS}_${UTILITY}_GET_INFO_AND_GET_LIST`,
}

exports.CF_ACTIONS_OPERATION = CF_ACTIONS_OPERATION
