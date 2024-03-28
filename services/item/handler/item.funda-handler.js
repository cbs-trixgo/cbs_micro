/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__FUNDA_MODEL = require('../model/item.funda-model').MODEL

module.exports = {
  /**
   * Dev: HiepNH ✅
   * Func: Thêm funda
   */
  insert: {
    auth: 'required',
    params: {
      name: { type: 'string' },
      sign: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      phone: { type: 'string', optional: true },
      bankAccount: { type: 'string', optional: true },
      loyaltyPointsRate: { type: 'string', optional: true },
      address: { type: 'string', optional: true },
      initialDay: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      area: { type: 'string' },
      campaign: { type: 'number', optional: true },
      internal: { type: 'number', optional: true },
      materialExpenseRate: { type: 'number', optional: true },
      materialExpense: { type: 'number', optional: true },
      planExpense: { type: 'number', optional: true },
      utilityExpense: { type: 'number', optional: true },
      humanExpense: { type: 'number', optional: true },
      otherExpense: { type: 'number', optional: true },
      platform: { type: 'number', optional: true },
      activeCampaign: { type: 'array', optional: true },
      trainStaffSalar: { type: 'string', optional: true },
      trialStaffSalary: { type: 'string', optional: true },
      officialStaffSalar: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        const {
          platform,
          name,
          sign,
          description,
          phone,
          bankAccount,
          address,
          initialDay,
          campaign,
          internal,
          area,
          parentID,
          materialExpenseRate,
          materialExpense,
          planExpense,
          utilityExpense,
          humanExpense,
          otherExpense,
          activeCampaign,
          loyaltyPointsRate,
          trainStaffSalar,
          trialStaffSalary,
          officialStaffSalar,
        } = ctx.params

        const resultAfterCallHandler = await ITEM__FUNDA_MODEL.insert({
          companyID: company._id,
          parentID,
          platform,
          name,
          sign,
          description,
          phone,
          bankAccount,
          address,
          initialDay,
          campaign,
          internal,
          area,
          materialExpenseRate,
          materialExpense,
          planExpense,
          utilityExpense,
          humanExpense,
          otherExpense,
          userID,
          activeCampaign,
          loyaltyPointsRate,
          trainStaffSalar,
          trialStaffSalary,
          officialStaffSalar,
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
   * Func: Cập nhật funda
   */
  update: {
    auth: 'required',
    params: {
      fundaID: { type: 'string' },
      projectID: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      sign: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      address: { type: 'string', optional: true },
      phone: { type: 'string', optional: true },
      bankAccount: { type: 'string', optional: true },
      bankQrcode: { type: 'array', optional: true },
      loyaltyPointsRate: { type: 'string', optional: true },
      initialDay: { type: 'string', optional: true },
      area: { type: 'string', optional: true },
      manager: { type: 'string', optional: true },
      members: { type: 'array', optional: true },
      membersRemove: { type: 'array', optional: true },
      admins: { type: 'array', optional: true },
      adminsRemove: { type: 'array', optional: true },
      getNotification: { type: 'array', optional: true },
      getNotificationRemove: { type: 'array', optional: true },
      imagesID: { type: 'array', optional: true },
      campaign: { type: 'number', optional: true },
      internal: { type: 'number', optional: true },
      materialExpenseRate: { type: 'number', optional: true },
      materialExpense: { type: 'number', optional: true },
      planExpense: { type: 'number', optional: true },
      utilityExpense: { type: 'number', optional: true },
      humanExpense: { type: 'number', optional: true },
      otherExpense: { type: 'number', optional: true },
      activeCampaign: { type: 'array', optional: true },
      trainStaffSalar: { type: 'string', optional: true },
      trialStaffSalary: { type: 'string', optional: true },
      officialStaffSalar: { type: 'string', optional: true },
      lunchStaffAllowance: { type: 'number', optional: true },
      platform: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        const {
          fundaID,
          projectID,
          platform,
          name,
          sign,
          description,
          phone,
          bankAccount,
          bankQrcode,
          address,
          initialDay,
          members,
          admins,
          membersRemove,
          adminsRemove,
          getNotification,
          getNotificationRemove,
          campaign,
          internal,
          area,
          materialExpenseRate,
          materialExpense,
          planExpense,
          utilityExpense,
          humanExpense,
          otherExpense,
          activeCampaign,
          loyaltyPointsRate,
          imagesID,
          manager,
          trainStaffSalar,
          trialStaffSalary,
          officialStaffSalar,
          lunchStaffAllowance,
        } = ctx.params

        // console.log({ fundaID, platform, name, sign, description, phone, bankAccount, bankQrcode, address, initialDay, members, admins, membersRemove, adminsRemove, getNotification, getNotificationRemove, campaign, internal, area, materialExpenseRate, materialExpense, planExpense, utilityExpense, humanExpense, otherExpense, activeCampaign, loyaltyPointsRate, imagesID, trainStaffSalar, trialStaffSalary, officialStaffSalar })

        const resultAfterCallHandler = await ITEM__FUNDA_MODEL.update({
          fundaID,
          projectID,
          platform,
          name,
          sign,
          description,
          phone,
          bankAccount,
          bankQrcode,
          address,
          initialDay,
          members,
          admins,
          membersRemove,
          adminsRemove,
          getNotification,
          getNotificationRemove,
          campaign,
          internal,
          area,
          materialExpenseRate,
          materialExpense,
          planExpense,
          utilityExpense,
          humanExpense,
          otherExpense,
          userID,
          activeCampaign,
          loyaltyPointsRate,
          imagesID,
          manager,
          trainStaffSalar,
          trialStaffSalary,
          officialStaffSalar,
          lunchStaffAllowance,
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
   * Func: Danh sách funda
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      fundaID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      isListParentOfListChilds: { type: 'string', optional: true },
      isMember: { type: 'string', optional: true },
      platform: { type: 'string', optional: true },

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
          fundaID,
          companyID,
          keyword,
          limit,
          lastestID,
          select,
          populates,
          parentID,
          platform,
          isListParentOfListChilds,
          isMember,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        let resultAfterCallHandler
        if (fundaID) {
          resultAfterCallHandler = await ITEM__FUNDA_MODEL.getInfo({
            fundaID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await ITEM__FUNDA_MODEL.getList({
            companyID,
            lastestID,
            keyword,
            select,
            limit,
            populates,
            parentID,
            platform,
            isListParentOfListChilds,
            isMember,
            userID,
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
