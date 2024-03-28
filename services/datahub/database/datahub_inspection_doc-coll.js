'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * DATAHUB-HỒ SƠ NGHIỆM THU
 */
module.exports = DATABASE_MIDDLEWARE('datahub_inspection_doc', {
    //_________Phân loại (kết cấu, kiến trúc,...) cf_constant
    type: {
        type: Number,
        default: 1,
    },
    //_________Tên
    name: String,
    //_________Mã hiệu
    sign: {
        type: String,
        trim: true,
        unique: true,
        require: true,
    },
    //_________Mô tả hồ sơ
    description: String,

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
