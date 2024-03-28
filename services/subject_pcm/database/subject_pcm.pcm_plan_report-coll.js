"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("pcm_plan_report", {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    //_________Dự án phòng ban
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department'
    },
    //_________Tên
    name: String,
    //_________Mô tả
    description: String,
    //_________Chủ đề
    subjects: [{
        type: Schema.Types.ObjectId,
        ref: 'pcm_plan_task',
    }],
    //_________Công việc (sử dụng cho Kanban/báo cáo)
    tasks: [{
        task :  {
            type: Schema.Types.ObjectId,
            ref: 'pcm_plan_task',
        },
        order: { type: Number, default: 1 }
    }],
    //_________Tài liệu (sử dụng cho Kanban/báo cáo)
    documents: [{
        document :  {
            type: Schema.Types.ObjectId,
            ref: 'document_doc',
        },
        order: { type: Number, default: 1 }
    }],
    //_________Highlight task
    active: [{
        type: Schema.Types.ObjectId,
        ref: 'pcm_plan_task',
    }],
    //_________Người được phép truy cập/xem (do author phân quyền vào)
    members: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    /**           
     * CẤU TRÚC ĐỆ QUY
     */
    parent: {
        type: Schema.Types.ObjectId,
        ref: "pcm_plan_report"
    },
    childs: [{
        type: Schema.Types.ObjectId,
        ref: "pcm_plan_report"
    }],
    level: {
        type: Number,
        default: 1
    },
    /**
     * Phân loại báo cáo và ghim kết quả tìm kiếm
     * 1-Báo cáo/Thẻ phân loại
     * 2-Ghim kết quả tìm kiếm công việc
     * 3-Ghim kết quả tìm kiếm checklist
     * 4-Ghim kết quả tìm kiếm Document
     * 5-Ghim kết quả tìm kiếm hợp đồng
     * 6-Ghim kết quả tìm kiếm comment
     * ----------------NEW-----------------
     * 7- Nhóm (Thư mục chủ đề) micro
     */
    type: { type: Number, default: 1 },

    /**
     * Điều kiện tìm kiếm
     * Sau này dùng điều kiện này để tìm kiếm công việc, checklist, document, nhân sự
     */
    conditionPin: {
        type: Object,
    },
    /**
     * Sử dụng xóa công việc trong Báo cáo động
     */
    tasksRemove: [
        {
            type: Schema.Types.ObjectId,
            ref: "pcm_plan_task"
        }
    ],
    /**
     * Sử dụng xóa Checklist trong Báo cáo động
     */
    checklistsRemove: [
        {
            type: Schema.Types.ObjectId,
            ref: "pcm_plan_checklist"
        }
    ],
    /**
     * Sử dụng xóa Document trong báo cáo động
     */
    documentRemove: [
        {
            type: Schema.Types.ObjectId,
            ref: "pcm_plan_checklist"
        }
    ],
    /**
     * Dùng để lưu 1 mảng tìm kiếm động trong báo cáo
     */
    pins: [
        {
            type: Schema.Types.ObjectId,
            ref: 'pcm_plan_report',
        }
    ],
    /**
     * THÔNG TIN NGƯỜI TẠO/CẬP NHẬT
     */
    author: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : "user"
    }
})