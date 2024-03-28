'use strict'

const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const REACTION__REACTION_CORE_COLL = require('../database/reaction.reaction_core-coll')

class Model extends BaseModel {
    constructor() {
        super(REACTION__REACTION_CORE_COLL)
    }

    /**
     * Name: Thêm reaction core
     * Author: Depv
     * Code: F0275
     */
    insert({ type, userID }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataInsert = {}

                /**
                 * VALIDATION STEP (2)
                 *  - kiểm tra valid từ các input
                 *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (!checkObjectIDs(userID))
                    return resolve({ error: true, message: 'author_invalid' })

                if (!type)
                    return resolve({ error: true, message: 'type_invalid' })

                /**
                 * LOGIC STEP (3)
                 *  3.1: convert type + update name (ví dụ: string -> number)
                 *  3.2: operation database
                 */
                dataInsert = { type, userCreate: userID }

                let infoAfterInsert = await that.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({ error: true, message: 'cannot_insert' })
                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Cập nhật type reaction
     * Author: Depv
     * Code: F0276
     */
    update({ reactionCoreID, type }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = {}

                /**
                 * VALIDATION STEP (2)
                 *  - kiểm tra valid từ các input
                 *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (!checkObjectIDs(reactionCoreID))
                    return resolve({
                        error: true,
                        message: 'reactionCoreID_invalid',
                    })

                if (!type)
                    return resolve({ error: true, message: 'type_invalid' })

                /**
                 * LOGIC STEP (3)
                 *  3.1: convert type + update name (ví dụ: string -> number)
                 *  3.2: operation database
                 */
                dataUpdate = { type }

                let infoAfterInsert =
                    await REACTION__REACTION_CORE_COLL.findByIdAndUpdate(
                        reactionCoreID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterInsert)
                    return resolve({ error: true, message: 'cannot_insert' })
                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: DANH SÁCH REACTION BÀI VIẾT
     */
    getListReaction({
        userID,
        conditionObj,
        lastestID,
        isGetTotal,
        limit = 15,
        select,
        populates,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([userID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số userID không hợp lệ',
                        keyError: 'params_userID_invalid',
                        status: 400,
                    })
                }

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request param populates invalid',
                            status: 400,
                        })

                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                if (isNaN(limit) || limit > 20) {
                    limit = 20
                } else {
                    limit = +limit
                }

                let nextCursor = null
                let sortBy = { createAt: -1 }
                let keys = ['createAt__-1', '_id__-1']
                let conditionObjOrg = { ...conditionObj }

                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await REACTION__REACTION_CORE_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info last message",
                            status: 400,
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
                            status: 400,
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

                let listReactions = await REACTION__REACTION_CORE_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                if (!listReactions) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

                if (listReactions && listReactions.length) {
                    if (listReactions.length > limit) {
                        nextCursor = listReactions[limit - 1]._id
                        listReactions.length = limit
                    }
                }

                const totalRecord =
                    await REACTION__REACTION_CORE_COLL.count(conditionObjOrg)

                if (isGetTotal) {
                    const totalRecordLike =
                        await REACTION__REACTION_CORE_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 1,
                        })
                    const totalRecordHeart =
                        await REACTION__REACTION_CORE_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 2,
                        })
                    const totalRecordSmile =
                        await REACTION__REACTION_CORE_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 3,
                        })
                    const totalRecordSurprise =
                        await REACTION__REACTION_CORE_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 4,
                        })
                    const totalRecordSad =
                        await REACTION__REACTION_CORE_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 5,
                        })
                    const totalRecordAngry =
                        await REACTION__REACTION_CORE_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 6,
                        })

                    return resolve({
                        error: false,
                        status: 200,
                        data: {
                            listRecords: listReactions,
                            limit,
                            nextCursor,
                            totalRecord,
                            totalRecordLike,
                            totalRecordHeart,
                            totalRecordSmile,
                            totalRecordSurprise,
                            totalRecordSad,
                            totalRecordAngry,
                        },
                    })
                }

                return resolve({
                    error: false,
                    status: 200,
                    data: {
                        listRecords: listReactions,
                        limit,
                        totalRecord,
                        nextCursor,
                    },
                })
            } catch (error) {
                console.error(error)
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
