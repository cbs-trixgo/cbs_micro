'use strict'

const DATABASE_MIDDLEWARE = require('../../../tools/db/database.middleware')
const Schema = require('mongoose').Schema

const GeoSchema = new Schema({
  type: {
    type: String,
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
  },
})

module.exports = DATABASE_MIDDLEWARE('message_message', {
  /**
   *  Người gửi tin nhắn
   */
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },

  /**
   * Người nhận tin nhắn
   */
  receivers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],

  /**
   * Nội dung của tin nhắn
   */
  content: {
    type: String,
    default: '',
  },

  /**
   * Tin nhắn thuộc cuộc hội thoại
   */
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'message_conversation',
  },

  /**
   * Tin nhắn được trích dẫn
   */
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'message_message',
  },

  /**
   * Tin nhắn chia sẻ vị trí
   */
  location: GeoSchema,

  /**
   * Các files được đính kèm trong tin nhắn
   */
  files: [
    {
      file: {
        type: Schema.Types.ObjectId,
        ref: 'message_conversation_file',
      },
      /**
       * Trạng thái file (hiện chưa dùng tới)
       * 1: Hiển thị
       * 2: Đã thu hồi (tất cả mọi người đều không thấy)
       */
      status: {
        type: Number,
        default: 1,
      },
      // Danh sách user đã xoá tin nhắn file (xoá chỉ mình tôi)
      usersDelete: [
        {
          type: Schema.Types.ObjectId,
          ref: 'user',
        },
      ],
    },
  ],

  /**
   * Trạng thái của tin nhắn (hiện chưa dùng tới)
   * 0: đã gửi nhưng chưa xem/ chưa nhận))
   * 1: đã nhận
   * 2: đã xem
   */
  status: {
    type: Number,
    default: 0,
  },

  /**
   * Loại tin nhắn
   * 0: Tin nhắn thông thường
   * 1: Tin nhắn ảnh
   * 2: Tin nhắn file
   * 3: Tin nhắn link (bỏ => sử dụng chatting.conversation_link-model)
   * 4: Tin nhắn reminder
   * 5: Tin nhắn poll
   * 6: Tin nhắn share location
   * 7: Tin nhắn share contact
   * 8: Tin nhắn NPS
   *
   * 101: Thêm thành viên vào cuộc hội thoại
   * 102: Xóa thành viên khỏi cuộc hội thoại
   *
   * 103: Đổi tên cuộc hội thoại
   * 104: Đổi logo cuộc hội thoại
   *
   * 105: Xét thêm admin cuộc hội thoại
   * 106: Xoá bỏ quyền admin của member trong cuộc hội thoại
   * 107: Thành viên rời khỏi cuộc hội thoại
   *
   * 108: Pin 1 tin nhắn trong cuộc hội thoại
   * 109: Bỏ Pin 1 tin nhắn trong cuộc hội thoại
   *
   * 110: Tạo cuộc bình chọn trong cuộc hội thoại
   * 111: Tham gia bình chọn trong cuộc hội thoại
   * 112: Thay đổi bình chọn trong cuộc hội thoại
   * 113: Đóng bình chọn trong cuộc hội thoại
   *
   * 114: Tạo nhắc hẹn trong cuộc hội thoại
   * 115: Cập nhật nhắc hẹn trong cuộc hội thoại
   * 116: Xác nhận tham gia nhắc hẹn trong cuộc hội thoại
   * 117: Xác nhận không tham gia nhắc hẹn trong cuộc hội thoại
   * 118: Xoá nhắc hẹn trong cuộc hội thoại
   *
   * 119: Tạo nps trong cuộc hội thoại
   * 120: Tham gia nps trong cuộc hội thoại
   * 121: Thay đổi nps trong cuộc hội thoại
   * 122: Đóng nps trong cuộc hội thoại
   */
  type: {
    type: Number,
    default: 0,
  },

  /**
   * Danh sách user đã xem tin nhắn này
   */
  usersSeen: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],

  /**
   * Danh sách users đã xoá tin nhắn (xoá chỉ mình tôi)
   */
  usersDelete: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],

  /**
   * Danh sách users được chỉ định (thêm/xoá thành viên, xét/bỏ admin)
   * (Contact bạn bè - tin nhắn chia sẻ danh bạ)
   */
  usersAssigned: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],

  /**
   * Tin nhắn bình chọn
   */
  poll: {
    type: Schema.Types.ObjectId,
    ref: 'message_message_poll',
  },

  /**
   * Tin nhắn lời nhắc
   */
  reminder: {
    type: Schema.Types.ObjectId,
    ref: 'message_message_reminder',
  },

  /**
   * Tin nhắn NPS
   */
  nps: {
    type: Schema.Types.ObjectId,
    ref: 'message_message_nps',
  },

  /**
   * Reaction message
   */
  reactions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'message_message_reaction',
    },
  ],
})
