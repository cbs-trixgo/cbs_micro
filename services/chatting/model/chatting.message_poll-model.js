'use strict'

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')

/**
 * COLLECTIONS, MODELS
 */
const CHATTING__MESSAGE_COLL = require('../database/chatting.message-coll')
const CHATTING__MESSAGE_POLL_COLL = require('../database/chatting.message_poll-coll')
const CHATTING__CONVERSATION_COLL = require('../database/chatting.conversation-coll')
const CHATTING__MESSAGE_MODEL = require('../model/chatting.message-model').MODEL

class Model extends BaseModel {
  constructor() {
    super(CHATTING__MESSAGE_POLL_COLL)
  }

  /**
   * Dev: MinhVH
   * Func: Thêm tin nhắn poll mới
   * Date: 25/08/2021
   */
  insert({ conversationID, name, options, authorID }) {
    return new Promise(async (resolve) => {
      try {
        if (
          !checkObjectIDs([authorID, conversationID]) ||
          !name ||
          !options.length
        ) {
          return resolve({
            error: true,
            message: 'Tham số không hợp lệ',
            keyEror: 'params_invalid',
            status: 400,
          })
        }

        // CHECK USER IS MEMBER OF CONVERSATION
        let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
          _id: conversationID,
          members: { $in: [authorID] },
        }).lean()

        if (!checkExistConversation) {
          return resolve({
            error: true,
            message: 'Bạn không phải thành viên của cuộc hội thoại',
            keyEror: 'you_are_not_member_of_conversation',
            status: 403,
          })
        }

        // Check config admin conversation
        if (
          checkExistConversation.config &&
          checkExistConversation.config.configCreatePoll === 2
        ) {
          const listAuthorsID = checkExistConversation.authors.map((author) =>
            author.toString()
          )

          // User is not author of conversation
          if (!listAuthorsID.includes(authorID)) {
            return resolve({
              error: true,
              message: 'Bạn không có quyền tạo poll',
              keyEror: 'you_do_not_have_permission_to_create_poll',
              status: 403,
            })
          }
        }

        // INSERT MESSAGE POLL
        let infoPollAfterInsert = await this.insertData({
          name,
          options,
        })

        if (!infoPollAfterInsert) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyEror: 'error_occurred',
            status: 422,
          })
        }

        let dataInsertMessage = {
          usersSeen: [authorID],
          sender: authorID,
          conversation: conversationID,
          receivers: checkExistConversation.members,
          poll: infoPollAfterInsert._id,
          type: 5,
        }

        // INSERT MESSAGE POLL
        let infoMessagePoll =
          await CHATTING__MESSAGE_MODEL.insertData(dataInsertMessage)

        if (!infoMessagePoll) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyEror: 'error_occurred',
            status: 422,
          })
        }

        // UPDATE LAST MESSAGE
        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
          lastMessage: infoMessagePoll._id,
          modifyAt: Date.now(),
        })

        // UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
        await CHATTING__MESSAGE_MODEL.updateUserMissMessage({
          conversationID,
          userID: authorID,
          numberMissMessage: 2,
        })

        return resolve({
          error: false,
          status: 200,
          data: infoMessagePoll,
        })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Cập nhật poll
   * Date: 28/08/2021
   */
  update({
    conversationID,
    messageID,
    newVotes,
    votesCancel,
    newOptions,
    authorID,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([messageID, authorID, conversationID])) {
          return resolve({
            error: true,
            message: 'Tham số messageID hoặc conversationID không hợp lệ',
            keyEror: 'params_messageID_or_conversationID_invalid',
            status: 400,
          })
        }

        // CHECK USER IS MEMBER OF CONVERSATION
        let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
          _id: conversationID,
          members: { $in: [authorID] },
        }).lean()

        if (!checkExistConversation) {
          return resolve({
            error: true,
            message: 'Bạn không phải thành viên của cuộc hội thoại',
            keyEror: 'you_are_not_member_of_conversation',
            status: 403,
          })
        }

        let infoMessagePoll = await CHATTING__MESSAGE_COLL.findById(messageID)
          .select('_id poll')
          .populate('poll')

        if (!infoMessagePoll || !infoMessagePoll.poll) {
          return resolve({
            error: true,
            message: 'Tin nhắn không tồn tại',
            keyEror: 'message_is_not_exists',
            status: 400,
          })
        }

        let { poll } = infoMessagePoll

        // Check the user who vote for the first time, Then create message notify
        let isFirstTimeVote = true
        poll.options.map((option) => {
          if (option.usersVote.includes(authorID)) {
            isFirstTimeVote = false
          }
        })

        // INSERT NEW OPTIONS FOR MESSAGE POLL
        if (newOptions && newOptions.length) {
          let listOptionsName = newOptions.map((option) => option.title)

          await CHATTING__MESSAGE_POLL_COLL.findOneAndUpdate(
            {
              _id: poll._id,
              'options.title': {
                $nin: listOptionsName,
              },
            },
            {
              $addToSet: {
                options: newOptions,
              },
            }
          )
        }

        // PULL USER VOTE MESSAGE POLL
        if (votesCancel && votesCancel.length && checkObjectIDs(votesCancel)) {
          await CHATTING__MESSAGE_POLL_COLL.findByIdAndUpdate(
            poll._id,
            {
              $pull: {
                'options.$[elem].usersVote': authorID,
              },
            },
            {
              arrayFilters: [
                {
                  'elem._id': { $in: votesCancel },
                },
              ],
            }
          )
        }

        // PUSH USER VOTE MESSAGE POLL
        if (newVotes && newVotes.length && checkObjectIDs(newVotes)) {
          await CHATTING__MESSAGE_POLL_COLL.findByIdAndUpdate(
            poll._id,
            {
              $addToSet: {
                'options.$[elem].usersVote': authorID,
              },
            },
            {
              arrayFilters: [
                {
                  'elem._id': { $in: newVotes },
                },
              ],
            }
          )
        }

        let lastMessage = null
        let numberMissMessage = 0
        let dataInsertMessage = {
          usersSeen: [authorID],
          sender: authorID,
          conversation: conversationID,
          receivers: checkExistConversation.members,
          poll: poll._id,
        }

        // INSERT MESSAGE NOTIFY JOIN VOTE POLL
        if (isFirstTimeVote) {
          lastMessage = await CHATTING__MESSAGE_MODEL.insertData({
            ...dataInsertMessage,
            type: 111, // Tham gia bình chọn trong cuộc hội thoại
          })
          numberMissMessage++
        }

        // INSERT MESSAGE NOTIFY CHANGE VOTE POLL
        if (
          (votesCancel.length || newVotes.length || newOptions.length) &&
          !isFirstTimeVote
        ) {
          lastMessage = await CHATTING__MESSAGE_MODEL.insertData({
            ...dataInsertMessage,
            type: 112, // Thay đổi bình chọn trong cuộc hội thoại
          })
          numberMissMessage++
        }

        let infoMessagePollAfterUpdate = await CHATTING__MESSAGE_COLL.findById(
          messageID
        )
          .populate({
            path: 'poll',
            populate: {
              path: 'options.usersVote',
              select: '_id bizfullname fullname image',
            },
          })
          .lean()

        // UPDATE LAST MESSAGE & UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
        if (lastMessage) {
          await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
            lastMessage: lastMessage._id,
            modifyAt: Date.now(),
          })

          await CHATTING__MESSAGE_MODEL.updateUserMissMessage({
            conversationID,
            userID: authorID,
            numberMissMessage,
          })
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            infoMessage: infoMessagePollAfterUpdate,
            infoMessageNotification: lastMessage,
          },
        })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Đóng poll
   * Date: 30/08/2021
   */
  closePoll({ conversationID, messageID, authorID }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs([messageID, authorID, conversationID])) {
          return resolve({
            error: true,
            message: 'Tham số messageID hoặc conversationID không hợp lệ',
            keyEror: 'params_messageID_or_conversationID_invalid',
            status: 400,
          })
        }

        // CHECK USER IS MEMBER OF CONVERSATION
        let checkExistConversation = await CHATTING__CONVERSATION_COLL.findOne({
          _id: conversationID,
          members: { $in: [authorID] },
        }).lean()

        if (!checkExistConversation) {
          return resolve({
            error: true,
            message: 'Bạn không phải thành viên của cuộc hội thoại',
            keyEror: 'you_are_not_member_of_conversation',
            status: 403,
          })
        }

        let infoMessagePoll = await CHATTING__MESSAGE_COLL.findById(messageID)
          .select('_id poll')
          .populate('poll')

        if (!infoMessagePoll || !infoMessagePoll.poll) {
          return resolve({
            error: true,
            message: 'Tin nhắn không tồn tại',
            keyEror: 'message_is_not_exists',
            status: 400,
          })
        }

        let { poll } = infoMessagePoll

        if (poll.status === 2) {
          return resolve({
            error: true,
            message: 'Tin nhắn poll đã được đóng',
            keyEror: 'message_poll_is_closed',
            status: 400,
          })
        }

        const infoPoll = await CHATTING__MESSAGE_POLL_COLL.findByIdAndUpdate(
          poll._id,
          {
            $set: {
              status: 2,
            },
          },
          { new: true }
        )

        if (!infoPoll) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyEror: 'error_occurred',
            status: 422,
          })
        }

        // INSERT MESSAGE NOTIFY CLOSE POLL
        const lastMessage = await CHATTING__MESSAGE_MODEL.insertData({
          usersSeen: [authorID],
          sender: authorID,
          conversation: conversationID,
          receivers: checkExistConversation.members,
          poll: poll._id,
          type: 113,
        })

        // UPDATE LAST MESSAGE & UPDATE AMOUNT MESSAGE USER MISS IN CONVERSATION
        if (lastMessage) {
          await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(conversationID, {
            lastMessage: lastMessage._id,
            modifyAt: Date.now(),
          })

          await CHATTING__MESSAGE_MODEL.updateUserMissMessage({
            conversationID,
            userID: authorID,
            numberMissMessage: 1,
          })
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            infoPoll,
            infoMessageNotification: lastMessage,
          },
        })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }

  /**
   * Dev: MinhVH
   * Func: Lấy danh sách poll
   * Date: 30/08/2021
   */
  getList({
    conversationID,
    lastestID,
    authorID,
    limit = 10,
    filter = {},
    select = {},
  }) {
    return new Promise(async (resolve) => {
      try {
        let conditionObj = { conversation: conversationID, type: 5 }
        let sortBy = { modifyAt: -1, createAt: -1 }
        let keys = ['modifyAt__-1', 'createAt__-1']

        if (!checkObjectIDs([conversationID, authorID])) {
          return resolve({
            error: true,
            message: 'Tham số authorID hoặc conversationID không hợp lệ',
            keyEror: 'params_authorID_or_conversationID_invalid',
            status: 400,
          })
        }

        if (isNaN(limit) || +limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        if (filter && typeof filter === 'string') {
          if (!IsJsonString(filter))
            return resolve({
              error: true,
              message: 'Request params filter invalid',
              status: 400,
            })

          filter = JSON.parse(filter)
        }

        if (select && typeof select === 'string') {
          if (!IsJsonString(select))
            return resolve({
              error: true,
              message: 'Request params select invalid',
              status: 400,
            })

          select = JSON.parse(select)
        }

        let infoConversation = await CHATTING__CONVERSATION_COLL.findOne({
          _id: conversationID,
          members: { $in: [authorID] },
        }).lean()

        if (!infoConversation) {
          return resolve({
            error: true,
            message: 'Bạn không phải thành viên của cuộc hội thoại',
            keyEror: 'you_are_not_member_of_conversation',
            status: 403,
          })
        }

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await CHATTING__MESSAGE_COLL.findById(lastestID)
          if (!infoData)
            return resolve({
              error: true,
              message: "Can't get info lastestID",
              status: 400,
            })

          let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
            keys,
            latestRecord: infoData,
            objectQuery: conditionObjOrg,
          })
          if (!dataPagingAndSort || dataPagingAndSort.error)
            return resolve({
              error: true,
              message: "Can't get range pagination",
              status: 400,
            })

          conditionObj = dataPagingAndSort.data.find
          sortBy = dataPagingAndSort.data.sort
        } else {
          let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
            keys,
            latestRecord: null,
            objectQuery: conditionObjOrg,
          })
          sortBy = dataPagingAndSort.data.sort
        }

        let listMessagesPoll = await CHATTING__MESSAGE_COLL.find(
          conditionObj,
          filter
        )
          .populate('sender', select.sender)
          .populate({
            path: 'poll',
            populate: {
              path: 'options.usersVote',
              select: '_id bizfullname fullname image',
            },
            select: select.poll,
          })
          .limit(limit + 1)
          .sort(sortBy)
          .lean()

        if (!listMessagesPoll) {
          return resolve({
            error: true,
            message:
              'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
            keyEror: 'error_occurred',
            status: 422,
          })
        }

        // GET TOTAL RECORD
        let totalRecord = await CHATTING__MESSAGE_COLL.count(conditionObjOrg)
        let nextCursor = null

        if (listMessagesPoll && listMessagesPoll.length) {
          if (listMessagesPoll.length > limit) {
            nextCursor = listMessagesPoll[limit - 1]._id
            listMessagesPoll.length = limit
          }
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listMessagesPoll,
            limit,
            totalRecord,
            nextCursor,
          },
        })
      } catch (error) {
        return resolve({
          error: true,
          message: error.message,
          status: 500,
        })
      }
    })
  }
}

exports.MODEL = new Model()
