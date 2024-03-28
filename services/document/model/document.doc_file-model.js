'use strict'

/**
 * EXTERNAL PACKAGE
 */

/**
 * CONSTANTS
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
const DOCUMENT__DOC_FILE_COLL = require('../database/document.doc_file-coll')
const DOCUMENT__DOC_COLL = require('../database/document.doc-coll')

class Model extends BaseModel {
    constructor() {
        super(DOCUMENT__DOC_FILE_COLL)
    }

    /**
     * Name: insert doc file
     * Author: Depv
     * Code:
     */
    // insert({ documentID, fileID, userID }) {
    //     return new Promise(async (resolve) => {
    //         try {
    //             /**
    //              * BA
    //              * 1-Upload File lên S3
    //              * 2-Thêm file vào files[] của Document??? => xem addFileAttachment tại document.doc-model
    //              * 3-Update lastFile của Document??? => xem addFileAttachment tại document.doc-model
    //              */
    //             /**
    //              * VALIDATION STEP (2)
    //              *  - Kiểm tra valid từ các input
    //              *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
    //              */
    //             if(!checkObjectIDs(documentID))
    //                 return resolve({ error: true, message: 'Request params documentID invalid', status: 400 });

    //             if(!checkObjectIDs(fileID))
    //                 return resolve({ error: true, message: 'Request params fileID invalid', status: 400 });

    //             if(!checkObjectIDs(userID))
    //                 return resolve({ error: true, message: 'Request params userID invalid', status: 400 });

    //             /**
    //              * LOGIC STEP (3)
    //              * 3.1: Convert type + update name (ví dụ: string -> number)
    //              * 3.2: Operation database
    //              */
    //             let infoAfterInsert = await this.insertData({ document: documentID, file: fileID, userCreate: userID });

    //             if(!infoAfterInsert)
    //                 return resolve({ error: true, message: "can't_insert", status: 403 });

    //             return resolve({ error: false, data: infoAfterInsert, status: 200 });
    //         } catch (error) {
    //             return resolve({ error: true, message: error.message, status: 500 });
    //         }
    //     })
    // }

    /**
     * Name: delete doc file
     * Author: Depv
     * Code:
     */
    delete({ docFileID }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (!checkObjectIDs(docFileID))
                    return resolve({
                        error: true,
                        message: 'Request params docFileID invalid',
                        status: 400,
                    })

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAfterInsert =
                    await DOCUMENT__DOC_FILE_COLL.findByIdAndDelete(docFileID)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: "can't_delete",
                        status: 403,
                    })

                const docInfo = await DOCUMENT__DOC_COLL.findById(
                    infoAfterInsert.document
                )
                    .select('files')
                    .lean()

                if (!docInfo)
                    return resolve({
                        error: true,
                        message: 'not found document info',
                        status: 404,
                    })

                const docFiles = docInfo.files || []
                const newFiles = docFiles.filter(
                    (fileID) =>
                        fileID.toString() !== infoAfterInsert.file.toString()
                )
                const lastFile = newFiles[newFiles.length - 1]

                const dataUpdateDoc = {
                    lastFile,
                    $pull: {
                        files: { $in: [infoAfterInsert.file] },
                    },
                }

                //Cập nhật trường lastFile vào trong document
                await DOCUMENT__DOC_COLL.findByIdAndUpdate(
                    infoAfterInsert.document,
                    dataUpdateDoc
                )

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
     * Name: get info doc file
     * Author: Depv
     * Code:
     */
    update({ docFileID, official }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (!checkObjectIDs(docFileID))
                    return resolve({
                        error: true,
                        message: 'Request params docFileID invalid',
                        status: 400,
                    })
                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAterUpdate =
                    await DOCUMENT__DOC_FILE_COLL.findByIdAndUpdate(
                        docFileID,
                        { official },
                        { new: true }
                    )
                if (!infoAterUpdate)
                    return resolve({
                        error: true,
                        message: "can't_get_info",
                        status: 403,
                    })

                return resolve({
                    error: false,
                    data: infoAterUpdate,
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
     * Name: get info doc file
     * Author: Depv
     * Code:
     */
    getInfo({ docFileID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if (!checkObjectIDs(docFileID))
                    return resolve({
                        error: true,
                        message: 'Request params docFileID invalid',
                        status: 400,
                    })

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
                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAterGet = await DOCUMENT__PACKAGE_COLL.findById(
                    docFileID
                )
                    .select(select)
                    .populate(populates)
                if (!infoAterGet)
                    return resolve({
                        error: true,
                        message: "can't_get_info",
                        status: 403,
                    })

                return resolve({ error: false, data: infoAterGet, status: 200 })
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
     * Dev: HiepNH
     * Func: Get list doc file
     * Date: 26/10/2021
     */
    getList({
        documentID,
        lastestID,
        keyword,
        limit = 10,
        select,
        populates = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                if (documentID && !checkObjectIDs(documentID))
                    return resolve({
                        error: true,
                        message: 'Request params documentID invalid',
                        status: 400,
                    })
                if (limit > 20) {
                    limit = 10
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

                let conditionObj = { document: documentID }
                let sortBy
                let keys = ['createAt__1', '_id__1']

                let conditionObjOrg = { ...conditionObj }
                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await DOCUMENT__DOC_FILE_COLL.findById(lastestID)
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

                let listDocFile = await DOCUMENT__DOC_FILE_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                // GET TOTAL RECORD
                let totalRecord =
                    await DOCUMENT__DOC_FILE_COLL.count(conditionObjOrg)
                let totalPage = Math.ceil(totalRecord / limit)
                let nextCursor = null

                if (listDocFile && listDocFile.length) {
                    if (listDocFile.length > limit) {
                        nextCursor = listDocFile[limit - 1]._id
                        listDocFile.length = limit
                    }
                }

                return resolve({
                    error: false,
                    status: 200,
                    data: {
                        listRecords: listDocFile,
                        limit: +limit,
                        totalRecord,
                        totalPage,
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
}

exports.MODEL = new Model()
