// liệt kê các actions của hệ thống
const BASE_ACTIONS = 'ACT_BIDDING';
/**
 * CASE_1, CASE_2 tương ứng trong phần AUTH SERVICE, có 2 coll: user, company
 */
const BIIDING_PLAN              = 'BIIDING_PLAN';
const BIIDING_DOC               = 'BIIDING_DOC';
const BIIDING_REQUEST           = 'BIIDING_REQUEST';
const BIIDING_APPLY             = 'BIIDING_APPLY';
const BIIDING_QUOTATION         = 'BIIDING_QUOTATION';
const BIIDING_BILL_ITEM         = 'BIIDING_BILL_ITEM';
const BIIDING_BILL_GROUP        = 'BIIDING_BILL_GROUP';
const BIIDING_BILL_WORK         = 'BIIDING_BILL_WORK';
const BIIDING_BILL_WORKLINE     = 'BIIDING_BILL_WORKLINE';
const BIIDING_BILL_PRODUCT      = 'BIIDING_BILL_PRODUCT';

const CF_ACTIONS_BIDDING = {
    /**
    * BIIDING_PLAN
    */
    BIIDING_PLAN_INSERT                   : `${BASE_ACTIONS}_${BIIDING_PLAN}_INSERT`,
    BIIDING_PLAN_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_PLAN}_UPDATE`,
    BIIDING_PLAN_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_PLAN}_REMOVE`,
    BIIDING_PLAN_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_PLAN}_GET_INFO_AND_GET_LIST`,
    BIIDING_PLAN_CONTRACTOR_SELECTION     : `${BASE_ACTIONS}_${BIIDING_PLAN}_CONTRACTOR_SELECTION`,

    /**
    * BIIDING_DOC
    */
    BIIDING_DOC_INSERT                   : `${BASE_ACTIONS}_${BIIDING_DOC}_INSERT`,
    BIIDING_DOC_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_DOC}_UPDATE`,
    BIIDING_DOC_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_DOC}_REMOVE`,
    BIIDING_DOC_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_DOC}_GET_INFO_AND_GET_LIST`,

    /**
    * BIIDING_REQUEST
    */
    BIIDING_REQUEST_INSERT                   : `${BASE_ACTIONS}_${BIIDING_REQUEST}_INSERT`,
    BIIDING_REQUEST_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_REQUEST}_UPDATE`,
    BIIDING_REQUEST_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_REQUEST}_REMOVE`,
    BIIDING_REQUEST_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_REQUEST}_GET_INFO_AND_GET_LIST`, 

    /**
    * BIIDING_APPLY
    */
    BIIDING_APPLY_INSERT                   : `${BASE_ACTIONS}_${BIIDING_APPLY}_INSERT`,
    BIIDING_APPLY_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_APPLY}_UPDATE`,
    BIIDING_APPLY_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_APPLY}_REMOVE`,
    BIIDING_APPLY_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_APPLY}_GET_INFO_AND_GET_LIST`,

    /**
    * BIIDING_QUOTATION
    */
    BIIDING_QUOTATION_INSERT                   : `${BASE_ACTIONS}_${BIIDING_QUOTATION}_INSERT`,
    BIIDING_QUOTATION_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_QUOTATION}_UPDATE`,
    BIIDING_QUOTATION_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_QUOTATION}_REMOVE`,
    BIIDING_QUOTATION_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_QUOTATION}_GET_INFO_AND_GET_LIST`,  

    /**
    * BIIDING_BILL_ITEM
    */
    BIIDING_BILL_ITEM_INSERT                   : `${BASE_ACTIONS}_${BIIDING_BILL_ITEM}_INSERT`,
    BIIDING_BILL_ITEM_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_BILL_ITEM}_UPDATE`,
    BIIDING_BILL_ITEM_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_BILL_ITEM}_REMOVE`,
    BIIDING_BILL_ITEM_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_BILL_ITEM}_GET_INFO_AND_GET_LIST`,  

    /**
    * BIIDING_BILL_GROUP
    */
    BIIDING_BILL_GROUP_INSERT                   : `${BASE_ACTIONS}_${BIIDING_BILL_GROUP}_INSERT`,
    BIIDING_BILL_GROUP_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_BILL_GROUP}_UPDATE`,
    BIIDING_BILL_GROUP_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_BILL_GROUP}_REMOVE`,
    BIIDING_BILL_GROUP_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_BILL_GROUP}_GET_INFO_AND_GET_LIST`,  

    /**
    * BIIDING_BILL_WORK
    */
    BIIDING_BILL_WORK_INSERT                   : `${BASE_ACTIONS}_${BIIDING_BILL_WORK}_INSERT`,
    BIIDING_BILL_WORK_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_BILL_WORK}_UPDATE`,
    BIIDING_BILL_WORK_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_BILL_WORK}_REMOVE`,
    BIIDING_BILL_WORK_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_BILL_WORK}_GET_INFO_AND_GET_LIST`,  
    BIIDING_BILL_WORK_ASSIGN_TEMPLATE          : `${BASE_ACTIONS}_${BIIDING_BILL_WORK}_ASSIGN_TEMPLATE`,  
    BIIDING_BILL_WORK_UPDATE_PRODUCT_PRICE     : `${BASE_ACTIONS}_${BIIDING_BILL_WORK}_UPDATE_PRODUCT_PRICE`,  

    /**
    * BIIDING_BILL_WORKLINE
    */
    BIIDING_BILL_WORKLINE_INSERT                   : `${BASE_ACTIONS}_${BIIDING_BILL_WORKLINE}_INSERT`,
    BIIDING_BILL_WORKLINE_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_BILL_WORKLINE}_UPDATE`,
    BIIDING_BILL_WORKLINE_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_BILL_WORKLINE}_REMOVE`,
    BIIDING_BILL_WORKLINE_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_BILL_WORKLINE}_GET_INFO_AND_GET_LIST`,  

    /**
    * BIIDING_BILL_PRODUCT
    */
    BIIDING_BILL_PRODUCT_INSERT                   : `${BASE_ACTIONS}_${BIIDING_BILL_PRODUCT}_INSERT`,
    BIIDING_BILL_PRODUCT_UPDATE                   : `${BASE_ACTIONS}_${BIIDING_BILL_PRODUCT}_UPDATE`,
    BIIDING_BILL_PRODUCT_REMOVE                   : `${BASE_ACTIONS}_${BIIDING_BILL_PRODUCT}_REMOVE`,
    BIIDING_BILL_PRODUCT_GET_INFO_AND_GET_LIST    : `${BASE_ACTIONS}_${BIIDING_BILL_PRODUCT}_GET_INFO_AND_GET_LIST`,  
}

exports.CF_ACTIONS_BIDDING = CF_ACTIONS_BIDDING;