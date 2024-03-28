'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * PAYMENT TRẢ TRƯỚC
 */
module.exports = DATABASE_MIDDLEWARE('cash_payment', {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Mã khách
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //_________Tên
    name: String,
    //_________Ngày tháng
    date: { type: Date, default: Date.now },
    //_________Ghi chú
    note: String,
    //_________Giá trị ưu đãi
    amount: { type: Number, default: 0 },
    //_________Giá trị thanh toán
    payment: { type: Number, default: 0 },
    //_________Ảnh đính kèm
    images: [
        {
            type: Schema.Types.ObjectId,
            ref: 'file',
        },
    ],
    /**
     * Trạng thái
     * 1-Hoạt động
     * 2-Hủy
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
