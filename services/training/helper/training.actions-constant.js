// liệt kê các actions của hệ thống
const BASE_ACTIONS = 'ACT_TRANINGS';
/**
 * CASE_1, CASE_2 tương ứng trong phần AUTH SERVICE, có 2 coll: user, company
 */
const SUBJECT          = 'SUBJECT';
const SUBJECT_RATING   = 'SUBJECT_RATING';

const CF_ACTIONS_TRAINING = {
    /**
     * SUBJECT
    */
    TRAINING__SUBJECT_INSERT      : `${BASE_ACTIONS}_${SUBJECT}_INSERT`,
    TRAINING__SUBJECT_UPDATE      : `${BASE_ACTIONS}_${SUBJECT}_UPDATE`,
    TRAINING__SUBJECT_REMOVE      : `${BASE_ACTIONS}_${SUBJECT}_REMOVE`,
    TRAINING__SUBJECT_GET_INFO_AND_GET_LIST : `${BASE_ACTIONS}_${SUBJECT}_GET_INFO_AND_GET_LIST`,
    /**
    * LESSION RATING
    */
    TRAINING__SUBJECT_RATING_INSERT      : `${BASE_ACTIONS}_${SUBJECT_RATING}_INSERT`,

}
exports.CF_ACTIONS_TRAINING = CF_ACTIONS_TRAINING;