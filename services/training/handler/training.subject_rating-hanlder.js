/**
 * TOOLS
 */
 const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

 /**
  * MODELS
  */
 const TRAINING__SUBJECT_RATING_MODEL             = require('../model/training.subject_rating-model').MODEL;

module.exports = {
    /**
	 * Dev: HiepNH 
	 * Func: insert subject rating
	 */
    insert: {
        auth: "required",
        params: {
            score              : { type: "string" },
            lession           : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { score, lession } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                
                let resultAfterCallHandler = await TRAINING__SUBJECT_RATING_MODEL.insert({
                    lession, score, userID
                });
                
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
}