// danh sách các event sử dụng ASYNC-TASK (queue)

module.exports = {
    'chatting.capture_media_file': {
        // Register handler to the "other" group instead of "payment" group.
        group: 'other',
        handler(ctx) {
            /**
             * 1/ lấy dữ liệu đầu vào
             * 2/ thực hiện công việc
             *      + update process (db, redis)
             */
            console.log('Payload:', ctx.params)
            console.log('Sender:', ctx.nodeID)
            console.log('Metadata:', ctx.meta)
            console.log('The called event name:', ctx.eventName)

            // ctx.emit("accounts.created", { user: ctx.params.user });
        },
    },
}
