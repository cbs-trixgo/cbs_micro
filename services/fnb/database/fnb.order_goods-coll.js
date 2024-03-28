'use strict'
/**
 * ORDER_PRODUCT
 */
const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('fnb_order_goods', {
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
    //_________Đơn hàng
    order: {
        type: Schema.Types.ObjectId,
        ref: 'fnb_order',
    },
    //_________Sản phẩm
    goods: {
        type: Schema.Types.ObjectId,
        ref: 'goods',
    },
    /**
     * Trân châu đen hay trắng
     * 1-Đen
     * 2-Trắng
     */
    black: {
        type: Number,
        default: 1,
    },
    /**
     * Kích cỡ
     * 1-Size M
     * 2-Size L
     */
    size: {
        type: Number,
        default: 1,
    },
    /**
     * Đường
     * 1-100
     * 2-70
     * 3-50
     * 4-30
     * 5-0
     */
    sugar: {
        type: Number,
        default: 1,
    },
    /**
     * Đá
     * 1-100
     * 2-70
     * 3-50
     * 4-30
     * 5-0
     */
    ice: {
        type: Number,
        default: 1,
    },
    /**
     * Sản phẩm phụ
     * Topping kèm theo
     */
    subGoods: [
        {
            type: Schema.Types.ObjectId,
            ref: 'goods',
        },
    ],
    /**
     * THÔNG TIN GIÁ TRỊ
     */
    //______Khối lượng/Số lượng
    quantity: {
        type: Number,
        default: 1,
    },
    //______Đơn giá
    unitPrice: {
        type: Number,
        default: 0,
    },
    //______Thành tiền
    amount: {
        type: Number,
        default: 0,
    },
    /**
     * THÔNG TIN PHÂN LOẠI (LẤY TỪ ORDER)
     */
    //_________Mã khách (để biết khách hay dùng đồ gì)
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //_________Giới tính
    gender: { type: Number, default: 1 },
    //______Độ tuổi: lấy Năm hiện tại (khi tạo đơn hàng) - Ngày sinh của khách hàng
    age: { type: Number, default: 1 },
    //_________Phân loại trong hệ thống hoặc nhượng quyền
    internal: {
        type: Number,
        default: 1,
    },
    //_________Tỉnh/Thành phố (lấy theo Funda)
    area1: {
        type: Schema.Types.ObjectId,
        ref: 'area',
    },
    //_________Huyện/Quận (lấy theo Funda)
    area2: {
        type: Schema.Types.ObjectId,
        ref: 'area',
    },
    //_________Xã/Phường (lấy theo Funda)
    area3: {
        type: Schema.Types.ObjectId,
        ref: 'area',
    },
    //_________Mùa trong năm (theo lịch âm)
    seasons: {
        type: Number,
        default: 1,
    },
    //_________Ca làm việc
    shift: {
        type: Schema.Types.ObjectId,
        ref: 'fnb_shift',
    },
    //_________Phân loại ca làm việc (cập nhật theo funda)
    shiftType: {
        type: Number,
        default: 1,
    },
    //_________Lĩnh vực kinh doanh (NEW)
    business: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Phân loại dịch vụ/Kênh bán hàng****
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Phân loại kênh bán hàng
    salesChannel: {
        type: Number,
        default: 1,
    },
    //_________Hình thức phục vụ
    service: {
        type: Number,
        default: 1,
    },
    //_________Phương thức thanh toán
    paymentMethod: {
        type: Number,
        default: 1,
    },
    //_________Ghi chú
    note: String,
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
