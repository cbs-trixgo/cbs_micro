'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('message_message_nps', {
    /**
     * Loại tin nhắn NPS
     * 1-Điểm số dịch vụ
     * 2-Không hài lòng
     * 3-Hài lòng
     */
    type: {
        type: Number,
        default: 1,
    },

    /**
     * Mã dịch vụ
     * - Với tin nhắn loại 2, 3 => populate vào trong doctype để lấy mảng phần tử con
     */
    service: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },

    /**
     * Đánh giá
     */
    usersVote: [
        {
            // User đánh giá
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user',
            },
            // Điểm số đánh giá (áp dụng cho tin nhắn Type=1)
            score: {
                type: Number,
            },
            // Lý do hài lòng/không hài lòng (áp dụng cho tin nhắn Type=2, 3)
            reason: {
                type: Schema.Types.ObjectId,
                ref: 'doctype', // Là childs của service (được tạo ra khi khởi tạo danh mục)
            },
            createAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    /**
     * Trạng thái bình chọn
     * 1: Opened
     * 2: Closed
     */
    status: {
        type: Number,
        default: 1,
    },
})
