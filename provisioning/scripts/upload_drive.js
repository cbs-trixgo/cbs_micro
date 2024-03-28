const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
const path = require('path')
const zipdir = require('zip-dir')
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
]

const TOKEN_PATH = path.join(__dirname + `/token.json`)
const CREDENTIAL_PATH = path.join(__dirname + `/credentials.json`)

fs.readFile(CREDENTIAL_PATH, (err, content) => {
  if (err) return console.log('Error loading client secret file:', err)
  authorize(JSON.parse(content), listFiles)
})

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client)
  })
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client)
    })
  })
}

function listFiles(auth) {
  const drive = google.drive({ version: 'v3', auth })
  uploadFile(auth)
}

function uploadFile(auth) {
  const folderID = '1wMN8jpCLE5UG1W-OIbRiYnye6ox3zbh9' //drive/backup/TRIXGO_OP FOLDER
  const fileName = process.env.FILE_ZIP

  /**
   * FILE_ZIP: COMMAND LINE
   */
  let pathInternalOriginFolder = path.join(
    __dirname + `/auto_backup_db/${fileName}`
  )
  let pathInternalZipFile = path.join(
    __dirname + `/auto_backup_db/${fileName}.zip`
  )
  zipdir(
    pathInternalOriginFolder,
    { saveTo: pathInternalZipFile },
    (err, buffer) => {
      if (err) {
        /**LỖI NÉN CẦN CALL NC NGỪOI DÙNG */
        console.log({ err })
      } else {
        //
        const drive = google.drive({ version: 'v3', auth })
        var fileMetadata = {
          name: fileName,
          parents: [folderID],
        }
        var media = {
          mimeType: 'application/zip',
          body: fs.createReadStream(pathInternalZipFile),
        }
        drive.files.create(
          {
            resource: fileMetadata,
            media: media,
            fields: 'id',
          },
          function (err, file) {
            if (err) {
              // Handle error
              console.error(err)
              console.log(
                'Make sure you shared your drive folder with service email/user.'
              )
            } else {
              console.log('File Id: ', file.data.id)
              console.log(`status ${file.status} -- ${file.statusText}`)
              console.log(`UPLOAD_SUCCESS_${fileName}`)
              /**
               * remove file zip
               */
              fs.unlink(pathInternalZipFile, (err) => {
                if (err) return console.log({ message: err.message })
                console.log(`REMOVE_ZIP_SUCESS_${fileName}`)
              })
            }
          }
        )
        //
      }
    }
  )
}
