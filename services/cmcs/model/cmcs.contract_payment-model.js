'use strict'

const ObjectID = require('mongoose').Types.ObjectId
const BaseModel = require('../../../tools/db/base_model')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ITEM } = require('../../item/helper/item.actions-constant')
const XlsxPopulate = require('xlsx-populate')
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const { uploadFileS3 } = require('../../../tools/s3')

/**
 * import inter-coll, exter-coll
 */
const ITEM__DEPARTMENT_COLL = require('../../item/database/item.department-coll')
const ITEM__CONTRACT_COLL = require('../../item/database/item.contract-coll')
const CMCS__CONTRACT_PAYMENT_COLL = require('../database/cmcs.contract_payment-coll')
const CMCS__CONTRACT_IPC_COLL = require('../database/cmcs.contract_ipc-coll')

const CMCS__CONTRACT_IPC_MODEL = require('./cmcs.contract_ipc-model').MODEL

const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR } = require('../../../tools/keys/index')

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {
  constructor() {
    super(CMCS__CONTRACT_PAYMENT_COLL)
  }
  /**
   * Name: insert contract payment
   * Author: Depv
   */
  insert({
    contractID,
    ipc,
    date,
    name,
    sign,
    description,
    value,
    userID,
    ctx,
  }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        /**
         * BA
         * Bước 1: Cập nhật thông tin vào IPC
         * Bước 2: Cập nhật thông tin vào Hợp đồng
         * Bước 3: Cập nhật thông tin vào Dự án => Nếu là dòng tiền của hợp đồng mua vào
         */
        const infoContract = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_GET_INFO_AND_GET_LIST}`,
          {
            contractID,
          }
        )

        if (infoContract.error)
          return resolve({
            error: true,
            message: 'Hợp đồng không hợp lệ',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        const {
          outin,
          real,
          field,
          dependentUnit,
          personInCharge,
          chair,
          buyerInfo,
          sellerInfo,
          company,
          project,
        } = infoContract.data

        let infoIPC = await CMCS__CONTRACT_IPC_COLL.findById(ipc)
        if (!infoIPC)
          return resolve({
            error: true,
            message: 'IPC không hợp lệ',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let dataInsert = {
          userCreate: userID,
          type: infoIPC.type,
          outin,
          real,
          field,
          dependentUnit,
          personInCharge,
          chair,
          buyerInfo,
          sellerInfo,
          company,
          project,
          contract: contractID,
        }

        if (ipc) {
          dataInsert.ipc = ipc
        }

        if (date) {
          dataInsert.date = date
        }

        if (name) {
          dataInsert.name = name
        }

        if (sign) {
          dataInsert.sign = sign
        }

        if (description) {
          dataInsert.description = description
        }

        if (!isNaN(value)) {
          dataInsert.value = value
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({
            error: true,
            message: 'Thêm thất bại',
            keyError: KEY_ERROR.INSERT_FAILED,
          })

        /**
         * CẬP NHẬT CHO PHẦN IPC
         */
        await CMCS__CONTRACT_IPC_MODEL.updateValue({
          option: 3,
          ipcID: ipc,
          userID,
        })

        /**
         * CẬP NHẬT CHO PHẦN HỢP ĐỒNG
         */
        await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_UPDATE_VALUE}`,
          {
            option: 2,
            contractID,
            userID,
          }
        )

        /**
         * CẬP NHẬT CHO PHẦN DỰ ÁN
         */
        let infoProject = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE_VALUE}`,
          {
            option: 2,
            projectID: `${project}`,
            userID,
          }
        )
        // console.log(infoProject)

        return resolve({
          error: false,
          data: infoAfterInsert,
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
   * Name: update contract payment
   * Author: Depv
   */
  update({
    contractPaymentID,
    ipc,
    date,
    name,
    sign,
    description,
    value,
    userID,
    ctx,
  }) {
    // console.log({ contractPaymentID, ipc, date, name, sign, description, value, userID })
    return new Promise(async (resolve) => {
      try {
        /**
         * BA
         * Bước 1: Cập nhật thông tin vào IPC
         * Bước 2: Cập nhật thông tin vào Hợp đồng
         * Bước 3: Cập nhật thông tin vào dự án => Nếu là dòng tiền của hợp đồng mua vào
         */

        /**
         * DECALARTION VARIABLE (1)
         */
        let dataUpdate = { userUpdate: userID, modifyAt: Date.now() }
        if (!checkObjectIDs(contractPaymentID))
          return resolve({
            error: true,
            message: 'contractPaymentID không hợp lệ',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        let infoPayment =
          await CMCS__CONTRACT_PAYMENT_COLL.findById(contractPaymentID)
        if (!infoPayment)
          return resolve({
            error: true,
            message: 'Payment không hợp lệ',
            keyError: KEY_ERROR.PARAMS_INVALID,
          })

        console.log(
          '===============Thông tin kỳ thanh toán=========>>>>>>>>>>>>>>>>>'
        )
        // console.log(infoPayment)

        let IpcIDOld = infoPayment.ipc

        let contractID = infoPayment.contract
        let projectID = infoPayment.project

        let infoIpcNew = await CMCS__CONTRACT_IPC_COLL.findById(ipc)

        // Cập nhật phân loại Tạm ứng/Thanh toán
        dataUpdate.type = Number(infoIpcNew.type)

        if (date) {
          dataUpdate.date = date
        }

        if (name) {
          dataUpdate.name = name
        }

        if (sign) {
          dataUpdate.sign = sign
        }

        if (description) {
          dataUpdate.description = description
        }

        // Cập nhật giá trị cho IPC, Hợp đồng và Dự án
        if (!isNaN(value)) {
          dataUpdate.value = value
        }

        if (ipc) {
          dataUpdate.ipc = ipc
        }

        let infoAfterUpdate =
          await CMCS__CONTRACT_PAYMENT_COLL.findByIdAndUpdate(
            contractPaymentID,
            dataUpdate,
            { new: true }
          )

        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
            keyError: KEY_ERROR.UPDATE_FAILED,
          })

        console.log({ IpcIDOld, IpcIDNew: ipc })

        /**
         * CẬP NHẬT CHO PHẦN IPC
         * - Cập nhật IPC mới
         * - Cập nhật IPC cũ
         */
        // Cập nhật IPC cũ
        await CMCS__CONTRACT_IPC_MODEL.updateValue({
          option: 3,
          ipcID: IpcIDOld,
          userID,
        })

        // Cập nhật IPC mới
        await CMCS__CONTRACT_IPC_MODEL.updateValue({
          option: 3,
          ipcID: ipc,
          userID,
        })

        /**
         * CẬP NHẬT CHO PHẦN HỢP ĐỒNG
         */
        let infoContract = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.CONTRACT_UPDATE_VALUE}`,
          {
            option: 2,
            contractID: `${contractID}`,
            userID,
          }
        )
        // console.log(infoContract)

        /**
         * CẬP NHẬT CHO PHẦN DỰ ÁN
         */
        let infoProject = await ctx.call(
          `${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_UPDATE_VALUE}`,
          {
            option: 2,
            projectID: `${projectID}`,
            userID,
          }
        )
        // console.log(infoProject)

        return resolve({
          error: false,
          data: infoAfterUpdate,
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
   * Name: Remove contract payment
   * Author: Depv
   */

  /**
   * Name: get info contract payment
   * Author: Depv
   */
  getInfo({ contractPaymentID, select, populates }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(contractPaymentID))
          return resolve({ error: true, message: 'param_invalid' })

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

        let infoContractIPC = await CMCS__CONTRACT_PAYMENT_COLL.findById(
          contractPaymentID
        )
          .select(select)
          .populate(populates)

        if (!infoContractIPC)
          return resolve({ error: true, message: 'cannot_get' })

        return resolve({ error: false, data: infoContractIPC })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name  : Danh sách contract payment
   * Author: Depv
   */
  getList({
    contractID,
    keyword,
    limit = 20,
    lastestID,
    select,
    populates = {},
  }) {
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        let sortBy
        let conditionObj = {}
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

        if (contractID && checkObjectIDs(contractID)) {
          conditionObj.contract = contractID
        }

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          let regExpSearch = RegExp(keyword, 'i')
          conditionObj.name = regExpSearch
        }

        let conditionObjOrg = { ...conditionObj }
        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await CMCS__CONTRACT_PAYMENT_COLL.findById(lastestID)
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

        let infoDataAfterGet = await CMCS__CONTRACT_PAYMENT_COLL.find(
          conditionObj
        )
          .limit(limit + 1)
          .sort(sortBy)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoDataAfterGet)
          return resolve({ error: true, message: "Can't get data" })

        let nextCursor = null
        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord =
          await CMCS__CONTRACT_PAYMENT_COLL.count(conditionObjOrg)
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
   * Name: Danh sách theo tháng trong năm
   * Author: Hiepnh
   * Date: 05/04/2022
   */
  getListByMonth({
    userID,
    companyID,
    projectID,
    contractID,
    month,
    year,
    type,
    outin,
    real,
    field,
    dependentUnit,
    personInCharge,
    chair,
    buyerInfo,
    sellerInfo,
    keyword,
    limit = 20,
    lastestID,
    select,
    populates = {},
  }) {
    return new Promise(async (resolve) => {
      try {
        if (limit > 20) {
          limit = 20
        } else {
          limit = +limit
        }

        let sortBy
        let conditionObj = {}
        let keys = ['createAt__-1', '_id__-1']

        // Điều kiện để Aggregate
        let conditionObjAgg = {},
          conditionObjYear = {}

        if (month && Number(month) > 0) {
          conditionObjYear.month = Number(month)
          conditionObjYear.year = Number(year)
        } else {
          conditionObjYear.year = Number(year)
        }

        if (type && Number(type) > 0) {
          conditionObjAgg.type = Number(type)
        }

        if (outin && Number(outin) > 0) {
          conditionObjAgg.outin = Number(outin)
        }

        if (real && Number(real) > 0) {
          conditionObjAgg.real = Number(real)
        }

        if (field && checkObjectIDs(field)) {
          conditionObjAgg.field = ObjectID(field)
        }

        if (dependentUnit && checkObjectIDs(dependentUnit)) {
          conditionObjAgg.dependentUnit = ObjectID(dependentUnit)
        }

        if (chair && checkObjectIDs(chair)) {
          conditionObjAgg.chair = ObjectID(chair)
        }

        if (personInCharge && checkObjectIDs(personInCharge)) {
          conditionObjAgg.personInCharge = ObjectID(personInCharge)
        }

        if (buyerInfo && checkObjectIDs(buyerInfo)) {
          conditionObjAgg.buyerInfo = ObjectID(buyerInfo)
        }

        if (sellerInfo && checkObjectIDs(sellerInfo)) {
          conditionObjAgg.sellerInfo = ObjectID(sellerInfo)
        }

        if (contractID && checkObjectIDs(contractID)) {
          conditionObjAgg.contract = ObjectID(contractID)
        } else {
          if (projectID && checkObjectIDs(projectID)) {
            conditionObjAgg.project = ObjectID(projectID)
          } else {
            if (companyID && checkObjectIDs(companyID)) {
              conditionObjAgg.company = ObjectID(companyID)
            }
          }
        }

        console.log(conditionObjAgg)
        console.log(conditionObjYear)

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

        if (keyword) {
          keyword = keyword.split(' ')
          keyword = '.*' + keyword.join('.*') + '.*'
          let regExpSearch = RegExp(keyword, 'i')
          conditionObj.name = regExpSearch
        }

        // Danh sách các Payment trong tháng, năm của công ty
        let listData = await CMCS__CONTRACT_PAYMENT_COLL.aggregate([
          {
            $match: conditionObjAgg,
          },
          {
            $project: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
          },
          {
            $match: conditionObjYear,
          },
          { $sort: { date: 1 } },
        ])

        console.log(conditionObjAgg)
        console.log(listData)

        conditionObj._id = { $in: listData.map((item) => item._id) }

        // Trả về danh sách mẩu tin
        let conditionObjOrg = { ...conditionObj }

        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await CMCS__CONTRACT_PAYMENT_COLL.findById(lastestID)
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

        let infoDataAfterGet = await CMCS__CONTRACT_PAYMENT_COLL.find(
          conditionObj
        )
          .limit(limit + 1)
          .sort(sortBy)
          .select(select)
          .populate(populates)
          .lean()

        if (!infoDataAfterGet)
          return resolve({ error: true, message: "Can't get data" })

        let nextCursor = null
        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord =
          await CMCS__CONTRACT_PAYMENT_COLL.count(conditionObjOrg)
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
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Gom nhóm theo tháng trong năm (BỎ)
   * Author: Hiepnh
   * Date: 04/04/2022
   */
  getAmountByMonth({
    userID,
    companyID,
    projectID,
    contractID,
    outin,
    year,
    option,
  }) {
    return new Promise(async (resolve) => {
      try {
        let conditionObj = {},
          conditionGroup = {},
          conditionObjYear = {}

        if (!isNaN(outin) && Number(outin) >= 0) {
          conditionObj.outin = Number(outin)
        }

        /**
         * Lấy số liệu theo hợp đồng, dự án hoặc theo năm
         */
        if (contractID && checkObjectIDs(contractID)) {
          conditionObj.contract = ObjectID(contractID)
        } else {
          if (projectID && checkObjectIDs(projectID)) {
            conditionObj.project = ObjectID(projectID)
          } else {
            if (companyID && checkObjectIDs(companyID)) {
              conditionObj.company = ObjectID(companyID)
            }
          }
        }

        if (!option) {
          console.log(
            'SỐ LIỆU TIỀN VỀ NĂM NAY===================================='
          )
          conditionGroup = {
            _id: { month: '$month', year: '$year' },
            amount: { $sum: '$amount' },
          }

          if (!isNaN(year) && Number(year) >= 0) {
            conditionObjYear = {
              year: Number(year),
            }
          }
        } else {
          if (option && option == 1) {
            console.log(
              'SỐ LIỆU TIỀN VỀ NĂM NGOÁI===================================='
            )

            conditionGroup = {
              _id: { year: '$year' },
              amount: { $sum: '$amount' },
            }

            let firstDayOfLastYear = `${Number(year - 1)}-01-01T00:00:00.000Z`
            let lastDayOfLastYear

            let thisYear = moment(new Date()).toDate().getFullYear()

            if (Number(year) == Number(thisYear)) {
              var today = new Date()
              //Sunday 4 September 2016 - Week 36
              // console.log({today})

              lastDayOfLastYear = new moment(today)
                .subtract(12, 'months')
                .toDate()
              //Friday 4 September 2015 - Week 37
              // console.log({lastDayOfLastYear})
            } else {
              lastDayOfLastYear = `${Number(year - 1)}-12-31T00:00:00.000Z`
            }

            conditionObj.date = {
              // $gte: moment(firstDayOfLastYear).toDate(),
              // $lt: moment(lastDayOfLastYear).toDate(),
              $gte: new Date(firstDayOfLastYear),
              $lte: new Date(lastDayOfLastYear),
            }
            console.log(conditionObj)
          }
        }

        let listData = await CMCS__CONTRACT_PAYMENT_COLL.aggregate([
          {
            $match: conditionObj,
          },
          {
            $project: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              amount: { $sum: ['$value'] },
            },
          },
          {
            $match: conditionObjYear,
          },
          {
            $group: conditionGroup,
          },
          {
            $sort: {
              '_id.year': 1,
              '_id.month': 1,
            },
          },
        ])

        return resolve({ error: false, data: listData })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Gom nhóm theo đối tượng
   * Author: Hiepnh
   * Date: 16/04/2022
   */
  getAmountByObject({
    userID,
    outin,
    companyID,
    projectID,
    contractID,
    ipcID,
  }) {
    // console.log('=================PAYMENT:getAmountByObject==>>>>>>>>>>>')
    // console.log({ userID, outin, companyID, projectID, contractID, ipcID })
    return new Promise(async (resolve) => {
      try {
        /**
         * BA
         * Phục vụ cập nhật thông tin cho hợp đồng, dự án, công ty
         */

        let value1 = 0
        let value2 = 0

        let conditionObj1 = { type: 1 },
          conditionObj2 = { type: 2 }

        // if(!isNaN(outin) && Number(outin) >= 0){
        //     conditionObj1.outin = outin
        //     conditionObj2.outin = outin
        // }

        if (ipcID && checkObjectIDs(ipcID)) {
          conditionObj1.ipc = ObjectID(ipcID)
          conditionObj2.ipc = ObjectID(ipcID)
        } else {
          if (contractID && checkObjectIDs(contractID)) {
            conditionObj1.contract = ObjectID(contractID)
            conditionObj2.contract = ObjectID(contractID)
          } else {
            if (projectID && checkObjectIDs(projectID)) {
              conditionObj1.project = ObjectID(projectID)
              conditionObj2.project = ObjectID(projectID)
            } else {
              if (companyID && checkObjectIDs(companyID)) {
                conditionObj1.company = ObjectID(companyID)
                conditionObj2.company = ObjectID(companyID)
              }
            }
          }
        }

        // Tạm ứng
        let listData1 = await CMCS__CONTRACT_PAYMENT_COLL.aggregate([
          {
            $match: conditionObj1,
          },
          {
            $group: {
              _id: {},
              value: { $sum: '$value' },
            },
          },
        ])
        console.log(listData1)

        // Thanh toán
        let listData2 = await CMCS__CONTRACT_PAYMENT_COLL.aggregate([
          {
            $match: conditionObj2,
          },
          {
            $group: {
              _id: {},
              value: { $sum: '$value' },
            },
          },
        ])
        console.log(listData2)

        if (listData1 && listData1.length) {
          value1 = Number(listData1[0].value)
        }

        if (listData2 && listData2.length) {
          value2 = Number(listData2[0].value)
        }

        return resolve({ error: false, data: { value1, value2 } })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Gom nhóm theo thuộc tính
   * Author: Hiepnh
   * Date: 17/04/2022
   */
  getAmountByProperty({
    userID,
    type,
    outin,
    real,
    companyID,
    projectID,
    contractID,
    year,
    optionTime,
    optionProperty,
    ctx,
  }) {
    // console.log({ userID, type, outin, real, companyID, projectID, contractID, year, optionTime, optionProperty })
    return new Promise(async (resolve) => {
      try {
        /**
         * BA
         * optionTime: Báo cáo theo trục thời gian
         * optionProperty: Báo cáo theo tính chất/phân loại
         * 1-Báo cáo theo phân loại: Giá trị ký, Sản lượng, Doanh thu, Tiền về
         * 2.1-Tính tổng Tất cả-Theo năm (1)/Theo tháng (2)
         * 2.2-Tính tổng theo thuộc tính: Lĩnh vực (1)/Người mua (2)/Người bán (3)/Phụ trách (4)/Chủ trì (5)/Đơn vị (6)
         * 2.3-Tính tổng kết hợp
         */
        let conditionObj = {},
          conditionGroup = {},
          conditionObjYear = {},
          conditionPopulate = {},
          sortBy = { amount: 1 }

        if (type && Number(type) > 0) {
          conditionObj.type = Number(type)
        }

        if (outin && Number(outin) > 0) {
          conditionObj.outin = Number(outin)
        }

        if (real && Number(real) > 0) {
          conditionObj.real = Number(real)
        }

        if (contractID && checkObjectIDs(contractID)) {
          conditionObj.contract = ObjectID(contractID)
        } else {
          if (projectID && checkObjectIDs(projectID)) {
            conditionObj.project = ObjectID(projectID)
          } else {
            if (companyID && checkObjectIDs(companyID)) {
              conditionObj.company = ObjectID(companyID)
            }
          }
        }

        // console.log(conditionObj)

        // TÍNH TỔNG THEO TẤT CẢ/THEO NĂM
        if (Number(optionTime) === 1) {
          conditionGroup = {
            _id: {},
            amount: { $sum: '$amount' },
          }

          if (!isNaN(year) && Number(year) >= 0) {
            conditionObjYear = {
              year: Number(year),
            }
          } else {
            conditionGroup = {
              _id: { year: '$year' },
              amount: { $sum: '$amount' },
            }
          }

          // Theo Lĩnh vực
          if (Number(optionProperty) === 1) {
            conditionGroup = {
              _id: { field: '$field' },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.field',
              select: '_id name sign',
              model: 'doctype',
            }

            sortBy = {
              '_id.field': 1,
            }
          }

          // Theo Người mua
          if (Number(optionProperty) === 2) {
            conditionGroup = {
              _id: { buyerInfo: '$buyerInfo' },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.buyerInfo',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.buyerInfo': 1,
            }
          }

          // Theo Người bán
          if (Number(optionProperty) === 3) {
            conditionGroup = {
              _id: { sellerInfo: '$sellerInfo' },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.sellerInfo',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.sellerInfo': 1,
            }
          }

          // Theo Phụ trách
          if (Number(optionProperty) === 4) {
            conditionGroup = {
              _id: { personInCharge: '$personInCharge' },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.personInCharge',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.personInCharge': 1,
            }
          }

          // Theo Chủ trì
          if (Number(optionProperty) === 5) {
            conditionGroup = {
              _id: { chair: '$chair' },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.chair',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.chair': 1,
            }
          }

          // Theo Đơn vị
          if (Number(optionProperty) === 6) {
            conditionGroup = {
              _id: { dependentUnit: '$dependentUnit' },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.dependentUnit',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.dependentUnit': 1,
            }
          }
        }

        // TÍNH TỔNG THEO THÁNG
        if (Number(optionTime) === 2) {
          conditionGroup = {
            _id: { month: '$month', year: '$year' },
            amount: { $sum: '$amount' },
          }

          // Theo tháng trong một năm cụ thể
          if (!isNaN(year) && Number(year) >= 0) {
            conditionObjYear = {
              year: Number(year),
            }
          }

          // Theo Lĩnh vực
          if (Number(optionProperty) === 1) {
            conditionGroup = {
              _id: {
                field: '$field',
                month: '$month',
                year: '$year',
              },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.field',
              select: '_id name sign',
              model: 'doctype',
            }

            sortBy = {
              '_id.field': 1,
            }
          }

          // Theo Người mua
          if (Number(optionProperty) === 2) {
            conditionGroup = {
              _id: {
                buyerInfo: '$buyerInfo',
                month: '$month',
                year: '$year',
              },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.buyerInfo',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.buyerInfo': 1,
            }
          }

          // Theo Người bán
          if (Number(optionProperty) === 3) {
            conditionGroup = {
              _id: {
                sellerInfo: '$sellerInfo',
                month: '$month',
                year: '$year',
              },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.sellerInfo',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.sellerInfo': 1,
            }
          }

          // Theo Phụ trách
          if (Number(optionProperty) === 4) {
            conditionGroup = {
              _id: {
                personInCharge: '$personInCharge',
                month: '$month',
                year: '$year',
              },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.personInCharge',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.personInCharge': 1,
            }
          }

          // Theo Chủ trì
          if (Number(optionProperty) === 5) {
            conditionGroup = {
              _id: {
                chair: '$chair',
                month: '$month',
                year: '$year',
              },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.chair',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.chair': 1,
            }
          }

          // Theo Đơn vị
          if (Number(optionProperty) === 6) {
            conditionGroup = {
              _id: { dependentUnit: '$dependentUnit' },
              amount: { $sum: '$amount' },
            }

            conditionPopulate = {
              path: '_id.dependentUnit',
              select: '_id name sign',
              model: 'contact',
            }

            sortBy = {
              '_id.dependentUnit': 1,
            }
          }
        }

        // console.log(conditionObj)
        // console.log(conditionObjYear)
        // console.log(conditionGroup)

        let listData = await CMCS__CONTRACT_PAYMENT_COLL.aggregate([
          {
            $match: conditionObj,
          },
          {
            $project: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              amount: { $sum: ['$value'] },
              type: 1,
              outin: 1,
              real: 1,
              field: 1,
              buyerInfo: 1,
              chair: 1,
              personInCharge: 1,
              dependentUnit: 1,
            },
          },
          {
            $match: conditionObjYear,
          },
          {
            $group: conditionGroup,
          },
          {
            $sort: sortBy,
          },
        ])

        if (!isNaN(optionProperty) && Number(optionProperty) > 0) {
          await CMCS__CONTRACT_PAYMENT_COLL.populate(
            listData,
            conditionPopulate
          )
        }

        return resolve({ error: false, data: listData })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }
}

exports.MODEL = new Model()
