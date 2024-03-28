'use strict'

/**
 * MIDDLEWARE
 */
const { CF_DOMAIN_SERVICES } = require('./helper/domain.constant')
const { parseUserAgent } = require('../../tools/utils/utils')

/**
 * ------import route's Services---------
 */
const { CF_ROUTINGS_GATEWAY } = require('./helper/gateway.routes-constant')
const { CF_ROUTINGS_AUTH } = require('../auth/helper/auth.routes-constant')
const {
    CF_ROUTINGS_CHATTING,
} = require('../chatting/helper/chatting.routes-constant')
const {
    CF_ROUTINGS_DOCUMENT,
} = require('../document/helper/document.routes-constant')
const {
    CF_ROUTINGS_PAYMENT,
} = require('../payment/helper/payment.routes-constant')
const {
    CF_ROUTINGS_REMINDER,
} = require('../reminder/helper/reminder.routes-constant')
const { CF_ROUTINGS_FILE } = require('../file/helper/file.routes-constant')
const { CF_ROUTINGS_MEDIA } = require('../media/helper/media.routes-constant')
const { CF_ROUTINGS_ITEM } = require('../item/helper/item.routes-constant')
const { CF_ROUTINGS_CONTACT } = require('../human/helper/human.routes-constant')
const { CF_ROUTINGS_CMCS } = require('../cmcs/helper/cmcs.routes-constant')
const {
    CF_ROUTINGS_TRAINING,
} = require('../training/helper/training.routes-constant')
const {
    CF_ROUTINGS_SUBJECT_PCM,
} = require('../subject_pcm/helper/subject_pcm.routes-constant')
const {
    CF_ROUTINGS_OPERATION,
} = require('../operation/helper/operation.routes-constant')
const {
    CF_ROUTINGS_NOTIFICATION,
} = require('../notification/helper/notification.routes-constant')
const {
    CF_ROUTINGS_REACTION,
} = require('../reaction/helper/reaction.routes-constant')
const {
    CF_ROUTINGS_ANALYSIS,
} = require('../analysis/helper/analysis.routes-constant')
const {
    CF_ROUTINGS_ACCOUNTING,
} = require('../accounting/helper/accounting.routes-constant')
const {
    CF_ROUTINGS_TIMESHEET,
} = require('../timesheet/helper/timesheet.routes-constant')
const {
    CF_ROUTINGS_PERSONAL,
} = require('../personal/helper/personal.routes-constant')
const {
    CF_ROUTINGS_DATAHUB,
} = require('../datahub/helper/datahub.routes-constant')
const {
    CF_ROUTINGS_BIDDING,
} = require('../bidding/helper/bidding.routes-constant')
const { CF_ROUTINGS_FIN } = require('../fin/helper/fin.routes-constant')
const {
    CF_ROUTINGS_BUDGET,
} = require('../budget/helper/budget.routes-constant')
const { CF_ROUTINGS_FNB } = require('../fnb/helper/fnb.routes-constant')

/**
 * ------import action's Services--------
 */
const { CF_ACTIONS_GATEWAY } = require('./helper/gateway.actions-constant')
const { CF_ACTIONS_AUTH } = require('../auth/helper/auth.actions-constant')
const {
    CF_ACTIONS_CHATTING,
} = require('../chatting/helper/chatting.actions-constant')
const {
    CF_ACTIONS_DOCUMENT,
} = require('../document/helper/document.actions-constant')
const {
    CF_ACTIONS_PAYMENT,
} = require('../payment/helper/payment.actions-constant')
const {
    CF_ACTIONS_REMINDER,
} = require('../reminder/helper/reminder.actions-constant')
const { CF_ACTIONS_FILE } = require('../file/helper/file.actions-constant')
const { CF_ACTIONS_MEDIA } = require('../media/helper/media.actions-constant')
const { CF_ACTIONS_ITEM } = require('../item/helper/item.actions-constant')
const { CF_ACTIONS_CONTACT } = require('../human/helper/human.actions-constant')
const { CF_ACTIONS_CMCS } = require('../cmcs/helper/cmcs.actions-constant')
const {
    CF_ACTIONS_TRAINING,
} = require('../training/helper/training.actions-constant')
const {
    CF_ACTIONS_SUBJECT_PCM,
} = require('../subject_pcm/helper/subject_pcm.actions-constant')
const {
    CF_ACTIONS_OPERATION,
} = require('../operation/helper/operation.actions-constant')
const {
    CF_ACTIONS_NOTIFICATION,
} = require('../notification/helper/notification.actions-constant')
const {
    CF_ACTIONS_REACTION,
} = require('../reaction/helper/reaction.actions-constant')
const {
    CF_ACTIONS_ANALYSIS,
} = require('../analysis/helper/analysis.actions-constant')
const {
    CF_ACTIONS_ACCOUNTING,
} = require('../accounting/helper/accounting.actions-constant')
const {
    CF_ACTIONS_TIMESHEET,
} = require('../timesheet/helper/timesheet.actions-constant')
const {
    CF_ACTIONS_PERSONAL,
} = require('../personal/helper/personal.actions-constant')
const {
    CF_ACTIONS_DATAHUB,
} = require('../datahub/helper/datahub.actions-constant')
const {
    CF_ACTIONS_BIDDING,
} = require('../bidding/helper/bidding.actions-constant')
const { CF_ACTIONS_FIN } = require('../fin/helper/fin.actions-constant')
const {
    CF_ACTIONS_BUDGET,
} = require('../budget/helper/budget.actions-constant')
const { CF_ACTIONS_FNB } = require('../fnb/helper/fnb.actions-constant')

