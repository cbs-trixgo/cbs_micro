'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 *  User được chia sẻ văn bản
 */
module.exports = DATABASE_MIDDLEWARE('document_user_related', {
    document: {
        type: Schema.Types.ObjectId,
        ref: 'document_doc',
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    /**
     * Quyền hạn
     * 1: Người khởi tạo
     * 2: Người được xem
     * 3: Người được chỉnh sửa
     */
    permission: {
        type: Number,
        default: 2,
    },
})
