'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
const {
    FILE_PROCESSING,
    FILE_UPLOAD_ERROR,
    FILE_UPLOAD_SUCCESS,
} = require('../helper/file.keys-constant')

module.exports = DATABASE_MIDDLEWARE('file', {
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
    //________Dự án/phòng ban
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //______Tên gốc
    nameOrg: { type: String, require: true },
    //______Tên uuidv1
    name: { type: String, require: true },
    //______Mô tả file
    description: { type: String },
    //_____Trạng thái upload file(Hệ thống cũ không có)
    status: {
        type: Number,
        enum: [FILE_PROCESSING, FILE_UPLOAD_ERROR, FILE_UPLOAD_SUCCESS],
        require: true,
        default: FILE_PROCESSING,
    },
    //_____Đường dẫn đến file s3 (root/test/image.png)
    path: { type: String, require: true },
    //____Kích thước file
    size: { type: Number },
    //_____image/jpeg
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
    //________File được tích chọn để đánh dấu là bản chính thức/cuối/lưu kho (0/1)
    official: {
        type: Number,
        default: 0,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
