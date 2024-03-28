'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 *  BÚT TOÁN (PRODUCT)
 */
module.exports = DATABASE_MIDDLEWARE('financial_general_journal', {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Đơn vị cơ sở
    funda: {
        type: Schema.Types.ObjectId,
        ref: 'funda',
    },
    //_________Dự án/Phòng ban
    project: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_________Hợp đồng
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'contract',
    },
    //_________Kho bãi
    warehouse: {
        type: Schema.Types.ObjectId,
        ref: 'warehouse',
    },
    //_________Hàng hóa/Thành phẩm/Nguyên vật liệu/Tài sản
    goods: {
        type: Schema.Types.ObjectId,
        ref: 'goods',
    },
    //_________Phân loại khác
    subtype: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Phân loại khác (parent)
    parentSubtype: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    /**
     * LINK NGÂN SÁCH
     */
    //_________Ngân sách
    budget: {
        type: Schema.Types.ObjectId,
        ref: 'budget',
    },
    //_________Hạng mục
    budgetItem: {
        type: Schema.Types.ObjectId,
        ref: 'budget_item',
    },
    //_________Nhóm
    budgetGroup: {
        type: Schema.Types.ObjectId,
        ref: 'budget_group',
    },
    //_________Công việc
    budgetWork: {
        type: Schema.Types.ObjectId,
        ref: 'budget_work',
    },
    /**
     * Ghi nhận thực hiện ngân sách
     * 1-Ghi nhận tăng ngân sách thực hiện
     * 2-Ghi nhận giảm ngân sách thực hiện (hoàn ứng,...)
     */
    updown: { type: Number, default: 1 },
    /**
     * LINK TỪ PHIẾU
     */
    //_________Phiếu/chứng từ
    voucher: {
        type: Schema.Types.ObjectId,
        ref: 'financial_voucher',
    },
    //_________Loại chứng từ (phiếu kế toán, thu, chi, nhập, xuất,...)
    type: { type: Number, default: 1 },
    //_________Ngày hoạch toán (mặc định lấy theo ngày của Voucher)
    date: { type: Date, default: Date.now },
    //_________Ngày chứng từ
    dateInvoice: { type: Date, default: Date.now },
    //_________Có phải là phiếu kết chuyển số dư chuyển cuối kỳ hay không
    forward: { type: Number, default: 0 },
    //_________Có phải là phiếu kết chuyển doanh thu chi phí cuối kỳ hay không (Income Statement)
    forwardIs: { type: Number, default: 0 },
    //_________Có phải là phiếu xuất hàng đi mượn hay không (để không chạy giá vốn cho các phiếu này)
    returning: { type: Number, default: 0 },
    /**
     * Phân biệt phiếu tạm ứng hay thanh toán
     * 0-Thanh toán
     * 1-Tạm ứng
     */
    advancePayment: { type: Number, default: 0 },
    //_________Phiếu có hủy hay không
    cancel: { type: Number, default: 0 },
    /**
     * Có phải là hóa đơn dịch vụ hay không
     * 0-Không phải
     * 1-Mua vào
     * 2-Bán ra
     */
    vat: { type: Number, default: 0 },
    //_________Nguồn đến của khách hàng (Facebook, website, zalo, khác)
    source: { type: Number, default: 1 },
    //_________Đơn hàng cũ/mới (cũ là đã từng bán cho khách 1 lần rồi)
    orderNew: { type: Number, default: 1 },
    //_________Chính sách giá bán (buôn/lẻ)
    pricePolicy: { type: Number, default: 1 },
    /**
     * KẾ TOÁN
     */
    //_________Tài khoản nợ
    debit: {
        type: Schema.Types.ObjectId,
        ref: 'account',
    },
    //_________Tài khoản có
    credit: {
        type: Schema.Types.ObjectId,
        ref: 'account',
    },
    //_________Mã khách nợ (dùng cho phiên bản update)
    customerDebit: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //_________Mã khách có (dùng cho phiên bản update)
    customerCredit: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //_________Diễn giải nội dung
    name: String,
    //_________Ghi chú
    note: String,
    //_________Khối lượng/Số lượng (mặc định là 0 để phục vụ việc hạch toán chi phí vào trực tiếp hàng hoá: lô đất, căn hộ)
    quantity: { type: Number, default: 0 },
    /**
     * Đơn giá
     * - Được tính dự theo thành tiền/khối lượng
     * - Khi chạy được giá vốn => nhân ra thành tiền và update cho trường Amount
     */
    unitprice: { type: Number, default: 0 },
    //_________Thành tiền
    amount: { type: Number, default: 0 },
    //_________Có in ra trên phiếu để tính giá trị hay không
    cash: { type: Number, default: 1 },
    //_________Tiền về thực tế (áp dụng theo dõi cho các hoá đơn VAT)
    amountPayment: { type: Number, default: 0 },
    /**
     * USD-NGOẠI TỆ
     */
    //_________Loại ngoại tệ (1/USD)
    fcuType: { type: Number, default: 1 },
    //_________Tỷ giá hối đoái
    fcuExRate: { type: Number, default: 0 },
    //_________Thành tiền ngoại tệ
    fcuAmount: { type: Number, default: 0 },

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
