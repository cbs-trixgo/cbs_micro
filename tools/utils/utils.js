'use strict'
const lodash = require('lodash')
const ObjectID = require('mongoose').Types.ObjectId
const NUMBER_UTILS = require('./number_utils')

exports.objectID = require('mongoose').Types.ObjectId

exports.getEnv = (name) => {
  return process.env[name]
}

exports.isProd = () => {
  return process.env.NODE_ENV === 'production'
}

exports.isBoolean = (val) => {
  return val !== undefined && typeof val == 'boolean'
}

exports.isTrue = (val) => {
  return val && val !== '' && val !== undefined && val === 'true'
}

exports.isFalse = (val) => {
  return val && val !== '' && val !== undefined && val === 'false'
}

exports.isEmpty = function (value) {
  return (
    (typeof value == 'string' && !value.trim()) ||
    typeof value == 'undefined' ||
    value === null ||
    value == undefined
  )
}

exports.randomIntBetween = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

exports.randomIntFromInterval = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * param: email
 * return bolean
 */
exports.checkEmail = (email) => {
  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

/*
 * Hàm validation các kí tự thực thi script
 * param: data
 * return boolean
 */
exports.isValidationData = (data) => {
  const denineString = ['<', '>', "'", '"', '&', '\\', '\\\\']
  const dataAfterSplited = data.split('')
  let temp = 0
  while (temp < dataAfterSplited.length) {
    if (dataAfterSplited.includes(denineString[temp])) {
      return false
    }
    temp++
  }
  return true
}

let stringDomain = [
  '.com',
  '.vn',
  '.edu',
  '.net',
  '.org',
  '.gov',
  '.info',
  '.es',
  '.id',
  '.tel',
  '.tk',
  '.xyz',
  '.online',
  '.group',
  '.live',
  '.link',
  '.me',
  '.pro',
  '.be',
]

exports.getLinkFromStringV1 = (string) => {
  const expression =
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
  const regex = new RegExp(expression)
  if (!string) return
  let linkArr = string && string.match(regex)
  let newLinkArr = []
  if (linkArr && linkArr.length) {
    linkArr &&
      linkArr.forEach((link) => {
        stringDomain &&
          stringDomain.forEach((haLink) => {
            if (link.includes(haLink) && newLinkArr.indexOf(link) == -1) {
              newLinkArr.push(link)
            }
          })
      })
  }
  return newLinkArr
}

exports.sortObject = (o) => {
  var sorted = {},
    key,
    a = []

  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key)
    }
  }

  a.sort()

  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]]
  }
  return sorted
}

function _checkParametersModel(data, checkValue) {
  if (!data || !checkValue || !Array.isArray(data))
    return {
      error: true,
      message: `checkValue or data false when check Params`,
    }

  switch (checkValue) {
    case 'number':
      for (let i = 0; i < data.length; i++) {
        let key = Object.keys(data[i])
        if (isNaN(data[i][key[0]])) {
          return {
            error: true,
            message: `Request params key ${key} invalid type ${checkValue}`,
          }
        }
        if (typeof data[i][key[0]] != 'number')
          return {
            error: true,
            message: `Request params key ${key} invalid type ${checkValue}`,
          }
      }
      return { error: false }
    case 'interger':
      for (let i = 0; i < data.length; i++) {
        let key = Object.keys(data[i])
        if (isNaN(data[i][key[0]])) {
          return {
            error: true,
            message: `Request params key ${key} invalid type ${checkValue}`,
          }
        }
        if (typeof data[i][key[0]] != 'number')
          return {
            error: true,
            message: `Request params key ${key} invalid type ${checkValue}`,
          }

        if (!NUMBER_UTILS.isInt(data[i][key[0]]))
          return {
            error: true,
            message: `Request params  key ${key} hadn't been interger`,
          }
      }
      return { error: false }
    case 'objectID':
      for (let i = 0; i < data.length; i++) {
        let key = Object.keys(data[i])
        if (!_checkObjectIDs(data[i][key[0]])) {
          return {
            error: true,
            message: `Request params key ${key} invalid type ${checkValue}`,
          }
        }
      }
      return { error: false }
    default:
      return { error: true, message: `Request params key ${key} invalid` }
  }
}

