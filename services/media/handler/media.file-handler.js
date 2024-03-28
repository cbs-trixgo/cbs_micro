/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const MEDIA__FILE_MODEL = require('../model/media.file-model').MODEL

module.exports = {
  /**
   * Dev: MinhVH
   * Func: GET INFO MEDIA FILE
   * Updated: 27/02/2022
   */
  getInfoAndGetListMediaFile: {
    auth: 'required',
    params: {
      mediaID: { type: 'string', optional: true },
      fileID: { type: 'string', optional: true },
      limit: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: authorID } = ctx.meta.infoUser
        const { mediaID, fileID, lastestID, limit, select, populates } =
          ctx.params

        let resultAfterCallHandler = null

        if (fileID) {
          resultAfterCallHandler = await MEDIA__FILE_MODEL.getInfo({
            mediaID,
            fileID,
            authorID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await MEDIA__FILE_MODEL.getList({
            authorID,
            mediaID,
            lastestID,
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
        return renderStatusCodeAndResponse({
          ctx,
          error_message: error.message,
        })
      }
    },
  },
}
