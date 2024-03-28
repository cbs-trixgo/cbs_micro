"use strict";
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }  = require('../../../tools/utils/utils');
const { KEY_ERROR }                     = require('../../../tools/keys/index');

/**s
 * import inter-coll, exter-coll
 */
const AUTH__APP_COLL                        = require('../database/permission/auth.app-coll');

const { RANGE_BASE_PAGINATION_V2 } 	        = require('../../../tools/cursor_base/playground/index');

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {               
    
    constructor() {
        super(AUTH__APP_COLL)
    }
    
    getList({ lock, limit = 50, lastestID, select, populates = {} }) { 
        // console.log({ lock, limit, lastestID, select, populates })
        return new Promise(async (resolve) => {
            try {
                // if(limit > 50){
                //     limit = 50
                // }else{
                //     limit = +limit
                // }

                let limit = 50

                let conditionObj = {};
                let sortBy;
                let keys	 = ['createAt__1', '_id__1'];

                if(lock){
                    conditionObj.lock = Number(lock);
                }
                
                if(populates && typeof populates === 'string'){
					if(!IsJsonString(populates))
						return resolve({ error: true, message: 'Request params populates invalid', status: 400 });

					populates = JSON.parse(populates);
				}else{
                    populates = {
                        path: "",
                        select: ""
                    }
                }
 
                let conditionObjOrg = { ...conditionObj };

				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await AUTH__APP_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastest", status: 400 });
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj = dataPagingAndSort.data.find;
					sortBy       = dataPagingAndSort.data.sort;
				}else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
					sortBy                = dataPagingAndSort.data.sort;
                }
                
                let infoDataAfterGet = await AUTH__APP_COLL.find(conditionObj)
                    .select(select)
                    .limit(+limit+1)
                    .populate(populates)
                    .sort(sortBy)
                    .lean();

                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Lấy danh sách thất bại", keyError: KEY_ERROR.GET_LIST_FAILED, status: 403 });
                    
                let nextCursor	= null;
                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await AUTH__APP_COLL.count(conditionObjOrg);
                let totalPage = Math.ceil(totalRecord/limit);

                return resolve({ error: false, data: {
                    listRecords: infoDataAfterGet,
                    limit: +limit,
                    totalRecord,
                    totalPage,
                    nextCursor,
                }, status: 200 });
                
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model;