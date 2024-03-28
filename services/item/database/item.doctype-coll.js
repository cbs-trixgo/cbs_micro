"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema    = require('mongoose').Schema;

/**
 *  PHÂN LOẠI KHÁC
 */
module.exports  = DATABASE_MIDDLEWARE("doctype", {
    /** PHÂN LOẠI
    1-Văn Bản Lĩnh vực hồ sơ
    2-Văn Bản Tính chất hồ sơ
    3-Lĩnh vực kinh doanh
    4-Khách hàng phân loại
    5-Công việc, Phân loại khác
    6-Nhân sự, Trình độ
    7-Nhân sự, Chuyên ngành
    8-Nhận sự, Loại HDLD
    9-Nhân sự tình trạng làm việc
    10-Nhân sự Thâm niên
    11-Hành trình khách hàng (CRM): CONINCO, WINGGO, DELIA
    12-Hồ sơ chi tiết từng hành trình khách hàng (CRM): CONINCO,...ảnh/file đính kèm
    13-Nhân sự, chúc vụ
    14-Nhân sự loại chứng chỉ
    15-Nhân sự, Nội dung chứng chỉ
    16-Hợp đồng phân loại công nợ
    17-Hợp đồng nguyên nhân phát sinh
    18-Chung-Nguyên nhân thất bại
    20-Chung các lỗi hay gặp
    21- Công việc, Đánh giá chất lượng
    22-Theo service (áp dụng cho message nps)
    23-Theo service (áp dụng cho message nps)(Không hài lòng)
    24-Kênh bán hàng
    */
    type: { type: Number, default: 1 },
    //_________Do hệ thống quy định hay không (giá trị 1 hoặc trường company = null)
    belongSystem: { type: Number, default: 0 },
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    //_________Phòng ban/dự án
    project: {
        type: Schema.Types.ObjectId,
        ref : "department"
    },
    //_________Phần tử cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: "doctype"
    },
    level: {
        type: Number,
        default: 1
    },
    //_________Phần tử con (Sử dụng dụng cho phân loại của Message NPS)
    childs: [{
        type: Schema.Types.ObjectId,
        ref: "doctype"
    }],
    //_________Tên
    name: String,
    //_________Tên
    namecv: String,
    //_________Mã hiệu
    sign: String,
    //_________Đơn vị tính
    unit: String,
    //_________Mô tả
    description: String,
    //_________Giá trị
    amount: {
        type: Number,
        default: 0
    },
    //_________Nhắc trước thời hạn (giờ)
    alert: {
        type: Number,
        default: 0
    },
    /**
     * Phân loại kênh bán hàng => Để mapping với data cũ
     * 1-Offline
     * 2-Grab
     * 3-Shopee
     * 4-Gojek
     * 5-Baemin
     * 6-Loship
     * 7-Bee
     */
    salesChannel: {
        type: Number,
        default: 1
    },
    //_________Số phần tử con
    amountChilds:  {
        type: Number,
        default : 0
    },
    //_________Link tới Item khác
    linkItem: {
        type: Schema.Types.ObjectId,
        ref: "doctype"
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