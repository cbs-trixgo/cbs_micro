'use strict'

const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { REACTION_TYPES } = require('../helper/media.keys-constant')

const MEDIA__REACTION_COLL = require('../database/media.reaction-coll')
const MEDIA__FILE_REACTION_COLL = require('../database/media.reaction_file-coll')
const MEDIA_COLL = require('../database/media-coll')
const MEDIA__FILE_COLL = require('../database/media.file-coll')

class Model extends BaseModel {
    constructor() {
        super(MEDIA__REACTION_COLL)
    }

    /**
     * Dev: MinhVH
     * Func: REACTION BÀI VIẾT
     * Updated: 22/02/2022
     */
    reaction({ authorID, mediaID, typeReaction }) {
        return new Promise(async (resolve) => {
            try {
                if (!typeReaction || !REACTION_TYPES.includes(typeReaction)) {
                    typeReaction = 1
                }

                if (!checkObjectIDs([authorID, mediaID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số mediaID hoặc authorID không hợp lệ',
                        keyError: 'params_mediaID_or_authorID_invalid',
                        status: 400,
                    })
                }

                const infoMedia = await MEDIA_COLL.findById(mediaID).lean()

                if (!infoMedia) {
                    return resolve({
                        error: true,
                        message: 'Bài viết không tồn tại',
                        keyError: 'media_is_not_exists',
                        status: 400,
                    })
                }

                // Kiểm tra đã thả cảm xúc trên bài viết
                const infoReaction = await MEDIA__REACTION_COLL.findOne({
                    media: mediaID,
                    author: authorID,
                }).lean()

                if (infoReaction && +infoReaction.type === typeReaction) {
                    const infoAfterDeleteReaction =
                        await MEDIA__REACTION_COLL.findByIdAndDelete(
                            infoReaction._id
                        )

                    await MEDIA_COLL.findByIdAndUpdate(mediaID, {
                        $inc: {
                            amountReaction: -1,
                        },
                    })

                    return resolve({
                        error: false,
                        status: 200,
                        data: infoAfterDeleteReaction,
                    })
                }

                if (infoReaction) {
                    await MEDIA__REACTION_COLL.findByIdAndDelete(
                        infoReaction._id
                    )
                }

                const infoAfterInsertReaction = await this.insertData({
                    media: mediaID,
                    type: typeReaction,
                    author: authorID,
                })

                if (!infoAfterInsertReaction) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurred',
                        status: 422,
                    })
                }

                if (!infoReaction) {
                    await MEDIA_COLL.findByIdAndUpdate(mediaID, {
                        $inc: {
                            amountReaction: 1,
                        },
                    })
                }

                return resolve({
                    error: false,
                    data: infoAfterInsertReaction,
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
     * Dev: MinhVH
     * Func: DANH SÁCH REACTION BÀI VIẾT
     * Updated: 22/02/2022
     */
    getListReaction({
        authorID,
        mediaID,
        lastestID,
        isGetTotal,
        type,
        limit = 15,
        select,
        populates,
    }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let conditionObj = { media: mediaID }
                let keys = ['_id__-1', 'createAt__-1']
                let nextCursor = null
                let sortBy = {
                    _id: -1,
                    createAt: -1,
                }

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (!checkObjectIDs([mediaID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số mediaID không hợp lệ',
                        keyError: 'params_mediaID_invalid',
                        status: 400,
                    })
                }

                if (!checkObjectIDs([authorID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số authorID không hợp lệ',
                        keyError: 'params_authorID_invalid',
                        status: 400,
                    })
                }

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request params populates invalid',
                            status: 400,
                        })

                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                if (isNaN(limit) || +limit > 20) {
                    limit = 20
                } else {
                    limit = +limit
                }

                type && (conditionObj.type = type)

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await MEDIA__REACTION_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastestID",
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

                let infoDataAfterGet = await MEDIA__REACTION_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                if (!infoDataAfterGet) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id
                        infoDataAfterGet.length = limit
                    }
                }

                const totalRecord =
                    await MEDIA__REACTION_COLL.count(conditionObjOrg)

