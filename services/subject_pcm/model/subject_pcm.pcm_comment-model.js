'use strict'

/**
 * import external
 */
const PromisePool = require('@supercharge/promise-pool')

/**
 * import internal
 */
const BaseModel = require('../../../tools/db/base_model')
const {
  checkObjectIDs,
  IsJsonString,
  validateParamsObjectID,
} = require('../../../tools/utils/utils')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
  CF_ACTIONS_ANALYSIS,
} = require('../../analysis/helper/analysis.actions-constant')
const {
  CF_ACTIONS_NOTIFICATION,
} = require('../../notification/helper/notification.actions-constant')
const { CF_ACTIONS_FILE } = require('../../file/helper/file.actions-constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')

const { APP_KEYS, KEY_ERROR, LANGUAGE_KEYS } = require('../../../tools/keys')
const {
  ENV_DEVICE_WEB_CBS,
} = require('../../notification/helper/notification.keys-constant')
const stringUtils = require('../../../tools/utils/string_utils')

/**
 * import inter-coll, exter-coll
 */
const DEPARTMENT_COLL = require('../../item/database/item.department-coll')
const PCM_PLAN_TASK_COLL = require('../database/subject_pcm.pcm_plan_task-coll')
const PCM_COMMENT_COLL = require('../database/subject_pcm.pcm_comment-coll')
const PCM_COMMENT_REACTION_COLL = require('../database/subject_pcm.pcm_comment_reaction-coll')
const PCM_FILE_COLL = require('../database/subject_pcm.pcm_file-coll')
const PCM_FILE_MODEL = require('../model/subject_pcm.pcm_file-model').MODEL
const PCM_PLAN_TASK_MODEL = require('../model/subject_pcm.pcm_plan_task').MODEL

let dataTF = {
  appID: '5eabfdc72171391e5f6a0468', // PCM
  menuID: '623ef213e998e94feda0ccd8', //
  type: 1,
  action: 1, // Xem
}

let dataTF2 = {
  appID: '5eabfdc72171391e5f6a0468', // PCM
  menuID: '623ef213e998e94feda0ccd8', //
  type: 1,
  action: 2, // Thêm
}

class Model extends BaseModel {
  constructor() {
    super(PCM_COMMENT_COLL)

    this.COMMENT_PCM = 1
    this.RESPONSE_PCM = 2
    this.RESPONSE_CURRENT_STATUS = 3
    this.RESPONSE_SOLUTION = 4
    this.RECORD_TASK_FOR_SEARCH = 5

    this.SWITCH_TYPE = {
      TASK: 'TASK',
      PROJECT: 'PROJECT',
    }
  }

