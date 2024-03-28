"use strict";

/**
 * EXTERNAL PACKAGE
 */
const ObjectID                          = require('mongoose').Types.ObjectId;
const moment                            = require('moment')
const fs                                = require('fs');
const path                              = require('path');

/**
 * CONSTANTS
 */
const { VOUCHER_TYPES }                 = require('../config/accounting.financial_config')
const { CF_DOMAIN_SERVICES } 	        = require('../../gateway/helper/domain.constant');
const { CF_ACTIONS_ANALYSIS }           = require('../../analysis/helper/analysis.actions-constant');

/**
 * TOOLS
 */
const BaseModel                             = require('../../../tools/db/base_model')
const { checkObjectIDs, _isValid, IsJsonString }      = require('../../../tools/utils/utils')
const { RANGE_BASE_PAGINATION_V2 }          = require('../../../tools/cursor_base/playground/index')
const { KEY_ERROR }                         = require('../../../tools/keys/index')
const stringUtils					        = require('../../../tools/utils/string_utils')

/**
 * COLLECTIONS
 */
const ITEM__ACCOUNT_COLL                            = require('../../item/database/item.account-coll')
const ITEM__DOCTYPE_COLL                            = require('../../item/database/item.doctype-coll')
const ITEM_FUNDA_COLL                               = require('../../item/database/item.funda-coll')
const CONTRACT_COLL                                 = require('../../item/database/item.contract-coll')
const ACCOUNTING__FINANCIAL_VOUCHER_COLL            = require('../database/accounting.financial_voucher-coll')
const ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_COLL    = require('../database/accounting.financial_general_journal-coll')

/**
 * MODELS
 */
const ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_MODEL   = require('./accounting.financial_general_journal-model').MODEL;
const ITEM__ACCOUNT_MODEL                           = require('../../item/model/item.account-model').MODEL;

let dataTF = {
    appID: "61e049aefdebf77b072d1b12", // ACCOUNTING
    menuID: "623f1f49e998e94feda0cd74", //
    type: 1, 
    action: 1, // Xem
}
let dataTF2 = {
    appID: "61e049aefdebf77b072d1b12", // ACCOUNTING
    menuID: "623f1f49e998e94feda0cd74", //
    type: 1,
    action: 2, // Thêm
}

class Model extends BaseModel {
    constructor() {
        super(ACCOUNTING__FINANCIAL_VOUCHER_COLL);
    }

    /**
     * Name: Insert 
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    insert({ 
        authorID, 
        fundaID, 
        customerID,
        contractID, 
        storageID, 
        subtypeID,
        warehouseID,
        linkFundaID,
        linkVoucherID,
        type, date, name, sign, signInvoice, dateInvoice, vat, source, orderNew, pricePolicy,
        receiver, note,
        forward, forwardIs, returning, advancePayment, cancel, 
        fcuExRate, 
        selectedJournals,
        ctx
     }) {
        // console.log({ 
        //     authorID, 
        //     fundaID, 
        //     customerID,
        //     contractID, 
        //     storageID, 
        //     subtypeID,
        //     warehouseID,
        //     linkFundaID,
        //     linkVoucherID,
        //     type, date, name, sign, signInvoice, dateInvoice, vat, source, orderNew, pricePolicy,
        //     receiver, note,
        //     forward, forwardIs, returning, advancePayment, cancel, 
        //     fcuExRate, 
        //     selectedJournals
        //  })
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA-Author: HiepNH - 23/4/2022
                 * 1. Khi thêm phiếu có gán budgetWorkID => Cập nhật Ngân sách thực hiện cho work, group, item, budget
                 * 2. Khi sửa bút toán budgetWorkID => Cập nhật Ngân sách thực hiện cho work, group, item, budget của:
                 * +++budgetWorkID cũ
                 * +++budgetWorkID mới
                */
                //_________Kiểm tra dữ liệu đầu vào
                if(!date || !name || Number.isNaN(Number(type)) || !checkObjectIDs(fundaID) || !checkObjectIDs(customerID))
                    return resolve({ error: true, message: 'date|name|type|fundaID|customerID invalid', keyError: KEY_ERROR.PARAMS_INVALID, status: 400 })

                //_________Tự động lấy số hiệu phiếu
                let number = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.count({ funda: fundaID, type: type })
                let infoFunda = await ITEM_FUNDA_COLL.findById(fundaID)
                if(!infoFunda)
                    return resolve({ error: true, message: 'fundaID invalid', keyError: KEY_ERROR.PARAMS_INVALID, status: 400 })

                let companyID = infoFunda.company

                let voucherSign = `${infoFunda.sign}.${VOUCHER_TYPES[Number(type)-1].sign}${Number(number+1)}`

                /**
                 * B1. TẠO PHIẾU
                 */
                 const dataInsertVoucher = {
                    userCreate: authorID, 
                    company: companyID, 
                    funda: fundaID, 
                    customer: customerID,
                    type, date, name, 
                    sign: voucherSign, 
                    signInvoice, 
                    dateInvoice, vat, type, source, orderNew, pricePolicy,
                    receiver, note,
                    forward, forwardIs, returning, advancePayment, cancel, 
                    fcuExRate
                }

