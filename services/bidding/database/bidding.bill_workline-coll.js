"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 * ĐỊNH MỨC CỦA HỆ THỐNG ÁP DỤNG CHO TỪNG GÓI THẦU
 * => Số liệu tính toán đều là trước VAT
 */
module.exports  = DATABASE_MIDDLEWARE("bidding_bill_workline", {
    //_________Dự án
    project: {
        type: Schema.Types.ObjectId,
        ref : "department"
    },
    //_________Hồ sơ mời thầu
    doc: {
        type: Schema.Types.ObjectId,
        ref : "bidding_doc"
    },
    //_________Hạng mục
    item: {
        type: Schema.Types.ObjectId,
        ref : "bidding_bill_item"
    }, 
    //_________Nhóm dữ liệu
    group: {
        type: Schema.Types.ObjectId,
        ref : "bidding_bill_group"
    },  
    //_________Tiên lượng mời thầu
    work: {
        type: Schema.Types.ObjectId,
        ref : "bidding_bill_work"
    },
    //_________Nguồn lực
    product: {
        type: Schema.Types.ObjectId,
        ref: 'datahub_product'
    },
    /**
     * Phân loại nguồn lực: được lấy theo tính chất của nguồn lực
     * 1-Vật tư
     * 2-Nhân công
     * 3-Máy
     */
    type: { type: Number, default: 1 },
    //_________Định mức
    quantity: { type: Number, default: 0 },
    /**
     * Đơn giá: được tính theo đơn giá của nguồn lực khi thêm mới/cập nhật
     */
    unitprice: { type: Number, default: 0 },
    //_________Ghi chú
    note: String,
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