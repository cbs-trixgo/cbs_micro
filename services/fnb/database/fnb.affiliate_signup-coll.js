'use strict'
/**
 * ĐĂNG KÝ AFFILIATE
 */
const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('fnb_affiliate_signup', {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Đơn vị cơ sở/Cửa hàng
    funda: {
        type: Schema.Types.ObjectId,
        ref: 'funda',
    },
    //_________Lĩnh vực kinh doanh
    business: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Kênh bán hàng
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Mã khách
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //_________Nội dung sự việc
    name: String,
    namecv: String,
    //_________Ghi chú
    note: String,
    //_________Thời gian
    date: { type: Date, default: new Date() },
    /**
     * Tình trạng xử lý
     * 1-Chưa xử lý
     * 2-Hoàn thành
     */
    status: {
        type: Number,
        default: 1,
    },
    //_________Ảnh đính kèm
    images: [
        {
            type: Schema.Types.ObjectId,
            ref: 'file',
        },
    ],
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
