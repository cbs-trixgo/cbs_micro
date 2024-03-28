'use strict'

const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
  CF_ACTIONS_NOTIFICATION,
} = require('../../notification/helper/notification.actions-constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')
const { APP_KEYS, LANGUAGE_KEYS } = require('../../../tools/keys')
const {
  ENV_DEVICE_WEB_CBS,
} = require('../../notification/helper/notification.keys-constant')

/**s
 * import inter-coll, exter-coll
 */
const MEDIA__COMMENT_COLL = require('../database/media.comment-coll')
const MEDIA__COMMENT_FILE_COLL = require('../database/media.comment_file-coll')
const MEDIA__COMMENT_REACTION_COLL = require('../database/media.reaction_comment-coll')
const MEDIA_COLL = require('../database/media-coll')
const MEDIA__FILE_COLL = require('../database/media.file-coll')

class Model extends BaseModel {
  constructor() {
    super(MEDIA__COMMENT_COLL)
  }

  /**
   * ============================ ****************** ===============================
   * ============================    COMMENT MEDIA   ===============================
   * ============================ ****************** ===============================
   */

  /**
   * Dev: MinhVH
   * Func: Insert noti to DB
   */
  createNotification({ infoMedia, infoComment, authorID, bizfullname, ctx }) {
    return new Promise(async (resolve) => {
      try {
        let arrReceiver = []
        let dataSend = {}
        let titleMSS = ''
        let descriptionMSS = ''

        /**
         * Loại bài viết
         * 1: Bài viết công ty (Thành viên trong công ty)
         * 2: Dự án, phòng ban
         * 3: Chuyển đổi số
         * 4: Hệ thống
         * 5: Bài viết cá nhân
         * ..... Sau bổ sung thêm vài loại bài viết
         */
        switch (infoMedia.type) {
          case 1: {
            const listReceivers = await ctx.call(
              `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`,
              {
                companyID: infoMedia?.company?.toString(),
                isLoadAll: true,
              }
            )

            if (!listReceivers.error) {
              arrReceiver = listReceivers.data?.map((user) => user._id)
            }
            break
          }
          case 2: {
            const listReceivers = await ctx.call(
              `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
              {
                departmentID: infoMedia?.department?.toString(),
                // select: "members"
              }
            )

            if (!listReceivers.error) {
              arrReceiver = listReceivers.data?.members
            }
          }
          case 3:
          case 4: {
            const listReceivers = await ctx.call(
              `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`,
              {
                isLoadAll: true,
              }
            )

            if (!listReceivers.error) {
              arrReceiver = listReceivers.data?.map((user) => user._id)
            }
            break
          }
          default:
            break
        }

        dataSend = {
          app: APP_KEYS.MEDIA,
          languageKey: LANGUAGE_KEYS.CREATE_COMMENT_MEDIA,
          mainColl: {
            kind: 'media',
            item: {
              _id: infoMedia?._id,
              title: infoMedia?.title,
              author: {
                _id: infoMedia?.author?._id,
                bizfullname: infoMedia?.author?.bizfullname,
                image: infoMedia?.author?.image,
              },
            },
          },
          subColl: {
            kind: 'media_comment',
            item: {
              _id: infoComment._id,
            },
          },
        }

        titleMSS = `BÀI VIẾT: ${infoMedia.title}`
        descriptionMSS = `${bizfullname} đã tạo 1 bình luận`
        arrReceiver = arrReceiver.filter(
          (receiverID) => receiverID.toString() !== authorID.toString()
        )
        // console.log({ LENGTH: arrReceiver.length, mediaType: infoMedia.type })

        if (arrReceiver && arrReceiver.length) {
          const content =
            infoComment?.content?.length > 100
              ? infoComment?.content?.substr(0, 100)
              : infoComment?.content

          ctx.emit('NOTIFICATION__LOG_CREATE:MOBILE_WEB', {
            users: arrReceiver,
            title: titleMSS,
            description: descriptionMSS,
            dataSend,
            web_url: `/media/post/${infoMedia._id}#${infoComment._id}`,
            env: ENV_DEVICE_WEB_CBS,
          })

          // ctx.call(`${CF_DOMAIN_SERVICES.NOTIFICATION}.${CF_ACTIONS_NOTIFICATION.INSERT_NOTIFICATION}`, {
          //     content: content || 'Đã gửi 1 bình luận file',
          //     receivers: arrReceiver,
          //     path: `/media/post/${infoMedia._id}#${infoComment._id}`,
          //     languageKey: LANGUAGE_KEYS.CREATE_COMMENT_MEDIA,
          //     app: APP_KEYS.MEDIA,
          //     mainColl: {
          //         kind: "media",
          //         item: infoMedia._id
          //     },
          //     subColl: {
          //         kind: "media_comment",
          //         item: infoComment._id
          //     },
          //     type: 1 // InApp (Socket)
          // });
        }

        return resolve({ error: false, data: arrReceiver, status: 200 })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }

  responseDataComment({ comments, authorID }) {
    return new Promise(async (resolve) => {
      try {
        let dataResponse = []

        for (const comment of comments) {
          const lastReactionComment = await MEDIA__COMMENT_REACTION_COLL.find({
            'comment.item': comment._id,
          })
            .select('type')
            .sort({ _id: -1 })
            .limit(3)
            .lean()

          const infoReaction = await MEDIA__COMMENT_REACTION_COLL.findOne({
            'comment.item': comment._id,
            author: authorID,
          })
            .select('type')
            .lean()

          if (
            comment.lastestReplyID &&
            typeof comment.lastestReplyID !== 'string'
          ) {
            const lastReactionCommentReply =
              await MEDIA__COMMENT_REACTION_COLL.find({
                'comment.item': comment.lastestReplyID?._id,
              })
                .select('type')
                .sort({ _id: -1 })
                .limit(3)
                .lean()

            const infoReactionReply =
              await MEDIA__COMMENT_REACTION_COLL.findOne({
                'comment.item': comment.lastestReplyID?._id,
                author: authorID,
              })
                .select('type')
                .lean()

            comment.lastestReplyID['reaction'] = infoReactionReply
            comment.lastestReplyID['lastReactionComment'] =
              lastReactionCommentReply
          }

          dataResponse[dataResponse.length] = {
            ...comment,
            reaction: infoReaction,
            lastReactionComment,
          }
        }

        return resolve({
          error: false,
          data: dataResponse,
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
   * Func: Create comment media
   */
  insert({
    mediaID,
    parentID,
    content,
    files,
    images,
    authorID,
    select,
    populates,
    bizfullname,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        let dataInsert = {
          media: mediaID,
          author: authorID,
        }

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([mediaID])) {
          return resolve({
            error: true,
            message: 'Tham số mediaID không hợp lệ',
            keyError: 'params_mediaID_invalid',
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

        /**
         * LOGIC STEP (3)
         * 3.1: Convert type + update name (ví dụ: string -> number)
         * 3.2: Operation database
         */
        if (parentID) {
          if (!checkObjectIDs([parentID])) {
            return resolve({
              error: true,
              message: 'Tham số parentID không hợp lệ',
              keyError: 'params_parentID_invalid',
              status: 400,
            })
          }

          dataInsert.parent = parentID
        }

        const infoMedia = await MEDIA_COLL.findById(mediaID)
          .populate('author', '_id bizfullname image')
          .lean()

        if (!infoMedia) {
          return resolve({
            error: true,
            message: 'Bài viết không tồn tại',
            keyError: 'media_not_exists',
            status: 400,
          })
        }

        content && (dataInsert.content = content)
        files && (dataInsert.files = files)
        images && (dataInsert.images = images)

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        if (parentID) {
          await MEDIA__COMMENT_COLL.findByIdAndUpdate(parentID, {
            $set: {
              lastestReplyID: infoAfterInsert._id,
            },
            $inc: {
              amountCommentReply: 1,
            },
          })
        }

        // Cập nhật số lượng comment
        await MEDIA_COLL.findByIdAndUpdate(mediaID, {
          $inc: {
            amountComment: 1,
          },
        })

        // Insert notification to DB
        const infoAfterCreateNoti = await this.createNotification({
          infoMedia,
          infoComment: infoAfterInsert,
          bizfullname,
          authorID,
          ctx,
        })
        if (infoAfterCreateNoti.error) return resolve(infoAfterCreateNoti)

        infoAfterInsert = await MEDIA__COMMENT_COLL.findById(
          infoAfterInsert._id
        )
          .select(select)
          .populate(populates)
          .lean()

        infoAfterInsert.receivers = infoAfterCreateNoti.data

        return resolve({
          error: false,
          data: infoAfterInsert,
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
   * Func: Update comment media
   * Date: 22/02/2022
   */
  update({ commentID, authorID, content, files, images, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let dataUpdate = {}

        /**
         * VALIDATION STEP (2)
         *  - kiểm tra valid từ các input
         *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
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

        /**
         * LOGIC STEP (3)
         *  3.1: convert type + update name (ví dụ: string -> number)
         *  3.2: operation database
         */
        content && (dataUpdate.content = content)

        // CẬP NHẬT FILE MỚI
        if (files.length && checkObjectIDs(files)) {
          dataUpdate.files = files
        } else {
          dataUpdate.files = []
        }

        // CẬP NHẬT HÌNH ẢNH MỚI
        if (images.length && checkObjectIDs(images)) {
          dataUpdate.images = images
        } else {
          dataUpdate.images = []
        }

        let infoAfterUpdate = await MEDIA__COMMENT_COLL.findOneAndUpdate(
          {
            _id: commentID,
            author: authorID,
          },
          dataUpdate
        )

        if (!infoAfterUpdate) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        infoAfterUpdate = await MEDIA__COMMENT_COLL.findById(commentID)
          .select(select)
          .populate(populates)
          .lean()

        return resolve({
          error: false,
          data: infoAfterUpdate,
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
   * Func: Delete comment media
   */
  delete({ authorID, commentID }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([authorID])) {
          return resolve({
            error: true,
            message: 'Tham số authorID không hợp lệ',
            keyError: 'params_authorID_invalid',
            status: 400,
          })
        }

        if (!checkObjectIDs([commentID])) {
          return resolve({
            error: true,
            message: 'Tham số commentID không hợp lệ',
            keyError: 'params_commentID_invalid',
            status: 400,
          })
        }

        let infoComment = await MEDIA__COMMENT_COLL.findOne({
          _id: commentID,
          author: authorID,
        }).lean()

        if (!infoComment) {
          return resolve({
            error: true,
            message:
              'Comment không tồn tại hoặc bạn không phải người tạo comment',
            keyError: 'comment_not_exists_or_you_are_not_author_of_comment',
            status: 400,
          })
        }

        let infoCommentAfterDelete =
          await MEDIA__COMMENT_COLL.findByIdAndDelete(commentID)

        if (!infoCommentAfterDelete) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurs',
            status: 422,
          })
        }

        if (infoComment.parent) {
          // Cập nhật số lượng comment reply trong comment cha
          await MEDIA__COMMENT_COLL.findByIdAndUpdate(infoComment.parent, {
            $inc: {
              amountCommentReply: -1,
            },
          })
        }

        // Cập nhật số lượng comment trong media
        await MEDIA_COLL.findByIdAndUpdate(infoComment.media, {
          $inc: {
            amountComment: -1,
          },
        })

        return resolve({
          error: false,
          status: 200,
          data: infoCommentAfterDelete,
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
   * Func: Info comment media
   */
  getInfo({ commentID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([commentID])) {
          return resolve({
            error: true,
            message: 'Tham số commentID không hợp lệ',
            keyError: 'params_commentID_invalid',
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

        let infoComment = await MEDIA__COMMENT_COLL.findById(commentID)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoComment) {
          return resolve({
            error: true,
            message: 'Comment không tồn tại',
            keyError: 'comment_not_exists',
            status: 400,
          })
        }

        return resolve({ error: false, data: infoComment, status: 200 })
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
   * Func: List comment media
   */
  getList({
    mediaID,
    parentID,
    limit = 5,
    lastestID,
    select,
    populates,
    authorID,
    isLoadAll,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let conditionObj = { media: mediaID }
        let keys = ['createAt__-1', '_id__-1']
        let sortBy = {
          createAt: -1,
          _id: -1,
        }

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([mediaID])) {
          return resolve({
            error: true,
            message: 'Tham số mediaID không hợp lệ',
            keyError: 'params_mediaID_invalid',
            status: 400,
          })
        }

        if (isNaN(limit) || +limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        if (checkObjectIDs([parentID])) {
          conditionObj.parent = parentID
        } else {
          conditionObj.parent = { $exists: false }
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

        if (isLoadAll) {
          let listComments = await MEDIA__COMMENT_COLL.find({})
            .select('author')
            .lean()

          return resolve({
            error: false,
            data: listComments,
            status: 200,
          })
        }

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await MEDIA__COMMENT_COLL.findById(lastestID)
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

        let infoDataAfterGet = await MEDIA__COMMENT_COLL.find(conditionObj)
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
            keyError: 'error_occurs',
            status: 422,
          })
        }

        let totalRecord = await MEDIA__COMMENT_COLL.count(conditionObjOrg)
        let dataResponse = await this.responseDataComment({
          authorID,
          comments: infoDataAfterGet,
        })
        let totalPage = Math.ceil(totalRecord / limit)
        let nextCursor = null

        if (dataResponse.error) return resolve(dataResponse)

        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        return resolve({
          error: false,
          data: {
            listRecords: dataResponse?.data || infoDataAfterGet,
            limit,
            totalRecord,
            totalPage,
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

  /**
   * ============================ ****************** ===============================
   * ============================    COMMENT FILE    ===============================
   * ============================ ****************** ===============================
   */

  /**
   * Dev: MinhVH
   * Func: Create comment file
   */
  insertCommentFile({
    mediaID,
    fileID,
    parentID,
    content,
    files,
    images,
    select,
    populates,
    authorID,
    bizfullname,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([mediaID, fileID])) {
          return resolve({
            error: true,
            message: 'Tham số mediaID hoặc fileID không hợp lệ',
            keyError: 'params_mediaID_or_fileID_invalid',
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

        /**
         * LOGIC STEP (3)
         * 3.1: Convert type + update name (ví dụ: string -> number)
         * 3.2: Operation database
         */
        let dataInsert = {
          media: mediaID,
          file: fileID,
          author: authorID,
          createAt: new Date(),
        }

        if (parentID) {
          if (!checkObjectIDs([parentID])) {
            return resolve({
              error: true,
              message: 'Tham số parentID không hợp lệ',
              keyError: 'params_parentID_invalid',
              status: 400,
            })
          }

          dataInsert.parent = parentID
        }

        const infoMedia = await MEDIA_COLL.findById(mediaID)
          .populate('author', '_id bizfullname image')
          .lean()

        if (!infoMedia) {
          return resolve({
            error: true,
            message: 'Bài viết không tồn tại',
            keyError: 'media_not_exists',
            status: 400,
          })
        }

        content && (dataInsert.content = content)
        files && (dataInsert.files = files)
        images && (dataInsert.images = images)

        let infoAfterInsert = await MEDIA__COMMENT_FILE_COLL.create(dataInsert)
        if (!infoAfterInsert) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurs',
            status: 422,
          })
        }

        if (parentID) {
          await MEDIA__COMMENT_FILE_COLL.findByIdAndUpdate(parentID, {
            $set: {
              lastestReplyID: infoAfterInsert._id,
            },
            $inc: {
              amountCommentReply: 1,
            },
          })
        }

        // Cập nhật số lượng comment
        await MEDIA__FILE_COLL.findByIdAndUpdate(fileID, {
          $inc: {
            amountComment: 1,
          },
        })

        // Insert notification to DB
        const infoAfterCreateNoti = await this.createNotification({
          infoMedia,
          infoComment: infoAfterInsert,
          bizfullname,
          authorID,
          ctx,
        })
        if (infoAfterCreateNoti.error) return resolve(infoAfterCreateNoti)

        infoAfterInsert = await MEDIA__COMMENT_FILE_COLL.findById(
          infoAfterInsert._id
        )
          .select(select)
          .populate(populates)
          .lean()

        infoAfterInsert.receivers = infoAfterCreateNoti.data

        return resolve({
          error: false,
          data: infoAfterInsert,
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
   * Func: Update comment media file
   * Date: 22/02/2022
   */
  updateCommentFile({
    commentID,
    authorID,
    content,
    files,
    images,
    select,
    populates,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let dataUpdate = {}

        /**
         * VALIDATION STEP (2)
         *  - kiểm tra valid từ các input
         *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
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

        /**
         * LOGIC STEP (3)
         *  3.1: convert type + update name (ví dụ: string -> number)
         *  3.2: operation database
         */
        content && (dataUpdate.content = content)

        // CẬP NHẬT FILE MỚI
        if (files.length && checkObjectIDs(files)) {
          dataUpdate.files = files
        } else {
          dataUpdate.files = []
        }

        // CẬP NHẬT HÌNH ẢNH MỚI
        if (images.length && checkObjectIDs(images)) {
          dataUpdate.images = images
        } else {
          dataUpdate.images = []
        }

        let infoAfterUpdate = await MEDIA__COMMENT_FILE_COLL.findOneAndUpdate(
          {
            _id: commentID,
            author: authorID,
          },
          dataUpdate
        )

        if (!infoAfterUpdate) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        infoAfterUpdate = await MEDIA__COMMENT_FILE_COLL.findById(commentID)
          .select(select)
          .populate(populates)
          .lean()

        return resolve({
          error: false,
          data: infoAfterUpdate,
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
   * Func: Delete comment file
   */
  deleteCommentFile({ authorID, commentID }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([authorID])) {
          return resolve({
            error: true,
            message: 'Tham số authorID không hợp lệ',
            keyError: 'params_authorID_invalid',
            status: 400,
          })
        }

        if (!checkObjectIDs([commentID])) {
          return resolve({
            error: true,
            message: 'Tham số commentID không hợp lệ',
            keyError: 'params_commentID_invalid',
            status: 400,
          })
        }

        let infoComment = await MEDIA__COMMENT_FILE_COLL.findOne({
          _id: commentID,
          author: authorID,
        }).lean()

        if (!infoComment) {
          return resolve({
            error: true,
            message:
              'Comment không tồn tại hoặc bạn không phải người tạo comment',
            keyError: 'comment_not_exists_or_you_are_not_author_of_comment',
            status: 403,
          })
        }

        if (infoComment.parent) {
          // Cập nhật số lượng comment reply của comment parent
          await MEDIA__COMMENT_FILE_COLL.findByIdAndUpdate(infoComment.parent, {
            $inc: {
              amountCommentReply: -1,
            },
          })
        }

        let infoCommentAfterDelete =
          await MEDIA__COMMENT_FILE_COLL.findByIdAndDelete(commentID)

        if (!infoCommentAfterDelete) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurs',
            status: 422,
          })
        }

        // Cập nhật số lượng comment
        await MEDIA__FILE_COLL.findByIdAndUpdate(infoComment.file, {
          $inc: {
            amountComment: -1,
          },
        })

        return resolve({
          error: false,
          status: 200,
          data: infoCommentAfterDelete,
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
   * Func: Info comment file
   */
  getInfoCommentFile({ commentID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([commentID])) {
          return resolve({
            error: true,
            message: 'Tham số commentID không hợp lệ',
            keyError: 'params_commentID_invalid',
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

        let infoComment = await MEDIA__COMMENT_FILE_COLL.findById(commentID)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoComment) {
          return resolve({
            error: true,
            message: 'Comment không tồn tại',
            keyError: 'comment_not_exists',
            status: 400,
          })
        }

        return resolve({ error: false, data: infoComment, status: 200 })
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
   * Func: List comment file
   */
  getListCommentFile({
    mediaID,
    fileID,
    parentID,
    limit = 5,
    lastestID,
    select,
    populates,
    authorID,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let conditionObj = { media: mediaID, file: fileID }
        let keys = ['createAt__-1', '_id__-1']
        let sortBy = {
          createAt: -1,
          _id: -1,
        }

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([mediaID, fileID])) {
          return resolve({
            error: true,
            message: 'Tham số mediaID hoặc fileID không hợp lệ',
            keyError: 'params_mediaID_or_fileID_invalid',
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

        if (checkObjectIDs(parentID)) {
          conditionObj.parent = parentID
        } else {
          conditionObj.parent = { $exists: false }
        }

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await MEDIA__COMMENT_FILE_COLL.findById(lastestID)
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

        let infoDataAfterGet = await MEDIA__COMMENT_FILE_COLL.find(conditionObj)
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
            keyError: 'error_occurs',
            status: 422,
          })
        }

        let totalRecord = await MEDIA__COMMENT_FILE_COLL.count(conditionObjOrg)
        let dataResponse = await this.responseDataComment({
          authorID,
          comments: infoDataAfterGet,
        })
        let totalPage = Math.ceil(totalRecord / limit)
        let nextCursor = null

        if (dataResponse.error) return resolve(dataResponse)

        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        return resolve({
          error: false,
          data: {
            listRecords: dataResponse?.data || infoDataAfterGet,
            limit,
            totalRecord,
            totalPage,
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
