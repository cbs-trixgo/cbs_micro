'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('message_conversation_link', {
    conversation: {
        type: Schema.Types.ObjectId,
        ref: 'message_conversation',
    },
    message: {
        type: Schema.Types.ObjectId,
        ref: 'message_message',
    },
    link: {
        type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
