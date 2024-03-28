'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('signature', {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Dự án/phòng ban
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_________Thực hiện trên collection nào (VD: pcm_plan_task, document ...)
    coll: {
        kind: String,
        item: { type: Schema.Types.ObjectId, refPath: 'coll.kind' },
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
