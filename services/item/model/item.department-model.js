"use strict";
const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }  = require('../../../tools/utils/utils');
const { getCurrentPage }			    = require('../../../tools/utils/calculate_current_page');
const { CF_ACTIONS_AUTH } 		        = require('../../auth/helper/auth.actions-constant');
const _isValid                          = require("mongoose").Types.ObjectId;
const { KEY_ERROR }                     = require('../../../tools/keys/index');

const { CF_DOMAIN_SERVICES } 		    = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_ITEM } 		        = require('../helper/item.actions-constant');
const { CF_ACTIONS_CMCS } 		        = require('../../cmcs/helper/cmcs.actions-constant');

/**
 * import inter-coll, exter-coll
 */
const ITEM__DEPARTMENT_COLL                 = require('../database/item.department-coll');
const ITEM__CONTRACT_COLL                   = require('../database/item.contract-coll');
const { RANGE_BASE_PAGINATION_V2 } 		    = require('../../../tools/cursor_base/playground/index');
const { ObjectID } = require('mongodb');

/**
 * import inter-model, exter-model
 */

/**
 * import util files
 */

class Model extends BaseModel {

    constructor() {
        super(ITEM__DEPARTMENT_COLL);
    }

    /**
     * Name: Tạo mới dự án/phòng ban bởi Supper Admin
     * Author: Depv
     */
    insert({ type, name, location, description, company, parent, sign, owner, address, startTime, expiredTime, pm, status, note, assistant, projectCapital, projectType, buildingGrade, buildingType, investmentAmount, area, authorID, milestones, completedMilestones, budget, vatBudget, forecastBudget, vatForecastBudget, contractValue, contractVatValue, contractPlus, contractVatPlus, contractAdvancePaymentPaid, contractAmountPaid, ctx }) {
        return new Promise(async resolve => {
            try {
                if(!_isValid(company) | !_isValid(authorID))
                    return resolve({ error: true, message: 'Request params company|author(*) invalid', status: 400 });
                if(!name)
                    return resolve({ error: true, message: 'Request params name(*) invalid', status: 400 });

                if(!sign)
                    return resolve({ error: true, message: 'Request params sign(*) invalid', status: 400 });

                // Lấy thông tin công ty để gán ký hiệu công ty vào tên dự án
                let infoCompany = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_AND_GET_LIST_COMPANY}`, {
                    companyID: company
                });

                if(infoCompany.error)
                    return resolve({ error: true, message: "Request params company invalid" });

                // Kiểm tra tồn tại
                let infoDepartment = await ITEM__DEPARTMENT_COLL.findOne({
                    company: company,
                    $or: [
                        { name: name },
                        { sign: sign },
                    ]
                }).select('_id name sign');

                if(infoDepartment)
                    return resolve({ error: true, message: `Tên/Mã hiệu đã tồn tại: ${infoDepartment.name}` });

                let dataInsert = {
                    userCreate: authorID,
                    company,
                    type: type ? Number(type) : Number(1),
                    name,
                    description,
                    sign: `${infoCompany.data.sign}.${sign}`,
                    owner,
                    address,
                    startTime: startTime,
                    actualStartTime: startTime,
                    expiredTime: expiredTime,
                    actualFinishTime: expiredTime,
                    status: !isNaN(status) ? Number(status) : 1,
                    note,
                    projectCapital: !isNaN(projectCapital) ? Number(projectCapital) : 1,
                    projectType: !isNaN(projectType) ? Number(projectType) : 1,
                    buildingGrade: !isNaN(buildingGrade) ? Number(buildingGrade) : 1,
                    buildingType: !isNaN(buildingType) ? Number(buildingType) : 1,
                    investmentAmount: !isNaN(investmentAmount) ? Number(investmentAmount) : 0,
                    admins: [authorID],
                    members: [authorID],
                    milestones,
                    completedMilestones,
                    budget,
                    vatBudget,
                    forecastBudget,
                    vatForecastBudget,
                    contractValue,
                    contractVatValue,
                    contractPlus,
                    contractVatPlus,
                    contractAdvancePaymentPaid,
                    contractAmountPaid
                }

                if(location){
                    dataInsert.location = location;
                }

                if(pm && _isValid(pm)){
                    dataInsert.pm = pm;
                }

                if(assistant && _isValid(assistant)){
                    dataInsert.assistant = assistant;
                }
                // _____Khuc vực
                if(area && _isValid(area)){
                    dataInsert.area = area;
                }
                
                if(parent && _isValid(parent)){
                    let infoMenuParent = await ITEM__DEPARTMENT_COLL.findById(parent);
                    dataInsert.parent = parent;
                    dataInsert.level = infoMenuParent.level + 1;
                }

                let infoAfterInsert = await this.insertData(dataInsert, authorID);
                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name: Cập nhật mới dự án/phòng ban bởi Supper Admin
     * Author: Depv
     */
    update({
        departmentID, type, name, admins, adminsRemove, members, membersRemove, stage, ontime, onbudget, status, projectType, projectCapital, buildingType, buildingGrade,
        description, sign, owner, location, address, area, startTime, expiredTime, actualStartTime, actualFinishTime, photos,
        pm, assistant, budget, vatBudget, note, image, files, userUpdate, milestones, completedMilestones, tasks, completedTasks,
        images, lastComment, revenue, forecastRevenue, realRevenue, forecastBudget, vatForecastBudget, realBudget, npv, forecastNpv, realNpv, irr, forecastIrr,
        realIrr, numberOfPackage, numberOfUnexecutedPackage, numberOfExecutedPackage, numberOfCompletedPackage, amountOfUnexecutedPackage, amountOfExecutedPackage, amountOfCompletedPackage, percentOfCompletedPackage, numberOfContractIn, contractValue, contractVatValue, contractPlus, contractVatPlus, contractAdvancePayment,
        contractProduce, contractPlusAcceptance, contractVatAcceptance, contractRetainedValue, contractAdvancePaymentDeduction,
        contractOtherDeduction, contractRecommendedPayment, contractAdvancePaymentPaid, contractAmountPaid, contractRemainingPayment, contractAdvancePaymentOverage, openTime,
        closedTime, numberOfAgent, numberOfBooking, totalBookingValue, numberOfDeposit, totalDepositValue, numberOfContract, totalContractValue,
        receivable, estimate, lastDateContact, transactionContacts, likelihoodOfSuccess, lastChange, numberOfContact, numberOfMoms, numberOfDocs,
        numberOfDrawings, numberOfReports, numberOfIpcs, numberOfRfis, numberOfSubmitals, numberOfPunchLists, numberOfPhotos, numberOfInspections, numberFinishOfDocs, inspectionTasks, completedInspectionTasks, ctx
    }) {
        // console.log('++++++++++++++++++++++++++++++++++++')
        // console.log('======================Update thông tin')
        // console.log({
        //     departmentID, type, name, admins, adminsRemove, members, membersRemove, stage, ontime, onbudget, status, projectType, projectCapital, buildingType, buildingGrade,
        //     description, sign, owner, location, address, area, startTime, expiredTime, actualStartTime, actualFinishTime, photos,
        //     pm, assistant, budget, vatBudget, note, image, files, userUpdate, milestones, completedMilestones, tasks, completedTasks,
        //     images, lastComment, revenue, forecastRevenue, realRevenue, forecastBudget, vatForecastBudget, realBudget, npv, forecastNpv, realNpv, irr, forecastIrr,
        //     realIrr, numberOfPackage, numberOfUnexecutedPackage, numberOfExecutedPackage, numberOfCompletedPackage, amountOfUnexecutedPackage, amountOfExecutedPackage, amountOfCompletedPackage, percentOfCompletedPackage, numberOfContractIn, contractValue, contractVatValue, contractPlus, contractVatPlus, contractAdvancePayment,
        //     contractProduce, contractPlusAcceptance, contractVatAcceptance, contractRetainedValue, contractAdvancePaymentDeduction,
        //     contractOtherDeduction, contractRecommendedPayment, contractAdvancePaymentPaid, contractAmountPaid, contractRemainingPayment, contractAdvancePaymentOverage, openTime,
        //     closedTime, numberOfAgent, numberOfBooking, totalBookingValue, numberOfDeposit, totalDepositValue, numberOfContract, totalContractValue,
        //     receivable, estimate, lastDateContact, transactionContacts, likelihoodOfSuccess, lastChange, numberOfContact, numberOfMoms, numberOfDocs,
        //     numberOfDrawings, numberOfReports, numberOfIpcs, numberOfRfis, numberOfSubmitals, numberOfPunchLists, numberOfPhotos, numberOfInspections, numberFinishOfDocs, inspectionTasks, completedInspectionTasks
        // })
        return new Promise(async resolve => {
            try {
                let dataUpdate   = {};
                let dataAddToSet = {};
                let dataPull     = {};
                let dataInc      = {};

                if(!checkObjectIDs(departmentID))
                    return resolve({ error: true, message: "Request params departmentID invalid" });

                const infoDepartment = await ITEM__DEPARTMENT_COLL.findById(departmentID);
                console.log(infoDepartment.members.length)

                // KIỂM TRA SIGN VÀ NAME CÓ TỒN TẠI Ở 1 DỰ ÁN KHÁC CHƯA
                if(sign || name){
                    let checkExistsSignAndName = await ITEM__DEPARTMENT_COLL.findOne({
                        company: infoDepartment.company,
                        $or: [
                            { name: name },
                            { sign: sign },
                        ],
                        _id: { $ne: departmentID }
                    }).select('_id name sign');

                    if(checkExistsSignAndName)
                        return resolve({ error: true, message: `Tên/Mã hiệu đã tồn tại: ${checkExistsSignAndName.name}` });
                }

                if(name){
                    dataUpdate.name = name;
                }

                if(type){
                    dataUpdate.type = type;
                }

                /**
                 * Thêm admin dự án
                 */
                if(checkObjectIDs(admins)){
                    // if(Number(Number(infoDepartment.members.length) + Number(infoDepartment.admins.length)) > Number(infoDepartment.maxMembers))
                    //     return resolve({ error: true, message: `Số lượng thành viên đã vượt ngưỡng hệ thống quy định` });

                    dataAddToSet.admins = admins;
                }

                if(checkObjectIDs(adminsRemove)){
                    dataPull.admins = adminsRemove;
                }

                /**
                 * Thêm thành viên dự án
                 */
                if(checkObjectIDs(members)){
                    // if(Number(Number(infoDepartment.members.length) + Number(infoDepartment.admins.length)) > Number(infoDepartment.maxMembers))
                    //     return resolve({ error: true, message: `Số lượng thành viên đã vượt ngưỡng hệ thống quy định` });
                        
                    dataAddToSet.members = members;

                    for (const item of members){
                        // console.log(item)

                        // Lấy thông tin công ty để gán ký hiệu công ty vào tên dự án
                        let infoCompany = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`, {
                            userID: item
                        });
                        // console.log(infoCompany)

                        if(infoCompany){
                            dataAddToSet.contractors = infoCompany.data.company;
                        }
                    }
                }

