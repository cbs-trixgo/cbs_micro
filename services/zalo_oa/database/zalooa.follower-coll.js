"use strict";

/**
 * KHÁCH HÀNG QUAN TÂM ZALO OA
 */
const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("zalooa_follower", {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    //_________User hệ thống
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },

    //_________Tên khách hàng
    name: String,
    //_________Số điện thoại
    phone: String,
    //_________Giới tính
    gender: String,
    //_________Ghi chú
    note: String,

    //_________Official Account Id mà user đã quan tâm/bỏ quan tâm
    oaId: String,

    /**
     * Xác định cách thức người dùng quan tâm Official Account:
        oa_profile: Người dùng nhấn nút quan tâm trên trang chủ của Official Account
        message_invite: Người dùng nhấn đồng ý trên tin nhắn mời quan tâm
        social_plugin: Người dùng nhấn nút quan tâm của social_plugin
     */
    source: String,

    /**
     * Xác định loại event, gồm các giá trị sau:
        event _name=”follow”: Người dùng quan tâm Official Account
        event _name=”unfollow”: Người dùng bỏ quan tâm Official Account
     */
    eventName: String,

    // _________Thời điểm request được gửi, tính bằng milisecond
    timestamp: String,

    // _________Id của User quan tâm/bỏ quan tâm Official Account
    followerId: String,

    /**
     * Trạng thái
     * 1-Bấm quan tâm
     * 2-Bỏ quan tâm
     */
    status: {
        type: Number,
        default: 1
    },
    /**
     * THÔNG TIN NGƯỜI CẬP NHẬT
     */
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    }
})