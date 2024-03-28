"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 * HỒ SƠ DỰ THẦU TÀI CHÍNH
 * - Mỗi 1 công việc, 1 nhà thầu chỉ tồn tại 1 mẩu tin duy nhất (job + finOne)
 * - Trường hợp cập nhật chào giá bổ sung => tạo thêm hồ sơ dự thầu mới trong Hồ sơ mời thầu
 */
module.exports  = DATABASE_MIDDLEWARE("bidding_quotation", {
    /**
     * CẤU HÌNH PHÂN LOẠI
     */ 
    //_________Chủ đầu tư
    client: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    //_________Nhà thầu dự thầu
    contractor: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    //_________Hồ sơ mời thầu
    doc: {
        type: Schema.Types.ObjectId,
        ref : "bidding_doc"
    },
    //_________Hạng mục
    item: {
        type: Schema.Types.ObjectId,
        ref : "bidding_bill_item"
    }, 
    //_________Nhóm dữ liệu
    group: {
        type: Schema.Types.ObjectId,
        ref : "bidding_bill_group"
    },  
    //_________Công việc mời thầu
    work: {
        type: Schema.Types.ObjectId,
        ref : "bidding_bill_work"
    }, 
    //_________Mã công tác trong datahub (phục vụ thống kê)
    datahubJob: {
        type: Schema.Types.ObjectId,
        ref : "datahub_job"
    },
    /**
     * Khối lượng chào thầu
     * Mặc định lấy theo KL của CĐT đưa ra
     */
    quantity: { type: Number, default: 0 },
    //_________Đơn giá vật tư
    unitprice1: { type: Number, default: 0 },
    //_________Đơn giá nhân công
    unitprice2: { type: Number, default: 0 },
    //_________Đơn giá máy móc/thiết bị
    unitprice3: { type: Number, default: 0 },
    //_________Tổng đơn giá (unitprice1+unitprice2+unitprice3)
    unitprice: { type: Number, default: 0 },
    //_________Thành tiền tính toán từ Datahub
    amount: { type: Number, default: 0 },
    /**
     * CHÀO VIỆC PHÁT SINH
     */  
    //_________Tên công việc
    name: String,
    //_________Đơn vị tính
    unit: String,
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