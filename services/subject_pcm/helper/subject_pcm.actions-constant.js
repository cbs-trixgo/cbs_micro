const BASE_ACTIONS = 'ACT_SUBJECT_PCM';

/**
 * CASE_1, CASE_2 tương ứng trong phần AUTH SERVICE, có 2 coll: user, company
 */
const PCM_PLAN_TASK                       = 'PCM_PLAN_TASK';
const PCM_PLAN_REPORT                     = 'PCM_PLAN_REPORT';
const USER_PCM_PLAN_REPORT                = 'USER_PCM_PLAN_REPORT';
const PCM_PLAN_GROUP                      = 'PCM_PLAN_GROUP';
const PCM_PLAN_TASK_COMMENT               = 'PCM_PLAN_TASK_COMMENT';
const PCM_FILE                            = 'PCM_FILE';

const CF_ACTIONS_SUBJECT_PCM = {
   /**
    * SUBJECT AND REPORT
    */
   PCM_PLAN_REPORT_INSERT                          : `${BASE_ACTIONS}_${PCM_PLAN_REPORT}_INSERT`,
   PCM_PLAN_REPORT_UPDATE                          : `${BASE_ACTIONS}_${PCM_PLAN_REPORT}_UPDATE`,
   PCM_PLAN_REPORT_REMOVE                          : `${BASE_ACTIONS}_${PCM_PLAN_REPORT}_REMOVE`,
   PCM_PLAN_REPORT_GET_INFO_AND_GET_LIST           : `${BASE_ACTIONS}_${PCM_PLAN_REPORT}_GET_INFO_AND_GET_LIST`,
   PCM_PLAN_REPORT_EXPORT_TASK_REPORT              : `${BASE_ACTIONS}_${PCM_PLAN_REPORT}_EXPORT_TASK_REPORT`,

  /**
   * USER_PCM_PLAN_REPORT
   */
   USER_PCM_PLAN_REPORT_INSERT                     : `${BASE_ACTIONS}_${USER_PCM_PLAN_REPORT}_INSERT`,
   USER_PCM_PLAN_REPORT_UPDATE                     : `${BASE_ACTIONS}_${USER_PCM_PLAN_REPORT}_UPDATE`,
   USER_PCM_PLAN_REPORT_REMOVE                     : `${BASE_ACTIONS}_${USER_PCM_PLAN_REPORT}_REMOVE`,
   USER_PCM_PLAN_REPORT_GET_INFO_AND_GET_LIST      : `${BASE_ACTIONS}_${USER_PCM_PLAN_REPORT}_GET_INFO_AND_GET_LIST`,

  /**
   * PCM_PLAN_TASK
   */
   PCM_PLAN_TASK_INSERT                            : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_INSERT`,
   PCM_PLAN_TASK_UPDATE                            : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_UPDATE`,
   PCM_PLAN_TASK_UPDATE_STATUS_MUTIPLE             : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_UPDATE_STATUS_MUTIPLE`,
   PCM_PLAN_TASK_GET_INFO_AND_GET_LIST             : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_INFO_AND_GET_LIST`,
   PCM_PLAN_TASK_GET_LIST_BY_FILTER                : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_LIST_BY_FILTER`,
   PCM_PLAN_TASK_GET_AMOUNT_NOTIFICATION           : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_AMOUNT_NOTIFICATION`,
   PCM_PLAN_TASK_GET_DYNAMIC_REPORT                : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_DYNAMIC_REPORT`,
   PCM_PLAN_TASK_GET_AMOUNT                        : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_AMOUNT`,
   PCM_PLAN_TASK_GET_BADGE_BIDDING                 : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_BADGE_BIDDING`,
   PCM_PLAN_TASK_SEND_EMAIL_TO_MEMBER_IN_TASK      : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_SEND_EMAIL_TO_MEMBER_IN_TASK`,
   PCM_PLAN_TASK_GET_TASK_OF_COMPANY_OF_ASSIGNEE   : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_TASK_OF_COMPANY_OF_ASSIGNEE`,
   PCM_PLAN_TASK_GET_TASK_OF_COMPANY_OF_AUTHOR     : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_TASK_OF_COMPANY_OF_AUTHOR`,
   PCM_PLAN_TASK_GET_TASK_OF_MILESTONE             : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_TASK_OF_MILESTONE`,
   PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_PROJECT        : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_AMOUNT_TASK_OF_PROJECT`,
   PCM_PLAN_TASK_MOVE_TASK_TO_PARENT               : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_MOVE_TASK_TO_PARENT`,
   PCM_PLAN_TASK_MOVE_TASK_TO_GROUP                : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_MOVE_TASK_TO_GROUP`,
   PCM_PLAN_TASK_COPY_TASK                         : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_COPY_TASK`,
   PCM_PLAN_TASK_GET_LIST_BY_PROPERTY              : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_GET_LIST_BY_PROPERTY`,
   PCM_PLAN_TASK_DOWNLOAD_EXCEL                    : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_DOWNLOAD_EXCEL`,
   PCM_PLAN_TASK_DOWNLOAD_TEMPLATE_IMPORT_EXCEL    : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_DOWNLOAD_TEMPLATE_IMPORT_EXCEL`,
   PCM_PLAN_TASK_IMPORT_TASK_FROM_EXCEL            : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_IMPORT_TASK_FROM_EXCEL`,
   PCM_PLAN_TASK_REPAIR_DATA                       : `${BASE_ACTIONS}_${PCM_PLAN_TASK}_REPAIR_DATA`,

   /**
   * USER_PCM_PLAN_GROUP
   */
   GROUP_INSERT                                    : `${BASE_ACTIONS}_${PCM_PLAN_GROUP}_INSERT`,
   GROUP_UPDATE                                    : `${BASE_ACTIONS}_${PCM_PLAN_GROUP}_UPDATE`,
   GROUP_REMOVE                                    : `${BASE_ACTIONS}_${PCM_PLAN_GROUP}_REMOVE`,
   GROUP_REMOVE_MANY                               : `${BASE_ACTIONS}_${PCM_PLAN_GROUP}_REMOVE_MANY`,
   GROUP_GET_INFO_AND_GET_LIST                     : `${BASE_ACTIONS}_${PCM_PLAN_GROUP}_GET_INFO_AND_GET_LIST`,
   GROUP_DOWNLOAD_TEMPLATE_EXCEL                   : `${BASE_ACTIONS}_${PCM_PLAN_GROUP}_DOWNLOAD_TEMPLATE_EXCEL`,
   GROUP_IMPORT_FROM_EXCEL                         : `${BASE_ACTIONS}_${PCM_PLAN_GROUP}_IMPORT_FROM_EXCEL `,
   GROUP_EXPORT_EXCEL                              : `${BASE_ACTIONS}_${PCM_PLAN_GROUP}_EXPORT_EXCEL`,

   /**
    * SUBJECT_PCM__PLAN_TASK_COMMENT
    */
   PCM_PLAN_TASK_COMMENT_INSERT                    : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_INSERT`,
   PCM_PLAN_TASK_COMMENT_UPDATE                    : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_UPDATE`,
   PCM_PLAN_TASK_COMMENT_UPDATE_MARK               : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_UPDATE_MARK`,
   PCM_PLAN_TASK_COMMENT_REMOVE                    : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_REMOVE`,
   PCM_PLAN_TASK_COMMENT_GET_INFO_AND_GET_LIST     : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_GET_INFO_AND_GET_LIST`,
   PCM_PLAN_TASK_COMMENT_SEARCH_BY_ID              : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_SEARCH_BY_ID`,
   PCM_PLAN_TASK_COMMENT_SEARCH_BY_SUBJECT         : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_SEARCH_BY_SUBJECT`,
   PCM_PLAN_TASK_COMMENT_GET_LIST_BY_PROPERTY      : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_GET_LIST_BY_PROPERTY`,

   /**
    * REACTION COMMENT PCM
    */
   PCM_PLAN_TASK_COMMENT_REACTION                  : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_REACTION`,
   PCM_PLAN_TASK_COMMENT_REACTION_GET_LIST         : `${BASE_ACTIONS}_${PCM_PLAN_TASK_COMMENT}_REACTION_GET_LIST`,

   /**
    * PCM FILE
    */
   PCM_FILE_GET_INFO_AND_GET_LIST                  : `${BASE_ACTIONS}_${PCM_FILE}_GET_INFO_AND_GET_LIST`,
   PCM_FILE_GET_LIST_BY_FILTER                     : `${BASE_ACTIONS}_${PCM_FILE}_GET_LIST_BY_FILTER`,
   PCM_FILE_GROUP_BY_DATE                          : `${BASE_ACTIONS}_${PCM_FILE}_GROUP_BY_DATE`,
   PCM_FILE_GROUP_BY_CONTRACT                      : `${BASE_ACTIONS}_${PCM_FILE}_GROUP_BY_CONTRACT`,

   PCM_FILES_DOWNLOAD                              : `${BASE_ACTIONS}_${PCM_FILE}_PCM_FILES_DOWNLOAD`,
   PCM_FILES_DOWNLOAD_IN_GROUP                     : `${BASE_ACTIONS}_${PCM_FILE}_PCM_FILES_DOWNLOAD_IN_GROUP`,
}

exports.CF_ACTIONS_SUBJECT_PCM = CF_ACTIONS_SUBJECT_PCM;