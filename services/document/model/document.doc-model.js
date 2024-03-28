'use strict'

/**
 * EXTERNAL PACKAGE
 */
const ObjectID = require('mongoose').Types.ObjectId
const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const ISOdate = require('isodate')
const stringUtils = require('../../../tools/utils/string_utils')

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const timeUtils = require('../../../tools/utils/time_utils')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const {
  DOC_DIRECTION_TYPE,
  DOC_TYPE,
  DOCUMENT_TYPES,
  DIRECTION_TYPES,
} = require('../helper/document.keys-constant')
const {
  checkObjectIDs,
  IsJsonString,
  checkNumberIsValidWithRange,
  validateParamsObjectID,
} = require('../../../tools/utils/utils')
const { uploadFileS3 } = require('../../../tools/s3')

/**
 * COLLECTIONS
 */
const COMPANY_COLL = require('../../auth/database/auth.company-coll')
const DEPARTMENT_COLL = require('../../item/database/item.department-coll')
const DOCTYPE_COLL = require('../../item/database/item.doctype-coll')
const STORAGE_COLL = require('../../item/database/item.storage-coll')
const CONTRACT_COLL = require('../../item/database/item.contract-coll')
const DOCUMENT__DOC_COLL = require('../database/document.doc-coll')
const DOCUMENT__FILE_COLL = require('../database/document.doc_file-coll')
const DOCUMENT__PACKAGE_COLL = require('../database/document.package-coll')
const DOCUMENT__USER_COLL = require('../database/document.user_related-coll')

class Model extends BaseModel {
  constructor() {
    super(DOCUMENT__DOC_COLL)
  }
  /**
   * Dev: MinhVH
   * Func: Thêm file đính kèm trong hồ sơ
   * Date: 13/11/2021
   */
  addFileAttachment({ authorID, documentID, filesID }) {
    // console.log('===========THÊM FILE VÀO HỒ SƠ===========>>>>>>>>>>')
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([authorID]))
          return resolve({
            error: true,
            message: 'Request params authorID invalid',
          })

        if (!checkObjectIDs([documentID]))
          return resolve({
            error: true,
            message: 'Request params documentID invalid',
          })

        if (!filesID || !filesID.length || !checkObjectIDs(filesID))
          return resolve({
            error: true,
            message: 'Request params filesID invalid',
          })

        const listFilesInsert = filesID.map((file) => ({
          document: documentID,
          user: authorID,
          file,
          createAt: timeUtils.getCurrentTime(),
          modifyAt: timeUtils.getCurrentTime(),
        }))

