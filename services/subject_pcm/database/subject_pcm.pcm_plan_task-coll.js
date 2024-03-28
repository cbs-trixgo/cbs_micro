"use strict";
/**
 * CHỦ ĐỀ
 */
const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("pcm_plan_task", {
    //_________Mã hiệu bằng số do hệ thống tự phát sinh
    suid : {
        type   : String,
        require:  true,
        unique : true
    },
    //_________Công ty phân vùng chứa task
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    /**
     * CẤU TRÚC ĐỆ QUY
     */
    //_________Công việc cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: "pcm_plan_task"
    },
    childs: [{
        type: Schema.Types.ObjectId,
        ref: "pcm_plan_task"
    }],
    level: {
        type: Number,
        default: 1
    },
    /**
     * PHÂN QUYỀN TRUY CẬP
     */
    //_________Người tạo
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
    //_________Người thực hiện
    assignee: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
    //_________Phòng ban của người tạo việc
    departmentOfAssignee: {
        type: Schema.Types.ObjectId,
        ref: 'department'
    },
    //_________Công ty của người thực hiện
    companyOfAssignee: {
        type: Schema.Types.ObjectId,
        ref: 'company'
    },
    //_________Những người liên quan
    related: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    /**
     * Tổng hợp người nhận thông báo
     * 1-author
     * 2-assignee
     * 3-related
     * Người là members của group thì không nhận được thông báo
     * Nhưng được tìm thấy công việc
     */
    cc: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    /**
     * Những người được quyền truy cập
     * 1-author (khi tạo việc xong thì add vào)
     * 2-assignee (khi tạo việc xong thì add vào)
     * 3-related (khi thêm người liên quan thì add vào)
     * 4-người được gửi tới khi tạo phản hồi liên quan của chủ đề
     */
    accessUsers: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    /**
     * Những user chưa xem công việc
     * - Sẽ xóa user khi bấm xem
     * - Sẽ thêm user khi có thông báo mới
     */
    news: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    /**
     * Những người đã xem: dùng để theo dõi những ai đã truy cập vào Task
     * - Không được xóa phần tử đã thêm
     */
    viewedUsers: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    /**
     * PHÂN LOẠI PHỤC VỤ BÁO CÁO
     */
    /**
    /**
     * Phân loại việc Nháp hay Chính thức
     * 0-Chính thức
     * 1-Nháp
     */
    draft: { type: Number, default: 0 },
    /**
     * Phân loại công việc và công việc con
     * 1-Công việc
     * 2-Checklist/Công việc con
     */
    type: { type: Number, default: 1 },
    /**
     * Tính chất
     * 0-Việc thông thường
     * 1-Yêu cầu thông tin
     * 2-Yêu cầu phê duyệt
     * 3-Thanh toán/Chi phí
     * 4-Đấu thầu (lựa chọn nhà thầu)
     * 5-Nghiệm thu chất lượng
     * 6-Yêu cầu sửa chữa
     * 7-Yêu cầu thay đổi
     * 8-Yêu cầu thực hiện
     * 9-Báo cáo
     * 10-Tiến độ
     * 11-Biên bản họp
     * 12-Hóa đơn
     * 13-Đăng bài quảng bá sản phẩm được hệ thống duyệt
     * 14-Thông báo mời thầu
     * 15-Thông báo từ hệ thống
     * 16-Ghi danh
     */
    subtype: { type: Number, default: 0 },
    /**
    /**
     * Upcoming-Sắp diễn ra/tới lượt
     * 1-Mặc định diễn ra
     * 2-Sắp diễn ra
     */
    upcoming: { type: Number, default: 1 },
    /**
     * Phân loại công việc và công việc con
     * 1-Công việc
     * 2-Checklist/Công việc con
     */
    //_________PHÂN LOẠI
    field: {
        type: Schema.Types.ObjectId,
        ref : "doctype"
    },
    /**
     * Trạng thái
     * 1-Khởi tạo
     * 2-Đang triển khai
     * 3-Hoàn thành
     * 4-Treo lại
     * 5-Chờ người khác giải quyết
     * 6-Tiếp tục theo dõi
     */
    status: { type: Number, default: 1 },
    /**
     * Mức độ quan trọng
     * 1-Thấp
     * 2-Bình thường
     * 3-Cao
     */
    priority: { type: Number, default: 2 },
    //_________Phân loại mức độ rủi ro (cao, bình thường, thấp)
    risk: { type: Number, default: 2 },
    //_________Dự án/phòng ban
    project: {
        type: Schema.Types.ObjectId,
        ref : "department"
    },
    //_________Nhóm dữ liệu
    group: {
        type: Schema.Types.ObjectId,
        ref : "pcm_plan_group"
    },
    //_________Thuộc hợp đồng
    contract: {
        type: Schema.Types.ObjectId,
        ref : "contract"
    },
    /**
     * Mốc tiến độ
     * 0-Việc thông thường
     * 1-Pháp lý
     * 2-Thiết kế
     * 3-Dự toán, ngân sách
     * 4-Lựa chọn nhà thầu
     * 5-Thi công
     * 5-Bàn giao
     * 6-Quyết toán
     */
    milestone: { type: Number },
    //_________Template (thuộc Template nào)
    linkTemplate: {
        type: Schema.Types.ObjectId,
        ref : "pcm_plan_task"
    },
    /**
     * THÔNG TIN CĂN BẢN
     */
    //_________Tên công việc (Báo cáo đánh giá)
    name: String,
    //_______Tên sau khi convert-chữ thường, không dấu (bao cao danh gia)
    namecv: String,
    //_________Mã hiệu do người dùng tự đặt
    sign: String,
    //_________Mô tả
    description: String,
    //_______Mô tả convert-chữ thường, không dấu
    descriptioncv: String,
    //_________Ghi chú
    note: String,
    //_______Ghi chú convert-chữ thường, không dấu
    notecv: String,
    //_________Tổng số lượng việc con
    amountSubtask: {
        type: Number, default: 0
    },
    //_________Tổng số lượng việc con đã hoàn thành
    amountFinishedSubtask: {
        type: Number, default: 0
    },
    //_________Tổng số lượng bình luận
    amountComment: {
        type: Number, default: 0
    },
    //_________Tổng số lượng phản hồi liên quan
    amountResponse: {
        type: Number, default: 0
    },
    //_________Tổng số lượng phản hồi liên quan đã đánh dấu
    amountMarkedResponse: {
        type: Number, default: 0
    },
    //_________Tổng số lượng hiện trạng
    amountCurrentStatus: {
        type: Number, default: 0
    },
    //_________Tổng số lượng giải pháp
    amountSolution: {
        type: Number, default: 0
    },
    //_________Tổng số lượng phản hồi khác
    amountResponseOther: {
        type: Number, default: 0
    },
    //_________Ký duyệt xác nhận
    signatures: [{
        type: Schema.Types.ObjectId,
        ref: "signature"
    }],
    /**
     * Các việc có liên quan kèm theo
     * Khi link việc A vào việc B thì ở trong việc B, links cũng chứa A
     */
    links: [{
        type: Schema.Types.ObjectId,
        ref: "pcm_plan_task"
    }],
    linksDocs: [{
        type: Schema.Types.ObjectId,
        ref: "document_doc"
    }],
    //_________File của người tạo việc (Đi kèm đưa sang phản hồi liên quan với type=5)
    authorAttachs: [{
        type: Schema.Types.ObjectId,
        ref: "file"
    }],
    //_________Bình luận cuối cùng
    lastComment: {
        type   : Schema.Types.ObjectId,
        ref: 'pcm_comment'
    },
    /**
     * THÔNG TIN VỀ THỜI HẠN
     */
    //_________Kế hoạch ban đầu
    startTime: { type: Date, default: new Date() },
    //_________Kế hoạch ban đầu
    expiredTime: { type: Date, default: new Date() },
    //_________Kế hoạch thực tế
    actualStartTime: { type: Date, default: new Date() },
    //_________Kế hoạch thực tế
    actualFinishTime: { type: Date, default: new Date() },
    //_________Thông báo trước thời hạn (h)
    alert: { type: Number, default: 0 },
    /**
     * KPI VÀ ĐÁNH GIÁ CÔNG VIỆC
     */
    //_________Mức độ cấp bách
    urgent: { type: Number, default: 1 },
    //_________Mức độ phức tạp
    difficult: { type: Number, default: 1 },
    //_________Hệ số điều chỉnh (kể tới mức độ phức tạp, cấp bách)
    factor: { type: Number, default: 1 },    
    //_________% hoàn thành (max = 100)
    percentage: { type: Number, default: 0, max: 100 },
    //_________Đánh giá tiến độ (1-Đạt/2-Chậm)
    ontime: { type: Number, default: 1 },
    //_________Đánh giá chất lượng
    quality: { type: Number, default: 1, max: 5 },
    //_________Phân loại lỗi
    bugType: {
        type: Schema.Types.ObjectId,
        ref : "doctype"
    },
    //_________Đánh giá chung
    judgement: String,
    //_________Kết thúc thực tế
    finishTime: { type: Date, default: null },
    //_________Giá trị bị phạt
    punish: { type: Number, default: 0 },
    //_________Đơn vị tính
    unit: String,
    //_________Khối lượng
    quantity: { type: Number, default: 0 },
    //_________Đơn giá
    unitPrice: { type: Number, default: 0 },
    /**
     * Thành tiền = quantity*unitPrice
     */
    amount: { type: Number, default: 0 },
    //_________VAT
    vatAmount: { type: Number, default: 0 },
    //_________Mã khách
    contact: {
        type: Schema.Types.ObjectId,
        ref : "contact"
    },
    //_________Dự kiến thời lượng-phục vụ tính tổng số giờ/số ngày để bổ sung việc (h)
    amountoftime: { type: Number, default: 0 },
    //________Thực tế thời lượng-dùng để thống kê cho các việc ước lượng về sau (h)
    executiontime: { type: Number, default: 0 },
    //_________Đơn giá cho 1 giờ làm
    amountPerHour: { type: Number, default: 0 }, 
    //_________Người phê duyệt
    approver:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    //_________Thời điểm phê duyệt
    timeApproved: { type: Date, default: null },
    //_________Giá trị phê duyệt/Giá phê duyệt trúng thầu
    valueApproved: { type: Number, default: 0 },
    /**
     * THÔNG TIN ĐỆ TRÌNH/PHÊ DUYỆT
     * http://thongtindauthau.com/17116/thuat-ngu-tieng-anh-trong-dau-thau-va-hop-dong/
     */
    //_________User đồng ý mở thầu
    openedUsers: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    /**
     * Hồ sơ thầu đã được mở hay chưa (0/1)
     */
    openedStatus: { type: Number, default: 0 },
    /**
     * THÔNG TIN TƯƠNG TÁC
     */
    //_________Những user đánh dấu quan tâm/start/bookmark
    flags: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    //_______Mảng user xoá tạm vào thùng rác
    usersDelete: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    /**
     * Mảng user xoá vĩnh viễn công việc
     * Đồng nghĩa với việc giảm dung lượng sử dụng
     */
    usersPermanentDelete: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
    // Trick reload trang khi import thành công(Đệ)
    timeImportExcel: { type: String, default: new Date() },
})