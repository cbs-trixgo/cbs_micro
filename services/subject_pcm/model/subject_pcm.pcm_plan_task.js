"use strict";

const BaseModel                         = require('../../../tools/db/base_model');
const PromisePool				        = require('@supercharge/promise-pool');
const ObjectID                          = require('mongoose').Types.ObjectId;
const moment                            = require('moment')
const XlsxPopulate                      = require('xlsx-populate');
const path                              = require('path');
const fs                                = require('fs');

/**
 * Import utils, constants
 */
const { CF_DOMAIN_SERVICES } 		            = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_ANALYSIS }                   = require('../../analysis/helper/analysis.actions-constant');
const { CF_ACTIONS_FILE } 				        = require('../../file/helper/file.actions-constant');
const { CF_ACTIONS_AUTH }                       = require('../../auth/helper/auth.actions-constant');
const { CF_ACTIONS_ITEM } 		                = require('../../item/helper/item.actions-constant');
const { CF_ACTIONS_REMINDER }                   = require('../../reminder/helper/reminder.actions-constant');
const { CF_ACTIONS_SUBJECT_PCM }                = require('./../helper/subject_pcm.actions-constant');

const {
    checkObjectIDs,
    IsJsonString,
    validateParamsObjectID
} = require('../../../tools/utils/utils');

const stringUtils					            = require('../../../tools/utils/string_utils');
const { addDate, calculateExpire }              = require('../../../tools/utils/time_utils');
const { KEY_ERROR, APP_KEYS, LANGUAGE_KEYS }    = require('../../../tools/keys');
const { sendNoticeToMember }                    = require('../../../tools/mailer/module/notice_pcm_task');
const { ENV_DEVICE_WEB_CBS }                    = require('../../notification/helper/notification.keys-constant');
const { RANGE_BASE_PAGINATION_V2 } 	            = require('../../../tools/cursor_base/playground/index');
const { PCM_STATUS_TASK }			            = require('../../../tools/constants');
const { uploadFileS3 }                          = require('../../../tools/s3');

/**
 * import inter-coll, exter-coll
 */
const COMPANY_COLL                      = require('../../auth/database/auth.company-coll')
const USER_COLL                         = require('../../auth/database/auth.user-coll')
const DEPARTMENT_COLL                   = require('../../item/database/item.department-coll')
const CONTRACT_COLL                     = require('../../item/database/item.contract-coll')
const PCM_PLAN_GROUP_COLL               = require('../database/subject_pcm.pcm_plan_group-coll')
const PCM_PLAN_TASK_COLL                = require('../database/subject_pcm.pcm_plan_task-coll')
const PCM_COMMENT_COLL                  = require('../database/subject_pcm.pcm_comment-coll')
const PCM_FILE_COLL                     = require('../database/subject_pcm.pcm_file-coll')
const PCM_PLAN_REPORT_COLL              = require('../database/subject_pcm.pcm_plan_report-coll')
const DOCUMENT_DOC_COLL                 = require('../../document/database/document.doc-coll')

const PCM_FILE_MODEL                    = require('../model/subject_pcm.pcm_file-model').MODEL

let dataTF = {
    appID: "5eabfdc72171391e5f6a0468", // PCM
    menuID: "623ef213e998e94feda0ccd8", //
    type: 1, 
    action: 1, // Xem
}
let dataTF2 = {
    appID: "5eabfdc72171391e5f6a0468", // PCM
    menuID: "623ef213e998e94feda0ccd8", //
    type: 1,
    action: 2, // Thêm
}
// FE sử dụng: useHistoryTraffics

class Model extends BaseModel {

    constructor() {
        super(PCM_PLAN_TASK_COLL);
    }

