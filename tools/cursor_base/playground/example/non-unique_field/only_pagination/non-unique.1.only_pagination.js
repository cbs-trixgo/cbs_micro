// case 1: only non-unique paging
/**
 * case: sortBy field khác
 * VD: lấy danh sách người dùng mới đăng ký theo hệ thống
 *  -> key: createAt (non-unique field) CŨ NHẤT <-----//HERE
 */
// -------------PAGE 1--------------//
let listRecordSortByNonUnique = await ABC_COLL.find({})
  .sort({
    createAt: 1,
    _id: 1,
  })
  .limit(5)
  .lean()
// -------------PAGE 2 or More--------------//
/**
 * DISCUSS
 *      |-------------------------| (sort theo tăng dần)
 *              |++++++|
 * ====================================
 *      |Page1
 *              |Page2
 */
let listRecordSortByNonUnique = await ABC_COLL.find({
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
})
  .sort({
    createAt: 1,
    _id: 1,
  })
  .limit(5)
  .lean()
