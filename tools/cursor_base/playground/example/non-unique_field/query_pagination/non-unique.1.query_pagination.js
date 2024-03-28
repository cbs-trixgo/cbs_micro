// case 1: only non-unique paging
/**
 * case: sortBy field khác
 * VD: lấy danh sách người dùng mới đăng ký theo hệ thống
 *  -> key: createAt (non-unique field) mới nhất\
 *      VÀ FILTER
 *      lấy theo author: 'cbs_author'
 */
// -------------PAGE 1--------------//
let listRecordSortByNonUnique = await ABC_COLL.find({ author: 'cbs_author' })
    .sort({
        createAt: -1,
        _id: -1,
    })
    .limit(5)
    .lean()
// -------------PAGE 2 or More--------------//
/**
 * DISCUSS
 *      |-------------------------|
 *              |++++++|
 * ====================================
 *      |Page1
 *              |Page2
 */
let listRecordSortByNonUnique = await ABC_COLL.find({
    $and: [
        {
            author: 'cbs_author',

            /**
             * giả sử CONDITION là:
             *  - author: 'cbs_author'
             *          HOẶC
             *  - age: [10;20]
             */

            /**
                 *$or: [
                        { author: 'cbs_author'  },
                        {
                            age: {
                                $or: [
                                    { gte: 10 },
                                    { lte: 20 }
                                ]
                            }
                        }
                    ]
                 */
        },
        {
            $or: [
                {
                    createAt: { $gt: latestObj.createAt },
                },
                {
                    createAt: latestObj.createAt,
                    _id: {
                        $gt: latestObj._id,
                    },
                },
            ],
        },
    ],
})
    .sort({
        createAt: -1,
        _id: -1,
    })
    .limit(5)
    .lean()
