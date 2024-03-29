'use strict'
const BaseModel = require('../../../tools/db/base_model')
const ObjectID = require('mongoose').Types.ObjectId

const AUTH__USER_COLL = require('../database/auth.user-coll')
const AUTH__COMPANY_COLL = require('../database/auth.company-coll')

/**
 * import util files
 */
const {
  randomStringFixLengthCode,
} = require('../../../tools/utils/string_utils')
const { hash, compare } = require('../../../tools/bcrypt')
const { sign, verify } = require('../../../tools/jwt')
const sendEmailRecoverPass = require('../../../tools/mailer/mailer')
const {
  templateRecoverPass,
} = require('../../../tools/mailer/module/template/recover-pass')
const {
  templateInfoAccount,
} = require('../../../tools/mailer/module/template/content_info_account')
const {
  RANGE_BASE_PAGINATION,
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const {
  checkObjectIDs,
  checkNumberIsValidWithRange,
  IsJsonString,
} = require('../../../tools/utils/utils')
const {
  PLATFORM_TRIXGO,
  PLATFORM_WYNDIX,
  PLATFORM_FNB,
  LEVEL_USER_OWNER,
  LEVEL_USER_EMPLOYEE,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_BLOCK,
} = require('../helper/auth.keys-constant')
const { JWT_SECRET_KEY } = require('../../../tools/jwt/cf_jwt')

const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')
const {
  CF_ACTIONS_CHATTING,
} = require('../../chatting/helper/chatting.actions-constant')

const TIMESHEET__EXPERT_TIMESHEET_COLL = require('../../timesheet/database/timesheet.expert_timesheet-coll')
const TIMESHEET__EXPERT_SALARY_COLL = require('../../timesheet/database/timesheet.expert_salary-coll')
class Model extends BaseModel {
  constructor() {
    super(require('../database/auth.user-coll'))
  }

  register({ email, fullname, level, companyID, platform }) {
    return new Promise(async (resolve) => {
      try {
        let emailValid = email.toLowerCase().trim()
        let objectExitsUser = {}

        let listPlatformValid = [PLATFORM_TRIXGO, PLATFORM_WYNDIX, PLATFORM_FNB]
        let listLevelValid = [LEVEL_USER_OWNER, LEVEL_USER_EMPLOYEE]

        if (!email || email == '')
          return resolve({ error: true, message: 'mail_invalid' })

        if (!checkObjectIDs(companyID))
          return resolve({ error: true, message: 'compnay_invalid' })

        if (
          !checkNumberIsValidWithRange({
            arrValid: listPlatformValid,
            val: platform,
          })
        )
          return resolve({ error: true, message: 'platform_invalid' })

        if (
          !checkNumberIsValidWithRange({
            arrValid: listLevelValid,
            val: level,
          })
        )
          return resolve({ error: true, message: 'level_invalid' })

        //________KIỂM TRA XEM EMAIL ĐÃ TỒN TẠI HAY CHƯA
        objectExitsUser.$or = []
        if (email && email != '') {
          objectExitsUser.$or.push({ email: emailValid })
        }

        let isExistUser = await AUTH__USER_COLL.findOne(objectExitsUser)
        if (isExistUser)
          return resolve({
            error: true,
            message: 'email_exists_or_username_exits',
          })

        let password = randomStringFixLengthCode(6)
        let hashPassword = await hash(password, 8)
        if (!hashPassword)
          return resolve({
            error: true,
            message: 'cannot_hash_password',
          })

        // Lấy thông tin công ty để gán ký hiệu công ty
        let infoCompany = await AUTH__COMPANY_COLL.findById(companyID)

        let dataInsert = {
          email: emailValid,
          password: hashPassword,
          company: companyID,
          platform,
        }
        if (fullname) {
          dataInsert.fullname = `${fullname}-${infoCompany.sign}`
          dataInsert.bizfullname = `${fullname}-${infoCompany.sign}`
        }

        if (Number(level) == 0 || Number(level) == 1) {
          dataInsert.level = Number(level)
        }

        let infoUserAfterInsert = await this.insertData(dataInsert)
        if (!infoUserAfterInsert)
          return resolve({
            error: true,
            message: 'cannot_insert_data',
          })

        return resolve({
          error: false,
          data: infoUserAfterInsert,
          pwd: password,
          exists: true,
        })
      } catch (error) {
        resolve({ error: true, message: error.message })
      }
    })
  }

  // implement by: KHANHNEY
  login({ email, password, platform }) {
    return new Promise(async (resolve) => {
      try {
        let emailValid = email.toLowerCase().trim()

        let isExist = await AUTH__USER_COLL.findOne({
          email: emailValid,
        }).populate({
          path: 'company department contacts',
          select: '_id name sign image debt',
        })

        if (!isExist) {
          return resolve({
            error: true,
            message: 'Email không tồn tại',
            keyError: 'email_not_exists',
            status: 400,
          })
        }

        const isMatchPass = await compare(password, isExist.password)
        if (!isMatchPass) {
          return resolve({
            error: true,
            message: 'Mật khẩu không trùng khớp',
            keyError: 'password_not_match',
            status: 400,
          })
        }

        if (isExist.status == STATUS_BLOCK) {
          return resolve({
            error: true,
            message: 'Tài khoản của bạn đã bị khóa',
            keyError: 'account_is_blocked',
            status: 403,
          })
        }

        if (isExist.status == STATUS_INACTIVE) {
          return resolve({
            error: true,
            message: 'Tài khoản của bạn chưa được kích hoạt',
            keyError: 'account_is_not_active',
            status: 403,
          })
        }

        let newExist = {
          username: isExist.username,
          email: isExist.email,
          phone: isExist.phone,
          name: isExist.name,
          fullname: isExist.fullname,
          bizfullname: isExist.bizfullname,
          company: isExist.company,
          department: isExist.department,
          contacts: isExist.contacts,
          image: isExist.image,
          signature: isExist.signature,
          status: isExist.status,
          level: isExist.level,
          lang: isExist.lang,
          groupDefault: isExist.groupDefault,
          _id: isExist._id,
        }

        const token = await sign({ infoUser: newExist }, JWT_SECRET_KEY)

        // update lastLog of user
        await AUTH__USER_COLL.findOneAndUpdate(
          { email: emailValid },
          {
            lastLog: new Date(),
          }
        )
        // Xóa những trường không cần thiết
        // delete isExist._doc.friends;
        // delete isExist._doc.password;
        // delete isExist._doc.recentlyFriends;
        // delete isExist._doc.devices;
        // delete isExist._doc.updatedAt;
        // delete isExist._doc.modifyAt;
        // delete isExist._doc.createAt;

        return resolve({
          error: false,
          data: { user: newExist, token },
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
   * Author: MinhVH
   * Func: Quên mật khẩu
   * Date: 10/10/2022
   */
  recoverPassword({ email }) {
    return new Promise(async (resolve) => {
      try {
        const emailValid = email.toLowerCase().trim()

        /**
         * set code (random 6 character)
         * => send mail with code
         * => enter code match => enter new password(not enter oldpass)
         */
        const checkExist = await AUTH__USER_COLL.findOne({
          email: emailValid,
        }).lean()
        if (!checkExist) {
          return resolve({
            error: true,
            message: 'Email không tồn tại',
            keyError: 'email_not_exists',
            status: 404,
          })
        }

        const codeReset = Math.floor(100000 + Math.random() * 900000)

        const infoAfterUpdateCode = await AUTH__USER_COLL.findByIdAndUpdate(
          checkExist._id,
          {
            codeReset,
          },
          { new: true }
        )

        if (!infoAfterUpdateCode) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        const mailContent = templateRecoverPass(checkExist.fullname, codeReset)
        sendEmailRecoverPass(
          email,
          'CODE XÁC NHẬN MẬT KHẨU/CONFIRM PASSWORD - TRIXGO.COM',
          mailContent,
          (cb) => {
            console.log(cb)
          }
        )

        return resolve({
          error: false,
          data: { codeReset },
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

  checkOTPRecoverPassword({ email, codeReset }) {
    return new Promise(async (resolve) => {
      try {
        const checkMatchExact = await AUTH__USER_COLL.findOne({
          email: email.toLowerCase().trim(),
          codeReset,
        })
        if (!checkMatchExact) {
          return resolve({
            error: true,
            message: 'OTP không trùng khớp',
            keyError: 'otp_not_match',
            status: 400,
          })
        }

        return resolve({
          error: false,
          message: 'Code OTP is matched',
          status: 200,
        })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  updatePasswordRecover({ email, newPassword }) {
    return new Promise(async (resolve) => {
      try {
        const isExist = await AUTH__USER_COLL.findOne({
          email: email.toLowerCase().trim(),
        })
        if (!isExist) {
          return resolve({
            error: true,
            message: 'Email không tồn tại',
            keyError: 'email_not_exists',
            status: 400,
          })
        }

        const newPassHash = await hash(newPassword, 8)
        const updatePass = await AUTH__USER_COLL.findOneAndUpdate(
          {
            email: email.toLowerCase().trim(),
          },
          {
            password: newPassHash,
            codeReset: '',
          },
          { new: true }
        )

        if (!updatePass) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }

        return resolve({ error: false, data: updatePass })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  // implement by: KHANHNEY
  updateDeviceLogin({
    userID,
    platform,
    deviceID,
    deviceName,
    registrationID,
    oneSignalID,
    isRemove,
    env,
  }) {
    return new Promise(async (resolve) => {
      try {
        // console.log('====== updateDeviceLogin =========');
        // console.log({
        //     userID, platform, deviceID, deviceName, registrationID, oneSignalID, isRemove, env
        // })
        let listPlatformValid = [PLATFORM_TRIXGO, PLATFORM_WYNDIX, PLATFORM_FNB]

        if (
          !checkNumberIsValidWithRange({
            arrValid: listPlatformValid,
            val: platform,
          })
        ) {
          return resolve({
            error: true,
            message: 'Tham số platform không hợp lệ',
            keyError: 'params_platform_invalid',
            status: 400,
          })
        }

        if (!checkObjectIDs([userID])) {
          return resolve({
            error: true,
            message: 'Tham số userID không hợp lệ',
            keyError: 'params_userID_invalid',
            status: 400,
          })
        }

        let isExist = await AUTH__USER_COLL.findById(userID)
        if (!isExist) {
          return resolve({
            error: true,
            message: 'Người dùng không tồn tại',
            keyError: 'user_not_exists',
            status: 400,
          })
        }

        /**
         * UPDATE LAST DEVICE (cập nhật device cuối cùng login)
         * Nếu DeviceID tồn tại => cập nhật deviceName + fcm_token
         */
        let devices = isExist.devices
        let newDevices = []

        let itemNewDevice = {
          deviceName,
          deviceID,
          registrationID,
          oneSignalID,
          env,
        }
        if (devices.length) {
          devices.forEach((device) => {
            let _device = device
            if (device.deviceID == itemNewDevice.deviceID) {
              _device = {
                deviceID: device.deviceID,
                deviceName: device.deviceName,
                registrationID: registrationID,
                oneSignalID: oneSignalID,
                /**
                 * vì mobile có 2 loại app khác nhau
                 *  1/ CBS
                 *      - WEB CBS
                 *      - APP CBS
                 *      - WEB TEASER
                 *  2/ Teaser
                 *      - APP Teaser
                 */
                env,
              }
            }
            newDevices.push(_device)
          })

          if (
            !newDevices.find((item) => item.deviceID === itemNewDevice.deviceID)
          )
            newDevices.push(itemNewDevice)
        } else {
          newDevices = [itemNewDevice]
        }

        if (isRemove) {
          newDevices = newDevices.filter(
            (device) =>
              device.deviceID !== itemNewDevice.deviceID &&
              device.deviceName !== itemNewDevice.deviceName &&
              device.registrationID !== itemNewDevice.registrationID &&
              device.oneSignalID !== itemNewDevice.oneSignalID &&
              device.env !== itemNewDevice.env
          )
        }

        let infoAfterUpdateWithRegistration =
          await AUTH__USER_COLL.findByIdAndUpdate(
            userID,
            {
              devices: newDevices,
              modifyAt: Date.now(),
              lastLog: Date.now(),
            },
            { new: true }
          )

        return resolve({
          error: false,
          data: infoAfterUpdateWithRegistration,
        })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  // implement by: MINHVH
  getListFriend({ userID, lastestID, keyword, limit = 10, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            status: 400,
          })

        if (isNaN(limit) || +limit > 20) {
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

        let infoUserWithFriends =
          await AUTH__USER_COLL.findById(userID).select('friends')

        let conditionObj = { _id: { $in: infoUserWithFriends.friends } }
        let conditionFind = {}
        let sortBy = {
          createAt: -1,
          modifyAt: -1,
        }

        // GET CONDITION PAGINATION
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoUser = await AUTH__USER_COLL.findById(lastestID)
          if (!infoUser)
            return resolve({
              error: true,
              message: "Can't get info last user friend",
              status: 403,
            })

          let nextInfo = `${infoUser.createAt}_${infoUser._id}`
          let keys = ['createAt__-1', '_id__-1']

          let dataPagingAndSort = await RANGE_BASE_PAGINATION({
            nextInfo,
            keys,
          })
          if (!dataPagingAndSort || dataPagingAndSort.error)
            return resolve({
              error: true,
              message: "Can't get range pagination",
              status: 403,
            })

          conditionFind = dataPagingAndSort.data.find
        }

        // SEARCH TEXT
        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          conditionObj.bizfullname = new RegExp(keyword, 'i')
        }

        const listFriends = await AUTH__USER_COLL.find({
          ...conditionObj,
          ...conditionFind,
        })
          .select(select)
          .limit(limit + 1)
          // .populate(populates)
          .sort(sortBy)
          .lean()

        // GET TOTAL RECORD
        let totalRecord = await AUTH__USER_COLL.count(conditionObj)
        let totalPage = Math.ceil(totalRecord / limit)
        let nextCursor = null

        if (listFriends && listFriends.length) {
          if (listFriends.length > limit) {
            nextCursor = listFriends[limit - 1]._id
            listFriends.length = limit
          }
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listFriends,
            limit,
            totalRecord,
            totalPage,
            nextCursor,
          },
        })
      } catch (error) {
        console.error(error)
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }

  // implement by: MINHVH
  getListUser({
    userID,
    lastestID,
    departmentID,
    keyword,
    limit = 10,
    filter = {},
    select = {},
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            status: 400,
          })

        if (departmentID && !checkObjectIDs(departmentID))
          return resolve({
            error: true,
            message: 'Request params departmentID invalid',
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

        let conditionObj = {}
        let conditionFind = {}
        let objSort = {}
        let sortBy = {
          modifyAt: -1,
          createAt: -1,
        }

        // GET CONDITION PAGINATION
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoUser = await AUTH__USER_COLL.findById(lastestID)
          if (!infoUser)
            return resolve({
              error: true,
              message: "Can't get info last user",
              status: 403,
            })

          let nextInfo = `${infoUser.createAt}_${infoUser._id}`
          let keys = ['createAt__-1', '_id__-1']

          let dataPagingAndSort = await RANGE_BASE_PAGINATION({
            nextInfo,
            keys,
          })
          if (!dataPagingAndSort || dataPagingAndSort.error)
            return resolve({
              error: true,
              message: "Can't get range pagination",
              status: 403,
            })

          conditionFind = dataPagingAndSort.data.find
        }

        departmentID && (conditionObj.department = departmentID)

        // SEARCH TEXT
        if (keyword) {
          conditionObj.$text = { $search: keyword }
          objSort.score = { $meta: 'textScore' }
          sortBy.score = { $meta: 'textScore' }
        }

        let listUsers = await AUTH__USER_COLL.find(
          { ...conditionObj, ...conditionFind },
          { ...objSort, ...filter }
        )
          .populate('company', select.company)
          .populate('department', select.department)
          .limit(+limit + 1)
          .sort(sortBy)
          .lean()

        // GET TOTAL RECORD
        let totalRecord = await AUTH__USER_COLL.count(conditionObj)
        let nextCursor = null

        if (listUsers && listUsers.length) {
          if (listUsers.length > limit) {
            nextCursor = listUsers[limit - 1]._id
            listUsers.length = limit
          }
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listUsers,
            limit,
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

  getListUsersForPushMobile({ users }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(users))
          return resolve({
            error: true,
            message: 'Request params users invalid',
            status: 400,
          })

        let userIDConvert = Array.isArray(users) ? users : [users]

        let listUsers = await AUTH__USER_COLL.find(
          {
            _id: {
              $in: userIDConvert,
            },
          },
          {
            _id: 1,
            fullname: 1,
            devices: 1,
          }
        ).lean()

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listUsers,
          },
        })
      } catch (error) {
        console.info('getListUsersForPushMobile')
        console.error(error)
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }

  // implement by: KHANHNEY
  getInfo({ userID, filter, select }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID))
          return resolve({ error: true, message: 'userID_invalid' })

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

        let infoUser = await AUTH__USER_COLL.findById(userID, {
          ...filter,
          password: 0,
        })
          .populate('company', select.company)
          .populate('department', select.department)
          .populate('position', select.position)
          .lean()

        return resolve({ error: false, data: infoUser })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  // implement by: MINHVH
  getInfoById({ userID, select }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
          })

        let infoUser = await AUTH__USER_COLL.findById(userID)
          .select(select)
          .lean()

        return resolve({ error: false, data: infoUser })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  // implement by: MINHVH
  getListUserWithCondition({ condition, select, filter = {} }) {
    return new Promise(async (resolve) => {
      try {
        if (filter && typeof filter === 'string') {
          if (!IsJsonString(filter))
            return resolve({
              error: true,
              message: 'Request params filter invalid',
              status: 400,
            })

          filter = JSON.parse(filter)
        }

        const listUsers = await AUTH__USER_COLL.find(condition, filter)
          .select(select)
          .lean()

        return resolve({ error: false, data: listUsers })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  resolveToken({ token }) {
    return new Promise(async (resolve) => {
      try {
        if (!token || token == '')
          return resolve({ error: true, message: 'token_invalid' })

        let decoded = await verify(token, JWT_SECRET_KEY)

        if (!decoded)
          return resolve({ error: true, message: 'token_not_valid' })

        const {
          infoUser: { _id: userIDAfterDecoded },
        } = decoded

        if (!userIDAfterDecoded)
          return resolve({ error: true, message: 'token_not_valid' })

        let infoUserDB = await AUTH__USER_COLL.findOne({
          status: STATUS_ACTIVE,
          _id: userIDAfterDecoded,
        })

        if (!infoUserDB)
          return resolve({ error: true, message: 'token_not_valid' })

        return resolve({ error: false, data: decoded })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  searchWithFullText({ fullnameKey }) {
    return new Promise(async (resolve) => {
      try {
        let listUsers = await AUTH__USER_COLL.find(
          { $text: { $search: fullnameKey } },
          { score: { $meta: 'textScore' } }
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(10)
          .select('fullname')

        return resolve({ error: false, data: listUsers })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Cập nhật pin cuộc hội thoại
   * Date: 10/08/2021
   */
  updatePinConversation({ conversationID, userID, isPin }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([conversationID, userID]))
          return resolve({
            error: true,
            message: 'Request params invalid',
            status: 400,
          })

        let infoUser = await AUTH__USER_COLL.findById(userID)
        if (!infoUser)
          return resolve({
            error: true,
            message: 'User is not exist',
            status: 403,
          })

        let infoUserAfterUpdated = null

        if (isPin) {
          // Pin cuộc hội thoại

          if (infoUser.conversationsPin.includes(conversationID))
            return resolve({
              error: true,
              message: 'Conversation is pined',
              status: 400,
            })

          // Pin tối đa 5 cuộc hội thoại (pull last, push first)
          if (infoUser.conversationsPin.length >= 5) {
            infoUserAfterUpdated = await AUTH__USER_COLL.findByIdAndUpdate(
              userID,
              {
                $push: {
                  conversationsPin: {
                    $each: [conversationID],
                    $position: 0,
                    $slice: 5,
                  },
                },
              },
              { new: true }
            )
          } else {
            infoUserAfterUpdated = await AUTH__USER_COLL.findByIdAndUpdate(
              userID,
              {
                $push: {
                  conversationsPin: {
                    $each: [conversationID],
                    $position: 0,
                  },
                },
              },
              { new: true }
            )
          }
        } else {
          // Bỏ Pin cuộc hội thoại
          infoUserAfterUpdated = await AUTH__USER_COLL.findByIdAndUpdate(
            userID,
            {
              $pull: { conversationsPin: conversationID },
            },
            { new: true }
          )
        }

        if (!infoUserAfterUpdated)
          return resolve({
            error: true,
            message: "Can't update pin conversation",
            status: 403,
          })

        return resolve({
          error: false,
          data: infoUserAfterUpdated,
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
   * Func: Danh sách pin cuộc hội thoại
   * Date: 06/09/2021
   */
  getListPinConversation({ userID }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([userID]))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            status: 400,
          })

        let infoUser = await AUTH__USER_COLL.findById(userID)
          .select('conversationsPin')
          .lean()

        if (!infoUser)
          return resolve({
            error: true,
            message: 'User is not exist',
            status: 403,
          })

        return resolve({
          error: false,
          data: infoUser.conversationsPin,
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
   * Func: Cập nhật pin cuộc hội thoại
   * Date: 10/08/2021
   */
  updatePinMedia({ mediaID, userID, isPin }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([mediaID, userID])) {
          return resolve({
            error: true,
            message: 'Tham số mediaID hoặc userID không hợp lệ',
            keyError: 'params_mediaID_or_userID_invalid',
            status: 400,
          })
        }

        let infoUser = await AUTH__USER_COLL.findById(userID)
        if (!infoUser) {
          return resolve({
            error: true,
            message: 'Người dùng không tồn tại',
            keyError: 'user_not_exists',
            status: 400,
          })
        }

        let infoUserAfterUpdated = null

        if (isPin) {
          // Pin media

          if (infoUser.mediasPin.includes(mediaID)) {
            return resolve({
              error: true,
              message: 'Bài viết đã được pin',
              keyError: 'media_is_pined',
              status: 400,
            })
          }

          // Pin tối đa 5 media (pull last, push first)
          if (infoUser.mediasPin.length >= 5) {
            infoUserAfterUpdated = await AUTH__USER_COLL.findByIdAndUpdate(
              userID,
              {
                $push: {
                  mediasPin: {
                    $each: [mediaID],
                    $position: 0,
                    $slice: 5,
                  },
                },
              },
              { new: true }
            )
          } else {
            infoUserAfterUpdated = await AUTH__USER_COLL.findByIdAndUpdate(
              userID,
              {
                $push: {
                  mediasPin: {
                    $each: [mediaID],
                    $position: 0,
                  },
                },
              },
              { new: true }
            )
          }
        } else {
          // Bỏ Pin media
          infoUserAfterUpdated = await AUTH__USER_COLL.findByIdAndUpdate(
            userID,
            {
              $pull: { mediasPin: mediaID },
            },
            { new: true }
          )
        }

        if (!infoUserAfterUpdated) {
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
          message: 'success',
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
   * Func: Danh sách pin media
   * Date: 29/12/2021
   */
  getListPinMedia({ userID }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([userID])) {
          return resolve({
            error: true,
            message: 'Tham số userID không hợp lệ',
            keyError: 'params_userID_invalid',
            status: 400,
          })
        }

        let infoUser = await AUTH__USER_COLL.findById(userID)
          .select('mediasPin')
          .lean()

        if (!infoUser) {
          return resolve({
            error: true,
            message: 'Người dùng không tồn tại',
            keyError: 'user_not_exists',
            status: 400,
          })
        }

        return resolve({
          error: false,
          data: infoUser.mediasPin,
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
   * Func: Hàm tạo mới user
   * Date: 03/03/2022
   */
  insert({
    email,
    fullname,
    level,
    departmentID,
    positionID,
    companyID,
    phone,
    birthDay,
    storageUse,
    userID,
  }) {
    // console.log('====================>>>>>>>>>>>>>>>>>>>>')
    // console.log({ email, fullname, level, departmentID, positionID, companyID, phone, storageUse, userID })
    return new Promise(async (resolve) => {
      try {
        if (!email || !fullname) {
          return resolve({
            error: true,
            message: 'Tham số email và fullname không hợp lệ',
            keyError: 'params_email_or_fullname_invalid',
            status: 400,
          })
        }

        if (!companyID || !checkObjectIDs([companyID])) {
          return resolve({
            error: true,
            message: 'Tham số companyID không hợp lệ',
            keyError: 'params_companyID_invalid',
            status: 400,
          })
        }

        let emailValid = email.toLowerCase().trim()
        let password = randomStringFixLengthCode(6)

        // Nếu username hay email đã tồn tại trong hệ thống thì không cho phép tạo : đảm bảo tính độc lập dữ liệu
        let isExistUser = await AUTH__USER_COLL.findOne({
          email: emailValid,
        })

        //________KIỂM TRA XEM EMAIL ĐÃ TỒN TẠI HAY CHƯA
        if (isExistUser) {
          return resolve({
            error: true,
            message: 'Email đã tồn tại',
            keyError: 'email_is_exists',
            status: 400,
          })
        }

        let hashPassword = await hash(password, 8)
        if (!hashPassword) {
          return resolve({
            error: true,
            message: 'Không thể hash password',
            keyError: 'can_not_hash_password',
            status: 400,
          })
        }

        let dataInsert = {
          userCreate: userID,
          email: emailValid,
          fullname,
          password: hashPassword,
          company: companyID,
        }

        if (fullname) {
          dataInsert.bizfullname = fullname
        }

        if (departmentID && checkObjectIDs([departmentID])) {
          dataInsert.department = departmentID
        }

        if (positionID && checkObjectIDs([positionID])) {
          dataInsert.position = positionID
        }

        if (phone) {
          dataInsert.phone = phone
        }

        if (birthDay) {
          dataInsert.birthDay = birthDay
        }

        if (storageUse) {
          dataInsert.storageUse = storageUse
        }

        if (Number(level) === 0 || Number(level) === 1) {
          dataInsert.level = +level
        }

        let infoUserAfterInsert = await this.insertData(dataInsert)
        if (!infoUserAfterInsert) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyError: 'error_occurred',
            status: 422,
          })
        }
        delete infoUserAfterInsert.password

        // Thông báo email tới người dùng
        const mailContent = templateInfoAccount(fullname, password)
        sendEmailRecoverPass(
          emailValid,
          'THÔNG TIN TÀI KHOẢN/ACCOUNT INFO - TRIXGO.COM',
          mailContent,
          (cb) => {
            console.log(cb)
          }
        )

        return resolve({
          error: false,
          data: infoUserAfterInsert,
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
   * Func: Hàm cập nhật thông tin
   * Date: 14/01/2022
   */
  update({
    userID,
    resetPass,
    currentPass,
    newPass,
    email,
    phone,
    birthDay,
    gender,
    lang,
    image,
    signature,
    level,
    fullname,
    status,
    groupDefault,
    companyID,
    departmentID,
    positionID,
    storageUse,
    ctx,
  }) {
    console.log('====================>>>>>>>>>>>>>>>>>>>>')
    console.log({
      userID,
      resetPass,
      currentPass,
      newPass,
      email,
      phone,
      birthDay,
      gender,
      lang,
      image,
      signature,
      level,
      fullname,
      status,
      groupDefault,
      companyID,
      departmentID,
      positionID,
      storageUse,
    })
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(userID)) {
          return resolve({
            error: true,
            message: 'UserID không hợp lệ',
            keyError: 'param_not_valid',
          })
        }

        let infoUser = await AUTH__USER_COLL.findById(userID)
        if (!infoUser) {
          return resolve({
            error: true,
            message: 'Người dùng không tồn tại',
            keyError: 'user_not_exists',
          })
        }

        let dataUpdate = { userUpdate: userID }
        // Cập nhật mật khẩu
        if (currentPass && newPass) {
          let checkCurrentPass = await compare(currentPass, infoUser.password)
          if (!checkCurrentPass)
            return resolve({
              error: true,
              message: 'Mật khẩu cũ không đúng',
              keyError: 'current_password_faild',
            })

          let hashpass = await hash(newPass, 8)
          dataUpdate.password = hashpass
        }

        // resetPass
        if (resetPass && resetPass.toString().length >= 6) {
          // console.log(resetPass.toString().length)
          let hashpass = await hash(resetPass, 8)
          dataUpdate.password = hashpass
        }

        // Cập nhật thông tin tài khoản
        if (email && email !== infoUser.email) {
          dataUpdate.email = email
        }

        if (fullname) {
          dataUpdate.fullname = fullname
          dataUpdate.bizfullname = fullname
        }

        if (phone) {
          dataUpdate.phone = phone
        }

        if (birthDay) {
          dataUpdate.birthDay = birthDay
        }

        if (gender) {
          dataUpdate.gender = gender
        }

        if (lang && ['vn', 'en', 'ja'].includes(lang.toString())) {
          dataUpdate.lang = lang
        }

        if (image) {
          dataUpdate.image = image
        }

        if (signature) {
          dataUpdate.signature = signature
        }

        if ([0, 1].includes(level)) {
          dataUpdate.level = level
        }

        if ([0, 1].includes(status)) {
          dataUpdate.status = status
        }

        if (companyID) {
          dataUpdate.company = companyID
        }

        if (departmentID) {
          dataUpdate.department = departmentID
        }

        if (positionID) {
          dataUpdate.position = positionID
        }

        if (checkObjectIDs(groupDefault)) {
          dataUpdate.groupDefault = groupDefault
        }

        if (storageUse) {
          dataUpdate.storageUse = storageUse
        }

        let infoUserAfterUpdate = await AUTH__USER_COLL.findByIdAndUpdate(
          userID,
          dataUpdate,
          { new: true }
        )
        if (!infoUserAfterUpdate)
          return resolve({
            error: false,
            message: 'Cập nhật thất bại',
            keyError: 'cannot_update',
          })

        if (fullname) {
          await ctx.call(
            `${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_MEMBER_NAME}`,
            {
              userID,
              bizfullname: dataUpdate.bizfullname,
            }
          )
        }

        delete infoUserAfterUpdate.password

        // Cập nhật thông tin trong chấm công và bảng lương
        await TIMESHEET__EXPERT_TIMESHEET_COLL.updateMany(
          { assignee: infoUserAfterUpdate._id },
          {
            $set: {
              project: infoUserAfterUpdate.department,
              position: infoUserAfterUpdate.position,
            },
          }
        )
        // console.log('111111111111111111111111111')

        await TIMESHEET__EXPERT_SALARY_COLL.updateMany(
          { human: infoUserAfterUpdate._id },
          {
            $set: {
              project: infoUserAfterUpdate.department,
              position: infoUserAfterUpdate.position,
            },
          }
        )
        // console.log('222222222222222222222222222')

        // await cachingInfoUser(userID, session); // Hỏi lại Khánh cache chỗ này mục đích gì
        return resolve({ error: false, data: infoUserAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Hàm xóa user
   * Hiepnh: Không được phép xóa User
   * Date: 03/03/2022
   */

  /**
   * Dev: HiepNH
   * Func: Danh sách user gửi lời mời kết bạn cho mình
   * Date: 14/01/2022
   */
  getListUserReceiveFromFriends({
    userID,
    lastestID,
    keyword,
    limit = 10,
    select,
    populates = {},
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            status: 400,
          })

        if (isNaN(limit) || +limit > 10) {
          limit = 10
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

        let infoUserWithFriends =
          await AUTH__USER_COLL.findById(userID).select('receiveFromFriends')

        let conditionObj = {
          _id: { $in: infoUserWithFriends?.receiveFromFriends || [] },
        }
        let keys = ['createAt__-1', '_id__-1']
        let sortBy

        // SEARCH TEXT
        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          conditionObj.fullname = new RegExp(keyword, 'i')
        }

        let conditionObjOrg = { ...conditionObj }

        // GET CONDITION PAGINATION
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoUser = await AUTH__USER_COLL.findById(lastestID)
          if (!infoUser)
            return resolve({
              error: true,
              message: "Can't get info last user receiveFromFriends",
              status: 403,
            })
          let dataPagingAndSort = await RANGE_BASE_PAGINATION_V2({
            keys,
            latestRecord: infoUser,
            objectQuery: conditionObjOrg,
          })

          if (!dataPagingAndSort || dataPagingAndSort.error)
            return resolve({
              error: true,
              message: "Can't get range pagination",
              status: 403,
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

        const listFriends = await AUTH__USER_COLL.find(conditionObj)
          .select(select)
          .limit(limit + 1)
          // .populate(populates)
          .sort(sortBy)
          .lean()

        // GET TOTAL RECORD
        let totalRecord = await AUTH__USER_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)
        let nextCursor = null

        if (listFriends && listFriends.length) {
          if (listFriends.length > limit) {
            nextCursor = listFriends[limit - 1]._id
            listFriends.length = limit
          }
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listFriends,
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
   * Dev: HiepNH
   * Func: Danh sách user mà mình gửi yêu cầu kết bạn
   * Date: 14/01/2022
   */
  getListUserSendToFriends({
    userID,
    lastestID,
    keyword,
    limit = 10,
    select,
    populates = {},
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            status: 400,
          })

        if (limit > 10) {
          limit = 10
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

        let infoUserWithFriends =
          await AUTH__USER_COLL.findById(userID).select('sendToFriends')

        let conditionObj = {
          _id: { $in: infoUserWithFriends.sendToFriends },
        }
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

        // SEARCH TEXT
        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          conditionObj.fullname = new RegExp(keyword, 'i')
        }

        let conditionObjOrg = { ...conditionObj }
        // GET CONDITION PAGINATION
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoUser = await AUTH__USER_COLL.findById(lastestID)
          if (!infoUser)
            return resolve({
              error: true,
              message: "Can't get info last user lastestID",
              status: 403,
            })

          let dataPagingAndSort = await RANGE_BASE_PAGINATION_V2({
            keys,
            latestRecord: infoUser,
            objectQuery: conditionObjOrg,
          })

          if (!dataPagingAndSort || dataPagingAndSort.error)
            return resolve({
              error: true,
              message: "Can't get range pagination",
              status: 403,
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

        const listFriends = await AUTH__USER_COLL.find(conditionObj)
          .select(select)
          .limit(limit + 1)
          .populate(populates)
          .sort(sortBy)
          .lean()

        // GET TOTAL RECORD
        let totalRecord = await AUTH__USER_COLL.count(conditionObj)
        let nextCursor = null

        if (listFriends && listFriends.length) {
          if (listFriends.length > limit) {
            nextCursor = listFriends[limit - 1]._id
            listFriends.length = limit
          }
        }

        // Tổng số trang
        let totalPage = Math.ceil(totalRecord / limit)
        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listFriends,
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
   * Name: get info user
   * Author: Depv
   */
  getInfoV2({ userID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID))
          return resolve({ error: true, message: 'param_invalid' })

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

        let infoTask = await AUTH__USER_COLL.findById(userID)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoTask)
          return resolve({
            error: true,
            message: 'Cannot get info',
            keyError: 'cannot_get_info',
          })

        return resolve({ error: false, data: infoTask })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name  : Danh sách user
   * Author: Depv
   * Code  :
   */
  getListV2({
    companyID,
    projectID,
    arrayID,
    keyword,
    limit = 20,
    lastestID,
    select,
    populates = {},
    ctx,
    isLoadAll,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        let conditionObj = {}
        let keys = ['status__-1', '_id__-1']
        // let keys	 = ['createAt__-1', '_id__-1'];
        let sortBy

        // Lấy user theo mảng id
        if (arrayID && arrayID.length) {
          arrayID = JSON.parse(arrayID)
          conditionObj._id = { $in: arrayID }
        }

        // Cờ dùng để call service, không truyền qua api
        if (isLoadAll) {
          let infoDataAfterGet = []

          if (companyID && checkObjectIDs([companyID])) {
            infoDataAfterGet = await AUTH__USER_COLL.find({
              company: companyID,
            })
              .select(select + ' _id')
              .lean()
          } else {
            infoDataAfterGet = await AUTH__USER_COLL.find(conditionObj)
              .select(select + ' _id')
              .lean()
          }

          return resolve({
            error: false,
            data: infoDataAfterGet,
            status: 200,
          })
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

        if (companyID && checkObjectIDs([companyID])) {
          conditionObj.company = companyID
        }

        if (projectID && checkObjectIDs(projectID)) {
          let infoProject = await ctx.call(
            `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`,
            {
              departmentID: projectID,
            }
          )
          let members = infoProject.data.members
          conditionObj._id = { $in: members }
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          conditionObj.fullname = new RegExp(keyword, 'i')
        }

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await AUTH__USER_COLL.findById(lastestID)
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

        let infoDataAfterGet = await AUTH__USER_COLL.find(conditionObj)
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

        let totalRecord = await AUTH__USER_COLL.count(conditionObjOrg)
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
   * Name: importFromExcel
   * Code: HiepNH
   * Date: 8/12/2022
   */
  importFromExcel({ companyID, dataImport, userID }) {
    return new Promise(async (resolve) => {
      try {
        const dataImportJSON = JSON.parse(dataImport)
        let index = 0
        let errorNumber = 0

        for (const data of dataImportJSON) {
          // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
          if (index > 0 && index < 200) {
            let dataInsert = {
              companyID,
              userID,
              fullname: data?.__EMPTY,
              email: data?.__EMPTY_1,
              phone: data?.__EMPTY_2,
              birthDay: data?.__EMPTY_6,
              departmentID: data?.__EMPTY_4,
              positionID: data?.__EMPTY_5,
            }
            // console.log(dataInsert);

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
