const BASE_ACTIONS = 'ACT_ANALYSIS';

const HISTORY_TRAFFIC      = 'HISTORY_TRAFFIC';
const HISTORY_LOG          = 'HISTORY_LOG';
const HISTORY_DATA          = 'HISTORY_DATA';

const CF_ACTIONS_ANALYSIS = {
    /**
    * HISTORY_TRAFFIC
    */
    HISTORY_TRAFFIC_INSERT                              : `${BASE_ACTIONS}_${HISTORY_TRAFFIC}_INSERT`,
    HISTORY_TRAFFIC_GET_INFO_AND_GET_LIST               : `${BASE_ACTIONS}_${HISTORY_TRAFFIC}_GET_INFO_AND_GET_LIST`,
    HISTORY_TRAFFIC_STATISTICS_DEVICE_ACCESS_BY_YEAR    : `${BASE_ACTIONS}_${HISTORY_TRAFFIC}_STATISTICS_DEVICE_ACCESS_BY_YEAR`,
    HISTORY_TRAFFIC_STATISTICS_BY_DEVICE_ACCESS         : `${BASE_ACTIONS}_${HISTORY_TRAFFIC}_STATISTICS_BY_DEVICE_ACCESS`,
    HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_APP            : `${BASE_ACTIONS}_${HISTORY_TRAFFIC}_STATISTICS_ACCESS_BY_APP`,
    HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_COMPANY        : `${BASE_ACTIONS}_${HISTORY_TRAFFIC}_STATISTICS_ACCESS_BY_COMPANY`,
    HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_APP_AND_DEVICE : `${BASE_ACTIONS}_${HISTORY_TRAFFIC}_STATISTICS_ACCESS_BY_APP_AND_DEVICE`,
    
    /**
    * HISTORY_LOG
    */
    HISTORY_LOG_INSERT                  : `${BASE_ACTIONS}_${HISTORY_LOG}_INSERT`,
    HISTORY_LOG_GET_INFO_AND_GET_LIST   : `${BASE_ACTIONS}_${HISTORY_LOG}_GET_INFO_AND_GET_LIST`,

    /**
     * OTHER
     */
    HISTORY_DATA_GET_DATA                      : `${BASE_ACTIONS}_${HISTORY_DATA}_GET_DATA`,
    HISTORY_DATA_EXPORT_EXCEL                  : `${BASE_ACTIONS}_${HISTORY_DATA}_EXPORT_EXCEL`,
    HISTORY_DATA_CONVERT_DATA                  : `${BASE_ACTIONS}_${HISTORY_DATA}_CONVERT_DATA`,
    HISTORY_DATA_RESET_DATA                    : `${BASE_ACTIONS}_${HISTORY_DATA}_RESET_DATA`,
}

exports.CF_ACTIONS_ANALYSIS = CF_ACTIONS_ANALYSIS;