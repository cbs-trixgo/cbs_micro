'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 * SẢN LƯỢNG
 */

module.exports = DATABASE_MIDDLEWARE('contract_production', {
    /**
     * START THÔNG TIN LẤY TỪ HỢP ĐỒNG
     */
    //_________Phân loại vào ra (1-Hợp đồng bán ra/2-Hợp đồng mua vào) (CONTRACT_OUTIN in cf_constant)
    outin: { type: Number, default: 1 },

    //_________Phân loại NA (Thực/Gửi dấu) (CONTRACT_TA in cf_constant)
    real: { type: Number, default: 1 },

    //_________Phân loại theo lĩnh vực (type = 3) (POSTMAN -> ITEM - > DOCTYPE)
    field: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },

    //_________Phân loại theo Đơn vị (POSTMAN ITEM -> CONTACT)
    dependentUnit: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Phân loại theo Phụ trách (POSTMAN ITEM -> CONTACT)
    personInCharge: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Phân loại theo Chủ trì (POSTMAN ITEM -> CONTACT)
    chair: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Bên mua (POSTMAN ITEM > CONTACT)
    buyerInfo: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Bên bán (POSTMAN ITEM > CONTACT)
    sellerInfo: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Công ty-Được xác định theo IPC(*)
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },

    //_________Dự án-Được xác định theo IPC(*)
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },

    //_________Hợp đồng-Được xác định theo IPC(*)
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'contract',
    },

    /**
     * END THÔNG TIN LẤY TỪ HỢP ĐỒNG
     */
    /**
     * Kế hoạch/Thực hiện
     * 1-Kế hoạch
     * 2-Thực tế
     */
    plan: { type: Number, default: 1, enum: [1, 2] },
    //_________Ngày hoạch toán(*)
    date: { type: Date, default: Date.now },

    //_________Tên(*)
    name: String,

    //_________Ký hiệu
    sign: String,

    //_________Mô tả
    description: String,

    //_________Ghi chú
    note: String,

    /**
     * Sản lượng thực hiện
     */

    //_________Sản lượng trước VAT
    produce: { type: Number, default: 0 },

    //_________Sản lượng phần VAT
    vatProduce: { type: Number, default: 0 },

    //_________Sản lượng phát sinh trước VAT
    plusProduce: { type: Number, default: 0 },

    //_________Sản lượng phát sinh phần VAT
    vatPlusProduce: { type: Number, default: 0 },

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
