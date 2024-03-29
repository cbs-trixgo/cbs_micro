/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const FIN__CASH_FLOW_PLAN_MODEL =
  require('../model/fin.cash_flow_plan-model').MODEL

module.exports = {
  /**
   * Name: Insert
   * Author: Hiepnh
   * Date: 9/4/2022
   */
  insert: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
      fundaID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      type: { type: 'number', optional: true },
      property: { type: 'number', optional: true },
      outin: { type: 'number', optional: true },
      name: { type: 'string' },
      sign: { type: 'string', optional: true },
      openingBalance: { type: 'number', optional: true },
      arising: { type: 'number', optional: true },
      closingBalance: { type: 'number', optional: true },
      note: { type: 'string', optional: true },
      date: { type: 'string' },
      value: { type: 'number', optional: true },
      realDate: { type: 'string', optional: true },
      realValue: { type: 'number', optional: true },
      priority: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          companyID,
          fundaID,
          contractID,
          projectID,
          parentID,
          priority,
          type,
          property,
          outin,
          name,
          openingBalance,
          arising,
          closingBalance,
          sign,
          note,
          date,
          value,
          realDate,
          realValue,
        } = ctx.params

        let { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        const resultAfterCallHandler = await FIN__CASH_FLOW_PLAN_MODEL.insert({
          companyID,
          fundaID,
          contractID,
          projectID,
          parentID,
          priority,
          type,
          property,
          outin,
          name,
          openingBalance,
          arising,
          closingBalance,
          sign,
          note,
          date,
          value,
          realDate,
          realValue,
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
   * Author: Hiepnh
   * Date: 9/4/2022
   */
  update: {
    auth: 'required',
    params: {
      cashFlowID: { type: 'string' },
      contractID: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      sign: { type: 'string', optional: true },
      openingBalance: { type: 'number', optional: true },
      arising: { type: 'number', optional: true },
      closingBalance: { type: 'number', optional: true },
      note: { type: 'string', optional: true },
      outin: { type: 'number', optional: true },
      property: { type: 'number', optional: true },
      status: { type: 'number', optional: true },
      type: { type: 'number', optional: true },
      date: { type: 'string', optional: true },
      value: { type: 'number', optional: true },
      realDate: { type: 'string', optional: true },
      realValue: { type: 'number', optional: true },
      priority: { type: 'number', optional: true },
      members: { type: 'array', optional: true },
      admins: { type: 'array', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const {
          cashFlowID,
          contractID,
          name,
          openingBalance,
          arising,
          closingBalance,
          sign,
          note,
          date,
          value,
          realDate,
          realValue,
          priority,
          outin,
          property,
          status,
          type,
          members,
          admins,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        const resultAfterCallHandler = await FIN__CASH_FLOW_PLAN_MODEL.update({
          cashFlowID,
          contractID,
          name,
          openingBalance,
          arising,
          closingBalance,
          sign,
          note,
          date,
          value,
          realDate,
          realValue,
          priority,
          outin,
          property,
          status,
          type,
          userID,
          members,
          admins,
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
   * Author: MinhVH
   * Date: 20/06/2022
   */
  remove: {
    auth: 'required',
    params: {
      cashFlowsID: { type: 'array' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { cashFlowsID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await FIN__CASH_FLOW_PLAN_MODEL.remove({
          cashFlowsID,
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
      cashFlowID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      outin: { type: 'string', optional: true },
      type: { type: 'string', optional: true },
      property: { type: 'string', optional: true },
      priority: { type: 'string', optional: true },
      isCompanyOther: { type: 'string', optional: true },

      // Field mặc định
      keyword: { type: 'string', optional: true },
      limit: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
      sortKey: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          cashFlowID,
          companyID,
          projectID,
          contractID,
          parentID,
          outin,
          type,
          property,
          priority,
          keyword,
          limit,
          lastestID,
          populates,
          select,
          sortKey,
          isCompanyOther,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        let resultAfterCallHandler
        if (cashFlowID) {
          resultAfterCallHandler = await FIN__CASH_FLOW_PLAN_MODEL.getInfo({
            cashFlowID,
            userID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await FIN__CASH_FLOW_PLAN_MODEL.getList({
            companyID,
            projectID,
            contractID,
            parentID,
            outin,
            type,
            property,
            priority,
            userID,
            keyword,
            limit,
            lastestID,
            select,
            populates,
            sortKey,
            isCompanyOther,
            companyOfUser: company._id,
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
   * Name: Gom nhóm theo thuộc tính
   * Author: Hiepnh
   * Date: 17/04/2022
   */
  getAmountByProperty: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      year: { type: 'string', optional: true },
      outin: { type: 'string', optional: true },
      type: { type: 'string', optional: true },
      property: { type: 'string', optional: true },
      option: { type: 'string', optional: true },
      real: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          companyID,
          parentID,
          projectID,
          contractID,
          outin,
          year,
          type,
          property,
          option,
          real,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        let resultAfterCallHandler =
          await FIN__CASH_FLOW_PLAN_MODEL.getAmountByProperty({
            userID,
            companyID,
            parentID,
            projectID,
            contractID,
            outin,
            year,
            type,
            property,
            option,
            real,
            ctx,
          })

        return renderStatusCodeAndResponse({
          resultAfterCallHandler,
          ctx,
        })
      } catch (error) {
        return renderStatusCodeAndResponse({
          error_message: error.message,
          ctx,
        })
      }
    },
  },
}
