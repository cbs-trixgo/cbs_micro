"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("training_subject_reaction", {
    //_________Chủ đề
    subject: {
        type    :  Schema.Types.ObjectId,
        ref     : 'training_subject'
    },
    //_________Người reaction
    userCreate: {
        type    :  Schema.Types.ObjectId,
        ref     : 'user'
    }
})