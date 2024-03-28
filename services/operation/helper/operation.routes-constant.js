const BASE_ROUTE = '/operation'

/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const UTILITY = '/utilitys'

const CF_ROUTINGS_OPERATION = {
    ORIGIN_APP: BASE_ROUTE,
    UTILITY: `${BASE_ROUTE}${UTILITY}`,
}

exports.CF_ROUTINGS_OPERATION = CF_ROUTINGS_OPERATION
