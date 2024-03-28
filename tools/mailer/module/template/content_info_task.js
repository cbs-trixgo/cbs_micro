'use strict'

const { nl2p } = require('../../../utils/string_utils')
const moment = require('moment')

// Thông báo công việc
exports.infoTaskContent = ({ content, comments }) => {
  let taskName = content.infoTask.name
  let taskAuthorName = content.infoTask.author.fullname
  let taskAuthorImage = content.infoTask.author.image
  let taskAssigneeName = content.infoTask.assignee.fullname
  let taskAssigneeImage = content.infoTask.assignee.image
  let taskProjectImage = content.infoTask.project.name
  let taskExpired = ''
  let subtypeTask = content.infoTask.subtype
  let txtAuthorTask = ``
  let txtAssigneeTask = ``
  let txtComments = ``

  if ([0, 1, 6, 7, 8, 10, 11].includes(Number(subtypeTask))) {
    txtAuthorTask = `Author/Người tạo việc`
    txtAssigneeTask = `Assignee/Người thực hiện`
  } else {
    if (Number(subtypeTask) === 4 && Number(content.infoTask.level) === 2) {
      txtAuthorTask = `Đơn vị mời thầu`
      txtAssigneeTask = `Đơn vị dự thầu`
    } else {
      txtAuthorTask = `Submitter/Người đệ trình`
      txtAssigneeTask = `Approver/Người phê duyệt`
    }
  }

  const linkServerS3 =
    process.env.AWS_BUCKET_URL || 'https://dntdurzwr12tp.cloudfront.net'

  for (const item of comments) {
    txtComments =
      txtComments +
      `<p style="margin-bottom: 1px;"><span style="color: #1B75D0;">${item.author.fullname}</span><span style="color: grey"> - ${moment(item.createAt).format('DD/MM/YYYY HH:mm')} (${moment(item.createAt).fromNow()})</span></p>`

    txtComments = txtComments + `<div style="color: grey"><i>To: `
    for (const subitem of item.receivers) {
      txtComments = txtComments + `<span>${subitem.fullname}</span>, `
    }
    txtComments = txtComments + `</i></div>`

    txtComments = txtComments + `<p>${item.content}</p>`

    for (const subitem of item.files) {
      txtComments =
        txtComments +
        `<p><a href="${linkServerS3}${subitem.path}" target="_blank">${subitem.nameOrg} | ${moment(subitem.createAt).format('DD/MM/YYYY HH:mm')} ${moment(subitem.createAt).fromNow()}</a></p>`
    }
    for (const subitem of item.images) {
      txtComments =
        txtComments +
        `<a href="${linkServerS3}${subitem.path}" target="_blank"><img width="90" height="90" src="${linkServerS3}${subitem.path}"></a>`
    }

    txtComments = txtComments + ` <hr style="color: grey">`
  }

  if (content.infoTask.actualFinishTime) {
    taskExpired = `${new Date(content.infoTask.actualFinishTime).getDate()}/${new Date(content.infoTask.actualFinishTime).getMonth() + 1}/${new Date(content.infoTask.actualFinishTime).getFullYear()}`
  }

  return `<td>
        <p>Sender/Người gửi: <b>${content.sender.fullname} (${content.sender.email})</b></p>
        <p>Notice/Nội dung lưu ý: <b style="color:#0066ff;">${nl2p(content.notice)}</b></p>
        <p>==============================================</p>
        <h2 style="font-size: 13px;">TASK INFO/THÔNG TIN CÔNG VIỆC</h2>
        <p>Task name/Tên công việc: <span style="color: #385898;font-weight: bold;">${taskName}</span></p>
        <p>Expired/Thời hạn: <b>${taskExpired}</b></p>
        <p>${txtAssigneeTask}: <img src="${linkServerS3}/files/db/users/${taskAssigneeImage}" style="width: 32px !important;height: 32px !important;border-radius: 50%;"> <b style="color: #var(--black-350);">${taskAssigneeName}</b></p>
        <p>Project/Department/Dự án/phòng ban: <span style="color: #385898;font-weight: bold;">${taskProjectImage}</span></p>
        <p style="font-weight: bold;">COMMENTS/PHẢN HỒI:${txtComments}</p>
        <p>${txtAuthorTask}: <img src="${linkServerS3}/files/db/users/${taskAuthorImage}" style="width: 32px !important;height: 32px !important;border-radius: 50%;"> <b style="color: #385898;">${taskAuthorName}</b></p>
        <p>Application/Ứng dụng: <b>PCM/Quản lý dự án/công việc</b></p>
        <p><i><a href="https://app.trixgo.com/pcm/detail/${content.infoTask._id}" style="text-decoration:underline;display: inline-block;background: #4267b2;color: #fff;padding: 5px 10px;">See it on Web/Xem trên Web</a></i></p>
        <p><i><a href="https://app.trixgo.com/mobile/pcm/${content.infoTask._id}" style="text-decoration:underline;display: inline-block;background: #4267b2;color: #fff;padding: 5px 10px;">See it on Mobile/Xem trên Mobile</a></i></p>
        <hr>
        <p><i>This email is sent from TRIXGO. <span style="color: orange;">Please click Star (*)</span> to receive other important email relate to you</i></p>
        <p><i>Email này được gửi từ hệ thống TRIXGO. <span style="color: orange;">Vui lòng bấm Star (*)</span> để nhận được các email quan trọng khác liên quan tới bạn</i></p>
    </td>`
}
