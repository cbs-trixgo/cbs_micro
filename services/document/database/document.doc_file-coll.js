'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 *  File đính kèm hồ sơ
 */
module.exports = DATABASE_MIDDLEWARE('document_file', {
  //_________Công ty
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },

  //________Dự án/phòng ban
  project: {
    type: Schema.Types.ObjectId,
    ref: 'department',
  },

  //_________Gói thầu
  package: {
    type: Schema.Types.ObjectId,
    ref: 'document_package',
  },

  //_________Văn bản
  document: {
    type: Schema.Types.ObjectId,
    ref: 'document_doc',
  },

  //________Bình luận
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'document_comment',
  },

  //_________file core
  file: {
    type: Schema.Types.ObjectId,
    ref: 'file',
  },

  /**
   * Đánh dấu là file chính thức hay không
   * 1-Thông thường
   * 2-Chính thức
   */
  official: { type: Number, default: 1 },

  /**
   * 1. Hình ảnh
   * 2. Audio
   * 3. file
   * 4. Video
   */
  type: {
    type: Number,
    default: 1,
  },

  //_________Tên gốc(Đưa qua bảng phụ để truy vấn)
  nameOrg: { type: String, require: true },

  //_________Tên sau khi convert uuidv1(Đưa qua bảng phụ để truy vấn)
  name: { type: String, require: true },

  //_________Author(Đưa qua bảng phụ để truy vấn)
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
})
