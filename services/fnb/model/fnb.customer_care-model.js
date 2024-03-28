'use strict'
const BaseModel = require('../../../tools/db/base_model')
const {
  checkObjectIDs,
  IsJsonString,
  validateParamsObjectID,
} = require('../../../tools/utils/utils')
const stringUtils = require('../../../tools/utils/string_utils')
const { KEY_ERROR } = require('../../../tools/keys')
const ObjectID = require('mongoose').Types.ObjectId

const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

/**s
 * import inter-coll, exter-coll
 */
const USER_COLL = require('../../auth/database/auth.user-coll')
const ITEM__DOCTYPE_COLL = require('../../item/database/item.doctype-coll')
const ITEM__COCNTACT_COLL = require('../../item/database/item.contact-coll')
const FNB_ORDER_COLL = require('../database/fnb.order-coll')
const FNB_CUSTOMER_CARE_COLL = require('../database/fnb.customer_care-coll')

/**
 * import inter-model, exter-model
 */
const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const { uploadFileS3 } = require('../../../tools/s3')

const { CRM_STATUS, CRM_TYPES } = require('../helper/fnb.keys-constant')

// const FNB_CUSTOMER_BOOKING_MODEL        = require('../model/fnb.customer_booking-model').MODEL;

class Model extends BaseModel {
  constructor() {
    super(FNB_CUSTOMER_CARE_COLL)
  }

