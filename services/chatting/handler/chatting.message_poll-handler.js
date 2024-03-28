/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const CHATTING__MESSAGE_POLL_MODEL              = require('../model/chatting.message_poll-model').MODEL;


module.exports = {

	/**
	 * ============================ ****************** ===============================
	 * ============================ 	MESSAGE POLL   ===============================
	 * ============================ ****************** ===============================
	 */

    /**
	 * Dev: MinhVH
	 * Func: Thêm tin nhắn poll mới
	 * Date: 25/08/2021
	 */
    insert: {
        auth: "required",
        params: {
			conversationID	: { type: 'string' },
			name			: { type: 'string' },
		},
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { conversationID, name, options } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_POLL_MODEL.insert({
					conversationID, name, options, authorID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật poll
	 * Date: 28/08/2021
	 */
	update: {
        auth: "required",
        params: {
            conversationID	: { type: 'string' },
			messageID		: { type: 'string' },
			newVotes		: { type: 'array', optional: true },
			votesCancel		: { type: 'array', optional: true },
			newOptions		: { type: 'array', optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { conversationID, messageID, newVotes, votesCancel, newOptions } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_POLL_MODEL.update({
					conversationID, messageID, newVotes, votesCancel, newOptions, authorID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Đóng poll
	 * Date: 29/08/2021
	 */
    closePoll: {
        auth: "required",
        params: {
            conversationID	: { type: 'string' },
			messageID		: { type: 'string' },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { conversationID, messageID } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_POLL_MODEL.closePoll({ 
					conversationID, messageID, authorID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Lấy danh sách poll
	 * Date: 30/08/2021
	 */
	getList: {
        auth: "required",
        params: {
            conversationID	: { type: 'string' },
            lastestID 		: { type: 'string', optional: true },
            limit 			: { type: 'string', optional: true },
            filter 			: { type: 'string', optional: true },
            select 			: { type: 'string', optional: true }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { _id: authorID } = ctx.meta.infoUser;
                const { conversationID, lastestID, limit, filter, select } = ctx.params;

                const resultAfterCallHandler = await CHATTING__MESSAGE_POLL_MODEL.getList({ 
					conversationID, lastestID, authorID, limit, filter, select
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

}
