"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 * DATAHUB MẪU (BÁO CÁO,...)
 */
module.exports  = DATABASE_MIDDLEWARE("datahub_template", {
    /**
     * Phân loại
     */
    type: { type: Number, default: 1 },
    //_________Tên sẽ được tra cứu
    namedq: String,
    //_________Tên
    name: String,
    //_________Ghi chú
    note: String,
    //_________Trạng thái (1-Bật, 2-Tắt)
    status: { type: Number, default: 1 },
    //_________File đính kèm
    file: {
        type: Schema.Types.ObjectId,
        ref: "file"
    },    
    /**
     * THÔNG TIN NGƯỜI TẠO/CẬP NHẬT
     */
    userCreate: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    }
})