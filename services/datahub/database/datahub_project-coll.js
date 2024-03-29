'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * DATAHUB DỰ ÁN
 */
module.exports = DATABASE_MIDDLEWARE('datahub_project', {
  //_________Chủ đầu tư
  client: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  /**
   * Khu vực dự án
   * - Thuộc mục kê khai Kinh nghiệm thực tế tham gia tại các Dự án
   * - Phân ra làm 3 object area để phục vụ việc query gom nhóm cho tiện
   * - Khi hiển thị area cho người dùng chọn => chỉ hiển thị phường xã để gán (area3).
   * Gán xong => tự tính ra area2, area1 để insert cùng
   */
  //_________Địa chỉ
  address: String,
  //_________Tỉnh/Thành phố
  area1: {
    type: Schema.Types.ObjectId,
    ref: 'area',
  },
  //_________Huyện/Quận
  area2: {
    type: Schema.Types.ObjectId,
    ref: 'area',
  },
  //_________Xã/Phường
  area3: {
    type: Schema.Types.ObjectId,
    ref: 'area',
  },
  //_________Địa chỉ theo google map
  location: String,
  //_________Tên
  name: String,
  //_________Ký hiệu
  sign: String,
  //_________Ghi chú
  note: String,
  //_________Nhóm dự án
  projectType: { type: Number, default: 1 },
  //_________Loại công trình
  buildingType: { type: Number, default: 1 },
  //_________Cấp công trình
  buildingGrade: { type: Number, default: 1 },
  //_________Số tầng hầm
  basementNumber: { type: Number, default: 0 },
  //_________Diện tích tầng hầm
  basementArea: { type: Number, default: 0 },
  //_________Số tầng cao
  floorNumber: { type: Number, default: 0 },
  //_________Diện tích tầng cao
  floorArea: { type: Number, default: 0 },
  //_________Tình trạng dự án
  status: { type: Number, default: 1 },
  //_________Tài liệu đính kèm
  files: [
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