/**
 * LẤY DATA ĐỆ QUY
 * Author: DePV
 * Tìm kiếm theo findById
 * @param {*} colection => Tên colection cần đệ quy
 * @param {*} conditionID => _id collection cần đệ quy
 * @param {*} parent => _id cha nếu là colection con
 * ------------------------------------
 * updated K.NEY (6:35 30/06/2020)
 * - hàm này chỉ convert cho getListNestedGroup (Budget_group. line: 230)
 */
exports.getDataRecursive = async (colection, conditionID, parent) => {
  // Khai báo hàm get populate cho các phần tử cha con
  let constructForAny = (level, path) => {
    const oneLevel = () => ({ path })
    let obj = oneLevel()

    while (level) {
      if (level !== 1) {
        obj.populate = Object.assign({}, obj)
        // console.log(obj)
      }
      obj = Object.assign({}, obj)
      // console.log(obj)
      // console.log('====done')
      --level
    }

    return obj
  }

  // Lấy levelMax của con cấp thấp nhất để forEach xử lý
  let levelMax = await colection.aggregate([
    {
      $group: {
        _id: null,
        maxLevel: { $max: '$level' },
      },
    },
  ])

  let levelForRecursive = Number(levelMax[0].maxLevel)

  // Khai báo mảng chứa phần tử cha và các con
  let arrObjectID = []

  /**
   * Khai báo hàm gộp các mảng phần tử con vào trong phần tử cha
   * Ppdated by K.Ney (6:34 30/06/2020)
   */
  let getListIDRecursiveForAny = (arr, level) => {
    arrObjectID = [...arr] // VARIABLE GLOBAL
    let arrTempForRecursive = [...arr]

    for (let i = 0; i < arr.length; i++) {
      while (level > 0) {
        arrTempForRecursive.forEach((item) => {
          if (Array.isArray(item.childs) && item.childs.length) {
            let arrTemp = Array.from(item.childs) // update_1

            arrObjectID = [...arrObjectID, ...arrTemp]

            arrTempForRecursive = arrObjectID // update_2
          }
        })
        --level
      }
    }
  }

  let infoContractConditionOrigin = await colection
    .findById(conditionID)
    .populate(constructForAny(levelForRecursive, 'childs'))

  // Thay thế cho cách cũ ở các phần danh mục (truyền vào Array thay vì object)
  getListIDRecursiveForAny([infoContractConditionOrigin], levelForRecursive)

  // Nếu có parent thì xóa ID hiện tại nằm trong childs của parent đi
  // (Dùng trong trường hợp comment mà có comment cha thì Pull phần từ con trong comment cha)
  if (parent) {
    await colection.findByIdAndUpdate(
      parent,
      {
        $pull: { childs: conditionID },
      },
      { new: true }
    )
  }

  return arrObjectID
}

function _checkPointDotsAndRoundingNumberForPagingChatting(total, perPage) {
  let newToltalCheckPage = `${total / perPage}`
  if (newToltalCheckPage.includes('.')) {
    let numberBeforePoint = newToltalCheckPage.slice(
      0,
      newToltalCheckPage.includes('.') + 1
    )
    return Number(numberBeforePoint) + 1
  }
  return Number(total / perPage) + 1
}

/**
 * * (START) CHECK VALID TYPE
 */

exports.IsJsonString = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

exports.isObject = (obj) => typeof obj === 'object' && obj !== null

// -----------CHECK OBJECT EMPTY --------//
exports.isEmptyObject = function (obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false
    }
  }
  return true
}
// -----------CHECK NUMBER is INTEGER --------//
exports.isInt = (value) => {
  var x
  if (isNaN(value)) {
    return false
  }
  x = parseFloat(value)
  return (x | 0) === x
}

