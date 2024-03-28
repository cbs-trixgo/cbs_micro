'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * 1. HẠNG MỤC
 * 2. NHÓM DỮ LIỆU
 * 3. CÔNG VIỆC MỜI THẦU
 * => Số liệu tính toán đều là trước VAT
 */
module.exports = DATABASE_MIDDLEWARE('bidding_bill_item', {
    //_________Khu vực (Lấy theo dự án)
    area: {
        type: Schema.Types.ObjectId,
        ref: 'area',
    },
    //_________Chủ đầu tư (Lấy theo dự án)
    client: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Dự án
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_________Hồ sơ mời thầu
    doc: {
        type: Schema.Types.ObjectId,
        ref: 'bidding_doc',
    },
    /**
     * THÔNG TIN CĂN BẢN
     */
    //_________Tên
    name: String,
    //_________Ký hiệu
    sign: String,
    //_________Đơn vị
    unit: String,
    //_________Mô tả
    description: String,
    //_________Ghi chú
    note: String,
    //_________Khối lượng
    quantity: { type: Number, default: 0 },
    //_________Tổng đơn giá
    unitprice: { type: Number, default: 0 },
    //_________Thành tiền tính toán từ Datahub
    amount: { type: Number, default: 0 },
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
