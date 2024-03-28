const { GENERATE_LINK_S3, GET_PATH_S3 } = require('../helper/s3')
const FILE__CORE_MODEL = require('../model/file.core-model').MODEL

module.exports = {
  insert: {
    params: {
      app: { type: 'string' },
      name: { type: 'string' },
      path: { type: 'string' },
      size: { type: 'number', optional: true },
      userID: { type: 'string' }, //TODO: fake wating AUTH_SERVICE
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { app, name, path, size, userID } = ctx.params

        return await FILE__CORE_MODEL.insert({
          app,
          name,
          path,
          size,
          userID,
        })
      } catch (error) {
        return { error: true, message: error.message }
      }
    },
  },

  update: {
    params: {
      fileID: { type: 'string' },
      status: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID } = ctx.meta.infoUser
        const { fileID, status, description } = ctx.params

        return await FILE__CORE_MODEL.update({
          fileID,
          status,
          description,
          userID,
        })
      } catch (error) {
        return { error: true, message: error.message }
      }
    },
  },

  deleteFiles: {
    params: {
      ids: { type: 'array' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: authorID } = ctx.meta.infoUser
        const { ids: fileIDs } = ctx.params

        return await FILE__CORE_MODEL.deleteFiles({ fileIDs, authorID })
      } catch (error) {
        return { error: true, message: error.message, status: 500 }
      }
    },
  },

  getInfoFile: {
    params: {
      fileID: { type: 'string' },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: authorID } = ctx.meta.infoUser
        const { fileID, select, populates } = ctx.params

        return await FILE__CORE_MODEL.getInfoFile({
          authorID,
          fileID,
          select,
          populates,
        })
      } catch (error) {
        return { error: true, message: error.message, status: 500 }
      }
    },
  },

  getListFileWithStatus: {
    params: {
      status: { type: 'string', optional: true },
      userID: { type: 'string' }, //TODO: fake wating AUTH_SERVICE
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let { status, userID } = ctx.params

        return await FILE__CORE_MODEL.getListFileWithStatus({
          status,
          userID,
        })
      } catch (error) {
        return { error: true, message: error.message }
      }
    },
  },

  downloadFileByURL: {
    params: {
      link: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { link } = ctx.params

        ctx.meta.$responseType = 'image/*'
        ctx.meta.$location = link
        return
      } catch (error) {
        return { error: true, message: error.message }
      }
    },
  },

  generateLinkS3: {
    params: {
      mimeType: { type: 'string' },
      name: { type: 'string' },
      type: { type: 'number' },
      size: { type: 'number' },
      //____Ứng dụng
      appID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },
      projectID: { type: 'string', optional: true },
      groupID: { type: 'string', optional: true },
      packageID: { type: 'string', optional: true },
      conversationID: { type: 'string', optional: true },
      taskID: { type: 'string', optional: true },
      typeUpload: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          appID,
          mimeType,
          type,
          name,
          size,
          typeUpload,
          companyID,
          projectID,
          groupID,
          packageID,
          conversationID,
          taskID,
        } = ctx.params
        const infoUser = ctx.meta.infoUser
        const userID = infoUser._id

        let generatePathS3 = GET_PATH_S3({
          infoUser,
          appID,
          companyID,
          projectID,
          groupID,
          packageID,
          conversationID,
          fileName: name,
          typeUpload,
          otherIDs: {
            taskID,
          },
        })
        if (generatePathS3.error) return generatePathS3

        let { newFileName, pathS3 } = generatePathS3.data

        let infoGenerateLink = await GENERATE_LINK_S3(
          newFileName,
          mimeType,
          typeUpload,
          pathS3
        )
        /**
         * Nếu có app thì đang insert file trong app
         * Nếu không có app thì đang insert trong user(image, signature)
         */
        let infoFileAfterInsert = null
        if (appID && !infoGenerateLink.error) {
          infoFileAfterInsert = await FILE__CORE_MODEL.insert({
            appID,
            companyID,
            projectID,
            groupID,
            nameOrg: name,
            name: newFileName,
            path: `/${process.env.AWS_BUCKET_PATH}${pathS3}/${newFileName}`,
            mimeType,
            type,
            size,
            userID,
          })
        }

        return {
          error: false,
          status: 200,
          data: {
            infoGenerateLink,
            infoFileAfterInsert: infoFileAfterInsert?.data,
          },
        }
      } catch (error) {
        return { error: true, message: error.message, status: 500 }
      }
    },
  },
}