                if(checkObjectIDs(membersRemove)){
                    dataPull.members = membersRemove;
                }

                if(!isNaN(stage)){
                    dataAddToSet.stage = stage;
                }

                if(!isNaN(ontime)){
                    dataUpdate.ontime = ontime;
                }

                if(!isNaN(onbudget)){
                    dataUpdate.onbudget = onbudget;
                }

                if(!isNaN(status)){
                    dataUpdate.status = status;
                }

                if(!isNaN(projectType)){
                    dataUpdate.projectType = projectType;
                }

                if(!isNaN(projectCapital)){
                    dataUpdate.projectCapital = projectCapital;
                }

                if(!isNaN(buildingType)){
                    dataUpdate.buildingType = buildingType;
                }

                if(!isNaN(buildingGrade)){
                    dataUpdate.buildingGrade = buildingGrade;
                }

                if(description){
                    dataUpdate.description = description;
                }

                if(sign){
                    dataUpdate.sign = sign;
                }

                if(owner){
                    dataUpdate.owner = owner;
                }

                if(location){
                    dataUpdate.location = location;
                }

                if(address){
                    dataUpdate.address = address;
                }

                if(checkObjectIDs(area)){
                    dataUpdate.area = area;
                }

                if(startTime){
                    dataUpdate.startTime = startTime;
                }

