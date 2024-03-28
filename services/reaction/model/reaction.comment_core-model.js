"use strict";

const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }  = require('../../../tools/utils/utils');

/**
 * COLLECTION
 */
const REACTION__COMMENT_CORE_COLL       = require('../database/reaction.comment_core-coll');

class Model extends BaseModel {
    constructor() {
        super(REACTION__COMMENT_CORE_COLL);
    }

    /**
     * Name: Thêm comment core
     * Author: Depv
     * Code: F0271
     */
    insert({ content, files, images, userID }) {
        const that = this;
        return new Promise(async (resolve) => {
             try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataInsert = {};
                /** 
                 * VALIDATION STEP (2)
                 *  - kiểm tra valid từ các input
                 *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if(!checkObjectIDs(userID))
                  return resolve({ error: true, message: "Request params userID invalid" });

                if(!content)
                    return resolve({ error: true, message: "Request params content invalid" })
                
                /**
                 * LOGIC STEP (3)
                 *  3.1: convert type + update name (ví dụ: string -> number)
                 *  3.2: operation database
                 */    

                dataInsert.content  = content;
                dataInsert.author   = userID;

                if(checkObjectIDs(files)){
                    dataInsert.files    = files;
                }

                if(checkObjectIDs(images)){
                    dataInsert.images    = images;
                }

                let infoAfterInsert = await that.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'cannot_insert' });
                return resolve({ error: false, data: infoAfterInsert});
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Sửa comment core
     * Author: Depv
     * Code: F0272
     */
    update({ commentCoreID, authorID, content, files, images, amountCommentReply, amountReaction }) {
        return new Promise(async (resolve) => {
            try {
               /**
                * DECALARTION VARIABLE (1)
                */
               let dataUpdate = {};

               /** 
                * VALIDATION STEP (2)
                *  - kiểm tra valid từ các input
                *  - kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                */
                if(!checkObjectIDs(commentCoreID))
                    return resolve({ error: true, message: "Request params commentCoreID invalid" });

                if(!checkObjectIDs(authorID))
                    return resolve({ error: true, message: "Request params authorID invalid" });

               /**
                * LOGIC STEP (3)
                *  3.1: convert type + update name (ví dụ: string -> number)
                *  3.2: operation database
                */    
                content && (dataUpdate.content = content);

                if(amountCommentReply){
                    dataUpdate.$inc = {
                        amountCommentReply
                    }
                }

                if(amountReaction){
                    dataUpdate.$inc = {
                        amountReaction
                    }
                }

                // CẬP NHẬT FILE MỚI
                if(checkObjectIDs(files)){
                    dataUpdate.files = files;
                } else{
                    dataUpdate.files = [];
                }

                // CẬP NHẬT HÌNH ẢNH MỚI
                if(checkObjectIDs(images)){
                    dataUpdate.images = images;
                } else{
                    dataUpdate.images = [];
                }

                let infoAfterAction = await REACTION__COMMENT_CORE_COLL.findOneAndUpdate({
                    _id: commentCoreID,
                    author: authorID
                }, dataUpdate);

                if(!infoAfterAction)
                    return resolve({ error: true, message: 'cannot_update' });

                infoAfterAction = await REACTION__COMMENT_CORE_COLL
                    .findById(infoAfterAction._id)
                    .populate({
                        path: 'files images author',
                        select: '_id name path size type fullname image',
                    })
                    .lean();

                return resolve({ error: false, data: infoAfterAction });
            } catch (error) {
                console.error(error);
                return resolve({ error: true, message: error.message });
            }
       })
    }

    /**
     * Name: Lấy thông tin comment core 
     * Author: Depv
     * Code: 
     */
    getInfo({ commentCoreID, select, populates }){
        return new Promise(async resolve => {
            try {

                if (!checkObjectIDs(commentCoreID))
                    return resolve({ error: true, message: 'param_invalid' });

                // populates
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

                let infoComment = await REACTION__COMMENT_CORE_COLL.findById(taskID)
                                .select(select)
                                .populate(populates)

				if (!infoComment) return resolve({ error: true, message: 'cannot_get_info_comment' });

                return resolve({ error: false, data: infoComment });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

}
exports.MODEL = new Model;