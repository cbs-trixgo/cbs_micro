'use strict'

const BaseModel = require('../../../tools/db/base_model')
const ObjectID = require('mongoose').Types.ObjectId

/**
 * DOMAIN AND ACTIONS
 */
// const { CF_DOMAIN_SERVICES } 		            = require('../../gateway/helper/domain.constant');
// const { CF_ACTIONS_ANALYSIS }                   = require('../../analysis/helper/analysis.actions-constant');

/**
 * TOOLS
 */
const {
  RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const {
  checkObjectIDs,
  IsJsonString,
  validateParamsObjectID,
} = require('../../../tools/utils/utils')

/**
 * COLLECTIONS
 */
const TIMESHEET__EXPERT_SALARY_COLL = require('../database/timesheet.expert_salary-coll')
const TIMESHEET__EXPERT_TIMESHEET_COLL = require('../database/timesheet.expert_timesheet-coll')
const AUTH__USER_COLL = require('../../auth/database/auth.user-coll')
const FNB_MISTAKE_COLL = require('../../fnb/database/fnb.mistake-coll')
const ITEM__DEPARTMENT_COLL = require('../../item/database/item.department-coll')
// const AUTH__COMPANY_COLL                = require('../../auth/database/auth.company-coll')

const AUTH__APP_USER = require('../../auth/model/auth.app_users').MODEL

// let dataTF = {
//     appID: "61e049cffdebf77b072d1b14", // TIMESHEET
//     menuID: "623f1ecae998e94feda0cd70", //
//     type: 1,
//     action: 1,
// }

class Model extends BaseModel {
  constructor() {
    super(TIMESHEET__EXPERT_SALARY_COLL)
  }

  /**
   * Name: Insert
   * Author: HiepNH
   * Code: 22/11/2023
   */
  insert({
    userCreate,
    companyID,
    projectID,
    humanID,
    name,
    date,
    type,
    note,
    salary,
    onLeaveSalary,
    reward,
    punishment,
    advance,
    convertFactor,
    paid,
  }) {
    // console.log({ userCreate, companyID, projectID, humanID, name, date, type, note, salary, onLeaveSalary, reward, punishment, advance, convertFactor, paid })
    return new Promise(async (resolve) => {
      try {
        if (!name) {
          return resolve({
            error: true,
            message: 'Name invalid',
            keyError: 'name_invalid',
          })
        }

        let year = new Date().getFullYear()
        let month = new Date().getMonth()
        let checkExists = await TIMESHEET__EXPERT_SALARY_COLL.findOne({
          company: companyID,
          parent: { $exists: false },
          $where: `return this.date.getMonth() === ${Number(month)} && this.date.getFullYear() === ${Number(year)}`,
        })
        if (checkExists)
          return resolve({
            error: true,
            message: `Bảng lương tháng ${month + 1} năm ${year} đã tồn tại - ${checkExists.name}`,
          })

        //__________Khai báo và validate dữ liệu
        let dataInsert = {
          company: companyID,
          userCreate,
          name,
          admins: [userCreate],
          members: [userCreate],
        }

        if (humanID) {
          dataInsert.human = humanID
        }

        if (projectID) {
          dataInsert.project = projectID
        }

        if (date) {
          dataInsert.date = date
        }

        if (type) {
          dataInsert.type = type
        }

        if (convertFactor) {
          dataInsert.convertFactor = Number(convertFactor)
        }

        if (note) {
          dataInsert.note = note
        }

        if (salary) {
          dataInsert.salary = Number(salary)
        }
        if (onLeaveSalary) {
          dataInsert.onLeaveSalary = Number(onLeaveSalary)
        }
        if (reward) {
          dataInsert.reward = Number(reward)
        }
        if (punishment) {
          dataInsert.punishment = Number(punishment)
        }
        if (advance) {
          dataInsert.advance = Number(advance)
        }
        if (paid) {
          dataInsert.paid = Number(paid)
        }

        let infoAfterInsert = await this.insertData(dataInsert)
        if (!infoAfterInsert)
          return resolve({ error: true, message: 'cannot_insert' })

        // Tạo chi tiết lương cho các user đang hoạt động
        let listHuman = await AUTH__USER_COLL.find({
          company: companyID,
          status: 1,
        })
          .select('fullname department position contacts')
          .populate({
            path: 'contacts',
            select: 'company sallaryBasic insuranceFee union share',
          })
        for (const item of listHuman) {
          let insuranceFee = 0,
            union = 0,
            share = 0
          if (item.contacts && item.contacts.length) {
            for (const contact of item.contacts) {
              if (
                contact.company.toString() === companyID.toString() &&
                contact.insuranceFee
              ) {
                insuranceFee =
                  Number(insuranceFee) + Number(contact.insuranceFee)
                union = Number(union) + Number(contact.union)
                share = Number(share) + Number(contact.share)
              }
            }
          }

          let dataInsertDetail = {
            userCreate,
            name: 'Default',
            admins: [userCreate],
            members: [userCreate],
            human: item._id,
            parent: infoAfterInsert._id,
            company: infoAfterInsert.company,
            convertFactor: infoAfterInsert.convertFactor,
            project: item.department,
            position: item.position,
            date: infoAfterInsert.date,
            type: infoAfterInsert.type,
          }

          if (Number(insuranceFee) > 0) {
            dataInsertDetail.insurance = Number(insuranceFee)
          }

          if (Number(union) > 0) {
            dataInsertDetail.union = Number(union)
          }

          if (Number(share) > 0) {
            dataInsertDetail.share = Number(share)
          }

          await this.insertData(dataInsertDetail)
        }

        return resolve({ error: false, data: infoAfterInsert })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Update
   * Author: HiepNH
   * Code: 22/11/2023
   */
  update({
    expertSalaryID,
    admins,
    members,
    userID,
    status,
    projectID,
    humanID,
    name,
    date,
    type,
    note,
    salary,
    onLeaveSalary,
    reward,
    punishment,
    advance,
    convertFactor,
    paid,
    revenueBonus,
    mealAllowance,
    insurance,
    pitax,
    union,
    share,
    other,
    kpiFactor,
    subAllowance1,
    subAllowance2,
    pependent,
  }) {
    // console.log({ expertSalaryID, admins, members, userID, status, projectID, humanID, name, date, type, note, salary, onLeaveSalary, reward, punishment, advance, convertFactor, paid, revenueBonus, mealAllowance, insurance, pitax, union, share, other })
    return new Promise(async (resolve) => {
      const that = this
      try {
        let infoSalary =
          await TIMESHEET__EXPERT_SALARY_COLL.findById(expertSalaryID)
        if (!infoSalary) {
          return resolve({
            error: true,
            message: 'Timesheet không tồn tại',
            keyError: 'timesheet_not_exists',
            status: 400,
          })
        }

        let dataUpdate = {
          userUpdate: userID,
          modifyAt: Date.now(),
        }

        if (checkObjectIDs(projectID)) {
          dataUpdate.project = projectID
        }

        if (checkObjectIDs(humanID)) {
          dataUpdate.human = humanID
        }

        if (name) {
          dataUpdate.name = name
        }

        if (date) {
          dataUpdate.date = date
        }

        if (status) {
          dataUpdate.status = status
        }

        if (note) {
          dataUpdate.note = note
        }

        if (convertFactor) {
          dataUpdate.convertFactor = convertFactor
        }

        if (kpiFactor) {
          dataUpdate.kpiFactor = Number(kpiFactor)
        }

        if (subAllowance1) {
          dataUpdate.subAllowance1 = Number(subAllowance1)
        }

        if (subAllowance2) {
          dataUpdate.subAllowance2 = Number(subAllowance2)
        }

        if (pependent) {
          dataUpdate.pependent = Number(pependent)
        }

        if (!isNaN(salary) && Number(infoSalary.salary) != Number(salary)) {
          dataUpdate.salary = salary
        }
        if (
          !isNaN(onLeaveSalary) &&
          Number(infoSalary.onLeaveSalary) != Number(onLeaveSalary)
        ) {
          dataUpdate.onLeaveSalary = onLeaveSalary
        }
        if (!isNaN(reward) && Number(infoSalary.reward) != Number(reward)) {
          dataUpdate.reward = reward
        }
        if (
          !isNaN(revenueBonus) &&
          Number(infoSalary.revenueBonus) != Number(revenueBonus)
        ) {
          dataUpdate.revenueBonus = revenueBonus
        }
        if (
          !isNaN(punishment) &&
          Number(infoSalary.punishment) != Number(punishment)
        ) {
          dataUpdate.punishment = punishment
        }
        if (
          !isNaN(mealAllowance) &&
          Number(infoSalary.mealAllowance) != Number(mealAllowance)
        ) {
          dataUpdate.mealAllowance = mealAllowance
        }
        if (
          !isNaN(insurance) &&
          Number(infoSalary.insurance) != Number(insurance)
        ) {
          dataUpdate.insurance = insurance
        }
        if (!isNaN(pitax) && Number(infoSalary.pitax) != Number(pitax)) {
          dataUpdate.pitax = pitax
        }
        if (!isNaN(union) && Number(infoSalary.union) != Number(union)) {
          dataUpdate.union = union
        }
        if (!isNaN(share) && Number(infoSalary.share) != Number(share)) {
          dataUpdate.share = share
        }
        if (!isNaN(other) && Number(infoSalary.other) != Number(other)) {
          dataUpdate.other = other
        }
        if (!isNaN(advance) && Number(infoSalary.advance) != Number(advance)) {
          dataUpdate.advance = advance
        }
        if (!isNaN(paid) && Number(infoSalary.paid) != Number(paid)) {
          dataUpdate.paid = paid
        }

        // Tính toán giá trị còn lại
        if (
          !isNaN(salary) ||
          !isNaN(onLeaveSalary) ||
          !isNaN(reward) ||
          !isNaN(revenueBonus) ||
          !isNaN(mealAllowance) ||
          !isNaN(punishment) ||
          !isNaN(insurance) ||
          !isNaN(pitax) ||
          !isNaN(advance) ||
          !isNaN(paid)
        ) {
          dataUpdate.remaining =
            Number(salary) +
            Number(onLeaveSalary) +
            Number(reward) +
            Number(revenueBonus) +
            Number(mealAllowance) -
            Number(punishment) -
            Number(insurance) -
            Number(pitax) -
            Number(union) -
            Number(share) -
            Number(other) -
            Number(advance) -
            Number(paid)
        }
        // console.log(dataUpdate)

        const adminsID = [...infoSalary.admins?.map((item) => item?.toString())]
        if (adminsID.includes(userID.toString())) {
          if (admins) {
            if (admins.length && checkObjectIDs(admins)) {
              admins = [...new Set(admins)]
              dataUpdate.admins = admins
            } else {
              dataUpdate.admins = []
            }
          }

          if (members) {
            if (members.length && checkObjectIDs(members)) {
              members = [...new Set(members)]
              dataUpdate.members = members
            } else {
              dataUpdate.members = []
            }
          }
        }
        // else{
        //     if(checkObjectIDs(admins)) {
        //         return resolve({
        //             error: true,
        //             message: 'Bạn không có quyền chia sẻ',
        //             keyError: "permission_denined",
        //             status: 403
        //         });
        //     }

        //     if(checkObjectIDs(members)) {
        //         return resolve({
        //             error: true,
        //             message: 'Bạn không có quyền chia sẻ',
        //             keyError: "permission_denined",
        //             status: 403
        //         });
        //     }
        // }

        let infoAfterUpdate =
          await TIMESHEET__EXPERT_SALARY_COLL.findByIdAndUpdate(
            expertSalaryID,
            dataUpdate,
            { new: true }
          )
        if (!infoAfterUpdate) {
          return resolve({
            error: true,
            message: 'Cannot update',
            keyError: 'cannot_update',
          })
        }

        if (!infoAfterUpdate.parent) {
          // Cập nhật hệ số chuyển đổi vào Chi tiết lương
          if (convertFactor) {
            await TIMESHEET__EXPERT_SALARY_COLL.updateMany(
              { parent: expertSalaryID },
              { $set: { convertFactor: convertFactor } }
            )
          }

          // Thêm các nhân sự còn thiếu vào bảng lương
          let companyID = infoSalary.company,
            userCreate = userID
          let listHuman = await AUTH__USER_COLL.find({
            company: companyID,
            status: 1,
          })
            .select('fullname department position contacts')
            .populate({
              path: 'contacts',
              select: 'company sallaryBasic insuranceFee union share',
            })

          for (const item of listHuman) {
            let infoS = await TIMESHEET__EXPERT_SALARY_COLL.findOne({
              parent: expertSalaryID,
              human: item._id,
            })
            if (!infoS) {
              let insuranceFee = 0,
                union = 0,
                share = 0
              if (item.contacts && item.contacts.length) {
                for (const contact of item.contacts) {
                  if (
                    contact.company.toString() === companyID.toString() &&
                    contact.insuranceFee
                  ) {
                    insuranceFee =
                      Number(insuranceFee) + Number(contact.insuranceFee)
                    union = Number(union) + Number(contact.union)
                    share = Number(share) + Number(contact.share)
                  }
                }
              }

              let dataInsertDetail = {
                userCreate,
                name: 'Default',
                admins: [userCreate],
                members: [userCreate],
                human: item._id,
                parent: expertSalaryID,
                company: companyID,
                convertFactor: infoSalary.convertFactor,
                project: item.department,
                position: item.position,
                date: infoSalary.date,
                type: infoSalary.type,
              }

              if (Number(insuranceFee) > 0) {
                dataInsertDetail.insurance = Number(insuranceFee)
              }

              if (Number(union) > 0) {
                dataInsertDetail.union = Number(union)
              }

              if (Number(share) > 0) {
                dataInsertDetail.share = Number(share)
              }

              await this.insertData(dataInsertDetail)
            }
          }
        }

        // Cập nhật giá trị vào Bảng lương cha
        if (infoAfterUpdate.parent && checkObjectIDs(infoAfterUpdate.parent)) {
          await that.updateValue({
            expertSalaryID: infoAfterUpdate.parent,
            userID,
          })
        }

        return resolve({ error: false, data: infoAfterUpdate })
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }

  /**
   * Name: Cập nhật chấm công vào các Chi tiết của Bảng lương
   * Author: HiepNH
   * Code: 22/11/2023
   */
  updateValueTimesheet({ expertSalaryID, companyID }) {
    return new Promise(async (resolve) => {
      try {
        let infoSalary =
          await TIMESHEET__EXPERT_SALARY_COLL.findById(expertSalaryID)
        if (!infoSalary)
          return resolve({
            error: true,
            message: "can't_get_info",
            status: 403,
          })

        let month = Number(infoSalary.date.getMonth()) + 1
        let year = infoSalary.date.getFullYear()
        // console.log({month})

        // Lương cứng (subtype = 1)
        let listData = await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
          {
            $match: {
              company: ObjectID(companyID),
              parent: { $exists: true, $ne: null },
              assignee: { $exists: true, $ne: null },
              subtype: 1,
            },
          },
          {
            $project: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              date: 1,
              assignee: 1,
              hours: 1,
              amount: 1,
            },
          },
          {
            $match: {
              year: Number(year),
              month: Number(month),
            },
          },
          {
            $group: {
              _id: { assignee: '$assignee' },
              quantity: { $sum: '$hours' },
              amount: { $sum: '$amount' },
            },
          },
        ])
        // console.log(listData)

        // Lương phép, lễ/tết
        let listData2 = await TIMESHEET__EXPERT_TIMESHEET_COLL.aggregate([
          {
            $match: {
              company: ObjectID(companyID),
              parent: { $exists: true, $ne: null },
              assignee: { $exists: true, $ne: null },
              subtype: { $in: [2, 3, 4] },
            },
          },
          {
            $project: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              date: 1,
              assignee: 1,
              hours: 1,
              amount: 1,
            },
          },
          {
            $match: {
              year: Number(year),
              month: Number(month),
            },
          },
          {
            $group: {
              _id: { assignee: '$assignee' },
              quantity: { $sum: '$hours' },
              amount: { $sum: '$amount' },
              // quantity: { $sum: 1 },
            },
          },
        ])
        // console.log(listData2)

        for (const item of listData) {
          // console.log(item._id.assignee.toString())

          let salary = 0,
            onLeaveSalary = 0,
            reward = 0,
            revenueBonus = 0,
            mealAllowance = 0,
            punishment = 0,
            insurance = 0,
            pitax = 0,
            union = 0,
            share = 0,
            other = 0,
            advance = 0,
            paid = 0,
            remaining = 0
          let info = await TIMESHEET__EXPERT_SALARY_COLL.findOne({
            parent: expertSalaryID,
            human: item._id.assignee,
          })

          if (info) {
            salary = Number(item.amount).toFixed(0) // Lấy theo bảng chấm công
            onLeaveSalary = info.onLeaveSalary
            reward = info.reward
            revenueBonus = info.revenueBonus
            mealAllowance = info.mealAllowance
            punishment = info.punishment
            insurance = info.insurance
            pitax = info.pitax
            union = info.union
            share = info.share
            other = info.other
            advance = info.advance
            paid = info.paid
          }

          remaining =
            Number(salary) +
            Number(onLeaveSalary) +
            Number(reward) +
            Number(revenueBonus) +
            Number(mealAllowance) -
            Number(punishment) -
            Number(insurance) -
            Number(pitax) -
            Number(union) -
            Number(share) -
            Number(other) -
            Number(advance) -
            Number(paid)

          let dataUpdate = {
            salary,
            onLeaveSalary,
            reward,
            revenueBonus,
            mealAllowance,
            punishment,
            insurance,
            pitax,
            union,
            share,
            other,
            advance,
            paid,
            remaining,
          }

          if (info) {
            await TIMESHEET__EXPERT_SALARY_COLL.findByIdAndUpdate(
              info._id,
              dataUpdate,
              { new: true }
            )
          }
        }

        for (const item of listData2) {
          let salary = 0,
            onLeaveSalary = 0,
            reward = 0,
            revenueBonus = 0,
            mealAllowance = 0,
            punishment = 0,
            insurance = 0,
            pitax = 0,
            union = 0,
            share = 0,
            other = 0,
            advance = 0,
            paid = 0,
            remaining = 0

          let info = await TIMESHEET__EXPERT_SALARY_COLL.findOne({
            parent: expertSalaryID,
            human: item._id.assignee,
          })

          if (info) {
            salary = info.salary
            onLeaveSalary = Number(item.amount).toFixed(0)
            reward = info.reward
            revenueBonus = info.revenueBonus
            mealAllowance = info.mealAllowance
            punishment = info.punishment
            insurance = info.insurance
            pitax = info.pitax
            union = info.union
            share = info.share
            other = info.other
            advance = info.advance
            paid = info.paid
          }

          remaining = Number(
            Number(salary) +
              Number(onLeaveSalary) +
              Number(reward) +
              Number(revenueBonus) +
              Number(mealAllowance) -
              Number(punishment) -
              Number(insurance) -
              Number(pitax) -
              Number(union) -
              Number(share) -
              Number(other) -
              Number(advance) -
              Number(paid)
          ).toFixed(0)

          let dataUpdate = {
            salary,
            onLeaveSalary,
            reward,
            revenueBonus,
            mealAllowance,
            punishment,
            insurance,
            pitax,
            union,
            share,
            other,
            advance,
            paid,
            remaining,
          }

          if (info) {
            await TIMESHEET__EXPERT_SALARY_COLL.findByIdAndUpdate(
              info._id,
              dataUpdate,
              { new: true }
            )
          }
        }

        return resolve({ error: false, status: 200 })
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
   * Name: Cập nhật KPI vào các chi tiết của Bảng lương
   * Author: HiepNH
   * Code: 22/11/2023
   */
  updateValueKpi({ expertSalaryID, userID, companyID }) {
    return new Promise(async (resolve) => {
      try {
        let infoSalary =
          await TIMESHEET__EXPERT_SALARY_COLL.findById(expertSalaryID)
        if (!infoSalary)
          return resolve({
            error: true,
            message: "can't_get_info",
            status: 403,
          })

        let month = Number(infoSalary.date.getMonth()) + 1
        let year = infoSalary.date.getFullYear()

        // Danh sách phân loại lỗi theo nhân sự
        let listData = await FNB_MISTAKE_COLL.aggregate([
          {
            $match: {
              company: ObjectID(companyID),
              executor: { $exists: true, $ne: null },
            },
          },
          {
            $project: {
              year: { $year: '$createAt' },
              month: { $month: '$createAt' },
              executor: 1,
              amount: 1,
              bonus: 1,
            },
          },
          {
            $match: {
              year: Number(year),
              month: Number(month),
            },
          },
          {
            $group: {
              _id: { executor: '$executor' },
              bonus: { $sum: '$bonus' },
              amount: { $sum: '$amount' },
            },
          },
        ])
        // console.log({listData})

        for (const item of listData) {
          let salary = 0,
            onLeaveSalary = 0,
            reward = 0,
            revenueBonus = 0,
            mealAllowance = 0,
            punishment = 0,
            insurance = 0,
            pitax = 0,
            union = 0,
            share = 0,
            other = 0,
            advance = 0,
            paid = 0,
            remaining = 0

          let info = await TIMESHEET__EXPERT_SALARY_COLL.findOne({
            parent: expertSalaryID,
            human: item._id.executor,
          })

          if (info) {
            salary = info.salary
            onLeaveSalary = info.onLeaveSalary
            reward = item.bonus * info.convertFactor // KPI
            revenueBonus = info.revenueBonus
            mealAllowance = info.mealAllowance
            punishment = item.amount * info.convertFactor // KPI
            insurance = info.insurance
            pitax = info.pitax
            union = info.union
            share = info.share
            other = info.other
            advance = info.advance
            paid = info.paid
          }

          remaining = Number(
            Number(salary) +
              Number(onLeaveSalary) +
              Number(reward) +
              Number(revenueBonus) +
              Number(mealAllowance) -
              Number(punishment) -
              Number(insurance) -
              Number(pitax) -
              Number(union) -
              Number(share) -
              Number(other) -
              Number(advance) -
              Number(paid)
          ).toFixed(0)

          let dataUpdate = {
            salary,
            onLeaveSalary,
            reward,
            revenueBonus,
            mealAllowance,
            punishment,
            insurance,
            pitax,
            union,
            share,
            other,
            advance,
            paid,
            remaining,
          }

          await TIMESHEET__EXPERT_SALARY_COLL.findByIdAndUpdate(
            info._id,
            dataUpdate,
            { new: true }
          )
        }
        return resolve({ error: false, status: 200 })
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
   * Name: Tổng hợp các chi tiết lương vào Bảng lương
   * Author: HiepNH
   * Code: 22/11/2023
   */
  updateValue({ expertSalaryID, userID }) {
    return new Promise(async (resolve) => {
      try {
        let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

        let listData = await TIMESHEET__EXPERT_SALARY_COLL.aggregate([
          {
            $match: {
              parent: ObjectID(expertSalaryID),
            },
          },
          {
            $group: {
              _id: {},
              salary: { $sum: '$salary' },
              onLeaveSalary: { $sum: '$onLeaveSalary' },
              reward: { $sum: '$reward' },
              punishment: { $sum: '$punishment' },
              advance: { $sum: '$advance' },
              remaining: { $sum: '$remaining' },
              paid: { $sum: '$paid' },
              revenueBonus: { $sum: '$revenueBonus' },
              mealAllowance: { $sum: '$mealAllowance' },
              insurance: { $sum: '$insurance' },
              pitax: { $sum: '$pitax' },
              union: { $sum: '$union' },
              share: { $sum: '$share' },
              other: { $sum: '$other' },
            },
          },
        ])
        // console.log(listData[0])

        if (listData[0]) {
          dataUpdate.salary = Number(listData[0].salary)
          dataUpdate.onLeaveSalary = Number(listData[0].onLeaveSalary)
          dataUpdate.reward = Number(listData[0].reward)
          dataUpdate.punishment = Number(listData[0].punishment)
          dataUpdate.advance = Number(listData[0].advance)
          dataUpdate.remaining = Number(listData[0].remaining)
          dataUpdate.paid = Number(listData[0].paid)
          dataUpdate.revenueBonus = Number(listData[0].revenueBonus)
          dataUpdate.mealAllowance = Number(listData[0].mealAllowance)
          dataUpdate.insurance = Number(listData[0].insurance)
          dataUpdate.pitax = Number(listData[0].pitax)
          dataUpdate.union = Number(listData[0].union)
          dataUpdate.share = Number(listData[0].share)
          dataUpdate.other = Number(listData[0].other)
        }

        let infoAfterUpdate =
          await TIMESHEET__EXPERT_SALARY_COLL.findByIdAndUpdate(
            expertSalaryID,
            dataUpdate,
            { new: true }
          )
        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: 'Cập nhật thất bại',
            keyError: "can't_update_task",
            status: 403,
          })

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
   * Name: Đồng bộ data
   * Author: HiepNH
   * Code: 22/11/2023
   */
  syncData({ option, salaryID, userID, companyID }) {
    const that = this
    return new Promise(async (resolve) => {
      try {
        if (option == 1) {
          // Cập nhật chấm công vào các Chi tiết của Bảng lương
          await that.updateValueTimesheet({
            expertSalaryID: salaryID,
            userID,
            companyID,
          })

          // Cập nhật KPI vào các chi tiết của Bảng lương
          await that.updateValueKpi({
            expertSalaryID: salaryID,
            userID,
            companyID,
          })

          // Tổng hợp các chi tiết lương vào Bảng lương
          await that.updateValue({ expertSalaryID: salaryID, userID })

          return resolve({
            error: false,
            message: 'Đồng bộ thành công',
            status: 200,
          })
        } else if (option == 2) {
          //___________Quyền truy cập ứng dụng Nhân sự
          let infoAppUser = await AUTH__APP_USER.checkPermissionsAccessApp({
            appID: '61e049cffdebf77b072d1b14',
            userID,
          })

          // Chỉ admin ứng dụng mới được thêm phần tử cha con
          if (!infoAppUser.error && infoAppUser.data.level == 0) {
            await TIMESHEET__EXPERT_SALARY_COLL.deleteMany({
              parent: salaryID,
            })
            await TIMESHEET__EXPERT_SALARY_COLL.findByIdAndDelete(salaryID)
            return resolve({
              error: false,
              data: 'Reset thành công',
            })
          } else {
            return resolve({
              error: false,
              data: 'Bạn không có quyền Reset',
            })
          }
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
   * Name: Remove
   * Author: HiepNH
   * Code: 22/3/2024
   */
  remove({ arraysRemove, userID }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(arraysRemove)) {
          return resolve({
            error: true,
            message: 'Yêu cầu không hợp lệ',
            status: 200,
          })
        }

        const result = await TIMESHEET__EXPERT_SALARY_COLL.deleteMany({
          _id: { $in: arraysRemove },
          userCreate: userID,
          // $or: [
          //     { userCreate: userID },
          //     { admins: { $in: [userID] } }
          // ]
        })

        if (result.deletedCount !== arraysRemove.length) {
          return resolve({
            error: true,
            message: 'Dữ liệu có thể chưa xóa hết vì không đủ quyền',
            status: 200,
          })
        }

        return resolve({
          error: false,
          message: 'Xóa dữ liệu thành công',
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
   * Name: get info expert timesheet
   * Author: Depv
   * Code:
   */
  getInfo({ expertSalaryID, userID, select, populates, ctx }) {
    return new Promise(async (resolve) => {
      try {
        if (!checkObjectIDs(expertSalaryID))
          return resolve({
            error: true,
            message: 'Request params expertSalaryID invalid',
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

        let infoAterGet = await TIMESHEET__EXPERT_SALARY_COLL.findById(
          expertSalaryID
        )
          .select(select)
          .populate(populates)

        if (!infoAterGet)
          return resolve({
            error: true,
            message: "can't_get_info",
            status: 403,
          })

        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

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
   * Name  : Danh sách expert timesheet
   * Author: Depv
   * Code  :
   */
  getList({
    sortOption,
    parentID,
    userID,
    keyword,
    limit = 10,
    lastestID,
    select,
    populates = {},
    companyID,
    positionsID,
    departmentsID,
  }) {
    // console.log({sortOption, parentID, userID, keyword, limit, lastestID, select, populates, companyID, positionsID, departmentsID })
    return new Promise(async (resolve) => {
      try {
        // Record Traffic
        // //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

        let getInfoUserApp = await AUTH__APP_USER.checkPermissionsAccessApp({
          appID: '61e049cffdebf77b072d1b14',
          userID,
        })

        if (Number(limit) > 50) {
          limit = 50
        } else {
          limit = +Number(limit)
        }

        let conditionObj = {}
        let nextCursor = null
        let sortBy = null
        let keys = ['createAt__1', '_id__1']

        if (sortOption == 1) {
          keys = ['date__-1', '_id__-1']
        }

        const validation = validateParamsObjectID({
          positionsID: { value: positionsID, isRequire: false },
          departmentsID: { value: departmentsID, isRequire: false },
        })
        if (validation.error) return resolve(validation)

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

        if (checkObjectIDs(parentID)) {
          // keys	 = ['project__1', '_id__-1']; // Đưa vào đây thì phân trang không còn đúng nữa

          conditionObj.parent = parentID

          if (!getInfoUserApp.error && Number(getInfoUserApp.data.level) == 0) {
            // Admin ứng dụng
          } else {
            let listDepartment = await ITEM__DEPARTMENT_COLL.find({
              company: companyID,
              members: { $in: [userID] },
            }).select('_id name')
            conditionObj.project = {
              $in: listDepartment.map((item) => item.id),
            }
          }

          // Lọc dữ liệu
          if (departmentsID && departmentsID.length) {
            conditionObj.project = { $in: departmentsID }
          }

          if (positionsID && positionsID.length) {
            conditionObj.position = { $in: positionsID }
          }

          if (keyword) {
            keyword = keyword.split(' ')
            keyword = '.*' + keyword.join('.*') + '.*'

            let listUser = await AUTH__USER_COLL.find({
              company: companyID,
              fullname: new RegExp(keyword, 'i'),
            })
              .select('_id fullname')
              .limit(20)
            // console.log(listUser)

            conditionObj.human = {
              $in: listUser.map((item) => item._id),
            }
          }
        } else {
          if (!getInfoUserApp.error && Number(getInfoUserApp.data.level) == 0) {
            conditionObj.company = companyID
            conditionObj.parent = { $exists: false }
          } else {
            conditionObj.$or = [
              { admins: { $in: [userID] } },
              { members: { $in: [userID] } },
            ]
            conditionObj.company = companyID
            conditionObj.parent = { $exists: false }
          }

          if (keyword) {
            keyword = keyword.split(' ')
            keyword = '.*' + keyword.join('.*') + '.*'
            conditionObj.name = new RegExp(keyword, 'i')
          }
        }
        // console.log(conditionObj)

        let conditionObjOrg = { ...conditionObj }

        if (lastestID && checkObjectIDs(lastestID)) {
          let infoData = await TIMESHEET__EXPERT_SALARY_COLL.findById(lastestID)
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
        // sortBy      = { project: 1 };
        console.log({ sortBy })

        let infoDataAfterGet = await TIMESHEET__EXPERT_SALARY_COLL.find(
          conditionObj
        )
          .select(select)
          .limit(+limit + 1)
          .sort(sortBy)
          .populate(populates)
          .lean()

        if (!infoDataAfterGet)
          return resolve({
            error: true,
            message: "Can't get data",
            status: 403,
          })

        if (infoDataAfterGet && infoDataAfterGet.length) {
          if (infoDataAfterGet.length > limit) {
            nextCursor = infoDataAfterGet[limit - 1]._id
            infoDataAfterGet.length = limit
          }
        }

        let totalRecord =
          await TIMESHEET__EXPERT_SALARY_COLL.count(conditionObjOrg)
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
   * Name: Gom nhóm theo thuộc tính
   * Author: Hiepnh
   * Date: 21/9/2022
   */
  getListByProperty({
    userID,
    option,
    year,
    month,
    companyID,
    projectID,
    assigneeID,
    ctx,
  }) {
    // console.log({ userID, option, year, companyID, assigneeID })
    return new Promise(async (resolve) => {
      try {
        // Record Traffic
        //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

        let yearFilter
        let currentYear = new Date().getFullYear()
        if (year && !isNaN(year)) {
          yearFilter = Number(year)
        } else {
          yearFilter = Number(currentYear)
        }

        // Tổng hợp Lương của công ty theo tháng
        if (!option) {
          let conditionObj = {
            company: ObjectID(companyID),
            parent: { $exists: true, $ne: null },
          }

          let listData = await TIMESHEET__EXPERT_SALARY_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                salary: 1,
                reward: 1,
                punishment: 1,
                advance: 1,
                remaining: 1,
                paid: 1,
                revenueBonus: 1,
                mealAllowance: 1,
                insurance: 1,
                pitax: 1,
              },
            },
            {
              $match: {
                year: Number(yearFilter),
              },
            },
            {
              $group: {
                _id: { month: '$month' },
                salary: {
                  $sum: {
                    $subtract: [
                      {
                        $add: [
                          '$salary',
                          '$revenueBonus',
                          '$reward',
                          '$mealAllowance',
                        ],
                      },
                      {
                        $add: ['$punishment', '$insurance', '$pitax'],
                      },
                    ],
                  },
                },
                paid: {
                  $sum: { $add: ['$paid', '$advance'] },
                },
              },
            },
          ])

          return resolve({ error: false, data: listData })
        }

        // Bảng lương của assigneeID theo tháng
        else if (option == 1) {
          let conditionObj = {
            human: ObjectID(assigneeID),
            parent: { $exists: true, $ne: null },
          }

          let listData = await TIMESHEET__EXPERT_SALARY_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                // examTotal: { $sum: [ "$salary","$reward","-$punishment" ] },
                salary: 1,
                reward: 1,
                punishment: 1,
                advance: 1,
                remaining: 1,
                paid: 1,
                revenueBonus: 1,
                mealAllowance: 1,
                insurance: 1,
                pitax: 1,
              },
            },
            {
              $match: {
                year: Number(yearFilter),
              },
            },
            {
              $group: {
                _id: { month: '$month' },
                // examTotal: { $sum:"$examTotal" },
                // totalAmount: { $sum: { $multiply: [ "$salary", "$reward" ] } },
                // totalAmount2: { $sum: { $add: [ "$salary", "$reward" ] } },
                // salary: { $sum: { $subtract: [ { $add: [ "$salary", "$reward" ] }, "$punishment" ] } },
                salary: {
                  $sum: {
                    $subtract: [
                      {
                        $add: [
                          '$salary',
                          '$revenueBonus',
                          '$reward',
                          '$mealAllowance',
                        ],
                      },
                      {
                        $add: ['$punishment', '$insurance', '$pitax'],
                      },
                    ],
                  },
                },
                // advance: { $sum: "$advance" },
                // salary: { $sum:"$salary" },
                paid: {
                  $sum: { $add: ['$paid', '$advance'] },
                },
              },
            },
          ])
          // console.log(listData)

          return resolve({ error: false, data: listData })
        }

        // Bảng lương của assigneeID 1 tháng
        else if (option == 2) {
          let conditionObj = {
            human: ObjectID(assigneeID),
            parent: { $exists: true, $ne: null },
          }

          let listData = await TIMESHEET__EXPERT_SALARY_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                salary: 1,
                reward: 1,
                punishment: 1,
                advance: 1,
                remaining: 1,
                paid: 1,
                revenueBonus: 1,
                mealAllowance: 1,
                insurance: 1,
                pitax: 1,
              },
            },
            {
              $match: {
                year: Number(yearFilter),
                month: Number(month),
              },
            },
            {
              $group: {
                _id: {},
                salary: { $sum: '$salary' },
                reward: { $sum: '$reward' },
                punishment: { $sum: '$punishment' },
                advance: { $sum: '$advance' },
                remaining: { $sum: '$remaining' },
                paid: { $sum: '$paid' },
                revenueBonus: { $sum: '$revenueBonus' },
                mealAllowance: { $sum: '$mealAllowance' },
                insurance: { $sum: '$insurance' },
                pitax: { $sum: '$pitax' },
              },
            },
          ])
          // console.log(listData)

          return resolve({ error: false, data: listData })
        }

        // Gom nhóm theo Dự án/Bộ phận
        else if (option == 3) {
          let sortBy = { '_id.project': 1 }

          let conditionPopulate1 = {
            path: '_id.project',
            select: '_id name',
            model: 'department',
          }

          let conditionObj = {
            company: ObjectID(companyID),
            parent: { $exists: true, $ne: null },
          }

          let listData1 = await TIMESHEET__EXPERT_SALARY_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                project: 1,
                position: 1,
                human: 1,
                salary: 1,
                reward: 1,
                punishment: 1,
                advance: 1,
                remaining: 1,
                paid: 1,
                revenueBonus: 1,
                mealAllowance: 1,
                insurance: 1,
                pitax: 1,
              },
            },
            {
              $match: {
                year: Number(yearFilter),
                month: Number(month),
              },
            },
            {
              $group: {
                _id: { project: '$project' },
                // salary: { $sum: { $subtract: [ { $add: [ "$salary", "$reward" ] }, "$punishment" ] } },
                salary: {
                  $sum: {
                    $subtract: [
                      {
                        $add: [
                          '$salary',
                          '$revenueBonus',
                          '$reward',
                          '$mealAllowance',
                        ],
                      },
                      {
                        $add: ['$punishment', '$insurance', '$pitax'],
                      },
                    ],
                  },
                },
                paid: {
                  $sum: { $add: ['$paid', '$advance'] },
                },
              },
            },
            {
              $sort: sortBy,
            },
          ])

          if (listData1.length) {
            await TIMESHEET__EXPERT_SALARY_COLL.populate(
              listData1,
              conditionPopulate1
            )
          }

          return resolve({ error: false, data: listData1 })
        }

        // Gom nhóm theo Nhân sự trong bộ phận
        else if (option == 4) {
          let sortBy = { '_id.human': 1 }

          let conditionPopulate1 = {
            path: '_id.human',
            select: '_id fullname image',
            model: 'user',
          }

          let conditionObj = {
            project: ObjectID(projectID),
            parent: { $exists: true, $ne: null },
          }

          let listData1 = await TIMESHEET__EXPERT_SALARY_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                project: 1,
                human: 1,
                salary: 1,
                reward: 1,
                punishment: 1,
                advance: 1,
                remaining: 1,
                paid: 1,
                revenueBonus: 1,
                mealAllowance: 1,
                insurance: 1,
                pitax: 1,
              },
            },
            {
              $match: {
                year: Number(yearFilter),
                month: Number(month),
              },
            },
            {
              $group: {
                _id: { human: '$human' },
                // salary: { $sum: { $subtract: [ { $add: [ "$salary", "$reward" ] }, "$punishment" ] } },
                salary: {
                  $sum: {
                    $subtract: [
                      {
                        $add: [
                          '$salary',
                          '$revenueBonus',
                          '$reward',
                          '$mealAllowance',
                        ],
                      },
                      {
                        $add: ['$punishment', '$insurance', '$pitax'],
                      },
                    ],
                  },
                },
                paid: {
                  $sum: { $add: ['$paid', '$advance'] },
                },
              },
            },
            {
              $sort: sortBy,
            },
          ])

          if (listData1.length) {
            await TIMESHEET__EXPERT_SALARY_COLL.populate(
              listData1,
              conditionPopulate1
            )
          }

          return resolve({ error: false, data: listData1 })
        }

        // Gom nhóm theo Nhân sự trong 1 tháng/
        else if (option == 5) {
          let sortBy = { '_id.human': 1 }

          let conditionPopulate1 = {
            path: '_id.human',
            select: '_id fullname',
            model: 'user',
          }

          let conditionObj = {
            company: ObjectID(companyID),
            parent: { $exists: true, $ne: null },
          }

          let listData1 = await TIMESHEET__EXPERT_SALARY_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                human: 1,
                salary: 1,
                reward: 1,
                punishment: 1,
                advance: 1,
                remaining: 1,
                paid: 1,
                revenueBonus: 1,
                mealAllowance: 1,
                insurance: 1,
                pitax: 1,
              },
            },
            {
              $match: {
                year: Number(yearFilter),
                month: Number(month),
              },
            },
            {
              $group: {
                _id: { human: '$human' },
                // salary: { $sum: { $subtract: [ { $add: [ "$salary", "$reward" ] }, "$punishment" ] } },
                salary: {
                  $sum: {
                    $subtract: [
                      {
                        $add: [
                          '$salary',
                          '$revenueBonus',
                          '$reward',
                          '$mealAllowance',
                        ],
                      },
                      {
                        $add: ['$punishment', '$insurance', '$pitax'],
                      },
                    ],
                  },
                },
                paid: {
                  $sum: { $add: ['$paid', '$advance'] },
                },
              },
            },
            {
              $sort: sortBy,
            },
          ])

          if (listData1.length) {
            await TIMESHEET__EXPERT_SALARY_COLL.populate(
              listData1,
              conditionPopulate1
            )
          }

          return resolve({ error: false, data: listData1 })
        }

        // Tổng hợp toàn bộ của 1 nhân sự
        else if (option == 6) {
          let conditionObj = {
            human: ObjectID(assigneeID),
            parent: { $exists: true, $ne: null },
          }

          let listData = await TIMESHEET__EXPERT_SALARY_COLL.aggregate([
            {
              $match: conditionObj,
            },
            {
              $project: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                salary: 1,
                reward: 1,
                punishment: 1,
                advance: 1,
                remaining: 1,
                paid: 1,
                revenueBonus: 1,
                mealAllowance: 1,
                insurance: 1,
                pitax: 1,
              },
            },
            {
              $group: {
                _id: {},
                salary: { $sum: '$salary' },
                reward: { $sum: '$reward' },
                punishment: { $sum: '$punishment' },
                advance: { $sum: '$advance' },
                remaining: { $sum: '$remaining' },
                paid: { $sum: '$paid' },
                revenueBonus: { $sum: '$revenueBonus' },
                mealAllowance: { $sum: '$mealAllowance' },
                insurance: { $sum: '$insurance' },
                pitax: { $sum: '$pitax' },
              },
            },
          ])
          // console.log(listData)

          return resolve({ error: false, data: listData })
        }
      } catch (error) {
        return resolve({ error: true, message: error.message })
      }
    })
  }
}

exports.MODEL = new Model()
