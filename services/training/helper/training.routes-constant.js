const BASE_ROUTE = '/training'
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const SUBJECT = '/subjects'
const SUBJECT_RATING = '/subject_ratings'

const CF_ROUTINGS_TRAINING = {
  ORIGIN_APP: BASE_ROUTE,

  // ================================CONTRACT BILL JOB=======================================//
  TRAINING__SUBJECT: `${BASE_ROUTE}${SUBJECT}`,
  TRAINING__SUBJECT_RATING: `${BASE_ROUTE}${SUBJECT_RATING}`,
}

exports.CF_ROUTINGS_TRAINING = CF_ROUTINGS_TRAINING
