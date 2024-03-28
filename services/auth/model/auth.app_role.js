"use strict";
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }  = require('../../../tools/utils/utils');
const { KEY_ERROR }                     = require('../../../tools/keys');

/**
 * import inter-coll, exter-coll
 */
const AUTH__APP_ROLE_COLL                   = require('../database/permission/auth.app_role-coll');
const AUTH__APP_USER_COLL                   = require('../database/permission/auth.app_user-coll');
const { RANGE_BASE_PAGINATION_V2 } 	        = require('../../../tools/cursor_base/playground/index');

/**
 * import inter-model, exter-model
 */
class Model extends BaseModel {               

    constructor() {
        super(AUTH__APP_ROLE_COLL);
    }

    /**
     * Name: insert app role 
     * Author: Depv
     * Code: 
     */
    insert({ type, company, app, name, description, userID }) { 
        return new Promise(async (resolve) => {
            try {
                if(!type)
                    return resolve({ error: true, message: "Type không hợp lệ", keyError: "type_invalid", status: 400 });

                if(!name)
                    return resolve({ error: true, message: "Tên không hợp lệ", keyError: "name_invalid", status: 400 });

                if(!checkObjectIDs(company))
                    return resolve({ error: true, message: "Mã công ty không hợp lệ", keyError: "company_invalid", status: 400 });

                if(!checkObjectIDs(app))
                    return resolve({ error: true, message: "Mã ứng dụng không hợp lệ", keyError: "app_invalid", status: 400 });

                if(!checkObjectIDs(userID))
                    return resolve({ error: true, message: "Người tạo không hợp lệ", keyError: "userID_invalid", status: 400 });

                // Kiểm tra chỉ cho khởi tạo nếu là Admin của app (level trong app_user=0)  
                let checkPermission = await AUTH__APP_USER_COLL.findOne({ app, user: userID });
                if(!checkPermission || checkPermission.level != 0)
                    return resolve({ error: true, message: "Bạn không đủ quyền", keyError: KEY_ERROR.PERMISSION_DENIED, status: 400 });

                let dataInsert = { type, company, app, name, userCreate: userID, userUpdate: userID, members: [userID] };

                if(description){
                    dataInsert.description = description;
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: "Thêm thất bại", keyError: KEY_ERROR.INSERT_FAILED, status: 422 });
 
                return resolve({ error: false, data: infoAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: update app role 
     * - Lưu ý: không được phép update Type của Role. Khi tạo mới, type như thế nào thì giữ nguyên như vậy
     * Author: Depv
     * Code: 
     */
    update({ appRoleID, name, description, userID, membersAddID, membersRemoveID }) { 
        return new Promise(async (resolve) => {
            try {
                
                if(!checkObjectIDs(appRoleID))
                    return resolve({ error: true, message: "Mã nhóm chức năng không hợp lệ", keyError: "appRoleID_invalid", status: 403 });
                
                let dataUpdate = { modifyAt: new Date(), userUpdate: userID };
                if(name){
                    dataUpdate.name = name;
                }

                if(description){
                    dataUpdate.description = description;
                }

                if(checkObjectIDs(membersAddID)){
                    dataUpdate.$addToSet = {
                        members: membersAddID
                    }
                }

                if(checkObjectIDs(membersRemoveID)){
                    dataUpdate.$pullAll = {
                        members: membersRemoveID
                    }
                }
                
                let infoAfterUpdate = await AUTH__APP_ROLE_COLL.findByIdAndUpdate(appRoleID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: KEY_ERROR.UPDATE_FAILED, status: 403 });
 
                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Remove app role 
     * Author: Depv
     * Code: 
     */
    remove({ appRoleID }) { 
        return new Promise(async (resolve) => {
            try {
                if(!checkObjectIDs(appRoleID))
                    return resolve({ error: true, message: 'Mã nhóm chức năng không hợp lệ', keyError: "appRoleID_invalid", status: 400 });

                let infoAterRemove = await AUTH__APP_ROLE_COLL.findByIdAndDelete(appRoleID);
                if(!infoAterRemove)
                    return resolve({ error: true, message: 'Xóa thất bại', keyError: KEY_ERROR.DELETE_FAILED, status: 403 });
               
                //Bước tiếp theo xóa app_role_menu

                return resolve({ error: false, data: infoAterRemove, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Remove app role 
     * Author: Depv
     * Code: 
     */
    removeMany({ appRoleIDs }) { 
        return new Promise(async (resolve) => {
            try {
                if(!checkObjectIDs(appRoleIDs))
                    return resolve({ error: true, message: 'Mã nhóm chức năng không hợp lệ', keyError: "appRoleIDs_invalid", status: 400 });
                    
                let infoAterRemove = await AUTH__APP_ROLE_COLL.deleteMany({ _id: { $in: appRoleIDs }});
                if(!infoAterRemove)
                    return resolve({ error: true, message: 'Xóa thất bại', keyError: KEY_ERROR.DELETE_FAILED, status: 403 });
                console.log({ appRoleIDs });
                return resolve({ error: false, data: infoAterRemove, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: get app role 
     * Author: Depv
     * Code: 
     */
    getInfo({ appRoleID, select, populates }) { 
        return new Promise(async (resolve) => {
            try {
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

                if(!checkObjectIDs(appRoleID))
                    return resolve({ error: true, message: "Mã nhóm chức năng không hợp lệ",keyError: 'appRoleID_invalid', status: 400 });

                let infoDataAfterGet = await AUTH__APP_ROLE_COLL.findById(appRoleID)
                                    .select(select)
                                    .populate(populates)
                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Lấy thông tin thấy bại", keyError: KEY_ERROR.GET_INFO_FAILED, status: 403 });
 
                return resolve({ error: false, data: infoDataAfterGet, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
    
    /**
     * Name  : Danh sách app role
     * Author: Depv
     * Code  : 
     */
    getList({ type, company, app, isMember, userID,
        keyword, limit = 10, lastestID, select, populates = {} }) { 
            // console.log({type, company, app, isMember, userID, keyword, limit, lastestID, select, populates})
        return new Promise(async (resolve) => {
            try {
                if(limit > 20){
                    limit = 20
                }else{
                    limit = +limit
                }

                let conditionObj = { };
                let sortBy;
                let keys	     = ['createAt__-1', '_id__-1']; 

                if(type){
                    conditionObj.type = type;
                }

                if(company){
                    conditionObj.company = company;
                }

                if(app){
                    conditionObj.app = app;
                }

                if(isMember == 1){
                    conditionObj.members = { $in: [userID] }
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

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj.name = new RegExp(keyword, 'i');
                }
                // console.log(conditionObj)

                let conditionObjOrg = { ...conditionObj };
                // PHÂN TRANG KIỂU MỚI
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await AUTH__APP_ROLE_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastest", status: 400 });
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });
                    conditionObj = dataPagingAndSort.data.find;
					sortBy = dataPagingAndSort.data.sort;
				}else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
					sortBy = dataPagingAndSort.data.sort;
                }
                
                let infoDataAfterGet = await AUTH__APP_ROLE_COLL.find(conditionObj)
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

                let totalRecord = await AUTH__APP_ROLE_COLL.count(conditionObjOrg);
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