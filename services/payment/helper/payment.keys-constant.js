//file chứa các thông tin cung cấp từ cổng thanh toán
exports.vnp_TmnCode             = process.env.PAYMENT__VNP_TMNCODE      || '1SNJ89L8';
exports.vnp_HashSecret          = process.env.PAYMENT__VNP_HASHSECRET   || 'ODJLXOCEWMFIEJXHJNMZUVFFVRDDXLOT';
exports.vnp_Url                 = process.env.PAYMENT__VNP_URL          || 'http://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
exports.vnp_ReturnUrl           = process.env.PAYMENT__VNP_RETURN_URL   || 'http://localhost:3003/api/payment/transactions/url_return';