                if(expiredTime){
                    dataUpdate.expiredTime = expiredTime;
                }

                if(actualStartTime){
                    dataUpdate.actualStartTime = actualStartTime;
                }

                if(actualFinishTime){
                    dataUpdate.actualFinishTime = actualFinishTime;
                }

                if(checkObjectIDs(pm)){
                    dataUpdate.pm = pm;
                }

                if(checkObjectIDs(assistant)){
                    dataUpdate.assistant = assistant;
                }

                if(budget){
                    dataUpdate.budget = budget;
                }

                if(vatBudget){
                    dataUpdate.vatBudget = vatBudget;
                }

                if(note){
                    dataUpdate.note = note;
                }


                if(image){
                    dataUpdate.image = image;
                }

                if(checkObjectIDs(files)){
                    dataUpdate.files = files;
                }

                if(checkObjectIDs(userUpdate)){
                    dataUpdate.userUpdate = userUpdate;
                }

                if(!isNaN(milestones)){
                    dataUpdate.milestones = milestones;
                }

                if(!isNaN(completedMilestones)){
                    dataUpdate.completedMilestones = completedMilestones;
                }

                if(!isNaN(tasks)){
                    dataUpdate.tasks = tasks;
                }

                if(!isNaN(completedTasks)){
                    dataUpdate.completedTasks = completedTasks;
                }

                if(checkObjectIDs(images)){
                    dataUpdate.images = images;
                }

                if(checkObjectIDs(lastComment)){
                    dataUpdate.lastComment = lastComment;
                }

                if(!isNaN(revenue)){
                    dataUpdate.revenue = revenue;
                }

                if(!isNaN(forecastRevenue)){
                    dataUpdate.forecastRevenue = forecastRevenue;
                }

                if(!isNaN(realRevenue)){
                    dataUpdate.realRevenue = realRevenue;
                }

