"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;
/**
 * KẾ HOẠCH DÒNG TIỀN
 */
module.exports  = DATABASE_MIDDLEWARE("cash_flow_plan", {
    /**
     * THÔNG TIN LẤY TỪ HỢP ĐỒNG
     */
    /**
     * Dòng tiền vào ra
     * 1-Bán ra
     * 2-Mua vào
     */
    outin: {
        type: Number,
        default: 1,
        enum: [1,2]
    },
    //_________Phân loại NA (Thực/Gửi dấu) (CONTRACT_TA in cf_constant)
    real: { type: Number, default: 1 },
    //_________Phân loại theo lĩnh vực (type = 3) (POSTMAN -> ITEM - > DOCTYPE)
    field: {
        type: Schema.Types.ObjectId,
        ref : "doctype"
    },  
    //_________Phân loại theo chủ trì (POSTMAN ITEM -> CONTACT)
    chair: {
        type: Schema.Types.ObjectId,
        ref : 'contact'
    },
    //_________Phân loại theo phụ trách (POSTMAN ITEM -> CONTACT)
    personInCharge: {
        type: Schema.Types.ObjectId,
        ref : 'contact'
    },    
    //_________Bên mua (POSTMAN ITEM > CONTACT)
    buyerInfo: {
        type: Schema.Types.ObjectId,
        ref: "contact"
    },
    //_________Bên bán (POSTMAN ITEM > CONTACT)
    sellerInfo: {
        type: Schema.Types.ObjectId,
        ref: "contact"
    },
    //_________Công ty-Được xác định theo CONTACT(*)
    company: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    //_________Dự án-Được xác định theo CONTACT(*) 
    project: {
        type: Schema.Types.ObjectId,
        ref : "department"
    },
    //_________Hợp đồng-Được xác định theo CONTACT(*)
    contract: {
        type: Schema.Types.ObjectId,
        ref : "contract"
    },
    /**
     * THÔNG TIN CHUNG
     */
    //_________Đơn vị cơ sở(*)
    funda : {
        type: Schema.Types.ObjectId,
        ref : "funda"
    },
    //_________ID cash_flow_plan cha
    parent: {
        type: Schema.Types.ObjectId,
        ref : "cash_flow_plan"
    },
    //_________Số cấp
    level: {
        type: Number,
        default: 1,
        enum: [1, 2]
    },
    //_________Admin (được quyền xem, sửa)
    admins : [{
        type   : Schema.Types.ObjectId,
        ref: 'user'
    }],
    //_________Thành viên (được quyền xem)
    members : [{
        type   : Schema.Types.ObjectId,
        ref: 'user'
    }],
    /**
     * Phân loại:
     * 1-Kế hoạch năm
     * 2-Kế hoạch bán hàng
     * 3-Kế hoạch nhập hàng
     * 4-Kế hoạch theo vòng đời dự án
     * 5-Kế hoạch theo hợp đồng/dự án
     * 6-Kế hoạch khác
     */
    type: {
        type: Number,
        default: 5,
        enum: [1,2,3,4,5,6]
    },
    /**
     * Tính chất
     * 1-Sản lượng
     * 2-Doanh thu
     * 3-Dòng tiền
     */
    property: {
        type: Number,
        default: 3,
        enum: [1, 2, 3]
    },
    //_________Tên(*)
    name: String,
    //_________Mã hiệu
    sign: String,
    //_________Ghi chú
    note: String,
    /**
     * Ưu tiên
     * 1-Bình thường
     * 2-Ưu tiên
     */
    priority: {
        type: Number,
        default: 1
    }, 
    /**
     * Trạng thái phê duyệt 
     * 1-Chưa phê duyệt
     * 2-Đã phê duyệt
     */   
    status: {
        type: Number,
        default: 1
    },
    //_________Người phê duyệt
    approver: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
    //_________Thời gian phê duyệt
    timeApproved: {
        type: Date
    },
    //_________Ngày dự kiến/kế hoạch
    date: { type: Date, default: Date.now },
    //_________Ngày thực tế
    realDate: Date,
    /**
     * CHI TIẾT BÚT TOÁN THU
     * Nhập liệu chi tiết ở cấp 3
     */
    //__________Dự kiến
    value: {
        type: Number,
        default: 0
    },
    //__________Thực tế
    realValue: {
        type: Number,
        default: 0
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