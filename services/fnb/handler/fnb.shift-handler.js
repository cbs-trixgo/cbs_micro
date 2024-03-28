/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const FNB_SHIFT_MODEL = require('../model/fnb.shift-model').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: insert Group
     */
    insert: {
        auth: 'required',
        params: {
            fundaID: { type: 'string' },
            name: { type: 'string' },
            note: { type: 'string', optional: true },
            campaign: { type: 'number', optional: true },
            seasons: { type: 'number', optional: true },
            shiftType: { type: 'number', optional: true },
            paidStatus: { type: 'number', optional: true },
            staffsID: { type: 'array', optional: true },
            subStaffsID: { type: 'array', optional: true },
            workingHours: { type: 'string', optional: true },
            subWorkingHours: { type: 'string', optional: true },
            openingCash: { type: 'string', optional: true }, // Cần convert lại ở FE *******
            incurredCash: { type: 'string', optional: true }, // Cần convert lại ở FE *******
            closingCash: { type: 'string', optional: true }, // Cần convert lại ở FE *******
            numberOfOpeningSizeM: { type: 'string', optional: true }, // Cần convert lại ở FE *******
            numberOfOpeningSizeL: { type: 'string', optional: true }, // Cần convert lại ở FE *******
            numberOfEotSizeM: { type: 'string', optional: true }, // Cần convert lại ở FE *******
            numberOfEotSizeL: { type: 'string', optional: true }, // Cần convert lại ở FE *******
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    fundaID,
                    name,
                    note,
                    campaign,
                    seasons,
                    shiftType,
                    paidStatus,
                    workingHours,
                    staffsID,
                    subWorkingHours,
                    subStaffsID,
                    openingCash,
                    incurredCash,
                    closingCash,
                    numberOfOpeningSizeM,
                    numberOfOpeningSizeL,
                    numberOfEotSizeM,
                    numberOfEotSizeL,
                } = ctx.params
                //  console.log({ undaID, name, note, campaign, seasons, shiftType, paidStatus, workingHours, staffsID, subWorkingHours, subStaffsID, openingCash, incurredCash, closingCash, numberOfOpeningSizeM, numberOfOpeningSizeL, numberOfEotSizeM, numberOfEotSizeL  })

                const {
                    _id: userID,
                    company,
                    email,
                    fullname,
                } = ctx.meta.infoUser

                let resultAfterCallHandler = await FNB_SHIFT_MODEL.insert({
                    fundaID,
                    email,
                    fullname,
                    name,
                    note,
                    campaign,
                    seasons,
                    shiftType,
                    paidStatus,
                    workingHours,
                    staffsID,
                    subWorkingHours,
                    subStaffsID,
                    openingCash,
                    incurredCash,
                    closingCash,
                    numberOfOpeningSizeM,
                    numberOfOpeningSizeL,
                    numberOfEotSizeM,
                    numberOfEotSizeL,
                    userID,
                    companyID: company._id,
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
     * Func: update Group
     */
    update: {
        auth: 'required',
        params: {
            shiftID: { type: 'string' },
            name: { type: 'string' },
            note: { type: 'string', optional: true },
            campaign: { type: 'number', optional: true },
            seasons: { type: 'number', optional: true },
            shiftType: { type: 'number', optional: true },
            paidStatus: { type: 'number', optional: true },
            staffsID: { type: 'array', optional: true },
            subStaffsID: { type: 'array', optional: true },
            workingHours: { type: 'number', optional: true },
            subWorkingHours: { type: 'number', optional: true },
            openingCash: { type: 'number', optional: true }, // Cần convert lại ở FE *******
            incurredCash: { type: 'number', optional: true }, // Cần convert lại ở FE *******
            closingCash: { type: 'number', optional: true }, // Cần convert lại ở FE *******
            numberOfOpeningSizeM: { type: 'number', optional: true }, // Cần convert lại ở FE *******
            numberOfOpeningSizeL: { type: 'number', optional: true }, // Cần convert lại ở FE *******
            numberOfEotSizeM: { type: 'number', optional: true }, // Cần convert lại ở FE *******
            numberOfEotSizeL: { type: 'number', optional: true }, // Cần convert lại ở FE *******
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    shiftID,
                    name,
                    campaign,
                    note,
                    seasons,
                    shiftType,
                    paidStatus,
                    workingHours,
                    staffsID,
                    subWorkingHours,
                    subStaffsID,
                    openingCash,
                    incurredCash,
                    closingCash,
                    numberOfOpeningSizeM,
                    numberOfOpeningSizeL,
                    numberOfEotSizeM,
                    numberOfEotSizeL,
                } = ctx.params

                const {
                    _id: userID,
                    company,
                    email,
                    fullname,
                } = ctx.meta.infoUser

                let resultAfterCallHandler = await FNB_SHIFT_MODEL.update({
                    email,
                    fullname,
                    shiftID,
                    name,
                    note,
                    campaign,
                    seasons,
                    shiftType,
                    paidStatus,
                    workingHours,
                    staffsID,
                    subWorkingHours,
                    subStaffsID,
                    openingCash,
                    incurredCash,
                    closingCash,
                    numberOfOpeningSizeM,
                    numberOfOpeningSizeL,
                    numberOfEotSizeM,
                    numberOfEotSizeL,
                    userID,
                    companyID: company._id,
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
     * Func: update Group
     */
    updateSalary: {
        auth: 'required',
        params: {
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
            month: { type: 'number', optional: true },
            year: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { fromDate, toDate, month, year } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler = await FNB_SHIFT_MODEL.updateSalary(
                    {
                        companyID: company._id,
                        fromDate,
                        toDate,
                        month,
                        year,
                        userID,
                    }
                )

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
     * Func: remove Group
     */
    remove: {
        auth: 'required',
        params: {
            shiftID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { shiftID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await FNB_SHIFT_MODEL.remove({
                    shiftID,
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
     * Func: getList and getInfo pcm_plan_report
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            shiftID: { type: 'string', optional: true },
            fundaID: { type: 'string', optional: true },
            staffID: { type: 'string', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },

            //==============================================
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    shiftID,
                    fundaID,
                    staffID,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    fromDate,
                    toDate,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (shiftID) {
                    resultAfterCallHandler = await FNB_SHIFT_MODEL.getInfo({
                        shiftID,
                        select,
                        populates,
                    })
                } else {
                    resultAfterCallHandler = await FNB_SHIFT_MODEL.getList({
                        companyID: company._id,
                        fundaID,
                        staffID,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        fromDate,
                        toDate,
                        userID,
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
     * Name: Danh sách theo phân loại
     * Author: HiepNH
     * Code: 14/10/2022
     */
    getListByProperty: {
        params: {
            fundasID: { type: 'array', optional: true },
            option: { type: 'string', optional: true },
            optionGroup: { type: 'string', optional: true },
            optionStatus: { type: 'string', optional: true },
            optionTime: { type: 'string', optional: true },
            year: { type: 'string', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                let {
                    option,
                    optionGroup,
                    optionStatus,
                    optionTime,
                    fundasID,
                    year,
                    fromDate,
                    toDate,
                } = ctx.params

                let resultAfterCallHandler =
                    await FNB_SHIFT_MODEL.getListByProperty({
                        companyID: company._id,
                        fundasID,
                        option,
                        optionGroup,
                        optionStatus,
                        optionTime,
                        year,
                        fromDate,
                        toDate,
                        userID,
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
        params: {},
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                const resultAfterCallHandler =
                    await FNB_SHIFT_MODEL.downloadTemplateExcel({
                        companyID: company._id,
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
            dataImport: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { dataImport } = ctx.params
                const { _id: userID } = ctx.meta.infoUser
                // console.log(dataImport)

                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log('====================HERE===================')
                // console.log(dataImport)

                const resultAfterCallHandler =
                    await FNB_SHIFT_MODEL.importFromExcel({
                        taskID,
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
     * Dev: HiepNH
     * Func: Tải Bảng chấm công
     * Date: 9/12/2022
     */
    exportExcel: {
        auth: 'required',
        params: {
            companyID: { type: 'string', optional: true },
            fundaID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, email, company } = ctx.meta.infoUser
                let { companyID, fundaID, fromDate, toDate, month, year } =
                    ctx.params

                if (!companyID) {
                    companyID = company._id
                }

                const resultAfterCallHandler =
                    await FNB_SHIFT_MODEL.exportExcel({
                        userID,
                        email,
                        companyID,
                        fundaID,
                        fromDate,
                        toDate,
                        month,
                        year,
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
     * Func: Tải Báo cáo doanh số
     * Date: 9/12/2022
     */
    exportExcel2: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            fundaID: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company, email } = ctx.meta.infoUser
                let {
                    option,
                    companyID,
                    fundaID,
                    fromDate,
                    toDate,
                    month,
                    year,
                } = ctx.params

                if (!companyID) {
                    companyID = company._id
                }

                const resultAfterCallHandler =
                    await FNB_SHIFT_MODEL.exportExcel2({
                        userID,
                        email,
                        companyID,
                        fundaID,
                        option,
                        fromDate,
                        toDate,
                        month,
                        year,
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
}
