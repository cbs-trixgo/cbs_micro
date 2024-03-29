/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__WAREHOUSE_MODEL = require('../model/item.warehouse-model').MODEL

module.exports = {
  /**
   * Dev: HiepNH ✅
   * Func: Thêm warehouse
   */
  insert: {
    params: {
      name: { type: 'string' },
      description: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        console.log({ company })
        const { name, description, parentID } = ctx.params
        const resultAfterCallHandler = await ITEM__WAREHOUSE_MODEL.insert({
          companyID: company._id,
          parentID,
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

  /**
   * Dev: HiepNH ✅
   * Func: Cập nhật warehouse
   */
  update: {
    params: {
      warehouseID: { type: 'string' },
      name: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        const { warehouseID, name, description } = ctx.params
        const resultAfterCallHandler = await ITEM__WAREHOUSE_MODEL.update({
          warehouseID,
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

  /**
   * Dev: HiepNH
   * Func: Danh sách doctype
   */
  getInfoAndGetList: {
    params: {
      warehouseID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      isListParentOfListChilds: { type: 'string', optional: true },
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
          warehouseID,
          keyword,
          limit,
          lastestID,
          select,
          populates,
          parentID,
          isListParentOfListChilds,
        } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        let resultAfterCallHandler
        if (warehouseID) {
          resultAfterCallHandler = await ITEM__WAREHOUSE_MODEL.getInfo({
            warehouseID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await ITEM__WAREHOUSE_MODEL.getList({
            companyID,
            lastestID,
            keyword,
            limit,
            select,
            populates,
            parentID,
            isListParentOfListChilds,
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
