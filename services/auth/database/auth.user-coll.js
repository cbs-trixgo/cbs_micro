'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('user', {
    //_________Thuộc nền tảng
    platform: {
        type: Number,
        default: 1,
        enum: [1, 2, 3],
    },
    //_______Công ty
    company: {
        type: Schema.Types.ObjectId,
        ref: 'company',
    },
    //_______Email
    email: {
        type: String,
        require: true,
        unique: true,
    },
    //_______Mật khẩu
    password: String,
    //_______Điện thoại
    phone: String,
    //_______Tên (vd: Nam)
    firstname: String,
    //_______Họ (vd: Nguyễn Văn)
    lastname: String,
    //_______Họ và tên (vd: Nguyễn Văn Nam)
    fullname: String,
    bizfullname: String,
    //_______Họ và tên sau khi convert-chữ thường, không dấu (vd: nguyen van nam-trx)
    fullnamecv: String,
    //_______Ngày sinh
    birthDay: {
        type: Date,
        default: null,
    },
    //_______Giới tính (1-Nam/2-Nữ/3-Khác)
    gender: {
        type: Number,
        default: 1,
    },
    //_______Thuộc về phòng ban/dự án nào
    department: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    //_______Chức vụ/vị trí/Bộ phận
    position: {
        type: Schema.Types.ObjectId,
        ref: 'position',
    },
    //_______Link với các danh bạ của các phân vùng: quản lý thông tin, bảng lương/tài chính
    contacts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'contact',
        },
    ],
    //_______Ảnh đại diện
    image: {
        type: String,
        default: 'user_default.png',
    },
    //_______Ảnh chữ ký
    signature: {
        type: String,
        default: 'signature_default.png',
    },
    /**
     * Trạng thái hoạt động.
     * 1. Hoạt động
     * -1: Chưa xác thực mail
     * 0. Khóa
     */
    status: {
        type: Number,
        default: 1,
    },
    /**
     * (Xem xét đưa hết về 1 level, bổ sung app quản trị và phân quyền)
     * 0: Admin công ty  (Owner Company)
     * 1: Thành viên Thường (User)
     * 50: Supporter
     * 100: Supper Admin
     */
    level: {
        type: Number,
        default: 1,
    },
    //_______Số lần đăng nhập hệ thống
    numLog: {
        type: Number,
        default: 0,
    },
    //_______Lần truy cập cuối cùng
    lastLog: {
        type: Date,
        default: null,
    },
    /**
     * Danh sách pin cuộc hội thoại
     */
    conversationsPin: [
        {
            type: Schema.Types.ObjectId,
            ref: 'message_conversation',
        },
    ],
    /**
     * Cấu hình hiển thị view mặc định ở trang chủ
     * 1: Giao diện Gmail (chung cho cấp nhân viên)
     * 2: Giao diện cho cấp Quản lý
     * 3: Giao diện cho cấp Lãnh đạo
     */
    displayHomeConfig: {
        type: Number,
        default: 1,
    },
    //_______Ngôn ngữ hiển thị (đồng bộ với moment.js)
    lang: {
        type: String,
        default: 'vn',
    },
    //_______Yêu cầu gửi đi tới người khác(Mình gửi đi)
    sendToFriends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    //_______Yêu cầu nhận được từ người khác gửi đến(Người khác gửi đến)
    receiveFromFriends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    //_______Danh sách bạn bè
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    /**
     * Dung lượng sử dụng trong tất cả các ứng dụng
     * khi record của các ứng dụng insert file thì sẽ ++ (increment)
     */
    storageUse: {
        type: Number,
        default: 0,
    },
    //_______Code reset mật khẩu
    codeReset: String,
    /**
     * Quản lý thông tin Device Mobile
     */
    devices: [
        {
            deviceName: { type: String },
            deviceID: { type: String },
            registrationID: { type: String },
            oneSignalID: { type: String }, //id cho dịch vụ push noti: OneSignal
            /**
             * vì mobile có 2 loại app khác nhau
             *  1/ WEB_CBS          : ****
             *  2/ MOBILE_TEARSER   : ****
             *  3/ MOBILE_CBS       : **** (không có phần chatting, nên các event chatting của loại MOBILE_CBS sẽ không cần push đến đây)
             *  4/ MOBILE_FNB       : ****
             */
            env: {
                type: Number,
                default: 1,
            },
        },
    ],
    /**
     * Group default để chọn khi tạo chủ đề
     */
    groupDefault: {
        type: Schema.Types.ObjectId,
        ref: 'pcm_plan_group',
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
