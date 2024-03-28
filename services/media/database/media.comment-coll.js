'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('media_comment', {
  //_________Nội dung
  content: String,

  //_________ID bài viết
  media: {
    type: Schema.Types.ObjectId,
    ref: 'media',
  },

  //_________ID Comment cha
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'media_comment',
  },

  //_________ID reply của comment reply cuối (Chi lưu cho comment cha)
  lastestReplyID: {
    type: Schema.Types.ObjectId,
    ref: 'media_comment',
  },

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
