exports.templateRecoverPass = (fullName, code) => {
    return `
        <p>Chào ${fullName}, Mã Xác Nhận của bạn là ${code}</p>
        <p>Hi ${fullName}, Your code is ${code}</p>
    `;
}