module.exports = {
    path: 'api',
    // authentication: true,
    authorization: true,

    // Cho phép truy cập tất cả các services
    whitelist: ['**'],

    aliases: {
        //--------------------------aliases's GATEWAY service--------------------------//
        [`GET ${CF_ROUTINGS_GATEWAY.CHECK_VERSION}`]: [
            `${CF_DOMAIN_SERVICES.GATEWAY}.${CF_ACTIONS_GATEWAY.CHECK_VERSION}`,
        ],

        //--------------------------aliases's AUTH service--------------------------//
        [`GET ${CF_ROUTINGS_AUTH.ME}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO}`,
        ],

        [`POST ${CF_ROUTINGS_AUTH.UPDATE_DEVICE_WHEN_LOGIN_MOBILE}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.UPDATE_DEVICE_WHEN_LOGIN_MOBILE}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.SEARCH_WITH_FIND}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.SEARCH_WITH_FIND}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.SEARCH_WITH_FULL_TEXT}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.SEARCH_WITH_FULL_TEXT}`,
        ],

        [`POST ${CF_ROUTINGS_AUTH.USERS}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_AUTH.USERS}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_AUTH.USERS}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_DELETE}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.USERS}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.GET_LIST_FRIEND}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_FRIEND}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.GET_LIST_USER_SEND_TO_FRIENDS}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_USER_SEND_TO_FRIENDS}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.GET_LIST_USER_RECEIVE_FROM_FRIENDS}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_USER_RECEIVE_FROM_FRIENDS}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.GET_LIST_USER}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_USER}`,
        ],

        [`POST ${CF_ROUTINGS_AUTH.USER_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_IMPORT_FROM_EXCEL}`,
        ],

        /**
         * Company
         */
        [`GET ${CF_ROUTINGS_AUTH.COMPANY}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_AND_GET_LIST_COMPANY}`,
        ],

        [`POST ${CF_ROUTINGS_AUTH.COMPANY}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.COMPANY_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_AUTH.COMPANY}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.COMPANY_UPDATE}`,
        ],

        /**
         * App
         */
        [`GET ${CF_ROUTINGS_AUTH.APP}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_GET_INFO_GET_LIST}`,
        ],

        /**
         * app menu
         */
        [`GET ${CF_ROUTINGS_AUTH.APP_MENU}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_MENU_GET_INFO_AND_GET_LIST}`,
        ],

        [`POST ${CF_ROUTINGS_AUTH.APP_MENU}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_MENU_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_AUTH.APP_MENU}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_MENU_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_AUTH.APP_MENU}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_MENU_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.APP_MENU_GET_LIST_COMPANY}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_MENU_GET_LIST_COMPANY}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.APP_MENU_GET_LIST_MOBILE_FNB_MENU}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_MENU_GET_LIST_MOBILE_FNB_MENU}`,
        ],

        /**
         * app role
         */
        [`POST ${CF_ROUTINGS_AUTH.APP_ROLE}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_ROLE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_AUTH.APP_ROLE}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_ROLE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_AUTH.APP_ROLE}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_ROLE_REMOVE}`,
        ],

        [`DELETE ${CF_ROUTINGS_AUTH.APP_ROLE_REMOVE_MANY}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_ROLE_REMOVE_MANY}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.APP_ROLE}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_ROLE_GET_INFO_AND_GET_LIST}`,
        ],

        /**
         * app user
         */
        [`GET ${CF_ROUTINGS_AUTH.APP_USER_LIST_APP_OFF_USER}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_USER_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.APP_USER_CHECK_PERMISSIONS_ACCESS_APP}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_USER_CHECK_PERMISSIONS_ACCESS_APP}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.APP_USER}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_USER_GET_LIST}`,
        ],

        [`POST ${CF_ROUTINGS_AUTH.APP_USER}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_USER_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_AUTH.APP_USER}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_USER_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_AUTH.APP_USER}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_USER_REMOVE}`,
        ],
        /**
         * app company
         */
        [`POST ${CF_ROUTINGS_AUTH.APP_COMPANY}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_COMPANY_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_AUTH.APP_COMPANY}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_COMPANY_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_AUTH.APP_COMPANY}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_COMPANY_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.APP_COMPANY}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_COMPANY_GET_INFO_AND_GET_LIST}`,
        ],

        /**
         * app role menu
         */
        [`POST ${CF_ROUTINGS_AUTH.APP_ROLE_MENU}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_ROLE_MENU_INSERT}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.APP_ROLE_MENU}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_ROLE_MENU_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.APP_ROLE_MENU_PERMISSION}`]: [
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_ROLE_MENU_GET_PERMISSION}`,
        ],

        [`GET ${CF_ROUTINGS_AUTH.APP_ROLE_MENU_GET_PERMISSION_TO_ACCESS_ONE_MENU_OF_APP}`]:
            [
                `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.APP_ROLE_MENU_GET_PERMISSION_TO_ACCESS_ONE_MENU_OF_APP}`,
            ],

        //--------------------------aliases's CHATTING service--------------------------//
        [`POST ${CF_ROUTINGS_CHATTING.INSERT_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.INSERT_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_CONVERSATION}`,
        ],

        [`POST ${CF_ROUTINGS_CHATTING.ADD_MEMBER_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.ADD_MEMBER_CONVERSATION}`,
        ],

        [`DELETE ${CF_ROUTINGS_CHATTING.REMOVE_MEMBER_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.REMOVE_MEMBER_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_ADMIN_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_ADMIN_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_CONFIG_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_CONFIG_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_PIN_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_PIN_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_INFO_CONVERSATION_BY_ID}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_INFO_CONVERSATION_BY_ID}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_INFO_GENERAL_GROUP_BY_MEMBER}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_INFO_GENERAL_GROUP_BY_MEMBER}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_MEMBER_CONVERSATION_BY_ID}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_MEMBER_CONVERSATION_BY_ID}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_MESSAGE_MEDIA_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_MEDIA_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_MEMBER_SEND_MESSAGE_MEDIA_CONVERSATION}`]:
            [
                `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_MEMBER_SEND_MESSAGE_MEDIA_CONVERSATION}`,
            ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_HIDE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_HIDE_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_MUTE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_MUTE_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.MARK_READ_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.MARK_READ_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.MEMBER_LEAVE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.MEMBER_LEAVE_CONVERSATION}`,
        ],

        [`DELETE ${CF_ROUTINGS_CHATTING.DELETE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.DELETE_CONVERSATION}`,
        ],

        [`DELETE ${CF_ROUTINGS_CHATTING.DELETE_HISTORY_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.DELETE_HISTORY_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_MESSAGE_CONVERSATION_WITH_PAGE}`]:
            [
                `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_CONVERSATION_WITH_PAGE}`,
            ],

        [`GET ${CF_ROUTINGS_CHATTING.SEARCH_MESSAGE_CONVERSATION_BY_ID}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.SEARCH_MESSAGE_CONVERSATION_BY_ID}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_CONVERSATION_WITH_PAGE}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_CONVERSATION_WITH_PAGE}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_PIN_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_PIN_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_CONVERSATION_MISS_MESSAGE}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_CONVERSATION_MISS_MESSAGE}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_FILE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_FILE_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_LINK_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_LINK_CONVERSATION}`,
        ],

        // ----------- FOLDER CONVERSATION -------------
        [`POST ${CF_ROUTINGS_CHATTING.INSERT_FOLDER_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.INSERT_FOLDER_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_FOLDER_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_FOLDER_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_CONVERSATION_TO_FOLDER}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_CONVERSATION_TO_FOLDER}`,
        ],

        [`DELETE ${CF_ROUTINGS_CHATTING.DELETE_FOLDER_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.DELETE_FOLDER_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_INFO_FOLDER_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_INFO_FOLDER_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_FOLDER_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_FOLDER_CONVERSATION}`,
        ],

        // ----------- MESSAGE -------------
        [`POST ${CF_ROUTINGS_CHATTING.INSERT_MESSAGE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.INSERT_MESSAGE_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_SEEN_MESSAGE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_SEEN_MESSAGE_CONVERSATION}`,
        ],

        [`DELETE ${CF_ROUTINGS_CHATTING.DELETE_MESSAGE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.DELETE_MESSAGE_CONVERSATION}`,
        ],

        [`POST ${CF_ROUTINGS_CHATTING.REVOKE_MESSAGE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.REVOKE_MESSAGE_CONVERSATION}`,
        ],

        [`POST ${CF_ROUTINGS_CHATTING.AUTO_DELETE_MESSAGE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.AUTO_DELETE_MESSAGE_CONVERSATION}`,
        ],

        [`POST ${CF_ROUTINGS_CHATTING.SHARE_MESSAGE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.SHARE_MESSAGE_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_PIN_MESSAGE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_PIN_MESSAGE_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_MESSAGE_PIN_CONVERSATION_WITH_PAGE}`]:
            [
                `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_PIN_CONVERSATION_WITH_PAGE}`,
            ],

        // ----------- MESSAGE POLL -------------
        [`POST ${CF_ROUTINGS_CHATTING.INSERT_MESSAGE_POLL_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.INSERT_MESSAGE_POLL_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_MESSAGE_POLL_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_MESSAGE_POLL_CONVERSATION}`,
        ],

        [`POST ${CF_ROUTINGS_CHATTING.CLOSE_MESSAGE_POLL_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.CLOSE_MESSAGE_POLL_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_MESSAGE_POLL_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_POLL_CONVERSATION}`,
        ],

        // ----------- MESSAGE REMINDER -------------
        [`POST ${CF_ROUTINGS_CHATTING.INSERT_MESSAGE_REMINDER_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.INSERT_MESSAGE_REMINDER_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_MESSAGE_REMINDER_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_MESSAGE_REMINDER_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_USER_JOIN_REMINDER_CONVERSATION}`]:
            [
                `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_USER_JOIN_REMINDER_CONVERSATION}`,
            ],

        [`DELETE ${CF_ROUTINGS_CHATTING.DELETE_MESSAGE_REMINDER_CONVERSATION}`]:
            [
                `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.DELETE_MESSAGE_REMINDER_CONVERSATION}`,
            ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_MESSAGE_REMINDER_CONVERSATION}`]:
            [
                `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_REMINDER_CONVERSATION}`,
            ],

        // ----------- MESSAGE NPS -------------
        [`POST ${CF_ROUTINGS_CHATTING.INSERT_MESSAGE_NPS_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.INSERT_MESSAGE_NPS_CONVERSATION}`,
        ],

        [`PUT ${CF_ROUTINGS_CHATTING.UPDATE_MESSAGE_NPS_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_MESSAGE_NPS_CONVERSATION}`,
        ],

        [`POST ${CF_ROUTINGS_CHATTING.CLOSE_MESSAGE_NPS_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.CLOSE_MESSAGE_NPS_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_MESSAGE_NPS_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_NPS_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_SCORE_STATISTICS_NPS}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_SCORE_STATISTICS_NPS}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_REASON_STATISTICS_NPS}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_REASON_STATISTICS_NPS}`,
        ],

        // ----------- REACTION MESSAGE -------------
        [`POST ${CF_ROUTINGS_CHATTING.REACTION_MESSAGE_CONVERSATION}`]: [
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.REACTION_MESSAGE_CONVERSATION}`,
        ],

        [`GET ${CF_ROUTINGS_CHATTING.GET_LIST_REACTION_MESSAGE_CONVERSATION}`]:
            [
                `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.GET_LIST_REACTION_MESSAGE_CONVERSATION}`,
            ],

        //--------------------------aliases's PAYMENT service--------------------------//
        [`GET ${CF_ROUTINGS_PAYMENT.GET_LIST_TRANSACTION}`]: [
            `${CF_DOMAIN_SERVICES.PAYMENT}.${CF_ACTIONS_PAYMENT.GET_LIST_TRANSACTION}`,
        ],

        [`GET ${CF_ROUTINGS_PAYMENT.GET_LIST_TRANSACTION_BY_USER_WITH_STATUS}`]:
            [
                `${CF_DOMAIN_SERVICES.PAYMENT}.${CF_ACTIONS_PAYMENT.GET_LIST_TRANSACTION_BY_USER_WITH_STATUS}`,
            ],

        [`PUT ${CF_ROUTINGS_PAYMENT.UPDATE_STATUS}`]: [
            `${CF_DOMAIN_SERVICES.PAYMENT}.${CF_ACTIONS_PAYMENT.UPDATE_STATUS}`,
        ],

        [`POST ${CF_ROUTINGS_PAYMENT.CREATE_URL_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.PAYMENT}.${CF_ACTIONS_PAYMENT.CREATE_URL_PAYMENT}`,
        ],

        [`GET ${CF_ROUTINGS_PAYMENT.URL_RETURN_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.PAYMENT}.${CF_ACTIONS_PAYMENT.URL_RETURN_PAYMENT}`,
        ],

        //--------------------------aliases's REMINDER service--------------------------//
        [`GET ${CF_ROUTINGS_REMINDER.REMINDERS}`]: [
            `${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.ADD_JOB}`,
        ],

        //--------------------------aliases's FILE service--------------------------//
        [`POST ${CF_ROUTINGS_FILE.FILES}`]: [
            `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.INSERT_FILE}`,
        ],

        [`PUT ${CF_ROUTINGS_FILE.FILES}`]: [
            `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.UPDATE_FILE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FILE.FILES}`]: [
            `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.DELETE_FILE}`,
        ],

        [`GET ${CF_ROUTINGS_FILE.GET_LIST_FILE_OF_USER_WITH_STATUS}`]: [
            `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_LIST_FILE_OF_USER_WITH_STATUS}`,
        ],

        [`GET ${CF_ROUTINGS_FILE.DOWNLOAD_FILE_BY_URL}`]: [
            `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.DOWNLOAD_FILE_BY_URL}`,
        ],

        [`POST ${CF_ROUTINGS_FILE.GENERATE_LINK_S3}`]: [
            `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GENERATE_LINK_S3}`,
        ],

        //---------------------------🏁 START SERVICE ITEM 🏁---------------------------//
        /**
         * Department
         */
        [`POST ${CF_ROUTINGS_ITEM.DEPARTMENTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.DEPARTMENTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.DEPARTMENT_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE_VALUE}`,
        ],

        [`DELETE ${CF_ROUTINGS_ITEM.DEPARTMENTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.DEPARTMENTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.LIST_DEPARTMENT_IS_MEMBERS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST_IS_MEMBERS}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.DEPARTMENTS_ANALYSIS_ONTIME_ONBUDGET}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_ANALYSIS_ONTIME_ON_BUDGET}`,
        ],

        /**
         * Doctype
         */
        [`POST ${CF_ROUTINGS_ITEM.DOCTYPES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DOCTYPE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.DOCTYPES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DOCTYPE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_ITEM.DOCTYPES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DOCTYPE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.DOCTYPES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DOCTYPE_GET_INFO_AND_GET_LIST}`,
        ],

        [`POST ${CF_ROUTINGS_ITEM.DOCTYPES_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DOCTYPE_IMPORT_FROM_EXCEL}`,
        ],

        /**
         * Contract
         */
        [`GET ${CF_ROUTINGS_ITEM.CONTRACTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.CONTRACT_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_UPDATE_VALUE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.LIST_CONTRACT_IS_MEMBERS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_LIST_CONTRACT_IS_MEMBERS}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTRACT_GET_LIST_BY_FILTER}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_LIST_BY_FILTER}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTRACT_GET_LIST_GUARANTEE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_LIST_GUARANTEE}`,
        ],

        [`POST ${CF_ROUTINGS_ITEM.CONTRACTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.CONTRACTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_ITEM.CONTRACTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTRACT_GET_AMOUNT_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_AMOUNT_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTRACT_GET_LIST_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_LIST_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTRACT_GET_AMOUNT_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_AMOUNT_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTRACT_GET_RETAIN_PRODUCE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_RETAIN_PRODUCE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTRACT_GET_INVENTORY}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_INVENTORY}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTRACT_STATISTICAL_STATUS_BY_ONTIME_ON_BUDGET}`]:
            [
                `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_STATISTICAL_STATUS_BY_ONTIME_ON_BUDGET}`,
            ],

        [`POST ${CF_ROUTINGS_ITEM.CONTRACT_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_IMPORT_FROM_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_ITEM.CONTRACT_EXPORT}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_EXPORT}`,
        ],

        /**
         * Contact
         */
        [`GET ${CF_ROUTINGS_ITEM.CONTACTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTACTS_GET_LIST_BY_FILTER}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_GET_LIST_BY_FILTER}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTACTS_PRODUCT_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_GET_LIST_BY_PROPERTY}`,
        ],

        [`POST ${CF_ROUTINGS_ITEM.CONTACTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.CONTACTS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTACTS_GET_LIST_OF_SYSTEM}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_GET_LIST_OF_SYSTEM}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTACTS_GET_LIST_ACCESS_BY_CONTRACT}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_GET_LIST_ACCESS_BY_CONTRACT}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONTACT_DOWNLOAD_TEMPLATE_IMPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_DOWNLOAD_TEMPLATE_IMPORT_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_ITEM.CONTACT_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_IMPORT_FROM_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_ITEM.CONTACT_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_EXPORT_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_ITEM.CONTACT_EXPORT_EXCEL_BY_FILTER}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTACT_EXPORT_EXCEL_BY_FILTER}`,
        ],

        /**
         * Warehouse
         */
        [`POST ${CF_ROUTINGS_ITEM.WAREHOUSES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.WAREHOUSE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.WAREHOUSES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.WAREHOUSE_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.WAREHOUSES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.WAREHOUSE_GET_INFO_AND_GET_LIST}`,
        ],

        /**
         * Area
         */
        [`POST ${CF_ROUTINGS_ITEM.AREA}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.AREA_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.AREA}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.AREA_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.AREA}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.AREA_GET_INFO_AND_GET_LIST}`,
        ],

        /**
         * Position
         */
        [`POST ${CF_ROUTINGS_ITEM.POSITION}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.POSITION_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.POSITION}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.POSITION_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_ITEM.POSITION}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.POSITION_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.POSITION}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.POSITION_GET_INFO_AND_GET_LIST}`,
        ],

        /**
         * Storage
         */
        [`GET ${CF_ROUTINGS_ITEM.STORAGE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.STORAGE_GET_INFO_AND_GET_LIST}`,
        ],

        [`POST ${CF_ROUTINGS_ITEM.STORAGE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.STORAGE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.STORAGE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.STORAGE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_ITEM.STORAGE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.STORAGE_REMOVE}`,
        ],

        /**
         * Account
         */
        [`POST ${CF_ROUTINGS_ITEM.ACCOUNT}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.ACCOUNT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.ACCOUNT}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.ACCOUNT_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.ACCOUNT}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.ACCOUNT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.ACCOUNT_GET_LIST_NESTED}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.ACCOUNT_GET_LIST_NESTED}`,
        ],

        /**
         * Goods
         */
        [`POST ${CF_ROUTINGS_ITEM.GOODS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.GOOD_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.GOODS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.GOOD_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.GOODS}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.GOOD_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.GOOD_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.GOOD_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_ITEM.GOOD_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.GOOD_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.GOOD_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.GOOD_EXPORT_EXCEL}`,
        ],

        /**
         * Signature
         */
        [`POST ${CF_ROUTINGS_ITEM.SIGNATURE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.SIGNATURE_INSERT}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.SIGNATURE}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.SIGNATURE_GET_INFO_AND_GET_LIST}`,
        ],

        /**
         * funda
         */
        [`POST ${CF_ROUTINGS_ITEM.FUNDA}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.FUNDA_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.FUNDA}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.FUNDA_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.FUNDA}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.FUNDA_GET_INFO_AND_GET_LIST}`,
        ],

        /**
         * department_directory
         */
        [`POST ${CF_ROUTINGS_ITEM.DEPARTMENT_DIRECTORIES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_DIRECTORY_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.DEPARTMENT_DIRECTORIES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_DIRECTORY_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.DEPARTMENT_DIRECTORIES}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_DIRECTORY_GET_INFO_AND_GET_LIST}`,
        ],

        /**
         * Config
         */
        [`POST ${CF_ROUTINGS_ITEM.CONFIG}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONFIG_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ITEM.CONFIG}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONFIG_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_ITEM.CONFIG}`]: [
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONFIG_GET_INFO_AND_GET_LIST}`,
        ],

        //------------------------------END SEARVICE ITEM---------------------------//

        //---------------------------🏁 START SEARVICE CMCS 🏁---------------------------//
        // Contract_product
        [`POST ${CF_ROUTINGS_CMCS.CONTRACT_PRODUCTION}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_PRODUCTION}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CMCS.CONTRACT_PRODUCTION}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_PRODUCTION}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_PRODUCTION_GET_LIST_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_LIST_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_PRODUCTION_GET_AMOUNT_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_AMOUNT_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_PRODUCTION_GET_AMOUNT_BY_PROPERTY}`]:
            [
                `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PRODUCTION_GET_AMOUNT_BY_PROPERTY}`,
            ],

        // Contract_ipc
        [`POST ${CF_ROUTINGS_CMCS.CONTRACT_IPC}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_IPC}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CMCS.CONTRACT_IPC}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_IPC}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_IPC_GET_LIST_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_GET_LIST_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_OBJECT}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_OBJECT}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_GET_AMOUNT_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_IPC_DOWNLOAD_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_DOWNLOAD_EXCEL}`,
        ],

        // Contract_payment
        [`POST ${CF_ROUTINGS_CMCS.CONTRACT_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PAYMENT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PAYMENT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CMCS.CONTRACT_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PAYMENT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PAYMENT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_PAYMENT_GET_LIST_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PAYMENT_GET_LIST_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_PAYMENT_GET_AMOUNT_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PAYMENT_GET_AMOUNT_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_PAYMENT_GET_AMOUNT_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_PAYMENT_GET_AMOUNT_BY_PROPERTY}`,
        ],

        // Contract_expenese
        [`POST ${CF_ROUTINGS_CMCS.CONTRACT_EXPENSE}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_EXPENSE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_EXPENSE}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_EXPENSE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CMCS.CONTRACT_EXPENSE}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_EXPENSE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_EXPENSE}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_EXPENSE_GET_LIST_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_LIST_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_EXPENSE_GET_AMOUNT_BY_MONTH}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_AMOUNT_BY_MONTH}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_EXPENSE_GET_AMOUNT_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_AMOUNT_BY_PROPERTY}`,
        ],

        // CONTRACT_BILL_ITEM
        [`POST ${CF_ROUTINGS_CMCS.CONTRACT_BILL_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_BILL_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CMCS.CONTRACT_BILL_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_BILL_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_BILL_ITEM_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_ITEM_UPDATE_VALUE}`,
        ],

        // CONTRACT_BILL_GROUP
        [`POST ${CF_ROUTINGS_CMCS.CONTRACT_BILL_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_BILL_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CMCS.CONTRACT_BILL_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_BILL_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_BILL_GROUP_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_GROUP_UPDATE_VALUE}`,
        ],

        // CONTRACT_BILL_JOB
        [`POST ${CF_ROUTINGS_CMCS.CONTRACT_BILL_JOB}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_BILL_JOB}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CMCS.CONTRACT_BILL_JOB}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_BILL_JOB}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_BILL_JOB_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_BILL_JOB_UPDATE_VALUE}`,
        ],

        // CONTRACT_IPC_DETAIL
        [`POST ${CF_ROUTINGS_CMCS.CONTRACT_IPC_DETAIL}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_DETAIL_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_IPC_DETAIL}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_DETAIL_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CMCS.CONTRACT_IPC_DETAIL}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_DETAIL_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_IPC_DETAIL}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_IPC_DETAIL_GET_INFO_AND_GET_LIST}`,
        ],

        //____cmcs_submittal
        [`POST ${CF_ROUTINGS_CMCS.CONTRACT_SUBMITTAL}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CMCS.CONTRACT_SUBMITTAL}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CMCS.CONTRACT_SUBMITTAL}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_SUBMITTAL}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_CMCS.CONTRACT_SUBMITTAL_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_SUBMITTAL_GET_LIST_BY_PROPERTY}`,
        ],

        //-------------------------------END SEARVICE CMCS---------------------------//

        //---------------------------🏁 START SEARVICE HUMAN (CONTACT) 🏁------------------------//
        //________Contact document
        [`GET ${CF_ROUTINGS_CONTACT.CONTACT_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.HUMAN}.${CF_ACTIONS_CONTACT.CONTACT_DOCUMENT_GET_INFO_AND_GET_LIST}`,
        ],

        [`POST ${CF_ROUTINGS_CONTACT.CONTACT_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.HUMAN}.${CF_ACTIONS_CONTACT.CONTACT_DOCUMENT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_CONTACT.CONTACT_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.HUMAN}.${CF_ACTIONS_CONTACT.CONTACT_DOCUMENT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_CONTACT.CONTACT_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.HUMAN}.${CF_ACTIONS_CONTACT.CONTACT_DOCUMENT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_CONTACT.CONTACT_DOCUMENT_FILTER}`]: [
            `${CF_DOMAIN_SERVICES.HUMAN}.${CF_ACTIONS_CONTACT.CONTACT_DOCUMENT_FILTER}`,
        ],

        [`POST ${CF_ROUTINGS_CONTACT.CONTACT_DOCUMENT_EXPORT_ECXEL}`]: [
            `${CF_DOMAIN_SERVICES.HUMAN}.${CF_ACTIONS_CONTACT.CONTACT_DOCUMENT_EXPORT_ECXEL}`,
        ],

        //---------------------------- END SEARVICE HUMAN (CONTACT) --------------------------------//

        //---------------------------🏁 START SEARVICE TRAINING 🏁--------------------------------//
        //______traning subject
        //F02504 || F02505
        [`GET ${CF_ROUTINGS_TRAINING.TRAINING__SUBJECT}`]: [
            `${CF_DOMAIN_SERVICES.TRAINING}.${CF_ACTIONS_TRAINING.TRAINING__SUBJECT_GET_INFO_AND_GET_LIST}`,
        ],

        //F02501
        [`POST ${CF_ROUTINGS_TRAINING.TRAINING__SUBJECT}`]: [
            `${CF_DOMAIN_SERVICES.TRAINING}.${CF_ACTIONS_TRAINING.TRAINING__SUBJECT_INSERT}`,
        ],

        //F02502
        [`PUT ${CF_ROUTINGS_TRAINING.TRAINING__SUBJECT}`]: [
            `${CF_DOMAIN_SERVICES.TRAINING}.${CF_ACTIONS_TRAINING.TRAINING__SUBJECT_UPDATE}`,
        ],

        //F02503
        [`DELETE ${CF_ROUTINGS_TRAINING.TRAINING__SUBJECT}`]: [
            `${CF_DOMAIN_SERVICES.TRAINING}.${CF_ACTIONS_TRAINING.TRAINING__SUBJECT_REMOVE}`,
        ],

        //______training subject rating
        // F02506
        [`POST ${CF_ROUTINGS_TRAINING.TRAINING__SUBJECT_RATING}`]: [
            `${CF_DOMAIN_SERVICES.TRAINING}.${CF_ACTIONS_TRAINING.TRAINING__SUBJECT_RATING_INSERT}`,
        ],

        //---------------------------- END SEARVICE TRAINING ---------------------------//

        //---------------------------🏁 START S024.MEDIA 🏁---------------------------//
        [`POST ${CF_ROUTINGS_MEDIA.MAIN_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.INSERT_MEDIA}`,
        ],

        [`PUT ${CF_ROUTINGS_MEDIA.MAIN_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.UPDATE_MEDIA}`,
        ],

        [`DELETE ${CF_ROUTINGS_MEDIA.MAIN_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.DELETE_MEDIA}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.MAIN_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.LIST_MEDIA}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.INFO_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.INFO_MEDIA}`,
        ],

        [`PUT ${CF_ROUTINGS_MEDIA.UPDATE_VIEW_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.UPDATE_VIEW_MEDIA}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.LIST_SEEN_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.LIST_SEEN_MEDIA}`,
        ],

        [`POST ${CF_ROUTINGS_MEDIA.SAVE_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.SAVE_MEDIA}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.SAVE_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.LIST_SAVE_MEDIA}`,
        ],

        [`POST ${CF_ROUTINGS_MEDIA.PIN_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.PIN_MEDIA}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.PIN_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.LIST_PIN_MEDIA}`,
        ],

        /**
         * FILE
         */
        [`GET ${CF_ROUTINGS_MEDIA.FILE_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.GET_INFO_AND_GET_LIST_MEMDIA_FILE}`,
        ],

        /**
         * REACTION
         */
        [`POST ${CF_ROUTINGS_MEDIA.REACTION_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.REACTION_MEDIA}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.REACTION_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.GET_LIST_REACTION_MEDIA}`,
        ],

        [`POST ${CF_ROUTINGS_MEDIA.REACTION_FILE}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.REACTION_FILE}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.REACTION_FILE}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.GET_LIST_REACTION_FILE}`,
        ],

        [`POST ${CF_ROUTINGS_MEDIA.REACTION_COMMENT_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.REACTION_COMMENT_MEDIA}`,
        ],

        [`POST ${CF_ROUTINGS_MEDIA.REACTION_COMMENT_FILE}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.REACTION_COMMENT_FILE}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.REACTION_COMMENT}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.GET_LIST_REACTION_COMMENT}`,
        ],

        /**
         * COMMENT
         */
        [`POST ${CF_ROUTINGS_MEDIA.COMMENT_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.INSERT_COMMENT_MEDIA}`,
        ],

        [`PUT ${CF_ROUTINGS_MEDIA.COMMENT_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.UPDATE_COMMENT_MEDIA}`,
        ],

        [`DELETE ${CF_ROUTINGS_MEDIA.COMMENT_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.DELETE_COMMENT_MEDIA}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.COMMENT_MEDIA}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.GET_INFO_AND_GET_LIST_COMMENT_MEDIA}`,
        ],

        [`POST ${CF_ROUTINGS_MEDIA.COMMENT_FILE}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.INSERT_COMMENT_FILE}`,
        ],

        [`PUT ${CF_ROUTINGS_MEDIA.COMMENT_FILE}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.UPDATE_COMMENT_FILE}`,
        ],

        [`DELETE ${CF_ROUTINGS_MEDIA.COMMENT_FILE}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.DELETE_COMMENT_FILE}`,
        ],

        [`GET ${CF_ROUTINGS_MEDIA.COMMENT_FILE}`]: [
            `${CF_DOMAIN_SERVICES.MEDIA}.${CF_ACTIONS_MEDIA.GET_INFO_AND_GET_LIST_COMMENT_FILE}`,
        ],

        //---------------------------🏁 END S024.MEDIA 🏁---------------------------//

        //---------------------------🏁 START S014.SUBJECT AND PCM 🏁---------------------------//
        [`POST ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_REPORT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_REPORT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_REPORT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_REPORT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_REPORT_EXPORT_TASK}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_REPORT_EXPORT_TASK_REPORT}`,
            ],

        [`POST ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__USER_PCM_PLAN_REPORT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.USER_PCM_PLAN_REPORT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__USER_PCM_PLAN_REPORT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.USER_PCM_PLAN_REPORT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__USER_PCM_PLAN_REPORT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.USER_PCM_PLAN_REPORT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__USER_PCM_PLAN_REPORT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.USER_PCM_PLAN_REPORT_GET_INFO_AND_GET_LIST}`,
        ],

        //----------------------------pcm_plan_tasks
        [`POST ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_UPDATE}`,
        ],

        [`PUT ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_UPDATE_STATUS_MUTIPLE}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_UPDATE_STATUS_MUTIPLE}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_LIST_SUBJECT}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_LIST_SUBJECT}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_LIST_BY_FILTER}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_LIST_BY_FILTER}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_AMOUNT_NOTIFICATION}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_AMOUNT_NOTIFICATION}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_DYNAMIC_REPORT}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_DYNAMIC_REPORT}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_BADGE}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_AMOUNT}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_BADGE_BIDDING}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_BADGE_BIDDING}`,
            ],

        [`POST ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_SEND_EMAIL_TO_MEMBER_IN_TASK}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_SEND_EMAIL_TO_MEMBER_IN_TASK}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_COMPANY_OF_ASSIGNEE}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_TASK_OF_COMPANY_OF_ASSIGNEE}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_COMPANY_OF_AUTHOR}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_TASK_OF_COMPANY_OF_AUTHOR}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_MILESTONE}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_TASK_OF_MILESTONE}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_PROJECT}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_AMOUNT_TASK_OF_PROJECT}`,
            ],

        [`POST ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_MOVE_TASK_TO_PARENT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_MOVE_TASK_TO_PARENT}`,
        ],

        [`POST ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_MOVE_TASK_TO_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_MOVE_TASK_TO_GROUP}`,
        ],

        [`POST ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_COPY_TASK}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COPY_TASK}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_GET_LIST_BY_PROPERTY}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_LIST_BY_PROPERTY}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_DOWNLOAD_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_DOWNLOAD_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_DOWNLOAD_TEMPLATE_IMPORT_EXCEL}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_DOWNLOAD_TEMPLATE_IMPORT_EXCEL}`,
            ],

        [`POST ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_IMPORT_TASK_FROM_EXCEL}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_IMPORT_TASK_FROM_EXCEL}`,
            ],

        [`POST ${CF_ROUTINGS_SUBJECT_PCM.PCM__PCM_PLAN_TASK_REPAIR_DATA}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_REPAIR_DATA}`,
        ],

        //----------------------------pcm_plan_groups
        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.GROUP_GET_INFO_AND_GET_LIST}`,
        ],

        [`POST ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.GROUP_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.GROUP_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.GROUP_REMOVE}`,
        ],

        [`DELETE ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_GROUP_REMOVE_MANY}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.GROUP_REMOVE_MANY}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_GROUP_DOWNLOAD_TEMPLATE_EXCEL}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.GROUP_DOWNLOAD_TEMPLATE_EXCEL}`,
            ],

        [`POST ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_GROUP_IMPORT_FROM_EXCEL}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.GROUP_IMPORT_FROM_EXCEL}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT__PCM_PLAN_GROUP_EXPORT_EXCEL}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.GROUP_EXPORT_EXCEL}`,
            ],

        //----------------------------pcm_plan_task_comments
        [`POST ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_INSERT}`,
            ],

        [`PUT ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_REMOVE}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_UPDATE_MARK}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_UPDATE_MARK}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_SEARCH_BY_ID}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_SEARCH_BY_ID}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_SEARCH_BY_SUBJECT}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_SEARCH_BY_SUBJECT}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_GET_LIST_BY_PROPERTY}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_GET_LIST_BY_PROPERTY}`,
            ],

        //----------------------------pcm_plan_task_comments
        [`POST ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_REACTION}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_REACTION}`,
            ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.SUBJECT_PCM__PCM_PLAN_TASK_COMMENT_REACTION}`]:
            [
                `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_REACTION_GET_LIST}`,
            ],

        //----------------------------pcm_files
        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM_FILE}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_FILE_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM_FILE_GET_LIST_BY_FILTER}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_FILE_GET_LIST_BY_FILTER}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM_FILE_GROUP_BY_DATE}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_FILE_GROUP_BY_DATE}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM_FILE_GROUP_BY_CONTRACT}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_FILE_GROUP_BY_CONTRACT}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM_FILES_DOWNLOAD}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_FILES_DOWNLOAD}`,
        ],

        [`GET ${CF_ROUTINGS_SUBJECT_PCM.PCM_FILES_DOWNLOAD_IN_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_FILES_DOWNLOAD_IN_GROUP}`,
        ],

        //---------------------------🏁 END S014.SUBJECT AND PCM 🏁---------------------------//

        //---------------------------🏁 START S015.DOCUMENT 🏁---------------------------//
        [`POST ${CF_ROUTINGS_DOCUMENT.INSERT_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.INSERT_DOCUMENT}`,
        ],

        [`PUT ${CF_ROUTINGS_DOCUMENT.UPDATE_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.UPDATE_DOCUMENT}`,
        ],

        [`DELETE ${CF_ROUTINGS_DOCUMENT.DELETE_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DELETE_DOCUMENT}`,
        ],

        [`GET ${CF_ROUTINGS_DOCUMENT.GET_INFO_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.GET_INFO_DOCUMENT}`,
        ],

        [`GET ${CF_ROUTINGS_DOCUMENT.GET_LIST_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.GET_LIST_DOCUMENT}`,
        ],

        [`GET ${CF_ROUTINGS_DOCUMENT.DYNAMIC_REPORT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DYNAMIC_REPORT}`,
        ],

        [`GET ${CF_ROUTINGS_DOCUMENT.FILTER_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.FILTER_DOCUMENT}`,
        ],

        [`POST ${CF_ROUTINGS_DOCUMENT.DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_DOCUMENT.IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.IMPORT_FROM_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_DOCUMENT.EXPORT_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.EXPORT_DOCUMENT}`,
        ],

        /**
         * Code: A0155
         */
        [`POST ${CF_ROUTINGS_DOCUMENT.DOCUMENT_PACKAGE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DOCUMENT.DOCUMENT_PACKAGE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DOCUMENT.DOCUMENT_PACKAGE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_REMOVE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DOCUMENT.DOCUMENT_PACKAGE_REMOVE_MANY}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_REMOVE_MANY}`,
        ],

        [`GET ${CF_ROUTINGS_DOCUMENT.DOCUMENT_PACKAGE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_GET_INFO_AND_GET_LIST}`,
        ],

        /**
         * Code: A0156
         */
        [`GET ${CF_ROUTINGS_DOCUMENT.GET_LIST_GROUP_DOCTYPE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.GET_LIST_GROUP_DOCTYPE}`,
        ],

        /**
         * Code: A0158
         */
        [`GET ${CF_ROUTINGS_DOCUMENT.GET_LIST_STORAGE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.GET_LIST_STORAGE}`,
        ],

        /**
         * Code: ...
         */
        [`POST ${CF_ROUTINGS_DOCUMENT.MARK_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.MARK_DOCUMENT}`,
        ],

        /**
         * Code: A0159
         */
        [`POST ${CF_ROUTINGS_DOCUMENT.SHARE_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.SHARE_DOCUMENT}`,
        ],

        /**
         * Code: A01510
         */
        [`PUT ${CF_ROUTINGS_DOCUMENT.UPDATE_PERMISSION_SHARE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.UPDATE_PERMISSION_SHARE}`,
        ],

        /**
         * Code: A01511
         */
        [`GET ${CF_ROUTINGS_DOCUMENT.GET_LIST_USER_SHARED}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.GET_LIST_USER_SHARED}`,
        ],

        /**
         * Code: A01513
         */
        [`POST ${CF_ROUTINGS_DOCUMENT.ADD_FILE_ATTACHMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.ADD_FILE_ATTACHMENT}`,
        ],

        /**
         * THỐNG KÊ THEO TYPE
         */
        [`GET ${CF_ROUTINGS_DOCUMENT.STATISTICAL_BY_TYPE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.STATISTICAL_BY_TYPE}`,
        ],

        [`GET ${CF_ROUTINGS_DOCUMENT.GET_AMOUNT_DOCUMENT_BY_PROJECT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.GET_AMOUNT_DOCUMENT_BY_PROJECT}`,
        ],

        //_____Document file
        [`GET ${CF_ROUTINGS_DOCUMENT.DOCUMENT_FILE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DOCUMENT_FILE_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_DOCUMENT.DOCUMENT_FILE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DOCUMENT_FILE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DOCUMENT.DOCUMENT_FILE}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.DOCUMENT_FILE_REMOVE}`,
        ],

        //---------------------------🏁 END S015.DOCUMENT 🏁---------------------------//
        [`POST ${CF_ROUTINGS_DOCUMENT.SHARE_DOCUMENT}`]: [
            `${CF_DOMAIN_SERVICES.DOCUMENT}.${CF_ACTIONS_DOCUMENT.SHARE_DOCUMENT}`,
        ],

        //---------------------------🏁 START SERVICE OPERATION 🏁---------------------------//
        //___________Tiện ích quanh ta
        [`POST ${CF_ROUTINGS_OPERATION.UTILITY}`]: [
            `${CF_DOMAIN_SERVICES.OPERATION}.${CF_ACTIONS_OPERATION.UTILITY_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_OPERATION.UTILITY}`]: [
            `${CF_DOMAIN_SERVICES.OPERATION}.${CF_ACTIONS_OPERATION.UTILITY_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_OPERATION.UTILITY}`]: [
            `${CF_DOMAIN_SERVICES.OPERATION}.${CF_ACTIONS_OPERATION.UTILITY_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_OPERATION.UTILITY}`]: [
            `${CF_DOMAIN_SERVICES.OPERATION}.${CF_ACTIONS_OPERATION.UTILITY_GET_INFO_AND_GET_LIST}`,
        ],
        //---------------------------🏁 END SERVICE OPERATION 🏁---------------------------//

        //---------------------------🏁 START SERVICE NOTIFICATION 🏁---------------------------//

        [`GET ${CF_ROUTINGS_NOTIFICATION.NOTIFICATION}`]: [
            `${CF_DOMAIN_SERVICES.NOTIFICATION}.${CF_ACTIONS_NOTIFICATION.GET_INFO_AND_GET_LIST_NOTIFICATION}`,
        ],

        [`PUT ${CF_ROUTINGS_NOTIFICATION.NOTIFICATION}`]: [
            `${CF_DOMAIN_SERVICES.NOTIFICATION}.${CF_ACTIONS_NOTIFICATION.UPDATE_NOTIFICATION}`,
        ],

        [`PUT ${CF_ROUTINGS_NOTIFICATION.MARK_ALL_READ}`]: [
            `${CF_DOMAIN_SERVICES.NOTIFICATION}.${CF_ACTIONS_NOTIFICATION.MARK_ALL_READ_NOTIFICATION}`,
        ],

        //---------------------------🏁 END SERVICE REACTION 🏁---------------------------//

        [`PUT ${CF_ROUTINGS_REACTION.COMMENT_CORES}`]: [
            `${CF_DOMAIN_SERVICES.REACTION}.${CF_ACTIONS_REACTION.COMMENT_CORE_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_REACTION.COMMENT_CORES}`]: [
            `${CF_DOMAIN_SERVICES.REACTION}.${CF_ACTIONS_REACTION.COMMENT_CORE_GET_INFO_AND_GET_LIST}`,
        ],

        //---------------------------🏁 END SERVICE REACTION 🏁---------------------------//

        //---------------------------🏁 START SERVICE ANALYSIS 🏁---------------------------//
        // History traffic
        [`POST ${CF_ROUTINGS_ANALYSIS.HISTORY_TRAFFICS}`]: [
            `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`,
        ],

        [`GET ${CF_ROUTINGS_ANALYSIS.HISTORY_TRAFFICS}`]: [
            `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_DEVICE_ACCESS_BY_YEAR}`]:
            [
                `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_DEVICE_ACCESS_BY_YEAR}`,
            ],

        [`GET ${CF_ROUTINGS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_BY_DEVICE_ACCESS}`]:
            [
                `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_BY_DEVICE_ACCESS}`,
            ],

        [`GET ${CF_ROUTINGS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_APP}`]:
            [
                `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_APP}`,
            ],

        [`GET ${CF_ROUTINGS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_COMPANY}`]:
            [
                `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_COMPANY}`,
            ],

        [`GET ${CF_ROUTINGS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_APP_AND_DEVICE}`]:
            [
                `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_STATISTICS_ACCESS_BY_APP_AND_DEVICE}`,
            ],

        // History log
        [`POST ${CF_ROUTINGS_ANALYSIS.HISTORY_LOGS}`]: [
            `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_LOG_INSERT}`,
        ],

        [`GET ${CF_ROUTINGS_ANALYSIS.HISTORY_LOGS}`]: [
            `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_LOG_GET_INFO_AND_GET_LIST}`,
        ],

        // Data
        [`GET ${CF_ROUTINGS_ANALYSIS.HISTORY_DATAS_GET_DATA}`]: [
            `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_DATA_GET_DATA}`,
        ],

        [`POST ${CF_ROUTINGS_ANALYSIS.HISTORY_DATAS_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_DATA_EXPORT_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_ANALYSIS.HISTORY_DATAS_CONVERT_DATA}`]: [
            `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_DATA_CONVERT_DATA}`,
        ],

        [`POST ${CF_ROUTINGS_ANALYSIS.HISTORY_DATAS_RESET_DATA}`]: [
            `${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_DATA_RESET_DATA}`,
        ],

        //---------------------------🏁 END SERVICE ANALYSIS   🏁---------------------------//

        //---------------------------🏁 START SERVICE ACCOUNTING 🏁---------------------------//
        //____accounting_voucher
        [`POST ${CF_ROUTINGS_ACCOUNTING.VOUCHER}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.VOUCHER_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ACCOUNTING.VOUCHER}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.VOUCHER_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_ACCOUNTING.VOUCHER}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.VOUCHER_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_ACCOUNTING.VOUCHER}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.VOUCHER_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_ACCOUNTING.VOUCHER_UPDATE_TO_JOURNAL}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.VOUCHER_UPDATE_TO_JOURNAL}`,
        ],

        [`PUT ${CF_ROUTINGS_ACCOUNTING.VOUCHER_UPDATE_TO_VOUCHER}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.VOUCHER_UPDATE_TO_VOUCHER}`,
        ],

        [`POST ${CF_ROUTINGS_ACCOUNTING.VOUCHER_CONVERT}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.VOUCHER_CONVERT}`,
        ],

        //____accouting_journal
        [`POST ${CF_ROUTINGS_ACCOUNTING.JOURNAL}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_ACCOUNTING.JOURNAL}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_ACCOUNTING.JOURNAL}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_ACCOUNTING.JOURNAL}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_ACCOUNTING.JOURNAL_CAL_IMPLE_BUDGET}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_CAL_IMPLE_BUDGET}`,
        ],

        [`GET ${CF_ROUTINGS_ACCOUNTING.JOURNAL_GET_ACCOUNT_BALANCE}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_GET_ACCOUNT_BALANCE}`,
        ],

        [`GET ${CF_ROUTINGS_ACCOUNTING.JOURNAL_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_GET_LIST_BY_PROPERTY}`,
        ],

        [`POST ${CF_ROUTINGS_ACCOUNTING.JOURNAL_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_EXPORT_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_ACCOUNTING.JOURNAL_ANALYSE_PRIME_COST}`]: [
            `${CF_DOMAIN_SERVICES.ACCOUNTING}.${CF_ACTIONS_ACCOUNTING.JOURNAL_ANALYSE_PRIME_COST}`,
        ],

        //---------------------------🏁 END SERVICE ACCOUNTING   🏁---------------------------//

        //---------------------------🏁 BEGIN SERVICE TIMESHEET 🏁---------------------------//

        [`POST ${CF_ROUTINGS_TIMESHEET.EXPERT_TIMESHEET}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_TIMESHEET_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_TIMESHEET.EXPERT_TIMESHEET}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_TIMESHEET_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_TIMESHEET.EXPERT_TIMESHEET}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_TIMESHEET_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_TIMESHEET.EXPERT_TIMESHEET}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_TIMESHEET_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_TIMESHEET.EXPERT_TIMESHEET_GET_LIST_BY_PROPERTY}`]:
            [
                `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_TIMESHEET_GET_LIST_BY_PROPERTY}`,
            ],

        [`POST ${CF_ROUTINGS_TIMESHEET.EXPERT_SALARY}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_SALARY_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_TIMESHEET.EXPERT_SALARY}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_SALARY_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_TIMESHEET.EXPERT_SALARY}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_SALARY_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_TIMESHEET.EXPERT_SALARY}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_SALARY_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_TIMESHEET.EXPERT_SALARY_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_SALARY_GET_LIST_BY_PROPERTY}`,
        ],

        [`POST ${CF_ROUTINGS_TIMESHEET.EXPERT_SALARY_SYNC_DATA}`]: [
            `${CF_DOMAIN_SERVICES.TIMESHEET}.${CF_ACTIONS_TIMESHEET.EXPERT_SALARY_SYNC_DATA}`,
        ],

        //---------------------------🏁 END SERVICE TIMESHEET 🏁---------------------------//

        //---------------------------🏁 BEGIN SERVICE PRERSONAL 🏁-------------------------//
        [`GET ${CF_ROUTINGS_PERSONAL.GET_CODE}`]: [
            `${CF_DOMAIN_SERVICES.PERSONAL}.${CF_ACTIONS_PERSONAL.FRIEND_REQUEST_GET_CODE}`,
        ],

        [`POST ${CF_ROUTINGS_PERSONAL.CHECK_CODE}`]: [
            `${CF_DOMAIN_SERVICES.PERSONAL}.${CF_ACTIONS_PERSONAL.FRIEND_REQUEST_CHECK_CODE}`,
        ],

        // note
        [`POST ${CF_ROUTINGS_PERSONAL.NOTE}`]: [
            `${CF_DOMAIN_SERVICES.PERSONAL}.${CF_ACTIONS_PERSONAL.NOTE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_PERSONAL.NOTE}`]: [
            `${CF_DOMAIN_SERVICES.PERSONAL}.${CF_ACTIONS_PERSONAL.NOTE_UPDATE}`,
        ],

        [`GET ${CF_ROUTINGS_PERSONAL.NOTE}`]: [
            `${CF_DOMAIN_SERVICES.PERSONAL}.${CF_ACTIONS_PERSONAL.NOTE_GET_INFO_AND_GET_LIST}`,
        ],
        //---------------------------🏁 END SERVICE PRERSONAL 🏁---------------------------//

        //---------------------------🏁 BEGIN SERVICE DATAHUB 🏁-------------------------//
        //____datahub_contact
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_CONTACT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_CONTACT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_CONTACT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_CONTACT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_CONTACT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_CONTACT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_CONTACT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_CONTACT_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_type
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_TYPE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_TYPE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_TYPE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_TYPE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_TYPE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_TYPE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_TYPE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_TYPE_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_project
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_PROJECT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_PROJECT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_PROJECT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_PROJECT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_PROJECT_DOWNLOAD_TEMPLATE_IMPORT_EXCEL}`]:
            [
                `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_DOWNLOAD_TEMPLATE_IMPORT_EXCEL}`,
            ],

        //____datahub_package
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_PACKAGE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_PACKAGE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_PACKAGE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_PACKAGE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_PACKAGE_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_GET_LIST_BY_PROPERTY}`,
        ],

        //____datahub_finreport
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_FINREPORT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_FINREPORT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_FINREPORT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_FINREPORT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_FINREPORT_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_GET_LIST_BY_PROPERTY}`,
        ],

        //____datahub_material
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_MATERIAL}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_MATERIAL_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_MATERIAL}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_MATERIAL_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_MATERIAL}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_MATERIAL_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_MATERIAL}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_MATERIAL_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_contractor
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_CONTRACTOR}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_CONTRACTOR_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_CONTRACTOR}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_CONTRACTOR_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_CONTRACTOR}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_CONTRACTOR_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_CONTRACTOR}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_CONTRACTOR_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_profile
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_PROFILE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PROFILE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_PROFILE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PROFILE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_PROFILE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PROFILE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_PROFILE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PROFILE_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_inspection_doc
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_INSPECTION_DOC}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_DOC_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_INSPECTION_DOC}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_DOC_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_INSPECTION_DOC}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_DOC_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_INSPECTION_DOC}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_DOC_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_inspection_checklist
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_job
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_JOB}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOB_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_JOB}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOB_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_JOB}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOB_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_JOB}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOB_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_jobline
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_JOBLINE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_JOBLINE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_JOBLINE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_JOBLINE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_product
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_PRODUCT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PRODUCT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_PRODUCT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PRODUCT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_PRODUCT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PRODUCT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_PRODUCT}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_PRODUCT_GET_INFO_AND_GET_LIST}`,
        ],

        //____datahub_template
        [`POST ${CF_ROUTINGS_DATAHUB.DATAHUB_TEMPLATE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_DATAHUB.DATAHUB_TEMPLATE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_DATAHUB.DATAHUB_TEMPLATE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_TEMPLATE}`]: [
            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_DATAHUB.DATAHUB_TEMPLATE_DOWNLOAD_TEMPLATE_IMPORT_EXCEL}`]:
            [
                `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_DOWNLOAD_TEMPLATE_IMPORT_EXCEL}`,
            ],

        //---------------------------🏁 END SERVICE DATAHUB 🏁---------------------------//

        //---------------------------🏁 BEGIN SERVICE BIDDING 🏁-------------------------//
        //BIIDING_PLAN
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_PLAN}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_PLAN_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_PLAN}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_PLAN_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_PLAN}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_PLAN_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_PLAN}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_PLAN_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_PLAN_CONTRACTOR_SELECTION}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_PLAN_CONTRACTOR_SELECTION}`,
        ],

        //BIIDING_DOC
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_DOC}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_DOC_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_DOC}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_DOC_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_DOC}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_DOC_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_DOC}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_DOC_GET_INFO_AND_GET_LIST}`,
        ],

        //BIIDING_REQUEST
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_REQUEST}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_REQUEST_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_REQUEST}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_REQUEST_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_REQUEST}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_REQUEST_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_REQUEST}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_REQUEST_GET_INFO_AND_GET_LIST}`,
        ],

        //BIIDING_APPLY
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_APPLY}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_APPLY_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_APPLY}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_APPLY_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_APPLY}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_APPLY_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_APPLY}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_APPLY_GET_INFO_AND_GET_LIST}`,
        ],

        //BIIDING_QUOTATION
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_QUOTATION}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_QUOTATION_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_QUOTATION}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_QUOTATION_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_QUOTATION}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_QUOTATION_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_QUOTATION}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_QUOTATION_GET_INFO_AND_GET_LIST}`,
        ],

        //BIIDING_BILL_ITEM
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_BILL_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_ITEM_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_BILL_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_ITEM_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_BILL_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_ITEM_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_BILL_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_ITEM_GET_INFO_AND_GET_LIST}`,
        ],

        //BIIDING_BILL_GROUP
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_BILL_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_GROUP_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_BILL_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_GROUP_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_BILL_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_GROUP_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_BILL_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_GROUP_GET_INFO_AND_GET_LIST}`,
        ],

        //BIIDING_BILL_WORK
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORK}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORK}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORK}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORK}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_GET_INFO_AND_GET_LIST}`,
        ],

        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORK_ASSIGN_TEMPLATE}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_ASSIGN_TEMPLATE}`,
        ],

        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORK_UPDATE_PRODUCT_PRICE}`]:
            [
                `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORK_UPDATE_PRODUCT_PRICE}`,
            ],

        //BIIDING_BILL_WORKLINE
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORKLINE}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORKLINE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORKLINE}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORKLINE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORKLINE}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORKLINE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_BILL_WORKLINE}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_WORKLINE_GET_INFO_AND_GET_LIST}`,
        ],

        //BIIDING_BILL_PRODUCT
        [`POST ${CF_ROUTINGS_BIDDING.BIIDING_BILL_PRODUCT}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_PRODUCT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BIDDING.BIIDING_BILL_PRODUCT}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_PRODUCT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BIDDING.BIIDING_BILL_PRODUCT}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_PRODUCT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BIDDING.BIIDING_BILL_PRODUCT}`]: [
            `${CF_DOMAIN_SERVICES.BIDDING}.${CF_ACTIONS_BIDDING.BIIDING_BILL_PRODUCT_GET_INFO_AND_GET_LIST}`,
        ],

        //---------------------------🏁 END SERVICE BIDDING 🏁---------------------------//

        //---------------------------🏁 BEGIN SERVICE FIN 🏁-------------------------//
        //____cash_flow_plan
        [`POST ${CF_ROUTINGS_FIN.CASH_FLOW_PLAN}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_FLOW_PLAN_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FIN.CASH_FLOW_PLAN}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_FLOW_PLAN_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FIN.CASH_FLOW_PLAN}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_FLOW_PLAN_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FIN.CASH_FLOW_PLAN}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_FLOW_PLAN_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FIN.CASH_FLOW_PLAN_GET_AMOUNT_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_FLOW_PLAN_GET_AMOUNT_BY_PROPERTY}`,
        ],

        //____cash_book
        [`POST ${CF_ROUTINGS_FIN.CASH_BOOK}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_BOOK_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FIN.CASH_BOOK}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_BOOK_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FIN.CASH_BOOK}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_BOOK_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FIN.CASH_BOOK}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_BOOK_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FIN.CASH_BOOK_GET_AMOUNT_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_BOOK_GET_AMOUNT_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FIN.CASH_BOOK_GET_AMOUNT_BY_PARENT}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_BOOK_GET_AMOUNT_BY_PARENT}`,
        ],

        [`GET ${CF_ROUTINGS_FIN.CASH_BOOK_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_BOOK_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FIN.CASH_BOOK_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_BOOK_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FIN.CASH_BOOK_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_BOOK_EXPORT_EXCEL}`,
        ],

        //____cash_payment
        [`POST ${CF_ROUTINGS_FIN.CASH_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_PAYMENT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FIN.CASH_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_PAYMENT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FIN.CASH_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_PAYMENT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FIN.CASH_PAYMENT}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_PAYMENT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FIN.CASH_PAYMENT_GET_AMOUNT_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_PAYMENT_GET_AMOUNT_BY_PROPERTY}`,
        ],

        [`POST ${CF_ROUTINGS_FIN.CASH_PAYMENT_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FIN}.${CF_ACTIONS_FIN.CASH_PAYMENT_EXPORT_EXCEL}`,
        ],

        //---------------------------🏁 END SERVICE FIN 🏁---------------------------//

        //---------------------------🏁 BEGIN SERVICE BUDGET 🏁-------------------------//
        //____budget
        [`POST ${CF_ROUTINGS_BUDGET.BUDGET}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BUDGET.BUDGET}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BUDGET.BUDGET}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_BUDGET.BUDGET_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_UPDATE_VALUE}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_BUDGET.BUDGET_IMPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_IMPORT_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_EXPORT_EXCEL}`,
        ],

        //____budget_item
        [`POST ${CF_ROUTINGS_BUDGET.BUDGET_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_ITEM_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BUDGET.BUDGET_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_ITEM_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BUDGET.BUDGET_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_ITEM_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET_ITEM}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_ITEM_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_BUDGET.BUDGET_ITEM_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_ITEM_UPDATE_VALUE}`,
        ],

        //____budget_group
        [`POST ${CF_ROUTINGS_BUDGET.BUDGET_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_GROUP_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BUDGET.BUDGET_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_GROUP_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BUDGET.BUDGET_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_GROUP_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET_GROUP}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_GROUP_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_BUDGET.BUDGET_GROUP_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_GROUP_UPDATE_VALUE}`,
        ],

        //____budget_work
        [`POST ${CF_ROUTINGS_BUDGET.BUDGET_WORK}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BUDGET.BUDGET_WORK}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BUDGET.BUDGET_WORK}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET_WORK}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_GET_INFO_AND_GET_LIST}`,
        ],

        [`PUT ${CF_ROUTINGS_BUDGET.BUDGET_WORK_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_UPDATE_VALUE}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET_WORK_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_BUDGET.BUDGET_WORK_IMPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_IMPORT_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET_WORK_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_EXPORT_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_BUDGET.BUDGET_WORK_COPY}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_WORK_COPY}`,
        ],

        //____budget_submittal
        [`POST ${CF_ROUTINGS_BUDGET.BUDGET_SUBMITTAL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_BUDGET.BUDGET_SUBMITTAL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_BUDGET.BUDGET_SUBMITTAL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET_SUBMITTAL}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_BUDGET.BUDGET_SUBMITTAL_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.BUDGET}.${CF_ACTIONS_BUDGET.BUDGET_SUBMITTAL_GET_LIST_BY_PROPERTY}`,
        ],

        //---------------------------🏁 END SERVICE BUDGET 🏁---------------------------//

        //---------------------------🏁 START SERVICE FNB 🏁---------------------------//
        //____fnb_order
        [`POST ${CF_ROUTINGS_FNB.ORDERS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.ORDERS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_UPDATE}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.ORDER_UPDATE_VALUE}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_UPDATE_VALUE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.ORDERS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDERS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GET_LIST_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.ORDER_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_EXPORT_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_EXPORT_EXCEL2}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_EXPORT_EXCEL2}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_EXPORT_EXCEL3}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_EXPORT_EXCEL3}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.ORDER_RESET_ALL_DATA}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_RESET_ALL_DATA}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.ORDER_CONVERT_ALL_DATA}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_CONVERT_ALL_DATA}`,
        ],

        //____fnb_product
        [`POST ${CF_ROUTINGS_FNB.PRODUCTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.PRODUCT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.PRODUCTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.PRODUCT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.PRODUCTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.PRODUCT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.PRODUCTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.PRODUCT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.PRODUCT_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.PRODUCT_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.PRODUCT_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.PRODUCT_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.PRODUCT_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.PRODUCT_EXPORT_EXCEL}`,
        ],

        //____fnb_order_product
        [`POST ${CF_ROUTINGS_FNB.ORDER_PRODUCTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_PRODUCT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.ORDER_PRODUCTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_PRODUCT_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.ORDER_PRODUCTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_PRODUCT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_PRODUCTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_PRODUCT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_PRODUCT_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_PRODUCT_GET_LIST_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_PRODUCT_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_PRODUCT_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.ORDER_PRODUCT_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_PRODUCT_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_PRODUCT_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_PRODUCT_EXPORT_EXCEL}`,
        ],

        //____fnb_order_goods
        [`POST ${CF_ROUTINGS_FNB.ORDER_GOODS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GOODS_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.ORDER_GOODS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GOODS_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.ORDER_GOODS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GOODS_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_GOODS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GOODS_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_GOODS_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GOODS_GET_LIST_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_GOODS_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GOODS_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.ORDER_GOODS_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GOODS_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ORDER_GOODS_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ORDER_GOODS_EXPORT_EXCEL}`,
        ],

        //____fnb_shift
        [`POST ${CF_ROUTINGS_FNB.SHIFTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.SHIFTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_UPDATE}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.SHIFT_UPDATE_SALARY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_UPDATE_SALARY}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.SHIFTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.SHIFTS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.SHIFT_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_GET_LIST_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.SHIFT_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.SHIFT_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.SHIFT_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_EXPORT_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.SHIFT_EXPORT_EXCEL2}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.SHIFT_EXPORT_EXCEL2}`,
        ],

        //____fnb_mistake
        [`POST ${CF_ROUTINGS_FNB.MISTAKES}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.MISTAKE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.MISTAKES}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.MISTAKE_UPDATE}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.MISTAKE_UPDATE_KPI}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.MISTAKE_UPDATE_KPI}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.MISTAKES}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.MISTAKE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.MISTAKES}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.MISTAKE_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.MISTAKE_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.MISTAKE_GET_LIST_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.MISTAKE_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.MISTAKE_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.MISTAKE_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.MISTAKE_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.MISTAKE_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.MISTAKE_EXPORT_EXCEL}`,
        ],

        //____fnb_voucher
        [`POST ${CF_ROUTINGS_FNB.VOUCHERS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.VOUCHER_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.VOUCHERS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.VOUCHER_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.VOUCHERS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.VOUCHER_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.VOUCHERS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.VOUCHER_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.VOUCHER_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.VOUCHER_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.VOUCHER_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.VOUCHER_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.VOUCHER_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.VOUCHER_EXPORT_EXCEL}`,
        ],

        //____fnb_ZALOOA
        [`POST ${CF_ROUTINGS_FNB.ZALOOAS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ZALOOA_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.ZALOOAS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ZALOOA_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.ZALOOAS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ZALOOA_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ZALOOAS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ZALOOA_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ZALOOA_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ZALOOA_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.ZALOOA_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ZALOOA_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.ZALOOA_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.ZALOOA_EXPORT_EXCEL}`,
        ],

        //____fnb_customer_cares
        [`POST ${CF_ROUTINGS_FNB.CUSTOMER_CARES}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_CARE_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.CUSTOMER_CARES}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_CARE_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.CUSTOMER_CARES}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_CARE_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.CUSTOMER_CARES}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_CARE_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.CUSTOMER_CARE_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_CARE_GET_LIST_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.CUSTOMER_CARE_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_CARE_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.CUSTOMER_CARE_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_CARE_IMPORT_FROM_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.CUSTOMER_CARE_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_CARE_EXPORT_EXCEL}`,
        ],

        //____fnb_network_com
        [`POST ${CF_ROUTINGS_FNB.NETWORK_COMS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.NETWORK_COM_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.NETWORK_COMS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.NETWORK_COM_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.NETWORK_COMS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.NETWORK_COM_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.NETWORK_COMS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.NETWORK_COM_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.NETWORK_COM_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.NETWORK_COM_GET_LIST_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.NETWORK_COM_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.NETWORK_COM_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.NETWORK_COM_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.NETWORK_COM_IMPORT_FROM_EXCEL}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.NETWORK_COM_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.NETWORK_COM_EXPORT_EXCEL}`,
        ],

        //____fnb_customer_bookings
        [`POST ${CF_ROUTINGS_FNB.CUSTOMER_BOOKINGS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_BOOKING_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.CUSTOMER_BOOKINGS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_BOOKING_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.CUSTOMER_BOOKINGS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_BOOKING_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.CUSTOMER_BOOKINGS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_BOOKING_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.CUSTOMER_BOOKING_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_BOOKING_GET_LIST_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.CUSTOMER_BOOKING_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_BOOKING_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.CUSTOMER_BOOKING_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_BOOKING_IMPORT_FROM_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.CUSTOMER_BOOKING_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.CUSTOMER_BOOKING_EXPORT_EXCEL}`,
        ],

        //____fnb_affiliate_signups
        [`POST ${CF_ROUTINGS_FNB.AFFILIATE_SIGNUPS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.AFFILIATE_SIGNUP_INSERT}`,
        ],

        [`PUT ${CF_ROUTINGS_FNB.AFFILIATE_SIGNUPS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.AFFILIATE_SIGNUP_UPDATE}`,
        ],

        [`DELETE ${CF_ROUTINGS_FNB.AFFILIATE_SIGNUPS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.AFFILIATE_SIGNUP_REMOVE}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.AFFILIATE_SIGNUPS}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.AFFILIATE_SIGNUP_GET_INFO_AND_GET_LIST}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.AFFILIATE_SIGNUP_GET_LIST_BY_PROPERTY}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.AFFILIATE_SIGNUP_GET_LIST_BY_PROPERTY}`,
        ],

        [`GET ${CF_ROUTINGS_FNB.AFFILIATE_SIGNUP_DOWNLOAD_TEMPLATE_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.AFFILIATE_SIGNUP_DOWNLOAD_TEMPLATE_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.AFFILIATE_SIGNUP_IMPORT_FROM_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.AFFILIATE_SIGNUP_IMPORT_FROM_EXCEL}`,
        ],

        [`POST ${CF_ROUTINGS_FNB.AFFILIATE_SIGNUP_EXPORT_EXCEL}`]: [
            `${CF_DOMAIN_SERVICES.FNB}.${CF_ACTIONS_FNB.AFFILIATE_SIGNUP_EXPORT_EXCEL}`,
        ],

        //---------------------------🏁 END SERVICE FNB 🏁---------------------------//
    },

    // Disable to call not-mapped actions
    mappingPolicy: 'all', // Available values: "all", "restrict"

    // Set CORS headers
    // cors: true,
    // Global CORS settings for all routes
    cors: {
        // Configures the Access-Control-Allow-Origin CORS header.
        origin: '*',
        // Configures the Access-Control-Allow-Methods CORS header.
        methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
        // Configures the Access-Control-Allow-Headers CORS header.
        allowedHeaders: ['X-Requested-With', 'content-type', 'Authorization'],
        // Configures the Access-Control-Expose-Headers CORS header.
        exposedHeaders: [],
        // Configures the Access-Control-Allow-Credentials CORS header.
        credentials: true,
        // Configures the Access-Control-Max-Age CORS header.
        maxAge: 3600,
    },

    // Parse body content
    bodyParsers: {
        json: {
            strict: false,
        },
        urlencoded: {
            extended: true,
            limit: '1MB',
        },
    },
    // Enable/disable logging
    logging: true,

    /**
     * ROUTE Hooks: cấu hình map từ req -> ctx
     */
    onBeforeCall(ctx, route, req, res) {
        // Set request headers to context meta
        ctx.meta.userAgent = req.headers['user-agent']
        ctx.meta.ipAddr =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress

        const userAgent = ctx.meta.userAgent
        const platform = parseUserAgent(userAgent)
        ctx.meta.platform = platform
    },
}
