/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const DOCUMENT__DOC_FILE_MODEL =
  require('../model/document.doc_file-model').MODEL

module.exports = {
  /**
   * ============================ ****************** ===============================
   * ============================ 	 DOC FILE  	   ===============================
   * ============================ ****************** ===============================
   */

  /**
   * Dev: HiepNH
   * Func: Danh sách và chi tiết doc file
   * Date: 27/10/2021
   */
  insert: {
    auth: 'required',
    params: {
      documentID: { type: 'string' },
      fileID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const { documentID, fileID } = ctx.params
        let resultAfterCallHandler = await DOCUMENT__DOC_FILE_MODEL.insert({
          documentID,
          fileID,
          userID,
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
   * Func: update
   */
  update: {
    auth: 'required',
    params: {
      docFileID: { type: 'string' },
      official: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const { docFileID, official } = ctx.params
        let resultAfterCallHandler = await DOCUMENT__DOC_FILE_MODEL.update({
          docFileID,
          official,
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
   * Func: Xóa doc file
   * Date: 27/10/2021
   */
  remove: {
    auth: 'required',
    params: {
      docFileID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { docFileID } = ctx.params

        let resultAfterCallHandler = await DOCUMENT__DOC_FILE_MODEL.delete({
          docFileID,
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
   * Func: Danh sách vaf chi tiết doc file
   * Date: 27/10/2021
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      documentID: { type: 'string', optional: true },
      docFileID: { type: 'string', optional: true },

      lastestID: { type: 'string', optional: true },
      limit: { type: 'string', optional: true },
      keyword: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const {
          docFileID,
          documentID,
          keyword,
          select,
          lastestID,
          limit,
          populates,
        } = ctx.params
        let resultAfterCallHandler

        if (docFileID) {
          resultAfterCallHandler = await DOCUMENT__DOC_FILE_MODEL.getInfo({
            docFileID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await DOCUMENT__DOC_FILE_MODEL.getList({
            documentID,
            userID,
            lastestID,
            limit: +limit,
            keyword,
            select,
            populates,
          })
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
