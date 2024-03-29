'use strict'

/**
 * EXTERNAL PACKAGE
 */
const PromisePool = require('@supercharge/promise-pool')
const ObjectID = require('mongoose').Types.ObjectId

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')
const { CF_ACTIONS_FILE } = require('../../file/helper/file.actions-constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')
const { MEDIA_TYPES } = require('../helper/media.keys-constant')
const { APP_KEYS, LANGUAGE_KEYS, KEY_ERROR } = require('../../../tools/keys')
const {
  ENV_DEVICE_WEB_CBS,
} = require('../../notification/helper/notification.keys-constant')

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const {
  checkObjectIDs,
  IsJsonString,
  isEmptyObject,
} = require('../../../tools/utils/utils')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

/**
 * COLLECTIONS
 */
const MEDIA_COLL = require('../database/media-coll')
const MEDIA__FILE_COLL = require('../database/media.file-coll')
const MEDIA__SEEN_COLL = require('../database/media.seen-coll')
const MEDIA__SAVE_COLL = require('../database/media.save-coll')
const MEDIA__REACIONT_COLL = require('../database/media.reaction-coll')

class Model extends BaseModel {
  constructor() {
    super(MEDIA_COLL)
  }

  /**
   * Dev: MinhVH
   * Func: THÊM BÀI VIẾT MỚI
   * Updated: 24/02/2022
   */
  insertMedia({
    title,
    content,
    type,
    otherID,
    companyID,
    departmentID,
    location,
    tagFriends,
    files,
    images,
    background,
    authorID,
    bizfullname,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        //=======================VARIABLE/CONSTANTS=====================
        let dataInsert = {}
        let dataUpdate = {}
        let arrReceiver = []
        let titleMSS = 'THÔNG BÁO'
        let descriptionMSS = ''

        //=========================VALIDATION==========================
        if (!checkObjectIDs([authorID])) {
          return resolve({
            error: true,
            message: 'Tham số authorID không hợp lệ',
            keyError: 'params_authorID_invalid',
            status: 400,
          })
        }

        if (!MEDIA_TYPES.includes(type)) {
          return resolve({
            error: true,
            message: 'Tham số type không hợp lệ',
            keyError: 'params_type_invalid',
            status: 400,
          })
        }

        dataInsert = {
          author: authorID,
          title,
          content,
        }

        switch (type) {
          case 'company':
            dataInsert.type = 1
            break
          case 'department':
            dataInsert.type = 2
            break
          case 'digital-conversion':
            dataInsert.type = 3
            break
          case 'system':
            dataInsert.type = 4
            break
          case 'just-me':
            dataInsert.type = 5
            break
          default:
            break
        }

        if (location) {
          let locationOfMedia = {
            type: 'Point',
            coordinates: [parseFloat(location.lng), parseFloat(location.lat)],
          }

          dataInsert.location = locationOfMedia
        }

        if (otherID) {
          if (!checkObjectIDs(otherID)) {
            return resolve({
              error: true,
              message: 'Tham số otherID không hợp lệ',
              keyError: 'params_otherID_invalid',
              status: 400,
            })
          }

          dataInsert.other = otherID
        }

        if (companyID) {
          if (!checkObjectIDs(companyID)) {
            return resolve({
              error: true,
              message: 'Tham số companyID không hợp lệ',
              keyError: 'params_companyID_invalid',
              status: 400,
            })
          }

          dataInsert.company = companyID
        }

        if (departmentID) {
          if (!checkObjectIDs(departmentID)) {
            return resolve({
              error: true,
              message: 'Tham số departmentID không hợp lệ',
              keyError: 'params_departmentID_invalid',
              status: 400,
            })
          }

          dataInsert.department = departmentID
        }

        if (tagFriends && tagFriends.length) {
          if (!checkObjectIDs(tagFriends)) {
            return resolve({
              error: true,
              message: 'Tham số tagFriends không hợp lệ',
              keyError: 'params_tagFriends_invalid',
              status: 400,
            })
          }

          dataInsert.tagFriends = tagFriends
        }

        let infoMediaAfterInserted = await this.insertData(dataInsert)

        if (!infoMediaAfterInserted) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        const {
          _id: mediaID,
          type: mediaType,
          company,
        } = infoMediaAfterInserted

        if (background) {
          if (!checkObjectIDs([background])) {
            return resolve({
              error: true,
              message: 'Tham số background không hợp lệ',
              keyError: 'params_background_invalid',
              status: 400,
            })
          }

          const infoFileCore = await ctx.call(
            `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
            {
              fileID: background,
            }
          )

          if (!infoFileCore.error) {
            const {
              app,
              company,
              name,
              nameOrg,
              description,
              status,
              path,
              size,
              mimeType,
              type,
              author,
            } = infoFileCore.data

            const infoAfterInserted = await MEDIA__FILE_COLL.create({
              media: mediaID,
              file: fileID,
              app,
              company,
              name,
              nameOrg,
              path,
              size,
              mimeType,
              description,
              status,
              type,
              author,
            })

            dataUpdate.background = infoAfterInserted._id
          }
        }

        if (files && files.length) {
          if (!checkObjectIDs(files)) {
            return resolve({
              error: true,
              message: 'Tham số files không hợp lệ',
              keyError: 'params_files_invalid',
              status: 400,
            })
          }

          let { results, errors } = await PromisePool.for(files)
            .withConcurrency(2)
            .process(async (fileID) => {
              const infoFileCore = await ctx.call(
                `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
                {
                  fileID,
                }
              )

              if (!infoFileCore.error) {
                const {
                  app,
                  company,
                  name,
                  nameOrg,
                  description,
                  status,
                  path,
                  size,
                  mimeType,
                  type,
                  author,
                } = infoFileCore.data

                const infoAfterInserted = await MEDIA__FILE_COLL.create({
                  media: mediaID,
                  file: fileID,
                  app,
                  company,
                  name,
                  nameOrg,
                  path,
                  size,
                  mimeType,
                  description,
                  status,
                  type,
                  author,
                })
                return infoAfterInserted._id
              }
            })

          if (results.length && !errors.length) {
            results = results.filter(Boolean)
            dataUpdate.files = results
          }
        }

