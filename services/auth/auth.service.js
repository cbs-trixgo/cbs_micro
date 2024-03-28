'use strict'

const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_AUTH } = require('./helper/auth.actions-constant')
const AUTH__USER_HANDLER = require('./handler/auth.user-handler')
const AUTH__COMPANY_HANDLER = require('./handler/auth.company-handler')
const AUTH__APP_MENU_HANDLER = require('./handler/auth.app_menu-handler')
const AUTH__APP_ROLE_HANDLER = require('./handler/auth.app_role-handler')
const AUTH__APP_ROLE_MENU_HANDLER = require('./handler/auth.app_role_menu-handler')
const AUTH__APP_USER_HANDLER = require('./handler/auth.app_user-handler')
const AUTH__APP_COMPANY_HANDLER = require('./handler/auth.app_company-handler')
const AUTH__APP_HANDLER = require('./handler/auth.app-handler')

module.exports = {
    name: CF_DOMAIN_SERVICES.AUTH,
    mixins: [
        DbService('companies'),
        DbService('users'),
        DbService('register_trials'),
        DbService('apps'),
        DbService('app_roles'),
        DbService('app_menus'),
        DbService('app_role_menus'),
        DbService('app_users'),
        DbService('app_companies'),
        CacheCleaner([CF_DOMAIN_SERVICES.AUTH]),
    ],
    /**
     * Service settings
     */
    settings: {
        autoAliases: true,
    },

    /**
     * Service metadata
     */
    metadata: {},

    /**
     * Service dependencies
     */
    dependencies: [],

    /**
     * Actions
     */
    actions: {
        //============================   AUTH: USER   ==========================//
        [CF_ACTIONS_AUTH.REGISTER]: AUTH__USER_HANDLER.register,
        [CF_ACTIONS_AUTH.LOGIN]: AUTH__USER_HANDLER.login,
        [CF_ACTIONS_AUTH.RECOVER_PASSWORD]: AUTH__USER_HANDLER.recoverPassword,
        [CF_ACTIONS_AUTH.CHECK_OTP_RECOVER_PASSWORD]:
            AUTH__USER_HANDLER.checkOTPRecoverPassword,
        [CF_ACTIONS_AUTH.UPDATE_PASSWORD_RECOVER]:
            AUTH__USER_HANDLER.updatePasswordRecover,
        [CF_ACTIONS_AUTH.GET_LIST_FRIEND]: AUTH__USER_HANDLER.getListFriend,
        [CF_ACTIONS_AUTH.GET_LIST_USER_SEND_TO_FRIENDS]:
            AUTH__USER_HANDLER.getListUserSendToFriends,
        [CF_ACTIONS_AUTH.GET_LIST_USER_RECEIVE_FROM_FRIENDS]:
            AUTH__USER_HANDLER.getListUserReceiveFromFriends,
        [CF_ACTIONS_AUTH.GET_LIST_USER]: AUTH__USER_HANDLER.getListUser,
        [CF_ACTIONS_AUTH.GET_LIST_USERS_BY_ID_FOR_MOBILE_PUSH]:
            AUTH__USER_HANDLER.getListUserByIdForPushMobile,
        [CF_ACTIONS_AUTH.GET_INFO]: AUTH__USER_HANDLER.getInfo,
        [CF_ACTIONS_AUTH.GET_INFO_BY_ID]: AUTH__USER_HANDLER.getInfoById,
        [CF_ACTIONS_AUTH.GET_LIST_USER_WITH_CONDITION]:
            AUTH__USER_HANDLER.getListUserWithCondition,
        [CF_ACTIONS_AUTH.UPDATE_DEVICE_WHEN_LOGIN_MOBILE]:
            AUTH__USER_HANDLER.updateDeviceLogin,
        [CF_ACTIONS_AUTH.RESOLVE_TOKEN]: AUTH__USER_HANDLER.resolveToken,
        [CF_ACTIONS_AUTH.SEARCH_WITH_FIND]: AUTH__USER_HANDLER.searchWithFind,
        [CF_ACTIONS_AUTH.SEARCH_WITH_FULL_TEXT]:
            AUTH__USER_HANDLER.searchWithFullText,
        [CF_ACTIONS_AUTH.UPDATE_PIN_CONVERSATION]:
            AUTH__USER_HANDLER.updatePinConversation,
        [CF_ACTIONS_AUTH.GET_LIST_PIN_CONVERSATION]:
            AUTH__USER_HANDLER.getListPinConversation,
        [CF_ACTIONS_AUTH.UPDATE_PIN_MEDIA]: AUTH__USER_HANDLER.updatePinMedia,
        [CF_ACTIONS_AUTH.GET_LIST_PIN_MEDIA]:
            AUTH__USER_HANDLER.getListPinMedia,
        [CF_ACTIONS_AUTH.USER_IMPORT_FROM_EXCEL]:
            AUTH__USER_HANDLER.importFromExcel,

        // Khu vực viết theo cách mới
        [CF_ACTIONS_AUTH.USER_INSERT]: AUTH__USER_HANDLER.insert,
        [CF_ACTIONS_AUTH.USER_UPDATE]: AUTH__USER_HANDLER.update,
        [CF_ACTIONS_AUTH.USER_DELETE]: AUTH__USER_HANDLER.delete,
        [CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST]:
            AUTH__USER_HANDLER.getInfoAndGetList,

        // Company
        [CF_ACTIONS_AUTH.COMPANY_INSERT]: AUTH__COMPANY_HANDLER.insert,
        [CF_ACTIONS_AUTH.COMPANY_UPDATE]: AUTH__COMPANY_HANDLER.update,
        [CF_ACTIONS_AUTH.GET_INFO_AND_GET_LIST_COMPANY]:
            AUTH__COMPANY_HANDLER.getInfoAndGetListCompany,

        // App
        [CF_ACTIONS_AUTH.APP_GET_INFO_GET_LIST]:
            AUTH__APP_HANDLER.getInfoAndGetList,

        // App menu
        [CF_ACTIONS_AUTH.APP_MENU_INSERT]: AUTH__APP_MENU_HANDLER.insert,
        [CF_ACTIONS_AUTH.APP_MENU_UPDATE]: AUTH__APP_MENU_HANDLER.update,
        [CF_ACTIONS_AUTH.APP_MENU_REMOVE]: AUTH__APP_MENU_HANDLER.remove,
        [CF_ACTIONS_AUTH.APP_MENU_GET_INFO_AND_GET_LIST]:
            AUTH__APP_MENU_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_AUTH.APP_MENU_GET_LIST_COMPANY]:
            AUTH__APP_MENU_HANDLER.getListCompany,
        [CF_ACTIONS_AUTH.APP_MENU_GET_LIST_MOBILE_FNB_MENU]:
            AUTH__APP_MENU_HANDLER.getMobileFnbMenu,

        // App role
        [CF_ACTIONS_AUTH.APP_ROLE_INSERT]: AUTH__APP_ROLE_HANDLER.insert,
        [CF_ACTIONS_AUTH.APP_ROLE_UPDATE]: AUTH__APP_ROLE_HANDLER.update,
        [CF_ACTIONS_AUTH.APP_ROLE_REMOVE]: AUTH__APP_ROLE_HANDLER.remove,
        [CF_ACTIONS_AUTH.APP_ROLE_REMOVE_MANY]:
            AUTH__APP_ROLE_HANDLER.removeMany,
        [CF_ACTIONS_AUTH.APP_ROLE_GET_INFO_AND_GET_LIST]:
            AUTH__APP_ROLE_HANDLER.getInfoAndGetList,

        // App role menu
        [CF_ACTIONS_AUTH.APP_ROLE_MENU_INSERT]:
            AUTH__APP_ROLE_MENU_HANDLER.insert,
        [CF_ACTIONS_AUTH.APP_ROLE_MENU_GET_INFO_AND_GET_LIST]:
            AUTH__APP_ROLE_MENU_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_AUTH.APP_ROLE_MENU_GET_PERMISSION]:
            AUTH__APP_ROLE_MENU_HANDLER.getPermissionToAccessListMenuOfApp,
        [CF_ACTIONS_AUTH.APP_ROLE_MENU_GET_PERMISSION_TO_ACCESS_ONE_MENU_OF_APP]:
            AUTH__APP_ROLE_MENU_HANDLER.getPermissionToAccessOneMenuOfApp,

        // App user
        [CF_ACTIONS_AUTH.APP_USER_GET_INFO_AND_GET_LIST]:
            AUTH__APP_USER_HANDLER.getListAppOfUser,
        [CF_ACTIONS_AUTH.APP_USER_CHECK_PERMISSIONS_ACCESS_APP]:
            AUTH__APP_USER_HANDLER.checkPermissionsAccessApp,
        [CF_ACTIONS_AUTH.APP_USER_GET_LIST]: AUTH__APP_USER_HANDLER.getList,
        [CF_ACTIONS_AUTH.APP_USER_INSERT]: AUTH__APP_USER_HANDLER.insert,
        [CF_ACTIONS_AUTH.APP_USER_UPDATE]: AUTH__APP_USER_HANDLER.update,
        [CF_ACTIONS_AUTH.APP_USER_REMOVE]: AUTH__APP_USER_HANDLER.remove,

        // App company
        [CF_ACTIONS_AUTH.APP_COMPANY_INSERT]: AUTH__APP_COMPANY_HANDLER.insert,
        [CF_ACTIONS_AUTH.APP_COMPANY_UPDATE]: AUTH__APP_COMPANY_HANDLER.update,
        [CF_ACTIONS_AUTH.APP_COMPANY_REMOVE]: AUTH__APP_COMPANY_HANDLER.remove,
        [CF_ACTIONS_AUTH.APP_COMPANY_GET_INFO_AND_GET_LIST]:
            AUTH__APP_COMPANY_HANDLER.getInfoAndGetList,

        // Version app
        [CF_ACTIONS_AUTH.CHECK_VERSION_APP]: AUTH__APP_HANDLER.checkVersionApp,
    },

    /**
     * Events
     */
    events: {},

    /**
     * Methods
     */
    methods: {},

    /**
     * Service created lifecycle event handler
     */
    created() {},

    /**
     * Service started lifecycle event handler
     */
    async started() {},

    /**
     * Service stopped lifecycle event handler
     */
    async stopped() {},
}
