/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const CHATTING__MESSAGE_MODEL                   = require('../model/chatting.message-model').MODEL;
const CHATTING__MESSAGE_REACTION_MODEL          = require('../model/chatting.message_reaction-model').MODEL;


module.exports = {
    /**
	 * ============================ ****************** ===============================
	 * ============================ 	 MESSAGE  	   ===============================
	 * ============================ ****************** ===============================
	 */

	/**
	 * Dev: MinhVH
	 * Func: Thêm tin nhắn trong cuộc hội thoại
	 * Date: 17/08/2021
	 */
	insertMessage: {
        auth: "required",
        params: {
			conversationID  : { type: 'string' },
            parentID		: { type: 'string', optional: true },
            type 			: { type: 'number' },
            content 		: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: senderID } = ctx.meta.infoUser;
                const { conversationID, parentID, content, type, location, files, usersAssigned } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_MODEL.insertMessage({
					conversationID, senderID, parentID, content, type, files, location, usersAssigned, ctx
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật Danh sách đã xem tin nhắn trong cuộc hội thoại
	 * Date: 30/08/2021
	 */
	updateSeenMessage: {
        auth: "required",
        params: {
			conversationID  : { type: 'string' },
            messagesID		: { type: 'array' }
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationID, messagesID } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_MODEL.updateSeenMessage({
					conversationID, messagesID, userID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Xoá tin nhắn của cuộc hội thoại (media, text)
	 * Date: 16/08/2021
	 * Updated: 28/08/2021 - MinhVH
	 */
	deleteMessage: {
        auth: "required",
        params: {
			conversationID: { type: 'string' },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationID, messagesID, filesID } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_MODEL.deleteMessage({
					conversationID, userID, messagesID, filesID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Thu hồi tin nhắn của cuộc hội thoại (media, text)
	 * Date: 28/08/2021
	 */
	revokeMessage: {
        auth: "required",
        params: {
			conversationID: { type: 'string' },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationID, messagesID, filesID } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_MODEL.revokeMessage({
					conversationID, userID, messagesID, filesID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Tự động xoá tất cả tin nhắn của cuộc hội thoại
	 * Date: 28/09/2021
	 */
	autoDeleteMessagesConversation: {
        auth: "required",
        params: {
			conversationID	: { type: 'string' },
			messageID		: { type: 'string', optional: true },
			time			: { type: 'string' },
			isDelete		: { type: 'boolean', optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationID, messageID, time, isDelete } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_MODEL.autoDeleteMessagesConversation({
					conversationID, messageID, userID, time, isDelete, ctx
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Chia sẻ tin nhắn đến các cuộc hội thoại 
	 * Date: 23/08/2021
	 */
	shareMessageConversation: {
        auth: "required",
        params: {},
        async handler(ctx) {
            try {
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationsID, messagesID } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_MODEL.shareMessageConversation({
					conversationsID, messagesID, userID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Pin 1 tin nhắn trong cuộc hội thoại 
	 * Date: 25/08/2021
	 */
	updatePinMessageConversation: {
        auth: "required",
        params: {
			conversationID	: { type: 'string' },
			messageID		: { type: 'string' },
			isPin			: { type: 'boolean' },
		},
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationID, messageID, isPin } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_MODEL.updatePinMessageConversation({
					conversationID, messageID, userID, isPin
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Danh sách tin nhắn được pin trong cuộc hội thoại (phân trang)
	 * Date: 28/08/2021
	 */
	getListMessagePinConversation: {
        auth: "required",
        params: {
			conversationID	: { type: 'string' },
			page			: { type: 'string', optional: true },
			limit			: { type: 'string', optional: true },
		},
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationID, page, limit, filter, select } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_MODEL.getListMessagePinConversation({
					conversationID, page, limit, userID, filter, select
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Reaction tin nhắn trong cuộc hội thoại
	 * Date: 26/10/2021
	 */
	reactionMessage: {
        auth: "required",
        params: {
			messageID		: { type: 'string' },
			typeReaction	: { type: 'number' },
		},
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { messageID, typeReaction } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_REACTION_MODEL.reactionMessage({
					messageID, userID, typeReaction
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Danh sách Reaction 1 tin nhắn
	 * Date: 26/10/2021
	 */
	getListReactionByMessage: {
        auth: "required",
        params: {
			messageID	: { type: 'string' },
			type		: { type: 'string', optional: true },
			lastestID	: { type: 'string', optional: true },
			limit		: { type: 'string', optional: true },
			select		: { type: 'string', optional: true },
			populates	: { type: 'string', optional: true },
		},
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { messageID, type, lastestID, limit, select, populates } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_REACTION_MODEL.getListReactionMessage({
					messageID, type, lastestID, limit, select, populates, userID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

}
