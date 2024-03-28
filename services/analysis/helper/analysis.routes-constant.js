const BASE_ROUTE = '/analysis'
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const HISTORY_TRAFFICS = '/history_traffics'
const HISTORY_LOGS = '/history_logs'
const HISTORY_DATAS = '/history_datas'

const CF_ROUTINGS_ANALYSIS = {
    ORIGIN_APP: BASE_ROUTE,

    // HISTORY_TRAFFIC
    HISTORY_TRAFFICS: `${BASE_ROUTE}${HISTORY_TRAFFICS}`,
    HISTORY_TRAFFIC_STATISTICS_DEVICE_ACCESS_BY_YEAR: `${BASE_ROUTE}${HISTORY_TRAFFICS}/statistics_device_access_by_year`,
    HISTORY_TRAFFIC_STATISTICS_BY_DEVICE_ACCESS: `${BASE_ROUTE}${HISTORY_TRAFFICS}/statistics_by_device_access`,
    HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_APP: `${BASE_ROUTE}${HISTORY_TRAFFICS}/statistics_access_by_app`,
    HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_COMPANY: `${BASE_ROUTE}${HISTORY_TRAFFICS}/statistics_access_by_company`,
    HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_APP_AND_DEVICE: `${BASE_ROUTE}${HISTORY_TRAFFICS}/statistics_access_by_app_and_device`,

    // HISTORY_TRAFFIC
    HISTORY_LOGS: `${BASE_ROUTE}${HISTORY_LOGS}`,

    /**
     * HISTORY_DATAS
     */
    HISTORY_DATAS_GET_DATA: `${BASE_ROUTE}${HISTORY_DATAS}/get_data`,
    HISTORY_DATAS_EXPORT_EXCEL: `${BASE_ROUTE}${HISTORY_DATAS}/export_excel`,
    HISTORY_DATAS_CONVERT_DATA: `${BASE_ROUTE}${HISTORY_DATAS}/convert_data`,
    HISTORY_DATAS_RESET_DATA: `${BASE_ROUTE}${HISTORY_DATAS}/reset_data`,
}

exports.CF_ROUTINGS_ANALYSIS = CF_ROUTINGS_ANALYSIS
