/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const CHATTING__MESSAGE_REMINDER_MODEL =
    require('../model/chatting.message_reminder-model').MODEL

module.exports = {
    /**
     * ============================ ********************** ===============================
     * ============================ 	MESSAGE REMINDER   ===============================
     * ============================ ********************** ===============================
     */

    /**
     * Dev: MinhVH
     * Func: Thêm tin nhắn reminder mới
     * Date: 01/09/2021
     */
    insert: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            content: { type: 'string' },
            notifyFor: { type: 'string' },
            remindTime: { type: 'string' },
            repeat: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const {
                    conversationID,
                    content,
                    notifyFor,
                    remindTime,
                    repeat,
                } = ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_REMINDER_MODEL.insert({
                        conversationID,
                        content,
                        notifyFor,
                        remindTime,
                        repeat,
                        authorID,
                        ctx,
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
     * Func: Cập nhật reminder
     * Date: 01/09/2021
     */
    update: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            messageID: { type: 'string' },
            content: { type: 'string' },
            remindTime: { type: 'string' },
            repeat: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const {
                    conversationID,
                    messageID,
                    content,
                    remindTime,
                    repeat,
                } = ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_REMINDER_MODEL.update({
                        conversationID,
                        messageID,
                        content,
                        remindTime,
                        repeat,
                        authorID,
                        ctx,
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
     * Func: Cập nhật thành viên join reminder
     * Date: 01/09/2021
     */
    updateUsersJoinReminder: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            messageID: { type: 'string' },
            isJoin: { type: 'boolean' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { conversationID, messageID, isJoin } = ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_REMINDER_MODEL.updateUsersJoinReminder(
                        {
                            conversationID,
                            messageID,
                            isJoin,
                            authorID,
                        }
                    )

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
     * Func: Xoá reminder
     * Date: 01/09/2021
     */
    delete: {
        auth: 'required',
        params: {
            conversationID: { type: 'string' },
            messageID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { conversationID, messageID } = ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_REMINDER_MODEL.delete({
                        conversationID,
                        messageID,
                        authorID,
                        ctx,
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
     * Func: Lấy danh sách reminder
     * Date: 02/09/2021
     */
    getList: {
        auth: 'required',
        params: {
            conversationID: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            isJoined: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { conversationID, lastestID, isJoined, limit } =
                    ctx.params

                const resultAfterCallHandler =
                    await CHATTING__MESSAGE_REMINDER_MODEL.getList({
                        conversationID,
                        lastestID,
                        authorID,
                        isJoined,
                        limit,
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
}
