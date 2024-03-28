 /*-------------------------------------
 * file định nghĩa các constant EVENT của SERVICE (PAYMENT) emit đi
 */
/**
 * @TARGET: (những service sẽ subscribe event của payment service)
 *      - service notification (mail, cloud messaging)
 *      - service user
 */
exports.PAYMENT__TRANSACTION_SUCCESS    = `PAYMENT__TRANSACTION_SUCCESS`;
/**
 * @TARGET: (những service sẽ subscribe event của payment service)
 *      - service notification (mail, cloud messaging)
 *      - service user
 *      - //TODO service reminder: nhắc sau bao lâu không thanh toán (chỉ là ví dụ)
 */
exports.PAYMENT__TRANSACTION_FAIL       = `PAYMENT__TRANSACTION_FAIL`;

// ----------------------------------------------------------------------------------------------- //
/**
 * định nghĩa các EVENT mà SERVICE(PAYMENT) sẽ subscribe (nhận job từ các service khác)
 */
exports.LIST_EVENTS_SUBSCRIBE = {
    // VD: khi có user nào đó request tạo đơn hàng mới order.create (chỉ là ví dụ)
    /**
     * @target:
     *  - user_service: nhận event và cập nhật thông tin  (thông tin gói sử dụng)
     *  - mail_service: nhận event và gửi mail
     */
    "ORDER__CREATE": {
        handler(ctx) {
            /**
             * 1/ lấy dữ liệu đầu vào
             * 2/ thực hiện công việc
             *      + update process (db, redis) 
             */
            console.log("Payload:", ctx.params);
            console.log("Sender:", ctx.nodeID);
            console.log("Metadata:", ctx.meta);
            console.log("The called event name:", ctx.eventName);
            // ctx.emit("accounts.created", { user: ctx.params.user });
        }
    }
}