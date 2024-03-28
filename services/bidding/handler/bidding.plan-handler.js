/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BIDDING__PLAN_MODEL = require('../model/bidding.plan-model').MODEL
const DOCUMENT_PACKAGE_MODEL =
  require('../../document/model/document.package-model').MODEL

module.exports = {
  /**
   * Name: Insert
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  insert: {
    auth: 'required',
    params: {
      fieldID: { type: 'string', optional: true },
      projectID: { type: 'string' },
      parentID: { type: 'string', optional: true },
      bidderID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      name: { type: 'string' },
      sign: { type: 'string', optional: true },
      packagePrice: { type: 'number', optional: true },
      startTime: { type: 'string', optional: true },
      finishTime: { type: 'string', optional: true },
      from: { type: 'number', optional: true },
      contractType: { type: 'number', optional: true },
      duration: { type: 'number', optional: true },
      bidder: { type: 'string', optional: true },
      bidder: { type: 'string', optional: true },
      status: { type: 'number', optional: true },
      percentOfCompletedPackage: { type: 'number', optional: true },
      note: { type: 'string', optional: true },
    },

    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const {
          parentID,
          fieldID,
          projectID,
          bidderID,
          contractID,
          type,
          name,
          sign,
          description,
          note,
          status,
          percentOfCompletedPackage,
          startTime,
          finishTime,
          actualStartTime,
          closingTime,
          actualFinishTime,
          form,
          contractType,
          duration,
          progress,
          packagePrice,
          tenderPrice,
          vatTenderPrice,
        } = ctx.params

        const { _id: userID } = ctx.meta.infoUser

        const resultAfterCallHandler = await BIDDING__PLAN_MODEL.insert({
          userID,
          parentID,
          fieldID,
          projectID,
          bidderID,
          contractID,
          type,
          name,
          sign,
          description,
          note,
          status,
          percentOfCompletedPackage,
          startTime,
          finishTime,
          actualStartTime,
          closingTime,
          actualFinishTime,
          form,
          contractType,
          duration,
          progress,
          packagePrice,
          tenderPrice,
          vatTenderPrice,
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
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  update: {
    auth: 'required',
    params: {
      planID: { type: 'string' },
      name: { type: 'string' },
      sign: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const {
          planID,
          fieldID,
          bidderID,
          contractID,
          type,
          name,
          sign,
          description,
          note,
          status,
          percentOfCompletedPackage,
          startTime,
          finishTime,
          actualStartTime,
          closingTime,
          actualFinishTime,
          form,
          contractType,
          duration,
          progress,
          packagePrice,
          tenderPrice,
          vatTenderPrice,
        } = ctx.params

        const { _id: userID } = ctx.meta.infoUser

        const resultAfterCallHandler = await BIDDING__PLAN_MODEL.update({
          planID,
          userID,
          ctx,
          fieldID,
          bidderID,
          contractID,
          type,
          name,
          sign,
          description,
          note,
          status,
          percentOfCompletedPackage,
          startTime,
          finishTime,
          actualStartTime,
          closingTime,
          actualFinishTime,
          form,
          contractType,
          duration,
          progress,
          packagePrice,
          tenderPrice,
          vatTenderPrice,
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
   * Date: 30/4/2022
   */
  remove: {
    auth: 'required',
    params: {
      planID: { type: 'array' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { planID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        const resultAfterCallHandler = await BIDDING__PLAN_MODEL.remove({
          planID,
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
   * Name: Get info and Get list
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      planID: { type: 'string', optional: true },
      // parentID: { type: "string", optional: true },
      // accountID: { type: "string", optional: true },
      // customerID: { type: "string", optional: true },
      // contractID: { type: "string", optional: true },
      // sortKey: { type: "string", optional: true },
      // outin: { type: "string", optional: true },

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
          planID,
          companyID,
          projectID,
          parentID,
          bidderID,
          contractID,
          type,
          status,
          actualStartTime,
          actualFinishTime,
          closingTime,
          form,
          contractType,
          keyword,
          limit,
          lastestID,
          populates,
          select,
          sortKey,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        let resultAfterCallHandler
        if (planID) {
          resultAfterCallHandler = await BIDDING__PLAN_MODEL.getInfo({
            planID,
            userID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await BIDDING__PLAN_MODEL.getList({
            clientID: companyID,
            projectID,
            parentID,
            bidderID,
            contractID,
            type,
            status,
            actualStartTime,
            actualFinishTime,
            closingTime,
            form,
            contractType,
            keyword,
            limit,
            lastestID,
            populates,
            select,
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
   * Name: Báo cáo lựa chọn nhà thầu
   * Author: Depv
   * Date: 30/4/2022
   */
  contractorSelection: {
    auth: 'required',
    params: {
      projectID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { projectID } = ctx.params

        let resultAfterCallHandler =
          await DOCUMENT_PACKAGE_MODEL.contractorSelection({
            projectID,
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
