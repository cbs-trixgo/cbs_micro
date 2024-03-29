'use strict'
const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const ObjectID = require('mongoose').Types.ObjectId

/**
 * import inter-coll, exter-coll
 */
const AUTH__APP_ROLE_MENU_COLL = require('../database/permission/auth.app_role_menu-coll')
const AUTH__APP_ROLE_COLL = require('../database/permission/auth.app_role-coll')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys')

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
  constructor() {
    super(AUTH__APP_ROLE_MENU_COLL)
  }

  /**
   * Name: insert app role menu
   * Author: Depv
   * Code:
   */
  insert({ role, menu, read, create, update, deleteIn, userID }) {
    return new Promise(async (resolve) => {
      try {
        let checkExist = await AUTH__APP_ROLE_MENU_COLL.findOne({
          role,
          menu,
        })

        if (!checkExist) {
          let infoAppRole = await AUTH__APP_ROLE_COLL.findById(role)
          let { company, app } = infoAppRole

          let infoRoleMenuInserted = await this.insertData({
            company,
            app,
            role,
            menu,
            read,
            create,
            update,
            delete: deleteIn,
            userCreate: userID,
            userUpdate: userID,
          })

          if (!infoRoleMenuInserted)
            return resolve({
              error: true,
              message: 'cannot_insert_role_menu',
            })
          return resolve({ error: false, data: infoRoleMenuInserted })
        } else {
          let infoRoleMenuUpdated =
            await AUTH__APP_ROLE_MENU_COLL.findOneAndUpdate(
              {
                role,
                menu,
              },
              {
                read,
                create,
                update,
                delete: deleteIn,
                userUpdate: userID,
              },
              { new: true }
            )
          if (!infoRoleMenuUpdated)
            return resolve({
              error: true,
              message: 'cannot_update_role_menu',
            })

          return resolve({ error: false, data: infoRoleMenuUpdated })
        }
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
   * Name: Danh sách app_role_menu của roleID phục vụ cho màn hình Admin phân quyền Nhóm chức năng
   * Màn hình: S2-1.2 (/pcm/admin/2)
   * Author: Depv
   * Code  :
   */
  getList({
    company,
    app,
    role,
    limit = 20,
    lastestID,
    select,
    populates = {},
  }) {
    // console.log({ company, app, role, limit, lastestID, select, populates })
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        let conditionObj = {
          app: app,
          company: company,
          role: role,
        }

        let sortBy
        let keys = ['createAt__-1', '_id__-1']

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
        let conditionObjOrg = { ...conditionObj }

        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await AUTH__APP_ROLE_MENU_COLL.findById(lastestID)
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

        let infoDataAfterGet = await AUTH__APP_ROLE_MENU_COLL.find(conditionObj)
          .select(select)
          .limit(+limit + 1)
          .populate(populates)
          .sort(sortBy)
          .lean()

        if (!infoDataAfterGet)
          return resolve({
            error: true,
            message: 'Lấy danh sách thất bại',
            keyError: KEY_ERROR.GET_LIST_FAILED,
            status: 403,
          })

        let nextCursor = null
        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord = await AUTH__APP_ROLE_MENU_COLL.count(conditionObjOrg)
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

  /**
   * Danh sách cây menu mà USER có quyền truy cập thông qua APP_ROLE và APP_ROLE_MENU của 1 ứng dụng
   * Hiepnh (07/2/2019)
   * [x] Đã check ok
   */
  getPermissionToAccessListMenuOfApp({ type = 1, user, app, company }) {
    return new Promise(async (resolve) => {
      try {
        let listRoles = await AUTH__APP_ROLE_COLL.find({
          type: type,
          company: company,
          app: app,
          members: { $in: [user] },
        }).select('_id name')

        let listData = await AUTH__APP_ROLE_MENU_COLL.aggregate([
          {
            $match: {
              role: {
                $in: listRoles.map((item) => item._id),
              },
            },
          },
          {
            $group: {
              _id: { menu: '$menu' },
              read: { $sum: '$read' },
              create: { $sum: '$create' },
              update: { $sum: '$update' },
              delete: { $sum: '$delete' },
            },
          },
        ])
        if (!listData)
          return resolve({
            error: true,
            message: 'cannot_get_list_data',
            keyError: KEY_ERROR.GET_LIST_FAILED,
          })

        return resolve({ error: false, data: listData })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Lấy quyền truy cập của user vào 1 màn hình chức năng (menu)
   * Hiepnh (07/2/2019)
   * [x] Đã check ok
   */
  getPermissionToAccessOneMenuOfApp({ type = 1, menu, user, app, company }) {
    // console.log({ type, menu, user, app, company })
    return new Promise(async (resolve) => {
      try {
        let listRoles = await AUTH__APP_ROLE_COLL.find({
          type: type,
          company: company,
          app: app,
          members: { $in: [user] },
        }).select('_id name')

        let listData = await AUTH__APP_ROLE_MENU_COLL.aggregate([
          {
            $match: {
              role: {
                $in: listRoles.map((item) => item._id),
              },
              menu: ObjectID(menu),
            },
          },
          {
            $group: {
              _id: { menu: '$menu' },
              read: { $sum: '$read' },
              create: { $sum: '$create' },
              update: { $sum: '$update' },
              delete: { $sum: '$delete' },
            },
          },
        ])

        if (!listData || (listData && !listData.length))
          return resolve({
            error: true,
            message: 'permission_denied',
            keyError: KEY_ERROR.PERMISSION_DENIED,
          })

        return resolve({ error: false, data: listData && listData[0] })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }
}

exports.MODEL = new Model()
