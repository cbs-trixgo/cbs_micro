'use strict'

const DbService = require('../../tools/mixins/db.mixin')
const CacheCleaner = require('../../tools/mixins/cache.cleaner.mixin')

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_CHATTING } = require('./helper/chatting.actions-constant')

/**
 * HANDLERS
 */
const CHATTING__CONVERSATION_FOLDER_HANDLER = require('./handler/chatting.conversation_folder-handler')
const CHATTING__CONVERSATION_HANDLER = require('./handler/chatting.conversation-handler')
const CHATTING__CONVERSATION_MEMBER_HANDLER = require('./handler/chatting.conversation_member-handler')
const CHATTING__MESSAGE_HANDLER = require('./handler/chatting.message-handler')
const CHATTING__MESSAGE_POLL_HANDLER = require('./handler/chatting.message_poll-handler')
const CHATTING__MESSAGE_REMINDER_HANDLER = require('./handler/chatting.message_reminder-handler')
const CHATTING__MESSAGE_NPS_HANDLER = require('./handler/chatting.message_nps-handler')

module.exports = {
    name: CF_DOMAIN_SERVICES.CHATTING,
    mixins: [
        DbService('message_messages'),
        DbService('message_conversations'),
        DbService('message_conversation_links'),
        DbService('message_conversation_files'),
        DbService('message_conversation_folders'),
        DbService('message_conversation_members'),
        DbService('message_message_polls'),
        DbService('message_message_reminders'),
        DbService('message_message_reactions'),
        CacheCleaner([CF_DOMAIN_SERVICES.CHATTING]),
    ],

    /**
     * Service settings
     */
    // settings: {
    // 	fields: ["_id", "name", "products"],
    // 	populates : {
    // 		"products": {
    // 			action: "products.get",
    // 			params: ["name"]
    // 		}
    // 	},
    // 	entityValidator: {
    // 		name: { type: "string"}
    // 	}
    // },

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
        // =========================  MESSAGE  ============================

        // Lấy danh sách tin nhắn cuộc hội thoại (phân trang)
        [CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_CONVERSATION_WITH_PAGE]:
            CHATTING__CONVERSATION_HANDLER.getListMessagesConversationWithPage,

        // Tìm kiếm tin nhắn cuộc hội thoại (Dữ liệu trả về là 5 tin nhắn trước và sau tin nhắn tìm thấy)
        [CF_ACTIONS_CHATTING.SEARCH_MESSAGE_CONVERSATION_BY_ID]:
            CHATTING__CONVERSATION_HANDLER.searchMessageConversationById,

        // Thêm tin nhắn trong cuộc hội thoại (text, emoij, tag name)
        [CF_ACTIONS_CHATTING.INSERT_MESSAGE_CONVERSATION]:
            CHATTING__MESSAGE_HANDLER.insertMessage,

        // Xoá tin nhắn của cuộc hội thoại (media, text)
        [CF_ACTIONS_CHATTING.DELETE_MESSAGE_CONVERSATION]:
            CHATTING__MESSAGE_HANDLER.deleteMessage,

        // Thu hồi tin nhắn của cuộc hội thoại (media, text)
        [CF_ACTIONS_CHATTING.REVOKE_MESSAGE_CONVERSATION]:
            CHATTING__MESSAGE_HANDLER.revokeMessage,

        // Tự động xoá tất cả tin nhắn của cuộc hội thoại
        [CF_ACTIONS_CHATTING.AUTO_DELETE_MESSAGE_CONVERSATION]:
            CHATTING__MESSAGE_HANDLER.autoDeleteMessagesConversation,

        // Chia sẻ tin nhắn đến các cuộc hội thoại
        [CF_ACTIONS_CHATTING.SHARE_MESSAGE_CONVERSATION]:
            CHATTING__MESSAGE_HANDLER.shareMessageConversation,

        // Pin 1 tin nhắn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_PIN_MESSAGE_CONVERSATION]:
            CHATTING__MESSAGE_HANDLER.updatePinMessageConversation,

        // Danh sách tin nhắn được pin trong cuộc hội thoại (phân trang)
        [CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_PIN_CONVERSATION_WITH_PAGE]:
            CHATTING__MESSAGE_HANDLER.getListMessagePinConversation,

        // Cập nhật Danh sách đã xem tin nhắn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_SEEN_MESSAGE_CONVERSATION]:
            CHATTING__MESSAGE_HANDLER.updateSeenMessage,

        // Reaction tin nhắn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.REACTION_MESSAGE_CONVERSATION]:
            CHATTING__MESSAGE_HANDLER.reactionMessage,

        // Danh sách Reaction 1 tin nhắn
        [CF_ACTIONS_CHATTING.GET_LIST_REACTION_MESSAGE_CONVERSATION]:
            CHATTING__MESSAGE_HANDLER.getListReactionByMessage,

        // =========================  MESSAGE POLL  ============================
        // Thêm tin nhắn bình chọn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.INSERT_MESSAGE_POLL_CONVERSATION]:
            CHATTING__MESSAGE_POLL_HANDLER.insert,

        // Cập nhật tin nhắn bình chọn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_MESSAGE_POLL_CONVERSATION]:
            CHATTING__MESSAGE_POLL_HANDLER.update,

        // Đóng tin nhắn bình chọn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.CLOSE_MESSAGE_POLL_CONVERSATION]:
            CHATTING__MESSAGE_POLL_HANDLER.closePoll,

        // Danh sách tin nhắn bình chọn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_POLL_CONVERSATION]:
            CHATTING__MESSAGE_POLL_HANDLER.getList,

        // =========================  MESSAGE REMINDER  ============================
        // Thêm tin nhắn nhắc hẹn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.INSERT_MESSAGE_REMINDER_CONVERSATION]:
            CHATTING__MESSAGE_REMINDER_HANDLER.insert,

        // Cập nhật tin nhắn nhắc hẹn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_MESSAGE_REMINDER_CONVERSATION]:
            CHATTING__MESSAGE_REMINDER_HANDLER.update,

        // Cập nhật thành viên tham gia nhắc hẹn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_USER_JOIN_REMINDER_CONVERSATION]:
            CHATTING__MESSAGE_REMINDER_HANDLER.updateUsersJoinReminder,

        // Xoá nhắc hẹn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.DELETE_MESSAGE_REMINDER_CONVERSATION]:
            CHATTING__MESSAGE_REMINDER_HANDLER.delete,

        // Danh sách tin nhắn nhắc hẹn trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_REMINDER_CONVERSATION]:
            CHATTING__MESSAGE_REMINDER_HANDLER.getList,

        // =========================  MESSAGE NPS  ============================
        // Thêm tin nhắn NPS trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.INSERT_MESSAGE_NPS_CONVERSATION]:
            CHATTING__MESSAGE_NPS_HANDLER.insert,

        // Cập nhật tin nhắn NPS trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_MESSAGE_NPS_CONVERSATION]:
            CHATTING__MESSAGE_NPS_HANDLER.update,

        // Đóng tin nhắn NPS trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.CLOSE_MESSAGE_NPS_CONVERSATION]:
            CHATTING__MESSAGE_NPS_HANDLER.closeNps,

        // Danh sách tin nhắn NPS trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_NPS_CONVERSATION]:
            CHATTING__MESSAGE_NPS_HANDLER.getList,

        // Thống kê điểm NPS
        [CF_ACTIONS_CHATTING.GET_SCORE_STATISTICS_NPS]:
            CHATTING__MESSAGE_NPS_HANDLER.scoreStatistics,

        // Thống kê lý do hài lòng/không hài lòng NPS
        [CF_ACTIONS_CHATTING.GET_REASON_STATISTICS_NPS]:
            CHATTING__MESSAGE_NPS_HANDLER.reasonStatistics,

        // ======================  CONVERSATION ===========================
        // Thêm cuộc hội thoại mới
        [CF_ACTIONS_CHATTING.INSERT_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.insertConversation,

        // Cập nhật cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.updateConversation,

        // Cập nhật tên cuộc hội thoại riêng tư (service call service)
        [CF_ACTIONS_CHATTING.UPDATE_CONVERSATION_NAME_PRIVATE]:
            CHATTING__CONVERSATION_HANDLER.updateConversationNamePrivate,

        // Cập nhật tên thành viên cuộc hội thoại (service call service)
        [CF_ACTIONS_CHATTING.UPDATE_MEMBER_NAME]:
            CHATTING__CONVERSATION_MEMBER_HANDLER.updateName,

        // Thêm thành viên cuộc hội thoại
        [CF_ACTIONS_CHATTING.ADD_MEMBER_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.addMembersToConversation,

        // Xoá thành viên cuộc hội thoại
        [CF_ACTIONS_CHATTING.REMOVE_MEMBER_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.removeMemberInConversation,

        // Cập nhật admin cho cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_ADMIN_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.updateAdminConversation,

        // Cập nhật cài đặt cho cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_CONFIG_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.updateConfigConversation,

        // Cập nhật pin cuộc hội thoại
        [CF_ACTIONS_CHATTING.UPDATE_PIN_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.updatePinConversation,

        // Lấy danh sách thành viên cuộc hội thoại theo ID
        [CF_ACTIONS_CHATTING.GET_LIST_MEMBER_CONVERSATION_BY_ID]:
            CHATTING__CONVERSATION_MEMBER_HANDLER.getList,

        // Lấy thông tin một cuộc hội thoại theo ID
        [CF_ACTIONS_CHATTING.GET_INFO_CONVERSATION_BY_ID]:
            CHATTING__CONVERSATION_HANDLER.getInfoConversationByID,

        // Xem các nhóm chung với 1 thành viên
        [CF_ACTIONS_CHATTING.GET_INFO_GENERAL_GROUP_BY_MEMBER]:
            CHATTING__CONVERSATION_HANDLER.getInfoGeneralGroupsByMember,

        // Lấy danh sách tin nhắn media cuộc hội thoại
        [CF_ACTIONS_CHATTING.GET_LIST_MESSAGE_MEDIA_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.getListMessagesMediaConversation,

        // Lấy danh sách thành viên gửi tin nhắn media cuộc hội thoại
        [CF_ACTIONS_CHATTING.GET_LIST_MEMBER_SEND_MESSAGE_MEDIA_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.getListMemberSendMessagesMediaConversation,

        // Cập nhật trạng thái ẩn cuộc hội thoại của 1 user
        [CF_ACTIONS_CHATTING.UPDATE_HIDE_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.updateHideConversation,

        // Cập nhật on/off thông báo cuộc hội thoại của 1 user
        [CF_ACTIONS_CHATTING.UPDATE_MUTE_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.updateMuteConversation,

        // Đánh dấu đã đọc cuộc hội thoại của 1 user
        [CF_ACTIONS_CHATTING.MARK_READ_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.markReadConversation,

        // Member rời khỏi cuộc hội thoại
        [CF_ACTIONS_CHATTING.MEMBER_LEAVE_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.memberLeaveConversation,

        // Giải tán cuộc hội thoại (xóa nhóm)
        [CF_ACTIONS_CHATTING.DELETE_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.deleteConversation,

        // Xoá lịch sử cuộc hội thoại
        [CF_ACTIONS_CHATTING.DELETE_HISTORY_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.deleteHistoryConversation,

        // Danh sách cuộc hội thoại (hoặc tìm kiếm theo tên)
        [CF_ACTIONS_CHATTING.GET_LIST_CONVERSATION_WITH_PAGE]:
            CHATTING__CONVERSATION_HANDLER.getListConversationWithPage,

        // Danh sách cuộc hội thoại đã pin
        [CF_ACTIONS_CHATTING.GET_LIST_PIN_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.getListPinConversation,

        // Danh sách cuộc hội thoại chưa đọc
        [CF_ACTIONS_CHATTING.GET_LIST_CONVERSATION_MISS_MESSAGE]:
            CHATTING__CONVERSATION_HANDLER.getListConversationMissMessage,

        // Danh sách file trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.GET_LIST_FILE_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.getListFileConversation,

        // Danh sách link trong cuộc hội thoại
        [CF_ACTIONS_CHATTING.GET_LIST_LINK_CONVERSATION]:
            CHATTING__CONVERSATION_HANDLER.getListLinkConversation,

        // ======================  CONVERSATION FOLDER ===========================
        // Thêm folder mới
        [CF_ACTIONS_CHATTING.INSERT_FOLDER_CONVERSATION]:
            CHATTING__CONVERSATION_FOLDER_HANDLER.insert,

        // Cập nhật folder
        [CF_ACTIONS_CHATTING.UPDATE_FOLDER_CONVERSATION]:
            CHATTING__CONVERSATION_FOLDER_HANDLER.update,

        // Thêm cuộc hội thoại vào folders
        [CF_ACTIONS_CHATTING.UPDATE_CONVERSATION_TO_FOLDER]:
            CHATTING__CONVERSATION_FOLDER_HANDLER.updateConversationToFolder,

        // Xóa folder
        [CF_ACTIONS_CHATTING.DELETE_FOLDER_CONVERSATION]:
            CHATTING__CONVERSATION_FOLDER_HANDLER.delete,

        // Lấy thông tin folder
        [CF_ACTIONS_CHATTING.GET_INFO_FOLDER_CONVERSATION]:
            CHATTING__CONVERSATION_FOLDER_HANDLER.getInfo,

        // Lấy danh sách folder
        [CF_ACTIONS_CHATTING.GET_LIST_FOLDER_CONVERSATION]:
            CHATTING__CONVERSATION_FOLDER_HANDLER.getList,
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
