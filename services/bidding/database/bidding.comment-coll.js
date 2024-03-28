'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('bidding_comment', {
    //_________Nội dung
    content: String,

    //________Dự án/phòng ban (lấy từ thông tin Plan)
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },

    //_________Hồ sơ mời thầu
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'bidding_plan',
    },

    //_________Hồ sơ dự thầu
    doc: {
        type: Schema.Types.ObjectId,
        ref: 'bidding_doc',
    },

    //_________Tiêu chí yêu cầu
    request: {
        type: Schema.Types.ObjectId,
        ref: 'bidding_request',
    },

    //_________ID comment cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'bidding_comment',
    },

    //_________ID reply của comment reply cuối(Chi lưu cho comment cha)
    lastestReplyID: {
        type: Schema.Types.ObjectId,
        ref: 'bidding_comment',
    },

    /**
     * Phân loại
     * 1-Comment thông thường (task, document, post,...)
     * 2-Phản hồi liên quan (task)
     * 3-Hiện trạng (task)
     * 4-Giải pháp (task)
     */
    type: { type: Number, default: 1 },

    /**
     * Phân loại công việc(ispropsal) PCM_PROPOSAL_TASK trong cf_constant
     */
    subType: { type: Number, default: 0 },

    //_________Đánh dấu
    official: { type: Boolean, default: false },

    //_________File đính kèm
    files: [
        {
            type: Schema.Types.ObjectId,
            ref: 'file',
        },
    ],

    //_________Các ảnh được đính kèm trong bài viết
    images: [
        {
            type: Schema.Types.ObjectId,
            ref: 'file',
        },
    ],

    //_________Số lượng comment con của comment cha
    amountCommentReply: {
        type: Number,
        default: 0,
    },

    //_________Số lượng reaction con của comment cha
    amountReaction: {
        type: Number,
        default: 0,
    },

    //_________Người tạo comment
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },

    //_________Người cập nhật comment
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