                if(!isNaN(forecastBudget)){
                    dataUpdate.forecastBudget = forecastBudget;
                }

                if(!isNaN(vatForecastBudget)){
                    dataUpdate.vatForecastBudget = vatForecastBudget;
                }

                if(!isNaN(realBudget)){
                    dataUpdate.realBudget = realBudget;
                }

                if(!isNaN(npv)){
                    dataUpdate.npv = npv;
                }

                if(!isNaN(forecastNpv)){
                    dataUpdate.forecastNpv = forecastNpv;
                }

                if(!isNaN(realNpv)){
                    dataUpdate.realNpv = realNpv;
                }

                if(!isNaN(irr)){
                    dataUpdate.irr = irr;
                }

                if(!isNaN(forecastIrr)){
                    dataUpdate.forecastIrr = forecastIrr;
                }

                if(!isNaN(realIrr)){
                    dataUpdate.realIrr = realIrr;
                }

                if(!isNaN(numberOfPackage)){
                    dataUpdate.numberOfPackage = numberOfPackage;
                }

                if(!isNaN(numberOfUnexecutedPackage)){
                    dataUpdate.numberOfUnexecutedPackage = numberOfUnexecutedPackage;
                }

                if(!isNaN(numberOfExecutedPackage)){
                    dataUpdate.numberOfExecutedPackage = numberOfExecutedPackage;
                }

                if(!isNaN(numberOfCompletedPackage)){
                    dataUpdate.numberOfCompletedPackage = numberOfCompletedPackage;
                }

                if(!isNaN(amountOfUnexecutedPackage)){
                    dataUpdate.amountOfUnexecutedPackage = amountOfUnexecutedPackage;
                }

                if(!isNaN(amountOfExecutedPackage)){
                    dataUpdate.amountOfExecutedPackage = amountOfExecutedPackage;
                }

                if(!isNaN(amountOfCompletedPackage)){
                    dataUpdate.amountOfCompletedPackage = amountOfCompletedPackage;
                }

                if(!isNaN(percentOfCompletedPackage)){
                    dataUpdate.percentOfCompletedPackage = percentOfCompletedPackage;
                }

                if(!isNaN(numberOfContractIn)){
                    dataUpdate.numberOfContractIn = numberOfContractIn;
                }

                if(!isNaN(contractValue)){
                    dataUpdate.contractValue = contractValue;
                }

                if(!isNaN(contractVatValue)){
                    dataUpdate.contractVatValue = contractVatValue;
                }

                if(!isNaN(contractPlus)){
                    dataUpdate.contractPlus = contractPlus;
                }

                if(!isNaN(contractVatPlus)){
                    dataUpdate.contractVatPlus = contractVatPlus;
                }

                if(!isNaN(contractAdvancePayment)){
                    dataUpdate.contractAdvancePayment = contractAdvancePayment;
                }

                if(!isNaN(contractProduce)){
                    dataUpdate.contractProduce = contractProduce;
                }

                if(!isNaN(contractPlusAcceptance)){
                    dataUpdate.contractPlusAcceptance = contractPlusAcceptance;
                }

                if(!isNaN(contractVatAcceptance)){
                    dataUpdate.contractVatAcceptance = contractVatAcceptance;
                }

                if(!isNaN(contractRetainedValue)){
                    dataUpdate.contractRetainedValue = contractRetainedValue;
                }

                if(!isNaN(contractAdvancePaymentDeduction)){
                    dataUpdate.contractAdvancePaymentDeduction = contractAdvancePaymentDeduction;
                }

                if(!isNaN(contractOtherDeduction)){
                    dataUpdate.contractOtherDeduction = contractOtherDeduction;
                }

                if(!isNaN(contractRecommendedPayment)){
                    dataUpdate.contractRecommendedPayment = contractRecommendedPayment;
                }

                if(!isNaN(contractAdvancePaymentPaid)){
                    dataUpdate.contractAdvancePaymentPaid = contractAdvancePaymentPaid;
                }

                if(!isNaN(contractAmountPaid)){
                    dataUpdate.contractAmountPaid = contractAmountPaid;
                }

                if(!isNaN(contractRemainingPayment)){
                    dataUpdate.contractRemainingPayment = contractRemainingPayment;
                }

                if(!isNaN(contractAdvancePaymentOverage)){
                    dataUpdate.contractAdvancePaymentOverage = contractAdvancePaymentOverage;
                }

                if(openTime){
                    dataUpdate.openTime = openTime;
                }

                if(closedTime){
                    dataUpdate.closedTime = closedTime;
                }

                if(!isNaN(numberOfAgent)){
                    dataUpdate.numberOfAgent = numberOfAgent;
                }

                if(!isNaN(numberOfBooking)){
                    dataUpdate.numberOfBooking = numberOfBooking;
                }

