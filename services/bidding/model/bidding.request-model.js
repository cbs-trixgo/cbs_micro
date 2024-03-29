'use strict'

/**
 * EXTERNAL PACKAGE
 */
const ObjectID = require('mongoose').Types.ObjectId

/**
 * CONSTANTS
 */
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')

/**
 * TOOLS
 */
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const BaseModel = require('../../../tools/db/base_model')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys/index')

/**
 * COLLECTIONS
 */
const BIDDING__PLAN_COLL = require('../database/bidding.plan-coll')
const BIDDING__DOC_COLL = require('../database/bidding.doc-coll')
const BIDDING__REQUEST_COLL = require('../database/bidding.request-coll')
const BIDDING__APPLY_COLL = require('../database/bidding.apply-coll')

/**
 * MODELS
 */

class Model extends BaseModel {
  constructor() {
    super(BIDDING__REQUEST_COLL)
  }

  /**
   * Name: Insert
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  insert({
    userID,
    ctx,
    docID,
    type,
    order,
    invitationLetter,
    procuringEntity,
    client,
    project,
    packageInfo,
    projectAddress,
    projectInfo,
    scopeOfPackage,
    duration,
    contractType,
    documentIntroduction,
    language,
    currency,
    method,
    validity,
    security,
    securityValidity,
    bidsClarification,
    documentsClarification,
    alternative,
    subcontractor,
    deadline,
    evaluation,
    negotiation,
    biddingSolution,
    biddingExpense,
    biddingOther,
    contractCondition,
    name,
    position,
    unit,
    description,
    note,
  }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID) || !checkObjectIDs(docID))
          return resolve({
            error: true,
            message: 'Request params docID|userID invalid',
            status: 400,
          })

        // Kiểm tra sự tồn tại của Bảng dữ liệu
        if (!isNaN(type) && Number(type) === 1) {
          let infoRequest = await BIDDING__REQUEST_COLL.findOne({
            doc: docID,
            type: 1,
          })
          console.log(infoRequest)

          if (infoRequest)
            return resolve({
              error: true,
              message: 'Bảng dữ liệu đã tồn tại',
              status: 400,
            })
        }

        // Thông tin Hồ sơ mời thầu
        let infoDoc = await BIDDING__DOC_COLL.findById(docID)
        console.log(infoDoc)

        let dataInsert = {
          userCreate: userID,
          doc: docID,
          client: infoDoc.client,
          project: infoDoc.project,
          plan: infoDoc.plan,
        }

        if (!isNaN(type) && Number(type) > 0) {
          dataInsert.type = type
        }

        if (!isNaN(order) && Number(order) > 0) {
          dataInsert.order = order
        }

        /**
         * CHUNG
         */
        if (name) {
          dataInsert.name = name
        }
        if (unit) {
          dataInsert.unit = unit
        }
        if (note) {
          dataInsert.note = note
        }
        if (position) {
          dataInsert.position = position
        }
        if (description) {
          dataInsert.description = description
        }

