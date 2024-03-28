"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports = DATABASE_MIDDLEWARE("message_conversation_member", {
    /**
     * Tên thành viên cuộc hội thoại (dùng để filter)
     */
    name: {
        type: String,
    },

    /**
     * Cuộc hội thoại
     */
    conversation: {
        type    : Schema.Types.ObjectId,
        ref     : 'message_conversation'
    },

    /**
     * Thành viên cuộc hội thoại
     */
    member: {
        type    : Schema.Types.ObjectId,
        ref     : 'user'
    },

    /**
     * Được thêm bởi user
     */
    addedBy: {
        type    : Schema.Types.ObjectId,
        ref     : 'user'
    },

    /**
     * Loại thành viên
     * 1. Owner
     * 2. Admin
     * 3. Member
     */
    type: {
        type: String,
        enum: ['owner', 'admin', 'member'],
        default: 'member'
    },

    /**
     * Thời gian cuối cùng seen
     */
    timeLastSeen: {
        type: Date
    }
});
