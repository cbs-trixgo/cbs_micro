'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 * DANH BẠ DỰ ÁN/PHÒNG BAN
 */

module.exports = DATABASE_MIDDLEWARE('department_directory', {
    /**
     * Phân loại
     * 1-Trợ lý viên
     * 2-Chủ đầu tư
     * 3-Tư vấn QLDA
     * 4-Tư vấn giám sát
     * 5-Tư vấn thiết kế
     * 6-Nhà thầu thi công
     */
    type: { type: Number, default: 1 },
    //_________Dự án, phòng ban
    department: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_________Thành viên (Họ và tên, Điện thoại, Email)
    member: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    //_________Công ty chứa member (được tạo tự động theo member)
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Tên chức vụ (trưởng ban, cán bộ,...)
    name: String,
    //_________Mô tả/Ghi chú
    description: String,
    //_________Thứ tự hiển thị
    order: { type: Number, default: 1 },
    //_________Khóa user (0-Bình thường, 1-Khóa)
    lock: { type: Number, default: 0 },
    /**
     * THÔNG TIN NGƯỜI TẠO/CẬP NHẬT => Khi Admin dự án Add user vào làm thành viên dự án
     */
    userCreate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
