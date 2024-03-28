'use strict'

let mongoose = require('mongoose')
let Schema = require('mongoose').Schema
let random = require('mongoose-simple-random')

module.exports = function (dbName, dbOb) {
  dbOb.createAt = Date
  dbOb.modifyAt = Date
  /**
   * 1-Đang tồn tại
   * 2-Xóa
   */
  dbOb.state = {
    type: Number,
    default: 1,
  }
  let s = new Schema(dbOb)
  s.plugin(random)
  return mongoose.model(dbName, s)
}
