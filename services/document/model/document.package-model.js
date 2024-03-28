'use strict'

/**
 * EXTERNAL PACKAGE
 */
const stringUtils = require('../../../tools/utils/string_utils')
const ObjectID = require('mongoose').Types.ObjectId
const { KEY_ERROR } = require('../../../tools/keys/index')

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
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')

/**
 * COLLECTIONS
 */
const DOCUMENT__PACKAGE_COLL = require('../database/document.package-coll')

class Model extends BaseModel {
  constructor() {
    super(DOCUMENT__PACKAGE_COLL)
  }

  /**
   * Name: Insert
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  insert({
    userID,
    parentID,
    fieldID,
    areaID,
    projectID,
    bidderID,
    contractID,
    type,
    name,
    sign,
    description,
    note,
    status,
    percentOfCompletedPackage,
    startTime,
    finishTime,
    actualStartTime,
    closingTime,
    actualFinishTime,
    form,
    contractType,
    duration,
    progress,
    packagePrice,
    tenderPrice,
    vatTenderPrice,
    ctx,
  }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID) || !checkObjectIDs(projectID))
          return resolve({
            error: true,
            message: 'Request params projectID|companyID|userID invalid',
          })

        // Thông tin dự án
        let infoProject = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
          {
            departmentID: projectID,
            select: '_id name sign company area',
          }
        )

        if (!infoProject)
          return resolve({
            error: true,
            message: 'Can not get Project info',
          })

        let dataInsert = {
          userCreate: userID,
          area: infoProject?.data?.area,
          client: infoProject.data.company,
          admins: [userID],
          members: [userID],
        }

        if (checkObjectIDs(parentID)) {
          dataInsert.parent = parentID
        }

        if (checkObjectIDs(fieldID)) {
          dataInsert.field = fieldID
        }

        if (checkObjectIDs(areaID)) {
          dataInsert.area = areaID
        }

        if (checkObjectIDs(projectID)) {
          dataInsert.project = projectID
        }

        if (checkObjectIDs(bidderID)) {
          dataInsert.bidder = bidderID
        }

        if (checkObjectIDs(contractID)) {
          dataInsert.contract = contractID
        }

        if (!isNaN(type) && Number(type) > 0) {
          dataInsert.type = type
        }

        if (!isNaN(status) && Number(status) > 0) {
          dataInsert.status = status
        }

        if (
          !isNaN(percentOfCompletedPackage) &&
          Number(percentOfCompletedPackage) > 0
        ) {
          dataInsert.percentOfCompletedPackage = percentOfCompletedPackage
        }

        if (!isNaN(form) && Number(form) > 0) {
          dataInsert.form = form
        }

        if (!isNaN(contractType) && Number(contractType) > 0) {
          dataInsert.contractType = contractType
        }

        if (!isNaN(duration) && Number(duration) > 0) {
          dataInsert.duration = duration
        }

        if (!isNaN(progress) && Number(progress) > 0) {
          dataInsert.progress = progress
        }

        if (name) {
          dataInsert.name = name
        }

        if (sign) {
          dataInsert.sign = sign
        }

        if (description) {
          dataInsert.description = description
        }

        if (note) {
          dataInsert.note = note
        }

        if (startTime) {
          dataInsert.startTime = startTime
        }

        if (finishTime) {
          dataInsert.finishTime = finishTime
        }

        if (actualStartTime) {
          dataInsert.actualStartTime = actualStartTime
        }

        if (actualFinishTime) {
          dataInsert.actualFinishTime = actualFinishTime
        }

        if (closingTime) {
          dataInsert.closingTime = closingTime
        }

        if (!isNaN(packagePrice) && Number(packagePrice) > 0) {
          dataInsert.packagePrice = packagePrice
        }

        if (!isNaN(tenderPrice) && Number(tenderPrice) > 0) {
          dataInsert.tenderPrice = tenderPrice
        }

        if (!isNaN(vatTenderPrice) && Number(vatTenderPrice) > 0) {
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

        /**
         * CẬP NHẬT THÔNG TIN LẠI VỀ DỰ ÁN
         */
        // Tính toán số lượng, giá trị
        let infoCal = await that.getAmountByObject({
          userID,
          projectID,
        })

