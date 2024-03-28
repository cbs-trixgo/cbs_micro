'use strict'

/**
 * EXTERNAL
 */

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')

/**
 * COLLECTIONS
 */
const CHATTING__CONVERSATION_FOLDER_COLL = require('../database/chatting.conversation_folder-coll')
const CHATTING__CONVERSATION_COLL = require('../database/chatting.conversation-coll')

class Model extends BaseModel {
    constructor() {
        super(CHATTING__CONVERSATION_FOLDER_COLL)
    }

    /**
     * Dev: MinhVH
     * Func: Thêm folder mới
     * Date: 11/02/2022
     */
    insert({ name, authorID }) {
        return new Promise(async (resolve) => {
            try {
                let checkExistsFolder =
                    await CHATTING__CONVERSATION_FOLDER_COLL.findOne({
                        name: name.trim(),
                        author: authorID,
                    }).lean()

                if (checkExistsFolder) {
                    return resolve({
                        error: true,
                        message: 'Folder đã tồn tại',
                        keyError: 'folder_is_exists',
                        status: 400,
                    })
                }

                let infoAfterInsert = await this.insertData({
                    name,
                    author: authorID,
                })

                if (!infoAfterInsert) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

                return resolve({
                    error: false,
                    data: infoAfterInsert,
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
     * Func: Cập nhật folder
     * Date: 11/02/2022
     */
    update({ folderID, name, authorID }) {
        return new Promise(async (resolve) => {
            try {
                let dataUpdate = {}

                if (!checkObjectIDs([folderID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số folderID không hợp lệ',
                        keyError: 'params_folderID_invalid',
                        status: 400,
                    })
                }

                let infoFolder =
                    await CHATTING__CONVERSATION_FOLDER_COLL.findOne({
                        _id: folderID,
                        author: authorID,
                    }).lean()

                if (!infoFolder) {
                    return resolve({
                        error: true,
                        message: 'Folder không tồn tại',
                        keyError: 'folder_not_exists',
                        status: 400,
                    })
                }

                name && (dataUpdate.name = name)

                let infoAfterUpdate =
                    await CHATTING__CONVERSATION_FOLDER_COLL.findByIdAndUpdate(
                        folderID,
                        {
                            $set: dataUpdate,
                        },
                        { new: true }
                    )

                if (!infoAfterUpdate) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

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

    /**
     * Dev: MinhVH
     * Func: Thêm cuộc hội thoại vào folder
     * Date: 04/03/2022
     */
    updateConversationToFolder({
        conversationID,
        addFoldersID,
        removeFoldersID,
        authorID,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số conversationID không hợp lệ',
                        keyError: 'params_conversationID_invalid',
                        status: 400,
                    })
                }

                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $in: [authorID] },
                    }).lean()

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message: 'Bạn không phải thành viên cuộc hội thoại',
                        keyError: 'you_are_not_member_of_conversation',
                        status: 403,
                    })
                }

                let infoAfterUpdate = null

                if (removeFoldersID.length) {
                    infoAfterUpdate =
                        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                            conversationID,
                            {
                                $pullAll: {
                                    folders: removeFoldersID,
                                },
                            },
                            { new: true }
                        )
                }

                if (addFoldersID.length) {
                    infoAfterUpdate =
                        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                            conversationID,
                            {
                                $addToSet: {
                                    folders: addFoldersID,
                                },
                            },
                            { new: true }
                        )
                }

                if (!infoAfterUpdate) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

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

    /**
     * Dev: VinhHV
     * Func: Lấy thông tin folder
     * Date: 11/02/2022
     */
    getInfo({ folderID, select, populates, authorID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([folderID, authorID])) {
                    return resolve({
                        error: true,
                        message:
                            'Tham số folder ID hoặc author ID không hợp lệ',
                        keyError: 'params_folderID_or_authorID_invalid',
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

                let infoFolder =
                    await CHATTING__CONVERSATION_FOLDER_COLL.findOne({
                        _id: folderID,
                        author: authorID,
                    })
                        .select(select)
                        .populate(populates)
                        .lean()

                if (!infoFolder) {
                    return resolve({
                        error: true,
                        message: 'Folder không tồn tại',
                        keyError: 'folder_not_exists',
                        status: 400,
                    })
                }

                return resolve({ error: false, data: infoFolder, status: 200 })
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
     * Func: Lấy danh sách folder
     * Date: 11/02/2022
     */
    getList({ lastestID, keyword, limit = 10, select, populates, authorID }) {
        return new Promise(async (resolve) => {
            try {
                let conditionObj = { author: authorID }
                let sortBy = { createAt: -1 }
                let keys = ['createAt__-1', '_id__-1']

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

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    conditionObj.name = new RegExp(keyword, 'i')
                }

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await CHATTING__CONVERSATION_FOLDER_COLL.findById(
                            lastestID
                        )
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

                let listFolders = await CHATTING__CONVERSATION_FOLDER_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                // GET TOTAL RECORD
                let totalRecord =
                    await CHATTING__CONVERSATION_FOLDER_COLL.count(
                        conditionObjOrg
                    )
                let nextCursor = null

                if (listFolders && listFolders.length) {
                    if (listFolders.length > limit) {
                        nextCursor = listFolders[limit - 1]._id
                        listFolders.length = limit
                    }
                }

                return resolve({
                    error: false,
                    status: 200,
                    data: {
                        listRecords: listFolders,
                        limit,
                        totalRecord,
                        nextCursor,
                    },
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
     * Func: Xóa folder
     * Date: 11/02/2022
     */
    delete({ folderID, authorID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([folderID, authorID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số folderID hoặc authorID không hợp lệ',
                        keyError: 'params_folderID_or_authorID_invalid',
                        status: 400,
                    })
                }

                let infoFolder =
                    await CHATTING__CONVERSATION_FOLDER_COLL.findOne({
                        _id: folderID,
                        author: authorID,
                    })
                        .select('_id')
                        .lean()

                if (!infoFolder) {
                    return resolve({
                        error: true,
                        message: 'Folder không tồn tại',
                        keyError: 'folder_not_exists',
                        status: 400,
                    })
                }

                let infoAfterDelete =
                    await CHATTING__CONVERSATION_FOLDER_COLL.findByIdAndDelete(
                        folderID
                    )

                if (!infoAfterDelete) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

                return resolve({
                    error: false,
                    status: 200,
                    data: infoAfterDelete,
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
