'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * HỒ SƠ MỜI QUAN TÂM/HỒ SƠ MỜI SƠ TUYỂN/HỒ SƠ MỜI THẦU
 * HỒ SƠ DỰ THẦU
 */
module.exports = DATABASE_MIDDLEWARE('bidding_doc', {
  /**
   * THÔNG TIN CHUNG => LẤY TỪ BIDDING_PLAN SANG
   */
  //_________Lĩnh vực
  field: {
    type: Schema.Types.ObjectId,
    ref: 'datahub_type',
  },
  //_________Khu vực (xã/phường)
  area: {
    type: Schema.Types.ObjectId,
    ref: 'area',
  },
  //_________Chủ đầu tư
  client: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //_________Dự án
  project: {
    type: Schema.Types.ObjectId,
    ref: 'department',
  },
  //_________Link tới hợp đồng
  contract: {
    type: Schema.Types.ObjectId,
    ref: 'contract',
  },
  //_________Kế hoạch đầu thầu
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'bidding_plan',
  },
  //_________Quản trị
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  //_________Thành viên được quyền xem
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  /**
   * THÔNG TIN GÓI THẦU
   */
  /**
   * Phần tử cha: Hồ sơ mời thầu
   * Phàn tử con: Hồ sơ dự thầu
   */
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'bidding_doc',
  },
  //_________Tên hồ sơ
  name: String,
  //_________Ký hiệu
  sign: String,
  //_________Ghi chú
  note: String,
  //_________Thời điểm phát hành
  releaseTime: { type: Date, default: null },
  //_________Thời điểm đóng thầu
  closingTime: { type: Date, default: null },
  //_________Giá NET trước VAT
  amount: { type: Number, default: 0 },
  /**
   * HỆ SỐ CHI PHÍ (%)
   * Phục vụ phân tích nguồn lực và tính giá
   */
  //_________Chi phí trực tiếp khác
  factor1: { type: Number, default: 0 },
  //_________Chi phí chung
  factor2: { type: Number, default: 0 },
  //_________Chi phí nhà tạm để ở/Điều hành thi công
  factor3: { type: Number, default: 0 },
  //_________Chi phí khác
  factor4: { type: Number, default: 0 },
  //_________Lợi nhuận
  factor5: { type: Number, default: 0 },
  /**
   * VAT
   * Thuế giá trị gia tăng
   */
  //_________%
  vat: { type: Number, default: 10 },
  //_________%
  vatValue: { type: Number, default: 0 },
  /**
   * ĐƠN VỊ TRÚNG THẦU
   */
  //_________Nhà thầu trúng thầu
  bidder: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //_________Giá trúng thầu
  tenderPrice: { type: Number, default: 0 },
  //_________VAT
  vatTenderPrice: { type: Number, default: 0 },
  /**
   * THÔNG TIN DỰ THẦU
   */
  //_________Công ty dự thầu
  companyOfAssignee: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //_________Người dự thầu => Công ty dự thầu
  assignee: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  //_________Thời điểm xác nhận nộp thầu
  timeApproved: { type: Date, default: null },
  /**
   * assignee Đã đồng ý cho mở thầu hay chưa
   * 0-Chưa
   * 1-Đồng ý
   */
  agreeStatus: { type: Number, default: 0 },
  //_________Giá dự thầu
  bidPrice: { type: Number, default: 0 },
  //_________Giảm giá dự thầu
  bidPriceDiscount: { type: Number, default: 0 },
  //_________Giá dự thầu thừa/thiếu
  bidPriceAdjustment: { type: Number, default: 0 },
  //_________Người được mở thầu
  bidOpeners: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  //_________Người đã mở thầu
  openedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  /**
   * Hồ sơ dự đã được mở hay chưa
   * 0-Chưa
   * 1-Đã mở
   */
  openedStatus: { type: Number, default: 0 },

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
