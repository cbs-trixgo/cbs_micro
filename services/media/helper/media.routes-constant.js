const BASE_ROUTE = '/medias';
const COMMENTS = '/comments';
const REACTIONS = '/reactions';

const CF_ROUTINGS_MEDIA = {
    ORIGIN_APP: BASE_ROUTE,

    MAIN_MEDIA                  		        : `${BASE_ROUTE}`,
    UPDATE_VIEW_MEDIA                  		    : `${BASE_ROUTE}/views`,
    LIST_SEEN_MEDIA                  		    : `${BASE_ROUTE}/seens`,
    INFO_MEDIA                  		        : `${BASE_ROUTE}/:mediaID`,
    SAVE_MEDIA                  		        : `${BASE_ROUTE}/save`,
    PIN_MEDIA                  		            : `${BASE_ROUTE}/pin`,
    FILE_MEDIA                  		        : `${BASE_ROUTE}/files`,

    REACTION_MEDIA                              : `${BASE_ROUTE}${REACTIONS}`,
    REACTION_FILE               		        : `${BASE_ROUTE}${REACTIONS}/file`,

    REACTION_COMMENT_MEDIA                      : `${BASE_ROUTE}${REACTIONS}${COMMENTS}/media`,
    REACTION_COMMENT_FILE       		        : `${BASE_ROUTE}${REACTIONS}${COMMENTS}/file`,
    REACTION_COMMENT       		                : `${BASE_ROUTE}${REACTIONS}${COMMENTS}`,

    COMMENT_MEDIA     		                    : `${BASE_ROUTE}${COMMENTS}`,
    COMMENT_FILE     		                    : `${BASE_ROUTE}${COMMENTS}/file`,
}

exports.CF_ROUTINGS_MEDIA = CF_ROUTINGS_MEDIA;