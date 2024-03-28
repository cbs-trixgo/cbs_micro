'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('training_subject_rating', {
    //_________ Số sao đánh giá bài viết
    score: Number,

    //_________Bài viết nào
    lession: {
        type: Schema.Types.ObjectId,
        ref: 'training_subject',
    },
    //_________User đánh giá
    userCreate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },

    userUpdate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
