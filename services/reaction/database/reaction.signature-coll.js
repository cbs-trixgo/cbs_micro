'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('signature', {
  //_________Thực hiện trên collection nào (VD: pcm_plan_task, document ...)
  parentCollection: {
    kind: String,
    item: { type: Schema.Types.ObjectId, refPath: 'parentCollection.kind' },
  },
  //_________Chức danh người ký (nếu có)
  title: String,
  //_________Bút phê (nếu có)
  note: String,
  //_________Người ký
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
})
