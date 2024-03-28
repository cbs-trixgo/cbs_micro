const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

const AUTH__APP_USER = require('../model/auth.app_users').MODEL

module.exports = {
  insert: {
    auth: 'required',
    params: {
      appID: { type: 'string' },
      companyID: { type: 'string' },
      users: { type: 'array' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let { appID, companyID, users } = ctx.params
        let resultAfterCallHandler = await AUTH__APP_USER.insert({
          appID,
          companyID,
          users,
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

  update: {
    auth: 'required',
    params: {
      appID: { type: 'string' },
      companyID: { type: 'string' },
      memberID: { type: 'string' },
      level: { type: 'number' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let { appID, companyID, memberID, level } = ctx.params
        let resultAfterCallHandler = await AUTH__APP_USER.update({
          appID,
          companyID,
          memberID,
          level,
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

  remove: {
    auth: 'required',
    params: {
      appUserIDs: { type: 'array' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let { appUserIDs } = ctx.params
        let resultAfterCallHandler = await AUTH__APP_USER.remove({
          appUserIDs,
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

  getList: {
    auth: 'required',
    params: {
      appID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },

      limit: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let { appID, companyID, limit, lastestID, select, populates } =
          ctx.params

        let resultAfterCallHandler = await AUTH__APP_USER.getList({
          appID,
          companyID,
          limit,
          lastestID,
          select,
          populates,
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

  getListAppOfUser: {
    auth: 'required',
    params: {
      limit: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let { limit, lastestID, select, populates } = ctx.params

        let resultAfterCallHandler = await AUTH__APP_USER.getListAppOfUser({
          userID,
          limit: +limit,
          lastestID,
          select,
          populates,
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

  checkPermissionsAccessApp: {
    auth: 'required',
    params: {
      appID: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let { appID, select, populates } = ctx.params

        let resultAfterCallHandler =
          await AUTH__APP_USER.checkPermissionsAccessApp({
            appID,
            userID,
            select,
            populates,
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
