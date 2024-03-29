let { config } = require('../../../../tools/s3/config')
let { checkObjectIDs, getExtension } = require('../../../../tools/utils/utils')
let { nonAccentVietnamese } = require('../../../../tools/utils/string_utils')
let { APP_KEYS } = require('../../../../tools/keys')
let uuidv4 = require('uuid').v4

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { Upload } = require('@aws-sdk/lib-storage')
const { PutObjectCommand, S3 } = require('@aws-sdk/client-s3')

const moment = require('moment')

let s3Object = new S3({
  region: config.aws_region,
})

let render_link_upload_file_s3 = async ({
  fileName,
  type,
  typeUpload,
  pathS3,
}) => {
  try {
    let key = `${process.env.AWS_BUCKET_PATH}${pathS3}/${fileName}`

    if (typeUpload == 'user') {
      key = `files/db/users/${fileName}`
    }

    if (typeUpload == 'contact') {
      key = `files/db/contacts/${fileName}`
    }

    if (typeUpload == 'project') {
      key = `files/db/projects/${fileName}`
    }

    if (typeUpload == 'company') {
      key = `files/db/companys/${fileName}`
    }

    let signedUrl = await getSignedUrl(
      s3Object,
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ACL: 'public-read',
        ContentType: type,
      }),
      {
        expiresIn: config.signedUrlExpireSeconds,
      }
    )

    return signedUrl
  } catch (error) {
    return { error: true, message: "Can't presign url" }
  }
}

function render_link_upload_s3(fileName, type, typeUpload, pathS3) {
  return new Promise(async (resolve) => {
    try {
      if (!fileName) return resolve({ error: true, message: 'params_invalid' })

      let result = await render_link_upload_file_s3({
        fileName,
        type,
        typeUpload,
        pathS3,
      })
      if (result.error) {
        return resolve({ error: true, message: result.message })
      }

      return resolve({ error: false, data: result, fileName })
    } catch (error) {
      return resolve({ error: true, message: error.message })
    }
  })
}

const uploadFile = (pathFile, key) => {
  return new Promise(async (resolve) => {
    try {
      // Read content from the file
      // const fileContent = fs.readFileSync(pathFile);

      const parseBase64ToBuffer = Buffer.from(
        pathFile.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      )
      const bucket = `/root`

      // Setting up S3 upload parameters
      const params = {
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        ACL: 'public-read',
        Bucket: bucket,
        Key: key,
        Body: parseBase64ToBuffer,
      }
      const data = await new Upload({
        client: s3Object,
        params,
      }).done()
      return resolve({ error: false, data })
    } catch (err) {
      console.error('Error uploading file:', err)
      return resolve({ error: true, message: err.message })
    }
  })
}

const getPathByApp = (params) => {
  const {
    appID,
    companyID,
    projectID,
    groupID,
    packageID,
    conversationID,
    otherIDs,
  } = params
  let pathS3 = `/${appID}`
  let appName = ''

  const COMPANIES = [
    APP_KEYS.MEDIA,
    APP_KEYS.CHATTING,
    APP_KEYS.PCM_PLAN_TASK,
    APP_KEYS.DOCUMENT,
    APP_KEYS.HUMAN,
    APP_KEYS.DATAHUB,
    APP_KEYS.FNB,
  ]
  const PROJECTS = [APP_KEYS.PCM_PLAN_TASK, APP_KEYS.DOCUMENT]
  const GROUPS = [APP_KEYS.PCM_PLAN_TASK]
  const PACKAGES = [APP_KEYS.DOCUMENT]
  const CONVERSATIONS = [APP_KEYS.CHATTING]

  // Validate tham số theo app
  if (
    COMPANIES.includes(appID) &&
    (!companyID || !checkObjectIDs([companyID]))
  ) {
    return {
      error: true,
      message: 'Tham số companyID không hợp lệ',
      keyError: 'params_companyID_invalid',
      status: 400,
    }
  }

  if (
    PROJECTS.includes(appID) &&
    (!projectID || !checkObjectIDs([projectID]))
  ) {
    return {
      error: true,
      message: 'Tham số projectID không hợp lệ',
      keyError: 'params_projectID_invalid',
      status: 400,
    }
  }

  if (GROUPS.includes(appID) && (!groupID || !checkObjectIDs([groupID]))) {
    return {
      error: true,
      message: 'Tham số groupID không hợp lệ',
      keyError: 'params_groupID_invalid',
      status: 400,
    }
  }

  if (
    PACKAGES.includes(appID) &&
    (!packageID || !checkObjectIDs([packageID]))
  ) {
    return {
      error: true,
      message: 'Tham số packageID không hợp lệ',
      keyError: 'params_packageID_invalid',
      status: 400,
    }
  }

  if (
    CONVERSATIONS.includes(appID) &&
    (!conversationID || !checkObjectIDs([conversationID]))
  ) {
    return {
      error: true,
      message: 'Tham số conversationID không hợp lệ',
      keyError: 'params_conversationID_invalid',
      status: 400,
    }
  }

  // Nối đường dẫn lưu s3
  switch (appID) {
    case APP_KEYS.MEDIA:
      appName = 'MEDIA'
      pathS3 += `/${companyID}`
      break
    case APP_KEYS.CHATTING:
      appName = 'CHATTING'
      pathS3 += `/${companyID}/${conversationID}`
      break
    case APP_KEYS.PCM_PLAN_TASK:
      appName = 'PCM_PLAN_TASK'
      pathS3 += `/${companyID}/${projectID}/${groupID}`

      otherIDs.taskID && (pathS3 += `/${otherIDs.taskID}`)
      break
    case APP_KEYS.DOCUMENT:
      appName = 'DOCUMENT'
      pathS3 += `/${companyID}/${projectID}/${packageID}`
      break
    case APP_KEYS.HUMAN:
      appName = 'HUMAN'
      pathS3 += `/${companyID}`
      break
    case APP_KEYS.DATAHUB:
      appName = 'DATAHUB'
      pathS3 += `/${companyID}`
      break
    case APP_KEYS.FNB:
      appName = 'FNB'
      pathS3 += `/${companyID}`
      break
    default:
      break
  }

  return { appName, pathS3 }
}

