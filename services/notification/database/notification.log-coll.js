'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('notification', {
    /**
     * PHÂN LOẠI THÔNG BÁO ĐỂ PHỤC VỤ CÁC NHU CẦU KHÁC NHAU
     * 1 - InApp (Socket)
     * 2 - Web Push (Service Worker)
     * 3 - App Push (Cloud Messaging)
     * 4 - Email
     * 5 - SMS
     */
    type: {
        type: Number,
        require: true,
    },
    /**
     * QUẢN LÝ TRẠNG THÁI CỦA CÁC THÔNG BÁO
     *  1: Đã gửi thành công
     *  2: Chưa xem
     *  3: Đã xem
     */
    status: {
        type: Number,
    },
    //_________Key để xử lý ngôn ngữ (services\notification\helper\notification.keys-constant.js)
    languageKey: {
        type: String,
    },
    //_________Thuộc dự án
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_______Hợp đồng (option, chỉ khi truy cập vào contract thì mới có trường này)
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'contract',
    },
    //_________Người gửi
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    //_________Người nhận
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    //_________Nội dung (mô tả ngắn nội dung)
    content: {
        type: String,
    },
    /**
     * Đường dẫn truy cập
     * - Phục vụ cho web => truy cập vào thông tin chi tiết
     * (/pcm/home/?taskID=60cc5c65e8e09d4502f4f95b&commentID=6216fe36687c3f576b9ddc12)
     * - Phục vụ cho app => truy cập vào thông tin chi tiết
     * (Làm việc với Tuấn)
     */
    path: {
        type: String,
    },
    /**
     * appID
     */
    app: {
        type: Schema.Types.ObjectId,
        ref: 'app',
    },
    /**
     * mainCollID (VD: mediaID, taskID,...)
     */
    mainColl: {
        kind: String,
        item: { type: Schema.Types.ObjectId, refPath: 'mainColl.kind' },
    },
    /**
     * subCollID (VD: commentID, checklistID,...)
     */
    subColl: {
        kind: String,
        item: { type: Schema.Types.ObjectId, refPath: 'subColl.kind' },
    },
})
