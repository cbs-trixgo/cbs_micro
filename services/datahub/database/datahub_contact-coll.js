'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * DATAHUB-DANH SÁCH TỔ CHỨC
 */
module.exports = DATABASE_MIDDLEWARE('datahub_contact', {
    //_________Tên
    name: String,
    //_________Ký hiệu
    sign: String,
    //_________Địa chỉ
    address: String,
    //_________Mã số thuế
    taxid: {
        type: String,
        require: true,
        unique: true,
    },
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
