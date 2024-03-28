/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__POSITION_MODEL = require('../model/item.position-model').MODEL

module.exports = {
  /**
   * Dev: MinhVH
   * Func: Insert position
   * Date: 30/02/2022
   */
  insert: {
    params: {
      name: { type: 'string' },
      description: { type: 'string' },
      companyID: { type: 'string', optional: true },
      parent: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        let { name, description, companyID, parent } = ctx.params

        if (!companyID) {
          companyID = company._id
        }

        const resultAfterCallHandler = await ITEM__POSITION_MODEL.insert({
          name,
          description,
          companyID,
          parent,
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
   * Dev: MinhVH
   * Func: Update position
   * Date: 30/02/2022
   */
  update: {
    params: {
      positionID: { type: 'string' },
      name: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const { positionID, name, description } = ctx.params

        const resultAfterCallHandler = await ITEM__POSITION_MODEL.update({
          positionID,
          name,
          description,
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
   * Dev: MinhVH
   * Func: Remove position => KHÔNG CHO PHÉP XÓA CÁC DANH MỤC
   * Date: 30/02/2022
   */

  /**
   * Dev: HiepNH
   * Func: Danh sách position
   */
  getInfoAndGetList: {
    params: {
      positionID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },
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
          companyID,
          positionID,
          keyword,
          limit,
          lastestID,
          select,
          populates,
        } = ctx.params
        let { company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        let resultAfterCallHandler
        if (positionID) {
          resultAfterCallHandler = await ITEM__POSITION_MODEL.getInfo({
            positionID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await ITEM__POSITION_MODEL.getList({
            companyID,
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
        return renderStatusCodeAndResponse({
          ctx,
          error_message: error.message,
        })
      }
    },
  },
}