        let infoAfterInsert =
          await DOCUMENT__FILE_COLL.insertMany(listFilesInsert)

        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: 'Add files attachment failed',
          })

        const infoAfterInsertTemp = [...infoAfterInsert]
        const infoLastFile = infoAfterInsertTemp.pop()

        const dataUpdateDoc = {
          lastFile: infoLastFile.file,
          $addToSet: {
            files: filesID,
          },
        }

        // Cập nhật trường lastFile vào trong document
        let infoDoc = await DOCUMENT__DOC_COLL.findByIdAndUpdate(
          documentID,
          dataUpdateDoc
        )
        //    console.log(infoDoc)

        return resolve({
          error: false,
          status: 200,
          data: infoAfterInsert,
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
   * Func: Tạo mới văn bản
   * Date: 26/10/2021
   */
  insert({
    parentID,
    departmentID,
    userID,
    packageID,
    direction,
    senderID,
    receiverID,
    propertyID,
    type,
    contractID,
    storageID,
    amount,
    amountDelivery,
    requestResponse,
    expiredResponse,
    sign,
    storeSign,
    approver,
    style,
    status,
    date,
    receivedDate,
    otherID,
    datahubContactID,
    name,
    description,
    note,
    fieldID,
    value,
    completeStatus,
    publishID,
    deadline,
    ctx,
  }) {
    // console.log({
    //     parentID, departmentID, userID, packageID, direction, senderID, receiverID, propertyID, type, contractID, storageID, amount, amountDelivery,
    // requestResponse, expiredResponse, sign, storeSign, approver, style, status, date, receivedDate, otherID, datahubContactID,
    // name, description, note, fieldID, value, completeStatus, publishID, deadline
    // })
    return new Promise(async (resolve) => {
      try {
        /**
         * BA
         * 1-departmentID phải có định dạng String
         */
        if (
          !checkObjectIDs(departmentID) ||
          !name ||
          name == '' ||
          !checkObjectIDs(packageID) ||
          !checkObjectIDs(publishID)
        ) {
          return resolve({
            error: true,
            message:
              'Request params departmentID|name|packageID|publishID invalid',
            keyError: 'params_invalid',
          })
        }

        let infoAuthor = await ctx.call(
          `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`,
          {
            userID,
            select: '_id company department fullname',
          }
        )

        let infoDepartment = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
          {
            departmentID,
          }
        )
        let companyID = infoDepartment.data.company
        if (!companyID)
          return res.json({ error: true, message: 'company_invalid' })

        let dataInsert = {
          type,
          author: userID,
          company: companyID,
          project: departmentID,
          package: packageID,
          direction,
          name,
          sign,
          storeSign,
          approver,
          date,
          receivedDate,
          style,
          status,
          requestResponse,
          expiredResponse,
          note,
          description,
          value,
          completeStatus,
        }

        /**
         * Convert to query
         */
        let convertStr = ''
        if (name && name != '') {
          convertStr = stringUtils.removeAccents(name)
        }
        if (sign && sign != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(sign)
        }
        if (storeSign && storeSign != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(storeSign)
        }
        if (description && description != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(description)
        }
        if (note && note != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(note)
        }
        if (approver && approver != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(approver)
        }
        dataInsert.namecv = convertStr

        if (!infoAuthor.error) {
          dataInsert.companyOfAuthor = infoAuthor.data.company
          dataInsert.departmentOfAuthor = infoAuthor.data.department
        }

        amount && (dataInsert.amount = +amount || 1)
        amountDelivery && (dataInsert.amountDelivery = +amountDelivery || 0)

        contractID &&
          checkObjectIDs(contractID) &&
          (dataInsert.contract = contractID)
        senderID && checkObjectIDs(senderID) && (dataInsert.sender = senderID)
        propertyID &&
          checkObjectIDs(propertyID) &&
          (dataInsert.property = propertyID)
        receiverID &&
          checkObjectIDs(receiverID) &&
          (dataInsert.receiver = receiverID)
        fieldID && checkObjectIDs(fieldID) && (dataInsert.field = fieldID)
        datahubContactID &&
          checkObjectIDs(datahubContactID) &&
          (dataInsert.datahubContact = datahubContactID)
        otherID && checkObjectIDs(otherID) && (dataInsert.other = otherID)
        storageID &&
          checkObjectIDs(storageID) &&
          (dataInsert.storage = storageID)
        publishID &&
          checkObjectIDs(publishID) &&
          (dataInsert.publish = publishID)

        if (deadline) {
          dataInsert.deadline = deadline
        }

        if (parentID && checkObjectIDs(parentID)) {
          let infoParent =
            await DOCUMENT__DOC_COLL.findById(parentID).select('level')
          if (!infoParent)
            return resolve({
              error: true,
              message: 'parentID invalid',
              keyError: 'parentID_invalid',
              status: 422,
            })
          dataInsert.parent = parentID
          dataInsert.level = +infoParent.level + 1
        }

        let infoAfterInsert = await this.insertData(dataInsert)

        if (!infoAfterInsert) {
          return resolve({
            error: true,
            message: "Can't create document",
            keyError: 'create_document_failed',
            status: 422,
          })
        }

        // Call model create document__user
        await DOCUMENT__USER_COLL.create({
          document: infoAfterInsert._id,
          user: userID,
          permission: 1,
          createAt: timeUtils.getCurrentTime(),
          modifyAt: timeUtils.getCurrentTime(),
        })

        // Chỉ cập nhật numberOfDocs khi tạo văn bản cha
        if (!parentID) {
          // Cập nhật số lượng document cho Dự án
          await ctx.call(
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
            {
              departmentID,
              numberOfDocs: 1,
            }
          )

          // Cập nhật số lượng document cho Gói thầu
          if (packageID && checkObjectIDs(packageID)) {
            await DOCUMENT__PACKAGE_COLL.findByIdAndUpdate(packageID, {
              $inc: {
                numberOfDocs: 1,
              },
            })
          }

          // Cập nhật số lượng document cho Hợp đồng
          if (contractID && checkObjectIDs(contractID)) {
            await CONTRACT_COLL.findByIdAndUpdate(contractID, {
              $inc: {
                numberOfDocs: 1,
              },
            })
          }
        } else {
          // Cập nhật số lượng document cho Dự án
          await ctx.call(
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE}`,
            {
              departmentID,
              numberOfDocs: 1,
            }
          )

          // Cập nhật số lượng document cho Gói thầu
          if (packageID && checkObjectIDs(packageID)) {
            await DOCUMENT__PACKAGE_COLL.findByIdAndUpdate(packageID, {
              $inc: {
                numberOfDocs: 1,
              },
            })
          }

          // Cập nhật số lượng document cho Hợp đồng
          if (contractID && checkObjectIDs(contractID)) {
            await CONTRACT_COLL.findByIdAndUpdate(contractID, {
              $inc: {
                numberOfDocs: 1,
              },
            })
          }

          // Cập nhật số lượng document cho Hồ sơ cha
          if (checkObjectIDs(parentID)) {
            await DOCUMENT__DOC_COLL.findByIdAndUpdate(parentID, {
              $inc: { amountDocumentChild: 1 },
              new: true,
            })
          }
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
          keyError: 'server_error',
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: HiepNH
   * Func: Cập nhật văn bản
   * Date: 28/10/2021
   */
  update({
    documentID,
    userID,
    packageID,
    direction,
    senderID,
    receiverID,
    propertyID,
    type,
    contractID,
    storageID,
    amount,
    amountDelivery,
    requestResponse,
    expiredResponse,
    sign,
    storeSign,
    approver,
    style,
    status,
    date,
    receivedDate,
    datahubContactID,
    name,
    description,
    note,
    fieldID,
    value,
    completeStatus,
    otherID,
    publishID,
    deadline,
    ctx,
  }) {
    // console.log({
    //     documentID, userID, packageID, direction, senderID, receiverID, propertyID, type, contractID, storageID, amount, amountDelivery,
    //     requestResponse, expiredResponse, sign, storeSign, approver, style, status, date, receivedDate, datahubContactID,
    //     name, description, note, fieldID, value, completeStatus, otherID
    // })
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(documentID, packageID, publishID, userID)) {
          return resolve({
            error: true,
            message: 'Request params departmentID|packageID|publishID invalid',
            keyError: 'params_invalid',
            status: 400,
          })
        }

        // if (direction && !checkNumberIsValidWithRange({ arrValid: DOC_DIRECTION_TYPE, val: direction })) {
        //     return resolve({
        //         error: true,
        //         message: 'Request params direction invalid',
        //         keyError: 'params_direction_invalid',
        //         status: 400
        //     });
        // }

        // if (requestResponse && !checkNumberIsValidWithRange({ arrValid: [0,1], val: requestResponse })) {
        //     return resolve({
        //         error: true,
        //         message: 'Request params requestResponse invalid',
        //         keyError: 'paramas_requestResponse_invalid',
        //         status: 400
        //     });
        // }

        let dataUpdate = {
          userUpdate: userID,
          modifyAt: Date.now(),
        }

        if (name) {
          dataUpdate.name = name
        }

        if (sign) {
          dataUpdate.sign = sign
        }

        if (storeSign) {
          dataUpdate.storeSign = storeSign
        }

        if (approver) {
          dataUpdate.approver = approver
        }

        if (date) {
          dataUpdate.date = date
        }

        if (receivedDate) {
          dataUpdate.receivedDate = receivedDate
        }

        if (style) {
          dataUpdate.style = style
        }

        if (status) {
          dataUpdate.status = status
        }

        if (expiredResponse) {
          dataUpdate.expiredResponse = expiredResponse
        }

        if (contractID) {
          dataUpdate.contract = contractID
        }

        if (note) {
          dataUpdate.note = note
        }

        if (description) {
          dataUpdate.description = description
        }

        if (deadline) {
          dataUpdate.deadline = deadline
        }

        if (!isNaN(value)) {
          dataUpdate.value = value
        }

        if (!isNaN(completeStatus)) {
          dataUpdate.completeStatus = completeStatus
        }

        /**
         * Convert to query
         */
        let convertStr = ''
        if (name && name != '') {
          convertStr = stringUtils.removeAccents(name)
        }
        if (sign && sign != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(sign)
        }
        if (storeSign && storeSign != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(storeSign)
        }
        if (description && description != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(description)
        }
        if (note && note != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(note)
        }
        if (approver && approver != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(approver)
        }
        dataUpdate.namecv = convertStr

        direction && (dataUpdate.direction = +direction || 1)
        requestResponse && (dataUpdate.requestResponse = +requestResponse || 0)
        amount && (dataUpdate.amount = +amount || 1)
        amountDelivery && (dataUpdate.amountDelivery = +amountDelivery || 0)

        if (type && !isNaN(type)) {
          dataUpdate.type = +type
        }

        packageID &&
          checkObjectIDs(packageID) &&
          (dataUpdate.package = packageID)
        senderID && checkObjectIDs(senderID) && (dataUpdate.sender = senderID)
        receiverID &&
          checkObjectIDs(receiverID) &&
          (dataUpdate.receiver = receiverID)
        fieldID && checkObjectIDs(fieldID) && (dataUpdate.field = fieldID)
        datahubContactID &&
          checkObjectIDs(datahubContactID) &&
          (dataUpdate.datahubContact = datahubContactID)
        otherID && checkObjectIDs(otherID) && (dataUpdate.other = otherID)
        propertyID &&
          checkObjectIDs(propertyID) &&
          (dataUpdate.property = propertyID)
        storageID &&
          checkObjectIDs(storageID) &&
          (dataUpdate.storage = storageID)
        publishID &&
          checkObjectIDs(publishID) &&
          (dataUpdate.publish = publishID)

        let infoAfterUpdate = await this.updateWhereClause(
          { _id: documentID },
          dataUpdate
        )

        if (!infoAfterUpdate) {
          return resolve({
            error: true,
            message: "Can't update document",
            keyError: 'update_document_failed',
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
          keyError: 'server_error',
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Chia sẻ văn bản
   * Date: 05/11/2021
   */
  updateShareDocument({ authorID, documentID, usersID, isShare }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([authorID]))
          return resolve({
            error: true,
            message: 'Request params authorID invalid',
            status: 400,
          })

        if (!checkObjectIDs([documentID]))
          return resolve({
            error: true,
            message: 'Request params documentID invalid',
            status: 400,
          })

        if (!usersID || !usersID.length || !checkObjectIDs(usersID))
          return resolve({
            error: true,
            message: 'Request params usersID invalid',
            status: 400,
          })

        let checkPermission = await DOCUMENT__USER_COLL.findOne({
          document: documentID,
          user: authorID,
          permission: 1,
        }).lean()

        if (!checkPermission)
          return resolve({
            error: true,
            message: 'Permission denined',
            status: 403,
          })

        let infoAfterShare = null

        if (isShare) {
          let listUserShared = usersID.map((user) => ({
            document: documentID,
            user,
            permission: 2,
            createAt: timeUtils.getCurrentTime(),
            modifyAt: timeUtils.getCurrentTime(),
          }))

          infoAfterShare = await DOCUMENT__USER_COLL.insertMany(listUserShared)
        } else {
          let listUserRemoveShare = usersID.map((user) => ({
            document: documentID,
            user,
          }))

          infoAfterShare =
            await DOCUMENT__USER_COLL.deleteMany(listUserRemoveShare)
        }

        return resolve({
          error: false,
          status: 200,
          data: infoAfterShare,
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
   * Func: Cập nhật quyền người được chia sẻ văn bản
   * Date: 05/11/2021
   */
  updatePermissionShare({ authorID, documentID, userID, permission }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([authorID]))
          return resolve({
            error: true,
            message: 'Request params authorID invalid',
            status: 400,
          })

        if (!checkObjectIDs([documentID]))
          return resolve({
            error: true,
            message: 'Request params documentID invalid',
            status: 400,
          })

        if (!checkObjectIDs([userID]))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            status: 400,
          })

        if (![2, 3].includes(permission))
          return resolve({
            error: true,
            message: 'Request params permission invalid',
            status: 400,
          })

        let checkPermission = await DOCUMENT__USER_COLL.findOne({
          document: documentID,
          user: authorID,
          permission: 1,
        }).lean()

        if (!checkPermission)
          return resolve({
            error: true,
            message: 'Permission denined',
            status: 403,
          })

        let infoUserShared = await DOCUMENT__USER_COLL.findOne({
          document: documentID,
          user: userID,
        }).lean()

        if (!infoUserShared)
          return resolve({
            error: true,
            message: 'User has not yet shared the document',
            status: 400,
          })

        let infoAfterUpdate = await DOCUMENT__USER_COLL.findByIdAndUpdate(
          infoUserShared._id,
          {
            $set: {
              permission,
            },
          },
          { new: true }
        )

        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Update permission failed',
            status: 422,
          })

        return resolve({
          error: false,
          status: 200,
          data: infoAfterUpdate,
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
   * Func: Đánh dấu hồ sơ
   * Date: 30/12/2021
   */
  updateMarkDocument({ userID, documentID, isMark }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(documentID)) {
          return resolve({
            error: true,
            message: 'Request params documentID invalid',
            keyError: 'params_documentID_invalid',
            status: 400,
          })
        }

        let infoAfterUpdate = null

        if (isMark) {
          infoAfterUpdate = await DOCUMENT__DOC_COLL.findByIdAndUpdate(
            documentID,
            {
              $addToSet: {
                usersMarked: userID,
              },
            },
            { new: true }
          )
        } else {
          infoAfterUpdate = await DOCUMENT__DOC_COLL.findByIdAndUpdate(
            documentID,
            {
              $pull: {
                usersMarked: userID,
              },
            },
            { new: true }
          )
        }

        if (!infoAfterUpdate) {
          return resolve({
            error: true,
            message: "Can't highlight document",
            keyError: 'highlight_document_failed',
            status: 422,
          })
        }

        return resolve({
          error: false,
          status: 200,
          data: infoAfterUpdate,
        })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          keyError: 'server_error',
          status: 500,
        })
      }
    })
  }

  /**
   * Name: get văn bản
   * Author: Depv
   * Code:
   */
  getInfo({ documentID, select, populates }) {
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
        if (!checkObjectIDs(documentID))
          return resolve({
            error: true,
            message: 'Request params documentID invalid',
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
        let infoAterGet = await DOCUMENT__DOC_COLL.findById(documentID)
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
   * Name  : Danh sách văn bản + Tìm kiếm văn bản
   * Author: Depv
   * Update: HiepNH
   * Code  : 25/8/2022
   */
  getList({
    parentID,
    companyID,
    packageID,
    direction,
    senderID,
    receiverID,
    propertyID,
    type,
    contractID,
    storageID,
    publishID,
    isExportExcel = false,
    requestResponse,
    fieldID,
    fromDate,
    toDate,
    marked,
    userID,
    departmentID,
    receivedDate = {},
    keyword,
    limit = 20,
    lastestID,
    select,
    populates = {},
    isParent,
  }) {
    // console.log('========getListDocument========================>>>>>>>>>>>>')
    // console.log({parentID, companyID, packageID, direction, senderID, receiverID, propertyID, type, contractID, storageID, publishID, isExportExcel,
    //     requestResponse, fieldID, fromDate, toDate, marked, userID, departmentID, receivedDate, keyword, limit, isParent })
    return new Promise(async (resolve) => {
      try {
        let conditionObj = {}
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

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

        // Chỉ lấy các mẩu tin cha
        if (isParent) {
          conditionObj.parent = { $exists: false }
        }

        // Mẩu tin đã quan tâm
        if (marked) {
          conditionObj.usersMarked = { $in: [userID] }
        }

        if (companyID) {
          conditionObj.company = companyID
        }

        if (type) {
          conditionObj.type = type
        }

        // Ngày nhận văn bản
        if (receivedDate && typeof receivedDate === 'string') {
          if (!IsJsonString(receivedDate))
            return resolve({
              error: true,
              message: 'Request params receivedDate invalid',
              status: 400,
            })

          receivedDate = JSON.parse(receivedDate)
        }

        if (receivedDate) {
          let fromDate = receivedDate.from
          let toDate = receivedDate.to
          // Lấy những văn bản từ ngày đến ngày
          if (fromDate && toDate) {
            conditionObj.receivedDate = {
              $gte: new Date(fromDate),
              $lte: moment(new Date(toDate)).endOf('day')._d,
            }
          }
        }

        if (fromDate && toDate) {
          conditionObj.date = {
            $gte: new Date(fromDate),
            $lt: moment(toDate, 'YYYY-MM-DD').endOf('day')._d,
          }
        }

        if (direction) {
          conditionObj.direction = direction
        }

        if (checkObjectIDs(senderID)) {
          conditionObj.sender = senderID
        }

        if (checkObjectIDs(receiverID)) {
          conditionObj.receiver = receiverID
        }

        if (checkObjectIDs(propertyID)) {
          conditionObj.property = propertyID
        }

        if (checkObjectIDs(contractID)) {
          conditionObj.contract = contractID
        }

        if (checkObjectIDs(storageID)) {
          conditionObj.storage = storageID
        }

        if (requestResponse) {
          conditionObj.requestResponse = requestResponse
        }

        if (checkObjectIDs(fieldID)) {
          conditionObj.field = fieldID
        }

        if (checkObjectIDs(parentID)) {
          conditionObj.parent = parentID
        }

        if (checkObjectIDs(departmentID)) {
          // conditionObj.project = departmentID

          let listPackageAccess = await DOCUMENT__PACKAGE_COLL.find({
            project: departmentID,
            members: { $in: [userID] },
          })?.select('_id')
          if (listPackageAccess.length) {
            conditionObj.package = {
              $in: listPackageAccess.map((item) => item._id),
            }
          } else {
            return resolve({
              error: true,
              message: 'Bạn chưa nằm trong gói thầu nào',
              keyError: 'user_not_members_in_package',
            })
          }
        } else {
          if (!packageID && !parentID) {
            let listPackageAccess = await DOCUMENT__PACKAGE_COLL.find({
              members: { $in: [userID] },
            })?.select('_id')
            if (listPackageAccess.length) {
              conditionObj.package = {
                $in: listPackageAccess.map((item) => item._id),
              }
            } else {
              return resolve({
                error: true,
                message: 'Bạn chưa nằm trong gói thầu nào',
                keyError: 'user_not_members_in_package',
              })
            }
          }
        }

        if (checkObjectIDs(packageID)) {
          conditionObj.package = packageID
        }

        if (publishID) {
          conditionObj.publish = publishID
          delete conditionObj.parent
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          const regSearch = new RegExp(keyword, 'i')

          conditionObj.$or = [{ name: regSearch }, { sign: regSearch }]
        }

        /**
         * Purpose: Sử dụng trong export excel document (hoặc theo bộ lọc)
         * Function: exportDocument (model)
         */
        if (isExportExcel) {
          return resolve({ data: conditionObj, error: false })
        }

        // console.log(conditionObj)

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await DOCUMENT__DOC_COLL.findById(lastestID)
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

        let infoDataAfterGet = await DOCUMENT__DOC_COLL.find(conditionObj)
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
        let totalRecord = await DOCUMENT__DOC_COLL.count(conditionObjOrg)
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
   * Name  : Tìm kiếm văn bản
   * Author: HiepNH
   * Code  : 29/8/2022
   */
  getListByFilter({
    parentID,
    companyID,
    packagesID,
    directions,
    sendersID,
    receiverID,
    propertysID,
    types,
    contractsID,
    storagesID,
    publishsID,
    isExportExcel = false,
    requestResponse,
    fieldsID,
    fromDate,
    toDate,
    marked,
    userID,
    departmentsID,
    keyword,
    limit = 20,
    lastestID,
    select,
    populates = {},
    isParent,
  }) {
    //     console.log('=============getListByFilter=============>>>>>>>>>>>>>>')
    //     console.log({
    //         parentID, companyID, packagesID, directions, sendersID, receiverID, propertysID, types, contractsID, storagesID, publishsID, isExportExcel,
    // requestResponse, fieldsID, fromDate, toDate, marked, userID, departmentsID,
    // keyword, limit, lastestID, select, populates, isParent })
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        const validation = validateParamsObjectID({
          packagesID: { value: packagesID, isRequire: false },
          sendersID: { value: sendersID, isRequire: false },
          propertysID: { value: propertysID, isRequire: false },
          fieldsID: { value: fieldsID, isRequire: false },
          contractsID: { value: contractsID, isRequire: false },
          publishsID: { value: publishsID, isRequire: false },
          departmentsID: { value: departmentsID, isRequire: false },
          storagesID: { value: storagesID, isRequire: false },
        })
        if (validation.error) return resolve(validation)

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

        let conditionObj = {}
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

        // Chỉ lấy các mẩu tin cha
        if (isParent) {
          conditionObj.parent = { $exists: false }
        }

        /**
         * User phải nằm trong member của gói thầu
         */
        if (checkObjectIDs(departmentsID)) {
          let listPackageAccess = await DOCUMENT__PACKAGE_COLL.find({
            project: { $in: departmentsID },
            members: { $in: [userID] },
          })?.select('_id')
          if (listPackageAccess.length) {
            conditionObj.package = {
              $in: listPackageAccess.map((item) => item._id),
            }
          } else {
            return resolve({
              error: true,
              message: 'Bạn chưa nằm trong gói thầu nào',
              keyError: 'user_not_members_in_package',
            })
          }
        } else {
          let listPackageAccess = await DOCUMENT__PACKAGE_COLL.find({
            members: { $in: [userID] },
          })?.select('_id')
          if (listPackageAccess.length) {
            conditionObj.package = {
              $in: listPackageAccess.map((item) => item._id),
            }
          } else {
            return resolve({
              error: true,
              message: 'Bạn chưa nằm trong gói thầu nào',
              keyError: 'user_not_members_in_package',
            })
          }
        }

        /**
         * Bộ lọc với nhiều lựa chọn
         */
        directions &&
          directions.length &&
          (conditionObj.direction = { $in: directions })
        types && types.length && (conditionObj.type = { $in: types })
        propertysID &&
          propertysID.length &&
          (conditionObj.property = { $in: propertysID })
        fieldsID && fieldsID.length && (conditionObj.field = { $in: fieldsID })
        packagesID &&
          packagesID.length &&
          (conditionObj.package = { $in: packagesID })
        sendersID &&
          sendersID.length &&
          (conditionObj.sender = { $in: sendersID })
        contractsID &&
          contractsID.length &&
          (conditionObj.contract = { $in: contractsID })
        publishsID &&
          publishsID.length &&
          (conditionObj.publish = { $in: publishsID })
        departmentsID &&
          departmentsID.length &&
          (conditionObj.project = { $in: departmentsID })
        storagesID &&
          storagesID.length &&
          (conditionObj.storage = { $in: storagesID })

        // Ngày nhận văn bản
        if (fromDate && toDate) {
          conditionObj.receivedDate = {
            $gte: new Date(fromDate),
            $lt: moment(toDate, 'YYYY-MM-DD').endOf('day')._d,
          }
        }

        if (companyID) {
          conditionObj.company = companyID
        }

        if (checkObjectIDs(receiverID)) {
          conditionObj.receiver = receiverID
        }

        if (requestResponse) {
          conditionObj.requestResponse = requestResponse
        }

        if (checkObjectIDs(parentID)) {
          conditionObj.parent = parentID
        }

        if (marked) {
          conditionObj.usersMarked = { $in: [userID] }
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          const regSearch = new RegExp(keyword, 'i')

          conditionObj.$or = [
            { name: regSearch },
            { sign: regSearch },
            { storeSign: regSearch },
          ]
        }

        /**
         * Purpose: Sử dụng trong export excel document (hoặc theo bộ lọc)
         * Function: exportDocument (model)
         */
        if (isExportExcel) {
          return resolve({ data: conditionObj, error: false })
        }

        // console.log(conditionObj)

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await DOCUMENT__DOC_COLL.findById(lastestID)
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

        let infoDataAfterGet = await DOCUMENT__DOC_COLL.find(conditionObj)
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
        let totalRecord = await DOCUMENT__DOC_COLL.count(conditionObjOrg)
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
   * Dev: MinhVH
   * Func: Thống kê số lượng văn bản theo type
   * Date: 27/10/2021
   */
  statisticalByType({ userID, companyID, departmentID, packageID }) {
    // console.log('===========Thống kê hồ sơ===========')
    // console.log({ userID, companyID, departmentID, packageID })
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([userID])) {
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            keyError: 'params_userID_invalid',
            status: 400,
          })
        }

        if (departmentID && !checkObjectIDs([departmentID])) {
          return resolve({
            error: true,
            message: 'Request params departmentID invalid',
            keyError: 'params_departmentID_invalid',
            status: 400,
          })
        }

        if (packageID && !checkObjectIDs([packageID])) {
          return resolve({
            error: true,
            message: 'Request params packageID invalid',
            keyError: 'params_packageID_invalid',
            status: 400,
          })
        }

        let conditionObj = {}
        let listDoctype = []
        // companyID       && (conditionObj.company = ObjectID(companyID));
        departmentID && (conditionObj.project = ObjectID(departmentID))

        // User phải nằm trong members của gói thầu.
        // let listPackageAccess = await DOCUMENT__PACKAGE_COLL.find({ members: { $in: [userID]} }).select("_id");
        // if(listPackageAccess.length){
        //     conditionObj.package = { $in: listPackageAccess.map(item => item._id )}
        // }
        packageID && (conditionObj.package = ObjectID(packageID))
        let listDoctypeGroupByType = await DOCUMENT__DOC_COLL.aggregate([
          {
            $match: conditionObj,
          },
          {
            $group: {
              _id: '$type',
              totalDocument: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])

        let listDoctypeGroupByWeek = await DOCUMENT__DOC_COLL.aggregate([
          {
            $match: {
              ...conditionObj,
              createAt: {
                $gte: ISOdate(moment().startOf('month').format()),
                $lte: ISOdate(moment().endOf('month').format()),
              },
            },
          },
          {
            $group: {
              _id: '$type',
              totalDocument: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])

        if (listDoctypeGroupByType.length) {
          listDoctypeGroupByType.map((doctype) => {
            const doctypeHaveNewDocumentInWeek = listDoctypeGroupByWeek.find(
              (newDoc) => newDoc._id === doctype._id
            )
            listDoctype[listDoctype.length] = {
              type: doctype._id,
              totalDocument: doctype.totalDocument,
              totalDocumentNew: doctypeHaveNewDocumentInWeek
                ? doctypeHaveNewDocumentInWeek.totalDocument
                : 0,
            }
          })
        }

        if (!listDoctype) {
          return resolve({
            error: true,
            message: "Can't get list doctype",
            keyError: 'get_list_doctype_failed',
            status: 403,
          })
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listDoctype,
          },
        })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          keyError: 'server_error',
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Thống kê số lượng văn bản theo datahubContact
   * Date: 27/10/2021
   */
  statisticalByDatahubContact({ userID, companyID, departmentID, packageID }) {
    // console.log('===========Thống kê hồ sơ===========')
    // console.log({ userID, companyID, departmentID, packageID })
    return new Promise(async (resolve) => {
      try {
        if (departmentID && !checkObjectIDs([departmentID])) {
          return resolve({
            error: true,
            message: 'Request params departmentID invalid',
            keyError: 'params_departmentID_invalid',
            status: 400,
          })
        }

        if (packageID && !checkObjectIDs([packageID])) {
          return resolve({
            error: true,
            message: 'Request params packageID invalid',
            keyError: 'params_packageID_invalid',
            status: 400,
          })
        }

        let conditionObj = {}
        let listDoctype = []
        departmentID && (conditionObj.project = ObjectID(departmentID))
        // Nếu không có dự án thì lấy theo công ty
        if (!departmentID) {
          companyID && (conditionObj.company = ObjectID(companyID))
        }

        // User phải nằm trong members của gói thầu.
        // let listPackageAccess = await DOCUMENT__PACKAGE_COLL.find({ members: { $in: [userID]} }).select("_id");
        // if(listPackageAccess.length){
        //     conditionObj.package = { $in: listPackageAccess.map(item => item._id )}
        // }
        packageID && (conditionObj.package = ObjectID(packageID))
        conditionObj.publish = { $exists: true }
        let listDoctypeGroupByType = await DOCUMENT__DOC_COLL.aggregate([
          {
            $match: conditionObj,
          },
          {
            $group: {
              _id: '$publish',
              totalDocument: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])

        let listDoctypeGroupByWeek = await DOCUMENT__DOC_COLL.aggregate([
          {
            $match: {
              ...conditionObj,
              createAt: {
                $gte: ISOdate(moment().startOf('month').format()),
                $lte: ISOdate(moment().endOf('month').format()),
              },
            },
          },
          {
            $group: {
              _id: '$publish',
              totalDocument: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])

        if (listDoctypeGroupByType.length) {
          listDoctypeGroupByType.map((doctype) => {
            const doctypeHaveNewDocumentInWeek = listDoctypeGroupByWeek.find(
              (newDoc) => newDoc._id.toString() == doctype._id.toString()
            )
            listDoctype[listDoctype.length] = {
              publish: doctype._id,
              totalDocument: doctype.totalDocument,
              totalDocumentNew: doctypeHaveNewDocumentInWeek
                ? doctypeHaveNewDocumentInWeek.totalDocument
                : 0,
            }
          })
        }

        await DOCUMENT__DOC_COLL.populate(listDoctype, {
          path: 'publish',
          select: 'name',
          model: 'company',
        })

        if (!listDoctype) {
          return resolve({
            error: true,
            message: "Can't get list doctype",
            keyError: 'get_list_doctype_failed',
            status: 403,
          })
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listDoctype,
          },
        })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          keyError: 'server_error',
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Danh sách user được truy cập hồ sơ
   * Date: 10/11/2021
   */
  getListUserShared({
    userID,
    documentID,
    lastestID,
    limit = 10,
    filter = {},
    select = {},
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([userID]))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            status: 400,
          })

        if (!checkObjectIDs([documentID]))
          return resolve({
            error: true,
            message: 'Request params documentID invalid',
            status: 400,
          })

        if (isNaN(limit)) {
          limit = 10
        } else {
          limit = +limit
        }

        if (filter && typeof filter === 'string') {
          if (!IsJsonString(filter))
            return resolve({
              error: true,
              message: 'Request params filter invalid',
              status: 400,
            })

          filter = JSON.parse(filter)
        }

        if (select && typeof select === 'string') {
          if (!IsJsonString(select))
            return resolve({
              error: true,
              message: 'Request params select invalid',
              status: 400,
            })

          select = JSON.parse(select)
        }

        let conditionObj = { document: documentID }
        let sortBy
        let keys = ['modifyAt__-1', '_id__-1']

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await DOCUMENT__DOC_COLL.findById(lastestID)
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

        let listUserShared = await DOCUMENT__USER_COLL.find(conditionObj)
          .populate('document', select.document)
          .populate('user', select.user)
          .limit(limit + 1)
          .sort(sortBy)
          .lean()

        if (!listUserShared)
          return resolve({
            error: true,
            message: "Can't get list user shared",
            status: 400,
          })

        // GET TOTAL RECORD
        let totalRecord = await DOCUMENT__USER_COLL.count(conditionObjOrg)
        let nextCursor = null

        if (listUserShared && listUserShared.length) {
          if (listUserShared.length > limit) {
            nextCursor = listUserShared[limit - 1]._id
            listUserShared.length = limit
          }
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listUserShared,
            limit: +limit,
            totalRecord,
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
   * Name: Lấy số lượng công việc của tất cả project mà user là members
   * Author: Depv
   */
  getAmountDocumentByProjects({ userID, fromDate, toDate, ctx }) {
    return new Promise(async (resolve) => {
      try {
        // Call service list project
        let listProject = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST_IS_MEMBERS}`,
          {
            unLimit: true,
            select: 'sign name',
          }
        )
        listProject = listProject?.data || []

        let listProjectID = listProject.map((project) => ObjectID(project._id))
        let conditionObj = { project: { $in: listProjectID } }

        if (fromDate && toDate) {
          conditionObj.createAt = {
            $gte: new Date(fromDate),
            $lt: moment(toDate, 'YYYY-MM-DD').endOf('day')._d,
          }
        }

        // Số lượng công việc trong mỗi dự án
        let listAmountDocument = await DOCUMENT__DOC_COLL.aggregate([
          { $match: conditionObj },
          {
            $group: {
              _id: '$project',
              amount: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
        ])

        return resolve({
          error: false,
          data: { listProject, listAmountDocument },
        })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Báo cáo linh hoạt
   * Author: HiepNH
   * Date: 29/10/2022
   */
  getDynamicReport({
    userID,
    option,
    companyID,
    projectID,
    reportType,
    status,
    subtypes,
    fromDate,
    toDate,
    upcoming,
    isMilestone,
    year,
  }) {
    // console.log({ userID, option, reportType, status, subtypes, fromDate, toDate, upcoming })
    return new Promise(async (resolve) => {
      try {
        let conditionObj = {},
          conditionProject = {},
          conditionMatch = {},
          objectGroup = {}

        // Tổng hợp số lượng và phân loại theo tháng, năm của dự án
        if (!option) {
          if (projectID && checkObjectIDs(projectID)) {
            conditionObj.project = ObjectID(projectID)
          } else {
            conditionObj.company = ObjectID(companyID)
          }

          conditionProject = {
            year: { $year: '$date' },
            month: { $month: '$date' },
            date: 1,
            project: 1,
          }

          if (isMilestone && isMilestone == 1) {
            conditionObj.milestone = { $gt: 0 }
          }

          if (year) {
            conditionMatch.year = Number(year)
          }

          objectGroup = { month: '$month', year: '$year' }
          // sortBy = { "_id.year": 1 }

          // console.log(conditionObj)

          let listData = await DOCUMENT__DOC_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: conditionProject,
            },
            {
              $match: conditionMatch,
            },
            {
              $group: {
                _id: objectGroup,
                amount: { $sum: 1 },
              },
            },
            // { $sort: sortBy},
          ])

          return resolve({ error: false, data: listData })
        }
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
  downloadTemplateExcel({ projectID, userID }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(projectID) || !checkObjectIDs(userID)) {
          return resolve({
            error: true,
            message: 'Request params projectID|userID invalid',
            keyError: 'params_invalid',
          })
        }

        let infoProject = await DEPARTMENT_COLL.findById(projectID)
        if (!infoProject)
          return resolve({
            error: true,
            message: 'Can not get project Info',
            keyError: 'params_invalid',
          })

        // Gói thầu
        let listData1 = await DOCUMENT__PACKAGE_COLL.find({
          project: projectID,
          members: { $in: [userID] },
        })

        // Đơn vị ban hành
        let listData2 = await COMPANY_COLL.find({})

        // Địa chỉ lưu trữ
        let listData3 = await STORAGE_COLL.find({
          company: infoProject.company,
        })

        // Phân loại văn bản
        let listData4 = await DOCTYPE_COLL.find({
          company: infoProject.company,
          type: 2,
        })

        // Modify the workbook.
        XlsxPopulate.fromFileAsync(
          path.resolve(
            __dirname,
            '../../../files/templates/excels/document_1_ImportDocument.xlsm'
          )
        ).then(async (workbook) => {
          DOCUMENT_TYPES, DIRECTION_TYPES
          var i = 2
          DIRECTION_TYPES.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(1).value(item.value)
            workbook.sheet('DanhMuc').row(i).cell(2).value(item.text)
            i++
          })

          var i = 2
          listData1?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(4).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(5).value(item.name)
            i++
          })

          var i = 2
          listData2?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(7).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(8).value(item.name)
            i++
          })

          var i = 2
          DOCUMENT_TYPES.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(10).value(item.value)
            workbook.sheet('DanhMuc').row(i).cell(11).value(item.text)
            i++
          })

          var i = 2
          listData3?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(13).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(14).value(item.name)
            i++
          })

          var i = 2
          listData4?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(16).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(17).value(item.name)
            i++
          })

          const now = new Date()
          const filePath = '../../../files/temporary_uploads/'
          const fileName = `Template_import_document_${now.getTime()}.xlsm`
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
   * Func: Download Template Excel
   * Date: 16/12/2022
   */
  importFromExcel({ projectID, documentID, dataImport, userID, ctx }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * BA
         * 1-Tìm cách Import tối đa 4 cấp (hiện giờ mới được 2 cấp)
         * 2-Import được từ ngoài dự án, và Import được vào trong 1 hồ sơ chi tiết
         * 3-Import tối đa 1000 mẩu tin
         */
        let departmentID
        if (documentID && checkObjectIDs(documentID)) {
          let infoDoc = await DOCUMENT__DOC_COLL.findById(documentID)
          if (infoDoc) {
            departmentID = `${infoDoc.project}`
          }
        } else {
          departmentID = `${projectID}`
        }
        // console.log({ departmentID, documentID })

        const dataImportJSON = JSON.parse(dataImport)
        let index = 0
        let errorNumber = 0
        let parentID

        for (const data of dataImportJSON) {
          if (index > 0 && index <= 1000) {
            let dataInsert = {
              departmentID,
              userID,
              name: data?.__EMPTY,
              sign: data?.__EMPTY_4,
              storeSign: data?.__EMPTY_5,
              description: data?.__EMPTY_6,
              approver: data?.__EMPTY_7,
              date: data?.__EMPTY_28,
              receivedDate: data?.__EMPTY_29,
              style: data?.__EMPTY_10,
              status: data?.__EMPTY_11,
              amount: data?.__EMPTY_12,
              amountDelivery: data?.__EMPTY_13,
              note: data?.__EMPTY_14,
              deadline: data?.__EMPTY_36,
              completeStatus: data?.__EMPTY_22,
              direction: data?.__EMPTY_30,
              packageID: data?.__EMPTY_31,
              publishID: data?.__EMPTY_32,
              type: data?.__EMPTY_33,
              storageID: data?.__EMPTY_34,
              propertyID: data?.__EMPTY_35,
              ctx,
            }

            if (documentID && checkObjectIDs(documentID)) {
              dataInsert.parentID = documentID
            }

            /**
             *  Kiểm tra nếu có hồ sơ con
             */
            if (data.__EMPTY_1 && data.__EMPTY_1 != '' && parentID) {
              dataInsert.parentID = parentID
              dataInsert.name = data.__EMPTY_1
            }

            let infoAfterInsert = await this.insert(dataInsert)
            if (data?.__EMPTY) {
              parentID = infoAfterInsert?.data?._id
            }

            if (infoAfterInsert.error) {
              errorNumber++
            }
          }

          index++
        }
        if (errorNumber != 0)
          return resolve({ error: true, message: 'import field' })

        return resolve({ error: false, message: 'import success' })
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
   * Func: Download Excel Document Project
   * Date: 27/06/2022
   */
  exportDocument({ userID, filterParams = {} }) {
    return new Promise(async (resolve) => {
      try {
        const validation = validateParamsObjectID({ userID })
        if (validation.error) return resolve(validation)
        let conditionObj = {}
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

        const { data, error } = await this.getListByFilter({
          ...filterParams,
          userID,
          isExportExcel: true,
        })

        if (!error) {
          conditionObj = { ...data }
        }

        let dataPagingAndSort = await RANGE_BASE_PAGINATION_V2({
          keys,
          latestRecord: null,
          objectQuery: conditionObj,
        })
        sortBy = dataPagingAndSort.data.sort

        const listDocument = await DOCUMENT__DOC_COLL.find(conditionObj)
          .populate({
            path: 'author package sender receiver datahubContact publish field property storage',
            select: '_id bizfullname name',
          })
          .sort(sortBy)
          .lean()

        if (!listDocument) {
          return resolve({
            error: true,
            message: 'Không tìm thấy hồ sơ văn bản',
            keyError: 'documents_not_exists',
            status: 400,
          })
        }

        XlsxPopulate.fromFileAsync(
          path.resolve(
            __dirname,
            '../../../files/templates/excels/document_2_ListDocument.xlsm'
          )
        ).then(async (workbook) => {
          let indexExcel = 3
          const DATE_FORMAT = 'DD/MM/YYYY'

          listDocument.map((document, index) => {
            const {
              name,
              sign,
              storeSign,
              date,
              receivedDate,
              style,
              author,
              amountDelivery,
              status,
              amount,
              modifyAt,
              note,
              direction,
              sender,
              receiver,
              datahubContact,
              publish,
              field,
              property,
              type,
              storage,
              package: packageInfo,
            } = document

            const currRow = workbook.sheet('Data').row(indexExcel)

            currRow.cell(1).value(index + 1)

            // Người tạo văn bản
            currRow.cell(2).value(author?.bizfullname)

            // Ngày chỉnh sửa
            if (modifyAt) {
              currRow.cell(3).value(moment(modifyAt).format(DATE_FORMAT))
            }

            // Tiêu đề hồ sơ
            name && currRow.cell(4).value(name)

            // Mã hiệu
            sign && currRow.cell(5).value(sign)

            // Mã hiệu hồ sơ lưu
            storeSign && currRow.cell(6).value(storeSign)

            // Ngày văn bản
            if (date) {
              currRow.cell(7).value(moment(date).format(DATE_FORMAT))
            }

            // Ngày nhận thực tế
            if (receivedDate) {
              currRow.cell(8).value(moment(receivedDate).format(DATE_FORMAT))
            }

            // Định dạng văn bản (nhận dạng)
            style && currRow.cell(9).value(style)

            // Tình trạng
            status && currRow.cell(10).value(status)

            // SL nhận
            amount && currRow.cell(11).value(amount)

            // SL giao
            amountDelivery && currRow.cell(12).value(amountDelivery)

            // Ghi chú
            note && currRow.cell(13).value(note)

            // Hướng hồ sơ
            switch (direction) {
              case 1:
                currRow.cell(14).value('Đến')
                break
              case 2:
                currRow.cell(14).value('Đi')
                break
              case 3:
                currRow.cell(14).value('Nội bộ')
                break
              default:
                break
            }

            // Gói thầu
            if (packageInfo) {
              currRow.cell(15).value(packageInfo.name)
            }

            // Chủ thế ban hành
            if (datahubContact) {
              currRow.cell(16).value(datahubContact.name)
            }

            // Chủ thể nhận
            if (receiver) {
              currRow.cell(17).value(receiver.name)
            }

            // Cơ quan tổ chức
            if (publish) {
              currRow.cell(18).value(publish.name)
            }

            // Lĩnh vực
            if (field) {
              currRow.cell(19).value(field.name)
            }

            // Tính chất
            if (type) {
              currRow.cell(20).value(DOCUMENT_TYPES[Number(type - 1)].text)
            }

            // Lưu trữ
            if (storage) {
              currRow.cell(21).value(storage.name)
            }

            indexExcel++
          })

          // const rangeUsed = workbook.sheet("Data").usedRange();
          const range = workbook
            .sheet('Data')
            .range(`A3:U${listDocument.length + 2}`)

          range.style({
            fontFamily: 'Times New Roman',
            fontColor: 'black',
            fontSize: 13,
            bold: false,
            // horizontalAlignment: 'center',
            border: true,
            borderColor: 'black',
            wrapText: true,
          })

          const now = new Date()
          const filePath = '../../../files/temporary_uploads/'
          const fileName = `document_2_ListDocument${now.getTime()}.xlsm`
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
   * Func: Download Excel Document Package
   * Date: 15/12/2022
   */
  exportDocumentOfPackage({ userID, filterParams = {} }) {
    // console.log('==============ĐANG TẢI HỒ SƠ=======================')
    return new Promise(async (resolve) => {
      try {
        const validation = validateParamsObjectID({ userID })
        if (validation.error) return resolve(validation)

        /**
         * DANH SÁCH GÓI THẦU CỦA DỰ ÁN (mà user được quyền truy cập)
         */
        let projectID = filterParams.departmentsID[0]
        // console.log({projectID})
        let listPackage = await DOCUMENT__PACKAGE_COLL.find({
          project: projectID,
          members: { $in: [userID] },
        })

        // Tổng số hồ sơ
        let listDocGroupByPackage = await DOCUMENT__DOC_COLL.aggregate([
          {
            $match: {
              // members: { $in: [ObjectID(userID)] },
              project: ObjectID(projectID),
            },
          },
          {
            $group: {
              _id: {
                package: '$package',
                completeStatus: '$completeStatus',
              },
              amount: { $sum: 1 },
            },
          },
          {
            $sort: { amount: -1 },
          },
        ])
        // console.log(listDocGroupByPackage)

        // Số hồ sơ cần hoàn thành tới ngày nay
        let listDocHaveToDone = await DOCUMENT__DOC_COLL.aggregate([
          {
            $match: {
              // members: { $in: [ObjectID(userID)] },
              project: ObjectID(projectID),
              deadline: {
                $exists: true,
                $ne: null,
                $lt: new Date(),
              },
              // completeStatus: 1,
            },
          },
          {
            $group: {
              _id: { package: '$package' },
              amount: { $sum: 1 },
            },
          },
          {
            $sort: { amount: -1 },
          },
        ])

        let conditionObj1 = {
          project: { $in: filterParams.departmentsID },
          level: 1,
        }
        let conditionObj2 = {
          project: { $in: filterParams.departmentsID },
          level: 2,
        }
        let conditionObj3 = {
          project: { $in: filterParams.departmentsID },
          level: 3,
        }
        let conditionObj4 = {
          project: { $in: filterParams.departmentsID },
          level: 4,
        }

        let sortBy
        let keys = ['createAt__1', '_id__1']

        let dataPagingAndSort = await RANGE_BASE_PAGINATION_V2({
          keys,
          latestRecord: null,
          objectQuery: conditionObj3,
        })
        sortBy = dataPagingAndSort.data.sort

        const listData1 = await DOCUMENT__DOC_COLL.find(conditionObj1)
          .populate({
            path: 'author package publish receiver field storage',
            select: '_id fullname name',
          })
          .sort(sortBy)
          .lean()

        const listData2 = await DOCUMENT__DOC_COLL.find(conditionObj2)
          .populate({
            path: 'author package publish receiver field storage',
            select: '_id fullname name',
          })
          .sort(sortBy)
          .lean()

        const listData3 = await DOCUMENT__DOC_COLL.find(conditionObj3)
          .populate({
            path: 'author package publish receiver field storage',
            select: '_id fullname name',
          })
          .sort(sortBy)
          .lean()

        const listData4 = await DOCUMENT__DOC_COLL.find(conditionObj4)
          .populate({
            path: 'author package publish receiver field storage',
            select: '_id fullname name',
          })
          .sort(sortBy)
          .lean()

        XlsxPopulate.fromFileAsync(
          path.resolve(
            __dirname,
            '../../../files/templates/excels/document_2_ListDocument.xlsm'
          )
        ).then(async (workbook) => {
          /**
           * DANH SÁCH GÓI THẦU
           */
          var i = 3
          listPackage.map((item, index) => {
            let total = 0,
              total1 = 0,
              total2 = 0

            // Tính toán tổng số lượng
            for (const packageItem of listDocGroupByPackage) {
              if (packageItem._id.package.toString() === item._id.toString()) {
                if (
                  packageItem._id.completeStatus &&
                  packageItem._id.completeStatus == 1
                ) {
                  total1 = Number(total1) + Number(packageItem.amount)
                  total = Number(total) + Number(packageItem.amount)
                } else {
                  total = Number(total) + Number(packageItem.amount)
                }
              }
            }

            for (const packageItem of listDocHaveToDone) {
              if (packageItem._id.package.toString() === item._id.toString()) {
                total2 = Number(total2) + Number(packageItem.amount)
              }
            }

            workbook
              .sheet('Report')
              .row(i)
              .cell(1)
              .value(`${index + 1}`)
            workbook.sheet('Report').row(i).cell(2).value(item.name)
            workbook.sheet('Report').row(i).cell(3).value(Number(total))
            workbook.sheet('Report').row(i).cell(4).value(Number(total2))
            workbook.sheet('Report').row(i).cell(5).value(Number(total1))
            workbook
              .sheet('Report')
              .row(i)
              .cell(6)
              .value(Number(total2 - total1))
            // workbook.sheet("Report").row(i).cell(7).value(Number(total2-total1));
            workbook.sheet('Report').row(i).cell(8).value(item.note)

            i++
          })

          let indexExcel = 3
          const DATE_FORMAT = 'DD/MM/YYYY'

          listData1.map((document, index) => {
            const {
              _id,
              name,
              sign,
              storeSign,
              date,
              receivedDate,
              style,
              author,
              amountDelivery,
              status,
              amount,
              modifyAt,
              note,
              direction,
              receiver,
              approver,
              publish,
              field,
              type,
              storage,
              package: packageInfo,
              deadline,
              completeStatus,
              lastFile,
            } = document

            const currRow = workbook.sheet('Data').row(indexExcel)

            currRow.cell(1).value(index + 1)

            // Người tạo văn bản
            currRow.cell(2).value(author?.fullname)

            // Ngày chỉnh sửa
            if (modifyAt) {
              currRow.cell(3).value(moment(modifyAt).format(DATE_FORMAT))
            }

            // Tiêu đề hồ sơ
            name && currRow.cell(4).value(name)

            // Mã hiệu
            sign && currRow.cell(5).value(sign)

            // Mã hiệu hồ sơ lưu
            storeSign && currRow.cell(6).value(storeSign)

            // Ngày văn bản
            if (date) {
              currRow.cell(7).value(moment(date).format(DATE_FORMAT))
            }

            // Ngày nhận thực tế
            if (receivedDate) {
              currRow.cell(8).value(moment(receivedDate).format(DATE_FORMAT))
            }

            // Định dạng văn bản (nhận dạng)
            style && currRow.cell(9).value(style)

            // Tình trạng
            status && currRow.cell(10).value(status)

            // SL nhận
            amount && currRow.cell(11).value(amount)

            // SL giao
            amountDelivery && currRow.cell(12).value(amountDelivery)

            // Ghi chú
            note && currRow.cell(13).value(note)

            // Hướng hồ sơ
            switch (direction) {
              case 1:
                currRow.cell(14).value('Đến')
                break
              case 2:
                currRow.cell(14).value('Đi')
                break
              case 3:
                currRow.cell(14).value('Nội bộ')
                break
              default:
                break
            }

            // Gói thầu
            if (packageInfo) {
              currRow.cell(15).value(packageInfo.name)
            }

            // Người ký
            approver && currRow.cell(16).value(approver)

            // Chủ thể nhận
            if (receiver) {
              currRow.cell(17).value(receiver.name)
            }

            // Cơ quan tổ chức
            if (publish) {
              currRow.cell(18).value(publish.name)
            }

            // Lĩnh vực
            if (field) {
              currRow.cell(19).value(field.name)
            }

            // Tính chất
            if (type) {
              currRow.cell(20).value(DOCUMENT_TYPES[Number(type - 1)].text)
            }

            // Lưu trữ
            if (storage) {
              currRow.cell(21).value(storage.name)
            }

            // Thời hạn hoàn thành
            if (deadline) {
              currRow.cell(22).value(moment(deadline).format(DATE_FORMAT))
            }

            switch (completeStatus) {
              case 0:
                currRow.cell(23).value('Chưa')
                break
              case 1:
                currRow.cell(23).value('Hoàn thành')
                break
              default:
                break
            }

            // Link truy cập hồ sơ
            currRow
              .cell(25)
              .value('Truy cập')
              .hyperlink(`https://app.trixgo.com/document/home/${_id}`)

            /**
             * HỒ SƠ CẤP 2
             */
            indexExcel++
            listData2.map((subitem, subindex) => {
              if (
                subitem.parent &&
                subitem.parent.toString() === _id.toString()
              ) {
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(1)
                  .value(`${index + 1}.${subindex + 1}`)
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(4)
                  .value(subitem.name)
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(5)
                  .value(subitem.sign)
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(6)
                  .value(subitem.storeSign)
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(7)
                  .value(
                    subitem.date ? moment(subitem.date).format(DATE_FORMAT) : ''
                  )
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(8)
                  .value(
                    subitem.receivedDate
                      ? moment(subitem.receivedDate).format(DATE_FORMAT)
                      : ''
                  )
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(9)
                  .value(`${subitem.style}`)
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(10)
                  .value(subitem.status)
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(11)
                  .value(subitem.amount)
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(12)
                  .value(subitem.amountDelivery)
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(13)
                  .value(subitem.note)
                switch (subitem.direction) {
                  case 1:
                    workbook.sheet('Data').row(indexExcel).cell(14).value('Đến')
                    break
                  case 2:
                    workbook.sheet('Data').row(indexExcel).cell(14).value('Đi')
                    break
                  case 3:
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(14)
                      .value('Nội bộ')
                    break
                  default:
                    break
                }
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(15)
                  .value(subitem.package ? subitem.package.name : '')
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(16)
                  .value(subitem.approver ? subitem.approver : '')
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(17)
                  .value(subitem.receiver ? subitem.receiver.name : '')
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(18)
                  .value(subitem.publish ? subitem.publish.name : '')
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(19)
                  .value(subitem.field ? subitem.field.name : '')
                // Tính chất
                if (subitem.type) {
                  workbook
                    .sheet('Data')
                    .row(indexExcel)
                    .cell(20)
                    .value(DOCUMENT_TYPES[Number(subitem.type - 1)].text)
                }
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(21)
                  .value(subitem.storage ? subitem.storage.name : '')

                if (subitem.deadline) {
                  workbook
                    .sheet('Data')
                    .row(indexExcel)
                    .cell(22)
                    .value(moment(subitem.deadline).format(DATE_FORMAT))
                }
                switch (subitem.completeStatus) {
                  case 0:
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(23)
                      .value('Chưa')
                    break
                  case 1:
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(23)
                      .value('Hoàn thành')
                    break
                  default:
                    break
                }
                workbook
                  .sheet('Data')
                  .row(indexExcel)
                  .cell(25)
                  .value('Truy cập')
                  .hyperlink(
                    `https://app.trixgo.com/document/home/${subitem._id}`
                  )

                indexExcel++

                /**
                 * HỒ SƠ CẤP 3
                 */
                listData3.map((subitem2, subindex2) => {
                  if (
                    subitem2.parent &&
                    subitem2.parent.toString() === subitem._id.toString()
                  ) {
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(1)
                      .value(`${index + 1}.${subindex + 1}.${subindex2 + 1}`)
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(4)
                      .value(subitem2.name)
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(5)
                      .value(subitem2.sign)
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(6)
                      .value(subitem2.storeSign)
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(7)
                      .value(
                        subitem2.date
                          ? moment(subitem2.date).format(DATE_FORMAT)
                          : ''
                      )
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(8)
                      .value(
                        subitem2.receivedDate
                          ? moment(subitem2.receivedDate).format(DATE_FORMAT)
                          : ''
                      )
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(9)
                      .value(`${subitem2.style}`)
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(10)
                      .value(subitem2.status)
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(11)
                      .value(subitem2.amount)
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(12)
                      .value(subitem2.amountDelivery)
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(13)
                      .value(subitem2.note)
                    switch (subitem2.direction) {
                      case 1:
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(14)
                          .value('Đến')
                        break
                      case 2:
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(14)
                          .value('Đi')
                        break
                      case 3:
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(14)
                          .value('Nội bộ')
                        break
                      default:
                        break
                    }
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(15)
                      .value(subitem2.package ? subitem2.package.name : '')
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(16)
                      .value(subitem2.approver ? subitem2.approver : '')
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(17)
                      .value(subitem2.receiver ? subitem2.receiver.name : '')
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(18)
                      .value(subitem2.publish ? subitem2.publish.name : '')
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(19)
                      .value(subitem2.field ? subitem2.field.name : '')
                    // Tính chất
                    if (subitem2.type) {
                      workbook
                        .sheet('Data')
                        .row(indexExcel)
                        .cell(20)
                        .value(DOCUMENT_TYPES[Number(subitem2.type - 1)].text)
                    }
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(21)
                      .value(subitem2.storage ? subitem2.storage.name : '')
                    if (subitem2.deadline) {
                      workbook
                        .sheet('Data')
                        .row(indexExcel)
                        .cell(22)
                        .value(moment(subitem2.deadline).format(DATE_FORMAT))
                    }
                    switch (subitem2.completeStatus) {
                      case 0:
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(23)
                          .value('Chưa')
                        break
                      case 1:
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(23)
                          .value('Hoàn thành')
                        break
                      default:
                        break
                    }
                    workbook
                      .sheet('Data')
                      .row(indexExcel)
                      .cell(25)
                      .value('Truy cập')
                      .hyperlink(
                        `https://app.trixgo.com/document/home/${subitem2._id}`
                      )

                    indexExcel++

                    /**
                     * HỒ SƠ CẤP 4
                     */
                    listData4.map((subitem3, subindex3) => {
                      if (
                        subitem3.parent &&
                        subitem3.parent.toString() === subitem2._id.toString()
                      ) {
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(1)
                          .value(
                            `${index + 1}.${subindex + 1}.${subindex2 + 1}.${subindex3 + 1}`
                          )
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(4)
                          .value(subitem3.name)
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(5)
                          .value(subitem3.sign)
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(6)
                          .value(subitem3.storeSign)
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(7)
                          .value(
                            subitem3.date
                              ? moment(subitem3.date).format(DATE_FORMAT)
                              : ''
                          )
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(8)
                          .value(
                            subitem3.receivedDate
                              ? moment(subitem3.receivedDate).format(
                                  DATE_FORMAT
                                )
                              : ''
                          )
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(9)
                          .value(`${subitem3.style}`)
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(10)
                          .value(subitem3.status)
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(11)
                          .value(subitem3.amount)
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(12)
                          .value(subitem3.amountDelivery)
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(13)
                          .value(subitem3.note)
                        switch (subitem3.direction) {
                          case 1:
                            workbook
                              .sheet('Data')
                              .row(indexExcel)
                              .cell(14)
                              .value('Đến')
                            break
                          case 2:
                            workbook
                              .sheet('Data')
                              .row(indexExcel)
                              .cell(14)
                              .value('Đi')
                            break
                          case 3:
                            workbook
                              .sheet('Data')
                              .row(indexExcel)
                              .cell(14)
                              .value('Nội bộ')
                            break
                          default:
                            break
                        }
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(15)
                          .value(subitem3.package ? subitem3.package.name : '')
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(16)
                          .value(subitem3.approver ? subitem3.approver : '')
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(17)
                          .value(
                            subitem3.receiver ? subitem3.receiver.name : ''
                          )
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(18)
                          .value(subitem3.publish ? subitem3.publish.name : '')
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(19)
                          .value(subitem3.field ? subitem3.field.name : '')
                        // Tính chất
                        if (subitem3.type) {
                          workbook
                            .sheet('Data')
                            .row(indexExcel)
                            .cell(20)
                            .value(
                              DOCUMENT_TYPES[Number(subitem3.type - 1)].text
                            )
                        }
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(21)
                          .value(subitem3.storage ? subitem3.storage.name : '')
                        if (subitem3.deadline) {
                          workbook
                            .sheet('Data')
                            .row(indexExcel)
                            .cell(22)
                            .value(
                              moment(subitem3.deadline).format(DATE_FORMAT)
                            )
                        }
                        switch (subitem3.completeStatus) {
                          case 0:
                            workbook
                              .sheet('Data')
                              .row(indexExcel)
                              .cell(23)
                              .value('Chưa')
                            break
                          case 1:
                            workbook
                              .sheet('Data')
                              .row(indexExcel)
                              .cell(23)
                              .value('Hoàn thành')
                            break
                          default:
                            break
                        }
                        workbook
                          .sheet('Data')
                          .row(indexExcel)
                          .cell(25)
                          .value('Truy cập')
                          .hyperlink(
                            `https://app.trixgo.com/document/home/${subitem3._id}`
                          )

                        indexExcel++
                      }
                    })
                  }
                })
              }
            })
          })

          // const rangeUsed = workbook.sheet("Data").usedRange();
          const range = workbook
            .sheet('Data')
            .range(`A3:U${listData1.length + 2}`)

          range.style({
            fontFamily: 'Times New Roman',
            fontColor: 'black',
            fontSize: 13,
            bold: false,
            // horizontalAlignment: 'center',
            border: true,
            borderColor: 'black',
            wrapText: true,
          })

          const now = new Date()
          const filePath = '../../../files/temporary_uploads/'
          const fileName = `ListDocument${now.getTime()}.xlsm`
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
