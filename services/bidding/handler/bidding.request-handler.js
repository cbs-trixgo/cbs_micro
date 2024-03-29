/**
 * TOOLS
 */
const {
  renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const BIDDING_REQUEST_MODEL = require('../model/bidding.request-model').MODEL

module.exports = {
  /**
   * Name: Insert
   * Author: Hiepnh
   * Date: 9/4/2022
   */
  insert: {
    auth: 'required',
    params: {
      docID: { type: 'string' },
      // companyID           : { type: "string", optional: true },
      // fundaID             : { type: "string", optional: true },
      // contractID          : { type: "string", optional: true },
      // projectID           : { type: "string", optional: true },
      // parentID            : { type: "string", optional: true },
      // type                : { type: "number", optional: true },
      // property            : { type: "number", optional: true },
      // outin               : { type: "number", optional: true },
      // name                : { type: "string" },
      // sign                : { type: "string", optional: true },
      // openingBalance      : { type: "number", optional: true },
      // arising             : { type: "number", optional: true },
      // closingBalance      : { type: "number", optional: true },
      // note                : { type: "string", optional: true },
      // date                : { type: "string" },
      // value               : { type: "number", optional: true },
      // realDate            : { type: "string", optional: true },
      // realValue           : { type: "number", optional: true },
      // priority            : { type: "number", optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        let {
          docID,
          type,
          order,
          invitationLetter,
          procuringEntity,
          client,
          project,
          packageInfo,
          projectAddress,
          projectInfo,
          scopeOfPackage,
          duration,
          contractType,
          documentIntroduction,
          language,
          currency,
          method,
          validity,
          security,
          securityValidity,
          bidsClarification,
          documentsClarification,
          alternative,
          subcontractor,
          deadline,
          evaluation,
          negotiation,
          biddingSolution,
          biddingExpense,
          biddingOther,
          contractCondition,
          name,
          position,
          unit,
          description,
          note,
        } = ctx.params

        let { _id: userID, company } = ctx.meta.infoUser

        const resultAfterCallHandler = await BIDDING_REQUEST_MODEL.insert({
          userID,
          ctx,
          docID,
          type,
          order,
          invitationLetter,
          procuringEntity,
          client,
          project,
          packageInfo,
          projectAddress,
          projectInfo,
          scopeOfPackage,
          duration,
          contractType,
          documentIntroduction,
          language,
          currency,
          method,
          validity,
          security,
          securityValidity,
          bidsClarification,
          documentsClarification,
          alternative,
          subcontractor,
          deadline,
          evaluation,
          negotiation,
          biddingSolution,
          biddingExpense,
          biddingOther,
          contractCondition,
          name,
          position,
          unit,
          description,
          note,
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
   * Name: Update
   * Author: Hiepnh
   * Date: 9/4/2022
   */
  update: {
    auth: 'required',
    params: {
      // requestID          : { type: "string" },
      // contractID          : { type: "string", optional: true },
      // name                : { type: "string", optional: true },
      // sign                : { type: "string", optional: true },
      // openingBalance      : { type: "number", optional: true },
      // arising             : { type: "number", optional: true },
      // closingBalance      : { type: "number", optional: true },
      // note                : { type: "string", optional: true },
      // outin               : { type: "number", optional: true },
      // property            : { type: "number", optional: true },
      // status              : { type: "number", optional: true },
      // type                : { type: "number", optional: true },
      // date                : { type: "string", optional: true },
      // value               : { type: "number", optional: true },
      // realDate            : { type: "string", optional: true },
      // realValue           : { type: "number", optional: true },
      // priority            : { type: "number", optional: true },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const {
          requestID,
          type,
          order,
          invitationLetter,
          procuringEntity,
          client,
          project,
          packageInfo,
          projectAddress,
          projectInfo,
          scopeOfPackage,
          duration,
          contractType,
          documentIntroduction,
          language,
          currency,
          method,
          validity,
          security,
          securityValidity,
          bidsClarification,
          documentsClarification,
          alternative,
          subcontractor,
          deadline,
          evaluation,
          negotiation,
          biddingSolution,
          biddingExpense,
          biddingOther,
          contractCondition,
          name,
          position,
          unit,
          description,
          note,
        } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        const resultAfterCallHandler = await BIDDING_REQUEST_MODEL.update({
          requestID,
          userID,
          ctx,
          type,
          order,
          invitationLetter,
          procuringEntity,
          client,
          project,
          packageInfo,
          projectAddress,
          projectInfo,
          scopeOfPackage,
          duration,
          contractType,
          documentIntroduction,
          language,
          currency,
          method,
          validity,
          security,
          securityValidity,
          bidsClarification,
          documentsClarification,
          alternative,
          subcontractor,
          deadline,
          evaluation,
          negotiation,
          biddingSolution,
          biddingExpense,
          biddingOther,
          contractCondition,
          name,
          position,
          unit,
          description,
          note,
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
   * Name: Remove
   * Author: Hiepnh
   * Date: 9/4/2022
   */
  remove: {
    auth: 'required',
    params: {
      requestIsD: { type: 'array' },
    },
    async handler(ctx) {
      try {
        await this.validateEntity(ctx.params)
        const { requestIsD } = ctx.params
        const { _id: userID } = ctx.meta.infoUser

        let resultAfterCallHandler = await BIDDING_REQUEST_MODEL.remove({
          requestIsD,
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
   * Name: Get info and get list
   * Author: Hiepnh
   * Date: 9/4/2022
   */
  getInfoAndGetList: {
    auth: 'required',
    params: {
      // requestID      : { type: "string", optional: true },
      // companyID       : { type: "string", optional: true },
      // projectID       : { type: "string", optional: true },
      // contractID      : { type: "string", optional: true },
      // parentID        : { type: "string", optional: true },
      // outin           : { type: "number", optional: true },
      // type            : { type: "number", optional: true },
      // property        : { type: "number", optional: true },
      // priority        : { type: "number", optional: true },
      // sortKey        : { type: "string", optional: true },

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
        let {
          requestID,
          type,
          docID,
          keyword,
          limit,
          lastestID,
          populates,
          select,
          sortKey,
        } = ctx.params

        const { _id: userID, company } = ctx.meta.infoUser

        let resultAfterCallHandler
        if (requestID) {
          resultAfterCallHandler = await BIDDING_REQUEST_MODEL.getInfo({
            requestID,
            userID,
            select,
            populates,
          })
        } else {
          resultAfterCallHandler = await BIDDING_REQUEST_MODEL.getList({
            userID,
            type,
            docID,
            keyword,
            limit,
            lastestID,
            select,
            populates,
            sortKey,
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
