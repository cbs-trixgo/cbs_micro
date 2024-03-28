const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("media_save", {
    /**
     * Bài viết 
     */
    media: {
        type    :  Schema.Types.ObjectId,
        ref     : 'media'
    },
    /**
     *  Người lưu bài viết
     */
    author: {
        type    :  Schema.Types.ObjectId,
        ref     : 'user'
    },
})