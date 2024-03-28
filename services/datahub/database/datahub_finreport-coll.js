'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema
/**
 * DATAHUB BÁO CÁO TÀI CHÍNH
 */
module.exports = DATABASE_MIDDLEWARE('datahub_finreport', {
    //_________Nhà thầu
    contractor: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Năm tài chính
    fiscalYear: { type: Number, default: 0 },
    //_________Tổng tài sản
    asset: { type: Number, default: 0 },
    //_________Tổng nợ
    liabilitiy: { type: Number, default: 0 },
    //_________Giá trị tài sản ròng
    netWorth: { type: Number, default: 0 },
    //_________Tài sản ngắn hạn
    currentAsset: { type: Number, default: 0 },
    //_________Nợ ngắn hạn
    shortTermLiabilitiy: { type: Number, default: 0 },
    //_________Vốn lưu động
    workingCapital: { type: Number, default: 0 },
    //_________Tổng doanh thu
    grossRevenue: { type: Number, default: 0 },
    //_________Tổng doanh thu trong lĩnh vực xây dựng
    grossConstructionRevenue: { type: Number, default: 0 },
    //_________Lợi nhuận trước thuế
    grossProfit: { type: Number, default: 0 },
    //_________Lợi nhuận sau thuế (lợi nhuận dòng: = Tổng DT-Tổng CP-Thuế TNDN)
    grossProfitAfterTax: { type: Number, default: 0 },
    //_________Tài liệu đính kèm
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
