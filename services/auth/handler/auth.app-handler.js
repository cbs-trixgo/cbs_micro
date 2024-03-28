/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

const AUTH__APP_COLL = require('../database/permission/auth.app-coll')
const AUTH__APP_MODEL = require('../model/auth.app').MODEL

module.exports = {
    getInfoAndGetList: {
        params: {},
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    appID,
                    lock,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params
                let { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (appID) {
                    resultAfterCallHandler = await AUTH__APP_MODEL.getInfo({
                        appID,
                        select,
                        populates,
                    })
                } else {
                    resultAfterCallHandler = await AUTH__APP_MODEL.getList({
                        lock,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                    })
                }
                // console.log({resultAfterCallHandler})

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    checkVersionApp: {
        params: {
            version: { type: 'string' },
            deviceType: { type: 'string' },
            platform: { type: 'string' },
            domain: { type: 'string' },
            env: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { version, deviceType, env } = ctx.params
                const infoAppVersion = {
                    Teaser: {
                        ios: {
                            version: '1.0.3',
                        },
                        android: {
                            version: '1.0.3',
                        },
                    },
                    Trixgo: {
                        ios: {
                            version: '3.0.1',
                        },
                        android: {
                            version: '3.0.1',
                        },
                    },
                }

                let resultAfterCallHandler = {
                    error: false,
                    data: { latestVersion: false },
                }
                //Teaser
                if (env == 2) {
                    if (deviceType == 'ios') {
                        if (version == infoAppVersion.Teaser.ios.version) {
                            resultAfterCallHandler = {
                                error: false,
                                data: { latestVersion: true },
                            }
                            return renderStatusCodeAndResponse({
                                resultAfterCallHandler,
                                ctx,
                            })
                        }
                    }

                    if (deviceType == 'android') {
                        if (version == infoAppVersion.Teaser.android.version) {
                            resultAfterCallHandler = {
                                error: false,
                                data: { latestVersion: true },
                            }
                            return renderStatusCodeAndResponse({
                                resultAfterCallHandler,
                                ctx,
                            })
                        }
                    }
                }

                //Trixgo
                if (env == 3) {
                    if (deviceType == 'ios') {
                        if (version == infoAppVersion.Teaser.ios.version) {
                            resultAfterCallHandler = {
                                error: false,
                                data: { latestVersion: true },
                            }
                            return renderStatusCodeAndResponse({
                                resultAfterCallHandler,
                                ctx,
                            })
                        }
                    }

                    if (deviceType == 'android') {
                        if (version == infoAppVersion.Teaser.android.version) {
                            resultAfterCallHandler = {
                                error: false,
                                data: { latestVersion: true },
                            }
                            return renderStatusCodeAndResponse({
                                resultAfterCallHandler,
                                ctx,
                            })
                        }
                    }
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
