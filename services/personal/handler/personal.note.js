/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const PERSONAL__NOTE_MODEL = require('../model/personal.note').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: Thêm
     * Date: 9/4/2022
     */
    insert: {
        auth: 'required',
        params: {
            name: { type: 'string' },
            description: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { name, description } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await PERSONAL__NOTE_MODEL.insert({
                    userID,
                    name,
                    description,
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
     * Func: Sửa
     * Date: 9/4/2022
     */
    update: {
        auth: 'required',
        params: {
            noteID: { type: 'string' },
            name: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            members: { type: 'array', optional: true },
            membersRemove: { type: 'array', optional: true },
            trash: { type: 'number', optional: true }, // 1 là xóa
            pin: { type: 'number', optional: true }, // 1 là ghim
            removePin: { type: 'number', optional: true }, // 1 bỏ ghim
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    noteID,
                    name,
                    description,
                    members,
                    membersRemove,
                    trash,
                    pin,
                    removePin,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await PERSONAL__NOTE_MODEL.update({
                    noteID,
                    name,
                    description,
                    members,
                    membersRemove,
                    trash,
                    pin,
                    removePin,
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
     * Func: get info and get list
     * Date: 9/4/2022
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            noteID: { type: 'string', optional: true },
            pin: { type: 'string', optional: true },

            // Field mặc định
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const {
                    noteID,
                    keyword,
                    pin,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (noteID) {
                    resultAfterCallHandler = await PERSONAL__NOTE_MODEL.getInfo(
                        {
                            noteID,
                            select,
                            populates,
                        }
                    )
                } else {
                    resultAfterCallHandler = await PERSONAL__NOTE_MODEL.getList(
                        {
                            keyword,
                            pin,
                            limit,
                            lastestID,
                            select,
                            populates,
                            userID,
                        }
                    )
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