        // Cập nhật vào thông tin dự án
        if (infoCal) {
          infoProject = await ctx.call(
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
            {
              departmentID: projectID,
              numberOfPackage: infoCal.data.numberOfPackage,
              numberOfUnexecutedPackage: infoCal.data.numberOfUnexecutedPackage,
              numberOfExecutedPackage: infoCal.data.numberOfExecutedPackage,
              numberOfCompletedPackage: infoCal.data.numberOfCompletedPackage,
              amountOfUnexecutedPackage: infoCal.data.amountOfUnexecutedPackage,
              amountOfExecutedPackage: infoCal.data.amountOfExecutedPackage,
              amountOfCompletedPackage: infoCal.data.amountOfCompletedPackage,
              percentOfCompletedPackage: infoCal.data.percentOfCompletedPackage,
            }
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
   * Name: Update
   * Author: Hiepnh
   * Date: 30/4/2022
   */
  update({
    packageID,
    userID,
    ctx,
    fieldID,
    bidderID,
    contractID,
    type,
    name,
    sign,
    description,
    note,
    status,
    percentOfCompletedPackage,
    startTime,
    finishTime,
    actualStartTime,
    closingTime,
    actualFinishTime,
    form,
    contractType,
    duration,
    progress,
    packagePrice,
    tenderPrice,
    vatTenderPrice,
    members,
    membersRemove,
    admins,
    adminsRemove,
  }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        let dataUpdate = { userUpdate: userID, modifyAt: Date.now() }

        if (!checkObjectIDs(packageID))
          return resolve({
            error: true,
            message: 'Mã không hợp lệ',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        // Thông tin dự án
        let infoPlan = await DOCUMENT__PACKAGE_COLL.findById(packageID)
        if (!infoPlan)
          return resolve({
            error: true,
            message: 'Can not get info',
            status: 400,
          })

        if (checkObjectIDs(fieldID)) {
          dataUpdate.field = fieldID
        }

        if (checkObjectIDs(bidderID)) {
          dataUpdate.bidder = bidderID
        }

        if (checkObjectIDs(contractID)) {
          dataUpdate.contract = contractID
        }

        if (!isNaN(type) && Number(type) > 0) {
          dataUpdate.type = type
        }

        if (!isNaN(status) && Number(status) > 0) {
          dataUpdate.status = status
        }

        if (
          !isNaN(percentOfCompletedPackage) &&
          Number(percentOfCompletedPackage) > 0
        ) {
          dataUpdate.percentOfCompletedPackage = percentOfCompletedPackage
        }

        if (!isNaN(form) && Number(form) > 0) {
          dataUpdate.form = form
        }

        if (!isNaN(contractType) && Number(contractType) > 0) {
          dataUpdate.contractType = contractType
        }

        if (!isNaN(duration) && Number(duration) > 0) {
          dataUpdate.duration = duration
        }

        if (!isNaN(progress) && Number(progress) > 0) {
          dataUpdate.progress = progress
        }

        if (name) {
          dataUpdate.name = name
        }

        if (sign) {
          dataUpdate.sign = sign
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

        if (description) {
          dataUpdate.description = description
        }

        if (note) {
          dataUpdate.note = note
        }

        if (startTime) {
          dataUpdate.startTime = startTime
        }

        if (finishTime) {
          dataUpdate.finishTime = finishTime
        }

        if (actualStartTime) {
          dataUpdate.actualStartTime = actualStartTime
        }

        if (actualFinishTime) {
          dataUpdate.actualFinishTime = actualFinishTime
        }

        if (closingTime) {
          dataUpdate.closingTime = closingTime
        }

        if (!isNaN(packagePrice) && Number(packagePrice) > 0) {
          dataUpdate.packagePrice = packagePrice
        }

        if (!isNaN(tenderPrice) && Number(tenderPrice) > 0) {
          dataUpdate.tenderPrice = tenderPrice
        }

        if (!isNaN(vatTenderPrice) && Number(vatTenderPrice) > 0) {
          dataUpdate.vatTenderPrice = vatTenderPrice
        }

        let infoAfterUpdate = await DOCUMENT__PACKAGE_COLL.findByIdAndUpdate(
          packageID,
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

        /**
         * CẬP NHẬT THÔNG TIN LẠI VỀ DỰ ÁN
         */
        // Tính toán số lượng, giá trị
        let infoCal = await that.getAmountByObject({
          userID,
          projectID: infoPlan.project,
        })
        // Cập nhật vào thông tin dự án
        if (infoCal) {
          let infoProject = await ctx.call(
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
            {
              departmentID: `${infoPlan.project}`,
              numberOfPackage: infoCal.data.numberOfPackage,
              numberOfUnexecutedPackage: infoCal.data.numberOfUnexecutedPackage,
              numberOfExecutedPackage: infoCal.data.numberOfExecutedPackage,
              numberOfCompletedPackage: infoCal.data.numberOfCompletedPackage,
              amountOfUnexecutedPackage: infoCal.data.amountOfUnexecutedPackage,
              amountOfExecutedPackage: infoCal.data.amountOfExecutedPackage,
              amountOfCompletedPackage: infoCal.data.amountOfCompletedPackage,
              percentOfCompletedPackage: infoCal.data.percentOfCompletedPackage,
            }
          )
        }

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
   * Name: get info document package
   * Author: Depv
   * Code:
   */
  getInfo({ packageID, select, populates }) {
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
        if (!checkObjectIDs(packageID))
          return resolve({
            error: true,
            message: 'Request params packageID invalid',
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
        let infoAterGet = await DOCUMENT__PACKAGE_COLL.findById(packageID)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoAterGet)
          return resolve({
            error: true,
            message: "can't_get_info",
            status: 403,
          })

        return resolve({ error: false, data: infoAterGet, status: 200 })
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
   * Func: Lấy danh sách gói thầu
   * Date: 26/10/2021
   */
  getListPackage({
    departmentID,
    parentID,
    status,
    userID,
    lastestID,
    isShowAll,
    keyword,
    limit = 10,
    select,
    populates = {},
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(departmentID))
          return resolve({
            error: true,
            message: 'Request params departmentID invalid',
            status: 400,
          })

        let conditionObj = {
          members: { $in: [userID] },
          project: departmentID,
        }
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

        // Nếu có trường này thì lấy tất cả group trong dự án mà mình có thể không là members
        if (isShowAll == '1') {
          delete conditionObj.members
        }

        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
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

        if (status && !isNaN(status)) {
          conditionObj.status = +status
        }

        if (parentID && checkObjectIDs(parentID)) {
          conditionObj.parent = parentID
        }

        // SEARCH TEXT
        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          let regSearch = new RegExp(keyword, 'i')
          conditionObj.$or = [{ name: regSearch }, { sign: regSearch }]
        }
        // console.log(conditionObj)
        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await DOCUMENT__PACKAGE_COLL.findById(lastestID)
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

        let listPackages = await DOCUMENT__PACKAGE_COLL.find(conditionObj)
          .limit(limit + 1)
          .select(select)
          .populate(populates)
          .sort(sortBy)
          .lean()

        // GET TOTAL RECORD
        let totalRecord = await DOCUMENT__PACKAGE_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)
        let nextCursor = null

        if (listPackages && listPackages.length) {
          if (listPackages.length > limit) {
            nextCursor = listPackages[limit - 1]._id
            listPackages.length = limit
          }
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listPackages,
            limit,
            totalRecord,
            totalPage,
            nextCursor,
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
   * Name: Gom nhóm theo đối tượng
   * Author: Hiepnh
   * Date: 30/04/2022
   */
  getAmountByObject({ userID, projectID }) {
    return new Promise(async (resolve) => {
      try {
        let numberOfPackage = 0,
          numberOfUnexecutedPackage = 0,
          numberOfExecutedPackage = 0,
          numberOfCompletedPackage = 0,
          amountOfUnexecutedPackage = 0,
          amountOfExecutedPackage = 0,
          amountOfCompletedPackage = 0,
          totalFinishAmount = 0,
          percentOfCompletedPackage = 0

        let conditionObj = {}

        if (projectID && checkObjectIDs(projectID)) {
          conditionObj.project = ObjectID(projectID)
        }

        // Tính tổng theo phân loại
        let listData = await DOCUMENT__PACKAGE_COLL.aggregate([
          {
            $match: conditionObj,
          },
          {
            $group: {
              _id: { status: '$status' }, // Phân loại trạng thái
              count: { $sum: 1 }, // Tính tổng số lượng
              amount: { $sum: '$packagePrice' }, // Tổng giá trị các gói
              totalFinishAmount: {
                $sum: {
                  $multiply: [
                    '$percentOfCompletedPackage',
                    '$packagePrice',
                    0.01,
                  ],
                },
              }, // Tổng giá trị hoàn thành
            },
          },
          {
            $sort: { '_id.status': 1 },
          },
        ])
        if (listData && listData.length) {
          for (const item of listData) {
            if (Number(item._id.status) === 1) {
              numberOfUnexecutedPackage = Number(item.count)
              amountOfUnexecutedPackage = Number(item.amount)
              totalFinishAmount =
                Number(totalFinishAmount) + Number(item.totalFinishAmount)
            }

            if (Number(item._id.status) === 2) {
              numberOfExecutedPackage = Number(item.count)
              amountOfExecutedPackage = Number(item.amount)
              totalFinishAmount =
                Number(totalFinishAmount) + Number(item.totalFinishAmount)
            }

            if (Number(item._id.status) === 3) {
              numberOfCompletedPackage = Number(item.count)
              amountOfCompletedPackage = Number(item.amount)
              totalFinishAmount =
                Number(totalFinishAmount) + Number(item.totalFinishAmount)
            }
          }

          numberOfPackage =
            Number(numberOfUnexecutedPackage) +
            Number(numberOfExecutedPackage) +
            Number(numberOfCompletedPackage)
        }

        if (
          Number(
            amountOfUnexecutedPackage +
              amountOfExecutedPackage +
              amountOfCompletedPackage
          ) != 0
        ) {
          percentOfCompletedPackage =
            100 *
            (Number(totalFinishAmount) /
              Number(
                amountOfUnexecutedPackage +
                  amountOfExecutedPackage +
                  amountOfCompletedPackage
              ))
        }
        percentOfCompletedPackage = percentOfCompletedPackage.toFixed(2)
        return resolve({
          error: false,
          data: {
            numberOfPackage,
            numberOfUnexecutedPackage,
            numberOfExecutedPackage,
            numberOfCompletedPackage,
            amountOfUnexecutedPackage,
            amountOfExecutedPackage,
            amountOfCompletedPackage,
            percentOfCompletedPackage,
          },
        })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Báo cáo lựa chọn nhà thầu
   * Author: Depv
   * Date: 18/05/2022
   */
  contractorSelection({ userID, projectID }) {
    return new Promise(async (resolve) => {
      try {
        let conditionObj = {}

        if (!checkObjectIDs(projectID)) {
          return resolve({
            error: true,
            message: 'projectID không hợp lệ',
          })
        } else {
          conditionObj.project = ObjectID(projectID)
        }

        let listData = await DOCUMENT__PACKAGE_COLL.aggregate([
          {
            $match: conditionObj,
          },
          {
            $group: {
              _id: { status: '$status' }, // Phân loại trạng thái
              amount: { $sum: 1 }, // số lượng gói thầu
              amountPackagePrice: { $sum: '$packagePrice' }, // Tổng giá trị các gói
            },
          },
          {
            $sort: { '_id.status': 1 },
          },
        ])

        return resolve({ error: false, data: listData })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }
}

exports.MODEL = new Model()
