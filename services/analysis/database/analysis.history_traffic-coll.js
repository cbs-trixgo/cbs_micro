"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("history_traffic", {
    /**
     * PHÂN LOẠI THIẾT BỊ
     * 1-Web
     * 2-Mobile
     * 3-Tablet
     */
    type: {
        type: Number,
        default: 1
    },
    /**
     * HÀNH ĐỘNG
     * 1-Xem
     * 2-Thêm
     * 3-Sửa
     */
    action: {
        type: Number,
        default: 1
    },
    //_______Ứng dụng
    app: {
        type: Schema.Types.ObjectId,
        ref : 'app' 
    },
    //_______Tính năng
    menu: {
        type: Schema.Types.ObjectId,
        ref : 'app_menu' 
    },
    //_________Công ty của người truy cập
    companyOfAuthor: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    //_________User truy cập
    userCreate: {
        type    : Schema.Types.ObjectId,
        ref     : 'user'
    },
})   