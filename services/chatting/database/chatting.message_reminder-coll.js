'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('message_message_reminder', {
  /**
   * Nội dụng nhắc hẹn
   */
  content: {
    type: String,
    required: true,
  },

  /**
   * Thông báo đến (tất cả thành viên hay chỉ mình tôi)
   */
  notifyFor: {
    type: String,
    required: true,
    emum: ['all', 'onlyme'],
  },

  /**
   * Thời gian nhắc hẹn
   */
  remindTime: {
    type: Date,
    required: true,
  },

  /**
   * Lặp lại nhắc hẹn
   */
  repeat: {
    type: String,
    default: 'once',
    enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'],
  },

  /**
   * Thành viên tham gia
   */
  accepts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],

  /**
   * Thành viên không tham gia
   */
  rejects: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],

  /**
   * Trạng thái nhắc hẹn
   * 1: Opened
   * 2: Deleted
   */
  status: {
    type: Number,
    default: 1,
  },
})
