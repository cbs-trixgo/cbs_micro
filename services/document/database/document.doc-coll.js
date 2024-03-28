"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

/**
 *  Hồ sơ văn bản
 */
module.exports  = DATABASE_MIDDLEWARE("document_doc", {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
        require:  true,
    },
    //_________Phòng ban/dự án
    project: {
        type: Schema.Types.ObjectId,
        ref : "department",
        require:  true,
    },
    //_________Hợp đồng
    contract: {
        type: Schema.Types.ObjectId,
        ref : "contract"
    },
    //_________Gói/Hạng mục (đã link với contact)
    package: {
        type: Schema.Types.ObjectId,
        ref : "document_package",
        require:  true,
    },
    /**
     * THÔNG TIN CĂN BẢN
     */
    /**
     * Hướng hồ sơ (theo hệ thống)
     * 1: Đến
     * 2: Đi
     * 3: Nội bộ
     */
    direction: { type: Number, default: 1 },
    //_________Tính chất hồ sơ (*)
    type: { type: Number, default: 1 },
    //_________Đơn vị ban hành (bỏ)
    datahubContact: {
        type: Schema.Types.ObjectId,
        require:  true,
        ref : "datahub_contact"
    },
    //_________Đơn vị ban hành (các phân vùng)
    publish: {
        type: Schema.Types.ObjectId,
        require:  true,
        ref : "company"
    },
    //_________Người ban hành
    sender: {
        type: Schema.Types.ObjectId,
        ref : "contact"
    },
    //_________Nơi nhận
    receiver: {
        type: Schema.Types.ObjectId,
        ref : "contact"
    },
    //_________Phân loại 1
    property: {
        type: Schema.Types.ObjectId,
        ref : "doctype"
    },
    //_________Phân loại 2
    field: {
        type: Schema.Types.ObjectId,
        ref : "doctype"
    },
    //_________Phân loại theo khác
    other: {
        type: Schema.Types.ObjectId,
        ref : "doctype"
    },
    //_________Địa chỉ lưu trữ
    storage: {
        type: Schema.Types.ObjectId,
        ref : "storage"
    },
    //_________Ngày tháng văn bản/Ngày đóng dấu
    date: {
        type: Date,
        default: null
    },
    //_________Ngày nhận văn bản/Ngày tháng đến
    receivedDate: {
        type: Date,
        default: null
    },
    //_________Nội dung văn bản (Tiêu đề)
    name: String,
    //_________Nội dung văn bản (Tiêu đề)
    namecv: String,
    //_________Mô tả
    description: String,
    //_________Mô tả
    descriptioncv: String,    
    //_________Số hiệu văn bản
    sign: String,
    //_________Số hiệu hồ sơ lưu (Mã hiệu lưu)
    storeSign: String,
    //_________Số đến (xem xét chính là số hiệu hồ sơ lưu)
    receivedCount: String,
    //_________Định dạng văn bản
    style: String,
    //_________Tình trạng văn bản
    status: String,
    //_________Thời hạn hoàn thành
    deadline: {
        type: Date,
        default: null
    },
    /**
     * Hồ sơ hoàn thành
     * 1-Đang triển khai
     * 2-Hoàn thành
     */
    //_________Trạng thái hoàn thành (0-Chưa hoàn thành/ 1-Hoàn thành)
    completeStatus: {
        type: Number,
        default: 0
    },
    //_________Ghi chú
    note: String,
    //_________Người phê duyệt (Người ký)
    approver: String,
    //_________Số lượng nhận
    amount: { type: Number, default: 1 },
    //_________Số lượng giao
    amountDelivery: { type: Number, default: 0 },
    //_________Có yêu cầu trả lời/ Phản hồi không (0-Không, 1-Có)
    requestResponse: { type: Number, default: 0 },
    //_________Thời hạn phải trả lời/phản hồi
    expiredResponse: {
        type: Date,
        default: null
    },
    //_________File đính kèm
    files: [{
        type: Schema.Types.ObjectId,
        ref : "file"
    }],
    //_________File cuối cùng
    lastFile: {
        type: Schema.Types.ObjectId,
        ref : "file"
    },
    //_________Phiên bản cuối cùng
    lastVersion: {
        type    :  Number,
        default : 0
    },
    //_________Số lượng document con
    amountDocumentChild: {
        type    :  Number,
        default : 0
    },
    //_________Link công việc
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: "pcm_plan_task"
    }],
    //_________Ký xác nhận
    signatures: [{
        type: Schema.Types.ObjectId,
        ref: "signature"
    }],
    //_________User đánh dấu văn bản
    usersMarked: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    /**
     * CẤU TRÚC ĐỆ QUY
     */
    parent: {
        type: Schema.Types.ObjectId,
        ref: "document_doc"
    },
    level: {
        type: Number,
        default: 1
    },
    //_________Giá trị
    value: {
        type: Number,
        default: 0
    },
    /**
     * THÔNG TIN NGƯỜI TẠO/CẬP NHẬT
     */
    author: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
    //_________Phòng ban của người tạo việc
    departmentOfAuthor: {
        type: Schema.Types.ObjectId,
        ref: 'department'
    },
    //_________Công ty của người tạo việc
    companyOfAuthor: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : "user"
    }
})