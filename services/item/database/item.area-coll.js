'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 * KHU VỰC ĐỊA LÝ
 */

module.exports = DATABASE_MIDDLEWARE('area', {
  //_________Phần tử cha
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'area',
  },
  //_________Level (1/2/3)
  level: { type: Number, default: 1 },
  //_________Tên
  name: String,
  //_________Mã hiệu
  sign: String,
  /**
   * THÔNG TIN NGƯỜI TẠO/CẬP NHẬT
   */
  userCreate: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  userUpdate: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
})
