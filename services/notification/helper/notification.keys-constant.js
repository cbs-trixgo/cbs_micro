// FILE CONFIG || VARIABLE CONSTANT
exports.ONESIGNAL_APP_TEASER            = process.env.ONESIGNAL_APP_TEASER || '';
exports.ONESIGNAL_APP_CBS               = process.env.ONESIGNAL_APP_CBS || '';
exports.ONESIGNAL_APP_FNB               = process.env.ONESIGNAL_APP_FNB || '';

exports.NOTI_TYPE_MOBILE                = 'NOTI_TYPE_MOBILE';
exports.NOTI_TYPE_WEB                   = 'NOTI_TYPE_WEB';
exports.NOTI_TYPE_SMS                   = 'NOTI_TYPE_SMS';
exports.NOTI_TYPE_EMAIL                 = 'NOTI_TYPE_EMAIL';

exports.NOTI_TYPE = [1,2,3,4,5]

/**
 * LIST TYPE EVENT - KEY
 *  (chức năng dùng cho phần đa ngôn ngữ) (đồng bộ phía client-server)
 */

/**
 * LIST TYPE NOTIFICATIONS 
 */
let APP_MESSAGE                 = 'MESSAGE';
let APP_ACCOUNT                 = 'ACCOUNT';
let APP_MEDIA                   = 'MEDIA';
let APP_PCM                     = 'PCM';

// MEDIA
exports.MEDIA_POST_LIKE                      = `${APP_MEDIA}.MEDIA_POST_LIKE`;
exports.MEDIA_COMMENT_LIKE                   = `${APP_MEDIA}.MEDIA_COMMENT_LIKE`;
exports.MEDIA_SEND_NOTICE_COMMENT_TO_MEMBERS = `${APP_MEDIA}.MEDIA_SEND_NOTICE_COMMENT_TO_MEMBERS`;

/**
 * DANH SÁCH ENV THEO field devices TẠI AUTH.USER-COLL
 */
exports.ENV_DEVICE_WEB_CBS = 1;
exports.ENV_DEVICE_APP_TEASER = 2;
exports.ENV_DEVICE_APP_CBS = 3;
exports.ENV_DEVICE_APP_FNB = 4;
exports.ENV_DEVICE_APP_FNB_AND_CBS = 5;