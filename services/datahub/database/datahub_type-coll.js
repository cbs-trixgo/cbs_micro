'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * DATAHUB-PHÂN LOẠI CỦA HỆ THỐNG
 * 1-Lĩnh vực hoạt động
 * 2-Chủ đề bài viết cộng đồng
 */
module.exports = DATABASE_MIDDLEWARE('datahub_type', {
    /**
     * Phân loại
     * 1-Lĩnh vực
     * 2-Chủ đề cộng đồng => gán vào các bài viết
     */
    type: { type: Number, default: 1 },
    //_________Cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'datahub_type',
    },
    //_________Level (1,2,3..)
    level: { type: Number, default: 1 },
    //_________Tên
    name: String,
    //_________Mô tả
    description: String,
    //_________Phổ biến hay không (Phổ biến 2/Thông thường 1)
    popular: { type: Number, default: 1 },
    //_________Số lượng đơn vị tham gia
    numberOfContractors: { type: Number, default: 0 },
    //_________Số lượng hợp đồng
    numberOfContracts: { type: Number, default: 0 },
    //_________Số lượng bài viết
    numberOfPosts: { type: Number, default: 0 },
    //_________Số lượng view
    numberOfViews: { type: Number, default: 0 },
    //_________Chi tiết các công ty đã view
    companyViews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    //_________Chi tiết các user đã view
    userViews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    //_________Số lượng nhà thầu thuộc lĩnh vực
    contractors: [
        {
            type: Schema.Types.ObjectId,
            ref: 'company',
        },
    ],
    //_________Ảnh đại diện
    image: {
        type: Schema.Types.ObjectId,
        ref: 'file',
    },
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
