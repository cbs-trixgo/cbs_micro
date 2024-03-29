const BaseModel = require('../../../tools/db/base_model')
const _isValid = require('mongoose').Types.ObjectId
const moment = require('moment')

/**
 * DOMAIN AND ACTIONS
 */

/**
 * TOOLS
 */

/**
 * COLLECTIONS
 */
const PERSONAL__FRIEND_REQUEST_COLL = require('../database/personal.friend_request-coll')

class Model extends BaseModel {
  constructor() {
    super(PERSONAL__FRIEND_REQUEST_COLL)
  }

  insert({ userID }) {
    return new Promise(async (resolve) => {
      try {
        if (!_isValid.isValid(userID))
          return resolve({ error: true, message: 'param_invalid' })

        let code = Math.floor(100000 + Math.random() * 900000)
        // Thời gian hiện tại công thêm 5phút
        let expiredTime5minutes = moment().add(5, 'm').toDate()
        let infoAfterInsert = await this.insertData({
          user: userID,
          code,
          expiredTime: expiredTime5minutes,
        })

        if (!infoAfterInsert)
          return resolve({ error: true, message: 'cannot_insert' })
        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  // Kiểm tra code còn hợp lệ ko
  checkCodeValid({ code }) {
    return new Promise(async (resolve) => {
      try {
        if (!code)
          return resolve({
            error: true,
            message: 'Vui lòng nhập code',
            message: 'code_invalid',
          })
        /**
         * BA
         * 1. Kiểm tra code có tồn tại hay chưa và thời gian hến hạn của nó phải lớn hơn hoặc bằng thời gian hiện tại
         */
        let infoCode = await PERSONAL__FRIEND_REQUEST_COLL.findOne({
          code,
          expiredTime: {
            $gte: moment().toDate(),
          },
        }).populate({
          path: 'user',
          select:
            '_id fullname sign image company email phone birthDay friends receiveFromFriends',
          populate: {
            path: 'company',
            select: 'name',
          },
        })

        if (!infoCode)
          return resolve({
            error: true,
            message: 'Mã code kết bạn không hợp lệ',
            message: 'code_invalid',
          })

        return resolve({ error: false, data: infoCode })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }
}

exports.MODEL = new Model()
