/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const DATAHUB_TEMPLATE_MODEL =
  require('../model/datahub.datahub_template-model').MODEL

module.exports = {
  /**
   * Dev: HiepNH
   * Func: Thêm datahub project
   */
  insert: {
    params: {
      name: { type: 'string' },
      note: { type: 'string', optional: true },
      type: { type: 'number', optional: true },
      status: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { name, note, type, status } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        console.log({ name, note, type, status })

        let resultAfterCallHandler = await DATAHUB_TEMPLATE_MODEL.insert({
          name,
          note,
          type,
          status,
          userID,
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
   * Func: Sửa datahub project
   */
  update: {
    params: {
      datahubProjectID: { type: 'string' },
      client: { type: 'string', optional: true },
      address: { type: 'string', optional: true },
      area3: { type: 'string', optional: true },
      location: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      sign: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      projectType: { type: 'number', optional: true },
      buildingType: { type: 'number', optional: true },
      buildingGrade: { type: 'number', optional: true },
      floorNumber: { type: 'number', optional: true },
      floorArea: { type: 'number', optional: true },
      basementNumber: { type: 'number', optional: true },
      status: { type: 'number', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          datahubProjectID,
          client,
          address,
          area3,
          location,
          name,
          sign,
          note,
          projectType,
          buildingType,
          buildingGrade,
          basementNumber,
          basementArea,
          floorNumber,
          floorArea,
          status,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await DATAHUB_TEMPLATE_MODEL.update({
          datahubProjectID,
          client,
          address,
          area3,
          location,
          name,
          sign,
          note,
          projectType,
          buildingType,
          buildingGrade,
          basementNumber,
          basementArea,
          floorNumber,
          floorArea,
          status,
          userID,
          ctx,
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
   * Func: Xóa datahub project
   */
  remove: {
    params: {
      datahubProjectID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { datahubProjectID } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await DATAHUB_TEMPLATE_MODEL.remove({
          datahubProjectID,
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
   * Func: get info and get list datahub project
   */
  getInfoAndGetList: {
    params: {
      datahubProjectID: { type: 'string', optional: true },

      // Field mặc định
      keyword: { type: 'string', optional: true },
      limit: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { datahubProjectID, lastestID, keyword, limit, select, populates } =
          ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (datahubProjectID) {
          resultAfterCallHandler = await DATAHUB_TEMPLATE_MODEL.getInfo({
            datahubProjectID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await DATAHUB_TEMPLATE_MODEL.getList({
            userID,
            lastestID,
            keyword,
            limit: +limit,
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

  /**
   * Dev: HiepNH
   * Func: Download Excel
   * Date: 18/09/2022
   */
  downloadTemplateImportExcel: {
    auth: 'required',
    params: {
      // projectID: { type: 'string' }
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        // const { projectID } = ctx.params;

        const { _id: userID } = ctx.meta.infoUser
        console.log({ userID })

        const resultAfterCallHandler =
          await DATAHUB_TEMPLATE_MODEL.downloadTemplateImportExcel({
            userID,
          })

        return renderStatusCodeAndResponse({
          resultAfterCallHandler,
          ctx,
        })
      } catch (error) {
        return renderStatusCodeAndResponse({
          error_message: error.message,
          ctx,
        })
      }
    },
  },
}
