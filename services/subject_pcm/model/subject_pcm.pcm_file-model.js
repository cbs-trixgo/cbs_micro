"use strict";;
/**
 * External
 */
const ObjectID                          = require('mongoose').Types.ObjectId;
const moment                            = require('moment');
const uuidv4                            = require('uuid').v4;
const fs                                = require('fs');

const { S3 } = require('@aws-sdk/client-s3');

const s3                                = require('@auth0/s3');
const compressing                       = require('compressing');
const rimraf                            = require('rimraf');
const path                              = require('path');
const PromisePool                       = require('@supercharge/promise-pool');
const archiver                          = require('archiver');
const stream                            = require('stream')

/**
 * Tools
 */
const BaseModel                         = require('../../../tools/db/base_model');
const { KEY_ERROR, APP_KEYS }           = require('../../../tools/keys');
const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');
const { config } 	                    = require('../../../tools/s3/config');
const {
    nonAccentVietnamese,
    replaceSpaceWithChar
} = require('../../../tools/utils/string_utils');
const {
    checkObjectIDs,
    IsJsonString,
    validateParamsObjectID,
} = require('../../../tools/utils/utils');
const {
    downloadFileS3,
    uploadFileS3,
    uploadFileS3V2,
    downloadFileS3V2,
    zipFileToS3,
    copyFileS3,
} = require('../../../tools/s3');

const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_ITEM } 		        = require('../../item/helper/item.actions-constant');

/**
 * import inter-coll, exter-coll
 */
const PCM_FILE__COLL                    = require('../database/subject_pcm.pcm_file-coll');
const PCM_PLAN_TASK__COLL               = require('../database/subject_pcm.pcm_plan_task-coll');
const PCM_PLAN_GROUP__COLL              = require('../database/subject_pcm.pcm_plan_group-coll');
const ITEM__CONTRACT_COLL            	= require('../../item/database/item.contract-coll');

class Model extends BaseModel {

    constructor() {
        super(PCM_FILE__COLL);

        this.s3Object = new S3({
            region: config.aws_region,
        });

        this.s3Client = s3.createClient({
            maxAsyncS3: 20,     // this is the default
            s3RetryCount: 3,    // this is the default
            s3RetryDelay: 1000, // this is the default
            multipartUploadThreshold: 20971520, // this is the default (20 MB)
            multipartUploadSize: 15728640, // this is the default (15 MB)
            s3Options: {
                accessKeyId: config.aws_access_key_id,
                secretAccessKey: config.aws_secret_access_key,
                region: config.aws_region,
            },
        });
    }

