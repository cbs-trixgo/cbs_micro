"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 * HỒ SƠ ĐỀ XUẤT KỸ THUẬT
 */
module.exports  = DATABASE_MIDDLEWARE("bidding_apply", {
    //_________Nhà thầu dự thầu (companyOfAssignee trong bidding_doc)
    contractor: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    // //_________Thuộc hồ sơ mời thầu nào
    // doc: {
    //     type: Schema.Types.ObjectId,
    //     ref: "bidding_doc"
    // },
    //_________Dự thầu ứng với yêu cầu nào
    request: {
        type: Schema.Types.ObjectId,
        ref : "bidding_request"
    },
    //_________Nội dung
    name: String,
    //_________Mô tả
    description: String,
    //_________Ghi chú
    note: String,
    //________Tài liệu đính kèm
    attachs: [{
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