// liệt kê các actions của hệ thống
const BASE_ACTIONS = 'ACT_EXAMPLE';
/**
 * CASE_1, CASE_2 tương ứng trong phần AUTH SERVICE, có 2 coll: user, company
 */
const CASE_1      = 'CASE_1';
const CASE_2      = 'CASE_2';

const CF_ACTIONS_EXAMPLE = {
    CASE_1_GET_LIST                        : `${BASE_ACTIONS}_${CASE_1}_CASE_1_GET_LIST`,
}

exports.CF_ACTIONS_EXAMPLE = CF_ACTIONS_EXAMPLE;