"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("reminder_core", {
    /**
     * VÍ DỤ
     *  type: 'REMINDER_TASK': nhắc công việc
     *  type: 'REMINDER_MEETING': nhắc lịch họp
     */
    type: {
        type: String,
        require: true
    },
    /**
     * 1. đang chờ thực hiện
     * 2. đã thực hiện
     */
    delivery: {
        type: Number,
        enum: [1, 2],
        default: 1
    }, 
    runAt: {
        type: Date,
        require: true
    }
})