'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('facebook_message', {
  mid: {
    type: String,
    unique: true,
    require: true,
  },

  conversationId: String,

  message: String,

  phones: [String],

  senderId: String,

  recipientId: String,

  timestamp: String,
})
