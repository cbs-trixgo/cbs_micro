'use strict'

const DATABASE_MIDDLEWARE = require('../../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('app_company', {
    /**
     * Công ty
     */
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    /**
     * ứng dụng
     */
    app: {
        type: Schema.Types.ObjectId,
        ref: 'app',
    },
    /**
     * Số tài khoản tối đa được phép sử dụng của công ty
     */
    maxCount: {
        type: Number,
        default: 1,
    },
    /**
     * Số dung lượng tối đa được phép lưu trữ của công ty
     */
    maxData: {
        type: Number,
        default: 1,
    },
    /**
     * Ngày bắt đầu tham gia sử dụng
     */
    startTime: {
        type: Date,
        default: Date.now,
    },
    /**
     * Thời hạn sử dụng (khi không đóng tiền sẽ sẽ ngắt thông qua trường thông tin này)
     */
    endTime: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: Number,
        default: 1,
    },
    /**
     * Số lượng truy cập vào ứng dụng
     */
    traffic: {
        type: Number,
        default: 0,
    },
    /**
     * Người tạo
     */
    userCreate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    /**
     * Người cập nhật
     */
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
