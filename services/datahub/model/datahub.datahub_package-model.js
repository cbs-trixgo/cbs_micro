"use strict";

/**
 * EXTERNAL PACKAGE
 */
const stringUtils						 = require('../../../tools/utils/string_utils');
const ObjectID                           = require('mongoose').Types.ObjectId;

/**
 * CONSTANTS
 */

/**
 * TOOLS
 */
const BaseModel                                 	= require('../../../tools/db/base_model');
const { RANGE_BASE_PAGINATION_V2 } 					= require('../../../tools/cursor_base/playground/index');
const {
    checkObjectIDs,
    IsJsonString,
} = require('../../../tools/utils/utils');

/**
 * COLLECTIONS
 */
const AUTH__COMPANY_COLL                            = require('../../auth/database/auth.company-coll')
const AUTH__USER_COLL                               = require('../../auth/database/auth.user-coll')
const PCM_PLAN_TASK_COLL                            = require('../../subject_pcm/database/subject_pcm.pcm_plan_task-coll')
const DATAHUB_PACKAGE_COLL           				= require('../database/datahub_package-coll')
const DATAHUB_PROJECT_COLL           				= require('../database/datahub_project-coll')
const DATAHUB_TYPE_COLL           				    = require('../database/datahub_type-coll')
const DATAHUB_PRODUCT_COLL                          = require('../database/datahub_product-coll') 

class Model extends BaseModel {

    constructor() {
        super(DATAHUB_PACKAGE_COLL);
    }

