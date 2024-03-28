"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');

const Schema    = require('mongoose').Schema;
/**
 *  Chức danh trong công ty
 */
module.exports  = DATABASE_MIDDLEWARE("position", {
    //_________Thuộc về công ty nào  
    company: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    //_________Phần tử cha
    parent: {
        type: Schema.Types.ObjectId,
        ref: "warehouse"
    },
    level: {
        type: Number,
        default: 1 
    },
    //_________Tên
    name: String,
    //_________Mô tả
    description: String,
    userCreate: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    }
})