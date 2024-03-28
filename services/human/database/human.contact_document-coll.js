'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('contact_document', {
    //_________Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_________Dự án đang triển khai
    project: {
        type: Schema.Types.ObjectId,
        ref: 'datahub_project',
    },
    //_________Nhân sự
    contact: {
        type: Schema.Types.ObjectId,
        ref: 'contact',
    },
    //_________Phân loại (1-6)
    /**
     * Hồ sơ chi tiết nhân sự (phân các loại)
     * 1. Lịch sử làm việc ở các đơn vị
     * 2. Kinh nghiệm thực tế tham gia tại các Dự án
     * 3. Lịch sử làm việc theo các Quyết định bổ nhiệm tại các hợp đồng (Chức vụ)
     * 4. Trình độ học vấn + Chuyên ngành đào tạo
     * 5. Bằng cấp chứng chỉ
     * 6. Khác (Bảo hiểm xã hội, tài sản giao nhận, lịch sử tuyển dụng, quá trình làm việc, công tác)
     */
    type: { type: Number, default: 1 },
    //_________Từ ngày/Ngày cấp
    fromDate: { type: Date, default: null },
    //_________Đến ngày/Ngày hết hạn
    toDate: { type: Date, default: null },
    //_________Đơn vị công tác
    workplace: String,
    //_________Người tham chiếu
    reference: String,
    /**
     * Nơi làm việc hiện tại
     * - Thuộc mục kê khai Kinh nghiệm thực tế tham gia tại các Dự án
     * - Phân ra làm 3 object để phục vụ việc query gom nhóm cho tiện
     */
    //_________Tỉnh/Thành phố
    currentArea1: {
        type: Schema.Types.ObjectId,
        ref: 'area',
    },
    //_________Huyện/Quận
    currentArea2: {
        type: Schema.Types.ObjectId,
        ref: 'area',
    },
    //_________Xã/Phường
    currentArea3: {
        type: Schema.Types.ObjectId,
        ref: 'area',
    },
    //_________Gói thầu/Hạng mục tham gia
    item: String,
    //_________Dự án tham gia
    project: String,
    //_________Thuộc chủ đầu tư
    client: String,
    //_________Vị trí đảm nhận/Chức vụ tham gia (/item/doctypes/?tab=13)
    position2: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Thuộc hợp đồng
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'contract',
    },
    //_________Có phải là nơi làm việc hiện tại không (1-Không/2-Có)
    currentStatus: { type: Number, default: 1 },
    /**
     * BẰNG CẤP CHỨNG CHỈ
     */
    //_________Nội dung
    name: String,
    //_________Tên tra cứu
    namecv: String,
    //_________Ký hiệu
    sign: String,
    //_________Nơi cấp
    place: String,
    //_________Ghi chú
    note: String,
    //_________Mô tả
    description: String,
    //_________Số lượng
    number: { type: Number, default: 0 },
    //_________Vị trí lưu trữ
    store: String,
    //_________Trạng thái/Hiệu lực (1/2)
    status: { type: Number, default: 1 },
    /**
     * Lĩnh vực chuyên môn
     * Chuyên ngành đào tạo (/item/doctypes/?tab=7)
     */
    field2: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Trình độ học vấn
    educationalBackground2: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Loại chứng chỉ
    certificateType: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Nội dung lĩnh vực chứng chỉ
    certificateName: {
        type: Schema.Types.ObjectId,
        ref: 'doctype',
    },
    //_________Hạng chứng chỉ (1/2/3/4-Nếu)
    certificateGrade: { type: Number, default: 1 },
    // Thời gian huy động
    timeMobilize: {
        type: Number,
        default: 0,
    },
    // Hệ số
    factor: {
        type: Number,
        default: 0,
    },
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
