/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__CONFIG_MODEL = require('../model/item.config-model').MODEL

module.exports = {
  /**
   * Name: Insert ✅
   * Author : Hiepnh
   * Date: 03/5/2022
   */
  insert: {
    auth: 'required',
    params: {
      name: { type: 'string' },
      type: { type: 'string', optional: true },
      active: { type: 'string', optional: true },
      channel: { type: 'string', optional: true },
      template: { type: 'string', optional: true },
      secretKey: { type: 'string', optional: true },
      tokenKey: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        const { name, type, active, channel, template, secretKey, tokenKey } =
          ctx.params

        const resultAfterCallHandler = await ITEM__CONFIG_MODEL.insert({
          companyID: company._id,
          userID,
          name,
          type,
          active,
          channel,
          template,
          secretKey,
          tokenKey,
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
   * Name: Update ✅
   * Author : Hiepnh
   * Date: 03/5/2022
   */
  update: {
    auth: 'required',
    params: {
      configID: { type: 'string' },
      name: { type: 'string' },
      type: { type: 'string', optional: true },
      active: { type: 'string', optional: true },
      channel: { type: 'string', optional: true },
      template: { type: 'string', optional: true },
      secretKey: { type: 'string', optional: true },
      tokenKey: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const {
          configID,
          name,
          type,
          active,
          channel,
          template,
          secretKey,
          tokenKey,
        } = ctx.params

        const resultAfterCallHandler = await ITEM__CONFIG_MODEL.update({
          userID,
          configID,
          name,
          type,
          active,
          channel,
          template,
          secretKey,
          tokenKey,
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
   * Func: Danh sách area
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      configID: { type: 'string', optional: true },
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
        let { configID, keyword, limit, lastestID, select, populates } =
          ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (configID) {
          resultAfterCallHandler = await ITEM__CONFIG_MODEL.getInfo({
            configID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await ITEM__CONFIG_MODEL.getList({
            companyID: company._id,
            lastestID,
            keyword,
            select,
            limit,
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
