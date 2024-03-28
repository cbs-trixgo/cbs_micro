'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('message_message_poll', {
  /**
   * Tên cuộc bình chọn
   */
  name: {
    type: String,
    required: true,
  },

  /**
   * Các phương án trong cuộc bình chọn
   */
  options: [
    {
      // Tên phương án
      title: {
        type: String,
        required: true,
      },
      // Danh sách user bình chọn phương án
      usersVote: [
        {
          type: Schema.Types.ObjectId,
          ref: 'user',
        },
      ],
      createAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  /**
   * Trạng thái bình chọn
   * 1: Opened
   * 2: Closed
   */
  status: {
    type: Number,
    default: 1,
  },
})
