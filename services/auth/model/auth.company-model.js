'use strict'
const BaseModel = require('../../../tools/db/base_model')
const ObjectID = require('mongoose').Types.ObjectId
const { _isValid } = require('../../../tools/utils/utils')
const { KEY_ERROR } = require('../../../tools/keys')

const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

/**
 * COLLECTION
 */
const AUTH__COMPANY_COLL = require('../database/auth.company-coll')

class Model extends BaseModel {
    constructor() {
        super(require('../database/auth.company-coll'))
    }

    insert({
        name,
        sign,
        taxid,
        address,
        area,
        phone,
        email,
        description,
        birthDay,
        website,
        userID,
    }) {
        return new Promise(async (resolve) => {
            try {
                let info = await AUTH__COMPANY_COLL.findOne({
                    $or: [{ name: name }, { sign: sign }],
                }).select('_id name sign')

                if (info)
                    return resolve({
                        error: true,
                        message: `Tên/Mã hiệu đã tồn tại: ${info.name}`,
                    })

                let dataInsert = {
                    name,
                    sign,
                    taxid,
                    address,
                    area,
                    phone,
                    email,
                    description,
                    birthDay,
                    website,
                    userCreate: userID,
                    userUpdate: userID,
                }

                let infoCompanyAfterSave = await this.insertData(dataInsert)
                if (!infoCompanyAfterSave)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                    })

                return resolve({ error: false, data: infoCompanyAfterSave })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    update({
        companyID,
        name,
        sign,
        taxid,
        address,
        area,
        phone,
        email,
        description,
        birthDay,
        image,
        website,
        userID,
    }) {
        return new Promise(async (resolve) => {
            try {
                let infoCompany = await AUTH__COMPANY_COLL.findById(companyID)
                if (!infoCompany)
                    return resolve({
                        error: true,
                        message: 'company_not_exist',
                    })
                // Kiểm tra tên công ty mới thay đổi đã tồn tại mã hiệu hay không ngoại trừ chính nó.
                let info = await AUTH__COMPANY_COLL.findOne({
                    _id: { $ne: companyID },
                    $or: [{ name: name }, { sign: sign }],
                })
                if (info)
                    return resolve({ error: true, message: 'company_existed' })

                let dataUpdate = {
                    userUpdate: userID,
                    modifyAt: new Date(),
                }

                if (name) {
                    dataUpdate.name = name
                }

                if (sign) {
                    dataUpdate.sign = sign
                }

                if (taxid) {
                    dataUpdate.taxid = taxid
                }

                if (address) {
                    dataUpdate.address = address
                }

                if (phone) {
                    dataUpdate.phone = phone
                }

                if (email) {
                    dataUpdate.email = email
                }

                if (area && _isValid(area)) {
                    dataUpdate.area = area
                }

                if (description) {
                    dataUpdate.description = description
                }

                if (birthDay) {
                    dataUpdate.birthDay = birthDay
                }

                if (image) {
                    dataUpdate.image = image
                }

                if (website) {
                    dataUpdate.website = website
                }
                let infoCompanyAfterUpdate =
                    await AUTH__COMPANY_COLL.findByIdAndUpdate(
                        companyID,
                        dataUpdate,
                        { new: true }
                    )

                if (!infoCompanyAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: KEY_ERROR.UPDATE_FAILED,
                    })

                return resolve({ error: false, data: infoCompanyAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    getInfo({ companyID, select, populates }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(companyID))
                    return resolve({
                        error: true,
                        message: 'Request params companyID invalid',
                        status: 400,
                    })

                // populates
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

                let infoAterGet = await AUTH__COMPANY_COLL.findById(companyID)
                    .select(select)
                    .populate(populates)
                if (!infoAterGet)
                    return resolve({
                        error: true,
                        message: "can't_get_info",
                        keyError: KEY_ERROR.GET_INFO_FAILED,
                        status: 200,
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
     * Name  : Danh sách company
     * Author: Depv
     * Code  : 20/12/2021
     */
    getList({
        userID,
        arrayID,
        show,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates = {},
    }) {
        // console.log({userID, arrayID,
        //     keyword, limit, lastestID, select, populates})
        return new Promise(async (resolve) => {
            try {
                if (limit > 20) {
                    limit = 20
                } else {
                    limit = +limit
                }

                let sortBy
                let conditionObj = {}
                let keys = ['createAt__-1', '_id__-1']

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

                if (show && show == 1) {
                    conditionObj.show = Number(show)
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    conditionObj.$or = [
                        { name: new RegExp(keyword, 'i') },
                        { sign: new RegExp(keyword, 'i') },
                        // { phone: new RegExp(keyword, 'i') },
                    ]
                }

                // Lấy user theo mảng id
                if (arrayID && arrayID.length) {
                    arrayID = JSON.parse(arrayID)
                    conditionObj._id = { $in: arrayID }
                    limit = arrayID.length
                }

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await AUTH__COMPANY_COLL.findById(lastestID)
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

                let infoDataAfterGet = await AUTH__COMPANY_COLL.find(
                    conditionObj
                )
                    .select(select)
                    .limit(limit + 1)
                    .sort(sortBy)
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
                        nextCursor = infoDataAfterGet[limit - 1]._id
                        infoDataAfterGet.length = limit
                    }
                }

                let totalRecord =
                    await AUTH__COMPANY_COLL.count(conditionObjOrg)
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
}

exports.MODEL = new Model()
