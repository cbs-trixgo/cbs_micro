'use strict'
const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const stringUtils = require('../../../tools/utils/string_utils')
const { setTimeZone } = require('../../../tools/utils/time_utils')
const ObjectID = require('mongoose').Types.ObjectId
const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

/**
 * DOMAIN AND ACTIONS
 */

/**
 * TOOLS
 */
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { uploadFileS3 } = require('../../../tools/s3')

/**
 * COLLECTIONS
 */
const ITEM__GOODS_COLL = require('../database/item.goods-coll')

class Model extends BaseModel {
  constructor() {
    super(ITEM__GOODS_COLL)
  }

  /**
   * Dev : Depv
   * Func: Tạo goods
   * Date: 13/12/2021
   */
  insert({
    companyID,
    parentID,
    name,
    sign,
    unit,
    unitprice,
    sellingUnitprice,
    note,
    type,
    unitPrice,
    unitPrice2,
    unitPrice3,
    unitPrice4,
    userID,
    convertID,
    convertQuantity,
    status,
    usage,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!name || name == '')
          return resolve({
            error: true,
            message: 'Tên không hợp lệ',
            keyError: 'Request params name invalid',
          })

        let dataInsert = {
          userCreate: userID,
          userUpdate: userID,
          modifyAt: new Date(),
          company: companyID,
          name,
        }

        if (parentID && checkObjectIDs(parentID)) {
          let infoParent = await ITEM__GOODS_COLL.findById(parentID)
          dataInsert.parent = parentID
          dataInsert.level = infoParent.level + 1
        }

        if (sign && sign != '') {
          dataInsert.sign = sign
        }

        if (unit && unit != '') {
          dataInsert.unit = unit
        }

        if (!isNaN(unitprice)) {
          dataInsert.unitprice = Number(unitprice)
        }

        if (!isNaN(sellingUnitprice)) {
          dataInsert.sellingUnitprice = Number(sellingUnitprice)
        }

        if (!isNaN(type)) {
          dataInsert.type = Number(type)
        }

        if (!isNaN(unitPrice)) {
          dataInsert.unitPrice = Number(unitPrice)
        }

        if (!isNaN(unitPrice2)) {
          dataInsert.unitPrice2 = Number(unitPrice2)
        }

        if (!isNaN(unitPrice3)) {
          dataInsert.unitPrice3 = Number(unitPrice3)
        }

        if (!isNaN(unitPrice4)) {
          dataInsert.unitPrice4 = Number(unitPrice4)
        }

        if (!isNaN(status)) {
          dataInsert.status = Number(status)
        }

        if (!isNaN(usage)) {
          dataInsert.usage = Number(usage)
        }

        if (note && note != '') {
          dataInsert.note = note
        }

        if (convertID && checkObjectIDs(convertID)) {
          dataInsert.convert = convertID
        }

        if (!isNaN(convertQuantity)) {
          dataInsert.convertQuantity = Number(convertQuantity)
        }

        let convertStr = ''
        if (name && name != '') {
          convertStr = stringUtils.removeAccents(name)
        }
        if (sign && sign != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(sign)
        }
        if (unit && unit != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(unit)
        }
        if (note && note != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(note)
        }
        dataInsert.namecv = convertStr

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({ error: true, message: 'cannot_insert' })

        //______Cập nhật amountChilds cho phần tử cha
        if (parentID && checkObjectIDs(parentID)) {
          await ITEM__GOODS_COLL.findByIdAndUpdate(
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
   * Func: update goods
   * Date: 13/12/2021
   */
  update({
    goodsID,
    name,
    sign,
    unit,
    unitprice,
    sellingUnitprice,
    type,
    unitPrice,
    unitPrice2,
    unitPrice3,
    unitPrice4,
    note,
    userID,
    convertID,
    convertQuantity,
    status,
    usage,
    imagesID,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(goodsID))
          return resolve({
            error: true,
            message: 'goodsID không hợp lệ',
            keyError: 'Request params goodsID invalid',
          })

        let dataUpdate = {
          userUpdate: userID,
          modifyAt: new Date(),
        }

        if (imagesID && imagesID.length) {
          dataUpdate.$addToSet = {
            images: imagesID,
          }
        }

        if (name && name != '') {
          dataUpdate.name = name
        }

        if (sign && sign != '') {
          dataUpdate.sign = sign
        }

        if (unit && unit != '') {
          dataUpdate.unit = unit
        }

        if (!isNaN(unitprice)) {
          dataUpdate.unitprice = Number(unitprice)
        }

        if (!isNaN(sellingUnitprice)) {
          dataUpdate.sellingUnitprice = Number(sellingUnitprice)
        }

        if (!isNaN(type)) {
          dataUpdate.type = Number(type)
        }

        if (!isNaN(unitPrice)) {
          dataUpdate.unitPrice = Number(unitPrice)
        }

        if (!isNaN(unitPrice2)) {
          dataUpdate.unitPrice2 = Number(unitPrice2)
        }

        if (!isNaN(unitPrice3)) {
          dataUpdate.unitPrice3 = Number(unitPrice3)
        }

        if (!isNaN(unitPrice4)) {
          dataUpdate.unitPrice4 = Number(unitPrice4)
        }

        if (!isNaN(status)) {
          dataUpdate.status = Number(status)
        }

        if (!isNaN(usage)) {
          dataUpdate.usage = Number(usage)
        }

        if (note && note != '') {
          dataUpdate.note = note
        }

        if (convertID && checkObjectIDs(convertID)) {
          dataUpdate.convert = convertID
        }

        if (!isNaN(convertQuantity)) {
          dataUpdate.convertQuantity = Number(convertQuantity)
        }

        let convertStr = ''
        if (name && name != '') {
          convertStr = stringUtils.removeAccents(name)
        }
        if (sign && sign != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(sign)
        }
        if (unit && unit != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(unit)
        }
        if (note && note != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(note)
        }
        dataUpdate.namecv = convertStr

        let infoAfterUpdate = await ITEM__GOODS_COLL.findByIdAndUpdate(
          goodsID,
          dataUpdate,
          { new: true }
        )
        return resolve({ error: false, data: infoAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: get info goods ✅
   * Author: Depv
   * Code:
   */
  getInfo({ goodsID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(goodsID))
          return resolve({
            error: true,
            message: 'Request params goodsID invalid',
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

        let infoAterGet = await ITEM__GOODS_COLL.findById(goodsID)
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
   * Name  : Danh sách goods
   * Author: Depv
   * Code  :
   */
  getList({
    companyID,
    parentID,
    fundaID,
    type,
    isParent,
    status,
    usage,
    isListParentOfListChilds,
    keyword,
    limit = 10,
    lastestID,
    select,
    populates = {},
  }) {
    // console.log({companyID, parentID, fundaID, type, isParent })
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        let sortBy
        let conditionObj = {}
        let keys = ['createAt__-1', '_id__-1']

        if (fundaID && checkObjectIDs(fundaID)) {
          conditionObj.fundas = { $in: [fundaID] }
        }

        if (parentID && checkObjectIDs(parentID)) {
          conditionObj.parent = ObjectID(parentID)
        }

        // Chỉ lấy danh mục
        if (isParent && Number(isParent) == 1) {
          conditionObj.parent = { $exists: false }
        }

        // Phân loại (sản phẩm chính/topping)
        if (type && !isNaN(type)) {
          conditionObj.type = Number(type)
        }

        // Theo trạng thái
        if (status && !isNaN(status)) {
          conditionObj.status = Number(status)
        }

        // Theo mục đích sử dụng
        if (usage && !isNaN(usage)) {
          conditionObj.usage = Number(usage)
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

        if (companyID && checkObjectIDs(companyID)) {
          conditionObj.company = companyID
        }

        // Chỉ lấy danh sách cha hoặc con
        if (isListParentOfListChilds == 1) {
          if (parentID) {
            conditionObj.parent = parentID
          } else {
            conditionObj.parent = { $exists: false }
          }
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          conditionObj.name = new RegExp(keyword, 'i')
        }

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await ITEM__GOODS_COLL.findById(lastestID)
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

        let infoDataAfterGet = await ITEM__GOODS_COLL.find(conditionObj)
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

        let totalRecord = await ITEM__GOODS_COLL.count(conditionObjOrg)
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
   * Dev: HiepNH
   * Func: Download Template Excel
   * Date: 8/12/2022
   */
  downloadTemplateExcel({ companyID, userID }) {
    return new Promise(async (resolve) => {
      try {
        // let listData  = await ITEM__CONTACT_COLL.find({ company: companyID })
        // console.log(listData)

        // Modify the workbook.
        XlsxPopulate.fromFileAsync(
          path.resolve(
            __dirname,
            '../../../files/templates/excels/item_import_goods.xlsx'
          )
        ).then(async (workbook) => {
          // var i = 3;
          // listData?.forEach((item, index) => {
          //     workbook.sheet("Export").row(i).cell(1).value(Number(index+1));
          //     workbook.sheet("Export").row(i).cell(2).value(item.name);
          //     workbook.sheet("Export").row(i).cell(3).value(item.phone);
          //     workbook.sheet("Export").row(i).cell(4).value(item.address);
          //     // workbook.sheet("Export").row(i).cell(5).value(item.description);
          //     workbook.sheet("Export").row(i).cell(5).value(item.note);
          //     i++
          // });

          const now = new Date()
          const filePath = '../../../files/temporary_uploads/'
          const fileName = `Template_import_goods_${now.getTime()}.xlsx`
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
   * Date: 8/12/2022
   */
  importFromExcel({ companyID, dataImport, userID, ctx }) {
    return new Promise(async (resolve) => {
      try {
        const dataImportJSON = JSON.parse(dataImport)
        let index = 0
        let errorNumber = 0
        for (const data of dataImportJSON) {
          if (index > 0) {
            let dataInsert = {
              companyID,
              userID,
              name: data?.__EMPTY,
              sign: data?.__EMPTY_1,
              type: data?.__EMPTY_2,
              unit: data?.__EMPTY_3,
              unitprice: data?.__EMPTY_4,
              sellingUnitprice: data?.__EMPTY_5,
              unitPrice: data?.__EMPTY_6,
              unitPrice2: data?.__EMPTY_7,
              unitPrice3: data?.__EMPTY_8,
              unitPrice4: data?.__EMPTY_9,
              note: data?.__EMPTY_10,
              usage: data?.__EMPTY_11,
              status: data?.__EMPTY_12,
              parentID: data?.__EMPTY_13,
            }

            let infoAfterInsert = await this.insert(dataInsert)
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
