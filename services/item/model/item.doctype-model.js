'use strict'

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { DOCTYPE_TYPE } = require('../helper/item.keys-constant')
const stringUtils = require('../../../tools/utils/string_utils')

/**
 * COLLECTIONS
 */
const ITEM__DOCTYPE_COLL = require('../database/item.doctype-coll')

class Model extends BaseModel {
  constructor() {
    super(ITEM__DOCTYPE_COLL)
  }

  /**
   * Dev: MinhVH
   * Func: Insert doctype
   * Date: 22/02/2022
   */
  insert({
    type,
    name,
    description,
    sign,
    unit,
    amount,
    alert,
    companyID,
    parent,
    linkItemID,
    level,
    userID,
    salesChannel,
  }) {
    // console.log({ type, name, description, sign, unit, amount, companyID, parent, linkItemID, level, userID, salesChannel })
    return new Promise(async (resolve) => {
      try {
        if (
          !name ||
          !type ||
          !DOCTYPE_TYPE.includes(+type) ||
          !checkObjectIDs([userID]) ||
          !checkObjectIDs([companyID])
        ) {
          return resolve({
            error: true,
            message: 'Tham số name|type|userID|companyID không hợp lệ',
            keyError: 'params_type_invalid',
            status: 400,
          })
        }

        if (type == 11) {
          if (!linkItemID || !checkObjectIDs([linkItemID]))
            return resolve({
              error: true,
              message: 'Lĩnh vực kinh doanh chưa hợp lệ',
              keyError: 'params_type_invalid',
              status: 400,
            })
        }

        let dataInsert = {
          name,
          type,
          description,
          sign,
          unit,
          company: companyID,
          userCreate: userID,
          userUpdate: userID,
          modifyAt: new Date(),
        }

        let convertStr = ''
        if (name && name != '') {
          convertStr = stringUtils.removeAccents(name)
        }
        if (description && description != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(description)
        }
        if (sign && sign != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(sign)
        }
        dataInsert.namecv = convertStr

        if (alert) {
          dataInsert.alert = Number(alert)
        }

        if (amount) {
          dataInsert.amount = Number(amount)
        }

        if (salesChannel) {
          dataInsert.salesChannel = salesChannel
        }

        if (linkItemID && checkObjectIDs(linkItemID)) {
          dataInsert.linkItem = linkItemID
        }

        if (parent && checkObjectIDs(parent)) {
          let infoParent = await ITEM__DOCTYPE_COLL.findById(parent)
          dataInsert.parent = parent
          dataInsert.level = infoParent.level + 1
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        if (parent && checkObjectIDs(parent)) {
          await ITEM__DOCTYPE_COLL.findByIdAndUpdate(parent, {
            $addToSet: {
              childs: infoAfterInsert._id,
            },
            $inc: { amountChilds: 1 },
          })
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
   * Dev: MinhVH
   * Func: Update doctype
   * Date: 22/02/2022
   */
  update({
    doctypeID,
    name,
    description,
    sign,
    unit,
    amount,
    alert,
    userID,
    salesChannel,
    linkItemID,
  }) {
    // console.log({ doctypeID, name, description, sign, unit, amount, userID, salesChannel, linkItemID })
    return new Promise(async (resolve) => {
      try {
        if (!name)
          return resolve({
            error: true,
            message: 'Tên không hợp lệ',
            keyError: 'Request params name invalid',
          })

        const dataUpdate = { userUpdate: userID, modifyAt: new Date() }

        if (!checkObjectIDs([doctypeID, userID])) {
          return resolve({
            error: true,
            message: 'Tham số doctypeID hoặc userID không hợp lệ',
            keyError: 'params_doctypeID_or_userID_invalid',
            status: 400,
          })
        }

        name && (dataUpdate.name = name)
        description && (dataUpdate.description = description)
        sign && (dataUpdate.sign = sign)
        unit && (dataUpdate.unit = unit)

        if (alert) {
          dataUpdate.alert = Number(alert)
        }

        if (amount) {
          dataUpdate.amount = Number(amount)
        }

        if (salesChannel) {
          dataUpdate.salesChannel = Number(salesChannel)
        }

        if (linkItemID && checkObjectIDs(linkItemID)) {
          dataUpdate.linkItem = linkItemID
        }

        let convertStr = ''
        if (name && name != '') {
          convertStr = stringUtils.removeAccents(name)
        }
        if (description && description != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(description)
        }
        if (sign && sign != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(sign)
        }

        dataUpdate.namecv = convertStr

        let infoAfterUpdate = await ITEM__DOCTYPE_COLL.findByIdAndUpdate(
          doctypeID,
          dataUpdate,
          { new: true }
        )

        if (!infoAfterUpdate) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
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
   * Name: get Hợp đồng
   * Author: Depv
   * Code:
   */
  getInfo({ doctypeID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(doctypeID))
          return resolve({
            error: true,
            message: 'Request params doctypeID invalid',
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
        /**
         * LOGIC STEP (3)
         * 3.1: Convert type + update name (ví dụ: string -> number)
         * 3.2: Operation database
         */
        let infoAterGet = await ITEM__DOCTYPE_COLL.findById(doctypeID)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoAterGet) {
          return resolve({
            error: true,
            message: 'Doctype không tồn tại',
            keyError: 'doctype_not_exists',
            status: 400,
          })
        }

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
   * Name  : Danh sách hợp đồng
   * Author: Depv
   * Code  :
   */
  getList({
    companyID,
    projectID,
    parentID,
    type,
    keyword,
    limit = 10,
    lastestID,
    select,
    populates,
    isShowParentAndChild,
  }) {
    // console.log({ companyID, projectID, parentID, type, keyword, limit, lastestID, select, populates, isShowParentAndChild })
    return new Promise(async (resolve) => {
      try {
        if (isNaN(limit) || +limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        let conditionObj = {}
        let sortBy = {}
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

        // TRẠNG THÁI CÔNG VIỆC
        //____________Công ty
        if (checkObjectIDs(companyID)) {
          conditionObj.company = companyID
        }

        //____________Dự án
        if (checkObjectIDs(projectID)) {
          conditionObj.project = projectID
        }

        //____________Doctype con
        if (checkObjectIDs(parentID)) {
          conditionObj.parent = parentID
        }

        // Sau fix trên Mobile OK thì mới mở lại chỗ này (Hiepnh 16/1/2024)
        // if(isShowParentAndChild == 1){
        //     conditionObj.parent = { $exists: false }
        // }

        //____________Loại doctype
        if (type) {
          conditionObj.type = type
        }

        if (keyword) {
          keyword = stringUtils.removeAccents(keyword)
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          let regSearch = new RegExp(keyword, 'i')

          conditionObj.namecv = regSearch
        }
        // console.log(conditionObj)

        let conditionObjOrg = { ...conditionObj }

        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await ITEM__DOCTYPE_COLL.findById(lastestID)
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

        let infoDataAfterGet = await ITEM__DOCTYPE_COLL.find(conditionObj)
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
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await ITEM__DOCTYPE_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)

        return resolve({
          error: false,
          data: {
            listRecords: infoDataAfterGet,
            limit,
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
   * Name: importFromExcel
   * Code: HiepNH
   * Date: 8/12/2022
   */
  importFromExcel({ companyID, dataImport, userID, type }) {
    return new Promise(async (resolve) => {
      try {
        const dataImportJSON = JSON.parse(dataImport)
        let index = 0
        let errorNumber = 0

        for (const data of dataImportJSON) {
          // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
          if (index > 0 && index < 500) {
            let dataInsert = {
              type,
              name: data?.__EMPTY,
              sign: data?.__EMPTY_1,
              unit: data?.__EMPTY_2,
              amount: Number(data?.__EMPTY_3),
              description: data?.__EMPTY_4,
              companyID,
              userID,
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
