const ObjectID = require('mongoose').Types.ObjectId

/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const AUTH__APP_MENU = require('../model/auth.app_menu').MODEL
const AUTH__APP_ROLE_MENU = require('../model/auth.app_role_menu').MODEL

module.exports = {
    /**
     * Name: Tạo app menu
     * Dev: HiepNH
     */
    insert: {
        auth: 'required',
        params: {
            name: { type: 'string' },
            slug: { type: 'string' },
            appID: { type: 'string' },
            parentID: { type: 'string', optional: true },
            order: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { _id: userID } = ctx.meta.infoUser
                let { name, slug, parentID, appID, order } = ctx.params
                let resultAfterCallHandler = await AUTH__APP_MENU.insert({
                    name,
                    slug,
                    parent: parentID,
                    appID,
                    authorID: userID,
                    order,
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
     * Name: Cập nhật app menu
     * Dev: HiepNH
     */
    update: {
        auth: 'required',
        params: {
            appMenuID: { type: 'string' },
            name: { type: 'string', optional: true },
            slug: { type: 'string', optional: true },
            order: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { _id: userID } = ctx.meta.infoUser
                let { appMenuID, name, slug, order } = ctx.params
                let resultAfterCallHandler = await AUTH__APP_MENU.update({
                    appMenuID,
                    name,
                    slug,
                    order,
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
     * Name: Xoá app menu
     * Dev: HiepNH
     */
    remove: {
        auth: 'required',
        params: {
            appMenuID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { _id: userID } = ctx.meta.infoUser
                let { appMenuID } = ctx.params
                let resultAfterCallHandler = await AUTH__APP_MENU.remove({
                    appMenuID,
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
     * Name: Lấy thông tin hoặc danh sách
     * Dev: HiepNH
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            appMenuID: { type: 'string', optional: true },
            appID: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    appMenuID,
                    appID,
                    parentID,
                    select,
                    populates,
                    limit,
                    lastestID,
                } = ctx.params
                let resultAfterCallHandler
                if (appMenuID) {
                    resultAfterCallHandler = await AUTH__APP_MENU.getInfo({
                        appMenuID,
                        select,
                        populates,
                    })
                } else {
                    resultAfterCallHandler = await AUTH__APP_MENU.getList({
                        app: appID,
                        parent: parentID,
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
     * Name: Danh sách các công ty mà user được quyền truy cập vào 1 màn hình cụ thể
     * Author: Hiepnh
     * Date: 18/4/2022
     */
    getListCompany: {
        auth: 'required',
        params: {
            menuID: { type: 'string', optional: true },
            appID: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { menuID, appID, type } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await AUTH__APP_MENU.getListCompany({
                        type,
                        user: userID,
                        app: appID,
                        menu: menuID,
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
     * Name: Danh sách các màn hình của user khi truy cập vào ứng dụng
     * Dev: HiepNH
     * Date: 15/2/2023
     */
    getMobileFnbMenu: {
        auth: 'required',
        params: {},
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                let appID = '61e04971fdebf77b072d1b0f' // FNB_APP
                let arrUser = [
                    '63ed0debc0d91500123495d3',
                    '63ed0e083f7a130012d41058',
                    '63ed0e1d3f7a130012d41059',
                    '63ed0e303f7a130012d4105a',
                    '63ed0e860e2f4d00119e52fa',
                ]
                // MenuID cho Khách hàng (5)
                // MenuID cho Nhân viên (4)
                // MenuID cho Quản lý (3)
                // MenuID cho Ban lãnh đạo (2)
                // MenuID cho Nhà đầu tư (1)

                const { _id: userID, company } = ctx.meta.infoUser
                let accessApp = {
                    level: 0,
                    read: 0,
                    create: 0,
                    update: 0,
                    delete: 0,
                }
                // console.log({company: company._id})

                let info =
                    await AUTH__APP_ROLE_MENU.getPermissionToAccessOneMenuOfApp(
                        {
                            type: 1,
                            menu: ObjectID(arrUser[4]),
                            user: ObjectID(userID),
                            app: ObjectID(appID),
                            company: ObjectID(company._id),
                        }
                    )
                // console.log(info)
                if (!info || info.error) {
                    let info1 =
                        await AUTH__APP_ROLE_MENU.getPermissionToAccessOneMenuOfApp(
                            {
                                type: 1,
                                menu: ObjectID(arrUser[3]),
                                user: ObjectID(userID),
                                app: ObjectID(appID),
                                company: ObjectID(company._id),
                            }
                        )

                    if (!info1 || info1.error) {
                        let info2 =
                            await AUTH__APP_ROLE_MENU.getPermissionToAccessOneMenuOfApp(
                                {
                                    type: 1,
                                    menu: ObjectID(arrUser[2]),
                                    user: ObjectID(userID),
                                    app: ObjectID(appID),
                                    company: ObjectID(company._id),
                                }
                            )

                        if (!info2 || info2.error) {
                            let info3 =
                                await AUTH__APP_ROLE_MENU.getPermissionToAccessOneMenuOfApp(
                                    {
                                        type: 1,
                                        menu: ObjectID(arrUser[1]),
                                        user: ObjectID(userID),
                                        app: ObjectID(appID),
                                        company: ObjectID(company._id),
                                    }
                                )

                            if (!info3 || info3.error) {
                                let info4 =
                                    await AUTH__APP_ROLE_MENU.getPermissionToAccessOneMenuOfApp(
                                        {
                                            type: 1,
                                            menu: ObjectID(arrUser[0]),
                                            user: ObjectID(userID),
                                            app: ObjectID(appID),
                                            company: ObjectID(company._id),
                                        }
                                    )

                                if (!info4 || info4.error) {
                                } else {
                                    accessApp.level = 1
                                    accessApp.read = Number(info4.data.read)
                                    accessApp.create = Number(info4.data.create)
                                    accessApp.update = Number(info4.data.update)
                                    accessApp.delete = Number(info4.data.delete)
                                }
                            } else {
                                accessApp.level = 2
                                accessApp.read = Number(info3.data.read)
                                accessApp.create = Number(info3.data.create)
                                accessApp.update = Number(info3.data.update)
                                accessApp.delete = Number(info3.data.delete)
                            }
                        } else {
                            accessApp.level = 3
                            accessApp.read = Number(info2.data.read)
                            accessApp.create = Number(info2.data.create)
                            accessApp.update = Number(info2.data.update)
                            accessApp.delete = Number(info2.data.delete)
                        }
                    } else {
                        accessApp.level = 4
                        accessApp.read = Number(info1.data.read)
                        accessApp.create = Number(info1.data.create)
                        accessApp.update = Number(info1.data.update)
                        accessApp.delete = Number(info1.data.delete)
                    }
                } else {
                    accessApp.level = 5
                    accessApp.read = Number(info.data.read)
                    accessApp.create = Number(info.data.create)
                    accessApp.update = Number(info.data.update)
                    accessApp.delete = Number(info.data.delete)
                }
                return { error: false, accessApp }
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },
}
