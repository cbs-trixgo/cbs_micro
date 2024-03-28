'use strict'
const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_DATAHUB } = require('./helper/datahub.actions-constant')

const DATAHUB_CONTACT_COLL = require('./database/datahub_contact-coll')
const DATAHUB_TYPE_COLL = require('./database/datahub_type-coll')
const DATAHUB_PROJECT_COLL = require('./database/datahub_project-coll')
const DATAHUB_PACKAGE_COLL = require('./database/datahub_package-coll')
const DATAHUB_FINREPORT_COLL = require('./database/datahub_finreport-coll')
const DATAHUB_CONTRACTOR_COLL = require('./database/datahub_contractor-coll')
const DATAHUB_PROFILE_COLL = require('./database/datahub_profile-coll')
const DATAHUB_INSPECTION_DOC_COLL = require('./database/datahub_inspection_doc-coll')
const DATAHUB_INSPECTION_CHECKLIST_COLL = require('./database/datahub_inspection_checklist-coll')
const DATAHUB_JOB_COLL = require('./database/datahub_job-coll')
const DATAHUB_JOBLINE_COLL = require('./database/datahub_jobline-coll')
const DATAHUB_PRODUCT_COLL = require('./database/datahub_product-coll')
const DATAHUB_TEMPLATE_COLL = require('./database/datahub_template-coll')
const DATAHUB_MATERIAL_COLL = require('./database/datahub_material-coll')

const DATAHUB_CONTACT_HANDLER = require('./handler/datahub.datahub_contact-handler')
const DATAHUB_TYPE_HANDLER = require('./handler/datahub.datahub_type-handler')
const DATAHUB_PROJECT_HANDLER = require('./handler/datahub.datahub_project-handler')
const DATAHUB_PACKAGE_HANDLER = require('./handler/datahub.datahub_package-handler')
const DATAHUB_FINREPORT_HANDLER = require('./handler/datahub.datahub_finreport-handler')
const DATAHUB_CONTRACTOR_HANDLER = require('./handler/datahub.datahub_contractor-handler')
const DATAHUB_PROFILE_HANDLER = require('./handler/datahub.datahub_profile-handler')
const DATAHUB_INSPECTION_DOC_HANDLER = require('./handler/datahub.datahub_inspection_doc-handler')
const DATAHUB_INSPECTION_CHECKLIST_HANDLER = require('./handler/datahub.datahub_inspection_checklist-handler')
const DATAHUB_JOB_HANDLER = require('./handler/datahub.datahub_job-handler')
const DATAHUB_JOBLINE_HANDLER = require('./handler/datahub.datahub_jobline-handler')
const DATAHUB_PRODUCT_HANDLER = require('./handler/datahub.datahub_product-handler')
const DATAHUB_TEMPLATE_HANDLER = require('./handler/datahub.datahub_template-handler')
const DATAHUB_MATERIAL_HANDLER = require('./handler/datahub.datahub_material-handler')

