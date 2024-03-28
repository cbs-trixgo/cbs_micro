'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

/**
 * DỰ ÁN/PHÒNG BAN
 */
module.exports = DATABASE_MIDDLEWARE('department', {
    //_________Công ty/Chủ đầu tư
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Phần tử cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_________Level
    level: {
        type: Number,
        default: 1,
    },
    //_________Quản trị
    admins: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    //_________Mod
    mods: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    //_________Thành viên
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    /**
     * Phiên bản cao cấp/trả phí: Cho phép add thành viên ngoài phân vùng vào dự án (Hệ thống cấu hình)
     * 0-Không cho phép, chỉ cho phép add user trong nội bộ phân vùng
     * 1-Cho phép ngoài phân vùng (phải trả phí)
     */
    premium: {
        type: Number,
        default: 0,
    },
    /**
     * Số thành viên tối đa bên ngoài phân vùng được phép add vào (Hệ thống cấu hình)
     */
    maxMembers: {
        type: Number,
        default: 0,
    },
    /**
     * Phân loại
     * 1-Phòng ban
     * 2-Dự án
     */
    type: { type: Number, default: 1 },
    /**
     * Giai đoạn dự án
     * 1-Đang phát triển
     * 2-Lập kế hoạch-triển khai
     * 3-Thiết kế
     * 4-Đấu thầu
     * 5-Xây dựng
     * 6-Khác
     */
    stage: { type: Number, default: 1 },
    /**
     * Ontime
     * 1-Ontime
     * 2-Offtime
     */
    ontime: { type: Number, default: 1 },
    /**
     * Onbudget
     * 1-Onbudget
     * 2-Offbudget
     */
    onbudget: { type: Number, default: 1 },
    /**
     * Trạng thái triển khai
     * 1-Đang triển khai
     * 2-Bàn giao
     * 3-Hoàn thành
     * 4-Tạm dừng
     */
    status: { type: Number, default: 1 },
    /**
     * Nhóm dự án
     * 1-Quan trọng quốc gia
     * 2-Nhóm A
     * 3-Nhóm B
     * 4-Nhóm C
     */
    projectType: { type: Number, default: 1 },
    /**
     * Nguồn vốn
     * 1-Ngân sách
     * 2-Tư nhân
     * 3-...
     * 4-...
     */
    projectCapital: { type: Number, default: 1 },
    /**
     * Loại công trình
     * 1-Dân dụng
     * 2-...
     * 3-...
     * 4-...
     */
    buildingType: { type: Number, default: 1 },
    /**
     * Cấp công trình
     */
    buildingGrade: { type: Number, default: 1 },
    /**
     * THÔNG TIN CĂN BẢN
     */
    //_________Tên
    name: String,
    //_________Mô tả
    description: String,
    //_________Ký hiệu
    sign: String,
    //_________Chủ đầu tư
    owner: String,
    //_________Địa chỉ theo google map
    location: String,
    //_________Địa chỉ dự án/phòng ban
    address: String,
    //_________Khu vực dự án/phòng ban
    area: {
        type: Schema.Types.ObjectId,
        ref: 'area',
    },
    //_________Kế hoạch bắt đầu
    startTime: { type: Date, default: null },
    //_________Kế hoạch kết thúc
    expiredTime: { type: Date, default: null },
    //_________Thực tế bắt đầu
    actualStartTime: { type: Date, default: null },
    //_________Thực tế kết thúc
    actualFinishTime: { type: Date, default: null },
    //_________Trưởng dự án/phòng ban
    pm: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    //_________Phụ trách chấm công/Trợ lý của PM
    assistant: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    //_________Ghi chú
    note: String,
    /**
     * DOANH THU
     */
    //______Doanh thu
    revenue: {
        type: Number,
        default: 0,
    },
    //______Doanh thu VAT
    vatRevenue: {
        type: Number,
        default: 0,
    },
    //______Dự báo doanh thu tới khi kết thúc
    forecastRevenue: {
        type: Number,
        default: 0,
    },
    //______VAT
    forecastVatRevenue: {
        type: Number,
        default: 0,
    },
    //______Doanh thu thực tế
    finalRevenue: {
        type: Number,
        default: 0,
    },
    //______VAT
    finalVatRevenue: {
        type: Number,
        default: 0,
    },
    /**
     * NGÂN SÁCH/CHI PHÍ
     */
    //_________Ngân sách/Tổng mức đầu tư/Chi phí
    budget: {
        type: Number,
        default: 0,
    },
    //_________VAT
    vatBudget: {
        type: Number,
        default: 0,
    },
    //______Dự báo ngân sách
    forecastBudget: {
        type: Number,
        default: 0,
    },
    //______VAT
    forecastVatBudget: {
        type: Number,
        default: 0,
    },
    //______Ngân sách thực tế
    finalBudget: {
        type: Number,
        default: 0,
    },
    //______VAT
    finalVatBudget: {
        type: Number,
        default: 0,
    },
    /**
     * LỢI NHUẬN
     */
    //______Lợi nhuận NPV
    npv: {
        type: Number,
        default: 0,
    },
    //______Dự báo Lợi nhuận NPV
    forecastNpv: {
        type: Number,
        default: 0,
    },
    //______Thực tế lợi nhuận
    finalNpv: {
        type: Number,
        default: 0,
    },
    //______Lợi nhuận IRR
    irr: {
        type: Number,
        default: 0,
    },
    //______Dự báo lợi nhuận IRR
    forecastIrr: {
        type: Number,
        default: 0,
    },
    //______Thực tế IRR
    finalIrr: {
        type: Number,
        default: 0,
    },
    /**
     * MUA VÀO
     */
    //______Số lượng hợp đồng mua vào
    numberOfContractIn: {
        type: Number,
        default: 0,
    },
    /** GIÁ TRỊ KÝ */
    //______Giá trị ký hợp đồng trước VAT
    contractValue: {
        type: Number,
        default: 0,
    },
    //______VAT
    contractVatValue: {
        type: Number,
        default: 0,
    },
    //______Giá trị phát sinh trước VAT
    contractPlus: {
        type: Number,
        default: 0,
    },
    //______VAT
    contractVatPlus: {
        type: Number,
        default: 0,
    },
    //______Tạm ứng theo hợp đồng
    contractAdvancePayment: {
        type: Number,
        default: 0,
    },
    /** SẢN LƯỢNG */
    //______Sản lượng trước VAT
    contractProduce: {
        type: Number,
        default: 0,
    },
    //______VAT
    contractVatProduce: {
        type: Number,
        default: 0,
    },
    //______Sản lượng trước VAT
    contractPlusProduce: {
        type: Number,
        default: 0,
    },
    //______VAT
    contractVatPlusProduce: {
        type: Number,
        default: 0,
    },
    //_________Sản lượng còn lại chưa thực hiện
    contractRemainingProduce: { type: Number, default: 0 },

    /** NGHIỆM THU HOÀN THÀNH */
    //______Giá trị nghiệm thu trước VAT
    contractAcceptance: {
        type: Number,
        default: 0,
    },
    //______VAT
    contractVatAcceptance: {
        type: Number,
        default: 0,
    },
    //______Nghiệm thu phát sinh trước VAT
    contractPlusAcceptance: {
        type: Number,
        default: 0,
    },
    //______VAT
    contractVatPlusAcceptance: {
        type: Number,
        default: 0,
    },
    //______Giá trị giữ lại
    contractRetainedValue: {
        type: Number,
        default: 0,
    },
    //______Thu hồi tạm ứng
    contractAdvancePaymentDeduction: {
        type: Number,
        default: 0,
    },
    //______Khấu trừ khác
    contractOtherDeduction: {
        type: Number,
        default: 0,
    },
    //______Đề nghị tạm ứng/thanh toán
    contractRecommendedPayment: {
        type: Number,
        default: 0,
    },
    //______Đã giải ngân tạm ứng
    contractAdvancePaymentPaid: {
        type: Number,
        default: 0,
    },
    //______Đã giải ngân thanh toán
    contractAmountPaid: {
        type: Number,
        default: 0,
    },
    //______Còn lại chưa giải ngân
    contractRemainingPayment: {
        type: Number,
        default: 0,
    },
    //______Dư ứng
    contractAdvancePaymentOverage: {
        type: Number,
        default: 0,
    },
    //______Giá trị quyết toán
    contractFinalValue: {
        type: Number,
        default: 0,
    },
    /**
     * BÁN RA
     */
    //______Bắt đầu mở bán
    openTime: {
        type: Date,
    },
    //______Kết thúc mở bán
    closedTime: {
        type: Date,
    },
    //______Số đại lý tham gia bán hàng
    numberOfAgent: {
        type: Number,
        default: 0,
    },
    //______Số lượng booking
    numberOfBooking: {
        type: Number,
        default: 0,
    },
    //______Giá trị booking
    totalBookingValue: {
        type: Number,
        default: 0,
    },
    //______Số lượng đặt cọc
    numberOfDeposit: {
        type: Number,
        default: 0,
    },
    //______Giá trị đặt cọc
    totalDepositValue: {
        type: Number,
        default: 0,
    },
    //______Số hợp đồng bán ra
    numberOfContract: {
        type: Number,
        default: 0,
    },
    //______Giá trị hợp đồng bán ra
    totalContractValue: {
        type: Number,
        default: 0,
    },
    //______Công nợ phải thu
    receivable: {
        type: Number,
        default: 0,
    },
    /**
     * PHÁT TRIỂN THỊ TRƯỜNG-THAM KHẢO THÊM BẢNG CỦA CBS3
     */
    //______Ước tính giá trị
    estimate: {
        type: Number,
        default: 0,
    },
    //______Ngày liên hệ gần nhất
    lastDateContact: {
        type: Date,
    },
    //______Đầu mối kết nối
    transactionContacts: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //______Khả năng thành công
    likelihoodOfSuccess: {
        type: Date,
    },
    //______Tiến trình cuối cùng
    lastChange: {
        type: Schema.Types.ObjectId,
        ref: 'comment',
    },

    /**
     * ĐẤU THẦU
     */
    //______Tổng số gói thầu
    numberOfPackage: {
        type: Number,
        default: 0,
    },
    //______Số gói chưa thực hiện
    numberOfUnexecutedPackage: {
        type: Number,
        default: 0,
    },
    //______Số gói đang triển khai
    numberOfExecutedPackage: {
        type: Number,
        default: 0,
    },
    //______Số gói đã hoàn thành
    numberOfCompletedPackage: {
        type: Number,
        default: 0,
    },
    //______Giá trị gói thầu chưa triển khai
    amountOfUnexecutedPackage: {
        type: Number,
        default: 0,
    },
    //______Giá trị gói thầu đang triển khai
    amountOfExecutedPackage: {
        type: Number,
        default: 0,
    },
    //______Giá trị gói thầu đã hoàn thành
    amountOfCompletedPackage: {
        type: Number,
        default: 0,
    },
    //______% công tác thầu hoàn thành
    percentOfCompletedPackage: {
        type: Number,
        default: 0,
    },

    /**
     * CÔNG VIỆC
     */
    //______Tổng số cột mốc
    milestones: {
        type: Number,
        default: 0,
    },
    //______Số mốc đã hoàn thành
    completedMilestones: {
        type: Number,
        default: 0,
    },
    //______Tổng số công việc
    tasks: {
        type: Number,
        default: 0,
    },
    //______Tổng số công việc đã hoàn thành
    completedTasks: {
        type: Number,
        default: 0,
    },
    //______Tổng số công việc nghiệm thu
    inspectionTasks: {
        type: Number,
        default: 0,
    },
    //______Tổng số công việc đã nghiệm thu hoàn thành
    completedInspectionTasks: {
        type: Number,
        default: 0,
    },
    //______Số danh bạ
    numberOfContact: {
        type: Number,
        default: 0,
    },
    //______Số biên bản họp
    numberOfMoms: {
        type: Number,
        default: 0,
    },
    //______Số lượng hồ sơ văn bản
    numberOfDocs: {
        type: Number,
        default: 0,
    },
    //______Số lượng hồ sơ văn bản đã hoàn thành
    numberFinishOfDocs: {
        type: Number,
        default: 0,
    },
    //______Số bản vẽ
    numberOfDrawings: {
        type: Number,
        default: 0,
    },
    //______Số báo cáo
    numberOfReports: {
        type: Number,
        default: 0,
    },
    //______Số hồ sơ thanh toán
    numberOfIpcs: {
        type: Number,
        default: 0,
    },
    //______Số RFI
    numberOfRfis: {
        type: Number,
        default: 0,
    },
    //______Số Submitals
    numberOfSubmitals: {
        type: Number,
        default: 0,
    },
    //______Số Punch list
    numberOfPunchLists: {
        type: Number,
        default: 0,
    },
    //______Số hình ảnh
    numberOfPhotos: {
        type: Number,
        default: 0,
    },
    //______Số hồ sơ chất lượng
    numberOfInspections: {
        type: Number,
        default: 0,
    },
    //_________Các bên tham gia dự án
    contractors: [
        {
            type: Schema.Types.ObjectId,
            ref: 'company',
        },
    ],
    //_________Ảnh đại diện
    image: {
        type: String,
        defautl: 'project_default.png',
    },
    //_________Hình ảnh gần đây
    photos: [
        {
            type: Schema.Types.ObjectId,
            ref: 'file',
        },
    ],
    //______Hình ảnh gần đây nhất của dự án
    images: [
        {
            type: Schema.Types.ObjectId,
            ref: 'file',
        },
    ],
    //______Bình luận cuối cùng
    lastComment: {
        type: Schema.Types.ObjectId,
        ref: 'comment',
    },
    //______Last log cuối cùng của dự án
    lastLog: {
        type: Schema.Types.ObjectId,
        ref: 'history_log',
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
