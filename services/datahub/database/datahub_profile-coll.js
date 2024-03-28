"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 * DATAHUB HỒ SƠ NĂNG LỰC DOANH NGHIỆP
 */
module.exports  = DATABASE_MIDDLEWARE("datahub_profile", {
    //_________Doanh nghiệp
    company: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    //_________Tên
    name: String,
    //_________Ghi chú
    note: String,
    //_________Tài liệu đính kèm
    files: [{
        type: Schema.Types.ObjectId,
        ref: "file"
    }],
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