    /**
	 * Name: insert datahub package
	 * Author: Depv
	 * Code: 26/10/2021
	 */
    insert({ contractor, project, field, name, sign, note, value, vatValue, date, startTime, endTime, status, userID }) {
        return new Promise(async resolve => {
            try {
                if(!name)
                    return resolve({ error: true, message: "Tên datahub không hợp lệ", keyError: 'params_invalid' });

                if(!checkObjectIDs(project, field, contractor))
                    return resolve({ error: true, message: "contractor || project || field invalid", keyError: 'params_invalid' });

                let { client, area1, area2, area3, projectType, buildingType,
                    buildingGrade, basementNumber, basementArea, floorNumber, floorArea } = await DATAHUB_PROJECT_COLL.findById(project)

                let dataInsert = {
                    contractor, project, field, name, value, vatValue, userCreate: userID,
                    client, area1, area2, area3, projectType, buildingType,
                    buildingGrade, basementNumber, basementArea, floorNumber, floorArea
                };

                if(sign){
                    dataInsert.sign = sign;
                }

                if(note){
                    dataInsert.note = note;
                }

                if(date){
                    dataInsert.date = date;
                }

                if(startTime){
                    dataInsert.startTime = startTime;
                }

                if(endTime){
                    dataInsert.endTime = endTime;
                }

                if(status){
                    dataInsert.status = status;
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if (!infoAfterInsert)
                    return resolve({ error: true, message: "Tạo mới thất bại", keyError: 'cannot_insert' });

                /**
                 * Cập nhật vào lĩnh vực
                 * - Số lượng đơn vị vào trong phân loại
                 * - Số hợp đồng
                 */
                let infoType = await DATAHUB_TYPE_COLL.findByIdAndUpdate(field, {
                    $addToSet: {
                        contractors: contractor
                    },
                    $inc: {
                        numberOfContracts: 1,
                    }
                }, { new: true });
                // console.log(infoType)

                await DATAHUB_TYPE_COLL.findByIdAndUpdate(field, {
                    numberOfContractors: infoType.contractors.length | 0
                }, { new: true });

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
	 * Name: update datahub package
	 * Author: Depv
	 * Code: 26/10/2021
	 */
    update({ datahubPackageID, project, field, name, sign, note, value, vatValue, date, startTime, endTime, status, files, userID  }) {
        return new Promise(async resolve => {
            try {

                let dataUpdate = { userUpdate: userID };
                if(project){
                    let { client, area1, area2, area3, projectType, buildingType,
                        buildingGrade, basementNumber, basementArea, floorNumber, floorArea } = await DATAHUB_PROJECT_COLL.findById(project)
                    dataUpdate = {
                        ...dataUpdate, project, client, area1, area2, area3, projectType, buildingType,
                        buildingGrade, basementNumber, basementArea, floorNumber, floorArea
                    }
                }

                if(field){
                    dataUpdate.field = field;
                }

                if(name){
                    dataUpdate.name = name;
                }

                if(sign){
                    dataUpdate.sign = sign;
                }

                if(note){
                    dataUpdate.note = note;
                }

                if(value){
                    dataUpdate.value = value;
                }

                if(vatValue){
                    dataUpdate.vatValue = vatValue;
                }

                if(date){
                    dataUpdate.date = date;
                }

                if(startTime){
                    dataUpdate.startTime = startTime;
                }

                if(endTime){
                    dataUpdate.endTime = endTime;
                }

                if(status){
                    dataUpdate.status = status;
                }

                if(files && checkObjectIDs(files)) {
                    dataUpdate.$addToSet = { files };
                }

                let infoAfterUpdate = await DATAHUB_PACKAGE_COLL.findByIdAndUpdate(datahubPackageID, dataUpdate, { new: true });
                if (!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: 'cannot_update' });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
	 * Name: Remove datahub package
	 * Author: Depv
	 * Code: 26/10/2021
	 */
	remove({ datahubPackageID }) {
        return new Promise(async (resolve) => {
            try {
                if(!checkObjectIDs(datahubPackageID))
                    return resolve({ error: true, message: 'Mã datahubPackageID không hợp lệ', keyError: "datahubPackageID_invalid", status: 400 });

                let infoAterRemove = await DATAHUB_PACKAGE_COLL.findByIdAndDelete(datahubPackageID)
                if(!infoAterRemove)
                    return resolve({ error: true, message: "Xoá thất bại", keyError: "remove_failed", status: 403 });

                return resolve({ error: false, data: infoAterRemove, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

	/**
	 * Name: get info datahub package
	 * Author: Depv
	 * Code: 26/10/2021
	 */
	getInfo({ datahubPackageID, select, populates }) {
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
                if(!checkObjectIDs(datahubPackageID))
                    return resolve({ error: true, message: 'Request params datahubPackageID invalid', status: 400 });

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
                let infoAterGet = await DATAHUB_PACKAGE_COLL.findById(datahubPackageID)
                                    .select(select)
                                    .populate(populates)
                if(!infoAterGet)
                    return resolve({ error: true, message: "can't_get_info", status: 403 });

                return resolve({ error: false, data: infoAterGet, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
	 * Dev: HiepNH
	 * Func: Lấy danh sách datahub package
	 * Date: 26/10/2021
	 */
    getList({ contractorID, fieldID, userID, lastestID, keyword, limit = 10, select, populates = {} }){
        // console.log({ contractorID, fieldID, userID, lastestID, keyword, limit, select, populates })
        return new Promise(async resolve => {
            try {
                let conditionObj = { };
                let sortBy;
                let keys	     = ['createAt__-1', '_id__-1'];

                if(limit > 20){
                    limit = 20;
                }else{
                    limit = +limit;
                }

                if(contractorID && checkObjectIDs(contractorID)){
                    conditionObj.contractor = ObjectID(contractorID)
                }

                if(fieldID && checkObjectIDs(fieldID)){
                    conditionObj.field = ObjectID(fieldID)
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
                
                // SEARCH TEXT
                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    let regSearch = new RegExp(keyword, 'i');
                    conditionObj.name = regSearch;
                }

                let conditionObjOrg = { ...conditionObj };
				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await DATAHUB_PACKAGE_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastestID", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
                    if(!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({ error: true, message: "Can't get range pagination", status: 400 });
                    conditionObj  = dataPagingAndSort.data.find;
                    sortBy        = dataPagingAndSort.data.sort;
                }else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy        = dataPagingAndSort.data.sort;
                }

                let listPackages = await DATAHUB_PACKAGE_COLL
					.find(conditionObj)
					.limit(limit + 1)
					.select(select)
					.populate(populates)
                    .sort(sortBy)
					.lean();

				// GET TOTAL RECORD
                let totalRecord = await DATAHUB_PACKAGE_COLL.count(conditionObjOrg);
                let totalPage   = Math.ceil(totalRecord/limit);
				let nextCursor	= null;

				if(listPackages && listPackages.length){
					if(listPackages.length > limit){
						nextCursor = listPackages[limit - 1]._id;
						listPackages.length = limit;
					}
				}

                return resolve({
					error: false,
					status: 200,
					data: {
						listRecords: listPackages,
						limit: +limit,
						totalRecord,
                        totalPage,
						nextCursor
					}
				});
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Gom nhóm theo thuộc tính
     * Author: Hiepnh
     * Date: 17/9/2022
     */
    getListByProperty({ userID, option, fieldID, contractorID, areaID, level, buildingType, buildingGrade, basementNumber, basementArea, floorNumber, floorArea, status, fromDate, toDate, quality }){
        // console.log({ userID, option, fieldID, contractorID, areaID, level, buildingType, buildingGrade, basementNumber, basementArea, floorNumber, floorArea, status, fromDate, toDate, quality })
        return new Promise(async resolve => {
            try {
                /**
                 * BA
                 * 1-Tìm kiếm Lĩnh vực
                 * 2-Tìm kiếm Khu vực (Tỉnh/Huyện/Xã)
                 * 3-Gom nhóm, tính tổng và sắp xếp theo số lượng hợp đồng lớn lên trên
                 */
                if(option == 1){
                    let conditionObj = {}, conditionGroup = {}, conditionPopulate = {}, sortBy = {"amount": -1}

                    if(fieldID && checkObjectIDs(fieldID)){
                        conditionObj.field = ObjectID(fieldID)

                        /**
                         * Cập nhật số lượt xem, user đã xem, công ty đã xem
                         */
                        let infoUser = await AUTH__USER_COLL.findById(userID).select('company')
                        let infoType = await DATAHUB_TYPE_COLL.findByIdAndUpdate(fieldID, {
                            $inc: {
                                numberOfViews: 1,
                            },
                            $addToSet: {
                                companyViews: infoUser.company,
                                userViews: userID,
                            }
                        }, { new: true });
                    }

                    if(buildingType){
                        conditionObj.buildingType = Number(buildingType)
                    }

                    if(buildingGrade){
                        conditionObj.buildingGrade = Number(buildingGrade)
                    }

                    if(basementNumber){
                        conditionObj.basementNumber = Number(basementNumber)
                    }

                    if(basementArea){
                        conditionObj.basementArea = Number(basementArea)
                    }

                    if(floorNumber){
                        conditionObj.floorNumber = Number(floorNumber)
                    }

                    if(floorArea){
                        conditionObj.floorArea = Number(floorArea)
                    }

                    if(status){
                        conditionObj.status = Number(status)
                    }

                    if(quality){
                        conditionObj.quality = {$gt: 0}
                    }

                    if(fromDate && toDate){
                        conditionObj.endTime = {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate),
                        }
                    }

                    if(areaID && checkObjectIDs(areaID) && level){
                        if(level == 1){
                            conditionObj.area1 = ObjectID(areaID)
                        }
                        if(level == 2){
                            conditionObj.area2 = ObjectID(areaID)
                        }
                        if(level == 3){
                            conditionObj.area3 = ObjectID(areaID)
                        }
                    }
                    // console.log(conditionObj)

                    conditionGroup = {
                        _id: { contractor: '$contractor' },
                        amount: { $sum: 1 },
                    }

                    conditionPopulate = {
                        path: '_id.contractor',
                        select: '_id name sign image address',
                        model: 'company'
                    }

                    // console.log('===================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
                    // console.log(conditionObj)
                    // console.log(conditionGroup)

                    let listData = await DATAHUB_PACKAGE_COLL.aggregate([
                        {
                            $match: conditionObj
                        },
                        {
                            $group: conditionGroup
                        },
                        {
                            $sort: sortBy
                        }
                    ])
                    // console.log(listData)

                    if(listData.length){
                        await AUTH__COMPANY_COLL.populate(listData, conditionPopulate)
                    }
                    // console.log(listData)

                    return resolve({ error: false, data: listData });
                }

                /**
                 * Tính tổng số lượng theo các phân loại của Nhà thầu
                 */
                if(option == 2){
                    // Tổng hợp theo Lĩnh vực
                    let listData1 = await DATAHUB_PACKAGE_COLL.aggregate([
                        {
                            $match: {
                                contractor: ObjectID(contractorID)
                            }
                        },
                        {
                            $group: {
                                _id: { field: '$field' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    // Tổng hợp theo Dự án
                    let listData2 = await DATAHUB_PACKAGE_COLL.aggregate([
                        {
                            $match: {
                                contractor: ObjectID(contractorID)
                            }
                        },
                        {
                            $group: {
                                _id: { project: '$project' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    // Tổng hợp theo Hợp đồng
                    let listData3 = await DATAHUB_PACKAGE_COLL.aggregate([
                        {
                            $match: {
                                contractor: ObjectID(contractorID)
                            }
                        },
                        {
                            $group: {
                                _id: { },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    // Tổng hợp theo Chủ đầu tư
                    let listData4 = await DATAHUB_PACKAGE_COLL.aggregate([
                        {
                            $match: {
                                contractor: ObjectID(contractorID)
                            }
                        },
                        {
                            $group: {
                                _id: { client: '$client' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    let number1 = 0, number2 = 0, number3 = 0, number4 = 0
                    if(listData1.length){
                        number1 = listData1.length
                    }
                    if(listData2.length){
                        number2 = listData2.length
                    }
                    if(listData3.length){
                        number3 = listData3[0].amount
                    }
                    if(listData4.length){
                        number4 = listData4.length
                    }
                    // console.log(listData1)
                    // console.log(listData2)
                    // console.log(listData3)
                    // console.log(listData4)

                    // console.log(number1)
                    // console.log(number2)
                    // console.log(number3)
                    // console.log(number4)

                    return resolve({ error: false, data: {number1, number2, number3, number4} });
                }

                /**
                 * Danh sách dịch vụ của Nhà thầu
                 */
                if(option == 3){
                    let listData = await DATAHUB_PACKAGE_COLL.aggregate([
                        {
                            $match: {
                                contractor: ObjectID(contractorID)
                            }
                        },
                        {
                            $group: {
                                _id: { field: '$field' },
                                amount: { $sum: 1 },
                            }
                        },
                    ])

                    let conditionPopulate = {
                        path: '_id.field',
                        select: '_id name sign description',
                        model: 'datahub_type'
                    }

                    if(listData.length){
                        await DATAHUB_TYPE_COLL.populate(listData, conditionPopulate)
                    }
                    // console.log(listData)

                    return resolve({ error: false, data: listData });
                }

                /**
                 * Tổng số lượng phân loại của DataHub
                 */
                if(option == 4){
                    let number1 = await PCM_PLAN_TASK_COLL.count({ subtype: 14 })
                    let number2 = await AUTH__COMPANY_COLL.count({ show: 1 })
                    let number3 = await DATAHUB_PRODUCT_COLL.count({ })

                    return resolve({ error: false, data: {number1, number2, number3} });
                }

            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;