  /**
   * Name: Insert
   * Author: HiepNH
   * Code: 24/11/2022
   */
  insert({
    userID,
    companyID,
    customerID,
    name,
    orderID,
    mistakeID,
    journeyID,
    type,
    description,
    note,
    rating,
    amount,
    dataSourceID,
    status,
    files,
  }) {
    // console.log({ userID, companyID, customerID, name, orderID, mistakeID, journeyID, type, description, note, rating, amount, dataSourceID, status, files })
    return new Promise(async (resolve) => {
      try {
        if (
          !name ||
          name == '' ||
          !checkObjectIDs(customerID) ||
          !checkObjectIDs(userID)
        )
          return resolve({
            error: true,
            message: 'name|customerID|userID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let dataInsert = {
          userCreate: userID,
          customer: customerID,
          company: companyID,
          name,
        }

        let infoCustomer = await ITEM__COCNTACT_COLL.findById(customerID)
        if (infoCustomer && checkObjectIDs(infoCustomer.dataSource)) {
          dataInsert.dataSource = infoCustomer.dataSource
        }

        let infoOrder
        if (orderID && checkObjectIDs(orderID)) {
          infoOrder = await FNB_ORDER_COLL.findById(orderID).populate({
            path: 'funda',
            select: 'manager',
          })
          if (!infoOrder)
            return resolve({
              error: true,
              message: 'Đơn hàng không tồn tại',
              keyError: KEY_ERROR.ITEM_EXISTED,
            })

          dataInsert.order = orderID
          dataInsert.company = infoOrder.company
          dataInsert.funda = infoOrder.funda
          dataInsert.channel = infoOrder.channel
          dataInsert.salesChannel = infoOrder.salesChannel // Sau sẽ bỏ
          dataInsert.business = infoOrder.business
          dataInsert.customer = infoOrder.customer

          if (
            infoOrder.funda.manager &&
            checkObjectIDs(infoOrder.funda.manager)
          ) {
            dataInsert.manager = infoOrder.funda.manager
          }
        }

        if (!isNaN(type)) {
          dataInsert.type = Number(type)
        }

        if (!isNaN(amount)) {
          dataInsert.amount = Number(amount)
        }

        if (!isNaN(rating)) {
          dataInsert.rating = Number(rating)
        }

        if (!isNaN(status)) {
          dataInsert.status = Number(status)
        }

        if (description && description != '') {
          dataInsert.description = description
        }

        if (note && note != '') {
          dataInsert.note = note
        }

        // Namecv
        let convertStr = ''
        if (infoCustomer?.name != '' && infoCustomer?.name != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.name)
        }
        if (
          infoCustomer?.description != '' &&
          infoCustomer?.description != 'undefined'
        ) {
          convertStr =
            convertStr +
            ' ' +
            stringUtils.removeAccents(infoCustomer?.description)
        }
        if (infoCustomer?.sign != '' && infoCustomer?.sign != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.sign)
        }
        if (infoCustomer?.note != '' && infoCustomer?.note != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.note)
        }
        if (infoCustomer?.phone != '' && infoCustomer?.phone != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.phone)
        }
        if (infoCustomer?.taxid != '' && infoCustomer?.taxid != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.taxid)
        }
        if (infoCustomer?.email != '' && infoCustomer?.email != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.email)
        }
        if (
          infoCustomer?.identity != '' &&
          infoCustomer?.identity != 'undefined'
        ) {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.identity)
        }
        if (
          infoCustomer?.bankAccount != '' &&
          infoCustomer?.bankAccount != 'undefined'
        ) {
          convertStr =
            convertStr +
            ' ' +
            stringUtils.removeAccents(infoCustomer?.bankAccount)
        }

        if (name && name != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(name)
        }
        if (description && description != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(description)
        }
        if (note && note != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(note)
        }
        dataInsert.namecv = convertStr

        let infoItem
        if (checkObjectIDs(journeyID)) {
          // Mỗi khách hàng-1 hành trình chỉ tồn tại duy nhất 1 mẩu tin
          // let checkOne = await FNB_CUSTOMER_CARE_COLL.findOne({journey: journeyID, customer: customerID, company: companyID})

          infoItem = await ITEM__DOCTYPE_COLL.findById(journeyID)
          if (!infoItem.linkItem)
            return resolve({
              error: true,
              message:
                'Hành trình trải nghiệm chưa thuộc lĩnh vực kinh doanh cụ thể',
              keyError: 'params_journey_invalid',
              status: 400,
            })
          // if(!checkOne){
          //     dataInsert.journey = journeyID;
          //     dataInsert.business = infoItem.linkItem;
          // }

          dataInsert.journey = journeyID
          dataInsert.business = infoItem.linkItem
        }

        if (checkObjectIDs(mistakeID)) {
          dataInsert.mistake = mistakeID
        }

        if (checkObjectIDs(dataSourceID)) {
          dataInsert.dataSource = dataSourceID
        }

        if (checkObjectIDs(files)) {
          dataInsert.images = files
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: 'Thêm thất bại',
            keyError: KEY_ERROR.INSERT_FAILED,
          })

        // Cập nhật trạng thái hành trình trước sang hoàn thành
        await FNB_CUSTOMER_CARE_COLL.findOneAndUpdate(
          {
            customer: customerID,
            company: companyID,
            _id: { $ne: infoAfterInsert._id },
          },
          {
            status: 2,
          },
          { new: true }
        ).sort({ journey: -1 })
        // console.log(infoBefore)

        // // Tạo lịch nhắc hẹn
        // if(checkObjectIDs(journeyID) && infoItem.alert && infoItem.alert > 0) {
        //     let infoBooking = await FNB_CUSTOMER_BOOKING_MODEL.insert({
        //         userID,
        //         companyID,
        //         customerID,
        //         // orderID,
        //         businessID: infoItem.linkItem,
        //         assigneeID: userID,
        //         name: 'Auto create Booking from Journey',
        //         note: 'Auto create Booking from Journey',
        //         // date,
        //         // alert,
        //     })
        //     // console.log(infoBooking)
        //  }

        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Update
   * Author: HiepNH
   * Code: 24/11/2022
   */
  update({
    companyID,
    userID,
    customerCareID,
    customerID,
    name,
    orderID,
    mistakeID,
    journeyID,
    type,
    description,
    note,
    rating,
    amount,
    dataSourceID,
    status,
    imagesID,
  }) {
    // console.log({ userID, customerCareID, customerID, name, orderID, mistakeID, journeyID, type, description, note, rating, amount, dataSourceID, status, imagesID })
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(customerCareID))
          return resolve({
            error: true,
            message: 'customerCareID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let dataUpdate = {
          userUpdate: userID,
          modifyAt: new Date(),
        }

        let infoCustomer
        let infoCustomerCare =
          await FNB_CUSTOMER_CARE_COLL.findById(customerCareID)
        // console.log(infoCustomerCare)
        if (customerID && checkObjectIDs(customerID)) {
          infoCustomer = await ITEM__COCNTACT_COLL.findById(customerID)
          if (infoCustomer && checkObjectIDs(infoCustomer.dataSource)) {
            dataUpdate.dataSource = infoCustomer.dataSource
          }
        } else {
          infoCustomer = await ITEM__COCNTACT_COLL.findById(
            infoCustomerCare.customer
          )
          if (infoCustomer && checkObjectIDs(infoCustomer.dataSource)) {
            dataUpdate.dataSource = infoCustomer.dataSource
          }
        }

        dataUpdate.customer = infoCustomer._id

        if (checkObjectIDs(mistakeID)) {
          dataUpdate.mistake = mistakeID
        }

        if (checkObjectIDs(dataSourceID)) {
          dataUpdate.dataSource = dataSourceID
        }

        let infoOrder
        if (orderID && checkObjectIDs(orderID)) {
          infoOrder = await FNB_ORDER_COLL.findById(orderID).populate({
            path: 'funda',
            select: 'manager',
          })
          if (!infoOrder)
            return resolve({
              error: true,
              message: 'Đơn hàng không tồn tại',
              keyError: KEY_ERROR.ITEM_EXISTED,
            })

          dataUpdate.order = orderID
          dataUpdate.company = infoOrder.company
          dataUpdate.funda = infoOrder.funda
          dataUpdate.customer = infoOrder.customer
          dataUpdate.business = infoOrder.business
          dataUpdate.channel = infoOrder.channel
          dataUpdate.salesChannel = infoOrder.salesChannel

          if (
            infoOrder.funda.manager &&
            checkObjectIDs(infoOrder.funda.manager)
          ) {
            dataUpdate.manager = infoOrder.funda.manager
          }
        }

        if (name && name != '') {
          dataUpdate.name = name
        }

        if (!isNaN(type)) {
          dataUpdate.type = Number(type)
        }

        if (!isNaN(amount)) {
          dataUpdate.amount = Number(amount)
        }

        if (!isNaN(rating)) {
          dataUpdate.rating = Number(rating)
        }

        if (!isNaN(status)) {
          dataUpdate.status = Number(status)
        }

        if (description && description != '') {
          dataUpdate.description = description
        }

        if (note && note != '') {
          dataUpdate.note = note
        }

        // Namecv
        let convertStr = ''
        if (infoCustomer?.name != '' && infoCustomer?.name != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.name)
        }
        if (
          infoCustomer?.description != '' &&
          infoCustomer?.description != 'undefined'
        ) {
          convertStr =
            convertStr +
            ' ' +
            stringUtils.removeAccents(infoCustomer?.description)
        }
        if (infoCustomer?.sign != '' && infoCustomer?.sign != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.sign)
        }
        if (infoCustomer?.note != '' && infoCustomer?.note != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.note)
        }
        if (infoCustomer?.phone != '' && infoCustomer?.phone != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.phone)
        }
        if (infoCustomer?.taxid != '' && infoCustomer?.taxid != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.taxid)
        }
        if (infoCustomer?.email != '' && infoCustomer?.email != 'undefined') {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.email)
        }
        if (
          infoCustomer?.identity != '' &&
          infoCustomer?.identity != 'undefined'
        ) {
          convertStr =
            convertStr + ' ' + stringUtils.removeAccents(infoCustomer?.identity)
        }
        if (
          infoCustomer?.bankAccount != '' &&
          infoCustomer?.bankAccount != 'undefined'
        ) {
          convertStr =
            convertStr +
            ' ' +
            stringUtils.removeAccents(infoCustomer?.bankAccount)
        }

        if (name && name != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(name)
        }
        if (description && description != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(description)
        }
        if (note && note != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(note)
        }
        dataUpdate.namecv = convertStr

        let infoItem
        if (checkObjectIDs(journeyID)) {
          dataUpdate.journey = journeyID

          // Mỗi khách hàng-1 hành trình chỉ tồn tại duy nhất 1 mẩu tin
          // let checkOne = await FNB_CUSTOMER_CARE_COLL.findOne({journey: journeyID, customer: infoCustomer._id, company: companyID})

          infoItem = await ITEM__DOCTYPE_COLL.findById(journeyID)
          if (!infoItem.linkItem)
            return resolve({
              error: true,
              message:
                'Hành trình trải nghiệm chưa thuộc lĩnh vực kinh doanh cụ thể',
              keyError: 'params_journey_invalid',
              status: 400,
            })

          // if(!checkOne){
          //     dataUpdate.journey = journeyID;
          //     dataUpdate.business = infoItem.linkItem;
          // }

          dataUpdate.journey = journeyID
          dataUpdate.business = infoItem.linkItem
        }

        if (imagesID && imagesID.length) {
          dataUpdate.$addToSet = {
            images: imagesID,
          }
        }

        const infoAfterUpdate = await FNB_CUSTOMER_CARE_COLL.findByIdAndUpdate(
          customerCareID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
            keyError: KEY_ERROR.UPDATE_FAILED,
          })

        // // Tạo lịch nhắc hẹn
        // if(checkObjectIDs(journeyID) && infoItem.alert && infoItem.alert > 0) {
        //     let infoBooking = await FNB_CUSTOMER_BOOKING_MODEL.insert({
        //         userID,
        //         companyID,
        //         customerID: infoCustomer._id,
        //         // orderID,
        //         businessID: infoItem.linkItem,
        //         assigneeID: userID,
        //         name: 'Auto create Booking from Journey',
        //         note: 'Auto create Booking from Journey',
        //         // date,
        //         // alert,
        //     })
        //     // console.log(infoBooking)
        //  }

        return resolve({ error: false, data: infoAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Get info
   * Author: HiepNH
   * Code: 24/11/2022
   */
  getInfo({ customerCareID, select, populates = {} }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(customerCareID))
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

        let infoPlanGroup = await FNB_CUSTOMER_CARE_COLL.findById(
          customerCareID
        )
          .select(select)
          .populate(populates)

        if (!infoPlanGroup)
          return resolve({
            error: true,
            message: 'cannot_get',
            keyError: KEY_ERROR.GET_INFO_FAILED,
          })

        return resolve({ error: false, data: infoPlanGroup })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name  : Get list
   * Author: HiepNH
   * Code: 24/11/2022
   */
  getList({
    option,
    companyID,
    fundasID,
    businessID,
    journeyID,
    customerID,
    userCreateID,
    managerID,
    fromDate,
    toDate,
    status,
    type,
    channelID,
    salesChannel,
    keyword,
    limit = 20,
    lastestID,
    select,
    populates,
    userID,
  }) {
    // console.log({ option, companyID, fundasID, businessID, journeyID, customerID, userCreateID, managerID, fromDate, toDate, status, type, channelID, salesChannel, keyword, limit, lastestID, select, populates, userID })
    return new Promise(async (resolve) => {
      try {
        if (Number(limit) > 20) {
          limit = 20
        } else {
          limit = +Number(limit)
        }

        let conditionObj = { company: companyID }
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

        // Gom nhóm theo đơn vị cơ sở
        if (fundasID && fundasID.length) {
          const validation = validateParamsObjectID({
            fundasID: { value: fundasID, isRequire: false },
          })
          if (validation.error) return resolve(validation)

          let arrFun = fundasID.map((item) => ObjectID(item))
          conditionObj.funda = { $in: arrFun }
        }

        if (!option) {
          conditionObj.journey = { $exists: false }
        } else {
          if (option == 1) {
            conditionObj.journey = { $exists: true, $ne: null }
          }
        }

        if (businessID && checkObjectIDs(businessID)) {
          conditionObj.business = ObjectID(businessID)
        }

        if (journeyID && checkObjectIDs(journeyID)) {
          conditionObj.journey = ObjectID(journeyID)
        }

        if (customerID && checkObjectIDs(customerID)) {
          conditionObj.customer = ObjectID(customerID)
        }

        if (userCreateID && checkObjectIDs(userCreateID)) {
          conditionObj.userCreate = ObjectID(userCreateID)
        }

        if (managerID && checkObjectIDs(managerID)) {
          conditionObj.manager = ObjectID(managerID)
        }

        if (!isNaN(status) && [1, 2].includes(Number(status))) {
          conditionObj.status = Number(status)
        } else {
          conditionObj.status = { $in: [1, 2] }
        }

        if (!isNaN(type) && [1, 2].includes(Number(type))) {
          conditionObj.type = Number(type)
        } else {
          conditionObj.type = { $in: [1, 2] }
        }

        if (channelID && checkObjectIDs(channelID)) {
          conditionObj.channel = ObjectID(channelID)
        }

        if (
          !isNaN(salesChannel) &&
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(Number(salesChannel))
        ) {
          conditionObj.salesChannel = Number(salesChannel)
        } else {
          conditionObj.salesChannel = {
            $in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          }
        }

        if (fromDate && toDate) {
          conditionObj.createAt = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          }
        }
        // console.log(conditionObj)

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

        if (keyword) {
          keyword = stringUtils.removeAccents(keyword)
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          const regSearch = new RegExp(keyword, 'i')

          conditionObj.namecv = regSearch
        }
        // console.log(conditionObj)

        if (select && typeof select === 'string') {
          if (!IsJsonString(select))
            return resolve({
              error: true,
              message: 'Request params select invalid',
              status: 400,
            })

          select = JSON.parse(select)
        }
        let conditionObjOrg = { ...conditionObj }

        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await FNB_CUSTOMER_CARE_COLL.findById(lastestID)
          if (!infoData)
            return resolve({
              error: true,
              message: "Can't get info last message",
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

        let infoDataAfterGet = await FNB_CUSTOMER_CARE_COLL.find(conditionObj)
          .limit(limit + 1)
          .sort(sortBy)
          .select(select)
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
            nextCursor = infoDataAfterGet[limit - 1]?._id
            infoDataAfterGet.length = limit
          }
        }
        let totalRecord = await FNB_CUSTOMER_CARE_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)

        return resolve({
          error: false,
          data: {
            listRecords: infoDataAfterGet,
            limit: limit,
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
   * Name: Danh sách theo phân loại
   * Author: HiepNH
   * Code: 24/11/2022
   */
  getListByProperty({
    option,
    companyID,
    businessID,
    mistakeID,
    executorID,
    customerID,
    optionGroup,
    optionTime,
    fundasID,
    year,
    month,
    fromDate,
    toDate,
    status,
    userID,
  }) {
    // console.log({ option, companyID, businessID, mistakeID, executorID, customerID, optionGroup, optionTime, fundasID, year, month, fromDate, toDate, status, userID })
    return new Promise(async (resolve) => {
      try {
        let yearFilter, monthFilter
        let currentYear = new Date().getFullYear()
        let currentMonth = new Date().getMonth() + 1

        if (year && !isNaN(year)) {
          yearFilter = Number(year)
        } else {
          yearFilter = Number(currentYear)
        }

        if (month && !isNaN(month)) {
          monthFilter = Number(month)
        } else {
          monthFilter = Number(currentMonth)
        }

        if (!option) {
          // Danh sách
        } else {
          let conditionObj = {
            company: ObjectID(companyID),
          }
          let conditionGroup = {}
          let conditionObjYear = {},
            conditionPopulate = {},
            sortBy = { quantity: -1 }

          const validation = validateParamsObjectID({
            fundasID: { value: fundasID, isRequire: false },
          })
          if (validation.error) return resolve(validation)

          // Gom nhóm theo đơn vị cơ sở
          if (fundasID && fundasID.length) {
            let arrFun = fundasID.map((item) => ObjectID(item))
            conditionObj.funda = { $in: arrFun }
          }

          // Phân loại theo thời khoảng
          if (fromDate && toDate) {
            conditionObj.createAt = {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            }
          }

          /**
           * Gom nhóm theo các loại lỗi: OK
           */
          if (option && Number(option) == 1) {
            conditionObj.mistake = { $exists: true, $ne: null }

            conditionGroup = {
              _id: { mistake: '$mistake' },
              quantity: { $sum: 1 },
            }

            conditionPopulate = {
              path: '_id.mistake',
              select: '_id name sign',
              model: 'doctype',
            }
          } else if (option && Number(option) == 2) {
            /**
             * Gom nhóm theo thời gian: OK
             */
            if (!optionGroup) {
              conditionObj.mistake = { $exists: true, $ne: null }
            } else {
              if (optionGroup == 1) {
                conditionObj.journey = {
                  $exists: true,
                  $ne: null,
                }
              }
            }

            // Theo năm
            if (optionTime && Number(optionTime) == 1) {
              conditionGroup = {
                _id: { year: '$year' },
                quantity: { $sum: 1 },
              }
            }

            // Theo tháng trong năm
            if (optionTime && Number(optionTime) == 2) {
              conditionObjYear = {
                year: Number(yearFilter),
              }

              conditionGroup = {
                _id: { month: '$month', year: '$year' },
                quantity: { $sum: 1 },
              }
            }

            // Theo ngày trong tháng
            if (optionTime && Number(optionTime) == 3) {
              conditionObjYear = {
                year: Number(yearFilter),
                month: Number(monthFilter),
              }

              conditionGroup = {
                _id: { day: '$day' },
                quantity: { $sum: 1 },
              }
            }

            // Theo giờ trong ngày
            if (optionTime && Number(optionTime) == 4) {
              conditionGroup = {
                _id: { hour: '$hour' },
                quantity: { $sum: 1 },
              }
            }
          } else if (option && Number(option) == 3) {
            /**
             * Gom nhóm theo đơn vị cơ sở: OK
             */
            if (mistakeID && checkObjectIDs(mistakeID)) {
              conditionObj.mistake = ObjectID(mistakeID)

              conditionGroup = {
                _id: { funda: '$funda' },
                quantity: { $sum: 1 },
              }

              conditionPopulate = {
                path: '_id.funda',
                select: '_id name sign image',
                model: 'funda',
              }
            } else {
              conditionGroup = {
                _id: { funda: '$funda' },
                quantity: { $sum: 1 },
              }

              conditionPopulate = {
                path: '_id.funda',
                select: '_id name sign image',
                model: 'funda',
              }
            }
          } else if (option && Number(option) == 4) {
            /**
             * Gom nhóm theo các Nhân sự quản lý: OK
             */
            conditionObj.manager = { $exists: true, $ne: null }

            conditionGroup = {
              _id: { manager: '$manager' },
              quantity: { $sum: 1 },
            }

            conditionPopulate = {
              path: '_id.manager',
              select: '_id fullname image email phone',
              model: 'user',
            }
          }

          /**
           * Gom nhóm theo Hành trình khách hàng: OK
           */
          if (option && Number(option) == 5) {
            conditionObj.business = { $exists: true, $ne: null }
            conditionObj.journey = { $exists: true, $ne: null }
            if (businessID && checkObjectIDs(businessID)) {
              conditionObj.business = ObjectID(businessID)
            }

            conditionGroup = {
              _id: { journey: '$journey' },
              quantity: { $sum: 1 },
            }

            conditionPopulate = {
              path: '_id.journey',
              select: '_id name sign description',
              model: 'doctype',
            }

            if (customerID && checkObjectIDs(customerID)) {
              conditionObj.customer = ObjectID(customerID)
              conditionGroup = {
                _id: {
                  business: '$business',
                  journey: '$journey',
                },
                quantity: { $sum: 1 },
              }
            }

            sortBy = { '_id.journey': 1 }
          }

          /**
           * Gom nhóm theo 1 khách hàng cụ thể: OK
           */
          if (option && Number(option) == 6) {
            conditionObj.business = { $exists: true, $ne: null }
            conditionObj.journey = { $exists: true, $ne: null }
            conditionObj.customer = ObjectID(customerID)

            conditionGroup = {
              _id: { business: '$business', journey: '$journey' },
              quantity: { $sum: 1 },
            }

            sortBy = { '_id.business': 1, '_id.journey': 1 }
          }

          // Tổng hợp KPI theo user/tháng/năm: OK
          else if (option && Number(option) == 7) {
            if (executorID && checkObjectIDs(executorID)) {
              conditionObj.executor = ObjectID(executorID)
            }

            conditionObjYear = {
              year: Number(year),
            }

            conditionGroup = {
              _id: { month: '$month', year: '$year' },
              quantity: { $sum: 1 },
            }
          }

          // Gom nhóm theo trạng thái: OK
          else if (option && Number(option) == 8) {
            conditionGroup = {
              _id: { status: '$status' },
              quantity: { $sum: 1 },
            }
          }

          // Gom nhóm theo của tôi chưa xử lý: OK
          else if (option && Number(option) == 9) {
            if (status) {
              conditionObj.status = +status
            }
            conditionObj.manager = ObjectID(userID)

            conditionGroup = {
              _id: {},
              quantity: { $sum: 1 },
            }
          } else if (option && Number(option) == 10) {
            /**
             * Gom nhóm theo user: OK
             */
            if (!optionGroup) {
              conditionGroup = {
                _id: { user: '$userCreate' },
              }
            } else if (optionGroup == 1) {
              conditionGroup = {
                _id: { user: '$manager' },
              }
            }
          }

          // console.log(conditionObj)
          // console.log(conditionPopulate)
          // console.log(conditionObjYear)
          // console.log(conditionGroup)

          let listData = await FNB_CUSTOMER_CARE_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: {
                year: { $year: '$createAt' },
                month: { $month: '$createAt' },
                day: { $dayOfMonth: '$createAt' },
                hour: { $hour: '$createAt' },
                funda: 1,
                mistake: 1,
                manager: 1,
                order: 1,
                product: 1,
                executor: 1,
                business: 1,
                journey: 1,
                type: 1,
                customer: 1,
                internal: 1,
                seasons: 1,
                shift: 1,
                shiftType: 1,
                salesChannel: 1,
                service: 1,
                status: 1,
                amount: 1,
                quantity: 1,
                score: 1,
                bonus: 1,
                userCreate: 1,
              },
            },
            {
              $match: conditionObjYear,
            },
            {
              $group: conditionGroup,
            },
            {
              $sort: sortBy,
            },
          ])
          // console.log(listData)

          if (!isNaN(option) && [1, 3, 4, 5].includes(Number(option))) {
            await FNB_CUSTOMER_CARE_COLL.populate(listData, conditionPopulate)

            return resolve({ error: false, data: listData })
          }

          if (option == 10) {
            let listUser = await USER_COLL.find({
              _id: { $in: listData.map((item) => item._id.user) },
            }).select('fullname')
            return resolve({ error: false, data: listUser })
          }

          if (!isNaN(option) && [6].includes(Number(option))) {
            conditionPopulate = {
              path: '_id.journey',
              select: '_id name sign description',
              model: 'doctype',
            }
            await FNB_CUSTOMER_CARE_COLL.populate(listData, conditionPopulate)

            let listBusiness = await ITEM__DOCTYPE_COLL.find({
              _id: {
                $in: listData.map((item) => item._id.business),
              },
            }).select('name description')

            return resolve({
              error: false,
              data: { listData, listBusiness },
            })
          }

          return resolve({ error: false, data: listData })
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
   * Name: importFromExcel
   * Code: HiepNH
   * Date: 8/2/2024
   */
  importFromExcel({ option, companyID, dataImport, userID, ctx }) {
    // console.log({ option, companyID, dataImport, userID })
    return new Promise(async (resolve) => {
      try {
        const dataImportJSON = JSON.parse(dataImport)
        let index = 0
        let errorNumber = 0

        for (const data of dataImportJSON) {
          // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
          if (index > 0 && index < 500) {
            let prepareData = {
              userID,
              companyID,
              customerID: data?.__EMPTY_1,
              journeyID: data?.__EMPTY_2, //
              name: data?.__EMPTY_3,
              amount: data?.__EMPTY_4,
              note: data?.__EMPTY_5,
              dataSourceID: data?.__EMPTY_6,
            }
            // console.log(prepareData);

            let infoAfterInsert = await this.insert(prepareData)
            if (infoAfterInsert.error) {
              errorNumber++
            }
          }

          index++
        }

        if (errorNumber != 0)
          return resolve({ error: true, message: 'Import failed' })

        return resolve({ error: false, message: 'Import successfull' })
      } catch (error) {
        console.log({ error })
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: HiepNH
   * Func: Tải dữ liệu
   * Date: 15/2/2024
   */
  exportExcel({
    option,
    companyID,
    userID,
    fundaID,
    fromDate,
    toDate,
    month,
    year,
  }) {
    // console.log({ option, companyID, userID, fundaID, fromDate, toDate, month, year })
    return new Promise(async (resolve) => {
      try {
        let yearFilter
        let currentYear = new Date().getFullYear()
        let currentMonth = new Date().getMonth() + 1

        if (fromDate && toDate) {
          currentMonth = new Date(toDate).getMonth() + 1
          currentYear = new Date(toDate).getFullYear()
        }

        if (year && !isNaN(year)) {
          yearFilter = Number(year)
        } else {
          yearFilter = Number(currentYear)
        }

        let conditionObjYear = {
          year: Number(yearFilter),
        }

        let template = '../../../files/templates/excels/crm_export_journey.xlsx'
        if (option && option == 1) {
          template = '../../../files/templates/excels/crm_export_support.xlsx'

          let listData = await FNB_CUSTOMER_CARE_COLL.find({
            company: companyID,
            journey: { $exists: false },
          })
            .populate({
              path: 'customer mistake manager funda order',
              select: 'name sign phone fullname assignee',
              populate: {
                path: 'assignee',
                select: 'fullname',
              },
            })
            .limit(10000)

          let listData2 = await FNB_CUSTOMER_CARE_COLL.aggregate([
            {
              $match: {
                company: ObjectID(companyID),
                manager: { $exists: true, $ne: null },
                journey: { $exists: false },
              },
            },
            {
              $project: {
                year: { $year: '$createAt' },
                month: { $month: '$createAt' },
                createAt: 1,
                userCreate: 1,
                company: 1,
                funda: 1,
                journey: 1,
                customer: 1,
                mistake: 1,
                manager: 1,
              },
            },
            {
              $match: conditionObjYear,
            },
            {
              $group: {
                _id: { manager: '$manager', month: '$month' },
                quantity: { $sum: 1 },
              },
            },
          ])
          let listUser = await USER_COLL.find({
            _id: { $in: listData2.map((item) => item._id.manager) },
          }).select('fullname')

          XlsxPopulate.fromFileAsync(path.resolve(__dirname, template)).then(
            async (workbook) => {
              workbook
                .sheet('Report')
                .row(1)
                .cell(1)
                .value(`BÁO CÁO TỔNG HỢP ${yearFilter}`)

              var i = 4
              listData?.forEach((item, index) => {
                // console.log(item?.order?.assignee)

                workbook
                  .sheet('Data')
                  .row(i)
                  .cell(1)
                  .value(Number(index + 1))
                workbook.sheet('Data').row(i).cell(2).value(item?.createAt)
                workbook.sheet('Data').row(i).cell(3).value(item?.name)
                workbook
                  .sheet('Data')
                  .row(i)
                  .cell(4)
                  .value(`${item?.customer?.name}-${item?.customer?.phone}`)
                workbook.sheet('Data').row(i).cell(5).value(item?.mistake?.name)
                workbook.sheet('Data').row(i).cell(6).value(item?.order?.name)
                workbook.sheet('Data').row(i).cell(7).value(item?.description)
                workbook.sheet('Data').row(i).cell(8).value(item?.note)
                workbook.sheet('Data').row(i).cell(9).value(item?.rating)
                workbook.sheet('Data').row(i).cell(10).value(item?.amount)
                workbook
                  .sheet('Data')
                  .row(i)
                  .cell(11)
                  .value(
                    item.status &&
                      Number(item.status) > 0 &&
                      Number(item.status) <= 2
                      ? CRM_STATUS[Number(item?.status) - 1].text
                      : ''
                  )
                workbook
                  .sheet('Data')
                  .row(i)
                  .cell(12)
                  .value(
                    item.status &&
                      Number(item.type) > 0 &&
                      Number(item.type) <= 2
                      ? CRM_TYPES[Number(item?.type) - 1].text
                      : ''
                  )
                workbook.sheet('Data').row(i).cell(13).value(item?.funda?.name)
                workbook
                  .sheet('Data')
                  .row(i)
                  .cell(14)
                  .value(item?.manager?.fullname)

                if (item.order) {
                  let str = ''
                  for (const user of item.order.assignee) {
                    str = str + ', ' + user.fullname
                  }
                  workbook.sheet('Data').row(i).cell(15).value(str)
                }

                workbook
                  .sheet('Data')
                  .row(i)
                  .cell(16)
                  .value(
                    `Y${item?.createAt.getFullYear()}M${Number(item?.createAt.getMonth() + 1)}`
                  )

                i++
              })

              var i = 4
              listUser?.forEach((user, uid) => {
                workbook
                  .sheet('Report')
                  .row(i)
                  .cell(1)
                  .value(Number(uid + 1))
                workbook.sheet('Report').row(i).cell(2).value(user.fullname)
                workbook.sheet('Report').row(i).cell(3).value(`${user._id}`)

                i++
              })

              listData2?.forEach((item, index) => {
                for (var i = 4; i <= listUser.length + 3; i++) {
                  let userID = workbook.sheet('Report').row(i).cell(3).value()

                  for (var j = 1; j <= 12; j++) {
                    if (
                      item._id.month == j &&
                      userID.toString() === item._id.manager.toString()
                    ) {
                      workbook
                        .sheet('Report')
                        .row(i)
                        .cell(j + 3)
                        .value(item.quantity)
                    }
                  }
                }
              })

              const now = new Date()
              const filePath = '../../../files/temporary_uploads/'
              const fileName = `crm_support_report_${now.getTime()}.xlsx`
              const pathWriteFile = path.resolve(__dirname, filePath, fileName)

              await workbook.toFileAsync(pathWriteFile)
              const result = await uploadFileS3(pathWriteFile, fileName)

              fs.unlinkSync(pathWriteFile)
              return resolve({
                error: false,
                data: result?.Location,
                status: 200,
              })
            }
          )
        } else if (option && option == 2) {
          let listData = await FNB_CUSTOMER_CARE_COLL.aggregate([
            {
              $match: {
                company: ObjectID(companyID),
                journey: { $exists: true, $ne: null },
              },
            },
            {
              $project: {
                year: { $year: '$createAt' },
                month: { $month: '$createAt' },
                createAt: 1,
                userCreate: 1,
                company: 1,
                funda: 1,
                journey: 1,
                customer: 1,
                mistake: 1,
                manager: 1,
              },
            },
            {
              $match: conditionObjYear,
            },
            {
              $group: {
                _id: {
                  userCreate: '$userCreate',
                  journey: '$journey',
                },
                quantity: { $sum: 1 },
              },
            },
          ])

          let listUser = await USER_COLL.find({
            _id: {
              $in: listData.map((item) => item._id.userCreate),
            },
          }).select('fullname')
          let listJourney = await ITEM__DOCTYPE_COLL.find({
            company: ObjectID(companyID),
            type: 11,
          }).select('name')

          let listData2 = await FNB_CUSTOMER_CARE_COLL.find({
            company: companyID,
            journey: { $exists: true, $ne: null },
          })
            .populate({
              path: 'customer journey funda order userCreate dataSource',
              select: 'name sign phone fullname',
            })
            .limit(10000)

          // Danh sách Affiliate
          let listData3 = await FNB_CUSTOMER_CARE_COLL.aggregate([
            {
              $match: {
                company: ObjectID(companyID),
                journey: { $exists: true, $ne: null },
              },
            },
            {
              $group: {
                _id: {
                  customer: '$customer',
                  journey: '$journey',
                },
              },
            },
          ])

          let listContact = await ITEM__COCNTACT_COLL.find({
            _id: {
              $in: listData3.map((item) => item._id.customer),
            },
          })
            .select('name phone note description')
            .populate({
              path: 'dataSource',
              select: 'name',
            })
            .sort({ dataSource: 1 })

          let listDoctype = await ITEM__DOCTYPE_COLL.find({
            _id: { $in: listData3.map((item) => item._id.journey) },
          })
            .select('name phone note description')
            .sort({ _id: 1 })

          // Modify the workbook.
          XlsxPopulate.fromFileAsync(
            path.resolve(
              __dirname,
              '../../../files/templates/excels/crm_export_journey.xlsx'
            )
          ).then(async (workbook) => {
            workbook
              .sheet('Report')
              .row(1)
              .cell(1)
              .value(`BÁO CÁO TỔNG HỢP ${yearFilter}`)

            var i = 4
            listUser?.forEach((item, index) => {
              workbook
                .sheet('Report')
                .row(i)
                .cell(1)
                .value(Number(index + 1))
              workbook.sheet('Report').row(i).cell(2).value(item?.fullname)
              workbook.sheet('Report').row(i).cell(3).value(`${item._id}`)
              i++
            })

            var j = 4
            listJourney?.forEach((item, index) => {
              workbook.sheet('Report').row(2).cell(j).value(`${item._id}`)
              workbook.sheet('Report').row(3).cell(j).value(item?.name)
              j++
            })

            var i = 4
            listUser?.forEach((item, index) => {
              for (var m = 1; m <= listJourney.length; m++) {
                listData?.forEach((subject) => {
                  let journeyID = workbook
                    .sheet('Report')
                    .row(2)
                    .cell(m + 3)
                    .value()

                  if (
                    subject._id.userCreate.toString() === item._id.toString() &&
                    subject._id.journey.toString() === journeyID.toString()
                  ) {
                    workbook
                      .sheet('Report')
                      .row(i)
                      .cell(m + 3)
                      .value(subject?.quantity)
                  }
                })
              }
              i++
            })

            var i = 4
            listData2?.forEach((item, index) => {
              workbook
                .sheet('Data')
                .row(i)
                .cell(1)
                .value(Number(index + 1))
              workbook.sheet('Data').row(i).cell(2).value(item?.createAt)
              workbook.sheet('Data').row(i).cell(3).value(item?.customer?.name)
              workbook.sheet('Data').row(i).cell(4).value(item?.customer?.phone)
              workbook.sheet('Data').row(i).cell(5).value(item?.journey?.name)
              workbook.sheet('Data').row(i).cell(6).value(item?.name)
              workbook.sheet('Data').row(i).cell(7).value(item?.amount)
              workbook.sheet('Data').row(i).cell(8).value(item?.note)
              workbook
                .sheet('Data')
                .row(i)
                .cell(9)
                .value(item?.dataSource?.name)
              workbook
                .sheet('Data')
                .row(i)
                .cell(10)
                .value(item?.userCreate?.fullname)
              i++
            })

            var i = 4
            listContact?.forEach((item, index) => {
              workbook
                .sheet('Report2')
                .row(i)
                .cell(1)
                .value(Number(index + 1))
              workbook
                .sheet('Report2')
                .row(i)
                .cell(2)
                .value(item?.dataSource?.name)
              workbook.sheet('Report2').row(i).cell(3).value(item?.note)
              workbook.sheet('Report2').row(i).cell(4).value(item?.name)
              workbook.sheet('Report2').row(i).cell(5).value(`${item.phone}`)
              workbook.sheet('Report2').row(i).cell(6).value(`${item._id}`)
              i++
            })

            var i = 7
            listDoctype?.forEach((item, index) => {
              workbook.sheet('Report2').row(2).cell(i).value(`${item._id}`)
              workbook.sheet('Report2').row(3).cell(i).value(item.name)
              i++
            })

            listData3?.forEach((item, index) => {
              for (var i = 4; i <= listContact.length + 3; i++) {
                let customerID = workbook
                  .sheet('Report2')
                  .row(i)
                  .cell(6)
                  .value()
                for (var j = 7; j <= listDoctype.length + 6; j++) {
                  let journeyID = workbook
                    .sheet('Report2')
                    .row(2)
                    .cell(j)
                    .value()
                  if (
                    customerID.toString() === item._id.customer.toString() &&
                    journeyID.toString() === item._id.journey.toString()
                  ) {
                    workbook.sheet('Report2').row(i).cell(j).value('x')
                  }
                }
              }
            })

            const now = new Date()
            const filePath = '../../../files/temporary_uploads/'
            const fileName = `crm_journey_report_${now.getTime()}.xlsx`
            const pathWriteFile = path.resolve(__dirname, filePath, fileName)

            await workbook.toFileAsync(pathWriteFile)
            const result = await uploadFileS3(pathWriteFile, fileName)

            fs.unlinkSync(pathWriteFile)
            return resolve({
              error: false,
              data: result?.Location,
              status: 200,
            })
          })
        }
      } catch (error) {
        console.log({ error })
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
