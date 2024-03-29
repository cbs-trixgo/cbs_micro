'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')

const Schema = require('mongoose').Schema
/**
 * NHÓM NGÂN SÁCH
 */
module.exports = DATABASE_MIDDLEWARE('budget_group', {
  /**
   * Phân loại
   * 1-Doanh thu
   * 2-Chi phí
   * 3-Khác
   */
  type: { type: Number, default: 2, enum: [1, 2, 3] },
  //_________Công ty
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    require: true,
  },
  //_________Dự án/phòng ban (Thuộc dự án)
  project: {
    type: Schema.Types.ObjectId,
    ref: 'department',
  },
  //_________Hợp đồng
  contract: {
    type: Schema.Types.ObjectId,
    ref: 'contract',
  },
  //_________Ngân sách
  budget: {
    type: Schema.Types.ObjectId,
    ref: 'budget',
    require: true,
  },
  //_________Hạng mục
  item: {
    type: Schema.Types.ObjectId,
    ref: 'budget_item',
    require: true,
  },
  /**
   * THÔNG TIN NGÂN SÁCH
   */
  /**
   * Phát sinh
   * 0-Không phát sinh
   * 1-Phát sinh hợp lệ
   * 2-Phát sinh không hợp lệ
   */
  plus: { type: Number, default: 0 },
  //_________Khóa cập nhật(1-Open/2-Khóa)
  lock: { type: Number, default: 1 },
  //_________Lý do phát sinh
  reason: {
    type: Schema.Types.ObjectId,
    ref: 'doctype',
  },
  //_________Tên
  name: String,
  //_________Mã hiệu
  sign: String,
  //_________Đơn vị tính
  unit: String,
  //_________Mô tả
  description: String,
  //_________Ghi chú
  note: String,
  /**
   * NGÂN SÁCH => TÍNH THEO BUDGET WORK
   */
  //______Khối lượng
  quantity: {
    type: Number,
    default: 0,
  },
  //______Đơn giá
  unitPrice: {
    type: Number,
    default: 0,
  },
  //______VAT đơn giá
  vatUnitPrice: {
    type: Number,
    default: 0,
  },
  //______Thành tiền
  amount: {
    type: Number,
    default: 0,
  },
  //______VAT thành tiền
  vatAmount: {
    type: Number,
    default: 0,
  },
  /**
   * THỰC HIỆN-KHÔNG GỒM VAT => TÍNH THEO ACCOUNTING
   */
  //______Khối lượng thực hiện
  impleQuantity: {
    type: Number,
    default: 0,
  },
  //______Đơn giá thực hiện
  impleUnitPrice: {
    type: Number,
    default: 0,
  },
  //______Thành tiền thực hiện
  impleAmount: {
    type: Number,
    default: 0,
  },
  /**
   * DỰ BÁO => TÍNH THEO BUDGET WORK
   */
  //______Dự báo Khối lượng
  forecastQuantity: {
    type: Number,
    default: 0,
  },
  //_________Dự báo Đơn giá
  forecastUnitPrice: {
    type: Number,
    default: 0,
  },
  //_________Dự báo VAT đơn giá
  forecastVatUnitPrice: {
    type: Number,
    default: 0,
  },
  //______Dự báo Thành tiền
  forecastAmount: {
    type: Number,
    default: 0,
  },
  //______Dự báo VAT thành tiền
  forecastVatAmount: {
    type: Number,
    default: 0,
  },
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
