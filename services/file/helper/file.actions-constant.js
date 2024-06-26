// liệt kê các actions của hệ thống
const BASE_ACTIONS = 'ACT_FILE';
/**
 * CASE_1, CASE_2 tương ứng trong phần AUTH SERVICE, có 2 coll: user, company
 */
const CORE = 'CORE'

const CF_ACTIONS_FILE = {
    INSERT_FILE                        : `${BASE_ACTIONS}_${CORE}_INSERT_FILE`,
    INSERT_FILE_MANY                   : `${BASE_ACTIONS}_${CORE}_INSERT_FILE_MANY`,
    UPDATE_FILE                        : `${BASE_ACTIONS}_${CORE}_UPDATE_FILE`,
    DELETE_FILE                        : `${BASE_ACTIONS}_${CORE}_DELETE_FILE`,
    GET_LIST_FILE_OF_USER_WITH_STATUS  : `${BASE_ACTIONS}_${CORE}_GET_LIST_FILE_OF_USER_WITH_STATUS`,
    GET_LIST_FILE_OF_SYSTEM            : `${BASE_ACTIONS}_${CORE}_GET_LIST_FILE_OF_SYSTEM`,
    GET_INFO_FILE                      : `${BASE_ACTIONS}_${CORE}_GET_INFO_FILE`,

    GENERATE_LINK_S3                   : `${BASE_ACTIONS}_${CORE}_GENERATE_LINK_S3`,
    DOWNLOAD_FILE_BY_URL               : `${BASE_ACTIONS}_${CORE}_DOWNLOAD_FILE_BY_URL`,
}

exports.CF_ACTIONS_FILE = CF_ACTIONS_FILE;