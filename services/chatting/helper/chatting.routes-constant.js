const BASE_ROUTE = '/chatting';

/**
 * vì không tách ra thành từng file action (company, user, app, app_role,...) -> cần thêm prefix phía trước
 */
const CONVERSATION = '/conversations';
const MESSAGE      = '/messages';

const CF_ROUTINGS_CHATTING = {
    ORIGIN_APP: BASE_ROUTE,

	// ======================== ROUTE - API ===============================

    /**
     * CONVERSATION
     */
    INSERT_CONVERSATION                     		: `${BASE_ROUTE}${CONVERSATION}/create-conversation`,
    UPDATE_CONVERSATION                     		: `${BASE_ROUTE}${CONVERSATION}/update-conversation`,
    ADD_MEMBER_CONVERSATION              			: `${BASE_ROUTE}${CONVERSATION}/add-member-conversation`,
    REMOVE_MEMBER_CONVERSATION              		: `${BASE_ROUTE}${CONVERSATION}/remove-member-conversation`,

	UPDATE_ADMIN_CONVERSATION              			: `${BASE_ROUTE}${CONVERSATION}/update-admin-conversation`,
	UPDATE_CONFIG_CONVERSATION              		: `${BASE_ROUTE}${CONVERSATION}/update-config-conversation`,
	UPDATE_PIN_CONVERSATION              			: `${BASE_ROUTE}${CONVERSATION}/update-pin-conversation`,
	UPDATE_HIDE_CONVERSATION              			: `${BASE_ROUTE}${CONVERSATION}/update-hide-conversation`,
	UPDATE_MUTE_CONVERSATION              			: `${BASE_ROUTE}${CONVERSATION}/update-mute-conversation`,

	MARK_READ_CONVERSATION              			: `${BASE_ROUTE}${CONVERSATION}/mark-read-conversation`,
	MEMBER_LEAVE_CONVERSATION              			: `${BASE_ROUTE}${CONVERSATION}/member-leave-conversation`,
	DELETE_CONVERSATION              				: `${BASE_ROUTE}${CONVERSATION}/delete-conversation`,
	DELETE_HISTORY_CONVERSATION              		: `${BASE_ROUTE}${CONVERSATION}/delete-history-conversation`,

    GET_LIST_CONVERSATION_WITH_PAGE            		: `${BASE_ROUTE}${CONVERSATION}/list-conversation-with-page`,
    GET_LIST_PIN_CONVERSATION	            		: `${BASE_ROUTE}${CONVERSATION}/list-pin-conversation`,
    GET_LIST_CONVERSATION_MISS_MESSAGE         		: `${BASE_ROUTE}${CONVERSATION}/list-conversation-miss-message`,
    GET_LIST_FILE_CONVERSATION         		        : `${BASE_ROUTE}${CONVERSATION}/list-file-conversation`,
    GET_LIST_LINK_CONVERSATION         		        : `${BASE_ROUTE}${CONVERSATION}/list-link-conversation`,

    GET_INFO_CONVERSATION_BY_ID             		: `${BASE_ROUTE}${CONVERSATION}/info-conversation`,
    GET_INFO_GENERAL_GROUP_BY_MEMBER      			: `${BASE_ROUTE}${CONVERSATION}/info-general-group-by-member`,
    GET_LIST_MEMBER_CONVERSATION_BY_ID      		: `${BASE_ROUTE}${CONVERSATION}/list-members-conversation`,
    GET_LIST_MESSAGE_CONVERSATION_WITH_PAGE 		: `${BASE_ROUTE}${CONVERSATION}/list-message-conversation-with-page`,
    GET_LIST_MESSAGE_MEDIA_CONVERSATION 			: `${BASE_ROUTE}${CONVERSATION}/list-message-media-conversation`,
    GET_LIST_MEMBER_SEND_MESSAGE_MEDIA_CONVERSATION : `${BASE_ROUTE}${CONVERSATION}/list-member-send-message-media-conversation`,

    /**
     * FOLDER CONVERSATION
     */
	INSERT_FOLDER_CONVERSATION              		: `${BASE_ROUTE}${CONVERSATION}/create-folder`,
    UPDATE_FOLDER_CONVERSATION           		    : `${BASE_ROUTE}${CONVERSATION}/update-folder`,
    UPDATE_CONVERSATION_TO_FOLDER           		: `${BASE_ROUTE}${CONVERSATION}/update-conversation-to-folder`,
	DELETE_FOLDER_CONVERSATION              		: `${BASE_ROUTE}${CONVERSATION}/delete-folder`,
    GET_INFO_FOLDER_CONVERSATION             		: `${BASE_ROUTE}${CONVERSATION}/info-folder`,
    GET_LIST_FOLDER_CONVERSATION            	    : `${BASE_ROUTE}${CONVERSATION}/list-folder`,

    /**
     * MESSAGE
     */
	INSERT_MESSAGE_CONVERSATION              		: `${BASE_ROUTE}${CONVERSATION}/insert-message-conversation`,
	UPDATE_SEEN_MESSAGE_CONVERSATION                : `${BASE_ROUTE}${CONVERSATION}/update-seen-message-conversation`,
    UPDATE_SEEN_MESSAGE_CONVERSATION           		: `${BASE_ROUTE}${CONVERSATION}/update-seen-message-conversation`,
	DELETE_MESSAGE_CONVERSATION              		: `${BASE_ROUTE}${CONVERSATION}/delete-message-conversation`,
	REVOKE_MESSAGE_CONVERSATION              		: `${BASE_ROUTE}${CONVERSATION}/revoke-message-conversation`,
	AUTO_DELETE_MESSAGE_CONVERSATION           		: `${BASE_ROUTE}${CONVERSATION}/auto-delete-message-conversation`,
	REACTION_MESSAGE_CONVERSATION           		: `${BASE_ROUTE}${CONVERSATION}/reaction-message-conversation`,
	GET_LIST_REACTION_MESSAGE_CONVERSATION     		: `${BASE_ROUTE}${CONVERSATION}/list-reaction-message-conversation`,

    /**
     * MESSAGE POLL
     */
    INSERT_MESSAGE_POLL_CONVERSATION            	: `${BASE_ROUTE}${CONVERSATION}/insert-message-poll-conversation`,
    UPDATE_MESSAGE_POLL_CONVERSATION            	: `${BASE_ROUTE}${CONVERSATION}/update-message-poll-conversation`,
    CLOSE_MESSAGE_POLL_CONVERSATION            		: `${BASE_ROUTE}${CONVERSATION}/close-message-poll-conversation`,
    GET_LIST_MESSAGE_POLL_CONVERSATION            	: `${BASE_ROUTE}${CONVERSATION}/list-message-poll-conversation`,

    /**
     * MESSAGE REMINDER
     */
    INSERT_MESSAGE_REMINDER_CONVERSATION            : `${BASE_ROUTE}${CONVERSATION}/insert-message-reminder-conversation`,
    UPDATE_MESSAGE_REMINDER_CONVERSATION            : `${BASE_ROUTE}${CONVERSATION}/update-message-reminder-conversation`,
    UPDATE_USER_JOIN_REMINDER_CONVERSATION          : `${BASE_ROUTE}${CONVERSATION}/update-user-join-message-reminder-conversation`,
	DELETE_MESSAGE_REMINDER_CONVERSATION            : `${BASE_ROUTE}${CONVERSATION}/delete-message-reminder-conversation`,
    GET_LIST_MESSAGE_REMINDER_CONVERSATION          : `${BASE_ROUTE}${CONVERSATION}/list-message-reminder-conversation`,

    /**
     * MESSAGE NPS
     */
    INSERT_MESSAGE_NPS_CONVERSATION            	    : `${BASE_ROUTE}${CONVERSATION}/insert-message-nps-conversation`,
    UPDATE_MESSAGE_NPS_CONVERSATION            	    : `${BASE_ROUTE}${CONVERSATION}/update-message-nps-conversation`,
    CLOSE_MESSAGE_NPS_CONVERSATION            		: `${BASE_ROUTE}${CONVERSATION}/close-message-nps-conversation`,
    GET_LIST_MESSAGE_NPS_CONVERSATION            	: `${BASE_ROUTE}${CONVERSATION}/list-message-nps-conversation`,
    GET_SCORE_STATISTICS_NPS            	        : `${BASE_ROUTE}${CONVERSATION}/get-score-statistics-nps`,
    GET_REASON_STATISTICS_NPS            	        : `${BASE_ROUTE}${CONVERSATION}/get-reason-statistics-nps`,

    /**
     * OTHER
     */
    SEARCH_MESSAGE_CONVERSATION_BY_ID 				: `${BASE_ROUTE}${CONVERSATION}/search-message-conversation-by-id`,
    SHARE_MESSAGE_CONVERSATION            			: `${BASE_ROUTE}${CONVERSATION}/share-message-conversation`,
    UPDATE_PIN_MESSAGE_CONVERSATION					: `${BASE_ROUTE}${CONVERSATION}/update-pin-message-conversation`,
    GET_LIST_MESSAGE_PIN_CONVERSATION_WITH_PAGE		: `${BASE_ROUTE}${CONVERSATION}/list-message-pin-conversation-with-page`,


    // ======================== SWAGGER - DOC ===============================

    // CONVERSATION
    SWAGGER_GET_LIST_CONVERSATION_BY_USER_ID    : `${BASE_ROUTE}${CONVERSATION}/users/{userID}`,
    SWAGGER_GET_INFO_CONVERSATION_BY_ID         : `${BASE_ROUTE}${CONVERSATION}/{conversationID}`,

    // MESSAGE
    SWAGGER_GET_LIST_MESSAGE_BY_CONVERSATION_ID : `${BASE_ROUTE}${MESSAGE}/conversations/{conversationID}`
}

exports.CF_ROUTINGS_CHATTING = CF_ROUTINGS_CHATTING;