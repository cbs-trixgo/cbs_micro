/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__STORAGE_MODEL = require('../model/item.storage-model').MODEL

module.exports = {
  /**
   * Dev: HiepNH
   * Func: insert storage
   */
  insert: {
    params: {
      parentID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      name: { type: 'string' },
      description: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { parentID, projectID, name, description } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler = await ITEM__STORAGE_MODEL.insert({
          companyID: company._id,
          projectID,
          parentID,
          name,
          description,
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
   * Func: update storage
   */
  update: {
    params: {
      storageID: { type: 'string' },
      name: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { storageID, name, description } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await ITEM__STORAGE_MODEL.update({
          storageID,
          name,
          description,
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
   * Func: remove storage => KHÔNG CHO PHÉP XÓA CÁC DANH MỤC
   */

  /**
   * Dev: HiepNH
   * Func: Danh sách doctype
   */
  getInfoAndGetList: {
    params: {
      storageID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      isListParentOfListChilds: { type: 'string', optional: true },
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
          companyID,
          storageID,
          projectID,
          parentID,
          isListParentOfListChilds,
          keyword,
          limit,
          lastestID,
          select,
          populates,
        } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser
        if (!companyID) {
          companyID = company._id
        }
        let resultAfterCallHandler
        if (storageID) {
          resultAfterCallHandler = await ITEM__STORAGE_MODEL.getInfo({
            storageID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await ITEM__STORAGE_MODEL.getList({
            companyID,
            projectID,
            parentID,
            isListParentOfListChilds,
            lastestID,
            keyword,
            limit,
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
}
