const BASE_ROUTE = '/timesheet'

const CF_ROUTINGS_TIMESHEET = {
    // ==================== EXPERT TIMESHEET ========================
    EXPERT_TIMESHEET: `${BASE_ROUTE}/expert_timesheets`,
    EXPERT_TIMESHEET_GET_LIST_BY_PROPERTY: `${BASE_ROUTE}/expert_timesheets/get-list-by-property`,

    // ==================== EXPERT SALARY ========================
    EXPERT_SALARY: `${BASE_ROUTE}/expert_salary`,
    EXPERT_SALARY_SYNC_DATA: `${BASE_ROUTE}/expert_salary/sync-data`,
    EXPERT_SALARY_GET_LIST_BY_PROPERTY: `${BASE_ROUTE}/expert_salary/get-list-by-property`,
}

exports.CF_ROUTINGS_TIMESHEET = CF_ROUTINGS_TIMESHEET
