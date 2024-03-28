/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const CHATTING__MESSAGE_NPS_MODEL =
    require('../model/chatting.message_nps-model').MODEL

module.exports = {
    /**
     * ============================ ****************** ===============================
     * ============================ 	MESSAGE NPS    ===============================
     * ============================ ****************** ===============================
     */

    /**
     * Dev: MinhVH
     * Func: Thêm tin nhắn nps mới
     * Date: 20/02/2022
     */
    insert: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            serviceID: { type: 'string' },
            typeNps: { type: 'number' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { typeNps, conversationID, serviceID } = ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_NPS_MODEL.insert({
                        type: typeNps,
                        conversationID,
                        serviceID,
                        userID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Cập nhật nps
     * Date: 20/02/2022
     */
    update: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            messageID: { type: 'string' },
            score: { type: 'number', optional: true },
            reasons: { type: 'array', optional: true },
            reasonsCancel: { type: 'array', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const {
                    conversationID,
                    messageID,
                    score,
                    reasons,
                    reasonsCancel,
                } = ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_NPS_MODEL.update({
                        conversationID,
                        messageID,
                        score,
                        reasons,
                        reasonsCancel,
                        userID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Đóng nps
     * Date: 20/02/2022
     */
    closeNps: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            messageID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { conversationID, messageID } = ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_NPS_MODEL.closeNps({
                        conversationID,
                        messageID,
                        userID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Lấy danh sách nps
     * Date: 20/02/2022
     */
    getList: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { conversationID, lastestID, limit, select, populates } =
                    ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_NPS_MODEL.getList({
                        conversationID,
                        lastestID,
                        limit,
                        select,
                        populates,
                        userID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Điểm thống kê
     * Date: 07/06/2022
     */
    scoreStatistics: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            messageID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { conversationID, messageID } = ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_NPS_MODEL.scoreStatistics({
                        conversationID,
                        messageID,
                        userID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Thống kê khảo sát NPS
     * Date: 07/06/2022
     */
    reasonStatistics: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            messageID: { type: 'string' },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { conversationID, messageID, select, populates } =
                    ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_NPS_MODEL.reasonStatistics({
                        conversationID,
                        messageID,
                        select,
                        populates,
                        userID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },
}
