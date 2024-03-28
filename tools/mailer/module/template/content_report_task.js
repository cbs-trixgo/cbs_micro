"use strict";

const { nl2p }   = require('../../../utils/string_utils');
let { socket_product }  = require('../../config/cf_mode');

// Thông báo công việc
exports.infoReportPcm = ({ content }) => {
    try {
        let taskName = content.infoTask.name;
        let taskAuthorName = content.infoTask.author.fullname;
        let taskAuthorImage = content.infoTask.author.image;

        let taskProjectImage = content.infoTask.project.name;

        let linkServerS3 = "https://trx-demo-003.s3-ap-southeast-1.amazonaws.com";

        if(String(socket_product) == 'true') {
            linkServerS3 = "https://dntdurzwr12tp.cloudfront.net";
        } else {
            linkServerS3 = "https://trx-demo-003.s3-ap-southeast-1.amazonaws.com";
        }

        if(content.infoTask.expiredTime){
            taskExpired = `${ new Date(content.infoTask.expiredTime).getDate()}/${new Date(content.infoTask.expiredTime).getMonth()+1}/${ new Date(content.infoTask.expiredTime).getFullYear()}`;
        }

        return `<td>
            <p>Sender/Người gửi: <b>${content.sender.fullname} (${content.sender.email})</b></p>
            <p>Notice/Nội dung lưu ý: <b style="color:#0066ff;">${content.notice && nl2p(content.notice)}</b></p>
            <p>==============================================</p>
            <h2 style="font-size: 13px;">REPORT INFO/THÔNG TIN BÁO CÁO</h2>
            <p>Report name/Tên báo cáo: <span style="color: #385898;font-weight: bold;">${taskName}</span></p>
            <p>Project/Department/Dự án/phòng ban: <span style="color: #385898;font-weight: bold;">${taskProjectImage}</span></p>
            <p>==============================================</p>
            <p>Author/Người tạo báo cáo: <img src="${linkServerS3}/files/db/users/${taskAuthorImage}" style="width: 32px !important;height: 32px !important;border-radius: 50%;"> <b style="color: #385898;">${taskAuthorName}</b></p>
            <p>Application/Ứng dụng: <b>PCM/Quản lý dự án/công việc</b></p>
            <p><i><a href="https://app.trixgo.com/pcm/filter/?rid=${content.infoTask._id}&tab=3" 
            style="text-decoration:underline;display: inline-block;background: #4267b2;color: #fff;padding: 5px 10px;">See it on Trixgo/Xem trên TrixGo
            </a></i></p>
            <hr>
            <p><i>This email is sent from TRIXGO. <span style="color: orange;">Please click Star (*)</span> to receive other important email relate to you</i></p>
            <p><i>Email này được gửi từ hệ thống TRIXGO. <span style="color: orange;">Vui lòng bấm Star (*)</span> để nhận được các email quan trọng khác liên quan tới bạn</i></p>
        </td>`;
    } catch (error) {
        return console.log(error)
    }
}
