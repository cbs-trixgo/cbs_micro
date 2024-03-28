"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

/**
 * QUẢN LÝ MÃ KẾT BẠN
 */

module.exports  = DATABASE_MIDDLEWARE("friend_request", {
    //_________User tạo code
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    //_________Code khởi tạo
    code: String,
    //_________Hiệu lực của code (mặc định thời gian hiện tại công thêm 5 phút)
    expiredTime: Date
})