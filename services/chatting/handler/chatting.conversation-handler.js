/**
 * CONSTATNS
 */
const { CF_DOMAIN_SERVICES } 					= require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_AUTH } 						= require('../../auth/helper/auth.actions-constant');

/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const CHATTING__CONVERSATION_MODEL              = require('../model/chatting.conversation-model').MODEL;
const CHATTING__CONVERSATION_FILE_MODEL         = require('../model/chatting.conversation_file-model').MODEL;
const CHATTING__CONVERSATION_LINK_MODEL         = require('../model/chatring.conversation_link-model').MODEL;


module.exports = {

	/**
	 * ============================ ********************* ===============================
	 * ============================ 	CONVERSATION  	  ===============================
	 * ============================ ********************* ===============================
	 */

    /**
	 * Dev: MinhVH
	 * Func: Thêm cuộc hội thoại mới
	 * Date: 03/08/2021
	 * Updated: [
     *  11/01/2022 - 13:55 - MinhVH
     * ]
	 */
    insertConversation: {
        auth: "required",
        params: {
            name        : { type: "string", optional: true },
            description : { type: "string", optional: true },
            isPrivate   : { type: "boolean" }
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID, company, bizfullname } = ctx.meta.infoUser;
                const { name, description, membersID, isPrivate } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.insertConversation({
					name, description, bizfullname, authorID, membersID, isPrivate, company, ctx
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật cuộc hội thoại
	 * Date: 04/08/2021
	 */
	updateConversation: {
        auth: "required",
        params: {
            conversationID  : { type: "string" },
            name        	: { type: "string", optional: true },
            description 	: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationID, name, description, avatar } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.updateConversation({
					conversationID, userID, name, description, avatar, ctx
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: MinhVH
	 * Func: Cập nhật tên cuộc hội thoại riêng tư (service call service)
	 * Date: 11/01/2022
	 */
    updateConversationNamePrivate: {
        auth: "required",
        params: {},
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { bizfullname } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.updateConversationNamePrivate({
					userID, bizfullname
				});

                return resultAfterCallHandler;
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Thêm thành viên cuộc hội thoại
	 * Date: 06/08/2021
	 */
	addMembersToConversation: {
        auth: "required",
        params: {
            conversationID: { type: "string" }
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { conversationID, membersID } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.addMembersToConversation({
					conversationID, authorID, membersID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Thêm thành viên cuộc hội thoại
	 * Date: 06/08/2021
	 */
	removeMemberInConversation: {
        auth: "required",
        params: {
            conversationID  : { type: "string" },
            memberID        : { type: "string" }
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { conversationID, memberID } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.removeMemberInConversation({
					conversationID, authorID, memberID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật admin cho cuộc hội thoại
	 * Date: 07/08/2021
	 */
	updateAdminConversation: {
        auth: "required",
        params: {
            conversationID  : { type: "string" },
            memberID        : { type: "string" },
            isSetAdmin      : { type: "boolean" },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { conversationID, memberID, isSetAdmin } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.updateAdminConversation({
					conversationID, authorID, memberID, isSetAdmin
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật cài đặt cho cuộc hội thoại (group chat)
	 * Date: 09/08/2021
	 */
	updateConfigConversation: {
        auth: "required",
        params: {
            conversationID  : { type: "string" },
            typeConfig      : { type: "number" },
            valueConfig     : { type: "number" },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { conversationID, typeConfig, valueConfig } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.updateConfigConversation({
					conversationID, authorID, typeConfig, valueConfig
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật pin cuộc hội thoại
	 * Date: 09/08/2021
	 */
	updatePinConversation: {
        auth: "required",
        params: {
            conversationID  : { type: "string" },
            isPin        	: { type: "boolean" }
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationID, isPin } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.updatePinConversation({
					conversationID, userID, isPin, ctx
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: VinhHV
	 * Func: Lấy thông tin một cuộc hội thoại theo ID
	 * Date: ...
	 * Updated: MinhVH - 04/08/2021
	 */
    getInfoConversationByID: {
        auth: "required",
        params: {
            conversationID: { type: "string" },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				let { _id: userID }  					= ctx.meta.infoUser;
                let { conversationID, filter, select } 	= ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.getInfoConversationByID({ 
					conversationID, userID, filter, select
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Xem các nhóm chung với 1 thành viên
	 * Date: 11/08/2021
	 */
	getInfoGeneralGroupsByMember: {
        auth: "required",
        params: {
            memberID: { type: "string" }
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				let { _id: userID } = ctx.meta.infoUser;
                let { memberID } 	= ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.getInfoGeneralGroupsByMember({ 
					userID, memberID
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Lấy danh sách tin nhắn cuộc hội thoại (tìm kiếm tin nhắn, phân trang)
	 * Date: 11/08/2021
	 */
	getListMessagesConversationWithPage: {
        auth: "required",
        params: {
            conversationID	: { type: "string" },
			lastestID 		: { type: "string", optional: true },
			keyword 		: { type: "string", optional: true },
			limit 		    : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { conversationID, lastestID, keyword, limit, filter, select } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.getListMessagesConversationWithPage({ 
					conversationID, lastestID, userID, keyword, limit, filter, select
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Tìm kiếm tin nhắn cuộc hội thoại (Dữ liệu trả về là 5 tin nhắn trước và sau tin nhắn tìm thấy)
	 * Date: 23/08/2021
	 */
	searchMessageConversationById: {
        auth: "required",
        params: {
            conversationID	: { type: "string" },
            messageID		: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { conversationID, messageID, filter, select } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.searchMessageConversationById({ 
					conversationID, userID, messageID, filter, select
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Lấy danh sách tin nhắn media cuộc hội thoại
	 * Date: 12/08/2021
	 */
	getListMessagesMediaConversation: {
        auth: "required",
        params: {
            conversationID	 : { type: "string" },
            typeMessage		 : { type: "string" },
            senderID		 : { type: "string", optional: true },
            dateCreate		 : { type: "string", optional: true },
            fromDate		 : { type: "string", optional: true },
            toDate			 : { type: "string", optional: true },
            page			 : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { 
					conversationID, typeMessage, senderID, dateCreate, fromDate, toDate, page 
				} = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.getListMessagesMediaConversation({ 
					conversationID, userID, typeMessage, senderID, dateCreate, fromDate, toDate, page
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Lấy danh sách thành viên gửi tin nhắn media cuộc hội thoại
	 * Date: 13/08/2021
	 */
	getListMemberSendMessagesMediaConversation: {
        auth: "required",
        params: {
            conversationID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { conversationID } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.getListMemberSendMessagesMediaConversation({ 
					conversationID, userID
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật trạng thái ẩn cuộc hội thoại của 1 user
	 * Date: 14/08/2021
	 */
	updateHideConversation: {
        auth: "required",
        params: {
            conversationID	: { type: "string" },
            isHide			: { type: "boolean" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { conversationID, isHide } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.updateHideConversation({ 
					conversationID, userID, isHide
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Cập nhật on/off thông báo cuộc hội thoại của 1 user
	 * Date: 14/08/2021
	 */
	updateMuteConversation: {
        auth: "required",
        params: {
            conversationID	: { type: "string" },
            isMute			: { type: "boolean" },
            timeMute		: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { conversationID, isMute, timeMute } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.updateMuteConversation({ 
					conversationID, userID, isMute, timeMute, ctx
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Đánh dấu đã đọc cuộc hội thoại của 1 user
	 * Date: 14/08/2021
	 */
	markReadConversation: {
        auth: "required",
        params: {
            conversationID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { conversationID } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.markReadConversation({ 
					conversationID, userID
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Member rời khỏi cuộc hội thoại
	 * Date: 14/08/2021
	 */
	memberLeaveConversation: {
        auth: "required",
        params: {
            conversationID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { conversationID } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.memberLeaveConversation({ 
					conversationID, userID
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Giải tán cuộc hội thoại (xóa nhóm)
	 * Date: 14/08/2021
	 */
	deleteConversation: {
        auth: "required",
        params: {
            conversationID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { conversationID } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.deleteConversation({ 
					conversationID, userID
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Xoá lịch sử cuộc hội thoại
	 * Date: 15/08/2021
	 */
	deleteHistoryConversation: {
        auth: "required",
        params: {
            conversationID: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { _id: userID } = ctx.meta.infoUser;
                let { conversationID } = ctx.params;

                let resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.deleteHistoryConversation({ 
					conversationID, userID
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
				return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: VinhHV
	 * Func: Lấy danh sách cuộc hội thoại (hoặc tìm kiếm theo tên)
	 * Date: ...
	 * Updated: MinhVH - 23/08/2021
	 */
	getListConversationWithPage: {
        auth: "required",
        params: {
            lastestID : { type: "string", optional: true },
            keyword	  : { type: "string", optional: true },
            limit	  : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID, bizfullname } = ctx.meta.infoUser;
                const { lastestID, keyword, filter, limit, select } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.getListConversationWithPage({
					lastestID, userID, keyword, bizfullname, filter, limit, select, ctx
				});

				return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Danh sách cuộc hội thoại đã pin
	 * Date: 06/09/2021
	 */
	getListPinConversation: {
        auth: "required",
        params: {},
        async handler(ctx) {
            try {
				const { _id: userID } = ctx.meta.infoUser;
				const { select } = ctx.params;

				const resultAfterCallHandler = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_PIN_CONVERSATION}`, {
					userID, select
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

	/**
	 * Dev: MinhVH
	 * Func: Lấy danh sách cuộc hội thoại chưa đọc
	 * Date: 09/09/2021
	 */
	getListConversationMissMessage: {
        auth: "required",
        params: {
			lastestID   : { type: "string", optional: true },
			limit       : { type: "string", optional: true },
			filter      : { type: "string", optional: true },
			select      : { type: "string", optional: true },
		},
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { lastestID, limit, filter, select } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_MODEL.getListConversationMissMessage({ 
					userID, lastestID, limit, filter, select
				})

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: MinhVH
	 * Func: Lấy danh sách file trong cuộc hội thoại
	 * Date: 04/01/2022
	 */
	getListFileConversation: {
        auth: "required",
        params: {
			conversationID 	: { type: "string" },
			lastestID 	    : { type: "string", optional: true },
			authorID 	    : { type: "string", optional: true },
			fromDate 	    : { type: "string", optional: true },
			toDate 	        : { type: "string", optional: true },
			type 	        : { type: "string", optional: true },
			keyword 	    : { type: "string", optional: true },
			select 	        : { type: "string", optional: true },
			populates       : { type: "string", optional: true },
			limit           : { type: "string", optional: true },
		},
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { lastestID, conversationID, authorID, fromDate, toDate, type, keyword, limit, select, populates } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_FILE_MODEL.getList({ 
					userID, lastestID, conversationID, authorID, fromDate, toDate, type, keyword, limit, select, populates
				})

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: MinhVH
	 * Func: Lấy danh sách link trong cuộc hội thoại
	 * Date: 10/01/2022
	 */
	getListLinkConversation: {
        auth: "required",
        params: {
			conversationID 	: { type: "string" },
			messageID 	    : { type: "string", optional: true },
			authorID 	    : { type: "string", optional: true },
			lastestID 	    : { type: "string", optional: true },
			fromDate 	    : { type: "string", optional: true },
			toDate 	        : { type: "string", optional: true },
			keyword 	    : { type: "string", optional: true },
			limit           : { type: "string", optional: true },
			select 	        : { type: "string", optional: true },
			populates       : { type: "string", optional: true },
		},
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const { conversationID, messageID, authorID, lastestID, fromDate, toDate, keyword, limit, select, populates } = ctx.params;

                const resultAfterCallHandler = await CHATTING__CONVERSATION_LINK_MODEL.getList({ 
					userID, conversationID, messageID, authorID, lastestID, fromDate, toDate, keyword, limit, select, populates
				})

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    //========================= END CONVERSATION  ==============================
}
