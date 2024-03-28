const BASE_ROUTE = '/document';

const CF_ROUTINGS_DOCUMENT = {
	// ======================== ROUTE - API ===============================

    // DOCUMENT
    INSERT_DOCUMENT                     		: `${BASE_ROUTE}/insert-document`,
    UPDATE_DOCUMENT                     		: `${BASE_ROUTE}/update-document`,
    DELETE_DOCUMENT                     		: `${BASE_ROUTE}/delete-document`,
    GET_INFO_DOCUMENT                     		: `${BASE_ROUTE}/info-document`,
    GET_LIST_DOCUMENT                     		: `${BASE_ROUTE}/list-document`,
    FILTER_DOCUMENT                     		: `${BASE_ROUTE}/filter-document`,
    DYNAMIC_REPORT                              : `${BASE_ROUTE}/dynamic-report`,
    DOWNLOAD_TEMPLATE_EXCEL                     : `${BASE_ROUTE}/download-template-excel`,
    IMPORT_FROM_EXCEL                           : `${BASE_ROUTE}/import-from-excel`,
    EXPORT_DOCUMENT                     		: `${BASE_ROUTE}/export-document`,

    GET_LIST_STORAGE                     		: `${BASE_ROUTE}/list-storage`,
    MARK_DOCUMENT                     		    : `${BASE_ROUTE}/mark-document`,
    SHARE_DOCUMENT                     		    : `${BASE_ROUTE}/share-document`,
    UPDATE_PERMISSION_SHARE                     : `${BASE_ROUTE}/update-permission-share`,
    ADD_FILE_ATTACHMENT                         : `${BASE_ROUTE}/add-file-attachment`,
    GET_LIST_USER_SHARED                        : `${BASE_ROUTE}/list-user-shared`,
    STATISTICAL_BY_TYPE                         : `${BASE_ROUTE}/statistical_by_type`,
    GET_AMOUNT_DOCUMENT_BY_PROJECT              : `${BASE_ROUTE}/amount-document-by-projects`,
    // PACKAGE
    DOCUMENT_PACKAGE                     		: `${BASE_ROUTE}/document_packages`,
    DOCUMENT_PACKAGE_REMOVE_MANY                : `${BASE_ROUTE}/document_packages/remove-many`,

    // DOCUMENT_FILE
    DOCUMENT_FILE                               : `${BASE_ROUTE}/document_files`,
}

exports.CF_ROUTINGS_DOCUMENT = CF_ROUTINGS_DOCUMENT;
