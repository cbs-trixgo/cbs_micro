exports.templateNewAccount = (fullName, pwd) => {
    return `
        Chào ${fullName}, Mật Khẩu mặc định của bạn là <b>${pwd}</b>
        <p><a href="https://app.trixgo.com/">Truy cập hệ thống</a></p>
        <p><a href="https://app.trixgo.com/files/guidance/guidance.zip">File hướng dẫn sử dụng</a></p>
        <p>Hi ${fullName}, Your default password is <b>${pwd}</b></p>
        <p><a href="https://app.trixgo.com/">Please access here</a></p>
        <p><a href="https://app.trixgo.com/files/guidance/guidance.zip">File usage guide</a></p>
        <hr>
        <p><i>This email is sent from TRIXGO. <span style="color: orange;">Please click Star (*)</span> to receive other important email relate to you</i></p>
        <p><i>Email này được gửi từ hệ thống TRIXGO. <span style="color: orange;">Vui lòng bấm Star (*)</span> để nhận được các email quan trọng khác liên quan tới bạn</i></p>
    `;
}