/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BIDDING__BILL_WORK_MODEL =
  require('../model/bidding.bill_work-model').MODEL

module.exports = {
  /**
   * Name: Insert
   * Author: Hiepnh
   * Date: 02/5/2022
   */
  insert: {
    auth: 'required',
    params: {
      groupID: { type: 'string' },
      datahubJobID: { type: 'string', optional: true },
      name: { type: 'string' },
      sign: { type: 'string', optional: true },
      unit: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      plus: { type: 'number', optional: true },
      quantity: { type: 'number', optional: true },
      quantity2: { type: 'number', optional: true },
      unitprice1: { type: 'number', optional: true },
      unitprice2: { type: 'number', optional: true },
      unitprice3: { type: 'number', optional: true },
      unitprice: { type: 'number', optional: true },
      amount: { type: 'number' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          groupID,
          datahubJobID,
          name,
          sign,
          unit,
          description,
          note,
          plus,
          quantity,
          quantity2,
          unitprice1,
          unitprice2,
          unitprice3,
          unitprice,
          amount,
        } = ctx.params

        let { _id: userID, company } = ctx.meta.infoUser

        const resultAfterCallHandler = await BIDDING__BILL_WORK_MODEL.insert({
          userID,
          ctx,
          groupID,
          datahubJobID,
          name,
          sign,
          unit,
          description,
          note,
          plus,
          quantity,
          quantity2,
          unitprice1,
          unitprice2,
          unitprice3,
          unitprice,
          amount,
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
   * Author: Hiepnh
   * Date: 02/5/2022
   */
  update: {
    auth: 'required',
    params: {
      workID: { type: 'string' },
      datahubJobID: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      sign: { type: 'string', optional: true },
      unit: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      plus: { type: 'number', optional: true },
      quantity: { type: 'number', optional: true },
      quantity2: { type: 'number', optional: true },
      unitprice1: { type: 'number', optional: true },
      unitprice2: { type: 'number', optional: true },
      unitprice3: { type: 'number', optional: true },
      unitprice: { type: 'number', optional: true },
      amount: { type: 'number' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const {
          workID,
          datahubJobID,
          name,
          sign,
          unit,
          description,
          note,
          plus,
          quantity,
          quantity2,
          unitprice1,
          unitprice2,
          unitprice3,
          unitprice,
          amount,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        const resultAfterCallHandler = await BIDDING__BILL_WORK_MODEL.update({
          userID,
          ctx,
          workID,
          datahubJobID,
          name,
          sign,
          unit,
          description,
          note,
          plus,
          quantity,
          quantity2,
          unitprice1,
          unitprice2,
          unitprice3,
          unitprice,
          amount,
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
   * Author: Hiepnh
   * Date: 02/5/2022
   */
  remove: {
    auth: 'required',
    params: {
      workID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { workID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await BIDDING__BILL_WORK_MODEL.remove({
          workID,
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
   * Name: Get info and get list
   * Author: Hiepnh
   * Date: 02/5/2022
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      workID: { type: 'string', optional: true },
      groupID: { type: 'string', optional: true },

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
          workID,
          groupID,
          keyword,
          limit,
          lastestID,
          populates,
          select,
          sortKey,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (workID) {
          resultAfterCallHandler = await BIDDING__BILL_WORK_MODEL.getInfo({
            workID,
            userID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await BIDDING__BILL_WORK_MODEL.getList({
            groupID,
            keyword,
            limit,
            lastestID,
            select,
            populates,
            sortKey,
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
   * Name  : Gán mã định mức cho công tác
   * Author: Hiepnh
   * Date: 02/5/2022
   */
  assignJobInTemplate: {
    auth: 'required',
    params: {
      workID: { type: 'string' },
      datahubJobID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { datahubJobID, workID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        console.log({ datahubJobID, workID })

        const resultAfterCallHandler =
          await BIDDING__BILL_WORK_MODEL.assignJobInTemplate({
            datahubJobID,
            workID,
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
   * Name  : Cập nhật giá vật tư trong gói thầu
   * Author: Hiepnh
   * Date: 02/5/2022
   */
  updateProductPrice: {
    auth: 'required',
    params: {
      docID: { type: 'string' },
      productID: { type: 'string' },
      unitprice: { type: 'number' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { docID, productID, unitprice } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        console.log({ docID, productID, unitprice })

        const resultAfterCallHandler =
          await BIDDING__BILL_WORK_MODEL.updateProductPrice({
            userID,
            ctx,
            docID,
            productID,
            unitprice,
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