    /**
	 * Dev: MinhVH
	 * Name: Thêm pcm file
	 * Date: ...
	 */
    insert({
        companyID, projectID, groupID, contractID, taskID, commentID, fileID,
        type, nameOrg, name, description, path, size, mimeType, authorID, companyOfAuthor
    }) {
        // console.log('=============INSERT PCM FILE ===============')
        // console.log({
        //     companyID, projectID, groupID, contractID, taskID, commentID, fileID,
        //     type, nameOrg, name, description, path, size, mimeType, authorID, companyOfAuthor
        // })
        return new Promise(async (resolve) => {
            try {
                let dataInsert = {
                    nameOrg,
                    name,
                    path,
                    size,
                    type,
                    mimeType,
                    author: authorID,
                    companyOfAuthor
                };

                if(!nameOrg || !name || !path || !mimeType) {
                    return resolve({
                        error: true,
                        message: 'Tham số không hợp lệ',
                        keyError: 'params_invalid',
                        status: 400
                    });
                }

                if(checkObjectIDs(companyID)){
                    dataInsert.company = companyID;
                }

                if(checkObjectIDs(projectID)){
                    dataInsert.project = projectID;
                }

                if(checkObjectIDs(groupID)){
                    dataInsert.group = groupID;
                }

                if(checkObjectIDs(contractID)){
                    dataInsert.contract = contractID;
                }

                if(checkObjectIDs(taskID)){
                    dataInsert.task = taskID;
                }

                if(checkObjectIDs(commentID)){
                    dataInsert.comment = commentID;
                }

                if(checkObjectIDs(fileID)){
                    dataInsert.file = fileID;
                }

                if(description){
                    dataInsert.description = description;
                }
                // console.log(dataInsert)

                let infoDataAfterInserted = await this.insertData(dataInsert);
                if(!infoDataAfterInserted)
                    return resolve({ error: true, keyError: KEY_ERROR.INSERT_FAILED, status: 422 });

                return resolve({ error: false, data: infoDataAfterInserted, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
	 * Name: Danh sách file
     * Dev: MinhVH
     * Update: HiepNH
	 * Date: 21/8/2022
	 */
    getList({
        companyID, projectID, groupID, taskID, authorID, keyword, type, fromDate, toDate,
        limit = 20, lastestID, select, populates, isFileOfProject, isSearchFile, userID, ctx
    }) {
        // console.log({
        //     companyID, projectID, groupID, taskID, authorID, keyword, type, fromDate, toDate,
        //     limit, lastestID, select, populates, isFileOfProject, isSearchFile, userID, ctx
        // })
        return new Promise(async (resolve) => {
            try {
                /**
                 * Kiểm tra bắt buộc phải có companyID hoặc projectID hoặc groupID hoặc taskID, Nếu không thuộc trường hợp:
                 * - Tìm kiếm file (VIAS)
                 * - Lấy danh sách file của tất cả dự án mà user là member
                 */
                if(!isFileOfProject && !isSearchFile) {
                    if(!companyID && !projectID && !groupID && !taskID) {
                        return resolve({
                            error: true,
                            message: "Tham số companyID || projectID || groupID || taskID là cần thiết",
                            keyError: "params_invalid",
                            status: 400
                        });
                    }
                }

                if(limit > 20){
                    limit = 20;
                } else{
                    limit = +limit;
                }

                let sortBy;

                let conditionObj = {}
                let conditionObjTask = {} // Tìm kiếm task
                let conditionObjGroup = {} // Tìm kiếm group

                let keys	     = ['createAt__-1', '_id__-1'];

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
                 * KIỂM TRA ĐIỀU KIỆN
                 * Về nguyên tắc các taskID/groupID/projectID/companyID chỉ được lấy hoặc, không thể diễn ra đồng thời
                 */
                if(taskID && checkObjectIDs(taskID)){
                    conditionObj.task = ObjectID(taskID)
                }else{
                    if(groupID && checkObjectIDs(groupID)){
                        conditionObj.group = ObjectID(groupID)
                    }else{
                        if(projectID && checkObjectIDs(projectID)){
                            conditionObj.project = ObjectID(projectID)
                        }else{
                            if(companyID && checkObjectIDs(companyID)){
                                conditionObj.company = ObjectID(companyID)
                            }
                        }
                    }
                }

                // Lấy file theo người tạo
                if(checkObjectIDs(authorID)) {
                    conditionObj.author = ObjectID(authorID)
                }

                // Phân loại file
                if(type){
                    conditionObj.type = type;
                }

                if(fromDate && toDate) {
                    conditionObj.createAt = {
                        $gte: moment(fromDate).startOf('days').toDate(),
                        $lte: moment(toDate).endOf('days').toDate()
                    }
                }
                // console.log(conditionObj)

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj = {
                        ...conditionObj,
                        $or: [
                            { nameOrg  :  new RegExp(keyword, 'i') },
                            { description  :  new RegExp(keyword, 'i') },
                        ]
                    }
                    // conditionObj.nameOrg = new RegExp(keyword, 'i');
                }

                /**
                 * Lấy danh sách file của dự án mà user là Members
                 * Phục vụ lấy file từ ngoài trang chủ, từ TẤT CẢ các dự án
                 */
                if(isFileOfProject) {
                    const { error, data } = await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST_IS_MEMBERS}`, {
                        unLimit: true,
                        select: '_id'
                    });

                    if(!error) {
                        const projectsID = data?.map(item => item._id) ?? [];

                        if(projectsID.length) {
                            conditionObj.project = {
                                $in: projectsID
                            }
                        }
                    }
                }

                // Tìm kiếm file
                if(isSearchFile) {
                    // console.log('isSearchFile============>>>>>>>>>>>>>>>>>>>>>')

                    /**
                     * Danh sách các Group mà user là members hoặc amdins
                     */
                    // Nếu chọn dự án
                    if(projectID && checkObjectIDs(projectID)){

                        // Điều kiện tìm kiếm task
                        conditionObjTask.project = ObjectID(projectID)

                        // Điều kiện tìm kiếm Group
                        conditionObjGroup.project = ObjectID(projectID)
                        conditionObjGroup.$or = [
                            { admins: { $in: [userID] } },
                            { members: { $in: [userID] } },
                        ]
                    }

                    // Nếu không chọn dự án
                    else{
                        conditionObjGroup.$or = [
                            { admins: { $in: [userID] } },
                            { members: { $in: [userID] } },
                        ]
                    }
                    // console.log('conditionObjGroup===========>>>>>>>>>>>>>>>>>>>>>')
                    // console.log(conditionObjGroup)

                    const listGroupUserIsMember = await PCM_PLAN_GROUP__COLL
                        .find(conditionObjGroup)
                        .select('_id')
                        .lean();

                    // console.log('List Group===========>>>>>>>>>>>>>>>>>>>>>')
                    // console.log(listGroupUserIsMember)

                    const groupsID = listGroupUserIsMember.map(item => item._id)

                    conditionObjTask.$or = [
                        { author: userID },
                        { assignee: userID },
                        { related: { $in: [userID] } },
                        { group: { $in: groupsID } }
                    ]

                    // console.log('conditionObjTask===========>>>>>>>>>>>>>>>>>>>>>')
                    // console.log(conditionObjTask)

                    // Danh sách các Task mà user có quyền truy cập
                    const listTaskUserIsMember = await PCM_PLAN_TASK__COLL
                        .find(conditionObjTask)
                        .select('_id project')
                        .lean()
                    // console.log(listTaskUserIsMember.length)

                    const projectsID    = [];
                    const tasksID       = [];

                    listTaskUserIsMember.map(task => {
                        // projectsID[projectsID.length] = task.project;
                        tasksID[tasksID.length] = task._id;
                    })

                    conditionObj.task = { $in: tasksID }
                }

                // console.log('Final==============>conditionObj')
                // console.log(conditionObj)

                let conditionObjOrg = { ...conditionObj };

				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await PCM_FILE__COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastest", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj = dataPagingAndSort.data.find;
					sortBy       = dataPagingAndSort.data.sort;
				} else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy       = dataPagingAndSort.data.sort;
                }

                let infoDataAfterGet = await PCM_FILE__COLL
                    .find(conditionObj)
                    .select(select)
                    .limit(limit+1)
                    .sort(sortBy)
                    .populate(populates)
                    .lean();

                if(!infoDataAfterGet) {
                    return resolve({
                        error: true,
                        message: 'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurred',
                        status: 422
                    });
                }

                let nextCursor	= null;

                if(infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await PCM_FILE__COLL.count(conditionObjOrg);
                let totalPage   = Math.ceil(totalRecord/limit);

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    },
                    status: 200
                });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
	 * Name: Tìm kiếm file
     * Dev: HiepNH
	 * Date: 24/8/2022
	 */
    getListByFilter({
        companyOfAuthorsID, authorsID, projectsID, fromDate, toDate, keyword,
        limit = 20, lastestID, select, populates, userID
    }) {
        // console.log('=================>>>>>>>>>>>>>>Tìm kiếm dữ liệu File================')
        // console.log({
        //     companyOfAuthorsID, authorsID, projectsID, fromDate, toDate, keyword,
        //     limit, lastestID, select, populates, userID
        // })
        return new Promise(async (resolve) => {
            try {
                /**
                 * VALIDATION (1)
                 */
                const validation = validateParamsObjectID({
                    companyOfAuthorsID : { value: companyOfAuthorsID, isRequire: false },
                    authorsID           : { value: authorsID, isRequire: false },
                    projectsID          : { value: projectsID, isRequire: false },

                });
                if(validation.error) return resolve(validation);

                if(limit > 20){
                    limit = 20;
                } else{
                    limit = +limit;
                }

                let sortBy;

                let conditionObj = {}
                let conditionObjTask = {} // Tìm kiếm task
                let conditionObjGroup = {} // Tìm kiếm group

                let keys	     = ['createAt__-1', '_id__-1'];

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

                //__________Danh sách các nhóm dữ liệu mà userID là members
                let listGroups = await PCM_PLAN_GROUP__COLL.find({ members: { $in: [userID]} })

                // Danh sách Task mà user được quyền truy cập
                conditionObjTask.$or = [
                    { accessUsers: {$in: [userID]}},
                    { group: { $in: listGroups.map(item => item._id) }}, // Bỏ, vì việc tra cứu theo thẻ lọc mới cần đến. Còn lại đi theo đường thư mục
                ]

                const listTask = await PCM_PLAN_TASK__COLL
                    .find(conditionObjTask)
                    .select('_id project')
                    .lean()
                // console.log(listTask.length)

                // Lấy các File thuộc Task mà user được quyền truy cập
                conditionObj.task = { $in:  listTask.map(item => item._id) }

                /**
                 * Lọc theo các điều kiện
                 */
                companyOfAuthorsID && companyOfAuthorsID.length     && (conditionObj.companyOfAuthor = { $in: companyOfAuthorsID });
                authorsID && authorsID.length                       && (conditionObj.author = { $in: authorsID });
                projectsID && projectsID.length                     && (conditionObj.project = { $in: projectsID });

                if(fromDate && toDate) {
                    conditionObj.createAt = {
                        $gte: moment(fromDate).startOf('days').toDate(),
                        $lte: moment(toDate).endOf('days').toDate()
                    }
                }

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionObj.$or = [
                        { nameOrg  :  new RegExp(keyword, 'i') },
                        { description  :  new RegExp(keyword, 'i') },
                    ]
                }
                // console.log(conditionObj)

                let conditionObjOrg = { ...conditionObj };

				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await PCM_FILE__COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastest", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj = dataPagingAndSort.data.find;
					sortBy       = dataPagingAndSort.data.sort;
				} else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy       = dataPagingAndSort.data.sort;
                }

                let infoDataAfterGet = await PCM_FILE__COLL
                    .find(conditionObj)
                    .select(select)
                    .limit(limit+1)
                    .sort(sortBy)
                    .populate(populates)
                    .lean();

                if(!infoDataAfterGet) {
                    return resolve({
                        error: true,
                        message: 'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurred',
                        status: 422
                    });
                }

                let nextCursor	= null;

                if(infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await PCM_FILE__COLL.count(conditionObjOrg);
                let totalPage   = Math.ceil(totalRecord/limit);

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    },
                    status: 200
                });

            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
	 * Dev: MinhVH
	 * Name: Lấy danh sách file, group theo tháng năm
	 * Date: 12/08/2021
	 */
	getListFilesGroupByDate({ companyID, projectID, userID, year, ctx }){
        // console.log({ companyID, projectID, userID })
		return new Promise(async resolve => {
			try {
				let conditionObj = { type: 1 }; // Hình ảnh (type = 1)
                let conditionMatch = {}

				if(projectID){
                    if(!checkObjectIDs([projectID])) {
                        return resolve({
                            error: true,
                            message: "Tham số projectID không hợp lệ",
                            keyError: "params_projectID_invalid",
                            status: 400
                        });
                    }

                    let infoProject = await ctx.call(`${CF_DOMAIN_SERVICES.ITEM}.${CF_ACTIONS_ITEM.DEPARTMENT_GET_LIST}`, {
                        departmentID: projectID,
                        companyID,
                        select: 'startTime'
                    })

                    if(infoProject.error) return resolve(infoProject);

					conditionObj.project = ObjectID(projectID);
                    conditionObj.createAt = {
						$gte: new Date(moment(infoProject.data?.startTime || Date.now()).startOf('day').format()),
					};
				}

                if(year){
                    conditionMatch.year = Number(year)
                }

				const groupObj = {
					_id: { $dateToString: { format: "%Y-%m", date: "$createAt" } },
					dataFormat: {
						$first: {
							$dateToString: { format: "%m/%Y", date: "$createAt" }
						}
					},
                    count: { $sum: 1 }
				}

                const pipeline = [
                    {
                        $match: conditionObj
                    },
                    {
                        $project: {
                            year : {$year : "$createAt"},
                            type : 1,
                            project : 1,
                            createAt : 1,
                        }
                    },
                    {
                        $match: conditionMatch
                    },
                    {
                        $group: groupObj
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]
                // console.log(pipeline)

                const dataFilesGroupByDate = await PCM_FILE__COLL.aggregate(pipeline)
                // console.log(dataFilesGroupByDate)

                if(!dataFilesGroupByDate) {
                    return resolve({
                        error: true,
                        message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục",
                        keyError: "error_occurred",
                        status: 422
                    });
                }

				return resolve({
					error: false,
					data: {
						listRecords: dataFilesGroupByDate,
					},
					status: 200,
				})
			} catch (error) {
                console.error(error);
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

    /**
	 * Dev: MinhVH
	 * Name: Lấy danh sách file, group theo hợp đồng
	 * Date: 12/08/2021
	 */
	getListFilesGroupByContract({ keyword, projectID, year, userID }){
        // console.log('==============getListFilesGroupByContract=================')
        // console.log({ keyword, projectID, userID })
		return new Promise(async resolve => {
			try {
                let listContract = await ITEM__CONTRACT_COLL.find({members: {$in: [userID]}}).select('_id')

                // Hình ảnh (type = 1)
				let conditionObj = {
                    type: 1,
                    project: ObjectID(projectID),
                    // contract: { $exists: true, $ne: null },
                    contract: { $in: listContract.map(item=>ObjectID(item._id)) }
                }

                let conditionKeyword = {}, conditionMatch = {}

                if(year){
                    conditionMatch.year = Number(year)
                }

				const groupObj = {
					_id: "$contract",
                    contract: { $first: '$contract' },
                    count: { $sum: 1 }
				}

                const pipeline = [
                    {
                        $match: conditionObj
                    },
                    {
                        $project: {
                            year : {$year : "$createAt"},
                            type : 1,
                            project : 1,
                            contract : 1,
                            createAt : 1,
                        }
                    },
                    {
                        $match: conditionMatch
                    },
                    {
                        $group: groupObj
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]
                // console.log(pipeline)

                const dataFilesGroupByContract = await PCM_FILE__COLL.aggregate(pipeline)
                // console.log(dataFilesGroupByContract)

                if(!dataFilesGroupByContract) {
                    return resolve({
                        error: true,
                        message: "Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục",
                        keyError: "error_occurred",
                        status: 422
                    });
                }

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    conditionKeyword['contract.name'] = new RegExp(keyword, 'i');
                }

                await PCM_FILE__COLL.populate(dataFilesGroupByContract, {
                    path: "contract",
                    select: "_id name photos",
                    // match: conditionKeyword,
                    populate: {
                        path: "photos",
                        select: "nameOrg path description"
                    }
                })
                // console.log(dataFilesGroupByContract)

				return resolve({
					error: false,
					data: {
						listRecords: dataFilesGroupByContract,
					},
					status: 200,
				})
			} catch (error) {
				return resolve({ error: true, message: error.message, status: 500 });
			}
		})
	}

    /**
     * @deprecated Use downloadFilesV2 instead
     * Dev: MinhVH
     * Name: Download files
     * Date: 21/12/2022
     */
    downloadFiles({ taskID }){
		return new Promise(async resolve => {
            try {
                const filesTask = await PCM_FILE__COLL
                    .find({ task: taskID })
                    .select('nameOrg path')
                    .lean();

                /**
                 * Create folder temp for save file download
                 */
                const pathDownload = path.join(__dirname, `../../../files/temporary_uploads/${taskID}`);
                const pathZip = path.join(__dirname, `../../../files/temporary_uploads/${taskID}.zip`);

                if(!fs.existsSync(pathDownload)) {
                    fs.mkdirSync(pathDownload);
                }

                /**
                 * Do download all files on s3 to local
                 */
                const downloadFileAsync = filesTask.map(file => {
                    const splits = file.path.split('/');
                    const fileName = splits.pop();
                    const filePath = splits.join('/').slice(1);
                    const fileNameLocal = file.nameOrg;

                    return downloadFileS3(pathDownload, fileName, filePath, fileNameLocal);
                });
                await Promise.all(downloadFileAsync);

                /**
                 * Zip all downloaded files
                 */
                await compressing.zip.compressDir(pathDownload, pathZip)
                    .catch(err => console.log({ compress_error: err }))

                /**
                 * Upload zip file to s3
                 */
                const response = await uploadFileS3(pathZip, `${taskID}.zip`);

                /**
                 * Remove folder temp and zip file under local
                 */
                rimraf(pathZip, err => console.error(err));
                rimraf(pathDownload, err => console.error(err));

                return resolve({ error: false, data: response, status: 200 });
            } catch(error) {
				return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    downloadFilesV2({ taskID }) {
        return new Promise(async resolve => {
            try {
                const files = await PCM_FILE__COLL
                    .find({ task: taskID })
                    .select('nameOrg path')
                    .lean();

                const result = await zipFileToS3(files, `${taskID}-${uuidv4()}`);

                return resolve({ error: false, data: result, status: 200 });
            } catch(error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    testDownload() {
        return new Promise(async (resolve, reject) => {
            try {
                const archiveStream = archiver('zip');

                const groupID = '60a8ce770400462461cc0428';
                const bucketName = `${config.bucket}`;
                const destFolderKey = `root/storage/5dfe4b9051dc622100bb9d89/5eee9ea6d8b12d649ffa03a0/60a8cb540400462461cbff9f/60a8ce770400462461cc0428/`;

                archiveStream.on('error', (error) => {
                    console.error('Archival encountered an error:', error)
                    reject(error)
                })

                const passThrough = new stream.PassThrough();

                const bucketNameDemo = `${config.bucketDemo}/archive/temp`;
                const fileNameZip = `${groupID}-${Date.now()}.zip`; // File name you want to save as in S3

                const params = {
                    Bucket: bucketNameDemo,
                    Key: fileNameZip,
                    Body: passThrough,
                    ACL: 'public-read',
                    ContentType: 'application/zip',
                };

                this.s3Object.upload(params, function(err, data) {
                    if (err) reject(err);

                    console.log(`File uploaded successfully. ${data.Location}`);
                    resolve(data);
                });

                archiveStream.pipe(passThrough);

                const listObjectParams = {
                    Bucket: bucketName,
                    Prefix: destFolderKey,
                };

                this.s3Object.listObjectsV2(listObjectParams, async (err, data) => {
                    if(err) {
                        reject(err)
                    }

                    for(const file of data.Contents) {
                        const fileKey = file.Key;

                        const fileParams = {
                            Bucket: bucketName,
                            Key: fileKey
                        }
                        // console.log({ file, fileParams, basename: path.basename(fileKey) })

                        const response = await this.s3Object.getObject(fileParams).promise();
                        archiveStream.append(response.Body, { name: path.basename(fileKey) })
                    }
                    console.log('Append stream done!!!');
                    archiveStream.finalize();
                })
            } catch(err) {
                console.error(err);
            }
        })
    }

     /**
     * Tải file trong GroupID
     */
    downloadFilesInGroup({ groupID, userID }) {
        return new Promise(async resolve => {
            try {
                const group = await PCM_PLAN_GROUP__COLL
                    .findOne({
                        _id: groupID,
                        $or: [
                            { author: userID },
                            { admins: { $in: [userID] }},
                            { members: { $in: [userID] }},
                        ]
                    })
                    .select('name sign company project')
                    .populate('project', 'company')
                    .lean();

                if(!group) {
                    return resolve({
                        error: true,
                        message: "You don't have permission to access this group",
                        status: 403
                    })
                }

                const { project, company } = group;
                const destFolder = `root/storage/${APP_KEYS.PCM_PLAN_TASK}/${company._id}/${project._id}/${group._id}/`;
                const result = await downloadFileS3V2({
                    folderName: destFolder, 
                    fileName: `${group.name}-${uuidv4()}-${Date.now()}.zip`, 
                    zipTo: `files/temporary_uploads`, 
                    bucketName: config.bucket
                });

                return resolve({
                    error: false,
                    data: result,
                    status: 200
                })
            } catch(err) {
                return resolve({
                    error: true,
                    message: err.message,
                    status: 500
                })
            }
        })
    }

    /**
     * Tải file trong GroupID theo đệ quy
     */
    downloadFilesRecursiveInGroup({ groupID, userID }) {
        return new Promise(async resolve => {
            try {
                /**
                 * BA
                 * 1-Cấn thêm 1 bước để xóa folder achive vào nửa đêm để dọn rác
                 */
                // Thông tin group
                const group = await PCM_PLAN_GROUP__COLL
                    .findOne({ _id: groupID })
                    .select('name sign company project')
                    .populate('project', 'company')
                    .lean();

                // Group con của group (cấp 1)
                const groupsChild = await PCM_PLAN_GROUP__COLL
                    .find({ parent: groupID })
                    .select('name sign')
                    .lean();

                // Lấy tên group loại bỏ tiếng việt
                const folderRootName = replaceSpaceWithChar(nonAccentVietnamese(group.name));
                const foldersChild = groupsChild.map(group => ({
                    _id: group._id.toString(),
                    name: replaceSpaceWithChar(nonAccentVietnamese(group.name), '_')
                }));

                // Tạo đường dẫn để chứa file và Zip (để đặt trên S3)
                const bucketNameDes = `${config.bucketDemo}`;
                const destFolderKey = `archive/${folderRootName}_${userID}`;
                const errors = [];

                const folderGroupParentParams = {
                    Bucket: bucketNameDes,
                    Key: `${destFolderKey}/`,
                    Body: '',
                };


                // Create folder group parent (tạo folder trên S3 theo tên chỉ định)
                await uploadFileS3V2(folderGroupParentParams);

                // Lặp qua các folder group con
                if(foldersChild.length) {
                    await PromisePool
                        .for(foldersChild)
                        .withConcurrency(10)
                        .handleError((err) => console.log({ error: true, message: err.message, status: 500 }))
                        .process(async childGroup => {
                            const folderChildName = childGroup.name;
                            const folderGroupChildParams = {
                                Bucket: bucketNameDes,
                                Key: `${destFolderKey}/${folderChildName}/`,
                                Body: '',
                            };

                            // Create folder group child
                            await uploadFileS3V2(folderGroupChildParams);

                            // Tạo folder theo tên của TaskID
                            const { error, data } = await this.createFolderTasksByGroup({
                                groupID: childGroup._id,
                                bucket: bucketNameDes,
                                key: `${destFolderKey}/${folderChildName}/`
                            });

                            return !error && (await PromisePool
                                .for(data.tasks)
                                .withConcurrency(10)
                                .handleError((err) => console.log({ error: true, message: err.message, status: 500 }))
                                .process(async task => {
                                    const taskName = replaceSpaceWithChar(nonAccentVietnamese(task.namecv || task.name), '_');

                                    // Đưa file của TaskID vào trong folder TaskID
                                    return this.copyFileByTask({
                                        taskID: task._id,
                                        bucket: bucketNameDes,
                                        key: `${destFolderKey}/${folderChildName}/${taskName}/`
                                    });
                                }));
                        });
                } else {

                    // Tạo folder theo tên của TaskID
                    const { error, data } = await this.createFolderTasksByGroup({
                        groupID: group._id,
                        bucket: bucketNameDes,
                        key: `${destFolderKey}/`,
                    });
                    if(error) return resolve({ error: true, message: 'Create folder failed', status: 500 });

                    await PromisePool
                        .for(data.tasks)
                        .withConcurrency(10)
                        .handleError((err) => console.log({ error: true, message: err.message, status: 500 }))
                        .process(task => {
                            const taskName = replaceSpaceWithChar(nonAccentVietnamese(task.namecv || task.name), '_');

                             // Đưa file của TaskID vào trong folder TaskID
                            return this.copyFileByTask({
                                taskID: task._id,
                                bucket: bucketNameDes,
                                key: `${destFolderKey}/${taskName}/`
                            });
                        });
                }

                 // Download tổng thể (đã đóng gói theo hàm)
                const linkDownload = await downloadFileS3V2({
                    folderName: `${destFolderKey}/`,
                    bucketName: bucketNameDes,
                    fileName: `${folderRootName}_${userID}.zip`,
                    zipTo: `files/temporary_uploads`,
                });

                return resolve({ data: linkDownload, errors });
            } catch(error) {
                console.error(error);
                return resolve({ error: true, message: error.message, status: 500 });
            }
        });
    }

    createFolderTasksByGroup({ groupID, key, bucket }) {
        return new Promise(async resolve => {
            const tasks = await PCM_PLAN_TASK__COLL
                .find({ group: groupID })
                .select('_id name namecv')
                .lean();

            if(!tasks.length) return resolve({ error: true, data: [] });

            const { results, errors } = await PromisePool
                .for(tasks)
                .withConcurrency(10)
                .process(async task => {
                    const taskName = replaceSpaceWithChar(nonAccentVietnamese(task.namecv || task.name), '_');
                    const folderTaskParams = {
                        Bucket: bucket,
                        Key: `${key}${taskName}/`,
                        Body: '',
                    };
                    // Create folder task
                    await uploadFileS3V2(folderTaskParams);
                });

            return resolve({ error: false, data: { results, tasks }, errors, status: 200 });
        });
    }

    // Copy file của Tasks vào trong folder
    copyFileByTask({ taskID, bucket, key }) {
        return new Promise(async resolve => {
            try {
                const files = await PCM_FILE__COLL
                    .find({ task: taskID })
                    .select('name nameOrg path')
                    .lean();

                if(!files.length) return resolve({ error: true, data: [] });

                const { results, errors } = await PromisePool
                    .for(files)
                    .withConcurrency(10)
                    .process(async file => {
                        const copyFileParams = {
                            Bucket: bucket,
                            CopySource: `${config.bucket}${file.path}`,
                            Key: `${key}${file.nameOrg || file.name}`,
                        };
                        await copyFileS3(copyFileParams);
                    });

                return resolve({ error: false, data: { results, files }, errors, status: 200 });
            } catch(error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        });
    }
}

exports.MODEL = new Model;