'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')

const Schema = require('mongoose').Schema
/**
 *  Dụng cụ, thiết bị lưu trữ hồ sơ
 */
module.exports = DATABASE_MIDDLEWARE('storage', {
  //_________Thuộc về công ty nào
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //_________Thuộc về dự án, phòng ban nào (option)
  project: {
    type: Schema.Types.ObjectId,
    ref: 'department',
  },
  //_________Phần tử cha
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'warehouse',
  },
  level: {
    type: Number,
    default: 1,
  },
  //_________Tên
  name: String,
  //_________Mô tả
  description: String,
  amountChilds: {
    type: Number,
    default: 0,
  },
  userCreate: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  userUpdate: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
})
