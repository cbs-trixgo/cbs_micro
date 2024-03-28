"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("expert_salary", {
    //________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    //________Dự án/Phòng ban
    project: {
        type: Schema.Types.ObjectId,
        ref : "department"
    },
    //_______Chức vụ/vị trí/Bộ phận
    position: {
        type: Schema.Types.ObjectId,
        ref : "position"
    },
    //________Hạng mục cha
    parent: {
        type: Schema.Types.ObjectId,
        ref : "expert_salary"
    },
    //_________Admin (được quyền xem, sửa)
    admins : [{
        type   : Schema.Types.ObjectId,
        ref: 'user'
    }],
    //_________Thành viên (được quyền xem)
    members : [{
        type   : Schema.Types.ObjectId,
        ref: 'user'
    }],
    //________Phân loại
    type: {
        type: Number,
        default: 1
    },
    //________Nội dung (*)
    name: String,
    //________Nhân sự
    human: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
    //_______Ngày tháng
    date: { type: Date, default: Date.now },
    //________Lương
    salary: {
        type: Number,
        default: 0 
    },
    //________Lương phép
    onLeaveSalary: {
        type: Number,
        default: 0 
    },
    //________Thưởng doanh thu/hiệu quả
    revenueBonus: {
        type: Number,
        default: 0 
    },
    //________Thưởng thành tích/đóng góp
    reward: {
        type: Number,
        default: 0 
    },
    //________Phụ cấp tiền ăn
    mealAllowance: {
        type: Number,
        default: 0 
    },
    //________Sub1 (tiền ăn)
    subAllowance1: {
        type: Number,
        default: 0 
    },
    //________Sub2 (làm ngày nghỉ lễ)
    subAllowance2: {
        type: Number,
        default: 0 
    },
    //________Số người phụ thuộc
    pependent: {
        type: Number,
        default: 0 
    },
    //_________Hệ số chuyển đổi KPI (KPI => giá trị)
    convertFactor: {
        type: Number,
        default: 1
    },
    //_________Hệ số đánh giá
    kpiFactor: {
        type: Number,
        default: 1
    },
    //________Trừ vi phạm
    punishment: {
        type: Number,
        default: 0 
    },
    //________Trừ bảo hiểm
    insurance: {
        type: Number,
        default: 0 
    },
    //________Trừ thuế TNCN (Personal income tax)
    pitax: {
        type: Number,
        default: 0 
    },
    //________Trừ công đoàn
    union: {
        type: Number,
        default: 0 
    },
    //________Chia sẻ, cho đi
    share: {
        type: Number,
        default: 0 
    },
    //________Trừ khác
    other: {
        type: Number,
        default: 0 
    },
    //________Đã tạm ứng
    advance: {
        type: Number,
        default: 0 
    },
    //________Phải thanh toán
    remaining: {
        type: Number,
        default: 0 
    },
    //_________Đã chi trả
    paid:  { type: Number, default: 0},
    //________Ghi chú
    note: String,
    userCreate: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    }
})