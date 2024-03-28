'use strict'

let mailer = require('../mailer')

// Thông báo có công việc mới/nhắc nhở thời hạn
let { infoDocrePcm } = require('./content_info_docre_task')

/**
 * @param email
 * @param title
 * @param content
 */
exports.sendNoticeToMemberDocrePcm = function (stringify) {
  // console.log({ email, title, content })
  let { email, title, content } = JSON.parse(stringify) // convert for worker_threads

  // Nội dung email
  let emailContent = infoDocrePcm({ content })

  /**
   * Gửi email
   * - Người nhận
   * - Tiêu đề
   * - Nội dung
   */
  mailer(
    email,
    `${title.toUpperCase()}_TRIXGO.COM_${Date.now()}`,
    emailContent,
    function (cb) {
      console.log(cb)
    }
  )
}
