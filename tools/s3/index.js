const fs = require('fs')
const stream = require('stream')
const path = require('path')
const uuidv4 = require('uuid').v4

const { Upload } = require('@aws-sdk/lib-storage')
const { S3 } = require('@aws-sdk/client-s3')

const s3 = require('@auth0/s3')
const archiver = require('archiver')
const PromisePool = require('@supercharge/promise-pool')
const { config } = require('./config')
const { isProd } = require('../utils/utils')
// const { nonAccentVietnamese }   = require('../utils/string_utils');
// const { getExtension }          = require('../utils/utils');

const s3Options = {
  accessKeyId: config.aws_access_key_id,
  secretAccessKey: config.aws_secret_access_key,
  region: config.aws_region,
}

const s3Object = new S3({
  region: s3Options.region,
  ...(!isProd() && {
    credentials: {
      accessKeyId: s3Options.accessKeyId,
      secretAccessKey: s3Options.secretAccessKey,
    },
  }),
})

const s3Client = s3.createClient({
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options,
})

/**
 * @deprecated
 * Use uploadFileS3V2 instead
 */
const uploadFileS3 = (pathFile, fileName) => {
  const fileContent = fs.readFileSync(pathFile)
  const bucket = process.env.AWS_BUCKET_DEMO
  const key = `files/temporary_uploads/${fileName}`

  // Setting up S3 upload parameters
  const params = {
    Bucket: bucket,
    ACL: 'public-read',
    Key: key, // File name you want to save as in S3
    Body: fileContent,
  }

  return new Upload({
    client: s3Object,
    params,
  }).done()
}

/**
 * @deprecated
 * Use downloadFileS3V2 instead
 */
const downloadFileS3 = async (
  pathDownload,
  fileName,
  filePath,
  fileNameLocal
) => {
  return new Promise(async (resolve) => {
    const params = {
      localFile: `${pathDownload}/${fileNameLocal}`,
      s3Params: {
        Bucket: `${config.bucket}`,
        Key: `${filePath}/${fileName}`,
      },
    }

    const downloader = await s3Client.downloadFile(params)

    downloader.on('error', function (err) {
      console.error('-----unable to download:', err.stack)
      resolve({ error: true, message: 'cant_get_file' })
    })

    downloader.on('progress', function () {
      console.log(
        '-----progress',
        downloader.progressAmount,
        downloader.progressTotal
      )
    })

    downloader.on('end', function () {
      console.log('-----download done')
      resolve({ error: false, message: 'download done' })
    })
  })
}

const uploadFileS3V2 = (uploadParams) => {
  const bucketName = `${config.bucketDemo}`
  const key = `files/temporary_uploads`

  const params = {
    Bucket: bucketName,
    Key: key,
    ACL: 'public-read',
    ...uploadParams,
  }
  return new Upload({
    client: s3Object,
    params,
  }).done()
}

const downloadFileS3V2 = (params) => {
  return new Promise(async (resolve) => {
    const KeyDefault = `${uuidv4()}-${Date.now()}.zip` // File name you want to save as in S3

    const {
      folderName,
      fileName,
      zipTo,
      bucketName = config.bucketDemo,
    } = params

    // Set the parameters for listing objects in the folder
    const listObjectsParams = {
      Bucket: bucketName,
      Prefix: folderName,
    }

    // List objects in the folder
    s3Object.listObjectsV2(listObjectsParams, async (err, data) => {
      if (err) {
        console.error('Error listing objects:', err)
      } else {
        // Create a new archiver instance
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Set compression level (optional)
        })

        const passThrough = new stream.PassThrough()

        const params = {
          Bucket: bucketName,
          Key: zipTo
            ? `${zipTo}/${fileName}`
            : `files/temporary_uploads/${KeyDefault}`,
          Body: passThrough,
          ACL: 'public-read',
          ContentType: 'application/zip',
        }
        try {
          const data = await new Upload({
            client: s3Object,
            params,
          }).done()
          console.log(`File uploaded successfully. ${data.Location}`)
          resolve(data.Location)
        } catch (err) {
          console.error('Error uploading file:', err)
        }

        // Pipe the archive to the output stream
        archive.pipe(passThrough)

        // Iterate through each object in the folder and add it to the archive
        await PromisePool.for(data.Contents)
          .withConcurrency(10)
          .process(async (object) => {
            const getObjectParams = {
              Bucket: bucketName,
              Key: object.Key,
            }
            const response = await s3Object.getObject(getObjectParams)
            archive.append(response.Body, { name: object.Key })
          })

        // Finalize the archive
        archive.finalize()
      }
    })
  })
}

/**
 *
 * Example:
    Bucket: 'trx-demo-003',
    CopySource: 'trx-main/root/storage/5dfe4b9051dc622100bb9d89/6046ac97b55525368b105d62/633c0c684a8b661cf2034aeb/6344b456c5cb9e2fe1887260/image.png___d1133192-2b21-48a2-99c7-db9624c3020f.png',
    Key: 'files/temp/vhm/QUAN_LY_DỐI_TAC/image.png___d1133192-2b21-48a2-99c7-db9624c3020f-new.png'
*/
const copyFileS3 = (copyParams) => {
  return new Promise((resolve) => {
    const bucketName = `${config.bucketDemo}`

    const params = {
      Bucket: bucketName,
      ACL: 'public-read',
      ...copyParams,
    }

    // Copy files to the bucket
    s3Object.copyObject(params, function (err, data) {
      if (err) return resolve(err)

      console.log(`Copy file successfully`)
      resolve(data)
    })
  })
}

const listObjectsS3 = (listParams) => {
  return new Promise((resolve) => {
    const bucketName = `${config.bucketDemo}`
    const bucketPath = `${config.bucketPath}/`

    const params = {
      Bucket: bucketName,
      Prefix: bucketPath,
      ...listParams,
    }

    s3Object.listObjectsV2(params, function (err, data) {
      if (err) return resolve(err)
      resolve(data)
    })
  })
}

const zipFileToS3 = async (files, key) => {
  return new Promise(async (resolve, reject) => {
    const archiveStream = archiver('zip')

    const passThrough = new stream.PassThrough()

    const Bucket = `${config.bucketDemo}/files/temp`
    const Key = key ? `${key}.zip` : `${uuidv4()}-${Date.now()}.zip` // File name you want to save as in S3

    const params = {
      Bucket,
      Key,
      Body: passThrough,
      ACL: 'public-read',
      ContentType: 'application/zip',
    }
    try {
      const data = await new Upload({
        client: s3Object,
        params,
      }).done()
      console.log(`File uploaded successfully. ${data.Location}`)
      resolve(data)
    } catch (err) {
      console.error('Error uploading file:', err)
      reject(err)
    }

    archiveStream.pipe(passThrough)

    await PromisePool.for(files)
      .handleError(reject)
      .withConcurrency(10)
      .process(async (file) => {
        const splits = file.path.split('/')
        const fileName = splits.pop()
        const filePath = splits.join('/').slice(1)

        const params = {
          Bucket: config.bucket,
          Key: `${filePath}/${fileName}`,
        }

        const response = await s3Object.getObject(params)
        archiveStream.append(response.Body, {
          name: path.basename(file.path),
        })
      })

    archiveStream.on('error', (error) => {
      console.error('Archival encountered an error:', error)
      reject(error)
    })

    archiveStream.finalize()
  })
}

module.exports = {
  uploadFileS3,
  downloadFileS3,
  uploadFileS3V2,
  downloadFileS3V2,
  copyFileS3,
  listObjectsS3,
  zipFileToS3,
}
