'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('pcm_file', {
  //________Công ty (lấy từ thông tin Task)
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //________Dự án/phòng ban (lấy từ thông tin Task)
  project: {
    type: Schema.Types.ObjectId,
    ref: 'department',
  },
  //________Nhóm dữ liệu (lấy từ thông tin Task)
  group: {
    type: Schema.Types.ObjectId,
    ref: 'pcm_plan_group',
  },
  //________Hợp đồng (lấy từ thông tin Task)
  contract: {
    type: Schema.Types.ObjectId,
    ref: 'contract',
  },
  //________Công việc
  task: {
    type: Schema.Types.ObjectId,
    ref: 'pcm_plan_task',
  },
  //________Bình luận (Convert data sẽ không có trường này)
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'pcm_comment',
  },
  //________File
  file: {
    type: Schema.Types.ObjectId,
    ref: 'file',
  },
  /**
   * 1. Hình ảnh
   * 2. file
   */
  type: {
    type: Number,
    default: 1,
  },
  //_________Tên gốc(Đưa qua bảng phụ để truy vấn)
  nameOrg: { type: String, require: true },
  //_________Tên sau khi convert uuidv1(Đưa qua bảng phụ để truy vấn)
  name: { type: String, require: true },
  //______Mô tả file
  description: { type: String },
  //_____Đường dẫn đến file s3 (root/test/image.png)
  path: { type: String, require: true },
  //____Kích thước file
  size: { type: Number },
  //_____image/jpeg
  mimeType: { type: String },
  //_________Công ty của người tạo file
  companyOfAuthor: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //_________Author(Đưa qua bảng phụ để truy vấn)
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
})
