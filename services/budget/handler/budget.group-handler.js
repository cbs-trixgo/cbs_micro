/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BUDGET__GROUP_MODEL = require('../model/budget.group-model').MODEL

module.exports = {
  /**
   * Dev: Hiepnh
   * Func: Thêm
   * Date: 9/4/2022
   */
  insert: {
    auth: 'required',
    params: {
      itemID: { type: 'string' },
      plus: { type: 'number', optional: true }, // Để lại sau
      reasonID: { type: 'string', optional: true }, // Để lại sau
      name: { type: 'string' },
      sign: { type: 'string', optional: true },
      unit: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      type: { type: 'number', optional: true },
      quantity: { type: 'number', optional: true },
      unitPrice: { type: 'number', optional: true },
      forecastAmount: { type: 'number', optional: true },
      forecastQuantity: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const {
          itemID,
          plus,
          reasonID,
          name,
          sign,
          unit,
          unitPrice,
          forecastAmount,
          forecastQuantity,
          description,
          note,
          type,
          quantity,
        } = ctx.params

        const { _id: userID } = ctx.meta.infoUser

        const resultAfterCallHandler = await BUDGET__GROUP_MODEL.insert({
          ctx,
          userID,
          itemID,
          plus,
          reasonID,
          name,
          sign,
          unit,
          unitPrice,
          forecastAmount,
          forecastQuantity,
          description,
          note,
          type,
          quantity,
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
   * Dev: Hiepnh
   * Func: Sửa
   * Date: 9/4/2022
   */
  update: {
    auth: 'required',
    params: {
      groupID: { type: 'string' },
      plus: { type: 'number', optional: true },
      reasonID: { type: 'string', optional: true },
      name: { type: 'string' },
      sign: { type: 'string', optional: true },
      unit: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      type: { type: 'number', optional: true },
      quantity: { type: 'number', optional: true },
      unitPrice: { type: 'number', optional: true },
      forecastAmount: { type: 'number', optional: true },
      forecastQuantity: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          groupID,
          plus,
          reasonID,
          name,
          sign,
          unit,
          unitPrice,
          forecastAmount,
          forecastQuantity,
          description,
          note,
          type,
          quantity,
        } = ctx.params

        const { _id: userID } = ctx.meta.infoUser
        let resultAfterCallHandler = await BUDGET__GROUP_MODEL.update({
          groupID,
          plus,
          reasonID,
          name,
          sign,
          unit,
          unitPrice,
          forecastAmount,
          forecastQuantity,
          description,
          note,
          type,
          quantity,
          userID,
          ctx,
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
   * Dev: Hiepnh
   * Func: Xóa
   * Date: 9/4/2022
   */
  remove: {
    auth: 'required',
    params: {
      groupID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { groupID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser
        let resultAfterCallHandler = await BUDGET__GROUP_MODEL.remove({
          groupID,
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
   * Dev: Hiepnh
   * Func: Get info and get list
   * Date: 9/4/2022
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      groupID: { type: 'string', optional: true },
      itemID: { type: 'string', optional: true },
      budgetID: { type: 'string', optional: true },

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
          groupID,
          itemID,
          budgetID,
          keyword,
          limit,
          lastestID,
          populates,
          select,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (groupID) {
          resultAfterCallHandler = await BUDGET__GROUP_MODEL.getInfo({
            groupID,
            userID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await BUDGET__GROUP_MODEL.getList({
            itemID,
            budgetID,
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

  /**
   * Dev: Hiepnh
   * Func: Cập nhật giá trị (ngân sách, thực hiện, dự báo)
   * Date: 9/4/2022
   */
  updateValue: {
    auth: 'required',
    params: {
      option: { type: 'number' },
      groupID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { option, groupID } = ctx.params

        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await BUDGET__GROUP_MODEL.updateValue({
          option,
          groupID,
          userID,
          ctx,
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
