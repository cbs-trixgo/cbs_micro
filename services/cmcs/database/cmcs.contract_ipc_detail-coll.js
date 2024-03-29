'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 * NGHIỆM THU HOÀN THÀNH
 */

module.exports = DATABASE_MIDDLEWARE('contract_ipc_detail', {
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
  //_________Nhóm dữ liệu
  group: {
    type: Schema.Types.ObjectId,
    ref: 'contract_bill_group',
  },
  //________Công việc***
  job: {
    type: Schema.Types.ObjectId,
    ref: 'contract_bill_job',
  },
  //________Kỳ thanh toán***
  ipc: {
    type: Schema.Types.ObjectId,
    ref: 'contract_ipc',
  },
  /**
   * THÔNG TIN CĂN BẢN
   */
  /**
   * Có phát sinh hay không
   * 0 - Không phát sinh
   * 1 - PS được thanh toán
   * 2 - PS không được thanh toán
   */
  plus: { type: Number, default: 0 },
  //_________Khối lượng nghiệm thu
  quantity: { type: Number, default: 0 },
  //_________Đơn giá nghiệm thu (chưa gồm VAT)
  unitPrice: { type: Number, default: 0 },
  //_________Giá trị nghiệm thu (chưa gồm VAT)
  amount: { type: Number, default: 0 },
  //_________Ghi chú
  note: String,
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
