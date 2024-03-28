const BASE_ROUTE = '/personal'
const FRIEND_REQUEST = '/friend-request'
const NOTE = '/notes'

const CF_ROUTINGS_PERSONAL = {
    // ==================== FRIEND REQUEST ========================
    GET_CODE: `${BASE_ROUTE}${FRIEND_REQUEST}/get-code`,
    CHECK_CODE: `${BASE_ROUTE}${FRIEND_REQUEST}/check-code`,
    // NOTE
    NOTE: `${BASE_ROUTE}${NOTE}`,
}

exports.CF_ROUTINGS_PERSONAL = CF_ROUTINGS_PERSONAL
