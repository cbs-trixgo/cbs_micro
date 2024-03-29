'use strict'

/**
 * EXTERNAL PACKAGE
 */
const stringUtils = require('../../../tools/utils/string_utils')
const ObjectID = require('mongoose').Types.ObjectId

/**
 * CONSTANTS
 */

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const {
  checkObjectIDs,
  IsJsonString,
  _isValid,
} = require('../../../tools/utils/utils')

/**
 * COLLECTIONS
 */
const DATAHUB_JOBLINE_COLL = require('../database/datahub_jobline-coll')
const DATAHUB_PRODUCT_COLL = require('../database/datahub_product-coll')

const DATAHUB_JOB_MODEL = require('./datahub.datahub_job-model').MODEL
const DATAHUB_PRODUCT_MODEL = require('./datahub.datahub_product-model').MODEL

class Model extends BaseModel {
  constructor() {
    super(DATAHUB_JOBLINE_COLL)
  }

  /**
   * Name: Insert
   * Author: Hiepnh
   * Date: 01/5/2022
   */
  insert({ jobID, productID, quantity, note, userID }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        if (!_isValid(jobID) || !_isValid(productID) || !_isValid(userID))
          return resolve({ error: true, message: 'param_not_valid' })

        // Kiểm tra sự tồn tại của product trong job
        let info = await DATAHUB_JOBLINE_COLL.findOne({
          job: jobID,
          product: productID,
        })
        if (info) {
          return resolve({ error: true, message: 'data_exists' })
        } else {
          // Lấy giá của vật tư
          let infoProduct = await DATAHUB_PRODUCT_COLL.findById(productID)

          let dataInsert = {
            userCreate: userID,
            job: jobID,
            product: productID,
            quantity:
              quantity && !isNaN(quantity) ? Number(quantity).toFixed(3) : 0,
            unitprice: Number(infoProduct.unitprice).toFixed(3),
            type: Number(infoProduct.type),
            note,
          }

          let infoAfterInsert = await that.insertData(dataInsert)
          if (!infoAfterInsert)
            return resolve({
              error: true,
              message: 'cannot_insert',
            })

          // Cập nhật lại giá các công tác chứa Nguồn lực
          await DATAHUB_PRODUCT_MODEL.updateJobPrice({ jobID })

          return resolve({ error: false, data: infoAfterInsert })
        }
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Get info
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  getInfo({ joblineID, select, populates }) {
    console.log({ joblineID, select, populates })
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(joblineID))
          return resolve({ error: true, message: 'param_invalid' })

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

        let info = await DATAHUB_JOBLINE_COLL.findById(joblineID)
          .select(select)
          .populate(populates)

        if (!info) return resolve({ error: true, message: 'cannot_get' })

        return resolve({ error: false, data: info })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name  : Remove
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  remove({ joblineID, userID }) {
    return new Promise(async (resolve) => {
      try {
        if (!_isValid(userID))
          return resolve({ error: true, message: 'param_not_valid' })

        let info = await DATAHUB_JOBLINE_COLL.findById(joblineID)

        // Xóa định mức
        await DATAHUB_JOBLINE_COLL.findByIdAndDelete(joblineID)

        // Cập nhật giá công tác
        await DATAHUB_PRODUCT_MODEL.updateJobPrice({ jobID: info.job })

        return resolve({ error: false, message: 'Done' })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name  : Get list
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  getList({
    jobID,
    userID,
    keyword,
    limit = 50,
    lastestID,
    select,
    populates = {},
    sortKey,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (limit > 50) {
          limit = 50
        } else {
          limit = +limit
        }

        /**
         * DECALARTION VARIABLE (1)
         */
        let sortBy
        let conditionObj = {}
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

        if (sortKey && typeof sortKey === 'string') {
          if (!IsJsonString(sortKey))
            return resolve({
              error: true,
              message: 'Request params sortKey invalid',
              status: 400,
            })

          keys = JSON.parse(sortKey)
        }

        /**
         * LOGIC STEP (3)
         *  3.1: Convert type + update name (ví dụ: string -> number)
         *  3.2: Operation database
         */
        if (checkObjectIDs(jobID)) {
          conditionObj.job = jobID
        }
        console.log(conditionObj)

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          let regExpSearch = RegExp(keyword, 'i')
          conditionObj.name = regExpSearch
        }

        let conditionObjOrg = { ...conditionObj }

        // PHÂN TRANG KIỂU MỚI
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await DATAHUB_JOBLINE_COLL.findById(lastestID)
          if (!infoData)
            return resolve({
              error: true,
              message: "Can't get info lastest",
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

        let infoDataAfterGet = await DATAHUB_JOBLINE_COLL.find(conditionObj)
          .limit(limit + 1)
          .sort(sortBy)
          .select(select)
          .populate(populates)
          .lean()

        // GET TOTAL RECORD
        if (!infoDataAfterGet)
          return resolve({
            error: true,
            message: "Can't get data",
            status: 403,
          })

        let nextCursor = null
        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await DATAHUB_JOBLINE_COLL.count(conditionObjOrg)
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
