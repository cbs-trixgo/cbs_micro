'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('contract_bill_job', {
    //_________ Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Dự án
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_________Hợp đồng
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'contract',
    },
    //_________Hạng mục
    item: {
        type: Schema.Types.ObjectId,
        ref: 'contract_bill_item',
    },
    //_________Nhóm dữ liệu
    group: {
        type: Schema.Types.ObjectId,
        ref: 'contract_bill_group',
    },
    /**
     * THÔNG TIN CĂN BẢN
     */
    /**
     * Có phát sinh hay không
     * 0 - Không phát sinh
     * 1 - PS được thanh toán
     * 2 - PS không được thanh toán
     */
    plus: { type: Number, default: 0 },
    //_________Tên công việc
    name: String,
    //_________Mô tả
    description: String,
    //_________Ký hiệu
    sign: String,
    //_________Đơn vị tính
    unit: String,
    //_________Ghi chú
    note: String,
    /**
     * KHỐI LƯỢNG
     */
    //_________Khối lượng ban đầu
    orgQuantity: { type: Number, default: 0 },
    //_________Khối lượng cập nhật triển khai
    currentQuantity: { type: Number, default: 0 },
    //_________Khối lượng dự kiến còn lại
    estimateQuantity: { type: Number, default: 0 },
    //_________Khối lượng đã nghiệm thu hoàn thành
    inspecQuantity: { type: Number, default: 0 },

    /**
     * ĐƠN GIÁ (KHÔNG GỒM VAT)
     */
    //_________Đơn giá ban đầu (chưa gồm VAT)
    orgUnitPrice: { type: Number, default: 0 },
    //_________Đơn giá cập nhật triển khai (chưa gồm VAT)
    currentUnitPrice: { type: Number, default: 0 },
    //_________Đơn giá ước tính còn lại (chưa gồm VAT)
    estimateUnitPrice: { type: Number, default: 0 },

    /**
     * GIÁ TRỊ (KHÔNG GỒM VAT)
     */
    //_________Giá trị ban đầu (chưa gồm VAT)
    orgAmount: { type: Number, default: 0 },
    //_________Giá trị  cập nhật triển khai (chưa gồm VAT)
    currentAmount: { type: Number, default: 0 },
    //_________Giá trị ước tính còn lại (chưa gồm VAT)
    estimateAmount: { type: Number, default: 0 },
    //_________Giá trị đã nghiệm thu hoàn thành
    inspecAmount: { type: Number, default: 0 },

    /**
     * USD-NGOẠI TỆ
     */
    //_________Tỷ giá hối đoái
    fcuExRate: Number,
    //_________Đơn giá ban đầu (chưa gồm VAT)
    fcuOrgUnitPrice: Number,
    //_________Đơn giá cập nhật triển khai (chưa gồm VAT)
    fcuCurrentUnitPrice: Number,
    //_________Đơn giá ước tính còn lại (chưa gồm VAT)
    fcuEstimateUnitPrice: Number,
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
