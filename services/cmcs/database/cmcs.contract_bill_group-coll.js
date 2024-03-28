'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('contract_bill_group', {
  //_________ Công ty
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //_________Dự án
  project: {
    type: Schema.Types.ObjectId,
    ref: 'department',
  },
  //_________Hợp đồng
  contract: {
    type: Schema.Types.ObjectId,
    ref: 'contract',
  },
  //_________Hạng mục
  item: {
    type: Schema.Types.ObjectId,
    ref: 'contract_bill_item',
  },
  /**
   * THÔNG TIN CĂN BẢN
   */
  //_________Tên công việc
  name: String,
  //_________Mô tả
  description: String,
  //_________Ký hiệu
  sign: String,
  //_________Đơn vị tính
  unit: String,
  //_________Ghi chú
  note: String,
  /**
   * THÔNG TIN VỀ GIÁ TRỊ (PRE-CALCULATE FORM JOB)
   * - Giá trị theo hợp đồng
   * - Sản lượng
   * - Nghiệm thu hoàn thành
   */
  /**
   * KHỐI LƯỢNG
   */
  //_________Khối lượng
  quantity: { type: Number, default: 0 },
  /**
   * ĐƠN GIÁ (KHÔNG GỒM VAT)
   */
  /**
   * GIÁ TRỊ (KHÔNG GỒM VAT)
   */
  //_________Giá trị ban đầu (chưa gồm VAT)
  orgAmount: { type: Number, default: 0 },
  //_________Giá trị  cập nhật triển khai (chưa gồm VAT)
  currentAmount: { type: Number, default: 0 },
  //_________Giá trị ước tính còn lại (chưa gồm VAT)
  estimateAmount: { type: Number, default: 0 },
  //_________Giá trị đã nghiệm thu hoàn thành
  inspecAmount: { type: Number, default: 0 },
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
