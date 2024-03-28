/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const OPERATION__APAERTMENT_MODEL =
  require('../model/operation.apartment').MODEL

//QUẢN LÝ TIỆN ÍCH GẦN CĂN HỘ

module.exports = {
  /**
   * Dev: HiepNH
   * Func: Thêm apartment
   * Date: 19/08/2021
   */
  insert: {
    auth: 'required',
    params: {
      projectID: { type: 'string' },
      name: { type: 'string' },
      sign: { type: 'string' },
      parentID: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const { projectID, name, sign, parentID, description } = ctx.params

        const resultAfterCallHandler = await OPERATION__APAERTMENT_MODEL.insert(
          {
            projectID,
            name,
            sign,
            parentID,
            description,
            userID,
          }
        )

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
   * Dev: HiepNH
   * Func: Cập nhật apartment
   * Date: 19/08/2021
   */
  update: {
    auth: 'required',
    params: {
      apartmentID: { type: 'string' },
      projectID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      sign: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      startTime: { type: 'string', optional: true },
      expenses: { type: 'string', optional: true },
      ownerID: { type: 'string', optional: true },
      adminsID: { type: 'string', optional: true },
      adminRemove: { type: 'string', optional: true },
      membersID: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const {
          apartmentID,
          projectID,
          parentID,
          name,
          sign,
          description,
          area,
          startTime,
          expenses,
          ownerID,
          adminsID,
          adminRemove,
          membersID,
          memberRemove,
        } = ctx.params

        const resultAfterCallHandler = await OPERATION__APAERTMENT_MODEL.update(
          {
            apartmentID,
            projectID,
            parentID,
            name,
            sign,
            description,
            area,
            startTime,
            expenses,
            ownerID,
            adminsID,
            adminRemove,
            membersID,
            memberRemove,
            userID,
          }
        )

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
   * Dev: HiepNH
   * Func: Xóa apartment
   * Date: 19/08/2021
   */
  remove: {
    auth: 'required',
    params: {
      apartmentID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const { apartmentID } = ctx.params
        const resultAfterCallHandler = await OPERATION__APAERTMENT_MODEL.remove(
          {
            apartmentID,
          }
        )

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
   * Dev: HiepNH
   * Func: Xóa apartment
   * Date: 19/08/2021
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      apartmentID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      parentID: { type: 'string', optional: true },
      ownerID: { type: 'string', optional: true },

      // Mặc định
      keyword: { type: 'string', optional: true },
      limit: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      filter: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const {
          apartmentID,
          projectID,
          parentID,
          ownerID,
          keyword,
          limit,
          lastestID,
          filter,
          select,
        } = ctx.params
        let resultAfterCallHandler
        if (apartmentID) {
          resultAfterCallHandler = await OPERATION__APAERTMENT_MODEL.getInfo({
            apartmentID,
            select,
          })
        } else {
          resultAfterCallHandler = await OPERATION__APAERTMENT_MODEL.getList({
            apartmentID,
            projectID,
            parentID,
            ownerID,
            keyword,
            limit,
            lastestID,
            filter,
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