                if(!isNaN(totalBookingValue)){
                    dataUpdate.totalBookingValue = totalBookingValue;
                }

                if(!isNaN(numberOfDeposit)){
                    dataUpdate.numberOfDeposit = numberOfDeposit;
                }

                if(!isNaN(totalDepositValue)){
                    dataUpdate.totalDepositValue = totalDepositValue;
                }

                if(!isNaN(numberOfContract)){
                    dataUpdate.numberOfContract = numberOfContract;
                }

                if(!isNaN(totalContractValue)){
                    dataUpdate.totalContractValue = totalContractValue;
                }

                if(!isNaN(receivable)){
                    dataUpdate.receivable = receivable;
                }

                if(!isNaN(estimate)){
                    dataUpdate.estimate = estimate;
                }

                if(lastDateContact){
                    dataUpdate.lastDateContact = lastDateContact;
                }

                if(checkObjectIDs(transactionContacts)){
                    dataUpdate.transactionContacts = transactionContacts;
                }

                if(likelihoodOfSuccess){
                    dataUpdate.likelihoodOfSuccess = likelihoodOfSuccess;
                }

                if(checkObjectIDs(lastChange)){
                    dataUpdate.lastChange = lastChange;
                }

                if(!isNaN(numberOfContact)){
                    dataUpdate.numberOfContact = numberOfContact;
                }

                if(!isNaN(numberOfMoms)){
                    dataUpdate.numberOfMoms = numberOfMoms;
                }

                if(!isNaN(numberOfDrawings)){
                    dataUpdate.numberOfDrawings = numberOfDrawings;
                }

                if(!isNaN(numberOfReports)){
                    dataUpdate.numberOfReports = numberOfReports;
                }

                if(!isNaN(numberOfIpcs)){
                    dataUpdate.numberOfIpcs = numberOfIpcs;
                }

                if(!isNaN(numberOfRfis)){
                    dataUpdate.numberOfRfis = numberOfRfis;
                }

                if(!isNaN(numberOfSubmitals)){
                    dataUpdate.numberOfSubmitals = numberOfSubmitals;
                }

                if(!isNaN(numberOfPunchLists)){
                    dataUpdate.numberOfPunchLists = numberOfPunchLists;
                }

                if(!isNaN(numberOfPhotos)){
                    dataUpdate.numberOfPhotos = numberOfPhotos;
                }

                if(!isNaN(numberOfInspections)){
                    dataUpdate.numberOfInspections = numberOfInspections;
                }

                if(numberOfDocs){
                    dataInc.numberOfDocs = numberOfDocs;
                }

                if(numberFinishOfDocs){
                    dataInc.numberFinishOfDocs = numberFinishOfDocs;
                }

                if(inspectionTasks){
                    dataInc.inspectionTasks = inspectionTasks;
                }

                if(completedInspectionTasks){
                    dataInc.completedInspectionTasks = completedInspectionTasks;
                }

                // Xử lý addToSet, pullAll, inc
                if(dataAddToSet){
                    dataUpdate.$addToSet = dataAddToSet;
                }

                if(dataPull){
                    dataUpdate.$pullAll = dataPull;
                }

                if(dataInc){
                    dataUpdate.$inc = dataInc;
                }

                if(photos && photos.length) {
                    if(infoDepartment.photos?.length >= 10){
						await ITEM__DEPARTMENT_COLL.findByIdAndUpdate(departmentID, {
							$push: {
								photos: {
									$each: photos,
									$position: 0,
									$slice: 10
								}
							}
						});
					} else{
						await ITEM__DEPARTMENT_COLL.findByIdAndUpdate(departmentID, {
							$push: {
								photos: {
									$each: photos,
									$position: 0
								}
							}
						});
					}
                }

