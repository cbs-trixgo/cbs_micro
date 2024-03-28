"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');

const Schema    = require('mongoose').Schema;
/**
 * NGÂN SÁCH
 * 1-Cập nhật ngân sách tổng thể: kế hoạch, thực hiện, dự trù còn lại (ngân sách, hạng mục, nhóm, công việc)
 * 2-Bổ sung vào kế toán các trường phụ tính cập nhật ngân sách
 * 3-Làm rõ khi ghi nhận thực hiện ngân sách thông qua kế toán, thì phần chi VAT thì hoạch toán như thế nào
 */
module.exports  = DATABASE_MIDDLEWARE("budget", {
    /**
     * Phân loại
     * 1-Ngân sách cho chiến dịch
     * 2-Ngân sách cho dự án
     * 3-Ngân sách cho hợp đồng
     */
    type: { type: Number, default: 1, enum: [1,2,3] },    
    //_________Công ty 
    company: {
        type: Schema.Types.ObjectId,
        ref : "company",
        require: true,
    },
    //_________Dự án/phòng ban (Thuộc dự án)
    project: {
        type: Schema.Types.ObjectId,
        ref : "department",
    },
    //_________Hợp đồng
    contract: {
        type: Schema.Types.ObjectId,
        ref: "contract"
    },
    //_________Quản trị
    admins: [{
        type: Schema.Types.ObjectId,
        ref : "user"
    }],
    //_________Thành viên được quyền xem ngân sách
    members: [{
        type: Schema.Types.ObjectId,
        ref : "user"
    }],
    /**
     * THÔNG TIN KHÁC
     */
    //_________Ngày tháng
    date: { type: Date, default: Date.now },
    //_________Tên
    name: String,
    //_________Mã hiệu
    sign: String,
    //_________Mô tả
    description: String,
    //_________Ghi chú
    note: String,
    //_________Khóa cập nhật (1-Open/2-Khóa)
    lock: { type: Number, default: 1 },
    /**
     * DOANH THU
     */
    //______Doanh thu
    revenue: {
        type: Number,
        default : 0
    },
    //______Doanh thu VAT
    vatRevenue: {
        type: Number,
        default : 0
    },
    //______Doanh thu thực tế
    finalRevenue: {
        type: Number,
        default : 0
    },
    //______VAT
    finalVatRevenue: {
        type: Number,
        default : 0
    },
    //______Dự báo doanh thu tới khi kết thúc
    forecastRevenue: {
        type: Number,
        default : 0
    },
    //______VAT
    forecastVatRevenue: {
        type: Number,
        default : 0
    },
    /**
     * NGÂN SÁCH/CHI PHÍ
     */
    //_________Ngân sách kế hoạch
    budget: {
        type   : Number,
        default: 0
    },
    //_________VAT
    vatBudget: {
        type   : Number,
        default: 0
    },
    //______Ngân sách thực hiện
    finalBudget: {
        type: Number,
        default : 0
    },
    //______VAT
    finalVatBudget: {
        type: Number,
        default : 0
    },     
    //______Dự báo ngân sách
    forecastBudget: {
        type: Number,
        default : 0
    },
    //______VAT
    forecastVatBudget: {
        type: Number,
        default : 0
    },    
    /**
     * THÔNG TIN NGƯỜI TẠO/CẬP NHẬT
     */
    userCreate: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    }
})