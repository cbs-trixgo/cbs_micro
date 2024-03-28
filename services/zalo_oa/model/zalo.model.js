/**
 * Packages
 */
const crypto = require('crypto')
const base64url = require('base64url')
const uuidv4 = require('uuid').v4

const httpRequest = require('../../../tools/http')
const { generateRandomString } = require('../../../tools/utils/string_utils')

const {
  CF_ACTIONS_REMINDER,
} = require('../../reminder/helper/reminder.actions-constant')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')

const BaseModel = require('../../../tools/db/base_model')
const ZALOOA_FOLLOWER_COLL = require('../database/zalooa.follower-coll')

const {
  ZALO_ZNS_OPEN_API_URL,
  ZALO_OPEN_API_URL,
  ZALO_OA_OAUTH_URL,
  ZALO_OA_APP_ID,
  ZALO_OA_APP_SECRET,
  ZALO_OA_REDIRECT_URI,
} = process.env

class Model extends BaseModel {
  generateUrlRequest(cacher) {
    return new Promise(async (resolve) => {
      const state = generateRandomString(10)
      const verifier = base64url(crypto.randomBytes(32))
      const codeChallenge = base64url(
        crypto.createHash('sha256').update(verifier).digest()
      )

      const urlRequest = `${ZALO_OA_OAUTH_URL}/v4/oa/permission?app_id=${ZALO_OA_APP_ID}&redirect_uri=${encodeURIComponent(ZALO_OA_REDIRECT_URI)}&code_challenge=${codeChallenge}&state=${state}`

      // Cache in 5 minutes
      await cacher.set(`ZALO:oa:verifier:${state}`, verifier, 5 * 1000)

      resolve({
        error: false,
        data: urlRequest,
      })
    })
  }

  requestToken({ code_challenge, authCode, state, cacher, ctx }) {
    return new Promise(async (resolve) => {
      try {
        const verifierCacheKey = `ZALO:oa:verifier:${state}`
        const verifier = await cacher.get(verifierCacheKey)
        if (!verifier) {
          return resolve({
            error: true,
            message: 'Request is expired',
          })
        }
        await cacher.del(verifierCacheKey)

        const codeChallenge = base64url(
          crypto.createHash('sha256').update(verifier).digest()
        )

        if (code_challenge !== codeChallenge) {
          return resolve({
            error: true,
            message: 'Code challenge is not match!',
          })
        }

        const response = await httpRequest.post(
          `${ZALO_OA_OAUTH_URL}/v4/oa/access_token`,
          {
            app_id: ZALO_OA_APP_ID,
            code: authCode,
            code_verifier: verifier,
            grant_type: 'authorization_code',
          },
          {
            headers: {
              secret_key: ZALO_OA_APP_SECRET,
              'Content-type': 'application/x-www-form-urlencoded',
            },
          }
        )
        if (response.status !== 200 || response.statusText !== 'OK') {
          return resolve({
            error: true,
            message: "Can't request to zalo",
          })
        }

        const { access_token, refresh_token } = response.data

        /**
         * Cache refresh token in 60 days
         * and token is 24h
         */
        await cacher.set(`ZALO:oa:token`, access_token, 24 * 60 * 60)
        await cacher.set(
          `ZALO:oa:refresh_token`,
          refresh_token,
          24 * 60 * 60 * 60
        )

        await ctx.call(
          `${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.ADD_JOB_REFRESH_TOKEN_ZALO_OA}`
        )

        resolve({ error: false, data: access_token })
      } catch (error) {
        resolve({ error: true, message: error.message })
      }
    })
  }

  renewAccessToken({ cacher, isCache = false }) {
    return new Promise(async (resolve) => {
      try {
        const refreshToken = await cacher.get(`ZALO:oa:refresh_token`)
        if (!refreshToken) {
          return resolve({
            error: true,
            message: 'Refresh token is required',
          })
        }

        const response = await httpRequest.post(
          `${ZALO_OA_OAUTH_URL}/v4/oa/access_token`,
          {
            app_id: ZALO_OA_APP_ID,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          },
          {
            headers: {
              secret_key: ZALO_OA_APP_SECRET,
              'Content-type': 'application/x-www-form-urlencoded',
            },
          }
        )
        if (response.status !== 200 || response.statusText !== 'OK') {
          return resolve({
            error: true,
            message: "Can't request to zalo",
          })
        }

        if (isCache) {
          const { access_token, refresh_token } = response.data

          /**
           * Cache refresh token in 60 days
           * and token is 24h
           */
          await cacher.set(`ZALO:oa:token`, access_token, 24 * 60 * 60)
          await cacher.set(
            `ZALO:oa:refresh_token`,
            refresh_token,
            24 * 60 * 60 * 60
          )
        }

        resolve(response.data)
      } catch (error) {
        resolve({ error: true, message: error.message })
      }
    })
  }

