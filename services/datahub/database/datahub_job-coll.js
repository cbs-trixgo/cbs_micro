'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * CÔNG TÁC CHUẨN CỦA HỆ THỐNG
 * - Áp dụng cho lập ngân sách thi công của nhà thầu
 * - Áp dụng cho lập ngân sách gói thầu
 */
module.exports = DATABASE_MIDDLEWARE('datahub_job', {
    //_________Công việc cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'datahub_job',
    },
    //_________Mã hiệu/mã hệ thống
    sign: {
        type: String,
        require: true,
        unique: true,
    },
    //_________Tên
    name: String,
    //_________Mô tả
    description: String,
    //_________Đơn vị
    unit: String,
    //_________Ghi chú
    note: String,
    //_________Khối lượng
    quantity: { type: Number, default: 1 },
    //_________Đơn giá
    unitprice: { type: Number, default: 0 },
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
