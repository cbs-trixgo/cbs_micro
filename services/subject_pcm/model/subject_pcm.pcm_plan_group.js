'use strict'
const BaseModel = require('../../../tools/db/base_model')
const {
  checkObjectIDs,
  checkNumberIsValidWithRange,
  checkNumberValid,
  IsJsonString,
} = require('../../../tools/utils/utils')
const stringUtils = require('../../../tools/utils/string_utils')
const { setTimeZone } = require('../../../tools/utils/time_utils')
const { KEY_ERROR } = require('../../../tools/keys')

const {
  getCurrentPage,
} = require('../../../tools/utils/calculate_current_page')
const ObjectID = require('mongoose').Types.ObjectId

const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')

const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const { uploadFileS3 } = require('../../../tools/s3')

/**s
 * import inter-coll, exter-coll
 */
const USER_COLL = require('../../auth/database/auth.user-coll')
const DEPARTMENT_COLL = require('../../item/database/item.department-coll')
const PCM_PLAN_GROUP_COLL = require('../database/subject_pcm.pcm_plan_group-coll')
const PCM_PLAN_TASK_COLL = require('../database/subject_pcm.pcm_plan_task-coll')
const PCM_COMMENT_COLL = require('../database/subject_pcm.pcm_comment-coll')
const PCM_FILE_COLL = require('../database/subject_pcm.pcm_file-coll')

