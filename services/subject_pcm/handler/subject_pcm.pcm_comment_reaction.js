/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const PCM_COMMENT_REACTION_MODEL =
  require('../model/subject_pcm.pcm_comment_reaction-model').MODEL

module.exports = {
  /**
   * Dev: MinhVH
   * Func: THẢ CẢM XÚC CHO BÌNH LUẬN PCM
   * Updated: 17/03/2022
   */
  reaction: {
    params: {
      commentID: { type: 'string' },
      typeReaction: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: authorID } = ctx.meta.infoUser
        const { commentID, typeReaction } = ctx.params

        const resultAfterCallHandler =
          await PCM_COMMENT_REACTION_MODEL.reaction({
            authorID,
            commentID,
            typeReaction,
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
   * Dev: MinhVH
   * Func: LẤY DANH SÁCH REACTION BÌNH LUẬN TRONG PCM
   * Updated: 17/03/2022
   */
  getListReaction: {
    params: {
      commentID: { type: 'string' },
      type: { type: 'string', optional: true },
      isGetTotal: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      limit: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: authorID } = ctx.meta.infoUser
        const {
          commentID,
          type,
          lastestID,
          isGetTotal,
          limit,
          select,
          populates,
        } = ctx.params

        const resultAfterCallHandler =
          await PCM_COMMENT_REACTION_MODEL.getListReaction({
            authorID,
            commentID,
            type,
            lastestID,
            isGetTotal,
            limit,
            select,
            populates,
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
}
