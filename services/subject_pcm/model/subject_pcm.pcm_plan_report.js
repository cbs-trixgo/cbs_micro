"use strict";

const XlsxPopulate                      = require('xlsx-populate');
const fs                                = require('fs');
const path                              = require('path');
const moment                            = require('moment');
const ObjectID                          = require('mongoose').Types.ObjectId;

const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString, validateParamsObjectID }  = require('../../../tools/utils/utils');
// const { removeHtmlTag }                 = require('../../../tools/utils/string_utils');
const { KEY_ERROR }			            = require('../../../tools/keys');
const { PCM_STATUS_TASK }			    = require('../../../tools/constants');
const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');
const { uploadFileS3 }                  = require('../../../tools/s3');

/**
 * import inter-coll, exter-coll
 */
const PCM_PLAN_REPORT_COLL              = require('../database/subject_pcm.pcm_plan_report-coll');
const PCM_PLAN_TASK_MODEL               = require('../model/subject_pcm.pcm_plan_task').MODEL;


class Model extends BaseModel {

    constructor() {
        super(PCM_PLAN_REPORT_COLL);
    }

    /**
     * Name: insert pcm_plan_report
     * Author: Depv
     * Code:
     */
    insert({ companyID, projectID, type, name, description, conditionPin, parentID, userID }) {
        // console.log('============Tạo báo cáo động===============')
        // console.log({ companyID, projectID, type, name, description, conditionPin, parentID, userID })
        return new Promise(async (resolve) => {
            try {

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let dataInsert = { };

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if(!checkObjectIDs(userID))
                    return resolve({ error: true, message: 'Request params userID invalid', status: 400 });

                if(!checkObjectIDs(companyID))
                    return resolve({ error: true, message: 'Request params companyID invalid', status: 400 });

                /**
                 * LOGIC STEP (3)
                 * 3.1: Convert type + update name (ví dụ: string -> number)
                 * 3.2: Operation database
                 */
                dataInsert = { 
                    company: companyID, 
                    author: userID, 
                    userUpdate: userID, 
                    members: [userID] 
                }

                if(type){
                    dataInsert.type = type;
                }

                if(name){
                    dataInsert.name = name;
                }

                if(description) {
                    dataInsert.description = description;
                }

                if(conditionPin){
                    dataInsert.conditionPin = conditionPin;
                }

                if(ObjectID.isValid(parentID)){
                    dataInsert.parent = parentID;
                }

                if(ObjectID.isValid(projectID)){
                    dataInsert.project = projectID;
                }

                let infoAfterInsert = await this.insertData(dataInsert);

                if(!infoAfterInsert)
                    return resolve({ error: true, message: KEY_ERROR.INSERT_FAILED, keyError: KEY_ERROR.INSERT_FAILED, status: 403 });

                return resolve({ error: false, data: infoAfterInsert, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

     /**
     * Name: update pcm_plan_report
     * Author: Depv
     * Code:
     */
    update({ reportID, name, type, description, userID, select, members, conditionPin, option, taskID, reportsID, reportsRemoveID }) {
        // console.log('============Cập nhật báo cáo động===============')
        // console.log({ reportID, name, type, description, userID, select, members, conditionPin, option, taskID, reportsID, reportsRemoveID })
        return new Promise(async (resolve) => {
            try {
                if(!option){
                    /**
                     * DECALARTION VARIABLE (1)
                     */
                    let dataUpdate = { userUpdate: userID };

                    /**
                     * VALIDATION STEP (2)
                     *  - Kiểm tra valid từ các input
                     *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                     */
                    if(!checkObjectIDs(userID))
                        return resolve({ error: true, message: 'Request params userID invalid', status: 400 });

                    if(!checkObjectIDs(reportID))
                        return resolve({ error: true, message: 'Request params reportID invalid', status: 400 });

                    /**
                     * LOGIC STEP (3)
                     *  3.1: Convert type + update name (ví dụ: string -> number)
                     *  3.2: Operation database
                     */
                    const infoReport = await PCM_PLAN_REPORT_COLL
                        .findById(reportID)
                        .select('author')
                        .lean();

                    if(!infoReport) {
                        return resolve({
                            error: true,
                            message: 'Report không tồn tại',
                            keyError: 'report_not_exists',
                            status: 403
                        });
                    }

                    if(infoReport.author?.toString() === userID.toString()) {
                        if(members && members.length) {
                            if(checkObjectIDs(members)) {
                                members = [...new Set(members)];
                                dataUpdate.members = members;
                            } else{
                                dataUpdate.members = [];
                            }
                        }
                    } else if(checkObjectIDs(members)){
                        return resolve({
                            error: true,
                            message: 'Bạn không có quyền chia sẻ',
                            keyError: "permission_denined",
                            status: 403
                        });
                    }

                    if(name){
                        dataUpdate.name = name;
                    }

                    if(description) {
                        dataUpdate.description = description;
                    }

                    if(type){
                        dataUpdate.type = type;
                    }

                    if(conditionPin){
                        dataUpdate.conditionPin = conditionPin;
                    }

                    let infoAfterUpdate = await PCM_PLAN_REPORT_COLL
                        .findByIdAndUpdate(reportID, dataUpdate, { new: true })
                        .select(select);

                    if(!infoAfterUpdate)
                        return resolve({ error: true, message: "Can't update pcm plan report", keyError: KEY_ERROR.UPDATE_FAILED, status: 403 });

                    return resolve({ error: false, data: infoAfterUpdate, status: 200 });
                }else{
                    // console.log('================OKKKKKKKKKKKKKKKKKKKKK')
                    for(const item of reportsID){
                        // console.log(item)
                        let info = await PCM_PLAN_REPORT_COLL.findByIdAndUpdate(item, {
                            $addToSet: {
                                subjects: taskID
                            }
                        }, { new: true })
                    }

                    for(const item of reportsRemoveID){
                        // console.log(item)
                        let info = await PCM_PLAN_REPORT_COLL.findByIdAndUpdate(item, {
                            $pull: {
                                subjects: taskID
                            }
                        }, { new: true })
                    }

                    return resolve({ error: false, data: {option, taskID, reportsID}, status: 200 });
                }
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

     /**
     * Name: Remove pcm_plan_report
     * Author: Depv
     * Code: F02503
     */
    remove({ reportsID, userID }) {
        return new Promise(async (resolve) => {
            try {
                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if(!checkObjectIDs(userID))
                    return resolve({ error: true, message: 'Request params userID invalid', status: 400 });

                if(!reportsID.length || !checkObjectIDs(reportsID))
                    return resolve({ error: true, message: 'Request params reportsID invalid', status: 400 });

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */
                const infoAfterUpdate = await PCM_PLAN_REPORT_COLL.deleteMany({
                    _id: {
                        $in: reportsID
                    },
                    author: userID
                });

                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Can't remove subject", keyError: KEY_ERROR.DELETE_FAILED, status: 403 });

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Get info pcm_plan_report
     * Author: Depv
     * Code: F02504
     */
    getInfo({ reportID, select, populates= {} }) {
        return new Promise(async (resolve) => {
            try {
                if(!checkObjectIDs(reportID))
                    return resolve({ error: true, message: 'Request params reportID invalid', status: 400 });

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

                let infoData = await PCM_PLAN_REPORT_COLL.findById(reportID)
                                .select(select)
                                .populate(populates)
                                .lean();
                if(!infoData)
                    return resolve({ error: true, message: "Can't get info subject", keyError: KEY_ERROR.GET_INFO_FAILED, status: 403 })
                // console.log(infoData)

                return resolve({ error: false, data: infoData, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Danh sách pcm_plan_report
     * Author: Depv
     * Code:
     */
    getList({ keyword, limit = 10, lastestID, type, parentID, userID, select, populates= {} }) {
        // console.log('=================>>>>>>>>>>>>>>Báo cáo động================')
        // console.log({ keyword, limit, lastestID, type, parentID, userID, select, populates })
        return new Promise(async (resolve) => {
            try {
                if(limit > 20){
                    limit = 20
                }else{
                    limit = +limit;
                }

                /**
                 * DECALARTION VARIABLE (1)
                 */
                let conditionObj = {  }
                conditionObj.$or = [
                    { author: userID },
                    { members: {$in: [userID]} },
                ]

                let sortBy;
                let keys	 = ['createAt__-1', '_id__-1'];

                /**
                 * VALIDATION STEP (2)
                 *  - Kiểm tra valid từ các input
                 *  - Kiểm tra valid từ database (ví dụ: đảm bảo foreign_key hoặc các điều kiện của coll)
                 */
                if(checkObjectIDs(parentID)){
                    conditionObj.parent = parentID;
                }else{
                    conditionObj.parent = null;
                }

                if(type){
                    conditionObj.type = type;
                }

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

                // SEARCH TEXT
                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj.name = new RegExp(keyword, 'i');
                }

                let conditionObjOrg = { ...conditionObj };

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */
                // GET CONDITION PAGINATION
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await PCM_PLAN_REPORT_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info last message", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
                    if(!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj = dataPagingAndSort.data.find;
                    sortBy       = dataPagingAndSort.data.sort;
				}else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy       = dataPagingAndSort.data.sort;
                }

                let infoDataAfterGet = await PCM_PLAN_REPORT_COLL.find(conditionObj)
                    .limit(+limit+1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data", keyError: KEY_ERROR.GET_LIST_FAILED, status: 403 });

                let totalRecord = await PCM_PLAN_REPORT_COLL.count(conditionObjOrg);
				let nextCursor	= null;
                let totalPage = Math.ceil(totalRecord/limit);

				if(infoDataAfterGet && infoDataAfterGet.length){
					if(infoDataAfterGet.length > limit){
						nextCursor = infoDataAfterGet[limit - 1]._id;
						infoDataAfterGet.length = limit;
					}
				}

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

    /**
     * Dev: MinhVH
     * Func: Export Task Report
     * Date: 28/05/2022
     */
    exportTaskReport({ reportID, userID }) {
        return new Promise(async resolve => {
            try {
                const validation = validateParamsObjectID({ reportID, userID });
                if(validation.error) return resolve(validation);

                const getPercentageCompletion = (startTimeX, expiredTimeX) => {
                    let startTime  = moment(startTimeX);
                    let endTime    = moment(expiredTimeX);
                    let toDateTime = moment();

                    let percentageCompletion = Math.round(100*(toDateTime - startTime)/(endTime - startTime));
                    if(percentageCompletion > 100){
                        percentageCompletion = 100;
                    }

                    if(!percentageCompletion){
                        percentageCompletion = 0;
                    }

                    if(percentageCompletion == "-Infinity"){
                        percentageCompletion = 0;
                    }

                    return percentageCompletion;
                }

                const infoReport = await PCM_PLAN_REPORT_COLL
                    .findById(reportID)
                    .lean();

                if(!infoReport) {
                    return resolve({
                        error: true,
                        message: 'Report không tồn tại hoặc bạn không có quyền xem report',
                        keyError: 'report_not_exists',
                        status: 400
                    });
                }

                const dataTaskByCondition = await PCM_PLAN_TASK_MODEL.getListByFilter({
                    ...infoReport.conditionPin,
                    select: 'name expiredTime startTime percentage assignee note status',
                    populates: JSON.stringify({
                        path: 'assignee',
                        select: 'bizfullname'
                    }),
                    unlimited: true,
                    userID
                })

                if(!dataTaskByCondition || !dataTaskByCondition?.data) {
                    return resolve({
                        error: true,
                        message: 'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurred',
                        status: 422
                    });
                }

                const listTaskPin = dataTaskByCondition?.data || [];

                XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/pcm_13_TaskPin.xlsm')))
                    .then(async workbook => {
                        
                        workbook.sheet("Data").row(1).cell(1).value(infoReport.name.toUpperCase());
                        workbook.sheet("Data").row(2).cell(1).value(infoReport.description);

                        let indexExcel = 4;

                        listTaskPin.map((infoTask, index) => {
                            workbook.sheet("Data").row(indexExcel).cell(1).value(index+1);
                            workbook.sheet("Data").row(indexExcel).cell(2).value(infoTask.name);
                            workbook.sheet("Data").row(indexExcel).cell(3).value(infoTask.expiredTime);

                            workbook.sheet("Data").row(indexExcel).cell(4).value(`${infoTask.percentage}/${getPercentageCompletion(infoTask.startTime, infoTask.expiredTime)}`);

                            workbook.sheet("Data").row(indexExcel).cell(5).value(infoTask.assignee?.bizfullname);

                            if (infoTask.note) {
                                // workbook.sheet("Data").row(indexExcel).cell(8).value(removeHtmlTag(infoTask.note));
                                workbook.sheet("Data").row(indexExcel).cell(8).value(infoTask.note);
                            }

                            workbook.sheet("Data").row(indexExcel).cell(9).value(PCM_STATUS_TASK[infoTask.status - 1].text);

                            indexExcel++;
                        })

                        const now = new Date();
                        const filePath = '../../../files/temporary_uploads/';
                        const fileName = `pcm_13_TaskPin${now.getTime()}.xlsm`;
                        const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                        await workbook.toFileAsync(pathWriteFile);

                        const result = await uploadFileS3(pathWriteFile, fileName);
                        fs.unlinkSync(pathWriteFile);

                        return resolve({ error: false, data: result?.Location, status: 200 });
                    });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model