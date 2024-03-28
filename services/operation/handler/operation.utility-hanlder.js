/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const OPERATION__UTILITY_MODEL = require('../model/operation.utility').MODEL

//QUẢN LÝ TIỆN ÍCH GẦN CĂN HỘ

module.exports = {
  /**
   * Dev: HiepNH
   * Func: Thêm UTILITY
   * Date: 19/08/2021
   */
  insert: {
    auth: 'required',
    params: {
      name: { type: 'string' },
      description: { type: 'string', optional: true },
      latitude: { type: 'string', optional: true },
      longtitude: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const { name, description, latitude, longtitude } = ctx.params

        const resultAfterCallHandler = await OPERATION__UTILITY_MODEL.insert({
          name,
          description,
          latitude,
          longtitude,
          userID,
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

  /**
   * Dev: HiepNH
   * Func: Cập nhật UTILITY
   * Date: 19/08/2021
   */
  update: {
    auth: 'required',
    params: {
      utilityID: { type: 'string' },
      name: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      latitude: { type: 'string', optional: true },
      longtitude: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const { utilityID, name, description, latitude, longtitude } =
          ctx.params
        const resultAfterCallHandler = await OPERATION__UTILITY_MODEL.update({
          utilityID,
          name,
          description,
          latitude,
          longtitude,
          userID,
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

  /**
   * Dev: HiepNH
   * Func: Xóa UTILITY
   * Date: 19/08/2021
   */
  remove: {
    auth: 'required',
    params: {
      utilityID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const { utilityID } = ctx.params
        const resultAfterCallHandler = await OPERATION__UTILITY_MODEL.remove({
          utilityID,
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

  /**
   * Dev: HiepNH
   * Func: Xóa UTILITY
   * Date: 19/08/2021
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      utilityID: { type: 'string', optional: true },
      latitude: { type: 'string', optional: true },
      longtitude: { type: 'string', optional: true },

      // Mặc định
      keyword: { type: 'string', optional: true },
      limit: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      filter: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const {
          utilityID,
          latitude,
          longtitude,
          keyword,
          limit,
          lastestID,
          filter,
        } = ctx.params
        let resultAfterCallHandler
        if (utilityID) {
          resultAfterCallHandler = await OPERATION__UTILITY_MODEL.getInfo({
            utilityID,
          })
        } else {
          resultAfterCallHandler = await OPERATION__UTILITY_MODEL.getList({
            latitude,
            longtitude,
            keyword,
            limit,
            lastestID,
            filter,
          })
        }

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
