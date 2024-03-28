const httpRequest                       = require('../../../tools/http');
const { convertObjectToQueryParams }    = require('../../../tools/utils/string_utils');

const BaseModel                         = require('../../../tools/db/base_model');
const FACEBOOK_CONVERSATION_COLL        = require("../database/facebook.conversation-coll");
const FACEBOOK_MESSAGE_COLL             = require("../database/facebook.message-coll");

const {
    FACEBOOK_GRAPH_API,
    FACEBOOK_GRAPH_API_VERSION,
    FACEBOOK_PAGE_ID,
    FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET,
}    = process.env;

class Model extends BaseModel {
    // Regular expression to match phone numbers
    phoneRegex = /(\+?84|0)\d{9}/g;
    cacheKeyPrefix = "facebook";

    getCacheKeyPAT(pageId) {
        return `${this.cacheKeyPrefix}:${pageId}:pat`;
    }

    getCacheKeyUAT() {
        return `${this.cacheKeyPrefix}:${FACEBOOK_CLIENT_ID}:uat`;
    }

    getLongLivedUAT({ accessToken, cacher }) {
        return new Promise(async resolve => {
            try {
                const params = {
                    grant_type: "fb_exchange_token",
                    client_id: FACEBOOK_CLIENT_ID,
                    client_secret: FACEBOOK_CLIENT_SECRET,
                    fb_exchange_token: accessToken,
                }

                const response = await httpRequest.get(
                    `${FACEBOOK_GRAPH_API}/${FACEBOOK_GRAPH_API_VERSION}/oauth/access_token?${convertObjectToQueryParams(params)}`
                );

                if(response.status !== 200 || response.statusText !== 'OK') {
                    return resolve({
                        error: true,
                        message: "Can't request to graph API",
                        statusText: response.statusText
                    });
                }

                const { access_token } = response.data;
                const cacheKey = this.getCacheKeyUAT();

                await cacher.set(cacheKey, {
                    access_token,
                    type: params.grant_type,
                }, 24 * 60 * 60);

                return resolve({ error: false, data: response.data })
            } catch(error) {
                console.error({error})
                return resolve({ error: true, message: error.message })
            }
        })
    }

    getLongLivedPAT({ accessToken, cacher }) {
        return new Promise(async resolve => {
            try {
                const params = {
                    access_token: accessToken,
                }

                const response = await httpRequest.get(
                    `${FACEBOOK_GRAPH_API}/${FACEBOOK_GRAPH_API_VERSION}/me/accounts?${convertObjectToQueryParams(params)}`
                );

                if(response.status !== 200 || response.statusText !== 'OK') {
                    return resolve({
                        error: true,
                        message: "Can't request to graph API",
                        statusText: response.statusText
                    });
                }

                const { data } = response.data;

                if (data && data.length) {
                    const cacheAsync = data.map(page => {
                        const cacheKey = this.getCacheKeyPAT(page.id);
                        return cacher.set(cacheKey, page.access_token);
                    })

                    await Promise.all(cacheAsync);
                }

                return resolve({ error: false, data })
            } catch(error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    sendMessage({ message, phone, recipientId, cacher }) {
        return new Promise(async resolve => {
            try {
                const cacheKey = this.getCacheKeyPAT(FACEBOOK_PAGE_ID);
                const accessToken = await cacher.get(cacheKey);

                if (!accessToken) {
                    return resolve({ error: true, message: 'Not found page access token' });
                }

                if (!recipientId && !phone) {
                    return resolve({ error: true, message: 'RecipientID or phone is required' });
                }

                if (phone) {
                    const fbMessage = await FACEBOOK_MESSAGE_COLL
                        .findOne({ phones: { $in: [phone] } })
                        .lean();

                    if (fbMessage) {
                        recipientId = fbMessage.senderId;
                    }
                }

                if (!recipientId) {
                    return resolve({ error: true, message: "Can't get recipientID" });
                }

                const response = await httpRequest.post(
                    `${FACEBOOK_GRAPH_API}/${FACEBOOK_GRAPH_API_VERSION}/${FACEBOOK_PAGE_ID}/messages?access_token=${accessToken}`,
                    {
                        "recipient": {
                            "id": recipientId,
                        },
                        "messaging_type": "RESPONSE",
                        "message":{
                            "text": message
                        }
                    }
                );

                if(response.status !== 200 || response.statusText !== 'OK') {
                    return resolve({
                        error: true,
                        message: "Can't request to graph API",
                        statusText: response.statusText
                    });
                }

                return resolve({ error: false, message: "OK" })
            } catch(error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    handleWebhook({ entry }) {
        return new Promise(async resolve => {
            try {
                const conversation = [];
                const message = [];

                // Extract phone numbers from the message content
                entry.map(item => {
                    conversation[conversation.length] = {
                        id: item.id,
                        time: item.time
                    }

                    item.messaging?.map(mess => {
                        const { sender, recipient, timestamp } = mess
                        const text = mess.message.text;

                        if (!text) return;

                        const phoneNumbers = text.match(this.phoneRegex);

                        // Check if phone numbers were found
                        if (phoneNumbers && phoneNumbers.length) {
                            console.log("Phone number(s) found:");
                            console.log(phoneNumbers);

                            message[message.length] = {
                                conversationId: item.id,
                                mid: mess.message.mid,
                                message: text,
                                senderId: sender.id,
                                recipientId: recipient.id,
                                phones: phoneNumbers,
                                timestamp,
                            }
                        } else {
                            console.log("No phone numbers found in the message content.");
                        }
                    })
                })

                await Promise.all([
                    FACEBOOK_CONVERSATION_COLL.create(conversation),
                    FACEBOOK_MESSAGE_COLL.create(message),
                ]);

                resolve({ error: false, message: 'OK' });
            } catch(error) {
                resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;
