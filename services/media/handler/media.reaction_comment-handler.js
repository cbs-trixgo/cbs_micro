/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const MEDIA__REACTION_COMMENT_MODEL             = require('../model/media.reaction_comment-model').MODEL;

module.exports = {
    /**
	 * Dev: MinhVH
	 * Func: THẢ CẢM XÚC CHO BÌNH LUẬN MEDIA
     * Updated: 18/03/2022
	 */
    reactionCommentMedia: {
        auth: "required",
        params: {
            commentID       : { type: "string" },
            typeReaction    : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { commentID, typeReaction } = ctx.params;

                const resultAfterCallHandler = await MEDIA__REACTION_COMMENT_MODEL.reactionCommentMedia({
					authorID, commentID, typeReaction
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: MinhVH
	 * Func: THẢ CẢM XÚC CHO BÌNH LUẬN FILE
     * Updated: 18/03/2022
	 */
    reactionCommentFile: {
        auth: "required",
        params: {
            commentID       : { type: "string" },
            typeReaction    : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { commentID, typeReaction } = ctx.params;

                const resultAfterCallHandler = await MEDIA__REACTION_COMMENT_MODEL.reactionCommentFile({
					authorID, commentID, typeReaction
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: MinhVH
	 * Func: LẤY DANH SÁCH REACTION BÌNH LUẬN TRONG MEDIA, FILE
     * Updated: 18/03/2022
	 */
    getListReactionComment: {
        auth: "required",
        params: {
            commentID   : { type: "string" },
            type        : { type: "string", optional: true },
            isGetTotal  : { type: "string", optional: true },
            lastestID 	: { type: "string", optional: true },
            limit 	    : { type: "string", optional: true },
            select 	    : { type: "string", optional: true },
            populates   : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { commentID, type, lastestID, isGetTotal, limit, select, populates } = ctx.params;

                const resultAfterCallHandler = await MEDIA__REACTION_COMMENT_MODEL.getListReactionComment({
					authorID, commentID, type, lastestID, isGetTotal, limit, select, populates
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },
}