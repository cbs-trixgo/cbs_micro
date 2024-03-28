"use strict";
/**
 * PRODUCT
 */
const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("fnb_product", {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    //_________Đơn vị cơ sở/Cửa hàng
    fundas: [{
        type: Schema.Types.ObjectId,
        ref : "funda"
    }],
    //_________Phân loại dịch vụ
    doctype: {
        type: Schema.Types.ObjectId,
        ref: "doctype"
    },
    //_________Cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: "fnb_product"
    },
    level: {
        type: Number,
        default: 1
    },
    /**
     * THÔNG TIN
     */
    /**
     * Phân loại
     * 1-Thông thường
     * 2-Topping
     */
    type: {
        type: Number,
        default : 1
    },
    /**
     * Kích cỡ
     * 1-Size M
     * 2-Size L
     */
    size: {
        type: Number,
        default : 1
    },
    //_________Nội dung
    name: String,
    //_________Nội dung
    namecv: String,
    //_________Mã hiệu
    sign: String,
    //_________Đơn vị tính
    unit: String, 
    //_________Ghi chú
    note: String,
    /**
     * GIÁT TRỊ
     */
    //______Khối lượng
    quantity: {
        type: Number,
        default : 0
    },
    //______Đơn giá: M, Off
    unitPrice: {
        type: Number,
        default : 0
    },
    //______Đơn giá 2: M, App
    unitPrice2: {
        type: Number,
        default : 0
    },
    //______Đơn giá 3: L, Off
    unitPrice3: {
        type: Number,
        default : 0
    },
    //______Đơn giá 4: L, App
    unitPrice4: {
        type: Number,
        default : 0
    },
    //______Thành tiền
    amount: {
        type: Number,
        default : 0
    },
    //_________Ảnh đại diện
    images: [{
        type: Schema.Types.ObjectId,
        ref: "file"
    }],
    //_________Số lượng phần tử con
    amountChilds: {
        type: Number,
        default: 0 
    },
    /**
     * 1-Khu Hà Nội
     * 2-Hồ Chí Minh
     */
    convertOption: {
        type: Number,
        default : 1
    },
    //______Trạng thái (1-ON, 2-OFF)
    status: {
        type: Number,
        default : 1
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