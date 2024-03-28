/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const CHATTING__CONVERSATION_MEMBER_MODEL       = require('../model/chatting.conversation_member-model').MODEL;


module.exports = {

	/**
	 * ============================ *************************** ===============================
	 * ============================ 	MEMBER CONVERSATION	    ===============================
	 * ============================ *************************** ===============================
	 */

    /**
	 * Dev: MinhVH
	 * Func: Cập nhật member name cuộc hội thoại
	 * Date: 14/03/2022
	 */
    updateName: {
        auth: "required",
        params: {
            userID        : { type: "string" },
            bizfullname   : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { userID, bizfullname } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MEMBER_MODEL.update({ 
                    userID, bizfullname
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: MinhVH
	 * Func: Lấy danh sách member cuộc hội thoại
	 * Date: 10/08/2021
	 */
    getList: {
        auth: "required",
        params: {
            conversationID  : { type: "string" },
            lastestID       : { type: "string", optional: true },
            keyword         : { type: "string", optional: true },
            type            : { type: "string", optional: true },
            limit           : { type: "string", optional: true },
            select          : { type: "string", optional: true },
            populates       : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: authorID } = ctx.meta.infoUser;
                let { conversationID, lastestID, keyword, type, limit, select, populates } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MEMBER_MODEL.getList({ 
                    conversationID, authorID, lastestID, keyword, type, limit, select, populates
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    //========================= END MEMBER CONVERSATION  ==============================
}