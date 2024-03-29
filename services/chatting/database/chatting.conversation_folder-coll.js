'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('message_conversation_folder', {
  /**
   * Tên folder
   */
  name: {
    type: String,
    require: true,
  },

  // /**
  //  * Các cuộc hội thoại được thêm vào folder
  //  */
  // includedConversations: [{
  //     type    : Schema.Types.ObjectId,
  //     ref     : 'message_conversation'
  // }],

  // /**
  //  * Tất cả cuộc hội thoại (ngoài trừ những cuộc hội thoại này)
  //  */
  // excludedConversations: [{
  //     type    : Schema.Types.ObjectId,
  //     ref     : 'message_conversation'
  // }],

  /**
   * Số lượng tin nhắn bị miss (của tất cả cuộc hội thoại trong folder)
   */
  amountMissMessage: {
    type: Number,
    default: 0,
  },

  /**
   * Người tạo folder
   */
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
})