const getPathByType = (params) => {
  const { typeUpload, companyID, projectID } = params
  let pathS3 = ''

  const COMPANIES = ['in-project']
  const PROJECTS = ['in-project']

  // Validate tham số theo app
  if (
    COMPANIES.includes(typeUpload) &&
    (!companyID || !checkObjectIDs([companyID]))
  ) {
    return {
      error: true,
      message: 'Tham số companyID không hợp lệ',
      keyError: 'params_companyID_invalid',
      status: 400,
    }
  }

  if (
    PROJECTS.includes(typeUpload) &&
    (!projectID || !checkObjectIDs([projectID]))
  ) {
    return {
      error: true,
      message: 'Tham số projectID không hợp lệ',
      keyError: 'params_projectID_invalid',
      status: 400,
    }
  }

  // Nối đường dẫn lưu s3
  switch (typeUpload) {
    case 'in-project':
      pathS3 += `/${companyID}/${projectID}`
      break
    default:
      break
  }

  return { pathS3 }
}

/**
 * GET PATH S3 BY APP
 * @returns { error: boolean, data: string }
 */
const getPathS3 = ({
  infoUser,
  typeUpload,
  fileName,
  appID,
  companyID,
  projectID,
  groupID,
  packageID,
  conversationID,
  otherIDs,
}) => {
  switch (typeUpload) {
    case 'contact':
    case 'project':
    case 'company':
    case 'user': {
      const extension = getExtension(fileName)
      const newFileName = `${uuidv4()}.${extension}`

      return {
        error: false,
        data: {
          newFileName,
          pathS3: '',
        },
      }
    }
    default:
      break
  }

  let extension = getExtension(fileName)
  let pathS3 = ''
  let newFileName = ''

  let currentDate = moment(new Date()).format('YYYYMMDD')
  let currentTime = moment(new Date()).format('HHmmss')
  if (['in-project'].includes(typeUpload)) {
    const result = getPathByType({
      typeUpload,
      companyID,
      projectID,
    })
    if (result.error) return result

    pathS3 = result.pathS3
    newFileName = `${nonAccentVietnamese(fileName)}___${uuidv4()}.${extension}`
  } else {
    if (!appID || !checkObjectIDs([appID])) {
      return {
        error: true,
        message: 'Tham số AppID không hợp lệ',
        keyError: 'params_appID_invalid',
        status: 400,
      }
    }

    const result = getPathByApp({
      appID,
      companyID,
      projectID,
      groupID,
      packageID,
      conversationID,
      otherIDs,
    })
    if (result.error) return result

    pathS3 = result.pathS3
    newFileName = `${nonAccentVietnamese(fileName)}___${uuidv4()}___${result.appName}.${extension}`
  }

  let userName = ''
  if (infoUser.fullname.includes('-')) {
    userName = infoUser.fullname.slice(0, infoUser.fullname.indexOf('-'))
  } else {
    userName = infoUser.fullname
  }

  return {
    error: false,
    data: {
      newFileName,
      pathS3,
    },
  }
}

exports.GENERATE_LINK_S3 = render_link_upload_s3
exports.UPLOAD_FILE_S3 = uploadFile
exports.GET_PATH_S3 = getPathS3
