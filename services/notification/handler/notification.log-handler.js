/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const NOTIFICATION_LOG_MODEL = require('../model/notification.log-model').MODEL

module.exports = {
    /**
     * ============================ ***************** ===============================
     * ============================    NOTIFICATION   ===============================
     * ============================ ***************** ===============================
     */

    /**
     * Dev: MinhVH 🐸
     * Func: Thêm thông báo
     * Date: 16/12/2021
     */
    insert: {
        auth: 'required',
        params: {
            content: { type: 'string' },
            receivers: { type: 'array' },
            type: { type: 'number' },
            languageKey: { type: 'string' },
            path: { type: 'string', optional: true },
            project: { type: 'string', optional: true },
            contract: { type: 'string', optional: true },
            app: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: sender } = ctx.meta.infoUser
                const {
                    type,
                    content,
                    path,
                    receivers,
                    languageKey,
                    project,
                    contract,
                    app,
                    mainColl,
                    subColl,
                } = ctx.params

                const resultAfterCallHandler =
                    await NOTIFICATION_LOG_MODEL.insert({
                        type,
                        content,
                        path,
                        sender,
                        receivers,
                        languageKey,
                        project,
                        contract,
                        app,
                        mainColl,
                        subColl,
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
     * Dev: MinhVH 🐸
     * Func: Cập nhật trạng thái gửi thông báo
     * Date: 16/12/2021
     */
    update: {
        auth: 'required',
        params: {
            notificationID: { type: 'string', optional: true },
            status: { type: 'number', optional: true },
            isUpdateSendSuccess: { type: 'boolean', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { notificationID, status, isUpdateSendSuccess } =
                    ctx.params

                const resultAfterCallHandler =
                    await NOTIFICATION_LOG_MODEL.update({
                        notificationID,
                        status,
                        isUpdateSendSuccess,
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
     * Dev: MinhVH 🐸
     * Func: Cập nhật trạng thái gửi thông báo
     * Date: 16/12/2021
     */
    markAllRead: {
        auth: 'required',
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await NOTIFICATION_LOG_MODEL.markAllRead({
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
     * Dev: MinhVH 🐸
     * Func: Lấy danh sách thông báo
     * Date: 16/12/2021
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            projectID: { type: 'string', optional: true },
            status: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const {
                    lastestID,
                    projectID,
                    status,
                    keyword,
                    limit,
                    populates,
                    select,
                } = ctx.params

                const resultAfterCallHandler =
                    await NOTIFICATION_LOG_MODEL.getList({
                        authorID,
                        lastestID,
                        projectID,
                        status,
                        keyword,
                        limit,
                        select,
                        populates,
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
