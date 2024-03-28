/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const CMCS__CONTRACT_IPC_MODEL =
  require('../model/cmcs.contract_ipc-model').MODEL

module.exports = {
  /**
   * Dev: HiepNH
   * Func: Thêm contract ipc
   */
  insert: {
    auth: 'required',
    params: {
      type: { type: 'number' },
      contractID: { type: 'string' },
      name: { type: 'string' },
      sign: { type: 'string' },
      description: { type: 'string', optional: true },
      date: { type: 'string' },
      note: { type: 'string', optional: true },
      acceptance: { type: 'number', optional: true },
      vatAcceptance: { type: 'number', optional: true },
      plusAcceptance: { type: 'number', optional: true },
      vatPlusAcceptance: { type: 'number', optional: true },
      retainedValue: { type: 'number', optional: true },
      advancePaymentDeduction: { type: 'number', optional: true },
      otherDeduction: { type: 'number', optional: true },
      timeForPayment: { type: 'string', optional: true },
      amountPaid: { type: 'number', optional: true },
      remainingPayment: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          type,
          projectID,
          contractID,
          name,
          sign,
          description,
          date,
          note,
          acceptance,
          vatAcceptance,
          plusAcceptance,
          vatPlusAcceptance,
          retainedValue,
          advancePaymentDeduction,
          otherDeduction,
          recommendedPayment,
          timeForPayment,
          amountPaid,
          remainingPayment,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser
        let resultAfterCallHandler = await CMCS__CONTRACT_IPC_MODEL.insert({
          type,
          projectID,
          contractID,
          name,
          sign,
          description,
          date,
          note,
          acceptance,
          vatAcceptance,
          plusAcceptance,
          vatPlusAcceptance,
          retainedValue,
          advancePaymentDeduction,
          otherDeduction,
          recommendedPayment,
          timeForPayment,
          amountPaid,
          remainingPayment,
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
   * Dev: HiepNH
   * Func: Sửa contract ipc
   */
  update: {
    auth: 'required',
    params: {
      contractIpcID: { type: 'string' },
      plan: { type: 'number', optional: true },
      type: { type: 'number', optional: true },
      name: { type: 'string', optional: true },
      sign: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      date: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      acceptance: { type: 'number', optional: true },
      vatAcceptance: { type: 'number', optional: true },
      plusAcceptance: { type: 'number', optional: true },
      vatPlusAcceptance: { type: 'number', optional: true },
      retainedValue: { type: 'number', optional: true },
      advancePaymentDeduction: { type: 'number', optional: true },
      otherDeduction: { type: 'number', optional: true },
      timeForPayment: { type: 'string', optional: true },
      amountPaid: { type: 'number', optional: true },
      remainingPayment: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          contractIpcID,
          plan,
          type,
          name,
          sign,
          description,
          date,
          note,
          acceptance,
          vatAcceptance,
          plusAcceptance,
          vatPlusAcceptance,
          retainedValue,
          advancePaymentDeduction,
          otherDeduction,
          recommendedPayment,
          timeForPayment,
          amountPaid,
          remainingPayment,
        } = ctx.params

        // console.log({ contractIpcID, plan, type, name, sign, description, date, note, acceptance, vatAcceptance, plusAcceptance, vatPlusAcceptance, retainedValue, advancePaymentDeduction, otherDeduction, recommendedPayment, timeForPayment, amountPaid, remainingPayment })

        const { _id: userID } = ctx.meta.infoUser
        let resultAfterCallHandler = await CMCS__CONTRACT_IPC_MODEL.update({
          contractIpcID,
          plan,
          type,
          name,
          sign,
          description,
          date,
          note,
          acceptance,
          vatAcceptance,
          plusAcceptance,
          vatPlusAcceptance,
          retainedValue,
          advancePaymentDeduction,
          otherDeduction,
          recommendedPayment,
          timeForPayment,
          amountPaid,
          remainingPayment,
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
   * Name  : Cập nhật giá trị
   * Author: Hiepnh
   * Date  : 12/4/2022
   */
  updateValue: {
    auth: 'required',
    params: {
      option: { type: 'number' },
      ipcID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { option, ipcID } = ctx.params

        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await CMCS__CONTRACT_IPC_MODEL.updateValue(
          {
            option,
            ipcID,
            userID,
            ctx,
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
   * Dev: HiepNH
   * Func: Xóa contract ipc
   */
  remove: {
    auth: 'required',
    params: {
      contractIpcID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { contractIpcID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser
        let resultAfterCallHandler = await CMCS__CONTRACT_IPC_MODEL.remove({
          contractIpcID,
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
   * Func: get info and get list contract ipc
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      contractIpcID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      type: { type: 'string', optional: true },
      outin: { type: 'string', optional: true },
      real: { type: 'string', optional: true },
      field: { type: 'string', optional: true },
      dependentUnit: { type: 'string', optional: true },
      chair: { type: 'string', optional: true },
      personInCharge: { type: 'string', optional: true },
      buyerInfo: { type: 'string', optional: true },
      sellerInfo: { type: 'string', optional: true },
      isMember: { type: 'string', optional: true },
      option: { type: 'string', optional: true },

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
          contractIpcID,
          isMember,
          option,
          companyID,
          projectID,
          contractID,
          type,
          outin,
          real,
          field,
          dependentUnit,
          personInCharge,
          chair,
          buyerInfo,
          sellerInfo,
          keyword,
          limit,
          lastestID,
          populates,
          select,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (contractIpcID) {
          resultAfterCallHandler = await CMCS__CONTRACT_IPC_MODEL.getInfo({
            contractIpcID,
            userID,
            select,
            populates,
          })
        } else {
          if (!companyID) {
            companyID = company._id
          }

          resultAfterCallHandler = await CMCS__CONTRACT_IPC_MODEL.getList({
            isMember,
            option,
            companyID,
            projectID,
            contractID,
            type: Number(type),
            outin: Number(outin),
            real: Number(real),
            field,
            dependentUnit,
            personInCharge,
            chair,
            buyerInfo,
            sellerInfo,
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
   * Func: get amount by month
   */
  getAmountByMonth: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      year: { type: 'string', optional: true },
      outin: { type: 'string', optional: true },
      option: { type: 'string', optional: true },
      plan: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { companyID, projectID, contractID, year, outin, option, plan } =
          ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }
        console.log({ companyID })

        let resultAfterCallHandler =
          await CMCS__CONTRACT_IPC_MODEL.getAmountByMonth({
            userID,
            companyID,
            projectID,
            contractID,
            year,
            outin,
            option,
            plan,
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
   * Name: Danh sách theo tháng trong năm
   * Author: Hiepnh
   * Date: 18/04/2022
   */
  getListByMonth: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      type: { type: 'string', optional: true },
      outin: { type: 'string', optional: true },
      real: { type: 'string', optional: true },
      field: { type: 'string', optional: true },
      dependentUnit: { type: 'string', optional: true },
      chair: { type: 'string', optional: true },
      personInCharge: { type: 'string', optional: true },
      buyerInfo: { type: 'string', optional: true },
      sellerInfo: { type: 'string', optional: true },
      month: { type: 'string', optional: true },
      year: { type: 'string', optional: true },
      plan: { type: 'string', optional: true },

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
          projectID,
          contractID,
          month,
          year,
          type,
          outin,
          real,
          field,
          dependentUnit,
          personInCharge,
          chair,
          buyerInfo,
          sellerInfo,
          plan,
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

        let resultAfterCallHandler =
          await CMCS__CONTRACT_IPC_MODEL.getListByMonth({
            userID,
            companyID,
            projectID,
            contractID,
            month,
            year,
            type,
            outin,
            real,
            field,
            dependentUnit,
            personInCharge,
            chair,
            buyerInfo,
            sellerInfo,
            plan,
            keyword,
            limit,
            lastestID,
            select,
            populates,
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
   * Name: Danh sách theo tháng trong năm
   * Author: Hiepnh
   * Date: 05/04/2022
   */
  getAmountByObject: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      outin: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)

        let { companyID, projectID, contractID, outin } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        console.log('Handler IPC getAmountByObject')

        if (!companyID) {
          companyID = company._id
        }
        console.log({ companyID })

        let resultAfterCallHandler =
          await CMCS__CONTRACT_IPC_MODEL.getAmountByObject({
            userID,
            outin: Number(outin),
            companyID,
            projectID,
            contractID,
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
   * Name: Danh sách theo tháng trong năm
   * Author: Hiepnh
   * Date: 05/04/2022
   */
  getAmountByProperty: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      outin: { type: 'string', optional: true },
      optionTime: { type: 'string', optional: true },
      option: { type: 'string', optional: true },
      year: { type: 'string', optional: true },
      debt: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)

        let {
          companyID,
          projectID,
          contractID,
          outin,
          optionTime,
          option,
          year,
          debt,
        } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        if (!companyID) {
          companyID = company._id
        }
        console.log({ companyID })

        let resultAfterCallHandler =
          await CMCS__CONTRACT_IPC_MODEL.getAmountByProperty({
            userID,
            outin: Number(outin),
            year: Number(year),
            debt: Number(debt),
            companyID,
            projectID,
            contractID,
            optionTime: Number(optionTime),
            option: Number(option),
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
   * Dev: HiepNH
   * Func: Download Excel
   * Date: 15/09/2022
   */
  downloadExcelIpc: {
    auth: 'required',
    params: {
      option: { type: 'string', optional: true },
      ipcID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      conditionDownload: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { option, ipcID, contractID, conditionDownload } = ctx.params
        const { _id: userID } = ctx.meta.infoUser
        const resultAfterCallHandler =
          await CMCS__CONTRACT_IPC_MODEL.downloadExcelIpcDetail({
            option,
            ipcID,
            contractID,
            conditionDownload,
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
