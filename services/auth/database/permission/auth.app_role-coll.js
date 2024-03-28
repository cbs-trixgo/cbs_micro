"use strict";

const DATABASE_MIDDLEWARE   = require('../../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("app_role", {
    /**
     * PHÂN LOẠI NHÓM CHỨC NĂNG
     * 1 - Nhóm chức năng ứng dụng
     * 2 - Nhóm chức dự án phòng ban/hợp đồng
     * 3 - Nhóm chức năng hợp đồng
     */
    type: { type: Number, default: 1 },
    /**
     * Công ty
     */
    company: { 
        type: Schema.Types.ObjectId,
        ref : 'company' 
    },
    /**
     * Ứng dụng
     */
    app: {
        type: Schema.Types.ObjectId,
        ref: "app"
    },
    
    /**
     * Tên nhóm
     */    
    name: String,
    /**
     * Mô tả nhóm
     */
    description: String,
    /**
     * Thành viên nhóm
     */
    members: [
        {
            type: Schema.Types.ObjectId,
            ref : "user"
        }
    ],
    userCreate: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : "user"
    }
})   