    /**
     * Dev: MinhVH
     * Func: Thêm file vào pcm_file
     * Date: 26/04/2022
     */
    handleAddFiles({ infoTask, files, authorID, ctx }) {
        return new Promise(async resolve => {
            try {
                let { results, errors } = await PromisePool
                    .for(files)
                    .withConcurrency(2)
                    .process(async fileID => {
                        // File mới
                        const infoFileCore = await ctx.call(`${CF_DOMAIN_SERVICES.FILE}.${CF_ACTIONS_FILE.GET_INFO_FILE}`, {
                            fileID: fileID.toString()
                        }, {
                            meta: {
                                infoUser: { _id: authorID }
                            }
                        });

                        if(!infoFileCore.error) {
                            const {
                                name, nameOrg, description, path, size, mimeType, type, author
                            } = infoFileCore.data;

                            const infoAfterInserted = await PCM_FILE_MODEL.insert({
                                fileID: fileID,
                                taskID: infoTask._id,
                                contractID: infoTask.contract,
                                projectID: infoTask.project?._id,
                                groupID: infoTask.group,
                                companyID: infoTask.company,
                                authorID: author,
                                name, nameOrg, path, size, mimeType, description, type
                            });

                            return infoAfterInserted.data && infoAfterInserted.data._id;
                        }
                    });

                results = results?.filter(Boolean);

                if(errors.length || !results.length) {
                    return resolve({
                        error: true,
                        errors,
                        message: "Quá trình upload file có vấn đề, chúng tôi đang tìm cách khắc phục",
                        keyError: "error_occurred",
                        status: 422
                    })
                }

                return resolve({
                    error: false,
                    data: { results },
                });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: insert task
     * Author: Depv
     * Code:
     */
    insert({ projectID, groupID, taskID, authorID, name, description, sign, type, startTime, expiredTime, expiredHour, amountoftime, assigneeID, relatedIDs, progressType, parentID, contractID, draft, template, fieldID, subType, authorAttachs, bizfullname, isNotiEmail, senderMail, amount, vatAmount, contactID, descriptioncv, select, populates, ctx }) {
        // console.log({ projectID, groupID, taskID, authorID, name, description, sign, type, startTime, expiredTime, expiredHour, amountoftime, assigneeID, relatedIDs, progressType, parentID, contractID, draft, template, fieldID, subType, authorAttachs, bizfullname, isNotiEmail, senderMail, amount, vatAmount, contactID, company, select, populates })
        return new Promise(async (resolve) => {
            try {
                let dataInsert = {};
                let accessUsers = [];
                let infoGroup = null;
                let companyID = null;
                let infoTaskParent = null;
                let suid = await stringUtils.randomAndCheckExists(PCM_PLAN_TASK_COLL, 'suid');

                if(authorID.toString() != assigneeID.toString()){
                    accessUsers = [authorID, assigneeID]
                }else{
                    accessUsers = [authorID] // Nếu tạo xong Task mới đổi người thực hiện thì sẽ bị sai ở đây
                }

                if(!name || !checkObjectIDs(projectID) || !checkObjectIDs(groupID) || !checkObjectIDs(assigneeID))
                    return resolve({ error: true, message: 'name|project|group|assignee_invalid', status: 400 })

                if(populates && typeof populates === 'string'){
                    if(!IsJsonString(populates))
                        return resolve({ error: true, message: 'Request params populates invalid', status: 400 });
                    populates = JSON.parse(populates);
                } else{
                    populates = {
                        path: "",
                        select: ""
                    }
                }

                /**
                 * LOGIC STEP
                 */
                let infoProject = await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`, {
                    departmentID: `${projectID}`
                })
                companyID = infoProject?.data?.company
                if(!companyID)
                    return resolve({ error: true, message: "company_invalid", status: 400 })

                // Thông tin Nhóm dữ liệu
                infoGroup = await PCM_PLAN_GROUP_COLL.findById(groupID).select('_id contract property type');

                let convertStr = ''
                if(name && name != ""){
                    convertStr = stringUtils.removeAccents(name)
                }
                if(description && description != ""){
                    convertStr = convertStr + " " + (stringUtils.removeAccents(descriptioncv) || stringUtils.removeAccents(description));
                }
                if(sign && sign != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(sign)
                }

                dataInsert = {
                    name,
                    namecv: convertStr,
                    company : companyID,
                    project : projectID,
                    group   : groupID,
                    assignee: assigneeID,
                    author  : authorID,
                    suid,
                    accessUsers,
                    amountoftime: (amountoftime && !isNaN(amountoftime) ? Number(amountoftime) : 0),
                    type
                }
                // console.log(dataInsert)

                // Công việc cha
                if(parentID){
                    infoTaskParent = await PCM_PLAN_TASK_COLL.findById(parentID).lean();
                    dataInsert.subtype = infoTaskParent.subtype;
                    // dataInsert.upcoming = infoTaskParent.upcoming;
                }else{
                    dataInsert.subtype = subType;
                }

                // Thời hạn hoàn thành
                if(expiredTime) {
                    dataInsert.expiredTime = new Date(expiredTime);
                    dataInsert.actualFinishTime = new Date(expiredTime);
                } else{
                    dataInsert.expiredTime = new Date();
                    dataInsert.actualFinishTime = new Date();
                }
                if(expiredHour && expiredTime) {
                    const formatDate = new Date(expiredTime);
                    const expiredHourSplit = expiredHour.split(":");
                    formatDate.setHours(expiredHourSplit[0], expiredHourSplit[1]);
                    dataInsert.expiredTime = formatDate;
                    dataInsert.actualFinishTime = formatDate;
                }

                /**
                 * Precalculated
                 */
                let infoAuthor = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`, {
                    userID: authorID, select: "_id company department fullname"
                })

                let infoAssignee = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`, {
                    userID: assigneeID, select: "_id company department fullname"
                })

                // companyOfAuthor
                if(!infoAuthor.error){
                    dataInsert.companyOfAuthor = infoAuthor.data.company;
                    dataInsert.departmentOfAuthor = infoAuthor.data.department;
                }

                // companyOfAssignee
                if(!infoAssignee.error){
                    dataInsert.companyOfAssignee = infoAssignee.data.company;
                    dataInsert.departmentOfAssignee = infoAssignee.data.department;
                }

                // Việc con hoặc check list
                if(parentID && checkObjectIDs(parentID)){
                    dataInsert.parent = parentID;
                }

                //_______File của người tạo việc
                if(checkObjectIDs(authorAttachs)){
                    dataInsert.authorAttachs = authorAttachs;
                }

                // Người liên quan
                if(relatedIDs && relatedIDs.length){
                    relatedIDs = [...new Set(relatedIDs)];

                    if(!checkObjectIDs(relatedIDs)) {
                        return resolve({ error: true, message: "relatedIDs_invalid", status: 400 });
                    }
                    dataInsert.related = relatedIDs;

                    let arrRaletedTemp = []
                    for(const item of relatedIDs){
                        if(item.toString() != authorID.toString() && !accessUsers.includes(item)){
                            arrRaletedTemp.push(item)
                        }
                    }
                    accessUsers.push(...arrRaletedTemp)
                }

                if(description){
                    dataInsert.description = description;
                    dataInsert.descriptioncv = (stringUtils.removeAccents(descriptioncv) || stringUtils.removeAccents(description))
                }

                if(sign){
                    dataInsert.sign = sign;
                }

                if(progressType && !isNaN(Number(progressType)) && Number(progressType) > 0){
                    dataInsert.progressType = Number(progressType);
                }

                if(startTime){
                    dataInsert.startTime = new Date(startTime);
                    dataInsert.actualStartTime = new Date(startTime);
                } else {
                    dataInsert.startTime =  new Date();
                    dataInsert.actualStartTime = new Date();
                }

                //_________B2.3 Kiểm tra có contractID
                if(contractID && ObjectID.isValid(contractID)){
                    dataInsert.contract = contractID;
                }else{
                    // Lấy theo group
                    if(infoGroup && infoGroup.contract){
                        dataInsert.contract = infoGroup.contract
                    }
                }

                //_________Mã khách
                if(contactID && ObjectID.isValid(contactID)){
                    dataInsert.contact = contactID;
                }

                if(amount && !isNaN(amount)){
                    dataInsert.amount = Number(amount);
                }

                if(vatAmount && !isNaN(vatAmount)){
                    dataInsert.vatAmount = Number(vatAmount);
                }

                //_________Phân loại khác
                if(fieldID && ObjectID.isValid(fieldID)){
                    dataInsert.field = fieldID;
                }

                //_________Việc nháp/chính thức
                if(draft && !isNaN(draft)){
                    dataInsert.draft = Number(draft);
                }

                //_________Trường hợp tạo mẫu Đệ trình (template)
                if(template && !isNaN(template)){
                    dataInsert.template = Number(template);
                }

                /**
                 * Những user chưa xem công việc
                 * - Sẽ xóa user khi bấm xem
                 * - Sẽ thêm user khi có thông báo mới
                 */
                dataInsert.news = accessUsers.filter(userId => userId !== authorID);

                let infoAfterInsert = null, checkAddNewTask = 0;
                if(taskID) {
                    // Cập nhật thành việc chính thức
                    dataInsert.draft = 0

                    // Khi bấm submit
                    infoAfterInsert = await this.updateById(taskID, dataInsert)

                    checkAddNewTask ++
                } else {

                    // Tự động lưu việc nháp
                    infoAfterInsert = await this.insertData(dataInsert)
                }

                if(!infoAfterInsert) {
                    return resolve({
                        error: true,
                        message: "can't_insert_task",
                        keyError: KEY_ERROR.INSERT_FAILED,
                        status: 403
                    })
                }

                /**
                 * XỬ LÝ CÁC SỰ KIỆN SAU KHI TẠO TASK CHÍNH THỨC
                 */
                // console.log({_____________checkAddNewTask:checkAddNewTask})
                if(Number(checkAddNewTask) > 0){
                     /**
                     * Thêm reminder nhắc công việc đến hạn
                     * - Mặc định không thêm
                     * - Nếu user chọn thì mới thêm
                     */
                    // ctx.call(`${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.ADD_JOB_REMINDER_EXPIRED_TASK}`, {
                    //     senderMail,
                    //     status: infoAfterInsert.status,
                    //     taskID: infoAfterInsert._id?.toString(),
                    //     userID: infoAfterInsert.author?.toString(),
                    //     alert: 0.4, // Mặc định khi tạo task, nhắc hẹn trước 15 phút
                    //     actualFinishTime: dataInsert.actualFinishTime?.toString(),
                    // })

                    /**
                     * SỰ KIỆN 1: THÊM COMMENT ĐỂ PHỤC VỤ TÌM KIẾM THEO CHỦ ĐỀ
                     */
                    await ctx.call(`${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_INSERT}`, {
                        taskID: infoAfterInsert._id?.toString(),
                        type: 5,
                        files: authorAttachs?.map(file => file.toString()),
                        content: name,
                        rawContent: convertStr,
                    }, {
                        meta: {
                            infoUser: { _id: authorID.toString(), bizfullname, company: infoAuthor.data.company.toString() }
                        }
                    })

                    /**
                     * SỰ KIỆN 2: KIỂM TRA NẾU CÓ CÔNG VIỆC CHA
                     */
                    if(parentID && checkObjectIDs(parentID)){
                        let infoParentTask = await PCM_PLAN_TASK_COLL.findById(parentID).select('_id level')

                        // Cập nhật việc cha
                        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(parentID, {
                            $inc: { amountSubtask: 1 },
                            $addToSet: { news: authorID, childs: infoAfterInsert._id },
                            $set: {
                                modifyAt: new Date(),
                            }
                        });

                        // Cập nhật Level cho việc con
                        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(infoAfterInsert._id, {
                            $set: {
                                level: Number(infoParentTask.level) + Number(1)
                            }
                        });
                    }

                    /**
                     * SỰ KIỆN 3: CẬP NHẬT SỐ LƯỢNG CÔNG VIỆC CHO GROUP
                     */
                    await PCM_PLAN_GROUP_COLL.findByIdAndUpdate(groupID, { $inc: { amountTasks: 1 }})

                    /**
                     * SỰ KIỆN 4: TẠO VIỆC CON MỚI
                     * + Insert thông báo vào DB và bắn Cloud MSS
                     */
                    if([1,2,3,4,5,6,7,8,9,10,11,12].includes(type)) {
                        let webUrl              = '';
                        let titleMSS            = '';
                        let descriptionMSS      = '';
                        let languageKey         = '';
                        let dataSend 		    = { app: APP_KEYS.PCM_PLAN_TASK };
                        let taskID              = parentID;

                        if(!parentID) {
                            taskID = infoAfterInsert._id;
                            webUrl = `/pcm/detail/${taskID}`;
                            languageKey = LANGUAGE_KEYS.CREATE_NEW_TASK;
                        } else {
                            webUrl = `/pcm/detail/${taskID}#${'childtask'}_${infoAfterInsert._id}`;
                            languageKey = LANGUAGE_KEYS.CREATE_CHILDTASK_PCM;
                        }

                        let infoTask = await PCM_PLAN_TASK_COLL.findById(taskID).lean();
                        let { name: taskName, author, assignee, related, accessUsers } = infoTask;
                        let arrReceiver = [];

                        /**
                         * Xử lý người nhận ứng với việc nháp/chính thức
                         * 0: Chính thức
                         * 1: Việc nháp
                         */
                        if(infoAfterInsert.draft == 0) {
                            if(accessUsers && accessUsers.length) {
                                arrReceiver = accessUsers.filter(receiverID => receiverID !== authorID.toString());
                            } else{
                                related = related.map(userID => userID.toString());

                                let listReceivers = [...new Set([author.toString(), assignee.toString(), ...related])];
                                arrReceiver = listReceivers.filter(receiverID => receiverID !== authorID.toString());
                            }
                        }

                        /**
                         * Bắn thông báo realtime
                         */
                        if(arrReceiver && arrReceiver.length) {
                            if(parentID) {
                                let { related } = infoTaskParent;
                                related = related.map(userID => userID.toString());

                                let listReceivers = [...new Set([assigneeID, ...related])];
                                arrReceiver = listReceivers.filter(receiverID => receiverID !== authorID.toString());

                                dataSend = {
                                    ...dataSend,
                                    languageKey,
                                    mainColl: {
                                        kind: 'pcm_plan_task',
                                        item: { _id: taskID }
                                    },
                                };
                                titleMSS        = taskName;
                                descriptionMSS  = `${bizfullname} đã tạo 1 việc con`;
                            } else {
                                dataSend = {
                                    ...dataSend,
                                    languageKey,
                                    mainColl: {
                                        kind: 'pcm_plan_task',
                                        item: { _id: taskID }
                                    }
                                };
                                titleMSS        = taskName;
                                descriptionMSS  = `${bizfullname} đã tạo 1 công việc mới`;
                            }

                            for (let i = 0; i < arrReceiver.length; i++) {
                                const receiver = arrReceiver[i];
                                const dataAmountNoti = await this.getAmountNotification({ userID: receiver });
                                const amountNoti = dataAmountNoti?.data?.amountUnreadTask;

                                if(assigneeID === receiver) {
                                    descriptionMSS = `${bizfullname} đã tạo 1 công việc cho bạn`;
                                }

                                if(related.includes(receiver)) {
                                    descriptionMSS = `${bizfullname} đã gán bạn là người liên quan`;
                                }

                                ctx.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
                                    users: [receiver],
                                    title: titleMSS,
                                    description: descriptionMSS,
                                    amountNoti,
                                    dataSend,
                                    web_url: webUrl,
                                    env: ENV_DEVICE_WEB_CBS
                                });
                            }
                        }
                    }

                    /**
                     * SỰ KIỆN 5: GỬI EMAIL THÔNG BÁO
                     */
                    if(isNotiEmail) {
                        this.sendEmailToMembersInTask({
                            taskID: infoAfterInsert._id,
                            title: infoAfterInsert.name,
                            notice: infoAfterInsert.description,
                            sender: senderMail,
                            receivers: [infoAfterInsert.assignee, ...infoAfterInsert.related],
                            ctx
                        })
                    }
                }

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF2)

                const infoTask = await PCM_PLAN_TASK_COLL
                    .findById(infoAfterInsert._id)
                    .select(select )
                    .populate(populates)
                    .lean();

                return resolve({ error: false, data: infoTask, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: update task
     * Author: DePV/MinhNH/HiepNH
     * Code: 8/9/2022
     */
    update({ typeUpdate,
        taskID, sign, name, description, actualStartTime, actualFinishTime, assigneeID, userID, progressType, fieldID, expiredHour, isUpdateNews, ontime, quality, judgement, overdue,
        contractID, draft, subType, upcoming, usersDeleteID, related, relatedRemoves, priority, status, signatures, tasksLink, groupID, unit, unitPrice, quantity, vatAmount, amountoftime,
        links, linksDocs, authorAttachs, assigneeAttachs, percentage, isAddSignature, isOpenBidding, score,
        openedUsers, flags, flagsRemoves, bizfullname, companyOfUser, milestone, alert, senderMail, fullnameUpdate, descriptioncv, ctx
    }){
        // console.log({ typeUpdate,
        //     taskID, sign, name, description, actualStartTime, actualFinishTime, assigneeID, userID, progressType, fieldID, expiredHour, isUpdateNews, ontime, quality, judgement, overdue,
        //     contractID, draft, subType, upcoming, usersDeleteID, related, relatedRemoves, priority, status, signatures, tasksLink, groupID, unit, unitPrice, quantity, vatAmount, amountoftime,
        //     links, linksDocs, authorAttachs, assigneeAttachs, percentage, isAddSignature, isOpenBidding, score,
        //     openedUsers, flags, flagsRemoves, bizfullname, companyOfUser, milestone, alert, senderMail, fullnameUpdate, descriptioncv
        // })
        return new Promise(async (resolve) => {
            try {
                let dataUpdate   = {};
                let dataAddToset = {};
                let dataPullAll  = {};
                let convertStr = '';

                if(!checkObjectIDs(taskID))
                    return resolve({ error: true, message: 'taskID_invalid', status: 400 });

                const infoTask = await PCM_PLAN_TASK_COLL.findById(taskID).populate({
                    path: 'project assignee',
                    select: '_id admins name fullname bizfullname'
                }).lean()
                if(!infoTask)
                    return resolve({ error: true, message: 'task_not_exists', status: 400 })

                let accessUsers = infoTask.accessUsers

                /**
                 * Công việc phân loại "LỰA CHỌN NHÀ THẦU"
                 * -> Không được cập nhật task khi hồ sơ thầu đã mở
                 * -> Chỉ được cập nhật thêm người liên quan
                 */
                if(infoTask.subtype === 4 && infoTask.openedStatus === 1 && (!related || !related?.length)) {
                    return resolve({
                        error: true,
                        message: 'Không thể cập nhật công việc khi hồ sơ thầu đã mở',
                        keyError: 'error_occurred',
                        status: 422
                    });
                }

                /**
                 * Nếu là công việc nháp hoặc Admin dự án
                 */
                if(infoTask.draft == 1 || infoTask.project.admins.map(item=>item.toString()).includes(userID?.toString())){
                    //_________Việc nháp sang việc chính thức
                    if(+draft === 0){
                        dataUpdate.draft = 0;
                        dataUpdate.companyOfAuthor = companyOfUser;
                        dataUpdate.author = userID;
                    }

                    //_________Xoá người liên quan
                    if(checkObjectIDs(relatedRemoves)){
                        dataPullAll = {
                            ...dataPullAll,
                            related: relatedRemoves, // Xóa trong chủ đề
                            accessUsers: relatedRemoves, // Xóa trong quyền truy cập
                            news: relatedRemoves, // Xóa trong newFeed
                        }
                       
                        /**
                         * Ghi log
                         */
                        let listDataRalated = await USER_COLL.find({_id: {$in: relatedRemoves}}).select('fullname')
                        let str = ''
                        for(const item of listDataRalated){
                            if(str != ""){
                                str = str + ", " + item.fullname
                            }else{
                                str = str + item.fullname
                            }
                        }
                        
                        await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_LOG_INSERT}`, {
                            taskID: `${taskID}`,
                            type: 4,
                            title: "Xóa người liên quan",
                            content: `đã xóa người liên quan "${str}"`,
                        })
                        // console.log(listDataRalated)
                    }

                    //_________Mã công việc
                    if(sign){
                        dataUpdate.sign = sign;
                    }

                    /**
                     * Sửa Tên công việc
                     * - Sửa công việc
                     * - Sửa comment
                     */
                    if(name){
                        dataUpdate.name = name

                         /**
                         * Ghi log
                         * Cập nhật comment type=5 tương ứng (chưa có phần này)
                         */
                        await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_LOG_INSERT}`, {
                            taskID: `${taskID}`,
                            type: 3,
                            title: "Cập nhật tên công việc",
                            content: `đã cập nhật tên công việc "${infoTask.name}" thành "${name}"`,
                        })
                    }

                    /**
                     * Mô tả
                     * - Sửa công việc
                     * - Sửa comment
                     */
                    if(description){
                        dataUpdate.description = description
                        dataUpdate.descriptioncv = (stringUtils.removeAccents(descriptioncv) || stringUtils.removeAccents(description))

                         /**
                         * Ghi log
                         * Cập nhật comment type=5 tương ứng (chưa có phần này)
                         */
                        await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_LOG_INSERT}`, {
                            taskID: `${taskID}`,
                            type: 3,
                            title: "Cập nhật nội dung công việc",
                            content: `đã cập nhật nội dung công việc "${infoTask.description}" thành "${description}"`,
                        })
                    }

                    if(name && name != ""){
                        convertStr = stringUtils.removeAccents(name)
                    }else{
                        convertStr = stringUtils.removeAccents(infoTask.name)
                    }
                    if(description && description != ""){
                        // convertStr = convertStr + " " + stringUtils.removeAccents(description)
                        convertStr = convertStr + " " + (stringUtils.removeAccents(descriptioncv) || stringUtils.removeAccents(description));
                    }else{
                        convertStr = convertStr + " " + stringUtils.removeAccents(infoTask.description)
                    }
                    if(sign && sign != ""){
                        convertStr = convertStr + " " + stringUtils.removeAccents(sign)
                    }else{
                        convertStr = convertStr + " " + stringUtils.removeAccents(infoTask.sign)
                    }

                    /**
                     * Ngày kết thúc
                     */
                    if(actualFinishTime){
                        dataUpdate.actualFinishTime = new Date(actualFinishTime);
                    }

                    if(expiredHour) {
                        const formatDate = new Date(actualFinishTime);
                        const expiredHourSplit = expiredHour.split(":");
                        formatDate.setHours(expiredHourSplit[0], expiredHourSplit[1]);
                        dataUpdate.actualFinishTime = formatDate;

                        /**
                         * Ghi log
                         */
                        await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_LOG_INSERT}`, {
                            taskID: `${taskID}`,
                            type: 3,
                            title: "Cập nhật thời hạn",
                            content: `đã cập nhật thời hạn từ ${moment(infoTask.actualFinishTime).format("DD/MM/YYYY")} thành ${moment(actualFinishTime).format("DD/MM/YYYY")}`,
                        });
                    }

                    // Người thực hiện
                    if(checkObjectIDs(assigneeID)){
                        dataUpdate.assignee = assigneeID;

                        // Gán vào mảng user được quyền truy cập
                        if(!accessUsers.includes(assigneeID)){
                            accessUsers.push(assigneeID)

                            dataAddToset = {
                                ...dataAddToset,
                                accessUsers: [assigneeID],
                                news: [assigneeID]
                            }
                        }

                        let infoAssignee = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`, {
                            userID: assigneeID, select: "_id company fullname"
                        })

                        // companyOfAssignee
                        if(!infoAssignee.error){
                            dataUpdate.companyOfAssignee = infoAssignee.data.company;
                        }

                        /**
                         * Ghi log
                         * Cập nhật comment type=5 tương ứng
                         */
                        await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_LOG_INSERT}`, {
                            taskID: `${taskID}`,
                            type: 3,
                            title: "Cập nhật người thực hiện",
                            content: `đã cập nhật người thực hiện "${infoTask.assignee.fullname}" thành "${infoAssignee.data.fullname}"`,
                        });
                    }

                }else{
                    //_________Mã hiệu công việc
                    if(sign && sign != ""){
                        convertStr = convertStr + " " + stringUtils.removeAccents(sign)
                    }

                    //_________Mô tả: chỉ áp dụng cho Báo cáo, Họp
                    if(infoTask.subtype === 9 || infoTask.subtype === 11){
                        if(description){
                            dataUpdate.description = description;
                            dataUpdate.descriptioncv = (stringUtils.removeAccents(descriptioncv) || stringUtils.removeAccents(description))
                        }
                        if(description && description != ""){
                            convertStr = convertStr + " " + (stringUtils.removeAccents(descriptioncv) || stringUtils.removeAccents(description));
                        }
                    }
                }

                // console.log({convertStr})
                if(convertStr != ""){
                    dataUpdate.namecv = convertStr
                }

                //_________userUpdate
                if(checkObjectIDs(userID)){
                    dataUpdate.userUpdate = userID;
                }

                //_________Thêm người liên quan
                if(checkObjectIDs(related)){
                    dataAddToset = {
                        ...dataAddToset,
                        related,
                        accessUsers: related,
                        news: related
                    }

                    /**
                     * Ghi log
                     */
                    let listDataRalated = await USER_COLL.find({_id: {$in: related}}).select('fullname')
                    let str = ''
                    for(const item of listDataRalated){
                        if(str != ""){
                            str = str + ", " + item.fullname
                        }else{
                            str = str + item.fullname
                        }
                    }
                    
                    await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_LOG_INSERT}`, {
                        taskID: `${taskID}`,
                        type: 4,
                        title: "Thêm người liên quan",
                        content: `đã thêm người liên quan "${str}"`,
                    })
                    // console.log(listDataRalated)
                }

                /**
                 * Phân loại công việc: 
                 * - Không cho phép thay đổi Phân loại Thầu và mua sắm/Báo cáo/Họp
                 */
                if(subType && !isNaN(subType)){
                    const subTypes = [4, 9, 11];
                    if(!subTypes.includes(infoTask.subtype)){
                        dataUpdate.subtype = +subType;
                    }
                }

                if(upcoming && upcoming != ""){
                    dataUpdate.upcoming = +upcoming;
                }

                /**
                 * Ngày bắt đầu
                 */
                if(actualStartTime){
                    dataUpdate.actualStartTime = new Date(actualStartTime);
                }

                /**
                 * Trạng thái công việc
                 * - Chỉ được update khi trạng thái công việc chưa hoàn thành
                 */
                if(status && infoTask.status != 3){
                    dataUpdate.status = status;

                    // Nếu cập nhật sang trạng thái hoàn thành
                    if(status == 3){
                        dataUpdate.percentage = 100
                    }
                }

                //_________Hợp đồng
                if(checkObjectIDs(contractID)){
                    dataUpdate.contract = contractID;
                }

                //_________Nhóm dữ liệu
                if(checkObjectIDs(groupID)){
                    dataUpdate.group = groupID;
                }

                //_________Tính chất
                if(checkObjectIDs(fieldID)){
                    dataUpdate.field = fieldID;
                }

                //_________Phân loại tiến độ
                if(progressType){
                    dataUpdate.progressType = progressType;
                }

                //_________User xóa task
                if(checkObjectIDs(usersDeleteID)){
                    dataAddToset = { ...dataAddToset, usersDelete: usersDeleteID }
                }

                //_________Những user đánh dấu quan tâm/start/bookmark
                if(checkObjectIDs(flags)){
                    dataAddToset = { ...dataAddToset, flags }
                }

                //_________User xóa quan tâm
                if(checkObjectIDs(flagsRemoves)) {
                    dataPullAll = { ...dataPullAll, flags: flagsRemoves }
                }

                //_________Phân loại mức độ quan trọng (cao, bình thường, thấp, siêu cao)
                if(priority){
                    dataUpdate.priority = priority;
                }

                //_________Ký duyệt xác nhận
                if(checkObjectIDs(signatures)){
                    dataAddToset = { ...dataAddToset, signatures }
                }

                //_________Các việc có liên quan kèm theo
                if(checkObjectIDs(links)){
                    dataAddToset = { ...dataAddToset, links }
                }

                if(checkObjectIDs(tasksLink)){
                    dataAddToset = { ...dataAddToset, links: tasksLink }
                }

                if(checkObjectIDs(linksDocs)){
                    dataAddToset = { ...dataAddToset, linksDocs }
                }

                //_________% hoàn thành (max = 100)
                if(percentage){
                    dataUpdate.percentage = percentage;
                }

                //_________Cột mốc
                if(!isNaN(milestone)){
                    dataUpdate.milestone = milestone;
                }

                /**
                 * Cập nhật thông tin đánh giá
                 */
                if(ontime){
                    dataUpdate.ontime = ontime;
                }

                if(quality){
                    dataUpdate.quality = quality;
                }

                /**
                 * Cập nhật thông tin sán lượng
                 */
                if(unit){
                    dataUpdate.unit = unit;
                }

                if(unitPrice >= 0){
                    dataUpdate.unitPrice = unitPrice;
                }

                if(quantity >= 0){
                    dataUpdate.quantity = quantity;
                }

                if(unitPrice >= 0 && quantity >= 0){
                    dataUpdate.amount = Number(unitPrice)*Number(quantity);
                }

                if(vatAmount >= 0){
                    dataUpdate.vatAmount = vatAmount;
                }

                //_________Dự kiến thời lượng (h)
                if(amountoftime){
                    dataUpdate.amountoftime = amountoftime;
                }

                //_________Nhận xét
                if(judgement){
                    dataUpdate.judgement = judgement;
                }

                //_________Tiến độ
                if(overdue){
                    dataUpdate.overdue = overdue;
                }

                //_________Chất lượng
                if(score){
                    dataUpdate.score = score;
                }

                /**
                 * KÝ XÁC NHẬN
                 */
                if(isAddSignature) {
                    const infoSignature = await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.SIGNATURE_INSERT}`, {
                        companyID: infoTask.company?.toString(),
                        projectID: infoTask.project?._id?.toString(),
                        coll: {
                            kind: 'pcm_plan_task',
                            item: taskID
                        }
					});
                    if(infoSignature.error) return resolve(infoSignature);

                    const { _id } = infoSignature.data;
                    dataAddToset = { ...dataAddToset, signatures: _id }

                    /**
                     * Nếu người được gán việc nhấn "Đồng ý" (trong chi tiết task)
                     * trong task có phân loại là "Lựa chọn nhà thầu"
                     * -> Cập nhật trạng thái của task thành "Hoàn thành"
                     */
                    if(infoTask.subtype === 4 && userID.toString() === infoTask.assignee?._id.toString()) {
                        dataUpdate.approver = userID
                        dataUpdate.timeApproved = Date.now()
                        dataUpdate.status = 3;
                        dataUpdate.percentage = 100;
                    }

                    /**
                     * TH1:
                     * - Nếu là Đề nghị phê duyệt (2) + Thanh toán (3) + Nghiệm thu (5)
                     * - Người thực hiện ký => phê duyệt luôn
                     * TH2:
                     * - Nếu là Các chủ đề khác còn lại
                     * - Người tạo việc ký => phê duyệt luôn
                     */
                    if([2,3,5].includes(Number(infoTask.subtype))){
                        if(userID.toString() === infoTask.assignee?._id.toString()){
                            dataUpdate.approver = userID
                            dataUpdate.timeApproved = Date.now()
                            dataUpdate.percentage = 100
                            dataUpdate.status = 3
                        }
                    }else{
                        if(userID.toString() === infoTask.author?.toString()){
                            dataUpdate.approver = userID
                            dataUpdate.timeApproved = Date.now()
                            dataUpdate.percentage = 100
                            dataUpdate.status = 3
                        }
                    }
                }

                /**
                 * CÔNG VIỆC THẦU
                 */
                if(checkObjectIDs(openedUsers)){
                    dataAddToset = { ...dataAddToset, openedUsers }
                }

                if(isOpenBidding) {
                    dataAddToset = { ...dataAddToset, openedUsers: userID }

                    const { openedStatus, openedUsers, related } = infoTask;

                    // Kiểm tra khi tất cả mở thầu => cập nhật sang trạng thái là 1 (mở thầu)
                    if(openedStatus === 0) {
                        const usersOpened = [...openedUsers, userID].map(item => item.toString());
                        const allUsersIsOpened = related.every(item => usersOpened.includes(item.toString()));

                        if(allUsersIsOpened) {
                            dataUpdate.openedStatus = 1;
                        }
                    }
                }

                /**
                 * FILE NGƯỜI TẠO VIỆC ĐÍNH KÈM KHI TẠO TASK
                 */
                if(checkObjectIDs(authorAttachs)){
                    const result = await this.handleAddFiles({
                        infoTask, files: authorAttachs, authorID: userID, ctx
                    })

                    if(result.error) return resolve(result);

                    dataAddToset = { ...dataAddToset, authorAttachs };
                }

                /**
                 * FILE NGƯỜI THỰC HIỆN ĐÍNH KÈM KHI TRẢ BÀI
                 */
                if(checkObjectIDs(assigneeAttachs)){
                    const result = await this.handleAddFiles({
                        infoTask, files: assigneeAttachs, authorID: userID, ctx
                    })

                    if(result.error) return resolve(result);

                    dataAddToset = { ...dataAddToset, assigneeAttachs };
                }

                // Cập nhật nhắc hẹn expired time Task
                if(alert >= 0) {
                    dataUpdate.alert = alert;

                    // Xóa tất cả job reminder cũ (đã setup trước đó đi)
                    await ctx.call(`${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.DELETE_JOB_REMINDER_EXPIRED_TASK}`, {
                        taskID
                    })

                    // Setup con crontab mới
                    if(alert > 0) {
                        ctx.call(`${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.ADD_JOB_REMINDER_EXPIRED_TASK}`, {
                            alert,
                            senderMail,
                            status: infoTask.status,
                            taskID: infoTask._id?.toString(),
                            userID: infoTask.author?.toString(),
                            actualFinishTime: infoTask.actualFinishTime?.toString(),
                        })
                    }
                }

                /**
                 * Cập nhật user chưa xem
                 */
                if(isUpdateNews) {
                    const usersUnRead = infoTask.accessUsers?.filter(item =>
                        item.toString() !== userID.toString()
                    );
                    dataAddToset = { ...dataAddToset, news: usersUnRead };
                    dataUpdate.modifyAt = new Date();
                }

                //_________Cập nhật nhiều dữ liệu addToSet cùng 1 lúc
                if(dataAddToset){
                    dataUpdate.$addToSet = dataAddToset;
                }

                //_________Xóa nhiều dữ liệu cùng 1 lúc
                if(dataPullAll){
                    dataUpdate.$pullAll = dataPullAll;
                }

