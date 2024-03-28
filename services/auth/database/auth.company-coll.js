"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("company", {
    //_________Thuộc nền tảng
    platform:{
        type: Number,
        enum: [1, 2]
    },
    //_________Tên công ty
    name: String,
    //_______Tên sau khi convert-chữ thường, không dấu
    namecv: String,
    //_________Mã hiệu
    sign: {
        type: String,
        trim: true,
        unique : true,
        require: true
    },
    //_________Mã số thuế
    taxid: String,
    //_________Điện thoại
    phone: String,
    //_________Email
    email: String,
    //_________Lĩnh vực hoạt động
    field: {
        type   : Number,
        default: 1 //ko thuộc lĩnh vực nào
    },
    //_________Phân loại khác
    type: {
        type: Schema.Types.ObjectId,
        ref: "datahub_type"
    },
    /**
     * Quy mô hoạt động
     */
    scale: { type   : Number, default: 1 },
    //_________Địa chỉ
    address: String,
    //_________Khu vực (Tỉnh thành/Quận huyện/Phường xã)
    area: {
        type: Schema.Types.ObjectId,
        ref : "area"
    },
    //_________Slogan công ty
    slogan: String,
    //_________Mô tả
    description: String,
    //_________Giới thiệu về công ty (xem xét bỏ => Datahub) 
    intro: String,
    //_________Website
    website: String,
    //_________Thành lập
    birthDay: {
        type   : Date,
        default: null
    },
    //_________Ảnh bìa (xem xét bỏ => Datahub)
    cover: {
        type: String,
        defautl: 'cover_default.png'
    },
    //_________Logo
    image: {
        type: String,
        defautl: 'company_default.png'
    },
    //_________Hệ số chuyển đổi KPI (KPI => giá trị)
    convertFactor: {
        type: Number,
        default: 1
    },
    //_________Cho phép hiển thị thông tin (0/1)
    show: {
        type   : Number,
        default: 0 
    },
    //_________Admin công ty
    owners: [{
        type: Schema.Types.ObjectId,
        ref : 'user'
    }],
    //_________Supporter của hệ thống phụ trách
    supporters: [{
        type: Schema.Types.ObjectId,
        ref : 'user'
    }],
    //_________Thời gian bắt đầu tham gia Trixgo
    timeActive: {
        type: Date,
        default: Date.now
    },
    /**
     * BÁO CÁO QUẢN TRỊ
     */
    //_________Cho phép các thành viên công ty khác xem Báo cáo quản trị tài chính
    adreport: [{
        type: Schema.Types.ObjectId,
        ref : 'user'
    }],
    //_________Cho phép các thành viên công ty khác xem Báo cáo nhân sự
    humanreport: [{
        type: Schema.Types.ObjectId,
        ref : 'user'
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