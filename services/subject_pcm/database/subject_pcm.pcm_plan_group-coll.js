'use strict'

'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('pcm_plan_group', {
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'department',
  },
  contract: {
    type: Schema.Types.ObjectId,
    ref: 'contract',
  },
  /**
   * Công việc
   */
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'pcm_plan_task',
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  //_________Phân loại công việc/trình duyệt
  //_________Phục vụ để gán type/subtype tự động cho task khi khởi tạo trong thư mục này
  type: { type: Number, default: 1 },
  //_________Phân loại tính chất
  property: {
    type: Schema.Types.ObjectId,
    ref: 'doctype',
  },
  /**
   * Tên
   */
  name: String,
  /**
   * Mã hiệu
   */
  sign: String,
  /**
   * Mô tả
   */
  description: String,
  /**
   * Cha (sử dụng để hiển thị theo quy tắc đệ quy)
   */
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'pcm_plan_group',
  },
  level: {
    type: Number,
    default: 1,
  },
  /**
   * Admin nhóm
   */
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  /**
   * Member nhóm
   */
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  //_________Hình ảnh đại diện
  image: {
    type: Schema.Types.ObjectId,
    ref: 'file',
  },
  userUpdate: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  //______Số lượng công việc
  amountTasks: {
    type: Number,
    default: 0,
  },
})
