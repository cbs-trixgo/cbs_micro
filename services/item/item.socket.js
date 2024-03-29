const {
  EVENT_SOCKET_CONSTANT_ITEM,
} = require('./helper/item.events-socket-constant')
const { sendDataToMultilSocketsOfListUser } = require('../../tools/socket')

exports.ITEM_SOCKET = {
  /**
   * Dev: MinhVH
   * Func: Cập nhật trạng thái UI chạy giá vốn
   * Date: 08/01/2024
   */
  [EVENT_SOCKET_CONSTANT_ITEM.ITEM_CSS_EXPORT_ALL_CONTACTS]: function (data) {
    let socket = this
    let listUserActive = socket.$service.listUserConnected
    let io = socket.$service.io
    let { receiverID } = data.data

    sendDataToMultilSocketsOfListUser({
      listUserConnected: listUserActive,
      arrReceiver: [receiverID],
      data,
      event: [EVENT_SOCKET_CONSTANT_ITEM.ITEM_SSC_EXPORT_ALL_CONTACTS],
      io,
    })
  },
}