module.exports = {
    name: CF_DOMAIN_SERVICES.DATAHUB,
    mixins: [
        DbService(DATAHUB_CONTACT_COLL),
        DbService(DATAHUB_TYPE_COLL),
        DbService(DATAHUB_PROJECT_COLL),
        DbService(DATAHUB_PACKAGE_COLL),
        DbService(DATAHUB_FINREPORT_COLL),
        DbService(DATAHUB_CONTRACTOR_COLL),
        DbService(DATAHUB_PROFILE_COLL),
        DbService(DATAHUB_INSPECTION_DOC_COLL),
        DbService(DATAHUB_INSPECTION_CHECKLIST_COLL),
        DbService(DATAHUB_JOB_COLL),
        DbService(DATAHUB_JOBLINE_COLL),
        DbService(DATAHUB_PRODUCT_COLL),
        DbService(DATAHUB_TEMPLATE_COLL),
        DbService(DATAHUB_MATERIAL_COLL),
        CacheCleaner([CF_DOMAIN_SERVICES.DATAHUB]),
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
        //==========================================   DATAHUB CONTACT   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_CONTACT_INSERT]:
            DATAHUB_CONTACT_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_CONTACT_UPDATE]:
            DATAHUB_CONTACT_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_CONTACT_REMOVE]:
            DATAHUB_CONTACT_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_CONTACT_GET_INFO_AND_GET_LIST]:
            DATAHUB_CONTACT_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB TYPE   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_TYPE_INSERT]: DATAHUB_TYPE_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_TYPE_UPDATE]: DATAHUB_TYPE_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_TYPE_REMOVE]: DATAHUB_TYPE_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_TYPE_GET_INFO_AND_GET_LIST]:
            DATAHUB_TYPE_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB PROJECT   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_INSERT]:
            DATAHUB_PROJECT_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_UPDATE]:
            DATAHUB_PROJECT_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_REMOVE]:
            DATAHUB_PROJECT_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_GET_INFO_AND_GET_LIST]:
            DATAHUB_PROJECT_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_DATAHUB.DATAHUB_PROJECT_DOWNLOAD_TEMPLATE_IMPORT_EXCEL]:
            DATAHUB_PROJECT_HANDLER.downloadTemplateImportExcel,

        //==========================================   DATAHUB PACKAGE   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_INSERT]:
            DATAHUB_PACKAGE_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_UPDATE]:
            DATAHUB_PACKAGE_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_REMOVE]:
            DATAHUB_PACKAGE_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_GET_INFO_AND_GET_LIST]:
            DATAHUB_PACKAGE_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_DATAHUB.DATAHUB_PACKAGE_GET_LIST_BY_PROPERTY]:
            DATAHUB_PACKAGE_HANDLER.getListByProperty,

        //==========================================   DATAHUB FINREPORT   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_INSERT]:
            DATAHUB_FINREPORT_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_UPDATE]:
            DATAHUB_FINREPORT_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_REMOVE]:
            DATAHUB_FINREPORT_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_GET_INFO_AND_GET_LIST]:
            DATAHUB_FINREPORT_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_DATAHUB.DATAHUB_FINREPORT_GET_LIST_BY_PROPERTY]:
            DATAHUB_FINREPORT_HANDLER.getListByProperty,

        //==========================================   DATAHUB_MATERIAL   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_MATERIAL_INSERT]:
            DATAHUB_MATERIAL_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_MATERIAL_UPDATE]:
            DATAHUB_MATERIAL_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_MATERIAL_REMOVE]:
            DATAHUB_MATERIAL_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_MATERIAL_GET_INFO_AND_GET_LIST]:
            DATAHUB_MATERIAL_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB CONTRACTOR   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_CONTRACTOR_INSERT]:
            DATAHUB_CONTRACTOR_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_CONTRACTOR_UPDATE]:
            DATAHUB_CONTRACTOR_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_CONTRACTOR_REMOVE]:
            DATAHUB_CONTRACTOR_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_CONTRACTOR_GET_INFO_AND_GET_LIST]:
            DATAHUB_CONTRACTOR_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB PROFILE   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_PROFILE_INSERT]:
            DATAHUB_PROFILE_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_PROFILE_UPDATE]:
            DATAHUB_PROFILE_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_PROFILE_REMOVE]:
            DATAHUB_PROFILE_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_PROFILE_GET_INFO_AND_GET_LIST]:
            DATAHUB_PROFILE_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB INSPECTION DOC   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_DOC_INSERT]:
            DATAHUB_INSPECTION_DOC_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_DOC_UPDATE]:
            DATAHUB_INSPECTION_DOC_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_DOC_REMOVE]:
            DATAHUB_INSPECTION_DOC_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_DOC_GET_INFO_AND_GET_LIST]:
            DATAHUB_INSPECTION_DOC_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB INSPECTION CHECKLIST   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST_INSERT]:
            DATAHUB_INSPECTION_CHECKLIST_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST_UPDATE]:
            DATAHUB_INSPECTION_CHECKLIST_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST_REMOVE]:
            DATAHUB_INSPECTION_CHECKLIST_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_INSPECTION_CHECKLIST_GET_INFO_AND_GET_LIST]:
            DATAHUB_INSPECTION_CHECKLIST_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB JOB   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_JOB_INSERT]: DATAHUB_JOB_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_JOB_UPDATE]: DATAHUB_JOB_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_JOB_REMOVE]: DATAHUB_JOB_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_JOB_GET_INFO_AND_GET_LIST]:
            DATAHUB_JOB_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB JOBLINE   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_INSERT]:
            DATAHUB_JOBLINE_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_UPDATE]:
            DATAHUB_JOBLINE_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_REMOVE]:
            DATAHUB_JOBLINE_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_GET_INFO_AND_GET_LIST]:
            DATAHUB_JOBLINE_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB PRODUCT   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_PRODUCT_INSERT]:
            DATAHUB_PRODUCT_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_PRODUCT_UPDATE]:
            DATAHUB_PRODUCT_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_PRODUCT_REMOVE]:
            DATAHUB_PRODUCT_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_PRODUCT_GET_INFO_AND_GET_LIST]:
            DATAHUB_PRODUCT_HANDLER.getInfoAndGetList,

        //==========================================   DATAHUB TEMPLATE   ================================
        [CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_INSERT]:
            DATAHUB_TEMPLATE_HANDLER.insert,
        [CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_UPDATE]:
            DATAHUB_TEMPLATE_HANDLER.update,
        [CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_REMOVE]:
            DATAHUB_TEMPLATE_HANDLER.remove,
        [CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_GET_INFO_AND_GET_LIST]:
            DATAHUB_TEMPLATE_HANDLER.getInfoAndGetList,
        [CF_ACTIONS_DATAHUB.DATAHUB_TEMPLATE_DOWNLOAD_TEMPLATE_IMPORT_EXCEL]:
            DATAHUB_TEMPLATE_HANDLER.downloadTemplateImportExcel,
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
