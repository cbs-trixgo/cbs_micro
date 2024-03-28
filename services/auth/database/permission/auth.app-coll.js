'use strict'

const DATABASE_MIDDLEWARE = require('../../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('app', {
  /**
   * Tên app
   */
  name: String,
  /**
   * Ký hiệu app không được bỏ trống, không được trùng
   */
  slug: {
    type: String,
    require: true,
    unique: true,
  },
  /**
   * Lĩnh vực hoạt động của ứng dụng
   */
  field: {
    type: Number,
    default: 0,
  },
  description: String,
  image: {
    type: String,
    defautl: 'app_default.png',
  },
  files: [
    {
      type: Schema.Types.ObjectId,
      ref: 'file',
    },
  ],
  background: {
    type: String,
    defautl: '#3BBEFF',
  },
  /**
   * Khóa ứng dụng
   */
  lock: {
    type: Number,
    default: 1,
  },
  /**
   * Cho phép hiển thị (1) hay không ở ngoài trang chủ (0)
   */
  show: {
    type: Number,
    default: 1,
  },
  /**
   * Thông báo ứng dụng mới sắp sửa phát hành (1/0)
   */
  coming: {
    type: Number,
    default: 0,
  },
  /**
   *  Công ty sử dụng ứng dụng (sử dụng để theo dõi thông tin)
   */
  companies: [
    {
      type: Schema.Types.ObjectId,
      ref: 'company',
    },
  ],
  /**
   * User sử dụng (sử dụng để đánh giá tiềm năng
   * kiểm tra quyền truy cập ứng dụng của user).
   */
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  /**
   * Số lượng truy cập vào ứng dụng
   */
  traffic: {
    type: Number,
    default: 0,
  },
  /**
   * Người tạo
   */
  userCreate: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  /**
   * Người cập nhật
   */
  userUpdate: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
})
