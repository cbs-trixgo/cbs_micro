Monitor resource:
https://copyprogramming.com/howto/how-to-monitor-memory-usage-in-javascript-node

note something
bổ sung thêm phần validate coll: enum + mongoose-validator
parameter validation : fastest-validator
xem lại các function đã tự có từ db-mongoose
products.list │ (\*) 1 │ OK │ Yes │ populate, fields, page, pageSize, sort, search, searchFields, query
Bổ sung status code response cho tất cả api

-   cách đặt utils file:
    [type: {event, action, ...}].[].[service].js

-   TODO:

    -   tạo docs.service.js // cho từng service
    -   import doc các service vào doc.service

-   CALL SERVICE:

    -   internal call: ctx.call("products.find", { populate: ["category"]});
    -   external-service call: this.broker.call('products.find', { populate: ['category'] })

-   syntax file:
    -   database:
        [service_name].[collection_name]-coll.js
-   require file và đặt tên biến
    -   vd: AUTH**USER_COLL
        [service_name]**[collection_name]\_COLL
    -   vd: AUTH**USER_MODEL
        [service_name]**[collection_name]\_MODEL
-   Version socket :
    -   socket-io : 2.x.x (2.2.2)
    -   socket-redis : 5.x.x
