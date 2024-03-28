/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BIDDING__BILL_PRODUCT_MODEL =
  require('../model/bidding.bill_product-model').MODEL

module.exports = {
  /**
   * Name: Insert
   * Author: Hiepnh
   * Date: 9/4/2022
   */
  insert: {
    auth: 'required',
    params: {
      docID: { type: 'string' },
      productID: { type: 'string' },
      type: { type: 'number' },
      unitprice: { type: 'number' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { docID, productID, type, unitprice } = ctx.params

        let { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        const resultAfterCallHandler = await BIDDING__BILL_PRODUCT_MODEL.insert(
          {
            userID,
            ctx,
            docID,
            productID,
            type,
            unitprice,
          }
        )

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
   * Date: 9/4/2022
   */
  update: {
    auth: 'required',
    params: {
      docProductID: { type: 'string' },
      note: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { docProductID, note } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        const resultAfterCallHandler = await BIDDING__BILL_PRODUCT_MODEL.update(
          {
            userID,
            ctx,
            docProductID,
            note,
          }
        )

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
   * Date: 9/4/2022
   */
  remove: {
    auth: 'required',
    params: {
      docProductID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { docProductID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await BIDDING__BILL_PRODUCT_MODEL.remove({
          docProductID,
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
   * Date: 9/4/2022
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      docProductID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      docID: { type: 'string', optional: true },

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
          docProductID,
          projectID,
          docID,
          keyword,
          limit,
          lastestID,
          populates,
          select,
          sortKey,
        } = ctx.params
        console.log({ docProductID, projectID, docID, keyword })

        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (docProductID) {
          resultAfterCallHandler = await BIDDING__BILL_PRODUCT_MODEL.getInfo({
            docProductID,
            userID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await BIDDING__BILL_PRODUCT_MODEL.getList({
            projectID,
            docID,
            userID,
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
}
