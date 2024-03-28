// liệt kê các actions của hệ thống
const BASE_ACTIONS = 'ACT_BUDGET';
/**
 * CASE_1, CASE_2 tương ứng trong phần AUTH SERVICE, có 2 coll: user, company
 */
const BUDGET                        = 'BUDGET';
const BUDGET_ITEM                   = 'BUDGET_ITEM';
const BUDGET_GROUP                  = 'BUDGET_GROUP';
const BUDGET_WORK                   = 'BUDGET_WORK';
const BUDGET_SUBMITTAL              = 'BUDGET_SUBMITTAL';

const CF_ACTIONS_BUDGET = {
    /**
    * BUDGET
    */
    BUDGET_INSERT                                                   : `${BASE_ACTIONS}_INSERT`,
    BUDGET_UPDATE                                                   : `${BASE_ACTIONS}_UPDATE`,
    BUDGET_REMOVE                                                   : `${BASE_ACTIONS}_REMOVE`,
    BUDGET_GET_INFO_AND_GET_LIST                                    : `${BASE_ACTIONS}_GET_INFO_AND_GET_LIST`,
    BUDGET_UPDATE_VALUE                                             : `${BASE_ACTIONS}_UPDATE_VALUE`, 
    BUDGET_DOWNLOAD_TEMPLATE_EXCEL                                  : `${BASE_ACTIONS}_DOWNLOAD_TEMPLATE_EXCEL`,
    BUDGET_IMPORT_EXCEL                                             : `${BASE_ACTIONS}_IMPORT_EXCEL`,
    BUDGET_EXPORT_EXCEL                                             : `${BASE_ACTIONS}_EXPORT_EXCEL`,

    /**
    * BUDGET_ITEM
    */
    BUDGET_ITEM_INSERT                                              : `${BASE_ACTIONS}_${BUDGET_ITEM}_INSERT`,
    BUDGET_ITEM_UPDATE                                              : `${BASE_ACTIONS}_${BUDGET_ITEM}_UPDATE`,
    BUDGET_ITEM_REMOVE                                              : `${BASE_ACTIONS}_${BUDGET_ITEM}_REMOVE`,
    BUDGET_ITEM_GET_INFO_AND_GET_LIST                               : `${BASE_ACTIONS}_${BUDGET_ITEM}_GET_INFO_AND_GET_LIST`,   
    BUDGET_ITEM_UPDATE_VALUE                                        : `${BASE_ACTIONS}_${BUDGET_ITEM}_UPDATE_VALUE`, 
    
    /**
    * BUDGET_GROUP
    */
    BUDGET_GROUP_INSERT                                             : `${BASE_ACTIONS}_${BUDGET_GROUP}_INSERT`,
    BUDGET_GROUP_UPDATE                                             : `${BASE_ACTIONS}_${BUDGET_GROUP}_UPDATE`,
    BUDGET_GROUP_REMOVE                                             : `${BASE_ACTIONS}_${BUDGET_GROUP}_REMOVE`,
    BUDGET_GROUP_GET_INFO_AND_GET_LIST                              : `${BASE_ACTIONS}_${BUDGET_GROUP}_GET_INFO_AND_GET_LIST`, 
    BUDGET_GROUP_UPDATE_VALUE                                       : `${BASE_ACTIONS}_${BUDGET_GROUP}_UPDATE_VALUE`, 
    
    /**
    * BUDGET_WORK
    */
    BUDGET_WORK_INSERT                                              : `${BASE_ACTIONS}_${BUDGET_WORK}_INSERT`,
    BUDGET_WORK_UPDATE                                              : `${BASE_ACTIONS}_${BUDGET_WORK}_UPDATE`,
    BUDGET_WORK_REMOVE                                              : `${BASE_ACTIONS}_${BUDGET_WORK}_REMOVE`,
    BUDGET_WORK_GET_INFO_AND_GET_LIST                               : `${BASE_ACTIONS}_${BUDGET_WORK}_GET_INFO_AND_GET_LIST`,   
    BUDGET_WORK_UPDATE_VALUE                                        : `${BASE_ACTIONS}_${BUDGET_WORK}_UPDATE_VALUE`, 
    BUDGET_WORK_DOWNLOAD_TEMPLATE_EXCEL                             : `${BASE_ACTIONS}_${BUDGET_WORK}_DOWNLOAD_TEMPLATE_EXCEL`,
    BUDGET_WORK_IMPORT_EXCEL                                        : `${BASE_ACTIONS}_${BUDGET_WORK}_IMPORT_EXCEL`,
    BUDGET_WORK_EXPORT_EXCEL                                        : `${BASE_ACTIONS}_${BUDGET_WORK}_EXPORT_EXCEL`,
    BUDGET_WORK_COPY                                                : `${BASE_ACTIONS}_${BUDGET_WORK}_COPY`,
    
    /**
     * BUDGET_SUBMITTAL
     */
    BUDGET_SUBMITTAL_INSERT                                         : `${BASE_ACTIONS}_${BUDGET_SUBMITTAL}_INSERT`,
    BUDGET_SUBMITTAL_UPDATE                                         : `${BASE_ACTIONS}_${BUDGET_SUBMITTAL}_UPDATE`,
    BUDGET_SUBMITTAL_REMOVE                                         : `${BASE_ACTIONS}_${BUDGET_SUBMITTAL}_REMOVE`,
    BUDGET_SUBMITTAL_GET_INFO_AND_GET_LIST                          : `${BASE_ACTIONS}_${BUDGET_SUBMITTAL}_GET_INFO_AND_GET_LIST`,    
    BUDGET_SUBMITTAL_GET_LIST_BY_PROPERTY                           : `${BASE_ACTIONS}_${BUDGET_SUBMITTAL}_GET_LIST_BY_PROPERTY`, 

}

exports.CF_ACTIONS_BUDGET = CF_ACTIONS_BUDGET;