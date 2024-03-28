'use strict'
const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const { KEY_ERROR } = require('../../../tools/keys/index')
/**
 * import inter-coll, exter-coll
 */
const AUTH__APP_USER_COLL = require('../database/permission/auth.app_user-coll')
const AUTH__APP_COMPANY_COLL = require('../database/permission/auth.app_company-coll')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
    constructor() {
        super(AUTH__APP_USER_COLL)
    }

    /**
     * Name  : Thêm mẩu tin
     * - A Hiệp: lưu ý 1 user và 1 app chỉ tồn tại 1 mẩu tin duy nhất
     * - Khi cập nhật thông tin của app_company => cũng phải cập nhật app_user theo trường endTime
     * Author: Depv
     * Code  :
     */
    insert({ appID, companyID, users, userID }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */

                let infoAppCompany = await AUTH__APP_COMPANY_COLL.findOne({
                    app: appID,
                    company: companyID,
                })
                if (!infoAppCompany)
                    return resolve({
                        error: true,
                        message: 'App của công ty không tồn tại',
                        keyError: 'app_company_not_exist',
                        status: 200,
                    })

                let { app, company, maxCount, endTime } = infoAppCompany
                // Lấy số lương user hiện tại của app và company
                let amountAppUser = await AUTH__APP_USER_COLL.count({
                    app,
                    company,
                })

                // Tính số lương app user có thể cho phép để thêm
                let amountAppUserAccess = maxCount - amountAppUser

                // Số lượng user mà dưới client gửi lên
                let amountUserCurrent = users.length

                // Kiểm tra số lượng user gửi lên mà lớn hơn số lượng user cho phép thì báo lỗi
                if (amountUserCurrent > amountAppUserAccess)
                    return resolve({
                        error: true,
                        message: 'Người dùng vượt quá số lượng cho phép',
                        keyError: 'User_exceeds_the_allowed_number',
                        status: 200,
                    })

                for (const user of users) {
                    let checkExist = await AUTH__APP_USER_COLL.findOne({
                        app,
                        user,
                    }) // mỗi user và app chỉ tồn tại duy nhất 1 mẩu tin
                    if (checkExist)
                        return resolve({
                            error: true,
                            message: 'Người dùng đã tồn tại trong app user',
                            keyError: 'user_existed_in_app_user',
                            status: 200,
                        })

                    await this.insertData({
                        app,
                        company,
                        user,
                        endTime,
                        userCreate: userID,
                        userUpdate: userID,
                    })
                }

                return resolve({
                    error: false,
                    message: 'Thêm thành công',
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    update({ appID, companyID, memberID, level, userID }) {
        return new Promise(async (resolve) => {
            try {
                let checkExist = await AUTH__APP_USER_COLL.findOne({
                    app: appID,
                    company: companyID,
                    user: memberID,
                })
                if (!checkExist)
                    return resolve({
                        error: true,
                        message: 'App user không tồn tại',
                        keyError: 'app_user_not_exist',
                        status: 200,
                    })

                let infoAfterUpdate =
                    await AUTH__APP_USER_COLL.findOneAndUpdate(
                        { app: appID, company: companyID, user: memberID },
                        {
                            level,
                            userUpdate: userID,
                            modifyAt: new Date(),
                        },
                        { new: true }
                    )

                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: KEY_ERROR.UPDATE_FAILED,
                        status: 200,
                    })

                return resolve({
                    error: false,
                    data: infoAfterUpdate,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    remove({ appUserIDs }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(appUserIDs))
                    return resolve({
                        error: true,
                        message: 'appUserIDs không phải objectID',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                        status: 200,
                    })
                let infoAfterRemove = await AUTH__APP_USER_COLL.deleteMany({
                    _id: { $in: appUserIDs },
                })
                if (!infoAfterRemove)
                    return resolve({
                        error: true,
                        message: 'Xoá thất bại',
                        keyError: KEY_ERROR.DELETE_FAILED,
                        status: 200,
                    })

                return resolve({
                    error: false,
                    message: 'Xoá thành công',
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    getList({
        appID,
        companyID,
        limit = 10,
        lastestID,
        select,
        populates = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                if (limit > 20) {
                    limit = 20
                } else {
                    limit = +limit
                }

                // let today = new Date();
                let conditionObj = {}

                let sortBy
                let keys = ['createAt__-1', '_id__-1']

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */

                if (appID) {
                    conditionObj.app = appID
                }

                if (companyID) {
                    conditionObj.company = companyID
                }

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request params populates invalid',
                        })

                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */
                let conditionObjOrg = { ...conditionObj }
                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await AUTH__APP_USER_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastest",
                        })
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: infoData,
                        objectQuery: conditionObjOrg,
                    })
                    if (!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({
                            error: true,
                            message: "Can't get range pagination",
                        })
                    conditionObj = dataPagingAndSort.data.find
                    sortBy = dataPagingAndSort.data.sort
                } else {
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: null,
                        objectQuery: conditionObjOrg,
                    })
                    sortBy = dataPagingAndSort.data.sort
                }

                let infoDataAfterGet = await AUTH__APP_USER_COLL.find(
                    conditionObj
                )
                    .select(select)
                    .limit(+limit + 1)
                    .populate(populates)
                    .sort(sortBy)
                    .lean()

                if (!infoDataAfterGet)
                    return resolve({
                        error: true,
                        message: 'Lấy danh sách thất bại',
                        keyError: KEY_ERROR.GET_LIST_FAILED,
                    })

                let nextCursor = null
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id
                        infoDataAfterGet.length = limit
                    }
                }

                let totalRecord =
                    await AUTH__APP_USER_COLL.count(conditionObjOrg)
                let totalPage = Math.ceil(totalRecord / limit)

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit: +limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    },
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }
    /**
     * Name  : Danh sách app mà user được quyền truy cập
     * Author: Depv
     * Code  :
     */
    getListAppOfUser({
        userID,
        limit = 10,
        lastestID,
        select,
        populates = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                let today = new Date()
                let conditionObj = {
                    endTime: { $gte: today },
                }

                let sortBy
                let keys = ['createAt__-1', '_id__-1']

                if (limit > 20) {
                    limit = 20
                }

                if (userID) {
                    conditionObj.user = userID
                }

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request params populates invalid',
                        })

                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                let conditionObjOrg = { ...conditionObj }
                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await AUTH__APP_USER_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastest",
                        })
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: infoData,
                        objectQuery: conditionObjOrg,
                    })
                    if (!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({
                            error: true,
                            message: "Can't get range pagination",
                        })
                    conditionObj = dataPagingAndSort.data.find
                    sortBy = dataPagingAndSort.data.sort
                } else {
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: null,
                        objectQuery: conditionObjOrg,
                    })
                    sortBy = dataPagingAndSort.data.sort
                }

                let infoDataAfterGet = await AUTH__APP_USER_COLL.find(
                    conditionObj
                )
                    .select(select)
                    .limit(+limit + 1)
                    .populate(populates)
                    .sort(sortBy)
                    .lean()

                if (!infoDataAfterGet)
                    return resolve({
                        error: true,
                        message: 'Lấy danh sách thất bại',
                        keyError: KEY_ERROR.GET_LIST_FAILED,
                    })

                let nextCursor = null
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id
                        infoDataAfterGet.length = limit
                    }
                }

                let totalRecord =
                    await AUTH__APP_USER_COLL.count(conditionObjOrg)
                let totalPage = Math.ceil(totalRecord / limit)

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit: +limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    },
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Name  : Kiểm tra user có quyền truy cập App hay không
     * Author: Depv
     * Code  :
     */
    checkPermissionsAccessApp({ appID, userID, select, populates = {} }) {
        return new Promise(async (resolve) => {
            try {
                let today = new Date()
                let conditionObj = {
                    app: appID,
                    user: userID,
                    endTime: { $gte: today },
                }

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request params populates invalid',
                            status: 200,
                        })

                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                let checkPermission = await AUTH__APP_USER_COLL.findOne(
                    conditionObj
                )
                    .select(select)
                    .populate(populates)

                if (!checkPermission)
                    return resolve({
                        error: true,
                        message: 'permission denied',
                        keyError: KEY_ERROR.PERMISSION_DENIED,
                        status: 200,
                    })
                return resolve({
                    error: false,
                    data: checkPermission,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }
}

exports.MODEL = new Model()
