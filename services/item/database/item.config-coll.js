"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

/**
 * CẤU HÌNH MÔI TRƯỜNG
 * - Biến môi trường cho Zalo OA
 * - Biến môi trường cho Facebook
 * ...
 */
module.exports  = DATABASE_MIDDLEWARE("config", {
    //_________Công ty của user đang truy cập
    company: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    /**
     * Tên/mô tả
     */
    name: String,
    /**
     * Phân loại kênh/...
     * 1-ZNS (Zalo)
     * 2-Facebook
     * 3-...
     * 1 type ứng với 1 companyID thì chỉ có 1 mẩu tin duy nhất
     */
    type: { type: Number, default: 1 },
    /**
     * ID kênh:
     * ZALO_OA_APP_ID
     * FACEBOOK_PAGE_ID
     * ...
     */
    channel: String,
    /**
     * ID template sử dụng:
     * templateId (ZaloOA)
     * clientId (Facebook)
     */
    template: String,
     /**
     * secretKey
     * ...
     */
    secretKey: String,
    /**
     * tokenKey
     * ...
     */
    tokenKey: String,
    /**
     * Tình trạng
     * 1-Hoạt động (cấu hình chính-1 công ty có thể có nhiều kênh/biến)
     * 2-Tạm dừng
     */
    active: { type: Number, default: 1 },
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