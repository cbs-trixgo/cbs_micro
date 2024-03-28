/*******************************************************
 *    TÊN MODULE : NHÓM CHỨC NĂNG                      *
 *    NGƯỜI VIÊT : PHAN VĂN ĐỆ                         *
 *    LIỆN HỆ    : lucdeit1997@gmail.com - 0393553224  *
 *    THỜI GIAN  : 27/01/2022                          *
 ********************************************************/
/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const AUTH__APP_ROLE_MENU = require('../model/auth.app_role_menu').MODEL

module.exports = {
    insert: {
        auth: 'required',
        params: {
            role: { type: 'string' },
            menu: { type: 'string' },
            read: { type: 'number' },
            create: { type: 'number' },
            update: { type: 'number' },
            deleteIn: { type: 'number' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { _id: userID } = ctx.meta.infoUser
                let { role, menu, read, create, update, deleteIn } = ctx.params
                let resultAfterCallHandler = await AUTH__APP_ROLE_MENU.insert({
                    role,
                    menu,
                    read,
                    create,
                    update,
                    deleteIn,
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

    getInfoAndGetList: {
        auth: 'required',
        params: {
            appRoleMenuID: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            appID: { type: 'string', optional: true },
            roleID: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    appRoleMenuID,
                    companyID,
                    appID,
                    roleID,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params
                let { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler
                if (appRoleMenuID) {
                } else {
                    resultAfterCallHandler = await AUTH__APP_ROLE_MENU.getList({
                        company: companyID,
                        app: appID,
                        role: roleID,
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

    getPermissionToAccessListMenuOfApp: {
        auth: 'required',
        params: {
            companyID: { type: 'string' },
            appID: { type: 'string' },
            type: { type: 'string' }, // Để biết truy cập nhóm chức năng ở ứng dụng hay dự án
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { companyID, appID, type } = ctx.params
                let { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler =
                    await AUTH__APP_ROLE_MENU.getPermissionToAccessListMenuOfApp(
                        { user: userID, app: appID, company: companyID, type }
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

    getPermissionToAccessOneMenuOfApp: {
        auth: 'required',
        params: {
            companyID: { type: 'string' },
            appID: { type: 'string' },
            menuID: { type: 'string' },
            type: { type: 'string' }, // Để biết truy cập nhóm chức năng ở ứng dụng hay dự án
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { companyID, appID, menuID, type } = ctx.params
                let { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler =
                    await AUTH__APP_ROLE_MENU.getPermissionToAccessOneMenuOfApp(
                        {
                            user: userID,
                            app: appID,
                            company: companyID,
                            type,
                            menu: menuID,
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
}
