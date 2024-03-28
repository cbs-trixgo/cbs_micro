/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const PERSONAL__FRIEND_REQUEST_MODEL                    = require('../model/personal.friend_request-model').MODEL;

module.exports = {

    /**
	 * Dev: HiepNH 
	 * Func: Insert friend request
	 */
    getCode: {
        auth: "required",
        params: {
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                let resultAfterCallHandler = await PERSONAL__FRIEND_REQUEST_MODEL.insert({
                    userID 
                });
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

     /**
	 * Dev: HiepNH 
	 * Func: Get friend request
	 */
    checkCodeFriendRequest: {
        auth: "required",
        params: {
            code: { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                let { code } = ctx.params;
                let resultAfterCallHandler = await PERSONAL__FRIEND_REQUEST_MODEL.checkCodeValid({
                    code 
                });
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },
}