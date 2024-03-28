    /**
     * case: sortBy field _id TĂNG DẦN
     * VD: LẤY DANH SÁCH NGƯỜI DÙNG ĐĂNG KÝ -> MỚI NHẤT
     */
    // -------------PAGE 1--------------//
    let listRecordSortByNonUnique = await ABC_COLL.find({})
    .sort({
        _id: -1
    }).limit(5).lean();
    // -------------PAGE 2 or More--------------//
    /**
     * DISCUSS (Equality -> Sort -> Range)
     *      |-------------------------|
     *              |++++++|
     * ====================================
     *      |Page1
     *              |Page2
     */
    let listRecordSortByNonUnique = await ABC_COLL.find({
        _id: {
            $lt: latestObj._id
        }
    })
    .sort({
        _id: -1
    }).limit(5).lean();