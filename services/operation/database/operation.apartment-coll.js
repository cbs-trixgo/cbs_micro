'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * DANH SÁCH CĂN HỘ CỦA DỰ ÁN
 * Bảng này do người muốn mua căn hộ tạo
 */
module.exports = DATABASE_MIDDLEWARE('apartment', {
  //_______Công ty/phân vùng (Ban quản trị), lấy theo dự án
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },

  //_______Dự án (khi có Ban quản trị-phân vùng mới => tạo dự án mới và di chuyển data bên CĐT sang dự án mới của Ban quản trị) =>Dự án bảo trì công trình
  project: {
    type: Schema.Types.ObjectId,
    ref: 'department',
  },

  //_______Số tầng của căn hộ(Nếu có)
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'apartment',
  },

  //_______Cấp độ(1-Tầng căn hộ/ 2-căn hộ)
  level: {
    type: Number,
    default: 1,
  },
  //________Tên căn hộ
  name: String,

  //________Mã căn hộ
  sign: String,

  //________Mô tả căn hộ
  description: String,

  //________Diện tích
  area: {
    type: Number,
    default: 0,
  },

  //________Ngày bắt đầu ở
  startTime: {
    type: Date,
  },

  //________Phí phải nộp
  expenses: {
    type: Number,
    default: 0,
  },

  //_______Tên chủ hộ
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'contact',
  },

  //_______Quản trị viên căn hộ
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],

  //_______Thành viên được truy cập căn hộ
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],

  // histories Lịch sử giao dịch (mua bán, sang tên đổi chủ, nợ điện nước) ref: 'comment' để sau

  // location: Để sau

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
