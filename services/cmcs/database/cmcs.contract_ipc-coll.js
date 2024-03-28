'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 * NGHIỆM THU HOÀN THÀNH
 */

module.exports = DATABASE_MIDDLEWARE('contract_ipc', {
    /**
     * START THÔNG TIN LẤY TỪ HỢP ĐỒNG
     */
    //_________Phân loại vào ra (1-Hợp đồng bán ra/2-Hợp đồng mua vào) (CONTRACT_OUTIN in cf_constant)
    outin: { type: Number, default: 1, enum: [1, 2] },

    //_________Phân loại NA (Thực/Gửi dấu) (CONTRACT_TA in cf_constant)
    real: { type: Number, default: 1 },

    //_________Phân loại theo lĩnh vực (type = 3) (POSTMAN -> ITEM - > DOCTYPE)
    field: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },

    //_________Phân loại theo Đơn vị (POSTMAN ITEM -> CONTACT)
    dependentUnit: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Phân loại theo Phụ trách (POSTMAN ITEM -> CONTACT)
    personInCharge: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Phân loại theo Chủ trì (POSTMAN ITEM -> CONTACT)
    chair: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Bên mua (POSTMAN ITEM > CONTACT)
    buyerInfo: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Bên bán (POSTMAN ITEM > CONTACT)
    sellerInfo: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },

    //_________Công ty-Được xác định theo IPC(*)
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },

    //_________Dự án-Được xác định theo IPC(*)
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },

    //_________Hợp đồng-Được xác định theo IPC(*)
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'contract',
    },

    /**
     * END THÔNG TIN LẤY TỪ HỢP ĐỒNG
     */
    /**
     * Kế hoạch/Thực hiện
     * 1-Kế hoạch
     * 2-Thực tế
     */
    plan: { type: Number, default: 1, enum: [1, 2] },
    /**
     * Phân loại
     * 1-Tạm ứng
     * 2-Thanh toán
     */
    type: { type: Number, default: 1, enum: [1, 2] },

    //_________Nội dung(*)
    name: String,

    //_________Mã hiệu
    sign: String,

    //_________Ngày hoạch toán (*)
    date: { type: Date, default: Date.now },

    //_________Mô tả
    description: String,

    //_________Ghi chú
    note: String,

    //_________(1)Giá trị nghiệm thu trước VAT
    acceptance: { type: Number, default: 0 },

    //_________(2)Giá trị nghiệm thu phần VAT
    vatAcceptance: { type: Number, default: 0 },

    //_________(3)Giá trị nghiệm thu phát sinh trước VAT
    plusAcceptance: { type: Number, default: 0 },

    //_________(4)Giá trị nghiệm thu phát sinh phần VAT
    vatPlusAcceptance: { type: Number, default: 0 },

    //_________(5)Giá trị giữ lại
    retainedValue: { type: Number, default: 0 },

    //_________(6)Thu hồi tạm ứng
    advancePaymentDeduction: { type: Number, default: 0 },

    //_________(7)Khấu trừ khác (nếu có)
    otherDeduction: { type: Number, default: 0 },

    //_________((8) = (1 + 2 + 3 + 4) - (5 + 6 + 7))Đề nghị tạm ứng/thanh toán
    recommendedPayment: { type: Number, default: 0 },

    //_________(9)Thời hạn thanh toán (Để theo dõi công nợ***)
    timeForPayment: { type: Date, default: Date.now },

    //_________(10)Đã giải ngân
    amountPaid: { type: Number, default: 0 },

    //_________((11) = 8- 10) Còn lại chưa giải ngân (Để theo dõi công nợ***)
    remainingPayment: { type: Number, default: 0 },

    /**
     * XUẤT HOÁ ĐƠN
     */
    //_________(1) Giá trị trước VAT
    revenue: { type: Number, default: 0 },
    //_________(2) Giá trị VAT
    vatRevenue: { type: Number, default: 0 },
    //_________(3) Ngày xuất hóa đơn
    vatDate: { type: Date, default: Date.now },

    /**
     * USD-NGOẠI TỆ
     */
    //_________Tỷ giá hối đoái
    fcuExRate: { type: Number, default: 0 },

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
