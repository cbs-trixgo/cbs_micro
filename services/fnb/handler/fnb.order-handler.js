/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const FNB_ORDER_MODEL = require('../model/fnb.order-model').MODEL

module.exports = {
  /**
   * Name: Insert
   * Author: HiepNH
   * Code: 24/11/2022
   */
  insert: {
    auth: 'required',
    params: {
      voucherID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      fundaID: { type: 'string' },
      customerID: { type: 'string' },
      businessID: { type: 'string', optional: true },
      channelID: { type: 'string', optional: true },
      affiliateID: { type: 'string', optional: true },
      date: { type: 'string', optional: true },
      shiftID: { type: 'string' },
      assigneeID: { type: 'string', optional: true },
      name: { type: 'string' },
      appOrderSign: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      salesChannel: { type: 'string', optional: true },
      paymentMethod: { type: 'string', optional: true },
      sources: { type: 'string', optional: true },
      service: { type: 'string', optional: true },
      total: { type: 'string', optional: true },
      discount: { type: 'string', optional: true },
      salesoff: { type: 'string', optional: true },
      credit: { type: 'string', optional: true },
      offer: { type: 'string', optional: true },
      vatAmount: { type: 'string', optional: true },
      products: { type: 'array', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          type,
          voucherID,
          fundaID,
          parentID,
          customerID,
          businessID,
          channelID,
          affiliateID,
          shiftID,
          assigneeID,
          date,
          name,
          appOrderSign,
          note,
          service,
          salesChannel,
          paymentMethod,
          sources,
          total,
          discount,
          salesoff,
          credit,
          offer,
          vatAmount,
          products,
          shippingFee,
          paid,
        } = ctx.params

        // console.log({ FNB_ORDER_INSERT_PARAMS: ctx.params });

        const { _id: userID } = ctx.meta.infoUser

        if (!type) {
          // console.log('000000000000000000000000')
          let resultAfterCallHandler = await FNB_ORDER_MODEL.insert({
            voucherID,
            fundaID,
            parentID,
            customerID,
            affiliateID,
            shiftID,
            assigneeID,
            date,
            name,
            appOrderSign,
            note,
            service,
            salesChannel,
            paymentMethod,
            sources,
            total,
            discount,
            salesoff,
            credit,
            offer,
            vatAmount,
            products,
            shippingFee,
            paid,
            userID,
            ctx,
          })

          return renderStatusCodeAndResponse({
            resultAfterCallHandler,
            ctx,
          })
        } else {
          // console.log('11111111111111111111')
          let resultAfterCallHandler = await FNB_ORDER_MODEL.insert2({
            voucherID,
            fundaID,
            parentID,
            customerID,
            businessID,
            channelID,
            affiliateID,
            shiftID,
            assigneeID,
            date,
            name,
            appOrderSign,
            note,
            service,
            salesChannel,
            paymentMethod,
            sources,
            total,
            discount,
            salesoff,
            credit,
            offer,
            vatAmount,
            products,
            shippingFee,
            paid,
            userID,
            ctx,
          })

          return renderStatusCodeAndResponse({
            resultAfterCallHandler,
            ctx,
          })
        }
      } catch (error) {
        return { error: true, message: error.message }
      }
    },
  },

  update: {
    auth: 'required',
    params: {
      orderID: { type: 'string' },
      customerID: { type: 'string', optional: true },
      complaintID: { type: 'string', optional: true },
      cancelNote: { type: 'string', optional: true },
      status: { type: 'number', optional: true },
      paymentMethod: { type: 'number', optional: true },
      salesChannel: { type: 'number', optional: true },
      starRating: { type: 'number', optional: true },
      complaint: { type: 'number', optional: true },
      filesID: { type: 'array', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          orderID,
          customerID,
          cancelNote,
          filesID,
          status,
          paymentMethod,
          salesChannel,
          starRating,
          complaint,
          complaintID,
          shippingFeeTotal,
          shippingFee,
          paid,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await FNB_ORDER_MODEL.update({
          orderID,
          userID,
          customerID,
          cancelNote,
          filesID,
          status,
          paymentMethod,
          salesChannel,
          starRating,
          complaint,
          complaintID,
          shippingFeeTotal,
          shippingFee,
          paid,
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
  updateValue: {
    auth: 'required',
    params: {
      orderID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { orderID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await FNB_ORDER_MODEL.updateValue({
          orderID,
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
   * Func: remove Group
   */
  remove: {
    auth: 'required',
    params: {
      orderID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { orderID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await FNB_ORDER_MODEL.remove({
          orderID,
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
      orderID: { type: 'string', optional: true },
      customerID: { type: 'string', optional: true },
      voucherID: { type: 'string', optional: true },
      productID: { type: 'string', optional: true },
      fundasID: { type: 'array', optional: true },
      shiftsID: { type: 'array', optional: true },
      assigneesID: { type: 'array', optional: true },
      shiftTypes: { type: 'array', optional: true },
      salesChannels: { type: 'array', optional: true },
      services: { type: 'array', optional: true },
      statuss: { type: 'array', optional: true },
      fromDate: { type: 'string', optional: true },
      toDate: { type: 'string', optional: true },
      isMistake: { type: 'string', optional: true },
      isNonResident: { type: 'string', optional: true },
      isDiscount: { type: 'string', optional: true },
      isSalesoff: { type: 'string', optional: true },
      isCredit: { type: 'string', optional: true },
      isOffer: { type: 'string', optional: true },
      isCustomerType: { type: 'string', optional: true },
      isComplaint: { type: 'string', optional: true },
      isCampaignType: { type: 'string', optional: true },
      isPaymentMethod: { type: 'string', optional: true },
      starRating: { type: 'string', optional: true },
      managerID: { type: 'string', optional: true },

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
          type,
          option,
          orderID,
          fundasID,
          shiftsID,
          assigneesID,
          shiftTypes,
          salesChannels,
          services,
          statuss,
          fromDate,
          toDate,
          isMistake,
          isDiscount,
          isSalesoff,
          isCredit,
          isOffer,
          isNonResident,
          isCustomerType,
          isPaymentMethod,
          keyword,
          limit,
          lastestID,
          select,
          populates,
          sortKey,
          customerID,
          voucherID,
          productID,
          isComplaint,
          isCampaignType,
          starRating,
          managerID,
        } = ctx.params

        const { _id: userID, email, fullname, company } = ctx.meta.infoUser

        // console.log(ctx.params)

        let resultAfterCallHandler
        if (orderID) {
          resultAfterCallHandler = await FNB_ORDER_MODEL.getInfo({
            orderID,
            select,
            populates,
            ctx,
          })
        } else {
          resultAfterCallHandler = await FNB_ORDER_MODEL.getList({
            type,
            option,
            companyID: company._id,
            fundasID,
            shiftsID,
            assigneesID,
            shiftTypes,
            salesChannels,
            services,
            statuss,
            fromDate,
            toDate,
            isMistake,
            isDiscount,
            isSalesoff,
            isCredit,
            isOffer,
            isNonResident,
            isCustomerType,
            isPaymentMethod,
            keyword,
            limit,
            lastestID,
            select,
            populates,
            sortKey,
            userID,
            customerID,
            voucherID,
            productID,
            isComplaint,
            isCampaignType,
            starRating,
            managerID,
            ctx,
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
      customerID: { type: 'string', optional: true },
      option: { type: 'string', optional: true },
      staffID: { type: 'string', optional: true },
      optionGroup: { type: 'string', optional: true },
      optionStatus: { type: 'string', optional: true },
      optionTime: { type: 'string', optional: true },
      optionStar: { type: 'string', optional: true },
      year: { type: 'string', optional: true },
      month: { type: 'string', optional: true },
      fromDate: { type: 'string', optional: true },
      toDate: { type: 'string', optional: true },
      voucherType: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        let {
          optionFixFunda,
          option,
          optionGroup,
          optionStatus,
          optionTime,
          fundasID,
          fundas,
          customerID,
          year,
          month,
          fromDate,
          toDate,
          staffID,
          optionStar,
          voucherType,
        } = ctx.params

        let resultAfterCallHandler = await FNB_ORDER_MODEL.getListByProperty({
          companyID: company._id,
          fundasID,
          fundas,
          customerID,
          optionFixFunda,
          option,
          optionGroup,
          optionStatus,
          optionTime,
          year,
          month,
          fromDate,
          toDate,
          userID,
          staffID,
          optionStar,
          voucherType,
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

        const resultAfterCallHandler =
          await FNB_ORDER_MODEL.downloadTemplateExcel({
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

        const resultAfterCallHandler = await FNB_ORDER_MODEL.importFromExcel({
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
   * Func: Tải KPI
   * Date: 8/12/2022
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
        const { _id: userID, company, email } = ctx.meta.infoUser
        let { companyID, filterParams, queryFnb } = ctx.params
        // console.log(ctx.params)

        if (!companyID) {
          companyID = company._id
        }

        const resultAfterCallHandler = await FNB_ORDER_MODEL.exportExcel({
          userID,
          email,
          companyID,
          filterParams,
          queryFnb,
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
   * Func: Tải Đơn hàng
   * Date: 4/2/2023
   */
  exportExcel2: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
      option: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, email, company } = ctx.meta.infoUser
        let { companyID, option, month, year, fromDate, toDate, filterParams } =
          ctx.params

        // console.log(ctx.params)

        if (!companyID) {
          companyID = company._id
        }

        const resultAfterCallHandler = await FNB_ORDER_MODEL.exportExcel2({
          userID,
          email,
          companyID,
          option,
          month,
          year,
          fromDate,
          toDate,
          filterParams,
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
   * Func: Tải khách hàng tiềm năng
   * Date: 4/2/2023
   */
  exportExcel3: {
    auth: 'required',
    params: {
      companyID: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, email, company } = ctx.meta.infoUser
        let { companyID, filterParams } = ctx.params

        if (!companyID) {
          companyID = company._id
        }

        const resultAfterCallHandler = await FNB_ORDER_MODEL.exportExcel3({
          userID,
          email,
          companyID,
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
   * Dev: HiepNH
   * Func: Reset All Data
   * Date: 25/12/2022
   */
  resetAllData: {
    auth: 'required',
    params: {
      option: { type: 'string' },
      page: { type: 'string', optional: true },
      password: { type: 'string' },
      fundaID: { type: 'string', optional: true },
      arrCustomers: { type: 'array', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, email, company } = ctx.meta.infoUser
        let { option, password, fundaID, page, arrCustomers } = ctx.params

        const resultAfterCallHandler = await FNB_ORDER_MODEL.resetAllData({
          option,
          email,
          password,
          userID,
          fundaID,
          companyID: company._id,
          page,
          arrCustomers,
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

  convertAllData: {
    auth: 'required',
    params: {
      // password: { type: "string" },
      option: { type: 'string' },
      companyID: { type: 'string', optional: true },
      page: { type: 'string', optional: true },
      checkNumber: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)

        const { _id: userID, email } = ctx.meta.infoUser

        let { password, option, companyID, page, unit, checkNumber } =
          ctx.params

        const resultAfterCallHandler = await FNB_ORDER_MODEL.convertAllData({
          password,
          option,
          companyID,
          page,
          unit,
          checkNumber,
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
