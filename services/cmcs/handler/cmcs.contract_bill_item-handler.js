/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const CMCS__CONTRACT_BILL_ITEM_MODEL =
  require('../model/cmcs.contract_bill_item-model').MODEL

module.exports = {
  /**
   * Name: Insert
   * Author: HiepNH
   * Date: 11/9/2022
   */
  insert: {
    auth: 'required',
    params: {
      contractID: { type: 'string' },
      name: { type: 'string' },
      sign: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      unit: { type: 'string', optional: true },
      quantity: { type: 'number', optional: true },
      note: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { contractID, name, sign, description, unit, quantity, note } =
          ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler =
          await CMCS__CONTRACT_BILL_ITEM_MODEL.insert({
            contractID,
            name,
            sign,
            description,
            unit,
            quantity,
            note,
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
   * Name: Update
   * Author: HiepNH
   * Date: 11/9/2022
   */
  update: {
    auth: 'required',
    params: {
      itemID: { type: 'string' },
      name: { type: 'string' },
      sign: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      unit: { type: 'string', optional: true },
      quantity: { type: 'number', optional: true },
      note: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { itemID, name, sign, description, unit, quantity, note } =
          ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler =
          await CMCS__CONTRACT_BILL_ITEM_MODEL.update({
            itemID,
            name,
            sign,
            description,
            unit,
            quantity,
            note,
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
   * Name: Update value
   * Author: HiepNH
   * Date: 11/9/2022
   */
  updateValue: {
    auth: 'required',
    params: {
      option: { type: 'number' },
      itemID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { option, itemID } = ctx.params

        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler =
          await CMCS__CONTRACT_BILL_ITEM_MODEL.updateValue({
            option,
            itemID,
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
   * Name: Remove
   * Author: HiepNH
   * Date: 11/9/2022
   */
  remove: {
    auth: 'required',
    params: {
      itemID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { itemID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler =
          await CMCS__CONTRACT_BILL_ITEM_MODEL.remove({
            itemID,
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
   * Name: Get info and Get list
   * Author: HiepNH
   * Date: 11/9/2022
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      itemID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },

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
          itemID,
          contractID,
          keyword,
          limit,
          lastestID,
          populates,
          select,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (itemID) {
          resultAfterCallHandler = await CMCS__CONTRACT_BILL_ITEM_MODEL.getInfo(
            {
              itemID,
              userID,
              select,
              populates,
            }
          )
        } else {
          resultAfterCallHandler = await CMCS__CONTRACT_BILL_ITEM_MODEL.getList(
            {
              contractID,
              userID,
              keyword,
              limit,
              lastestID,
              select,
              populates,
            }
          )
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
