'use strict'

const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const stringUtils = require('../../../tools/utils/string_utils')
const { KEY_ERROR } = require('../../../tools/keys')
const ObjectID = require('mongoose').Types.ObjectId
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const { uploadFileS3 } = require('../../../tools/s3')

/**s
 * import inter-coll, exter-coll
 */
const FNB_PRODUCT_COLL = require('../database/fnb.product-coll')

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
    constructor() {
        super(FNB_PRODUCT_COLL)
    }

    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 24/11/2022
     */
    insert({
        userID,
        companyID,
        parentID,
        name,
        sign,
        unit,
        note,
        quantity,
        unitPrice,
        unitPrice2,
        unitPrice3,
        unitPrice4,
        type,
    }) {
        // console.log({ userID, companyID, parentID, name, sign, unit, note, quantity, unitPrice, unitPrice2, unitPrice3, unitPrice4, type })
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(companyID) || !name)
                    return resolve({
                        error: true,
                        message: 'companyID|name invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let dataInsert = {
                    company: companyID,
                    name,
                    namecv: stringUtils.removeAccents(name),
                    type,
                    // convertOption: 2, //Truyền tham biến
                    userCreate: userID,
                }
                if (sign && sign != '') {
                    let checkExist = await FNB_PRODUCT_COLL.findOne({
                        company: companyID,
                        sign,
                    })
                    if (checkExist)
                        return resolve({
                            error: true,
                            message: 'Mã hiệu đã tồn tại',
                            keyError: KEY_ERROR.ITEM_EXISTED,
                        })

                    dataInsert.sign = sign
                }

                if (parentID && checkObjectIDs(parentID)) {
                    let infoParent = await FNB_PRODUCT_COLL.findById(parentID)

                    dataInsert.parent = parentID
                    dataInsert.level = infoParent.level + 1
                }

                if (unit && unit != '') {
                    dataInsert.unit = unit
                }

                if (note && note != '') {
                    dataInsert.note = note
                }

                if (!isNaN(unitPrice)) {
                    dataInsert.unitPrice = Number(unitPrice)
                    dataInsert.unitPrice2 = Number(unitPrice2)
                    dataInsert.unitPrice3 = Number(unitPrice3)
                    dataInsert.unitPrice4 = Number(unitPrice4)

                    if (!isNaN(quantity)) {
                        dataInsert.quantity = Number(quantity)
                        dataInsert.amount = Number(quantity * unitPrice)
                    } else {
                        dataInsert.amount = Number(unitPrice)
                    }
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                // console.log(infoAfterInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                    })

                //______Cập nhật amountChilds cho phần tử cha
                if (parentID && checkObjectIDs(parentID)) {
                    await FNB_PRODUCT_COLL.findByIdAndUpdate(
                        parentID,
                        { $inc: { amountChilds: 1 } },
                        { new: true }
                    )
                }

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: update group
     * Author: Depv
     * Code:
     */
    update({
        companyID,
        productID,
        userID,
        parentID,
        type,
        name,
        sign,
        unit,
        note,
        quantity,
        unitPrice,
        unitPrice2,
        unitPrice3,
        unitPrice4,
        imagesID,
        fundasID,
        option,
        convertOption,
        status,
    }) {
        // console.log({ companyID, productID, userID, parentID, type, name, sign, unit, note, quantity, unitPrice, unitPrice2, unitPrice3, unitPrice4, imagesID, fundasID, option, convertOption, status })
        return new Promise(async (resolve) => {
            try {
                if (!option) {
                    if (!checkObjectIDs(productID))
                        return resolve({
                            error: true,
                            message: 'productID__invalid',
                            keyError: KEY_ERROR.PARAMS_INVALID,
                        })

                    let dataUpdate = {
                        userUpdate: userID,
                        modifyAt: new Date(),
                    }

                    if (parentID && checkObjectIDs(parentID)) {
                        dataUpdate.parent = parentID
                    }

                    if (status && !isNaN(status)) {
                        dataUpdate.status = Number(status)
                    }

                    if (type && !isNaN(type)) {
                        dataUpdate.type = Number(type)
                    }

                    if (name && name != '') {
                        dataUpdate.name = name
                        dataUpdate.namecv = stringUtils.removeAccents(name)
                    }

                    if (sign && sign != '') {
                        dataUpdate.sign = sign
                    }

                    if (imagesID && imagesID.length) {
                        dataUpdate.$addToSet = {
                            images: imagesID,
                        }
                    }

                    if (fundasID) {
                        dataUpdate.fundas = fundasID
                    }

                    if (unit && unit != '') {
                        dataUpdate.unit = unit
                    }

                    if (note && note != '') {
                        dataUpdate.note = note
                    }

                    if (quantity && !isNaN(quantity)) {
                        dataUpdate.quantity = Number(quantity)
                    }

                    if (unitPrice && !isNaN(unitPrice)) {
                        dataUpdate.unitPrice = Number(unitPrice)
                        dataUpdate.unitPrice2 = Number(unitPrice2)
                        dataUpdate.unitPrice3 = Number(unitPrice3)
                        dataUpdate.unitPrice4 = Number(unitPrice4)

                        dataUpdate.amount = Number(quantity * unitPrice)
                    }

                    let infoAfterUpdate =
                        await FNB_PRODUCT_COLL.findByIdAndUpdate(
                            productID,
                            dataUpdate,
                            { new: true }
                        )
                    if (!infoAfterUpdate)
                        return resolve({
                            error: true,
                            message: 'Cập nhật thất bại',
                            keyError: KEY_ERROR.UPDATE_FAILED,
                        })

                    return resolve({ error: false, data: infoAfterUpdate })
                } else {
                    let infoAfterUpdate = await FNB_PRODUCT_COLL.updateMany(
                        // { company: companyID},
                        { company: companyID, convertOption: convertOption },
                        { $set: { fundas: fundasID } },
                        { new: true }
                    )

                    if (!infoAfterUpdate)
                        return resolve({
                            error: true,
                            message: 'Cập nhật thất bại',
                            keyError: KEY_ERROR.UPDATE_FAILED,
                        })

                    return resolve({ error: false, data: infoAfterUpdate })
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: get info user_pcm_plan_group
     * Author: Depv
     * Code:
     */
    getInfo({ productID, select, populates = {} }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(productID))
                    return resolve({ error: true, message: 'param_invalid' })

                // populate
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

                let infoPlanGroup = await FNB_PRODUCT_COLL.findById(productID)
                    .select(select)
                    .populate(populates)

                if (!infoPlanGroup)
                    return resolve({
                        error: true,
                        message: 'cannot_get',
                        keyError: KEY_ERROR.GET_INFO_FAILED,
                    })

                return resolve({ error: false, data: infoPlanGroup })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Get list
     * Author: HiepNH
     * Code: 24/11/2022
     */
    getList({
        companyID,
        parentID,
        fundaID,
        type,
        isParent,
        convertOption,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates,
        sortKey,
        userID,
        status,
    }) {
        // console.log({ companyID, parentID, fundaID, type, isParent, convertOption, keyword, limit, lastestID, select, populates, sortKey, userID, status })
        return new Promise(async (resolve) => {
            try {
                if (Number(limit) > 50) {
                    limit = 50
                } else {
                    limit = +Number(limit)
                }

                let conditionObj = { company: ObjectID(companyID) }
                let sortBy
                // let keys	 = ['createAt__-1'];
                let keys = ['createAt__1', '_id__1']

                if (fundaID && checkObjectIDs(fundaID)) {
                    conditionObj.fundas = { $in: [fundaID] }
                }

                if (parentID && checkObjectIDs(parentID)) {
                    conditionObj.parent = ObjectID(parentID)
                }

                // Chỉ lấy danh mục
                if (isParent && Number(isParent) == 1) {
                    conditionObj.parent = { $exists: false }
                }

                // Phân loại (sản phẩm chính/topping)
                if (type && !isNaN(type)) {
                    conditionObj.type = Number(type)
                }

                // Theo trạng thái sản phẩm
                if (status && !isNaN(status)) {
                    conditionObj.status = Number(status)
                }

                if (convertOption) {
                    conditionObj.convertOption = Number(convertOption)
                }

                // Làm rõ mục đích để làm gì?
                if (sortKey && typeof sortKey === 'string') {
                    if (!IsJsonString(sortKey))
                        return resolve({
                            error: true,
                            message: 'Request params sortKey invalid',
                            status: 400,
                        })

                    keys = JSON.parse(sortKey)
                }
                // console.log(conditionObj)

                /**
                 * ĐIỀU KIỆN KHÁC
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

                if (keyword) {
                    let keywordCV = stringUtils.removeAccents(keyword)
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    const regSearch = new RegExp(keyword, 'i')

                    keywordCV = keywordCV.split(' ')
                    keywordCV = '.*' + keywordCV.join('.*') + '.*'
                    const regCVSearch = new RegExp(keywordCV, 'i')

                    conditionObj.namecv = regCVSearch
                }

                if (select && typeof select === 'string') {
                    if (!IsJsonString(select))
                        return resolve({
                            error: true,
                            message: 'Request params select invalid',
                            status: 400,
                        })

                    select = JSON.parse(select)
                }

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await FNB_PRODUCT_COLL.findById(lastestID)
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

                let infoDataAfterGet = await FNB_PRODUCT_COLL.find(conditionObj)
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                if (!infoDataAfterGet)
                    return resolve({
                        error: true,
                        message: "Can't get data",
                        status: 403,
                    })

                let nextCursor = null
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]?._id
                        infoDataAfterGet.length = limit
                    }
                }
                let totalRecord = await FNB_PRODUCT_COLL.count(conditionObjOrg)
                let totalPage = Math.ceil(totalRecord / limit)

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit: limit,
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
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 8/12/2022
     */
    downloadTemplateExcel({ companyID, userID }) {
        return new Promise(async (resolve) => {
            try {
                // Modify the workbook.
                XlsxPopulate.fromFileAsync(
                    path.resolve(
                        __dirname,
                        '../../../files/templates/excels/fnb_product_template_import.xlsx'
                    )
                ).then(async (workbook) => {
                    const now = new Date()
                    const filePath = '../../../files/temporary_uploads/'
                    const fileName = `Template_import_product_${now.getTime()}.xlsx`
                    const pathWriteFile = path.resolve(
                        __dirname,
                        filePath,
                        fileName
                    )

                    await workbook.toFileAsync(pathWriteFile)
                    const result = await uploadFileS3(pathWriteFile, fileName)

                    fs.unlinkSync(pathWriteFile)
                    // console.log({ result })
                    return resolve({
                        error: false,
                        data: result?.Location,
                        status: 200,
                    })
                })
            } catch (error) {
                console.log({ error })
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
     * Func: importFromExcel
     * Date: 8/1/2023
     */
    importFromExcel({ companyID, dataImport, userID }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                const dataImportJSON = JSON.parse(dataImport)
                // console.log('=============Log data===================');
                // return console.log({ dataImportJSON });
                let index = 0
                let errorNumber = 0

                for (const data of dataImportJSON) {
                    // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
                    if (index > 0) {
                        let dataInsert = {
                            companyID,
                            userID,
                            name: data?.__EMPTY,
                            sign: data?.__EMPTY_1,
                            type: data?.__EMPTY_2,
                            unit: data?.__EMPTY_3,
                            unitPrice: data?.__EMPTY_4,
                            unitPrice2: data?.__EMPTY_5,
                            unitPrice3: data?.__EMPTY_6,
                            unitPrice4: data?.__EMPTY_7,
                            note: data?.__EMPTY_8,
                            parentID: data?.__EMPTY_9,
                        }
                        // console.log(dataInsert);

                        let infoAfterInsert = await that.insert(dataInsert)
                        // console.log(infoAfterInsert);
                        if (infoAfterInsert.error) {
                            errorNumber++
                        }
                    }
                    index++
                }
                if (errorNumber != 0)
                    return resolve({ error: true, message: 'Import failed' })

                return resolve({ error: false, message: 'Import successfull' })
            } catch (error) {
                console.log({ error })
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
