const BASE_ACTIONS = 'ACT_ZALO';

const CF_ACTIONS_ZALO = {
    ZALO_REQUEST_PERMISSION     : `${BASE_ACTIONS}_ZALO_REQUEST_PERMISSION`,
    ZALO_RENEW_TOKEN            : `${BASE_ACTIONS}_ZALO_RENEW_TOKEN`,
    ZALO_SEND_MESSAGE           : `${BASE_ACTIONS}_ZALO_SEND_MESSAGE`,
    ZALO_SEND_MESSAGE_ZNS       : `${BASE_ACTIONS}_ZALO_SEND_MESSAGE_ZNS`,
    ZALO_CALLBACK               : `${BASE_ACTIONS}_ZALO_CALLBACK`,
    ZALO_WEBHOOK                : `${BASE_ACTIONS}_ZALO_WEBHOOK`,
}

exports.CF_ACTIONS_ZALO = CF_ACTIONS_ZALO;