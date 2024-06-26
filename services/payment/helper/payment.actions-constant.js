// liệt kê các actions của hệ thống
const BASE_ACTIONS = 'ACT_PAYMENT';
const TRANSACTION  = 'TRANSACTION';
/**
 * nguyên tắc chuyển đổi từ method trong .handler
 *  VD: handler(insertFast) -> action(INSERT_FAST)
 */
const CF_ACTIONS_PAYMENT = {
    GET_LIST_TRANSACTION                        : `${BASE_ACTIONS}_${TRANSACTION}_GET_LIST_TRANSACTION`,
    GET_LIST_TRANSACTION_BY_USER_WITH_STATUS    : `${BASE_ACTIONS}_${TRANSACTION}_GET_LIST_TRANSACTION_BY_USER_WITH_STATUS`,
    CREATE_URL_PAYMENT                          : `${BASE_ACTIONS}_${TRANSACTION}_CREATE_URL_PAYMENT`,
    URL_RETURN_PAYMENT                          : `${BASE_ACTIONS}_${TRANSACTION}_URL_RETURN_PAYMENT`,
    UPDATE_STATUS                               : `${BASE_ACTIONS}_${TRANSACTION}_UPDATE_STATUS`,
}

exports.CF_ACTIONS_PAYMENT = CF_ACTIONS_PAYMENT;