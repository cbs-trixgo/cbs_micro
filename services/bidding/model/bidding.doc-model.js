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
const BIDDING__BILL_WORK_COLL = require('../database/bidding.bill_work-coll')

/**
 * MODELS
 */

class Model extends BaseModel {
  constructor() {
    super(BIDDING__DOC_COLL)
  }

  /**
   * Name: Insert
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  insert({
    userID,
    planID,
    parentID,
    name,
    sign,
    note,
    releaseTime,
    closingTime,
    amount,
    companyOfAssigneeID,
    assigneeID,
    agreeStatus,
    bidPrice,
    bidPriceDiscount,
    bidPriceAdjustment,
    openedStatus,
    bidderID,
    tenderPrice,
    vatTenderPrice,
    factor1,
    factor2,
    factor3,
    factor4,
    factor5,
    vat,
    vatValue,
    ctx,
  }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID) || !checkObjectIDs(planID))
          return resolve({
            error: true,
            message: 'Request params planID|userID invalid',
            status: 400,
          })

        // Thông tin Kế hoạch
        let infoPlan = await BIDDING__PLAN_COLL.findById(planID)

        if (!infoPlan)
          return resolve({
            error: true,
            message: 'Can not get infoPlan',
            status: 400,
          })

        /**
         * KIỂM TRA DỮ LIỆU
         */
        let dataInsert = {
          userCreate: userID,
          field: infoPlan.field,
          area: infoPlan.area,
          client: infoPlan.client,
          project: infoPlan.project,
          contract: infoPlan.contract,
          admins: [userID],
          members: [userID],
          plan: planID,
        }

        // Hồ sơ mời thầu/Dự thầu
        if (name) {
          dataInsert.name = name
        }

        if (sign) {
          dataInsert.sign = sign
        }

        if (note) {
          dataInsert.note = note
        }

        if (releaseTime) {
          dataInsert.releaseTime = releaseTime
        }

        if (closingTime) {
          dataInsert.closingTime = closingTime
        }

        if (amount) {
          dataInsert.amount = amount
        }

        // Tạo hồ sơ dự thầu
        if (
          checkObjectIDs(parentID) &&
          checkObjectIDs(assigneeID) &&
          checkObjectIDs(companyOfAssigneeID)
        ) {
          dataInsert.parent = parentID
          dataInsert.companyOfAssignee = companyOfAssigneeID
          dataInsert.assignee = assigneeID
        }

        // Nộp thầu
        if (!isNaN(agreeStatus) && Number(agreeStatus) >= 0) {
          dataInsert.agreeStatus = agreeStatus
        }

        if (!isNaN(bidPrice) && Number(bidPrice) >= 0) {
          dataInsert.bidPrice = bidPrice
        }

        if (!isNaN(bidPriceDiscount) && Number(bidPriceDiscount) >= 0) {
          dataInsert.bidPriceDiscount = bidPriceDiscount
        }

        if (!isNaN(bidPriceAdjustment) && Number(bidPriceAdjustment) >= 0) {
          dataInsert.bidPriceAdjustment = bidPriceAdjustment
        }

        // Mở thầu
        if (!isNaN(openedStatus) && Number(openedStatus) >= 0) {
          dataInsert.openedStatus = openedStatus
        }

        // Hệ số giá
        if (!isNaN(factor1) && Number(factor1) >= 0) {
          dataInsert.factor1 = factor1
        }
        if (!isNaN(factor2) && Number(factor2) >= 0) {
          dataInsert.factor2 = factor2
        }
        if (!isNaN(factor3) && Number(factor3) >= 0) {
          dataInsert.factor3 = factor3
        }
        if (!isNaN(factor4) && Number(factor4) >= 0) {
          dataInsert.factor4 = factor4
        }
        if (!isNaN(factor5) && Number(factor5) >= 0) {
          dataInsert.factor5 = factor5
        }
        if (!isNaN(vat) && Number(vat) >= 0) {
          dataInsert.vat = vat
        }
        if (!isNaN(vatValue) && Number(vatValue) >= 0) {
          dataInsert.vatValue = vatValue
        }

