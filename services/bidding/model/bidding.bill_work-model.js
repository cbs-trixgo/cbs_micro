'use strict'

/**
 * EXTERNAL PACKAGE
 */
const ObjectID = require('mongoose').Types.ObjectId

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')
const {
    CF_ACTIONS_DATAHUB,
} = require('../../datahub/helper/datahub.actions-constant')

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const {
    checkObjectIDs,
    IsJsonString,
    _isValid,
} = require('../../../tools/utils/utils')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys/index')

/**
 * COLLECTIONS
 */
const BIDDING__DOC_COLL = require('../database/bidding.doc-coll')
const BIDDING__BILL_ITEM_COLL = require('../database/bidding.bill_item-coll')
const BIDDING__BILL_GROUP_COLL = require('../database/bidding.bill_group-coll')
const BIDDING__BILL_WORK_COLL = require('../database/bidding.bill_work-coll')
const BIDDING__BILL_WORKLINE_COLL = require('../database/bidding.bill_workline-coll')
const BIDDING__BILL_PRODUCT_COLL = require('../database/bidding.bill_product-coll')
const BIDDING__QUOTATION_COLL = require('../database/bidding.quotation-coll')

/**
 * MODELS
 */
const BIDDING__DOC_MODEL = require('./bidding.doc-model').MODEL
const BIDDING__BILL_ITEM_MODEL = require('./bidding.bill_item-model').MODEL
const BIDDING__BILL_GROUP_MODEL = require('./bidding.bill_group-model').MODEL
const BIDDING__BILL_WORKLINE_MODEL =
    require('./bidding.bill_workline-model').MODEL
const BIDDING__BILL_PRODUCT_MODEL =
    require('./bidding.bill_product-model').MODEL

