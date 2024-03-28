'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('pcm_comment', {
    //_________User có quyền truy cập
    accessUsers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    /**
     * Người nhận (cải thiện năng suất)
     * 1-author (khi tạo việc xong thì add vào)
     * 2-assignee (khi tạo việc xong thì add vào)
     * 3-related (khi thêm người liên quan thì add vào)
     * 4-Người được gửi tới khi tạo phản hồi liên quan của chủ đề
     */
    receivers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    /**
     * Những user chưa xem comment
     * - Sẽ xóa user khi bấm xem công việc
     * - Sẽ thêm user khi có thông báo mới
     */
    news: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    //_________Công ty của người tạo comment
    companyOfAuthor: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Người tạo comment
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    //________Dự án/phòng ban
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //________Nhóm dữ liệu
    group: {
        type: Schema.Types.ObjectId,
        ref: 'pcm_plan_group',
    },
    //_________contractID
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'contract',
    },
    //_________taskID
    task: {
        type: Schema.Types.ObjectId,
        ref: 'pcm_plan_task',
    },
    //_________ID comment cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'pcm_comment',
    },
    //_________ID reply của comment reply cuối (Chi lưu cho comment cha)
    lastestReplyID: {
        type: Schema.Types.ObjectId,
        ref: 'pcm_comment',
    },
    //_________Nội dung
    content: String,
    //_________Nội dung convert-chữ thường, không dấu (bao cao danh gia)
    contentcv: String,
    /**
     * Phân loại
     * 1-Phản hồi thông thường (task, project, document,...)
     * 3-Hiện trạng (task)
     * 4-Giải pháp (task)
     * 5-Mặc định tạo kèm khi tạo việc/mô tả công việc
     * 6-Cho các loại hành động khác
     */
    type: { type: Number, default: 1 },
    /**
     * Key để xử lý ngôn ngữ (services\notification\helper\notification.keys-constant.js)
     * Tham khảo Notification
     */
    languageKey: {
        type: String,
    },
    /**
     * Phân loại công việc(ispropsal) PCM_PROPOSAL_TASK trong cf_constant
     */
    subType: { type: Number, default: 0 },
    //_________Đánh dấu chính thức
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
    //_________Người cập nhật comment
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
