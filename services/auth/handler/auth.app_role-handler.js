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
const AUTH__APP_ROLE = require('../model/auth.app_role').MODEL

module.exports = {
  insert: {
    auth: 'required',
    params: {
      type: { type: 'number' },
      appID: { type: 'string' },
      companyID: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID, company } = ctx.meta.infoUser
        // console.log({company})

        let { type, companyID, appID, name, description } = ctx.params
        // console.log({companyID})

        if (!companyID) {
          companyID = company._id
        }
        // console.log({companyID})

        let resultAfterCallHandler = await AUTH__APP_ROLE.insert({
          type,
          company: companyID,
          app: appID,
          name,
          description,
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
      appRoleID: { type: 'string' },
      name: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      membersAddID: { type: 'array', optional: true },
      membersRemoveID: { type: 'array', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let { appRoleID, name, description, membersAddID, membersRemoveID } =
          ctx.params
        let resultAfterCallHandler = await AUTH__APP_ROLE.update({
          appRoleID,
          name,
          description,
          userID,
          membersAddID,
          membersRemoveID,
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
      appRoleID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let { appRoleID } = ctx.params
        let resultAfterCallHandler = await AUTH__APP_ROLE.remove({
          appRoleID,
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

  removeMany: {
    auth: 'required',
    params: {
      appRoleIDs: { type: 'array' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let { appRoleIDs } = ctx.params
        let resultAfterCallHandler = await AUTH__APP_ROLE.removeMany({
          appRoleIDs,
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
      appRoleID: { type: 'string', optional: true },
      type: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },
      appID: { type: 'string', optional: true },
      isMember: { type: 'string', optional: true },

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
          appRoleID,
          type,
          companyID,
          appID,
          isMember,
          keyword,
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
        if (appRoleID) {
          resultAfterCallHandler = await AUTH__APP_ROLE.getInfo({
            appRoleID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await AUTH__APP_ROLE.getList({
            type,
            company: companyID,
            app: appID,
            isMember,
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
}
