'use strict'

const { isProd } = require('../utils/utils')
let MONGODB_URL = process.env.MONGODB_CONNECTION_URI || ''

if (!MONGODB_URL) {
    const databaseConfig = require('./cf_database')

    if (isProd()) {
        MONGODB_URL = `${
            databaseConfig.production._mongod_user === ''
                ? 'mongodb://' +
                  databaseConfig.production._mongodb_host +
                  ':' +
                  databaseConfig.production._mongodb_port +
                  '/' +
                  databaseConfig.production._mongod_name
                : 'mongodb://' +
                  databaseConfig.production._mongod_user +
                  ':' +
                  databaseConfig.production._mongodb_pass +
                  '@' +
                  databaseConfig.production._mongodb_host +
                  ':' +
                  databaseConfig.production._mongodb_port +
                  '/' +
                  databaseConfig.production._mongod_name
        }`
    } else {
        MONGODB_URL = `${
            !databaseConfig.development._mongod_user
                ? 'mongodb://' +
                  databaseConfig.development._mongodb_host +
                  ':' +
                  databaseConfig.development._mongodb_port +
                  '/' +
                  databaseConfig.development._mongod_name
                : 'mongodb://' +
                  databaseConfig.development._mongod_user +
                  ':' +
                  databaseConfig.development._mongodb_pass +
                  '@' +
                  databaseConfig.development._mongodb_host +
                  ':' +
                  databaseConfig.development._mongodb_port +
                  '/' +
                  databaseConfig.development._mongod_name
        }`
    }
}

exports.MONGODB_URL = MONGODB_URL
