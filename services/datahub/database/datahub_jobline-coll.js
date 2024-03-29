'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * ĐỊNH MỨC CHUẨN CỦA HỆ THỐNG
 * - Áp dụng cho lập ngân sách thi công của nhà thầu
 * - Áp dụng cho lập ngân sách gói thầu
 */
module.exports = DATABASE_MIDDLEWARE('datahub_jobline', {
  //_________Công việc trong thư viện (áp dụng xây Thư viện)
  job: {
    type: Schema.Types.ObjectId,
    ref: 'datahub_job',
  },
  //_________Nguồn lực
  product: {
    type: Schema.Types.ObjectId,
    ref: 'datahub_product',
  },
  /**
   * Phân loại nguồn lực: được lấy theo tính chất của nguồn lực
   * 1-Vật tư
   * 2-Nhân công
   * 3-Máy
   */
  type: { type: Number, default: 1 },
  //_________Định mức
  quantity: { type: Number, default: 0 },
  /**
   * Đơn giá: được tính theo đơn giá của nguồn lực khi thêm mới/cập nhật
   */
  unitprice: { type: Number, default: 0 },
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
