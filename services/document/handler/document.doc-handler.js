/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const DOCUMENT__DOC_MODEL = require('../model/document.doc-model').MODEL

/**
 * CALL OTHER SERVICE
 */
const { APP_ID } = require('../../../tools/keys/index')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const {
    CF_ACTIONS_ANALYSIS,
} = require('../../analysis/helper/analysis.actions-constant')

module.exports = {
    /**
     * Dev: MinhVH
     * Func: Thêm file đính kèm trong hồ sơ
     * Date: 13/11/2021
     */
    addFileAttachment: {
        auth: 'required',
        params: {
            documentID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { documentID, filesID } = ctx.params

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.addFileAttachment({
                        authorID,
                        documentID,
                        filesID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Tạo mới văn bản
     * Date: 26/10/2021
     */
    insertDocument: {
        auth: 'required',
        params: {
            parentID: { type: 'string', optional: true },
            name: { type: 'string' },
            sign: { type: 'string', optional: true },
            storeSign: { type: 'string', optional: true },
            type: { type: 'number', optional: true },
            description: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            approver: { type: 'string', optional: true },
            date: { type: 'string' },
            receivedDate: { type: 'string', optional: true },
            style: { type: 'string', optional: true },
            status: { type: 'string', optional: true },
            amount: { type: 'number', optional: true },
            amountDelivery: { type: 'number', optional: true },
            // requestResponse     : { type: "number", optional: true },
            expiredResponse: { type: 'string', optional: true },
            direction: { type: 'number' },
            packageID: { type: 'string' },
            senderID: { type: 'string', optional: true },
            receiverID: { type: 'string', optional: true },
            fieldID: { type: 'string', optional: true },
            datahubContactID: { type: 'string', optional: true },
            propertyID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            otherID: { type: 'string', optional: true },
            storageID: { type: 'string', optional: true },
            departmentID: { type: 'string' },
            value: { type: 'number', optional: true },
            completeStatus: { type: 'number', optional: true },
            publishID: { type: 'string', optional: true },
            deadline: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const {
                    parentID,
                    name,
                    sign,
                    storeSign,
                    description,
                    approver,
                    date,
                    receivedDate,
                    type,
                    style,
                    status,
                    amount,
                    amountDelivery,
                    requestResponse,
                    expiredResponse,
                    direction,
                    packageID,
                    senderID,
                    receiverID,
                    fieldID,
                    propertyID,
                    otherID,
                    storageID,
                    note,
                    departmentID,
                    value,
                    completeStatus,
                    contractID,
                    datahubContactID,
                    publishID,
                    deadline,
                } = ctx.params

                const resultAfterCallHandler = await DOCUMENT__DOC_MODEL.insert(
                    {
                        parentID,
                        name,
                        sign,
                        storeSign,
                        description,
                        approver,
                        date,
                        receivedDate,
                        type,
                        style,
                        status,
                        amount,
                        amountDelivery,
                        requestResponse,
                        expiredResponse,
                        direction,
                        packageID,
                        senderID,
                        receiverID,
                        fieldID,
                        propertyID,
                        otherID,
                        storageID,
                        note,
                        departmentID,
                        userID,
                        value,
                        completeStatus,
                        contractID,
                        datahubContactID,
                        publishID,
                        deadline,
                        ctx,
                    }
                )

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Cập nhật văn bản
     * Date: 28/10/2021
     */
    updateDocument: {
        auth: 'required',
        params: {
            documentID: { type: 'string' },
            name: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            storeSign: { type: 'string', optional: true },
            type: { type: 'number', optional: true },
            description: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            approver: { type: 'string', optional: true },
            date: { type: 'string' },
            receivedDate: { type: 'string', optional: true },
            style: { type: 'string', optional: true },
            status: { type: 'string', optional: true },
            amount: { type: 'number', optional: true },
            amountDelivery: { type: 'number', optional: true },
            requestResponse: { type: 'number', optional: true },
            expiredResponse: { type: 'string', optional: true },
            direction: { type: 'number', optional: true },
            packageID: { type: 'string', optional: true },
            senderID: { type: 'string', optional: true },
            receiverID: { type: 'string', optional: true },
            fieldID: { type: 'string', optional: true },
            propertyID: { type: 'string', optional: true },
            otherID: { type: 'string', optional: true },
            storageID: { type: 'string', optional: true },
            value: { type: 'number', optional: true },
            completeStatus: { type: 'number', optional: true },
            // contractID          : { type: "string", optional: true },
            datahubContactID: { type: 'string', optional: true },
            publishID: { type: 'string', optional: true },
            deadline: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userUpdate } = ctx.meta.infoUser
                const {
                    documentID,
                    name,
                    sign,
                    storeSign,
                    description,
                    approver,
                    date,
                    receivedDate,
                    type,
                    style,
                    status,
                    amount,
                    amountDelivery,
                    requestResponse,
                    expiredResponse,
                    direction,
                    packageID,
                    senderID,
                    receiverID,
                    fieldID,
                    propertyID,
                    otherID,
                    storageID,
                    note,
                    value,
                    completeStatus,
                    contractID,
                    datahubContactID,
                    publishID,
                    deadline,
                } = ctx.params

                const resultAfterCallHandler = await DOCUMENT__DOC_MODEL.update(
                    {
                        documentID,
                        name,
                        sign,
                        storeSign,
                        description,
                        approver,
                        date,
                        receivedDate,
                        type,
                        style,
                        status,
                        amount,
                        amountDelivery,
                        requestResponse,
                        expiredResponse,
                        direction,
                        packageID,
                        senderID,
                        receiverID,
                        fieldID,
                        propertyID,
                        otherID,
                        storageID,
                        note,
                        userID: userUpdate,
                        value,
                        completeStatus,
                        contractID,
                        datahubContactID,
                        publishID,
                        deadline,
                        ctx,
                    }
                )

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Xóa văn bản
     * Date: 30/10/2021
     */
    deleteDocument: {
        auth: 'required',
        params: {
            documentID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { documentID } = ctx.params

                const resultAfterCallHandler = await DOCUMENT__DOC_MODEL.remove(
                    {
                        userID,
                        documentID,
                    }
                )

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Chi tiết hồ sơ văn bản
     * Date: 12/11/2021
     */
    getInfoDocumment: {
        auth: 'required',
        params: {
            documentID: { type: 'string' },
            populates: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { documentID, select, populates } = ctx.params

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.getInfo({
                        userID,
                        documentID,
                        select,
                        populates,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Danh sách hồ sơ văn bản
     * Date: 27/10/2021
     */
    getListDocument: {
        auth: 'required',
        params: {
            datahubContactID: { type: 'string', optional: true }, // Chủ thể ban hành
            // publishID       : { type: "string", optional: true }, // Chủ thể ban hành
            senderID: { type: 'string', optional: true }, // Người ban hành
            type: { type: 'string', optional: true }, // Tính chất hồ sơ (hệ thống quy định)
            propertyID: { type: 'string', optional: true }, // Phân loại hồ sơ (người dùng quy định)
            departmentID: { type: 'string', optional: true }, // Dự án
            direction: { type: 'string', optional: true }, // Hướng hồ sơ
            contractID: { type: 'string', optional: true }, // Thuộc hợp đồng
            packageID: { type: 'string', optional: true }, // Gói thầu

            receivedDate: { type: 'string', optional: true }, // Ngày nhận văn bản
            requestResponse: { type: 'string', optional: true }, // Yêu cầu phản hồi
            parentID: { type: 'string', optional: true }, // Phần tử cha
            companyID: { type: 'string', optional: true }, // Thuộc công ty
            marked: { type: 'string', optional: true }, // Được đánh dấu
            keyword: { type: 'string', optional: true }, // Keyword
            isParent: { type: 'string', optional: true },

            lastestID: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                // // Call traffic
                // await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, {
                //     appID: `${APP_ID.DOCUMENT.id}`, menuID: `${APP_ID.DOCUMENT.menuDocumentApp.dashboard.id}`, type: 1
                // })

                await this.validateEntity(ctx.params)

                const { _id: userID, company } = ctx.meta.infoUser
                let {
                    parentID,
                    companyID,
                    packageID,
                    departmentID,
                    direction,
                    senderID,
                    receiverID,
                    propertyID,
                    receivedDate,
                    datahubContactID,
                    type,
                    contractID,
                    storageID,
                    requestResponse,
                    fieldID,
                    fromDate,
                    toDate,
                    marked,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    isParent,
                } = ctx.params
                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.getList({
                        parentID,
                        companyID,
                        packageID,
                        departmentID,
                        direction,
                        senderID,
                        receiverID,
                        propertyID,
                        receivedDate,
                        type,
                        contractID,
                        storageID,
                        requestResponse,
                        fieldID,
                        fromDate,
                        toDate,
                        marked,
                        publishID: datahubContactID,
                        userID,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        isParent,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Name  : Tìm kiếm văn bản
     * Author: HiepNH
     * Code  : 29/8/2022
     */
    getListByFilter: {
        auth: 'required',
        params: {
            datahubContactsID: { type: 'array', optional: true }, // Chủ thể ban hành
            sendersID: { type: 'array', optional: true }, // Người ban hành
            types: { type: 'array', optional: true }, // Tính chất hồ sơ (hệ thống quy định)
            propertysID: { type: 'array', optional: true }, // Phân loại hồ sơ (người dùng quy định)
            fieldsID: { type: 'array', optional: true }, // Phân loại khác
            departmentsID: { type: 'array', optional: true }, // Dự án
            directions: { type: 'array', optional: true }, // Hướng hồ sơ
            contractsID: { type: 'array', optional: true }, // Thuộc hợp đồng
            packagesID: { type: 'array', optional: true }, // Gói thầu
            storagesID: { type: 'array', optional: true }, // Địa chỉ lưu trữ

            receivedDate: { type: 'string', optional: true }, // Ngày nhận văn bản
            requestResponse: { type: 'string', optional: true }, // Yêu cầu phản hồi
            parentID: { type: 'string', optional: true }, // Phần tử cha
            companyID: { type: 'string', optional: true }, // Thuộc công ty
            marked: { type: 'string', optional: true }, // Được đánh dấu
            keyword: { type: 'string', optional: true }, // Keyword
            isParent: { type: 'string', optional: true },

            lastestID: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser

                let {
                    parentID,
                    companyID,
                    packagesID,
                    departmentsID,
                    directions,
                    sendersID,
                    receiverID,
                    propertysID,
                    datahubContactsID,
                    types,
                    contractsID,
                    storagesID,
                    requestResponse,
                    fieldsID,
                    fromDate,
                    toDate,
                    marked,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    isParent,
                } = ctx.params

                // console.log(ctx.params)

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.getListByFilter({
                        parentID,
                        companyID,
                        packagesID,
                        departmentsID,
                        directions,
                        sendersID,
                        receiverID,
                        propertysID,
                        types,
                        contractsID,
                        storagesID,
                        requestResponse,
                        fieldsID,
                        fromDate,
                        toDate,
                        marked,
                        publishsID: datahubContactsID,
                        userID,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        isParent,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Danh sách nhóm phân loại hồ sơ
     * Date: 27/10/2021
     */
    getListGroupDoctype: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            departmentID: { type: 'string', optional: true },
            packageID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { companyID, departmentID, packageID } = ctx.params

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.statisticalByType({
                        userID,
                        companyID,
                        departmentID,
                        packageID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Danh sách lưu trữ hồ sơ văn bản
     * Date: 30/10/2021
     */
    getListStorage: {
        auth: 'required',
        params: {
            companyID: { type: 'string' },
            lastestID: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
            limit: { type: 'number', optional: true },
            select: { type: 'string', optional: true },
            filter: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { companyID, lastestID, keyword, limit, select, filter } =
                    ctx.params

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.getListStorage({
                        userID,
                        companyID,
                        lastestID,
                        keyword,
                        limit,
                        select,
                        filter,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Đánh dấu hồ sơ
     * Date: 30/12/2021
     */
    updateMarkDocument: {
        auth: 'required',
        params: {
            documentID: { type: 'string' },
            isMark: { type: 'boolean' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { documentID, isMark } = ctx.params

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.updateMarkDocument({
                        userID,
                        documentID,
                        isMark,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Chia sẻ văn bản
     * Date: 05/11/2021
     */
    updateShareDocument: {
        auth: 'required',
        params: {
            documentID: { type: 'string' },
            isShare: { type: 'boolean' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { documentID, usersID, isShare } = ctx.params

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.updateShareDocument({
                        authorID,
                        documentID,
                        usersID,
                        isShare,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Cập nhật quyền người được chia sẻ văn bản
     * Date: 05/11/2021
     */
    updatePermissionShare: {
        auth: 'required',
        params: {
            documentID: { type: 'string' },
            userID: { type: 'string' },
            permission: { type: 'number' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { documentID, userID, permission } = ctx.params

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.updatePermissionShare({
                        authorID,
                        documentID,
                        userID,
                        permission,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Danh sách user được truy cập hồ sơ
     * Date: 10/11/2021
     */
    getListUserShared: {
        auth: 'required',
        params: {
            documentID: { type: 'string' },
            lastestID: { type: 'string', optional: true },
            limit: { type: 'number', optional: true },
            select: { type: 'string', optional: true },
            filter: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { documentID, lastestID, limit, select, filter } =
                    ctx.params

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.getListUserShared({
                        userID,
                        documentID,
                        lastestID,
                        limit,
                        select,
                        filter,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Thống kê theo type
     * Date: 13/11/2021
     */
    statisticalByType: {
        auth: 'required',
        params: {
            departmentID: { type: 'string', optional: true },
            packageID: { type: 'string', optional: true },
            isDatahubContact: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                const { departmentID, packageID, isDatahubContact } = ctx.params
                let resultAfterCallHandler
                if (isDatahubContact == 1) {
                    resultAfterCallHandler =
                        await DOCUMENT__DOC_MODEL.statisticalByDatahubContact({
                            userID,
                            companyID: company._id,
                            departmentID,
                            packageID,
                            isDatahubContact,
                        })
                } else {
                    resultAfterCallHandler =
                        await DOCUMENT__DOC_MODEL.statisticalByType({
                            userID,
                            companyID: company._id,
                            departmentID,
                            packageID,
                        })
                }
                // console.log(resultAfterCallHandler.data.listRecords)
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Lấy số lượng công việc của tất cả project mà user là members
     * Date: 13/11/2021
     */
    getAmountDocumentByProjects: {
        auth: 'required',
        params: {
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                const { fromDate, toDate } = ctx.params

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.getAmountDocumentByProjects({
                        userID,
                        fromDate,
                        toDate,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    ctx,
                    error_message: error.message,
                })
            }
        },
    },

    /**
     * Name: Báo cáo linh hoạt
     * Author: HiepNH
     * Date: 29/10/2022
     */
    getDynamicReport: {
        auth: 'required',
        params: {
            reportType: { type: 'string', optional: true },
            option: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            status: { type: 'array', optional: true },
            subtypes: { type: 'array', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
            upcoming: { type: 'string', optional: true },
            upcoming: { type: 'string', optional: true },
            isMilestone: { type: 'string', optional: true },
            year: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser

                let {
                    reportType,
                    option,
                    companyID,
                    projectID,
                    status,
                    fromDate,
                    toDate,
                    subtypes,
                    upcoming,
                    isMilestone,
                    year,
                } = ctx.params

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.getDynamicReport({
                        companyID,
                        userID,
                        reportType,
                        option,
                        projectID,
                        status,
                        fromDate,
                        toDate,
                        subtypes,
                        upcoming,
                        isMilestone,
                        year,
                    })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 8/12/2022
     */
    downloadTemplateExcel: {
        auth: 'required',
        params: {
            // projectID : { type: 'string', optional: true }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                // const { projectID } = ctx.params;
                const { projectID } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                // console.log({projectID})
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.downloadTemplateExcel({
                        projectID,
                        userID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 9/12/2022
     */
    importFromExcel: {
        auth: 'required',
        params: {
            projectID: { type: 'string', optional: true },
            documentID: { type: 'string', optional: true },
            dataImport: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { projectID, documentID, dataImport } = ctx.params
                const { _id: userID } = ctx.meta.infoUser
                // console.log(dataImport)

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')

                // console.log({projectID, documentID})
                // console.log(dataImport)

                const resultAfterCallHandler =
                    await DOCUMENT__DOC_MODEL.importFromExcel({
                        projectID,
                        documentID,
                        dataImport,
                        userID,
                        ctx,
                    })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Download Excel Document
     * Date: 27/06/2022
     */
    exportDocument: {
        auth: 'required',
        params: {
            // filterParams : { type: "string", optional: true }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { filterParams } = ctx.params

                // console.log(filterParams)

                if (!filterParams.option) {
                    const resultAfterCallHandler =
                        await DOCUMENT__DOC_MODEL.exportDocumentOfPackage({
                            userID,
                            filterParams,
                            ctx,
                        })

                    return renderStatusCodeAndResponse({
                        resultAfterCallHandler,
                        ctx,
                    })
                } else {
                    const resultAfterCallHandler =
                        await DOCUMENT__DOC_MODEL.exportDocumentOfPackage({
                            userID,
                            filterParams,
                            ctx,
                        })

                    return renderStatusCodeAndResponse({
                        resultAfterCallHandler,
                        ctx,
                    })
                }
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },
}