  sendMessage({ text, userId, cacher }) {
    return new Promise(async (resolve) => {
      try {
        const token = await cacher.get(`ZALO:oa:token`)
        if (!token) {
          return resolve({
            error: true,
            message: 'Token is required',
          })
        }

        const response = await httpRequest.post(
          `${ZALO_OPEN_API_URL}/v2.0/oa/message`,
          {
            recipient: {
              user_id: userId,
            },
            message: {
              text,
            },
          },
          {
            headers: {
              access_token: token,
              'Content-type': 'application/json',
            },
          }
        )
        if (response.status !== 200 || response.statusText !== 'OK') {
          return resolve({
            error: true,
            message: "Can't request to zalo",
          })
        }

        resolve(response.data)
      } catch (error) {
        resolve({ error: true, message: error.message })
      }
    })
  }

  sendMessageZNS({ phone, templateData, templateId = 257162, cacher }) {
    return new Promise(async (resolve) => {
      try {
        const token = await cacher.get(`ZALO:oa:token`)
        if (!token) {
          return resolve({
            error: true,
            message: 'Token is required',
          })
        }

        if (!phone || !templateData) {
          return resolve({
            error: true,
            message: 'Phone and template data is required',
          })
        }

        /**
                    Template data:
                        "customer_name": "Nguyễn Hữu Hiệp",
                        "order_code": "WGO-C001",
                        "price": "30000",
                        "date": "15:25:00 25/04/2023",
                        "note": "Write something"
                 */
        const response = await httpRequest.post(
          `${ZALO_ZNS_OPEN_API_URL}/message/template`,
          {
            phone,
            tracking_id: uuidv4(),
            template_id: templateId,
            template_data: templateData,
          },
          {
            headers: {
              access_token: token,
              'Content-type': 'application/json',
            },
          }
        )
        if (response.status !== 200 || response.statusText !== 'OK') {
          return resolve({
            error: true,
            message: "Can't request to zalo zns",
          })
        }

        resolve(response.data)
      } catch (error) {
        resolve({ error: true, message: error.message })
      }
    })
  }

  getFollowers({ offset = 0, count = 50, tag_name = '', cacher }) {
    return new Promise(async (resolve) => {
      try {
        const token = await cacher.get(`ZALO:oa:token`)
        if (!token) {
          return resolve({
            error: true,
            message: 'Token is required',
          })
        }

        const response = await httpRequest.get(
          `${ZALO_OPEN_API_URL}/v2.0/oa/getfollowers?data=${JSON.stringify({
            offset,
            count,
            tag_name,
          })}`,
          {
            headers: {
              access_token: token,
              'Content-type': 'application/json',
            },
          }
        )
        if (response.status !== 200 || response.statusText !== 'OK') {
          return resolve({
            error: true,
            message: "Can't request to zalo",
          })
        }

        resolve(response.data)
      } catch (error) {
        resolve({ error: true, message: error.message })
      }
    })
  }

  getProfileFollower({ userId, cacher }) {
    return new Promise(async (resolve) => {
      try {
        const token = await cacher.get(`ZALO:oa:token`)
        if (!token) {
          return resolve({
            error: true,
            message: 'Token is required',
          })
        }

        const response = await httpRequest.get(
          `${ZALO_OPEN_API_URL}/v2.0/oa/getprofile?data=${JSON.stringify({
            user_id: userId,
          })}`,
          {
            headers: {
              access_token: token,
              'Content-type': 'application/json',
            },
          }
        )
        if (response.status !== 200 || response.statusText !== 'OK') {
          return resolve({
            error: true,
            message: "Can't request to zalo",
          })
        }

        resolve(response.data)
      } catch (error) {
        resolve({ error: true, message: error.message })
      }
    })
  }

  handleWebhookFollower({
    oaId,
    source,
    followerId,
    eventName,
    timestamp,
    cacher,
  }) {
    return new Promise(async (resolve) => {
      try {
        let gender = '',
          name = ''
        const status = eventName === 'follow' ? 1 : 2

        const follower = await ZALOOA_FOLLOWER_COLL.findOne({
          followerId,
          oaId,
        }).lean()
        const profile = await this.getProfileFollower({
          userId: followerId,
          cacher,
        })

        if (!profile.error) {
          const { display_name, user_gender } = profile.data

          name = display_name
          gender =
            user_gender === 1
              ? 'Nam'
              : user_gender === 2
                ? 'Nữ'
                : 'Không xác định'
        }

        if (follower) {
          await ZALOOA_FOLLOWER_COLL.findOneAndUpdate(
            {
              followerId,
            },
            {
              status,
              eventName,
              source,
              timestamp,
              name,
              gender,
            }
          )
        } else {
          await ZALOOA_FOLLOWER_COLL.create({
            oaId,
            source,
            eventName,
            followerId,
            timestamp,
            status,
            name,
            gender,
          })
        }

        resolve({ error: false, message: 'OK' })
      } catch (error) {
        resolve({ error: true, message: error.message })
      }
    })
  }
}

exports.MODEL = new Model()
