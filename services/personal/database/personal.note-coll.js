'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 * QUẢN LÝ GHI CHÚ
 */

module.exports = DATABASE_MIDDLEWARE('note', {
    //_________Tác giả
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    //_________Tiêu đề
    name: String,
    //_________Nội dung
    description: {
        type: String,
        default: '',
    },
    //_________Thành viên được chia sẻ
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],

    //_________user pin
    usersPin: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],

    //_________Note cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'note',
    },
    //_________Xóa vào thùng rác
    trash: {
        type: Number,
        default: 0,
    },
})
