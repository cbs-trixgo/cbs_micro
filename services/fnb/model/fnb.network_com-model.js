'use strict'

const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const stringUtils = require('../../../tools/utils/string_utils')
const { KEY_ERROR } = require('../../../tools/keys')
const ObjectID = require('mongoose').Types.ObjectId
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const { uploadFileS3 } = require('../../../tools/s3')
const { isValidDate } = require('../../../tools/utils/time_utils')

const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
  CF_ACTIONS_ANALYSIS,
} = require('../../analysis/helper/analysis.actions-constant')

/**s
 * import inter-coll, exter-coll
 */
const FNB_NETWORK_COM_COLL = require('../database/fnb.network_com-coll')

/**
 * import inter-model, exter-model
 */

let dataTF = {
  appID: '61e04971fdebf77b072d1b0f', // FNB
  menuID: '63af81debe33df0012ecaeca', //
  type: 1,
  action: 1, // Xem
}
let dataTF2 = {
  appID: '61e04971fdebf77b072d1b0f', // FNB
  menuID: '63af81debe33df0012ecaeca', //
  type: 1,
  action: 2, // Thêm
}
class Model extends BaseModel {
  constructor() {
    super(FNB_NETWORK_COM_COLL)
  }

  /**
   * Name: Insert
   * Author: HiepNH
   * Code: 24/11/2022
   */
  insert({
    userID,
    companyID,
    orderID,
    customerID,
    saleID,
    amount,
    uplineID,
    level,
    rate,
    commission,
    note,
  }) {
    // console.log({ userID, companyID, orderID, customerID, saleID, amount, uplineID, level, rate, commission, note })
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(orderID))
          return resolve({
            error: true,
            message: 'orderID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let dataInsert = {
          company: companyID,
          userCreate: userID,
          order: orderID,
        }

        if (orderID && checkObjectIDs(orderID)) {
          dataInsert.order = orderID
        }

        if (customerID && checkObjectIDs(customerID)) {
          dataInsert.customer = customerID
        }

        if (saleID && checkObjectIDs(saleID)) {
          dataInsert.sale = saleID
        }

        if (uplineID && checkObjectIDs(uplineID)) {
          dataInsert.upline = uplineID
        }

        if (amount && !isNaN(amount)) {
          dataInsert.amount = Number(amount)
        }

        if (level && !isNaN(level)) {
          dataInsert.level = Number(level)
        }

        if (rate && !isNaN(rate)) {
          dataInsert.rate = Number(rate)
        }

        if (commission && !isNaN(commission)) {
          dataInsert.commission = Number(commission)
        }

        if (note && note != '') {
          dataInsert.note = note
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: 'Thêm thất bại',
            keyError: KEY_ERROR.INSERT_FAILED,
          })

        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: update group
   * Author: Depv
   * Code:
   */
  update({
    userID,
    companyID,
    networkID,
    orderID,
    customerID,
    saleID,
    amount,
    uplineID,
    level,
    rate,
    commission,
    note,
  }) {
    // console.log({ cuserID, companyID, networkID, orderID, customerID, saleID, amount, uplineID, level, rate, commission, note })
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(networkID))
          return resolve({
            error: true,
            message: 'networkID invalid',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

        if (orderID && checkObjectIDs(orderID)) {
          dataUpdate.order = orderID

          // let infoParent = await FNB_NETWORK_COM_COLL.findById(parentID);
          // dataUpdate.parent = parentID;
          // dataUpdate.level = infoParent.level + 1;
        }

        if (customerID && checkObjectIDs(customerID)) {
          dataUpdate.customer = customerID
        }

        if (saleID && checkObjectIDs(saleID)) {
          dataUpdate.sale = saleID
        }

        if (uplineID && checkObjectIDs(uplineID)) {
          dataUpdate.upline = uplineID
        }

        if (amount && !isNaN(amount)) {
          dataUpdate.amount = Number(amount)
        }

        if (level && !isNaN(level)) {
          dataUpdate.level = Number(level)
        }

        if (rate && !isNaN(rate)) {
          dataUpdate.rate = Number(rate)
        }

        if (commission && !isNaN(commission)) {
          dataUpdate.commission = Number(commission)
        }

        if (note && note != '') {
          dataUpdate.note = note
        }

        let infoAfterUpdate = await FNB_NETWORK_COM_COLL.findByIdAndUpdate(
          networkID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
            keyError: KEY_ERROR.UPDATE_FAILED,
          })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: get info user_pcm_plan_group
   * Author: Depv
   * Code:
   */
  getInfo({ networkID, select, populates = {} }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(networkID))
          return resolve({ error: true, message: 'param_invalid' })

        // populate
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

        let infoPlanGroup = await FNB_NETWORK_COM_COLL.findById(networkID)
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
    userID,
    contacts,
    companyID,
    orderID,
    customerID,
    saleID,
    uplineID,
    fromDate,
    toDate,
    status,
    keyword,
    limit = 10,
    lastestID,
    select,
    populates,
    sortKey,
  }) {
    // console.log('==================getList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    // console.log({ option, userID, contacts, companyID, orderID, customerID, saleID, uplineID, fromDate, toDate, status, keyword, limit, lastestID, select, populates, sortKey })
    return new Promise(async (resolve) => {
      try {
        if (Number(limit) > 50) {
          limit = 50
        } else {
          limit = +Number(limit)
        }

        let conditionObj = {}
        let sortBy
        let keys = ['date__-1', '_id__-1']

        // Theo userID đang truy cập
        if (!option) {
          // console.log('========000000000000')
          let listContacts = []
          if (contacts && contacts.length) {
            listContacts = contacts.map((item) => ObjectID(item._id))
          }

          conditionObj.upline = { $in: listContacts }
        }

        // Theo hệ thống cụ thể
        else if (option && option == 1) {
          // console.log('========11111111111111')
          conditionObj.upline = ObjectID(uplineID)
        }

        // Theo phân vùng
        else if (option && option == 2) {
          // console.log('========22222222222222')
          conditionObj.company = ObjectID(companyID)
        }

        if (saleID && checkObjectIDs(saleID)) {
          conditionObj.sale = ObjectID(saleID)
        }

        // Theo trạng thái
        if (status && !isNaN(status)) {
          conditionObj.status = Number(status)
        }

        if (isValidDate(fromDate) && isValidDate(toDate)) {
          conditionObj.date = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          }
        }

        // Làm rõ mục đích để làm gì?
        if (sortKey && typeof sortKey === 'string') {
          if (!IsJsonString(sortKey))
            return resolve({
              error: true,
              message: 'Request params sortKey invalid',
              status: 400,
            })

          keys = JSON.parse(sortKey)
        }
        console.log(conditionObj)

        /**
         * ĐIỀU KIỆN KHÁC
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

        // if(keyword){
        //     let keywordCV =  stringUtils.removeAccents(keyword)
        //     keyword = keyword.split(" ");
        //     keyword = '.*' + keyword.join(".*") + '.*';
        //     const regSearch = new RegExp(keyword, 'i');

        //     keywordCV = keywordCV.split(" ");
        //     keywordCV = '.*' + keywordCV.join(".*") + '.*';
        //     const regCVSearch = new RegExp(keywordCV, 'i');

        //     conditionObj.namecv = regCVSearch
        // }

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
          let infoData = await FNB_NETWORK_COM_COLL.findById(lastestID)
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

        let infoDataAfterGet = await FNB_NETWORK_COM_COLL.find(conditionObj)
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
        let totalRecord = await FNB_NETWORK_COM_COLL.count(conditionObjOrg)
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
   * Name  : getListByProperty
   * Code: Hiepnh
   * Date  : 10/4/2022
   */
  getListByProperty({
    userID,
    contacts,
    option,
    optionGroup,
    companyID,
    orderID,
    customerID,
    saleID,
    uplineID,
    fromDate,
    toDate,
    status,
    ctx,
  }) {
    // console.log('==================getListByProperty>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    // console.log({ userID, contacts, option, optionGroup, companyID, orderID, customerID, saleID, uplineID, fromDate, toDate, status })
    return new Promise(async (resolve) => {
      try {
        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

        let conditionObj = {},
          conditionProject = {},
          conditionGroup = {},
          conditionObjYear = {},
          conditionPopulate = {}
        let sortBy = { amount: -1 }

        // Theo userID đang truy cập
        if (!option) {
          // console.log('========000000000000')
          let listContacts = []
          if (contacts && contacts.length) {
            listContacts = contacts.map((item) => ObjectID(item._id))
          }
          // console.log(listContacts)

          conditionObj.upline = { $in: listContacts }
        }

        // Theo hệ thống cụ thể
        else if (option && option == 1) {
          // console.log('========11111111111111')
          conditionObj.upline = ObjectID(uplineID)
        }

        // Theo phân vùng
        else if (option && option == 2) {
          // console.log('========22222222222222')
          conditionObj.company = ObjectID(companyID)
        }

        // Theo trạng thái
        if (status && !isNaN(status)) {
          conditionObj.status = Number(status)
        }

        conditionProject = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' },
          dayOfWeek: { $dayOfWeek: '$date' },
          hour: { $hour: '$date' },
          date: 1,
          order: 1,
          customer: 1,
          sale: 1,
          amount: 1,
          level: 1,
          upline: 1,
          rate: 1,
          commission: 1,
        }

        if (!optionGroup) {
          if (isValidDate(fromDate) && isValidDate(toDate)) {
            conditionObj.date = {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            }
          }

          conditionGroup = {
            _id: {},
            quantity: { $sum: 1 },
            commission: { $sum: '$commission' },
            amount: { $sum: '$amount' },
          }
        } else if (optionGroup && optionGroup == 1) {
          conditionGroup = {
            _id: { year: '$year' },
            quantity: { $sum: 1 },
            commission: { $sum: '$commission' },
            amount: { $sum: '$amount' },
          }
        } else if (optionGroup && optionGroup == 2) {
          if (isValidDate(fromDate) && isValidDate(toDate)) {
            conditionObj.date = {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            }
          }

          conditionGroup = {
            _id: { month: '$month' },
            quantity: { $sum: 1 },
            commission: { $sum: '$commission' },
            amount: { $sum: '$amount' },
          }
        } else if (optionGroup && optionGroup == 3) {
          if (isValidDate(fromDate) && isValidDate(toDate)) {
            conditionObj.date = {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            }
          }

          conditionGroup = {
            _id: { day: '$day' },
            quantity: { $sum: 1 },
            commission: { $sum: '$commission' },
            amount: { $sum: '$amount' },
          }
        } else if (optionGroup && optionGroup == 4) {
          if (isValidDate(fromDate) && isValidDate(toDate)) {
            conditionObj.date = {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            }
          }

          conditionGroup = {
            _id: { dayOfWeek: '$dayOfWeek' },
            quantity: { $sum: 1 },
            commission: { $sum: '$commission' },
            amount: { $sum: '$amount' },
          }
        } else if (optionGroup && optionGroup == 5) {
          if (isValidDate(fromDate) && isValidDate(toDate)) {
            conditionObj.date = {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            }
          }

          conditionGroup = {
            _id: { hour: '$hour' },
            quantity: { $sum: 1 },
            commission: { $sum: '$commission' },
            amount: { $sum: '$amount' },
          }
        }

        // console.log('==================')
        // console.log(conditionObj)
        // console.log(conditionGroup)

        let listData = await FNB_NETWORK_COM_COLL.aggregate([
          {
            $match: conditionObj,
          },
          {
            $project: conditionProject,
          },
          {
            $group: conditionGroup,
          },
          // {
          //     $sort: sortBy
          // }
        ])

        return resolve({ error: false, data: listData })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Dev: HiepNH
   * Func: Download Template Excel
   * Date: 8/12/2022
   */
  downloadTemplateExcel({ companyID, userID }) {
    return new Promise(async (resolve) => {
      try {
        // Modify the workbook.
        XlsxPopulate.fromFileAsync(
          path.resolve(
            __dirname,
            '../../../files/templates/excels/fnb_product_template_import.xlsx'
          )
        ).then(async (workbook) => {
          const now = new Date()
          const filePath = '../../../files/temporary_uploads/'
          const fileName = `Template_import_product_${now.getTime()}.xlsx`
          const pathWriteFile = path.resolve(__dirname, filePath, fileName)

          await workbook.toFileAsync(pathWriteFile)
          const result = await uploadFileS3(pathWriteFile, fileName)

          fs.unlinkSync(pathWriteFile)
          // console.log({ result })
          return resolve({
            error: false,
            data: result?.Location,
            status: 200,
          })
        })
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
   * Func: importFromExcel
   * Date: 8/1/2023
   */
  importFromExcel({ companyID, dataImport, userID }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        const dataImportJSON = JSON.parse(dataImport)
        // console.log('=============Log data===================');
        // return console.log({ dataImportJSON });
        let index = 0
        let errorNumber = 0

        for (const data of dataImportJSON) {
          // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
          if (index > 0) {
            let dataInsert = {
              companyID,
              userID,
              name: data?.__EMPTY,
              sign: data?.__EMPTY_1,
              type: data?.__EMPTY_2,
              unit: data?.__EMPTY_3,
              unitPrice: data?.__EMPTY_4,
              unitPrice2: data?.__EMPTY_5,
              unitPrice3: data?.__EMPTY_6,
              unitPrice4: data?.__EMPTY_7,
              note: data?.__EMPTY_8,
              parentID: data?.__EMPTY_9,
            }
            // console.log(dataInsert);

            let infoAfterInsert = await that.insert(dataInsert)
            // console.log(infoAfterInsert);
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
}

exports.MODEL = new Model()
