**TÌM KIẾM TIN NHẮN** - db.message_messages.find(
{ $text: { $search: "TRX Khánh Duy" } },
{ score: { $meta: "textScore" } }
).sort( { score: { $meta: "textScore" } } )

        .projection({
            content: 1
        })
        -> tìm được danh sách tin nhắn thoả điều kiện
    - khi người dùng click vào 1 tin nhắn
        + cần tìm được và phân trang tại vị trí đó
            cho tin nhắn đó là tin nhắn đầu trang -> lấy 10item tiếp theo
