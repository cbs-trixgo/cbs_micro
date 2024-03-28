/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__DEPARTMENT_DERECTORY_MODEL =
    require('../model/item.department_directory-model').MODEL

module.exports = {
    /**
     * Dev: HiepNH ✅
     * Func: Thêm department directory
     */
    insert: {
        params: {
            member: { type: 'string' },
            type: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string', optional: true },
            lock: { type: 'number' },
            order: { type: 'number' },
            projectID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                const {
                    member,
                    type,
                    name,
                    description,
                    lock,
                    order,
                    projectID,
                } = ctx.params
                const resultAfterCallHandler =
                    await ITEM__DEPARTMENT_DERECTORY_MODEL.insert({
                        projectID,
                        member,
                        type,
                        name,
                        description,
                        lock,
                        order,
                        userID,
                        ctx,
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
     * Dev: HiepNH ✅
     * Func: Cập nhật department directory
     */
    update: {
        params: {
            departmentDirectoryID: { type: 'string' },
            member: { type: 'string' },
            type: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            lock: { type: 'number' },
            order: { type: 'number' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                const {
                    departmentDirectoryID,
                    member,
                    type,
                    name,
                    description,
                    lock,
                } = ctx.params
                const resultAfterCallHandler =
                    await ITEM__DEPARTMENT_DERECTORY_MODEL.update({
                        departmentDirectoryID,
                        member,
                        type,
                        name,
                        description,
                        lock,
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
     * Func: Danh sách department directory
     */
    getInfoAndGetList: {
        params: {
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            departmentDirectoryID: { type: 'string', optional: true },

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
                    departmentDirectoryID,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    companyID,
                    projectID,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (departmentDirectoryID) {
                    resultAfterCallHandler =
                        await ITEM__DEPARTMENT_DERECTORY_MODEL.getInfo({
                            departmentDirectoryID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await ITEM__DEPARTMENT_DERECTORY_MODEL.getList({
                            companyID,
                            projectID,
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
