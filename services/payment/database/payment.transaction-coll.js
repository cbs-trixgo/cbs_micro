'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('payment_transactions', {
  orderID: {
    type: String,
    require: true,
    trim: true,
  },
  orderInfo: {
    type: String,
    require: true,
    trim: true,
  }, // nội dung thanh toán
  amount: {
    type: Number,
    require: true,
    trim: true,
  }, //số tiền thanh toán
  bankCode: String, //(tuỳ chọn)
  orderType: String, // mã loại hàng hoá thanh toán (tuỳ chọn)
  locale: {
    type: String,
    enum: {
      values: ['vn', 'en'],
      message: '{VALUE} is not supported',
    },
  },
  ipAddr: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  /**
   * 0. chưa thanh toán
   * 1. đã thanh toán -> //* thành công
   * 2. đã thanh toán -> //* thất bại -> những status từ vnpay
   *  02
   *  03
   */
  status: {
    type: Number,
  },
})
