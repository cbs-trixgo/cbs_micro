const BASE_ROUTE = '/subject_pcm';
/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */

const PCM_PLAN_TASK         = '/pcm_plan_tasks';
const PCM_PLAN_REPORT       = '/pcm_plan_reports';
const USER_PCM_PLAN_REPORT  = '/user_pcm_plan_reports';
const PCM_PLAN_GROUP        = '/pcm_plan_groups';
const PCM_PLAN_TASK_COMMENT = '/pcm_comments';
const PCM_FILE              = '/pcm_files';

const CF_ROUTINGS_SUBJECT_PCM = {
    ORIGIN_APP: BASE_ROUTE,
    // ================================PCM_PLAN_TASK=======================================//
    PCM__PCM_PLAN_TASK                                          : `${BASE_ROUTE}${PCM_PLAN_TASK}`,
    // PCM__PCM_PLAN_TASK_GET_LIST_SUBJECT                         : `${BASE_ROUTE}${PCM_PLAN_TASK}/subject`,
    PCM__PCM_PLAN_TASK_GET_LIST_BY_FILTER                       : `${BASE_ROUTE}${PCM_PLAN_TASK}/filter`,
    PCM__PCM_PLAN_TASK_UPDATE_STATUS_MUTIPLE                    : `${BASE_ROUTE}${PCM_PLAN_TASK}/update-status-mutiple`,
    PCM__PCM_PLAN_TASK_GET_AMOUNT_NOTIFICATION                  : `${BASE_ROUTE}${PCM_PLAN_TASK}/notification`,
    PCM__PCM_PLAN_TASK_GET_DYNAMIC_REPORT                        : `${BASE_ROUTE}${PCM_PLAN_TASK}/dynamic-report`,
    PCM__PCM_PLAN_TASK_GET_BADGE                                : `${BASE_ROUTE}${PCM_PLAN_TASK}/badge`,
    PCM__PCM_PLAN_TASK_GET_BADGE_BIDDING                        : `${BASE_ROUTE}${PCM_PLAN_TASK}/badge-bidding`,
    PCM__PCM_PLAN_TASK_SEND_EMAIL_TO_MEMBER_IN_TASK             : `${BASE_ROUTE}${PCM_PLAN_TASK}/send-email-to-member-in-task`,
    PCM__PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_COMPANY_OF_ASSIGNEE   : `${BASE_ROUTE}${PCM_PLAN_TASK}/amount-task-of-company_of_assignee`,
    PCM__PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_COMPANY_OF_AUTHOR     : `${BASE_ROUTE}${PCM_PLAN_TASK}/amount-task-of-company_of_author`,
    PCM__PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_MILESTONE             : `${BASE_ROUTE}${PCM_PLAN_TASK}/amount-task-by-milestone`,
    PCM__PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_PROJECT               : `${BASE_ROUTE}${PCM_PLAN_TASK}/amount-task-of-projects`,
    PCM__PCM_PLAN_MOVE_TASK_TO_PARENT                           : `${BASE_ROUTE}${PCM_PLAN_TASK}/move-task-to-parent`,
    PCM__PCM_PLAN_MOVE_TASK_TO_GROUP                            : `${BASE_ROUTE}${PCM_PLAN_TASK}/move-task-to-group`,
    PCM__PCM_PLAN_COPY_TASK                                     : `${BASE_ROUTE}${PCM_PLAN_TASK}/copy-task`,
    PCM__PCM_PLAN_TASK_GET_LIST_BY_PROPERTY                     : `${BASE_ROUTE}${PCM_PLAN_TASK}/get-list-by-property`,
    PCM__PCM_PLAN_TASK_DOWNLOAD_EXCEL                           : `${BASE_ROUTE}${PCM_PLAN_TASK}/download-excel`,
    PCM__PCM_PLAN_TASK_DOWNLOAD_TEMPLATE_IMPORT_EXCEL           : `${BASE_ROUTE}${PCM_PLAN_TASK}/download-template-import-excel`,
    PCM__PCM_PLAN_TASK_IMPORT_TASK_FROM_EXCEL                   : `${BASE_ROUTE}${PCM_PLAN_TASK}/import-task-from-excel`,
    PCM__PCM_PLAN_TASK_REPAIR_DATA                              : `${BASE_ROUTE}${PCM_PLAN_TASK}/repair-data`,

    // Report
    SUBJECT__PCM_PLAN_REPORT                            : `${BASE_ROUTE}${PCM_PLAN_REPORT}`,
    SUBJECT__PCM_PLAN_REPORT_EXPORT_TASK                : `${BASE_ROUTE}${PCM_PLAN_REPORT}/export-task-report`,
    SUBJECT__USER_PCM_PLAN_REPORT                       : `${BASE_ROUTE}${USER_PCM_PLAN_REPORT}`,

    // Group
    SUBJECT__PCM_PLAN_GROUP                             : `${BASE_ROUTE}${PCM_PLAN_GROUP}`,
    SUBJECT__PCM_PLAN_GROUP_REMOVE_MANY                 : `${BASE_ROUTE}${PCM_PLAN_GROUP}/remove-many`,
    SUBJECT__PCM_PLAN_GROUP_DOWNLOAD_TEMPLATE_EXCEL     : `${BASE_ROUTE}${PCM_PLAN_GROUP}/download-template-excel`,
    SUBJECT__PCM_PLAN_GROUP_IMPORT_FROM_EXCEL           : `${BASE_ROUTE}${PCM_PLAN_GROUP}/import-from-excel`,
    SUBJECT__PCM_PLAN_GROUP_EXPORT_EXCEL                : `${BASE_ROUTE}${PCM_PLAN_GROUP}/export-excel`,

    //Comment
    SUBJECT_PCM__PCM_PLAN_TASK_COMMENT                              : `${BASE_ROUTE}${PCM_PLAN_TASK_COMMENT}`,
    SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_UPDATE_MARK                  : `${BASE_ROUTE}${PCM_PLAN_TASK_COMMENT}/mark`,
    SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_SEARCH_BY_ID                 : `${BASE_ROUTE}${PCM_PLAN_TASK_COMMENT}/search-by-id`,
    SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_SEARCH_BY_SUBJECT            : `${BASE_ROUTE}${PCM_PLAN_TASK_COMMENT}/search-by-subject`,
    SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_GET_LIST_BY_PROPERTY         : `${BASE_ROUTE}${PCM_PLAN_TASK_COMMENT}/get-list-by-property`,

    // Reaction_comment
    SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_REACTION         : `${BASE_ROUTE}${PCM_PLAN_TASK_COMMENT}/reactions`,

    // Pcm File
    PCM_FILE                                            : `${BASE_ROUTE}${PCM_FILE}`,
    PCM_FILE_GET_LIST_BY_FILTER                         : `${BASE_ROUTE}${PCM_FILE}/filter`,
    PCM_FILE_GROUP_BY_DATE                              : `${BASE_ROUTE}${PCM_FILE}/group-by-date`,
    PCM_FILE_GROUP_BY_CONTRACT                          : `${BASE_ROUTE}${PCM_FILE}/group-by-contract`,
    PCM_FILE_GROUP_BY_CONTRACT                          : `${BASE_ROUTE}${PCM_FILE}/group-by-contract`,

    PCM_FILES_DOWNLOAD                                  : `${BASE_ROUTE}${PCM_FILE}/downloads`,
    PCM_FILES_DOWNLOAD_IN_GROUP                         : `${BASE_ROUTE}${PCM_FILE}/downloads-in-group`,
}

exports.CF_ROUTINGS_SUBJECT_PCM = CF_ROUTINGS_SUBJECT_PCM;