        if (images && images.length) {
          if (!checkObjectIDs(images)) {
            return resolve({
              error: true,
              message: 'Tham số images không hợp lệ',
              keyError: 'params_images_invalid',
              status: 400,
            })
          }

          let { results, errors } = await PromisePool.for(images)
            .withConcurrency(2)
            .process(async (fileID) => {
              const infoFileCore = await ctx.call(
                `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
                {
                  fileID,
                }
              )

              if (!infoFileCore.error) {
                const {
                  app,
                  company,
                  name,
                  nameOrg,
                  description,
                  status,
                  path,
                  size,
                  mimeType,
                  type,
                  author,
                } = infoFileCore.data

                const infoAfterInserted = await MEDIA__FILE_COLL.create({
                  media: mediaID,
                  file: fileID,
                  app,
                  company,
                  name,
                  nameOrg,
                  path,
                  size,
                  mimeType,
                  description,
                  status,
                  type,
                  author,
                })
                return infoAfterInserted._id
              }
            })

          if (results.length && !errors.length) {
            results = results.filter(Boolean)
            dataUpdate.images = results
          }
        }

        if (!isEmptyObject(dataUpdate)) {
          await MEDIA_COLL.findByIdAndUpdate(mediaID, dataUpdate)
        }

        /**
         * Loại bài viết
         * 1: Bài viết công ty (Thành viên trong công ty)
         * 2: Dự án, phòng ban
         * 3: Chuyển đổi số
         * 4: Hệ thống
         * 5: Bài viết cá nhân
         * ..... Sau bổ sung thêm vài loại bài viết
         */
        switch (mediaType) {
          case 1: {
            const listReceivers = await ctx.call(
              `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`,
              {
                companyID: company?.toString(),
                isLoadAll: true,
              }
            )

            if (!listReceivers.error) {
              arrReceiver = listReceivers.data?.map((user) => user._id)
              titleMSS = 'NỘI BỘ CÔNG TY'
              descriptionMSS = `${bizfullname} đã tạo mới 1 bài viết`
            }
            break
          }
          case 2: {
            const listReceivers = await ctx.call(
              `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
              {
                departmentID,
                // select: "name members"
              }
            )

            if (!listReceivers.error) {
              arrReceiver = listReceivers.data?.members
              titleMSS = listReceivers.data?.name
              descriptionMSS = `${bizfullname} đã tạo mới 1 bài viết`
            }
            break
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

              if (mediaType === 3) {
                titleMSS = 'CHUYỂN ĐỔI SỐ'
                descriptionMSS = `${bizfullname} đã tạo mới 1 bài viết`
              } else {
                titleMSS = 'HỆ THỐNG'
                descriptionMSS = `${bizfullname} đã tạo mới 1 bài viết`
              }
            }
            break
          }
          default:
            descriptionMSS = `${bizfullname} đã tạo mới 1 bài viết`
            break
        }

