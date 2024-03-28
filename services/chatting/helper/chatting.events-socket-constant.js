const CHATTING = 'CHATTING'

// danh sách events socket
exports.EVENT_SOCKET_CONSTANT_CHATTING = {
    //========================== CLIENT SEND TO SERVER =============================

    // CONVERSATION
    CHATTING_CSS_NEW_CONVERSATION: `${CHATTING}_CSS_NEW_CONVERSATION`,
    CHATTING_CSS_UPDATE_INFO_CONVERSATION: `${CHATTING}_CSS_UPDATE_INFO_CONVERSATION`,
    CHATTING_CSS_ADD_MEMBER_CONVERSATION: `${CHATTING}_CSS_ADD_MEMBER_CONVERSATION`,
    CHATTING_CSS_REMOVE_MEMBER_CONVERSATION: `${CHATTING}_CSS_REMOVE_MEMBER_CONVERSATION`,
    CHATTING_CSS_UPDATE_ADMIN_CONVERSATION: `${CHATTING}_CSS_UPDATE_ADMIN_CONVERSATION`,
    CHATTING_CSS_MEMBER_LEAVE_CONVERSATION: `${CHATTING}_CSS_MEMBER_LEAVE_CONVERSATION`,
    CHATTING_CSS_REMOVE_CONVERSATION: `${CHATTING}_CSS_REMOVE_CONVERSATION`,
    CHATTING_CSS_GET_INFO_CONVERSATION: `${CHATTING}_CSS_GET_INFO_CONVERSATION`,

    // MESSAGE
    CHATTING_CSS_SEND_MESSAGE: `${CHATTING}_CSS_SEND_MESSAGE`,
    CHATTING_CSS_UPDATE_SEEN_MESSAGE: `${CHATTING}_CSS_UPDATE_SEEN_MESSAGE`,
    CHATTING_CSS_SHARE_MESSAGE: `${CHATTING}_CSS_SHARE_MESSAGE`,
    CHATTING_CSS_REVOKE_MESSAGE: `${CHATTING}_CSS_REVOKE_MESSAGE`,
    CHATTING_CSS_PIN_MESSAGE: `${CHATTING}_CSS_PIN_MESSAGE`,
    CHATTING_CSS_UNPIN_MESSAGE: `${CHATTING}_CSS_UNPIN_MESSAGE`,
    CHATTING_CSS_REACTION_MESSAGE: `${CHATTING}_CSS_REACTION_MESSAGE`,
    CHATTING_CSS_FIRE_MESSAGE: `${CHATTING}_CSS_FIRE_MESSAGE`,

    CHATTING_CSS_UPDATE_USER_JOIN_REMINDER: `${CHATTING}_CSS_UPDATE_USER_JOIN_REMINDER`,
    CHATTING_CSS_UPDATE_MESSAGE_REMINDER: `${CHATTING}_CSS_UPDATE_MESSAGE_REMINDER`,
    CHATTING_CSS_REMOVE_MESSAGE_REMINDER: `${CHATTING}_CSS_REMOVE_MESSAGE_REMINDER`,
    CHATTING_CSS_NOTIFICATION_REMINDER: `${CHATTING}_CSS_NOTIFICATION_REMINDER`,
    CHATTING_CSS_UPDATE_MESSAGE_POLL: `${CHATTING}_CSS_UPDATE_MESSAGE_POLL`,
    CHATTING_CSS_UPDATE_MESSAGE_NPS: `${CHATTING}_CSS_UPDATE_MESSAGE_NPS`,

    //======================== SERVER SEND TO CLIENT ===========================

    // CONVERSATION
    CHATTING_SSC_NEW_CONVERSATION: `${CHATTING}_SSC_NEW_CONVERSATION`,
    CHATTING_SSC_UPDATE_INFO_CONVERSATION: `${CHATTING}_SSC_UPDATE_INFO_CONVERSATION`,
    CHATTING_SSC_ADD_MEMBER_CONVERSATION: `${CHATTING}_SSC_ADD_MEMBER_CONVERSATION`,
    CHATTING_SSC_REMOVE_MEMBER_CONVERSATION: `${CHATTING}_SSC_REMOVE_MEMBER_CONVERSATION`,
    CHATTING_SSC_UPDATE_ADMIN_CONVERSATION: `${CHATTING}_SSC_UPDATE_ADMIN_CONVERSATION`,
    CHATTING_SSC_MEMBER_LEAVE_CONVERSATION: `${CHATTING}_SSC_MEMBER_LEAVE_CONVERSATION`,
    CHATTING_SSC_REMOVE_CONVERSATION: `${CHATTING}_SSC_REMOVE_CONVERSATION`,
    CHATTING_SSC_GET_INFO_CONVERSATION: `${CHATTING}_SSC_GET_INFO_CONVERSATION`,

    // MESSAGE
    CHATTING_SSC_SEND_MESSAGE: `${CHATTING}_SSC_SEND_MESSAGE`,
    CHATTING_SSC_RECEIVE_MESSAGE: `${CHATTING}_SSC_RECEIVE_MESSAGE`,
    CHATTING_SSC_AMOUNT_MISS_MESSAGE: `${CHATTING}_SSC_AMOUNT_MISS_MESSAGE`,
    CHATTING_SSC_UPDATE_SEEN_MESSAGE: `${CHATTING}_SSC_UPDATE_SEEN_MESSAGE`,
    CHATTING_SSC_SHARE_MESSAGE: `${CHATTING}_SSC_SHARE_MESSAGE`,
    CHATTING_SSC_REVOKE_MESSAGE: `${CHATTING}_SSC_REVOKE_MESSAGE`,
    CHATTING_SSC_PIN_MESSAGE: `${CHATTING}_SSC_PIN_MESSAGE`,
    CHATTING_SSC_UNPIN_MESSAGE: `${CHATTING}_SSC_UNPIN_MESSAGE`,
    CHATTING_SSC_REACTION_MESSAGE: `${CHATTING}_SSC_REACTION_MESSAGE`,
    CHATTING_SSC_FIRE_MESSAGE: `${CHATTING}_SSC_FIRE_MESSAGE`,

    CHATTING_SSC_UPDATE_USER_JOIN_REMINDER: `${CHATTING}_SSC_UPDATE_USER_JOIN_REMINDER`,
    CHATTING_SSC_UPDATE_MESSAGE_REMINDER: `${CHATTING}_SSC_UPDATE_MESSAGE_REMINDER`,
    CHATTING_SSC_REMOVE_MESSAGE_REMINDER: `${CHATTING}_SSC_REMOVE_MESSAGE_REMINDER`,
    CHATTING_SSC_NOTIFICATION_REMINDER: `${CHATTING}_SSC_NOTIFICATION_REMINDER`,
    CHATTING_SSC_UPDATE_MESSAGE_POLL: `${CHATTING}_SSC_UPDATE_MESSAGE_POLL`,
    CHATTING_SSC_UPDATE_MESSAGE_NPS: `${CHATTING}_SSC_UPDATE_MESSAGE_NPS`,
}
