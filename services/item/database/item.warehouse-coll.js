'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')

const Schema = require('mongoose').Schema
/**
 *  Hợp đồng kinh tế
 */
module.exports = DATABASE_MIDDLEWARE('warehouse', {
  //_________Thuộc về công ty nào
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
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
  // Số lượng phần tử con
  amountChilds: {
    type: Number,
    default: 0,
  },
  //_________Tên
  name: String,
  //_________Mô tả
  description: String,
  //_________Link Funda
  funda: {
    type: Schema.Types.ObjectId,
    ref: 'funda',
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
