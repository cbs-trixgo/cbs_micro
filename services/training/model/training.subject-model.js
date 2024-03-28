'use strict'
const BaseModel = require('../../../tools/db/base_model')
const {
  checkObjectIDs,
  checkNumberIsValidWithRange,
  checkNumberValid,
  IsJsonString,
} = require('../../../tools/utils/utils')
const {
  getCurrentPage,
} = require('../../../tools/utils/calculate_current_page')

/**
 * import inter-coll, exter-coll
 */
const TRAINING__SUBJECT_COLL = require('../database/training.subject-coll')
const TRAINING__SUBJECT_RATING_COLL = require('../database/training.subject_rating-coll')

const TRAINING__SUBJECT_SEEN_MODEL =
  require('../model/training.subject_seen-model').MODEL

const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys')

/**
 * import inter-model, exter-model
 */

/**
 * import util files
 */

class Model extends BaseModel {
  constructor() {
    super(TRAINING__SUBJECT_COLL)
  }

  /**
   * Name: insert subject
   * Author: Depv
   * Code: F02501
   */
  insert({ name, description, parent, userID }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let dataInsert = {}

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(userID))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        /**
         * LOGIC STEP (3)
         *  3.1: Convert type + update name (ví dụ: string -> number)
         *  3.2: Operation database
         */
        dataInsert = { userCreate: userID }

        if (name) {
          dataInsert.name = name
        }

        if (description) {
          dataInsert.description = description
        }

        if (checkObjectIDs(parent)) {
          dataInsert.parent = parent
        }

        let infoAfterInsert = await this.insertData(dataInsert)

        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: "Can't insert subject",
            keyError: KEY_ERROR.INSERT_FAILED,
          })

        if (checkObjectIDs(parent)) {
          await TRAINING__SUBJECT_COLL.findByIdAndUpdate(
            parent,
            { $inc: { amountLessions: 1 } },
            { new: true }
          )
        }

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
   * Name: update subject
   * Author: Depv
   * Code: F02502
   */
  update({ subjectID, name, description, content, image, userID }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let dataUpdate = {}

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(subjectID))
          return resolve({
            error: true,
            message: 'Request params subjectID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        /**
         * LOGIC STEP (3)
         *  3.1: Convert type + update name (ví dụ: string -> number)
         *  3.2: Operation database
         */
        dataUpdate = {
          userCreate: userID,
          userUpdate: userID,
          modifyAt: new Date(),
        }

        if (name) {
          dataUpdate.name = name
        }

        if (description) {
          dataUpdate.description = description
        }

        if (checkObjectIDs(image)) {
          dataUpdate.image = image
        }

        if (content) {
          dataUpdate.content = content
        }

        let infoAfterUpdate = await TRAINING__SUBJECT_COLL.findByIdAndUpdate(
          subjectID,
          dataUpdate,
          { new: true }
        )

        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: "Can't insert subject",
            keyError: KEY_ERROR.UPDATE_FAILED,
          })

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
   * Name: Remove subject
   * Author: Depv
   * Code: F02503
   */
  remove({ subjectID, userID }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(subjectID))
          return resolve({
            error: true,
            message: 'Request params subjectID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let infoData = await TRAINING__SUBJECT_COLL.findById(subjectID)
        if (infoData && infoData.userCreate.toString() != userID.toString())
          return resolve({
            error: true,
            message: 'Bạn không có quyền xóa, người tạo mới được phép xóa',
            keyError: KEY_ERROR.DELETE_FAILED,
          })

        /**
         * LOGIC STEP (3)
         *  3.1: Convert type + update name (ví dụ: string -> number)
         *  3.2: Operation database
         */
        let infoAfterUpdate =
          await TRAINING__SUBJECT_COLL.findByIdAndDelete(subjectID)

        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: "Can't remove subject",
            keyError: KEY_ERROR.DELETE_FAILED,
          })

        // Cập nhật lại amountLessions trong chủ đề nếu xóa Bài học
        if (infoAfterUpdate.parent) {
          await TRAINING__SUBJECT_COLL.findByIdAndUpdate(
            infoAfterUpdate.parent,
            { $inc: { amountLessions: -1 } },
            { new: true }
          )
        }

        return resolve({
          error: false,
          message: 'Remove success',
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
   * Name: Get info subject
   * Author: Depv
   * Code: F02504
   */
  getInfo({ subjectID, userID, select, populates, ctx }) {
    return new Promise(async (resolve) => {
      try {
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
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(subjectID))
          return resolve({
            error: true,
            message: 'Request params subjectID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        /**
         * LOGIC STEP (3)
         *  3.1: Convert type + update name (ví dụ: string -> number)
         *  3.2: Operation database
         */
        let infoData = await TRAINING__SUBJECT_COLL.findById(subjectID)
          .select(select)
          .populate(populates)
        if (!infoData)
          return resolve({
            error: true,
            message: "Can't get info subject",
            keyError: KEY_ERROR.GET_INFO_FAILED,
          })

        // Tạo bảng training_subject_seen
        await TRAINING__SUBJECT_SEEN_MODEL.insert({
          subjectID,
          userID,
          ctx,
        })

        let checkUserRating = await TRAINING__SUBJECT_RATING_COLL.findOne({
          lession: subjectID,
          userCreate: userID,
        }).select('score')
        infoData.useRated = checkUserRating

        return resolve({ error: false, data: infoData, status: 200 })
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
   * Name: Danh sách subject
   * Author: Depv
   * Code: F02505
   */
  getList({
    parentID,
    keyword,
    limit = 10,
    lastestID,
    select,
    populates = {},
  }) {
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }
        /**
         * DECALARTION VARIABLE (1)
         */
        let conditionObj = {}
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */

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

        if (checkObjectIDs(parentID)) {
          conditionObj.parent = parentID
        } else {
          conditionObj.parent = { $exists: false }
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          conditionObj.name = new RegExp(keyword, 'i')
        }

        let conditionObjOrg = { ...conditionObj }
        // PHÂN TRANG KIỂU MỚI
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await TRAINING__SUBJECT_COLL.findById(lastestID)
          if (!infoData)
            return resolve({
              error: true,
              message: "Can't get info lastest",
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

        let infoDataAfterGet = await TRAINING__SUBJECT_COLL.find(conditionObj)
          .select(select)
          .limit(limit + 1)
          .populate(populates)
          .sort(sortBy)
          .lean()

        if (!infoDataAfterGet)
          return resolve({
            error: true,
            message: 'Lấy danh sách thất bại',
            keyError: KEY_ERROR.GET_LIST_FAILED,
          })

        let nextCursor = null
        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await TRAINING__SUBJECT_COLL.count(conditionObjOrg)
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
}

exports.MODEL = new Model()
