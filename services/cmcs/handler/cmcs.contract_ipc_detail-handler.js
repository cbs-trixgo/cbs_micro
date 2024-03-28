/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const CMCS__CONTRACT_IPC_DETAIL_MODEL =
  require('../model/cmcs.contract_ipc_detail-model').MODEL

module.exports = {
  /**
   * Name: Insert (OK)
   * Author: HiepNH
   * Date: 11/9/2022
   */
  insert: {
    auth: 'required',
    params: {
      ipcID: { type: 'string' },
      jobID: { type: 'string' },
      plus: { type: 'number', optional: true },
      note: { type: 'string', optional: true },
      quantity: { type: 'number', optional: true },
      unitPrice: { type: 'number', optional: true },
      amount: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { ipcID, jobID, plus, quantity, unitPrice, amount, note } =
          ctx.params
        console.log({
          ipcID,
          jobID,
          plus,
          quantity,
          unitPrice,
          amount,
          note,
        })
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler =
          await CMCS__CONTRACT_IPC_DETAIL_MODEL.insert({
            ipcID,
            jobID,
            plus,
            quantity,
            unitPrice,
            amount,
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
      detailID: { type: 'string' },
      plus: { type: 'number', optional: true },
      note: { type: 'string', optional: true },
      quantity: { type: 'number', optional: true },
      unitPrice: { type: 'number', optional: true },
      amount: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { detailID, plus, quantity, unitPrice, amount, note } = ctx.params //dataUpdates[]

        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler =
          await CMCS__CONTRACT_IPC_DETAIL_MODEL.update({
            detailID,
            plus,
            quantity,
            unitPrice,
            amount,
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
   * Name: Remove
   * Author: HiepNH
   * Date: 11/9/2022
   */
  remove: {
    auth: 'required',
    params: {
      detailID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { detailID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler =
          await CMCS__CONTRACT_IPC_DETAIL_MODEL.remove({
            detailID,
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
      option: { type: 'string', optional: true },
      detailID: { type: 'string', optional: true },
      ipcID: { type: 'string', optional: true },
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
          option,
          detailID,
          ipcID,
          contractID,
          limit,
          lastestID,
          populates,
          select,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (detailID) {
          resultAfterCallHandler =
            await CMCS__CONTRACT_IPC_DETAIL_MODEL.getInfo({
              detailID,
              userID,
              select,
              populates,
            })
        } else {
          resultAfterCallHandler =
            await CMCS__CONTRACT_IPC_DETAIL_MODEL.getList({
              option,
              ipcID,
              contractID,
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