                /**
                 * TIẾN HÀNH CẬP NHẬT CÔNG VIỆC
                 */
                let infoAfterUpdate = await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, dataUpdate, { new: true })
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Can't_update_task", keyError: KEY_ERROR.UPDATE_FAILED, status: 403 })

                /**
                 * CẬP NHẬT COMMENT GỐC LINK VỚI TÊN/MÔ TẢ CÔNG VIỆC
                 */
                if(convertStr != ""){
                    let initialComment = await PCM_COMMENT_COLL.findOne({type: 5, task: taskID })
                    if(initialComment){
                        await PCM_COMMENT_COLL.updateMany(
                            {type: 5, task: taskID }, 
                            {$set : 
                                {
                                    content: infoAfterUpdate.name,
                                    contentcv: convertStr,
                                    accessUsers: infoAfterUpdate.accessUsers
                                }
                            }, 
                            { new: true })
                    }else{
                        await ctx.call(`${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_INSERT}`, {
                            taskID: taskID.toString(),
                            type: 5,
                            files: authorAttachs?.map(file => file.toString()),
                            content: infoAfterUpdate.name,
                            rawContent: convertStr,
                        }, {
                            meta: {
                                infoUser: { _id: userID.toString(), bizfullname, company: companyOfUser.toString() }
                            }
                        })
                    }
                }

                /**
                 * Khi link việc A vào việc B thì ở trong việc B, links cũng chứa A
                 */
                if(checkObjectIDs(tasksLink)){
                    await PCM_PLAN_TASK_COLL.updateMany({
                        _id: { $in: tasksLink }
                    }, {
                        $addToSet: {
                            links: taskID
                        }
                    });
                }

                /**
                 * Link hồ sơ vào công việc
                 */
                if(checkObjectIDs(linksDocs)){
                    await DOCUMENT_DOC_COLL.updateMany({
                        _id: { $in: linksDocs }
                    }, {
                        $addToSet: {
                            tasks: taskID
                        }
                    });
                }

                // Cập nhật số lượng việc con cho việc cha
                if(infoAfterUpdate.parent && status == 3){
                    // Việc con
                    if(infoAfterUpdate.type == 1){
                        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(infoAfterUpdate.parent, { $inc: { amountFinishedSubtask: 1}})
                    } else{
                        // checklist
                        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(infoAfterUpdate.parent, { $inc: { amountFinishedChecklist: 1}})
                    }
                }
                let { name: taskName } = infoAfterUpdate;

                // Cập nhật trạng thái công việc
                if(status) {
                    const { author, assignee, related } = infoTask;
                    const relatedIDs = related?.map(userId => userId.toString());
                    const receivers = [...new Set([author?.toString(), assignee._id?.toString(), ...relatedIDs])]
                    const receiversNoti = receivers.filter(userId => userId !== userID.toString());

                    ctx.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
                        users: receiversNoti,
                        title: taskName,
                        description: `${bizfullname} đã cập nhật trạng thái công việc`,
                        dataSend: {
                            app: APP_KEYS.PCM_PLAN_TASK,
                            languageKey: LANGUAGE_KEYS.UPDATE_STATUS_TASK,
                            mainColl: {
                                kind: 'pcm_plan_task',
                                item: { _id: taskID }
                            }
                        },
                        web_url: `/pcm/detail/${taskID}`,
                        env: ENV_DEVICE_WEB_CBS
                    })
                }

                /**
                 * Kích hoạt trong quy trình động
                 * Không can thiệp với Phân loại Thầu và mua sắm
                 */
                if(status && status == 3 && ![4].includes(infoTask.subtype)){
                    // Cập nhật công việc này về trạng thái Mặc định
                    await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID,
                        { upcoming: 1 }, 
                        { new: true })

                    // Nếu công việc cha là Quy trình động thì kích hoạt công việc kế tiếp
                    if(infoAfterUpdate.parent){
                        let infoParentTask = await PCM_PLAN_TASK_COLL.findById(infoAfterUpdate?.parent)
                        if(infoParentTask.upcoming == 2){

                            let nextSubTaskID, isLastestElement = 0;
                            let listSubTasks = await PCM_PLAN_TASK_COLL.find({parent: infoAfterUpdate?.parent}).sort({ actualFinishTime: 1 }).select('_id name upcoming actualFinishTime')

                            listSubTasks?.forEach((item, index) => {

                                // Kiểm tra lấy phần tử có ID là taskID
                                if(item._id.toString() === taskID.toString()){
                                    if(Number(index) === Number(listSubTasks.length - 1)){
                                        isLastestElement = 1
                                    }else{
                                        nextSubTaskID = listSubTasks[Number(index + 1)]._id
                                    }
                                }
                            })

                            if(isLastestElement === 1){
                                // Cập nhật trạng thái quy trình động cho phần tử cha
                                await PCM_PLAN_TASK_COLL.findByIdAndUpdate(infoAfterUpdate?.parent,
                                { upcoming: 1 }, 
                                { new: true })
                            }else{
                                // Cập nhật trạng thái quy trình động cho phần tử tiếp theo
                                await PCM_PLAN_TASK_COLL.findByIdAndUpdate(nextSubTaskID,
                                { upcoming: 1 }, 
                                { new: true })
                            }
                        }
                    }
                }

                /**
                 * XỬ LÝ SOCKET VÀ CLOUD MSS
                 */
                //1. Socket_CloudMSS_Thêm người liên quan
                if(related && related.length) {
                    const relatedCurrent = infoTask.related.map(item => item.toString());
                    const newRelated = related.filter(item => !relatedCurrent.includes(item));

                    /**
                     * Thêm người liên quan trong công việc
                     * + Insert thông báo vào DB và bắn Cloud MSS
                     */
                    const amountNoti = await this.getAmountNotification({ userID });

                    ctx.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
                        users: newRelated,
                        title: taskName,
                        description: `${bizfullname} đã thêm bạn làm người liên quan`,
                        amountNoti: amountNoti?.data?.amountUnreadTask,
                        dataSend: {
                            app: APP_KEYS.PCM_PLAN_TASK,
                            languageKey: LANGUAGE_KEYS.CREATE_RESPONSE_PCM,
                            mainColl: {
                                kind: 'pcm_plan_task',
                                item: { _id: taskID }
                            }
                        },
                        web_url: `/pcm/detail/${taskID}`,
                        env: ENV_DEVICE_WEB_CBS
                    });
                }

                //2. Socket_CloudMSS_Đồng ý phê duyệt
                if(isAddSignature) {
                    const { name: taskName, related, assignee, author } = infoAfterUpdate;
                    const relatedUsers = related.map(item => item.toString());
                    const listReceivers = [...relatedUsers, assignee.toString(), author.toString()];
                    const receivers = listReceivers.filter(receiver => receiver !== userID.toString());

                    // Cập nhật thông báo cho task (highlight)
                    await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, {
                        $addToSet: { news: receivers },
                        $set: {
                            modifyAt: new Date()
                        }
                    });

                    const amountNoti = await this.getAmountNotification({ userID });

                    ctx.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
                        users: receivers,
                        title: taskName,
                        description: `${bizfullname} đã ký xác nhận`,
                        amountNoti: amountNoti?.data?.amountUnreadTask,
                        dataSend: {
                            app: APP_KEYS.PCM_PLAN_TASK,
                            languageKey: LANGUAGE_KEYS.ADD_SIGNATURE_TASK,
                            mainColl: {
                                kind: 'pcm_plan_task',
                                item: { _id: taskID }
                            }
                        },
                        web_url: `/pcm/detail/${taskID}`,
                        env: ENV_DEVICE_WEB_CBS
                    });
                }

                //3. Socket_CloudMSS_Mở thầu
                if(isOpenBidding) {
                    const { name: taskName, related, author } = infoAfterUpdate;
                    const relatedUsers = related.map(item => item.toString());
                    const listReceivers = [...relatedUsers, author.toString()];
                    const receivers = listReceivers.filter(receiver => receiver !== userID.toString());

                    // Cập nhật thông báo cho task (highlight)
                    await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, {
                        $addToSet: { news: receivers },
                        $set: {
                            modifyAt: new Date()
                        }
                    });

                    const amountNoti = await this.getAmountNotification({ userID });

                    ctx.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
                        users: receivers,
                        title: taskName,
                        description: `${bizfullname} đã mở thầu`,
                        amountNoti: amountNoti?.data?.amountUnreadTask,
                        dataSend: {
                            app: APP_KEYS.PCM_PLAN_TASK,
                            languageKey: LANGUAGE_KEYS.OPEN_BIDDING,
                            mainColl: {
                                kind: 'pcm_plan_task',
                                item: { _id: taskID }
                            }
                        },
                        web_url: `/pcm/detail/${taskID}`,
                        env: ENV_DEVICE_WEB_CBS
                    });
                }

                //4. Socket_CloudMSS_Cập nhật checklist thành công
                if(infoTask.type === 2 && status === 3) {
                    const { name: taskName, related, assignee, author, parent } = infoAfterUpdate;
                    const relatedUsers = related.map(item => item.toString());
                    const listReceivers = [...relatedUsers, author.toString(), assignee.toString()];
                    const receivers = listReceivers.filter(item => item !== userID.toString());

                    // Cập nhật thông báo cho task (highlight)
                    await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, {
                        $addToSet: { news: receivers },
                        $set: {
                            modifyAt: new Date()
                        }
                    });

                    const amountNoti = await this.getAmountNotification({ userID });

                    ctx.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
                        users: receivers,
                        title: taskName,
                        description: `${bizfullname} đã hoàn thành 1 checklist`,
                        amountNoti: amountNoti?.data?.amountUnreadTask,
                        dataSend: {
                            app: APP_KEYS.PCM_PLAN_TASK,
                            languageKey: LANGUAGE_KEYS.CHECK_DONE_CHECKLIST,
                            mainColl: {
                                kind: 'pcm_plan_task',
                                item: { _id: taskID }
                            }
                        },
                        web_url: `/pcm/detail/${parent}#checklist_${taskID}`,
                        env: ENV_DEVICE_WEB_CBS
                    });
                }

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Cập nhật trạng thái, tình trạng xem công việc
     * Author: Depv
     * Update: HiepNH
     * Code: 20/8/2022
     */
    updateStatusMutiple({ taskIDs, parentID, type, option, userID, ctx }){
        // console.log({ taskIDs, parentID, type, option, userID })
        return new Promise(async resolve => {
            try {
                /**
                 * 1-Cập nhật trạng thái
                 * 2-Cập nhật user đã xem công việc
                 */
                if(!option || option == 0){
                    if (!checkObjectIDs(taskIDs, parentID))
                        return resolve({ error: true, message: 'param_invalid' });

                    // Kiểm tra user update có phải là là người thực hiện checklist hoặc người thực hiện việc con ko
                    let listTasks = await PCM_PLAN_TASK_COLL.find({ _id: { $in: taskIDs }});
                    let isAssignee = true;
                    listTasks.forEach(task => {
                        if(task.assignee.toString() != userID.toString()){
                            isAssignee = false;
                        }
                    });

                    if(!isAssignee)
                        return resolve({ error: true, message: 'Bạn không phải là người thực hiện, nên không được phép cập nhật hoàn thành', keyError: "user_not_assignee" });

                    let infoTaskAfterUpdate = await PCM_PLAN_TASK_COLL.updateMany({ _id: { $in: taskIDs }}, { $set: { status: 3, percentage: 100 } }, { new: true});
                    if (!infoTaskAfterUpdate)
                        return resolve({ error: true, message: 'cannot_update', keyError: KEY_ERROR.UPDATE_FAILED });

                    let amountTaskAndChecklist = taskIDs.length;
                    // Việc con
                    if (type == 1) {
                        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(parentID,  { $inc : { amountFinishedSubtask: amountTaskAndChecklist }}, { new: true })
                    }

                    // Checklist
                    if (type == 2) {
                        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(parentID, { $inc : { amountFinishedChecklist: amountTaskAndChecklist }}, { new: true })
                    }

                    return resolve({ error: false, message: "update_success" })
                }

                //2. CẬP NHẬT USER ĐÃ XEM CÔNG VIỆC
                else {
                    // Cập nhật các Task được lựa chọn
                    if(option == 1){
                        let infoTaskAfterUpdate = await PCM_PLAN_TASK_COLL.updateMany(
                            { _id: { $in: taskIDs } },
                            { $pull: { news: userID } },
                            { new: true }
                        );

                        if (!infoTaskAfterUpdate)
                            return resolve({ error: true, message: 'cannot_update', keyError: KEY_ERROR.UPDATE_FAILED });
                    }

                    // Cập nhật tất cả các Task của user chưa đọc
                    if(option == 2){
                        let infoTaskAfterUpdate = await PCM_PLAN_TASK_COLL.updateMany(
                            { news: { $in: userID } },
                            { $pull: { news: userID } },
                            { new: true }
                        );

                        if (!infoTaskAfterUpdate)
                            return resolve({ error: true, message: 'cannot_update', keyError: KEY_ERROR.UPDATE_FAILED });
                    }

                    return resolve({ error: false, message: "update_success" })
                }

            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
	 * Dev: MinhVH
	 * Func: Di chuyển công việc đến việc cha
     * Date: 22/04/2022
	 */
    moveTaskToParent({ parentID, taskID, userID, ctx }) {
        return new Promise(async resolve => {
            try {
                const validation = validateParamsObjectID({
                    parentID,
                    taskID,
                    userID
                })
                if(validation.error) return resolve(validation);

                if(parentID.toString() == taskID.toString()) {
                    return resolve({
                        error: true,
                        message: 'Không thể tự di chuyển vào chính công việc này',
                        keyError: 'error_occurred',
                        status: 422
                    });
                }

                /**
                 * Thông tin công việc cha
                 */
                const infoParent = await PCM_PLAN_TASK_COLL.findById(parentID)

                if(!infoParent) {
                    return resolve({
                        error: true,
                        message: 'Công việc cha không tồn tại',
                        keyError: 'parent_task_not_exists',
                        status: 400
                    });
                }

                const { project } = infoParent;

                /**
                * Gán project từ việc cha sang việc con (không gán Group)
                * - Chỉ cho phép người tạo việc, thực hiện di chuyển
                * - Tăng số lượng subtask của task cha
                */
                const result = await PCM_PLAN_TASK_COLL.findOneAndUpdate({
                    _id: taskID,
                    project
                },
                {
                    $set: {
                        parent: parentID,
                    },
                }, { new: true })

                // Cập nhật số lượng công việc con của việc cha
                await PCM_PLAN_TASK_COLL.findByIdAndUpdate(parentID,
                {
                    $inc: {
                        amountSubtask: 1,
                    }
                }, { new: true })

                if(!result) {
                    return resolve({
                        error: true,
                        message: 'Di chuyển không thành công (công việc không tồn tại hoặc không cùng dự án)',
                        keyError: 'error_occurred',
                        status: 422
                    });
                }

                return resolve({ error: false, data: result, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
	 * Dev: MinhVH
	 * Func: Di chuyển công việc đến nhóm dữ liệu khác (trong cùng dự án)
     * Date: 22/04/2022
	 */
    moveTaskToGroup({ groupID, taskID, userID, ctx }) {
        return new Promise(async resolve => {
            try {
                const validation = validateParamsObjectID({
                    groupID,
                    taskID,
                    userID
                })

                if(validation.error) return resolve(validation);

                const infoGroup = await PCM_PLAN_GROUP_COLL.findById(groupID);

                if(!infoGroup) {
                    return resolve({
                        error: true,
                        message: 'Nhóm dữ liệu không tồn tại',
                        keyError: 'group_not_exists',
                        status: 400
                    });
                }

                const result = await PCM_PLAN_TASK_COLL.findOneAndUpdate({
                    _id: taskID,
                    project: infoGroup.project,
                    $or: [
                        { author: userID },
                        { assignee: userID },
                    ]
                }, {
                    $set: {
                        group: groupID
                    }
                }, { new: true })

                if(!result) {
                    return resolve({
                        error: true,
                        message: 'Di chuyển không thành công (công việc không tồn tại hoặc không cùng dự án)',
                        keyError: 'error_occurred',
                        status: 422
                    });
                }

                return resolve({ error: false, data: result, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Copy child task
     * Date: 01/09/2022
     */
    cloneChildTask({ parentId, parentTask, isDraftTask, callback = null, ctx }) {
        // console.log('===========copy công việc connnnnnnnnn===========>>>>>>>>>>')
        // console.log({ parentId, parentTask, isDraftTask })
        return new Promise(async resolve => {
            try {
                // Công việc con của công việc CHA-GỐC
                const listTasks = await PCM_PLAN_TASK_COLL
                    .find({ parent: parentId })
                    .populate('parent', 'startTime expiredTime')
                    .lean();

                if(!listTasks || !listTasks.length) {
                    return resolve({
                        results: [],
                        errors: ['not found tasks']
                    })
                }
                // console.log(listTasks)

                const { results, errors } = await PromisePool
                    .for(listTasks)
                    .withConcurrency(4)
                    .process(async childTask => {
                        const childTaskID = childTask._id;

                        // Thời hạn công việc cha gốc
                        let orgParentExpiredTime = childTask.parent?.expiredTime
                        // console.log({ orgParentExpiredTime })

                        // Thời hạn công việc cha mới
                        let newParentExpiredTime = parentTask?.expiredTime
                        // console.log({ newParentExpiredTime })

                        let duaration = calculateExpire(orgParentExpiredTime, newParentExpiredTime, 'days');
                        // console.log({ duaration })

                        // // Thời gian bắt đầu task cha (1)
                        // let startTime = childTask.parent?.startTime;
                        // console.log({ startTime_TaskCha: startTime })

                        // // Deadline task con (2)
                        // let expiredTime = childTask.expiredTime;
                        // console.log({ expiredTime_TaskCon: expiredTime })

                        // // Tổng ngày từ startTime task cha -> deadline task con (3)
                        // let totalDayStartTimeToExpiredTime = calculateExpire(startTime, expiredTime, 'days');
                        // console.log({ totalDayStartTimeToExpiredTime })

                        /**
                         * Lấy startTime của task CHA MỚI (new) + thêm (3)
                         * => Deadline mới cho task con (new)
                         */
                        // let newExpiredTime = moment(parentTask.startTime, "DD-MM-YYYY")
                            // .add(totalDayStartTimeToExpiredTime, 'days');

                        let newExpiredTime = moment(childTask.expiredTime, "DD-MM-YYYY")
                            .add(duaration, 'days');

                        let suid = await stringUtils.randomAndCheckExists(PCM_PLAN_TASK_COLL, 'suid');

                        delete childTask._id;
                        const newChildTask = await PCM_PLAN_TASK_COLL.create({
                            ...childTask,
                            suid,
                            status: 1,
                            percentage: 0,
                            parent: parentTask._id,
                            startTime: new Date(),
                            actualStartTime: new Date(),
                            expiredTime: new Date(newExpiredTime),
                            actualFinishTime: new Date(newExpiredTime),
                            draft: isDraftTask ? 1 : 0,
                            signatures: [],
                            description: "",
                            descriptioncv: "",
                            note: "",
                            notecv: ""
                        })

                        if(callback) {
                            await callback(childTaskID, newChildTask);
                        }

                        return newChildTask;
                    })

                return resolve({ results, errors });
            } catch(error) {
                return resolve({
                    results: [],
                    errors: [error.message]
                });
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Copy task
     * Date: 22/04/2022
     * Updated: 01/09/2022 - MinhVH
     */
    copyTask({
        taskID, name, projectID, groupID, assigneeID, relatedIDs,
        authorAttachs, type, subtype, description, startTime, expiredHour,
        expiredTime, contractID, isDraftTask, isCloneChildTask,
        userID, bizfullname, ctx
    }) {
        // console.log('===========copy công việc===========>>>>>>>>>>')
        // console.log({
        //     taskID, name, projectID, groupID, assigneeID, relatedIDs,
        //     authorAttachs, type, subtype, description, startTime, expiredHour,
        //     expiredTime, contractID, isDraftTask, isCloneChildTask,
        //     userID, bizfullname
        // })
        return new Promise(async resolve => {
            try {
                const validation = validateParamsObjectID({
                    taskID          : { value: taskID, isRequire: true },
                    projectID       : { value: projectID, isRequire: true },
                    groupID         : { value: groupID, isRequire: true },
                    assigneeID      : { value: assigneeID, isRequire: true },
                    relatedIDs      : { value: relatedIDs, isRequire: false },
                    contractID      : { value: contractID, isRequire: false },
                    authorAttachs   : { value: authorAttachs, isRequire: false },
                    userID          : { value: userID, isRequire: true },
                });
                if(validation.error) return resolve(validation);

                // Công việc GỐC sẽ copy sang
                const infoOldTask = await PCM_PLAN_TASK_COLL
                    .findById(taskID)
                    .lean();

                if(!infoOldTask) {
                    return resolve({
                        error: true,
                        message: 'Công việc cũ không tồn tại',
                        keyError: 'old_task_not_exists',
                        status: 400
                    });
                }

                const { amountoftime, parent } = infoOldTask;

                // Clone task (CÔNG VIỆC CHA MỚI)
                const infoAfterCloneTask = await this.insert({
                    name,
                    description,
                    projectID,
                    groupID,
                    contractID,
                    authorID: userID,
                    assigneeID,
                    relatedIDs,
                    parentID: parent,
                    authorAttachs,
                    type,
                    subType: subtype,
                    // startTime,
                    startTime: new Date(),
                    expiredHour,
                    expiredTime,
                    draft: isDraftTask ? 1 : 0,
                    signatures: [],
                    amountoftime,
                    bizfullname,
                    ctx
                })
                if(infoAfterCloneTask.error) return resolve(infoAfterCloneTask);
                
                // Copy các công việc con nếu có
                if(isCloneChildTask) {
                    // Clone child task (level 2)
                    await this.cloneChildTask({
                        parentId: taskID,
                        parentTask: infoAfterCloneTask.data,
                        isDraftTask,
                        callback: async (childTaskID, newChildTask) => {

                            // Clone grand child task (level 3)
                            await this.cloneChildTask({
                                parentId: childTaskID,
                                parentTask: newChildTask,
                                isDraftTask
                            })
                        }
                    })
                }

                return resolve({ error: false, data: infoAfterCloneTask?.data, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: get info task
     * Author: Depv
     * Code:
     */
    getInfo({ option, taskID, companyID, userID, select, populates, ctx }){
        // console.log({ taskID, userID, select, populates })
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(taskID))
                    return resolve({ error: true, message: 'param_invalid' });

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

                // Bắt đầu kiểm tra quyền
                let infoTaskForCheck = await PCM_PLAN_TASK_COLL.findById(taskID).populate("group").lean();
                if(!infoTaskForCheck) {
                    return resolve({ error: true, message: 'Not found task', status: 404 });
                }

                let { author, assignee, related, group, viewedUsers, status, subtype } = infoTaskForCheck;
                if([0,1,2,3,4,5,6,7,8,9,10,11,12].includes(subtype)){
                    let isAuthor = false;
                    let isAssignee = false;
                    let isRelated = false;
                    let isMemberGroup = false;
    
                    if(author.toString() == userID.toString()){
                        isAuthor = true;
                    }
    
                    if(assignee.toString() == userID.toString()){
                        isAssignee = true;
                    }
    
                    related = related.map(item => `${item}`);
                    if(related.includes(userID)){
                        isRelated = true;
                    }
    
                    let memberInGroup = group?.members?.map(item => `${item}`) || [];
                    if(memberInGroup.includes(userID.toString())){
                        isMemberGroup = true;
                    }
    
                    if(!isAuthor && !isAssignee && !isRelated && !isMemberGroup)
                        return resolve({ error: true, message: 'permission_denied', keyError: KEY_ERROR.PERMISSION_DENIED })
                }

                // Cập nhật thông tin người truy cập
                let result = viewedUsers.filter(item => item != null);
                if(!result.map(item=>item.toString()).includes(userID.toString())){
                    await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, {
                        $addToSet: { viewedUsers: userID },
                    })
                }

                // Cập nhật trạng thái triển khai
                // if(status == 1 && assignee.toString() == userID.toString()){
                //     await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID,
                //         {
                //             $set: {
                //                 status: 2
                //             }
                //         }, { new: true })
                // }

                let infoTask = await PCM_PLAN_TASK_COLL.findById(taskID)
                    .select(select)
                    .populate(populates).lean();
				if (!infoTask)
                    return resolve({ error: true, message: 'cannot_get', keyError: KEY_ERROR.GET_INFO_FAILED })

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                // // Ghi dữ liệu Hồ sơ thầu    
                // if(infoTask.subtype == 14){
                //     let infoTF = await ANALYSIS__HISTORY_TRAFFIC_MODEL.insert({ 
                //         appID: "60390cb12b367a1cdd9f3fb2", // DataHub
                //         menuID: "623f239fe998e94feda0cd9f", // Hồ sơ mời thầu
                //         type: 2, 
                //         companyOfAuthor: companyID, 
                //         userCreate: userID
                //     })
                // }

                return resolve({ error: false, data: infoTask });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name  : Danh sách pcm_plan_task
     * Author: Depv
     * Update: HiepNH
     * Code  : 20/8/2022
     */
    getList({
        option, projectID, groupID, assigneeID, authorID, status, statusNe, draft, type, level, typeStatus, collection,
        subtype, isExpired, fromDate, toDate, signGroupOfTask, isChecklist, isChildTask, isPassPermision, sortKey, isParent,
        userID, parentID, companyOfAuthor, companyOfAssignee, fieldID, isSortChecklist, isSortChildTask, milestone,
        keyword, limit = 20, unlimit, lastestID, select, populates = {}, unlimited, upcoming, isMileStone, ctx
    }) {
        // console.log('=============DANH SÁCH CHỦ ĐỀ==========>>>>>>>>>>>>>>')
        // console.log({
        //     option, projectID, groupID, assigneeID, authorID, status, statusNe, draft, type, level, typeStatus, collection,
        //     subtype, isExpired, fromDate, toDate, signGroupOfTask, isChecklist, isChildTask, isPassPermision, sortKey, isParent,
        //     userID, parentID, companyOfAuthor, companyOfAssignee, fieldID, isSortChecklist, isSortChildTask, milestone,
        //     keyword, limit, unlimit, lastestID, select, populates, unlimited, isMileStone
        // })
        return new Promise(async (resolve) => {
            try {
                if(Number(limit) > 20){
                    limit = 20;
                } else{
                    limit = +Number(limit);
                }

                //__________Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                let conditionObj = {}, sortBy, keys = ['modifyAt__-1'], totalTaskDone = 0

                // Kiểm tra điều kiện populates
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
                 * Tính chất chủ đề
                 */
                if(!option){
                    // Các việc user đang active
                    conditionObj = {
                        usersDelete: { $nin: [userID] },
                    };

                    if(upcoming && [1,2].includes(Number(upcoming))){
                        conditionObj.upcoming = Number(upcoming)
                    }

                    // Các việc chưa hoàn thành
                    if(statusNe){
                        conditionObj.status = { $ne: statusNe };
                    }

                    if(isSortChecklist == 1 || isSortChildTask == 1){
                        keys = ['actualFinishTime__1', '_id__1'];
                        // keys = ['modifyAt__', '_id__1'];
                    }

                    //__________Danh sách các nhóm dữ liệu mà userID là members
                    let listGroups = await PCM_PLAN_GROUP_COLL.find({ members: { $in: [userID]} })

                    // Lấy công việc mà user được quyền truy cập
                    conditionObj.$or = [
                        { accessUsers: {$in: [userID]}},
                        { group: { $in: listGroups.map(item => item._id) }}, // Bỏ, vì việc tra cứu theo thẻ lọc mới cần đến. Còn lại đi theo đường thư mục
                    ]

                    // Tìm kiếm nếu có trạng thái công việc
                    if(status){
                        conditionObj.status = { $in: [status] }
                    }

                    /**
                     * Quá hạn
                     */
                    if(isExpired){
                        // Đã quá hạn
                        if(isExpired == 1) {
                            conditionObj.status = { $ne: 3 }; // Chưa hoàn thành
                            conditionObj.actualFinishTime = {
                                $lt: new Date()
                            }
                        }

                        // Chưa quá hạn
                        if(isExpired == 2) {
                            conditionObj.actualFinishTime = {
                                $gt: new Date()
                            }
                        }
                    }else{
                        /**
                         * Lấy những công việc từ ngày đến ngày
                         * - Sẽ không cùng diễn ra với Lọc quá hạn
                         */
                        if(fromDate && toDate){
                            conditionObj.actualFinishTime = {
                                $gte: new Date(fromDate),
                                $lte: new Date(toDate),
                            }
                        }
                    }

                    // Lấy những việc nháp hoặc không phải việc nháp
                    if(draft){
                        conditionObj.draft = draft;
                    }

                    // Lấy việc trong dự án
                    if(projectID && checkObjectIDs(projectID)){
                        conditionObj.project = projectID;
                    }

                    // Lấy việc trong group
                    if(groupID && checkObjectIDs(groupID)){
                        conditionObj.group = groupID
                        // conditionObj.parent = { $exists: false } // Không còn đúng nữa với các công việc Cha => Di chuyển vào Cha khác (Level=1)
                        conditionObj.level = 1; // Chỉ lấy các việc cha
                        delete conditionObj.$or;
                    }

                    // Việc theo cột mốc
                    if(!isNaN(milestone)){
                        conditionObj.milestone = milestone;
                    }

                    if(isMileStone && isMileStone == 1){
                        conditionObj.milestone = {$gt: 0}
                        // conditionObj.$where = `return this.actualFinishTime > this.actualStartTime` // Quản lý cho mốc tiến độ
                    }

                    /**
                    * Phân loại chủ đề
                    * 1-Công việc
                    * 2-Checklist
                    */
                    if(collection){
                        conditionObj.type = collection;
                    }

                    /**
                     * Type = 0 Việc của tôi + Giao + Liên quan(All)
                     * Type = 1 Việc của tôi
                     * Type = 2 Việc giao người khác
                     * Type = 3 Việc đánh dấu quan tâm
                     * Type = 4 Việc nháp
                     * Type = 5 Việc liên quan
                     */
                    if(!type || type == 0){
                        conditionObj.$or = [
                            { accessUsers: {$in: [userID]}},
                            { group: { $in: listGroups.map(item => item._id) }}
                        ]
                    }

                    // Việc của tôi
                    if(type == 1){
                        conditionObj.assignee = userID;
                        delete conditionObj.$or
                    }

                    // Việc giao người khác
                    if(type == 2){
                        conditionObj.author = userID;
                        delete conditionObj.$or
                    }

                    // Việc đánh dấu quan tâm
                    if(type == 3){
                        conditionObj.flags = { $in: [userID]};
                        delete conditionObj.$or
                        delete conditionObj.status
                    }

                    // Việc nháp
                    if(type == 4){
                        conditionObj.$or = [
                            { author: userID }, // Người tạo việc được xem
                            { related: { $in: [userID] } }, // Người liên quan được xem
                        ],
                        conditionObj.draft = 1; // Gồm cả việc nháp
                        delete conditionObj.status
                    }

                    // Việc liên quan
                    if(type == 5){
                        conditionObj.related = { $in: [userID] };
                        delete conditionObj.$or
                    }

                    if(level){
                        conditionObj.level = level;
                    }

                    /**
                     * Lấy việc quá hạn
                     * 1-Quá hạn
                     * 2-Tuần tới
                     * 3->7 ngày tới
                     * 4-Hoàn thành
                     * 5-Quan trọng
                     */
                    if(typeStatus && typeStatus == 1){
                        conditionObj.actualFinishTime = {
                            $lt: new Date()
                        }
                    }

                    // lấy việc tới hạn Tuần tới
                    if(typeStatus && typeStatus == 2){
                        conditionObj.actualFinishTime = {
                            $gte:  new Date(),
                            $lt: moment(addDate(7)).endOf('day')._d
                        }
                    }

                    // Tới hạn + 7 ngày tới
                    if(typeStatus && typeStatus == 3){
                        conditionObj.actualFinishTime = {
                            $gte: addDate(7)
                        }
                    }

                    // Hoàn thành
                    if(typeStatus && typeStatus == 4){
                        conditionObj.status = 3
                    }

                    // Quan trọng
                    if(typeStatus && typeStatus == 5){
                        conditionObj.priority = 3
                    }

                    // Lấy việc của người thực hiện
                    if(assigneeID && checkObjectIDs(assigneeID)){
                        conditionObj.assignee = assigneeID;
                    }

                    // Lấy việc của người tạo việc
                    if(authorID && checkObjectIDs(authorID)){
                        conditionObj.author = authorID;
                    }

                    // ID công việc cha, công việc chứa checklist
                    if(parentID && checkObjectIDs(parentID)){
                        conditionObj.parent = parentID;
                        delete conditionObj.$or
                        delete conditionObj.status;
                    }

                    // Chỉ lấy task cha
                    if(isParent == 1){
                        // conditionObj.parent = { $exists: false }; // Không còn đúng nữa với các công việc Cha => Di chuyển vào Cha khác (Level=1)
                        conditionObj.level = 1;
                    }

                    // Công ty của người tạo việc
                    if(companyOfAuthor && checkObjectIDs(companyOfAuthor)){
                        conditionObj.companyOfAuthor = companyOfAuthor;
                    }

                    // Công ty của người thực hiện
                    if(companyOfAssignee && checkObjectIDs(companyOfAssignee)){
                        conditionObj.companyOfAssignee = companyOfAssignee;
                    }

                    // isPassPermision dùng để bỏ qua 1 trong 4 quyền
                    if(isPassPermision == 1){
                        delete conditionObj.$or;
                    }

                    if(fieldID && checkObjectIDs(fieldID)){
                        conditionObj.field = fieldID;
                    }

                    if (sortKey && typeof sortKey === 'string') {
                        if (!IsJsonString(sortKey))
                            return resolve({ error: true, message: 'Request params sortKey invalid', status: 400 });

                        keys = JSON.parse(sortKey);
                    }

                    // Tìm kiếm theo keyword
                    if(keyword){
                        keyword = stringUtils.removeAccents(keyword)
                        keyword = keyword.split(" ")

                        keyword = '.*' + keyword.join(".*") + '.*';
                        conditionObj.namecv = new RegExp(keyword, 'i')
                    }

                    if(!isNaN(subtype)){
                        conditionObj.subtype = +subtype;
                    }                   
                }else{
                    // Quảng bá sản phẩm dịch vụ
                    if(option == 1){
                        conditionObj = { subtype: 13 }
                    }

                     // Thông báo mời thầu
                    if(option == 2){
                        conditionObj = { subtype: 14 }
                    }

                    // Thông báo từ hệ thống
                    if(option == 3){
                        conditionObj = { subtype: 15 }
                    }
                }
                
                // console.log('============================')
                // console.log(conditionObj)

                let conditionObjOrg = {...conditionObj};

				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await PCM_PLAN_TASK_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastestID", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj  = dataPagingAndSort.data.find;
					sortBy        = dataPagingAndSort.data.sort;
				} else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
					sortBy        = dataPagingAndSort.data.sort;
                }

                // Tổng số việc tìm thấy
                let totalRecord = await PCM_PLAN_TASK_COLL.count(conditionObjOrg);
                if(unlimit == 1){
                    limit = totalRecord;
                }
                // console.log({limit})

                /**
                 * Dùng để lấy all data, Chỉ:
                 * - Dùng internal services
                 * - Không cho client truyền qua API
                 */
                if(unlimited) {
                    const infoDataAfterGet = await PCM_PLAN_TASK_COLL
                        .find({ ...conditionObj, draft: 0 })
                        .select(select)
                        .populate(populates)
                        .sort(sortBy)
                        .lean()

                    return resolve({
                        data: infoDataAfterGet
                    });
                }
                // console.log(conditionObj)

                // Bắt đầu query trong db
                let infoDataAfterGet = await PCM_PLAN_TASK_COLL.find(conditionObj)
                    .limit(limit+1)
                    .select(select)
                    .populate(populates)
                    .sort(sortBy)
                    .lean();

                // Kiểm tra nếu không có dữ liệu
                if(!infoDataAfterGet)
                   return resolve({ error: true, message: "Can't get data", keyError: KEY_ERROR.GET_LIST_FAILED, status: 200 });

                // nextCursor phần tử cuối cùng khi phân trang
                let nextCursor	= null;
                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                // Lấy tổng subtask đã hoàn thành (show in detail task)
                if(parentID && checkObjectIDs(parentID)){
                    totalTaskDone = await PCM_PLAN_TASK_COLL.count({
                        parent: parentID,
                        type: 2,
                        status: 3
                    });
                }

                // Tổng số trang
                let totalPage   = Math.ceil(totalRecord/limit);

                return resolve({ error: false, data: {
                    listRecords: infoDataAfterGet,
                    limit,
                    totalTaskDone,
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
     * Func: Tìm kiếm Task
     * Date: 11/05/2022
     */
    getListByFilter({
        option, companyID, fromDate, toDate, assigneesID, companiesOfAssignee, authorsID, companiesOfAuthor,
        projectsID, subtypes, status, fieldsID, isExpired, read, isParent, isGroup, priority, prioritys, reportType, keyword, unlimited,
        limit = 20, lastestID, select, populates, userID, reportID, upcoming, ctx
    }) {
        // console.log('=============TÌM KIẾM CHỦ ĐỀ TRANG CHỦ GET LIST BY FILTER==========>>>>>>>>>>>>>>')
        // console.log({
        //     option, companyID, fromDate, toDate, assigneesID, companiesOfAssignee, authorsID, companiesOfAuthor,
        // projectsID, subtypes, status, fieldsID, isExpired, read, isParent, isGroup, priority, prioritys, reportType, keyword, unlimited,
        // limit, lastestID, select, populates, userID, reportID, upcoming
        // })
        return new Promise(async resolve => {
            try {
                //__________Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                const validation = validateParamsObjectID({
                    companiesOfAssignee : { value: companiesOfAssignee, isRequire: false },
                    assigneesID         : { value: assigneesID, isRequire: false },
                    authorsID           : { value: authorsID, isRequire: false },
                    companiesOfAuthor   : { value: companiesOfAuthor, isRequire: false },
                    projectsID          : { value: projectsID, isRequire: false },
                    fieldsID            : { value: fieldsID, isRequire: false },
                });
                if(validation.error) return resolve(validation);

                if(populates && typeof populates === 'string'){
					if(!IsJsonString(populates))
						return resolve({ error: true, message: 'Request params populates invalid', status: 400 });

					populates = JSON.parse(populates);
				} else{
                    populates = {
                        path: "",
                        select: ""
                    }
                }

                let conditionObj = {
                    usersDelete: { $nin: [userID] },
                };

                let nextCursor  = null;
                let sortBy      = null;
                let keys	 = ['modifyAt__-1', '_id__-1'];
                // let keys	    = ['actualFinishTime__-1', '_id__-1'];

                if(limit > 20 && isNaN(limit)){
                    limit = 20;
                } else{
                    limit = +limit;
                }

                /**
                 * Kiểm soát quyền truy cập Task
                 */
                if(isGroup && Number(isGroup) == 1){
                    // Lấy danh sách các nhóm dữ liệu mà userID là members
                    const listGroups = await PCM_PLAN_GROUP_COLL.find({ members: { $in: [userID]} })

                    // Lấy công việc mà userID được quyền truy cập
                    conditionObj.$or = [
                        { accessUsers: {$in: [userID]}},
                        { group: { $in: listGroups.map(item => item._id) }},
                    ]
                }else{
                    // Lấy công việc mà userID được quyền truy cập
                    conditionObj.accessUsers = {$in: [userID]}
                }

                if(upcoming && [1,2].includes(Number(upcoming))){
                    conditionObj.upcoming = Number(upcoming)
                }

                /**
                 * PHÂN LOẠI CÔNG VIỆC
                 * 1-Việc của tôi
                 * 2-Việc giao người khác
                 * 3-Việc liên quan
                 */
                if(reportType == 1){
                    conditionObj.assignee = userID;
                    delete conditionObj.$or
                }

                // Việc giao người khác
                if(reportType && reportType == 2){
                    conditionObj.author = ObjectID(userID)
                    delete conditionObj.$or
                }

                /**
                 * Bộ lọc với nhiều lựa chọn
                 */
                prioritys && prioritys.length                       && (conditionObj.priority = { $in: prioritys });
                status && status.length                             && (conditionObj.status = { $in: status });
                projectsID && projectsID.length                     && (conditionObj.project = { $in: projectsID });
                subtypes && subtypes.length                         && (conditionObj.subtype = { $in: subtypes });
                assigneesID && assigneesID.length                   && (conditionObj.assignee = { $in: assigneesID });
                authorsID && authorsID.length                       && (conditionObj.author = { $in: authorsID });
                fieldsID && fieldsID.length                         && (conditionObj.field = { $in: fieldsID });
                companiesOfAssignee && companiesOfAssignee.length   && (conditionObj.companyOfAssignee = { $in: companiesOfAssignee });
                companiesOfAuthor && companiesOfAuthor.length       && (conditionObj.companyOfAuthor = { $in: companiesOfAuthor });

                // Chỉ lấy task cha hoặc lấy tất cả
                if(isParent && isParent == 1){
                    conditionObj.parent = { $exists: false };
                }
                if(isParent && isParent == 2){
                    conditionObj.parent = { $exists: true };
                }

                // Chưa xem (user nắm trong mảng new)
                if(read && read == 1){
                    conditionObj.news = { $in: [userID] }
                }
                // Đã xem (user bị xoá ra khỏi mảng news)
                if(read && read == 2){
                    conditionObj.news = { $nin: [userID] }
                }

                /**
                 * Quá hạn
                 */
                if(isExpired && Number(isExpired) > 0){
                    // Đã quá hạn
                    if(isExpired == 1) {
                        conditionObj.status = { $ne: 3 }; // Chưa hoàn thành
                        conditionObj.actualFinishTime = {
                            $lt: new Date()
                        }
                    }

                    // Chưa quá hạn
                    if(isExpired == 2) {
                        conditionObj.actualFinishTime = {
                            $gt: new Date()
                        }
                    }
                }else{
                    /**
                     * Lấy những công việc từ ngày đến ngày
                     * - Sẽ không cùng diễn ra với Lọc quá hạn
                     */
                    if(fromDate && toDate){
                        conditionObj.actualFinishTime = {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate),
                        }
                    }
                }

                /**
                 * Việc quan trọng
                 */
                if(priority && Number(priority) > 0){
                    conditionObj.priority = Number(priority)
                }

                if(option && option == 1){
                    conditionObj.company = companyID
                }

                // Tìm kiếm theo keyword
				if(keyword){
                    keyword = stringUtils.removeAccents(keyword)
                    keyword = keyword.split(" ")

                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj.namecv = new RegExp(keyword, 'i')
                }

                // Tìm theo báo cáo
                if(reportID && checkObjectIDs(reportID)){
                    let infoReport = await PCM_PLAN_REPORT_COLL.findById(reportID).select('subjects')
                    conditionObj._id = {$in: infoReport.subjects}
                }
                // console.log(conditionObj)

                let conditionObjOrg = {...conditionObj};
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await PCM_PLAN_TASK_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastestID", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj  = dataPagingAndSort.data.find;
					sortBy        = dataPagingAndSort.data.sort;
				} else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
					sortBy        = dataPagingAndSort.data.sort;
                }

                /**
                 * Dùng để lấy all data, Chỉ:
                 * - Dùng internal services
                 * - Không cho client truyền qua API
                 */
                if(unlimited) {
                    const infoDataAfterGet = await PCM_PLAN_TASK_COLL
                        .find(conditionObj)
                        .select(select)
                        .populate(populates)
                        .sort(sortBy)
                        .lean();

                    return resolve({
                        data: infoDataAfterGet
                    });
                }

                /**
                 * QUERY DATABASE (4)
                 */
                const infoDataAfterGet = await PCM_PLAN_TASK_COLL
                    .find(conditionObj)
                    .limit(limit+1)
                    .select(select)
                    .populate(populates)
                    .sort(sortBy)
                    .lean();

                if(!infoDataAfterGet) {
                    return resolve({
                        error: true,
                        message: 'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurred',
                        status: 422
                    });
                }

                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                const totalRecord = await PCM_PLAN_TASK_COLL.count(conditionObjOrg);
                const totalPage   = Math.ceil(totalRecord / limit);

                return resolve({
                    error: false,
                    status: 200,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    },
                });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

     /**
     * Name: Gom nhóm theo thuộc tính
     * Dev: HiepNH
     * Date: 27/8/2023
     */
    getListByProperty({ option, userID, fromDate, toDate, projectID, companyID, year, outin, keyword, ctx }){
        // console.log({ option, userID, fromDate, toDate, projectID, companyID, year, outin, keyword })
        return new Promise(async resolve => {
            try {
                //__________Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                let conditionObj = {}, conditionProject = {}
                
                // Tổng hợp từ các Task mà user được quyền truy cập
                // let listTasks = await PCM_PLAN_TASK_COLL.find({accessUsers: {$in: [userID]}}).select('_id')

                // //__________Danh sách các nhóm dữ liệu mà userID là members
                let listGroups = await PCM_PLAN_GROUP_COLL.find({ members: { $in: [userID]} })

                // Lấy công việc mà user được quyền truy cập
                conditionObj.$or = [
                    // { author: ObjectID(userID) },
                    // { assignee: ObjectID(userID) },
                    // { related: { $in: [ObjectID(userID)] }},
                    { accessUsers: {$in: [userID]}},
                    { group: { $in: listGroups.map(item => item._id) }},
                ]

                /**
                 * Tính tổng số lượng theo các phân loại của Nhà thầu
                 */
                if(option == 1 || option == 2){
                    let listTasks = await PCM_PLAN_TASK_COLL.find(conditionObj).select('_id')

                    let objectGroup, conditionPopulateProject, conditionPopulateCompany, sortProject, sortCompany

                    if(option == 1){
                        conditionPopulateProject = {
                            path: '_id.project',
                            select: '_id name sign image',
                            model: 'department'
                        }

                        conditionPopulateCompany = {
                            path: '_id.companyOfAuthor',
                            select: '_id name sign image',
                            model: 'company'
                        }

                        objectGroup = { project: '$project', companyOfAuthor: '$companyOfAuthor' }

                        sortProject = { "_id.project": 1 }
                        sortCompany = { "_id.companyOfAuthor": 1 }
                    }

                    if(option == 2){

                        conditionPopulateProject = {
                            path: '_id.project',
                            select: '_id name sign image',
                            model: 'department'
                        }

                        conditionPopulateCompany = {
                            path: '_id.companyOfAssignee',
                            select: '_id name sign image',
                            model: 'company'
                        }

                        objectGroup = { project: '$project', companyOfAssignee: '$companyOfAssignee' }

                        sortProject = { "_id.project": 1 }
                        sortCompany = { "_id.companyOfAssignee": 1 }
                    }

                    let listDataProject = await PCM_PLAN_TASK_COLL.aggregate([
                        {
                            $match: {
                                _id: {$in: listTasks.map(item=>item._id)}
                            }
                        },
                        {
                            $group: {
                                _id: { project: '$project' },
                                amount: { $sum: 1 },
                            }
                        },
                        { $sort: sortProject},
                    ])

                    let listDataProjectCompany = await PCM_PLAN_TASK_COLL.aggregate([
                        {
                            $match: {
                                _id: {$in: listTasks.map(item=>item._id)}
                            }
                        },
                        {
                            $group: {
                                _id: objectGroup,
                                amount: { $sum: 1 },
                            }
                        },
                        { $sort: sortCompany},
                    ])

                    if(listDataProject.length){
                        await DEPARTMENT_COLL.populate(listDataProject, conditionPopulateProject)
                    }

                    if(listDataProjectCompany.length){
                        await DEPARTMENT_COLL.populate(listDataProjectCompany, conditionPopulateCompany)
                    }

                    return resolve({ error: false, data: { listDataProject, listDataProjectCompany } });
                }

                // Danh sách các công việc theo phân loại
                if(option == 3){
                    conditionObj.project = ObjectID(projectID)
                    conditionObj.companyOfAuthor = ObjectID(companyID)
                    let listDataTasks = await PCM_PLAN_TASK_COLL.aggregate([
                        {
                            $match: conditionObj
                        },
                        {
                            $group: {
                                _id: { subtype: '$subtype' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    return resolve({ error: false, data: listDataTasks });
                }

                // Theo công ty người thực hiện
                if(option == 4){
                    conditionObj.project = ObjectID(projectID)
                    conditionObj.companyOfAssignee = ObjectID(companyID)
                    let listDataTasks = await PCM_PLAN_TASK_COLL.aggregate([
                        {
                            $match: conditionObj
                        },
                        {
                            $group: {
                                _id: { subtype: '$subtype' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    return resolve({ error: false, data: listDataTasks })
                }

                // Báo cáo hóa đơn
                if(option == 5){
                    if(outin == 1 || outin == 2){
                        conditionProject = {
                            year : {$year : "$actualFinishTime"},
                            month : {$month : "$actualFinishTime"},
                            company: 1,
                            subtype: 1,
                            actualFinishTime: 1,
                            amount: 1,
                            vatAmount: 1,
                        }
    
                        delete conditionObj.$or
                        conditionObj.company = ObjectID(companyID)
                        conditionObj.subtype = 12
                        conditionObj.year = Number(year)
                        let listData = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $project: conditionProject
                            },
                            {
                                $match: conditionObj
                            },
                            {
                                $group: {
                                    _id: { month: "$month" },
                                    amount: { $sum: "$amount" },
                                    vatAmount: { $sum: "$vatAmount" },
                                }
                            },
                        ])
    
                        return resolve({ error: false, data: listData })
                    }
                }

                // Danh sách Công ty thực hiện
                if(option == 6){
                    conditionObj = {accessUsers: {$in: [ObjectID(userID)]}, companyOfAssignee: {$exists: true, $ne: null}}

                    if(keyword){
                        // keyword = stringUtils.removeAccents(keyword)
                        keyword = keyword.split(" ")
                        keyword = '.*' + keyword.join(".*") + '.*';
                        let listCompany = await COMPANY_COLL.find({name: new RegExp(keyword, 'i')}).select('name')
                        conditionObj.companyOfAssignee = {$in: listCompany.map(item=>ObjectID(item._id))}
                    }


                    let listData = await PCM_PLAN_TASK_COLL.aggregate([
                        {
                            $match: conditionObj
                        },
                        {
                            $group: {
                                _id: { companyOfAssignee: '$companyOfAssignee' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    let conditionPopulateCompany = {
                        path: '_id.companyOfAssignee',
                        select: '_id name sign image',
                        model: 'company'
                    }

                    if(listData.length){
                        await PCM_PLAN_TASK_COLL.populate(listData, conditionPopulateCompany)
                    }

                    return resolve({ error: false, data: listData })
                }

                // Danh sách User thực hiện
                if(option == 7){
                    conditionObj = {accessUsers: {$in: [ObjectID(userID)]}, assignee: {$exists: true, $ne: null}}

                    if(keyword){
                        // keyword = stringUtils.removeAccents(keyword)
                        keyword = keyword.split(" ")
                        keyword = '.*' + keyword.join(".*") + '.*';
                        let listUser = await USER_COLL.find({fullname: new RegExp(keyword, 'i')}).select('name')
                        conditionObj.assignee = {$in: listUser.map(item=>ObjectID(item._id))}
                    }


                    let listData = await PCM_PLAN_TASK_COLL.aggregate([
                        {
                            $match: conditionObj
                        },
                        {
                            $group: {
                                _id: { assignee: '$assignee' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    let conditionPopulateUser = {
                        path: '_id.assignee',
                        select: '_id fullname image email',
                        model: 'user'
                    }

                    if(listData.length){
                        await PCM_PLAN_TASK_COLL.populate(listData, conditionPopulateUser)
                    }

                    return resolve({ error: false, data: listData })
                }

                // Danh sách Công ty tạo phản hồi
                if(option == 8){
                    conditionObj = {accessUsers: {$in: [ObjectID(userID)]}, companyOfAuthor: {$exists: true, $ne: null}}

                    if(keyword){
                        // keyword = stringUtils.removeAccents(keyword)
                        keyword = keyword.split(" ")
                        keyword = '.*' + keyword.join(".*") + '.*';
                        let listCompany = await COMPANY_COLL.find({name: new RegExp(keyword, 'i')}).select('name')
                        conditionObj.companyOfAuthor = {$in: listCompany.map(item=>ObjectID(item._id))}
                    }


                    let listData = await PCM_COMMENT_COLL.aggregate([
                        {
                            $match: conditionObj
                        },
                        {
                            $group: {
                                _id: { companyOfAuthor: '$companyOfAuthor' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    let conditionPopulateCompany = {
                        path: '_id.companyOfAuthor',
                        select: '_id name sign image',
                        model: 'company'
                    }

                    if(listData.length){
                        await PCM_COMMENT_COLL.populate(listData, conditionPopulateCompany)
                    }

                    return resolve({ error: false, data: listData })
                }

                // Danh sách User phản hồi
                if(option == 9){
                    conditionObj = {accessUsers: {$in: [ObjectID(userID)]}, author: {$exists: true, $ne: null}}

                    if(keyword){
                        // keyword = stringUtils.removeAccents(keyword)
                        keyword = keyword.split(" ")
                        keyword = '.*' + keyword.join(".*") + '.*';
                        let listUser = await USER_COLL.find({fullname: new RegExp(keyword, 'i')}).select('name')
                        conditionObj.author = {$in: listUser.map(item=>ObjectID(item._id))}
                    }


                    let listData = await PCM_COMMENT_COLL.aggregate([
                        {
                            $match: conditionObj
                        },
                        {
                            $group: {
                                _id: { author: '$author' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    let conditionPopulateUser = {
                        path: '_id.author',
                        select: '_id fullname image email',
                        model: 'user'
                    }

                    if(listData.length){
                        await PCM_COMMENT_COLL.populate(listData, conditionPopulateUser)
                    }

                    return resolve({ error: false, data: listData })
                }

            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Lấy số lượng các phân loại tại Trang chủ
     * Author: HiepNH
     * Date: 22/8/2023
     */
    getAmountNotification({ userID, option, ctx }){
        // console.log('=================THÔNG BÁO SỐ VIỆC TẠI TRANG CHỦ================>>>>>>>>>>>>>>')
        // console.log({ userID, option })
        return new Promise(async resolve => {
            try {
                let start = new Date()
                start.setHours(0,0,0,0)
                // console.log({start })

                let end = new Date()
                end.setHours(23,59,59,999)

                let amountUnreadTaskSync=0, amountMyTaskTodaySync=0, amountMyTaskComingSync = 0, amountMyApprovalSync = 0
                let amountMyTask1Sync=0, amountMyTask2Sync=0, amountMyTask3Sync=0, amountMyTask4Sync=0, amountMyTask5Sync=0

                if(!option){
                    // Số công việc chưa xem
                    amountUnreadTaskSync = PCM_PLAN_TASK_COLL.count({
                        news: { $in: [userID] },
                        upcoming: 1,
                        usersDelete: { $nin: [userID] },
                    })

                    // Số công việc của tôi - Ngày nay
                    amountMyTaskTodaySync = PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        status: { $ne: 3 },
                        upcoming: 1,
                        usersDelete: { $nin: [userID] },
                        actualFinishTime: { $gte: start, $lte: end },
                    })
                    // console.log({ $gte: start, $lte: end })

                    // Số công việc của tôi - Quá hạn
                    amountMyTask1Sync = PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        status: { $ne: 3 },
                        upcoming: 1,
                        usersDelete: { $nin: [userID] },
                        actualFinishTime: { $lt: new Date() }
                    })

                    // Số công việc của tôi - Tuần tới
                    amountMyTask2Sync = PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        status: { $ne: 3 },
                        upcoming: 1,
                        usersDelete: { $nin: [userID] },
                        actualFinishTime: {
                            $gte:  moment(start).startOf('day')._d,
                            $lt: moment(addDate(7)).endOf('day')._d
                        }
                    })

                    // Số công việc của tôi - Sau tuần tới
                    amountMyTask3Sync = PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        status: { $ne: 3 },
                        upcoming: 1,
                        usersDelete: { $nin: [userID] },
                        actualFinishTime: {
                            $gte: addDate(7)
                        }
                    })

                    // Số công việc của tôi - Quan trọng
                    amountMyTask4Sync = PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        status: { $ne: 3 },
                        upcoming: 1,
                        priority: 3,
                        usersDelete: { $nin: [userID] }
                    })

                    // Số công việc của tôi - Nháp
                    amountMyTask5Sync = PCM_PLAN_TASK_COLL.count({
                        author: userID,
                        status: { $ne: 3 },
                        upcoming: 1,
                        draft: 1,
                        usersDelete: { $nin: [userID] }
                    })

                    // Số công việc cần duyệt của tôi
                    amountMyApprovalSync = PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        status: { $ne: 3 },
                        upcoming: 1,
                        subtype: {$in: [2, 3]},
                        usersDelete: { $nin: [userID] }
                    })

                    // Số công việc của tôi - Sắp tới lượt
                    amountMyTaskComingSync = PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        status: { $ne: 3 },
                        usersDelete: { $nin: [userID] },
                        upcoming: 2
                    })

                    let [ amountUnreadTask, amountMyTaskToday, amountMyTaskComing, amountMyApproval, amountMyTask1, amountMyTask2, amountMyTask3, amountMyTask4, amountMyTask5 ] = await Promise.all([amountUnreadTaskSync, amountMyTaskTodaySync, amountMyTaskComingSync, amountMyApprovalSync, amountMyTask1Sync, amountMyTask2Sync, amountMyTask3Sync, amountMyTask4Sync, amountMyTask5Sync])

                    // console.log({amountMyTask1})
                    // console.log({amountMyTask2})
                    // console.log({amountMyTask3})

                    return resolve({ error: false, data: {
                        amountUnreadTask, 
                        amountMyTaskComing, 
                        amountMyTaskToday, 
                        amountMyApproval,
                        amountMyTask1,
                        amountMyTask2, 
                        amountMyTask3, 
                        amountMyTask4,
                        amountMyTask5
                    }})
                }else{
                    // Phê duyệt của tôi
                    if(option == 1){
                        // Số công việc của tôi - Ngày nay
                        amountMyTaskTodaySync = PCM_PLAN_TASK_COLL.count({
                            assignee: userID,
                            subtype: { $in: [2, 3] },
                            status: { $ne: 3 },
                            // upcoming: 1,
                            usersDelete: { $nin: [userID] },
                            actualFinishTime: { $gte: start, $lte: end }
                        })

                        // Số công việc của tôi - Quá hạn
                        amountMyTask1Sync = PCM_PLAN_TASK_COLL.count({
                            assignee: userID,
                            subtype: { $in: [2, 3] },
                            status: { $ne: 3 },
                            // upcoming: 1,
                            usersDelete: { $nin: [userID] },
                            actualFinishTime: { $lt: new Date() }
                        })

                        // Số công việc của tôi - Tuần tới
                        amountMyTask2Sync = PCM_PLAN_TASK_COLL.count({
                            assignee: userID,
                            subtype: { $in: [2, 3] },
                            status: { $ne: 3 },
                            // upcoming: 1,
                            usersDelete: { $nin: [userID] },
                            actualFinishTime: {
                                $gte:  moment(start).startOf('day')._d,
                                $lt: moment(addDate(7)).endOf('day')._d
                            }
                        })

                        // Số công việc của tôi - Sau tuần tới
                        amountMyTask3Sync = PCM_PLAN_TASK_COLL.count({
                            assignee: userID,
                            subtype: { $in: [2, 3] },
                            status: { $ne: 3 },
                            // upcoming: 1,
                            usersDelete: { $nin: [userID] },
                            actualFinishTime: {
                                $gte: addDate(7)
                            }
                        })

                        // Số công việc của tôi - Quan trọng
                        amountMyTask4Sync = PCM_PLAN_TASK_COLL.count({
                            assignee: userID,
                            subtype: { $in: [2, 3] },
                            status: { $ne: 3 },
                            // upcoming: 1,
                            priority: 3,
                            usersDelete: { $nin: [userID] }
                        })


                        let [ amountMyTaskToday, amountMyTask1, amountMyTask2, amountMyTask3, amountMyTask4 ] = await Promise.all([amountMyTaskTodaySync, amountMyTask1Sync, amountMyTask2Sync, amountMyTask3Sync, amountMyTask4Sync])

                        return resolve({ error: false, data: {
                            amountMyTaskToday, 
                            amountMyTask1,
                            amountMyTask2, 
                            amountMyTask3,
                            amountMyTask4
                        }})
                    }
                }

                
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Báo cáo linh hoạt
     * Author: HiepNH
     * Date: 29/10/2022
     */
    getDynamicReport({ userID, companyID, option, projectID, reportType, status, subtypes, fromDate, toDate, upcoming, isMilestone, year, ctx }){
        // console.log('========>>>>>>>>>>>>>>>>>>>')
        // console.log({ userID, companyID, option, projectID, reportType, status, subtypes, fromDate, toDate, upcoming, isMilestone, year })
        return new Promise(async resolve => {
            try {
                //__________Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                let conditionObj = {}, conditionProject = {}, conditionMatch = {}
                let objectGroup, conditionPopulateUser, conditionPopulateProject, conditionPopulateCompany, sortBy, sortProject, sortCompany

                conditionObj.usersDelete = { $nin: [ObjectID(userID)] }

                // Theo dự án chứa việc
                if(projectID && checkObjectIDs(projectID)){
                    conditionObj.project = ObjectID(projectID)
                }

                if(Array.isArray(status)){
                    conditionObj.status = {$in: status.map(item=>Number(item))}
                }
                if(Array.isArray(subtypes)){
                    conditionObj.subtype = {$in: subtypes.map(item=>Number(item))}
                }

                // Việc của tôi
                if(reportType && reportType == 1){
                    conditionObj.assignee = ObjectID(userID)
                }

                // Việc giao người khác
                if(reportType && reportType == 2){
                    conditionObj.author = ObjectID(userID)
                }

                // Việc liên quan/của tôi/giao
                if(reportType && reportType == 3){
                    let listGroups = await PCM_PLAN_GROUP_COLL.find({ members: { $in: [userID]} })
                    conditionObj.$or = [
                        { accessUsers: {$in: [ObjectID(userID)]}},
                        { group: { $in: listGroups.map(item => ObjectID(item._id)) }},
                    ]
                }

                // Theo thời hạn
                if(fromDate && toDate){
                    conditionObj.actualFinishTime = {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate),
                    }
                }

                if(upcoming && [1,2].includes(Number(upcoming))){
                    // console.log('=============Truyền biến upcoming===============>>>>>>>>>>>>>>>')
                    conditionObj.upcoming = Number(upcoming)
                }

                // console.log(conditionObj)

                if(!option){
                    let start = new Date();
                    start.setHours(0,0,0,0);
                    let end = new Date();
                    end.setHours(23,59,59,999);

                    let amountUnreadTask=0,amountMyTask1=0,amountMyTask2=0,amountMyTask3=0,amountMyTask4=0

                    // Số công việc chưa xem
                    amountUnreadTask = await PCM_PLAN_TASK_COLL.count({
                        news: { $in: [userID] },
                        upcoming: 1,
                        usersDelete: { $nin: [userID] }
                    })

                    // Số công việc của tôi - Quá hạn
                    amountMyTask1 = await PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        upcoming: 1,
                        usersDelete: { $nin: [userID] },
                        status: { $ne: 3 },
                        actualFinishTime: { $lt: start }
                    })

                    // Số công việc của tôi - Tuần tới
                    amountMyTask2 = await PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        upcoming: 1,
                        usersDelete: { $nin: [userID] },
                        status: { $ne: 3 },
                        actualFinishTime: {
                            $gte:  moment(start).startOf('day')._d,
                            $lt: moment(addDate(7)).endOf('day')._d
                        }
                    })

                    // Số công việc của tôi - Sau tuần tới
                    amountMyTask3 = await PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        upcoming: 1,
                        usersDelete: { $nin: [userID] },
                        status: { $ne: 3 },
                        actualFinishTime: {
                            $gte: addDate(7)
                        }
                    })

                    // Số công việc của tôi - Quan trọng
                    amountMyTask4 = await PCM_PLAN_TASK_COLL.count({
                        assignee: userID,
                        upcoming: 1,
                        status: { $ne: 3 },
                        priority: 3,
                        usersDelete: { $nin: [userID] }
                    })

                    // console.log({amountMyTask1})
                    // console.log({amountMyTask2})
                    // console.log({amountMyTask3})

                    return resolve({ error: false, data: {
                        amountUnreadTask, amountMyTask1, amountMyTask2, amountMyTask3, amountMyTask4
                    }});
                }else{
                    /**
                     * Theo đơn vị tạo việc
                     */
                    if(option && Number(option) == 1){
                        objectGroup = { companyOfAuthor: '$companyOfAuthor' }
                        sortBy = { "_id.companyOfAuthor": 1 }
                        conditionPopulateCompany = {
                            path: '_id.companyOfAuthor',
                            select: '_id name sign image',
                            model: 'company'
                        }

                        let listDataCompany = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            { $sort: sortBy},
                        ])

                        if(listDataCompany.length){
                            await PCM_PLAN_TASK_COLL.populate(listDataCompany, conditionPopulateCompany)
                        }

                        return resolve({ error: false, data: { listDataCompany } });
                    }

                    /**
                     * Theo người tạo việc
                     */
                    if(option && Number(option) == 2){
                        objectGroup = { author: '$author' }
                        sortBy = { "_id.author": 1 }

                        conditionPopulateUser = {
                            path: '_id.author',
                            select: '_id name sign image fullname',
                            model: 'user'
                        }
                        // console.log(conditionObj)
                        // console.log(objectGroup)

                        let listDataUser = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            { $sort: sortBy},
                        ])
                        // console.log(listDataUser)

                        if(listDataUser.length){
                            await PCM_PLAN_TASK_COLL.populate(listDataUser, conditionPopulateUser)
                        }

                        return resolve({ error: false, data: { listDataUser } });
                    }

                     /**
                     * Theo đơn vị thực hiện
                     */
                     if(option && Number(option) == 3){
                        objectGroup = { companyOfAssignee: '$companyOfAssignee' }
                        sortBy = { "_id.companyOfAssignee": 1 }
                        conditionPopulateCompany = {
                            path: '_id.companyOfAssignee',
                            select: '_id name sign image',
                            model: 'company'
                        }
                        // console.log(conditionObj)

                        let listDataCompany = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            { $sort: sortBy},
                        ])

                        if(listDataCompany.length){
                            await PCM_PLAN_TASK_COLL.populate(listDataCompany, conditionPopulateCompany)
                        }

                        return resolve({ error: false, data: { listDataCompany } });
                    }

                    /**
                     * Theo người thực hiện
                     */
                    if(option && Number(option) == 4){
                        objectGroup = { assignee: '$assignee' }
                        sortBy = { "_id.assignee": 1 }

                        conditionPopulateUser = {
                            path: '_id.assignee',
                            select: '_id name sign image fullname',
                            model: 'user'
                        }
                        // console.log(conditionObj)
                        // console.log(objectGroup)

                        let listDataUser = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            { $sort: sortBy},
                        ])
                        // console.log(listDataUser)

                        if(listDataUser.length){
                            await PCM_PLAN_TASK_COLL.populate(listDataUser, conditionPopulateUser)
                        }

                        return resolve({ error: false, data: { listDataUser } });
                    }

                    /**
                     * Theo Dự án/Phòng ban chứa công việc
                     */
                    if(option && Number(option) == 5){
                        objectGroup = { project: '$project' }
                        sortBy = { "_id.project": 1 }
                        conditionPopulateProject = {
                            path: '_id.project',
                            select: '_id name sign image',
                            model: 'department'
                        }

                        let listDataProject = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            { $sort: sortBy},
                        ])

                        if(listDataProject.length){
                            await PCM_PLAN_TASK_COLL.populate(listDataProject, conditionPopulateProject)
                        }

                        return resolve({ error: false, data: { listDataProject } });
                    }

                    /**
                     * Theo tính chất công việc
                     */
                    if(option && Number(option) == 6){
                        objectGroup = { subtype: '$subtype' }
                        sortBy = { "_id.subtype": 1 }

                        let listDataSubtype = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            { $sort: sortBy},
                        ])

                        return resolve({ error: false, data: { listDataSubtype } });
                    }

                    /**
                     * Theo trạng thái công việc
                     */
                    if(option && Number(option) == 7){
                        objectGroup = { status: '$status' }
                        sortBy = { "_id.status": 1 }

                        let listDataStatus = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            { $sort: sortBy},
                        ])

                        return resolve({ error: false, data: { listDataStatus } });
                    }

                    /**
                     * Theo mức độ ưu tiên
                     */
                    if(option && Number(option) == 8){
                        objectGroup = { priority: '$priority' }
                        sortBy = { "_id.priority": 1 }

                        let listDataPriority = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            { $sort: sortBy},
                        ])

                        return resolve({ error: false, data: { listDataPriority } });
                    }

                    /**
                     * Tổng hợp số lượng và phân loại theo tháng, năm của dự án
                     */
                    if(option && Number(option) == 9){
                        conditionObj = {project: ObjectID(projectID)}

                        conditionProject = {
                            year : {$year : "$actualFinishTime"},
                            month : {$month : "$actualFinishTime"},
                            actualFinishTime: 1,
                            milestone: 1,
                            project: 1,
                        }

                        if(isMilestone && isMilestone == 1){
                            conditionObj.milestone = {$gt: 0}
                        }

                        if(year){
                            conditionMatch.year = Number(year)
                        }

                        objectGroup = { month: '$month', year: '$year' }
                        // sortBy = { "_id.year": 1 }

                        // console.log(conditionObj)

                        let listData = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $project: conditionProject
                            },
                            {
                                $match: conditionMatch
                            }, 
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            // { $sort: sortBy},
                        ])

                        return resolve({ error: false, data: listData });
                    }

                    /**
                     * Tổng hợp số lượng cho Báo cáo quản trị
                     */
                    if(option && Number(option) == 10){
                        // console.log('conditionObj======================')
                        if(checkObjectIDs(projectID)){
                            conditionObj = {project: ObjectID(projectID)}
                        }else{
                            conditionObj = {company: ObjectID(companyID)}
                        }

                        // console.log(conditionObj)

                        conditionProject = {
                            year : {$year : "$createAt"},
                            month : {$month : "$createAt"},
                            company: 1,
                            project: 1,
                            companyOfAuthor: 1,
                            author: 1,
                            createAt: 1,
                        }

                        if(year){
                            conditionMatch.year = Number(year)
                        }

                        objectGroup = { month: '$month' }
                        // sortBy = { "_id.year": 1 }

                        // console.log(conditionObj)

                        // Gom nhóm theo tháng
                        let listData = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $project: conditionProject
                            },
                            {
                                $match: conditionMatch
                            }, 
                            {
                                $group: {
                                    _id: objectGroup,
                                    amount: { $sum: 1 },
                                }
                            },
                            // { $sort: sortBy},
                        ])

                        // Gom nhóm theo dự án, phòng ban chứa mẩu tin
                        let listData2 = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $project: conditionProject
                            },
                            {
                                $match: conditionMatch
                            }, 
                            {
                                $group: {
                                    _id: { project: '$project', month: '$month'},
                                    amount: { $sum: 1 },
                                }
                            },
                            // { $sort: sortBy},
                        ])

                        let conditionPopulateProject = {
                            path: '_id.project',
                            select: '_id name sign',
                            model: 'department'
                        }

                        await PCM_PLAN_TASK_COLL.populate(listData2, conditionPopulateProject)

                        // Gom nhóm theo đơn vị tạo
                        let listData3 = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $project: conditionProject
                            },
                            {
                                $match: conditionMatch
                            }, 
                            {
                                $group: {
                                    _id: { companyOfAuthor: '$companyOfAuthor', month: '$month'},
                                    amount: { $sum: 1 },
                                }
                            },
                            // { $sort: sortBy},
                        ])

                        let conditionPopulateCompanyOfAuthor = {
                            path: '_id.companyOfAuthor',
                            select: '_id name sign image',
                            model: 'company'
                        }

                        await PCM_PLAN_TASK_COLL.populate(listData3, conditionPopulateCompanyOfAuthor)


                        // Gom nhóm theo tài khoản tạo
                        let listData4 = await PCM_PLAN_TASK_COLL.aggregate([
                            {
                                $match: conditionObj
                            },
                            {
                                $project: conditionProject
                            },
                            {
                                $match: conditionMatch
                            }, 
                            {
                                $group: {
                                    _id: { author: '$author', month: '$month'},
                                    amount: { $sum: 1 },
                                }
                            },
                            // { $sort: sortBy},
                        ])

                        let conditionPopulateAuthor = {
                            path: '_id.author',
                            select: '_id fullname image',
                            model: 'user'
                        }

                        await PCM_PLAN_TASK_COLL.populate(listData4, conditionPopulateAuthor)

                        return resolve({ error: false, data: {listData, listData2, listData3, listData4 } });
                    }
                }

            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Lấy số lượng task của bạn
     * Author: Depv
     */
    getAmountTask({ userID, ctx }){
        return new Promise(async resolve => {
            try {
                /**
                    { value: 0, text: 'Việc thông thường', sign: 'Tasks', key: 'task' },
                    { value: 1, text: 'Yêu cầu thông tin', sign: 'RFis', key: 'rfi' },
                    { value: 2, text: 'Yêu cầu phê duyệt', sign: 'RFa', key: 'rfa' },
                    { value: 3, text: 'Thanh toán', sign: 'CRFa', key: 'crfa' },
                    { value: 4, text: 'Lựa chọn nhà thầu', sign: 'BRFa', key: 'brfa' },
                    { value: 5, text: 'Nghiệm thu chất lượng', sign: 'QRFa', key: 'inspection' },
                    { value: 6, text: 'Yêu cầu sửa chữa', sign: 'Punch', key: 'punch' },
                    { value: 7, text: 'Yêu cầu thay đổi', sign: 'RFc', key: 'rfc' },
                    { value: 8, text: 'Yêu cầu thực hiện', sign: 'RFe', key: 'rfe' },
                    { value: 9, text: 'Báo cáo', sign: 'Report', key: 'report' },
                    { value: 10, text: 'Tiến độ', sign: 'Schedule', key: 'schedule' },
                    { value: 11, text: 'Họp', sign: 'MOM', key: 'mom' },
                 */
                /**
                 * Tổng số lượng công việc của tôi
                 */
                let amountTask = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    assignee: userID,
                    status: { $ne: 3 },
                    usersDelete: { $nin: [userID] },
                })

                /**
                 * Số lượng công việc thuộc đệ trình phê duyệt
                 */
                let amountTaskIsRFa = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    assignee: userID,
                    subtype: 2,
                    status: { $ne: 3 },
                    usersDelete: { $nin: [userID] },
                })

                /**
                 * Tổng số lượng công việc thuộc yêu cầu thông tin
                 */
                let amountTaskIsRFis = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    assignee: userID,
                    subtype: 1,
                    status: { $ne: 3 },
                    usersDelete: { $nin: [userID] },
                })

                /**
                 * Tổng số lượng công việc bạn quan tâm
                 */
                let amountTaskIsFlags = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    flags: {
                       $in: [userID]
                    },
                    usersDelete: { $nin: [userID] },
                });

                /**
                 * Tổng số lượng công việc bạn đã giao người khac
                 */
                let amountTaskIsAssignee = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    author: userID,
                    status: { $ne: 3 },
                    usersDelete: { $nin: [userID] },
                });

                /**
                 * Tổng số lượng công việc nháp
                 */
                let amountTaskIsDraft = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    $or: [
                        { author: userID },
                        { related: { $in: [userID] } },
                    ],
                    draft: 1,
                    usersDelete: { $nin: [userID] },
                });

                return resolve({ error: false, data: {
                    amountTask, amountTaskIsRFa, amountTaskIsRFis, amountTaskIsFlags, amountTaskIsAssignee, amountTaskIsDraft
                }});
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Lấy số lượng task đấu thầu
     * Author: Depv
     */
    getBadgeBidding({ userID, ctx }){
        return new Promise(async resolve => {
            try {
                /**
                 *  Đang dự thầu
                 */
                let amountBiddingInProgress = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    assignee: userID,
                    status: { $ne: 3 },
                    usersDelete: { $nin: [userID] },
                    subtype: 4,
                    level: 2
                })

                /**
                 *  Hoàn thành dự thầu
                 */
                let amountBiddingInComplete = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    assignee: userID,
                    status: 3,
                    usersDelete: { $nin: [userID] },
                    subtype: 4,
                    level: 2
                })

                /**
                 *  Đang mời thầu
                 */
                let amountBiddingInviting = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    usersDelete: { $nin: [userID] },
                    subtype: 4,
                    level: 1,
                    $or: [
                        {
                            author: userID
                        },
                        {
                            related: { $in: [userID] }
                        },
                    ]
                })

                /**
                 *  Hoàn thành mời thầu
                 */
                let amountBiddingInvitingComplete = await PCM_PLAN_TASK_COLL.count({
                    actualFinishTime: { $exists: true, $ne: null  },
                    usersDelete: { $nin: [userID] },
                    subtype: 4,
                    level: 1,
                    status: 3,
                    $or: [
                        {
                            author: userID
                        },
                        {
                            related: { $in: [userID] }
                        },
                    ]
                })

                return resolve({ error: false, data: {
                    amountBiddingInProgress,
                    amountBiddingInComplete,
                    amountBiddingInviting,
                    amountBiddingInvitingComplete
                }});
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Gửi thông báo email tới các thành viên trong task
     * Depv
     */
    sendEmailToMembersInTask({ taskID, title, notice, sender, receivers, emails, userID, ctx }) {
        // console.log({ taskID, title, notice, sender, receivers, emails, userID })
        return new Promise(async resolve => {
            try {
                let infoTask = await PCM_PLAN_TASK_COLL
                    .findById(taskID)
                    .populate('author assignee related project')
                    .lean();

                if (!infoTask)
                    return resolve({ error: true, message: 'cannot_get_info_task', status: 400 });

                /**
                 * CẤU TRÚC EMAIL
                 * Người nhận email
                 * Tiêu đề
                 * Nội dung
                 */
                let mailsUser = [];

                let listComment = await PCM_COMMENT_COLL.find({task: taskID})
                .select('content author createAt files images receivers')
                .populate({
                    path: 'author files images receivers',
                    select: 'fullname image nameOrg path createAt'
                })
                .sort({createAt:-1})
                // console.log(listComment)

                if(receivers && receivers.length) {
                    const { data: users } = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`,
                        { arrayID: JSON.stringify([...receivers, userID]), select: "_id email", isLoadAll: true }
                    );

                    if(users.length) {
                        mailsUser = users.map(item => item.email);
                    }
                }

                if(emails) {
                    emails = emails.split(',');

                    if(emails.length) {
                        mailsUser = [...mailsUser, ...emails];
                    }
                }

                if(!mailsUser.length) {
                    return resolve({
                        error: true,
                        message: 'Tham số mails không hợp lệ',
                        keyError: 'params_mails_invalid',
                        status: 400
                    });
                }

                for (const email of mailsUser) {
                    if(!stringUtils.validEmail(email.trim())) {
                        return resolve({
                            error: true,
                            message: `Mail không hợp lệ: ${email}`,
                            keyError: 'params_mail_invalid',
                            status: 400
                        });
                    }
                }
                mailsUser = mailsUser.join(',');

                // Ghi log
                await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_LOG_INSERT}`, {
                    taskID: `${taskID}`,
                    type: 2,
                    title: "Thông báo email",
                    content: `đã thông báo email tới ${mailsUser}`,
                })
                // console.log({ mailsUser, notice, infoTask })

                const result = await sendNoticeToMember({
                    email: mailsUser,
                    title,
                    content: { sender, notice, infoTask },
                    comments: listComment
                });

                return resolve(result);
            } catch (error) {
                console.error(error);
                return resolve({ error: true, message: error.message, status: 500 });
            }
        });
    }

    /**
     * Name: Lấy số lượng công việc của companyOfAssignee (gom nhóm theo user, project)
     * Author: HiepNH
     * Code: 23/9/2022
     */
    getAmountTaskOfCompanyOfAssigneeV1({ option, companyID, projectID, keyword, subtype, ctx }){
        // console.log('========CÔNG VIỆC PHÂN LOẠI THEO DỰ ÁN PHÒNG BAN==============')
        // console.log({ option, companyID, projectID, keyword, subtype })
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(companyID))
                    return resolve({ error: true, message: 'companyID_invalid' });

                let objCodition = {
                    companyOfAssignee: ObjectID(companyID),
                }

                if(subtype){
                    objCodition.subtype = +subtype;
                }

                let conditionGroup = {}, listUserOfCompany, listProjectOfCompany

                if(option == 1){
                    if(projectID && checkObjectIDs(projectID)){
                        objCodition.project = ObjectID(projectID)
                    }

                    conditionGroup = {
                        _id: "$assignee",
                        count: { $sum: 1 }
                    }

                    /**
                     * DANH SÁCH USER THỰC HIỆN CÔNG VIỆC CỦA CÔNG TY
                     */
                    let listUser = await PCM_PLAN_TASK_COLL.aggregate([
                        { $match: objCodition },
                        { $group: { _id: "$assignee" } },
                        { $sort: { _id: -1} }
                    ]);

                    let conditionObj = {}

                    if(keyword){
                        keyword = keyword.split(" ");
                        keyword = '.*' + keyword.join(".*") + '.*';
                        conditionObj.fullname = new RegExp(keyword, 'i');
                    }
                    let conditionPopulate = {
                        path: '_id',
                        select: '_id fullname bizfullname sign image position department',
                        model: 'user',
                        match: conditionObj
                    }

                    let conditionPopulate2 = {
                        path: '_id.position',
                        select: 'name sign',
                        model: 'position',
                    }

                    let conditionPopulate3 = {
                        path: '_id.department',
                        select: 'name sign modifyAt',
                        model: 'department',
                    }

                    await PCM_PLAN_TASK_COLL.populate(listUser, conditionPopulate);
                    await PCM_PLAN_TASK_COLL.populate(listUser, conditionPopulate2);
                    await PCM_PLAN_TASK_COLL.populate(listUser, conditionPopulate3);
                    listUserOfCompany = listUser.map(item => item._id).filter(Boolean);
                }

                if(option == 2){
                    conditionGroup = {
                        _id: "$project",
                        count: { $sum: 1 }
                    }

                    /**
                     * DANH SÁCH DỰ ÁN MÀ USER CÔNG TY THAM GIA THỰC HIỆN
                     */
                    let listProject = await PCM_PLAN_TASK_COLL.aggregate([
                        { $match: objCodition },
                        { $group: { _id: "$project" } },
                        { $sort: { _id: -1} }
                    ]);

                    let conditionObj = {}

                    if(keyword){
                        keyword = keyword.split(" ");
                        keyword = '.*' + keyword.join(".*") + '.*';
                        conditionObj.name = new RegExp(keyword, 'i');
                    }
                    let conditionPopulate = {
                        path: '_id',
                        select: '_id name sign image modifyAt',
                        options: { sort: { 'modifyAt': -1 } },
                        model: 'department',
                        match: conditionObj
                    }

                    await PCM_PLAN_TASK_COLL.populate(listProject, conditionPopulate);
                    listProjectOfCompany = listProject.map(item => item._id).filter(Boolean);
                }

                /**
                 * Việc quá hạn
                 */
                let start = new Date();
                start.setHours(0,0,0,0);

                let conditionSearchTask = {
                    companyOfAssignee: ObjectID(companyID)
                }

                if(subtype){
                    conditionSearchTask.subtype = +subtype;
                }

                if(projectID && checkObjectIDs(projectID)){
                    conditionSearchTask.project = ObjectID(projectID);
                }

                let listTaskOverdueWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            actualFinishTime: {
                                $lt: start,
                                $exists: true,
                                $ne: null
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: conditionGroup
                    },
                    { $sort: { _id: -1 }},
                ]);

                let listTaskNextWeekWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            actualFinishTime: {
                                $gte: start,
                                $lt: addDate(7),
                                $exists: true,
                                $ne: null
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: conditionGroup
                    },
                    { $sort: { _id: -1 }},
                ]);

                let listTaskMoreThan7Days = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            actualFinishTime: {
                                $gte: addDate(7),
                                $exists: true,
                                $ne: null
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: conditionGroup
                    },
                    { $sort: { _id: -1 }},
                ]);

                let listTaskFinish = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            status: 3
                        }
                    },
                    {
                        $group: conditionGroup
                    },
                    { $sort: { _id: -1 }},
                ]);

                return resolve({ error: false, data: {
                    listUserOfCompany, listProjectOfCompany,
                    listTaskOverdueWork, listTaskNextWeekWork,  listTaskMoreThan7Days, listTaskFinish
                    }
                })

            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Lấy số lượng công việc của companyOfAssignee trong dự án
     * Author: HiepNH
     * Date: 27/8/2023
     */
    getAmountTaskOfCompanyOfAssigneeV2({ projectID, keyword, subtype, ctx }){
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(projectID))
                    return resolve({ error: true, message: 'projectID_invalid' });

                let objectSearch = {
                    project: ObjectID(projectID), 
                    companyOfAssignee: { $exists: true }
                }

                if(subtype){
                    objectSearch.subtype = +subtype;
                }

                let listCompanyOfAssignee = await PCM_PLAN_TASK_COLL.aggregate([
                    { $match: objectSearch },
                    { $group: { _id: "$companyOfAssignee" } },
                    { $sort: { _id: -1} }
                ]);

                let conditionObjCompany = {};
                if(keyword && keyword != ""){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObjCompany.name = new RegExp(keyword, 'i');
                }

                let conditionPopulate = {
                    path: '_id',
                    select: '_id name sign image',
                    model: 'company',
                    match: conditionObjCompany
                }

                await PCM_PLAN_TASK_COLL.populate(listCompanyOfAssignee, conditionPopulate)
                let listCompany = listCompanyOfAssignee.map(item => item._id).filter(Boolean)

                let start = new Date()
                // start.setHours(0,0,0,0)

                let conditionSearchTask = {
                    project: ObjectID(projectID),
                    companyOfAssignee: { $exists: true },
                }

                if(subtype){
                    conditionSearchTask.subtype = +subtype;
                }

                let listCompanyAndTaskOverdueWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            actualFinishTime: {
                                $lt: start,
                                // $exists: true,
                                // $ne: null
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: {
                            _id: "$companyOfAssignee",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let listCompanyAndTaskNextWeekWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            actualFinishTime: {
                                $gte: start,
                                $lt: addDate(7),
                                // $exists: true,
                                // $ne: null
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: {
                            _id: "$companyOfAssignee",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let listCompanyAndTaskMoreThan7Days = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            actualFinishTime: {
                                $gte: addDate(7),
                                // $exists: true,
                                // $ne: null
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: {
                            _id: "$companyOfAssignee",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let listCompanyAndTaskFinish = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            status: 3
                        }
                    },
                    {
                        $group: {
                            _id: "$companyOfAssignee",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                return resolve({ error: false, data: {
                    listCompany,
                    listCompanyAndTaskOverdueWork, 
                    listCompanyAndTaskNextWeekWork, 
                    listCompanyAndTaskMoreThan7Days,
                    listCompanyAndTaskFinish
                    } });

            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Lấy số lượng công việc của companyOfAuthor trong dự án V2
     * Author: Depv
     * Code:
     */
    getAmountTaskOfCompanyOfAuthorV2({ projectID, keyword, subtype, userID, ctx }){
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(projectID))
                    return resolve({ error: true, message: 'projectID_invalid' });
                let objectSearch = {
                    project: ObjectID(projectID),
                    companyOfAuthor: { $exists: true },
                    parent: { $exists: false },
                }

                if(subtype){
                    objectSearch.subtype = +subtype;
                }

                let listCompanyOfAuthor = await PCM_PLAN_TASK_COLL.aggregate([
                    { $match: objectSearch },
                    { $group: { _id: "$companyOfAuthor" } },
                    { $sort: { _id: -1} }
                ]);

                let conditionObjCompany = {};
                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObjCompany.name = new RegExp(keyword, 'i');
                }
                let conditionPopulate = {
                    path: '_id',
                    select: '_id name sign image',
                    model: 'company',
                    match: conditionObjCompany
                }

                await PCM_PLAN_TASK_COLL.populate(listCompanyOfAuthor, conditionPopulate);
                let listCompany = listCompanyOfAuthor.map(item => item._id).filter(Boolean);
                let start = new Date();
                start.setHours(0,0,0,0);

                let conditionSearchTask = {
                    project: ObjectID(projectID),
                    companyOfAuthor: { $exists: true },
                    parent: { $exists: false },
                }

                if(subtype){
                    conditionSearchTask.subtype = +subtype;
                }

                let listCompanyAndTaskOverdueWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            actualFinishTime: {
                                $lt: start,
                                $exists: true,
                                $ne: null
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: {
                            _id: "$companyOfAuthor",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let listCompanyAndTaskNextWeekWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            actualFinishTime: {
                                $gte: start,
                                $lt: addDate(7),
                                $exists: true,
                                $ne: null
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: {
                            _id: "$companyOfAuthor",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let listCompanyAndTaskMoreThan7Days = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            actualFinishTime: {
                                $gte: addDate(7),
                                $exists: true,
                                $ne: null
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: {
                            _id: "$companyOfAuthor",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let listCompanyAndTaskFinish = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            ...conditionSearchTask,
                            status: 3
                        }
                    },
                    {
                        $group: {
                            _id: "$companyOfAuthor",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                return resolve({ error: false, data: {
                    listCompany,
                    listCompanyAndTaskOverdueWork, listCompanyAndTaskNextWeekWork,  listCompanyAndTaskMoreThan7Days,
                    listCompanyAndTaskFinish
                    } });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Lấy số lượng công việc theo milestone
     * Author: HiepNH
     * Code: 24/9/2023
     */
    getAmountTaskByMilestone({ projectID, ctx }){
        // console.log('=============Get list by MileStone==================')
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(projectID))
                    return resolve({ error: true, message: 'projectID_invalid' });

                let start = new Date();
                start.setHours(0,0,0,0);

                let taskOverdueWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            project: ObjectID(projectID),
                            milestone: { $gt: 0 },
                            // milestone: { $exists: true },
                            actualFinishTime: {
                                $lt: start,
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: {
                            _id: "$milestone",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let taskNextWeekWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            project: ObjectID(projectID),
                            milestone: { $gt: 0 },
                            actualFinishTime: {
                                $gte:  moment(start).startOf('day')._d,
                                $lt: moment(addDate(7)).endOf('day')._d,
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: {
                            _id: "$milestone",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let taskMoreThan7Days = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            project: ObjectID(projectID),
                            milestone: { $gt: 0 },
                            actualFinishTime: {
                                $gte: addDate(7)
                            },
                            status: { $ne: 3 }
                        }
                    },
                    {
                        $group: {
                            _id: "$milestone",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let taskFinish = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            project: ObjectID(projectID),
                            milestone: { $gt: 0 },
                            status: 3
                        }

                    },
                    {
                        $group: {
                            _id: "$milestone",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                let taskAll = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            project: ObjectID(projectID),
                            milestone: { $gt: 0 },
                        }
                    },
                    {
                        $group: {
                            _id: "$milestone",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                return resolve({ error: false, data: {
                    taskOverdueWork, taskNextWeekWork, taskMoreThan7Days, taskAll, taskFinish
                } });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Lấy số lượng công việc của tất cả project mà user là members
     * Author: Depv
     */
    getAmountTaskByProjects({ userID, fromDate, toDate, ctx }){
        return new Promise(async resolve => {
            try {
                // Call service list project
                let listProject = await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST_IS_MEMBERS}`, {
                    unLimit: true, select: "sign name", populates: JSON.stringify({
                        path: "company",
                        select: "name sign"
                    })
                });
                listProject       = listProject?.data|| [];
                let listProjectID = listProject.map(project => ObjectID(project._id));
                let conditionObj = { project: { $in: listProjectID } };
                if(fromDate && toDate){
                    conditionObj.createAt = { $gte: new Date(fromDate), $lt: moment(toDate, 'YYYY-MM-DD').endOf('day')._d }
                }
                // Số lượng công việc trong mỗi dự án
                let listAmountTask = await PCM_PLAN_TASK_COLL.aggregate([
                    { $match: conditionObj },
                    { $group: {
                        _id: "$project",
                        amount: { $sum: 1 }
                    }},
                    { $sort: { _id: -1} }
                ]);

                let start = new Date();
                // start.setHours(0,0,0,0);

                // Số lượng công việc quá hạn
                let listAmountTaskOverdueWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            project: { $in: listProjectID } ,
                            status: { $ne: 3 },
                            actualFinishTime: {
                                $lt: start,
                                // $exists: true,
                                // $ne: null
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$project",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                // Số lượng công việc Tuần tới
                let listAmountTaskNextWeekWork = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            project: { $in: listProjectID } ,
                            status: { $ne: 3 },
                            actualFinishTime: {
                                $gte: start,
                                $lt: addDate(7),
                                // $exists: true,
                                // $ne: null
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$project",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                // Số lượng công việc > 7 ngày tới
                let listAmountTaskMoreThan7Days = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            project: { $in: listProjectID } ,
                            status: { $ne: 3 },
                            actualFinishTime: {
                                $gte: addDate(7),
                                // $exists: true,
                                // $ne: null
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$project",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                // Số lượng công việc hoàn thành
                let listAmountTaskFinish = await PCM_PLAN_TASK_COLL.aggregate([
                    {
                        $match: {
                            project: { $in: listProjectID } ,
                            status: 3,
                        }
                    },
                    {
                        $group: {
                            _id: "$project",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 }},
                ]);

                return resolve({ error: false, data: { listProject, listAmountTask, listAmountTaskOverdueWork, listAmountTaskNextWeekWork, listAmountTaskMoreThan7Days, listAmountTaskFinish } });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Dev: HiepNH
     * Func: Download excel task
     * Date: 15/09/2022
     */
    downloadExcelTask({ option = 1, conditionDownload, userID, ctx }) {
        return new Promise(async resolve => {
            try {

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
                conditionDownload = JSON.parse(conditionDownload);
                const dataTaskByCondition = await this.getList({
                    ...conditionDownload,
                    select: 'name expiredTime startTime percentage author assignee description status unit quantity unitPrice amount urgent difficult factor ontime quality bugType judgement amountComment expiredTime approver timeApproved finishTime',
                    populates: JSON.stringify({
                        path: 'assignee approver bugType project',
                        select: 'bizfullname name sign'
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

                if(!option){
                    XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/pcm_13_TaskPin.xlsm')))
                    .then(async workbook => {

                        let indexExcel = 4;

                        listTaskPin.map((infoTask, index) => {
                            workbook.sheet("Data").row(indexExcel).cell(1).value(index+1);
                            workbook.sheet("Data").row(indexExcel).cell(2).value(infoTask.name);
                            workbook.sheet("Data").row(indexExcel).cell(3).value(infoTask.expiredTime);

                            workbook.sheet("Data").row(indexExcel).cell(4).value(`${infoTask.percentage}/${getPercentageCompletion(infoTask.startTime, infoTask.expiredTime)}`);

                            workbook.sheet("Data").row(indexExcel).cell(5).value(infoTask.assignee?.bizfullname);

                            if (infoTask.description) {
                                // workbook.sheet("Data").row(indexExcel).cell(8).value(removeHtmlTag(infoTask.description));
                                workbook.sheet("Data").row(indexExcel).cell(8).value(infoTask.description);
                            }

                            workbook.sheet("Data").row(indexExcel).cell(9).value(PCM_STATUS_TASK[infoTask.status - 1].text);

                            indexExcel++;
                        })

                        const now = new Date();
                        const filePath = '../../../files/temporary_uploads/';
                        const fileName = `List-task-${now.getTime()}.xlsm`;
                        const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                        await workbook.toFileAsync(pathWriteFile);

                        const result = await uploadFileS3(pathWriteFile, fileName);
                        fs.unlinkSync(pathWriteFile);

                        return resolve({ error: false, data: result?.Location, status: 200 });
                    });
                }else{
                    if(option == 1){
                        XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/pcm_human_kpi.xlsx')))
                        .then(async workbook => {

                            let indexExcel = 7;

                            listTaskPin.map((infoTask, index) => {
                                workbook.sheet("KPI").row(indexExcel).cell(1).value(index+1);
                                workbook.sheet("KPI").row(indexExcel).cell(2).value(infoTask.project?.sign);
                                workbook.sheet("KPI").row(indexExcel).cell(3).value(infoTask.name);
                                workbook.sheet("KPI").row(indexExcel).cell(4).value(infoTask.assignee?.bizfullname);
                                workbook.sheet("KPI").row(indexExcel).cell(5).value(PCM_STATUS_TASK[infoTask.status - 1].text);
                                workbook.sheet("KPI").row(indexExcel).cell(6).value(`${infoTask.percentage}/${getPercentageCompletion(infoTask.startTime, infoTask.expiredTime)}`);
                                workbook.sheet("KPI").row(indexExcel).cell(7).value(infoTask.unit);
                                workbook.sheet("KPI").row(indexExcel).cell(8).value(Number(infoTask.quantity || 0));
                                workbook.sheet("KPI").row(indexExcel).cell(9).value(Number(infoTask.unitPrice || 0));
                                workbook.sheet("KPI").row(indexExcel).cell(10).value(Number(infoTask.amount || 0));
                                if (infoTask.description) {
                                    // workbook.sheet("Data").row(indexExcel).cell(11).value(removeHtmlTag(infoTask.note));
                                    workbook.sheet("KPI").row(indexExcel).cell(11).value(infoTask.description);
                                }
                                workbook.sheet("KPI").row(indexExcel).cell(12).value(Number(infoTask.urgent));
                                workbook.sheet("KPI").row(indexExcel).cell(13).value(Number(infoTask.difficult));
                                workbook.sheet("KPI").row(indexExcel).cell(14).value(Number(infoTask.factor));
                                workbook.sheet("KPI").row(indexExcel).cell(15).value(Number(infoTask.ontime));
                                workbook.sheet("KPI").row(indexExcel).cell(16).value(Number(infoTask.quality));
                                workbook.sheet("KPI").row(indexExcel).cell(17).value(infoTask.bugType?.name);
                                workbook.sheet("KPI").row(indexExcel).cell(18).value(infoTask.judgement);
                                workbook.sheet("KPI").row(indexExcel).cell(19).value(Number(infoTask.amountComment));
                                workbook.sheet("KPI").row(indexExcel).cell(20).value(infoTask.expiredTime);
                                workbook.sheet("KPI").row(indexExcel).cell(21).value(infoTask.approver?.bizfullname);
                                workbook.sheet("KPI").row(indexExcel).cell(22).value(infoTask.timeApproved);

                                indexExcel++;
                            })

                            const now = new Date();
                            const filePath = '../../../files/temporary_uploads/';
                            const fileName = `task_report_${now.getTime()}.xlsx`;
                            const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                            await workbook.toFileAsync(pathWriteFile);

                            const result = await uploadFileS3(pathWriteFile, fileName);
                            fs.unlinkSync(pathWriteFile);

                            return resolve({ error: false, data: result?.Location, status: 200 });
                        });
                    }
                }
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Dev: HiepNH
     * Func: Download template import excel
     * Date: 15/09/2022
     */
    downloadTemplateImportExcel({ option, projectID, taskID,  userID }) {
        // console.log({ option, projectID, taskID, userID })
        return new Promise(async resolve => {
            try {
                // Mẫu Import excel
                if(option == 1){
                    let infoProject = await DEPARTMENT_COLL.findById(projectID).populate({ path: "members", select: "fullname name" });
                    if(infoProject.error)
                        return res.json(infoProject);
    
                    let memberInProject     = infoProject.members;
                    let planGroupInProject  = await PCM_PLAN_GROUP_COLL.find({ project: projectID, members: {$in: [userID]} }).select("name sign");
                    let listContracts = await CONTRACT_COLL.find({ company: infoProject.company }).select('_id name sign').sort({_id: 1})
    
                    // Modify the workbook.
                    XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/pcm_2_ImportTask.xlsm')))
                    .then(async workbook => {
                        var i = 2;
                        planGroupInProject?.forEach((item, index) => {
                            workbook.sheet("Export").row(i).cell(1).value(`${item._id}`);
                            workbook.sheet("Export").row(i).cell(2).value(`${item.sign}-${item.name}`);
                            i++
                        });
    
                        var i = 2;
                        memberInProject.forEach((item, index) => {
                            workbook.sheet("Export").row(i).cell(4).value(`${item._id}`);
                            workbook.sheet("Export").row(i).cell(5).value(item.fullname);
                            i++
                        });
    
                        var i = 2;
                        listContracts.forEach((item, index) => {
                            workbook.sheet("Export").row(i).cell(7).value(`${item._id}`);
                            workbook.sheet("Export").row(i).cell(8).value(`${item.sign}-${item.name}`);
                            i++
                        });
    
                        const now = new Date();
                        const filePath = '../../../files/temporary_uploads/';
                        const fileName = `Template_import_task_${now.getTime()}.xlsm`;
                        const pathWriteFile = path.resolve(__dirname, filePath, fileName);
    
                        await workbook.toFileAsync(pathWriteFile);
                        const result = await uploadFileS3(pathWriteFile, fileName);
    
                        fs.unlinkSync(pathWriteFile);
                        return resolve({ error: false, data: result?.Location, status: 200 });
                    })
                }

                // Báo cáo hóa đơn
                else if(option == 2){
                    let listData = await PCM_PLAN_TASK_COLL.find({ project: projectID, subtype: 12 })
                    .select('actualFinishTime name sign taxid amount vatAmount description status contact author parent createAt')
                    .populate({
                        path: 'contact author parent',
                        select: 'name taxid phone fullname',
                    })
                    .sort({actualFinishTime: 1})
                    // console.log(listData)

                    // Modify the workbook.
                    XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/pcm_invoice_report.xlsx')))
                    .then(async workbook => {
                        var i = 3;
                        listData?.forEach((item, index) => {
                            workbook.sheet("BangKeMuaVao").row(i).cell(1).value(Number(index + 1))
                            workbook.sheet("BangKeMuaVao").row(i).cell(2).value(item?.sign)
                            workbook.sheet("BangKeMuaVao").row(i).cell(3).value(item?.actualFinishTime)
                            workbook.sheet("BangKeMuaVao").row(i).cell(4).value(item?.contact?.name)
                            workbook.sheet("BangKeMuaVao").row(i).cell(5).value(item?.contact?.taxid)
                            workbook.sheet("BangKeMuaVao").row(i).cell(6).value(item?.name)
                            workbook.sheet("BangKeMuaVao").row(i).cell(7).value(Number(item?.amount))
                            workbook.sheet("BangKeMuaVao").row(i).cell(8).value(Number(item?.vatAmount))
                            workbook.sheet("BangKeMuaVao").row(i).cell(9).value(Number(item?.amount + item?.vatAmount))
                            workbook.sheet("BangKeMuaVao").row(i).cell(10).value(item?.description)
                            workbook.sheet("BangKeMuaVao").row(i).cell(11).value(item?.status)
                            workbook.sheet("BangKeMuaVao").row(i).cell(12).value('Truy cập').hyperlink(`https://app.trixgo.com//pcm/detail/${item._id}`)
                            workbook.sheet("BangKeMuaVao").row(i).cell(14).value(item?.parent?.name)
                            workbook.sheet("BangKeMuaVao").row(i).cell(15).value(item?.author?.fullname)
                            workbook.sheet("BangKeMuaVao").row(i).cell(16).value(moment(item?.createAt).format('DD/MM/YYYY HH:mm'))
                            workbook.sheet("BangKeMuaVao").row(i).cell(17).value(`${item._id}`)

                            i++
                        })

                        const now = new Date();
                        const filePath = '../../../files/temporary_uploads/';
                        const fileName = `invoice_report${now.getTime()}.xlsx`;
                        const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                        await workbook.toFileAsync(pathWriteFile);
                        const result = await uploadFileS3(pathWriteFile, fileName);

                        fs.unlinkSync(pathWriteFile);
                        return resolve({ error: false, data: result?.Location, status: 200 })
                    })
                }

                // Báo cáo điểm danh
                else if(option == 3){
                    let listData = await PCM_COMMENT_COLL.find({ project: projectID, subType: 16 })
                    .select('content author createAt')
                    .populate({
                        path: 'author',
                        select: 'fullname',
                    })
                    .sort({createAt: 1})
                    // console.log(listData)

                    // Modify the workbook.
                    XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/pcm_attendance_report.xlsx')))
                    .then(async workbook => {
                        var i = 3;
                        
                        listData?.forEach((item, index) => {
                            let year = new Date(item.createAt).getFullYear()
                            let month = new Date(item.createAt).getMonth() + 1
                            let day = new Date(item.createAt).getDate()

                            let time1 = new Date(`${year}-${month}-${day} 08:00:00`);
                            let time2 = new Date(`${year}-${month}-${day} 13:00:00`);
                            let time3 = new Date(`${year}-${month}-${day} 18:00:00`);

                            let a = (new Date(item?.createAt)).getTime()
                            let b1 = (new Date(time1)).getTime()
                            let b2 = (new Date(time2)).getTime()
                            let b3 = (new Date(time3)).getTime()
                            
                            let d = new Date(item.createAt);

                            workbook.sheet("Data").row(i).cell(1).value(Number(index + 1))
                            workbook.sheet("Data").row(i).cell(2).value(item?.author?.fullname)
                            workbook.sheet("Data").row(i).cell(3).value(item?.content)
                            workbook.sheet("Data").row(i).cell(4).value(item?.createAt)
                            workbook.sheet("Data").row(i).cell(5).value(time1)
                            workbook.sheet("Data").row(i).cell(6).value(time2)
                            workbook.sheet("Data").row(i).cell(7).value(time3)
                            if(Number(d.getHours()) > 18){
                                workbook.sheet("Data").row(i).cell(10).value(Number((a - b3) / (1000*60))) 
                            }else{
                                if(Number(d.getHours()) > 13){
                                    workbook.sheet("Data").row(i).cell(9).value(Number((a - b2) / (1000*60)))
                                }else{
                                    if(Number(d.getHours()) > 8){
                                        workbook.sheet("Data").row(i).cell(8).value(Number((a - b1) / (1000*60)))
                                    }
                                }
                            }
                            // workbook.sheet("Data").row(i).cell(12).value('Truy cập').hyperlink(`https://app.trixgo.com//pcm/detail/${taskID}`)

                            i++
                        })

                        const now = new Date();
                        const filePath = '../../../files/temporary_uploads/';
                        const fileName = `pcm_attendance_report${now.getTime()}.xlsx`;
                        const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                        await workbook.toFileAsync(pathWriteFile);
                        const result = await uploadFileS3(pathWriteFile, fileName);

                        fs.unlinkSync(pathWriteFile);
                        return resolve({ error: false, data: result?.Location, status: 200 })
                    })
                }
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 })
            }
        })
    }

    /**
     * Dev: HiepNH
     * Func: Tạo task từ dữ liệu excel
     * Date: 15/09/2022
     */
    importTaskFromExcel({ taskID, dataImport, userID, ctx }) {
        // console.log({taskID, dataImport, userID})
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs(taskID))
                    return resolve({ error: true, message: 'taskID_invalid', status: 400 })

                const dataImportJSON = JSON.parse(dataImport);
                let index = 0;
                let errorNumber = 0;
                let parentID;

                /**
                 * XÁC THỰC DỮ LIỆU
                 */
                let indexCheck = 0
                let errorValidate = 0;
                let inforTask = await PCM_PLAN_TASK_COLL.findById(taskID)
                .select('name project')

                for (const data of dataImportJSON) {
                    if(indexCheck > 0){
                        let infoGroup = await PCM_PLAN_GROUP_COLL.findById(ObjectID(data?.__EMPTY_12)).select('name project')
                        if(infoGroup.project.toString() !== inforTask.project.toString()){
                            errorValidate ++
                        }
                    }
                    indexCheck ++;
                }
                if(errorValidate != 0)
                    return resolve({ error: true, message: "Nhóm dữ liệu không hợp lệ" })

                /**
                 * IMPORT DỮ LIỆU
                 */
                for (const data of dataImportJSON) {
                    if(index > 0){
                        let dataInsert = {
                            name: data?.__EMPTY_1,
                            groupID: data?.__EMPTY_12,
                            authorID: userID,
                            sign: data?.__EMPTY_8,
                            type: data?.__EMPTY_9,
                            description: data?.__EMPTY_10,
                            startTime:  data?.__EMPTY_14,
                            expiredTime:  data?.__EMPTY_15,
                            assigneeID: data?.__EMPTY_13,
                            draft: data?.__EMPTY_17,
                            contractID: data?.__EMPTY_16,
                            subType: data?.__EMPTY_9,
                            ctx,
                        }
                        // console.log(dataInsert)

                        // Thêm người liên quan
                        let listEmailRelates = data?.__EMPTY_5?.split(",");
                        let related = await USER_COLL.find({ email: { $in: listEmailRelates?.map(email => email.trim()) }}).select("_id")
                        if(related && related.length){
                            dataInsert.relatedIDs = related.map(item => ObjectID(item._id));
                        }

                        if(checkObjectIDs(taskID)){
                            dataInsert.parentID = taskID;
                        }

                        // Kiểm tra nếu có việc con
                        if(data.__EMPTY_2 && parentID){
                            dataInsert.parentID = parentID;
                            dataInsert.name = data.__EMPTY_2;
                        }
                        // console.log(dataInsert)

                        let infoGroup = await PCM_PLAN_GROUP_COLL.findById(data.__EMPTY_12).select("project");
                        if(!infoGroup){
                            errorNumber++;
                            return resolve({ error: true, message: "Nhóm dữ liệu không hợp lệ" });
                        }
                        // console.log({errorNumber})

                        dataInsert.projectID = `${infoGroup.project}`;
                        let infoAfterInsert = await this.insert(dataInsert);
                        // console.log(infoAfterInsert)
                        
                        // Công việc cha
                        if(data?.__EMPTY_1){
                            parentID = infoAfterInsert?.data?._id;
                        }
                        
                        if(infoAfterInsert.error){
                            errorNumber++;
                        }

                    }
                    index ++;
                }

                if(errorNumber != 0)
                    return resolve({ error: true, message: "import field" });

                // Update timeImportExcel trick reload việc con
                await PCM_PLAN_TASK_COLL.findByIdAndUpdate(taskID, { $set: { timeImportExcel: new Date() }}, { new: true });

                return resolve({ error: false, message: "import success" });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    repairData({ option, email, password, userID, bizfullname, companyID, page, fromDate, toDate, ctx }) {
        // console.log({ option, email, password, userID, bizfullname, companyID, page, fromDate, toDate })
        return new Promise(async (resolve) => {
            try {
                if(password.toString() != `noPass12345${email}`)
                    return resolve({ error: true, message: 'Mật hiệu không chính xác', status: 403 })
                

                /**
                 * CẬP NHẬT COMMENT TYPE = 5 CHO CÁC TASKS NẾU CHƯA CÓ
                 * Xử lý dữ liệu theo từng khoảng thời gian
                 */
                if(option == 1){
                    let listDataAgg = await PCM_COMMENT_COLL.aggregate([
                        {
                            $match: {
                                // createAt: {
                                //     $gte: new Date(fromDate),
                                //     $lte: new Date(toDate),
                                // },
                                type: 5,
                                task: {$exists: true, $ne: null},
                            }
                        },
                        {
                            $group: {
                                _id: { task: "$task" }
                            }
                        }
                    ])
                    // console.log(listDataAgg)

                    let listTasks = await PCM_PLAN_TASK_COLL.find({ 
                        _id: {$nin: listDataAgg.map(item => item._id.task)},
                        createAt: {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate),
                        }
                    }).select('_id name namecv authorAttachs')
                    // console.log(listTasks.length)

                    for(const item of listTasks){

                        let infoComment = await ctx.call(`${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_COMMENT_INSERT}`, {
                            taskID: item?._id.toString(),
                            type: 5,
                            files: (item.authorAttachs && item.authorAttachs.length) ? item.authorAttachs.map(file => file.toString()) : [],/** QUAN TRỌNG LÀ PHẢI CONVERT TO STRING */
                            content: item.name,
                            rawContent: item?.namecv,
                        }, {
                            meta: {
                                infoUser: { _id: userID.toString(), bizfullname, company: companyID.toString() } /** QUAN TRỌNG LÀ PHẢI CONVERT TO STRING */
                            }
                        })
                        // console.log(infoComment)
                    }

                    return resolve({ error: false, message: 'Repair Data thành công', data: listTasks });
                }

                if(option == 2){
                    // Danh sách các chủ đề
                    let listTasks = await PCM_PLAN_TASK_COLL.find({ 
                        createAt: {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate),
                        }
                    }).select('_id name namecv authorAttachs author assignee related')
                    console.log(listTasks.length)

                    /**
                     * ĐỐI VỚI TASK
                     * 1. accessUsers[]
                     * 2. nameCV
                     */
                    // 1. Cập nhật namecv
                    for(const item of listTasks){
                        let convertStr = '';
                        if(item.name && item.name != ""){
                            convertStr = stringUtils.removeAccents(item.name)
                        }
                        if(item.sign && item.sign != ""){
                            convertStr = convertStr + " " + stringUtils.removeAccents(item.sign)
                        }

                        let accessUsers = [];

                        if(item?.author && item?.assignee && item?.author.toString() != item?.assignee.toString()){
                            accessUsers = [item.author, item.assignee]
                        }else{
                            accessUsers = [item?.author]
                        }
                        if(item.related && item.related.length){
                            accessUsers.push(...item?.related)
                        }

                        await PCM_PLAN_TASK_COLL.findByIdAndUpdate(item._id, 
                            { 
                                namecv: convertStr,
                                accessUsers: accessUsers,
                            }, 
                            { new: true })
                    }

                     /**
                     * ĐỐI VỚI COMMENT => UPDATE VỚI TYPE = 5 CHO
                     * 1. accessUsers[]
                     * 2. nameCV
                     */

                     /**
                     * ĐỐI VỚI PCM_FILE CỦA COMMENT TYPE = 5 -> UPDATE taskID
                     * 1. accessUsers[]
                     * 2. nameCV
                     */

                    return resolve({ error: false, message: 'Repair Data thành công' });
                }


            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model;