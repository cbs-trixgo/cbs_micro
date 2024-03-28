'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('comment', {
  //_________Nội dung
  content: String,

  //_________Các files được đính kèm trong bài viết
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

  //_________Người comment
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },

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
})
