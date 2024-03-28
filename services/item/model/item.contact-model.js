'use strict'

const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const ObjectID = require('mongoose').Types.ObjectId
const BaseModel = require('../../../tools/db/base_model')

/**
 * TOOLS
 */
const {
  checkObjectIDs,
  IsJsonString,
  validateParamsObjectID,
  regexPhoneNumber,
} = require('../../../tools/utils/utils')
const { getTimeBetween } = require('../../../tools/utils/time_utils')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { uploadFileS3 } = require('../../../tools/s3')
const { isValidDate } = require('../../../tools/utils/time_utils')

const {
  CONTACT_CLASSIFY,
  HUMAN_CLASSIFY,
  CONTACT_GENDER,
  PERSONAL_STATUS,
  INSURANCE_STATUS,
  CONTACT_POLICY,
  CONTACT_NEW,
  PAYMENT_STATUS,
} = require('../helper/item.keys-constant')
const stringUtils = require('../../../tools/utils/string_utils')

const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
  CF_ACTIONS_ANALYSIS,
} = require('../../analysis/helper/analysis.actions-constant')

/**
 * COLLECTIONS
 */
const USER_COLL = require('../../auth/database/auth.user-coll')
const ITEM__FUNDA_COLL = require('../database/item.funda-coll')
const ITEM__DEPARTMENT_COLL = require('../database/item.department-coll')
const ITEM__POSITION_COLL = require('../database/item.position-coll')
const ITEM__DOCTYPE_COLL = require('../database/item.doctype-coll')
const ITEM__CONTRACT_COLL = require('../database/item.contract-coll')
const ITEM__CONTACT_COLL = require('../database/item.contact-coll')
const ITEM__AREA_COLL = require('../database/item.area-coll')
const FNB_VOUCHER_COLL = require('../../fnb/database/fnb.voucher-coll')
const HUMAN__CONTACT_DOCUMENT_COLL = require('../../human/database/human.contact_document-coll')

const AUTH__APP_USER = require('../.../../../auth/model/auth.app_users').MODEL
const FNB_ORDER_VOUCHER_MODEL =
  require('../../fnb/model/fnb.voucher-model').MODEL
const CONTACT_DOCUMENT_MODEL =
  require('../../human/model/human.contact_document-model').MODEL
const ANALYSIS__HISTORY_DATA_MODEL =
  require('../.../../../analysis/model/analysis.history_data').MODEL

let dataTF = {
  appID: '61e049c9fdebf77b072d1b13', // HUMAN
  menuID: '623f1f0de998e94feda0cd72', //
  type: 1,
  action: 1, // Xem
}
let dataTF2 = {
  appID: '61e049c9fdebf77b072d1b13', // HUMAN
  menuID: '623f1f0de998e94feda0cd72', //
  type: 1,
  action: 2, // Thêm
}

class Model extends BaseModel {
  constructor() {
    super(ITEM__CONTACT_COLL)
  }

