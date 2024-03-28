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
const ObjectID = require('mongoose').Types.ObjectId

/**
 * DOMAIN AND ACTIONS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../helper/item.actions-constant')

/**
 * TOOLS
 */
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const {
  getCurrentPage,
} = require('../../../tools/utils/calculate_current_page')

/**
 * COLLECTIONS
 */
const ITEM__FUNDA_COLL = require('../database/item.funda-coll')
const ITEM__AREA_COLL = require('../database/item.area-coll')
const ITEM__CONTACT_COLL = require('../../item/database/item.contact-coll')

class Model extends BaseModel {
  constructor() {
    super(ITEM__FUNDA_COLL)
  }

  /**
   * Dev : Depv
   * Func: Tạo account
   * Date: 13/12/2021
   */
  insert({
    companyID,
    parentID,
    platform,
    name,
    sign,
    description,
    phone,
    bankAccount,
    address,
    initialDay,
    campaign,
    internal,
    area,
    materialExpenseRate,
    materialExpense,
    planExpense,
    utilityExpense,
    humanExpense,
    otherExpense,
    userID,
    activeCampaign,
    loyaltyPointsRate,
    trainStaffSalar,
    trialStaffSalary,
    officialStaffSalar,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!name || !checkObjectIDs(area))
          return resolve({
            error: true,
            message: 'Tên|Khu vực không hợp lệ',
            keyError: 'Request params name invalid',
          })

        // Link danh bạ
        let infoContact = await ITEM__CONTACT_COLL.findOne({
          company: companyID,
          isDefault: 2,
        })

        let dataInsert = {
          userCreate: userID,
          company: companyID,
          name,
          admins: [userID],
          members: [userID],
        }

        //_________Khu vực (phường/xã)
        let infoArea = await ITEM__AREA_COLL.findById(area).populate({
          path: 'parent',
          select: '_id name',
          populate: {
            path: 'parent',
            select: '_id name',
          },
        })
        // console.log(infoArea)
        if (Number(infoArea.level) != 3)
          return resolve({
            error: true,
            message: 'Khu vực chọn cần phải là Phường/Xã',
            keyError: 'Request params name invalid',
          })

        dataInsert.area3 = area
        dataInsert.area2 = infoArea.parent._id
        dataInsert.area1 = infoArea.parent.parent._id

        // Link danh bạ
        if (infoContact) {
          dataInsert.contact = infoContact._id
        }

        if (checkObjectIDs(activeCampaign)) {
          dataInsert.activeCampaign = activeCampaign
        }

        if (checkObjectIDs(parentID)) {
          dataInsert.parent = parentID
        }

        if (sign && sign != '') {
          dataInsert.sign = sign
        }

        if (phone && phone != '') {
          dataInsert.phone = phone
        }

        if (bankAccount && bankAccount != '') {
          dataInsert.bankAccount = bankAccount
        }

        if (description && description != '') {
          dataInsert.description = description
        }

        if (address && address != '') {
          dataInsert.address = address
        }

        if (initialDay && initialDay != '') {
          dataInsert.initialDay = initialDay
        }

        if (platform && !isNaN(platform) && [1, 2].includes(platform)) {
          dataInsert.platform = +platform
        }

        if (trainStaffSalar && !isNaN(trainStaffSalar)) {
          dataInsert.trainStaffSalar = +trainStaffSalar
        }
        if (trialStaffSalary && !isNaN(trialStaffSalary)) {
          dataInsert.trialStaffSalary = +trialStaffSalary
        }
        if (officialStaffSalar && !isNaN(officialStaffSalar)) {
          dataInsert.officialStaffSalar = +officialStaffSalar
        }

        //_________Bật hoặc tắt chiến dịch truyền thông
        if (campaign && !isNaN(campaign) && [1, 2].includes(campaign)) {
          dataInsert.campaign = +campaign
        }

        //_________Phân loại trong hệ thống hoặc nhượng quyền
        if (internal && !isNaN(internal) && [1, 2].includes(internal)) {
          dataInsert.internal = +internal
        }

        //_________Tỷ lệ tích điểm
        if (loyaltyPointsRate && !isNaN(loyaltyPointsRate)) {
          dataInsert.loyaltyPointsRate = +loyaltyPointsRate
        }

        /**
         * Chi phí vận hành
         */
        if (!isNaN(materialExpenseRate)) {
          dataInsert.materialExpenseRate = Number(materialExpenseRate)
        }

        if (!isNaN(materialExpense)) {
          dataInsert.materialExpense = Number(materialExpense)
        }

        if (!isNaN(planExpense)) {
          dataInsert.planExpense = Number(planExpense)
        }

        if (!isNaN(utilityExpense)) {
          dataInsert.utilityExpense = Number(utilityExpense)
        }

        if (!isNaN(humanExpense)) {
          dataInsert.humanExpense = Number(humanExpense)
        }

        if (!isNaN(otherExpense)) {
          dataInsert.otherExpense = Number(otherExpense)
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({ error: true, message: 'cannot_insert' })

        // Cập nhật amountChilds cho phần tử cha
        if (checkObjectIDs(parentID)) {
          await ITEM__FUNDA_COLL.findByIdAndUpdate(
            parentID,
            { $inc: { amountChilds: 1 } },
            { new: true }
          )
        }

        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Dev : Depv
   * Func: update account
   * Date: 13/12/2021
   */
  update({
    fundaID,
    projectID,
    platform,
    name,
    sign,
    description,
    phone,
    bankAccount,
    bankQrcode,
    address,
    initialDay,
    members,
    admins,
    membersRemove,
    adminsRemove,
    getNotification,
    getNotificationRemove,
    campaign,
    internal,
    area,
    materialExpenseRate,
    materialExpense,
    planExpense,
    utilityExpense,
    humanExpense,
    otherExpense,
    userID,
    activeCampaign,
    loyaltyPointsRate,
    imagesID,
    manager,
    trainStaffSalar,
    trialStaffSalary,
    officialStaffSalar,
    lunchStaffAllowance,
  }) {
    // console.log({ fundaID, platform, name, sign, description, address, initialDay, members, admins, membersRemove, adminsRemove, getNotification, getNotificationRemove, campaign, internal, area, materialExpenseRate, materialExpense, planExpense, utilityExpense, humanExpense, otherExpense, userID, activeCampaign, imagesID, bankQrcode })
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(fundaID))
          return resolve({
            error: true,
            message: 'name|fundaID không hợp lệ',
            keyError: 'Request params fundaID invalid',
          })

        let dataUpdate = {
          userUpdate: userID,
          modifyAt: new Date(),
        }
        if (area) {
          //_________Khu vực (phường/xã)
          let infoArea = await ITEM__AREA_COLL.findById(area).populate({
            path: 'parent',
            select: '_id name',
            populate: {
              path: 'parent',
              select: '_id name',
            },
          })
          // console.log(infoArea)
          if (Number(infoArea.level) != 3)
            return resolve({
              error: true,
              message: 'Khu vực chọn cần phải là Phường/Xã',
              keyError: 'Request params name invalid',
            })

          dataUpdate.area3 = area
          dataUpdate.area2 = infoArea.parent._id
          dataUpdate.area1 = infoArea.parent.parent._id
        }

        if (checkObjectIDs(activeCampaign)) {
          dataUpdate.activeCampaign = activeCampaign
        }

        if (projectID && checkObjectIDs(projectID)) {
          dataUpdate.project = projectID
        }

        if (manager && checkObjectIDs(manager)) {
          dataUpdate.manager = manager
        }

        let dataAddToset = {}
        let dataPullAll = {}

        if (name && name != '') {
          dataUpdate.name = name
        }

        if (sign && sign != '') {
          dataUpdate.sign = sign
        }

        if (phone && phone != '') {
          dataUpdate.phone = phone
        }

        if (bankAccount && bankAccount != '') {
          dataUpdate.bankAccount = bankAccount
        }

        if (bankQrcode && bankQrcode.length) {
          dataUpdate.bankQrcode = bankQrcode[0]
        }

        if (description && description != '') {
          dataUpdate.description = description
        }

        if (address && address != '') {
          dataUpdate.address = address
        }

        if (initialDay && initialDay != '') {
          dataUpdate.initialDay = initialDay
        }

        if (imagesID && imagesID.length) {
          dataAddToset = {
            ...dataAddToset,
            images: imagesID,
          }
        }

        //_________Thêm thành viên
        if (checkObjectIDs(members)) {
          dataAddToset = {
            ...dataAddToset,
            members,
          }
        }

        if (checkObjectIDs(admins)) {
          dataAddToset = {
            ...dataAddToset,
            admins,
          }
        }

        if (checkObjectIDs(getNotification)) {
          dataAddToset = {
            ...dataAddToset,
            getNotification,
          }
        }

        //_________Xoá thành viên
        if (checkObjectIDs(membersRemove)) {
          dataPullAll = {
            ...dataPullAll,
            members: membersRemove,
          }
        }

        if (checkObjectIDs(adminsRemove)) {
          dataPullAll = {
            ...dataPullAll,
            admins: adminsRemove,
          }
        }

        if (checkObjectIDs(getNotificationRemove)) {
          dataPullAll = {
            ...dataPullAll,
            getNotification: getNotificationRemove,
          }
        }

        if (platform && !isNaN(platform) && [1, 2].includes(platform)) {
          dataUpdate.platform = +platform
        }

        //_________Bật hoặc tắt chiến dịch truyền thông
        if (campaign && !isNaN(campaign) && [1, 2].includes(campaign)) {
          dataUpdate.campaign = +campaign
        }

        //_________Phân loại trong hệ thống hoặc nhượng quyền
        if (internal && !isNaN(internal) && [1, 2].includes(internal)) {
          dataUpdate.internal = +internal
        }

        //_________Tỷ lệ tích điểm
        if (loyaltyPointsRate && !isNaN(loyaltyPointsRate)) {
          dataUpdate.loyaltyPointsRate = +loyaltyPointsRate
        }

        /**
         * Chi phí vận hành
         */
        if (!isNaN(materialExpenseRate)) {
          dataUpdate.materialExpenseRate = Number(materialExpenseRate)
        }

        if (!isNaN(materialExpense)) {
          dataUpdate.materialExpense = Number(materialExpense)
        }

        if (!isNaN(planExpense)) {
          dataUpdate.planExpense = Number(planExpense)
        }

        if (!isNaN(utilityExpense)) {
          dataUpdate.utilityExpense = Number(utilityExpense)
        }

        if (!isNaN(humanExpense)) {
          dataUpdate.humanExpense = Number(humanExpense)
        }

        if (!isNaN(otherExpense)) {
          dataUpdate.otherExpense = Number(otherExpense)
        }

        if (trainStaffSalar && !isNaN(trainStaffSalar)) {
          dataUpdate.trainStaffSalar = Number(trainStaffSalar)
        }

        if (trialStaffSalary && !isNaN(trialStaffSalary)) {
          dataUpdate.trialStaffSalary = Number(trialStaffSalary)
        }

        if (officialStaffSalar && !isNaN(officialStaffSalar)) {
          dataUpdate.officialStaffSalar = Number(officialStaffSalar)
        }

        if (lunchStaffAllowance && !isNaN(lunchStaffAllowance)) {
          dataUpdate.lunchStaffAllowance = Number(lunchStaffAllowance)
        }

        /**
         * Cập nhật nhiều dữ liệu addToSet cùng 1 lúc
         */
        if (dataAddToset) {
          dataUpdate.$addToSet = dataAddToset
        }

        /**
         * Xóa nhiều dữ liệu cùng 1 lúc
         */
        if (dataPullAll) {
          dataUpdate.$pullAll = dataPullAll
        }
        // console.log(dataUpdate)

        let infoAfterUpdate = await ITEM__FUNDA_COLL.findByIdAndUpdate(
          fundaID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({ error: true, message: 'cannot_update' })

        /**
         * CẬP NHẬT LẠI FNB
         * 1-Ca làm việc
         * 2-Đơn hàng
         * 3-Danh bạ
         */

        return resolve({ error: false, data: infoAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: get info funda
   * Author: Depv
   * Code:
   */
  getInfo({ fundaID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(fundaID))
          return resolve({
            error: true,
            message: 'Request params fundaID invalid',
            status: 400,
          })

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

        let infoAterGet = await ITEM__FUNDA_COLL.findById(fundaID)
          .select(select)
          .populate(populates)
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
   * Name  : Danh sách funda
   * Author: Depv
   * Code  :
   */
  getList({
    companyID,
    parentID,
    platform,
    isListParentOfListChilds,
    isMember,
    keyword,
    limit = 40,
    lastestID,
    select,
    populates = {},
    userID,
  }) {
    // console.log({companyID, parentID, platform, isListParentOfListChilds, isMember,
    //     keyword, limit, lastestID, select, populates, userID})
    //     console.log('========================')
    // console.log('ĐƠN VỊ CƠ SỞ========================')
    return new Promise(async (resolve) => {
      try {
        if (limit > 50) {
          limit = 50
        } else {
          limit = +limit
        }

        let sortBy
        let conditionObj = {}
        let keys = ['createAt__-1', '_id__-1']

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

        if (isMember && isMember == 1) {
          conditionObj.members = { $in: [userID] }
          conditionObj.company = companyID
        } else {
          conditionObj.members = { $in: [userID] }
          conditionObj.company = companyID
        }

        // Chỉ lấy danh sách cha hoặc con
        if (isListParentOfListChilds == 1) {
          if (parentID) {
            conditionObj.parent = parentID
          }
        }

        if (platform) {
          conditionObj.platform = Number(platform)
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          conditionObj.name = new RegExp(keyword, 'i')
        }
        // console.log(conditionObj)

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await ITEM__FUNDA_COLL.findById(lastestID)
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

        let infoDataAfterGet = await ITEM__FUNDA_COLL.find(conditionObj)
          .select(select)
          .limit(+limit + 1)
          .sort(sortBy)
          .populate(populates)
          .lean()

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

        let totalRecord = await ITEM__FUNDA_COLL.count(conditionObjOrg)
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
