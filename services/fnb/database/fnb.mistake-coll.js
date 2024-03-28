'use strict'
/**
 * QUẢN LÝ LỖI GẶP PHẢI CỦA CÁC ĐƠN HÀNG
 * 1-Lỗi do kiểm soát nội bộ phát hiện ra
 * 2-Lỗi do khách hàng phát hiện ra
 * 2.1-Nằm theo đơn hàng
 * 2.2-Nằm theo từng sản phẩm cụ thể
 */
const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('fnb_mistake', {
    //_________Công ty (Lấy từ orderID)
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Đơn vị cơ sở/Cửa hàng (Lấy từ orderID)
    funda: {
        type: Schema.Types.ObjectId,
        ref: 'funda',
    },
    //_________Đơn hàng gặp lỗi (add lỗi theo từng đơn hàng)
    order: {
        type: Schema.Types.ObjectId,
        ref: 'fnb_order',
    },
    //_________Mã khách (để biết các lỗi mà hay gặp ở khách để sau lưu ý)
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //_________Người quản lý (lấy từ funda)
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    /**
     * Phân loại lỗi
     * 1-Hệ thống phát hiện
     * 2-Khách hàng phát hiện
     */
    type: {
        type: Number,
        default: 1,
    },
    //_________Lỗi mắc phải
    mistake: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Người mắc lỗi
    executor: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    //_________Lần mắc lỗi/cùng một lỗi
    number: {
        type: Number,
        default: 1,
    },
    //_________Ghi chú xử lý lỗi
    note: String,
    /**
     * Tình trạng xử lý
     * 1-Chưa xử lý
     * 2-Hoàn thành
     */
    status: {
        type: Number,
        default: 1,
    },
    //_________Giá trị phạt
    amount: {
        type: Number,
        default: 0,
    },
    //_________Giá trị thưởng
    bonus: {
        type: Number,
        default: 0,
    },
    //_________File/ảnh đính kèm
    files: [
        {
            type: Schema.Types.ObjectId,
            ref: 'file',
        },
    ],
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
