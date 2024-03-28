
"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("facebook_conversation", {
    contactID: {
        type: Schema.Types.ObjectId,
        ref: "contact"
    },

    id: {
        type: String,
        unique: true,
        require: true,
    },
    time: String,
});
