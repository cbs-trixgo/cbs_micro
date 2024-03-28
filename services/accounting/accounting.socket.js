const {
    EVENT_SOCKET_CONSTANT_ACCOUNTING,
} = require('./helper/accounting.events-socket-constant')
const { sendDataToMultilSocketsOfListUser } = require('../../tools/socket')

exports.ACCOUNTING_SOCKET = {
    /**
     * Dev: MinhVH
     * Func: Cập nhật trạng thái UI chạy giá vốn
     * Date: 08/01/2024
     */
    [EVENT_SOCKET_CONSTANT_ACCOUNTING.ACCOUNTING_CSS_STATUS_UPDATE_COST_ANALYSIS]:
        function (data) {
            let socket = this
            let listUserActive = socket.$service.listUserConnected
            let io = socket.$service.io
            let { receiverID } = data

            sendDataToMultilSocketsOfListUser({
                listUserConnected: listUserActive,
                arrReceiver: [receiverID],
                data,
                event: [
                    EVENT_SOCKET_CONSTANT_ACCOUNTING.ACCOUNTING_SSC_STATUS_UPDATE_COST_ANALYSIS,
                ],
                io,
            })
        },
}
