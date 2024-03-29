'use strict'

const { CF_DOMAIN_SERVICES } = require('./helper/domain.constant')
const { parseUserAgent } = require('../../tools/utils/utils')

/**
 * ------import route's Services---------
 */
const { CF_ROUTINGS_GATEWAY } = require('./helper/gateway.routes-constant')
const { CF_ROUTINGS_AUTH } = require('../auth/helper/auth.routes-constant')
const { CF_ROUTINGS_ZALO } = require('../zalo_oa/helper/zalo.routes')
const { CF_ROUTINGS_FACEBOOK } = require('../facebook/helper/facebook.routes')

/**
 * ------import action's Services--------
 */
const { CF_ACTIONS_GATEWAY } = require('./helper/gateway.actions-constant')
const { CF_ACTIONS_AUTH } = require('../auth/helper/auth.actions-constant')
const { CF_ACTIONS_ZALO } = require('../zalo_oa/helper/zalo.actions')
const { CF_ACTIONS_FACEBOOK } = require('../facebook/helper/facebook.actions')

module.exports = {
  path: 'api',

  // Cho phép truy cập tất cả các services
  whitelist: ['**'],

  aliases: {
    //--------------------------aliases's GATEWAY service--------------------------//
    [`GET ${CF_ROUTINGS_GATEWAY.CHECK_HEALTH}`]: [
      `${CF_DOMAIN_SERVICES.GATEWAY}.${CF_ACTIONS_GATEWAY.CHECK_HEALTH}`,
    ],

    //--------------------------aliases's AUTH service--------------------------//
    [`POST ${CF_ROUTINGS_AUTH.USERS}`]: [
      `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.REGISTER}`,
    ],

    /**
     * Code: A0015
     */
    [`POST ${CF_ROUTINGS_AUTH.LOGIN}`]: [
      `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.LOGIN}`,
    ],

    /**
     * Code: A0016
     */
    [`GET ${CF_ROUTINGS_AUTH.RECOVER_PASSWORD}`]: [
      `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.RECOVER_PASSWORD}`,
    ],

    /**
     * Code: A0017
     */
    [`GET ${CF_ROUTINGS_AUTH.CHECK_OTP_RECOVER_PASSWORD}`]: [
      `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.CHECK_OTP_RECOVER_PASSWORD}`,
    ],

    /**
     * Code: A0018
     */
    [`POST ${CF_ROUTINGS_AUTH.UPDATE_PASSWORD_RECOVER}`]: [
      `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.UPDATE_PASSWORD_RECOVER}`,
    ],

    /**
     * KHÁCH HÀNG ĐĂNG KÝ TRẢI NGHIỆM SẢN PHẨM
     */

    /**
     * Check version app
     */
    [`GET ${CF_ROUTINGS_AUTH.CHECK_LASTEST_APP}`]: [
      `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.CHECK_VERSION_APP}`,
    ],

    /**
     * Zalo OA
     */
    [`GET ${CF_ROUTINGS_ZALO.ZALO_REQUEST_PERMISSION}`]: [
      `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_REQUEST_PERMISSION}`,
    ],

    [`GET ${CF_ROUTINGS_ZALO.ZALO_CALLBACK}`]: [
      `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_CALLBACK}`,
    ],

    [`POST ${CF_ROUTINGS_ZALO.ZALO_WEBHOOK}`]: [
      `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_WEBHOOK}`,
    ],

    /**
     * Facebook API
     */
    [`GET ${CF_ROUTINGS_FACEBOOK.FACEBOOK_CALLBACK}`]: [
      `${CF_DOMAIN_SERVICES.FACEBOOK}.${CF_ACTIONS_FACEBOOK.FACEBOOK_CALLBACK}`,
    ],

    [`POST ${CF_ROUTINGS_FACEBOOK.FACEBOOK_CALLBACK}`]: [
      `${CF_DOMAIN_SERVICES.FACEBOOK}.${CF_ACTIONS_FACEBOOK.FACEBOOK_CALLBACK}`,
    ],

    [`GET ${CF_ROUTINGS_FACEBOOK.FACEBOOK_GET_LONG_LIVED_UAT}`]: [
      `${CF_DOMAIN_SERVICES.FACEBOOK}.${CF_ACTIONS_FACEBOOK.FACEBOOK_GET_LONG_LIVED_UAT}`,
    ],

    [`GET ${CF_ROUTINGS_FACEBOOK.FACEBOOK_GET_LONG_LIVED_PAT}`]: [
      `${CF_DOMAIN_SERVICES.FACEBOOK}.${CF_ACTIONS_FACEBOOK.FACEBOOK_GET_LONG_LIVED_PAT}`,
    ],
  },
  // Disable to call not-mapped actions
  mappingPolicy: 'all', // Available values: "all", "restrict"

  // Set CORS headers
  // cors: true,
  // Global CORS settings for all routes
  cors: {
    // Configures the Access-Control-Allow-Origin CORS header.
    origin: '*',
    // Configures the Access-Control-Allow-Methods CORS header.
    methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
    // Configures the Access-Control-Allow-Headers CORS header.
    allowedHeaders: ['X-Requested-With', 'content-type', 'Authorization'],
    // Configures the Access-Control-Expose-Headers CORS header.
    exposedHeaders: [],
    // Configures the Access-Control-Allow-Credentials CORS header.
    credentials: true,
    // Configures the Access-Control-Max-Age CORS header.
    maxAge: 3600,
  },

  // Parse body content
  bodyParsers: {
    json: {
      strict: false,
    },
    urlencoded: {
      extended: true,
      limit: '1MB',
    },
  },
  // Enable/disable logging
  logging: true,

  /**
   * ROUTE Hooks: cấu hình map từ req -> ctx
   */
  onBeforeCall(ctx, route, req, res) {
    // Set request headers to context meta
    ctx.meta.userAgent = req.headers['user-agent']
    ctx.meta.ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress

    const userAgent = ctx.meta.userAgent
    const platform = parseUserAgent(userAgent)
    ctx.meta.platform = platform
  },
}
