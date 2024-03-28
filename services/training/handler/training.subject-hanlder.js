/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const TRAINING__SUBJECT_MODEL = require('../model/training.subject-model').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: insert subject
     */
    insert: {
        auth: 'required',
        params: {
            name: { type: 'string' },
            description: { type: 'string', optional: true },
            parent: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { name, description, parent } = ctx.params
                const { _id: userID } = ctx.meta.infoUser
                let resultAfterCallHandler =
                    await TRAINING__SUBJECT_MODEL.insert({
                        name,
                        description,
                        parent,
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
     * Func: update subject
     */
    update: {
        auth: 'required',
        params: {
            subjectID: { type: 'string' },
            name: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            content: { type: 'string', optional: true },
            image: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { subjectID, name, description, content, image } =
                    ctx.params
                const { _id: userID } = ctx.meta.infoUser
                // Bước check quyền
                let resultAfterCallHandler =
                    await TRAINING__SUBJECT_MODEL.update({
                        subjectID,
                        name,
                        description,
                        content,
                        image,
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
     * Func: remove subject
     */
    remove: {
        auth: 'required',
        params: {
            subjectID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { subjectID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser
                // Bước check quyền
                let resultAfterCallHandler =
                    await TRAINING__SUBJECT_MODEL.remove({
                        subjectID,
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
     * Func: getList and getInfo subject
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            subjectID: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },

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
                    keyword,
                    limit,
                    lastestID,
                    parentID,
                    select,
                    populates,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (subjectID) {
                    resultAfterCallHandler =
                        await TRAINING__SUBJECT_MODEL.getInfo({
                            subjectID,
                            userID,
                            select,
                            populates,
                            ctx,
                        })
                } else {
                    resultAfterCallHandler =
                        await TRAINING__SUBJECT_MODEL.getList({
                            parentID,
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
