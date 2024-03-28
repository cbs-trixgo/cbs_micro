"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 * KẾ HOẠCH LỰA CHỌN NHÀ THẦU
 * - Áp dụng cho tất cả các ngành của nền kinh tế, không chỉ xây dựng
 * - Được triển khai trên cơ sở ngân sách được duyệt
 * - Cũng chính là 1 gói thầu để đem đi mời thầu luôn
 * B1-Lập kế hoạch lựa chọn nhà thầu, phân chia gói thầu (bidding_plan)
 * B2-Phát hành hồ sơ mời thầu (bidding_doc)
 * +++Yêu cầu về kỹ thuật (bidding_request)
 * +++Yêu cầu chào giá (bidding_bill)
 * B3-Nhà thầu dự thầu
 * +++Dự thầu kỹ thuật (bidding_apply)
 * +++Dự thầu tài chính (bidding_quotation)
 */
module.exports  = DATABASE_MIDDLEWARE("bidding_plan", {
    /**
     * THÔNG TIN CHUNG
     */
    //_________Lĩnh vực
    field: {
        type: Schema.Types.ObjectId,
        ref : "datahub_type" 
    },      
    //_________Khu vực (lấy từ thông tin dự án)
    area: {
        type: Schema.Types.ObjectId,
        ref : "area"
    },    
    //_________Chủ đầu tư (lấy từ thông tin dự án)
    client: {
        type: Schema.Types.ObjectId,
        ref : "company"
    }, 
    //_________Dự án
    project: {
        type: Schema.Types.ObjectId,
        ref : "department"
    },
    //_________Quản trị
    admins: [{
        type: Schema.Types.ObjectId,
        ref : "user"
    }],
    //_________Thành viên được quyền xem ngân sách
    members: [{
        type: Schema.Types.ObjectId,
        ref : "user"
    }],
    /**
     * THÔNG TIN GÓI THẦU
     */    
    //_________Phần tử cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: "bidding_plan"
    },
    /**
     * Loại gói thầu
     * 1-Xây lắp
     * 2-Mua sắm thiết bị
     * 3-Tư vấn
     * 4-Khác
     */
    type: { type: Number, default: 1 },
    //_________Tên gói thầu
    name: String,
    //_________Mô tả
    description: String,
    //_________Giá gói thầu
    packagePrice: { type: Number, default: 0 },      
    //_________Ký hiệu gói thầu
    sign: String,
    //_________Ghi chú
    note: String,
    /**
     * Trạng thái triển khai
     * 1-Chưa thực hiện
     * 2-Đang triển khai
     * 3-Đã hoàn thành
     */
    status: { type: Number, default: 1 },
    //_________Phần trăm gói thầu hoàn thành
    percentOfCompletedPackage: { type: Number, default: 0 },
    //_________Kế hoạch bắt đầu chọn
    startTime: { type: Date, default: null },
    //_________Kế hoạch kết thúc chọn
    finishTime: { type: Date, default: null },
    //_________Thực tế bắt đầu chọn
    actualStartTime: { type: Date, default: null },
    //_________Thực tế kết thúc chọn
    actualFinishTime: { type: Date, default: null },
    //_________Thời điểm đóng thầu
    closingTime: { type: Date, default: null },
    /**
     * Hình thức lựa chọn nhà thầu
     * 1-Chào giá cạnh tranh
     * 2-Đấu thầu
     * 3-Chỉ định thầu
     */
    form: { type: Number, default: 1 },
    /**
     * Loại hợp đồng
     * 1-Đơn giá cố định
     * 2-Trọn gói
     * 3-Theo tháng
     */
    contractType: { type: Number, default: 1 },
    //_________Thời gian thực hiện hợp đồng theo mời thầu (ngày)
    duration: { type: Number, default: 0 },
    //_________Progress tiến trình (%)
    progress: { type: Number, default: 0 },   
    /**
     * THÔNG TIN NHÀ THẦU
     */
    //_________Nhà thầu trúng thầu
    bidder: {
        type: Schema.Types.ObjectId,
        ref : "company"
    }, 
    //_________Giá trúng thầu
    tenderPrice: { type: Number, default: 0 },  
    //_________VAT
    vatTenderPrice: { type: Number, default: 0 },
    //_________Link tới hợp đồng
    contract: {
        type: Schema.Types.ObjectId,
        ref : "contract"
    },       
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