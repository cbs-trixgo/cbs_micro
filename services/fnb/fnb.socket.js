/**
 * Constants
 */
const {
  EVENT_SOCKET_CONSTANT_FNB,
} = require('./helper/fnb.events-socket-constant')
const { CF_DOMAIN_SERVICES } = require('../gateway/helper/domain.constant')
const { CF_ACTIONS_AUTH } = require('../auth/helper/auth.actions-constant')
const { CF_ACTIONS_ITEM } = require('../item/helper/item.actions-constant')

/**
 * Utils
 */
const { sendDataToMultilSocketsOfListUser } = require('../../tools/socket')
const {
  ENV_DEVICE_APP_FNB,
} = require('../notification/helper/notification.keys-constant')

exports.FNB_SOCKET = {
  /**
   * Tạo mới đơn hàng
   */
  [EVENT_SOCKET_CONSTANT_FNB.FNB_CSS_ADD_NEW_ORDER]: async function (data) {
    try {
      let socket = this
      let broker = socket.$service.broker
      let listUserActive = socket.$service.listUserConnected
      let userID = socket.client.user
      let io = socket.$service.io
      let { companyID, fundaID, orderInfo } = data
      // console.log({ 'EVENT_SOCKET_CONSTANT_FNB.FNB_CSS_ADD_NEW_ORDER': data });

      if (!companyID) {
        return sendDataToMultilSocketsOfListUser({
          listUserConnected: listUserActive,
          arrReceiver: [userID],
          data: {
            error: true,
            message: 'Tham số companyID không hợp lệ',
          },
          event: [EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_ORDER],
          io,
        })
      }

      let fundaResponse = await broker.call(
        `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.FUNDA_GET_INFO_AND_GET_LIST}`,
        {
          fundaID,
        },
        {
          meta: {
            infoUser: { _id: userID, company: { _id: companyID } },
          },
        }
      )
      // console.log({ fundaResponse })

      if (!fundaResponse || fundaResponse.error) {
        return sendDataToMultilSocketsOfListUser({
          listUserConnected: listUserActive,
          arrReceiver: [userID],
          data: {
            error: true,
            message: 'Tham số fundaID không hợp lệ',
          },
          event: [EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_ORDER],
          io,
        })
      }

      const user = await broker.call(
        `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`,
        {
          userID,
          select: '_id bizfullname',
        }
      )
      if (!user || user.error) {
        return sendDataToMultilSocketsOfListUser({
          listUserConnected: listUserActive,
          arrReceiver: [userID],
          data: {
            error: true,
            message: 'Tham số userID không hợp lệ',
          },
          event: [EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_ORDER],
          io,
        })
      }

      // Bắn về các user đăng ký nhận thông báo
      const usersID =
        fundaResponse.data?.getNotification?.map?.((userId) =>
          userId.toString()
        ) || []
      // console.log('Thông tin socket=======================')
      // console.log({ usersID, userID })

      const receivers = usersID.filter(
        (receiverID) => receiverID.toString() !== userID.toString()
      )
      const titleMSS = `Đơn hàng ${fundaResponse?.data?.name}`
      const arrSalesChannel = [
        'Off',
        'Grab',
        'Shopee',
        'Gojek',
        'Baemin',
        'Loship',
        'Bee',
      ]
      const contentMSS = `${orderInfo?.name}, ${orderInfo.salesChannel > 1 ? `đơn ${arrSalesChannel[Number(orderInfo.salesChannel) - 1]}` : 'đơn Off'}, giá trị ${orderInfo?.total.toLocaleString('vi-VN')}, đã được thanh toán thành công, tạo bởi ${user.data?.bizfullname}`
      // console.log({ receivers, titleMSS, contentMSS })//

      // Cloud messaging
      broker.emit('NOTIFICATION__LOG_CREATE:MOBILE_WEB', {
        users: receivers,
        title: titleMSS,
        description: contentMSS,
        dataSend: {
          orderID: orderInfo?._id,
        },
        web_url: `https://app.trixgo.com/fnb/home/${orderInfo?._id}`,
        env: ENV_DEVICE_APP_FNB,
      })

      // Socket
      sendDataToMultilSocketsOfListUser({
        listUserConnected: listUserActive,
        arrReceiver: receivers,
        data: {
          error: false,
          data: {
            orderID: orderInfo._id,
          },
        },
        event: [EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_ORDER],
        io,
      })
    } catch (error) {
      console.info('======EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_ORDER=====')
      console.error(error)
    }
  },

  /**
   * Tạo một lỗi mới
   */
  [EVENT_SOCKET_CONSTANT_FNB.FNB_CSS_ADD_NEW_MISTAKE]: async function (data) {
    try {
      let socket = this
      let broker = socket.$service.broker
      let listUserActive = socket.$service.listUserConnected
      let userID = socket.client.user
      let io = socket.$service.io
      let { companyID, fundaID, mistakeInfo } = data
      // console.log({ 'EVENT_SOCKET_CONSTANT_FNB.FNB_CSS_ADD_NEW_MISTAKE': data });

      /**
       * Kiểm tra và check event nếu có lỗi
       */
      if (!companyID) {
        return sendDataToMultilSocketsOfListUser({
          listUserConnected: listUserActive,
          arrReceiver: [userID],
          data: {
            error: true,
            message: 'Tham số companyID không hợp lệ',
          },
          event: [EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_MISTAKE],
          io,
        })
      }

      let fundaResponse = await broker.call(
        `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.FUNDA_GET_INFO_AND_GET_LIST}`,
        {
          fundaID,
        },
        {
          meta: {
            infoUser: { _id: userID, company: { _id: companyID } },
          },
        }
      )

      if (!fundaResponse || fundaResponse.error) {
        return sendDataToMultilSocketsOfListUser({
          listUserConnected: listUserActive,
          arrReceiver: [userID],
          data: {
            error: true,
            message: 'Tham số fundaID không hợp lệ',
          },
          event: [EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_MISTAKE],
          io,
        })
      }

      const user = await broker.call(
        `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`,
        {
          userID,
          select: '_id bizfullname',
        }
      )

      // Lấy hàm get thông tin của Lỗi

      if (!user || user.error) {
        return sendDataToMultilSocketsOfListUser({
          listUserConnected: listUserActive,
          arrReceiver: [userID],
          data: {
            error: true,
            message: 'Tham số userID không hợp lệ',
          },
          event: [EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_MISTAKE],
          io,
        })
      }

      const usersID =
        fundaResponse.data?.members?.map?.((userId) => userId.toString()) || []
      const receivers = usersID.filter(
        (receiverID) => receiverID.toString() !== userID.toString()
      )
      const titleMSS = `Gán lỗi vi phạm ${fundaResponse?.data?.name}`
      const contentMSS = `${user.data?.bizfullname} đã gán lỗi mistake.name cho bạn, giá trị phạt là amount`
      console.log({ receivers, titleMSS, contentMSS })

      /**
       * Bắn Cloud messaging về mobile
       */
      broker.emit('NOTIFICATION__LOG_CREATE:MOBILE_WEB', {
        users: receivers,
        title: titleMSS,
        description: contentMSS,
        dataSend: {
          orderID: orderInfo?._id,
        },
        web_url: `https://app.trixgo.com/fnb/home/${orderInfo?._id}`,
        env: ENV_DEVICE_APP_FNB,
      })

      /**
       * Bắn thông báo socket về phía Client
       */
      sendDataToMultilSocketsOfListUser({
        listUserConnected: listUserActive,
        arrReceiver: receivers,
        data: {
          error: false,
          data: {
            orderID: orderInfo._id,
          },
        },
        event: [EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_ORDER],
        io,
      })
    } catch (error) {
      console.info('======EVENT_SOCKET_CONSTANT_FNB.FNB_SSC_ADD_NEW_ORDER=====')
      console.error(error)
    }
  },
}