        // Nhà thầu trúng thầu và thông tin trúng thầu
        if (checkObjectIDs(bidderID)) {
          dataInsert.bidder = bidderID
        }

        if (!isNaN(tenderPrice) && Number(tenderPrice) >= 0) {
          dataInsert.tenderPrice = tenderPrice
        }

        if (!isNaN(vatTenderPrice) && Number(vatTenderPrice) >= 0) {
          dataInsert.vatTenderPrice = vatTenderPrice
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
    docID,
    userID,
    ctx,
    name,
    sign,
    note,
    releaseTime,
    closingTime,
    amount,
    agreeStatus,
    bidPrice,
    bidPriceDiscount,
    bidPriceAdjustment,
    openedStatus,
    bidderID,
    tenderPrice,
    vatTenderPrice,
    timeApproved,
    factor1,
    factor2,
    factor3,
    factor4,
    factor5,
    vat,
    vatValue,
  }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        /**
         * NỘP THẦU VÀ MỞ THẦU
         * 1-Ngoài assigneeID => tất cả chỉ được xem nội dung hồ sơ dự sau thời điểm mở thầu
         * 2-Chỉ cho assigneeID nộp trước thời điểm closingTime (cập nhật thoải mái)
         * 3-Chỉ khi assigneeID đồng ý cho mở thầu (agreeStatus=1) => thì mới được mở thầu
         * 4-Chỉ bidOpeners mới được mở thầu
         * 5-Khi bidOpeners mở thầu => add vào mảng openedUsers (người đã mở thầu)
         * 6-Khi bidOpeners == openedUsers => openedStatus = 1
         */

        let infoDoc = await BIDDING__DOC_COLL.findById(docID)
        if (!infoDoc)
          return resolve({
            error: true,
            message: 'Can not get infoDoc',
            status: 400,
          })

        let dataUpdate = { userUpdate: userID }