                let convertStr = ''
                if(name && name != ""){
                    convertStr = stringUtils.removeAccents(name)
                }
                if(voucherSign && voucherSign != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(voucherSign)
                }
                if(signInvoice && signInvoice != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(signInvoice)
                }
                if(receiver && receiver != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(receiver)
                }
                if(note && note != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(note)
                }
                dataInsertVoucher.namecv = convertStr

                if (contractID && checkObjectIDs(contractID)) {
                    dataInsertVoucher.contract = contractID;
                }

                // Khoản mục phí
                let parentSubtypeID
                if (subtypeID && checkObjectIDs(subtypeID)) {
                    dataInsertVoucher.subtype = subtypeID;

                    let infoSubtype = await ITEM__DOCTYPE_COLL.findById(subtypeID).select('parent')
                    if(infoSubtype.parent && _isValid(infoSubtype.parent)){
                        parentSubtypeID = infoSubtype.parent
                    }else{
                        parentSubtypeID = subtypeID
                    }

                    dataInsertVoucher.parentSubtype = parentSubtypeID;
                }

                if (warehouseID && checkObjectIDs(warehouseID)) {
                    dataInsertVoucher.warehouse = warehouseID;
                }

                if (storageID && checkObjectIDs(storageID)) {
                    dataInsertVoucher.storage = storageID;
                }

                if (linkFundaID && checkObjectIDs(linkFundaID)) {
                    dataInsertVoucher.linkFunda = linkFundaID;
                }

                if (linkVoucherID && checkObjectIDs(linkVoucherID)) {
                    dataInsertVoucher.linkVoucher = linkVoucherID;
                }
                // console.log(dataInsertVoucher)

                const infoAfterInsert = await this.insertData(dataInsertVoucher)
                if (!infoAfterInsert)
                    return resolve({ error: true, message: "Thêm phiếu thất bại", keyError: KEY_ERROR.INSERT_FAILED, status: 403 })

                /**
                 * B2. CẬP NHẬT BÚT TOÁN VÀO PHIẾU
                 */
                if(selectedJournals && selectedJournals.length >0){

                    //_________Get voucherID
                    const voucherID = infoAfterInsert._id;           

                    var i = 0
                    for (const subitem of selectedJournals) {
                        // console.log(subitem)

                        const dataInsert = {
                            authorID, 
                            companyID, 
                            fundaID, 
                            voucherID, 
                            date, forward, forwardIs, returning, advancePayment, cancel, vat, type, source, orderNew, pricePolicy,
                            updown: (!isNaN(subitem.updown) && [1,-1].includes(Number(subitem.updown))) ? Number(subitem.updown) : 1,
                            quantity: subitem.quantity ? Number(subitem.quantity) : 0,
                            amount: subitem.amount ? Number(subitem.amount) : 0,
                            unitprice: subitem.quantity != 0 ? Number(Number(subitem.amount/subitem.quantity)) : 0,
                            fcuExRate,
                            fcuAmount: fcuExRate != 0 ? Number(subitem.amount/fcuExRate) : 0,
                            note: subitem.note,
                            ctx
                        }

                        /**
                         * Kiểm tra xem có tài khoản nợ/có không
                         * Nếu không thì lấy giá trị null
                         */
                        if(subitem.debit && _isValid(subitem.debit)){
                            dataInsert.debit = subitem.debit
                        }else{
                            dataInsert.debit = null
                        }

                        if(subitem.credit && _isValid(subitem.credit)){
                            dataInsert.credit = subitem.credit
                        }else{
                            dataInsert.credit = null
                        }

                        /**
                         * Kiểm tra nếu có chi tiết mã khách nợ/có thì lấy theo chi tiết
                         * Nếu không  có thì lấy theo mã khách trên phiếu
                         */
                        if(subitem.customerDebit && _isValid(subitem.customerDebit)){
                            dataInsert.customerDebit = subitem.customerDebit
                        }else{
                            dataInsert.customerDebit = customerID
                        }

                        if(subitem.customerCredit && _isValid(subitem.customerCredit)){
                            dataInsert.customerCredit = subitem.customerCredit
                        }else{
                            dataInsert.customerCredit = customerID
                        }

                        /**
                         * Kiểm tra xem có hàng hóa/kho hay không
                         * Nếu không  có thì lấy theo mã khách trên phiếu
                         * Chỉ insert khi có cả thông tin goods và warehouse
                         */
                        if(subitem.goods && _isValid(subitem.goods)){
                            if(subitem.warehouse && _isValid(subitem.warehouse)){
                                dataInsert.goods = subitem.goods
                                dataInsert.warehouse = subitem.warehouse
                            }else{
                                if(warehouseID && _isValid(warehouseID)){
                                    dataInsert.goods = subitem.goods
                                    dataInsert.warehouse = warehouseID
                                }
                            }
                        }

                        /**
                         * Kiểm tra xem có Hợp đồng hay không
                         * Nếu không  có thì lấy theo hợp đồng trên phiếu
                         */
                        if(subitem.contract && _isValid(subitem.contract)){
                            dataInsert.contract = subitem.contract
                        }else{
                            if(contractID && _isValid(contractID)){
                                dataInsert.contract = contractID;
                            }
                        }

                        /**
                         * Khoản mục phí
                         */
                        if (subitem.subtype && checkObjectIDs(subitem.subtype)) {

                            let infoSubtype = await ITEM__DOCTYPE_COLL.findById(subitem.subtype).select('parent')
                            if(infoSubtype.parent && _isValid(infoSubtype.parent)){
                                parentSubtypeID = infoSubtype.parent
                            }else{
                                parentSubtypeID = subtypeID
                            }
                            
                            dataInsert.subtype = subitem.subtype;
                            dataInsert.parentSubtype = parentSubtypeID;
                        }else{
                            if(subtypeID && _isValid(subtypeID)){
                                dataInsert.subtype = subtypeID;
                                dataInsert.parentSubtype = parentSubtypeID;
                            }
                        }

                        /**
                         * Cập nhật ngân sách thực hiện
                         */
                        if(subitem.budgetWork && _isValid(subitem.budgetWork)){
                            dataInsert.budgetWork = subitem.budgetWork
                        }
                        
                        //_________Tiến hành tạo chi tiết_________//
                        let infoJournal = await ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_MODEL.insert(dataInsert)

                        i++
                        // console.log({__________i:i})
                    }

                    //_________Cập nhật giá trị phiếu
                    if(Number(i) == Number(selectedJournals.length)){
                        // console.log('=================')
                        // console.log({__________i:i})
                        await that.updateValue({ voucherID })
                    }
                }

