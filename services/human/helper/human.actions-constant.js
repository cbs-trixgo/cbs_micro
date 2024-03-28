const BASE_ACTIONS = 'ACT_HUMAN'
const CONTACT_DOCUMENT = 'CONTACT_DOCUMENT'

const CF_ACTIONS_CONTACT = {
    /**
     * CONTACT DOCUMENT
     */
    CONTACT_DOCUMENT_GET_INFO_AND_GET_LIST: `${BASE_ACTIONS}_${CONTACT_DOCUMENT}_GET_INFO_AND_GET_LIST`,
    CONTACT_DOCUMENT_INSERT: `${BASE_ACTIONS}_${CONTACT_DOCUMENT}_INSERT`,
    CONTACT_DOCUMENT_UPDATE: `${BASE_ACTIONS}_${CONTACT_DOCUMENT}_UPDATE`,
    CONTACT_DOCUMENT_REMOVE: `${BASE_ACTIONS}_${CONTACT_DOCUMENT}_REMOVE`,
    CONTACT_DOCUMENT_FILTER: `${BASE_ACTIONS}_${CONTACT_DOCUMENT}_FILTER`,
    CONTACT_DOCUMENT_EXPORT_ECXEL: `${BASE_ACTIONS}_${CONTACT_DOCUMENT}_EXPORT_ECXEL`,
}

exports.CF_ACTIONS_CONTACT = CF_ACTIONS_CONTACT