                let infoAfterUpdate = await ITEM__DEPARTMENT_COLL.findByIdAndUpdate(departmentID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Update department faild", status: 422 });

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name  : Cập nhật giá trị
     * Author: HiepNH
     * Date  : 22/9/2022
     */
    updateValue({
        projectID, userID, option, ctx
    }){
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Cập nhật giá trị ngân sách
                 * 2-Cập nhật dự báo ngân sách
                 * 3-Cập nhật thực hiện ngân sách
                 */

                if(!checkObjectIDs(projectID))
                    return resolve({ error: true, message: "Mã hiệu không đúng", keyError: "projectID_invalid" });

                let dataUpdate = { userUpdate: userID, modifyAt: Date.now() };

                //1-Cập nhật Sản lượng
                if(option && Number(option) === 1){
                    console.log('1-Cập nhật Sản lượng DỰ ÁN===========>>>>>>>>>>>>')

                    let listData = await ITEM__CONTRACT_COLL.aggregate([
                        {
                            $match: {
                                project: ObjectID(projectID),
                                outin: 2,
                            }
                        }, 
                        {
                            $group: {
                                _id: { },
                                produce: { $sum: "$produce" },
                                vatProduce: { $sum: "$vatProduce" },
                                plusProduce: { $sum: "$plusProduce" },
                                vatPlusProduce: { $sum: "$vatPlusProduce" },
                                remainingProduce: { $sum: "$remainingProduce" },
                            }
                        }, 
                    ])
                    // console.log(listData)

                    if(listData.length){
                        dataUpdate.contractProduce = Number(listData[0].produce);
                        dataUpdate.contractVatProduce = Number(listData[0].vatProduce);
                        dataUpdate.contractPlusProduce = Number(listData[0].plusProduce);
                        dataUpdate.contractVatPlusProduce = Number(listData[0].vatPlusProduce);
                        dataUpdate.contractRemainingProduce = Number(listData[0].remainingProduce);
                    }
                }

                //2-Cập nhật Doanh thu, tiền về
                if(option && Number(option) === 2){
                    console.log('=============2-Cập nhật Doanh thu, tiền về DỰ ÁN===========>>>>>>>>>>>>')

                    let listData = await ITEM__CONTRACT_COLL.aggregate([
                        {
                            $match: {
                                project: ObjectID(projectID),
                                outin: 2,
                            }
                        }, 
                        {
                            $group: {
                                _id: { },
                                value: { $sum: "$value" },
                                vatValue: { $sum: "$vatValue" },
                                plus: { $sum: "$plus" },
                                vatPlus: { $sum: "$vatPlus" },
                                acceptance: { $sum: "$acceptance" },
                                vatAcceptance: { $sum: "$vatAcceptance" },
                                plusAcceptance: { $sum: "$plusAcceptance" },
                                vatPlusAcceptance: { $sum: "$vatPlusAcceptance" },
                                retainedValue: { $sum: "$retainedValue" },
                                advancePaymentDeduction: { $sum: "$advancePaymentDeduction" },
                                otherDeduction: { $sum: "$otherDeduction" },
                                recommendedPayment: { $sum: "$recommendedPayment" },
                                advancePaymentPaid: { $sum: "$advancePaymentPaid" },
                                amountPaid: { $sum: "$amountPaid" },
                                remainingPayment: { $sum: "$remainingPayment" },
                                advancePaymentOverage: { $sum: "$advancePaymentOverage" },
                                finalValue: { $sum: "$finalValue" },
                            }
                        }, 
                    ])
                    // console.log(listData)
                    
                    if(listData.length){
                        dataUpdate.contractValue = Number(listData[0].value);
                        dataUpdate.contractVatValue = Number(listData[0].vatValue);
                        dataUpdate.contractPlus = Number(listData[0].plus);
                        dataUpdate.contractVatPlus = Number(listData[0].vatPlus);
                        dataUpdate.contractAcceptance = Number(listData[0].acceptance);
                        dataUpdate.contractVatAcceptance = Number(listData[0].vatAcceptance);
                        dataUpdate.contractPlusAcceptance = Number(listData[0].plusAcceptance);
                        dataUpdate.contractVatPlusAcceptance = Number(listData[0].vatPlusAcceptance);
                        dataUpdate.contractRetainedValue = Number(listData[0].retainedValue);
                        dataUpdate.contractAdvancePaymentDeduction = Number(listData[0].advancePaymentDeduction);
                        dataUpdate.contractOtherDeduction = Number(listData[0].otherDeduction);
                        dataUpdate.contractRecommendedPayment = Number(listData[0].recommendedPayment);
                        dataUpdate.contractAdvancePaymentPaid = Number(listData[0].advancePaymentPaid);
                        dataUpdate.contractAmountPaid = Number(listData[0].amountPaid);
                        dataUpdate.contractRemainingPayment = Number(listData[0].recommendedPayment) - Number(listData[0].advancePaymentPaid) - Number(listData[0].amountPaid)
                    }
                }

                //3-Cập nhật Chi phí
                // if(option && Number(option) === 3){
                //     console.log('3-Cập nhật Chi phí')
                //     let info = await ctx.call(`${CF_DOMAIN_SERVICES.CMCS}.${CF_ACTIONS_CMCS.CONTRACT_EXPENSE_GET_AMOUNT_BY_OBJECT}`, {
                //         userID, projectID
                //     })
                //     // console.log(info)
                //     if(info){
                //         dataUpdate.expense = Number(info.data.value);
                //     }
                // }

                //4-Cập nhật Ngân sách

                let infoAfterUpdate = await ITEM__DEPARTMENT_COLL.findByIdAndUpdate(projectID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "Cập nhật thất bại", keyError: "can't_update_project", status: 403 });

                // console.log(infoAfterUpdate)

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Xoá dự án/phòng ban KHÔNG CHO PHÉP XÓA CÁC DANH MỤC
     * Author: Depv
     * Code: F00401
     */

    /**
     * Name: Lấy thông tin dự án/phòng ban 
     * Author: Depv
     * Code: F00401
     */
    getInfo({ departmentID,
        select, populates={}}) {
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

                if(!checkObjectIDs(departmentID))
                    return resolve({ error: true, message: 'Request params departmentID invalid', status: 400 });

                /**
                 * LOGIC STEP (3)
                 *  3.1: Convert type + update name (ví dụ: string -> number)
                 *  3.2: Operation database
                 */

                let infoDepartment = await ITEM__DEPARTMENT_COLL
                    .findById(departmentID)
                    .select(select)
                    .populate(populates)
                    .lean()

                if(!infoDepartment)
                    return resolve({ error: true, message: "Can't get department", status: 403 });

                return resolve({ error: false, data: infoDepartment, status: 200 });
            } catch (error) {
                console.error(error);
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name  : Danh sách dự án (Hàm dùng chung)
     * Author: DePV 
     * Code  : F00402
     */
    getList({ companyID, keyword, type, userID, isMember, isBudget, limit = 20, lastestID, select, populates={} }) {
        // console.log('==============Danh mục dự án=>DÙNG CHUNG')
        // console.log({ companyID, keyword, type, userID, isMember, isBudget, limit, lastestID, select, populates })
        return new Promise(async (resolve) => {
            try {
                /**
                 * DECALARTION VARIABLE (1)
                 */
                
                if(!checkObjectIDs(userID))
                    return resolve({ error: true, message: 'Request params userID invalid', status: 400 });

                let conditionObj  = {};
                let sortBy;
                let keys	      = ['modifyAt__-1', '_id__-1'];

                if(limit > 20){
                    limit = 20
                }else{
                    limit = +limit
                }

                if(isMember == 1){
                    conditionObj.members = { $in: [userID] }
                }

                // Lấy các dự án mà có budget > 0
                // if(isBudget && Number(isBudget) > 0){
                //     conditionObj.budget = { $gt: 0 }
                // }

                // Lấy các dự án của companyID
                if(companyID && !checkObjectIDs(companyID))
                    return resolve({ error: true, message: 'Request params companyID invalid', status: 400 });

                companyID && (conditionObj.company = companyID);

                // Phân loại dự án, phòng ban
                if(type){
                    conditionObj.type = +type;
                }

                //_____populate
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

                //_____Tìm kiếm theo từ khóa
                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    const regSearch = new RegExp(keyword, 'i');

                    // conditionObj.name = regSearch
                    conditionObj.$or = [
                        { name: regSearch },
                        { sign: regSearch }
                    ]
                }

                let conditionObjOrg = { ...conditionObj }

				if(lastestID && checkObjectIDs(lastestID)){
					let infoData = await ITEM__DEPARTMENT_COLL.findById(lastestID);
					if(!infoData)
						return resolve({ error: true, message: "Can't get info lastestID", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });

					if(!dataPagingAndSort || dataPagingAndSort.error)
						return resolve({ error: true, message: "Can't get range pagination", status: 400 });
                    conditionObj  = dataPagingAndSort?.data?.find;
					sortBy        = dataPagingAndSort?.data?.sort;
				}else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
					sortBy        = dataPagingAndSort?.data?.sort;
                }

                //_____Bắt đầu query database
                let infoDataAfterGet = await ITEM__DEPARTMENT_COLL
                    .find(conditionObj)
                    .limit(limit+1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get department", status: 403 });

                let totalRecord = await ITEM__DEPARTMENT_COLL.count(conditionObjOrg);
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
     * Name  : Danh sách dự án mà user được quyền truy cập (là member)
     * Author: HiepNH 
     * Code  : 1/9/2022
     */
    getListByMembers({ option, companyID, keyword, type, userID, limit = 20, isBudget, unLimit, lastestID, select, populates={} }) {
        // console.log('==============Danh mục dự án mà user là MEMBER')
        // console.log({ option, companyID, keyword, type, userID, isBudget, limit, select, populates })
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-Với dự án trong phân vùng => được quyền truy cập
                 * 2-Với dự án ngoài phân vùng => phải là dự án trả phí
                 * +++Nếu CĐT không trả phí => Ngắt kết nối Nhà thầu với dự án
                 * +++Nhà thầu nào không trả phí => Ngắt nhà thầu đó ra khỏi dự án (Hệ thống xóa thành viên, giảm số lượng thành viên xuống)
                 */
                if(!checkObjectIDs(userID))
                     return resolve({ error: true, message: 'Request params userID invalid', status: 400 });

                let conditionObj  =  {
                    members: { $in: [userID] }
                }

                let sortBy;
                let keys = ['modifyAt__-1', '_id__-1'];

                if(limit > 20){
                    limit = 20;
                }else{
                    limit = +limit
                }

                // Của công ty tôi
                if(option && option == 1){
                    conditionObj.company = companyID
                }

                // Của đối tác
                if(option && option == 2){
                    conditionObj.company = {$nin: [companyID]}
                }
                
                // Phân loại dự án, phòng ban
                if(type && [1,2].includes(Number(type))){
                    conditionObj.type = +type;
                }

                //_____populate
                if(populates && typeof populates === 'string'){
                    if(!IsJsonString(populates))
                        return resolve({ error: true, message: 'Request params populates invalid', status: 400 });
                    populates = JSON.parse(populates);
                }else{
                    // chưa fix được trường hợp không truyền populate thì lỗi
                    populates = {
                        path: "",
                        select: ""
                    }
                }

                //_____Tìm kiếm theo từ khóa
                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    const regSearch = new RegExp(keyword, 'i');

                    // conditionObj.name = regSearch
                    conditionObj.$or = [
                        { name: regSearch },
                        { sign: regSearch }
                    ]
                }
                // console.log('===========>>>>>>>>>>>>>')
                // console.log(conditionObj)

                /**
                 * Sử dụng UnLimit để lấy mảng toàn bộ các phần tử, sử dụng cho phương thức $in tại các ứng dụng
                 */
                if(unLimit) {
                    const dataUnlimit = await ITEM__DEPARTMENT_COLL
                        .find(conditionObj)
                        .select(select)
                        .lean();

                    return resolve({ error: false, data: dataUnlimit, status: 200 });
                }

                let conditionObjOrg = { ...conditionObj }

                if(lastestID && checkObjectIDs(lastestID)){
                    let infoData = await ITEM__DEPARTMENT_COLL.findById(lastestID);
                    if(!infoData)
                        return resolve({ error: true, message: "Can't get info lastestID", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });

                    if(!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({ error: true, message: "Can't get range pagination", status: 400 });
                    conditionObj  = dataPagingAndSort?.data?.find;
                    sortBy        = dataPagingAndSort?.data?.sort;
                }else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy        = dataPagingAndSort?.data?.sort;
                }

                const infoDataAfterGet = await ITEM__DEPARTMENT_COLL
                    .find(conditionObj)
                    .limit(limit+1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get department", status: 403 });

                let totalRecord = await ITEM__DEPARTMENT_COLL.count(conditionObjOrg);
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

    /**
     * Name  : Thống kê theo tiến độ ngân sách
     * Author: DePV 
     * Code  :
     */
    analysisOntimeOnbudget({ userID }){
        return new Promise(async resolve => {
            let dataBlock1 = await ITEM__DEPARTMENT_COLL.aggregate([
                {
                    $match: {
                        type: 2,
                        members : { $in: [_isValid(userID)] },
                        ontime  : { $exists: true },
                        onbudget: { $exists: true },
                        budget: {$gt: 0}
                    },
                },
                {
                    $group: {
                        _id: {
                            ontime  :  "$ontime",
                            onbudget:  "$onbudget",
                        },
                        amount: { $sum: 1 },
                      }
                },
                {
                    $sort: {
                        "_id.ontime": 1,
                        "_id.onbudget": 1
                    }
                },
            ])

            let dataBlock2 = await ITEM__DEPARTMENT_COLL.aggregate([
                {
                    $match: {
                        type: 2,
                        members : { $in: [_isValid(userID)] },
                        budget: {$gt: 0}
                    },
                },
                {
                    $group: {
                        _id: null,
                        budget: { $sum: "$budget" },
                        vatBudget: { $sum: "$vatBudget" },
                        forecastBudget: { $sum: "$forecastBudget" },
                        vatForecastBudget: { $sum: "$vatForecastBudget" },
                        contractValue: { $sum: "$contractValue"},
                        contractVatValue: { $sum: "$contractVatValue"},
                        contractPlus: { $sum: "$contractPlus"},
                        contractVatPlus: { $sum: "$contractVatPlus"},
                        contractAdvancePaymentPaid: { $sum: "$contractAdvancePaymentPaid" },
                        contractAmountPaid: { $sum: "$contractAmountPaid" },
                    }
                }
            ])

            let dataBlock3 = await ITEM__DEPARTMENT_COLL.aggregate([
                {
                    $match: {
                        members : { $in: [_isValid(userID)] },
                        stage: { $ne: null},
                        type: 2,
                        budget: {$gt: 0}
                    },
                },
                {
                    $group: {
                        _id: {
                            stage: "$stage",
                        },
                        amount: { $sum: 1 },
                    }
                },
                {
                    $sort: {
                        "_id.stage": 1,
                    }
                },
            ])

            return resolve({
                error: false,
                data: {
                    dataBlock1, dataBlock2, dataBlock3
                }
            });
        })
    }
}

exports.MODEL = new Model;