class Model extends BaseModel {
    constructor() {
        super(BIDDING__BILL_WORK_COLL)
    }

    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    insert({
        userID,
        groupID,
        name,
        sign,
        unit,
        description,
        note,
        plus,
        quantity,
        quantity2,
        unitprice1,
        unitprice2,
        unitprice3,
        unitprice,
        amount,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                let infoGroup = await BIDDING__BILL_GROUP_COLL.findById(groupID)
                if (!infoGroup)
                    return resolve({
                        error: true,
                        message: 'infoGroup không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                        status: 400,
                    })

                let dataInsert = {
                    userCreate: userID,
                    area: infoGroup.area,
                    client: infoGroup.client,
                    project: infoGroup.project,
                    doc: infoGroup.doc,
                    item: infoGroup.item,
                    group: groupID,
                    name,
                }

                // if (checkObjectIDs(datahubJobID)) {
                //     dataInsert.datahubJob = datahubJobID;
                // }

                if (sign) {
                    dataInsert.sign = sign
                }

                if (unit) {
                    dataInsert.unit = unit
                }

                if (description) {
                    dataInsert.description = description
                }

                if (note) {
                    dataInsert.note = note
                }

                if (!isNaN(plus) && Number(plus) > 0) {
                    dataInsert.plus = plus
                }

                if (!isNaN(quantity) && Number(quantity) >= 0) {
                    dataInsert.quantity = quantity
                }

                if (!isNaN(quantity2) && Number(quantity2) >= 0) {
                    dataInsert.quantity2 = quantity2
                }

                if (!isNaN(unitprice1) && Number(unitprice1) >= 0) {
                    dataInsert.unitprice1 = unitprice1
                }

                if (!isNaN(unitprice2) && Number(unitprice2) >= 0) {
                    dataInsert.unitprice2 = unitprice2
                }

                if (!isNaN(unitprice3) && Number(unitprice3) >= 0) {
                    dataInsert.unitprice3 = unitprice3
                }

                if (!isNaN(unitprice) && Number(unitprice) >= 0) {
                    dataInsert.unitprice = unitprice
                    dataInsert.amount =
                        Number(quantity | 0) * Number(unitprice | 0)
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                        status: 403,
                    })

                /**
                 * CẬP NHẬT LẠI GROUP, ITEM VÀ DOC
                 */
                let infoGoup = await BIDDING__BILL_GROUP_MODEL.updateValue({
                    option: 1,
                    groupID,
                    userID,
                })
                let infoItem = await BIDDING__BILL_ITEM_MODEL.updateValue({
                    option: 1,
                    itemID: infoGroup.item,
                    userID,
                })
                let infoDoc = await BIDDING__DOC_MODEL.updateValue({
                    option: 1,
                    docID: infoGroup.doc,
                    userID,
                })
                console.log('==========>>>>>CẬP NHẬT LẠI GROUP, ITEM VÀ DOC')
                // console.log(infoGoup)
                // console.log(infoItem)
                // console.log(infoDoc)
                console.log(
                    '==========>>>>>END CẬP NHẬT LẠI GROUP, ITEM VÀ DOC'
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
     * Name: Update
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    update({
        userID,
        workID,
        name,
        sign,
        unit,
        description,
        note,
        plus,
        quantity,
        quantity2,
        unitprice1,
        unitprice2,
        unitprice3,
        unitprice,
        amount,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                let infoWork = await BIDDING__BILL_WORK_COLL.findById(workID)
                if (!infoWork)
                    return resolve({
                        error: true,
                        message: 'infoWork không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                        status: 400,
                    })

                let groupID = infoWork.group
                let itemID = infoWork.item
                let docID = infoWork.doc

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataUpdate = {
                    userUpdate: userID,
                    modifyAt: Date.now(),
                }

                // if (checkObjectIDs(datahubJobID)) {
                //     dataInsert.datahubJob = datahubJobID;
                // }

                if (name) {
                    dataUpdate.name = name
                }

                if (sign) {
                    dataUpdate.sign = sign
                }

                if (unit) {
                    dataUpdate.unit = unit
                }

                if (description) {
                    dataUpdate.description = description
                }

                if (note) {
                    dataUpdate.note = note
                }

                if (!isNaN(plus) && Number(plus) > 0) {
                    dataUpdate.plus = plus
                }

                if (!isNaN(quantity) && Number(quantity) >= 0) {
                    dataUpdate.quantity = quantity
                }

                if (!isNaN(quantity2) && Number(quantity2) >= 0) {
                    dataUpdate.quantity2 = quantity2
                }

                if (!isNaN(unitprice1) && Number(unitprice1) >= 0) {
                    dataUpdate.unitprice1 = unitprice1
                }

                if (!isNaN(unitprice2) && Number(unitprice2) >= 0) {
                    dataUpdate.unitprice2 = unitprice2
                }

                if (!isNaN(unitprice3) && Number(unitprice3) >= 0) {
                    dataUpdate.unitprice3 = unitprice3
                }

                if (!isNaN(unitprice) && Number(unitprice) >= 0) {
                    dataUpdate.unitprice = unitprice
                    dataUpdate.amount =
                        Number(quantity | 0) * Number(unitprice | 0)
                }

                let infoAfterUpdate =
                    await BIDDING__BILL_WORK_COLL.findByIdAndUpdate(
                        workID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: "can't_update",
                        status: 403,
                    })

                /**
                 * CẬP NHẬT LẠI GROUP, ITEM VÀ DOC
                 */
                let infoGoup = await BIDDING__BILL_GROUP_MODEL.updateValue({
                    option: 1,
                    groupID,
                    userID,
                })
                let infoItem = await BIDDING__BILL_ITEM_MODEL.updateValue({
                    option: 1,
                    itemID,
                    userID,
                })
                let infoDoc = await BIDDING__DOC_MODEL.updateValue({
                    option: 1,
                    docID,
                    userID,
                })
                console.log('==========>>>>>CẬP NHẬT LẠI GROUP, ITEM VÀ DOC')
                // console.log(infoGoup)
                // console.log(infoItem)
                // console.log(infoDoc)
                console.log(
                    '==========>>>>>END CẬP NHẬT LẠI GROUP, ITEM VÀ DOC'
                )

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
     * Name: Remove
     * Author: Hiepnh
     * Date: 02/5/2022
     */

    /**
     * Name: Get info
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    getInfo({ workID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(workID))
                    return resolve({ error: true, message: 'param_invalid' })

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

                let info = await BIDDING__BILL_WORK_COLL.findById(workID)
                    .select(select)
                    .populate(populates)

                if (!info)
                    return resolve({ error: true, message: 'cannot_get' })

                return resolve({ error: false, data: info })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Get list
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    getList({
        groupID,
        keyword,
        limit = 50,
        lastestID,
        select,
        populates = {},
        sortKey,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (limit > 50) {
                    limit = 50
                } else {
                    limit = +limit
                }

                /**
                 * DECALARTION VARIABLE (1)
                 */
                // Chỉ hiển thị sổ quỹ mà user là member
                let sortBy
                let conditionObj = {}
                let keys = ['createAt__-1', '_id__-1']

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */

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

                if (sortKey && typeof sortKey === 'string') {
                    if (!IsJsonString(sortKey))
                        return resolve({
                            error: true,
                            message: 'Request params sortKey invalid',
                            status: 400,
                        })

                    keys = JSON.parse(sortKey)
                }

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */
                if (checkObjectIDs(groupID)) {
                    conditionObj.group = groupID
                }
                console.log(conditionObj)

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    let regExpSearch = RegExp(keyword, 'i')
                    conditionObj.name = regExpSearch
                }
                let conditionObjOrg = { ...conditionObj }

                // PHÂN TRANG KIỂU MỚI
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData =
                        await BIDDING__BILL_WORK_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info lastest",
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

                let infoDataAfterGet = await BIDDING__BILL_WORK_COLL.find(
                    conditionObj
                )
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                // GET TOTAL RECORD
                if (!infoDataAfterGet)
                    return resolve({
                        error: true,
                        message: "Can't get data",
                        status: 403,
                    })

                let nextCursor = null
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id
                        infoDataAfterGet.length = limit
                    }
                }

