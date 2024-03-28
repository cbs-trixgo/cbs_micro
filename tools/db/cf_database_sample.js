'use strict'

module.exports = {
    development: {
        _mongod_name: process.env.MONGO_DB || 'cbs_staging',
        _mongod_user: process.env.MONGO_USER || '',
        _mongodb_pass: process.env.MONGO_PWD || '',
        _mongodb_host: process.env.MONGO_HOST || 'localhost',
        _mongodb_port: process.env.MONGO_PORT || '27017',
    },

    production: {
        _mongod_name: process.env.MONGO_DB || 'cbs_staging',
        _mongod_user: process.env.MONGO_USER || 'admin_cbs',
        _mongodb_pass: process.env.MONGO_PWD || 'dAGT5ttW6CLrsTuw',
        _mongodb_host: process.env.MONGO_HOST || 'localhost',
        _mongodb_port: process.env.MONGO_PORT || '27017',
    },
}

// Xử lý Authen cho việc truy cập DB
// db.createUser({ user: "admin_cbs",
//                  pwd: "dAGT5ttW6CLrsTuw",
//                  roles: [{ role: "readWrite", db: "cbs_staging" }] })
