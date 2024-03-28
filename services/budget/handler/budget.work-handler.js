/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BUDGET__WORK_MODEL = require('../model/budget.work-model').MODEL

module.exports = {
  /**
   * Dev: Hiepnh
   * Func: Thêm
   * Date: 9/4/2022
   */
  insert: {
    auth: 'required',
    params: {
      groupID: { type: 'string' },
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
      vatUnitPrice: { type: 'number', optional: true },
      amount: { type: 'number', optional: true },
      vatAmount: { type: 'number', optional: true },
      forecastQuantity: { type: 'number', optional: true },
      forecastUnitPrice: { type: 'number', optional: true },
      forecastAmount: { type: 'number', optional: true },
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
          description,
          note,
          type,
          quantity,
          unitPrice,
          vatUnitPrice,
          amount,
          forecastQuantity,
          forecastUnitPrice,
          forecastAmount,
        } = ctx.params

        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await BUDGET__WORK_MODEL.insert({
          ctx,
          userID,
          groupID,
          plus,
          reasonID,
          name,
          sign,
          unit,
          description,
          note,
          type,
          quantity,
          unitPrice,
          vatUnitPrice,
          amount,
          forecastQuantity,
          forecastUnitPrice,
          forecastAmount,
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
      workID: { type: 'string' },
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
      vatUnitPrice: { type: 'number', optional: true },
      amount: { type: 'number', optional: true },
      vatAmount: { type: 'number', optional: true },
      forecastQuantity: { type: 'number', optional: true },
      forecastUnitPrice: { type: 'number', optional: true },
      forecastVatUnitPrice: { type: 'number', optional: true },
      forecastAmount: { type: 'number', optional: true },
      forecastVatAmount: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          workID,
          plus,
          reasonID,
          name,
          sign,
          unit,
          description,
          note,
          type,
          quantity,
          unitPrice,
          vatUnitPrice,
          amount,
          vatAmount,
          forecastQuantity,
          forecastUnitPrice,
          forecastVatUnitPrice,
          forecastAmount,
          forecastVatAmount,
        } = ctx.params

        const { _id: userID } = ctx.meta.infoUser
        let resultAfterCallHandler = await BUDGET__WORK_MODEL.update({
          workID,
          plus,
          reasonID,
          name,
          sign,
          unit,
          description,
          note,
          type,
          quantity,
          unitPrice,
          vatUnitPrice,
          amount,
          vatAmount,
          forecastQuantity,
          forecastUnitPrice,
          forecastVatUnitPrice,
          forecastAmount,
          forecastVatAmount,
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
      workID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { workID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser
        let resultAfterCallHandler = await BUDGET__WORK_MODEL.remove({
          workID,
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
   * Func: get info and get list
   * Date: 9/4/2022
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      workID: { type: 'string', optional: true },
      groupID: { type: 'string', optional: true },
      itemID: { type: 'string', optional: true },
      budgetID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },

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
          companyID,
          workID,
          groupID,
          itemID,
          budgetID,
          keyword,
          limit,
          lastestID,
          populates,
          select,
        } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        let resultAfterCallHandler
        if (workID) {
          resultAfterCallHandler = await BUDGET__WORK_MODEL.getInfo({
            workID,
            userID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await BUDGET__WORK_MODEL.getList({
            companyID,
            budgetID,
            itemID,
            groupID,
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
      workID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { option, workID } = ctx.params

        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await BUDGET__WORK_MODEL.updateValue({
          option,
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
   * Name: downloadTemplateExcel
   * Dev: HiepNH
   * Date: 4/8/2023
   */
  downloadTemplateExcel: {
    auth: 'required',
    params: {
      option: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        let { budgetID } = ctx.params
        // console.log(ctx.params)

        const resultAfterCallHandler =
          await BUDGET__WORK_MODEL.downloadTemplateExcel({
            companyID: company._id,
            budgetID,
            userID,
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

  /**
   * Name: importExcel
   * Dev: HiepNH
   * Date: 4/8/2023
   */
  importExcel: {
    auth: 'required',
    params: {
      budgetID: { type: 'string', optional: true },
      dataImport: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { budgetID, dataImport } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        const resultAfterCallHandler = await BUDGET__WORK_MODEL.importExcel({
          budgetID,
          dataImport,
          userID,
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

  /**
   * Name: exportExcel
   * Dev: HiepNH
   * Date: 4/8/2023
   */
  exportExcel: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
      option: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, email, company } = ctx.meta.infoUser
        let { companyID, option, month, year, filterParams } = ctx.params
        // console.log({ companyID, option, filterParams })

        if (!companyID) {
          companyID = company._id
        }

        const resultAfterCallHandler = await BUDGET__WORK_MODEL.exportExcel({
          userID,
          email,
          companyID,
          option,
          month,
          year,
          filterParams,
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

  /**
   * Name: copy
   * Dev: HiepNH
   * Date: 13/1/2024
   */
  copy: {
    auth: 'required',
    params: {
      budgetID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        let { option, budgetID } = ctx.params
        // console.log({ budgetID })

        const resultAfterCallHandler = await BUDGET__WORK_MODEL.copy({
          option,
          budgetID,
          userID,
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