// -----------CHECK NUMBER VALID  --------//
exports.checkNumberValid = ({ val }) => {
  if (!val || Number.isNaN(Number(val))) return false
  return true
}

// -----------CHECK NUMBER VALID WITH RANGE --------//
exports.checkNumberIsValidWithRange = ({ arrValid, val }) => {
  // arr: Array, val: Number
  if (val == null || val == '' || val == undefined || Number.isNaN(Number(val)))
    // kiểm tra val có phải number (lọc các trường hợp ko phải number)
    return false
  if (!Array.isArray(arrValid) || !arrValid.includes(Number(val)))
    // kiểm tra val có nằm trong arr valid
    return false

  return true
}
// -----------CHECK DATE --------//
// ex valid:  '2021-07-29','12/25/2021'
exports.checkDateValid = (d) => {
  d = new Date(d)
  if (Object.prototype.toString.call(d) === '[object Date]') {
    // it is a date
    if (isNaN(d.getTime())) {
      // d.valueOf() could also work
      // date is not valid
      return false
    } else {
      // date is valid
      return true
    }
  } else {
    return false
    // not a date
  }
}
/**
 * ----------CHECK OBJECT_ID VALID ----------//
 * @param  {...any} params
 * @returns
 *
 * -------cách dùng----------
 *  if (!checkObjectIDs(authorID, companyID, projectID)){
 *  ...
    }
 */
let _isValid = (input) => {
  if (!input) return false
  let inputForCheck = input.toString()
  if (ObjectID.isValid(input.toString())) {
    if (String(new ObjectID(input)) === inputForCheck) return true
    return false
  }
  return false
}
exports.checkObjectIDs = (...params) => {
  let flag = true
  let arrParams = lodash.flattenDeep(params)
  for (let i = 0; i < arrParams.length; i++) {
    if (!_isValid(arrParams[i])) return (flag = false)
  }
  return flag
}

/**
 * Func: Get extension image
 * Create: 20/09/2021
 */
exports.getExtension = (path) => {
  const basename = path.split(/[\\/]/).pop()
  const pos = basename.lastIndexOf('.')

  if (basename === '' || pos < 1) return ''

  return basename.slice(pos + 1)
}

/**
 * Func: check params populate
 * Create: 20/09/2021
 */
exports.checkParamsPopulate = (
  populates,
  populates1,
  populates2,
  populates3
) => {
  // populates
  if (populates && typeof populates === 'string') {
    if (!this.IsJsonString(populates))
      return {
        error: true,
        message: 'Request params populates invalid',
        status: 400,
      }

    populates = JSON.parse(populates)
  }

  // populates1
  if (populates1 && typeof populates1 === 'string') {
    if (!this.IsJsonString(populates1))
      return {
        error: true,
        message: 'Request params populates1 invalid',
        status: 400,
      }

    populates1 = JSON.parse(populates1)
  }

  // populates2
  if (populates2 && typeof populates2 === 'string') {
    if (!this.IsJsonString(populates2))
      return {
        error: true,
        message: 'Request params populates2 invalid',
        status: 400,
      }

    populates2 = JSON.parse(populates2)
  }

  // populates3
  if (populates3 && typeof populates3 === 'string') {
    if (!this.IsJsonString(populates3))
      return {
        error: true,
        message: 'Request params populates3 invalid',
        status: 400,
      }

    populates3 = JSON.parse(populates3)
  }
  return { error: false, message: 'pass', status: 200 }
}

exports._getLevelMaxInRecursiveByCompany = async (coll, companyID) => {
  let levelMax = await coll.aggregate([
    {
      $match: {
        company: ObjectID(companyID),
      },
    },
    {
      $group: {
        _id: null,
        maxLevel: { $max: '$level' },
      },
    },
  ])
  let levelForRecursive = Number(levelMax[0].maxLevel)
  return levelForRecursive
}

