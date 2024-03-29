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
const TRAINING__SUBJECT_RATING_COLL = require('../database/training.subject_rating-coll')
const TRAINING__SUBJECT_COLL = require('../database/training.subject-coll')
const {
  RANGE_BASE_PAGINATION,
} = require('../../../tools/cursor_base/playground/index')

/**
 * import inter-model, exter-model
 */

/**
 * import util files
 */

class Model extends BaseModel {
  constructor() {
    super(TRAINING__SUBJECT_RATING_COLL)
  }

  /**
   * Name: insert subject rating
   * Author: Depv
   * Code: F02506
   */
  insert({ lession, score, userID }) {
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

        /**
         * LOGIC STEP (3)
         *  3.1: Convert type + update name (ví dụ: string -> number)
         *  3.2: Operation database
         */
        dataInsert = { userCreate: userID }

        if (lession) {
          dataInsert.lession = lession
        }

        if (score) {
          dataInsert.score = score
        }

        let checkExist = await TRAINING__SUBJECT_RATING_COLL.findOne({
          userCreate: userID,
          lession,
        })
        if (checkExist)
          return resolve({
            error: true,
            message: 'Bạn đã đánh giá bài học này',
            status: 400,
          })

        let infoAfterInsert = await this.insertData(dataInsert)
        // Update amountStars cho subject(lession)
        let { amountStars } = await TRAINING__SUBJECT_COLL.findById(lession)
        let starAVG = (Number(amountStars) + Number(score)) / 2
        starAVG = Number(starAVG).toFixed(1)
        // Cập nhật amountStars
        await TRAINING__SUBJECT_COLL.findByIdAndUpdate(
          lession,
          { amountStars: starAVG },
          { new: true }
        )

        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: "Can't insert subject",
            status: 403,
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
}

exports.MODEL = new Model()
