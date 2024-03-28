'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * KHÁCH HÀNG ĐĂNG KÝ TRẢI NGHIỆM
 * Bảng này do người muốn mua căn hộ tạo
 */
module.exports = DATABASE_MIDDLEWARE('sale_booking', {
    //_______Công ty/phân vùng (Ban quản trị), lấy theo dự án
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },

    //_______Dự án (khi có Ban quản trị-phân vùng mới => tạo dự án mới và di chuyển data bên CĐT sang dự án mới của Ban quản trị) =>Dự án bảo trì công trình
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },

    //_______Phân loại(1-Booking(50tr)/2-Đạt cọc(400tr)/3-Ký kết hợp đồng(4 tỷ))
    type: {
        type: Number,
        default: 1,
    },
    //_______Trạng thái(1-Hoạt đông/ 2-Không hoạt động)
    status: {
        type: Number,
        default: 1,
    },
    //_______Ngày tháng giao dịch
    date: {
        type: Date,
        default: Date.now,
    },

    //_______Ghi chú
    note: {
        type: String,
    },

    //_______Dự kiến căn hộ đặt cọc
    apartment: {
        type: Schema.Types.ObjectId,
        ref: 'apartment',
    },

    //_______Mã khách (thuộc phân vùng của Chủ đầu tư) => Khi bán xong => khách hàng ấy sẽ thuộc quản lý của Ban quản trị
    contact: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_______Giá trị booking(Giữ chỗ)
    bookingValue: {
        type: Number,
        default: 0,
    },

    //_______Giá trị đặt cọc(Cọc chính thức)
    depositValue: {
        type: Number,
        default: 0,
    },

    //_______Trạng thái lock(1-Đang xem căn hộ/2-Đã chốt mua căn hộ)
    lock: {
        type: Number,
        default: 1,
    },

    //_______Thời gian đặt cọc
    lockTime: {
        type: Date,
    },

    //_______Người xác nhận đặt cọc
    userDeposit: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },

    //_______Thông tin hợp đồng mua bán(Chốt xong mới tạo hợp đồng)
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'contract',
    },

    /**
     * THÔNG TIN NGƯỜI TẠO/CẬP NHẬT
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
