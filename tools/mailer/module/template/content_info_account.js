exports.templateInfoAccount = (fullName, pwd) => {
  return `
        Chào ${fullName}, Mật Khẩu mặc định của bạn là <b>${pwd}</b>
        <p><a href="https://app.trixgo.com/login/">Truy cập hệ thống</a></p>
        <p>Hi ${fullName}, Your default password is <b>${pwd}</b></p>
        <p><a href="https://app.trixgo.com/login/">Please access here</a></p>
        <hr>
        <p><i>Email này được gửi từ hệ thống Trixgo. <span style="color: orange;">Vui lòng bấm Star (*)</span> để nhận được các email quan trọng khác liên quan tới bạn</i></p>
        <p><i>This email is sent from Trixgo. <span style="color: orange;">Please click Star (*)</span> to receive other important email relate to you</i></p>
    `
}
