/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const FNB_MISTAKE_MODEL = require('../model/fnb.mistake-model').MODEL

module.exports = {
  /**
   * Name: Insert
   * Author: HiepNH
   * Code: 24/11/2022
   */
  insert: {
    auth: 'required',
    params: {
      mistakeID: { type: 'string' },
      executorID: { type: 'string' },
      fundaID: { type: 'string' },
      companyID: { type: 'string', optional: true },
      orderID: { type: 'string', optional: true },
      type: { type: 'string', optional: true },
      amount: { type: 'string', optional: true },
      bonus: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          mistakeID,
          executorID,
          fundaID,
          orderID,
          type,
          amount,
          bonus,
          note,
          files,
          companyID,
          date,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        let resultAfterCallHandler = await FNB_MISTAKE_MODEL.insert({
          mistakeID,
          executorID,
          fundaID,
          orderID,
          type,
          amount,
          bonus,
          note,
          files,
          userID,
          companyID,
          date,
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
   * Func: update Group
   */
  update: {
    auth: 'required',
    params: {
      orderMistakeID: { type: 'string', optional: true },
      mistakeID: { type: 'string' },
      executorID: { type: 'string' },
      fundaID: { type: 'string' },
      orderID: { type: 'string', optional: true },
      type: { type: 'number', optional: true },
      amount: { type: 'number', optional: true },
      bonus: { type: 'number', optional: true },
      note: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          orderMistakeID,
          mistakeID,
          executorID,
          fundaID,
          orderID,
          type,
          amount,
          bonus,
          note,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await FNB_MISTAKE_MODEL.update({
          orderMistakeID,
          userID,
          executorID,
          fundaID,
          orderID,
          type,
          amount,
          bonus,
          note,
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

  updateKpi: {
    auth: 'required',
    params: {
      // orderMistakeID      : { type: "string", optional: true },
      // mistakeID           : { type: "string" },
      // executorID          : { type: "string" },
      // fundaID             : { type: "string" },
      // orderID             : { type: "string", optional: true },
      // type                : { type: "number", optional: true },
      // amount              : { type: "number", optional: true },
      // bonus               : { type: "number", optional: true },
      // note                : { type: "string", optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { month, year, executorID, workingHours, quantity, score } =
          ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler = await FNB_MISTAKE_MODEL.updateKpi({
          userID,
          companyID: company._id,
          month,
          year,
          executorID,
          workingHours,
          quantity,
          score,
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
   * Func: remove Group
   */
  remove: {
    auth: 'required',
    params: {
      orderMistakeID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { orderMistakeID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await FNB_MISTAKE_MODEL.remove({
          orderMistakeID,
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
   * Func: getList and getInfo pcm_plan_report
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
      fundasID: { type: 'array', optional: true },
      executorID: { type: 'string', optional: true },
      orderID: { type: 'string', optional: true },
      mistakeID: { type: 'string', optional: true },
      orderMistakeID: { type: 'string', optional: true },
      fromDate: { type: 'string', optional: true },
      toDate: { type: 'string', optional: true },
      salesChannel: { type: 'string', optional: true },

      //==============================================
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
          orderMistakeID,
          fundasID,
          executorID,
          orderID,
          mistakeID,
          fromDate,
          toDate,
          salesChannel,
          keyword,
          limit,
          lastestID,
          select,
          populates,
          sortKey,
          month,
          year,
          option,
        } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }

        let resultAfterCallHandler
        if (orderMistakeID) {
          resultAfterCallHandler = await FNB_MISTAKE_MODEL.getInfo({
            orderMistakeID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await FNB_MISTAKE_MODEL.getList({
            companyID,
            fundasID,
            executorID,
            orderID,
            mistakeID,
            fromDate,
            toDate,
            salesChannel,
            keyword,
            limit,
            lastestID,
            select,
            populates,
            sortKey,
            userID,
            month,
            year,
            option,
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
   * Name: Danh sách theo phân loại
   * Author: HiepNH
   * Code: 14/10/2022
   */
  getListByProperty: {
    params: {
      fundasID: { type: 'array', optional: true },
      option: { type: 'string', optional: true },
      mistakeID: { type: 'string', optional: true },
      executorID: { type: 'string', optional: true },
      optionGroup: { type: 'string', optional: true },
      optionTime: { type: 'string', optional: true },
      year: { type: 'string', optional: true },
      month: { type: 'string', optional: true },
      fromDate: { type: 'string', optional: true },
      toDate: { type: 'string', optional: true },

      //_____________THÔNG SỐ MẶC ĐỊNH________________
      keyword: { type: 'string', optional: true },
      limit: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser

        let {
          option,
          optionGroup,
          optionTime,
          fundasID,
          mistakeID,
          executorID,
          year,
          month,
          fromDate,
          toDate,
          keyword,
          limit,
          lastestID,
          select,
          populates,
          sortKey,
        } = ctx.params

        let resultAfterCallHandler = await FNB_MISTAKE_MODEL.getListByProperty({
          companyID: company._id,
          option,
          optionGroup,
          optionTime,
          fundasID,
          mistakeID,
          executorID,
          year,
          month,
          fromDate,
          toDate,
          keyword,
          limit,
          lastestID,
          select,
          populates,
          sortKey,
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
   * Func: Download Template Excel
   * Date: 8/12/2022
   */
  downloadTemplateExcel: {
    auth: 'required',
    params: {},
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser

        // console.log('====================HERE===================')
        // console.log('====================HERE===================')
        // console.log('====================HERE===================')
        const resultAfterCallHandler =
          await FNB_MISTAKE_MODEL.downloadTemplateExcel({
            companyID: company._id,
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
   * Dev: HiepNH
   * Func: Download Template Excel
   * Date: 21/3/2024
   */
  importFromExcel: {
    auth: 'required',
    params: {
      dataImport: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { option, dataImport } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        // console.log( ctx.params)

        const resultAfterCallHandler = await FNB_MISTAKE_MODEL.importFromExcel({
          option,
          companyID: company._id,
          dataImport,
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
   * Dev: HiepNH
   * Func: Download Template Excel
   * Date: 9/12/2022
   */
  exportExcel: {
    auth: 'required',
    params: {
      year: { type: 'string', optional: true },
      month: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        let { companyID, fundaID, fromDate, toDate, month, year } = ctx.params

        // console.log({ companyID, fundaID, fromDate, toDate, month, year  })

        if (!companyID) {
          companyID = company._id
        }

        // console.log('====================HERE===================')
        // console.log('====================HERE===================')
        // console.log('====================HERE===================')
        const resultAfterCallHandler = await FNB_MISTAKE_MODEL.exportExcel({
          userID,
          companyID,
          fundaID,
          fromDate,
          toDate,
          month,
          year,
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
