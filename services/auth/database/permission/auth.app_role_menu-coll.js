'use strict'

const DATABASE_MIDDLEWARE = require('../../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('app_role_menu', {
  /**
   * Công ty (đang truy cập vào công ty nào) (lấy theo role))
   */
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  /**
   * Ứng dụng (sử dụng theo nguyên tắc pre-cal để tăng hiệu suất truy vấn)(lấy theo role)
   */
  app: {
    type: Schema.Types.ObjectId,
    ref: 'app',
  },

  /**
   * Nhóm chức năng dự án
   */
  role: {
    type: Schema.Types.ObjectId,
    ref: 'app_role',
  },
  /**
   * Menu chức năng
   * Quyền truy cập menu của 1 user là tổng quyền của các Role mà user đó thuộc về
   */
  menu: {
    type: Schema.Types.ObjectId,
    ref: 'app_menu',
  },
  /**
   * Đọc.
   * 1. cho phép đọc
   * 0. không cho phép đọc
   */
  read: {
    type: Number,
    default: 0,
  },
  /**
   * Tạo mới.
   * 1. cho phép tạo mới
   * 0. không cho tạo mới
   */
  create: {
    type: Number,
    default: 0,
  },
  /**
   * Cập nhật.
   * 1. cho phép cập nhật
   * 0. không cho cập nhật
   */
  update: {
    type: Number,
    default: 0,
  },
  /**
   * Xóa.
   * 1. cho phép xóa
   * 0. không cho xóa
   */
  delete: {
    type: Number,
    default: 0,
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
