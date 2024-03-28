"use strict";

const BaseModel                         = require('../../../tools/db/base_model');
const { checkObjectIDs, IsJsonString }
                                        = require('../../../tools/utils/utils');
const stringUtils					    = require('../../../tools/utils/string_utils');
const { KEY_ERROR }			            = require('../../../tools/keys');
const ObjectID                          = require('mongoose').Types.ObjectId;

const { RANGE_BASE_PAGINATION_V2 } 	    = require('../../../tools/cursor_base/playground/index');

const XlsxPopulate                      = require('xlsx-populate');
const fs                                = require('fs');
const path                              = require('path');
const { uploadFileS3 }                  = require('../../../tools/s3');

/**s
 * import inter-coll, exter-coll
 */
const ITEM__FUNDA_COLL            		= require('../../item/database/item.funda-coll');
const FNB_PRODUCT_COLL                  = require('../database/fnb.product-coll');
const ITEM__CONTACT_COLL            	= require('../../item/database/item.contact-coll'); 
const FNB_VOUCHER_COLL                  = require('../database/fnb.voucher-coll');

/**
 * import inter-model, exter-model
 */
const { 
    FNB_ACC,
 } = require('../helper/fnb.keys-constant')

class Model extends BaseModel {

    constructor() {
        super(FNB_VOUCHER_COLL);
    }

    /**
     * Name: Insert
     * Author: HiepNH
     * Date: 21/3/2023
     */
    insert({  userID, companyID, template, type, name, note, minOrderAmount, salesoffAmount, salesoffRate, expired, sign }) {
        // console.log({ userID, companyID, template, type, name, note, minOrderAmount, salesoffAmount, salesoffRate, expired, sign })
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs(companyID) || !name || !sign || !expired )
                    return resolve({ error: true, message: 'companyID|name|expired invalid', keyError: KEY_ERROR.PARAMS_INVALID })

                let infoVoucher = await FNB_VOUCHER_COLL.findOne({ company: companyID, sign: sign })
                if(infoVoucher)
                    return resolve({ error: true, message: 'Mã hiệu đã tồn tại' })

                let suid = await stringUtils.randomAndCheckExists(FNB_VOUCHER_COLL, 'suid')

                let dataInsert = { 
                    suid,
                    company: companyID,
                    template, 
                    type,
                    name,
                    sign: sign.replace(/\s/g, ""),
                    expired, 
                    userCreate: userID,
                    members: [userID]
                }

                if(note && note != ""){
                    dataInsert.note = note
                }

