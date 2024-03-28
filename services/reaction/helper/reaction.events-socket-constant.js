const COMMENT = 'COMMENT';

exports.EVENT_SOCKET_CONSTANT_COMMENT = {

    //========================== CLIENT SEND TO SERVER =============================
    COMMENT_CSS_ADD_COMMENT                     : `${COMMENT}_CSS_ADD_COMMENT`,
    COMMENT_CSS_UPDATE_COMMENT                  : `${COMMENT}_CSS_UPDATE_COMMENT`,
    COMMENT_CSS_DELETE_COMMENT                  : `${COMMENT}_CSS_DELETE_COMMENT`,

    //======================== SERVER SEND TO CLIENT ===========================
    COMMENT_SSC_ADD_COMMENT                     : `${COMMENT}_SSC_ADD_COMMENT`,
    COMMENT_SSC_UPDATE_COMMENT                  : `${COMMENT}_SSC_UPDATE_COMMENT`,
    COMMENT_SSC_DELETE_COMMENT                  : `${COMMENT}_SSC_DELETE_COMMENT`,
}