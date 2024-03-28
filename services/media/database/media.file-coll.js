"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
const { 
    FILE_PROCESSING, FILE_UPLOAD_ERROR, FILE_UPLOAD_SUCCESS
}                           = require('../helper/media.keys-constant');

module.exports  = DATABASE_MIDDLEWARE("media_file", {
    media: {
        type    :  Schema.Types.ObjectId,
        ref     : 'media'
    },

    file: {
        type    :  Schema.Types.ObjectId,
        ref     : 'file'
    },

    //_________Số lượng reaction của file
    amountReaction: {
        type    :  Number,
        default : 0
    },

    //_________Số lượng comment của file
    amountComment: {
        type    :  Number,
        default : 0
    },

    //_________Số lượng lượt xem của file
    amountView: {
        type    :  Number,
        default : 0
    },


    // ========== Các trường trong file_core ==========


    //______Ứng dụng
    app: {
        type: Schema.Types.ObjectId,
        ref: 'app'
    },
    //________Công ty
    company: {
        type:  Schema.Types.ObjectId,
        ref : 'company'
    },
    //______Tên gốc
    nameOrg     : { type: String, require: true }, 
    //______Tên uuidv1
    name        : { type: String, require: true },
    //______Mô tả file
    description : { type: String },
    //_____Trạng thái upload file(Hệ thống cũ không có)
    status: { 
        type: Number, 
        enum: [FILE_PROCESSING, FILE_UPLOAD_ERROR, FILE_UPLOAD_SUCCESS],
        require: true, 
        default: FILE_PROCESSING
    },
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
        default: 1
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    }
})