                if(!isNaN(minOrderAmount) && Number(minOrderAmount) >= 0){
                    dataInsert.minOrderAmount = Number(minOrderAmount)
                }
                if(!isNaN(salesoffAmount) && Number(salesoffAmount) >= 0){
                    dataInsert.salesoffAmount = Number(salesoffAmount)
                }
                if(!isNaN(salesoffRate) && Number(salesoffRate) >= 0){
                    dataInsert.salesoffRate = Number(salesoffRate)
                }
                if(!isNaN(minOrderAmount) && Number(minOrderAmount) >= 0){
                    dataInsert.minOrderAmount = Number(minOrderAmount)
                }

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({ error: true, message: 'Thêm thất bại', keyError: KEY_ERROR.INSERT_FAILED })       

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        });
    }

    /**
     * Name: Update
     * Author: HiepNH
     * Date: 21/3/2023
     */
    update({ option, companyID, userID, voucherID, template, type, name, note, minOrderAmount, salesoffAmount, salesoffRate, expired, sign, receivers, buyers, membersAdd, membersRemove }) {
        // console.log({ companyID, userID, voucherID, template, type, name, note, minOrderAmount, salesoffAmount, salesoffRate, expired, sign, receivers, buyers, membersAdd, membersRemove })
        return new Promise(async resolve => {
            try {
                if(!checkObjectIDs(voucherID))
                    return resolve({ error: true, message: 'voucherID__invalid', keyError: KEY_ERROR.PARAMS_INVALID });

                    let dataUpdate = { userUpdate: userID, modifyAt: new Date() };
                    let dataAddToset = {};
                    let dataPullAll  = {};

                    let infoCheck = await FNB_VOUCHER_COLL.findById(voucherID).select('_id type')

                    if(name && name != ""){
                        dataUpdate.name = name
                    }

                    if(sign && sign != ""){
                        let infoVoucher = await FNB_VOUCHER_COLL.findOne({ 
                            _id: { $ne: voucherID },
                            company: companyID, 
                            sign: sign.replace(/\s/g, "")
                        })
                        if(infoVoucher)
                            return resolve({ error: true, message: 'Mã hiệu đã tồn tại' })

                        dataUpdate.sign = sign.replace(/\s/g, "")
                    }

                    if(note && note != ""){
                        dataUpdate.note = note
                    }
    
                    if(expired && expired != ""){
                        dataUpdate.expired = expired
                    }

                    if(!isNaN(template) && Number(template) > 0){
                        dataUpdate.template = Number(template)
                    }

                    if(!isNaN(type) && Number(type) > 0){
                        dataUpdate.type = Number(type)
                    }
    
                    if(!isNaN(minOrderAmount) && Number(minOrderAmount) >= 0){
                        dataUpdate.minOrderAmount = Number(minOrderAmount)
                    }
                    if(!isNaN(salesoffAmount) && Number(salesoffAmount) >= 0){
                        dataUpdate.salesoffAmount = Number(salesoffAmount)
                    }
                    if(!isNaN(salesoffRate) && Number(salesoffRate) >= 0){
                        dataUpdate.salesoffRate = Number(salesoffRate)
                    }
                    if(!isNaN(minOrderAmount) && Number(minOrderAmount) >= 0){
                        dataUpdate.minOrderAmount = Number(minOrderAmount)
                    }

                    /**
                     * QUẢN LÝ KHÁCH HÀNG
                     */
                    //_________Thêm người nhận voucher
                    if(checkObjectIDs(receivers)){
                        // console.log('=========1111111111111111111')
                        if(option && option == 1){
                            // console.log('=========222222222222222222')
                            // Không cho phép Import excel với Voucher tặng người giới thiệu hoặc khách mới
                            if(Number(infoCheck.type) != 2 && Number(infoCheck.type) != 3){
                                dataAddToset = {
                                    ...dataAddToset,
                                    receivers
                                }
                            }
                        }else{
                            // console.log('=========333333333333333')
                            dataAddToset = {
                                ...dataAddToset,
                                receivers
                            }
                        }
                    }

                    //_________Người đã sử dụng voucher
                    if(checkObjectIDs(buyers)){
                        dataAddToset = {
                            ...dataAddToset,
                            buyers
                        }
                    }

                    //_________Thành viên truy cập
                    if(checkObjectIDs(membersAdd)){
                        dataAddToset = {
                            ...dataAddToset,
                            members: membersAdd
                        }
                    }

                    //_________Xoá thành viên
                    if(checkObjectIDs(membersRemove)){
                        dataPullAll = {
                            ...dataPullAll,
                            members: membersRemove
                        }
                    }

                    /**
                     * Cập nhật nhiều dữ liệu addToSet cùng 1 lúc
                     */
                    if(dataAddToset){
                        dataUpdate.$addToSet = dataAddToset;
                    }
                    // console.log(dataUpdate)

                    /**
                     * Xóa nhiều dữ liệu cùng 1 lúc
                     */
                    if(dataPullAll){
                        dataUpdate.$pullAll = dataPullAll;
                    }

                    let infoAfterUpdate = await FNB_VOUCHER_COLL.findByIdAndUpdate(voucherID, dataUpdate, { new: true });
                    if (!infoAfterUpdate)
                        return resolve({ error: true, message: 'Cập nhật thất bại', keyError: KEY_ERROR.UPDATE_FAILED });

                    if(dataAddToset){
                        /**
                         * KIỂM TRA ĐỂ ĐẢM BẢO
                         * 1-Khách hàng chỉ đc nhận và sử dụng VoucherID 1 lần
                         */

                        // Cập nhật vào Người nhận
                        if(checkObjectIDs(receivers)){
                            // Cấp phát voucher
                            await ITEM__CONTACT_COLL.updateMany(
                                {_id: { $in: receivers }},
                                { $addToSet:
                                    { getVouchers: voucherID },
                                },
                            )

                            // Đánh dấu phân loại chiến dịch
                            await ITEM__CONTACT_COLL.updateMany(
                                { _id: { $in: receivers }, campaignType: {$exists: false}},
                                { 
                                    $set: {campaignType: voucherID}
                                },
                            )
                        }

                        // Cập nhật vào Người sử dụng
                        if(checkObjectIDs(buyers)){
                            await ITEM__CONTACT_COLL.updateMany(
                                {_id: { $in: buyers }},
                                { $addToSet:
                                    { usedVouchers: voucherID },
                                },
                            )
                        }
                    }

                    return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        });
    }

    /**
     * Name: Get
     * Author: HiepNH
     * Date: 21/3/2023
     */
    getInfo({ companyID, voucherID, sign, select, populates={} }) {
        // console.log({ companyID, voucherID, sign, select })
        // console.log({ sign: sign.replace(/\s/g, "") })
        return new Promise(async resolve => {
            try {
                if(voucherID){
                    if(!checkObjectIDs(voucherID))
                        return resolve({ error: true, message: 'param_invalid' });

                    // populate
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

                    let info = await FNB_VOUCHER_COLL.findById(voucherID)
                                        .select(select)
                                        .populate(populates)
                    if (!info) return resolve({ error: true, message: 'cannot_get', keyError: KEY_ERROR.GET_INFO_FAILED })

                    return resolve({ error: false, data: info })
                }else{
                    // populate
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

                    let info = await FNB_VOUCHER_COLL.findOne({ company: companyID, sign: sign.replace(/\s/g, "") })
                                        .select(select)
                                        .populate(populates)
                    if (!info) return resolve({ error: true, message: 'cannot_get', keyError: KEY_ERROR.GET_INFO_FAILED })
                    return resolve({ error: false, data: info })
                }
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        });
    }

    /**
     * Name: Get
     * Author: HiepNH
     * Date: 21/3/2023
     */
    getList({ companyID, userID, customerID, template, type, keyword, limit=50, lastestID, select, populates, isMember }) {
        // console.log({ companyID, userID, customerID, template, type, keyword, limit, lastestID, select, populates })
        return new Promise(async (resolve) => {
            try {
                if(Number(limit) > 50){
                    limit = 50;
                } else{
                    limit = +Number(limit);
                }

                let conditionObj = { }
                let sortBy;
                let keys	 = ['salesoffAmount__-1', 'createAt__-1'];
                // let keys	 = ['createAt__-1', '_id__-1'];

                if(customerID && checkObjectIDs(customerID)){

                    // Danh sách các voucher của customerID chưa sử dụng và Còn thời hạn
                    conditionObj.expired = {
                        $gt: new Date()
                    }
                    conditionObj.receivers = { $in: [customerID]}
                    conditionObj.buyers = { $nin: [customerID]}
                }else{
                    conditionObj.company = ObjectID(companyID)
                }

                if(type && !isNaN(type)){
                    conditionObj.type = Number(type)
                }

                if(template && !isNaN(template)){
                    conditionObj.template = Number(template)
                }

                if(isMember && isMember == 1){
                    conditionObj.members = { $in: [userID] }
                }
                // console.log(conditionObj)

                /**
                 * ĐIỀU KIỆN KHÁC
                 */
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

                if(keyword){
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    let regExpSearch = RegExp(keyword, 'i');
                    // conditionObj.name = regExpSearch;
                    conditionObj.$or = [
                        { name: regExpSearch },
                        { sign: regExpSearch },
                    ]
                }

                if(select && typeof select === 'string'){
                    if(!IsJsonString(select))
                        return resolve({ error: true, message: 'Request params select invalid', status: 400 });

                    select = JSON.parse(select);
                }

                // console.log(populates)
                // console.log(conditionObj)

                let conditionObjOrg = { ...conditionObj };
                if(lastestID && checkObjectIDs(lastestID)){
                    let infoData = await FNB_VOUCHER_COLL.findById(lastestID);
                    if(!infoData)
                        return resolve({ error: true, message: "Can't get info last message", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
                    if(!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({ error: true, message: "Can't get range pagination", status: 400 });
                    conditionObj  = dataPagingAndSort.data.find;
                    sortBy        = dataPagingAndSort.data.sort;
                }else{
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy                = dataPagingAndSort.data.sort;
                }

                let infoDataAfterGet = await FNB_VOUCHER_COLL.find(conditionObj)
                    .limit(limit+1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                if(!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data", status: 403 });

                let nextCursor	= null;
                if(infoDataAfterGet && infoDataAfterGet.length){
                    if(infoDataAfterGet.length > limit){
                        nextCursor = infoDataAfterGet[limit - 1]?._id;
                        infoDataAfterGet.length = limit;
                    }
                }
                let totalRecord = await FNB_VOUCHER_COLL.count(conditionObjOrg);
                let totalPage   = Math.ceil(totalRecord/limit);

                return resolve({ error: false, data: {
                    listRecords: infoDataAfterGet,
                    limit: limit,
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
     * Name: Download Template Excel
     * Author: HiepNH
     * Date: 21/3/2023
     */
    downloadTemplateExcel({ option, companyID, userID }) {
        // console.log({ option, companyID, userID })
        return new Promise(async resolve => {
            try {
                /**
                 * TẢI DANH SÁCH KHÁCH HÀNG
                 */
                if(!option){
                    // Danh sách danh bạ
                    let listData  = await ITEM__CONTACT_COLL.find({ company: companyID }).select('name phone address note')
                    .sort({_id: -1})
                    .limit(200)
                    // console.log(listData)

                    // Modify the workbook.
                    XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/fnb_voucher_template_import.xlsx')))
                    .then(async workbook => {

                        var i = 3;
                        listData?.forEach((item, index) => {
                            workbook.sheet("ExportContact").row(i).cell(1).value(Number(index+1));
                            workbook.sheet("ExportContact").row(i).cell(2).value(item.name);
                            workbook.sheet("ExportContact").row(i).cell(3).value(item.phone);
                            workbook.sheet("ExportContact").row(i).cell(4).value(item.note);
                            workbook.sheet("ExportContact").row(i).cell(5).value(`${item._id}`);
                            workbook.sheet("ExportContact").row(i).cell(6).value(`https://app.winggo.vn/mobile/activity/${item._id}/w6g9o22`).hyperlink(`https://app.winggo.vn/mobile/activity/${item._id}/w6g9o22`)

                            i++
                        });

                        const now = new Date();
                        const filePath = '../../../files/temporary_uploads/';
                        const fileName = `template_import_contact_voucher_${now.getTime()}.xlsx`;
                        const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                        await workbook.toFileAsync(pathWriteFile);
                        const result = await uploadFileS3(pathWriteFile, fileName);

                        fs.unlinkSync(pathWriteFile);
                        // console.log({ result })
                        return resolve({ error: false, data: result?.Location, status: 200 });
                    });
                }else{
                    /**
                     * TẢI DANH SÁCH NHÂN VIÊN
                     */
                    if(option == 1){
                        // Danh sách danh bạ
                        let listData  = await ITEM__CONTACT_COLL.find({ company: companyID, type: 1 })
                        .select('name funda phone address note')
                        .populate({
                            path: 'funda',
                            select: 'name'
                        })
                        .sort({_id: -1})
                        .limit(600)
                        // console.log(listData)

                        // Modify the workbook.
                        XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/fnb_voucher_template_import.xlsx')))
                        .then(async workbook => {

                            var i = 3;
                            listData?.forEach((item, index) => {
                                workbook.sheet("ExportContact").row(i).cell(1).value(Number(index+1))
                                workbook.sheet("ExportContact").row(i).cell(2).value(item.name)
                                workbook.sheet("ExportContact").row(i).cell(3).value(item.phone)
                                workbook.sheet("ExportContact").row(i).cell(4).value(item.note)
                                workbook.sheet("ExportContact").row(i).cell(5).value(`${item._id}`)
                                workbook.sheet("ExportContact").row(i).cell(6).value(`https://app.winggo.vn/mobile/activity/${item._id}/w6g9o22`).hyperlink(`https://app.winggo.vn/mobile/activity/${item._id}/w6g9o22`)
                                workbook.sheet("ExportContact").row(i).cell(7).value(`${item?.funda.name}`)

                                i++
                            });

                            const now = new Date();
                            const filePath = '../../../files/temporary_uploads/';
                            const fileName = `template_import_contact_${now.getTime()}.xlsx`;
                            const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                            await workbook.toFileAsync(pathWriteFile);
                            const result = await uploadFileS3(pathWriteFile, fileName);

                            fs.unlinkSync(pathWriteFile);
                            return resolve({ error: false, data: result?.Location, status: 200 });
                        });
                    }

                    /**
                     * TẢI KHÁCH HÀNG ĐÃ BẤM QUAN TÂM ZALO OA
                     */
                    if(option == 2){
                        // Danh sách danh bạ
                        let listData  = await ITEM__CONTACT_COLL.find({ company: companyID, getVouchers: {$in: [ObjectID("64378d6618c77f00128abe93")]} })
                        .select('type name funda phone address note usedVouchers')
                        .populate({
                            path: 'funda',
                            select: 'name'
                        })
                        .sort({_id: -1})
                        // .limit(600)
                        // console.log(listData)

                        // Modify the workbook.
                        XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/fnb_export_oa_contact.xlsx')))
                        .then(async workbook => {

                            var i = 3;
                            listData?.forEach((item, index) => {
                                workbook.sheet("Data").row(i).cell(1).value(Number(index+1))
                                workbook.sheet("Data").row(i).cell(2).value(item.name)
                                workbook.sheet("Data").row(i).cell(3).value(item.phone)
                                workbook.sheet("Data").row(i).cell(4).value(item.note)
                                workbook.sheet("Data").row(i).cell(5).value(`${item._id}`)
                                workbook.sheet("Data").row(i).cell(6).value(`https://app.winggo.vn/mobile/activity/${item._id}/w6g9o22`).hyperlink(`https://app.winggo.vn/mobile/activity/${item._id}/w6g9o22`)
                                workbook.sheet("Data").row(i).cell(7).value(`${item?.funda.name}`)
                                if(item?.usedVouchers.includes(ObjectID("64378d6618c77f00128abe93"))){
                                    workbook.sheet("Data").row(i).cell(8).value(1)
                                }else{
                                    workbook.sheet("Data").row(i).cell(8).value(0)
                                }
                                workbook.sheet("Data").row(i).cell(9).value(Number(item.type))

                                i++
                            });

                            const now = new Date();
                            const filePath = '../../../files/temporary_uploads/';
                            const fileName = `oa_contact_${now.getTime()}.xlsx`;
                            const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                            await workbook.toFileAsync(pathWriteFile);
                            const result = await uploadFileS3(pathWriteFile, fileName);

                            fs.unlinkSync(pathWriteFile);
                            return resolve({ error: false, data: result?.Location, status: 200 });
                        });
                    }
                    
                    /**
                     * TẢI KHÁCH HÀNG ĐÃ BẤM QUAN TÂM ZALO OA VÀ CÓ NGÀY SINH NHẬT
                     */
                    if(option == 3){
                        // Danh sách danh bạ
                        let listData  = await ITEM__CONTACT_COLL.find({ company: companyID, getVouchers: {$in: [ObjectID("64378d6618c77f00128abe93")]}, birthday: {$exists: true, $ne: null} })
                        .select('type name funda phone address note usedVouchers birthday')
                        .populate({
                            path: 'funda',
                            select: 'name'
                        })
                        .sort({_id: -1})
                        // .limit(600)
                        // console.log(listData)

                        // Modify the workbook.
                        XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/fnb_export_oa_contact.xlsx')))
                        .then(async workbook => {

                            var i = 3;
                            listData?.forEach((item, index) => {
                                workbook.sheet("Data").row(i).cell(1).value(Number(index+1))
                                workbook.sheet("Data").row(i).cell(2).value(item.name)
                                workbook.sheet("Data").row(i).cell(3).value(item.phone)
                                workbook.sheet("Data").row(i).cell(4).value(item.note)
                                workbook.sheet("Data").row(i).cell(5).value(`${item._id}`)
                                workbook.sheet("Data").row(i).cell(6).value(`https://app.winggo.vn/mobile/activity/${item._id}/w6g9o22`).hyperlink(`https://app.winggo.vn/mobile/activity/${item._id}/w6g9o22`)
                                workbook.sheet("Data").row(i).cell(7).value(`${item?.funda.name}`)
                                if(item?.usedVouchers.includes(ObjectID("64378d6618c77f00128abe93"))){
                                    workbook.sheet("Data").row(i).cell(8).value(1)
                                }else{
                                    workbook.sheet("Data").row(i).cell(8).value(0)
                                }
                                workbook.sheet("Data").row(i).cell(9).value(Number(item.type))
                                workbook.sheet("Data").row(i).cell(10).value(item.birthday)

                                i++
                            });

                            const now = new Date();
                            const filePath = '../../../files/temporary_uploads/';
                            const fileName = `oa_contact_${now.getTime()}.xlsx`;
                            const pathWriteFile = path.resolve(__dirname, filePath, fileName);

                            await workbook.toFileAsync(pathWriteFile);
                            const result = await uploadFileS3(pathWriteFile, fileName);

                            fs.unlinkSync(pathWriteFile);
                            return resolve({ error: false, data: result?.Location, status: 200 });
                        });
                    }
                }

            } catch (error) {
                console.log({ error })
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Download Template Excel
     * Author: HiepNH
     * Date: 21/3/2023
     */
    importFromExcel({ companyID, dataImport, userID, email }) {
        const that = this
        return new Promise(async resolve => {
            try {
                if(FNB_ACC.bod.includes(email.toString()) || FNB_ACC.cskh.includes(email.toString()) ){
                    // console.log('=============Có quyền===================')
                    const dataImportJSON = JSON.parse(dataImport);
                    // console.log('=============Log data===================');
                    // console.log({ dataImportJSON });
                    let index = 0;

                    let option = Number(dataImportJSON[0].__EMPTY_9)
                    // console.log({ option })

                    if(option == 1){
                        for (const item of dataImportJSON) {
                            // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
                            if(index > 0){
                                let dataInsert = {
                                    companyID,
                                    userID,
                                    type: item?.__EMPTY,
                                    name: item?.__EMPTY_1,
                                    sign: item?.__EMPTY_2,
                                    expired: item?.__EMPTY_8,
                                    minOrderAmount: item?.__EMPTY_4,
                                    salesoffAmount: item?.__EMPTY_5,
                                    salesoffRate: item?.__EMPTY_6,
                                    note: item?.__EMPTY_7,
                                }
                                // console.log(dataInsert)

                                let info = await that.insert(dataInsert)
                            //    console.log(info)
                            }
        
                            index ++;
                        }

                        return resolve({ error: false, message: "Import successfull" })
                    }

                    // Cấp phát Voucher
                    if(option == 2){
                        let receivers = []
                        let voucherID = dataImportJSON[0].__EMPTY_3

                        for (const item of dataImportJSON) {
                            // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
                            if(index > 0){
                                // console.log(item)
                                receivers.push(item?.__EMPTY_3)
                            }
        
                            index ++;
                        }
                        // console.log({voucherID})
                        // console.log(receivers)
        
                        await this.update({ userID, voucherID, receivers, option: 1 })
        
                        return resolve({ error: false, message: "Import successfull" })
                    }
                    
                    // Tạo danh bạ
                    if(option == 3){
                        for (const item of dataImportJSON) {
                            // Chỉ lấy dữ liệu từ mẩu tin thứ 2 trở đi
                            if(index > 0){
                                let dataInsert = {
                                    authorID: userID,
                                    fundaID: item?.__EMPTY,
                                    phone: item?.__EMPTY_1,
                                    name: item?.__EMPTY_2,
                                    gender: item?.__EMPTY_3,
                                    note: item?.__EMPTY_4,
                                    address: item?.__EMPTY_5,
                                    taxid: item?.__EMPTY_6,
                                }
                                // console.log(dataInsert)

                                let info = await ITEM__CONTACT_MODEL.insert(dataInsert)
                                // console.log(info)
                            }
        
                            index ++;
                        }

                        return resolve({ error: false, message: "Import successfull" })
                    }
                }else{
                    // console.log('=============Không có quyền===================')
                    return resolve({ error: true, message: 'Bạn không có quyền', status: 500 })
                }
            } catch (error) {
                // console.log({ error })
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Download Template Excel
     * Author: HiepNH
     * Date: 21/3/2023
     */
    // exportExcel({ companyID, userID }) {
    //     // console.log({ companyID, userID })
    //     return new Promise(async resolve => {
    //         try {
    //             let listData  = await FNB_ORDER_COLL.find({ company: companyID })
    //             .populate({
    //                 path: "funda",
    //                 select: "name sign",
    //             })
    //             .populate({
    //                 path: "shift",
    //                 select: "name sign",
    //             })
    //             .limit(1000)
    //             .sort({createAt: -1})
    //             // console.log(listData)

    //             // Modify the workbook.
    //             XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/fnb_shift_export.xlsx')))
    //             .then(async workbook => {

    //                 var i = 3;
    //                 listData?.forEach((item, index) => {
    //                     workbook.sheet("Order").row(i).cell(1).value(Number(index+1));
    //                     workbook.sheet("Order").row(i).cell(2).value(item?.funda?.name);
    //                     workbook.sheet("Order").row(i).cell(3).value(item.createAt);
    //                     workbook.sheet("Order").row(i).cell(4).value(item?.shift?.name);
    //                     workbook.sheet("Order").row(i).cell(5).value(`${FNB_SHIFT_TYPES[Number(item.shiftType)-1].text}`);
    //                     workbook.sheet("Order").row(i).cell(6).value(item.name);
    //                     workbook.sheet("Order").row(i).cell(7).value(item.sign);
    //                     workbook.sheet("Order").row(i).cell(8).value(`${FNB_SALES_CHANNEL[Number(item.salesChannel)-1].text}`);
    //                     workbook.sheet("Order").row(i).cell(9).value(item?.appOrderSign);
    //                     workbook.sheet("Order").row(i).cell(10).value(`${FNB_PAYMENT_METHOD[Number(item.paymentMethod)-1].text}`);
    //                     workbook.sheet("Order").row(i).cell(11).value(`${FNB_STATUS[Number(item.status)-1].text}`);
    //                     workbook.sheet("Order").row(i).cell(12).value(Number(item.total));
    //                     workbook.sheet("Order").row(i).cell(13).value(Number(item.discount));
    //                     workbook.sheet("Order").row(i).cell(14).value(Number(item.salesoff));
    //                     workbook.sheet("Order").row(i).cell(15).value(Number(item.amount));
    //                     workbook.sheet("Order").row(i).cell(16).value(Number(item.numberOfSizeM));
    //                     workbook.sheet("Order").row(i).cell(17).value(Number(item.numberOfSizeL));
    //                     workbook.sheet("Order").row(i).cell(18).value(Number(item.numberOfProducts));
    //                     workbook.sheet("Order").row(i).cell(19).value(Number(item.numberOfMistakes));
    //                     workbook.sheet("Order").row(i).cell(20).value(item.note);
    //                     i++
    //                 });

    //                 const now = new Date();
    //                 const filePath = '../../../files/temporary_uploads/';
    //                 const fileName = `fnb_shift_export_${now.getTime()}.xlsx`;
    //                 const pathWriteFile = path.resolve(__dirname, filePath, fileName);

    //                 await workbook.toFileAsync(pathWriteFile);
    //                 const result = await uploadFileS3(pathWriteFile, fileName);

    //                 fs.unlinkSync(pathWriteFile);
    //                 // console.log({ result })
    //                 return resolve({ error: false, data: result?.Location, status: 200 });
    //             });

    //         } catch (error) {
    //             console.log({ error })
    //             return resolve({ error: true, message: error.message, status: 500 });
    //         }
    //     })
    // }
}

exports.MODEL = new Model

// Import tại đây để không bị lỗi triệu gọi CHÉO
const ITEM__CONTACT_MODEL                       = require('../../item/model/item.contact-model').MODEL;