                let totalRecord =
                    await BIDDING__BILL_WORK_COLL.count(conditionObjOrg)
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
     * PHÂN TÍCH NGUỒN LỰC VỚI DATAHUB
     */
    /**
     * Name  : Cập nhật giá công tác từ định mức => Cập nhật Group, Item, Doc
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    updateJobPrice({ workID, userID }) {
        return new Promise(async (resolve) => {
            try {
                let infoWork = await BIDDING__BILL_WORK_COLL.findById(workID)
                if (!infoWork)
                    return resolve({
                        error: true,
                        message: 'infoWork không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                        status: 400,
                    })

                let quantity = infoWork.quantity || 0
                let groupID = infoWork.group
                let itemID = infoWork.item
                let docID = infoWork.doc

                //_________Danh sách các vật tư thuộc công tác đang xét
                let listDataWorkline = await BIDDING__BILL_WORKLINE_COLL.find({
                    work: workID,
                })

                //_________Tính toán lại đơn giá công tác
                let total = 0,
                    total1 = 0,
                    total2 = 0,
                    total3 = 0

                for (const item of listDataWorkline) {
                    if (Number(item.type) === 1) {
                        total1 =
                            Number(total1) +
                            Number(item.quantity * item.unitprice)
                    }
                    if (Number(item.type) === 2) {
                        total2 =
                            Number(total2) +
                            Number(item.quantity * item.unitprice)
                    }
                    if (Number(item.type) === 3) {
                        total3 =
                            Number(total3) +
                            Number(item.quantity * item.unitprice)
                    }
                    total =
                        Number(total) + Number(item.quantity * item.unitprice)
                }

                //_________Cập nhật đơn giá công tác và thành tiền công tác
                let infoAfterUpdate =
                    await BIDDING__BILL_WORK_COLL.findByIdAndUpdate(
                        workID,
                        {
                            userUpdate: userID,
                            modifyAt: Date.now(),
                            unitprice1: Number(total1).toFixed(3),
                            unitprice2: Number(total2).toFixed(3),
                            unitprice3: Number(total3).toFixed(3),
                            unitprice: Number(total).toFixed(3),
                            amount: Number(total) * Number(quantity),
                        },
                        { new: true }
                    )

                if (!infoAfterUpdate)
                    return resolve({ error: true, message: 'cannot_update' })

                console.log('==========>>>>>NEW WORK INFO')
                console.log(infoAfterUpdate)

                /**
                 * CẬP NHẬT LẠI GROUP, ITEM VÀ DOC
                 */
                let infoGoup = await BIDDING__BILL_GROUP_MODEL.updateValue({
                    option: 1,
                    groupID,
                    userID,
                })
                let infoItem = await BIDDING__BILL_ITEM_MODEL.updateValue({
                    option: 1,
                    itemID,
                    userID,
                })
                let infoDoc = await BIDDING__DOC_MODEL.updateValue({
                    option: 1,
                    docID,
                    userID,
                })
                console.log('==========>>>>>CẬP NHẬT LẠI GROUP, ITEM VÀ DOC')
                // console.log(infoGoup)
                // console.log(infoItem)
                // console.log(infoDoc)
                console.log(
                    '==========>>>>>END CẬP NHẬT LẠI GROUP, ITEM VÀ DOC'
                )

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Gán mã định mức cho công tác
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    assignJobInTemplate({ datahubJobID, workID, userID, ctx }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Khi workID chưa có datahubJobID
                 * +++Gán datahubJobID cho workID
                 * +++Cập nhật workline và bill_product
                 * +++Tính đơn giá workID theo datahubJobID/jobline
                 * +++Cập nhật giá của groupID, itemID, docID chứa workID
                 *
                 * 2-Khi workID đã có link datahubJobID trước đó
                 * +++Gán datahubJobID mới cho workID
                 * +++Xóa các định mức cũ của workID trong workline
                 * +++Cập nhật workline và bill_product
                 * +++Cập đơn giá workID theo workline mới
                 * +++Cập nhật giá của groupID, itemID, docID chứa workID
                 *
                 * 3-Nếu hủy gán datahubJobID
                 * +++Xóa hết định mức của workID trong workline
                 * +++Cập nhật giá của workID về 0
                 * +++Cập nhật giá của groupID, itemID, docID chứa workID
                 */
                if (!_isValid(workID) || !_isValid(userID))
                    return resolve({ error: true, message: 'param_not_valid' })

                let info = await BIDDING__BILL_WORK_COLL.findById(workID)
                if (!info)
                    return resolve({
                        error: true,
                        message: 'infoWork không hợp lệ',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                        status: 400,
                    })
                let docID = info.doc
                console.log(info)

                // NẾU CÔNG VIỆC ĐÃ GÁN MÃ TỪ TRƯỚC
                if (datahubJobID && _isValid(datahubJobID)) {
                    // B1 Kiểm tra xem boq đã gán mã trước đó hay chưa
                    let infoWork = await BIDDING__BILL_WORK_COLL.findOne({
                        _id: workID,
                        datahubJob: { $exists: true, $ne: null },
                    })

                    // B2.1 Đã tồn tại
                    if (infoWork) {
                        console.log('===========21-Đã tồn tại')
                        /**
                         * BA
                         * 1. Gán lại mã công tác mới
                         * 2. Xóa các định mức cũ đang có
                         * 3. Cập nhật theo các định mức mới
                         * 4. Cập nhật giá thành phần hao phí của công tác
                         * 5. Cập nhật giá công tác cho gói thầu
                         */

                        // 1. Gán lại mã công tác mới
                        console.log('===========1. Gán lại mã công tác mới')
                        await BIDDING__BILL_WORK_COLL.findByIdAndUpdate(
                            workID,
                            {
                                datahubJob: datahubJobID,
                            },
                            { new: true }
                        )

                        // 2. Xóa các định mức cũ đang có
                        console.log('===========2. Xóa các định mức cũ đang có')
                        await BIDDING__BILL_WORKLINE_COLL.deleteMany({
                            work: workID,
                        })

                        /**
                         * 3. Cập nhật theo các định mức mới
                         */
                        console.log(
                            '===========3. Cập nhật theo các định mức mới'
                        )
                        //_________Lấy định mức của công tác mẫu
                        let listData = await ctx.call(
                            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_GET_INFO_AND_GET_LIST}`,
                            { jobID: datahubJobID }
                        )
                        console.log(listData)
                        console.log(listData.data.listRecords)

                        /**
                         * Tạo định mức cho công tác mới => Phục vụ tổng hợp vật tư
                         * - Tạo định mức mới
                         * - Cập nhật theo giá vật tư của gói thầu
                         */
                        console.log(
                            '===========4. Tạo định mức cho công tác mới => Phục vụ tổng hợp vật tư'
                        )
                        for (const item of listData.data.listRecords) {
                            // Tính toán đơn giá vật tư
                            let unitprice = 0

                            // Lấy giá vật tư trong gói thầu
                            let infoProduct =
                                await BIDDING__BILL_PRODUCT_COLL.findOne({
                                    doc: docID,
                                    product: item.product,
                                })

                            // Nếu gói thầu không có vật tư => lấy giá trong Datahub
                            if (infoProduct && infoProduct.unitprice) {
                                console.log(
                                    'Có vật tư trong gói thầu===========>>>>>>>>>>'
                                )
                                unitprice = Number(infoProduct.unitprice)
                                console.log({ infoProduct: infoProduct })
                            } else {
                                console.log(
                                    'Chưa có vật tư trong gói thầu===========>>>>>>>>>>'
                                )
                                // Lấy giá trong Datahub
                                unitprice = Number(item.unitprice)

                                // Tạo vật tư cho gói thầu để dùng lại lần sau
                                let infoNew =
                                    await BIDDING__BILL_PRODUCT_MODEL.insert({
                                        docID,
                                        productID: item.product,
                                        type: item.type,
                                        unitprice: item.unitprice,
                                        userID,
                                    })

                                console.log('infoProduct===========>>>>>>>>>>')
                                console.log(infoNew)
                            }
                            console.log({ unitprice: unitprice })

                            // Tạo định mức công tác trong gói thầu
                            await BIDDING__BILL_WORKLINE_MODEL.insert({
                                workID,
                                productID: item.product,
                                type: item.type,
                                quantity: item.quantity,
                                unitprice,
                                userID,
                            })
                        }

                        /**
                         * 4. Cập nhật giá công tác của gói thầu
                         * - Do cập nhật thành phần hao phí mới
                         */
                        await that.updateJobPrice({ workID, userID })
                    }

                    // B2.2 Chưa tồn tại
                    else {
                        console.log('===========22-Chưa tồn tại')

                        /**
                         * BA
                         * 1. Gán mã công tác mới
                         * 2. Cập nhật theo các định mức mới
                         * 3. Cập nhật giá thành phần hao phí của công tác
                         * 4. Cập nhật giá công tác của gói thầu
                         */
                        // 1. Gán mã công tác mới
                        console.log('===========1. Gán mã công tác mới')
                        await BIDDING__BILL_WORK_COLL.findByIdAndUpdate(
                            workID,
                            {
                                datahubJob: datahubJobID,
                            },
                            { new: true }
                        )

                        /**
                         * 2. Cập nhật theo các định mức mới
                         */
                        console.log(
                            '===========2. Cập nhật theo các định mức mới'
                        )
                        //_________Lấy định mức của công tác mẫu
                        let listData = await ctx.call(
                            `${CF_DOMAIN_SERVICES.DATAHUB}.${CF_ACTIONS_DATAHUB.DATAHUB_JOBLINE_GET_INFO_AND_GET_LIST}`,
                            { jobID: datahubJobID }
                        )
                        console.log(listData)
                        console.log(listData.data.listRecords)

                        /**
                         * Tạo định mức cho công tác mới => Phục vụ tổng hợp vật tư
                         * - Tạo định mức mới
                         * - Cập nhật theo giá vật tư của gói thầu
                         */
                        console.log(
                            '===========3. Tạo định mức cho công tác mới'
                        )
                        for (const item of listData.data.listRecords) {
                            console.log({ item: item })
                            // Tính toán đơn giá vật tư
                            let unitprice = 0

                            // Lấy giá vật tư trong gói thầu
                            let infoProduct =
                                await BIDDING__BILL_PRODUCT_COLL.findOne({
                                    doc: docID,
                                    product: item.product,
                                })
                            console.log(infoProduct)

                            // Nếu gói thầu không có vật tư => lấy giá trong Datahub
                            if (infoProduct && infoProduct.unitprice) {
                                console.log(
                                    'Có vật tư trong gói thầu===========>>>>>>>>>>'
                                )
                                unitprice = Number(infoProduct.unitprice)

                                console.log({ infoProduct: infoProduct })
                            } else {
                                console.log(
                                    'Chưa có vật tư trong gói thầu===========>>>>>>>>>>'
                                )
                                // Lấy giá trong Datahub
                                unitprice = Number(item.unitprice)

                                // Tạo vật tư cho gói thầu để dùng lại lần sau
                                let infoNew =
                                    await BIDDING__BILL_PRODUCT_MODEL.insert({
                                        docID,
                                        productID: item.product,
                                        type: item.type,
                                        unitprice: item.unitprice,
                                        userID,
                                    })
                                console.log('infoProduct===========>>>>>>>>>>')
                                console.log(infoNew)
                            }
                            console.log({ unitprice: unitprice })

                            // Tạo định mức công tác trong gói thầu
                            let check =
                                await BIDDING__BILL_WORKLINE_MODEL.insert({
                                    workID,
                                    productID: item.product,
                                    type: item.type,
                                    quantity: item.quantity,
                                    unitprice,
                                    userID,
                                })
                            console.log(check)
                        }

                        /**
                         * 3. Cập nhật giá công tác của gói thầu
                         * - Do cập nhật thành phần hao phí mới
                         */
                        await that.updateJobPrice({ workID, userID })
                    }

                    return resolve({ error: false, message: 'successfull' })
                }

                // TRƯỜNG HỢP 2: NẾU HỦY GÁN
                else {
                    console.log('===========11-Hủy gán')

                    //_________Reset lại toàn bộ dữ liệu cho công tác
                    await BIDDING__BILL_WORK_COLL.findByIdAndUpdate(
                        workID,
                        {
                            unitprice1: 0,
                            unitprice2: 0,
                            unitprice3: 0,
                            unitprice: 0,
                            amount: 0,
                            datahubJob: null,
                            modifyAt: Date.now(),
                        },
                        { new: true }
                    )

                    //_________Hủy toàn bộ định mức vật tư đã gán trước đó
                    await BIDDING__BILL_WORKLINE_MODEL.deleteMany({
                        work: workID,
                    })

                    /**
                     * 3. Cập nhật giá công tác của gói thầu
                     * - Do cập nhật thành phần hao phí mới
                     */
                    await that.updateJobPrice({ workID, userID })

                    return resolve({ error: false, message: 'successfull' })
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Cập nhật giá vật tư trong gói thầu
     * Author: Hiepnh
     * Date: 02/5/2022
     */
    updateProductPrice({ docID, productID, unitprice, userID }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                if (
                    !_isValid(docID) ||
                    !_isValid(productID) ||
                    !_isValid(userID)
                )
                    return resolve({ error: true, message: 'param_not_valid' })

                /**
                 * BA
                 * B1. CẬP NHẬT GIÁ VẬT TƯ TRONG BIDDING_PRODUCT (phục vụ tổng hợp vật tư gói thầu)
                 * B2. CẬP NHẬT GIÁ VẬT TƯ TRONG BIDDING_WORKLINE (phục vụ kiểm tra phân tích vật tư)
                 * B3. CẬP NHẬT GIÁ CÔNG TÁC TRONG GÓI THẦU (phục vụ so sánh giá với nhà thầu)
                 */

                // B1. CẬP NHẬT GIÁ VẬT TƯ TRONG BIDDING_PRODUCT
                await BIDDING__BILL_PRODUCT_COLL.findOneAndUpdate(
                    {
                        doc: ObjectID(docID),
                        product: ObjectID(productID),
                    },
                    {
                        unitprice: Number(unitprice).toFixed(3),
                    },
                    { new: true }
                )

                //B2. CẬP NHẬT GIÁ VẬT TƯ TRONG BIDDING_WORKLINE
                await BIDDING__BILL_WORKLINE_COLL.updateMany(
                    {
                        doc: ObjectID(docID),
                        product: ObjectID(productID),
                    },
                    { $set: { unitprice: unitprice } }
                )

                /**
                 * B3. CẬP NHẬT GIÁ CÔNG TÁC TRONG GÓI THẦU
                 * 1. Lấy danh sách các công tác có chứa vật tư
                 * 2. Lặp qua từng công tác để tính toán và update lại đơn giá
                 */
                //_________1. Lấy danh sách các công tác có chứa vật tư
                let listData = await BIDDING__BILL_WORKLINE_COLL.find({
                    doc: ObjectID(docID),
                    product: ObjectID(productID),
                })
                console.log(
                    '_________1. Lấy danh sách các công tác có chứa vật tư'
                )
                console.log(listData)

                let listDataWork = await BIDDING__BILL_WORK_COLL.find({
                    _id: { $in: listData.map((item) => item.work) },
                }).select('_id name')

                //_________2. Lặp qua từng công tác để tính toán và update lại đơn giá
                for (const item of listDataWork) {
                    await that.updateJobPrice({ workID: item._id, userID })
                }

                return resolve({ error: false, message: 'successfull' })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }
}

exports.MODEL = new Model()
