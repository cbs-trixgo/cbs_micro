'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * TIỆN ÍCH XUNG QUANH
 */
module.exports = DATABASE_MIDDLEWARE('utility', {
  //________Tên tiện ích
  name: String,

  //________Mô tả tiện ích
  description: String,

  // location GeoSchema !
  /**
   * USER TẠO, CẬP NHẬT
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
