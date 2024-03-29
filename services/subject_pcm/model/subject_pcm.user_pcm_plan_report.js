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
const ObjectID = require('mongoose').Types.ObjectId
const { KEY_ERROR } = require('../../../tools/keys')

/**
 * import inter-coll, exter-coll
 */
const PCM_PLAN_REPORT_COLL = require('../database/subject_pcm.pcm_plan_report-coll')
const USER_PCM_PLAN_REPORT_COLL = require('../database/subject_pcm.user_pcm_plan_report-coll')

const {
  RANGE_BASE_PAGINATION,
} = require('../../../tools/cursor_base/playground/index')

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
  constructor() {
    super(USER_PCM_PLAN_REPORT_COLL)
  }

  /**
   * Name: insert user_pcm_plan_report
   * Author: Depv
   * Code:
   */
  insert({ userID, subjectID, role, author }) {
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
            status: 400,
          })

        if (!checkObjectIDs(subjectID))
          return resolve({
            error: true,
            message: 'Request params subjectID invalid',
            status: 400,
          })

        /**
         * LOGIC STEP (3)
         * 3.1: Convert type + update name (ví dụ: string -> number)
         * 3.2: Operation database
         */
        let checkExist = await USER_PCM_PLAN_REPORT_COLL.findOne({
          user: userID,
          subject: subjectID,
        })

        if (checkExist)
          return resolve({
            error: true,
            message: 'User_subject_exist',
            status: 200,
          })

        dataInsert = { user: userID, subject: subjectID, author, role }

        let infoPlanReport = await PCM_PLAN_REPORT_COLL.findById(subjectID)
        if (infoPlanReport && infoPlanReport.parent) {
          dataInsert.parent = infoPlanReport.parent
        }

        let infoAfterInsert = await this.insertData(dataInsert)

        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: "Can't insert user_pcm_plan_report",
            keyError: KEY_ERROR.INSERT_FAILED,
            status: 200,
          })

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
   * Name: update user_pcm_plan_report
   * Author: Depv
   * Code:
   */
  update({ userSubjectID, role }) {
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

        if (!checkObjectIDs(userSubjectID))
          return resolve({
            error: true,
            message: 'Request params userSubjectID invalid',
            status: 400,
          })

        if (!role && ![2, 3].includes(role))
          return resolve({
            error: true,
            message: 'Request params role invalid',
            status: 400,
          })

        /**
         * LOGIC STEP (3)
         * 3.1: Convert type + update name (ví dụ: string -> number)
         * 3.2: Operation database
         */
        dataUpdate.role = role
        let infoAfterUpdate = await USER_PCM_PLAN_REPORT_COLL.findByIdAndUpdate(
          userSubjectID,
          dataUpdate,
          { new: true }
        )

        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: "Can't update user_pcm_plan_report",
            keyError: KEY_ERROR.UPDATE_FAILED,
            status: 200,
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
   * Name: insert user_pcm_plan_report
   * Author: Depv
   * Code:
   */
  remove({ userSubjectID }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(userSubjectID))
          return resolve({
            error: true,
            message: 'Request params userSubjectID invalid',
            status: 400,
          })

        /**
         * LOGIC STEP (3)
         * 3.1: Convert type + update name (ví dụ: string -> number)
         * 3.2: Operation database
         */

        let infoAterRemove =
          await USER_PCM_PLAN_REPORT_COLL.findByIdAndDelete(userSubjectID)

        if (!infoAterRemove)
          return resolve({
            error: true,
            message: "Can't remove user_pcm_plan_report",
            keyError: KEY_ERROR.DELETE_FAILED,
            status: 200,
          })

        return resolve({
          error: false,
          data: infoAterRemove,
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
   * Name: get info user_pcm_plan_report
   * Author: Depv
   * Code:
   */
  getInfo({ userSubjectID, select, populates = {} }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(userSubjectID))
          return resolve({
            error: true,
            message: 'Request params userSubjectID invalid',
            status: 400,
          })

        // populates
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
        let infoUserSubject = await USER_PCM_PLAN_REPORT_COLL.findById(
          userSubjectID
        )
          .select(select)
          .populate(populates)

        if (!infoUserSubject)
          return resolve({
            error: true,
            message: "Can't info user_pcm_plan_report",
            keyError: KEY_ERROR.GET_INFO_FAILED,
            status: 200,
          })

        return resolve({
          error: false,
          data: infoUserSubject,
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
   * Name: Danh sách user_pcm_plan_report
   * Author: Depv
   * Code:
   */
  getList({
    userID,
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
        let conditionFind = {}
        let sortBy = { createAt: -1 }
        let objSort = {}

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(parentID)) {
          conditionObj.parent = null
        } else {
          conditionObj.parent = parentID
        }

        if (checkObjectIDs(userID)) {
          conditionObj.user = userID
        }

        // populates
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
         *  3.1: Convert type + update name (ví dụ: string -> number)
         *  3.2: Operation database
         */
        // GET CONDITION PAGINATION
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await USER_PCM_PLAN_REPORT_COLL.findById(lastestID)
          if (!infoData)
            return resolve({
              error: true,
              message: "Can't get info last message",
              status: 400,
            })

          let nextInfo = `${infoData.createAt}_${infoData._id}`
          // Lưu ý nêu sắp xếp tăng dần thì sửa lại ['createAt__1', '_id__1'];
          let keys = ['createAt__-1', '_id__-1']
          let dataPagingAndSort = await RANGE_BASE_PAGINATION({
            nextInfo,
            keys,
          })
          if (!dataPagingAndSort || dataPagingAndSort.error)
            return resolve({
              error: true,
              message: "Can't get range pagination",
              status: 400,
            })
          conditionFind = dataPagingAndSort.data.find
          sortBy = dataPagingAndSort.data.sort
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          conditionObj.name = new RegExp(keyword, 'i')
        }

        let infoDataAfterGet = await USER_PCM_PLAN_REPORT_COLL.find(
          { ...conditionObj, ...conditionFind },
          { ...objSort }
        )
          .limit(+limit + 1)
          .sort(sortBy)
          .populate(populates)
          .lean()

        // GET TOTAL RECORD
        // let totalRecord = await USER_PCM_PLAN_REPORT_COLL.count(conditionObj);
        let totalCurrentPage =
          await USER_PCM_PLAN_REPORT_COLL.count(conditionFind)
        if (!infoDataAfterGet)
          return resolve({
            error: true,
            message: "Can't get data",
            keyError: KEY_ERROR.GET_LIST_FAILED,
            status: 200,
          })

        let totalRecord =
          await USER_PCM_PLAN_REPORT_COLL.countDocuments(conditionObj)
        let nextCursor = null
        let totalPage = Math.ceil(totalRecord / limit)

        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

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
