'use strict'

/**
 * import internal
 */
const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { REACTION_TYPES } = require('../../../tools/keys')

/**
 * import inter-coll, exter-coll
 */
const PCM_COMMENT_COLL = require('../database/subject_pcm.pcm_comment-coll')
const PCM_COMMENT_REACTION_COLL = require('../database/subject_pcm.pcm_comment_reaction-coll')

class Model extends BaseModel {
  constructor() {
    super(PCM_COMMENT_REACTION_COLL)
  }

  /**
   * Dev: MinhVH
   * Func: THẢ CẢM XÚC CHO BÌNH LUẬN PCM
   * Updated: 17/03/2022
   */
  reaction({ authorID, commentID, typeReaction }) {
    return new Promise(async (resolve) => {
      try {
        if (!typeReaction || !REACTION_TYPES.includes(typeReaction)) {
          typeReaction = 1
        }

        if (!checkObjectIDs([authorID, commentID])) {
          return resolve({
            error: true,
            message: 'Tham số commentID hoặc authorID không hợp lệ',
            keyError: 'params_commentID_or_authorID_invalid',
            status: 400,
          })
        }

        const infoComment = await PCM_COMMENT_COLL.findById(commentID).lean()

        if (!infoComment) {
          return resolve({
            error: true,
            message: 'Bình luận không tồn tại',
            keyError: 'comment_is_not_exists',
            status: 400,
          })
        }

        // Kiểm tra đã thả cảm xúc trên bài viết
        const infoReaction = await PCM_COMMENT_REACTION_COLL.findOne({
          comment: commentID,
          author: authorID,
        }).lean()

        if (infoReaction) {
          const infoAfterDeleteReaction =
            await PCM_COMMENT_REACTION_COLL.findByIdAndDelete(infoReaction._id)

          if (infoReaction.type === typeReaction) {
            await PCM_COMMENT_COLL.findByIdAndUpdate(commentID, {
              $inc: {
                amountReaction: -1,
              },
            })

            return resolve({
              error: false,
              status: 200,
              data: infoAfterDeleteReaction,
            })
          }
        }

        const infoAfterInsertReaction = await this.insertData({
          comment: commentID,
          type: typeReaction,
          author: authorID,
        })

        if (!infoAfterInsertReaction) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        if (!infoReaction) {
          await PCM_COMMENT_COLL.findByIdAndUpdate(commentID, {
            $inc: {
              amountReaction: 1,
            },
          })
        }

        return resolve({
          error: false,
          data: infoAfterInsertReaction,
          status: 200,
        })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: LẤY DANH SÁCH REACTION BÌNH LUẬN TRONG PCM
   * Updated: 17/03/2022
   */
  getListReaction({
    authorID,
    commentID,
    lastestID,
    isGetTotal,
    type,
    limit = 15,
    select,
    populates,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let conditionObj = { comment: commentID }
        let keys = ['_id__-1', 'createAt__-1']
        let nextCursor = null
        let sortBy = {
          _id: -1,
          createAt: -1,
        }

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([commentID])) {
          return resolve({
            error: true,
            message: 'Tham số commentID không hợp lệ',
            keyError: 'params_commentID_invalid',
            status: 400,
          })
        }

        if (!checkObjectIDs([authorID])) {
          return resolve({
            error: true,
            message: 'Tham số authorID không hợp lệ',
            keyError: 'params_authorID_invalid',
            status: 400,
          })
        }

        if (populates && typeof populates === 'string') {
          if (!IsJsonString(populates))
            return resolve({
              error: true,
              message: 'Request params populates invalid',
              status: 400,
            })

          populates = JSON.parse(populates)
        } else {
          populates = {
            path: '',
            select: '',
          }
        }

        if (isNaN(limit) || +limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        type && (conditionObj.type = type)

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await PCM_COMMENT_REACTION_COLL.findById(lastestID)
          if (!infoData)
            return resolve({
              error: true,
              message: "Can't get info lastestID",
              status: 400,
            })

          let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
            keys,
            latestRecord: infoData,
            objectQuery: conditionObjOrg,
          })
          if (!dataPagingAndSort || dataPagingAndSort.error)
            return resolve({
              error: true,
              message: "Can't get range pagination",
              status: 400,
            })

          conditionObj = dataPagingAndSort.data.find
          sortBy = dataPagingAndSort.data.sort
        } else {
          let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
            keys,
            latestRecord: null,
            objectQuery: conditionObjOrg,
          })
          sortBy = dataPagingAndSort.data.sort
        }

        let infoDataAfterGet = await PCM_COMMENT_REACTION_COLL.find(
          conditionObj
        )
          .limit(limit + 1)
          .sort(sortBy)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoDataAfterGet) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        const totalRecord =
          await PCM_COMMENT_REACTION_COLL.count(conditionObjOrg)

        if (isGetTotal) {
          const totalRecordLike =
            await PCM_COMMENT_REACTION_COLL.countDocuments({
              ...conditionObjOrg,
              type: 1,
            })
          const totalRecordHeart =
            await PCM_COMMENT_REACTION_COLL.countDocuments({
              ...conditionObjOrg,
              type: 2,
            })
          const totalRecordSmile =
            await PCM_COMMENT_REACTION_COLL.countDocuments({
              ...conditionObjOrg,
              type: 3,
            })
          const totalRecordSurprise =
            await PCM_COMMENT_REACTION_COLL.countDocuments({
              ...conditionObjOrg,
              type: 4,
            })
          const totalRecordSad = await PCM_COMMENT_REACTION_COLL.countDocuments(
            {
              ...conditionObjOrg,
              type: 5,
            }
          )
          const totalRecordAngry =
            await PCM_COMMENT_REACTION_COLL.countDocuments({
              ...conditionObjOrg,
              type: 6,
            })

          return resolve({
            error: false,
            status: 200,
            data: {
              listRecords: infoDataAfterGet,
              limit,
              nextCursor,
              totalRecord,
              totalRecordLike,
              totalRecordHeart,
              totalRecordSmile,
              totalRecordSurprise,
              totalRecordSad,
              totalRecordAngry,
            },
          })
        }

        return resolve({
          error: false,
          data: {
            listRecords: infoDataAfterGet,
            limit,
            totalRecord,
            nextCursor,
          },
          status: 200,
        })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }
}

exports.MODEL = new Model()
