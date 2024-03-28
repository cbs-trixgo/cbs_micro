/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const DATAHUB_CONTACT_MODEL =
    require('../model/datahub.datahub_contact-model').MODEL

module.exports = {
    /**
     * Name: Insert
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    insert: {
        auth: 'required',
        params: {
            name: { type: 'string' },
            taxid: { type: 'string' },
            address: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { name, sign, address, taxid, note } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await DATAHUB_CONTACT_MODEL.insert(
                    {
                        name,
                        sign,
                        address,
                        taxid,
                        note,
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
     * Name: Update
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    update: {
        auth: 'required',
        params: {
            datahubContactID: { type: 'string' },
            name: { type: 'string' },
            taxid: { type: 'string' },
            address: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            note: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { datahubContactID, name, sign, address, taxid, note } =
                    ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await DATAHUB_CONTACT_MODEL.update(
                    {
                        datahubContactID,
                        name,
                        sign,
                        address,
                        taxid,
                        note,
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
     * Name: Remove
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    remove: {
        auth: 'required',
        params: {
            datahubContactID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { datahubContactID } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler = await DATAHUB_CONTACT_MODEL.remove(
                    {
                        datahubContactID,
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
     * Name: Get info and Get list
     * Author: Hiepnh
     * Date: 9/4/2022
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            datahubContactID: { type: 'string', optional: true },

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
                    datahubContactID,
                    lastestID,
                    keyword,
                    limit,
                    select,
                    populates,
                } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler
                if (datahubContactID) {
                    resultAfterCallHandler =
                        await DATAHUB_CONTACT_MODEL.getInfo({
                            datahubContactID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await DATAHUB_CONTACT_MODEL.getList({
                            userID,
                            lastestID,
                            keyword,
                            limit: +limit,
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
}
