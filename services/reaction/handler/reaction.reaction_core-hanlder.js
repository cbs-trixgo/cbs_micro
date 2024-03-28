/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const REACTION_CORE_MODEL =
    require('../model/reaction.reaction_core-model').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: Thêm reaction core
     * Date: 17/08/2021
     */
    insert: {
        params: {
            type: { type: 'number' },
            userID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let _id = ctx.meta?.infoUser?._id
                let { type, userID } = ctx.params

                const resultAfterCallHandler = await REACTION_CORE_MODEL.insert(
                    {
                        type,
                        userID: _id || userID,
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
     * Dev: HiepNH
     * Func: Sửa reaction core
     * Date: 17/08/2021
     */
    update: {
        auth: 'required',
        params: {
            reactionCoreID: { type: 'string' },
            type: { type: 'number' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { reactionCoreID, type } = ctx.params

                const resultAfterCallHandler = await REACTION_CORE_MODEL.update(
                    {
                        reactionCoreID,
                        type,
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
     * Func: LẤY DANH SÁCH REACTION
     * Date: 17/02/2022
     */
    getInfoAndGetList: {
        params: {
            lastestID: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            isGetTotal: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const {
                    conditionObj,
                    lastestID,
                    isGetTotal,
                    limit,
                    select,
                    populates,
                } = ctx.params

                const resultAfterCallHandler =
                    await REACTION_CORE_MODEL.getListReaction({
                        userID,
                        conditionObj,
                        lastestID,
                        isGetTotal,
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
