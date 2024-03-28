/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const DATAHUB_PACKAGE_MODEL =
    require('../model/datahub.datahub_package-model').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: Thêm datahub package
     */
    insert: {
        auth: 'required',
        params: {
            contractor: { type: 'string' },
            project: { type: 'string' },
            field: { type: 'string' },
            name: { type: 'string' },
            sign: { type: 'string' },
            note: { type: 'string', optional: true },
            value: { type: 'number' },
            vatValue: { type: 'number' },
            date: { type: 'string', optional: true },
            startTime: { type: 'string', optional: true },
            endTime: { type: 'string', optional: true },
            status: { type: 'number', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    contractor,
                    project,
                    field,
                    name,
                    sign,
                    note,
                    value,
                    vatValue,
                    date,
                    startTime,
                    endTime,
                    status,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await DATAHUB_PACKAGE_MODEL.insert(
                    {
                        contractor,
                        project,
                        field,
                        name,
                        sign,
                        note,
                        value,
                        vatValue,
                        date,
                        startTime,
                        endTime,
                        status,
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
     * Func: Sửa datahub package
     */
    update: {
        auth: 'required',
        params: {
            datahubPackageID: { type: 'string' },
            project: { type: 'string', optional: true },
            field: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
            value: { type: 'number', optional: true },
            vatValue: { type: 'number', optional: true },
            date: { type: 'string', optional: true },
            startTime: { type: 'string', optional: true },
            endTime: { type: 'string', optional: true },
            status: { type: 'number', optional: true },
            files: { type: 'array', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    datahubPackageID,
                    project,
                    field,
                    name,
                    sign,
                    note,
                    value,
                    vatValue,
                    date,
                    startTime,
                    endTime,
                    status,
                    files,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await DATAHUB_PACKAGE_MODEL.update(
                    {
                        datahubPackageID,
                        project,
                        field,
                        name,
                        sign,
                        note,
                        value,
                        vatValue,
                        date,
                        startTime,
                        endTime,
                        status,
                        files,
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
     * Func: Xóa datahub package
     */
    remove: {
        auth: 'required',
        params: {
            datahubPackageID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { datahubPackageID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await DATAHUB_PACKAGE_MODEL.remove(
                    {
                        datahubPackageID,
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
     * Func: get info and get list datahub package
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            datahubPackageID: { type: 'string', optional: true },
            contractorID: { type: 'string', optional: true },
            fieldID: { type: 'string', optional: true },

            // Field mặc định
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
                    contractorID,
                    fieldID,
                    datahubPackageID,
                    lastestID,
                    keyword,
                    limit,
                    select,
                    populates,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (datahubPackageID) {
                    resultAfterCallHandler =
                        await DATAHUB_PACKAGE_MODEL.getInfo({
                            datahubPackageID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await DATAHUB_PACKAGE_MODEL.getList({
                            contractorID,
                            fieldID,
                            userID,
                            lastestID,
                            keyword,
                            limit,
                            select,
                            populates,
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
     * Dev: HiepNH
     * Func: Gom nhóm theo tính chất
     * Date: 17/9/2022
     */
    getListByProperty: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
            contractorID: { type: 'string', optional: true },
            fieldID: { type: 'string', optional: true },
            areaID: { type: 'string', optional: true },
            level: { type: 'string', optional: true },
            buildingType: { type: 'string', optional: true },
            buildingGrade: { type: 'string', optional: true },
            basementNumber: { type: 'string', optional: true },
            basementArea: { type: 'string', optional: true },
            floorNumber: { type: 'string', optional: true },
            floorArea: { type: 'string', optional: true },
            status: { type: 'string', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
            quality: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                // console.log('========================12322222222222222')
                await this.validateEntity(ctx.params)
                let {
                    option,
                    fieldID,
                    contractorID,
                    areaID,
                    level,
                    buildingType,
                    buildingGrade,
                    basementNumber,
                    basementArea,
                    floorNumber,
                    floorArea,
                    status,
                    fromDate,
                    toDate,
                    quality,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await DATAHUB_PACKAGE_MODEL.getListByProperty({
                        option,
                        fieldID,
                        contractorID,
                        areaID,
                        level,
                        buildingType,
                        buildingGrade,
                        basementNumber,
                        basementArea,
                        floorNumber,
                        floorArea,
                        status,
                        fromDate,
                        toDate,
                        quality,
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
}
