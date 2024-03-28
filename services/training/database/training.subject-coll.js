"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("training_subject", {
    //_________Phân loại chính (Do hệ thống quy định)
    type:  {
        type: Number,
        default: 1
    },
    //_________Chủ đề cha 
    parent: {
        type    : Schema.Types.ObjectId,
        ref     : 'training_subject'
    },
    //_________Tên chủ đề, tên bài viết
    name: String,
    //_________Mô tả chủ đề, mô tả bài viết
    description: String,
    //_________Nội dung chính của bài viết
    content: String,
    //_________Ảnh đại diện cho chủ đề
    image: {
        type    : Schema.Types.ObjectId,
        ref     : 'file'
    },
    //_________Số lượng bài viết trong chủ đề
    amountLessions: {
        type: Number,
        default: 0
    },
    //_________Số lượt xem (Tổng của các bài viết) hoặc tổng của 1 bài viết
    amountViews: {
        type: Number,
        default: 0
    },

    //_________Tổng số user đã xem bài viết
    amountUserViews: {
        type: Number,
        default: 0
    },

    //_________Số lượng comment của 1 bài viết
    amountComments: {
        type: Number, 
        default: 0 
    },
    //_________Số lượng like bài viết
    amountReaction: {
        type: Number,
        default: 0
    },
  
    //_________Số sao đánh giá trung bình
    amountStars: {
        type: Number,
        default: 5
    },
    userCreate: {
        type    : Schema.Types.ObjectId,
        ref     : 'user'
    },
    userUpdate: {
        type    : Schema.Types.ObjectId,
        ref     : 'user'
    }
})   