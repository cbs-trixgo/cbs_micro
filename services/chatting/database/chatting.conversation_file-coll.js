'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('message_conversation_file', {
    conversation: {
        type: Schema.Types.ObjectId,
        ref: 'message_conversation',
    },
    file: {
        type: Schema.Types.ObjectId,
        ref: 'file',
    },

    /**
     * FILE_CORE
     */
    //______Ứng dụng
    app: {
        type: Schema.Types.ObjectId,
        ref: 'app',
    },
    //________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //______Tên gốc
    nameOrg: { type: String, require: true },
    //______Tên uuidv1
    name: { type: String, require: true },
    //______Mô tả file
    description: { type: String },
    //_____Đường dẫn đến file s3 (root/test/image.png)
    path: { type: String, require: true },
    //____Kích thước file
    size: { type: Number },
    //_____image/jpeg(Hệ thống cũ không có)
    mimeType: { type: String },
    /**
     * 1. Hình ảnh
     * 2. File
     * 3. Audio
     * 4. Video
     */
    type: {
        type: Number,
        default: 1,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
