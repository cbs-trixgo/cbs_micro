const BASE_ROUTE = '/human';
const CONTACT_DOCUMENT = 'contact_documents';

const CF_ROUTINGS_CONTACT = {
    CONTACT_DOCUMENT                            : `${BASE_ROUTE}/${CONTACT_DOCUMENT}`,
    CONTACT_DOCUMENT_FILTER                     : `${BASE_ROUTE}/${CONTACT_DOCUMENT}/filter`,
    CONTACT_DOCUMENT_EXPORT_ECXEL               : `${BASE_ROUTE}/${CONTACT_DOCUMENT}/export-excel`,
}

exports.CF_ROUTINGS_CONTACT = CF_ROUTINGS_CONTACT;