                /**
                 * B3. PHIẾU XUẤT NỘI BỘ
                 */
                if(type == 5 && linkFundaID && checkObjectIDs(linkFundaID)){
                    await this.convertVoucher({companyID, docID: infoAfterInsert._id, userID: authorID, ctx})
                }

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF2)

                return resolve({ error: false, data: infoAfterInsert, status: 200 })
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 })
            }
        })
    }

    /**
     * Name: Update 
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    update({ 
        authorID, 
        voucherID,
        customerID,
        fundaID,
        contractID, 
        storageID, 
        subtypeID,
        warehouseID,
        type, date, name, sign, signInvoice, dateInvoice, vat, source, orderNew, pricePolicy,
        receiver, note,
        forward, forwardIs, returning, advancePayment, cancel, 
        fcuExRate, 
        selectedJournals, 
        deletedJournals,
        ctx
     }) {
        // console.log({authorID, 
        //     voucherID,
        //     fundaID,
        //     customerID,
        //     contractID, 
        //     storageID, 
        //     subtypeID, 
        //     warehouseID, 
        //     type, date, name, sign, signInvoice, dateInvoice, vat, source, orderNew, pricePolicy,
        //     receiver, note,
        //     forward, forwardIs, returning, advancePayment, cancel, 
        //     fcuExRate, 
        //     selectedJournals, 
        //     deletedJournals})
        const that = this
        return new Promise(async (resolve) => {
            try {
               
                /**
                 * BA-Author: HiepNH - 23/4/2022
                 * 1. Khi thêm phiếu có gán budgetWorkID => Cập nhật Ngân sách thực hiện cho work, group, item, budget
                 * 2. Khi sửa bút toán budgetWorkID => Cập nhật Ngân sách thực hiện cho work, group, item, budget của:
                 * +++budgetWorkID cũ
                 * +++budgetWorkID mới
                */

                //_________Kiểm tra dữ liệu đầu vào
                if(!date || !name || Number.isNaN(Number(type)) || !checkObjectIDs(fundaID) || !checkObjectIDs(voucherID) || !checkObjectIDs(customerID))
                    return resolve({ error: true, message: 'date|name|type|fundaID|customerID invalid', keyError: KEY_ERROR.PARAMS_INVALID, status: 400 })

                let info = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.findById(voucherID)
                if (!info) 
                    return resolve({ error: true, message: 'cannot_get_info_voucher', status: 400 })

                let companyID = info.company
                // let fundaID = info.funda

                //_________Kiểm tra trùng số hiệu
                if(sign && sign != ""){
                    let infoVoucher = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.findOne({
                        funda: fundaID, 
                        sign: sign,
                        _id: {
                            $ne: voucherID
                        }
                    }).select('_id')
                    // console.log(infoVoucher)
    
                    if(infoVoucher)
                        return resolve({ error: true, message: "Mã phiếu đã tồn tại", status: 400 })
                }

                /**
                 * B1. CẬP NHẬT PHIẾU
                 */
                 const dataUpdateVoucher = {
                    userUpdate: authorID, 
                    modifyAt: Date.now(),
                    funda: fundaID,
                    customer: customerID,
                    type, date, name, sign, signInvoice, dateInvoice, vat, source, orderNew, pricePolicy,
                    receiver, note,
                    forward, forwardIs, returning, advancePayment, cancel, 
                    fcuExRate
                }

                let convertStr = ''
                if(name && name != ""){
                    convertStr = stringUtils.removeAccents(name)
                }
                if(sign && sign != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(sign)
                }
                if(signInvoice && signInvoice != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(signInvoice)
                }
                if(receiver && receiver != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(receiver)
                }
                if(note && note != ""){
                    convertStr = convertStr + " " + stringUtils.removeAccents(note)
                }
                dataUpdateVoucher.namecv = convertStr

                if (contractID && checkObjectIDs(contractID)) {
                    dataUpdateVoucher.contract = contractID;
                }else{
                    dataUpdateVoucher.contract = null
                }

                if (storageID && checkObjectIDs(storageID)) {
                    dataUpdateVoucher.storage = storageID;
                }else{
                    dataUpdateVoucher.storage = null
                }

                // Khoản mục phí
                let parentSubtypeID
                if (subtypeID && checkObjectIDs(subtypeID)) {
                    dataUpdateVoucher.subtype = subtypeID;

                    let infoSubtype = await ITEM__DOCTYPE_COLL.findById(subtypeID).select('parent')
                    if(infoSubtype.parent && _isValid(infoSubtype.parent)){
                        parentSubtypeID = infoSubtype.parent
                    }else{
                        parentSubtypeID = subtypeID
                    }

                    dataUpdateVoucher.parentSubtype = parentSubtypeID;  
                }else{
                    dataUpdateVoucher.subtype = null
                    dataUpdateVoucher.parentSubtype = null
                }

                if (warehouseID && checkObjectIDs(warehouseID)) {
                    dataUpdateVoucher.warehouse = warehouseID;
                }else{
                    dataUpdateVoucher.warehouse = null
                }

                const infoAfterUpdate = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.findByIdAndUpdate(voucherID, dataUpdateVoucher, { new: true })
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: "cannot_update", status: 400 })

                /**
                 * B2. CẬP NHẬT BÚT TOÁN VÀO PHIẾU
                 */
                var i = 0
                if(selectedJournals && selectedJournals.length >0){
                    for (const subitem of selectedJournals) {
                        // Tạo mới
                        if(!subitem.journalID){
                            // console.log('===================TẠO BÚT TOÁN===================')
                            // console.log(subitem)
                            const dataInsert = {
                                authorID, 
                                companyID, 
                                fundaID, 
                                voucherID, 
                                date, forward, forwardIs, returning, advancePayment, cancel, vat, type, source, orderNew, pricePolicy,
                                updown: (!isNaN(subitem.updown) && [1,-1].includes(Number(subitem.updown))) ? Number(subitem.updown) : 1,
                                quantity: subitem.quantity ? Number(subitem.quantity) : 0,
                                amount: subitem.amount ? Number(subitem.amount) : 0,
                                unitprice: subitem.quantity != 0 ? Number(Number(subitem.amount/subitem.quantity)) : 0, // Đơn giá tính theo thành tiền/khối lượng
                                fcuExRate,
                                fcuAmount: fcuExRate != 0 ? Number(subitem.amount/fcuExRate) : 0,
                                note: subitem.note,
                                ctx
                            }
    
                            /**
                             * Kiểm tra xem có tài khoản nợ/có không
                             * Nếu không thì lấy giá trị null
                             */
                            if(subitem.debit && _isValid(subitem.debit)){
                                dataInsert.debit = subitem.debit
                            }else{
                                dataInsert.debit = null
                            }
    
                            if(subitem.credit && _isValid(subitem.credit)){
                                dataInsert.credit = subitem.credit
                            }else{
                                dataInsert.credit = null
                            }
    
                            /**
                             * Kiểm tra nếu có chi tiết mã khách nợ/có thì lấy theo chi tiết
                             * Nếu không  có thì lấy theo mã khách trên phiếu
                             */
                            if(subitem.customerDebit && _isValid(subitem.customerDebit)){
                                dataInsert.customerDebit = subitem.customerDebit
                            }else{
                                dataInsert.customerDebit = customerID
                            }
    
                            if(subitem.customerCredit && _isValid(subitem.customerCredit)){
                                dataInsert.customerCredit = subitem.customerCredit
                            }else{
                                dataInsert.customerCredit = customerID
                            }
    
                            /**
                             * Kiểm tra xem có hàng hóa/kho hay không
                             * Nếu không  có thì lấy theo mã khách trên phiếu
                             * Chỉ insert khi có cả thông tin goods và warehouse
                             */
                            if(subitem.goods && _isValid(subitem.goods)){
                                if(subitem.warehouse && _isValid(subitem.warehouse)){
                                    dataInsert.goods = subitem.goods
                                    dataInsert.warehouse = subitem.warehouse
                                }else{
                                    if(warehouseID && _isValid(warehouseID)){
                                        dataInsert.goods = subitem.goods
                                        dataInsert.warehouse = warehouseID
                                    }
                                }
                            }
    
                            /**
                             * Kiểm tra xem có Hợp đồng hay không
                             * Nếu không  có thì lấy theo hợp đồng trên phiếu
                             */
                            if(subitem.contract && _isValid(subitem.contract)){
                                dataInsert.contract = subitem.contract
                            }else{
                                if(contractID && _isValid(contractID)){
                                    dataInsert.contract = contractID;
                                }
                            }

                            /**
                             * Khoản mục phí
                             */
                            if (subitem.subtype && checkObjectIDs(subitem.subtype)) {

                                let infoSubtype = await ITEM__DOCTYPE_COLL.findById(subitem.subtype).select('parent')
                                if(infoSubtype.parent && _isValid(infoSubtype.parent)){
                                    parentSubtypeID = infoSubtype.parent
                                }else{
                                    parentSubtypeID = subtypeID
                                }
                                
                                dataInsert.subtype = subitem.subtype;
                                dataInsert.parentSubtype = parentSubtypeID;
                            }else{
                                if(subtypeID && _isValid(subtypeID)){
                                    dataInsert.subtype = subtypeID;
                                    dataInsert.parentSubtype = parentSubtypeID;
                                }
                            }         
    
                            /**
                             * Cập nhật ngân sách thực hiện
                             */
                            if(subitem.budgetWork && _isValid(subitem.budgetWork)){
                                dataInsert.budgetWork = subitem.budgetWork
                            }
                            
                            //_________Tiến hành tạo chi tiết_________//
                            let infoJournal = await ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_MODEL.insert(dataInsert);
    
                            /**
                             * B3. CẬP NHẬT GIÁ TRỊ PHIẾU SAU KHI ĐÃ CẬP NHẬT XONG CÁC BÚT TOÁN
                             */
                            // if(infoJournal){
                            //     let newInfoVoucher = await that.updateValue({ voucherID })
                            //     // console.log(newInfoVoucher)
                            // }
                        }

                        // Cập nhật
                        else{
                            // console.log('===================CẬP NHẬT BÚT TOÁN===================')
                            // console.log(subitem)
                            const dataUpdate = {
                                authorID, 
                                fundaID, 
                                journalID: subitem.journalID, 
                                date, forward, forwardIs, returning, advancePayment, cancel, vat, type, source, orderNew, pricePolicy,
                                updown: (!isNaN(subitem.updown) && [1,-1].includes(Number(subitem.updown))) ? Number(subitem.updown) : 1,
                                quantity: subitem.quantity ? Number(subitem.quantity) : 0,
                                amount: subitem.amount ? Number(subitem.amount) : 0,
                                unitprice: subitem.quantity != 0 ? Number(Number(subitem.amount/subitem.quantity)) : 0, // Đơn giá tính theo thành tiền/khối lượng
                                fcuExRate,
                                fcuAmount: fcuExRate != 0 ? Number(subitem.amount/fcuExRate) : 0,
                                note: subitem.note,
                                ctx
                            }
    
                            /**
                             * Kiểm tra xem có tài khoản nợ/có không
                             * Nếu không thì lấy giá trị null
                             */
                            if(subitem.debit && _isValid(subitem.debit)){
                                dataUpdate.debit = subitem.debit
                            }else{
                                dataUpdate.debit = null
                            }
    
                            if(subitem.credit && _isValid(subitem.credit)){
                                dataUpdate.credit = subitem.credit
                            }else{
                                dataUpdate.credit = null
                            }
    
                            /**
                             * Kiểm tra nếu có chi tiết mã khách nợ/có thì lấy theo chi tiết
                             * Nếu không  có thì lấy theo mã khách trên phiếu
                             */
                            if(subitem.customerDebit && _isValid(subitem.customerDebit)){
                                dataUpdate.customerDebit = subitem.customerDebit
                            }else{
                                dataUpdate.customerDebit = customerID
                            }
    
                            if(subitem.customerCredit && _isValid(subitem.customerCredit)){
                                dataUpdate.customerCredit = subitem.customerCredit
                            }else{
                                dataUpdate.customerCredit = customerID
                            }
    
                            /**
                             * Kiểm tra xem có hàng hóa/kho hay không
                             * Nếu không  có thì lấy theo mã khách trên phiếu
                             * Chỉ insert khi có cả thông tin goods và warehouse
                             */
                            if(subitem.goods && _isValid(subitem.goods)){
                                if(subitem.warehouse && _isValid(subitem.warehouse)){
                                    dataUpdate.goods = subitem.goods
                                    dataUpdate.warehouse = subitem.warehouse
                                }else{
                                    if(warehouseID && _isValid(warehouseID)){
                                        dataUpdate.goods = subitem.goods
                                        dataUpdate.warehouse = warehouseID
                                    }else{
                                        dataUpdate.goods = null
                                        dataUpdate.warehouse = null
                                    }
                                }
                            }else{
                                dataUpdate.goods = null
                                dataUpdate.warehouse = null
                            }
    
                            /**
                             * Kiểm tra xem có Hợp đồng hay không
                             * Nếu không  có thì lấy theo hợp đồng trên phiếu
                             */
                            if(subitem.contract && _isValid(subitem.contract)){
                                dataUpdate.contract = subitem.contract
                            }else{
                                if(contractID && _isValid(contractID)){
                                    dataUpdate.contract = contractID;
                                }else{
                                    dataUpdate.contract = null
                                }
                            }

                            /**
                             * Khoản mục phí
                             */
                            if (subitem.subtype && checkObjectIDs(subitem.subtype)) {

                                let infoSubtype = await ITEM__DOCTYPE_COLL.findById(subitem.subtype).select('parent')
                                if(infoSubtype.parent && _isValid(infoSubtype.parent)){
                                    parentSubtypeID = infoSubtype.parent
                                }else{
                                    parentSubtypeID = subtypeID
                                }
                                
                                dataUpdate.subtype = subitem.subtype;
                                dataUpdate.parentSubtype = parentSubtypeID;
                            }else{
                                if (subtypeID && checkObjectIDs(subtypeID)) {
                                    dataUpdate.subtype = subtypeID;
                                    dataUpdate.parentSubtype = parentSubtypeID;
                                }else{
                                    dataUpdate.subtype = null
                                    dataUpdate.parentSubtype = null
                                }  
                            }     

                            /**
                             * Cập nhật ngân sách thực hiện
                             */
                            if(subitem.budgetWork && _isValid(subitem.budgetWork)){
                                dataUpdate.budgetWork = subitem.budgetWork
                            }
                            
                            //_________Tiến hành tạo chi tiết_________//
                            let infoJournal = await ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_MODEL.update(dataUpdate);
    
                            /**
                             * B3. CẬP NHẬT GIÁ TRỊ PHIẾU SAU KHI ĐÃ CẬP NHẬT XONG CÁC BÚT TOÁN
                             */
                            // if(infoJournal){
                            //     let newInfoVoucher = await that.updateValue({ voucherID })
                            //     // console.log(newInfoVoucher)
                            // }
                        }

                        i++

                        /**
                         * XÓA BÚT TOÁN
                         * 1-Xóa bút toán
                         * 2-Update lại giá trị phiếu
                         * 3-Update lại ngân sách đã thực hiện (nếu có)
                         */
                    }
                }

                /**
                 * B3. CẬP NHẬT GIÁ TRỊ PHIẾU SAU KHI ĐÃ CẬP NHẬT XONG CÁC BÚT TOÁN
                 */
                if(Number(i) == Number(selectedJournals.length)){
                    // console.log('=================')
                    // console.log({__________i:i})
                    await that.updateValue({ voucherID })
                }

                return resolve({ error: false, data: infoAfterUpdate, status: 200 });
            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }

    /**
     * Name: Cập nhật giá trị của phiếu
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    updateValue({ voucherID }){
        return new Promise(async (resolve, reject) => {
            try {
                let dataUpdate = { amount: 0, fcuAmount: 0, revenue: 0, tax: 0 }

                // Tính tổng các bút toán của Phiếu
                let listData = await ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_COLL.aggregate([
                    {
                        $match: {
                            voucher: ObjectID(voucherID),
                        }
                    }, 
                    {
                        $group: {
                            _id: { },
                            amount: { $sum: "$amount" },
                            fcuAmount: { $sum: "$fcuAmount" },
                        }
                    }, 
                ])
                
                if(listData && listData.length){
                    dataUpdate.amount = Number(listData[0].amount)
                    dataUpdate.fcuAmount = Number(listData[0].fcuAmount)
                }

                const resultUpdateVoucher = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.findByIdAndUpdate(voucherID, dataUpdate)
                if(!resultUpdateVoucher)
                    return resolve({ erorr: true, message: 'update_voucher_fail', data : resultUpdateVoucher, status: 400})
            
                return resolve({ erorr: false, message: 'successfully_update_voucher', data : resultUpdateVoucher, status: 200 })
            } catch (error) {
                console.log(`ERROR [ACCOUNTING][UPDATE_VOUCHER_WITH_NEW_JOURNAL]: ${error}`)
                return resolve({ erorr: true, message: 'update_voucher_fail', status: 400})
            }
        });
    }

    /**
     * Name: Convert phiếu xuất nội bộ
     * Author: Hiepnh
     * Date: 6/1/2024
     */
    convertVoucher({ companyID, docID, userID, ctx }){
        // console.log({ companyID, docID, userID })
        const that = this
        return new Promise(async (resolve, reject) => {
            try {
                let infoVoucher = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.findById(docID).populate({
                    path: 'linkFunda',
                    select: '_id name warehouse contact'
                })
                // console.log(infoVoucher)

                if(infoVoucher.type == 5 && infoVoucher.linkFunda && checkObjectIDs(infoVoucher.linkFunda._id)){
                    // console.log(infoVoucher)

                    let listAccount = await ITEM__ACCOUNT_MODEL.getListRecursive({ companyID, arrAccNames: ['152','156'] })
                    listAccount = listAccount.data.map(item=>item._id.toString())
                    // console.log(listAccount)

                    // Phải trả nội bộ
                    let info336 = await ITEM__ACCOUNT_COLL.findOne({name: '336'})                    
                    // console.log(info336)

                    let listJournals = await ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_COLL.find({
                        voucher: docID
                    })
                    // console.log(listJournals)

                    let infoFunda = await ITEM_FUNDA_COLL.findById(infoVoucher.funda)

                    let selectedJournals = []
                    for(const item of listJournals){
                        if(listAccount.includes(item.credit.toString())){
                            let dataInsert = {
                                source: item.source, 
                                orderNew: item.orderNew, 
                                pricePolicy: item.pricePolicy,
                                updown: item.updown,
                                quantity: item.quantity,
                                amount: item.amount,
                                unitprice: item.unitprice,
                                note: item.note,
                                debit: item.credit,
                                credit: info336._id,
                                customerDebit: infoVoucher.linkFunda?.contact ? infoVoucher.linkFunda?.contact : item.customerDebit,
                                customerDebit: infoVoucher.linkFunda?.contact ? infoVoucher.linkFunda?.contact : item.customerDebit,
                                goods: item.goods,
                                warehouse: infoVoucher.linkFunda?.warehouse ? infoVoucher.linkFunda?.warehouse : item.warehouse,
                                contract: item.contract,
                                subtype: item.subtype,
                            }
                            selectedJournals.push(dataInsert)
                        }
                    }

                    let infoNewVoucher = await that.insert({
                        linkVoucherID: docID,
                        authorID: userID, 
                        fundaID: infoVoucher.linkFunda._id, 
                        customerID: infoVoucher.linkFunda?.contact ? infoVoucher.linkFunda?.contact : infoVoucher.customer,
                        contractID: infoVoucher.contract, 
                        storageID: infoVoucher.storage, 
                        subtypeID: infoVoucher.subtype,
                        warehouseID: infoVoucher.linkFunda?.warehouse ? infoVoucher.linkFunda?.warehouse : infoVoucher.warehouse,
                        linkFundaID: infoVoucher.funda,
                        type: 4, 
                        date: infoVoucher.date, 
                        name: `Auto-Nhập kho từ ${infoFunda.name}`, 
                        source: infoVoucher.source, 
                        orderNew: infoVoucher.orderNew, 
                        pricePolicy: infoVoucher.pricePolicy,
                        receiver: infoVoucher.receiver, 
                        note: infoVoucher.note,
                        forward: infoVoucher.forward, 
                        forwardIs: infoVoucher.forwardIs, 
                        returning: infoVoucher.returning, 
                        advancePayment: infoVoucher.advancePayment, 
                        cancel: infoVoucher.cancel, 
                        fcuExRate: infoVoucher.fcuExRate, 
                        selectedJournals: selectedJournals,
                        ctx
                    })
                    // console.log(infoNewVoucher)

                    return resolve({ erorr: false, data: infoNewVoucher, status: 200 })
                }else{
                    return resolve({ erorr: false, data: infoVoucher, status: 200 })
                } 
            } catch (error) {
                console.log(`ERROR [ACCOUNTING][UPDATE_VOUCHER_WITH_NEW_JOURNAL]: ${error}`)
                return resolve({ erorr: true, message: 'update_voucher_fail', status: 400})
            }
        })
    }

    /**
     * Name: Cập nhật thuộc tính từ phiếu sang bút toán
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    updateFromVoucherToJournal({ companyID, userID }){
        return new Promise(async (resolve, reject) => {
            try {
                let listData = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.find({ company: companyID })
                // console.log({totalVoucher: listData.length})
                // console.log(listData)
                for(const item of listData){
                    let infoAfterUpdate = await ACCOUNTING__FINANCIAL_GENERAL_JOURNAL_COLL.updateMany(
                        { voucher: ObjectID(item._id) },
                        {
                            $set: {
                                date: item.date,
                                forward: !isNaN(item.forward) ? item.forward : 0,
                                forwardIs: !isNaN(item.forwardIs) ? item.forwardIs : 0,
                                returning: !isNaN(item.returning) ? item.returning : 0,
                                advancePayment: !isNaN(item.advancePayment) ? item.advancePayment : 0,
                                cancel: !isNaN(item.cancel) ? item.cancel : 0,
                                type: !isNaN(item.type) ? item.type : 1,
                                vat: !isNaN(item.vat) ? item.vat : 0,
                                source: !isNaN(item.source) ? item.source : 1,
                                orderNew: !isNaN(item.orderNew) ? item.orderNew : 1,
                                pricePolicy: !isNaN(item.pricePolicy) ? item.pricePolicy : 1
                            }
                        }
                    )
                    // console.log(infoAfterUpdate)
                }

                return resolve({ erorr: false, message: 'convert_successfull', totalVoucher: listData.length, status: 200 })
            } catch (error) {
                return resolve({ erorr: true, message: 'convert_failed', status: 400})
            }
        });
    }

     /**
     * Name: Cập nhật từ bút toán sang phiếu
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    updateFromJournalToVoucher({ companyID, userID }){
        const that = this
        return new Promise(async (resolve, reject) => {
            try {
                let listVoucher = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.find({company: companyID}).select('_id name')
                console.log(listVoucher.length)
                // console.log(listVoucher)
                for (const item of listVoucher){
                    let info = await that.updateValue({ voucherID: item._id })
                    // console.log(info)
                }

                return resolve({ erorr: false, message: 'convert_successfull', status: 200 })
            } catch (error) {
                return resolve({ erorr: true, message: 'convert_failed', status: 400})
            }
        });
    }

    /**
     * Name: Get info 
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    getInfo({ voucherID, select, populates, ctx }) {
        return new Promise(async resolve => {
            try {
                if (!checkObjectIDs(voucherID))
                    return resolve({ error: true, message: 'param_invalid' });

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({ error: true, message: 'Request params populates invalid', status: 400 });
                    populates = JSON.parse(populates);
                } else {
                    populates = {
                        path: "",
                        select: ""
                    }
                }

                let info = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.findById(voucherID)
                    .select(select)
                    .populate(populates)

                if (!info) return resolve({ error: true, message: 'cannot_get' });

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                return resolve({ error: false, data: info });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Name  : Get list 
     * Author: Hiepnh
     * Date: 30/4/2022
     */
    getList({ userID, companyID, fundaID, projectID, contractID, customerID, fromDate, toDate, type, vat, userCreateID,
        keyword, limit = 20, lastestID, select, populates = {}, sortKey, ctx }) {
        // console.log({userID, companyID, fundaID, projectID, contractID, customerID, fromDate, toDate, type, vat, userCreateID, keyword})
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                if (limit > 20) {
                    limit = 20
                } else {
                    limit = +limit;
                }

                let sortBy;
                let conditionObj = { };
                let keys = ['createAt__-1', '_id__-1'];

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({ error: true, message: 'Request params populates invalid', status: 400 });

                    populates = JSON.parse(populates);
                } else {
                    populates = {
                        path: "",
                        select: ""
                    }
                }

                if (sortKey && typeof sortKey === 'string') {
                    if (!IsJsonString(sortKey))
                        return resolve({ error: true, message: 'Request params sortKey invalid', status: 400 });

                    keys = JSON.parse(sortKey);
                }

                if(!isNaN(type) && Number(type) > 0){
                    conditionObj.type = Number(type)
                }

                if(!isNaN(vat) && Number(vat) > 0){
                    conditionObj.vat = Number(vat)
                }

                if (checkObjectIDs(userCreateID)) {
                    conditionObj.userCreate = userCreateID
                }

                if (checkObjectIDs(customerID)) {
                    conditionObj.customer = customerID
                }else{
                    if (checkObjectIDs(contractID)) {
                        conditionObj.contract = contractID
                    }else{
                        if (checkObjectIDs(projectID)) {
                            conditionObj.project = projectID
                        }else{
                            if (checkObjectIDs(fundaID)) {
                                conditionObj.funda = fundaID
                            } else {
                                conditionObj.company = companyID
                            }
                        }
                    }
                }

                if(fromDate && toDate){
                    if(fromDate != 'Invalid Date' && toDate != 'Invalid Date'){
                        let startTime   = moment(fromDate).startOf('day').format();// <=== fix ISODate here
                        let endTime     = moment(toDate).endOf('day').format();// <=== fix ISODate here
                        // conditionObj.date = {
                        //     $gte: startTime,// <=== fix ISODate here
                        //     $lte: endTime // <=== fix ISODate here
                        // }
                        conditionObj.date  = { 
                            $gte: moment(startTime).toDate(),
                            $lte: moment(endTime).toDate()
                        }
                    }
                }

                if (keyword) {
                    keyword = stringUtils.removeAccents(keyword)
                    keyword = keyword.split(" ");
                    keyword = '.*' + keyword.join(".*") + '.*';
                    const regSearch = new RegExp(keyword, 'i');

                    conditionObj.namecv = regSearch
                }
                // console.log(conditionObj)

                let conditionObjOrg = { ...conditionObj };

                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.findById(lastestID);
                    if (!infoData)
                        return resolve({ error: true, message: "Can't get info lastest", status: 400 });

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: infoData, objectQuery: conditionObjOrg });
                    if (!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({ error: true, message: "Can't get range pagination", status: 400 });

                    conditionObj = dataPagingAndSort.data.find;
                    sortBy = dataPagingAndSort.data.sort;
                } else {
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({ keys, latestRecord: null, objectQuery: conditionObjOrg });
                    sortBy = dataPagingAndSort.data.sort;
                }

                let infoDataAfterGet = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.find(conditionObj)
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean();

                if (!infoDataAfterGet)
                    return resolve({ error: true, message: "Can't get data", status: 403 });

                let nextCursor = null;
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]._id;
                        infoDataAfterGet.length = limit;
                    }
                }

                let totalRecord = await ACCOUNTING__FINANCIAL_VOUCHER_COLL.count(conditionObjOrg);
                let totalPage = Math.ceil(totalRecord / limit);

                return resolve({
                    error: false, data: {
                        listRecords: infoDataAfterGet,
                        limit: +limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    }, status: 200
                });

            } catch (error) {
                return resolve({ error: true, message: error.message, status: 500 });
            }
        })
    }
}

exports.MODEL = new Model;