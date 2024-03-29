'use strict'

/**
 * EXTERNAL PACKAGE
 */
const stringUtils = require('../../../tools/utils/string_utils')
const ObjectID = require('mongoose').Types.ObjectId
const BaseModel = require('../../../tools/db/base_model')
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const moment = require('moment')
const XlsxPopulate = require('xlsx-populate')
const path = require('path')
const fs = require('fs')
const { uploadFileS3 } = require('../../../tools/s3')

/**
 * CONSTANTS
 */

/**
 * TOOLS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')

/**
 * COLLECTIONS
 */
const AREA_COLL = require('../../item/database/item.area-coll')
const COMPANY_COLL = require('../../auth/database/auth.company-coll')
const DATAHUB_PROJECT_COLL = require('../database/datahub_project-coll')
const DATAHUB_PACKAGE_COLL = require('../database/datahub_package-coll')
class Model extends BaseModel {
  constructor() {
    super(DATAHUB_PROJECT_COLL)
  }

  /**
   * Name: insert datahub project
   * Author: Depv
   * Code:
   */
  insert({
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
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!name || !checkObjectIDs(area3))
          return resolve({
            error: true,
            message: 'name|area3 không hợp lệ',
            keyError: 'name_invalid',
          })

        let infoArea3 = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.AREA_GET_INFO_AND_GET_LIST}`,
          {
            areaID: area3,
            populates: JSON.stringify({
              path: 'parent',
              select: 'name sign parent level',
              populate: {
                path: 'parent',
                select: 'name sign parent level',
              },
            }),
          }
        )

        if (infoArea3?.data?.level != 3)
          return resolve({
            error: true,
            message:
              'Khu vực chọn phải là phường/xã, không được chọn quận/huyện, tỉnh/thành phố',
            keyError: 'name_invalid',
          })

        let dataInsert = {
          name,
          area3,
          userCreate: userID,
          userUpdate: userID,
        }

        let area2 = infoArea3?.data?.parent?._id
        let area1 = infoArea3?.data?.parent?.parent?._id
        if (checkObjectIDs(area2)) {
          dataInsert.area2 = area2
        }
        if (checkObjectIDs(area1)) {
          dataInsert.area1 = area1
        }

        if (client) {
          dataInsert.client = client
        }

        if (address) {
          dataInsert.address = address
        }

        if (location) {
          dataInsert.location = location
        }

        if (sign) {
          dataInsert.sign = sign
        }

        if (note) {
          dataInsert.note = note
        }

        if (projectType) {
          dataInsert.projectType = projectType
        }

        if (buildingType) {
          dataInsert.buildingType = buildingType
        }

        if (buildingGrade) {
          dataInsert.buildingGrade = buildingGrade
        }

        if (basementNumber) {
          dataInsert.basementNumber = basementNumber
        }

        if (basementArea) {
          dataInsert.basementArea = basementArea
        }

        if (floorNumber) {
          dataInsert.floorNumber = floorNumber
        }

        if (floorArea) {
          dataInsert.floorArea = floorArea
        }

        if (status) {
          dataInsert.status = status
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: 'Tạo mới thất bại',
            keyError: 'cannot_insert',
          })

        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: update datahub project
   * Author: Depv
   * Code:
   */
  update({
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
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!name || !checkObjectIDs(area3))
          return resolve({
            error: true,
            message: 'name|area3 không hợp lệ',
            keyError: 'name_invalid',
          })

        let infoArea3 = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.AREA_GET_INFO_AND_GET_LIST}`,
          {
            areaID: area3,
            populates: JSON.stringify({
              path: 'parent',
              select: 'name sign parent level',
              populate: {
                path: 'parent',
                select: 'name sign parent level',
              },
            }),
          }
        )

        // console.log(infoArea3?.data)
        // console.log(infoArea3?.data?.level)

        if (infoArea3?.data?.level != 3)
          return resolve({
            error: true,
            message:
              'Khu vực chọn phải là phường/xã, không được chọn quận/huyện, tỉnh/thành phố',
            keyError: 'name_invalid',
          })

        let dataUpdate = {
          name,
          area3,
          userUpdate: userID,
          modifyAt: Date.now(),
        }
        let objectUpdatePackage = {}

        dataUpdate.area3 = area3
        objectUpdatePackage.area3 = area3

        let area2 = infoArea3?.data?.parent?._id
        let area1 = infoArea3?.data?.parent?.parent?._id

        if (checkObjectIDs(area2)) {
          dataUpdate.area2 = area2
          objectUpdatePackage.area2 = area2
        }
        if (checkObjectIDs(area1)) {
          dataUpdate.area1 = area1
          objectUpdatePackage.area1 = area1
        }

        if (client) {
          dataUpdate.client = client
        }

        if (address) {
          dataUpdate.address = address
        }

        if (location) {
          dataUpdate.location = location
        }

        if (sign) {
          dataUpdate.sign = sign
        }

        if (note) {
          dataUpdate.note = note
        }

        if (projectType) {
          dataUpdate.projectType = projectType
          objectUpdatePackage.projectType = projectType
        }

        if (buildingType) {
          dataUpdate.buildingType = buildingType
          objectUpdatePackage.buildingType = buildingType
        }

        if (buildingGrade) {
          dataUpdate.buildingGrade = buildingGrade
          objectUpdatePackage.buildingGrade = buildingGrade
        }

        if (basementNumber) {
          dataUpdate.basementNumber = basementNumber
          objectUpdatePackage.basementNumber = basementNumber
        }

        if (basementArea) {
          dataUpdate.basementArea = basementArea
          objectUpdatePackage.basementArea = basementArea
        }

        if (floorNumber) {
          dataUpdate.floorNumber = floorNumber
          objectUpdatePackage.floorNumber = floorNumber
        }

        if (floorArea) {
          dataUpdate.floorArea = floorArea
          objectUpdatePackage.floorArea = floorArea
        }

        if (status) {
          dataUpdate.status = status
        }

        let infoAfterUpdate = await DATAHUB_PROJECT_COLL.findByIdAndUpdate(
          datahubProjectID,
          dataUpdate,
          { new: true }
        )
        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
            keyError: 'cannot_update',
          })

        /**
         * CẬP NHẬT KHU VỰC CHO CÁC GÓI THẦU CỦA DỰ ÁN
         */
        await DATAHUB_PACKAGE_COLL.updateMany(
          { project: datahubProjectID },
          { $set: objectUpdatePackage }
        )

        return resolve({ error: false, data: infoAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Remove datahub project
   * Author: Depv
   * Code:
   */
  remove({ datahubProjectID }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(datahubProjectID))
          return resolve({
            error: true,
            message: 'Mã datahubProjectID không hợp lệ',
            keyError: 'datahubProjectID_invalid',
            status: 400,
          })

        let infoAterRemove =
          await DATAHUB_PROJECT_COLL.findByIdAndDelete(datahubProjectID)
        if (!infoAterRemove)
          return resolve({
            error: true,
            message: 'Xoá thất bại',
            keyError: 'remove_failed',
            status: 403,
          })

        return resolve({
          error: false,
          data: infoAterRemove,
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
   * Name: get info datahub
   * Author: Depv
   * Code:
   */
  getInfo({ datahubProjectID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        /**
         * DECALARTION VARIABLE (1)
         */
        /**
         * VALIDATION STEP (2)
         *  - Kiểm tra valid từ các input
         *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
         */
        if (!checkObjectIDs(datahubProjectID))
          return resolve({
            error: true,
            message: 'Request params datahubProjectID invalid',
            status: 400,
          })

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
        /**
         * LOGIC STEP (3)
         * 3.1: Convert type + update name (ví dụ: string -> number)
         * 3.2: Operation database
         */
        let infoAterGet = await DATAHUB_PROJECT_COLL.findById(datahubProjectID)
          .select(select)
          .populate(populates)
        if (!infoAterGet)
          return resolve({
            error: true,
            message: "can't_get_info",
            status: 403,
          })

        return resolve({ error: false, data: infoAterGet, status: 200 })
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
   * Dev: HiepNH
   * Func: Lấy danh sách gói thầu
   * Date: 26/10/2021
   */
  getList({ userID, lastestID, keyword, limit = 10, select, populates = {} }) {
    return new Promise(async (resolve) => {
      try {
        let conditionObj = {}
        let sortBy
        let keys = ['createAt__-1', '_id__-1']

        if (limit > 20) {
          limit = 20
        }

        if (!checkObjectIDs(userID))
          return resolve({
            error: true,
            message: 'Request params userID invalid',
            status: 400,
          })

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
        // SEARCH TEXT
        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          let regSearch = new RegExp(keyword, 'i')
          conditionObj.name = regSearch
        }

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await DATAHUB_PROJECT_COLL.findById(lastestID)
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

        let listPackages = await DATAHUB_PROJECT_COLL.find(conditionObj)
          .limit(limit + 1)
          .select(select)
          .populate(populates)
          .sort(sortBy)
          .lean()

        // GET TOTAL RECORD
        let totalRecord = await DATAHUB_PROJECT_COLL.count(conditionObjOrg)
        let totalPage = Math.ceil(totalRecord / limit)
        let nextCursor = null

        if (listPackages && listPackages.length) {
          if (listPackages.length > limit) {
            nextCursor = listPackages[limit - 1]._id
            listPackages.length = limit
          }
        }

        return resolve({
          error: false,
          status: 200,
          data: {
            listRecords: listPackages,
            limit: +limit,
            totalRecord,
            totalPage,
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

  /**
   * Dev: HiepNH
   * Func: Download template import excel
   * Date: 18/09/2022
   */
  downloadTemplateImportExcel({ userID }) {
    return new Promise(async (resolve) => {
      try {
        let listArea = await AREA_COLL.find({})
          .populate({
            path: 'parent',
            populate: {
              path: 'parent',
            },
          })
          .sort({ _id: 1 })
        let listCompany = await COMPANY_COLL.find({})
          .populate({
            path: 'area',
            select: 'name sign',
            populate: {
              path: 'parent',
              select: 'name sign',
              populate: {
                path: 'parent',
                select: 'name sign',
              },
            },
          })
          .sort({ _id: 1 })
        let listProject = await DATAHUB_PROJECT_COLL.find({})
          .populate({
            path: 'client area3',
            select: 'name sign',
            populate: {
              path: 'parent',
              populate: {
                path: 'parent',
              },
            },
          })
          .sort({ _id: 1 })

        // Modify the workbook.
        XlsxPopulate.fromFileAsync(
          path.resolve(
            __dirname,
            '../../../files/templates/excels/datahub_tem_1_list_project.xlsx'
          )
        ).then(async (workbook) => {
          var i = 3
          listArea?.forEach((item, index) => {
            let nameFull = ''
            if (item.parent) {
              nameFull = `${item.name}, ${item.parent.name}`

              if (item.parent.parent) {
                nameFull = `${item.name}, ${item.parent.name}, ${item.parent.parent.name}`
              }
            }
            workbook.sheet('3-KhuVuc').row(i).cell(2).value(`${item._id}`)
            workbook.sheet('3-KhuVuc').row(i).cell(3).value(nameFull)
            workbook.sheet('3-KhuVuc').row(i).cell(4).value(`${item.sign}`)
            workbook.sheet('3-KhuVuc').row(i).cell(5).value(Number(1))
            i++
          })

          var i = 3
          listCompany.forEach((item, index) => {
            // console.log(item.area)
            // console.log(item.birthDay)
            let nameFull = ''
            if (item.area && item.area.parent) {
              nameFull = `${item.area.name}, ${item.area.parent.name}`

              if (item.area.parent.parent) {
                nameFull = `${item.area.name}, ${item.area.parent.name}, ${item.area.parent.parent.name}`
              }
            }
            workbook.sheet('2-ChuDauTu').row(i).cell(2).value(`${item._id}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(3).value(`${item.name}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(4).value(`${item.sign}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(5).value(`${item.address}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(6).value(`${item.taxid}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(7).value(`${item.phone}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(8).value(`${item.email}`)
            workbook
              .sheet('2-ChuDauTu')
              .row(i)
              .cell(9)
              .value(`${item.description}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(10).value(item.birthDay)
            workbook.sheet('2-ChuDauTu').row(i).cell(11).value(`${item.scale}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(12).value(nameFull)
            workbook
              .sheet('2-ChuDauTu')
              .row(i)
              .cell(13)
              .value(`${item.website}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(14).value(`${item.show}`)
            workbook.sheet('2-ChuDauTu').row(i).cell(15).value(Number(1))
            i++
          })

          var i = 3
          listProject.forEach((item, index) => {
            workbook.sheet('1-DuAn').row(i).cell(2).value(`${item._id}`)
            workbook.sheet('1-DuAn').row(i).cell(3).value(`${item.name}`)
            workbook.sheet('1-DuAn').row(i).cell(4).value(`${item.sign}`)
            workbook.sheet('1-DuAn').row(i).cell(5).value(`${item.client.name}`)
            workbook.sheet('1-DuAn').row(i).cell(6).value(`${item.address}`)
            workbook
              .sheet('1-DuAn')
              .row(i)
              .cell(7)
              .value(
                `${item.area3.name}, ${item.area3.parent.name}, ${item.area3.parent.parent.name}`
              )
            workbook.sheet('1-DuAn').row(i).cell(8).value(`${item.location}`)
            workbook.sheet('1-DuAn').row(i).cell(9).value(`${item.note}`)
            workbook
              .sheet('1-DuAn')
              .row(i)
              .cell(10)
              .value(`${item.projectType}`)
            workbook
              .sheet('1-DuAn')
              .row(i)
              .cell(11)
              .value(`${item.buildingType}`)
            workbook
              .sheet('1-DuAn')
              .row(i)
              .cell(12)
              .value(`${item.buildingGrade}`)
            workbook
              .sheet('1-DuAn')
              .row(i)
              .cell(13)
              .value(`${item.basementNumber}`)
            workbook
              .sheet('1-DuAn')
              .row(i)
              .cell(14)
              .value(`${item.basementArea}`)
            workbook
              .sheet('1-DuAn')
              .row(i)
              .cell(15)
              .value(`${item.floorNumber}`)
            workbook.sheet('1-DuAn').row(i).cell(16).value(`${item.floorArea}`)
            workbook.sheet('1-DuAn').row(i).cell(17).value(`${item.status}`)
            workbook.sheet('1-DuAn').row(i).cell(18).value(Number(1))
            i++
          })

          const now = new Date()
          const filePath = '../../../files/temporary_uploads/'
          const fileName = `temp_import_datahub_project_${now.getTime()}.xlsx`
          const pathWriteFile = path.resolve(__dirname, filePath, fileName)

          await workbook.toFileAsync(pathWriteFile)
          const result = await uploadFileS3(pathWriteFile, fileName)
          fs.unlinkSync(pathWriteFile)
          console.log({ result })
          return resolve({
            error: false,
            data: result?.Location,
            status: 200,
          })
        })
      } catch (error) {
        console.log({ error })
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
