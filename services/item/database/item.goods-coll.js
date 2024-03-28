'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')

const Schema = require('mongoose').Schema
/**
 *  HÀNG HOÁ, SẢN PHẨM, TÀI SẢN, CÔNG CỤ DỤNG CỤ,...
 */
module.exports = DATABASE_MIDDLEWARE('goods', {
  //________Thuộc về công ty nào
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //_________Đơn vị cơ sở/Cửa hàng
  fundas: [
    {
      type: Schema.Types.ObjectId,
      ref: 'funda',
    },
  ],
  //_________Phần tử cha
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'goods',
  },
  level: {
    type: Number,
    default: 1,
  },
  /**
   * HỆ THỐNG QUẢN LÝ
   */
  //_________Do hệ thống quy định hay không (giá trị 1 hoặc trường company = null)
  belongSystem: { type: Number, default: 0 },
  /**
   * THÔNG TIN CĂN BẢN
   */
  //_________Mã link với phân loại chi phí của hệ thống
  linkSystem: {
    type: Schema.Types.ObjectId,
    ref: 'goods',
  },
  //_________Có phải là mẫu hay không
  template: { type: Number, default: 0 },
  /**
   * THÔNG TIN
   */
  /**
   * Phân loại
   * 1-Thông thường
   * 2-Topping
   */
  type: {
    type: Number,
    default: 1,
  },
  /**
   * Kích cỡ
   * 1-Size M
   * 2-Size L
   */
  size: {
    type: Number,
    default: 1,
  },
  //_________Tên
  name: String,
  //_________Nội dung
  namecv: String,
  //_________Mã hiệu
  sign: String,
  //_________Đơn vị
  unit: String,
  //_________Ghi chú
  note: String,
  //_________Đơn giá nhập
  unitprice: { type: Number, default: 0 },
  //_________Đơn giá xuất bán
  sellingUnitprice: { type: Number, default: 0 },
  //______Đơn giá: M, Off
  unitPrice: {
    type: Number,
    default: 0,
  },
  //______Đơn giá 2: M, App
  unitPrice2: {
    type: Number,
    default: 0,
  },
  //______Đơn giá 3: L, Off
  unitPrice3: {
    type: Number,
    default: 0,
  },
  //______Đơn giá 4: L, App
  unitPrice4: {
    type: Number,
    default: 0,
  },
  //_________Số lượng phần tử con
  amountChilds: {
    type: Number,
    default: 0,
  },
  /**
   * Chuyển đổi đơn vị tính
   */
  //_________Link
  convert: {
    type: Schema.Types.ObjectId,
    ref: 'goods',
  },
  //_________Định mức chuyển đổi
  convertQuantity: { type: Number, default: 1 },
  //______Sử dụng cho (1-Chung, 2-Đơn hàng)
  usage: {
    type: Number,
    default: 1,
  },
  //______Trạng thái (1-ON, 2-OFF)
  status: {
    type: Number,
    default: 1,
  },
  //_________Ảnh đại diện
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: 'file',
    },
  ],
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
