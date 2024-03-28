'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('media_seen', {
    //_________Bài viết
    media: {
        type: Schema.Types.ObjectId,
        ref: 'media',
    },
    //_________Người xem
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    //_________Tuổi của người xem (được update theo thông tin của userCreate)
    age: {
        type: Number,
        default: 0,
    },
    //_________Công ty của người xem (được update theo thông tin của userCreate)
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Phân loại của công ty (được update theo thông tin của company)
    type: {
        type: Schema.Types.ObjectId,
        ref: 'datahub_type',
    },
})