        /**
         * BẢNG DỮ LIỆU
         */
        if (invitationLetter) {
          dataInsert.invitationLetter = invitationLetter
        }
        if (procuringEntity) {
          dataInsert.procuringEntity = procuringEntity
        }
        if (client) {
          dataInsert.client = client
        }
        if (project) {
          dataInsert.project = project
        }
        if (packageInfo) {
          dataInsert.package = packageInfo
        }
        if (projectAddress) {
          dataInsert.projectAddress = projectAddress
        }
        if (projectInfo) {
          dataInsert.projectInfo = projectInfo
        }
        if (scopeOfPackage) {
          dataInsert.scopeOfPackage = scopeOfPackage
        }
        if (!isNaN(duration) && Number(duration) > 0) {
          dataInsert.duration = duration
        }
        if (contractType) {
          dataInsert.contractType = contractType
        }
        if (documentIntroduction) {
          dataInsert.documentIntroduction = documentIntroduction
        }
        if (language) {
          dataInsert.language = language
        }
        if (currency) {
          dataInsert.currency = currency
        }
        if (method) {
          dataInsert.method = method
        }
        if (validity) {
          dataInsert.validity = validity
        }
        if (!isNaN(security) && Number(security) > 0) {
          dataInsert.security = security
        }
        if (securityValidity) {
          dataInsert.securityValidity = securityValidity
        }
        if (bidsClarification) {
          dataInsert.bidsClarification = bidsClarification
        }
        if (documentsClarification) {
          dataInsert.documentsClarification = documentsClarification
        }
        if (alternative) {
          dataInsert.alternative = alternative
        }
        if (subcontractor) {
          dataInsert.subcontractor = subcontractor
        }
        if (deadline) {
          dataInsert.deadline = deadline
        }
        if (evaluation) {
          dataInsert.evaluation = evaluation
        }
        if (negotiation) {
          dataInsert.negotiation = negotiation
        }
        if (biddingSolution) {
          dataInsert.biddingSolution = biddingSolution
        }
        if (!isNaN(biddingExpense) && Number(biddingExpense) > 0) {
          dataInsert.biddingExpense = biddingExpense
        }
        if (biddingOther) {
          dataInsert.biddingOther = biddingOther
        }
        if (contractCondition) {
          dataInsert.contractCondition = contractCondition
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: 'Thêm thất bại',
            keyError: KEY_ERROR.INSERT_FAILED,
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

  /**
   * Name: Update
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  update({
    requestID,
    userID,
    ctx,
    type,
    order,
    invitationLetter,
    procuringEntity,
    client,
    project,
    packageInfo,
    projectAddress,
    projectInfo,
    scopeOfPackage,
    duration,
    contractType,
    documentIntroduction,
    language,
    currency,
    method,
    validity,
    security,
    securityValidity,
    bidsClarification,
    documentsClarification,
    alternative,
    subcontractor,
    deadline,
    evaluation,
    negotiation,
    biddingSolution,
    biddingExpense,
    biddingOther,
    contractCondition,
    name,
    position,
    unit,
    description,
    note,
  }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let dataUpdate = {
          userUpdate: userID,
        }

        if (!checkObjectIDs(requestID))
          return resolve({
            error: true,
            message: 'Mã không hợp lệ',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        if (!isNaN(type) && Number(type) > 0) {
          dataUpdate.type = type
        }

        if (!isNaN(order) && Number(order) > 0) {
          dataUpdate.order = order
        }

        /**
         * CHUNG
         */
        if (name) {
          dataUpdate.name = name
        }
        if (unit) {
          dataUpdate.unit = unit
        }
        if (note) {
          dataUpdate.note = note
        }
        if (position) {
          dataUpdate.position = position
        }
        if (description) {
          dataUpdate.description = description
        }

        /**
         * BẢNG DỮ LIỆU
         */
        if (invitationLetter) {
          dataUpdate.invitationLetter = invitationLetter
        }
        if (procuringEntity) {
          dataUpdate.procuringEntity = procuringEntity
        }
        if (client) {
          dataUpdate.client = client
        }
        if (project) {
          dataUpdate.project = project
        }
        if (packageInfo) {
          dataUpdate.package = packageInfo
        }
        if (projectAddress) {
          dataUpdate.projectAddress = projectAddress
        }
        if (projectInfo) {
          dataUpdate.projectInfo = projectInfo
        }
        if (scopeOfPackage) {
          dataUpdate.scopeOfPackage = scopeOfPackage
        }
        if (!isNaN(duration) && Number(duration) > 0) {
          dataUpdate.duration = duration
        }
        if (contractType) {
          dataUpdate.contractType = contractType
        }
        if (documentIntroduction) {
          dataUpdate.documentIntroduction = documentIntroduction
        }
        if (language) {
          dataUpdate.language = language
        }
        if (currency) {
          dataUpdate.currency = currency
        }
        if (method) {
          dataUpdate.method = method
        }
        if (validity) {
          dataUpdate.validity = validity
        }
        if (!isNaN(security) && Number(security) > 0) {
          dataUpdate.security = security
        }
        if (securityValidity) {
          dataUpdate.securityValidity = securityValidity
        }
        if (bidsClarification) {
          dataUpdate.bidsClarification = bidsClarification
        }
        if (documentsClarification) {
          dataUpdate.documentsClarification = documentsClarification
        }
        if (alternative) {
          dataUpdate.alternative = alternative
        }
        if (subcontractor) {
          dataUpdate.subcontractor = subcontractor
        }
        if (deadline) {
          dataUpdate.deadline = deadline
        }
        if (evaluation) {
          dataUpdate.evaluation = evaluation
        }
        if (negotiation) {
          dataUpdate.negotiation = negotiation
        }
        if (biddingSolution) {
          dataUpdate.biddingSolution = biddingSolution
        }
        if (!isNaN(biddingExpense) && Number(biddingExpense) > 0) {
          dataUpdate.biddingExpense = biddingExpense
        }
        if (biddingOther) {
          dataUpdate.biddingOther = biddingOther
        }
        if (contractCondition) {
          dataUpdate.contractCondition = contractCondition
        }

        let infoAfterUpdate = await BIDDING__REQUEST_COLL.findByIdAndUpdate(
          requestID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
            keyError: KEY_ERROR.UPDATE_FAILED,
            status: 403,
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
   * Name: Remove
   * Author: Hiepnh
   * Date: 30/4/2022
   */

  /**
   * Name: Get info
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  getInfo({ requestID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(requestID))
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

        let info = await BIDDING__REQUEST_COLL.findById(requestID)
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
   * Name  : Get list
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  getList({
    type,
    docID,
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
        if (checkObjectIDs(docID)) {
          conditionObj.doc = docID
        }

        if (!isNaN(type) && Number(type) > 0) {
          conditionObj.type = type
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
          let infoData = await BIDDING__REQUEST_COLL.findById(lastestID)
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

        let infoDataAfterGet = await BIDDING__REQUEST_COLL.find(conditionObj)
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

        let totalRecord = await BIDDING__REQUEST_COLL.count(conditionObjOrg)
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
