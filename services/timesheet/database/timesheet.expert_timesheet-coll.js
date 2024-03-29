'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

module.exports = DATABASE_MIDDLEWARE('expert_timesheet', {
  //________Công ty thuê chuyên gia (*)
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  //________Dự án/Phòng ban
  project: {
    type: Schema.Types.ObjectId,
    ref: 'department',
  },
  //_______Chức vụ/vị trí/Bộ phận
  position: {
    type: Schema.Types.ObjectId,
    ref: 'position',
  },
  //_________Đơn vị cơ sở/Cửa hàng
  funda: {
    type: Schema.Types.ObjectId,
    ref: 'funda',
  },
  //_________Ca làm việc
  shift: {
    type: Schema.Types.ObjectId,
    ref: 'fnb_shift',
  },
  //________Hạng mục cha
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'expert_timesheet',
  },
  //_________Admin (được quyền xem, sửa)
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  //_________Thành viên (được quyền xem)
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  //________Nội dung công việc (*)
  name: String,

  //________Phân loại: 1 quản lý, 2 sản xuất
  type: {
    type: Number,
    default: 1,
  },

  /**
   * Phân loại lễ tết
   * 1-Ngày bình thường
   * 2-Ngày nghỉ phép
   * 3-Ngày lễ, tết
   * 4-Ngày công tác
   */
  subtype: {
    type: Number,
    default: 1,
  },

  //________Người thực hiện
  assignee: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },

  //_______Ngày hoàn thành
  date: { type: Date, default: Date.now },

  //________Số giờ hoàn thành
  hours: {
    type: Number,
    default: 0,
  },

  //________Đơn giá
  unitprice: {
    type: Number,
    default: 0,
  },

  //________Thành tiền
  amount: {
    type: Number,
    default: 0,
  },

  //________Trạng thái (1- Hoàn thành/ 0 Chưa hoàn thành)
  status: {
    type: Number,
    default: 0,
  },

  //_________Người phê duyệt
  approver: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },

  //_________Thời điểm phê duyệt
  timeApproved: { type: Date, default: null },

  //________Link với biểu khối lượng công việc
  task: {
    type: Schema.Types.ObjectId,
    ref: 'pcm_plan_task',
  },

  //________Link với biểu khối lượng công việc
  work: {
    type: Schema.Types.ObjectId,
    ref: 'budget_work',
  },

  //________Ghi chú
  note: String,

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
