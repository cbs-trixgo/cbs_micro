'use strict'
const ObjectID = require('mongoose').Types.ObjectId
const { APP_KEYS } = require('../../../tools/keys')

const FILE__CORE_COLL = require('../database/file.core-coll')
const BaseModel = require('../../../tools/db/base_model')
const {
  checkObjectIDs,
  checkNumberIsValidWithRange,
  checkNumberValid,
} = require('../../../tools/utils/utils')
const {
  FILE_PROCESSING,
  FILE_UPLOAD_ERROR,
  FILE_UPLOAD_SUCCESS,
} = require('../helper/file.keys-constant')

class Model extends BaseModel {
  constructor() {
    super(FILE__CORE_COLL)
  }
  /**
   * 1/ insert (processing)
   * 2/ insert bulk
   *
   * 3/ update status (success, error)
   * 4/ update status bulk
   *
   * 6/ get list by status SYSTEM
   * 7/ get info
   * 8/ get list with list fileID with status
   */

  insert({
    appID,
    companyID,
    projectID,
    groupID,
    nameOrg,
    name,
    path,
    size,
    mimeType,
    type,
    userID,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        const dataInsert = {
          nameOrg,
          name,
          path,
          size,
          mimeType,
          type,
          author: userID,
        }

        /**
         * VALIDATION STEP (2)
         *  - kiểm tra valid từ các input
         *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([userID])) {
          return resolve({
            error: true,
            message: 'Tham số userID không hợp lệ',
            keyError: 'params_userID_invalid',
            status: 400,
          })
        }

        if (size && !checkNumberValid({ val: size })) {
          return resolve({
            error: true,
            message: 'Tham số size không hợp lệ',
            keyError: 'params_size_invalid',
            status: 400,
          })
        }

        if (
          type &&
          !checkNumberIsValidWithRange({
            arrValid: [1, 2, 3, 4],
            val: type,
          })
        ) {
          return resolve({
            error: true,
            message: 'Tham số type không hợp lệ',
            keyError: 'params_type_invalid',
            status: 400,
          })
        }

        /**
         * LOGIC STEP (3)
         *  3.1: convert type + update name (ví dụ: string -> number)
         *  3.2: operation database
         */
        if (appID) {
          if (!checkObjectIDs([appID])) {
            return resolve({
              error: true,
              message: 'Tham số appID không hợp lệ',
              keyError: 'params_appID_invalid',
              status: 400,
            })
          }

          dataInsert.app = appID
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

          dataInsert.company = companyID
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

          dataInsert.project = projectID
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({ error: true, message: 'cannot_insert' })

        // Thêm file trong pcm
        if (appID == APP_KEYS.PCM_PLAN_TASK) {
          if (groupID) {
            dataInsert.group = groupID
          }
          dataInsert.file = `${infoAfterInsert._id}`
        }
        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
     *
    // cập nhật trạng thái thành công hoặc thất bại
     * @param {*} fileID
     * @param {*} status
     * @param {*} description
     * @param {*} userID
     * @returns
     */
  update({ fileID, status, description, userID }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let listStatusForUpdateValid = [FILE_UPLOAD_ERROR, FILE_UPLOAD_SUCCESS] // chỉ có các file_processing -> mới được update
        let dataUpdate = { modifyAt: Date.now() }

        /**
         * VALIDATION STEP (2)
         *  - kiểm tra valid từ các input
         *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(userID))
          return resolve({ error: true, message: 'object_invalid' })

        /**
         * LOGIC STEP (3)
         *  3.1: convert type + update name (ví dụ: string -> number)
         *  3.2: operation database
         */
        const infoFile = await FILE__CORE_COLL.findById(fileID).lean()

        if (status) {
          if (
            !checkNumberIsValidWithRange({
              arrValid: listStatusForUpdateValid,
              val: status,
            })
          )
            return resolve({
              error: true,
              message: 'status_invalid',
            })

          // let fileIsProcessing = await FILE__CORE_COLL.findOne({ _id: fileID, status: FILE_PROCESSING });
          if (infoFile.status === FILE_PROCESSING)
            return resolve({
              error: true,
              message: 'file_not_processing',
            })

          if (infoFile.userCreate != userID)
            return resolve({
              error: true,
              message: 'file_not_auth',
            })

          dataUpdate.status = status
        }

        if (description) {
          dataUpdate.description = description
        }

        let infoAfterUpdate = await FILE__CORE_COLL.findByIdAndUpdate(
          fileID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({ error: true, message: 'cannot_insert' })

        return resolve({ error: false, data: infoAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  deleteFiles({ fileIDs, authorID }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([...fileIDs, authorID])) {
          return resolve({
            error: true,
            message: 'Tham số fileIDs hoặc authorID không hợp lệ',
            keyError: 'params_fileIDs_or_authorID_invalid',
            status: 400,
          })
        }

        const infoBeforeDelete = await FILE__CORE_COLL.find({
          _id: { $in: fileIDs },
          author: authorID,
        })
        if (!infoBeforeDelete.length)
          return resolve({
            error: true,
            message: 'cannot_find_files',
          })

        const infoAfterDelete = await FILE__CORE_COLL.deleteMany({
          _id: { $in: fileIDs },
        })
        if (!infoAfterDelete)
          return resolve({
            error: true,
            message: 'cannot_delete_files',
          })

        return resolve({ error: false, data: infoAfterDelete })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  getInfoFile({ fileID, authorID, select, populates }) {
    // console.log('=============Thông tin file=====================')
    // console.log({ fileID, authorID, select, populates })
    return new Promise(async (resolve) => {
      try {
        /**
         * VALIDATION STEP (2)
         *  - kiểm tra valid từ các input
         *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs([fileID, authorID])) {
          return resolve({
            error: true,
            message: 'Tham số fileID hoặc authorID không hợp lệ',
            keyError: 'params_fileID_or_authorID_invalid',
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
        let infoFile = await FILE__CORE_COLL.findById(fileID)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoFile) {
          return resolve({
            error: true,
            message: 'File không tồn tại',
            keyError: 'file_not_exists',
            status: 400,
          })
        }

        return resolve({ error: false, data: infoFile, status: 200 })
      } catch (error) {
        console.info('getInfoFile')
        console.error(error)
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }

  getInfoOfListFileID({ fileIDs }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        /**
         * VALIDATION STEP (2)
         *  - kiểm tra valid từ các input
         *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(...fileIDs))
          return resolve({ error: true, message: 'object_invalid' })
        /**
         * LOGIC STEP (3)
         *  3.1: convert type + update name (ví dụ: string -> number)
         *  3.2: operation database
         */

        let conditionObj = {
          _id: {
            $in: [...fileIDs.map((item) => ObjectID(item))],
          },
        }

        let listInfoFiles = await FILE__CORE_COLL.find(conditionObj)
        if (!listInfoFiles)
          return resolve({ error: true, message: 'cannot_get_info' })

        return resolve({ error: false, data: listInfoFiles })
      } catch (error) {
        return resolve({ error: true, message: message })
      }
    })
  }

  getListFileWithStatus({ status = 'all', userID }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let listStatusValid = [
          FILE_PROCESSING,
          FILE_UPLOAD_ERROR,
          FILE_UPLOAD_SUCCESS,
        ]
        /**
         * VALIDATION STEP (2)
         *  - kiểm tra valid từ các input
         *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (
          !checkNumberIsValidWithRange({
            arrValid: listStatusValid,
            val: status,
          }) &&
          status != 'all'
        )
          return resolve({ error: true, message: 'status_invalid' })

        /**
         * LOGIC STEP (3)
         *  3.1: convert type + update name (ví dụ: string -> number)
         *  3.2: operation database
         */

        let conditionObj = {
          userCreate: userID,
        }
        if (status != 'all') {
          conditionObj.status = Number(status)
        }

        let listFiles = await FILE__CORE_COLL.find(conditionObj).sort({
          createAt: -1,
        })
        if (!listFiles)
          return resolve({ error: true, message: 'cannot_get_list' })

        return resolve({ error: false, data: listFiles })
      } catch (error) {
        return resolve({ error: true, message: message })
      }
    })
  }
}

exports.MODEL = new Model()
