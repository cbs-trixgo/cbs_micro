/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const MEDIA__COMMENT_MODEL = require('../model/media.comment-model').MODEL

module.exports = {
    /**
     * ============================ ****************** ===============================
     * ============================    COMMENT MEDIA   ===============================
     * ============================ ****************** ===============================
     */

    /**
     * Dev: MinhVH
     * Func: Create comment media
     */
    insert: {
        auth: 'required',
        params: {
            mediaID: { type: 'string' },
            parentID: { type: 'string', optional: true },
            content: { type: 'string', optional: true },
            files: { type: 'array', optional: true },
            images: { type: 'array', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID, bizfullname } = ctx.meta.infoUser
                const {
                    mediaID,
                    parentID,
                    content,
                    files,
                    images,
                    select,
                    populates,
                } = ctx.params

                const resultAfterCallHandler =
                    await MEDIA__COMMENT_MODEL.insert({
                        mediaID,
                        parentID,
                        content,
                        files,
                        images,
                        select,
                        populates,
                        authorID,
                        bizfullname,
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
     * Dev: MinhVH
     * Func: Update comment
     * Date: 22/02/2022
     */
    update: {
        auth: 'required',
        params: {
            commentID: { type: 'string' },
            content: { type: 'string', optional: true },
            files: { type: 'array', optional: true },
            images: { type: 'array', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { commentID, content, files, images, select, populates } =
                    ctx.params

                const resultAfterCallHandler =
                    await MEDIA__COMMENT_MODEL.update({
                        commentID,
                        authorID,
                        content,
                        files,
                        images,
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
     * Func: Delete comment media
     */
    delete: {
        auth: 'required',
        params: {
            commentID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { commentID } = ctx.params

                const resultAfterCallHandler =
                    await MEDIA__COMMENT_MODEL.delete({
                        authorID,
                        commentID,
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
     * Func: getList and getInfo comment media
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            mediaID: { type: 'string' },
            commentID: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { _id: authorID } = ctx.meta.infoUser
                let {
                    commentID,
                    mediaID,
                    parentID,
                    limit,
                    lastestID,
                    select,
                    populates,
                    isLoadAll,
                } = ctx.params
                let resultAfterCallHandler

                if (commentID) {
                    resultAfterCallHandler = await MEDIA__COMMENT_MODEL.getInfo(
                        {
                            commentID,
                            select,
                            populates,
                        }
                    )
                } else {
                    resultAfterCallHandler = await MEDIA__COMMENT_MODEL.getList(
                        {
                            mediaID,
                            parentID,
                            limit,
                            lastestID,
                            select,
                            populates,
                            authorID,
                            isLoadAll,
                        }
                    )
                }

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
     * ============================ ****************** ===============================
     * ============================    COMMENT FILE    ===============================
     * ============================ ****************** ===============================
     */

    /**
     * Dev: MinhVH
     * Func: Create comment file
     */
    insertCommentFile: {
        auth: 'required',
        params: {
            mediaID: { type: 'string' },
            fileID: { type: 'string' },
            parentID: { type: 'string', optional: true },
            content: { type: 'string', optional: true },
            files: { type: 'array', optional: true },
            images: { type: 'array', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID, bizfullname } = ctx.meta.infoUser
                const {
                    mediaID,
                    fileID,
                    parentID,
                    content,
                    files,
                    images,
                    select,
                    populates,
                } = ctx.params

                const resultAfterCallHandler =
                    await MEDIA__COMMENT_MODEL.insertCommentFile({
                        mediaID,
                        fileID,
                        parentID,
                        content,
                        files,
                        images,
                        select,
                        populates,
                        authorID,
                        bizfullname,
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
     * Dev: MinhVH
     * Func: Update comment file
     * Date: 22/02/2022
     */
    updateCommentFile: {
        auth: 'required',
        params: {
            commentID: { type: 'string' },
            content: { type: 'string', optional: true },
            files: { type: 'array', optional: true },
            images: { type: 'array', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { commentID, content, files, images, select, populates } =
                    ctx.params

                const resultAfterCallHandler =
                    await MEDIA__COMMENT_MODEL.updateCommentFile({
                        commentID,
                        authorID,
                        content,
                        files,
                        images,
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
     * Func: Delete comment file
     */
    deleteCommentFile: {
        auth: 'required',
        params: {
            commentID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: authorID } = ctx.meta.infoUser
                const { commentID } = ctx.params

                const resultAfterCallHandler =
                    await MEDIA__COMMENT_MODEL.deleteCommentFile({
                        authorID,
                        commentID,
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
     * Dev: MinhVH
     * Func: getList and getInfo comment file
     */
    getInfoAndGetListCommentFile: {
        auth: 'required',
        params: {
            mediaID: { type: 'string' },
            fileID: { type: 'string' },
            commentID: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { _id: authorID } = ctx.meta.infoUser
                let {
                    commentID,
                    mediaID,
                    fileID,
                    parentID,
                    limit,
                    lastestID,
                    select,
                    populates,
                } = ctx.params
                let resultAfterCallHandler

                if (commentID) {
                    resultAfterCallHandler =
                        await MEDIA__COMMENT_MODEL.getInfoCommentFile({
                            commentID,
                            select,
                            populates,
                        })
                } else {
                    resultAfterCallHandler =
                        await MEDIA__COMMENT_MODEL.getListCommentFile({
                            mediaID,
                            fileID,
                            parentID,
                            limit,
                            lastestID,
                            select,
                            populates,
                            authorID,
                        })
                }

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
