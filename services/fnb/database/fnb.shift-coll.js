'use strict'
/**
 * CA LÀM VIỆC
 */
const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('fnb_shift', {
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
    //_________Nội dung
    name: String,
    //_________Ghi chú
    note: String,
    /**
     * CHẤM CÔNG, TÍNH LƯƠNG VÀ QUY TRÁCH NHIỆM
     */
    //_________Nhân viên ca chính
    staffs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    //_________Số giờ làm việc của ca chính
    workingHours: {
        type: Number,
        default: 0,
    },
    //_________Lương chính thức/giờ
    officialStaffSalar: {
        type: Number,
        default: 0,
    },
    //_________Nhân viên ca phụ
    subStaffs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    //_________Số giờ làm việc của ca phụ
    subWorkingHours: {
        type: Number,
        default: 0,
    },
    //_________Lương thử việc/giờ
    trialStaffSalary: {
        type: Number,
        default: 0,
    },
    //_________Tổng lương
    staffSalaryTotal: {
        type: Number,
        default: 0,
    },
    /**
     * PHÂN LOẠI THỐNG KÊ
     */
    /**
     * Bật chiến dịch truyền thông/marketing (được gán từ Funda)
     * 1-Không bật
     * 2-Bật
     */
    campaign: {
        type: Number,
        default: 1,
    },
    /**
     * Mùa trong năm (theo lịch âm)
     * 1-Xuân
     * 2-Hạ
     * 3-Thu
     * 4-Đông
     */
    seasons: {
        type: Number,
        default: 1,
    },
    /**
     * Phân loại ca làm việc (cập nhật theo funda)
     * 1-Sáng
     * 2-Chiều
     * 3-Tối
     */
    shiftType: {
        type: Number,
        default: 1,
    },
    /**
     * THỐNG KÊ
     */
    /**
     * Tình trạng đã nộp tiền mặt về công ty hay chưa
     * 1-Chưa
     * 2-Đã nộp
     */
    paidStatus: {
        type: Number,
        default: 1,
    },
    /**
     * BÀN GIAO CA
     */
    //_________Số lượng lỗi
    numberOfMistakes: { type: Number, default: 0 },
    //_________Giá trị bị phạt
    amountOfMistakes: { type: Number, default: 0 },
    //______Tiền đầu ca
    openingCash: {
        type: Number,
        default: 0,
    },
    //______Kiểm kê cuối ca
    closingCash: {
        type: Number,
        default: 0,
    },
    //______Phát sinh trong ca
    incurredCash: {
        type: Number,
        default: 0,
    },
    //______Số size M đầu ca
    numberOfOpeningSizeM: {
        type: Number,
        default: 0,
    },
    //______Số size L đầu ca
    numberOfOpeningSizeL: {
        type: Number,
        default: 0,
    },
    //______Số size M cuối ca (End of Term)
    numberOfEotSizeM: {
        type: Number,
        default: 0,
    },
    //______Số size L cuối ca (End of Term)
    numberOfEotSizeL: {
        type: Number,
        default: 0,
    },
    //______Số size M sử dụng trong ca
    numberOfSizeM: {
        type: Number,
        default: 0,
    },
    //______Số size L sử dụng trong ca
    numberOfSizeL: {
        type: Number,
        default: 0,
    },
    //______Tiền mặt
    cashAmount: {
        type: Number,
        default: 0,
    },
    //______Chuyển khoản
    transferAmount: {
        type: Number,
        default: 0,
    },
    /**
     * GIÁT TRỊ
     */
    //______Tổng doanh số
    total: {
        type: Number,
        default: 0,
    },
    //______Thành tiền (đã trừ giảm giá, Chiết khấu)
    amount: {
        type: Number,
        default: 0,
    },
    //______VAT thành tiền
    vatAmount: {
        type: Number,
        default: 0,
    },
    /**
     * SỐ LƯỢNG SẢN PHẨM VÀ ĐƠN HÀNG
     */
    //______Số đơn hàng
    numberOfOrders: {
        type: Number,
        default: 0,
    },
    //______Số đơn hàng bị hủy
    numberOfCancelOrders: {
        type: Number,
        default: 0,
    },
    //______Doanh số đơn hàng bị hủy
    totalOfCancelOrders: {
        type: Number,
        default: 0,
    },
    //______Số lượng sản phẩm (Không tính với product là Topping)
    numberOfProducts: {
        type: Number,
        default: 0,
    },
    //______Số đơn Off
    numberOfOrders1: {
        type: Number,
        default: 0,
    },
    //______Số đơn Grab
    numberOfOrders2: {
        type: Number,
        default: 0,
    },
    //______Số đơn Shopee
    numberOfOrders3: {
        type: Number,
        default: 0,
    },
    //______Số đơn Gojek
    numberOfOrders4: {
        type: Number,
        default: 0,
    },
    //______Số đơn Baemin
    numberOfOrders5: {
        type: Number,
        default: 0,
    },
    //______Số đơn Loship
    numberOfOrders6: {
        type: Number,
        default: 0,
    },
    //______Số đơn Bee
    numberOfOrders7: {
        type: Number,
        default: 0,
    },
    //______Tổng doanh số Off
    total1: {
        type: Number,
        default: 0,
    },
    total2: {
        type: Number,
        default: 0,
    },
    total3: {
        type: Number,
        default: 0,
    },
    total4: {
        type: Number,
        default: 0,
    },
    total5: {
        type: Number,
        default: 0,
    },
    total6: {
        type: Number,
        default: 0,
    },
    total7: {
        type: Number,
        default: 0,
    },
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
