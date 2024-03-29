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

const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')
/**
 * import inter-coll, exter-coll
 */
const TRAINING__SUBJECT_SEEN_COLL = require('../database/training.subject_seen-coll')
const TRAINING__SUBJECT_COLL = require('../database/training.subject-coll')

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
    super(TRAINING__SUBJECT_SEEN_COLL)
  }

  /**
   * Name: insert subject seen
   * Author: Depv
   * Code: F02501
   */
  insert({ subjectID, userID, ctx }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(subjectID))
          return resolve({
            error: true,
            message: 'Request params subjectID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        const checkExist = await TRAINING__SUBJECT_SEEN_COLL.findOne({
          subject: subjectID,
          userCreate: userID,
        })
        if (checkExist) {
          await TRAINING__SUBJECT_COLL.findByIdAndUpdate(
            subjectID,
            { $inc: { amountViews: 1 } },
            { new: true }
          )
          return resolve({ error: false, message: 'Ok', status: 200 })
        } else {
          let infoUser = await ctx.call(
            `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`,
            {
              userID,
              select: '_id company birthDay',
              populates: JSON.stringify({ path: 'company' }),
            }
          )

          const type = infoUser?.data?.company?.type
          const company = infoUser?.data?.company?._id
          const birthDay = infoUser?.data?.birthDay
          const yearCurrent = new Date().getFullYear()
          const yearBirthDay = new Date(birthDay).getFullYear()
          const age = yearCurrent - yearBirthDay

          // insert
          let dataInsert = { subject: subjectID, userCreate: userID }
          if (age) {
            dataInsert.age = age
          }

          if (company) {
            dataInsert.company = company
          }

          if (type) {
            dataInsert.type = type
          }

          let infoAfterInsert = await this.insertData(dataInsert)

          if (!infoAfterInsert)
            return resolve({
              error: true,
              message: "Can't insert",
              keyError: KEY_ERROR.INSERT_FAILED,
            })

          // Cập nhật amountUserViews
          await TRAINING__SUBJECT_COLL.findByIdAndUpdate(
            subjectID,
            { $inc: { amountUserViews: 1, amountViews: 1 } },
            { new: true }
          )
          return resolve({
            error: false,
            data: infoAfterInsert,
            status: 200,
          })
        }
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
  getList({ subjectID, limit = 10, lastestID, select, populates = {} }) {
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        if (!checkObjectIDs(subjectID))
          return resolve({
            error: true,
            message: 'Request params subjectID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

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

        let conditionObjOrg = { ...conditionObj }
        // PHÂN TRANG KIỂU MỚI
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await TRAINING__SUBJECT_SEEN_COLL.findById(lastestID)
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

        let infoDataAfterGet = await TRAINING__SUBJECT_SEEN_COLL.find(
          conditionObj
        )
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

        let totalRecord =
          await TRAINING__SUBJECT_SEEN_COLL.count(conditionObjOrg)
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