        arrReceiver = arrReceiver.filter(
          (receiverID) => receiverID.toString() !== authorID.toString()
        )

        if (arrReceiver && arrReceiver.length) {
          ctx.emit('NOTIFICATION__LOG_CREATE:MOBILE_WEB', {
            users: arrReceiver,
            title: titleMSS,
            description: descriptionMSS,
            dataSend: {
              app: APP_KEYS.MEDIA,
              languageKey: LANGUAGE_KEYS.CREATE_NEW_MEDIA,
              mainColl: {
                kind: 'media',
                item: { _id: infoMediaAfterInserted._id },
              },
            },
            web_url: `/media/post/${mediaID}`,
            env: ENV_DEVICE_WEB_CBS,
          })
        }

        return resolve({
          error: false,
          data: {
            infoMedia: infoMediaAfterInserted,
            receivers: arrReceiver,
          },
          status: 200,
        })
      } catch (error) {
        console.error(error)
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
   * Func: CHỈNH SỬA BÀI VIẾT
   * Updated: 24/02/2022
   */
  updateMedia({
    mediaID,
    title,
    content,
    type,
    otherID,
    companyID,
    departmentID,
    location,
    tagFriends,
    files,
    images,
    background,
    authorID,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        //=======================VARIABLE/CONSTANTS=====================
        let dataUpdate = {}

        //=========================VALIDATION==========================
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

        if (type && !MEDIA_TYPES.includes(type)) {
          return resolve({
            error: true,
            message: 'Tham số type không hợp lệ',
            keyError: 'params_type_invalid',
            status: 400,
          })
        }

        let infoMedia = await MEDIA_COLL.findOne({
          _id: mediaID,
          author: authorID,
        }).lean()

        if (!infoMedia) {
          return resolve({
            error: true,
            message:
              'Bài viết không tồn tại hoặc bạn không phải tác giả bài viết',
            keyError: 'media_not_exists_or_you_are_not_author_of_post',
            status: 400,
          })
        }

        title && (dataUpdate.title = title)
        content && (dataUpdate.content = content)

        switch (type) {
          case 'company':
            dataUpdate.type = 1
            break
          case 'department':
            dataUpdate.type = 2
            break
          case 'digital-conversion':
            dataUpdate.type = 3
            break
          case 'system':
            dataUpdate.type = 4
            break
          case 'just-me':
            dataUpdate.type = 5
            break
          default:
            break
        }

        if (location) {
          let locationOfMedia = {
            type: 'Point',
            coordinates: [parseFloat(location.lng), parseFloat(location.lat)],
          }

          dataUpdate.location = locationOfMedia
        }

        if (tagFriends) {
          if (!checkObjectIDs(tagFriends)) {
            return resolve({
              error: true,
              message: 'Tham số tagFriends không hợp lệ',
              keyError: 'params_tagFriends_invalid',
              status: 400,
            })
          }

          dataUpdate.tagFriends = tagFriends
        }

        if (companyID) {
          if (!checkObjectIDs([companyID])) {
            return resolve({
              error: true,
              message: 'Tham số companyID không hợp lệ',
              keyError: 'params_companyID_invalid',
              status: 400,
            })
          }

          dataUpdate.company = companyID
        }

        if (departmentID) {
          if (!checkObjectIDs([departmentID])) {
            return resolve({
              error: true,
              message: 'Tham số departmentID không hợp lệ',
              keyError: 'params_departmentID_invalid',
              status: 400,
            })
          }

          dataUpdate.department = departmentID
        }

        if (otherID) {
          if (!checkObjectIDs([otherID])) {
            return resolve({
              error: true,
              message: 'Tham số otherID không hợp lệ',
              keyError: 'params_otherID_invalid',
              status: 400,
            })
          }

          dataUpdate.other = otherID
        }

        if (background) {
          if (!checkObjectIDs([background])) {
            return resolve({
              error: true,
              message: 'Tham số background không hợp lệ',
              keyError: 'params_background_invalid',
              status: 400,
            })
          }

          const infoFileCore = await ctx.call(
            `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
            {
              fileID: background,
            }
          )

          if (!infoFileCore.error) {
            const {
              app,
              company,
              name,
              nameOrg,
              description,
              status,
              path,
              size,
              mimeType,
              type,
              author,
            } = infoFileCore.data

            const infoAfterInserted = await MEDIA__FILE_COLL.create({
              media: mediaID,
              file: fileID,
              app,
              company,
              name,
              nameOrg,
              path,
              size,
              mimeType,
              description,
              status,
              type,
              author,
            })

            if (infoAfterInserted && infoMedia.background) {
              await MEDIA__FILE_COLL.findByIdAndDelete(infoMedia.background)
            }

            dataUpdate.background = infoAfterInserted._id
          }
        }

        if (files && files.length) {
          if (!checkObjectIDs(files)) {
            return resolve({
              error: true,
              message: 'Tham số files không hợp lệ',
              keyError: 'params_files_invalid',
              status: 400,
            })
          }

          let newFiles = []
          let oldFiles = []
          if (infoMedia.files && infoMedia.files.length) {
            const listFilesOld = infoMedia.files.map((fileID) =>
              fileID.toString()
            )

            files.map((fileID) => {
              if (!listFilesOld.includes(fileID)) {
                newFiles[newFiles.length] = ObjectID(fileID)
              } else {
                oldFiles[oldFiles.length] = ObjectID(fileID)
              }
            })
          } else {
            newFiles = files
          }

          let { results, errors } = await PromisePool.for(newFiles)
            .withConcurrency(2)
            .process(async (fileID) => {
              const infoFileCore = await ctx.call(
                `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
                {
                  fileID: fileID.toString(),
                }
              )

              if (!infoFileCore.error) {
                const {
                  app,
                  company,
                  name,
                  nameOrg,
                  description,
                  status,
                  path,
                  size,
                  mimeType,
                  type,
                  author,
                } = infoFileCore.data

                const infoAfterInserted = await MEDIA__FILE_COLL.create({
                  media: mediaID,
                  file: fileID,
                  app,
                  company,
                  name,
                  nameOrg,
                  path,
                  size,
                  mimeType,
                  description,
                  status,
                  type,
                  author,
                })
                return infoAfterInserted._id
              }
            })

          if (results.length && !errors.length) {
            results = results.filter(Boolean)
            dataUpdate.files = [...oldFiles, ...results]
          } else {
            dataUpdate.files = oldFiles
          }
        } else {
          dataUpdate.files = []
        }

        if (images && images.length) {
          if (!checkObjectIDs(images)) {
            return resolve({
              error: true,
              message: 'Tham số images không hợp lệ',
              keyError: 'params_images_invalid',
              status: 400,
            })
          }

          let newFiles = []
          let oldFiles = []
          if (infoMedia.images && infoMedia.images.length) {
            const listImagesOld = infoMedia.images.map((fileID) =>
              fileID.toString()
            )

            images.map((fileID) => {
              if (!listImagesOld.includes(fileID)) {
                newFiles[newFiles.length] = ObjectID(fileID)
              } else {
                oldFiles[oldFiles.length] = ObjectID(fileID)
              }
            })
          } else {
            newFiles = images
          }

          let { results, errors } = await PromisePool.for(newFiles)
            .withConcurrency(2)
            .process(async (fileID) => {
              const infoFileCore = await ctx.call(
                `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
                {
                  fileID: fileID.toString(),
                }
              )

              if (!infoFileCore.error) {
                const {
                  app,
                  company,
                  name,
                  nameOrg,
                  description,
                  status,
                  path,
                  size,
                  mimeType,
                  type,
                  author,
                } = infoFileCore.data

                const infoAfterInserted = await MEDIA__FILE_COLL.create({
                  media: mediaID,
                  file: fileID,
                  app,
                  company,
                  name,
                  nameOrg,
                  path,
                  size,
                  mimeType,
                  description,
                  status,
                  type,
                  author,
                })
                return infoAfterInserted._id
              }
            })

          if (results.length && !errors.length) {
            results = results.filter(Boolean)
            dataUpdate.images = [...oldFiles, ...results]
          } else {
            dataUpdate.images = oldFiles
          }
        } else {
          dataUpdate.images = []
        }

        let infoAfterUpdate = await MEDIA_COLL.findByIdAndUpdate(
          mediaID,
          dataUpdate,
          { new: true }
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
   * Func: XÓA BÀI VIẾT
   * Updated: 24/02/2022
   */
  deleteMedia({ mediaID, authorID }) {
    return new Promise(async (resolve) => {
      try {
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

        let infoMediaAfterDelete = await MEDIA_COLL.findOneAndDelete({
          _id: mediaID,
          author: authorID,
        })

        if (!infoMediaAfterDelete) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurs',
            status: 422,
          })
        }

        return resolve({
          error: false,
          status: 200,
          data: infoMediaAfterDelete,
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
   * Func: THÔNG TIN BÀI VIẾT
   * Updated: 24/02/2022
   */
  getInfoMedia({ mediaID, authorID, companyID, select, populates, ctx }) {
    return new Promise(async (resolve) => {
      try {
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

        let infoMedia = await MEDIA_COLL.findById(mediaID)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoMedia) {
          return resolve({
            error: true,
            message: 'Bài viết không tồn tại',
            keyError: 'media_not_exists',
            status: 400,
          })
        }

        let hasPermission = true

        switch (infoMedia.type) {
          case 1:
            if (
              typeof infoMedia.company === 'string' &&
              infoMedia.company?.toString() !== companyID?.toString()
            ) {
              hasPermission = false
            } else if (
              infoMedia.company?._id?.toString() !== companyID?.toString()
            ) {
              hasPermission = false
            }
            break
          case 2:
            let departmentID = ''

            if (typeof infoMedia.department === 'string') {
              departmentID = infoMedia.department
            } else {
              departmentID = infoMedia.department?._id
            }

            const infoProject = await ctx.call(
              `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
              {
                departmentID: departmentID.toString(),
              }
            )
            if (!infoProject.error && infoProject.status === 200) {
              const membersID = infoProject.data?.members.map((item) =>
                item.toString()
              )

              if (!membersID.includes(authorID.toString())) {
                hasPermission = false
              }
            }
            break
          case 5:
            if (
              typeof infoMedia.author === 'string' &&
              infoMedia.author?.toString() !== authorID.toString()
            ) {
              hasPermission = false
            } else if (
              infoMedia.author?._id?.toString() !== authorID.toString()
            ) {
              hasPermission = false
            }
            break
          default:
            break
        }

        if (!hasPermission) {
          return resolve({
            error: true,
            message: 'Bạn không có quyền truy cập bài viết này',
            keyError: KEY_ERROR.PERMISSION_DENIED,
            status: 400,
          })
        }

        const infoReaction = await MEDIA__REACIONT_COLL.findOne({
          media: mediaID,
          author: authorID,
        })
          .select('type')
          .lean()

        infoMedia.reaction = infoReaction

        return resolve({
          error: false,
          status: 200,
          data: infoMedia,
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
   * Func: CẬP NHẬT LƯỢT XEM BÀI VIẾT
   * Updated: 24/02/2022
   */
  updateView({ mediaID, authorID }) {
    return new Promise(async (resolve) => {
      try {
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

        let infoMedia = await MEDIA_COLL.findById(mediaID).lean()

        if (!infoMedia) {
          return resolve({
            error: true,
            message: 'Bài viết không tồn tại',
            keyError: 'media_not_exists',
            status: 400,
          })
        }

        // Cập nhật số lượng view
        await MEDIA_COLL.findByIdAndUpdate(mediaID, {
          $inc: {
            amountView: 1,
          },
        })

        // Tạo người xem mới nếu chưa tồn tại
        await MEDIA__SEEN_COLL.updateOne(
          {
            media: mediaID,
            author: authorID,
          },
          {
            $set: {
              media: mediaID,
              author: authorID,
            },
          },
          { upsert: true }
        )

        return resolve({
          error: false,
          status: 200,
          message: 'success',
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
   * Func: LẤY DANH SÁCH NGƯỜI XEM BÀI VIẾT
   */
  getListUsersSeen({
    authorID,
    mediaID,
    lastestID,
    limit = 15,
    select,
    populates,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let conditionObj = { media: mediaID }
        let keys = ['_id__-1', 'createAt__-1']
        let sortBy = {}
        let nextCursor = null

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

        if (limit > 20 || isNaN(limit)) {
          limit = 20
        } else {
          limit = +limit
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

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await MEDIA__SEEN_COLL.findById(lastestID)
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

        let infoDataAfterGet = await MEDIA__SEEN_COLL.find(conditionObj)
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

        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await MEDIA__SEEN_COLL.count(conditionObjOrg)

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
          error: error.message,
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: LẤY DANH SÁCH BÀI VIẾT
   * Updated: 24/02/2022
   */
  getListMedia({
    authorID,
    lastestID,
    companyID,
    departmentID,
    otherID,
    mediaID,
    keyword,
    isRelated,
    type,
    limit = 20,
    select,
    populates,
  }) {
    return new Promise(async (resolve) => {
      try {
        //=======================VARIABLE/CONSTANTS===================
        let conditionObj = {}
        let nextCursor = null
        let keys = ['modifyAt__-1', 'createAt__-1']
        let sortBy = {
          modifyAt: -1,
          createAt: -1,
        }

        if (isNaN(limit) || +limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        //=======================VALIDATION===========================
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

        if (!checkObjectIDs([authorID])) {
          return resolve({
            error: true,
            message: 'Tham số authorID không hợp lệ',
            keyError: 'params_authorID_invalid',
            status: 400,
          })
        }

        if (companyID) {
          if (!checkObjectIDs([companyID])) {
            return resolve({
              error: true,
              message: 'Tham số companyID không hợp lệ',
              keyError: 'params_companyID_invalid',
              status: 400,
            })
          }

          conditionObj.company = companyID
        }

        if (departmentID) {
          if (!checkObjectIDs([departmentID])) {
            return resolve({
              error: true,
              message: 'Tham số departmentID không hợp lệ',
              keyError: 'params_departmentID_invalid',
              status: 400,
            })
          }

          conditionObj.department = departmentID
        }

        if (otherID) {
          if (!checkObjectIDs([otherID])) {
            return resolve({
              error: true,
              message: 'Tham số otherID không hợp lệ',
              keyError: 'params_otherID_invalid',
              status: 400,
            })
          }

          conditionObj.other = otherID
        }

        // let infoUser = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
        // 	authorID: authorID,
        // 	select: "company fullname friends",
        // });

        switch (type) {
          case 'company':
            conditionObj.type = 1
            break
          case 'department':
            conditionObj.type = 2
            break
          case 'digital-conversion':
            conditionObj.type = 3
            break
          case 'system':
            conditionObj.type = 4
            break
          case 'just-me':
            conditionObj.type = 5
            conditionObj.author = authorID
            break
          case 'internal-company':
            conditionObj.type = { $in: [1, 2] }
            break
          default:
            break
        }

        if (isRelated) {
          const infoMedia = await MEDIA_COLL.findById(mediaID)
            .select('type')
            .lean()

          if (infoMedia) {
            conditionObj._id = { $nin: [mediaID] }
            conditionObj.type = infoMedia.type
          }
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          conditionObj.title = new RegExp(keyword, 'i')
        }

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await MEDIA_COLL.findById(lastestID)
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

        const listDataAfterGet = await MEDIA_COLL.find(conditionObj)
          .limit(limit + 1)
          .sort(sortBy)
          .select(select)
          .populate(populates)
          .lean()

        if (!listDataAfterGet) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurs',
            status: 422,
          })
        }

        if (listDataAfterGet && listDataAfterGet.length) {
          if (listDataAfterGet.length > limit) {
            nextCursor = listDataAfterGet[limit - 1]._id
            listDataAfterGet.length = limit
          }
        }

        const totalRecord = await MEDIA_COLL.count(conditionObjOrg)

        return resolve({
          error: false,
          data: {
            listRecords: listDataAfterGet,
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

  /**
   * Dev: MinhVH
   * Func: LẤY DANH SÁCH LƯU BÀI VIẾT
   * Date: 24/02/2022
   */
  getListSaveMedia({ authorID, lastestID, limit = 20, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let conditionObj = { author: authorID }
        let keys = ['_id__-1', 'createAt__-1']
        let sortBy = {}
        let nextCursor = null

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([authorID])) {
          return resolve({
            error: true,
            message: 'Tham số authorID không hợp lệ',
            keyError: 'params_authorID_invalid',
            status: 400,
          })
        }

        if (limit > 20 || isNaN(limit)) {
          limit = 20
        } else {
          limit = +limit
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

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await MEDIA__SAVE_COLL.findById(lastestID)
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

        let infoDataAfterGet = await MEDIA__SAVE_COLL.find(conditionObj)
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

        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await MEDIA__SAVE_COLL.count(conditionObjOrg)

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
          error: error.message,
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: LƯU BÀI VIẾT
   * Date: 24/02/2022
   */
  saveMedia({ authorID, mediaID, isSave }) {
    return new Promise(async (resolve) => {
      try {
        //=======================VARIABLE/CONSTANTS=====================
        let infoMediaAfterInserted = null
        let conditionObj = {
          media: mediaID,
          author: authorID,
        }

        //=========================VALIDATION==========================
        if (!checkObjectIDs([authorID])) {
          return resolve({
            error: true,
            message: 'Tham số authorID không hợp lệ',
            keyError: 'params_authorID_invalid',
            status: 400,
          })
        }

        if (!checkObjectIDs([mediaID])) {
          return resolve({
            error: true,
            message: 'Tham số mediaID không hợp lệ',
            keyError: 'params_mediaID_invalid',
            status: 400,
          })
        }

        let checkExisted = await MEDIA_COLL.findById(mediaID)
        if (!checkExisted) {
          return resolve({
            error: true,
            message: 'Bài viết không tồn tại',
            keyError: 'media_not_exists',
            status: 400,
          })
        }

        if (isSave) {
          // Tạo lưu bài viết nếu chưa tồn tại
          infoMediaAfterInserted = await MEDIA__SAVE_COLL.findOneAndUpdate(
            conditionObj,
            {
              $set: {
                modifyAt: new Date(),
              },
              $setOnInsert: {
                ...conditionObj,
                createAt: new Date(),
              },
            },
            { new: true, upsert: true }
          )
        } else {
          infoMediaAfterInserted =
            await MEDIA__SAVE_COLL.findOneAndDelete(conditionObj)
        }

        if (!infoMediaAfterInserted) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        return resolve({
          error: false,
          data: infoMediaAfterInserted,
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
   * Func: LẤY DANH SÁCH BÀI VIẾT ĐÃ GHIM
   * Date: 24/02/2022
   */
  getListPinMedia({ authorID, limit = 20, lastestID, select, populates, ctx }) {
    return new Promise(async (resolve) => {
      try {
        let listMediaPin = await ctx.call(
          `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_PIN_MEDIA}`
        )
        if (listMediaPin.error || !listMediaPin.data?.length)
          return resolve(listMediaPin)

        /**
         * DECALARTION VARIABLE (1)
         */
        let conditionObj = { _id: { $in: listMediaPin.data } }
        let keys = ['_id__-1', 'createAt__-1']
        let nextCursor = null
        let sortBy = {}

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([authorID])) {
          return resolve({
            error: true,
            message: 'Tham số authorID không hợp lệ',
            keyError: 'params_authorID_invalid',
            status: 400,
          })
        }

        if (limit > 20 || isNaN(limit)) {
          limit = 20
        } else {
          limit = +limit
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

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await MEDIA_COLL.findById(lastestID)
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

        let infoDataAfterGet = await MEDIA_COLL.find(conditionObj)
          .limit(limit + 1)
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

        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await MEDIA_COLL.count(conditionObjOrg)

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

  /**
   * Dev: MinhVH
   * Func: GHIM BÀI VIẾT
   * Date: 24/02/2022
   */
  pinMedia({ userID, mediaID, isPin, ctx }) {
    return new Promise(async (resolve) => {
      try {
        //=========================VALIDATION==========================
        if (!checkObjectIDs([userID])) {
          return resolve({
            error: true,
            message: 'Tham số userID không hợp lệ',
            keyError: 'params_userID_invalid',
            status: 400,
          })
        }

        if (!checkObjectIDs([mediaID])) {
          return resolve({
            error: true,
            message: 'Tham số mediaID không hợp lệ',
            keyError: 'params_mediaID_invalid',
            status: 400,
          })
        }

        const checkExisted = await MEDIA_COLL.findById(mediaID)
        if (!checkExisted) {
          return resolve({
            error: true,
            message: 'Bài viết không tồn tại',
            keyError: 'media_not_exist',
            status: 400,
          })
        }

        const infoUserAfterUpdated = await ctx.call(
          `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.UPDATE_PIN_MEDIA}`,
          {
            mediaID,
            userID,
            isPin,
          }
        )

        return resolve(infoUserAfterUpdated)
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
