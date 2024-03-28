"use strict";
/**
 * NETWORK COMMISSION
 * https://hocvien.haravan.com/blogs/thuat-ngu/kinh-doanh-theo-mang
 */
const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("fnb_network_com", {
    //_________Công ty bán sản phẩm
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    //_________Đơn vị cơ sở/Cửa hàng
    funda: {
        type: Schema.Types.ObjectId,
        ref : "funda"
    },
    //_________Kênh bán hàng
    channel: {
        type: Schema.Types.ObjectId,
        ref: "doctype"
    },
    //_________Trạng thái đơn
    status: {
        type: Number,
        default: 5
    },
    //_________Ngày tháng đơn hàng
    date: { type: Date, default: Date.now },
    //_________Đơn hàng bán ra
    order: {
        type: Schema.Types.ObjectId,
        ref: "fnb_order"
    },
    //_________Khách mua hàng
    customer: {
        type: Schema.Types.ObjectId,
        ref: "contact"
    },
    /**
     * Nhân viên bán hàng trực tiếp
     * - Hoặc là nhân viên sale
     * - Hoặc có thể là các bạn làm Affiliate
     */
    sale: {
        type: Schema.Types.ObjectId,
        ref : "contact"
    },
    //_________Giá trị đơn hàng
    amount: {
        type: Number,
        default : 0
    },
    /**
     * CƠ CHẾ TRẢ THƯỞNG
     */
    //_________Level cấp trên
    level: {
        type: Number,
        default: 1
    },
    //_________Cấp trên được hưởng hoa hồng
    upline: {
        type: Schema.Types.ObjectId,
        ref : "contact"
    },
    //_________Tỷ lệ hoa hồng
    rate: {
        type: Number,
        default : 0
    },
    //_________Tiền hoa hồng
    commission: {
        type: Number,
        default : 0
    },
    //_________Ghi chú
    note: String,
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