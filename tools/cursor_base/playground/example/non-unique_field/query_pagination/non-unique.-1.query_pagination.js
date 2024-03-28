// case 1: only non-unique paging
    /**
     * case: sortBy field khác
     * VD: lấy danh sách người dùng mới đăng ký theo hệ thống
     *  -> key: createAt (non-unique field) mới nhất
     *    VÀ FILTER
     *      lấy theo author: 'cbs_author'
     */
    // -------------PAGE 1--------------//
    let listRecordSortByNonUnique = await ABC_COLL.find({
        author: 'cbs_author'
    })
    .sort({
        createAt: -1,
        _id: -1
    }).limit(5).lean();
    // -------------PAGE 2 or More--------------//
    /**
     * DISCUSS (Equal -> Sort -> Range)
     *      |-------------------------|
     *              |++++++|
     * ====================================
     *      |Page1
     *              |Page2
     */
    let listRecordSortByNonUnique = await ABC_COLL.find({
        $and: [
            // --------- NÀY LÀ OBJ CHO [QUERY] 🔎----------//
            {
                author: 'cbs_author'
            },
            // --------- NÀY LÀ OBJ CHO [PAGINATION]📖----------//
            {
                $or: [
                    {
                        createAt: { $lt: latestObj.createAt }
                    },
                    {
                        createAt: latestObj.createAt,
                        _id: {
                            $lt: latestObj._id
                        }
                    }
                ]
            }
        ]
    })
    .sort({
        createAt: -1,
        _id: -1
    }).limit(5).lean();