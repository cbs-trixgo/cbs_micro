'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * SỔ QUỸ
 */
module.exports = DATABASE_MIDDLEWARE('cash_book', {
  //_________Công ty
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //_________Phần tử cha
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'cash_book',
  },
  //_________Tài khoản kế toán
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  //_________Mã khách
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'contact',
  },
  //_________Hợp đồng
  contract: {
    type: Schema.Types.ObjectId,
    ref: 'contract',
  },
  //_________Admin (được quyền xem, sửa)
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  //_________Thành viên (được quyền xem)
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  //_________Tên
  name: String,
  //_________Ngày tháng
  date: { type: Date, default: Date.now },
  //_________Mã hiệu
  sign: String,
  //_________Ghi chú
  note: String,
  //_________Số dư đầu kỳ
  openingBalance: { type: Number, default: 0 },
  //_________Phát sinh trong kỳ
  arising: { type: Number, default: 0 },
  //_________Số dư cuối kỳ
  closingBalance: { type: Number, default: 0 },
  //_________Thu
  income: { type: Number, default: 0 },
  //_________Chi
  expense: { type: Number, default: 0 },
  /**
   * Sổ quỹ đang hoạt động hoặc tạm dừng
   * 1-Hoạt động
   * 2-Tạm dừng
   */
  active: { type: Number, default: 1 },
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