const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
// const { template } = require('lodash');

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
  constructor() {
    super(PCM_PLAN_GROUP_COLL)
  }

  /**
   * Name: insert group
   * Author: Depv
   * Code:
   */
  insert({ projectID, parentID, name, sign, userID, ctx }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(projectID))
          return resolve({
            error: true,
            message: 'projectID__invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let checkExist = await PCM_PLAN_GROUP_COLL.findOne({
          project: projectID,
          name,
          sign,
        })
        if (checkExist)
          return resolve({
            error: true,
            message: 'Tên và mã hiệu đã tồn tại',
            keyError: KEY_ERROR.ITEM_EXISTED,
          })

        let infoProject = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
          {
            departmentID: projectID,
          }
        )
        // console.log(infoProject)
        if (!infoProject)
          return resolve({
            error: true,
            message: 'Thông tin dự án không tồn tại',
            keyError: KEY_ERROR.ITEM_EXISTED,
          })

        let companyID = infoProject?.data?.company
        // console.log({companyID})

        let dataInsert = {
          company: companyID,
          project: projectID,
          name,
          sign,
          userCreate: userID,
          admins: [userID],
          members: [userID],
        }

        if (checkObjectIDs(parentID)) {
          dataInsert.parent = parentID
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: 'Thêm thất bại',
            keyError: KEY_ERROR.INSERT_FAILED,
          })

        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: update group
   * Author: Depv
   * Code:
   */
  update({
    groupID,
    name,
    sign,
    userID,
    parentID,
    contractID,
    image,
    members,
    membersRemove,
    admins,
    adminsRemove,
  }) {
    // console.log({ groupID, name, sign, userID, parentID, contractID, image, members, membersRemove, admins, adminsRemove })
    return new Promise(async (resolve) => {
      try {
        let infoGroup = await PCM_PLAN_GROUP_COLL.findById(groupID)
        if (!infoGroup)
          return resolve({
            error: true,
            message: 'groupID__invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let checkExist = await PCM_PLAN_GROUP_COLL.findOne({
          project: infoGroup.project,
          _id: { $ne: groupID },
          sign,
        })
        if (checkExist)
          return resolve({
            error: true,
            message: 'Tên và mã hiệu đã tồn tại',
            keyError: KEY_ERROR.ITEM_EXISTED,
          })
        let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

        if (name) {
          dataUpdate.name = name
        }

        if (sign) {
          dataUpdate.sign = sign
        }

        if (checkObjectIDs(contractID)) {
          dataUpdate.contract = contractID
        }

        if (checkObjectIDs(members)) {
          dataUpdate.$addToSet = { members }
        }

        if (checkObjectIDs(membersRemove)) {
          dataUpdate.$pullAll = { members: membersRemove }
        }

        if (checkObjectIDs(admins)) {
          dataUpdate.$addToSet = { admins }
        }

        if (checkObjectIDs(adminsRemove)) {
          dataUpdate.$pullAll = { admins: adminsRemove }
        }

        if (checkObjectIDs(image)) {
          dataUpdate.image = image
        }

        /**
         * Di chuyển thư mục
         */
        if (checkObjectIDs(parentID)) {
          dataUpdate.parent = parentID
        }

        // console.log({ dataUpdate })
        let infoAfterUpdate = await PCM_PLAN_GROUP_COLL.findByIdAndUpdate(
          groupID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
            keyError: KEY_ERROR.UPDATE_FAILED,
          })

        /**
         * NẾU GÁN HỢP ĐỒNG => CẬP NHẬT CHO CÁC GROUP CON + TASK + COMMENT
         */
        if (checkObjectIDs(contractID)) {
          await PCM_PLAN_GROUP_COLL.updateMany(
            { parent: ObjectID(groupID) },
            { $set: { contract: ObjectID(contractID) } }
          )

          await PCM_PLAN_TASK_COLL.updateMany(
            { group: ObjectID(groupID) },
            { $set: { contract: ObjectID(contractID) } }
          )

          await PCM_COMMENT_COLL.updateMany(
            { group: ObjectID(groupID) },
            { $set: { contract: ObjectID(contractID) } }
          )

          await PCM_FILE_COLL.updateMany(
            { group: ObjectID(groupID) },
            { $set: { contract: ObjectID(contractID) } }
          )
        }

        return resolve({ error: false, data: infoAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: get info user_pcm_plan_group
   * Author: Depv
   * Code:
   */
  getInfo({ groupID, select, populates = {} }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(groupID))
          return resolve({ error: true, message: 'param_invalid' })

        // populate
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

        let infoPlanGroup = await PCM_PLAN_GROUP_COLL.findById(groupID)
          .select(select)
          .populate(populates)

        if (!infoPlanGroup)
          return resolve({
            error: true,
            message: 'cannot_get',
            keyError: KEY_ERROR.GET_INFO_FAILED,
          })

        return resolve({ error: false, data: infoPlanGroup })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name  : Danh sách user_pcm_plan_group
   * Author: Depv
   * Code  :
   */
  getList({
    userID,
    parentID,
    projectID,
    lastestID,
    keyword,
    limit = 10,
    select,
    populates = {},
    isShowAll,
    isShowParentAndChild,
  }) {
    // console.log({ userID, parentID, projectID, lastestID, keyword, limit, select, populates, isShowAll, isShowParentAndChild })
    return new Promise(async (resolve) => {
      try {
        if (limit > 20 || isNaN(limit)) {
          limit = 20
        } else {
          limit = +limit
        }

        if (!checkObjectIDs(projectID))
          return resolve({
            error: true,
            message: 'projectID_invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let conditionObj = {
          $or: [{ members: { $in: [userID] } }, { admins: { $in: [userID] } }],
        }

        let sortBy
        let keys = ['actualFinishTime__-1', '_id__-1']

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
         * Lấy tất cả group trong dự án
         * Phục vụ cho việc Admin dự án
         */
        if (isShowAll == 1) {
          delete conditionObj.$or
        }

        if (projectID) {
          conditionObj.project = projectID
        }

        // Trường hợp show ở modal tạo task mới (show hết cha và con)
        if (!isShowParentAndChild) {
          if (parentID && checkObjectIDs(parentID)) {
            conditionObj.parent = parentID
          } else {
            conditionObj.parent = { $exists: false }
          }
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'

          if (conditionObj.$or) {
            conditionObj.$and = [
              {
                $or: conditionObj.$or,
              },
              {
                $or: [
                  { name: new RegExp(keyword, 'i') },
                  { sign: new RegExp(keyword, 'i') },
                ],
              },
            ]
          } else {
            conditionObj.$or = [
              { name: new RegExp(keyword, 'i') },
              { sign: new RegExp(keyword, 'i') },
            ]
          }
        }

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await PCM_PLAN_GROUP_COLL.findById(lastestID)
          if (!infoData)
            return resolve({
              error: true,
              message: "Can't get info last message",
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

        let infoDataAfterGet = await PCM_PLAN_GROUP_COLL.find(conditionObj)
          .limit(limit + 1)
          .sort(sortBy)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoDataAfterGet)
          return resolve({
            error: true,
            message: "Can't get data",
            keyError: KEY_ERROR.GET_LIST_FAILED,
            status: 200,
          })

        let nextCursor = null
        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await PCM_PLAN_GROUP_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)

        return resolve({
          error: false,
          data: {
            listRecords: infoDataAfterGet,
            limit: limit,
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
   * Name: Download Template Excel
   * Author: HiepNH
   * Date: 21/3/2023
   */
  downloadTemplateExcel({ option, projectID, userID }) {
    // console.log({ option, projectID, userID })
    return new Promise(async (resolve) => {
      try {
        // let listUsers = await DEPARTMENT_COLL
        let infoProject = await DEPARTMENT_COLL.findById(projectID)
          .select('name members admins')
          .populate({
            path: 'members',
            select: 'fullname',
          })
        // console.log(infoProject)

        //
        let listData = await PCM_PLAN_GROUP_COLL.find({
          project: projectID,
        })
          .select('name sign members')
          .sort({ _id: -1 })
        // .limit(200)
        // console.log(listData)

        // Modify the workbook.
        XlsxPopulate.fromFileAsync(
          path.resolve(
            __dirname,
            '../../../files/templates/excels/pcm_setup_template.xlsx'
          )
        ).then(async (workbook) => {
          var i = 4
          infoProject.members?.forEach((item, index) => {
            workbook
              .sheet('ThanhVienDuAn')
              .row(i)
              .cell(1)
              .value(Number(index + 1))
            workbook.sheet('ThanhVienDuAn').row(i).cell(2).value(item.fullname)
            workbook.sheet('ThanhVienDuAn').row(i).cell(3).value(`${item._id}`)

            if (infoProject?.admins.includes(item._id)) {
              workbook.sheet('ThanhVienDuAn').row(i).cell(4).value(1)
            }

            workbook.sheet('ThanhVienDuAn').row(i).cell(5).value(1)

            i++
          })

          var i = 4
          infoProject.members?.forEach((item, index) => {
            workbook
              .sheet('NhomDuLieuCongViec')
              .row(i)
              .cell(1)
              .value(Number(index + 1))
            workbook
              .sheet('NhomDuLieuCongViec')
              .row(i)
              .cell(2)
              .value(item.fullname)
            workbook
              .sheet('NhomDuLieuCongViec')
              .row(i)
              .cell(3)
              .value(`${item._id}`)
            i++
          })

          var j = 4
          listData?.forEach((item, index) => {
            workbook
              .sheet('NhomDuLieuCongViec')
              .row(2)
              .cell(j)
              .value(`${item._id}`)
            workbook.sheet('NhomDuLieuCongViec').row(3).cell(j).value(item.name)

            for (var i = 4; i < infoProject.members?.length + 4; i++) {
              let userID = workbook
                .sheet('NhomDuLieuCongViec')
                .row(i)
                .cell(3)
                .value()

              if (item?.members.includes(userID)) {
                workbook.sheet('NhomDuLieuCongViec').row(i).cell(j).value(1)
              }
            }

            j++
          })

          const now = new Date()
          const filePath = '../../../files/temporary_uploads/'
          const fileName = `pcm_setup_template_${now.getTime()}.xlsx`
          const pathWriteFile = path.resolve(__dirname, filePath, fileName)

          await workbook.toFileAsync(pathWriteFile)
          const result = await uploadFileS3(pathWriteFile, fileName)

          fs.unlinkSync(pathWriteFile)
          return resolve({
            error: false,
            data: result?.Location,
            status: 200,
          })
        })
      } catch (error) {
        console.log({ error })
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
   * Func: Tạo task từ dữ liệu excel
   * Date: 15/09/2022
   */
  importFromExcel({ option, projectID, dataImport, userID, ctx }) {
    console.log({ option, projectID, userID })
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(projectID))
          return resolve({
            error: true,
            message: 'projectID_invalid',
            status: 400,
          })

        const dataImportJSON = JSON.parse(dataImport)
        let index = 0
        let errorNumber = 0

        /**
         * THÀNH VIÊN DỰ ÁN
         */
        if (1 == 1) {
          let admins = [],
            members = []
          for (const data of dataImportJSON) {
            if (index > 0) {
              // console.log('=====================')
              // console.log(data?.__EMPTY_1)
              // console.log(data?.__EMPTY_2)
              // console.log(data?.__EMPTY_3)

              if (Number(data?.__EMPTY_2) == 1) {
                admins.push(data?.__EMPTY_1)
              }

              if (Number(data?.__EMPTY_3) == 1) {
                members.push(data?.__EMPTY_1)
              }
            }

            index++
          }

          await DEPARTMENT_COLL.findByIdAndUpdate(
            projectID,
            {
              admins: admins,
              members: members,
            },
            { new: true }
          )
        }

        /**
         * THÀNH VIÊN NHÓM DỮ LIỆU
         */
        // if(2 == 2){
        //     let  members = []
        //     let arrGroup = []

        //     for (const data of dataImportJSON) {
        //         console.log(data)
        //     }

        //     for (const data of dataImportJSON) {
        //         console.log(data)
        //         // if(index > 0){
        //         //     console.log('=====================')
        //         //     console.log(data?.__EMPTY_1)
        //         //     console.log(data?.__EMPTY_2)
        //         //     console.log(data?.__EMPTY_3)

        //         //     // if(Number(data?.__EMPTY_2) == 1){
        //         //     //     admins.push(data?.__EMPTY_1)
        //         //     // }

        //         //     // if(Number(data?.__EMPTY_3) == 1){
        //         //     //     members.push(data?.__EMPTY_1)
        //         //     // }
        //         // }

        //         // index ++;
        //     }

        //     // console.log(admins)
        //     // console.log(members)

        //     // await DEPARTMENT_COLL.findByIdAndUpdate(projectID,
        //     //     {
        //     //         admins: admins,
        //     //         members: members,
        //     //     },
        //     // { new: true })
        // }

        // if(errorNumber != 0)
        //     return resolve({ error: true, message: "import field" });

        // Update timeImportExcel trick reload việc con
        // await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, { $set: { timeImportExcel: new Date() }}, { new: true });

        return resolve({ error: false, message: 'import success' })
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
