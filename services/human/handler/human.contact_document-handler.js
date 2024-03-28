/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const HUMAN__CONTACT_DOCUMENT_MODEL =
  require('../model/human.contact_document-model').MODEL

module.exports = {
  /**
   * Dev: HiepNH
   * Func: Insert contact document
   */
  insert: {
    params: {
      contactID: { type: 'string' },
      type: { type: 'string', optional: true },
      number: { type: 'string', optional: true },
      status: { type: 'string', optional: true },
      certificateGrade: { type: 'string', optional: true },
      fromDate: { type: 'string', optional: true },
      toDate: { type: 'string', optional: true },
      workplace: { type: 'string', optional: true },
      reference: { type: 'string', optional: true },
      item: { type: 'string', optional: true },
      project: { type: 'string', optional: true },
      client: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      sign: { type: 'string', optional: true },
      note: { type: 'string', optional: true },
      store: { type: 'string', optional: true },
      position2: { type: 'string', optional: true },
      certificateType: { type: 'string', optional: true },
      certificateName: { type: 'string', optional: true },
      contract: { type: 'string', optional: true },
      timeMobilize: { type: 'string', optional: true },
      factor: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          contactID,
          type,
          number,
          status,
          certificateGrade,
          fromDate,
          toDate,
          workplace,
          reference,
          item,
          project,
          client,
          name,
          place,
          description,
          sign,
          note,
          store,
          field2,
          position2,
          certificateType,
          certificateName,
          educationalBackground2,
          contract,
          timeMobilize,
          factor,
        } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler = await HUMAN__CONTACT_DOCUMENT_MODEL.insert(
          {
            userCreate: userID,
            contactID,
            type,
            number,
            status,
            certificateGrade,
            fromDate,
            toDate,
            workplace,
            reference,
            item,
            project,
            client,
            name,
            place,
            description,
            sign,
            note,
            store,
            field2,
            position2,
            certificateType,
            certificateName,
            educationalBackground2,
            contract,
            timeMobilize,
            factor,
            ctx,
          }
        )

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
   * Func: Update contact document
   */
  update: {
    params: {
      contactDocumentID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          contactDocumentID,
          type,
          number,
          status,
          certificateGrade,
          fromDate,
          toDate,
          workplace,
          reference,
          item,
          project,
          client,
          name,
          place,
          description,
          sign,
          note,
          store,
          field2,
          position2,
          certificateType,
          certificateName,
          educationalBackground2,
          contract,
          timeMobilize,
          factor,
          filesID,
          fileRemoveID,
        } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler = await HUMAN__CONTACT_DOCUMENT_MODEL.update(
          {
            authorID: userID,
            documentID: contactDocumentID,
            type,
            number,
            status,
            certificateGrade,
            fromDate,
            toDate,
            workplace,
            reference,
            item,
            project,
            client,
            name,
            place,
            description,
            sign,
            note,
            store,
            field2,
            position2,
            certificateType,
            certificateName,
            educationalBackground2,
            contract,
            timeMobilize,
            factor,
            filesID,
            fileRemoveID,
          }
        )

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
   * Func: Remove contact document
   */
  remove: {
    params: {
      contactDocumentID: { type: 'string' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)

        let { contactDocumentID } = ctx.params
        let resultAfterCallHandler = await HUMAN__CONTACT_DOCUMENT_MODEL.remove(
          {
            contactDocumentID,
            ctx,
          }
        )

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
   * Func: Danh sách contact document
   */
  getInfoAndGetList: {
    params: {
      keywordContact: { type: 'string', optional: true },
      gender: { type: 'string', optional: true },
      contactDocumentID: { type: 'string', optional: true },
      type: { type: 'string', optional: true },
      contactID: { type: 'string', optional: true },
      companyID: { type: 'string', optional: true },
      isDuration3Month: { type: 'string', optional: true },
      educationalBackground2: { type: 'string', optional: true },
      field2: { type: 'string', optional: true },
      certificateType: { type: 'string', optional: true },
      certificateName: { type: 'string', optional: true },
      certificateGrade: { type: 'string', optional: true },
      isCertificate: { type: 'string', optional: true },
      isToDate5Month: { type: 'string', optional: true },

      // Field mặc định
      limit: { type: 'string', optional: true },
      lastestID: { type: 'string', optional: true },
      keyword: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          contactDocumentID,
          type,
          contactID,
          isDuration3Month,
          companyID,
          gender,
          keywordContact,
          educationalBackground2,
          field2,
          certificateType,
          certificateName,
          certificateGrade,
          keyword,
          limit,
          lastestID,
          select,
          populates,
          isCertificate,
          isToDate5Month,
        } = ctx.params
        const { _id: userID, company } = ctx.meta.infoUser
        if (!companyID) {
          companyID = company._id
        }
        let resultAfterCallHandler
        if (contactDocumentID) {
          resultAfterCallHandler = await HUMAN__CONTACT_DOCUMENT_MODEL.getInfo({
            contactDocumentID,
            select,
            populates,
            ctx,
          })
        } else {
          resultAfterCallHandler = await HUMAN__CONTACT_DOCUMENT_MODEL.getList({
            companyID,
            type,
            contactID,
            isDuration3Month,
            lastestID,
            keyword,
            select,
            limit,
            populates,
            gender,
            keywordContact,
            educationalBackground2,
            field2,
            certificateType,
            certificateName,
            certificateGrade,
            isCertificate,
            isToDate5Month,
            userID,
            ctx,
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
   * Name  : Tìm kiếm văn bản
   * Author: HiepNH
   * Code  : 29/8/2022
   */
  getListByFilter: {
    auth: 'required',
    params: {
      genders: { type: 'array', optional: true },
      departmentsID: { type: 'array', optional: true },
      companyID: { type: 'string', optional: true },
      keyword: { type: 'string', optional: true },
      isParent: { type: 'string', optional: true },

      lastestID: { type: 'string', optional: true },
      populates: { type: 'string', optional: true },
      select: { type: 'string', optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser

        let {
          parentID,
          companyID,
          receiverID,
          types,
          isExportExcel,
          requestResponse,
          fromDate,
          toDate,
          marked,
          departmentsID,
          keyword,
          limit,
          lastestID,
          select,
          isParent,
          type,
          genders,
          populates,
        } = ctx.params

        if (!companyID) {
          companyID = company._id
        }

        const resultAfterCallHandler =
          await HUMAN__CONTACT_DOCUMENT_MODEL.getListByFilter({
            userID,
            parentID,
            companyID,
            receiverID,
            types,
            isExportExcel,
            requestResponse,
            fromDate,
            toDate,
            marked,
            departmentsID,
            keyword,
            limit,
            lastestID,
            select,
            isParent,
            type,
            genders,
            populates,
            ctx,
          })

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
   * Code:  MinhVH
   * Name Download Excel Contact
   * Date: 21/06/2022
   */
  exportExcel: {
    auth: 'required',
    params: {
      // companyID: { type: "string", optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { _id: userID, company } = ctx.meta.infoUser
        let { companyID, filterParams } = ctx.params

        if (!companyID) {
          companyID = company._id
        }

        // console.log('=============>>>>>>>>>>>>>>>')
        // console.log(ctx.params)

        const resultAfterCallHandler =
          await HUMAN__CONTACT_DOCUMENT_MODEL.exportExcel({
            userID,
            companyID,
            filterParams,
            ctx,
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