        if (!checkObjectIDs(docID))
          return resolve({
            error: true,
            message: 'Mã không hợp lệ',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        if (checkObjectIDs(bidderID)) {
          dataUpdate.bidder = bidderID
        }

        if (name) {
          dataUpdate.name = name
        }

        if (sign) {
          dataUpdate.sign = sign
        }

        if (note) {
          dataUpdate.note = note
        }

        if (releaseTime) {
          dataUpdate.releaseTime = releaseTime
        }

        if (closingTime) {
          dataUpdate.closingTime = closingTime
        }

        if (amount) {
          dataUpdate.amount = amount
        }

        /**
         * Nộp thầu
         * Chỉ cho phép Người thực hiện được nộp thầu
         */

        if (infoDoc?.assignee?.toString() === userID.toString()) {
          if (!isNaN(agreeStatus) && Number(agreeStatus) === 1) {
            dataUpdate.agreeStatus = agreeStatus
          }

          if (!isNaN(bidPrice) && Number(bidPrice) >= 0) {
            dataUpdate.bidPrice = bidPrice
          }

          if (!isNaN(bidPriceDiscount) && Number(bidPriceDiscount) >= 0) {
            dataUpdate.bidPriceDiscount = bidPriceDiscount
          }

          if (!isNaN(bidPriceAdjustment) && Number(bidPriceAdjustment) >= 0) {
            dataUpdate.bidPriceAdjustment = bidPriceAdjustment
          }

          // if (timeApproved) {
          //     dataUpdate.timeApproved = timeApproved;
          // }
        }

        /**
         * Mở thầu
         * Kiểm tra nếu đủ người mở thầu => Cập nhật trạng thái sang 1
         */
        if (!isNaN(openedStatus) && Number(openedStatus) >= 0) {
          dataUpdate.openedStatus = openedStatus
        }

        // Hệ số giá
        if (!isNaN(factor1) && Number(factor1) >= 0) {
          dataUpdate.factor1 = factor1
        }
        if (!isNaN(factor2) && Number(factor2) >= 0) {
          dataUpdate.factor2 = factor2
        }
        if (!isNaN(factor3) && Number(factor3) >= 0) {
          dataUpdate.factor3 = factor3
        }
        if (!isNaN(factor4) && Number(factor4) >= 0) {
          dataUpdate.factor4 = factor4
        }
        if (!isNaN(factor5) && Number(factor5) >= 0) {
          dataUpdate.factor5 = factor5
        }
        if (!isNaN(vat) && Number(vat) >= 0) {
          dataUpdate.vat = vat
        }
        if (!isNaN(vatValue) && Number(vatValue) >= 0) {
          dataUpdate.vatValue = vatValue
        }

        // Nhà thầu trúng thầu và thông tin trúng thầu
        if (checkObjectIDs(bidderID)) {
          dataUpdate.bidder = bidderID
        }

        if (!isNaN(tenderPrice) && Number(tenderPrice) >= 0) {
          dataUpdate.tenderPrice = tenderPrice
        }

        if (!isNaN(vatTenderPrice) && Number(vatTenderPrice) >= 0) {
          dataUpdate.vatTenderPrice = vatTenderPrice
        }

        let infoAfterUpdate = await BIDDING__DOC_COLL.findByIdAndUpdate(
          docID,
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
  getInfo({ docID, userID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(docID))
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

        let info = await BIDDING__DOC_COLL.findById(docID)
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
    clientID,
    projectID,
    planID,
    parentID,
    bidderID,
    contractID,
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
        // Hồ sơ mời thầu của Kế hoạch đấu thầu
        if (checkObjectIDs(planID)) {
          conditionObj.plan = planID
        } else {
          // Hồ sơ dự thầu của Hồ sơ mời thầu
          if (checkObjectIDs(parentID)) {
            conditionObj.parent = parentID
          } else {
            if (checkObjectIDs(bidderID)) {
              conditionObj.bidder = bidderID
            }

            if (checkObjectIDs(contractID)) {
              conditionObj.contract = contractID
            }

            if (projectID && checkObjectIDs(projectID)) {
              conditionObj.project = projectID
            } else {
              if (checkObjectIDs(clientID)) {
                conditionObj.client = clientID
              }
            }
          }
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
          let infoData = await BIDDING__DOC_COLL.findById(lastestID)
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

        let infoDataAfterGet = await BIDDING__DOC_COLL.find(conditionObj)
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

        let totalRecord = await BIDDING__DOC_COLL.count(conditionObjOrg)
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
   * Name  : Cập nhật giá trị
   * Author: Hiepnh
   * Date  : 02/5/2022
   */
  updateValue({ option, docID, userID, ctx }) {
    return new Promise(async (resolve) => {
      try {
        let info = await BIDDING__DOC_COLL.findById(docID)
        if (!info)
          return resolve({
            error: true,
            message: 'info không hợp lệ',
            keyError: KEY_ERROR.PARAMS_INVALID,
            status: 400,
          })

        /**
         * DECALARTION VARIABLE (1)
         */
        let dataUpdate = {
          userUpdate: userID,
        }

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */

        /**
         * LOGIC STEP (3)
         * 3.1: Convert type + update name (ví dụ: string -> number)
         * 3.2: Operation database
         */
        // Cập nhật Theo thay đổi của công việc
        if (option && Number(option) === 1) {
          let listDataWork = await BIDDING__BILL_WORK_COLL.aggregate([
            {
              $match: {
                doc: ObjectID(docID),
              },
            },
            {
              $group: {
                _id: {},
                amount: { $sum: '$amount' },
              },
            },
          ])
          console.log(listDataWork)

          if (listDataWork && listDataWork.length) {
            dataUpdate.amount = Number(listDataWork[0].amount)

            if (info.quantity != 0) {
              dataUpdate.unitprice =
                Number(listDataWork[0].amount) / Number(info.quantity)
            } else {
              dataUpdate.unitprice = 0
            }
          }
        }

        let infoAfterUpdate = await BIDDING__DOC_COLL.findByIdAndUpdate(
          docID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
            keyError: "can't_update_contract_ipc",
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
}

exports.MODEL = new Model()
