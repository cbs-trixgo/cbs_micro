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
const { KEY_ERROR } = require('../../../tools/keys');


/**
 * COLLECTIONS
 */
const DATAHUB_FINDREPORT_COLL           				= require('../database/datahub_finreport-coll');

class Model extends BaseModel {

    constructor() {
        super(DATAHUB_FINDREPORT_COLL);
    }

    /**
	 * Name: insert datahub finreport
	 * Author: Depv
	 * Code:
	 */
    insert({ contractor, fiscalYear, asset, liabilitiy, netWorth, currentAsset, shortTermLiabilitiy, workingCapital, grossRevenue, grossConstructionRevenue, grossProfit, grossProfitAfterTax, userID }) {
        // console.log({ contractor, fiscalYear, asset, liabilitiy, netWorth, currentAsset, shortTermLiabilitiy, workingCapital, grossRevenue, grossConstructionRevenue, grossProfit, grossProfitAfterTax, userID })
        return new Promise(async resolve => {
            try {

                if(!checkObjectIDs(contractor))
                    return resolve({ error: true, message: "contractor Không hợp lệ", keyError: KEY_ERROR.PARAMS_INVALID });

                let dataInsert = { contractor, fiscalYear, userCreate: userID, userUpdate: userID };
                if(asset){
                    dataInsert.asset = asset;
                }

                if(liabilitiy){
                    dataInsert.liabilitiy = liabilitiy;
                }

                if(netWorth){
                    dataInsert.netWorth = netWorth;
                }

                if(currentAsset){
                    dataInsert.currentAsset = currentAsset;
                }

                if(shortTermLiabilitiy){
                    dataInsert.shortTermLiabilitiy = shortTermLiabilitiy;
                }

                if(workingCapital){
                    dataInsert.workingCapital = workingCapital;
                }

                if(grossRevenue){
                    dataInsert.grossRevenue = grossRevenue;
                }

                if(grossConstructionRevenue){
                    dataInsert.grossConstructionRevenue = grossConstructionRevenue;
                }

                if(grossProfit){
                    dataInsert.grossProfit = grossProfit;
                }

                if(grossProfitAfterTax){
                    dataInsert.grossProfitAfterTax = grossProfitAfterTax;
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if (!infoAfterInsert)
                    return resolve({ error: true, message: "Tạo mới thất bại", keyError: 'cannot_insert' });

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
	 * Name: update datahub finreport
	 * Author: Depv
	 * Code:
	 */
    update({ datahubFinreportID, fiscalYear, asset, liabilitiy, netWorth, currentAsset, shortTermLiabilitiy, workingCapital, grossRevenue, grossConstructionRevenue, grossProfit, grossProfitAfterTax, files, userID  }) {
        // console.log({ fiscalYear, asset, liabilitiy, netWorth, currentAsset, shortTermLiabilitiy, workingCapital, grossRevenue, grossConstructionRevenue, grossProfit, grossProfitAfterTax, userID })
        return new Promise(async resolve => {
            try {

                let dataUpdate = { userUpdate: userID };
                if(fiscalYear){
                    dataUpdate.fiscalYear = fiscalYear;
                }

                if(asset){
                    dataUpdate.asset = asset;
                }

                if(liabilitiy){
                    dataUpdate.liabilitiy = liabilitiy;
                }

                if(netWorth){
                    dataUpdate.netWorth = netWorth;
                }

                if(currentAsset){
                    dataUpdate.currentAsset = currentAsset;
                }

                if(shortTermLiabilitiy){
                    dataUpdate.shortTermLiabilitiy = shortTermLiabilitiy;
                }

                if(workingCapital){
                    dataUpdate.workingCapital = workingCapital;
                }

                if(grossRevenue){
                    dataUpdate.grossRevenue = grossRevenue;
                }

                if(grossConstructionRevenue){
                    dataUpdate.grossConstructionRevenue = grossConstructionRevenue;
                }

                if(grossProfit){
                    dataUpdate.grossProfit = grossProfit;
                }

                if(grossProfitAfterTax){
                    dataUpdate.grossProfitAfterTax = grossProfitAfterTax;
                }

                if(files && checkObjectIDs(files)) {
                    dataUpdate.$addToSet = { files };
                }

                let infoAfterUpdate = await DATAHUB_FINDREPORT_COLL.findByIdAndUpdate(datahubFinreportID, dataUpdate, { new: true });
                if (!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: 'cannot_update' });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
	 * Name: Remove datahub finreport
	 * Author: Depv
	 * Code:
	 */
	// remove({ datahubFinreportID }) {
    //     return new Promise(async (resolve) => {
    //         try {
    //             if(!checkObjectIDs(datahubFinreportID))
    //                 return resolve({ error: true, message: 'Mã datahubFinreportID không hợp lệ', keyError: "datahubFinreportID_invalid", status: 400 });

    //             let infoAterRemove = await DATAHUB_FINDREPORT_COLL.findByIdAndDelete(datahubFinreportID)
    //             if(!infoAterRemove)
    //                 return resolve({ error: true, message: "Xoá thất bại", keyError: "remove_failed", status: 403 });

    //             return resolve({ error: false, data: infoAterRemove, status: 200 });
    //         } catch (error) {
    //             return resolve({ error: true, message: error.message, status: 500 });
    //         }
    //     })
    // }

	/**
	 * Name: get info datahub finreport
	 * Author: Depv
	 * Code:
	 */
	getInfo({ datahubFinreportID, select, populates }) {
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
                if(!checkObjectIDs(datahubFinreportID))
                    return resolve({ error: true, message: 'Request params datahubFinreportID invalid', status: 400 });

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
                let infoAterGet = await DATAHUB_FINDREPORT_COLL.findById(datahubFinreportID)
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
	 * Func: Lấy danh sách datahub finreport
	 * Date: 26/10/2021
	 */
    getList({ contractorID, userID, lastestID, keyword, limit = 10, select, populates = {}}){
        return new Promise(async resolve => {
            try {
                let conditionObj = { contractor: contractorID };
                let sortBy;
                let keys	     = ['createAt__-1', '_id__-1'];

                if(limit > 20){
                    limit = 20;
                }else{
                    limit = +limit;
                }

				if(!checkObjectIDs(userID))
                    return resolve({ error: true, message: 'Request params userID invalid', status: 400 });

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
					let infoData = await DATAHUB_FINDREPORT_COLL.findById(lastestID);
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

                let listPackages = await DATAHUB_FINDREPORT_COLL
					.find(conditionObj)
					.limit(limit + 1)
					.select(select)
					.populate(populates)
                    .sort(sortBy)
					.lean();

				// GET TOTAL RECORD
                let totalRecord = await DATAHUB_FINDREPORT_COLL.count(conditionObjOrg);
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
    getListByProperty({ userID, option, contractorID }){
        // console.log({ userID, option, contractorID })
        return new Promise(async resolve => {
            try {
                if(option == 1){
                    // let conditionObj = {}, conditionGroup = {}, conditionPopulate = {}, sortBy = {"amount": -1}

                    let listData = await DATAHUB_FINDREPORT_COLL.aggregate([
                        {
                            $match: {
                                contractor: ObjectID(contractorID)
                            }
                        },
                        {
                            $group: {
                                _id: { year: "$fiscalYear" },
                                amount: { $sum: "$grossConstructionRevenue" },
                            }
                        },
                    ])
                    // console.log(listData)

                    return resolve({ error: false, data: listData });
                }

            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;
