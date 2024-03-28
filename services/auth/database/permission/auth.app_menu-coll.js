'use strict'

const DATABASE_MIDDLEWARE = require('../../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('app_menu', {
    /**
     * Thuộc về ứng dụng nào
     */
    app: {
        type: Schema.Types.ObjectId,
        ref: 'app',
    },
    /**
     * Tên menu (ví dụ: Tài liệu yêu cầu làm rõ thông tin)
     */
    name: String,
    /**
     * Ký hiệu menu, sử dụng để làm url
     */
    slug: String,
    //_________Icon
    image: {
        type: String,
        defautl: 'icon-bullet.svg',
    },
    /**
     * Menu cha (sử dụng để hiển thị cây menu theo quy tắc đệ quy)
     */
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'app_menu',
    },
    /**
     * Để populate child
     */
    level: {
        type: Number,
        default: 1,
    },
    /**
     * Thứ tự để hiển thị giữa các menu cùng cấp
     */
    order: {
        type: Number,
        default: 1,
    },
    userCreate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
})
