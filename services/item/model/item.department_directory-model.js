"use strict";
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, checkNumberIsValidWithRange, checkNumberValid, IsJsonString }                        
                                        = require('../../../tools/utils/utils');
const stringUtils					    = require('../../../tools/utils/string_utils');
const { setTimeZone  }                  = require('../../../tools/utils/time_utils');
const ObjectID                          = require('mongoose').Types.ObjectId;

/**
 * DOMAIN AND ACTIONS
 */
const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_ITEM } 		        = require('../helper/item.actions-constant');
const { CF_ACTIONS_AUTH }               = require('../../auth/helper/auth.actions-constant');

/**
 * TOOLS
 */
const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');
const { getCurrentPage }			    = require('../../../tools/utils/calculate_current_page');

/**
 * COLLECTIONS
 */
const ITEM__DEPARTMENT_DIRECTORY_COLL            				= require('../database/item.department_directory-coll');
const AUTH_USER_COLL            				                = require('../../auth/database/auth.user-coll');

class Model extends BaseModel {
    
    constructor() {
        super(ITEM__DEPARTMENT_DIRECTORY_COLL);
    }

    /**
	 * Dev : Depv
	 * Func: Tạo danh bạ dự án phòng ban
	 * Date: 13/12/2021
	 */
	insert({ projectID, member, type, name, description, lock, userID, order, ctx }){
        // console.log({projectID, member, type, name, description, lock, userID, order})
        return new Promise(async resolve => {
            try {
                let infoData = await ITEM__DEPARTMENT_DIRECTORY_COLL.findOne({department: projectID, member: member})
                // console.log(infoData)
                if(infoData)
                    return resolve({ error: true, message: "member_exists_in_project" });

                let dataInsert = {
                    userCreate: userID,
                }

                if(member){
                    dataInsert.member = member;
                    let infoMember = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`, {
                        userID: member, select: "_id company"
                    })

                    dataInsert.company = infoMember.data.company;
                }

                if(projectID && checkObjectIDs(projectID)){
                    dataInsert.department = projectID;
                }

                if(type){
                    dataInsert.type = type;
                }

                if(name){
                    dataInsert.name = name;
                }

                if(description){
                    dataInsert.description = description;
                }

                if(lock){
                    dataInsert.lock = lock;
                }

                if(order){
                    dataInsert.order = order;
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: "cannot_insert" });

                return resolve({ error: false, data: infoAfterInsert });

            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
	 * Dev : Depv
	 * Func: update danh bạ dự án phòng ban
	 * Date: 13/12/2021
	 */
	update({ departmentDirectoryID, member, type, name, description, lock, userID }){
        return new Promise(async resolve => { 
            try {
                if(!checkObjectIDs(departmentDirectoryID))
                    return resolve({ error: true, message: "departmentDirectoryID không hợp lệ", keyError: "Request params departmentDirectoryID invalid" });

                let dataUpdate = {
                    userUpdate: userID, modifyAt: new Date()
                }

                // if(member){
                //     dataUpdate.member = member;
                // }

                if(type){
                    dataUpdate.type = type;
                }

                if(name){
                    dataUpdate.name = name;
                }

                if(description){
                    dataUpdate.description = description;
                }
                dataUpdate.lock = lock;
                let infoAfterUpdate = await ITEM__DEPARTMENT_DIRECTORY_COLL.findByIdAndUpdate(departmentDirectoryID, dataUpdate, { new: true });
                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: get info danh bạ dự án phòng ban 
     * Author: Depv
     * Code: 
     */
    getInfo({ departmentDirectoryID, select, populates }) { 
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */

                /** 
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if(!checkObjectIDs(departmentDirectoryID))
                    return resolve({ error: true, message: 'Request params departmentDirectoryID invalid', status: 400 });
                
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
                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                let infoAterGet = await ITEM__DEPARTMENT_DIRECTORY_COLL.findById(departmentDirectoryID)
                                    .select(select)
                                    .populate(populates)
                if(!infoAterGet)
                    return resolve({ error: true, message: "can't_get_info", status: 200 });
 
                return resolve({ error: false, data: infoAterGet, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
    
    /**
     * Name  : Danh sách danh bạ dự án phòng ban 
     * Author: Depv
     * Code  : 
     */
    getList({
        companyID, projectID,
        keyword, limit = 10, lastestID, select, populates= {} }) { 
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * Kiểm tra findone
                 */

                if(limit > 20){
                    limit = 20
                }else{
                    limit = +limit;
                }
                /**
                 * DECALARTION VARIABLE (1)
                 */
                let sortBy;
                let conditionObj = { };
                let keys	 = ['createAt__-1', '_id__-1'];

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

                if(companyID && checkObjectIDs(companyID)){
                    conditionObj.company = companyID;
                }

                if(projectID && checkObjectIDs(projectID)){
                    conditionObj.department = projectID;
                }

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';

                    let listMemberInDepartmentDirectory = await ITEM__DEPARTMENT_DIRECTORY_COLL.find({ department: projectID }).select("member");
                    let membersID = listMemberInDepartmentDirectory.map(item => item.member);
                    let membersIDByKeyword = await AUTH_USER_COLL.find({ _id: { $in: membersID }, fullname: new RegExp(keyword, 'i') }).select("_id");
                    conditionObj.member = { $in: membersIDByKeyword.map(item => item._id)};
                }
                
                let conditionObjOrg = { ...conditionObj };
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await ITEM__DEPARTMENT_DIRECTORY_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastest", status: 200 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 200 });

                    conditionObj = dataPagingAndSort.data.find;
					sortBy       = dataPagingAndSort.data.sort;
				}else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy       = dataPagingAndSort.data.sort;
                }
                
                let infoDataAfterGet = await ITEM__DEPARTMENT_DIRECTORY_COLL.find(conditionObj)
                    .select(select)
                    .limit(limit+1)
                    .sort(sortBy)
                    .populate(populates)
                    .lean(); 

                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data", status: 403 });

                let nextCursor	= null;
                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await ITEM__DEPARTMENT_DIRECTORY_COLL.count(conditionObjOrg);
                let totalPage   = Math.ceil(totalRecord/limit);

                return resolve({ error: false, data: {
                    listRecords: infoDataAfterGet,
                    limit,
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
