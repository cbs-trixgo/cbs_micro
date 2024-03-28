'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('history_log', {
    /**
     * Loại hành động (dùng để sau này truy vấn ai đã thêm/sửa/xoá trên 1 đối tượng)
     * 1-Xem
     * 2-Thêm
     * 3-Sửa
     * 4-Xóa
     **/
    type: {
        type: Number,
        default: 1,
    },
    //_______Dự án (option, chỉ khi truy cập vào project thì mới có trường này)
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_______Hợp đồng (option, chỉ khi truy cập vào contract thì mới có trường này)
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'contract',
    },
    //_______Chủ đề
    task: {
        type: Schema.Types.ObjectId,
        ref: 'pcm_plan_task',
    },
    //_______Hồ sơ
    document: {
        type: Schema.Types.ObjectId,
        ref: 'document_doc',
    },
    //_________Key để xử lý ngôn ngữ (services\notification\helper\notification.keys-constant.js)
    languageKey: {
        type: String,
    },
    //_________Tiêu đề thay đổi
    title: String,
    //_________Nội dung thay đổi (mô tả ngắn nội dung)
    content: String,
    //_________Công ty của người thực thi hành động
    companyOfAuthor: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________User thực thi hành động
    userCreate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
