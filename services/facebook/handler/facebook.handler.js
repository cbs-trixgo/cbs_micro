const { renderStatusCodeAndResponse }   = require('../../../tools/utils/status_code');
const FACEBOOK_MODEL                    = require('../model/facebook.model').MODEL;

const { FACEBOOK_WEBHOOK_TOKEN }        = process.env;

module.exports = {
    callback: {
        async handler(ctx) {
            try {
                const params = ctx.params
                const challengeCode = params['hub.challenge']
                const verifyToken = params['hub.verify_token']

                if(challengeCode) {
                    if(verifyToken !== FACEBOOK_WEBHOOK_TOKEN) {
                        console.log("Not Matching verify token")
                    }

                    ctx.meta.$responseType = "text/plain";
                    ctx.meta.$statusCode    = 200;

                    return challengeCode;
                }

                const resultAfterCallHandler = await FACEBOOK_MODEL.handleWebhook({ entry: params.entry });
                return resultAfterCallHandler;
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    sendMessage: {
        params: {
            message: { type: "string" },
            phone: { type: "string", optional: true },
            recipientId: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                const { message, phone, recipientId } = ctx.params

                const resultAfterCallHandler = await FACEBOOK_MODEL.sendMessage({
                    message, phone, recipientId,
                    cacher: this.broker.cacher
                })

                return resultAfterCallHandler;
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    getLongLivedUAT: {
        params: {
            accessToken: { type: "string" }
        },
        async handler(ctx) {
            try {
                const { accessToken } = ctx.params

                const resultAfterCallHandler = await FACEBOOK_MODEL.getLongLivedUAT({
                    accessToken,
                    cacher: this.broker.cacher
                })

                return resultAfterCallHandler;
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    getLongLivedPAT: {
        params: {
            accessToken: { type: "string" }
        },
        async handler(ctx) {
            try {
                const { accessToken } = ctx.params

                const resultAfterCallHandler = await FACEBOOK_MODEL.getLongLivedPAT({
                    accessToken,
                    cacher: this.broker.cacher
                })

                return resultAfterCallHandler;
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    }
}