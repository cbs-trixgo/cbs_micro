'use strict'

const PAYMENT__TRANSACTION_COLL = require('../database/payment.transaction-coll')
const AUTH__USER_COLL = require('../../auth/database/auth.user-coll')

const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs } = require('../../../tools/utils/utils')
const {
  RANGE_BASE_PAGINATION,
} = require('../../../tools/cursor_base/playground/index')

class Model extends BaseModel {
  constructor() {
    super(require('../database/payment.transaction-coll'))
  }

  // tạo order transaction ngay lập tức khi user chọn thông tin thanh toán ngay màn hình CBS
  insert({
    orderID,
    orderInfo,
    amount,
    bankCode,
    orderType,
    locale,
    userID,
    status = 0,
    ipAddr,
  }) {
    //orderID: là ID random, ko phải là OBJECTID
    const that = this
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID))
          return resolve({ error: true, message: 'object_invalid' })

        let infoAfterInsert = await that.insertData({
          orderID,
          orderInfo,
          amount,
          bankCode,
          orderType,
          locale,
          user: userID,
          status,
          ipAddr,
        })

        if (!infoAfterInsert)
          return resolve({ error: true, message: 'cannot_insert' })

        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  // cập nhật trạng thái thành công khi nhận được url return VNPAY
  updateStatus({ orderID, status }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * chỉ cho phép cập nhật trạng thái
         *  CHƯA THANH TOÁN -> THANH CÔNG/THẤT BẠI
         */
        const TRANSACTION_WITH_STATUS_WAITING = 0
        let isExistsTransaction = await PAYMENT__TRANSACTION_COLL.findOne({
          orderID,
        })
        console.log({ isExistsTransaction, orderID })
        if (!isExistsTransaction)
          return resolve({
            error: true,
            message: 'transaction_not_exists',
          })

        if (isExistsTransaction.status != TRANSACTION_WITH_STATUS_WAITING)
          return resolve({
            error: true,
            message: 'transaction_not_equal_waiting',
          })

        let infoAfterUpdateStatus =
          await PAYMENT__TRANSACTION_COLL.findOneAndUpdate(
            { orderID },
            {
              status: +status,
            },
            { new: true }
          )
        if (!infoAfterUpdateStatus)
          return resolve({ error: true, message: 'cannot_update' })

        return resolve({ error: false, data: infoAfterUpdateStatus })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  getListByUserWithStatus({ userID, status = 'all' }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(userID))
          return resolve({ error: true, message: 'object_invalid' })

        let conditionObj = {
          user: userID,
        }
        if (status != 'all')
          conditionObj = {
            ...conditionObj,
            status: Number(status),
          }

        let listTransactionsOfUser = await PAYMENT__TRANSACTION_COLL.find(
          conditionObj
        ).sort({
          createAt: -1,
        })
        if (!listTransactionsOfUser)
          return resolve({
            error: true,
            message: 'cannot_find_list_transactions_of_user',
          })

        return resolve({ error: false, data: listTransactionsOfUser })
      } catch (error) {
        return resolve({ error: true, message: message })
      }
    })
  }

  getListTransactions({ status = 'all' }) {
    return new Promise(async (resolve) => {
      try {
        let conditionObj = {}
        if (status != 'all')
          conditionObj = {
            ...conditionObj,
            status: Number(status),
          }
        let listTransactions = await PAYMENT__TRANSACTION_COLL.find(
          conditionObj
        )
          .sort({ createAt: -1 })
          .lean()
          .populate({
            path: 'user',
            select: 'username fullname',
          })
        if (!listTransactions)
          return resolve({
            error: true,
            message: 'cannot_find_list_transactions',
          })

        return resolve({ error: false, data: listTransactions })
      } catch (error) {
        return resolve({ error: true, message: message })
      }
    })
  }
}

exports.MODEL = new Model()
