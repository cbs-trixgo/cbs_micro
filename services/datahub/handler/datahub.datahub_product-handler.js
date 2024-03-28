/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const DATAHUB_PRODUCT_MODEL =
  require('../model/datahub.datahub_product-model').MODEL

module.exports = {
  /**
   * Dev: HiepNH
   * Func: Thêm datahub
   */
  insert: {
    params: {
      parentID: { type: 'string', optional: true },
      type: { type: 'number' },
      name: { type: 'string' },
      sign: { type: 'string' },
      unit: { type: 'string' },
      description: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      unitprice: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { parentID, type, sign, name, description, unit, note, unitprice } =
          ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await DATAHUB_PRODUCT_MODEL.insert({
          parentID,
          type,
          sign,
          name,
          description,
          unit,
          note,
          unitprice,
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
   * Func: Sửa datahub
   */
  update: {
    params: {
      productID: { type: 'string' },
      name: { type: 'string' },
      sign: { type: 'string' },
      unit: { type: 'string' },
      description: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      unitprice: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { productID, sign, name, description, unit, note, unitprice } =
          ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await DATAHUB_PRODUCT_MODEL.update({
          productID,
          sign,
          name,
          description,
          unit,
          note,
          unitprice,
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
   * Func: Xóa datahub
   */
  remove: {
    params: {
      productsID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { productsID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await DATAHUB_PRODUCT_MODEL.remove({
          productsID,
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
   * Func: get info and get list datahub
   */
  getInfoAndGetList: {
    params: {
      productID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },

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
          productID,
          parentID,
          lastestID,
          keyword,
          limit,
          select,
          populates,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (productID) {
          resultAfterCallHandler = await DATAHUB_PRODUCT_MODEL.getInfo({
            productID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await DATAHUB_PRODUCT_MODEL.getList({
            productID,
            parentID,
            userID,
            lastestID,
            keyword,
            limit,
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