exports._isValid = _isValid
exports.checkPointDotsAndRoundingNumberForPagingChatting =
  _checkPointDotsAndRoundingNumberForPagingChatting
exports.checkParametersModel = _checkParametersModel

/**
 * Hàm populate tới các phần tử con bên trong một mẩu tin
 * Level: là level max của các phần tử con
 * Path: là điều kiện cho việc populate (gồm 1 hoặc nhiều trường)
 * Author: Khanh/Modify: HiepNH
 */
exports._constructForAny = (level, path) => {
  const oneLevel = () => ({ path })
  let obj = oneLevel()

  /**
   * Số lần populate đảm bảo tới phần tử childs cuối (level-1)
   * Số lần populate được từ phần tử childs cuối tới các bảng con của nó nếu có (level)
   * Nếu muốn populate cho con->cháu thì cần tăng lên Level+1
   */
  var i
  for (i = 1; i <= Number(level); i++) {
    obj.populate = Object.assign({}, obj)
  }
  return obj
}

/**
 * Hàm get maxlevel của các phần tử con/cháu của 1 collection
 * Sử dụng để getList mẩu tin theo đệ quy + lấy nestedID của phần tử/phần tử con cháu của nó
 * Author: Khanh/Modify: HiepNH
 */
exports._getLevelMaxInRecursive = async (coll) => {
  let levelMax = await coll.aggregate([
    {
      $group: {
        _id: null,
        maxLevel: { $max: '$level' },
      },
    },
  ])
  let levelForRecursive = Number(levelMax[0].maxLevel)
  return levelForRecursive
}

/**
 * Dev: MinhVH
 * Date: 22/04/2022
 * Example params:
 *  Format 1:
 *  params: {
 *      [field]: {
 *          value: ObjectID,
 *          isRequire?: boolean,
 *      }
 *  }
 *  Format 2:
 *  params: {
 *      [field]: ObjectID
 *  }
 * @params Object
 */
exports.validateParamsObjectID = (params) => {
  if (!params || !Object.keys(params).length) return false

  const validation = {
    check: (value, require = false) => {
      if (require) {
        return this.checkObjectIDs(value)
      } else if (value) {
        if (Array.isArray(value)) {
          if (!value.length) return true

          return value && value.length && this.checkObjectIDs(value)
        }

        return value && this.checkObjectIDs(value)
      }

      return true
    },
  }

  for (const [key, field] of Object.entries(params)) {
    if (typeof field === 'object') {
      const { value, isRequire } = field

      if (!validation.check(value, isRequire)) {
        return {
          error: true,
          message: `Tham số ${key} không hợp lệ`,
          keyError: `params_${key}_invalid`,
          status: 400,
        }
      }
    } else if (!this.checkObjectIDs(field)) {
      return {
        error: true,
        message: `Tham số ${key} không hợp lệ`,
        keyError: `params_${key}_invalid`,
        status: 400,
      }
    }
  }

  return { error: false }
}

/**
 * VALIDATE SỐ ĐIỆN THOẠI
 */
exports.regexPhoneNumber = (phone) => {
  // const regexPhoneNumber = /(84|0[2|3|5|6|7|8|9])+([0-9]{8})\b/g;
  const regexPhoneNumber = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/ // Cho đầu 01
  return phone.match(regexPhoneNumber) ? true : false
}

exports.parseUserAgent = (userAgent) => {
  // Use a library like 'ua-parser-js' for more sophisticated parsing
  userAgent = userAgent.toLowerCase()
  switch (true) {
    case userAgent.includes('android'):
    case userAgent.includes('iphone'):
      return 'Mobile'
    case userAgent.includes('iPad'):
      return 'Ipad'
    case userAgent.includes('windows'):
    case userAgent.includes('mac os'):
    case userAgent.includes('linux'):
      return 'Desktop'
    default:
      return 'Unknown'
  }
}
