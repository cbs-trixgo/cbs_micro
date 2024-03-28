const BASE_ROUTE = '/reaction'
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const REACTION_CORE = '/reaction_cores'
const COMMENT_CORES = '/comment_cores'

const CF_ROUTINGS_REACTION = {
    ORIGIN_APP: BASE_ROUTE,

    // ================================COMMENT CORE=======================================//
    COMMENT_CORES: `${BASE_ROUTE}${COMMENT_CORES}`,

    // ================================REACTION CORE=======================================//
    REACTION_CORE: `${BASE_ROUTE}${REACTION_CORE}`,
}

exports.CF_ROUTINGS_REACTION = CF_ROUTINGS_REACTION
