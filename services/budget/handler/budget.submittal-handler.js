/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BUDGET__SUBMITTAL_MODEL = require('../model/budget.submittal-model').MODEL

module.exports = {
    /**
     * Dev: Hiepnh
     * Func: Thêm
     * Date: 9/4/2022
     */
    insert: {
        auth: 'required',
        params: {
            taskID: { type: 'string' },
            workID: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            unit: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            plus: { type: 'number', optional: true },
            quantity: { type: 'number' },
            unitPrice: { type: 'number' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    plus,
                    taskID,
                    workID,
                    name,
                    sign,
                    note,
                    quantity,
                    unitPrice,
                } = ctx.params

                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await BUDGET__SUBMITTAL_MODEL.insert({
                        ctx,
                        userID,
                        plus,
                        taskID,
                        workID,
                        name,
                        sign,
                        note,
                        quantity,
                        unitPrice,
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
     * Dev: Hiepnh
     * Func: Sửa
     * Date: 9/4/2022
     */
    update: {
        auth: 'required',
        params: {
            submitID: { type: 'string' },
            workID: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            unit: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            plus: { type: 'number', optional: true },
            quantity: { type: 'number' },
            unitPrice: { type: 'number' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    submitID,
                    plus,
                    workID,
                    name,
                    sign,
                    note,
                    quantity,
                    unitPrice,
                } = ctx.params

                const { _id: userID } = ctx.meta.infoUser
                let resultAfterCallHandler =
                    await BUDGET__SUBMITTAL_MODEL.update({
                        submitID,
                        plus,
                        workID,
                        name,
                        sign,
                        note,
                        quantity,
                        unitPrice,
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
     * Dev: Hiepnh
     * Func: Xóa
     * Date: 9/4/2022
     */
    remove: {
        auth: 'required',
        params: {
            submitID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { submitID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser
                let resultAfterCallHandler =
                    await BUDGET__SUBMITTAL_MODEL.remove({
                        submitID,
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
     * Dev: Hiepnh
     * Func: get info and get list
     * Date: 9/4/2022
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            submitID: { type: 'string', optional: true },
            taskID: { type: 'string', optional: true },

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
                let {
                    submitID,
                    taskID,
                    keyword,
                    limit,
                    lastestID,
                    populates,
                    select,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (submitID) {
                    resultAfterCallHandler =
                        await BUDGET__SUBMITTAL_MODEL.getInfo({
                            submitID,
                            userID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await BUDGET__SUBMITTAL_MODEL.getList({
                            taskID,
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
     * Dev: HiepNH
     * Func: Gom nhóm theo tính chất
     * Date: 6/8/2023
     */
    getListByProperty: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
            taskID: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { option, taskID, companyID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await BUDGET__SUBMITTAL_MODEL.getListByProperty({
                        option,
                        taskID,
                        companyID,
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
}