                if (isGetTotal) {
                    const totalRecordLike =
                        await MEDIA__REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 1,
                        })
                    const totalRecordHeart =
                        await MEDIA__REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 2,
                        })
                    const totalRecordSmile =
                        await MEDIA__REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 3,
                        })
                    const totalRecordSurprise =
                        await MEDIA__REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 4,
                        })
                    const totalRecordSad =
                        await MEDIA__REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 5,
                        })
                    const totalRecordAngry =
                        await MEDIA__REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 6,
                        })

                    return resolve({
                        error: false,
                        status: 200,
                        data: {
                            listRecords: infoDataAfterGet,
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
                    data: {
                        listRecords: infoDataAfterGet,
                        limit,
                        totalRecord,
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
     * Dev: MinhVH
     * Func: REACTION FILE
     * Updated: 22/02/2022
     */
    reactionFile({ authorID, mediaID, fileID, typeReaction }) {
        return new Promise(async (resolve) => {
            try {
                if (!typeReaction || !REACTION_TYPES.includes(typeReaction)) {
                    typeReaction = 1
                }

                if (!checkObjectIDs([authorID, mediaID, fileID])) {
                    return resolve({
                        error: true,
                        message:
                            'Tham số mediaID hoặc authorID, fileID không hợp lệ',
                        keyError:
                            'params_mediaID_or_authorID_or_fileID_invalid',
                        status: 400,
                    })
                }

                const infoMedia = await MEDIA_COLL.findById(mediaID).lean()

                if (!infoMedia) {
                    return resolve({
                        error: true,
                        message: 'Bài viết không tồn tại',
                        keyError: 'media_not_exists',
                        status: 400,
                    })
                }

                // Kiểm tra đã thả cảm xúc trên bài viết
                const infoReaction = await MEDIA__FILE_REACTION_COLL.findOne({
                    file: fileID,
                    media: mediaID,
                    author: authorID,
                }).lean()

                if (infoReaction && +infoReaction?.type === typeReaction) {
                    const infoAfterDeleteReaction =
                        await MEDIA__FILE_REACTION_COLL.findByIdAndDelete(
                            infoReaction._id
                        )

                    await MEDIA__FILE_COLL.findByIdAndUpdate(fileID, {
                        $inc: {
                            amountReaction: -1,
                        },
                    })

                    return resolve({
                        error: false,
                        status: 200,
                        data: infoAfterDeleteReaction,
                    })
                }

                if (infoReaction) {
                    await MEDIA__FILE_REACTION_COLL.findByIdAndDelete(
                        infoReaction._id
                    )
                }

                const infoAfterUpdateReaction =
                    await MEDIA__FILE_REACTION_COLL.create({
                        file: fileID,
                        media: mediaID,
                        type: typeReaction,
                        author: authorID,
                    })

                if (!infoAfterUpdateReaction) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

                if (!infoReaction) {
                    await MEDIA__FILE_COLL.findByIdAndUpdate(fileID, {
                        $inc: {
                            amountReaction: 1,
                        },
                    })
                }

                return resolve({
                    error: false,
                    data: infoAfterUpdateReaction,
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
     * Dev: MinhVH
     * Func: DANH SÁCH REACTION FILE
     * Updated: 22/02/2022
     */
    getListReactionFile({
        authorID,
        fileID,
        mediaID,
        lastestID,
        isGetTotal,
        type,
        limit = 15,
        select,
        populates,
    }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let conditionObj = { media: mediaID, file: fileID }
                let keys = ['_id__-1', 'createAt__-1']
                let nextCursor = null
                let sortBy = {
                    _id: -1,
                    createAt: -1,
                }

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (!checkObjectIDs([mediaID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số mediaID không hợp lệ',
                        keyError: 'params_mediaID_invalid',
                        status: 400,
                    })
                }

                if (!checkObjectIDs([fileID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số fileID không hợp lệ',
                        keyError: 'params_fileID_invalid',
                        status: 400,
                    })
                }

                if (!checkObjectIDs([authorID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số authorID không hợp lệ',
                        keyError: 'params_authorID_invalid',
                        status: 400,
                    })
                }

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request params populates invalid',
                            status: 400,
                        })

                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                if (isNaN(limit) || +limit > 20) {
                    limit = 20
                } else {
                    limit = +limit
                }

                type && (conditionObj.type = type)

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await MEDIA__FILE_REACTION_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastestID",
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

                let infoDataAfterGet = await MEDIA__FILE_REACTION_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                if (!infoDataAfterGet) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id
                        infoDataAfterGet.length = limit
                    }
                }

                const totalRecord =
                    await MEDIA__FILE_REACTION_COLL.count(conditionObjOrg)

                if (isGetTotal) {
                    const totalRecordLike =
                        await MEDIA__FILE_REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 1,
                        })
                    const totalRecordHeart =
                        await MEDIA__FILE_REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 2,
                        })
                    const totalRecordSmile =
                        await MEDIA__FILE_REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 3,
                        })
                    const totalRecordSurprise =
                        await MEDIA__FILE_REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 4,
                        })
                    const totalRecordSad =
                        await MEDIA__FILE_REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 5,
                        })
                    const totalRecordAngry =
                        await MEDIA__FILE_REACTION_COLL.countDocuments({
                            ...conditionObjOrg,
                            type: 6,
                        })

                    return resolve({
                        error: false,
                        status: 200,
                        data: {
                            listRecords: infoDataAfterGet,
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
                    data: {
                        listRecords: infoDataAfterGet,
                        limit,
                        totalRecord,
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
}

exports.MODEL = new Model()
