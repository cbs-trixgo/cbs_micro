'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * 1. HẠNG MỤC
 * 2. NHÓM DỮ LIỆU
 * 3. CÔNG VIỆC MỜI THẦU
 * => Số liệu tính toán đều là trước VAT
 */
module.exports = DATABASE_MIDDLEWARE('bidding_bill_work', {
    //_________Khu vực (Lấy theo dự án)
    area: {
        type: Schema.Types.ObjectId,
        ref: 'area',
    },
    //_________Chủ đầu tư (Lấy theo dự án)
    client: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Dự án
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_________Hồ sơ mời thầu
    doc: {
        type: Schema.Types.ObjectId,
        ref: 'bidding_doc',
    },
    /**
     * THÔNG TIN CĂN BẢN
     */
    //_________Hạng mục
    item: {
        type: Schema.Types.ObjectId,
        ref: 'bidding_bill_item',
    },
    //_________Nhóm dữ liệu
    group: {
        type: Schema.Types.ObjectId,
        ref: 'bidding_bill_group',
    },
    //_________Mã công tác trong DataHub
    datahubJob: {
        type: Schema.Types.ObjectId,
        ref: 'datahub_job',
    },
    // //_________Nhà thầu trúng thầu
    // bidder: {
    //     type: Schema.Types.ObjectId,
    //     ref : "company"
    // },
    //_________Tên
    name: String,
    //_________Ký hiệu
    sign: String,
    //_________Đơn vị
    unit: String,
    //_________Mô tả
    description: String,
    //_________Ghi chú
    note: String,
    /**
     * Loại phát sinh
     * 1 - Không phát sinh
     * 2 - PS được tính với CĐT
     * 3 - PS không được tính với CĐT
     */
    plus: { type: Number, default: 1 },
    //_________Khối lượng
    quantity: { type: Number, default: 0 },
    //_________Khối lượng cập nhật sau chào thầu
    quantity2: { type: Number, default: 0 },
    /**
     * ĐƠN GIÁ NET
     * - Tính từ DataHub đưa sang
     */
    //_________Đơn giá vật tư
    unitprice1: { type: Number, default: 0 },
    //_________Đơn giá nhân công
    unitprice2: { type: Number, default: 0 },
    //_________Đơn giá máy móc/thiết bị
    unitprice3: { type: Number, default: 0 },
    //_________Tổng đơn giá (unitprice1+unitprice2+unitprice3)
    unitprice: { type: Number, default: 0 },
    //_________Thành tiền tính toán từ Datahub
    amount: { type: Number, default: 0 },
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
