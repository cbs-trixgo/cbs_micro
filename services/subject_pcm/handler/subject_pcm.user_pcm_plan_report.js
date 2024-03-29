/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const USER_PCM_PLAN_REPORT_MODEL =
  require('../model/subject_pcm.user_pcm_plan_report').MODEL

module.exports = {
  /**
   * Dev: HiepNH
   * Func: insert user_pcm_plan_report
   */
  insert: {
    auth: 'required',
    params: {
      subjectID: { type: 'string', optional: true },
      users: { type: 'array', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { subjectID, users } = ctx.params
        const { _id: author, company: companyID } = ctx.meta.infoUser
        let resultAfterCallHandler = []
        let ROLE_VIEW = 2

        for (const userID of users) {
          let infoAfterInsert = await USER_PCM_PLAN_REPORT_MODEL.insert({
            userID,
            subjectID,
            role: ROLE_VIEW,
            author,
          })
          resultAfterCallHandler.push(infoAfterInsert)
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

  /**
   * Dev: HiepNH
   * Func: update pcm_plan_report
   */
  update: {
    auth: 'required',
    params: {
      userSubjectID: { type: 'string' },
      role: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { userSubjectID, role } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        // Bước check quyền
        let resultAfterCallHandler = await USER_PCM_PLAN_REPORT_MODEL.update({
          userSubjectID,
          role,
        })

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
   * Dev: HiepNH
   * Func: remove pcm_plan_report
   */
  remove: {
    auth: 'required',
    params: {
      userSubjectID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { userSubjectID } = ctx.params

        const { _id: userID } = ctx.meta.infoUser

        // Bước check quyền
        let resultAfterCallHandler = await USER_PCM_PLAN_REPORT_MODEL.remove({
          userSubjectID,
        })

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
   * Dev: HiepNH
   * Func: getList and getInfo user_pcm_plan_report
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      userSubjectID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      /**
       * Thông tin mặc định
       */
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
          userSubjectID,
          parentID,
          keyword,
          limit,
          lastestID,
          select,
          populates,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (userSubjectID) {
          resultAfterCallHandler = await USER_PCM_PLAN_REPORT_MODEL.getInfo({
            userSubjectID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await USER_PCM_PLAN_REPORT_MODEL.getList({
            keyword,
            limit,
            lastestID,
            userID,
            parentID,
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
