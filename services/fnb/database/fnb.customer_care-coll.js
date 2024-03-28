'use strict'
/**
 * CHĂM SÓC KHÁCH HÀNG
 * https://amis.misa.vn/15061/customer-journey/#:~:text=Customer%20Journey%20(h%C3%A0nh%20tr%C3%ACnh%20kh%C3%A1ch,trong%20su%E1%BB%91t%20th%E1%BB%9Di%20gian%20qua.
 *
 */
const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('fnb_customer_care', {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Đơn vị cơ sở/Cửa hàng
    funda: {
        type: Schema.Types.ObjectId,
        ref: 'funda',
    },
    //_________Đơn hàng gặp lỗi (add lỗi theo từng đơn hàng)
    order: {
        type: Schema.Types.ObjectId,
        ref: 'fnb_order',
    },
    //_________Lĩnh vực kinh doanh (NEW)
    business: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Kênh bán hàng
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Nguồn dữ liệu (REF: Thông tin khách hàng)
    dataSource: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //_________Hành trình khách hàng
    journey: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Mã khách (để biết các lỗi mà hay gặp ở khách để sau lưu ý)
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //_________Phân loại vấn đề gặp phải
    mistake: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Người quản lý (lấy từ funda)
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    /**
     * Phân loại
     * 1-Lỗi chủ quan
     * 2-Lỗi khách quan
     */
    type: {
        type: Number,
        default: 1,
    },
    //_________Kênh bán hàng (cũ => sẽ bỏ)
    salesChannel: {
        type: Number,
        default: 1,
    },
    //_________Nội dung
    name: String,
    namecv: String,
    //_________Diễn giải/cách xử lý
    description: String,
    //_________Ghi chú
    note: String,
    //_________Đánh giá của khách (1-5*)
    rating: {
        type: Number,
        default: 1,
    },
    //_________Giá trị/Chi phí
    amount: {
        type: Number,
        default: 0,
    },
    /**
     * Tình trạng xử lý
     * 1-Chưa xử lý
     * 2-Hoàn thành
     */
    status: {
        type: Number,
        default: 1,
    },
    //_________Ảnh đính kèm
    images: [
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
