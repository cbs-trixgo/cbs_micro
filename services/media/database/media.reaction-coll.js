"use strict";

const DATABASE_MIDDLEWARE   = require('../../../tools/db/database.middleware');
const Schema                = require('mongoose').Schema;

module.exports  = DATABASE_MIDDLEWARE("media_reaction", {
    /**
     * Bài viết 
     */
    media: {
        type    :  Schema.Types.ObjectId,
        ref     : 'media'
    },

    /**
     * Loại tương tác, like, tim, haha ...
     * { value: 1, text: 'Thích', image: '1f44d.png' },
     * { value: 2, text: 'Thả tim', image: '2764.png' },
     * { value: 3, text: 'Cười sặc sụa', image: '1f606.png' },
     * { value: 4, text: 'Ngạc nhiên', image: '1f62e.png' },
     * { value: 5, text: 'Buồn thương', image: '1f622.png' },
     * { value: 6, text: 'Giận dữ', image: '1f620.png' },
     */
    type: {
        type: Number,
        default: 1
    },

    /**
     *  Người tạo
     */
    author: {
        type    :  Schema.Types.ObjectId,
        ref     : 'user'
    },
})