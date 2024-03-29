const BaseModel = require('../../../tools/db/base_model')
const _isValid = require('mongoose').Types.ObjectId
const moment = require('moment')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')

/**
 * DOMAIN AND ACTIONS
 */

/**
 * TOOLS
 */

/**
 * COLLECTIONS
 */
const PERSONAL__NOTE_COLL = require('../database/personal.note-coll')

class Model extends BaseModel {
  constructor() {
    super(PERSONAL__NOTE_COLL)
  }

  insert({ userID, name, description }) {
    return new Promise(async (resolve) => {
      try {
        let dataInsert = { author: userID, members: [userID] }
        if (name) {
          dataInsert.name = name
        }

        if (description) {
          dataInsert.description = description
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({ error: true, message: 'cannot_insert' })

        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  update({
    noteID,
    name,
    description,
    members,
    membersRemove,
    trash,
    pin,
    removePin,
    userID,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(noteID))
          return resolve({ error: true, message: 'noteID_invalid' })

        let dataUpdate = { modifyAt: new Date() }
        let dataAddToSet = {}
        let dataPullAll = {}
        if (name) {
          dataUpdate.name = name
        }

        if (description) {
          dataUpdate.description = description
        }

        // Chia sẽ cho bạn bè
        if (members) {
          dataAddToSet.members = members
        }

        if (membersRemove) {
          dataPullAll.members = membersRemove
        }
        // Ghim
        if (pin == 1) {
          dataAddToSet.usersPin = userID
        }
        // Xóa ghim
        if (removePin == 1) {
          dataPullAll.usersPin = [userID]
        }
        // Xóa
        if (trash == 1) {
          // Check xem có phải author mới cho xóa
          dataUpdate.trash = trash
        }

        if (dataAddToSet) {
          dataUpdate.$addToSet = dataAddToSet
        }

        if (dataPullAll) {
          dataUpdate.$pullAll = dataPullAll
        }

        let infoAfterUpdate = await PERSONAL__NOTE_COLL.findByIdAndUpdate(
          noteID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({ error: true, message: 'cannot_update' })

        return resolve({ error: false, data: infoAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Get info
   * Author: Depv
   * Date: 9/4/2022
   */
  getInfo({ noteID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(noteID))
          return resolve({ error: true, message: 'param_invalid' })

        // populates
        if (populates && typeof populates === 'string') {
          if (!IsJsonString(populates))
            return resolve({
              error: true,
              message: 'Request params populates invalid',
              status: 400,
            })

          populates = JSON.parse(populates)
        } else {
          populates = {
            path: '',
            select: '',
          }
        }

        let info = await PERSONAL__NOTE_COLL.findById(noteID)
          .select(select)
          .populate(populates)

        if (!info) return resolve({ error: true, message: 'cannot_get' })

        return resolve({ error: false, data: info })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name  : Get list
   * Author: Depv
   * Date: 9/4/2022
   */
  getList({
    keyword,
    pin,
    limit = 10,
    lastestID,
    select,
    populates = {},
    userID,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        /**
         * DECALARTION VARIABLE (1)
         */
        let sortBy
        let conditionObj = { members: { $in: [userID] }, trash: 0 }
        let keys = ['createAt__-1', '_id__-1']

        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */

        // POPULATE
        if (populates && typeof populates === 'string') {
          if (!IsJsonString(populates))
            return resolve({
              error: true,
              message: 'Request params populates invalid',
              status: 400,
            })

          populates = JSON.parse(populates)
        } else {
          populates = {
            path: '',
            select: '',
          }
        }
        /**
         * LOGIC STEP (3)
         *  3.1: Convert type + update name (ví dụ: string -> number)
         *  3.2: Operation database
         */
        if (pin) {
          conditionObj.usersPin = { $in: [userID] }
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          let regExpSearch = RegExp(keyword, 'i')
          conditionObj.name = regExpSearch
        }

        let conditionObjOrg = { ...conditionObj }
        // PHÂN TRANG KIỂU MỚI
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await PERSONAL__NOTE_COLL.findById(lastestID)
          if (!infoData)
            return resolve({
              error: true,
              message: "Can't get info lastest",
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

        let infoDataAfterGet = await PERSONAL__NOTE_COLL.find(conditionObj)
          .limit(limit + 1)
          .sort(sortBy)
          .select(select)
          .populate(populates)
          .lean()

        // GET TOTAL RECORD
        if (!infoDataAfterGet)
          return resolve({
            error: true,
            message: "Can't get data",
            status: 403,
          })

        let nextCursor = null
        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await PERSONAL__NOTE_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)

        return resolve({
          error: false,
          data: {
            listRecords: infoDataAfterGet,
            limit: +limit,
            totalRecord,
            totalPage,
            nextCursor,
          },
          status: 200,
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
