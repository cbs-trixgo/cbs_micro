'use strict'

const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_DOCUMENT } = require('./helper/document.actions-constant')

/**
 * HANDLERS
 */
const DOCUMENT__DOC_HANDLER = require('./handler/document.doc-handler')
const DOCUMENT__PACKAGE_HANDLER = require('./handler/document.package-handler')
const DOCUMENT__FILE_HANDLER = require('./handler/document.doc_file-handler')

module.exports = {
    name: CF_DOMAIN_SERVICES.DOCUMENT,
    mixins: [
        DbService('document_file'),
        DbService('document_doc'),
        DbService('document_package'),
        DbService('document_user_related'),
        DbService('doctype'),
        CacheCleaner([CF_DOMAIN_SERVICES.DOCUMENT]),
    ],

    /**
     * Service metadata
     */
    metadata: {},

    /**
     * Service dependencies
     */
    dependencies: [CF_DOMAIN_SERVICES.AUTH],

    /**
     * Actions
     */
    actions: {
        // ======================  DOCUMENT ===========================

        //Hồ sơ văn bản
        [CF_ACTIONS_DOCUMENT.INSERT_DOCUMENT]:
            DOCUMENT__DOC_HANDLER.insertDocument,
        [CF_ACTIONS_DOCUMENT.UPDATE_DOCUMENT]:
            DOCUMENT__DOC_HANDLER.updateDocument,
        [CF_ACTIONS_DOCUMENT.DELETE_DOCUMENT]:
            DOCUMENT__DOC_HANDLER.deleteDocument,
        [CF_ACTIONS_DOCUMENT.GET_INFO_DOCUMENT]:
            DOCUMENT__DOC_HANDLER.getInfoDocumment,
        [CF_ACTIONS_DOCUMENT.MARK_DOCUMENT]:
            DOCUMENT__DOC_HANDLER.updateMarkDocument,
        [CF_ACTIONS_DOCUMENT.SHARE_DOCUMENT]:
            DOCUMENT__DOC_HANDLER.updateShareDocument,
        [CF_ACTIONS_DOCUMENT.UPDATE_PERMISSION_SHARE]:
            DOCUMENT__DOC_HANDLER.updatePermissionShare,
        [CF_ACTIONS_DOCUMENT.GET_LIST_USER_SHARED]:
            DOCUMENT__DOC_HANDLER.getListUserShared,
        [CF_ACTIONS_DOCUMENT.GET_LIST_DOCUMENT]:
            DOCUMENT__DOC_HANDLER.getListDocument,
        [CF_ACTIONS_DOCUMENT.FILTER_DOCUMENT]:
            DOCUMENT__DOC_HANDLER.getListByFilter,
        [CF_ACTIONS_DOCUMENT.DYNAMIC_REPORT]:
            DOCUMENT__DOC_HANDLER.getDynamicReport,
        [CF_ACTIONS_DOCUMENT.DOWNLOAD_TEMPLATE_EXCEL]:
            DOCUMENT__DOC_HANDLER.downloadTemplateExcel,
        [CF_ACTIONS_DOCUMENT.IMPORT_FROM_EXCEL]:
            DOCUMENT__DOC_HANDLER.importFromExcel,
        [CF_ACTIONS_DOCUMENT.EXPORT_DOCUMENT]:
            DOCUMENT__DOC_HANDLER.exportDocument,

        // Gói thầu
        [CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_INSERT]:
            DOCUMENT__PACKAGE_HANDLER.insert,
        [CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_UPDATE]:
            DOCUMENT__PACKAGE_HANDLER.update,
        [CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_REMOVE]:
            DOCUMENT__PACKAGE_HANDLER.remove,
        [CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_REMOVE_MANY]:
            DOCUMENT__PACKAGE_HANDLER.removeMany,
        [CF_ACTIONS_DOCUMENT.DOCUMENT_PACKAGE_GET_INFO_AND_GET_LIST]:
            DOCUMENT__PACKAGE_HANDLER.getInfoAndGetList,

        // Danh sách nhóm phân loại hồ sơ
        [CF_ACTIONS_DOCUMENT.GET_LIST_GROUP_DOCTYPE]:
            DOCUMENT__DOC_HANDLER.getListGroupDoctype,

        // Thêm file đính kèm trong hồ sơ
        [CF_ACTIONS_DOCUMENT.ADD_FILE_ATTACHMENT]:
            DOCUMENT__DOC_HANDLER.addFileAttachment,

        // Thống kê theo type
        [CF_ACTIONS_DOCUMENT.STATISTICAL_BY_TYPE]:
            DOCUMENT__DOC_HANDLER.statisticalByType,
        [CF_ACTIONS_DOCUMENT.GET_AMOUNT_DOCUMENT_BY_PROJECT]:
            DOCUMENT__DOC_HANDLER.getAmountDocumentByProjects,

        // Document file
        [CF_ACTIONS_DOCUMENT.DOCUMENT_FILE_GET_INFO_AND_GET_LIST]:
            DOCUMENT__FILE_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_DOCUMENT.DOCUMENT_FILE_UPDATE]:
            DOCUMENT__FILE_HANDLER.update,

        // Remove Document file
        [CF_ACTIONS_DOCUMENT.DOCUMENT_FILE_REMOVE]:
            DOCUMENT__FILE_HANDLER.remove,
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