  /**
   * Dev: MinhVH
   * Func: Thêm file vào pcm_file-coll + thêm vào field photos trong project/contract nếu là ảnh
   * Date: 06/04/2022
   * Updated: 18/05/2022
   */
  handleAddFiles({
    infoTask,
    infoComment,
    infoProject,
    files,
    fileType,
    authorID,
    switchType = this.SWITCH_TYPE.TASK,
    companyOfAuthor,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        let { results, errors } = await PromisePool.for(files)
          .withConcurrency(2)
          .process(async (fileID) => {
            // File Cũ
            const infoPcmFile = await PCM_FILE_COLL.findOne({
              file: fileID,
              comment: infoComment._id,
            })
              .select('_id')
              .lean()

            if (infoPcmFile) return infoPcmFile._id

            // File mới
            const infoFileCore = await ctx.call(
              `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
              {
                fileID: fileID.toString(),
              },
              {
                meta: {
                  infoUser: { _id: authorID },
                },
              }
            )

            if (!infoFileCore.error) {
              const {
                name,
                nameOrg,
                description,
                path,
                size,
                mimeType,
                type,
                author,
              } = infoFileCore.data

              let dataInsert = {
                fileID: fileID,
                commentID: infoComment._id,
                authorID: author,
                companyOfAuthor,
                name,
                nameOrg,
                path,
                size,
                mimeType,
                description,
                type,
              }

              // Bình luận dự án
              if (switchType === this.SWITCH_TYPE.PROJECT) {
                dataInsert = {
                  ...dataInsert,
                  projectID: infoProject._id,
                  companyID: infoProject.company,
                }
              } else {
                // Bình luận công việc
                dataInsert = {
                  ...dataInsert,
                  taskID: infoTask._id,
                  contractID: infoTask.contract,
                  projectID: infoTask.project?._id,
                  groupID: infoTask.group,
                  companyID: infoTask.company,
                }
              }

              const infoAfterInserted = await PCM_FILE_MODEL.insert(dataInsert)
              return infoAfterInserted.data && infoAfterInserted.data._id
            }
          })

        if (errors.length) {
          return resolve({
            error: true,
            errors,
            message:
              'Quá trình upload file có vấn đề, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        results = results.filter(Boolean)

        // Bình luận dự án
        if (switchType === this.SWITCH_TYPE.PROJECT) {
          if (fileType === 'image') {
            await ctx.call(
              `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
              {
                departmentID: infoProject._id.toString(),
                photos: files,
              }
            )
          }

          return resolve({ error: false, data: results })
        }

        let oldFiles = []

        if (results.length) {
          oldFiles = await PCM_FILE_COLL.find({
            _id: { $nin: results },
            comment: infoComment._id,
            type: fileType === 'image' ? 1 : 2,
          })
            .select('_id')
            .lean()

          oldFiles = oldFiles.map((item) => item._id)
        }

        if (fileType === 'image') {
          infoTask.contract &&
            (await ctx.call(
              `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_UPDATE}`,
              {
                contractID: infoTask.contract.toString(),
                photos: files,
              }
            ))

          infoTask.project &&
            (await ctx.call(
              `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
              {
                departmentID: infoTask.project?._id?.toString(),
                photos: files,
              }
            ))
        }

        return resolve({
          error: false,
          data: { results, oldFiles },
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
   * Func: Thêm comment (task)
   * Date: 22/02/2022
   */
  insertCommentTask({
    taskID,
    parentID,
    authorID,
    type,
    content,
    rawContent,
    files,
    images,
    receiversID,
    select,
    populates,
    bizfullname,
    companyOfAuthor,
    isOfficial = false,
    ctx,
  }) {
    // console.log('=======================Tạo comment Task=====================')
    // console.log({ taskID, parentID, authorID, type, content, rawContent, files, images, receiversID, select, populates, bizfullname, companyOfAuthor})
    return new Promise(async (resolve) => {
      try {
        const TYPE_COMMENT = [
          this.COMMENT_PCM,
          this.RESPONSE_PCM,
          this.RESPONSE_CURRENT_STATUS,
          this.RESPONSE_SOLUTION,
          this.RECORD_TASK_FOR_SEARCH,
        ]
        if (!TYPE_COMMENT.includes(type)) {
          return resolve({
            error: true,
            message: 'Tham số type không hợp lệ',
            keyError: 'params_type_invalid',
            status: 400,
          })
        }

        const dataInsert = {
          type,
          task: taskID,
          author: authorID,
          companyOfAuthor,
          official: isOfficial,
        }
        const dataUpdate = {}
        let dataSend = {}
        let webUrl = ''
        let titleMSS = ''
        let descriptionMSS = ''
        let languageKey = ''

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

        let infoTask = await PCM_PLAN_TASK_COLL.findById(taskID)
          .populate('project group', '_id name sign contract')
          .populate('author', '_id bizfullname image')
          .lean()

        if (!infoTask) {
          return resolve({
            error: true,
            message: 'Công việc không tồn tại',
            keyError: 'task_not_exists',
            status: 400,
          })
        }

        dataInsert.subType = infoTask.subtype

        if (infoTask.project) {
          dataInsert.project = infoTask.project?._id
        }

        if (infoTask.contract) {
          dataInsert.contract = infoTask.contract
        } else {
          dataInsert.contract = infoTask.group?.contract
        }

        if (infoTask.group) {
          dataInsert.group = infoTask.group._id
        }

        /**
         * Users nhận thông báo
         */
        if (checkObjectIDs(receiversID)) {
          // console.log('=================1111111111111111=================')
          dataInsert.receivers = receiversID
        } else {
          // console.log('=================2222222222222222=================')
          if (!checkObjectIDs([parentID])) {
            // console.log('=================333333333333333333=================')
            const receivers = infoTask.accessUsers?.filter(
              (user) => user.toString() !== authorID.toString()
            )
            dataInsert.receivers = receivers
          } else {
            // console.log('=================444444444444444444=================')
            const commentParent = await PCM_COMMENT_COLL.findById(parentID)
              .select('author receivers')
              .lean()
            dataInsert.receivers = commentParent?.receivers
          }
        }

        /**
         *  Users được quyền truy cập
         */
        dataInsert.accessUsers = infoTask.accessUsers

        if (content) {
          dataInsert.content = content
          dataInsert.contentcv = stringUtils.removeAccents(rawContent)
        }

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

        // Cập nhật lại thay đổi mới nhất cho Dự án
        await DEPARTMENT_COLL.findByIdAndUpdate(infoTask.project?._id, {
          modifyAt: new Date(),
        })

        /**
         * XỬ LÝ FILE VÀ ẢNH ĐÍNH KÈM
         */
        if (files && files.length) {
          // console.log('================111111111111111111111111111111==============')
          // console.log(files)
          const { errors } = await PromisePool.for(files)
            .withConcurrency(2)
            .process(async (fileID) => {
              // console.log({fileID})
              const infoFileCore = await ctx.call(
                `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
                {
                  fileID: fileID,
                },
                {
                  meta: {
                    infoUser: { _id: authorID },
                  },
                }
              )
              // console.log({infoFileCore})
              // console.log('================22222222222222222222222222==============')

              if (!infoFileCore.error) {
                const {
                  name,
                  nameOrg,
                  description,
                  path,
                  size,
                  mimeType,
                  type,
                  author,
                } = infoFileCore.data

                const infoAfterInserted = await PCM_FILE_MODEL.insert({
                  fileID,
                  taskID,
                  commentID: infoAfterInsert._id,
                  contractID: infoTask.contract,
                  projectID: infoTask.project?._id,
                  groupID: infoTask.group,
                  companyID: infoTask.company,
                  authorID: author,
                  name,
                  nameOrg,
                  path,
                  size,
                  mimeType,
                  description,
                  type,
                })
                // console.log('================33333333333333333333==============')
                // console.log({infoAfterInserted})

                return infoAfterInserted.data && infoAfterInserted.data._id
              }
            })

          if (errors.length) {
            return resolve({
              error: true,
              errors,
              message:
                'Quá trình upload file có vấn đề, chúng tôi đang tìm cách khắc phục',
              keyError: 'error_occurred',
              status: 422,
            })
          }

          dataUpdate.files = files
        }

        if (images && images.length) {
          const { errors } = await PromisePool.for(images)
            .withConcurrency(2)
            .process(async (imageID) => {
              const infoFileCore = await ctx.call(
                `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
                {
                  fileID: imageID,
                },
                {
                  meta: {
                    infoUser: { _id: authorID },
                  },
                }
              )

              if (!infoFileCore.error) {
                const {
                  name,
                  nameOrg,
                  description,
                  path,
                  size,
                  mimeType,
                  type,
                  author,
                } = infoFileCore.data

                const infoAfterInserted = await PCM_FILE_MODEL.insert({
                  fileID: imageID,
                  taskID,
                  commentID: infoAfterInsert._id,
                  contractID: infoTask.contract,
                  projectID: infoTask.project?._id,
                  groupID: infoTask.group,
                  companyID: infoTask.company,
                  authorID: author,
                  name,
                  nameOrg,
                  path,
                  size,
                  mimeType,
                  description,
                  type,
                })

                return infoAfterInserted.data && infoAfterInserted.data._id
              }
            })

          if (errors.length) {
            return resolve({
              error: true,
              errors,
              message:
                'Quá trình upload file có vấn đề, chúng tôi đang tìm cách khắc phục',
              keyError: 'error_occurred',
              status: 422,
            })
          }

          if (infoTask.contract) {
            await ctx.call(
              `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_UPDATE}`,
              {
                contractID: infoTask.contract.toString(),
                photos: images,
              }
            )
          }

          await ctx.call(
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
            {
              departmentID: infoTask.project?._id?.toString(),
              photos: images,
            }
          )

          dataUpdate.images = images
        }

        // Cập nhật lastestReplyID và amountCommentReply cho comment cha
        if (parentID) {
          await PCM_COMMENT_COLL.findByIdAndUpdate(parentID, {
            $set: {
              lastestReplyID: infoAfterInsert._id,
            },
            $inc: {
              amountCommentReply: 1,
            },
          })
        }

        // Cập nhật lại cho comment
        if (Object.keys(dataUpdate).length) {
          const infoAfterUpdate = await PCM_COMMENT_COLL.findByIdAndUpdate(
            infoAfterInsert._id,
            {
              $set: dataUpdate,
            }
          )

          if (!infoAfterUpdate) {
            return resolve({
              error: true,
              message:
                'Quá trình upload file có vấn đề, chúng tôi đang tìm cách khắc phục',
              keyError: 'error_occurred',
              status: 422,
            })
          }
        }

        // Update task of response comment
        const usersUnRead = dataInsert.receivers?.filter(
          (item) => item.toString() !== authorID.toString()
        )

        let incPreCalculate = {}

        switch (type) {
          case 1:
            incPreCalculate = { amountResponse: 1 }
            break
          case 3:
            incPreCalculate = { amountCurrentStatus: 1 }
            break
          case 4:
            incPreCalculate = { amountSolution: 1 }
            break
          case 5:
          case 6:
            incPreCalculate = { amountResponseOther: 1 }
            break
        }

        // CẬP NHẬT LẠI CHO TASK
        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, {
          $inc: {
            ...incPreCalculate,
            amountMarkedResponse: isOfficial ? 1 : 0,
          },
          $addToSet: {
            news: usersUnRead,
          },
          $set: {
            lastComment: infoAfterInsert._id,
            modifyAt: new Date(),
          },
        })

        // Loại comment được tạo mục đích cho việc tìm kiếm
        if (type === this.RECORD_TASK_FOR_SEARCH) {
          return resolve({
            error: false,
            data: infoAfterInsert,
            status: 200,
          })
        }

        /**
         * BẮN CLOUD MSSS
         */
        let { name: taskName, sign: taskSign, author, project } = infoTask
        let arrReceiver = dataInsert.receivers

        switch (infoAfterInsert.type) {
          case 1:
            languageKey = LANGUAGE_KEYS.CREATE_COMMENT_PCM
            descriptionMSS = `${bizfullname} đã tạo 1 phản hồi`
            webUrl = `/pcm/detail/${taskID}#comment_${infoAfterInsert._id}`
            break
          default:
            break
        }

        dataSend = {
          app: APP_KEYS.PCM_PLAN_TASK,
          languageKey,
          mainColl: {
            kind: 'pcm_plan_task',
            item: {
              _id: taskID,
              name: taskName,
              project: {
                sign: project?.sign,
              },
              author: {
                _id: author?._id,
                bizfullname: author?.bizfullname,
                image: author?.image,
              },
            },
          },
          subColl: {
            kind: 'pcm_comment',
            item: {
              _id: infoAfterInsert._id,
            },
          },
        }

        if (taskSign) {
          titleMSS = `${taskSign}.${taskName}`
        } else {
          titleMSS = `${taskName}`
        }

        /**
         * BẮN THÔNG BÁO REALTIME MOBILE
         */
        if (arrReceiver && arrReceiver.length) {
          const sendNotiAsync = arrReceiver.map(async (receiverId) => {
            const amountNoti = await PCM_PLAN_TASK_MODEL.getAmountNotification({
              userID: receiverId,
            })
            // console.log({note: amountNoti?.data?.amountUnreadTask})

            // App Trixgo
            ctx.emit('NOTIFICATION__LOG_CREATE:MOBILE_WEB', {
              users: [receiverId],
              title: titleMSS,
              description: descriptionMSS,
              amountNoti: amountNoti?.data?.amountUnreadTask,
              dataSend,
              web_url: webUrl,
              env: ENV_DEVICE_WEB_CBS,
            })
          })
          await Promise.all(sendNotiAsync)
        }

        infoAfterInsert = await PCM_COMMENT_COLL.findById(infoAfterInsert._id)
          .select(select)
          .populate(populates)
          .lean()

        // Cung cấp về cho Mobile
        infoAfterInsert.receiversNoti = arrReceiver

        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF2)

        return resolve({
          error: false,
          data: infoAfterInsert,
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
   * Func: Thêm comment (project)
   * Date: 18/05/2022
   */
  insertCommentProject({
    projectID,
    authorID,
    content,
    files,
    images,
    select,
    populates,
    bizfullname,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        const dataInsert = {
          type: 2,
          project: projectID,
          author: authorID,
        }
        const dataUpdate = {}
        let dataSend = {}
        let webUrl = ''
        let titleMSS = ''
        let descriptionMSS = ''
        let languageKey = ''

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([projectID])) {
          return resolve({
            error: true,
            message: 'Tham số projectID không hợp lệ',
            keyError: 'params_projectID_invalid',
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

        const infoProject = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
          {
            departmentID: projectID,
            select: '_id name sign company members userCreate',
            populates: JSON.stringify({
              path: 'userCreate',
              select: '_id bizfullname image',
            }),
          }
        )

        if (!infoProject || infoProject.error) {
          return resolve({
            error: true,
            message: 'Không tìm thấy dự án',
            keyError: 'project_not_exists',
            status: 400,
          })
        }

        if (content) {
          dataInsert.content = content
        }

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

        if (files && files.length) {
          const { errors } = await PromisePool.for(files)
            .withConcurrency(2)
            .process(async (fileID) => {
              const infoFileCore = await ctx.call(
                `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
                {
                  fileID: fileID,
                },
                {
                  meta: {
                    infoUser: { _id: authorID },
                  },
                }
              )

              if (!infoFileCore.error) {
                const {
                  name,
                  nameOrg,
                  description,
                  path,
                  size,
                  mimeType,
                  type,
                  author,
                } = infoFileCore.data

                const infoAfterInserted = await PCM_FILE_MODEL.insert({
                  fileID,
                  projectID,
                  commentID: infoAfterInsert._id,
                  companyID: infoProject?.data?.company,
                  authorID: author,
                  name,
                  nameOrg,
                  path,
                  size,
                  mimeType,
                  description,
                  type,
                })

                return infoAfterInserted.data && infoAfterInserted.data._id
              }
            })

          if (errors.length) {
            return resolve({
              error: true,
              errors,
              message:
                'Quá trình upload file có vấn đề, chúng tôi đang tìm cách khắc phục',
              keyError: 'error_occurred',
              status: 422,
            })
          }

          dataUpdate.files = files
        }

        if (images && images.length) {
          const { errors } = await PromisePool.for(images)
            .withConcurrency(2)
            .process(async (imageID) => {
              const infoFileCore = await ctx.call(
                `${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`,
                {
                  fileID: imageID,
                },
                {
                  meta: {
                    infoUser: { _id: authorID },
                  },
                }
              )

              if (!infoFileCore.error) {
                const {
                  name,
                  nameOrg,
                  description,
                  path,
                  size,
                  mimeType,
                  type,
                  author,
                } = infoFileCore.data

                const infoAfterInserted = await PCM_FILE_MODEL.insert({
                  fileID: imageID,
                  projectID,
                  commentID: infoAfterInsert._id,
                  companyID: infoProject?.data?.company,
                  authorID: author,
                  name,
                  nameOrg,
                  path,
                  size,
                  mimeType,
                  description,
                  type,
                })

                return infoAfterInserted.data && infoAfterInserted.data._id
              }
            })

          if (errors.length) {
            return resolve({
              error: true,
              errors,
              message:
                'Quá trình upload file có vấn đề, chúng tôi đang tìm cách khắc phục',
              keyError: 'error_occurred',
              status: 422,
            })
          }

          await ctx.call(
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
            {
              departmentID: projectID,
              photos: images,
            }
          )

          dataUpdate.images = images
        }

        // Cập nhật lại cho comment
        if (Object.keys(dataUpdate).length) {
          const infoAfterUpdate = await PCM_COMMENT_COLL.findByIdAndUpdate(
            infoAfterInsert._id,
            {
              $set: dataUpdate,
            }
          )

          if (!infoAfterUpdate) {
            return resolve({
              error: true,
              message:
                'Quá trình upload file có vấn đề, chúng tôi đang tìm cách khắc phục',
              keyError: 'error_occurred',
              status: 422,
            })
          }
        }

        /**
         * Insert notification and cloud messaging
         */

        let {
          name: projectName,
          sign: projectSign,
          members,
          userCreate,
        } = infoProject.data

        let listReceivers = [...new Set(members)]
        let arrReceiver = listReceivers.filter(
          (receiverID) => receiverID !== authorID.toString()
        )

        languageKey = LANGUAGE_KEYS.CREATE_RESPONSE_PCM
        descriptionMSS = `${bizfullname} đã tạo 1 bình luận trong dự án`
        webUrl = `/pcm/project/${projectID}/responses#response_${infoAfterInsert._id}`

        dataSend = {
          app: APP_KEYS.PCM_PLAN_TASK,
          languageKey,
          mainColl: {
            kind: 'department',
            item: {
              _id: projectID,
              name: projectName,
              author: {
                _id: userCreate?._id,
                bizfullname: userCreate?.bizfullname,
                image: userCreate?.image,
              },
            },
          },
          subColl: {
            kind: 'pcm_comment',
            item: {
              _id: infoAfterInsert._id,
            },
          },
        }

        if (projectSign) {
          titleMSS = `${projectSign}.${projectName}`
        } else {
          titleMSS = `${projectName}`
        }

        if (arrReceiver && arrReceiver.length) {
          const amountNoti = await PCM_PLAN_TASK_MODEL.getAmountNotification({
            userID: authorID,
          })

          ctx.emit('NOTIFICATION__LOG_CREATE:MOBILE_WEB', {
            users: arrReceiver,
            title: titleMSS,
            description: descriptionMSS,
            amountNoti: amountNoti?.data?.amountUnreadTask,
            dataSend,
            web_url: webUrl,
            env: ENV_DEVICE_WEB_CBS,
          })

          ctx.call(
            `${CF_DOMAIN_SERVICES.NOTIFICATION}.${CF_ACTIONS_NOTIFICATION.INSERT_NOTIFICATION}`,
            {
              content,
              receivers: arrReceiver,
              project: projectID,
              path: webUrl,
              languageKey: dataSend.languageKey,
              app: APP_KEYS.PCM_PLAN_TASK,
              mainColl: {
                kind: 'department',
                item: projectID,
              },
              subColl: {
                kind: 'pcm_comment',
                item: infoAfterInsert._id,
              },
              type: 1, // InApp (Socket)
            }
          )
        }

        infoAfterInsert = await PCM_COMMENT_COLL.findById(infoAfterInsert._id)
          .select(select)
          .populate(populates)
          .lean()

        infoAfterInsert.receivers = arrReceiver

        return resolve({
          error: false,
          data: infoAfterInsert,
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
   * Func: Thêm comment (middle)
   * Date: 18/05/2022
   */
  insert({
    taskID,
    projectID,
    parentID,
    authorID,
    type,
    content,
    rawContent,
    files,
    images,
    receiversID,
    select,
    populates,
    bizfullname,
    isOfficial,
    companyOfAuthor,
    switchType = this.SWITCH_TYPE.TASK,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      switch (switchType) {
        // Tạo comment cho Task
        case this.SWITCH_TYPE.TASK:
          resolve(
            await this.insertCommentTask({
              taskID,
              parentID,
              authorID,
              type,
              content,
              rawContent,
              files,
              images,
              receiversID,
              select,
              populates,
              bizfullname,
              isOfficial,
              companyOfAuthor,
              ctx,
            })
          )
          break

        // Tạo comment cho Project
        case this.SWITCH_TYPE.PROJECT:
          resolve(
            await this.insertCommentProject({
              projectID,
              authorID,
              content,
              files,
              images,
              select,
              populates,
              bizfullname,
              ctx,
            })
          )
          break
        default:
          break
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Cập nhật comment (task)
   * Date: 22/02/2022
   */
  updateCommentTask({
    taskID,
    commentID,
    authorID,
    content,
    files,
    images,
    isOfficial,
    select,
    populates,
    companyOfAuthor,
    bizfullname,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let dataUpdate = {}
        let dataAdditional = {}
        let filesRemove = []

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

        let infoComment = await PCM_COMMENT_COLL.findOne({
          _id: commentID,
          task: taskID,
        }).lean()

        if (!infoComment) {
          return resolve({
            error: true,
            message:
              'Comment không tồn tại hoặc comment không thuộc task hiện tại',
            keyError: 'comment_not_exists_or_comment_not_belong_task',
            status: 400,
          })
        }

        let infoTask = await PCM_PLAN_TASK_COLL.findById(taskID)
          .populate('project', '_id name sign')
          .populate('author', '_id bizfullname image')
          .populate('assignee', '_id bizfullname image')
          .lean()

        if (!infoTask) {
          return resolve({
            error: true,
            message: 'Công việc không tồn tại',
            keyError: 'task_not_exists',
            status: 400,
          })
        }

        // Chỉ cập nhật "chính thức" và thêm file (không cập nhật content)
        // if(infoComment.type === 1) {
        //     content && (dataUpdate.content = content);

        //     const expireTime = new Date(infoComment.createAt).addHours(1);
        //     const now 		 = new Date(Date.now());

        //     if(expireTime < now){
        //         return resolve({
        //             error: true,
        //             message: "Bình luận đã hết hạn cập nhật (1 tiếng)",
        //             keyError: "time_to_delete_comment_has_expired",
        //             status: 403
        //         })
        //     }
        // }

        if (isOfficial) {
          dataUpdate.official = true
        }

        let infoAfterUpdate = await PCM_COMMENT_COLL.findOneAndUpdate(
          {
            _id: commentID,
            author: authorID,
          },
          {
            $set: dataUpdate,
          }
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

        if (isOfficial) {
          await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, {
            $inc: { amountMarkedResponse: 1 },
          })
        }

        // Cập nhật bổ sung
        // Gộp comment và response thành 1 (type === 1)
        switch (infoComment.type) {
          case 2: {
            // Bình luận
            dataAdditional = {
              $set: {},
            }

            // Xử lý update/remove file
            if (checkObjectIDs(files)) {
              const result = await this.handleAddFiles({
                infoTask,
                infoComment,
                files,
                fileType: 'file',
                authorID,
                ctx,
              })

              if (result.error) return resolve(result)

              filesRemove = result.data?.oldFiles
              dataAdditional.$set['files'] = files
            } else {
              await PCM_FILE_COLL.deleteMany({
                comment: infoComment._id,
                type: 2,
              })
              dataAdditional.$set['files'] = []
            }

            // Xử lý update/remove hình ảnh
            if (checkObjectIDs(images)) {
              const result = await this.handleAddFiles({
                infoTask,
                infoComment,
                files: images,
                fileType: 'image',
                authorID,
                ctx,
              })

              if (result.error) return resolve(result)

              filesRemove = [...filesRemove, ...result.data?.oldFiles]
              dataAdditional.$set['images'] = images
            } else {
              await PCM_FILE_COLL.deleteMany({
                comment: infoComment._id,
                type: 1,
              })
              dataAdditional.$set['images'] = []
            }
            break
          }
          case 1: {
            // Phản hồi liên quan (Hiện tại chỉ dùng case này)
            dataAdditional = {
              $addToSet: {},
            }

            if (checkObjectIDs(files)) {
              const result = await this.handleAddFiles({
                infoTask,
                infoComment,
                files,
                fileType: 'file',
                authorID,
                companyOfAuthor,
                ctx,
              })

              if (result.error) return resolve(result)
              dataAdditional.$addToSet['files'] = files
            }

            if (checkObjectIDs(images)) {
              const result = await this.handleAddFiles({
                infoTask,
                infoComment,
                files: images,
                fileType: 'image',
                authorID,
                companyOfAuthor,
                ctx,
              })

              if (result.error) return resolve(result)
              dataAdditional.$addToSet['images'] = images
            }
            break
          }
          default:
            break
        }

        if (Object.keys(dataAdditional).length) {
          await PCM_COMMENT_COLL.findOneAndUpdate(
            {
              _id: commentID,
              author: authorID,
            },
            dataAdditional
          )
        }

        let {
          name: taskName,
          author,
          assignee,
          related,
          accessUsers,
        } = infoTask
        let arrReceiver = []
        let description = ''

        if (accessUsers && accessUsers.length) {
          arrReceiver = accessUsers.filter(
            (receiverID) => receiverID !== authorID.toString()
          )
        } else {
          related = related.map((userID) => userID.toString())

          let listReceivers = [
            ...new Set([
              author._id?.toString(),
              assignee._id?.toString(),
              ...related,
            ]),
          ]
          arrReceiver = listReceivers.filter(
            (receiverID) => receiverID !== authorID.toString()
          )
        }

        if (arrReceiver && arrReceiver.length) {
          // CLOUD MSS
          const dataSend = {
            app: APP_KEYS.PCM_PLAN_TASK,
            languageKey: LANGUAGE_KEYS.ADD_FILE_TO_RESPONSE,
            mainColl: {
              kind: 'pcm_plan_task',
              item: { _id: taskID },
            },
            subColl: {
              kind: 'pcm_comment',
              item: { _id: commentID },
            },
          }

          if (authorID.toString() === assignee._id?.toString()) {
            description = `${assignee?.bizfullname} thêm file vào phản hồi liên quan`
          } else if (authorID.toString() === author._id?.toString()) {
            description = `${author?.bizfullname} thêm file vào phản hồi liên quan`
          } else if (related.includes(authorID)) {
            description = `Người liên quan thêm file vào phản hồi liên quan`
          }

          for (let i = 0; i < arrReceiver.length; i++) {
            const dataAmountNoti =
              await PCM_PLAN_TASK_MODEL.getAmountNotification({
                userID: arrReceiver[i],
              })
            const amountNoti = dataAmountNoti?.data?.amountUnreadTask

            ctx.emit('NOTIFICATION__LOG_CREATE:MOBILE_WEB', {
              users: [arrReceiver[i]],
              title: taskName,
              description,
              amountNoti,
              dataSend,
              web_url: `/pcm/detail/${taskID}#${'attachment'}_${commentID}`,
              env: ENV_DEVICE_WEB_CBS,
            })
          }
        }

        // Cập nhật công việc
        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, {
          $addToSet: { news: arrReceiver },
          $set: {
            modifyAt: new Date(),
          },
        })

        infoAfterUpdate = await PCM_COMMENT_COLL.findById(commentID)
          .select(select)
          .populate(populates)
          .lean()

        return resolve({
          error: false,
          data: infoAfterUpdate,
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
   * Func: Cập nhật comment (project)
   * Date: 18/05/2022
   */
  updateCommentProject({
    projectID,
    commentID,
    authorID,
    files,
    images,
    select,
    populates,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
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

        if (!checkObjectIDs([projectID])) {
          return resolve({
            error: true,
            message: 'Tham số projectID không hợp lệ',
            keyError: 'params_projectID_invalid',
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

        if (!checkObjectIDs(files) && !checkObjectIDs(images)) {
          return resolve({
            error: true,
            message: 'Tham số files hoặc images không hợp lệ',
            keyError: 'params_files_or_images_invalid',
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

        const infoComment = await PCM_COMMENT_COLL.findOne({
          _id: commentID,
          project: projectID,
          author: authorID,
        }).lean()

        if (!infoComment) {
          return resolve({
            error: true,
            message:
              'Bình luận không tồn tại (hoặc bình luận không thuộc dự án hiện tại)',
            keyError: 'comment_not_exists_or_comment_not_belong_project',
            status: 400,
          })
        }

        const infoProject = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
          {
            departmentID: projectID,
            select: '_id name sign company members userCreate',
            populates: JSON.stringify({
              path: 'userCreate',
              select: '_id bizfullname image',
            }),
          }
        )

        if (!infoProject || infoProject.error) {
          return resolve({
            error: true,
            message: 'Không tìm thấy dự án',
            keyError: 'project_not_exists',
            status: 400,
          })
        }

        const dataUpdate = {
          $addToSet: {},
          userUpdate: authorID,
        }

        if (checkObjectIDs(files)) {
          const result = await this.handleAddFiles({
            infoProject: infoProject.data,
            infoComment,
            switchType: this.SWITCH_TYPE.PROJECT,
            files,
            fileType: 'file',
            authorID,
            ctx,
          })

          if (result.error) return resolve(result)
          dataUpdate.$addToSet['files'] = files
        }

        if (checkObjectIDs(images)) {
          const result = await this.handleAddFiles({
            infoProject: infoProject.data,
            infoComment,
            switchType: this.SWITCH_TYPE.PROJECT,
            files: images,
            fileType: 'image',
            authorID,
            ctx,
          })

          if (result.error) return resolve(result)
          dataUpdate.$addToSet['images'] = images
        }

        const infoAfterUpdate = await PCM_COMMENT_COLL.findByIdAndUpdate(
          commentID,
          dataUpdate,
          { new: true }
        )
          .select(select)
          .populate(populates)
          .lean()

        if (!infoAfterUpdate) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        // infoAfterUpdate = await PCM_COMMENT_COLL
        //     .findById(commentID)
        //     .select(select)
        //     .populate(populates)
        //     .lean();

        return resolve({
          error: false,
          data: infoAfterUpdate,
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
   * Func: Cập nhật comment (middle)
   * Date: 18/05/2022
   */
  update({
    taskID,
    projectID,
    commentID,
    authorID,
    content,
    files,
    images,
    isOfficial,
    select,
    populates,
    switchType = this.SWITCH_TYPE.TASK,
    companyOfAuthor,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      switch (switchType) {
        case this.SWITCH_TYPE.TASK:
          resolve(
            await this.updateCommentTask({
              taskID,
              commentID,
              authorID,
              content,
              files,
              images,
              isOfficial,
              select,
              populates,
              companyOfAuthor,
              ctx,
            })
          )
          break
        case this.SWITCH_TYPE.PROJECT:
          resolve(
            await this.updateCommentProject({
              projectID,
              commentID,
              authorID,
              files,
              images,
              select,
              populates,
              ctx,
            })
          )
          break
        default:
          break
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Cập nhật đánh dấu response
   * Date: 22/02/2022
   */
  updateMarkResponse({ taskID, commentID, official }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([taskID, commentID])) {
          return resolve({
            error: true,
            message: 'Tham số commentID hoặc taskID không hợp lệ',
            keyError: 'params_commentID_or_taskID_invalid',
            status: 400,
          })
        }

        const infoResponse = await PCM_COMMENT_COLL.findById(commentID).lean()
        if (!infoResponse) {
          return resolve({
            error: true,
            message: 'Phản hồi không tồn tại',
            keyError: 'response_not_exists',
            status: 400,
          })
        }

        const dataUpdate = { official }
        let valueCalculate = -1

        if (official) {
          valueCalculate = 1
        }

        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, {
          $inc: {
            amountMarkedResponse: valueCalculate,
          },
        })

        const infoAfterUpdated = await PCM_COMMENT_COLL.findByIdAndUpdate(
          commentID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdated) {
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
          data: infoAfterUpdated,
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
   * Func: Xóa comment
   * Date: 22/02/2022
   */

  /**
   * Dev: MinhVH
   * Func: Thông tin comment
   * Date: 22/02/2022
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

        const infoComment = await PCM_COMMENT_COLL.findById(commentID)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoComment) {
          return resolve({
            error: true,
            message: 'Comment không tồn tại',
            keyError: KEY_ERROR.GET_INFO_FAILED,
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
   * Func: Danh sách comment
   * Date: 22/02/2022
   */
  getList({
    taskID,
    contractID,
    projectID,
    parentID,
    isHaveImage,
    type,
    official,
    limit = 10,
    lastestID,
    sortKey,
    select,
    populates,
    authorID,
    isGetReaction = 'true',
    switchType,
  }) {
    // console.log('==============GET LIST COMMENT=============')
    // console.log({
    //     taskID, contractID, projectID, parentID, isHaveImage, type, official,
    //     limit, lastestID, sortKey, select, populates, authorID, isGetReaction, switchType
    // })
    return new Promise(async (resolve) => {
      try {
        let conditionObj = { type: { $in: [1, 2] } }
        let keys = ['createAt__-1', '_id__-1']
        let sortBy = {}

        if (+limit > 20 || isNaN(limit)) {
          limit = 20
        } else {
          limit = +limit
        }

        if (sortKey && typeof sortKey === 'string') {
          if (!IsJsonString(sortKey))
            return resolve({
              error: true,
              message: 'Request params sortKey invalid',
              status: 400,
            })

          sortKey = JSON.parse(sortKey)
          keys = sortKey.keys
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

        //______Lấy phản hồi chính thức
        if (official === 'true') {
          conditionObj.official = true
        }

        if (taskID) {
          if (!checkObjectIDs([taskID])) {
            return resolve({
              error: true,
              message: 'Tham số taskID không hợp lệ',
              keyError: 'params_taskID_invalid',
              status: 400,
            })
          }

          let infoTask = await PCM_PLAN_TASK_COLL.findById(taskID)
            .select('subtype openedStatus assignee related')
            .lean()

          /**
           * Xét riêng với công việc Thầu và mua sắm infoTask.subtype === 4
           * - Không lấy response official khi chưa đủ người mở thầu
           * - Không áp dụng đối với người Tạo việc và Người liên quan
           */
          if (infoTask.subtype === 4 && infoTask?.openedStatus === 0) {
            let relatedArr = infoTask.related.map((item) => item.toString())
            // console.log(relatedArr)

            // console.log(authorID !== infoTask.assignee?.toString())
            // console.log(relatedArr.includes(authorID))

            if (
              authorID !== infoTask.assignee?.toString() ||
              relatedArr.includes(authorID)
            ) {
              conditionObj.official = false
            }

            // console.log(conditionObj)
          }

          conditionObj.task = taskID
        }

        if (contractID || projectID) {
          if (checkObjectIDs([contractID])) {
            conditionObj.contract = contractID
          }

          if (checkObjectIDs([projectID])) {
            conditionObj.project = projectID
          }
        } else {
          if (parentID && checkObjectIDs([parentID])) {
            conditionObj.parent = parentID
          } else {
            conditionObj.parent = { $exists: false }
          }
        }

        if (isHaveImage) {
          conditionObj.$expr = {
            $gt: [{ $size: '$images' }, 0],
          }
          // conditionObj['images.1'] = { $exists: true };
        }

        if (+type > 2) {
          conditionObj.type = type
        }

        if (switchType === this.SWITCH_TYPE.PROJECT) {
          conditionObj.task = { $exists: false }
        }

        // console.log({ conditionObj, type })

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await PCM_COMMENT_COLL.findById(lastestID)
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

        let infoDataAfterGet = await PCM_COMMENT_COLL.find(conditionObj)
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

        let nextCursor = null
        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await PCM_COMMENT_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)
        let dataResponse = []

        if (
          infoDataAfterGet &&
          infoDataAfterGet.length &&
          !contractID &&
          !isHaveImage &&
          isGetReaction === 'true'
        ) {
          for (const comment of infoDataAfterGet) {
            const lastReactionComment = await PCM_COMMENT_REACTION_COLL.find({
              comment: comment._id,
            })
              .select('type')
              .sort({ _id: -1 })
              .limit(3)
              .lean()

            const infoReaction = await PCM_COMMENT_REACTION_COLL.findOne({
              comment: comment._id,
              author: authorID,
            })
              .select('type')
              .lean()

            if (
              comment.lastestReplyID &&
              typeof comment.lastestReplyID !== 'string'
            ) {
              const lastReactionCommentReply =
                await PCM_COMMENT_REACTION_COLL.find({
                  comment: comment.lastestReplyID?._id,
                })
                  .select('type')
                  .sort({ _id: -1 })
                  .limit(3)
                  .lean()

              const infoReactionReply = await PCM_COMMENT_REACTION_COLL.findOne(
                {
                  comment: comment.lastestReplyID?._id,
                  author: authorID,
                }
              )
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
        }

        // console.log(dataResponse)

        return resolve({
          error: false,
          data: {
            listRecords: dataResponse.length ? dataResponse : infoDataAfterGet,
            limit,
            totalRecord,
            totalPage,
            nextCursor,
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
   * Func: Danh sách comment tìm kiếm theo id
   * Date: 22/02/2022
   */
  searchCommentById({
    taskID,
    commentID,
    projectID,
    switchType = 'TASK',
    select,
    populates,
    authorID,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([commentID, authorID])) {
          return resolve({
            error: true,
            message: 'Tham số commentID, authorID không hợp lệ',
            keyError: 'params_commentID_or_authorID_invalid',
            status: 400,
          })
        }

        if (taskID) {
          if (!checkObjectIDs([taskID])) {
            return resolve({
              error: true,
              message: 'Tham số taskID không hợp lệ',
              keyError: 'params_taskID_invalid',
              status: 400,
            })
          }
        }

        if (projectID) {
          if (!checkObjectIDs([projectID])) {
            return resolve({
              error: true,
              message: 'Tham số projectID không hợp lệ',
              keyError: 'params_projectID_invalid',
              status: 400,
            })
          }
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

        const conditionObjFrontList = { _id: { $lt: commentID } }
        const conditionObjBackList = { _id: { $gt: commentID } }
        const conditionObjSearchMessage = { _id: commentID }

        if (switchType === this.SWITCH_TYPE.PROJECT) {
          conditionObjFrontList.project = projectID
          conditionObjBackList.project = projectID
          conditionObjSearchMessage.project = projectID
        } else {
          conditionObjFrontList.task = taskID
          conditionObjBackList.task = taskID
          conditionObjSearchMessage.task = taskID
        }

        const infoComment = await PCM_COMMENT_COLL.findOne(
          conditionObjSearchMessage
        )
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

        const listCommentsFront = await PCM_COMMENT_COLL.find(
          conditionObjFrontList
        )
          .limit(5)
          .sort({ createAt: -1, _id: -1 })
          .select(select)
          .populate(populates)
          .lean()

        const listCommentsBack = await PCM_COMMENT_COLL.find(
          conditionObjBackList
        )
          .limit(5)
          .sort({ createAt: 1, _id: 1 })
          .select(select)
          .populate(populates)
          .lean()

        const listComments = [
          ...listCommentsFront.reverse(),
          infoComment,
          ...listCommentsBack,
        ]

        const totalRecordFront = await PCM_COMMENT_COLL.countDocuments(
          conditionObjFrontList
        )
        const totalRecordBack =
          await PCM_COMMENT_COLL.countDocuments(conditionObjBackList)

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listComments,
            totalRecordFront,
            totalRecordBack,
          },
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
   * Dev: HiepNH
   * Func: Danh sách comment tìm kiếm theo các chủ đề được quyền truy cập
   * Date: 19/8/2022
   */
  searchCommentBySubject({
    sortKey,
    fromDate,
    toDate,
    authorsID,
    companyOfAuthorsID,
    projectsID,
    official,
    userID,
    keyword,
    limit = 10,
    unlimit,
    lastestID,
    select,
    populates = {},
  }) {
    // console.log('=================searchCommentBySubjectt================')
    // console.log({ sortKey, fromDate, toDate, authorsID, companyOfAuthorsID, projectsID, official, userID, keyword, limit, unlimit, lastestID, select, populates })
    return new Promise(async (resolve) => {
      try {
        /**
         * BA
         * 1-Tìm kiếm các chủ đề mà user được quyền truy cập
         * 2-Tìm kiếm các phản hồi trong chủ đề
         * 3-Populate tới chủ đề (task) chứa phản hồi để hiển thị ra ngoài trang chủ
         */
        if (Number(limit) > 10) {
          limit = 10
        } else {
          limit = +Number(limit)
        }

        let conditionObj = {
          accessUsers: { $in: [userID] },
        }

        /**
         * VALIDATION (1)
         */
        const validation = validateParamsObjectID({
          authorsID: { value: authorsID, isRequire: false },
          companyOfAuthorsID: {
            value: companyOfAuthorsID,
            isRequire: false,
          },
          projectsID: { value: projectsID, isRequire: false },
        })
        if (validation.error) return resolve(validation)

        // Điều kiện bộ lọc
        projectsID &&
          projectsID.length &&
          (conditionObj.project = { $in: projectsID })
        authorsID &&
          authorsID.length &&
          (conditionObj.author = { $in: authorsID })
        companyOfAuthorsID &&
          companyOfAuthorsID.length &&
          (conditionObj.companyOfAuthor = { $in: companyOfAuthorsID })

        // Thời gian khởi tạo từ ngày->ngày
        if (fromDate && toDate) {
          conditionObj.createAt = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          }
        }
        // console.log(conditionObj)

        // Phản hồi chính thức hay không
        if (official) {
          conditionObj.official = official
        }

        // Lọc và sắp xếp
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

        if (sortKey && typeof sortKey === 'string') {
          if (!IsJsonString(sortKey))
            return resolve({
              error: true,
              message: 'Request params sortKey invalid',
              status: 400,
            })

          keys = JSON.parse(sortKey)
        }

        // Kiểm tra điều kiện populates
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

        // Tìm kiếm theo keyword
        if (keyword) {
          let keywordCV = stringUtils.removeAccents(keyword)
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'

          keywordCV = keywordCV.split(' ')
          keywordCV = '.*' + keywordCV.join('.*') + '.*'
          const regCVSearch = new RegExp(keywordCV, 'i')

          conditionObj.contentcv = regCVSearch
        }
        // console.log(conditionObj)
        // conditionObj = {}

        let conditionObjOrg = { ...conditionObj }

        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await PCM_COMMENT_COLL.findById(lastestID)
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

        // Tổng số việc tìm thấy
        let totalRecord = await PCM_COMMENT_COLL.count(conditionObjOrg)
        if (unlimit == 1) {
          limit = totalRecord
        }

        // Bắt đầu query trong db
        let infoDataAfterGet = await PCM_COMMENT_COLL.find(conditionObj)
          .limit(limit + 1)
          .select(select)
          .populate(populates)
          .sort(sortBy)
          .lean()

        // Kiểm tra nếu không có dữ liệu
        if (!infoDataAfterGet)
          return resolve({
            error: true,
            message: "Can't get data",
            keyError: KEY_ERROR.GET_LIST_FAILED,
            status: 200,
          })

        // NextCursor phần tử cuối cùng khi phân trang
        let nextCursor = null
        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        // Tổng số trang
        let totalPage = Math.ceil(totalRecord / limit)
        return resolve({
          error: false,
          data: {
            listRecords: infoDataAfterGet,
            limit: +limit,
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
   * Name: Gom nhóm theo thuộc tính
   * Author: Hiepnh
   * Date: 24/9/2022
   */
  getListByProperty({
    userID,
    option,
    fromDate,
    toDate,
    isParent,
    isGroup,
    projectID,
  }) {
    // console.log('============Gom nhóm theo thuộc tính/Báo cáo theo dự án================')
    // console.log({ userID, option, fromDate, toDate, isParent, isGroup, projectID })
    return new Promise(async (resolve) => {
      try {
        let listComments = []
        if (!projectID) {
          if (fromDate && toDate) {
            listComments = await PCM_COMMENT_COLL.find({
              accessUsers: { $in: [userID] },
              createAt: {
                $gte: new Date(fromDate),
                $lte: new Date(toDate),
              },
              project: { $exists: true, $ne: null },
              companyOfAuthor: { $exists: true, $ne: null },
            })
          } else {
            listComments = await PCM_COMMENT_COLL.find({
              accessUsers: { $in: [userID] },
              project: { $exists: true, $ne: null },
              companyOfAuthor: { $exists: true, $ne: null },
            })
          }
        } else {
          if (fromDate && toDate) {
            listComments = await PCM_COMMENT_COLL.find({
              accessUsers: { $in: [userID] },
              createAt: {
                $gte: new Date(fromDate),
                $lte: new Date(toDate),
              },
              project: projectID,
              companyOfAuthor: { $exists: true, $ne: null },
            })
          } else {
            listComments = await PCM_COMMENT_COLL.find({
              accessUsers: { $in: [userID] },
              project: projectID,
              companyOfAuthor: { $exists: true, $ne: null },
            })
          }
        }

        /**
         * Tính tổng số lượng theo các phân loại của Nhà thầu
         */
        if (option == 1) {
          let conditionPopulateProject = {
            path: '_id.project',
            select: '_id name sign image modifyAt',
            options: { sort: { modifyAt: -1 } },
            model: 'department',
          }

          let conditionPopulateCompany = {
            path: '_id.companyOfAuthor',
            select: '_id name sign image',
            model: 'company',
          }

          let sortProject = { '_id.project': -1 }
          let sortCompany = { '_id.companyOfAuthor': 1 }

          let listDataProject = await PCM_COMMENT_COLL.aggregate([
            {
              $match: {
                _id: {
                  $in: listComments.map((item) => item._id),
                },
              },
            },
            {
              $group: {
                _id: { project: '$project' },
                amount: { $sum: 1 },
              },
            },
            { $sort: sortProject },
          ])
          // console.log(listDataProject)

          let listDataProjectCompanyAuthor = await PCM_COMMENT_COLL.aggregate([
            {
              $match: {
                _id: {
                  $in: listComments.map((item) => item._id),
                },
              },
            },
            {
              $group: {
                _id: {
                  project: '$project',
                  companyOfAuthor: '$companyOfAuthor',
                },
                amount: { $sum: 1 },
              },
            },
            { $sort: sortCompany },
          ])

          if (listDataProject.length) {
            await DEPARTMENT_COLL.populate(
              listDataProject,
              conditionPopulateProject
            )
          }
          // console.log(listDataProject[0])

          if (listDataProjectCompanyAuthor.length) {
            await DEPARTMENT_COLL.populate(
              listDataProjectCompanyAuthor,
              conditionPopulateCompany
            )
          }
          // console.log(listDataProjectCompanyAuthor)

          return resolve({
            error: false,
            data: { listDataProject, listDataProjectCompanyAuthor },
          })
        }
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }
}

exports.MODEL = new Model()
