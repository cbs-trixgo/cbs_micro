/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const ITEM__CONTACT_MODEL = require('../model/item.contact-model').MODEL

module.exports = {
    /**
     * Code:  Depv
     * Name Thêm contact
     */
    insert: {
        auth: 'required',
        params: {
            parent: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
            name: { type: 'string' },
            description: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            address: { type: 'string', optional: true },
            area: { type: 'string', optional: true },
            taxid: { type: 'string', optional: true },
            birthday: { type: 'string', optional: true },
            province: { type: 'string', optional: true },
            gender: { type: 'string', optional: true },
            phone: { type: 'string', optional: true },
            email: { type: 'string', optional: true },
            department: { type: 'string', optional: true },
            position: { type: 'string', optional: true },
            linkUser: { type: 'string', optional: true },
            status: { type: 'string', optional: true },
            field: { type: 'string', optional: true },
            property: { type: 'string', optional: true },
            linkSale: { type: 'string', optional: true },
            workingStatus: { type: 'string', optional: true },
            realStatus: { type: 'string', optional: true },
            insuranceStatus: { type: 'string', optional: true },
            familyPolicy: { type: 'string', optional: true },
            contractType: { type: 'string', optional: true },
            contractSign: { type: 'string', optional: true },
            family: { type: 'string', optional: true },
            identity: { type: 'string', optional: true },
            dateProvice: { type: 'string', optional: true },
            place: { type: 'string', optional: true },
            area: { type: 'string', optional: true },
            area1: { type: 'string', optional: true },
            area2: { type: 'string', optional: true },
            insuranceSign: { type: 'string', optional: true },
            insuranceDate: { type: 'string', optional: true },
            sallaryFactor: { type: 'string', optional: true },
            sallarySubFactor: { type: 'string', optional: true },
            sallaryBasic: { type: 'string', optional: true },
            signerIn: { type: 'string', optional: true },
            signerOut: { type: 'string', optional: true },
            workStartDate: { type: 'string', optional: true },
            dayOff: { type: 'string', optional: true },
            appointDate: { type: 'string', optional: true },
            changeSallaryDate: { type: 'string', optional: true },
            contractDate: { type: 'string', optional: true },
            contractValid: { type: 'string', optional: true },
            contractExpire: { type: 'string', optional: true },
            nonResident: { type: 'string', optional: true },
            referrerID: { type: 'string', optional: true },
            saleID: { type: 'string', optional: true },
            fundaID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    parent,
                    type,
                    name,
                    description,
                    note,
                    sign,
                    address,
                    taxid,
                    birthday,
                    province,
                    gender,
                    phone,
                    email,
                    department,
                    position,
                    linkUser,
                    status,
                    field,
                    property,
                    linkSale,
                    workingStatus,
                    realStatus,
                    insuranceStatus,
                    familyPolicy,
                    contractType,
                    contractSign,
                    family,
                    identity,
                    dateProvice,
                    place,
                    area,
                    area1,
                    area2,
                    insuranceSign,
                    insuranceDate,
                    sallaryFactor,
                    sallarySubFactor,
                    sallaryBasic,
                    signerIn,
                    signerOut,
                    workStartDate,
                    dayOff,
                    appointDate,
                    changeSallaryDate,
                    contractDate,
                    contractValid,
                    contractExpire,
                    nonResident,
                    fundaID,
                    referrerID,
                    saleID,
                    bankAccount,
                    dataSource,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler = await ITEM__CONTACT_MODEL.insert({
                    authorID: userID,
                    parent,
                    type,
                    name,
                    description,
                    note,
                    sign,
                    address,
                    taxid,
                    birthday,
                    province,
                    gender,
                    phone,
                    email,
                    department,
                    position,
                    linkUser,
                    status,
                    field,
                    property,
                    linkSale,
                    workingStatus,
                    realStatus,
                    insuranceStatus,
                    familyPolicy,
                    contractType,
                    contractSign,
                    family,
                    identity,
                    dateProvice,
                    place,
                    area,
                    area1,
                    area2,
                    insuranceSign,
                    insuranceDate,
                    sallaryFactor,
                    sallarySubFactor,
                    sallaryBasic,
                    signerIn,
                    signerOut,
                    workStartDate,
                    dayOff,
                    appointDate,
                    changeSallaryDate,
                    contractDate,
                    contractValid,
                    contractExpire,
                    nonResident,
                    fundaID,
                    referrerID,
                    saleID,
                    bankAccount,
                    dataSource,
                    ctx,
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
     * Code:  Depv
     * Name Cập nhật contact
     */
    update: {
        auth: 'required',
        params: {
            contactID: { type: 'string' },
            parent: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            address: { type: 'string', optional: true },
            area: { type: 'string', optional: true },
            taxid: { type: 'string', optional: true },
            birthday: { type: 'string', optional: true },
            province: { type: 'string', optional: true },
            gender: { type: 'string', optional: true },
            phone: { type: 'string', optional: true },
            email: { type: 'string', optional: true },
            department: { type: 'string', optional: true },
            position: { type: 'string', optional: true },
            linkUser: { type: 'string', optional: true },
            status: { type: 'string', optional: true },
            field: { type: 'string', optional: true },
            property: { type: 'string', optional: true },
            linkSale: { type: 'string', optional: true },
            workingStatus: { type: 'string', optional: true },
            realStatus: { type: 'string', optional: true },
            insuranceStatus: { type: 'string', optional: true },
            familyPolicy: { type: 'string', optional: true },
            contractType: { type: 'string', optional: true },
            contractSign: { type: 'string', optional: true },
            family: { type: 'string', optional: true },
            identity: { type: 'string', optional: true },
            dateProvice: { type: 'string', optional: true },
            place: { type: 'string', optional: true },
            area: { type: 'string', optional: true },
            area1: { type: 'string', optional: true },
            area2: { type: 'string', optional: true },
            insuranceSign: { type: 'string', optional: true },
            insuranceDate: { type: 'string', optional: true },
            sallaryFactor: { type: 'string', optional: true },
            sallarySubFactor: { type: 'string', optional: true },
            sallaryBasic: { type: 'string', optional: true },
            signerIn: { type: 'string', optional: true },
            signerOut: { type: 'string', optional: true },
            workStartDate: { type: 'string', optional: true },
            dayOff: { type: 'string', optional: true },
            appointDate: { type: 'string', optional: true },
            changeSallaryDate: { type: 'string', optional: true },
            contractDate: { type: 'string', optional: true },
            contractValid: { type: 'string', optional: true },
            contractExpire: { type: 'string', optional: true },
            image: { type: 'string', optional: true },
            amountWorkHistory: { type: 'string', optional: true },
            amountProjectHistory: { type: 'string', optional: true },
            amountContractHistory: { type: 'string', optional: true },
            amountEducationHistory: { type: 'string', optional: true },
            amountCertificateHistory: { type: 'string', optional: true },
            documents: { type: 'string', optional: true },
            // nonResident              : { type: "string", optional: true },
            fundaID: { type: 'string', optional: true },
            purchasedValue: { type: 'string', optional: true },
            totalLoyaltyPoints: { type: 'string', optional: true },
            usedLoyaltyPoints: { type: 'string', optional: true },
            remainLoyaltyPoints: { type: 'string', optional: true },
            getVouchers: { type: 'array', optional: true },
            usedVouchers: { type: 'array', optional: true },
            saleID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    contactID,
                    authorID,
                    parent,
                    type,
                    name,
                    description,
                    note,
                    sign,
                    address,
                    taxid,
                    birthday,
                    gender,
                    phone,
                    email,
                    department,
                    position,
                    linkUser,
                    status,
                    field,
                    property,
                    saleID,
                    workingStatus,
                    realStatus,
                    insuranceStatus,
                    familyPolicy,
                    contractType,
                    contractSign,
                    family,
                    identity,
                    dateProvice,
                    place,
                    area,
                    area1,
                    area2,
                    insuranceSign,
                    insuranceDate,
                    sallaryFactor,
                    sallarySubFactor,
                    sallaryBasic,
                    signerIn,
                    signerOut,
                    workStartDate,
                    dayOff,
                    appointDate,
                    changeSallaryDate,
                    contractDate,
                    contractValid,
                    contractExpire,
                    nonResident,
                    fundaID,
                    bankAccount,
                    dataSource,
                    insuranceFee,
                    union,
                    share,
                    image,
                    amountWorkHistory,
                    amountProjectHistory,
                    amountContractHistory,
                    amountEducationHistory,
                    amountCertificateHistory,
                    documents,
                    documentsRemove,
                    purchasedValue,
                    totalLoyaltyPoints,
                    usedLoyaltyPoints,
                    remainLoyaltyPoints,
                    getVouchers,
                    usedVouchers,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                // console.log(ctx.params)

                let resultAfterCallHandler = await ITEM__CONTACT_MODEL.update({
                    contactID,
                    company: company._id,
                    authorID: userID,
                    parent,
                    type,
                    name,
                    description,
                    note,
                    sign,
                    address,
                    taxid,
                    birthday,
                    gender,
                    phone,
                    email,
                    department,
                    position,
                    linkUser,
                    status,
                    field,
                    property,
                    saleID,
                    workingStatus,
                    realStatus,
                    insuranceStatus,
                    familyPolicy,
                    contractType,
                    contractSign,
                    family,
                    identity,
                    dateProvice,
                    place,
                    area,
                    area1,
                    area2,
                    insuranceSign,
                    insuranceDate,
                    sallaryFactor,
                    sallarySubFactor,
                    sallaryBasic,
                    signerIn,
                    signerOut,
                    workStartDate,
                    dayOff,
                    appointDate,
                    changeSallaryDate,
                    contractDate,
                    contractValid,
                    contractExpire,
                    nonResident,
                    fundaID,
                    bankAccount,
                    dataSource,
                    insuranceFee,
                    union,
                    share,
                    image,
                    amountWorkHistory,
                    amountProjectHistory,
                    amountContractHistory,
                    amountEducationHistory,
                    amountCertificateHistory,
                    documents,
                    documentsRemove,
                    purchasedValue,
                    totalLoyaltyPoints,
                    usedLoyaltyPoints,
                    remainLoyaltyPoints,
                    getVouchers,
                    usedVouchers,
                    ctx,
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
     * Code:  Depv
     * Name Danh sách contact
     */
    getInfoAndGetList: {
        // auth: "required",
        params: {
            // Field bổ sung
            contactID: { type: 'string', optional: true },
            voucherID: { type: 'string', optional: true },
            linkUserID: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
            fundaID: { type: 'string', optional: true },
            gender: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            isBirthday: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },

            // Field mặc định
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    option,
                    companyID,
                    uplineID,
                    fundaID,
                    voucherID,
                    contactID,
                    type,
                    isBirthday,
                    parentID,
                    month,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    fromDate,
                    toDate,
                    linkUserID,
                } = ctx.params
                const { _id: userID, contacts, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler
                if (contactID || linkUserID) {
                    resultAfterCallHandler = await ITEM__CONTACT_MODEL.getInfo({
                        contactID,
                        linkUserID,
                        select,
                        populates,
                        ctx,
                    })
                } else {
                    resultAfterCallHandler = await ITEM__CONTACT_MODEL.getList({
                        option,
                        companyID,
                        userID,
                        uplineID,
                        contacts,
                        isBirthday,
                        fundaID,
                        voucherID,
                        parentID,
                        type,
                        fromDate,
                        toDate,
                        month,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        ctx,
                    })
                }

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
     * Name  : Tìm kiếm văn bản
     * Author: HiepNH
     * Code  : 29/8/2022
     */
    getListByFilter: {
        auth: 'required',
        params: {
            genders: { type: 'array', optional: true },
            departmentsID: { type: 'array', optional: true },
            companyID: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
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
                    receiverID,
                    types,
                    isExportExcel,
                    requestResponse,
                    fromDate,
                    toDate,
                    marked,
                    departmentsID,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    isParent,
                    type,
                    genders,
                } = ctx.params

                // console.log({parentID, companyID, receiverID, types, isExportExcel, requestResponse, fromDate, toDate, marked, departmentsID, keyword, limit, lastestID, select, populates, isParent, type, genders})

                if (!companyID) {
                    companyID = company._id
                }

                const resultAfterCallHandler =
                    await ITEM__CONTACT_MODEL.getListByFilter({
                        userID,
                        parentID,
                        companyID,
                        receiverID,
                        types,
                        isExportExcel,
                        requestResponse,
                        fromDate,
                        toDate,
                        marked,
                        departmentsID,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        isParent,
                        type,
                        genders,
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
     * Name: Danh sách theo phân loại
     * Author: HiepNH
     * Code: 24/12/2022
     */
    getListByProperty: {
        auth: 'required',
        params: {
            fundasID: { type: 'array', optional: true },
            option: { type: 'string', optional: true },
            optionGroup: { type: 'string', optional: true },
            optionTime: { type: 'string', optional: true },
            year: { type: 'string', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },

            //_____________THÔNG SỐ MẶC ĐỊNH________________
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, contacts, company } = ctx.meta.infoUser
                let {
                    option,
                    optionGroup,
                    optionTime,
                    fundasID,
                    uplineID,
                    year,
                    fromDate,
                    toDate,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    sortKey,
                } = ctx.params

                let resultAfterCallHandler =
                    await ITEM__CONTACT_MODEL.getListByProperty({
                        companyID: company._id,
                        option,
                        optionGroup,
                        optionTime,
                        fundasID,
                        uplineID,
                        year,
                        fromDate,
                        toDate,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        sortKey,
                        userID,
                        contacts,
                        ctx,
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
     * Code:  Depv
     * Name Danh sách danh bạ của hệ thống
     */
    getListOfSystem: {
        auth: 'required',
        params: {
            // Field mặc định
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { keyword, limit, lastestID, select, populates } =
                    ctx.params
                let resultAfterCallHandler =
                    await ITEM__CONTACT_MODEL.getListOfSystem({
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        ctx,
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
     * Name  : Danh bạ (bên mua, bên bán) mà user được quyền truy cập theo hợp đồng
     * Author: HiepNH
     * Code  : 7/9/2022
     */
    getListAccessByContract: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },

            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { option, keyword, limit, lastestID, select, populates } =
                    ctx.params

                const resultAfterCallHandler =
                    await ITEM__CONTACT_MODEL.getListAccessByContract({
                        option,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
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
     * Code:  HiepNH
     * Name Download Template Excel
     * Date: 8/12/2022
     */
    downloadTemplateImportExcel: {
        auth: 'required',
        params: {},
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await ITEM__CONTACT_MODEL.downloadTemplateImportExcel({
                        companyID: company._id,
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
     * Code:  HiepNH
     * Name Download Template Excel
     * Date: 9/12/2022
     */
    importFromExcel: {
        auth: 'required',
        params: {
            // option    : { type: 'string', optional: true },
            dataImport: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { dataImport, option } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser
                // console.log(option)

                const resultAfterCallHandler =
                    await ITEM__CONTACT_MODEL.importFromExcel({
                        companyID: company._id,
                        userID,
                        dataImport,
                        option,
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
     * Code:  MinhVH
     * Name Download Excel Contact
     * Date: 21/06/2022
     */
    exportExcel: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                let { companyID, filterParams } = ctx.params

                if (!companyID) {
                    companyID = company._id
                }

                const resultAfterCallHandler =
                    await ITEM__CONTACT_MODEL.exportExcel({
                        userID,
                        companyID,
                        filterParams,
                        ctx,
                        queue: this.metadata.queue,
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
     * Name Download Excel Contact by pagination
     * Date: 13/12/2023
     */
    exportExcelByFilter: {
        auth: 'required',
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser

                let { companyID, filterParams } = ctx.params

                if (!companyID) {
                    companyID = company._id
                }

                const resultAfterCallHandler =
                    await ITEM__CONTACT_MODEL.exportExcelByFilter({
                        userID,
                        companyID,
                        filterParams,
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
}
