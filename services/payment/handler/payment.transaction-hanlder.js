let dateFormat                                  = require('dateformat');
let querystring                                 = require('qs');
let sha256                                      = require('sha256');

let PAYMENT__TRANSACTION_MODEL                  = require('../model/payment.transaction-model').MODEL;
let { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl }  
                                                = require('../helper/payment.keys-constant');

let { sortObject }                              = require('../../../tools/utils/utils');

module.exports = {
    getListTransactions: {
        params: {
            status : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { status }        = ctx.params;

                let listTransactions = await PAYMENT__TRANSACTION_MODEL.getListTransactions({ status });
                return listTransactions;
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    getListTransactionsByUserWithStatus: {
        params: {
            userID  : { type: "string" },
            status  : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { userID, status }        = ctx.params;

                let listTransactions = await PAYMENT__TRANSACTION_MODEL.getListByUserWithStatus({ userID, status });
                return listTransactions;
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    updateStatusTransaction: {
        params: {
            transactionID   : { type: "string" },
            status          : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { transactionID, status }        = ctx.params;

                let infoTransactionAfterUpdateStatus = await PAYMENT__TRANSACTION_MODEL.updateStatus({ transactionID, status });
                return infoTransactionAfterUpdateStatus;
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    // STEP 1: tạo url payemnt (window và href chuyển sang cổng thanh toán)
    createURLPayment: {
        params: {
            orderType           : { type: "string" },
            amount              : { type: "string" },
            orderDescription    : { type: "string", optional: true },
            bankCode            : { type: "string", optional: true },
            language            : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { orderType, amount, orderDescription, bankCode, language }        = ctx.params;
                let ipAddr          = ctx.meta.ipAddr;
                let tmnCode         = vnp_TmnCode;
                let secretKey       = vnp_HashSecret;
                let vnpUrl          = vnp_Url;
                let returnUrl       = vnp_ReturnUrl;
                let date            = new Date();

                let createDate      = dateFormat(date, 'yyyymmddHHmmss');
                let orderId         = dateFormat(date, 'HHmmss');
                // let amount       = req.body.amount;
                // let bankCode     = req.body.bankCode;
                let orderInfo       = orderDescription;
                // let orderType    = req.body.orderType;
                let locale          = language || 'vn';

                let currCode        = 'VND';
                let vnp_Params      = {};
                vnp_Params['vnp_Version']   = '2';
                vnp_Params['vnp_Command']   = 'pay';
                vnp_Params['vnp_TmnCode']   = tmnCode;
                // vnp_Params['vnp_Merchant'] = ''
                vnp_Params['vnp_Locale']    = locale;
                vnp_Params['vnp_CurrCode']  = currCode;
                vnp_Params['vnp_TxnRef']    = orderId;
                vnp_Params['vnp_OrderInfo'] = orderInfo;
                vnp_Params['vnp_OrderType'] = orderType;
                vnp_Params['vnp_Amount']    = amount * 100;
                vnp_Params['vnp_ReturnUrl'] = returnUrl;
                vnp_Params['vnp_IpAddr']    = ipAddr;
                vnp_Params['vnp_CreateDate'] = createDate;
                if(bankCode !== null && bankCode !== '')
                    vnp_Params['vnp_BankCode'] = bankCode;
                vnp_Params                  = sortObject(vnp_Params);
                let signData                = secretKey + querystring.stringify(vnp_Params, { encode: false });
                let secureHash              = sha256(signData);
            
                vnp_Params['vnp_SecureHashType']    =  'SHA256';
                vnp_Params['vnp_SecureHash']        = secureHash;
                vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });

                /**
                 * DB TRANSACTION
                 */
                let USER_FAKE_ID = '5e60f58cf63b8a4e196a1942';
                let infoTransactionAfterInsert = await PAYMENT__TRANSACTION_MODEL.insert({ orderID: orderId, orderInfo, amount, bankCode, orderType, locale, userID: USER_FAKE_ID, ipAddr });

                return {
                    error: false, data: {
                        url: vnpUrl,
                        infoTransaction: infoTransactionAfterInsert
                    }
                };
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    // STEP 2.1: url trả về từ browser nếu thanh toán thành công/thất bại
    //http://localhost:3003/api/payment/transactions/url_return
        //?vnp_Amount=5000000&vnp_BankCode=NCB&vnp_BankTranNo=20210617005343&vnp_CardType=ATM&
        //vnp_OrderInfo=Thanh+toan+don+hang+thoi+gian%3A+2021-06-16+23%3A06%3A04&vnp_PayDate=20210617005335&vnp_ResponseCode=00&
        //vnp_TmnCode=1SNJ89L8&vnp_TransactionNo=13525727&vnp_TransactionStatus=00&vnp_TxnRef=000611&vnp_SecureHashType=SHA256&
        //vnp_SecureHash=e917a754f6347b44a43ec94c8c94ee4c2fa1a2397fe711884a828f7493f92234 
    URL_RETURN: {
        params: {
            vnp_SecureHash              : { type: "string" },
            vnp_SecureHashType          : { type: "string" },
            vnp_TxnRef                  : { type: "string" },
            vnp_ResponseCode            : { type: "string" },
        },
        async handler(ctx) {
            try {
                let vnp_Params          = ctx.params;
                let secureHash          = vnp_Params['vnp_SecureHash'];
                let transactionStatus   = vnp_Params['vnp_TransactionStatus'];

                delete vnp_Params['vnp_SecureHash'];
                delete vnp_Params['vnp_SecureHashType'];
                let orderId         = vnp_Params['vnp_TxnRef'];
                let rspCode         = vnp_Params['vnp_ResponseCode'];
                vnp_Params          = sortObject(vnp_Params);

                let tmnCode         = vnp_TmnCode;
                let secretKey       = vnp_HashSecret;

                let signData        = secretKey + querystring.stringify(vnp_Params, { encode: false });
                let checkSum        = sha256(signData); 

                const VNPAY_TRANSACTION_WITH_STATUS_SUCCESS = '00';
                console.log({ transactionStatus })
                if(secureHash === checkSum && transactionStatus == VNPAY_TRANSACTION_WITH_STATUS_SUCCESS){
                    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua 
                    const TRANSACTION_WITH_STATUS_SUCCESS = 1;
                    let infoTransactionAfterUpdateStatus = await PAYMENT__TRANSACTION_MODEL.updateStatus({ orderID: orderId, status: TRANSACTION_WITH_STATUS_SUCCESS });

                    if (infoTransactionAfterUpdateStatus.error)
                        return {
                            error: true, message: infoTransactionAfterUpdateStatus.message
                        }

                    return {
                        error: false, data: {
                            code: transactionStatus,
                            orderId, rspCode,
                            infoTransaction: infoTransactionAfterUpdateStatus
                        }
                    }
                } else{
                    let infoTransactionAfterUpdateStatus    = await PAYMENT__TRANSACTION_MODEL.updateStatus({ orderID: orderId, status: transactionStatus });

                    return { 
                        error:  true, message: 'signature_invalid', code: transactionStatus,
                        infoTransaction: infoTransactionAfterUpdateStatus
                    };
                }
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
    // STEP 2.2: url ipn là từ server PAYMENT gọi vào server CBS (server-call-server)
    URL_IPN: {
        params: {
            vnp_SecureHash              : { type: "string" },
            vnp_SecureHashType          : { type: "string" },
            vnp_TxnRef                  : { type: "string" },
            vnp_ResponseCode            : { type: "string" },
        },
        async handler(ctx) {
            try {
                let vnp_Params          = ctx.params;
                let secureHash          = vnp_Params['vnp_SecureHash'];
                let transactionStatus   = vnp_Params['vnp_TransactionStatus'];

                delete vnp_Params['vnp_SecureHash'];
                delete vnp_Params['vnp_SecureHashType'];

                vnp_Params      = sortObject(vnp_Params);
                let secretKey   = vnp_HashSecret;
                let signData    = secretKey + querystring.stringify(vnp_Params, { encode: false });
                
                let checkSum = sha256(signData);
                const VNPAY_TRANSACTION_WITH_STATUS_SUCCESS = '00';
                if(secureHash === checkSum && transactionStatus == VNPAY_TRANSACTION_WITH_STATUS_SUCCESS){
                    let orderId = vnp_Params['vnp_TxnRef'];
                    let rspCode = vnp_Params['vnp_ResponseCode'];
                    //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
                    return {
                        error: false, data: {
                            code: '00',
                            orderId, rspCode
                        }
                    }
                } else {
                    return { error:  true, message: 'signature_invalid' };
                }
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    }
}