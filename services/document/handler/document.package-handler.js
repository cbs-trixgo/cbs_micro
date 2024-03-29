/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const DOCUMENT__PACKAGE_MODEL = require('../model/document.package-model').MODEL

module.exports = {
  /**
   * ============================ ****************** ===============================
   * ============================ 	 PACKAGE  	   ===============================
   * ============================ ****************** ===============================
   */

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

        const resultAfterCallHandler = await DOCUMENT__PACKAGE_MODEL.insert({
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
   * Dev: HiepNH
   * Func: Cập nhật gói thầu
   * Date: 11/02/2022
   */
  update: {
    auth: 'required',
    params: {
      packageID: { type: 'string' },
      fieldID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      bidderID: { type: 'string', optional: true },
      contractID: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
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
      members: { type: 'array', optional: true },
      membersRemove: { type: 'array', optional: true },
      admins: { type: 'array', optional: true },
      adminsRemove: { type: 'array', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID } = ctx.meta.infoUser
        let {
          packageID,
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
          members,
          membersRemove,
          admins,
          adminsRemove,
        } = ctx.params

        let resultAfterCallHandler = await DOCUMENT__PACKAGE_MODEL.update({
          packageID,
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
          members,
          membersRemove,
          admins,
          adminsRemove,
        })

        return renderStatusCodeAndResponse({
          resultAfterCallHandler,
          ctx,
        })
      } catch (error) {
        return renderStatusCodeAndResponse({
          ctx,
          error_message: error.message,
        })
      }
    },
  },

  /**
   * Dev: HiepNH
   * Func: Xoa gói thầu
   * Date: 11/02/2022
   */
  remove: {
    auth: 'required',
    params: {
      packageID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID, company } = ctx.meta.infoUser
        let { packageID } = ctx.params
        let resultAfterCallHandler = await DOCUMENT__PACKAGE_MODEL.remove({
          packageID,
        })
        return renderStatusCodeAndResponse({
          resultAfterCallHandler,
          ctx,
        })
      } catch (error) {
        return renderStatusCodeAndResponse({
          ctx,
          error_message: error.message,
        })
      }
    },
  },

  /**
   * Dev: HiepNH
   * Func: Xoá nhiều gói thầu
   * Date: 11/02/2022
   */
  removeMany: {
    auth: 'required',
    params: {
      packagesID: { type: 'array' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { _id: userID, company } = ctx.meta.infoUser
        let { packagesID } = ctx.params
        let resultAfterCallHandler = await DOCUMENT__PACKAGE_MODEL.removeMany({
          packagesID,
        })
        return renderStatusCodeAndResponse({
          resultAfterCallHandler,
          ctx,
        })
      } catch (error) {
        return renderStatusCodeAndResponse({
          ctx,
          error_message: error.message,
        })
      }
    },
  },

  /**
   * Dev: HiepNH
   * Func: Danh sách gói thầu hoặc chi tiết gói thầu
   * Date: 27/10/2021
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      departmentID: { type: 'string', optional: true },
      packageID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      isShowAll: { type: 'string', optional: true },
      // =========================
      lastestID: { type: 'string', optional: true },
      keyword: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
      limit: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const {
          isShowAll,
          packageID,
          lastestID,
          departmentID,
          parentID,
          status,
          keyword,
          select,
          populates,
          limit,
        } = ctx.params
        let resultAfterCallHandler

        if (packageID) {
          resultAfterCallHandler = await DOCUMENT__PACKAGE_MODEL.getInfo({
            packageID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await DOCUMENT__PACKAGE_MODEL.getListPackage(
            {
              isShowAll,
              departmentID,
              parentID,
              status,
              userID,
              lastestID,
              keyword,
              select,
              populates,
              limit,
            }
          )
        }
        return renderStatusCodeAndResponse({
          resultAfterCallHandler,
          ctx,
        })
      } catch (error) {
        return renderStatusCodeAndResponse({
          ctx,
          error_message: error.message,
        })
      }
    },
  },
}
