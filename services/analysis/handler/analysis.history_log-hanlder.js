/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ANALYSIS__HISTORY_LOG_MODEL =
    require('../model/analysis.history_log').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: Insert history log
     */
    insert: {
        auth: 'required',
        params: {
            taskID: { type: 'string', optional: true },
            documentID: { type: 'string', optional: true },
            title: { type: 'string', optional: true },
            content: { type: 'string', optional: true },
            type: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { taskID, documentID, type, title, content } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await ANALYSIS__HISTORY_LOG_MODEL.insert({
                        taskID,
                        documentID,
                        type,
                        title,
                        content,
                        userID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: get info and history log
     */
    getInfoAndGetList: {
        params: {
            historyLogID: { type: 'string', optional: true },
            taskID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
            // Field mặc định
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    historyLogID,
                    taskID,
                    projectID,
                    contractID,
                    fromDate,
                    toDate,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (historyLogID) {
                    resultAfterCallHandler =
                        await ANALYSIS__HISTORY_LOG_MODEL.getInfo({
                            historyLogID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await ANALYSIS__HISTORY_LOG_MODEL.getList({
                            taskID,
                            projectID,
                            contractID,
                            fromDate,
                            toDate,
                            keyword,
                            limit,
                            lastestID,
                            select,
                            populates,
                        })
                }
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },
}
