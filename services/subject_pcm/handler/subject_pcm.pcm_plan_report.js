/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const PCM_PLAN_REPORT_MODEL =
    require('../model/subject_pcm.pcm_plan_report').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: insert pcm_plan_report
     */
    insert: {
        auth: 'required',
        params: {
            type: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            conditionPin: { type: 'object', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { type, name, description, conditionPin, parentID } =
                    ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler = await PCM_PLAN_REPORT_MODEL.insert(
                    {
                        companyID: company._id,
                        type,
                        name,
                        description,
                        conditionPin,
                        parentID,
                        userID,
                    }
                )

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
     * Func: update pcm_plan_report
     */
    update: {
        auth: 'required',
        params: {
            subjectID: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            type: { type: 'number', optional: true },
            select: { type: 'string', optional: true },
            members: { type: 'array', optional: true },
            conditionPin: { type: 'object', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    subjectID,
                    name,
                    description,
                    type,
                    select,
                    members,
                    conditionPin,
                    option,
                    taskID,
                    reportsID,
                    reportsRemoveID,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await PCM_PLAN_REPORT_MODEL.update(
                    {
                        reportID: subjectID,
                        name,
                        description,
                        type,
                        userID,
                        select,
                        members,
                        conditionPin,
                        option,
                        taskID,
                        reportsID,
                        reportsRemoveID,
                    }
                )

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
     * Func: remove pcm_plan_report
     */
    remove: {
        auth: 'required',
        params: {
            reportsID: { type: 'array' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { reportsID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                // Bước check quyền
                const resultAfterCallHandler =
                    await PCM_PLAN_REPORT_MODEL.remove({
                        reportsID,
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
     * Dev: HiepNH
     * Func: getList and getInfo pcm_plan_report
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            type: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            subjectID: { type: 'string', optional: true },

            //==============================================
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    subjectID,
                    type,
                    parentID,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (subjectID) {
                    resultAfterCallHandler =
                        await PCM_PLAN_REPORT_MODEL.getInfo({
                            reportID: subjectID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await PCM_PLAN_REPORT_MODEL.getList({
                            type,
                            parentID,
                            userID,
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

    /**
     * Dev: MinhVH
     * Func: Download Excel
     * Date: 27/05/2022
     */
    exportTaskReport: {
        auth: 'required',
        params: {
            reportID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { reportID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await PCM_PLAN_REPORT_MODEL.exportTaskReport({
                        reportID,
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
