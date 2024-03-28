"use strict";

"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 * COLLECTION PHÂN QUYỀN TRUY CÂP NHÓM, CHỦ ĐỀ
 */

module.exports  = DATABASE_MIDDLEWARE("user_pcm_plan_report", {
    //____Người dùng
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    //____Nhóm hoặc chủ đề
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'pcm_plan_report'
    },

    //____Nếu chủ để thì parent là id nhóm
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'pcm_plan_report'
    },

    /**
     * 1: Người tạo
     * 2: Người xem
     * 3: Người chỉnh sửa
     */
    role: {
        type: Number,
        default: 2,
    },
    
    //____Thông tin người tạo
    author: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
   
});