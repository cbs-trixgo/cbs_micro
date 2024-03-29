const BASE_ROUTE = '/files' //đối với những trường hợp service chỉ có 1 coll(chính nó là core) -> cần thêm 's' để đảm bảo restful API
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */

const CF_ROUTINGS_FILE = {
  ORIGIN_APP: BASE_ROUTE,

  FILES: `${BASE_ROUTE}`,
  FILE_DETAIL: `${BASE_ROUTE}/:fileID`,
  DELETE_FILE: `${BASE_ROUTE}/:fileID`,
  GET_LIST_FILE_OF_USER_WITH_STATUS: `${BASE_ROUTE}/users/:userID/status/:status`,

  GENERATE_LINK_S3: `${BASE_ROUTE}/generate-link-s3`,
  DOWNLOAD_FILE_BY_URL: `${BASE_ROUTE}/download-file-by-url`,
}

exports.CF_ROUTINGS_FILE = CF_ROUTINGS_FILE