  /**
   * Name: Thêm danh bạ, nhân sự
   * Author: Depv
   * Code:
   */
  insert({
    authorID,
    parent,
    type,
    name,
    description,
    note,
    sign,
    address,
    taxid,
    birthday,
    gender,
    phone,
    email,
    department,
    position,
    linkUser,
    status,
    field,
    property,
    saleID,
    workingStatus,
    realStatus,
    insuranceStatus,
    familyPolicy,
    contractType,
    contractSign,
    family,
    identity,
    dateProvice,
    place,
    area,
    area1,
    area2,
    insuranceSign,
    insuranceDate,
    sallaryFactor,
    sallarySubFactor,
    sallaryBasic,
    signerIn,
    signerOut,
    workStartDate,
    dayOff,
    appointDate,
    changeSallaryDate,
    contractDate,
    contractValid,
    contractExpire,
    nonResident,
    fundaID,
    referrerID,
    bankAccount,
    dataSource,
    insuranceFee,
    ctx,
  }) {
    // console.log({ authorID, parent, type, name, description, note, sign, address, taxid, birthday, gender, phone, email, department, position, linkUser, status, field, property, saleID, workingStatus, realStatus, insuranceStatus, familyPolicy, contractType, contractSign, family, identity, dateProvice, place, area, area1, area2, insuranceSign, insuranceDate, sallaryFactor, sallarySubFactor, sallaryBasic, signerIn, signerOut, workStartDate, dayOff, appointDate, changeSallaryDate, contractDate, contractValid, contractExpire, nonResident, fundaID, referrerID, bankAccount, dataSource, insuranceFee })
    return new Promise(async (resolve) => {
      try {
        /**
         * BA-Quy trình khởi tạo và quản lý khách hàng
         * 1-Khi tạo lần đầu/Mua hàng lần đầu => Khách hàng mới
         * 2-Khi mua hàng lần 2 trở đi => Khách hàng cũ => Đơn hàng cũ
         * 3-Concat name, note, description -> namecv
         */
        if (
          !name ||
          !phone ||
          !checkObjectIDs(fundaID) ||
          !checkObjectIDs(authorID)
        )
          return resolve({
            error: true,
            message: 'name|phone|fundaID|authorID_param_not_valid',
          })

        //___________Quyền truy cập ứng dụng Nhân sự
        let infoAppUser = await AUTH__APP_USER.checkPermissionsAccessApp({
          appID: '61e049c9fdebf77b072d1b13',
          userID: authorID,
        })

        //___________Xác thực số điện thoại
        if (!regexPhoneNumber(phone))
          return resolve({
            error: true,
            message: 'Số điện thoại không hợp lệ',
          })
        let checkPhone = phone.replace(/\s/g, '').length
        if (Number(checkPhone) < 10)
          return resolve({
            error: true,
            message: 'Số điện thoại phải đúng 10 ký tự',
          })

        let infoFunda = await ITEM__FUNDA_COLL.findById(fundaID)
        if (!infoFunda)
          return resolve({
            error: true,
            message: 'can_not_get_funda_info',
          })
        // console.log(infoFunda)

        //___________Kiểm tra việc trùng mã hiệu
        let conditionObj = {
          company: infoFunda.company,
        }

        if (
          (sign && sign != '') ||
          (taxid && taxid != '') ||
          (phone && phone != '')
        ) {
          conditionObj.$or = []
        }
        if (sign && sign != '') {
          conditionObj.$or.push({ sign: sign })
        }
        if (taxid && taxid != '') {
          conditionObj.$or.push({ taxid: taxid })
        }
        if (phone && phone != '') {
          conditionObj.$or.push({ phone: phone.replace(/\s/g, '') })
        }
        // console.log(conditionObj)

        let infoContact = await ITEM__CONTACT_COLL.findOne(conditionObj)
        if (conditionObj.$or && conditionObj.$or.length > 0 && infoContact)
          return resolve({
            error: true,
            message: `Mã hiệu/Mã số thuế/Điện thoại đã tồn tại - ${infoContact.name} - ${infoContact.phone}`,
          })

        let dataInsert = {
          userCreate: authorID,
          company: infoFunda.company,
          funda: fundaID,
          type: !isNaN(type) && Number(type) > 0 ? Number(type) : 2, // Khách hàng
          name,
          description,
          note,
          sign,
          address,
          taxid,
          birthday,
          phone: phone.replace(/\s/g, ''),
          email,
          status: status ? Number(status) : Number(1),
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
        if (note && note != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(note)
        }
        if (phone && phone != '') {
          convertStr =
            convertStr +
            ' ' +
            stringUtils.removeAccents(phone.replace(/\s/g, ''))
        }
        if (taxid && taxid != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(taxid)
        }
        if (email && email != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(email)
        }
        if (identity && identity != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(identity)
        }
        if (bankAccount && bankAccount != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(bankAccount)
        }

        dataInsert.namecv = convertStr

        // Người giới thiệu
        if (referrerID && checkObjectIDs(referrerID)) {
          dataInsert.referrer = referrerID
        }

        if (infoFunda.area1) {
          dataInsert.sector1 = infoFunda.area1
        }

        if (infoFunda.area2) {
          dataInsert.sector2 = infoFunda.area2
        }

        if (infoFunda.area3) {
          dataInsert.sector3 = infoFunda.area3
        }

        if (gender && !isNaN(gender)) {
          dataInsert.gender = gender
        }

        if (department && checkObjectIDs(department)) {
          dataInsert.department = department
        }
        if (position && checkObjectIDs(position)) {
          dataInsert.position = position
        }
        if (linkUser && checkObjectIDs(linkUser)) {
          // Kiểm tra xem đã tồn tại hay chưa, nếu tồn tại rồi thì không cho link nữa
          let checkExist = await ITEM__CONTACT_COLL.findOne({
            linkUser: linkUser,
            company: infoFunda.company,
          })
          if (!checkExist) {
            dataInsert.linkUser = linkUser
          }
        }
        if (saleID && checkObjectIDs(saleID)) {
          dataInsert.sale = saleID
        }
        if (field && checkObjectIDs(field)) {
          dataInsert.field = field
        }
        if (property && checkObjectIDs(property)) {
          dataInsert.property = property
        }

        /**
         * PHẦN TỬ CHA
         */
        let infoParent
        if (parent && checkObjectIDs(parent)) {
          // Chỉ admin ứng dụng mới được thêm phần tử cha con
          if (!infoAppUser.error && infoAppUser.data.level == 0) {
            dataInsert.parent = parent
            dataInsert.nestedParents = [parent] // Cha cấp 1

            // Cập nhật Level để phục vụ việc tính toán, đệ quy
            infoParent = await ITEM__CONTACT_COLL.findById(parent)
            dataInsert.level = infoParent.level + 1

            // Lấy nguồn theo phần tử cha
            if (
              infoParent.dataSource &&
              checkObjectIDs(infoParent.dataSource)
            ) {
              dataInsert.dataSource = infoParent.dataSource
            }
          }
        }

        if (dataSource && checkObjectIDs(dataSource)) {
          dataInsert.dataSource = dataSource
        }

        if (workingStatus && checkObjectIDs(workingStatus)) {
          dataInsert.workingStatus = workingStatus
        }

        if (realStatus) {
          dataInsert.realStatus = realStatus
        }

        if (insuranceStatus) {
          dataInsert.insuranceStatus = insuranceStatus
        }

        if (bankAccount) {
          dataInsert.bankAccount = bankAccount
        }

        if (family) {
          dataInsert.family = family
        }

        if (familyPolicy) {
          dataInsert.familyPolicy = familyPolicy
        }

        if (contractType && checkObjectIDs(contractType)) {
          dataInsert.contractType = contractType
        }

        if (contractSign) {
          dataInsert.contractSign = contractSign
        }

        if (identity) {
          dataInsert.identity = identity
        }

        if (dateProvice) {
          dataInsert.dateProvice = dateProvice
        }

        if (place) {
          dataInsert.place = place
        }

        if (area) {
          dataInsert.area = area
        }

        if (area1) {
          dataInsert.area1 = area1
        }

        if (area2) {
          dataInsert.area2 = area2
        }

        if (insuranceSign) {
          dataInsert.insuranceSign = insuranceSign
        }

        if (insuranceDate) {
          dataInsert.insuranceDate = insuranceDate
        }

        if (sallaryFactor) {
          dataInsert.sallaryFactor = sallaryFactor
        }

        if (sallarySubFactor) {
          dataInsert.sallarySubFactor = sallarySubFactor
        }

        if (sallaryBasic) {
          dataInsert.sallaryBasic = sallaryBasic
        }

        if (insuranceFee) {
          dataInsert.insuranceFee = insuranceFee
        }

        if (signerIn) {
          dataInsert.signerIn = signerIn
        }

        if (signerOut) {
          dataInsert.signerOut = signerOut
        }

        if (workStartDate) {
          dataInsert.workStartDate = workStartDate
        }

        if (dayOff) {
          dataInsert.dayOff = dayOff
        }

        if (appointDate) {
          dataInsert.appointDate = appointDate
        }

        if (changeSallaryDate) {
          dataInsert.changeSallaryDate = changeSallaryDate
        }

        if (contractDate) {
          dataInsert.contractDate = contractDate
        }

        if (contractValid) {
          dataInsert.contractValid = contractValid
        }

        if (contractExpire) {
          dataInsert.contractExpire = contractExpire
        }

        if (nonResident) {
          dataInsert.nonResident = Number(nonResident)
        }
        // console.log({dataInsert})

        let infoAfterInsert = await this.insertData(dataInsert, authorID)
        // console.log(infoAfterInsert)

        /**
         * PHẦN TỬ CHA-CON => PHỤC VỤ XỬ LÝ ĐỆ QUY
         */
        if (parent && checkObjectIDs(parent)) {
          // Chỉ admin ứng dụng mới được thêm phần tử cha con
          if (!infoAppUser.error && infoAppUser.data.level == 0) {
            /**
             * Phần tử cha cấp 1
             */
            await ITEM__CONTACT_COLL.findByIdAndUpdate(
              parent,
              {
                $addToSet: {
                  childs: infoAfterInsert._id,
                  nestedChilds: infoAfterInsert._id,
                },
              },
              { new: true }
            )

            /**
             * Phần tử cha cấp 2 trở lên
             */
            for (const item of infoParent?.nestedParents) {
              // Thêm phần tử con/cháu
              await ITEM__CONTACT_COLL.findByIdAndUpdate(
                item,
                {
                  $addToSet: {
                    nestedChilds: infoAfterInsert._id,
                  },
                },
                { new: true }
              )

              // Thêm các phần tử cha
              await ITEM__CONTACT_COLL.findByIdAndUpdate(
                infoAfterInsert._id,
                {
                  $addToSet: { nestedParents: item },
                },
                { new: true }
              )
            }
          }
        }

        // Cập nhật linkUser với tài khoản
        if (linkUser && checkObjectIDs(linkUser)) {
          await USER_COLL.findByIdAndUpdate(
            linkUser,
            {
              $addToSet: { contacts: infoAfterInsert._id },
            },
            { new: true }
          )
        }

        // Cập nhật vào đơn vị cơ sở
        await ITEM__FUNDA_COLL.findByIdAndUpdate(
          fundaID,
          { $inc: { numberOfCustomers: 1 } },
          { new: true }
        )

        /**
         * Người giới thiệu
         * Tạo Voucher cho người nhận giới thiệu
         * Chỉ áp dụng trong khoảng thời gian được khống chế
         */
        if (referrerID && checkObjectIDs(referrerID)) {
          /**
           * Tạo voucher cho Nngười được giới thiệu (type=3)
           * 1-Phân loại Type = 3
           * 2-Còn thời hạn sử dụng
           * 3-Voucher tặng Giá trị
           */
          let infoVoucher1 = await FNB_VOUCHER_COLL.findOne({
            type: 3,
            company: infoFunda.company,
            expired: { $gt: new Date() },
            salesoffAmount: { $gt: 0 },
            salesoffRate: 0,
          })
            .sort({ expired: 1 })
            .select('_id name sign')
          // console.log({infoVoucher1})

          if (infoVoucher1) {
            await FNB_ORDER_VOUCHER_MODEL.update({
              companyID: infoFunda.company,
              userID: authorID,
              voucherID: infoVoucher1._id,
              receivers: [infoAfterInsert._id],
            })
          }

          /**
           * Tạo voucher cho Nngười được giới thiệu (type=3)
           * 1-Phân loại Type = 3
           * 2-Còn thời hạn sử dụng
           * 3-Voucher tặng Phần trăm
           */
          let infoVoucher2 = await FNB_VOUCHER_COLL.findOne({
            type: 3,
            company: infoFunda.company,
            expired: { $gt: new Date() },
            salesoffAmount: 0,
            salesoffRate: { $gt: 0 },
          })
            .sort({ expired: 1 })
            .select('_id name sign')

          if (infoVoucher2) {
            await FNB_ORDER_VOUCHER_MODEL.update({
              companyID: infoFunda.company,
              userID: authorID,
              voucherID: infoVoucher2._id,
              receivers: [infoAfterInsert._id],
            })
          }
        }

        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF2)

        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: update danh bạ, nhân sự
   * Author: Depv
   * Code:
   */
  update({
    contactID,
    company,
    authorID,
    parent,
    type,
    name,
    description,
    note,
    sign,
    address,
    taxid,
    birthday,
    gender,
    phone,
    email,
    department,
    position,
    linkUser,
    status,
    field,
    property,
    saleID,
    workingStatus,
    realStatus,
    insuranceStatus,
    familyPolicy,
    contractType,
    contractSign,
    family,
    identity,
    dateProvice,
    place,
    area,
    area1,
    area2,
    insuranceSign,
    insuranceDate,
    sallaryFactor,
    sallarySubFactor,
    sallaryBasic,
    signerIn,
    signerOut,
    workStartDate,
    dayOff,
    appointDate,
    changeSallaryDate,
    contractDate,
    contractValid,
    contractExpire,
    nonResident,
    fundaID,
    bankAccount,
    dataSource,
    insuranceFee,
    union,
    share,
    image,
    documents,
    documentsRemove,
    purchasedValue,
    totalLoyaltyPoints,
    usedLoyaltyPoints,
    remainLoyaltyPoints,
    getVouchers,
    usedVouchers,
  }) {
    // console.log('================THAM BIẾN CẬP NHẬT DANH BẠ=================')
    // console.log({contactID, company, authorID, parent, type, name, description, note, sign, address, taxid, birthday, gender, phone, email, department, position, linkUser, status, field, property, saleID, workingStatus, realStatus, insuranceStatus, familyPolicy, contractType, contractSign, family, identity, dateProvice, place, area, area1, area2, insuranceSign, insuranceDate, sallaryFactor, sallarySubFactor, sallaryBasic, signerIn, signerOut, workStartDate, dayOff, appointDate, changeSallaryDate, contractDate, contractValid, contractExpire, nonResident, fundaID, bankAccount, insuranceFee, union, share, image, documents, documentsRemove, purchasedValue, totalLoyaltyPoints, usedLoyaltyPoints, remainLoyaltyPoints, getVouchers, usedVouchers})
    return new Promise(async (resolve) => {
      try {
        //___________Xác thực số điện thoại
        if (phone) {
          if (!regexPhoneNumber(phone))
            return resolve({
              error: true,
              message: 'Số điện thoại không hợp lệ',
            })

          let checkPhone = phone.replace(/\s/g, '').length
          if (Number(checkPhone) < 10)
            return resolve({
              error: true,
              message: 'Số điện thoại phải đúng 10 ký tự',
            })
        }

        //___________Kiểm tra việc trùng mã hiệu
        let conditionObj = {
          company: company,
          _id: { $ne: contactID },
        }

        if (
          (sign && sign != '') ||
          (taxid && taxid != '') ||
          (phone && phone != '')
        ) {
          conditionObj.$or = []
        }
        if (sign && sign != '') {
          conditionObj.$or.push({ sign: sign })
        }
        if (taxid && taxid != '') {
          conditionObj.$or.push({ taxid: taxid })
        }
        if (phone && phone != '') {
          conditionObj.$or.push({ phone: phone.replace(/\s/g, '') })
        }

        let infoContact = await ITEM__CONTACT_COLL.findOne(conditionObj)
        if (conditionObj.$or && conditionObj.$or.length > 0 && infoContact)
          return resolve({
            error: true,
            message: `Mã hiệu/Mã số thuế/Điện thoại đã tồn tại - ${infoContact.name} - ${infoContact.phone}`,
          })

        let dataUpdate = {
          modifyAt: new Date(),
          userUpdate: authorID,
        }
        let dataAddToset = {}

        if (type) {
          dataUpdate.type = type
        }

        if (name) {
          dataUpdate.name = name
        }

        if (company) {
          dataUpdate.company = company
        }

        if (description) {
          dataUpdate.description = description
        }

        if (note) {
          dataUpdate.note = note
        }

        if (sign) {
          dataUpdate.sign = sign
        }

        if (bankAccount) {
          dataUpdate.bankAccount = bankAccount
        }

        if (address) {
          dataUpdate.address = address
        }

        if (taxid) {
          dataUpdate.taxid = taxid
        }

        if (birthday) {
          dataUpdate.birthday = birthday
        }

        if (phone) {
          dataUpdate.phone = phone.replace(/\s/g, '')
        }

        if (email) {
          dataUpdate.email = email
        }

        // NameCV
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
        if (note && note != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(note)
        }
        if (phone && phone != '') {
          convertStr =
            convertStr +
            ' ' +
            stringUtils.removeAccents(phone.replace(/\s/g, ''))
        }
        if (taxid && taxid != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(taxid)
        }
        if (email && email != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(email)
        }
        if (identity && identity != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(identity)
        }
        if (bankAccount && bankAccount != '') {
          convertStr = convertStr + ' ' + stringUtils.removeAccents(bankAccount)
        }

        dataUpdate.namecv = convertStr

        if (status) {
          dataUpdate.status = status
        }

        if (image) {
          dataUpdate.image = image
        }

        if (gender && !isNaN(gender)) {
          dataUpdate.gender = gender
        }
        if (department && checkObjectIDs(department)) {
          dataUpdate.department = department
        }
        if (position && checkObjectIDs(position)) {
          dataUpdate.position = position
        }
        if (saleID && checkObjectIDs(saleID)) {
          dataUpdate.sale = saleID
        }

        if (linkUser && checkObjectIDs(linkUser)) {
          // Kiểm tra xem đã tồn tại hay chưa, nếu tồn tại rồi thì không cho link nữa
          let checkExist = await ITEM__CONTACT_COLL.findOne({
            linkUser: linkUser,
            company: company,
          })
          // console.log(checkExist)
          if (!checkExist) {
            dataUpdate.linkUser = linkUser
          }
        }
        if (field && checkObjectIDs(field)) {
          dataUpdate.field = field
        }
        if (property && checkObjectIDs(property)) {
          dataUpdate.property = property
        }

        if (dataSource && checkObjectIDs(dataSource)) {
          dataUpdate.dataSource = dataSource
        }

        if (workingStatus && checkObjectIDs(workingStatus)) {
          dataUpdate.workingStatus = workingStatus
        }

        if (realStatus) {
          dataUpdate.realStatus = realStatus
        }

        if (insuranceStatus) {
          dataUpdate.insuranceStatus = insuranceStatus
        }

        if (familyPolicy) {
          dataUpdate.familyPolicy = familyPolicy
        }

        if (contractType && checkObjectIDs(contractType)) {
          dataUpdate.contractType = contractType
        }

        if (contractSign) {
          dataUpdate.contractSign = contractSign
        }

        if (family) {
          dataUpdate.family = family
        }

        if (identity) {
          dataUpdate.identity = identity
        }

        if (dateProvice) {
          dataUpdate.dateProvice = dateProvice
        }

        if (place) {
          dataUpdate.place = place
        }

        if (area) {
          dataUpdate.area = area
        }

        if (area1) {
          dataUpdate.area1 = area1
        }

        if (area2) {
          dataUpdate.area2 = area2
        }

        if (insuranceSign) {
          dataUpdate.insuranceSign = insuranceSign
        }

        if (insuranceDate) {
          dataUpdate.insuranceDate = insuranceDate
        }

        if (sallaryFactor) {
          dataUpdate.sallaryFactor = sallaryFactor
        }

        if (sallarySubFactor) {
          dataUpdate.sallarySubFactor = sallarySubFactor
        }

        if (sallaryBasic) {
          dataUpdate.sallaryBasic = sallaryBasic
        }

        if (insuranceFee) {
          dataUpdate.insuranceFee = insuranceFee
        }

        if (union) {
          dataUpdate.union = union
        }

        if (share) {
          dataUpdate.share = share
        }

        if (signerIn) {
          dataUpdate.signerIn = signerIn
        }

        if (signerOut) {
          dataUpdate.signerOut = signerOut
        }

        if (workStartDate) {
          dataUpdate.workStartDate = workStartDate
        }

        if (dayOff) {
          dataUpdate.dayOff = dayOff
        }

        if (appointDate) {
          dataUpdate.appointDate = appointDate
        }

        if (changeSallaryDate) {
          dataUpdate.changeSallaryDate = changeSallaryDate
        }

        if (contractDate) {
          dataUpdate.contractDate = contractDate
        }

        if (contractValid) {
          dataUpdate.contractValid = contractValid
        }

        if (contractExpire) {
          dataUpdate.contractExpire = contractExpire
        }

        if (checkObjectIDs(documents)) {
          dataUpdate.$addToSet = { documents }
        }

        if (checkObjectIDs(documentsRemove)) {
          dataUpdate.$pull = { documents: documentsRemove }
        }

        if (fundaID) {
          let infoFunda = await ITEM__FUNDA_COLL.findById(fundaID)
          dataUpdate.funda = fundaID

          if (infoFunda.area1) {
            dataUpdate.sector1 = infoFunda.area1
          }

          if (infoFunda.area2) {
            dataUpdate.sector2 = infoFunda.area2
          }

          if (infoFunda.area3) {
            dataUpdate.sector3 = infoFunda.area3
          }

          if (infoFunda.company) {
            dataUpdate.company = infoFunda.company
          }
        }

        if (purchasedValue && !isNaN(purchasedValue)) {
          dataUpdate.purchasedValue = Number(purchasedValue)
        }
        if (totalLoyaltyPoints && !isNaN(totalLoyaltyPoints)) {
          dataUpdate.totalLoyaltyPoints = Number(totalLoyaltyPoints)
        }
        if (usedLoyaltyPoints && !isNaN(usedLoyaltyPoints)) {
          dataUpdate.usedLoyaltyPoints = Number(usedLoyaltyPoints)
        }
        if (remainLoyaltyPoints && !isNaN(remainLoyaltyPoints)) {
          dataUpdate.remainLoyaltyPoints = Number(remainLoyaltyPoints)
        }

        if (nonResident) {
          dataUpdate.nonResident = Number(nonResident)
        }

        /**
         * QUẢN LÝ VOUCHER
         */
        //_________Thêm voucher
        if (checkObjectIDs(getVouchers)) {
          dataAddToset = {
            ...dataAddToset,
            getVouchers,
          }
        }

        //_________Sử dụng voucher
        if (checkObjectIDs(usedVouchers)) {
          dataAddToset = {
            ...dataAddToset,
            usedVouchers,
          }
        }
        // console.log(dataUpdate)

        let infoAfterUpdate = await ITEM__CONTACT_COLL.findByIdAndUpdate(
          contactID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
          })

        // Cập nhật phần tử cha
        if (
          parent &&
          checkObjectIDs(parent) &&
          contactID.toString() != parent.toString()
        ) {
          //___________Quyền truy cập ứng dụng Nhân sự
          let infoAppUser = await AUTH__APP_USER.checkPermissionsAccessApp({
            appID: '61e049c9fdebf77b072d1b13',
            userID: authorID,
          })

          // Chỉ admin ứng dụng mới được thêm phần tử cha con
          if (!infoAppUser.error && infoAppUser.data.level == 0) {
            await ANALYSIS__HISTORY_DATA_MODEL.convertData({
              option: 8,
              companyID: company,
              userID: authorID,
              docID: contactID,
              parentID: parent,
            })
          }
        }

        // Cập nhật lại số lượng document cho contact
        await this.updateValue({ contactID, userID: authorID })

        // Cập nhật linkUser với tài khoản: chỉ cho phép 1 user link với 1 danh bạ trong 1 phân vùng
        if (linkUser && checkObjectIDs(linkUser)) {
          // Cập nhật vào user-coll
          // await USER_COLL.findByIdAndUpdate(linkUser,
          //     {
          //         $addToSet: { contacts: contactID }
          //     },
          //     { new: true })
          await USER_COLL.findByIdAndUpdate(
            linkUser,
            {
              contacts: [contactID],
            },
            { new: true }
          )
        }

        return resolve({ error: false, data: infoAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Tổng hợp các hồ sơ của danh bạ
   * Author: HiepNH
   * Code: 21/1/2024
   */
  updateValue({ contactID, userID }) {
    return new Promise(async (resolve) => {
      try {
        let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

        let amountWorkHistory = 0,
          amountProjectHistory = 0,
          amountContractHistory = 0,
          amountEducationHistory = 0,
          amountCertificateHistory = 0

        // console.log({ contactID, dataUpdate })
        let listData = await HUMAN__CONTACT_DOCUMENT_COLL.aggregate([
          {
            $match: {
              contact: ObjectID(contactID),
            },
          },
          {
            $group: {
              _id: { type: '$type' },
              count: { $sum: 1 },
            },
          },
        ])
        // console.log(listData)

        for (const item of listData) {
          if (item._id.type == 1) {
            amountWorkHistory = Number(amountWorkHistory) + Number(item.count)
          }
          if (item._id.type == 2) {
            amountProjectHistory =
              Number(amountProjectHistory) + Number(item.count)
          }
          if (item._id.type == 3) {
            amountContractHistory =
              Number(amountContractHistory) + Number(item.count)
          }
          if (item._id.type == 4) {
            amountEducationHistory =
              Number(amountEducationHistory) + Number(item.count)
          }
          if (item._id.type == 5) {
            amountCertificateHistory =
              Number(amountCertificateHistory) + Number(item.count)
          }
        }

        dataUpdate.amountWorkHistory = Number(amountWorkHistory)
        dataUpdate.amountProjectHistory = Number(amountProjectHistory)
        dataUpdate.amountContractHistory = Number(amountContractHistory)
        dataUpdate.amountEducationHistory = Number(amountEducationHistory)
        dataUpdate.amountCertificateHistory = Number(amountCertificateHistory)

        let infoAfterUpdate = await ITEM__CONTACT_COLL.findByIdAndUpdate(
          contactID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
            keyError: "can't_update_task",
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
   * Name: Thông tin nhân sự
   * Author: Depv
   * Code:
   */
  getInfo({ contactID, linkUserID, select, populates, ctx }) {
    // console.log('===========Thông tin danh bạ========')
    // console.log({ contactID, linkUserID, select, populates })
    return new Promise(async (resolve) => {
      try {
        if (contactID) {
          if (!checkObjectIDs(contactID))
            return resolve({
              error: true,
              message: 'Request params contactID invalid',
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
          let infoAterGet = await ITEM__CONTACT_COLL.findById(contactID)
            .select(select)
            .populate(populates)
          if (!infoAterGet)
            return resolve({
              error: true,
              message: "can't_get_info",
              status: 403,
            })

          // Record Traffic
          // //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

          return resolve({
            error: false,
            data: infoAterGet,
            status: 200,
          })
        } else {
          if (!checkObjectIDs(linkUserID))
            return resolve({
              error: true,
              message: 'Request params linkUserID invalid',
              status: 400,
            })

          let info = await ITEM__CONTACT_COLL.findOne({
            linkUser: linkUserID,
          })
          if (info) {
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
            let infoAterGet = await ITEM__CONTACT_COLL.findById(info._id)
              .select(select)
              .populate(populates)
            if (!infoAterGet)
              return resolve({
                error: true,
                message: "can't_get_info",
                status: 403,
              })

            // Record Traffic
            // //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

            return resolve({
              error: false,
              data: infoAterGet,
              status: 200,
            })
          } else {
            return resolve({
              error: true,
              message: "can't_get_info",
              status: 403,
            })
          }
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
   * Name  : Danh sách nhân sự
   * Author: HiepNH
   * Code  : 30/7/2023
   */
  getList({
    option,
    companyID,
    userID,
    uplineID,
    contacts,
    isBirthday,
    fundaID,
    voucherID,
    parentID,
    type,
    fromDate,
    toDate,
    keyword,
    limit = 5,
    lastestID,
    select,
    populates,
    month,
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * BA
         * https://www.w3resource.com/mongodb/mongodb-where-operators.php#:~:text=The%20MongoDB%20%24where%20operator%20is,referred%20as%20this%20or%20obj.
         */
        if (Number(limit) > 10) {
          limit = 10
        } else {
          limit = +Number(limit)
        }

        let sortBy
        let conditionObj = { company: companyID }
        let keys = ['createAt__-1', '_id__-1']

        // Theo user đang truy cập
        if (option && option == 1 && contacts && contacts.length) {
          let listContacts = contacts.map((item) => ObjectID(item._id))

          conditionObj.nestedParents = { $in: listContacts }
          // conditionObj.nestedParents = {$in: [listContacts[0]]}
        }

        if (option && option == 2) {
          conditionObj.nestedParents = { $in: [ObjectID(uplineID)] }
        }

        // Theo phân loại
        if (type && [1, 2].includes(Number(type))) {
          conditionObj.type = type
        } else {
          delete conditionObj.type
        }

        // Lấy những danh bạ có sinh nhật vào hôm nay
        if (isBirthday == 1) {
          const day = new Date().getDate()
          const month = new Date().getMonth()
          conditionObj.$where = `return this.birthday && this.birthday.getDate() === ${day} && this.birthday.getMonth() === ${month}`
        }

        // Danh sách sinh nhật theo tháng
        if (month) {
          conditionObj.$where = `return this.birthday && this.birthday.getMonth() === ${Number(month - 1)}`
        }

        // Lấy theo Voucher
        if (voucherID && checkObjectIDs(voucherID)) {
          let infoVoucher = await FNB_VOUCHER_COLL.findById(voucherID)
          // console.log(infoVoucher)
          if (infoVoucher) {
            conditionObj._id = { $in: infoVoucher.receivers }
          }
        }

        // Lấy nhân sự theo đơn vị cơ sở
        if (fundaID && checkObjectIDs(fundaID)) {
          conditionObj.funda = fundaID
        }

        if (parentID && checkObjectIDs(parentID)) {
          conditionObj.parent = parentID
        }

        // Phân loại theo thời khoảng
        if (isValidDate(fromDate) && isValidDate(toDate)) {
          conditionObj.joinedDate = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          }
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

        if (keyword) {
          keyword = stringUtils.removeAccents(keyword)
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          const regSearch = new RegExp(keyword, 'i')

          conditionObj.namecv = regSearch
        }

        let conditionObjOrg = {
          // _id: {
          //     $gte: ObjectID.createFromTime(moment(new Date(fromDate)).startOf('day')._d/1000),
          //     $lte: ObjectID.createFromTime(moment(new Date(toDate)).endOf('day')._d/1000)
          // },
          ...conditionObj,
        }

        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await ITEM__CONTACT_COLL.findById(lastestID)
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

        let infoDataAfterGet = await ITEM__CONTACT_COLL.find(conditionObj)
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
        let totalRecord = await ITEM__CONTACT_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)

        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

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
   * Name  : Tìm kiếm nhân sự
   * Author: HiepNH
   * Code  : 29/8/2022
   */
  getListByFilter({
    parentID,
    companyID,
    receiverID,
    types,
    isExportExcel = false,
    requestResponse,
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
    type,
    genders,
    ctx,
  }) {
    // console.log({ parentID, companyID, receiverID, types, isExportExcel,requestResponse, fromDate, toDate, marked, userID, departmentsID, keyword, limit, lastestID, select, populates, isParent, type, genders })
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        let conditionObj = {}
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

        const validation = validateParamsObjectID({
          departmentsID: { value: departmentsID, isRequire: false },
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

        // Chỉ lấy các mẩu tin cha
        if (isParent) {
          conditionObj.parent = { $exists: false }
        }

        if (type && [1, 2].includes(Number(type))) {
          conditionObj.type = Number(type)
        } else {
          delete conditionObj.type
        }

        // Bộ lọc với nhiều lựa chọn
        genders && genders.length && (conditionObj.gender = { $in: genders })
        departmentsID &&
          departmentsID.length &&
          (conditionObj.department = { $in: departmentsID })
        types && types.length && (conditionObj.type = { $in: types })

        // Ngày làm việc
        if (fromDate && toDate) {
          conditionObj.workStartDate = {
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
          keyword = stringUtils.removeAccents(keyword)
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          const regSearch = new RegExp(keyword, 'i')

          conditionObj.namecv = regSearch
        }

        /**
         * Sử dụng trong export excel document (hoặc theo bộ lọc)
         * Trả về điều kiện tra cứu
         */
        if (isExportExcel) {
          return resolve({ data: conditionObj, error: false })
        }
        // console.log(conditionObj)

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await ITEM__CONTACT_COLL.findById(lastestID)
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

        let infoDataAfterGet = await ITEM__CONTACT_COLL.find(conditionObj)
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
        let totalRecord = await ITEM__CONTACT_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)

        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

        return resolve({
          error: false,
          data: {
            listRecords: infoDataAfterGet,
            limit: limit,
            totalRecord,
            totalPage,
            nextCursor,
            lastestID,
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
   * Name  : Danh sách danh bạ của hệ thống
   * Author: HiepNH/DePV-update
   * Code  :
   */
  getListOfSystem({
    keyword,
    limit = 5,
    lastestID,
    select,
    populates = {},
    ctx,
  }) {
    return new Promise(async (resolve) => {
      try {
        let conditionObj = {}
        let keys = ['createAt__-1', '_id__-1']
        let sortBy

        if (limit > 5) {
          limit = 5
        }

        // POPULATE
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
          let regSearch = new RegExp(keyword, 'i')

          conditionObj.namecv = regSearch
        }

        let conditionObjOrg = { ...conditionObj }

        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await ITEM__CONTACT_COLL.findById(lastestID)
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

        let infoDataAfterGet = await ITEM__CONTACT_COLL.find(conditionObj)
          .limit(+limit + 1)
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

        let totalRecord = await ITEM__CONTACT_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)

        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

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
   * Name: Danh sách theo phân loại
   * Author: HiepNH
   * Code: 30/7/2023
   */
  getListByProperty({
    companyID,
    option,
    optionGroup,
    optionTime,
    fundasID,
    uplineID,
    year,
    fromDate,
    toDate,
    userID,
    contacts,
    ctx,
  }) {
    // console.log({ companyID, option, optionGroup, optionTime, fundasID, uplineID, year, fromDate, toDate, userID, contacts })
    return new Promise(async (resolve) => {
      let duration = getTimeBetween(toDate, fromDate)
      try {
        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

        let yearFilter
        let currentYear = new Date().getFullYear()
        if (year && !isNaN(year)) {
          yearFilter = Number(year)
        } else {
          yearFilter = Number(currentYear)
        }

        if (Number(duration / 86400) > 370) {
          return resolve({
            error: true,
            message: 'Chỉ tra cứu được trong khoảng thời gian <= 370 ngày',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })
        } else {
          let conditionObj = {
            company: ObjectID(companyID),
          }
          let conditionGroup = {},
            conditionProject = {}
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
          } else {
            let listFundaIsMember = await ITEM__FUNDA_COLL.find({
              members: { $in: [userID] },
            })
            let fundasIDIsMember = listFundaIsMember.map((item) =>
              ObjectID(item._id)
            )
            if (fundasIDIsMember.length) {
              conditionObj.funda = { $in: fundasIDIsMember }
            } else {
              conditionObj.funda = { $in: [] }
            }
          }

          conditionProject = {
            year: { $year: '$joinedDate' },
            month: { $month: '$joinedDate' },
            hour: { $hour: '$joinedDate' },
            funda: 1,
            sector1: 1,
            sector2: 1,
            sector3: 1,
            new: 1,
            joinedDate: 1,
            nestedParents: 1,
            level: 1,
          }

          // Phân loại theo thời khoảng
          if (fromDate && toDate) {
            conditionObj.joinedDate = {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            }
          }

          // Gom nhóm theo thời gian
          if (option && Number(option) == 1) {
            // Theo năm
            if (optionTime && Number(optionTime) == 1) {
              conditionGroup = {
                _id: { year: '$year' },
                quantity: { $sum: 1 },
              }
            }

            // Theo tháng trong năm
            if (optionTime && Number(optionTime) == 2) {
              if (!isNaN(year) && Number(year) >= 0) {
                conditionObjYear = {
                  year: Number(year),
                }
              }

              conditionGroup = {
                _id: { month: '$month', year: '$year' },
                quantity: { $sum: 1 },
              }
            }

            // Theo giờ trong ngày
            if (optionTime && Number(optionTime) == 3) {
              conditionGroup = {
                _id: { hour: '$hour' },
                quantity: { $sum: 1 },
              }
            }
          }

          // Gom nhóm theo đơn vị cơ sở
          else if (option && Number(option) == 2) {
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

          // Gom nhóm theo khách hàng cũ, mới, vãng lai
          else if (option && Number(option) == 3) {
            conditionGroup = {
              _id: { new: '$new' },
              quantity: { $sum: 1 },
            }
          }

          // Gom nhóm theo Nhân viên
          else if (option && Number(option) == 4) {
            conditionObj.funda = { $exists: true, $ne: null }
            conditionObj.type = 1 // 1-Nhân viên, 2-Khách hàng
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

          // Gom nhóm theo Sinh nhật
          else if (option && Number(option) == 5) {
            conditionObj.birthday = { $exists: true, $ne: null }
            conditionGroup = {
              _id: { month: '$month' },
              quantity: { $sum: 1 },
            }
            delete conditionObj.funda

            conditionProject = {
              month: { $month: '$birthday' },
              funda: 1,
              birthday: 1,
            }
            sortBy = { '_id.month': 1 }
          }

          // Gom nhóm theo Tuyến dưới
          else if (option && Number(option) == 6) {
            // Theo user đang truy cập
            if (
              optionGroup &&
              optionGroup == 1 &&
              contacts &&
              contacts.length
            ) {
              let listContacts = contacts.map((item) => ObjectID(item._id))

              conditionObj = {
                nestedParents: { $in: listContacts },
              }
              // conditionObj = { nestedParents: {$in:  [listContacts[0]]} }
            }

            if (optionGroup && optionGroup == 2) {
              conditionObj = {
                nestedParents: { $in: [ObjectID(uplineID)] },
              }
            }

            conditionGroup = {
              _id: {},
              quantity: { $sum: 1 },
            }
          }

          // Gom nhóm theo Level Affiliate
          else if (option && Number(option) == 7) {
            conditionObj.dataSource = { $exists: true, $ne: null }

            conditionGroup = {
              _id: { level: '$level' },
              quantity: { $sum: 1 },
            }
            delete conditionObj.funda

            sortBy = { '_id.level': 1 }
          }

          // Gom nhóm theo Affiliate theo tháng: đã phát triển thành công
          else if (option && Number(option) == 8) {
            conditionObj.dataSource = { $exists: true, $ne: null }
            conditionObj.parent = { $exists: true, $ne: null }

            conditionObjYear = {
              year: Number(yearFilter),
            }

            conditionGroup = {
              _id: { month: '$month' },
              quantity: { $sum: 1 },
            }

            delete conditionObj.funda

            // sortBy = {"_id.level": 1}
          }

          // console.log(conditionObj)
          // console.log(conditionPopulate)
          // console.log(conditionObjYear)
          // console.log(conditionGroup)
          // console.log(conditionProject)

          // Danh sách đang triển khai
          let listData = await ITEM__CONTACT_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: conditionProject,
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

          if (!isNaN(option) && [2, 4].includes(Number(option))) {
            await ITEM__CONTACT_COLL.populate(listData, conditionPopulate)
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
   * Name  : Danh bạ (bên mua, bên bán) mà user được quyền truy cập theo hợp đồng
   * Author: HiepNH
   * Code  : 7/9/2022
   */
  getListAccessByContract({
    userID,
    option,
    keyword,
    limit = 10,
    lastestID,
    select,
    populates = {},
    ctx,
  }) {
    // console.log({option,keyword,populates})
    return new Promise(async (resolve) => {
      try {
        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        // Danh sách hợp đồng mà user là members
        let listContractAccess = await ITEM__CONTRACT_COLL.find({
          members: { $in: [userID] },
        }).select('name sign buyerInfo sellerInfo')
        // console.log(listContractAccess)

        /**
         * DECALARTION VARIABLE
         */
        let conditionObj = {}
        let keys = ['createAt__-1', '_id__-1']
        let sortBy

        // POPULATE
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

        if (option && option == 1) {
          // console.log('===========Bên bán================')
          conditionObj._id = {
            $in: listContractAccess.map((item) => item.sellerInfo),
          }
        }

        if (option && option == 2) {
          // console.log('===========Bên mua================')
          conditionObj._id = {
            $in: listContractAccess.map((item) => item.buyerInfo),
          }
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

        // PHÂN TRANG KIỂU MỚI
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await ITEM__CONTACT_COLL.findById(lastestID)
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

          conditionObj = dataPagingAndSort?.data?.find
          sortBy = dataPagingAndSort?.data?.sort
        } else {
          let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
            keys,
            latestRecord: null,
            objectQuery: conditionObjOrg,
          })
          sortBy = dataPagingAndSort?.data?.sort
        }

        let infoDataAfterGet = await ITEM__CONTACT_COLL.find(conditionObj)
          .limit(+limit + 1)
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

        let totalRecord = await ITEM__CONTACT_COLL.count(conditionObjOrg)
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
  downloadTemplateImportExcel({ companyID, userID, ctx }) {
    return new Promise(async (resolve) => {
      try {
        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

        let listDepartment = await ITEM__DEPARTMENT_COLL.find({
          company: companyID,
        })
          .select('name')
          .limit(500)
        let listPosition = await ITEM__POSITION_COLL.find({
          company: companyID,
        })
          .select('name')
          .limit(500)
        let listDoctype = await ITEM__DOCTYPE_COLL.find({
          company: companyID,
        })
          .select('name')
          .limit(500)
        let listUser = await USER_COLL.find({ company: companyID })
          .select('fullname')
          .limit(500)
        let listFunda = await ITEM__FUNDA_COLL.find({
          company: companyID,
        })
          .select('name')
          .limit(500)
        let listContract = await ITEM__CONTRACT_COLL.find({
          company: companyID,
        })
          .select('name sign')
          .limit(500)
        let listArea = await ITEM__AREA_COLL.find({ level: 3 })
          .select('name parent')
          .populate({
            path: 'parent',
            select: '_id  name',
            populate: {
              path: 'parent',
              select: '_id  name',
            },
          })

        let listContact = await ITEM__CONTACT_COLL.find({
          company: companyID,
        })
          .limit(1000)
          .populate({
            path: 'funda department position field property contractType workingStatus area area1 area2 sale linkUser',
            select: '_id name fullname parent',
            populate: {
              path: 'parent',
              select: '_id  name',
              populate: {
                path: 'parent',
                select: '_id  name',
              },
            },
          })
          .sort({ _id: -1 })

        // Modify the workbook.
        XlsxPopulate.fromFileAsync(
          path.resolve(
            __dirname,
            '../../../files/templates/excels/contact_import_template.xlsm'
          )
        ).then(async (workbook) => {
          var i = 3
          listContact?.forEach((item, index) => {
            workbook.sheet('Export').row(i).cell(1).value(`${item._id}`)
            workbook
              .sheet('Export')
              .row(i)
              .cell(2)
              .value(
                Number(item.type) >= 1
                  ? CONTACT_CLASSIFY[Number(item.type - 1)].text
                  : ''
              )
            workbook
              .sheet('Export')
              .row(i)
              .cell(3)
              .value(
                Number(item.subtype) >= 1
                  ? HUMAN_CLASSIFY[Number(item.type - 1)].text
                  : ''
              )
            workbook.sheet('Export').row(i).cell(4).value(item.name)
            workbook.sheet('Export').row(i).cell(5).value(item?.sign)
            workbook.sheet('Export').row(i).cell(6).value(item?.description)
            workbook.sheet('Export').row(i).cell(7).value(item?.note)
            workbook.sheet('Export').row(i).cell(8).value(item?.birthday)
            workbook
              .sheet('Export')
              .row(i)
              .cell(9)
              .value(
                Number(item.gender) >= 1
                  ? CONTACT_GENDER[Number(item.gender - 1)].text
                  : ''
              )
            workbook.sheet('Export').row(i).cell(10).value(item?.phone)
            workbook.sheet('Export').row(i).cell(11).value(item?.email)
            workbook.sheet('Export').row(i).cell(12).value(item?.funda?.name)
            workbook
              .sheet('Export')
              .row(i)
              .cell(13)
              .value(item?.department?.name)
            workbook.sheet('Export').row(i).cell(14).value(item?.position?.name)
            workbook.sheet('Export').row(i).cell(15).value(item?.field?.name)
            workbook.sheet('Export').row(i).cell(16).value(item?.property?.name)
            workbook
              .sheet('Export')
              .row(i)
              .cell(17)
              .value(
                Number(item.status) >= 1
                  ? PAYMENT_STATUS[Number(item.status - 1)].text
                  : ''
              )
            workbook.sheet('Export').row(i).cell(18).value(item?.identity)
            workbook.sheet('Export').row(i).cell(19).value(item?.dateProvice)
            workbook.sheet('Export').row(i).cell(20).value(item?.place)
            workbook.sheet('Export').row(i).cell(21).value(item?.taxid)
            workbook
              .sheet('Export')
              .row(i)
              .cell(22)
              .value(item?.insuranceNumber)
            workbook.sheet('Export').row(i).cell(23).value(item?.insuranceSign)
            workbook.sheet('Export').row(i).cell(24).value(item?.insuranceDate)
            workbook.sheet('Export').row(i).cell(25).value(item?.sallaryBasic)
            workbook.sheet('Export').row(i).cell(26).value(item?.insuranceFee)
            workbook
              .sheet('Export')
              .row(i)
              .cell(27)
              .value(
                Number(item.insuranceStatus) >= 1
                  ? INSURANCE_STATUS[Number(item.insuranceStatus - 1)].text
                  : ''
              )
            workbook.sheet('Export').row(i).cell(28).value(item?.bankAccount)
            workbook.sheet('Export').row(i).cell(29).value(item?.signerIn)
            workbook.sheet('Export').row(i).cell(30).value(item?.workStartDate)
            workbook.sheet('Export').row(i).cell(31).value(item?.contractDate)
            workbook.sheet('Export').row(i).cell(32).value(item?.contractValid)
            workbook.sheet('Export').row(i).cell(33).value(item?.contractExpire)
            workbook
              .sheet('Export')
              .row(i)
              .cell(34)
              .value(item?.contractType?.name)
            workbook.sheet('Export').row(i).cell(35).value(item?.contractSign)
            workbook
              .sheet('Export')
              .row(i)
              .cell(36)
              .value(item?.workingStatus?.name)
            workbook.sheet('Export').row(i).cell(37).value(item?.dayOff)
            workbook.sheet('Export').row(i).cell(38).value(item?.signerOut)
            workbook.sheet('Export').row(i).cell(39).value(item?.appointDate)
            workbook
              .sheet('Export')
              .row(i)
              .cell(40)
              .value(item?.changeSallaryDate)
            workbook.sheet('Export').row(i).cell(41).value()
            workbook.sheet('Export').row(i).cell(42).value(item?.graduationYear)
            workbook.sheet('Export').row(i).cell(43).value(item?.address)
            workbook
              .sheet('Export')
              .row(i)
              .cell(44)
              .value(
                item?.area
                  ? `${item?.area?.name},${item?.area?.parent?.name},${item?.area?.parent?.parent?.name}`
                  : ''
              )
            workbook
              .sheet('Export')
              .row(i)
              .cell(45)
              .value(
                item?.area1
                  ? `${item?.area1?.name},${item?.area1?.parent?.name},${item?.area1?.parent?.parent?.name}`
                  : ''
              )
            workbook
              .sheet('Export')
              .row(i)
              .cell(46)
              .value(
                item?.area2
                  ? `${item?.area2?.name},${item?.area2?.parent?.name},${item?.area2?.parent?.parent?.name}`
                  : ''
              )
            workbook.sheet('Export').row(i).cell(47).value(item?.sale?.fullname)
            workbook
              .sheet('Export')
              .row(i)
              .cell(48)
              .value(item?.linkUser?.fullname)
            workbook.sheet('Export').row(i).cell(49).value(item?.family)
            workbook
              .sheet('Export')
              .row(i)
              .cell(50)
              .value(
                Number(item.familyPolicy) >= 1
                  ? CONTACT_POLICY[Number(item.familyPolicy - 1)].text
                  : ''
              )
            workbook
              .sheet('Export')
              .row(i)
              .cell(51)
              .value(
                Number(item.realStatus) >= 1
                  ? PERSONAL_STATUS[Number(item.realStatus - 1)].text
                  : ''
              )
            workbook
              .sheet('Export')
              .row(i)
              .cell(52)
              .value(
                Number(item.new) >= 1
                  ? CONTACT_NEW[Number(item.new - 1)].text
                  : ''
              )
            workbook.sheet('Export').row(i).cell(53).value(item?.joinedDate)

            i++
          })

          var i = 2
          listFunda?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(17).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(18).value(`${item.name}`)
            i++
          })

          var i = 2
          listDepartment?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(19).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(20).value(`${item.name}`)
            i++
          })

          var i = 2
          listPosition?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(21).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(22).value(`${item.name}`)
            i++
          })

          var i = 2
          listDoctype?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(23).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(24).value(`${item.name}`)
            i++
          })

          var i = 2
          listArea?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(25).value(`${item._id}`)
            workbook
              .sheet('DanhMuc')
              .row(i)
              .cell(26)
              .value(
                `${item.name},${item?.parent.name},${item?.parent?.parent.name}`
              )
            i++
          })

          var i = 2
          listUser?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(27).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(28).value(`${item.fullname}`)
            i++
          })

          var i = 2
          listContract?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(29).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(30).value(`${item.name}`)
            i++
          })

          var i = 2
          listContact?.forEach((item, index) => {
            workbook.sheet('DanhMuc').row(i).cell(37).value(`${item._id}`)
            workbook.sheet('DanhMuc').row(i).cell(38).value(`${item.name}`)
            i++
          })

          const now = new Date()
          const filePath = '../../../files/temporary_uploads/'
          const fileName = `template_import_contact_${now.getTime()}.xlsm`
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
   * Name: importFromExcel
   * Code: HiepNH
   * Date: 8/12/2022
   */
  importFromExcel({ option, companyID, dataImport, userID }) {
    console.log({ option, companyID, dataImport, userID })
    return new Promise(async (resolve) => {
      try {
        const dataImportJSON = JSON.parse(dataImport)
        let index = 0
        let errorNumber = 0

        // console.log({_______________:dataImportJSON.length})

        // IMPORT DANH BẠ
        if (option == 1) {
          // let arrPhone = []
          // for (const data of dataImportJSON) {
          //     arrPhone.push(data?.__EMPTY_9)
          // }
          // let listErr =  await ITEM__CONTACT_COLL.find({company: companyID, phone: {$in: arrPhone}}).select('name phone')

          // // Tải báo cáo lỗi
          // if(listErr && listErr.length > 0){
          //     return resolve({ error: false, data: listErr, status: 200 });
          // }else{

          // }

          for (const data of dataImportJSON) {
            // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
            if (index > 0 && index < 51) {
              let prepareData = {
                authorID: userID,
                contactID: data?.__EMPTY,
                type: data?.__EMPTY_83, //
                subtype: data?.__EMPTY_84, //
                name: data?.__EMPTY_3,
                sign: data?.__EMPTY_4,
                description: data?.__EMPTY_5,
                note: data?.__EMPTY_6,
                birthday: data?.__EMPTY_89, //
                gender: data?.__EMPTY_87, //
                phone: data?.__EMPTY_9,
                email: data?.__EMPTY_10,
                fundaID: data?.__EMPTY_101, //
                department: data?.__EMPTY_102,
                position: data?.__EMPTY_103,
                field: data?.__EMPTY_104,
                property: data?.__EMPTY_105,
                status: data?.__EMPTY_88, //
                identity: data?.__EMPTY_17,
                dateProvice: data?.__EMPTY_90, //
                place: data?.__EMPTY_19,
                taxid: data?.__EMPTY_20,
                insuranceNumber: data?.__EMPTY_21,
                insuranceSign: data?.__EMPTY_22,
                insuranceDate: data?.__EMPTY_91, //
                sallaryBasic: data?.__EMPTY_24,
                insuranceFee: data?.__EMPTY_25,
                insuranceStatus: data?.__EMPTY_81, //
                bankAccount: data?.__EMPTY_27,
                signerIn: data?.__EMPTY_28,
                workStartDate: data?.__EMPTY_92, //
                contractDate: data?.__EMPTY_93, //
                contractValid: data?.__EMPTY_94, //
                contractExpire: data?.__EMPTY_95, //
                contractType: data?.__EMPTY_106, //
                contractSign: data?.__EMPTY_34,
                workingStatus: data?.__EMPTY_107, //
                dayOff: data?.__EMPTY_96, //
                signerOut: data?.__EMPTY_37,
                appointDate: data?.__EMPTY_97, //
                changeSallaryDate: data?.__EMPTY_98, //
                graduationYear: data?.__EMPTY_99, //
                address: data?.__EMPTY_42,
                area: data?.__EMPTY_108, //
                area1: data?.__EMPTY_109, //
                area2: data?.__EMPTY_110, //
                saleID: data?.__EMPTY_111, //
                linkUser: data?.__EMPTY_112, //
                family: data?.__EMPTY_48,
                familyPolicy: data?.__EMPTY_82, //
                realStatus: data?.__EMPTY_85, //
                new: data?.__EMPTY_86, //
                joinedDate: data?.__EMPTY_100, //
                dataSource: data?.__EMPTY_53,
              }
              // console.log(prepareData);

              if (data?.__EMPTY && checkObjectIDs(data?.__EMPTY)) {
                let infoAfterInsert = await this.update(prepareData)
                if (infoAfterInsert.error) {
                  errorNumber++
                }
              } else {
                let infoAfterInsert = await this.insert(prepareData)
                if (infoAfterInsert.error) {
                  errorNumber++
                }
              }
            }
            index++
          }
        }

        // IMPORT HỒ SƠ
        else if (option == 2) {
          for (const data of dataImportJSON) {
            // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
            if (index > 0 && index <= 100) {
              let dataInsert = {
                userCreate: userID,
                contactID: data?.__EMPTY_56,
                type: data?.__EMPTY_43,
                fromDate: data?.__EMPTY_46,
                toDate: data?.__EMPTY_47,
                workplace: data?.__EMPTY_6,
                reference: data?.__EMPTY_7,
                currentArea3: data?.__EMPTY_49,
                item: data?.__EMPTY_9,
                project: data?.__EMPTY_10,
                client: data?.__EMPTY_11,
                position2: data?.__EMPTY_50,
                contract: data?.__EMPTY_51,
                name: data?.__EMPTY_14,
                sign: data?.__EMPTY_15,
                place: data?.__EMPTY_16,
                note: data?.__EMPTY_19,
                description: data?.__EMPTY_18,
                number: data?.__EMPTY_26,
                store: data?.__EMPTY_28,
                status: data?.__EMPTY_45,
                field2: data?.__EMPTY_52,
                educationalBackground2: data?.__EMPTY_53,
                certificateType: data?.__EMPTY_54,
                certificateName: data?.__EMPTY_55,
                certificateGrade: data?.__EMPTY_44,
              }
              // console.log(dataInsert);

              let infoAfterInsert =
                await CONTACT_DOCUMENT_MODEL.insert(dataInsert)
              if (infoAfterInsert.error) {
                errorNumber++
              }
            }
            index++
          }
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

  exportExcel({ userID, companyID, type, filterParams, ctx, queue }) {
    return new Promise(async (resolve) => {
      try {
        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

        let conditionObj = {}
        let resultGetList = { error: true }

        switch (type) {
          case '1':
            resultGetList = await this.getListByFilter({
              ...filterParams,
              type: 1,
              userID,
              companyID,
              isExportExcel: true,
            })
            break
          case '2':
            resultGetList = await this.getList({
              ...filterParams,
              type: 1,
              userID,
              companyID,
              isExportExcel: true,
            })
            break
          default:
            resultGetList = await this.getListByFilter({
              ...filterParams,
              type: 1,
              userID,
              companyID,
              isExportExcel: true,
            })
            break
        }

        if (!resultGetList.error) {
          conditionObj = resultGetList.data
        }

        await queue.add(
          'export_excel',
          {
            filterCondition: conditionObj,
            userID,
          },
          {
            backoff: 3,
            attempts: 3,
          }
        )

        return resolve({ error: false })

        // let keys	     = ['createAt__-1', '_id__-1'];
        // let dataPagingAndSort = await RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObj });
        // let sortBy            = dataPagingAndSort?.data?.sort;
        // const listData = await ITEM__CONTACT_COLL
        //     .find(conditionObj)
        //     .populate({
        //         path: 'department position field property area area1 area2 linkUser workingStatus contractType',
        //         select: 'name sign',
        //         populate:{
        //             path: 'parent',
        //             select: 'name',
        //             populate:{
        //                 path: 'parent',
        //                 select: 'name',
        //             }
        //         }
        //     })
        //     .sort(sortBy)
        //     .limit(500)
        //     .lean();

        // if(!listData) {
        //     return resolve({
        //         error: true,
        //         message: 'Không tìm thấy dữ liệu',
        //         keyError: 'data_not_exists',
        //         status: 400
        //     });
        // }

        // const result = await this.downloadExcelFile(listData)
        // return resolve(result);
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

  exportExcelByFilter({ userID, companyID, filterParams, ctx }) {
    return new Promise(async (resolve) => {
      try {
        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

        const populates = JSON.stringify({
          path: 'department position field property area area1 area2 linkUser workingStatus contractType',
          select: 'name sign',
          populate: {
            path: 'parent',
            select: 'name',
            populate: {
              path: 'parent',
              select: 'name',
            },
          },
        })

        const { data, error } = await this.getListByFilter({
          ...filterParams,
          populates,
          type: 1,
          userID,
          companyID,
          isExportExcel: false,
          ctx,
        })

        if (error || !data?.listRecords?.length) {
          return resolve({ data, error })
        }

        const result = await this.downloadExcelFile(data.listRecords)
        return resolve(result)
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

  downloadExcelFile(data) {
    return new Promise((resolve) => {
      XlsxPopulate.fromFileAsync(
        path.resolve(
          __dirname,
          '../../../files/templates/excels/contact_export.xlsx'
        )
      ).then(async (workbook) => {
        let i = 3
        data?.forEach((item, index) => {
          workbook
            .sheet('NhanSu')
            .row(i)
            .cell(1)
            .value(Number(index + 1))
          workbook.sheet('NhanSu').row(i).cell(2).value(item.name)
          workbook.sheet('NhanSu').row(i).cell(3).value(item?.department?.name)
          workbook.sheet('NhanSu').row(i).cell(4).value(item?.position?.name)
          workbook.sheet('NhanSu').row(i).cell(5).value(item.birthday)
          workbook
            .sheet('NhanSu')
            .row(i)
            .cell(6)
            .value(
              item.gender > 1
                ? `${CONTACT_GENDER[Number(item.gender) - 1].text}`
                : ''
            )
          workbook.sheet('NhanSu').row(i).cell(7).value(item.phone)
          workbook.sheet('NhanSu').row(i).cell(8).value(item.email)
          workbook.sheet('NhanSu').row(i).cell(9).value(item.identity)
          workbook.sheet('NhanSu').row(i).cell(10).value(item.dateProvice)
          workbook.sheet('NhanSu').row(i).cell(11).value(item.place)
          workbook
            .sheet('NhanSu')
            .row(i)
            .cell(12)
            .value(
              item?.area2 != null && item?.area2 != undefined
                ? `${item?.area2?.name}, ${item?.area2?.parent?.name}, ${item?.area2?.parent?.parent?.name}`
                : ''
            )
          workbook
            .sheet('NhanSu')
            .row(i)
            .cell(13)
            .value(
              item?.area != null && item?.area != undefined
                ? `${item.address},${item?.area?.name}, ${item?.area?.parent?.name}, ${item?.area?.parent?.parent?.name}`
                : ''
            )
          workbook.sheet('NhanSu').row(i).cell(14).value(item.taxid)
          workbook
            .sheet('NhanSu')
            .row(i)
            .cell(15)
            .value(
              !isNaN(item.insuranceNumber) && item.insuranceNumber != 0
                ? Number(item.insuranceNumber)
                : 0
            )
          workbook.sheet('NhanSu').row(i).cell(16).value(item.insuranceSign)
          workbook.sheet('NhanSu').row(i).cell(17).value(item.insuranceDate)
          workbook
            .sheet('NhanSu')
            .row(i)
            .cell(18)
            .value(
              !isNaN(item.sallaryBasic) && item.sallaryBasic != 0
                ? Number(item.sallaryBasic)
                : 0
            )
          workbook.sheet('NhanSu').row(i).cell(19).value(item.bankAccount)
          workbook.sheet('NhanSu').row(i).cell(20).value(item.signerIn)
          workbook.sheet('NhanSu').row(i).cell(21).value(item.workStartDate)
          workbook.sheet('NhanSu').row(i).cell(22).value(item.contractDate)
          workbook
            .sheet('NhanSu')
            .row(i)
            .cell(23)
            .value(item?.contractType?.name)
          workbook.sheet('NhanSu').row(i).cell(24).value(item.dayOff)
          workbook.sheet('NhanSu').row(i).cell(25).value(item.note)
          i++
        })

        const now = new Date()
        const filePath = '../../../files/temporary_uploads/'
        const fileName = `contact_export_${now.getTime()}.xlsx`
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
    })
  }
}

exports.MODEL = new Model()
