"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 * DATAHUB-CHECKLIST CỦA HỒ SƠ NGHIỆM THU
 */
module.exports  = DATABASE_MIDDLEWARE("datahub_inspection_checklist", {
    //_________Thuộc biên bản
    inspection: {
        type    : Schema.Types.ObjectId,
        ref     : 'datahub_inspection_doc'
    },
    //_________Tên checklist kiểm tra
    name: String,
    //_________Mã hiệu
    sign: {
        type: String,
        trim: true,
        unique : true,
        require: true  
    }, 
    //_________Mô tả
    description: String,
    
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