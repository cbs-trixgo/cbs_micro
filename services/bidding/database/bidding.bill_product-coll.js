"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 *  DANH MỤC VẬT TƯ GÓI THẦU
 * => Số liệu tính toán đều là trước VAT
 */
module.exports  = DATABASE_MIDDLEWARE("bidding_bill_product", {  
    //_________Khu vực (xã/phường)
    area: {
        type: Schema.Types.ObjectId,
        ref : "area"
    },    
    //_________Chủ đầu tư
    client: {
        type: Schema.Types.ObjectId,
        ref : "company"
    }, 
    //_________Dự án
    project: {
        type: Schema.Types.ObjectId,
        ref : "department"
    },
    //_________Hồ sơ mời thầu (gói thầu)
    doc: {
        type: Schema.Types.ObjectId,
        ref : "bidding_doc"
    },
    /**
     * Nhà thầu trúng thầu
     * Gán sau khi đã chốt được đơn vị trúng thầu và hiệu chỉnh đơn giá của họ theo Datahub trước khi ký
     */
    bidder: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    /**
     * THÔNG TIN CĂN BẢN
     */
    /**
     * Phân loại
     * 1-Vật tư
     * 2-Nhân công
     * 3-Máy
     */
    type: { type: Number, default: 1 },
    //_________Mã sản phẩm theo hệ thống
    product: {
        type: Schema.Types.ObjectId,
        ref: "datahub_product"
    },
    //_________Đơn giá
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