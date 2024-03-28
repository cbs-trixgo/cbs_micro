'use strict'

let mailer = require('../mailer')

// Thông báo có công việc mới/nhắc nhở thời hạn
let { infoReportPcm } = require('./content_report_task')

/**
 * @param email
 * @param title
 * @param content
 */
exports.sendNoticeToMemberReport = function (stringify) {
  let { email, title, content } = JSON.parse(stringify) // convert for worker_threads

  // Nội dung email
  let emailContent = infoReportPcm({ content })
  /**
   * Gửi email
   * - Người nhận
   * - Tiêu đề
   * - Nội dung
   */
  if (!emailContent)
    return { error: true, message: 'cant_create_template_mail' }
  mailer(
    email,
    `${title.toUpperCase()}_TRIXGO.COM_${Date.now()}`,
    emailContent,
    function (cb) {
      console.log(cb)
    }
  )
}
