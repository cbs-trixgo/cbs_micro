'use strict'

const BaseModel = require('../../../tools/db/base_model')
const ObjectID = require('mongoose').Types.ObjectId
const { KEY_ERROR } = require('../../../tools/keys')
const {
    checkObjectIDs,
    IsJsonString,
    validateParamsObjectID,
} = require('../../../tools/utils/utils')
const {
    compareTwoTime,
    isValidDate,
    getTimeBetween,
} = require('../../../tools/utils/time_utils')
const {
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_ZALO } = require('../../zalo_oa/helper/zalo.actions')
const moment = require('moment')

/**s
 * import inter-coll, exter-coll
 */
const ITEM__FUNDA_COLL = require('../../item/database/item.funda-coll')
const ITEM__CONTACT_COLL = require('../../item/database/item.contact-coll')
const ITEM__CONFIG_COLL = require('../../item/database/item.config-coll')
const ITEM__DOCTYPE_COLL = require('../../item/database/item.doctype-coll')
const FNB_ORDER_COLL = require('../database/fnb.order-coll')
const FNB_ORDER_PRODUCT_COLL = require('../database/fnb.order_product-coll')
const FNB_SHIFT_COLL = require('../database/fnb.shift-coll')
const FNB_MISTAKE_COLL = require('../database/fnb.mistake-coll')
const FNB_VOUCHER_COLL = require('../database/fnb.voucher-coll')
const TIMESHEET__EXPERT_TIMESHEET_COLL = require('../../timesheet/database/timesheet.expert_timesheet-coll')
const FIN__CASH_PAYMENT_COLL = require('../../fin/database/fin.cash_payment-coll')
// const FNB_NETWORK_COM_COLL                      = require('../database/fnb.network_com-coll');

/**
 * import inter-model, exter-model
 */
const FNB_ORDER_PRODUCT_MODEL = require('./fnb.order_product-model').MODEL
const FNB_ORDER_VOUCHER_MODEL = require('./fnb.voucher-model').MODEL
const FNB_NETWORK_COM_MODEL = require('./fnb.network_com-model').MODEL
const FNB_ORDER_GOODS_MODEL = require('./fnb.order_goods-model').MODEL

const XlsxPopulate = require('xlsx-populate')
const fs = require('fs')
const path = require('path')
const { uploadFileS3 } = require('../../../tools/s3')

const { FNB_ACC } = require('../helper/fnb.keys-constant')

const {
    FNB_FACTOR,
    FNB_SHIFT_TYPES,
    FNB_SALES_CHANNEL,
    FNB_PAYMENT_METHOD,
    FNB_STATUS,
    FNB_AFFILIATE_COM,
} = require('../helper/fnb.keys-constant')

let dataTF = {
    appID: '61e04971fdebf77b072d1b0f', // FNB
    menuID: '63af81debe33df0012ecaeca', //
    type: 1,
    action: 1, // Xem
}
let dataTF2 = {
    appID: '61e04971fdebf77b072d1b0f', // FNB
    menuID: '63af81debe33df0012ecaeca', //
    type: 1,
    action: 2, // Thêm
}

class Model extends BaseModel {
    constructor() {
        super(FNB_ORDER_COLL)
    }

    /**
     * Name: Insert
     * Author: HiepNH--
     * Code: 24/11/2022
     */
    insert({
        voucherID,
        fundaID,
        parentID,
        customerID,
        affiliateID,
        shiftID,
        date,
        name,
        appOrderSign,
        note,
        sources,
        salesChannel,
        paymentMethod,
        service,
        total,
        discount,
        salesoff,
        credit,
        offer,
        vatAmount,
        shippingFee,
        paid,
        products,
        userID,
        ctx,
    }) {
        const that = this
        return new Promise(async (resolve) => {
            try {
                if (
                    !checkObjectIDs(fundaID) ||
                    !checkObjectIDs(customerID) ||
                    !checkObjectIDs(shiftID) ||
                    !name
                )
                    return resolve({
                        error: true,
                        message: 'fundaID|name invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                // Thông tin cơ sở
                let infoFunda = await ITEM__FUNDA_COLL.findById(fundaID)
                if (!infoFunda)
                    return resolve({
                        error: true,
                        message: 'cannot_get_infoFunda',
                    })

                // Thông tin ca làm việc
                let infoShift = await FNB_SHIFT_COLL.findById(shiftID)
                if (!infoShift)
                    return resolve({
                        error: true,
                        message: 'cannot_get_infoShift',
                    })

                // Thông tin khách hàng
                let infoCustomer = await ITEM__CONTACT_COLL.findById(customerID)
                if (!infoCustomer)
                    return resolve({
                        error: true,
                        message: 'cannot_get_infoCustomer',
                    })

                // Lấy số đơn hàng khách đã mua (thành công)
                let numberOD = await FNB_ORDER_COLL.count({
                    customer: customerID,
                    status: 5,
                })

                /**
                 * Tính mã hóa đơn tự động theo hệ thống (từ 1->N)
                 */
                let numberOfOrder = await FNB_ORDER_COLL.count({
                    company: infoFunda.company,
                })

                let dataInsert = {
                    company: infoFunda.company,
                    funda: fundaID,
                    customer: customerID,
                    shift: shiftID,
                    name: `${name}-C${Number(numberOfOrder + 1)}`,
                    sign: `C${Number(numberOfOrder + 1)}`,
                    amount: 0,
                    userCreate: userID,
                }

                /**
                 * B1. CẬP NHẬT THUỘC TÍNH CỦA CƠ SỞ
                 */
                // Thuộc chiến dịch marketing hay không
                if (infoFunda.campaign) {
                    dataInsert.campaign = infoFunda.campaign
                }

                // Thong hoặc ngoài hệ thống
                if (infoFunda.internal) {
                    dataInsert.internal = infoFunda.internal
                }

                // Khu vực
                if (infoFunda.area3) {
                    dataInsert.area1 = infoFunda.area1
                    dataInsert.area2 = infoFunda.area2
                    dataInsert.area3 = infoFunda.area3
                }

                // Quản lý điểm bán
                if (infoFunda.manager) {
                    dataInsert.manager = infoFunda.manager
                }

                // Chiến dịch
                if (
                    infoFunda.campaignName &&
                    checkObjectIDs(infoFunda.campaignName)
                ) {
                    dataInsert.campaignName = infoFunda.campaignName
                }

                /**
                 * B2. CẬP NHẬT THUỘC TÍNH CỦA CA LÀM VIỆC
                 */
                // Mùa trong năm
                if (infoShift.seasons) {
                    dataInsert.seasons = Number(infoShift.seasons)
                }

                // Phân loại ca sáng, chiều, tối, đêm
                if (infoShift.shiftType) {
                    dataInsert.shiftType = Number(infoShift.shiftType)
                }

                /**
                 * B3. CẬP NHẬT THUỘC TÍNH CỦA KHÁCH HÀNG
                 */
                // Phân loại nhân viên
                if (infoCustomer.type && !isNaN(infoCustomer.type)) {
                    dataInsert.customerType = Number(infoCustomer.type)
                }

                // Giới tính
                if (infoCustomer.gender && !isNaN(infoCustomer.gender)) {
                    dataInsert.gender = Number(infoCustomer.gender)
                }

                // Độ tuổi
                if (infoCustomer.birthday) {
                    let dateNow = new Date()
                    dataInsert.age =
                        Number(dateNow.getFullYear()) -
                        Number(infoCustomer.birthday.getFullYear())
                    // console.log(Number(dateNow.getFullYear()) - Number(infoCustomer.birthday.getFullYear()))
                }

                // Người giới thiệu
                if (
                    infoCustomer.referrer &&
                    checkObjectIDs(infoCustomer.referrer)
                ) {
                    dataInsert.referrer = infoCustomer.referrer
                }

                // Phân loại chiến dịch
                if (
                    infoCustomer.campaignType &&
                    checkObjectIDs(infoCustomer.campaignType)
                ) {
                    dataInsert.campaignType = infoCustomer.campaignType
                }

                // Doanh số khách cũ, mới và khách vãng lai
                if (
                    (numberOD && numberOD > 0) ||
                    (infoCustomer.new && infoCustomer.new == 2)
                ) {
                    dataInsert.new = 2 // Đơn hàng khách cũ
                } else {
                    dataInsert.new = 1 // Đơn hàng khách mới
                }

                // Khách vãng lai hay không
                if (
                    infoCustomer.nonResident &&
                    !isNaN(infoCustomer.nonResident)
                ) {
                    dataInsert.nonResident = Number(infoCustomer.nonResident)

                    // Khách vãng lai
                    if (infoCustomer.nonResident == 2) {
                        dataInsert.new = 3 // Khách vãng lai
                    }
                }

                if (date && date != '') {
                    dataInsert.date = date
                }

                // affiliateID
                if (affiliateID && checkObjectIDs(affiliateID)) {
                    dataInsert.affiliate = affiliateID
                }

                if (appOrderSign && appOrderSign != '') {
                    dataInsert.appOrderSign = appOrderSign
                }

                if (note && note != '') {
                    dataInsert.note = note
                }

                if (parentID && checkObjectIDs(parentID)) {
                    dataInsert.parent = parentID
                }

                if (
                    !isNaN(sources) &&
                    [1, 2, 3, 4, 5].includes(Number(sources))
                ) {
                    dataInsert.sources = Number(sources)
                }

                if (
                    !isNaN(paymentMethod) &&
                    [1, 2].includes(Number(paymentMethod))
                ) {
                    dataInsert.paymentMethod = Number(paymentMethod)
                }

                if (
                    !isNaN(salesChannel) &&
                    [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(Number(salesChannel))
                ) {
                    dataInsert.salesChannel = Number(salesChannel)

                    if (salesChannel != 1) {
                        dataInsert.paymentMethod = Number(2) // Chuyển khoản
                    }
                }

                if (!isNaN(shippingFee)) {
                    dataInsert.shippingFee = Number(shippingFee)
                }

                if (!isNaN(paid)) {
                    dataInsert.paid = Number(paid)
                }

                if (!isNaN(service) && [1, 2, 3].includes(Number(service))) {
                    dataInsert.service = Number(service)

                    // Kênh offline
                    if (Number(service) === 1) {
                        dataInsert.salesChannel = Number(1)
                    }
                }

                /**
                 * TÍNH TOÁN GIÁ TRỊ ĐƠN HÀNG
                 */
                let loyaltyPoints = 0,
                    amount = 0

                if (!isNaN(total)) {
                    dataInsert.total = Number(total)
                    amount = Number(total)
                }

                // Chiết khấu
                if (!isNaN(discount) && Number(discount) >= 0) {
                    // dataInsert.discount = Number(discount)
                    // amount = Number(amount) - Number(discount)

                    if (Number(amount) <= Number(discount)) {
                        dataInsert.discount = Number(amount)
                        amount = 0
                    } else {
                        dataInsert.discount = Number(discount)
                        amount = Number(amount) - Number(discount)
                    }
                }

                /**
                 * Tích điểm, giảm giá
                 * TÍCH ĐIỂM NẾU LÀ ĐƠN OFF -> Không tích điểm cho đơn App
                 */
                if (salesChannel == 1) {
                    // Nếu có giảm giá
                    if (!isNaN(salesoff) && Number(salesoff) >= 0) {
                        // Nếu đã giảm giá thì không được tích điểm

                        // dataInsert.salesoff = Number(salesoff)
                        // amount = Number(amount) - Number(salesoff)

                        if (Number(amount) <= Number(salesoff)) {
                            dataInsert.salesoff = Number(amount)
                            amount = 0
                        } else {
                            dataInsert.salesoff = Number(salesoff)
                            amount = Number(amount) - Number(salesoff)
                        }
                    }

                    // Nếu có tích điểm
                    if (!isNaN(credit) && Number(credit) >= 0) {
                        let creditRound = 1000 * Math.round(credit / 1000)

                        if (Number(amount) <= Number(creditRound)) {
                            creditRound = amount
                            amount = 0
                        } else {
                            amount = Number(amount) - Number(creditRound)
                        }

                        dataInsert.credit = Number(creditRound)
                    }

                    /**
                     * Chính sách tích điểm => Mở chính thức vào 1/3/2023
                     */
                    let factor = 0
                    if (
                        Number(infoCustomer.purchasedOffValue) <
                        Number(FNB_FACTOR.credit.level2.purchasedOffValue)
                    ) {
                        factor = Number(FNB_FACTOR.credit.level1.factor)
                    } else {
                        if (
                            Number(infoCustomer.purchasedOffValue) <
                            Number(FNB_FACTOR.credit.level3.purchasedOffValue)
                        ) {
                            factor = Number(FNB_FACTOR.credit.level2.factor)
                        } else {
                            if (
                                Number(infoCustomer.purchasedOffValue) <
                                Number(
                                    FNB_FACTOR.credit.level4.purchasedOffValue
                                )
                            ) {
                                factor = Number(FNB_FACTOR.credit.level3.factor)
                            } else {
                                factor = Number(FNB_FACTOR.credit.level4.factor)
                            }
                        }
                    }

                    /**
                     * OFFER GIẢM GIÁ TỪ VOUCHER
                     */
                    if (voucherID && checkObjectIDs(voucherID)) {
                        /**
                         * Voucher Không có giá trị quy đổi thành tiền mặt
                            Chỉ áp dụng dành riêng đối với đơn hàng tiếp theo
                            Voucher chỉ sử dụng một lần cho một hóa đơn/1 khách hàng
                            Mỗi đơn hàng chỉ được sử dụng một Voucher giảm giá duy nhất
                            Voucher mệnh giá có thể sử dụng chung cho cùng một đơn hàng
                            Không trả lại tiền thừa nếu giá trị Voucher lớn hơn giá trị đơn hàng
                            Voucher chỉ có giá trị trong thời gian được ghi trên thẻ.
                            Voucher không áp dụng chung với các chương trình khuyến mãi khác (trường hợp quý khách muốn sử dụng voucher để áp dụng mua các sản phẩm đang khuyến mãi thì voucher chỉ áp dụng cho giá gốc chưa khuyến mãi của sản phẩm đó).
                        */
                        let infoVoucher =
                            await FNB_VOUCHER_COLL.findById(voucherID)
                        if (!infoVoucher)
                            return resolve({
                                error: true,
                                message: 'cannot_get_infoVoucher',
                            })

                        // Kiểm tra xem đúng VoucherID của customerID hay không
                        if (!infoVoucher.receivers.includes(customerID))
                            return resolve({
                                error: true,
                                message:
                                    'Voucher không áp dụng cho khách hàng này',
                            })

                        // Kiểm tra thời hạn VoucherID
                        let currentTime = new Date()
                        let checkExpired = compareTwoTime(
                            currentTime,
                            infoVoucher.expired
                        )
                        if (checkExpired == 1)
                            return resolve({
                                error: true,
                                message: 'Voucher đã hết hạn',
                            })

                        /**
                         * Kiểm tra giá trị đơn hàng xem có được áp dụng Voucher hay không
                         */
                        if (Number(total) < Number(infoVoucher.minOrderAmount))
                            return resolve({
                                error: true,
                                message: `Đơn hàng không đủ điều kiện áp dụng (Giá trị phải >= ${infoVoucher.minOrderAmount})`,
                            })

                        /**
                         * Kiểm tra xem khách hàng đã sử dụng voucherID hay chưa
                         */
                        if (infoVoucher.buyers.includes(customerID))
                            return resolve({
                                error: true,
                                message: 'Khách hàng đã sử dụng Voucher này',
                            })

                        /**
                         * Kiểm tra nếu Giá trị Voucher
                         */
                        let offer = 0
                        if (Number(infoVoucher.salesoffAmount) > 0) {
                            offer = Number(infoVoucher.salesoffAmount)
                        } else {
                            offer = Number(
                                (Number(infoVoucher.salesoffRate) *
                                    Number(total)) /
                                    100
                            ).toFixed(0)
                        }

                        if (Number(amount) <= Number(offer)) {
                            offer = amount // Set Offer
                            amount = 0 // Set Amount về 0
                        } else {
                            amount = Number(amount) - Number(offer)
                        }

                        dataInsert.voucher = voucherID
                        dataInsert.voucherType = Number(infoVoucher.type)
                        dataInsert.offer = Number(offer)
                    }

                    /**
                     * ĐIỂM TRUNG THÀNH
                     */
                    loyaltyPoints = Number(
                        Number(amount) * Number(factor / 100)
                    ).toFixed(0)
                    dataInsert.loyaltyPoints = Number(loyaltyPoints)
                }

                // Giá trị thanh toán
                dataInsert.amount = Number(amount)

                if (!isNaN(vatAmount)) {
                    dataInsert.vatAmount = Number(vatAmount)
                } else {
                    dataInsert.vatAmount = Number(
                        (amount * Number(FNB_FACTOR.vatRate / 100)) /
                            Number(1 + Number(FNB_FACTOR.vatRate / 100))
                    ).toFixed(0)
                }

                /**
                 * NHÂN VIÊN THỰC HIỆN
                 */
                let numberStaff = 0
                if (infoShift.staffs && infoShift.staffs.length) {
                    numberStaff = infoShift.staffs.length
                    let arrStaffs = infoShift.staffs

                    if (infoShift.subStaffs && infoShift.subStaffs.length) {
                        arrStaffs = [...arrStaffs, ...infoShift.subStaffs]

                        numberStaff =
                            Number(numberStaff) +
                            Number(infoShift.subStaffs.length)
                    }

                    // Nhân viên thực hiện
                    dataInsert.assignee = arrStaffs

                    // Doanh số trung bình/đầu nhân viên (nhiều nhân viên)
                    if (Number(numberStaff) != 0) {
                        dataInsert.avgTotalPerStaff = Number(
                            amount / Number(numberStaff)
                        ).toFixed(0)
                    } else {
                        dataInsert.avgTotalPerStaff = 1
                    }
                } else {
                    numberStaff = 1
                    dataInsert.assignee = [userID]

                    // Doanh số trung bình/đầu nhân viên (1 nhân viên)
                    dataInsert.avgTotalPerStaff = Number(
                        amount / Number(numberStaff)
                    ).toFixed(0)
                }

                /**
                 * KHỐI LƯỢNG SẢN PHẨM
                 */
                let totalQuantity = 0
                if (products && products.length) {
                    for (let item of products) {
                        totalQuantity =
                            Number(totalQuantity) + Number(item.quantity)
                    }

                    dataInsert.numberOfProducts = Number(totalQuantity)

                    // Số lượng sản phẩm trung bình của mỗi nhân viên
                    dataInsert.avgQuantityPerStaff = Number(
                        totalQuantity / Number(numberStaff)
                    ).toFixed(2)
                }

                /**
                 * THÊM SIZE VÀO ĐƠN HÀNG VÀ CA LÀM VIỆC
                 */
                let totalSizeM = 0,
                    totalSizeL = 0
                // console.log('=============1: SẢN PHẨM GIỎ HÀNG==========================>>>>>>>>>>>>>>>>>')
                if (products && products.length) {
                    for (const prodSize of products) {
                        // console.log('=============1.1: Bắt đầu SP==========================>>>>>>>>>>>>>>>>>')
                        // console.log(prodSize)
                        // console.log(prodSize.variants)
                        // console.log(prodSize.fundas)
                        // if(prodSize.doctype && checkObjectIDs(prodSize.doctype)){
                        //     dataInsert.doctype = prodSize.doctype
                        // }
                        if (prodSize.size == 1) {
                            totalSizeM =
                                Number(totalSizeM) + Number(prodSize.quantity)
                        }
                        if (prodSize.size == 2) {
                            totalSizeL =
                                Number(totalSizeL) + Number(prodSize.quantity)
                        }
                        // console.log('=============1.2: Kết thúc SP==========================>>>>>>>>>>>>>>>>>')
                    }
                }
                // console.log('=============2: SẢN PHẨM GIỎ HÀNG==========================>>>>>>>>>>>>>>>>>')

                dataInsert.numberOfSizeM = Number(totalSizeM)
                dataInsert.numberOfSizeL = Number(totalSizeL)

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                    })

                /**
                 *  Demo bắn inbox về Facebook
                 */
                // console.log('===============FBOOOOOOOOOOOOOOOOOOOOOOO')
                // let infoFB = await ctx.call(`${CF_DOMAIN_SERVICES.FACEBOOK}.${CF_ACTIONS_FACEBOOK.FACEBOOK_SEND_MESSAGE}`, {
                //     phone: infoCustomer.phone,
                //     message: `Cảm ơn bạn đã mua hàng tại Winggo, giá trị đơn hàng của bạn là ${total} (amount)`,
                // })
                // console.log(infoFB)

                /**
                 * GÁN SẢN PHẨM VÀO ĐƠN HÀNG-SẢN PHẨM
                 */
                const orderID = infoAfterInsert._id
                if (products && products.length) {
                    // Thêm vào đơn hàng-sản phẩm
                    const productsAsync = products.map((product) => {
                        // console.log('============Sản phẩm===============')
                        // console.log({variantsID:product.variantsID})

                        // Tính giá sản phẩm trong trường hợp có cả Topping
                        let newUnitPrice = product.unitPrice
                        // console.log('============Gía 11111111111111111111')
                        // console.log({newUnitPrice})

                        if (
                            product.variantsSelected &&
                            product.variantsSelected.length
                        ) {
                            for (const subProd of product.variantsSelected) {
                                // console.log(subProd)
                                // M-Off
                                if (
                                    Number(product.size) == 1 &&
                                    Number(salesChannel) == 1
                                ) {
                                    newUnitPrice =
                                        Number(newUnitPrice) + subProd.unitPrice
                                }

                                // M-App
                                if (
                                    Number(product.size) == 1 &&
                                    Number(salesChannel) != 1
                                ) {
                                    newUnitPrice =
                                        Number(newUnitPrice) +
                                        subProd.unitPrice2
                                }

                                // L-Off
                                if (
                                    Number(product.size) == 2 &&
                                    Number(salesChannel) == 1
                                ) {
                                    newUnitPrice =
                                        Number(newUnitPrice) +
                                        subProd.unitPrice3
                                }

                                // L-App
                                if (
                                    Number(product.size) == 2 &&
                                    Number(salesChannel) != 1
                                ) {
                                    newUnitPrice =
                                        Number(newUnitPrice) +
                                        subProd.unitPrice4
                                }
                            }
                        }
                        // console.log('============Gía 2222222222222222222')
                        // console.log({newUnitPrice})

                        const dataInsertProduct = {
                            userID,
                            orderID,
                            productID: product.productID,
                            black: product.black ? Number(product.size) : 1,
                            size: product.size ? Number(product.size) : 1,
                            sugar: product.sugar ? Number(product.sugar) : 1,
                            ice: product.ice ? Number(product.ice) : 1,
                            subProductsID: product.variantsID,
                            quantity: product.quantity
                                ? Number(product.quantity)
                                : 0,
                            unitPrice: newUnitPrice,
                            note: product.note,
                        }
                        return FNB_ORDER_PRODUCT_MODEL.insert(dataInsertProduct)
                    })

                    await Promise.all(productsAsync)
                }

                /**
                 * B5. CẬP NHẬT THÔNG TIN SAU KHI TẠO XONG ĐƠN HÀNG:
                 * - Cơ sở
                 * - Ca làm việc
                 * - Khách hàng
                 */
                let dataUpdateFw = {}

                // Kênh bán hàng, size, doanh số và số sản phẩm
                if (!isNaN(salesChannel) && Number(salesChannel) === 1) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders1: 1,
                        total1: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 2) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders2: 1,
                        total2: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 3) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders3: 1,
                        total3: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 4) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders4: 1,
                        total4: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 5) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders5: 1,
                        total5: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 6) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders6: 1,
                        total6: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 7) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders7: 1,
                        total7: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 8) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders8: 1,
                        total8: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 9) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders9: 1,
                        total9: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }

                // Tiền mặt và chuyển khoản
                if (!isNaN(paymentMethod) && Number(paymentMethod) === 1) {
                    dataUpdateFw.$inc.cashAmount = Number(amount)
                }

                if (!isNaN(paymentMethod) && Number(paymentMethod) === 2) {
                    dataUpdateFw.$inc.transferAmount = Number(amount)
                }
                // console.log(dataUpdateFw)

                /**
                 * CẬP NHẬT VÀO ĐIỂM BÁN/CƠ SỞ
                 */
                await ITEM__FUNDA_COLL.findByIdAndUpdate(fundaID, dataUpdateFw)

                /**
                 * CẬP NHẬT VÀO CA LÀM VIỆC
                 */
                await FNB_SHIFT_COLL.findByIdAndUpdate(shiftID, dataUpdateFw)

                /**
                 * CẬP NHẬT VÀO KHÁCH HÀNG
                 * - Tạm thời chỉ xử lý với đơn Off
                 */
                if (salesChannel == 1) {
                    await that.updateCustomer({ customerID, userID })
                }
                // await that.updateCustomer({ customerID, userID })

                /**
                 * CẬP NHẬT VÀO VOUCHER
                 */
                if (
                    salesChannel == 1 &&
                    voucherID &&
                    checkObjectIDs(voucherID)
                ) {
                    //______Cập nhật thông tin Người sử dụng voucher
                    await FNB_ORDER_VOUCHER_MODEL.update({
                        userID,
                        voucherID,
                        buyers: [customerID],
                    })
                }

                /**
                 * NGƯỜI GIỚI THIỆU
                 */
                if (
                    salesChannel == 1 &&
                    numberOD == 0 &&
                    infoCustomer.referrer &&
                    checkObjectIDs(infoCustomer.referrer)
                ) {
                    // Thông tin người giới thiệu
                    let infoReferral = await ITEM__CONTACT_COLL.findById(
                        infoCustomer.referrer
                    )

                    // Kiểm tra xem Người giới thiệu đã được nhận Voucher khi Bạn của mình mua hàng hay chưa (tránh trường hợp đơn hủy)
                    if (
                        infoReferral &&
                        infoReferral.achievements &&
                        infoReferral.achievements.includes(customerID)
                    ) {
                        // console.log('Đã được tính Ref=========================')
                    } else {
                        // console.log('Chưa được tính Ref=========================')
                        /**
                         * Tạo voucher cho Người giới thiệu theo mã bất kỳ (type=2)
                         * 1-Phân loại Type = 2
                         * 2-Còn thời hạn sử dụng
                         * 3-Voucher tặng Giá trị
                         * 4-Voucher chưa cấp cho người giới thiệu lần nào
                         */
                        let infoOffer1 = await FNB_VOUCHER_COLL.findOne({
                            type: 2,
                            company: infoFunda.company,
                            receivers: { $nin: [infoCustomer.referrer] }, // Chưa từng cấp phát cho Người giới thiệu
                            expired: { $gt: new Date() },
                            salesoffAmount: { $gt: 0 },
                            salesoffRate: 0,
                        })
                            .sort({ expired: 1 })
                            .select('_id name sign')

                        if (infoOffer1) {
                            // console.log('===========Tồn tại Voucher và tiến hành Cấp phát M1==================')

                            // Cấp phát voucher cho người Giới thiệu
                            await FNB_ORDER_VOUCHER_MODEL.update({
                                companyID: infoFunda.company,
                                userID,
                                voucherID: infoOffer1._id,
                                receivers: [infoCustomer.referrer],
                            })

                            // Gán thông tin Thành tích
                            await ITEM__CONTACT_COLL.findByIdAndUpdate(
                                infoCustomer.referrer,
                                {
                                    $addToSet: { achievements: customerID },
                                },
                                { new: true }
                            )

                            /**
                             * Bắn tin Zalo OA cho Người giới thiệu
                             */
                            const str = infoReferral.phone
                            const removeFirst1 = `84${str.slice(1)}`
                            let dataOA = {
                                phone: `${removeFirst1}`,
                                templateData: {
                                    customer_name: infoReferral.name,
                                    order_code: `C${Number(numberOfOrder + 1)}`,
                                    price: amount,
                                    date: moment(new Date()).format(
                                        'HH:mm DD/MM/YYYY'
                                    ),
                                    note: `Bạn mới ${infoCustomer.phone}`,
                                },
                                templateId: '258296',
                            }
                            await ctx.call(
                                `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                                dataOA
                            )

                            /**
                             * Bắn Zalo OA cho Người mới
                             */
                            const str2 = infoCustomer.phone
                            const removeFirst2 = `84${str2.slice(1)}`

                            let dataOA2 = {
                                phone: `${removeFirst2}`,
                                templateData: {
                                    customer_name: infoCustomer.name,
                                    order_code: `C${Number(numberOfOrder + 1)}`,
                                    price: amount,
                                    date: moment(new Date()).format(
                                        'HH:mm DD/MM/YYYY'
                                    ),
                                    note: 'Chi tiết xem link Winggo',
                                },
                                templateId: '257162',
                            }

                            /**
                             * Bắn Zalo OA cho Công ty
                             */
                            let dataOA3 = {
                                phone: '84985199295',
                                templateData: {
                                    customer_name: infoCustomer.name,
                                    order_code: `C${Number(numberOfOrder + 1)}`,
                                    price: amount,
                                    date: moment(new Date()).format(
                                        'HH:mm DD/MM/YYYY'
                                    ),
                                    note: 'Khách hàng mới',
                                },
                                templateId: '257162',
                            }

                            await Promise.all([
                                ctx.call(
                                    `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                                    dataOA2
                                ),
                                ctx.call(
                                    `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                                    dataOA3
                                ),
                            ])
                        }

                        /**
                         * Tạo voucher cho Người giới thiệu theo mã bất kỳ (type=2)
                         * 1-Phân loại Type = 2
                         * 2-Còn thời hạn sử dụng
                         * 3-Voucher tặng Phần trăm
                         * 4-Voucher chưa cấp cho người giới thiệu lần nào
                         */
                        let infoOffer2 = await FNB_VOUCHER_COLL.findOne({
                            type: 2,
                            company: infoFunda.company,
                            receivers: { $nin: [infoCustomer.referrer] }, // Chưa từng cấp phát cho Người giới thiệu
                            expired: { $gt: new Date() },
                            salesoffAmount: 0,
                            salesoffRate: { $gt: 0 },
                        })
                            .sort({ expired: 1 })
                            .select('_id name sign')

                        if (infoOffer2) {
                            // console.log('===========Tồn tại Voucher và tiến hành Cấp phát M2==================')

                            // Cấp phát voucher cho người Giới thiệu
                            await FNB_ORDER_VOUCHER_MODEL.update({
                                companyID: infoFunda.company,
                                userID,
                                voucherID: infoOffer2._id,
                                receivers: [infoCustomer.referrer],
                            })
                        }
                    }
                }

                /**
                 * TEST ZNS XEM CÒN HOẠT ĐỘNG HAY KHÔNG
                 * - Đơn hàng Offline
                 * - Khách hàng đã từng bấm quan tâm Zalo OA
                 */
                if (
                    [1].includes(Number(salesChannel)) &&
                    Number(total) >= 300000
                ) {
                    /**
                     * Số điện thoại không hợp lệ
                     * Nội dung mẫu ZNS không hợp lệ
                     * Mẫu ZNS này không được phép gửi vào ban đêm (từ 22h-6h)
                     * Tài khoản Zalo không tồn tại hoặc đã bị vô hiệu hoá
                     */
                    // console.log('===============BẮN ZNS THỬ NGHIỆM===============>>>>>>>>>>>>>>>')
                    // let hour = Number(moment(new Date()).hours())
                    // console.log({hour})

                    let infoConfig = await ITEM__CONFIG_COLL.findOne({
                        company: infoFunda.company,
                        type: 1,
                        active: 1,
                    })
                    if (infoConfig) {
                        // Xử lý dữ liệu số điện thoại
                        const str = infoCustomer.phone
                        const removeFirst1 = `84${str.slice(1)}`

                        let dataOA1 = {
                            phone: `${removeFirst1}`,
                            templateData: {
                                customer_name: infoCustomer.name,
                                order_code: `C${Number(numberOfOrder + 1)}`,
                                price: total,
                                date: moment(new Date()).format(
                                    'HH:mm DD/MM/YYYY'
                                ),
                                note: 'Chi tiết xem linkProfile',
                            },
                            templateId: infoConfig.template,
                        }
                        await ctx.call(
                            `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                            dataOA1
                        )

                        let dataOA2 = {
                            phone: '84985199295',
                            templateData: {
                                customer_name: infoCustomer.name,
                                order_code: `C${Number(numberOfOrder + 1)}`,
                                price: total,
                                date: moment(new Date()).format(
                                    'HH:mm DD/MM/YYYY'
                                ),
                                note: 'Chi tiết xem linkProfile',
                            },
                            templateId: infoConfig.template,
                        }
                        await ctx.call(
                            `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                            dataOA2
                        )
                    }
                }

                /**
                 * QUẢN LÝ TIẾP THỊ LIÊN KẾT
                 * - Kinh doanh theo mạng lưới
                 * - Trả hoa hồng theo hệ thống
                 * - Lấy các cấp trên và trả hoa hồng theo cấp trên
                 */
                if (affiliateID && checkObjectIDs(affiliateID)) {
                    let infoAffiliate = await ITEM__CONTACT_COLL.findById(
                        affiliateID
                    )
                        .select('nestedParents name sale')
                        .populate({
                            path: 'nestedParents',
                            select: 'level name phone',
                        })
                    // console.log('===========================================')
                    // console.log(infoAffiliate)

                    // Xử lý trả hoa hồng cho cấp trên theo FNB_AFFILIATE_COM
                    let getMaxLevel = 1
                    for (const item of infoAffiliate.nestedParents) {
                        if (item.level > getMaxLevel) {
                            getMaxLevel = item.level
                        }
                    }
                    // console.log({getMaxLevel})

                    // Trả cho Sale
                    await FNB_NETWORK_COM_MODEL.insert({
                        userID,
                        companyID: infoFunda.company,
                        orderID: infoAfterInsert._id,
                        customerID,
                        saleID: affiliateID,
                        amount,
                        uplineID: affiliateID,
                        level: 0, // Người cha đứng cạnh đầu tiên => cấp 1
                        rate: FNB_AFFILIATE_COM[0].rate,
                        commission:
                            (Number(FNB_AFFILIATE_COM[0].rate) * amount) / 100,
                    })

                    for (const item of infoAffiliate.nestedParents) {
                        let networkLevel = Number(getMaxLevel - item.level + 1)
                        // console.log({networkLevel})

                        let infoNetworkCom = await FNB_NETWORK_COM_MODEL.insert(
                            {
                                userID,
                                companyID: infoFunda.company,
                                orderID: infoAfterInsert._id,
                                customerID,
                                saleID: affiliateID,
                                amount,
                                uplineID: item._id,
                                level: networkLevel, // Người cha đứng cạnh đầu tiên => cấp 1
                                rate: FNB_AFFILIATE_COM[Number(networkLevel)]
                                    .rate,
                                commission:
                                    (Number(
                                        FNB_AFFILIATE_COM[Number(networkLevel)]
                                            .rate
                                    ) *
                                        amount) /
                                    100,
                            }
                        )
                        // console.log({infoNetworkCom})
                    }
                }

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF2)

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 2/2/2024
     */
    insert2({
        voucherID,
        fundaID,
        parentID,
        customerID,
        businessID,
        channelID,
        affiliateID,
        shiftID,
        date,
        name,
        appOrderSign,
        note,
        sources,
        salesChannel,
        paymentMethod,
        service,
        total,
        discount,
        salesoff,
        credit,
        offer,
        vatAmount,
        shippingFee,
        paid,
        products,
        userID,
        ctx,
    }) {
        console.log({
            voucherID,
            fundaID,
            parentID,
            customerID,
            businessID,
            channelID,
            affiliateID,
            shiftID,
            date,
            name,
            appOrderSign,
            note,
            sources,
            salesChannel,
            paymentMethod,
            service,
            total,
            discount,
            salesoff,
            credit,
            offer,
            vatAmount,
            shippingFee,
            paid,
            products,
            userID,
        })
        const that = this
        return new Promise(async (resolve) => {
            try {
                if (
                    !name ||
                    !checkObjectIDs(fundaID) ||
                    !checkObjectIDs(customerID) | !checkObjectIDs(businessID) ||
                    !checkObjectIDs(channelID) ||
                    !checkObjectIDs(shiftID)
                )
                    return resolve({
                        error: true,
                        message:
                            'fundaID|customerID|businessID|channelID|shiftID|name invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                // Thông tin cơ sở
                let infoFunda = await ITEM__FUNDA_COLL.findById(fundaID)
                if (!infoFunda)
                    return resolve({
                        error: true,
                        message: 'cannot_get_infoFunda',
                    })

                // Thông tin ca làm việc
                let infoShift = await FNB_SHIFT_COLL.findById(shiftID)
                if (!infoShift)
                    return resolve({
                        error: true,
                        message: 'cannot_get_infoShift',
                    })

                // Thông tin khách hàng
                let infoCustomer = await ITEM__CONTACT_COLL.findById(customerID)
                if (!infoCustomer)
                    return resolve({
                        error: true,
                        message: 'cannot_get_infoCustomer',
                    })

                // Thông tin kênh
                let infoChannel = await ITEM__DOCTYPE_COLL.findById(channelID)

                // Lấy số đơn hàng khách đã mua (thành công)
                let numberOD = await FNB_ORDER_COLL.count({
                    customer: customerID,
                    status: 5,
                })

                /**
                 * Tính mã hóa đơn tự động theo hệ thống (từ 1->N)
                 */
                let numberOfOrder = await FNB_ORDER_COLL.count({
                    company: infoFunda.company,
                })

                let dataInsert = {
                    company: infoFunda.company,
                    funda: fundaID,
                    customer: customerID,
                    business: businessID,
                    channel: channelID,
                    shift: shiftID,
                    name: `${name}-C${Number(numberOfOrder + 1)}`,
                    sign: `C${Number(numberOfOrder + 1)}`,
                    amount: 0,
                    userCreate: userID,
                }

                if (infoChannel.parent) {
                    dataInsert.parentChannel = infoChannel.parent
                }

                /**
                 * B1. CẬP NHẬT THUỘC TÍNH CỦA CƠ SỞ
                 */
                // Thuộc chiến dịch marketing hay không
                if (infoFunda.campaign) {
                    dataInsert.campaign = infoFunda.campaign
                }

                // Thong hoặc ngoài hệ thống
                if (infoFunda.internal) {
                    dataInsert.internal = infoFunda.internal
                }

                // Khu vực
                if (infoFunda.area3) {
                    dataInsert.area1 = infoFunda.area1
                    dataInsert.area2 = infoFunda.area2
                    dataInsert.area3 = infoFunda.area3
                }

                // Quản lý điểm bán
                if (infoFunda.manager) {
                    dataInsert.manager = infoFunda.manager
                }

                // Chiến dịch
                if (
                    infoFunda.campaignName &&
                    checkObjectIDs(infoFunda.campaignName)
                ) {
                    dataInsert.campaignName = infoFunda.campaignName
                }

                /**
                 * B2. CẬP NHẬT THUỘC TÍNH CỦA CA LÀM VIỆC
                 */
                // Mùa trong năm
                if (infoShift.seasons) {
                    dataInsert.seasons = Number(infoShift.seasons)
                }

                // Phân loại ca sáng, chiều, tối, đêm
                if (infoShift.shiftType) {
                    dataInsert.shiftType = Number(infoShift.shiftType)
                }

                /**
                 * B3. CẬP NHẬT THUỘC TÍNH CỦA KHÁCH HÀNG
                 */
                // Phân loại nhân viên
                if (infoCustomer.type && !isNaN(infoCustomer.type)) {
                    dataInsert.customerType = Number(infoCustomer.type)
                }

                // Giới tính
                if (infoCustomer.gender && !isNaN(infoCustomer.gender)) {
                    dataInsert.gender = Number(infoCustomer.gender)
                }

                // Độ tuổi
                if (infoCustomer.birthday) {
                    let dateNow = new Date()
                    dataInsert.age =
                        Number(dateNow.getFullYear()) -
                        Number(infoCustomer.birthday.getFullYear())
                    // console.log(Number(dateNow.getFullYear()) - Number(infoCustomer.birthday.getFullYear()))
                }

                // Người giới thiệu
                if (
                    infoCustomer.referrer &&
                    checkObjectIDs(infoCustomer.referrer)
                ) {
                    dataInsert.referrer = infoCustomer.referrer
                }

                // Phân loại chiến dịch
                if (
                    infoCustomer.campaignType &&
                    checkObjectIDs(infoCustomer.campaignType)
                ) {
                    dataInsert.campaignType = infoCustomer.campaignType
                }

                // Doanh số khách cũ, mới và khách vãng lai
                if (
                    (numberOD && numberOD > 0) ||
                    (infoCustomer.new && infoCustomer.new == 2)
                ) {
                    dataInsert.new = 2 // Đơn hàng khách cũ
                } else {
                    dataInsert.new = 1 // Đơn hàng khách mới
                }

                // Khách vãng lai hay không
                if (
                    infoCustomer.nonResident &&
                    !isNaN(infoCustomer.nonResident)
                ) {
                    dataInsert.nonResident = Number(infoCustomer.nonResident)

                    // Khách vãng lai
                    if (infoCustomer.nonResident == 2) {
                        dataInsert.new = 3 // Khách vãng lai
                    }
                }

                if (date && date != '') {
                    dataInsert.date = date
                }

                // affiliateID
                if (affiliateID && checkObjectIDs(affiliateID)) {
                    dataInsert.affiliate = affiliateID
                }

                if (appOrderSign && appOrderSign != '') {
                    dataInsert.appOrderSign = appOrderSign
                }

                if (note && note != '') {
                    dataInsert.note = note
                }

                if (parentID && checkObjectIDs(parentID)) {
                    dataInsert.parent = parentID
                }

                if (
                    !isNaN(sources) &&
                    [1, 2, 3, 4, 5].includes(Number(sources))
                ) {
                    dataInsert.sources = Number(sources)
                }

                if (
                    !isNaN(paymentMethod) &&
                    [1, 2].includes(Number(paymentMethod))
                ) {
                    dataInsert.paymentMethod = Number(paymentMethod)
                }

                if (
                    !isNaN(salesChannel) &&
                    [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(Number(salesChannel))
                ) {
                    dataInsert.salesChannel = Number(salesChannel)

                    if (salesChannel != 1) {
                        dataInsert.paymentMethod = Number(2) // Chuyển khoản
                    }
                }

                if (!isNaN(shippingFee)) {
                    dataInsert.shippingFee = Number(shippingFee)
                }

                if (!isNaN(paid)) {
                    dataInsert.paid = Number(paid)
                }

                if (!isNaN(service) && [1, 2, 3].includes(Number(service))) {
                    dataInsert.service = Number(service)

                    // Kênh offline
                    if (Number(service) === 1) {
                        dataInsert.salesChannel = Number(1)
                    }
                }

                /**
                 * TÍNH TOÁN GIÁ TRỊ ĐƠN HÀNG
                 */
                let loyaltyPoints = 0,
                    amount = 0

                if (!isNaN(total)) {
                    dataInsert.total = Number(total)
                    amount = Number(total)
                }

                // Chiết khấu
                if (!isNaN(discount) && Number(discount) >= 0) {
                    // dataInsert.discount = Number(discount)
                    // amount = Number(amount) - Number(discount)

                    if (Number(amount) <= Number(discount)) {
                        dataInsert.discount = Number(amount)
                        amount = 0
                    } else {
                        dataInsert.discount = Number(discount)
                        amount = Number(amount) - Number(discount)
                    }
                }

                /**
                 * Tích điểm, giảm giá
                 * TÍCH ĐIỂM NẾU LÀ ĐƠN OFF -> Không tích điểm cho đơn App
                 */
                if (salesChannel == 1) {
                    // Nếu có giảm giá
                    if (!isNaN(salesoff) && Number(salesoff) >= 0) {
                        // Nếu đã giảm giá thì không được tích điểm

                        // dataInsert.salesoff = Number(salesoff)
                        // amount = Number(amount) - Number(salesoff)

                        if (Number(amount) <= Number(salesoff)) {
                            dataInsert.salesoff = Number(amount)
                            amount = 0
                        } else {
                            dataInsert.salesoff = Number(salesoff)
                            amount = Number(amount) - Number(salesoff)
                        }
                    }

                    // Nếu có tích điểm
                    if (!isNaN(credit) && Number(credit) >= 0) {
                        let creditRound = 1000 * Math.round(credit / 1000)

                        if (Number(amount) <= Number(creditRound)) {
                            creditRound = amount
                            amount = 0
                        } else {
                            amount = Number(amount) - Number(creditRound)
                        }

                        dataInsert.credit = Number(creditRound)
                    }

                    /**
                     * Chính sách tích điểm => Mở chính thức vào 1/3/2023
                     */
                    let factor = 0
                    if (
                        Number(infoCustomer.purchasedOffValue) <
                        Number(FNB_FACTOR.credit.level2.purchasedOffValue)
                    ) {
                        factor = Number(FNB_FACTOR.credit.level1.factor)
                    } else {
                        if (
                            Number(infoCustomer.purchasedOffValue) <
                            Number(FNB_FACTOR.credit.level3.purchasedOffValue)
                        ) {
                            factor = Number(FNB_FACTOR.credit.level2.factor)
                        } else {
                            if (
                                Number(infoCustomer.purchasedOffValue) <
                                Number(
                                    FNB_FACTOR.credit.level4.purchasedOffValue
                                )
                            ) {
                                factor = Number(FNB_FACTOR.credit.level3.factor)
                            } else {
                                factor = Number(FNB_FACTOR.credit.level4.factor)
                            }
                        }
                    }

                    /**
                     * OFFER GIẢM GIÁ TỪ VOUCHER
                     */
                    if (voucherID && checkObjectIDs(voucherID)) {
                        /**
                         * Voucher Không có giá trị quy đổi thành tiền mặt
                            Chỉ áp dụng dành riêng đối với đơn hàng tiếp theo
                            Voucher chỉ sử dụng một lần cho một hóa đơn/1 khách hàng
                            Mỗi đơn hàng chỉ được sử dụng một Voucher giảm giá duy nhất
                            Voucher mệnh giá có thể sử dụng chung cho cùng một đơn hàng
                            Không trả lại tiền thừa nếu giá trị Voucher lớn hơn giá trị đơn hàng
                            Voucher chỉ có giá trị trong thời gian được ghi trên thẻ.
                            Voucher không áp dụng chung với các chương trình khuyến mãi khác (trường hợp quý khách muốn sử dụng voucher để áp dụng mua các sản phẩm đang khuyến mãi thì voucher chỉ áp dụng cho giá gốc chưa khuyến mãi của sản phẩm đó).
                        */
                        let infoVoucher =
                            await FNB_VOUCHER_COLL.findById(voucherID)
                        if (!infoVoucher)
                            return resolve({
                                error: true,
                                message: 'cannot_get_infoVoucher',
                            })

                        // Kiểm tra xem đúng VoucherID của customerID hay không
                        if (!infoVoucher.receivers.includes(customerID))
                            return resolve({
                                error: true,
                                message:
                                    'Voucher không áp dụng cho khách hàng này',
                            })

                        // Kiểm tra thời hạn VoucherID
                        let currentTime = new Date()
                        let checkExpired = compareTwoTime(
                            currentTime,
                            infoVoucher.expired
                        )
                        if (checkExpired == 1)
                            return resolve({
                                error: true,
                                message: 'Voucher đã hết hạn',
                            })

                        /**
                         * Kiểm tra giá trị đơn hàng xem có được áp dụng Voucher hay không
                         */
                        if (Number(total) < Number(infoVoucher.minOrderAmount))
                            return resolve({
                                error: true,
                                message: `Đơn hàng không đủ điều kiện áp dụng (Giá trị phải >= ${infoVoucher.minOrderAmount})`,
                            })

                        /**
                         * Kiểm tra xem khách hàng đã sử dụng voucherID hay chưa
                         */
                        if (infoVoucher.buyers.includes(customerID))
                            return resolve({
                                error: true,
                                message: 'Khách hàng đã sử dụng Voucher này',
                            })

                        /**
                         * Kiểm tra nếu Giá trị Voucher
                         */
                        let offer = 0
                        if (Number(infoVoucher.salesoffAmount) > 0) {
                            offer = Number(infoVoucher.salesoffAmount)
                        } else {
                            offer = Number(
                                (Number(infoVoucher.salesoffRate) *
                                    Number(total)) /
                                    100
                            ).toFixed(0)
                        }

                        if (Number(amount) <= Number(offer)) {
                            offer = amount // Set Offer
                            amount = 0 // Set Amount về 0
                        } else {
                            amount = Number(amount) - Number(offer)
                        }

                        dataInsert.voucher = voucherID
                        dataInsert.voucherType = Number(infoVoucher.type)
                        dataInsert.offer = Number(offer)
                    }

                    /**
                     * ĐIỂM TRUNG THÀNH
                     */
                    loyaltyPoints = Number(
                        Number(amount) * Number(factor / 100)
                    ).toFixed(0)
                    dataInsert.loyaltyPoints = Number(loyaltyPoints)
                }

                // Giá trị thanh toán
                dataInsert.amount = Number(amount)

                if (!isNaN(vatAmount)) {
                    dataInsert.vatAmount = Number(vatAmount)
                } else {
                    dataInsert.vatAmount = Number(
                        (amount * Number(FNB_FACTOR.vatRate / 100)) /
                            Number(1 + Number(FNB_FACTOR.vatRate / 100))
                    ).toFixed(0)
                }

                /**
                 * NHÂN VIÊN THỰC HIỆN
                 */
                let numberStaff = 0
                if (infoShift.staffs && infoShift.staffs.length) {
                    numberStaff = infoShift.staffs.length
                    let arrStaffs = infoShift.staffs

                    if (infoShift.subStaffs && infoShift.subStaffs.length) {
                        arrStaffs = [...arrStaffs, ...infoShift.subStaffs]

                        numberStaff =
                            Number(numberStaff) +
                            Number(infoShift.subStaffs.length)
                    }

                    // Nhân viên thực hiện
                    dataInsert.assignee = arrStaffs

                    // Doanh số trung bình/đầu nhân viên (nhiều nhân viên)
                    if (Number(numberStaff) != 0) {
                        dataInsert.avgTotalPerStaff = Number(
                            amount / Number(numberStaff)
                        ).toFixed(0)
                    } else {
                        dataInsert.avgTotalPerStaff = 1
                    }
                } else {
                    numberStaff = 1
                    dataInsert.assignee = [userID]

                    // Doanh số trung bình/đầu nhân viên (1 nhân viên)
                    dataInsert.avgTotalPerStaff = Number(
                        amount / Number(numberStaff)
                    ).toFixed(0)
                }

                /**
                 * KHỐI LƯỢNG SẢN PHẨM
                 */
                let totalQuantity = 0
                if (products && products.length) {
                    for (let item of products) {
                        totalQuantity =
                            Number(totalQuantity) + Number(item.quantity)
                    }

                    dataInsert.numberOfProducts = Number(totalQuantity)

                    // Số lượng sản phẩm trung bình của mỗi nhân viên
                    dataInsert.avgQuantityPerStaff = Number(
                        totalQuantity / Number(numberStaff)
                    ).toFixed(2)
                }

                /**
                 * THÊM SIZE VÀO ĐƠN HÀNG VÀ CA LÀM VIỆC
                 */
                let totalSizeM = 0,
                    totalSizeL = 0
                // console.log('=============1: SẢN PHẨM GIỎ HÀNG==========================>>>>>>>>>>>>>>>>>')
                if (products && products.length) {
                    for (const prodSize of products) {
                        // console.log('=============1.1: Bắt đầu SP==========================>>>>>>>>>>>>>>>>>')
                        // console.log(prodSize)
                        // console.log(prodSize.variants)
                        // console.log(prodSize.fundas)
                        // if(prodSize.doctype && checkObjectIDs(prodSize.doctype)){
                        //     dataInsert.doctype = prodSize.doctype
                        // }
                        if (prodSize.size == 1) {
                            totalSizeM =
                                Number(totalSizeM) + Number(prodSize.quantity)
                        }
                        if (prodSize.size == 2) {
                            totalSizeL =
                                Number(totalSizeL) + Number(prodSize.quantity)
                        }
                        // console.log('=============1.2: Kết thúc SP==========================>>>>>>>>>>>>>>>>>')
                    }
                }
                // console.log('=============2: SẢN PHẨM GIỎ HÀNG==========================>>>>>>>>>>>>>>>>>')

                dataInsert.numberOfSizeM = Number(totalSizeM)
                dataInsert.numberOfSizeL = Number(totalSizeL)

                let infoAfterInsert = await this.insertData(dataInsert)
                if (!infoAfterInsert)
                    return resolve({
                        error: true,
                        message: 'Thêm thất bại',
                        keyError: KEY_ERROR.INSERT_FAILED,
                    })

                /**
                 *  Demo bắn inbox về Facebook
                 */
                // console.log('===============FBOOOOOOOOOOOOOOOOOOOOOOO')
                // let infoFB = await ctx.call(`${CF_DOMAIN_SERVICES.FACEBOOK}.${CF_ACTIONS_FACEBOOK.FACEBOOK_SEND_MESSAGE}`, {
                //     phone: infoCustomer.phone,
                //     message: `Cảm ơn bạn đã mua hàng tại Winggo, giá trị đơn hàng của bạn là ${total} (amount)`,
                // })
                // console.log(infoFB)

                /**
                 * GÁN SẢN PHẨM VÀO ĐƠN HÀNG-SẢN PHẨM
                 */
                const orderID = infoAfterInsert._id
                if (products && products.length) {
                    // Thêm vào đơn hàng-sản phẩm
                    const productsAsync = products.map((product) => {
                        // console.log('============Sản phẩm===============')
                        // console.log({variantsID:product.variantsID})

                        // Tính giá sản phẩm trong trường hợp có cả Topping
                        let newUnitPrice = product.unitPrice
                        // console.log('============Gía 11111111111111111111')
                        // console.log({newUnitPrice})

                        if (
                            product.variantsSelected &&
                            product.variantsSelected.length
                        ) {
                            for (const subProd of product.variantsSelected) {
                                // console.log(subProd)
                                // M-Off
                                if (
                                    Number(product.size) == 1 &&
                                    Number(salesChannel) == 1
                                ) {
                                    newUnitPrice =
                                        Number(newUnitPrice) + subProd.unitPrice
                                }

                                // M-App
                                if (
                                    Number(product.size) == 1 &&
                                    Number(salesChannel) != 1
                                ) {
                                    newUnitPrice =
                                        Number(newUnitPrice) +
                                        subProd.unitPrice2
                                }

                                // L-Off
                                if (
                                    Number(product.size) == 2 &&
                                    Number(salesChannel) == 1
                                ) {
                                    newUnitPrice =
                                        Number(newUnitPrice) +
                                        subProd.unitPrice3
                                }

                                // L-App
                                if (
                                    Number(product.size) == 2 &&
                                    Number(salesChannel) != 1
                                ) {
                                    newUnitPrice =
                                        Number(newUnitPrice) +
                                        subProd.unitPrice4
                                }
                            }
                        }
                        // console.log('============Gía 2222222222222222222')
                        // console.log({newUnitPrice})

                        const dataInsertProduct = {
                            userID,
                            orderID,
                            goodsID: product.productID,
                            black: product.black ? Number(product.size) : 1,
                            size: product.size ? Number(product.size) : 1,
                            sugar: product.sugar ? Number(product.sugar) : 1,
                            ice: product.ice ? Number(product.ice) : 1,
                            subGoodsID: product.variantsID,
                            quantity: product.quantity
                                ? Number(product.quantity)
                                : 0,
                            unitPrice: newUnitPrice,
                            note: product.note,
                        }
                        return FNB_ORDER_GOODS_MODEL.insert(dataInsertProduct)
                    })

                    await Promise.all(productsAsync)
                }

                /**
                 * B5. CẬP NHẬT THÔNG TIN SAU KHI TẠO XONG ĐƠN HÀNG:
                 * - Cơ sở
                 * - Ca làm việc
                 * - Khách hàng
                 */
                let dataUpdateFw = {}

                // Kênh bán hàng, size, doanh số và số sản phẩm
                if (!isNaN(salesChannel) && Number(salesChannel) === 1) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders1: 1,
                        total1: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 2) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders2: 1,
                        total2: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 3) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders3: 1,
                        total3: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 4) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders4: 1,
                        total4: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 5) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders5: 1,
                        total5: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 6) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders6: 1,
                        total6: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 7) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders7: 1,
                        total7: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 8) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders8: 1,
                        total8: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }
                if (!isNaN(salesChannel) && Number(salesChannel) === 9) {
                    dataUpdateFw.$inc = {
                        total: Number(total),
                        amount: Number(amount),
                        numberOfProducts: totalQuantity,
                        numberOfOrders: 1,
                        numberOfOrders9: 1,
                        total9: Number(total),
                        numberOfSizeM: Number(totalSizeM),
                        numberOfSizeL: Number(totalSizeL),
                    }
                }

                // Tiền mặt và chuyển khoản
                if (!isNaN(paymentMethod) && Number(paymentMethod) === 1) {
                    dataUpdateFw.$inc.cashAmount = Number(amount)
                }

                if (!isNaN(paymentMethod) && Number(paymentMethod) === 2) {
                    dataUpdateFw.$inc.transferAmount = Number(amount)
                }
                // console.log(dataUpdateFw)

                /**
                 * CẬP NHẬT VÀO ĐIỂM BÁN/CƠ SỞ
                 */
                await ITEM__FUNDA_COLL.findByIdAndUpdate(fundaID, dataUpdateFw)

                /**
                 * CẬP NHẬT VÀO CA LÀM VIỆC
                 */
                await FNB_SHIFT_COLL.findByIdAndUpdate(shiftID, dataUpdateFw)

                /**
                 * CẬP NHẬT VÀO KHÁCH HÀNG
                 * - Tạm thời chỉ xử lý với đơn Off
                 */
                if (salesChannel == 1) {
                    await that.updateCustomer({ customerID, userID })
                }
                // await that.updateCustomer({ customerID, userID })

                /**
                 * CẬP NHẬT VÀO VOUCHER
                 */
                if (
                    salesChannel == 1 &&
                    voucherID &&
                    checkObjectIDs(voucherID)
                ) {
                    //______Cập nhật thông tin Người sử dụng voucher
                    await FNB_ORDER_VOUCHER_MODEL.update({
                        userID,
                        voucherID,
                        buyers: [customerID],
                    })
                }

                /**
                 * NGƯỜI GIỚI THIỆU
                 */
                if (
                    salesChannel == 1 &&
                    numberOD == 0 &&
                    infoCustomer.referrer &&
                    checkObjectIDs(infoCustomer.referrer)
                ) {
                    // Thông tin người giới thiệu
                    let infoReferral = await ITEM__CONTACT_COLL.findById(
                        infoCustomer.referrer
                    )

                    // Kiểm tra xem Người giới thiệu đã được nhận Voucher khi Bạn của mình mua hàng hay chưa (tránh trường hợp đơn hủy)
                    if (
                        infoReferral &&
                        infoReferral.achievements &&
                        infoReferral.achievements.includes(customerID)
                    ) {
                        // console.log('Đã được tính Ref=========================')
                    } else {
                        // console.log('Chưa được tính Ref=========================')
                        /**
                         * Tạo voucher cho Người giới thiệu theo mã bất kỳ (type=2)
                         * 1-Phân loại Type = 2
                         * 2-Còn thời hạn sử dụng
                         * 3-Voucher tặng Giá trị
                         * 4-Voucher chưa cấp cho người giới thiệu lần nào
                         */
                        let infoOffer1 = await FNB_VOUCHER_COLL.findOne({
                            type: 2,
                            company: infoFunda.company,
                            receivers: { $nin: [infoCustomer.referrer] }, // Chưa từng cấp phát cho Người giới thiệu
                            expired: { $gt: new Date() },
                            salesoffAmount: { $gt: 0 },
                            salesoffRate: 0,
                        })
                            .sort({ expired: 1 })
                            .select('_id name sign')

                        if (infoOffer1) {
                            // console.log('===========Tồn tại Voucher và tiến hành Cấp phát M1==================')

                            // Cấp phát voucher cho người Giới thiệu
                            await FNB_ORDER_VOUCHER_MODEL.update({
                                companyID: infoFunda.company,
                                userID,
                                voucherID: infoOffer1._id,
                                receivers: [infoCustomer.referrer],
                            })

                            // Gán thông tin Thành tích
                            await ITEM__CONTACT_COLL.findByIdAndUpdate(
                                infoCustomer.referrer,
                                {
                                    $addToSet: { achievements: customerID },
                                },
                                { new: true }
                            )

                            /**
                             * Bắn tin Zalo OA cho Người giới thiệu
                             */
                            const str = infoReferral.phone
                            const removeFirst1 = `84${str.slice(1)}`
                            let dataOA = {
                                phone: `${removeFirst1}`,
                                templateData: {
                                    customer_name: infoReferral.name,
                                    order_code: `C${Number(numberOfOrder + 1)}`,
                                    price: amount,
                                    date: moment(new Date()).format(
                                        'HH:mm DD/MM/YYYY'
                                    ),
                                    note: `Bạn mới ${infoCustomer.phone}`,
                                },
                                templateId: '258296',
                            }
                            await ctx.call(
                                `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                                dataOA
                            )

                            /**
                             * Bắn Zalo OA cho Người mới
                             */
                            const str2 = infoCustomer.phone
                            const removeFirst2 = `84${str2.slice(1)}`

                            let dataOA2 = {
                                phone: `${removeFirst2}`,
                                templateData: {
                                    customer_name: infoCustomer.name,
                                    order_code: `C${Number(numberOfOrder + 1)}`,
                                    price: amount,
                                    date: moment(new Date()).format(
                                        'HH:mm DD/MM/YYYY'
                                    ),
                                    note: 'Chi tiết xem link Winggo',
                                },
                                templateId: '257162',
                            }

                            /**
                             * Bắn Zalo OA cho Công ty
                             */
                            let dataOA3 = {
                                phone: '84985199295',
                                templateData: {
                                    customer_name: infoCustomer.name,
                                    order_code: `C${Number(numberOfOrder + 1)}`,
                                    price: amount,
                                    date: moment(new Date()).format(
                                        'HH:mm DD/MM/YYYY'
                                    ),
                                    note: 'Khách hàng mới',
                                },
                                templateId: '257162',
                            }

                            await Promise.all([
                                ctx.call(
                                    `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                                    dataOA2
                                ),
                                ctx.call(
                                    `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                                    dataOA3
                                ),
                            ])
                        }

                        /**
                         * Tạo voucher cho Người giới thiệu theo mã bất kỳ (type=2)
                         * 1-Phân loại Type = 2
                         * 2-Còn thời hạn sử dụng
                         * 3-Voucher tặng Phần trăm
                         * 4-Voucher chưa cấp cho người giới thiệu lần nào
                         */
                        let infoOffer2 = await FNB_VOUCHER_COLL.findOne({
                            type: 2,
                            company: infoFunda.company,
                            receivers: { $nin: [infoCustomer.referrer] }, // Chưa từng cấp phát cho Người giới thiệu
                            expired: { $gt: new Date() },
                            salesoffAmount: 0,
                            salesoffRate: { $gt: 0 },
                        })
                            .sort({ expired: 1 })
                            .select('_id name sign')

                        if (infoOffer2) {
                            // console.log('===========Tồn tại Voucher và tiến hành Cấp phát M2==================')

                            // Cấp phát voucher cho người Giới thiệu
                            await FNB_ORDER_VOUCHER_MODEL.update({
                                companyID: infoFunda.company,
                                userID,
                                voucherID: infoOffer2._id,
                                receivers: [infoCustomer.referrer],
                            })
                        }
                    }
                }

                /**
                 * TEST ZNS XEM CÒN HOẠT ĐỘNG HAY KHÔNG
                 * - Đơn hàng Offline
                 * - Khách hàng đã từng bấm quan tâm Zalo OA
                 */
                if (
                    [1].includes(Number(salesChannel)) &&
                    Number(total) >= 300000
                ) {
                    /**
                     * Số điện thoại không hợp lệ
                     * Nội dung mẫu ZNS không hợp lệ
                     * Mẫu ZNS này không được phép gửi vào ban đêm (từ 22h-6h)
                     * Tài khoản Zalo không tồn tại hoặc đã bị vô hiệu hoá
                     */
                    // console.log('===============BẮN ZNS THỬ NGHIỆM===============>>>>>>>>>>>>>>>')
                    // let hour = Number(moment(new Date()).hours())
                    // console.log({hour})

                    let infoConfig = await ITEM__CONFIG_COLL.findOne({
                        company: infoFunda.company,
                        type: 1,
                        active: 1,
                    })
                    if (infoConfig) {
                        // Xử lý dữ liệu số điện thoại
                        const str = infoCustomer.phone
                        const removeFirst1 = `84${str.slice(1)}`

                        let dataOA1 = {
                            phone: `${removeFirst1}`,
                            templateData: {
                                customer_name: infoCustomer.name,
                                order_code: `C${Number(numberOfOrder + 1)}`,
                                price: total,
                                date: moment(new Date()).format(
                                    'HH:mm DD/MM/YYYY'
                                ),
                                note: 'Chi tiết xem linkProfile',
                            },
                            templateId: infoConfig.template,
                        }
                        await ctx.call(
                            `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                            dataOA1
                        )

                        let dataOA2 = {
                            phone: '84985199295',
                            templateData: {
                                customer_name: infoCustomer.name,
                                order_code: `C${Number(numberOfOrder + 1)}`,
                                price: total,
                                date: moment(new Date()).format(
                                    'HH:mm DD/MM/YYYY'
                                ),
                                note: 'Chi tiết xem linkProfile',
                            },
                            templateId: infoConfig.template,
                        }
                        await ctx.call(
                            `${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_SEND_MESSAGE_ZNS}`,
                            dataOA2
                        )
                    }
                }

                /**
                 * QUẢN LÝ TIẾP THỊ LIÊN KẾT
                 * - Kinh doanh theo mạng lưới
                 * - Trả hoa hồng theo hệ thống
                 * - Lấy các cấp trên và trả hoa hồng theo cấp trên
                 */
                if (affiliateID && checkObjectIDs(affiliateID)) {
                    let infoAffiliate = await ITEM__CONTACT_COLL.findById(
                        affiliateID
                    )
                        .select('nestedParents name sale')
                        .populate({
                            path: 'nestedParents',
                            select: 'level name phone',
                        })
                    // console.log('===========================================')
                    // console.log(infoAffiliate)

                    // Xử lý trả hoa hồng cho cấp trên theo FNB_AFFILIATE_COM
                    let getMaxLevel = 1
                    for (const item of infoAffiliate.nestedParents) {
                        if (item.level > getMaxLevel) {
                            getMaxLevel = item.level
                        }
                    }
                    // console.log({getMaxLevel})

                    // Trả cho Sale
                    await FNB_NETWORK_COM_MODEL.insert({
                        userID,
                        companyID: infoFunda.company,
                        orderID: infoAfterInsert._id,
                        customerID,
                        saleID: affiliateID,
                        amount,
                        uplineID: affiliateID,
                        level: 0, // Người cha đứng cạnh đầu tiên => cấp 1
                        rate: FNB_AFFILIATE_COM[0].rate,
                        commission:
                            (Number(FNB_AFFILIATE_COM[0].rate) * amount) / 100,
                    })

                    for (const item of infoAffiliate.nestedParents) {
                        let networkLevel = Number(getMaxLevel - item.level + 1)
                        // console.log({networkLevel})

                        let infoNetworkCom = await FNB_NETWORK_COM_MODEL.insert(
                            {
                                userID,
                                companyID: infoFunda.company,
                                orderID: infoAfterInsert._id,
                                customerID,
                                saleID: affiliateID,
                                amount,
                                uplineID: item._id,
                                level: networkLevel, // Người cha đứng cạnh đầu tiên => cấp 1
                                rate: FNB_AFFILIATE_COM[Number(networkLevel)]
                                    .rate,
                                commission:
                                    (Number(
                                        FNB_AFFILIATE_COM[Number(networkLevel)]
                                            .rate
                                    ) *
                                        amount) /
                                    100,
                            }
                        )
                        // console.log({infoNetworkCom})
                    }
                }

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF2)

                return resolve({ error: false, data: infoAfterInsert })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Update
     * Author: HiepNH
     * Code: 24/11/2022
     */
    update({
        orderID,
        userID,
        customerID,
        cancelNote,
        shippingFeeTotal,
        shippingFee,
        paid,
        filesID,
        status,
        paymentMethod,
        salesChannel,
        starRating,
        complaintID,
        complaint,
    }) {
        // console.log({ orderID, userID, customerID, cancelNote, shippingFeeTotal, shippingFee, paid, filesID, status, paymentMethod, salesChannel, starRating, complaintID, complaint })
        const that = this
        return new Promise(async (resolve) => {
            try {
                /**
                 * BA
                 * 1-CẬP NHẬT ĐƠN HÀNG:
                 * - Hủy đơn
                 * - Phương thức thanh toán
                 * - Kênh bán hàng => Đồng thời cập nhật Phương thức thanh toán
                 * - Gán lỗi
                 * 2.1-CẬP NHẬT THÔNG TIN NGƯỢC LẠI VÀO CA LÀM VIỆC
                 * 2.2-CẬP NHẬT THÔNG TIN NGƯỢC LẠI VÀO ĐƠN VỊ CƠ SỞ
                 * 2.3-CẬP NHẬT THÔNG TIN NGƯỢC LẠI VÀO KHÁCH HÀNG (CŨ, MỚI)
                 */
                /**
                 * BA
                 * - Nếu cập nhật Đơn hàng sang trạng thái hủy: status = 5 (Hoàn thành) -> 4 (Hủy)
                 * => Xóa định mức hao phí (fnb_order_material)
                 * => Cập nhật status cho order_product
                 * => Cập nhật khối lượng giao ca...
                 * ***CẬP NHẬT LẠI MÃ KHÁCH
                 * => Cập nhật lại thông tin của đơn hàng vào Khách mới => Xóa thông tin ở Khách cũ
                 */
                if (!checkObjectIDs(orderID))
                    return resolve({
                        error: true,
                        message: 'orderID invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let infoOrder = await FNB_ORDER_COLL.findById(orderID)
                if (!infoOrder)
                    return resolve({
                        error: true,
                        message: 'orderID invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let oldCustomerID = infoOrder.customer
                let oldSalesChannel = infoOrder.salesChannel
                let oldComplaint = infoOrder.complaint || 0

                let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

                if (cancelNote) {
                    dataUpdate.note = cancelNote
                }

                if (checkObjectIDs(filesID)) {
                    dataUpdate.$addToSet = { files: filesID }
                }

                /**
                 * CẬP NHẬT TRẠNG THÁI-HỦY ĐƠN
                 */
                if (!isNaN(status)) {
                    dataUpdate.status = Number(status)
                }

                if (!isNaN(starRating)) {
                    dataUpdate.starRating = Number(starRating)
                }

                if (!isNaN(complaint)) {
                    dataUpdate.complaint = Number(complaint)
                }

                if (checkObjectIDs(complaintID)) {
                    dataUpdate.$addToSet = { complaints: complaintID }

                    let newComplaint = Number(oldComplaint) + 1
                    dataUpdate.complaint = Number(newComplaint)
                }

                if (!isNaN(shippingFeeTotal)) {
                    dataUpdate.shippingFeeTotal = Number(shippingFeeTotal)
                }

                if (!isNaN(shippingFee)) {
                    dataUpdate.shippingFee = Number(shippingFee)
                }

                if (!isNaN(paid)) {
                    dataUpdate.paid = Number(paid)
                }

                /**
                 * CẬP NHẬT PHƯƠNG THỨC THANH TOÁN
                 */
                if (!isNaN(paymentMethod)) {
                    if (Number(oldSalesChannel) >= 2) {
                        dataUpdate.paymentMethod = Number(2) // Đơn App
                    } else {
                        // Đơn Off
                        dataUpdate.paymentMethod = Number(paymentMethod)
                    }
                }

                /**
                 * CẬP NHẬT KÊNH BÁN HÀNG
                 * Chỉ áp dụng cho chuyển đổi giữa các App
                 */
                if (!isNaN(salesChannel) && Number(salesChannel) >= 2) {
                    dataUpdate.salesChannel = Number(salesChannel)
                    dataUpdate.paymentMethod = Number(2) // Chuyển khoản
                }

                /**
                 * CẬP NHẬT KHÁCH HÀNG
                 * 1-Cập nhật mã khách mới vào đơn hàng
                 * 2-Cập nhật mã khách mới vào đơn hàng, sản phẩm
                 * 3-Cập nhật doanh số vào Khách cũ
                 * 4-Cập nhật doanh số vào Khách mới
                 */
                if (customerID && checkObjectIDs(customerID)) {
                    let infoCustomer =
                        await ITEM__CONTACT_COLL.findById(customerID)
                    if (!infoCustomer)
                        return resolve({
                            error: true,
                            message: 'customerID invalid',
                            keyError: KEY_ERROR.PARAMS_INVALID,
                        })

                    // Tên đơn hàng
                    dataUpdate.name = `Đơn hàng ${infoCustomer.name}-${infoCustomer.phone}-${infoOrder.sign}`

                    // Mã khách
                    dataUpdate.customer = customerID

                    // Phân loại nhân viên
                    if (infoCustomer.type && !isNaN(infoCustomer.type)) {
                        dataUpdate.customerType = Number(infoCustomer.type)
                    }

                    // Giới tính
                    if (infoCustomer.gender && !isNaN(infoCustomer.gender)) {
                        dataUpdate.gender = Number(infoCustomer.gender)
                    }

                    // Độ tuổi
                    if (infoCustomer.birthday) {
                        let dateNow = new Date()
                        dataUpdate.age =
                            Number(dateNow.getFullYear()) -
                            Number(infoCustomer.birthday.getFullYear())
                        // console.log(Number(dateNow.getFullYear()) - Number(infoCustomer.birthday.getFullYear()))
                    }

                    // Người giới thiệu
                    if (
                        infoCustomer.referrer &&
                        checkObjectIDs(infoCustomer.referrer)
                    ) {
                        dataUpdate.referrer = infoCustomer.referrer
                    }

                    // Phân loại chiến dịch
                    if (
                        infoCustomer.campaignType &&
                        checkObjectIDs(infoCustomer.campaignType)
                    ) {
                        dataUpdate.campaignType = infoCustomer.campaignType
                    }

                    // Doanh số khách cũ, mới
                    let numberOD = await FNB_ORDER_COLL.count({
                        customer: customerID,
                    })
                    if (
                        (numberOD && numberOD > 0) ||
                        (infoCustomer.new && infoCustomer.new == 2)
                    ) {
                        dataUpdate.new = 2 // Đơn hàng khách cũ
                    } else {
                        dataUpdate.new = 1 // Đơn hàng khách mới
                    }

                    // Khách vãng lai hay không
                    if (
                        infoCustomer.nonResident &&
                        !isNaN(infoCustomer.nonResident)
                    ) {
                        dataUpdate.nonResident = Number(
                            infoCustomer.nonResident
                        )

                        // Khách vãng lai
                        if (infoCustomer.nonResident == 2) {
                            dataUpdate.new = 3 // Khách vãng lai
                        }
                    }
                }

                // console.log(dataUpdate)

                let infoAfterUpdate = await FNB_ORDER_COLL.findByIdAndUpdate(
                    orderID,
                    dataUpdate,
                    { new: true }
                )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: KEY_ERROR.UPDATE_FAILED,
                    })

                /**
                 * CẬP NHẬT VÀO CÁC COLL LIÊN QUAN
                 */
                // 1. Cập nhật vào ca làm việc
                if (
                    !isNaN(status) ||
                    !isNaN(paymentMethod) ||
                    !isNaN(salesChannel)
                ) {
                    await that.updateShift({ shiftID: infoOrder.shift, userID })
                }

                // 2. Cập nhật vào đơn vị cơ sở

                // 3. Cập nhật vào khách hàng: MỚI VÀ CŨ
                if (customerID && checkObjectIDs(customerID)) {
                    // console.log('============111111111111111-KHÁCH HÀNG MỚI=============>>>>>>>>>')
                    await that.updateCustomer({ customerID, userID })

                    // console.log('============222222222222222-KHÁCH HÀNG CŨ=============>>>>>>>>>')
                    await that.updateCustomer({
                        customerID: oldCustomerID,
                        userID,
                    })

                    // Cập nhật đơn hàng, sản phẩm
                    await FNB_ORDER_PRODUCT_COLL.updateMany(
                        {
                            order: ObjectID(orderID),
                        },
                        { $set: { customer: customerID } }
                    )
                }

                // 4. Cập nhật thông tin cho khách hàng (áp dụng khi cập nhật trạng thái)
                if (!isNaN(status)) {
                    await that.updateCustomer({
                        customerID: oldCustomerID,
                        userID,
                    })
                }

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Cập nhật ca làm việc
     * Author: HiepNH
     * Code: 24/11/2022
     */
    updateShift({ shiftID, option, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(shiftID))
                    return resolve({
                        error: true,
                        message: 'shiftID invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

                let numberOfOrders = 0
                let numberOfCancelOrders = 0
                let totalOfCancelOrders = 0
                let cashAmount = 0
                let transferAmount = 0
                let numberOfSizeM = 0
                let numberOfSizeL = 0
                let numberOfOrders1 = 0
                let numberOfOrders2 = 0
                let numberOfOrders3 = 0
                let numberOfOrders4 = 0
                let numberOfOrders5 = 0
                let numberOfOrders6 = 0
                let numberOfOrders7 = 0
                let numberOfOrders8 = 0
                let numberOfOrders9 = 0
                let total = 0
                let total1 = 0
                let total2 = 0
                let total3 = 0
                let total4 = 0
                let total5 = 0
                let total6 = 0
                let total7 = 0
                let total8 = 0
                let total9 = 0

                // Tổng hợp thông tin từ các đơn hàng: Đơn HOÀN THÀNH
                let listData = await FNB_ORDER_COLL.aggregate([
                    {
                        $match: {
                            shift: ObjectID(shiftID),
                        },
                    },
                    {
                        $group: {
                            _id: {
                                salesChannel: '$salesChannel',
                                paymentMethod: '$paymentMethod',
                                status: '$status',
                            },
                            quantity: { $sum: 1 },
                            numberOfProducts: { $sum: '$numberOfProducts' },
                            total: { $sum: '$total' },
                            discount: { $sum: '$discount' },
                            salesoff: { $sum: '$salesoff' },
                            amount: { $sum: '$amount' },
                        },
                    },
                ])
                // console.log(listData)

                if (listData && listData.length) {
                    for (const item of listData) {
                        // console.log(item)
                        /**
                         * ĐƠN HOÀN THÀNH
                         */
                        if (item._id.status && item._id.status == 5) {
                            // console.log('---------------------->>>>>>>>>>>>>>>>>>')
                            numberOfOrders =
                                Number(numberOfOrders) + Number(item.quantity)

                            // Tiền mặt và chuyển khoản
                            if (
                                item._id.paymentMethod &&
                                item._id.paymentMethod == 1
                            ) {
                                // console.log('==========TIỀN MẶT============')
                                cashAmount =
                                    Number(cashAmount) + Number(item.amount)

                                console.log({ cashAmount })
                            } else {
                                // console.log('==========CHUYỂN KHOẢN============')
                                transferAmount =
                                    Number(transferAmount) + Number(item.amount)
                            }

                            // Kênh bán hàng
                            if (item._id.salesChannel) {
                                total = Number(total) + Number(item.total)

                                if (
                                    item._id.salesChannel &&
                                    item._id.salesChannel == 1
                                ) {
                                    numberOfOrders1 =
                                        Number(numberOfOrders1) +
                                        Number(item.quantity)
                                    total1 = Number(total1) + Number(item.total)
                                }

                                if (
                                    item._id.salesChannel &&
                                    item._id.salesChannel == 2
                                ) {
                                    numberOfOrders2 =
                                        Number(numberOfOrders2) +
                                        Number(item.quantity)
                                    total2 = Number(total2) + Number(item.total)
                                }

                                if (
                                    item._id.salesChannel &&
                                    item._id.salesChannel == 3
                                ) {
                                    numberOfOrders3 =
                                        Number(numberOfOrders3) +
                                        Number(item.quantity)
                                    total3 = Number(total3) + Number(item.total)
                                }

                                if (
                                    item._id.salesChannel &&
                                    item._id.salesChannel == 4
                                ) {
                                    numberOfOrders4 =
                                        Number(numberOfOrders4) +
                                        Number(item.quantity)
                                    total4 = Number(total4) + Number(item.total)
                                }

                                if (
                                    item._id.salesChannel &&
                                    item._id.salesChannel == 5
                                ) {
                                    numberOfOrders5 =
                                        Number(numberOfOrders5) +
                                        Number(item.quantity)
                                    total5 = Number(total5) + Number(item.total)
                                }

                                if (
                                    item._id.salesChannel &&
                                    item._id.salesChannel == 6
                                ) {
                                    numberOfOrders6 =
                                        Number(numberOfOrders6) +
                                        Number(item.quantity)
                                    total6 = Number(total6) + Number(item.total)
                                }

                                if (
                                    item._id.salesChannel &&
                                    item._id.salesChannel == 7
                                ) {
                                    numberOfOrders7 =
                                        Number(numberOfOrders7) +
                                        Number(item.quantity)
                                    total7 = Number(total7) + Number(item.total)
                                }

                                if (
                                    item._id.salesChannel &&
                                    item._id.salesChannel == 8
                                ) {
                                    numberOfOrders8 =
                                        Number(numberOfOrders8) +
                                        Number(item.quantity)
                                    total8 = Number(total8) + Number(item.total)
                                }

                                if (
                                    item._id.salesChannel &&
                                    item._id.salesChannel == 9
                                ) {
                                    numberOfOrders9 =
                                        Number(numberOfOrders9) +
                                        Number(item.quantity)
                                    total9 = Number(total9) + Number(item.total)
                                }
                            }
                        }

                        /**
                         * ĐƠN HỦY
                         */
                        if (item._id.status && item._id.status == 4) {
                            numberOfCancelOrders =
                                Number(numberOfCancelOrders) +
                                Number(item.quantity)
                            totalOfCancelOrders =
                                Number(totalOfCancelOrders) + Number(item.total)
                        }
                    }
                }

                /**
                 * SỐ LƯỢNG SIZE M, L
                 */
                // Danh sách các đơn hàng hoàn thành
                let listOrders = await FNB_ORDER_COLL.find({
                    shift: shiftID,
                    status: 5,
                })
                let listData1 = await FNB_ORDER_PRODUCT_COLL.aggregate([
                    {
                        $match: {
                            order: {
                                $in: listOrders.map((item) =>
                                    ObjectID(item._id)
                                ),
                            },
                            shift: ObjectID(shiftID),
                        },
                    },
                    {
                        $group: {
                            _id: { size: '$size' },
                            quantity: { $sum: '$quantity' },
                        },
                    },
                ])
                // console.log(listData1)
                if (listData1 && listData1.length) {
                    for (const item of listData1) {
                        if (item._id.size && item._id.size == 1) {
                            numberOfSizeM =
                                Number(numberOfSizeM) + Number(item.quantity)
                        } else {
                            numberOfSizeL =
                                Number(numberOfSizeL) + Number(item.quantity)
                        }
                    }
                }

                dataUpdate.numberOfOrders = Number(numberOfOrders)
                dataUpdate.numberOfCancelOrders = Number(numberOfCancelOrders)
                dataUpdate.totalOfCancelOrders = Number(totalOfCancelOrders)
                dataUpdate.numberOfSizeM = Number(numberOfSizeM)
                dataUpdate.numberOfSizeL = Number(numberOfSizeL)
                dataUpdate.cashAmount = Number(cashAmount)
                dataUpdate.transferAmount = Number(transferAmount)
                dataUpdate.numberOfOrders1 = Number(numberOfOrders1)
                dataUpdate.numberOfOrders2 = Number(numberOfOrders2)
                dataUpdate.numberOfOrders3 = Number(numberOfOrders3)
                dataUpdate.numberOfOrders4 = Number(numberOfOrders4)
                dataUpdate.numberOfOrders5 = Number(numberOfOrders5)
                dataUpdate.numberOfOrders6 = Number(numberOfOrders6)
                dataUpdate.numberOfOrders7 = Number(numberOfOrders7)
                dataUpdate.numberOfOrders8 = Number(numberOfOrders8)
                dataUpdate.numberOfOrders9 = Number(numberOfOrders9)
                dataUpdate.total = Number(total)
                dataUpdate.total1 = Number(total1)
                dataUpdate.total2 = Number(total2)
                dataUpdate.total3 = Number(total3)
                dataUpdate.total4 = Number(total4)
                dataUpdate.total5 = Number(total5)
                dataUpdate.total6 = Number(total6)
                dataUpdate.total7 = Number(total7)
                dataUpdate.total8 = Number(total8)
                dataUpdate.total9 = Number(total9)

                // console.log(dataUpdate)

                let infoAfterUpdate = await FNB_SHIFT_COLL.findByIdAndUpdate(
                    shiftID,
                    dataUpdate,
                    { new: true }
                )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: KEY_ERROR.UPDATE_FAILED,
                    })

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Cập nhật khách hàng
     * Author: HiepNH
     * Code: 24/11/2022
     */
    updateCustomer({ customerID, option, userID }) {
        //
        // console.log({ customerID, option, userID })
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(customerID))
                    return resolve({
                        error: true,
                        message: 'customerID invalid',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })

                let dataUpdate = { userUpdate: userID, modifyAt: new Date() }

                let numberOfOrders = 0
                let total = 0
                let purchasedValue = 0
                let purchasedOffValue = 0
                let totalLoyaltyPoints = 0
                let usedLoyaltyPoints = 0
                let remainLoyaltyPoints = 0 // Tính theo totalLoyaltyPoints-usedLoyaltyPoints
                let numberOfCancelOrders = 0 // Số đơn hủy
                let totalOfCancelOrders = 0 // Giá trị đơn hủy

                // Đơn hàng hoàn thành
                let listData1 = await FNB_ORDER_COLL.aggregate([
                    {
                        $match: {
                            customer: ObjectID(customerID),
                            status: 5,
                        },
                    },
                    {
                        $group: {
                            _id: {},
                            quantity: { $sum: 1 },
                            total: { $sum: '$total' },
                            amount: { $sum: '$amount' },
                        },
                    },
                ])

                // Đơn hàng hủy
                let listData2 = await FNB_ORDER_COLL.aggregate([
                    {
                        $match: {
                            customer: ObjectID(customerID),
                            status: 4,
                        },
                    },
                    {
                        $group: {
                            _id: {},
                            quantity: { $sum: 1 },
                            total: { $sum: '$total' },
                        },
                    },
                ])

                // Đơn hàng được tích điểm (đơn off)
                let listData3 = await FNB_ORDER_COLL.aggregate([
                    {
                        $match: {
                            customer: ObjectID(customerID),
                            status: 5, // Đơn đã hoàn thành
                            salesChannel: 1, // Kênh offline
                        },
                    },
                    {
                        $group: {
                            _id: {},
                            amount: { $sum: '$amount' },
                            loyaltyPoints: { $sum: '$loyaltyPoints' }, // Điểm tích lũy sau mỗi đơn hàng
                            credit: { $sum: '$credit' }, // Điểm đã sử dụng để trừ giảm giá
                        },
                    },
                ])

                // Gói trả trước
                let listData4 = await FIN__CASH_PAYMENT_COLL.aggregate([
                    {
                        $match: {
                            customer: ObjectID(customerID),
                            active: 1, // Hoạt động
                        },
                    },
                    {
                        $group: {
                            _id: {},
                            amount: { $sum: '$amount' },
                        },
                    },
                ])
                // console.log(listData)
                // console.log(listData1)
                // console.log(listData2)
                // console.log(listData3)
                // console.log(listData4)

                /**
                 * Đơn hàng đã mua
                 */
                if (listData1 && listData1.length) {
                    numberOfOrders = Number(listData1[0].quantity)
                    total = Number(listData1[0].total)
                    purchasedValue = Number(listData1[0].amount)

                    if (numberOfOrders > 1) {
                        dataUpdate.new = 2
                    } else {
                        dataUpdate.new = 1
                    }

                    dataUpdate.numberOfOrders = Number(numberOfOrders)
                    dataUpdate.total = Number(total)
                    dataUpdate.purchasedValue = Number(purchasedValue)
                } else {
                    // Áp dụng cho khách mua xong -> boom hàng dẫn tới Hủy đơn
                    dataUpdate.numberOfOrders = 0
                    dataUpdate.total = 0
                    dataUpdate.purchasedValue = 0
                }

                /**
                 * Đơn hàng đã hủy
                 */
                if (listData2 && listData2.length) {
                    numberOfCancelOrders = Number(listData2[0].quantity)
                    totalOfCancelOrders = Number(listData2[0].total)

                    dataUpdate.numberOfCancelOrders =
                        Number(numberOfCancelOrders)
                    dataUpdate.totalOfCancelOrders = Number(totalOfCancelOrders)
                }

                /**
                 * Tích điểm
                 */
                if (listData3 && listData3.length) {
                    // Giá trị thanh toán đơn Off hoàn thành
                    purchasedOffValue = Number(listData3[0].amount)
                    totalLoyaltyPoints =
                        Number(totalLoyaltyPoints) +
                        Number(listData3[0].loyaltyPoints)
                    usedLoyaltyPoints = Number(listData3[0].credit)
                }

                /**
                 * Gói mua trả trước
                 */
                if (listData4 && listData4.length) {
                    totalLoyaltyPoints =
                        Number(totalLoyaltyPoints) + Number(listData4[0].amount)
                }

                // Giá trị còn lại
                remainLoyaltyPoints =
                    Number(totalLoyaltyPoints) - Number(usedLoyaltyPoints)

                // Update dữ liệu
                dataUpdate.purchasedOffValue = Number(purchasedOffValue)
                dataUpdate.totalLoyaltyPoints = Number(totalLoyaltyPoints)
                dataUpdate.usedLoyaltyPoints = Number(usedLoyaltyPoints)
                dataUpdate.remainLoyaltyPoints = Number(remainLoyaltyPoints)

                let infoAfterUpdate =
                    await ITEM__CONTACT_COLL.findByIdAndUpdate(
                        customerID,
                        dataUpdate,
                        { new: true }
                    )
                if (!infoAfterUpdate)
                    return resolve({
                        error: true,
                        message: 'Cập nhật thất bại',
                        keyError: KEY_ERROR.UPDATE_FAILED,
                    })

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name: Get info
     * Author: HiepNH
     * Code: 24/11/2022
     */
    getInfo({ orderID, select, populates = {}, ctx }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(orderID))
                    return resolve({ error: true, message: 'param_invalid' })

                // populate
                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request params populates invalid',
                            status: 400,
                        })

                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                let infoPlanGroup = await FNB_ORDER_COLL.findById(orderID)
                    .select(select)
                    .populate(populates)

                if (!infoPlanGroup)
                    return resolve({
                        error: true,
                        message: 'cannot_get',
                        keyError: KEY_ERROR.GET_INFO_FAILED,
                    })

                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                return resolve({ error: false, data: infoPlanGroup })
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    /**
     * Name  : Get list
     * Author: HiepNH
     * Code: 24/11/2022
     */
    getList({
        type,
        option,
        companyID,
        fundasID,
        shiftsID,
        assigneesID,
        shiftTypes,
        salesChannels,
        services,
        statuss,
        fromDate,
        toDate,
        isMistake,
        isDiscount,
        isSalesoff,
        isCredit,
        isOffer,
        isNonResident,
        isCustomerType,
        isComplaint,
        isCampaignType,
        isPaymentMethod,
        starRating,
        managerID,
        keyword,
        limit = 10,
        lastestID,
        select,
        populates,
        sortKey,
        userID,
        customerID,
        voucherID,
        productID,
        ctx,
    }) {
        // console.log({ type, companyID, fundasID, shiftsID, assigneesID, shiftTypes, salesChannels, services, statuss, fromDate, toDate, isMistake, isDiscount, isSalesoff, isCredit, isOffer, isNonResident, isCustomerType, keyword, limit, lastestID, select, populates, sortKey, userID, customerID, voucherID, productID })
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                if (Number(limit) > 10) {
                    limit = 10
                } else {
                    limit = +Number(limit)
                }

                let conditionObj = {}
                let sortBy
                let keys = ['createAt__-1', '_id__-1']

                if (
                    !checkObjectIDs(customerID) &&
                    !checkObjectIDs(voucherID) &&
                    !checkObjectIDs(productID)
                ) {
                    // console.log('==============Trường hợp 1111111111===============>')
                    conditionObj.company = ObjectID(companyID)

                    const validation = validateParamsObjectID({
                        fundasID: { value: fundasID, isRequire: false },
                    })
                    if (validation.error) return resolve(validation)

                    // Gom nhóm theo đơn vị cơ sở
                    if (fundasID && fundasID.length) {
                        // console.log('==============Trường hợp 2222222222===============>')
                        let arrFun = fundasID.map((item) => ObjectID(item))

                        if (arrFun.length) {
                            conditionObj.funda = { $in: arrFun }
                        }
                    } else {
                        let listFundaIsMember = await ITEM__FUNDA_COLL.find({
                            members: { $in: [userID] },
                        })
                        let fundasIDIsMember = listFundaIsMember.map((item) =>
                            ObjectID(item._id)
                        )
                        if (fundasIDIsMember.length) {
                            // console.log('==============Trường hợp 33333333333===============>')
                            conditionObj.funda = { $in: fundasIDIsMember }
                        } else {
                            // console.log('==============Trường hợp 44444444444===============>')
                            conditionObj.funda = { $in: [] }
                        }
                    }
                } else {
                    // Tìm theo Khách hàng
                    if (customerID && checkObjectIDs(customerID)) {
                        // console.log('==============Trường hợp 5555555555===============>')
                        limit = 5
                        conditionObj.customer = ObjectID(customerID)
                    } else {
                        if (voucherID && checkObjectIDs(voucherID)) {
                            // console.log('==============Trường hợp 5555555555===============>')
                            limit = 5
                            conditionObj.voucher = ObjectID(voucherID)
                        }

                        // Tìm theo Sản phẩm
                        if (productID && checkObjectIDs(productID)) {
                            // console.log('==============Trường hợp 66666666666===============>')
                            let listOP = await FNB_ORDER_PRODUCT_COLL.find({
                                product: ObjectID(productID),
                                company: ObjectID(companyID),
                            }).select('_id order product')
                            // console.log(listOP)

                            conditionObj._id = {
                                $in: listOP.map((item) => item.order),
                            }
                            limit = 5
                        }
                    }
                }

                // Lấy danh sách phục vụ gán Chăm sóc khách hàng
                if (option && option == 1) {
                    conditionObj = { company: companyID }
                }

                if (type && type == 1) {
                    conditionObj.affiliate = { $exists: true, $ne: null }
                }
                // console.log({option})
                // console.log(conditionObj)

                shiftsID &&
                    shiftsID.length &&
                    (conditionObj.shift = { $in: shiftsID })
                assigneesID &&
                    assigneesID.length &&
                    (conditionObj.assignee = { $in: assigneesID })
                shiftTypes &&
                    shiftTypes.length &&
                    (conditionObj.shiftType = { $in: shiftTypes })
                salesChannels &&
                    salesChannels.length &&
                    (conditionObj.salesChannel = { $in: salesChannels })
                services &&
                    services.length &&
                    (conditionObj.service = { $in: services })
                statuss &&
                    statuss.length &&
                    (conditionObj.status = { $in: statuss })

                // Phân loại khác
                if (isMistake && isMistake == 1) {
                    conditionObj.numberOfMistakes = { $gt: 0 }
                }

                if (isNonResident && isNonResident == 1) {
                    conditionObj.nonResident = 2
                }

                if (isDiscount && isDiscount == 1) {
                    conditionObj.discount = { $gt: 0 }
                }

                if (isSalesoff && isSalesoff == 1) {
                    conditionObj.salesoff = { $gt: 0 }
                }

                if (isCredit && isCredit == 1) {
                    conditionObj.credit = { $gt: 0 }
                }

                if (isOffer && isOffer == 1) {
                    conditionObj.offer = { $gt: 0 }
                }

                if (isPaymentMethod && isPaymentMethod == 1) {
                    conditionObj.paymentMethod = 1
                }
                if (isPaymentMethod && isPaymentMethod == 2) {
                    conditionObj.paymentMethod = 2
                }

                if (isCustomerType && isCustomerType == 1) {
                    conditionObj.customerType = 1
                }
                if (isCustomerType && isCustomerType == 2) {
                    conditionObj.customerType = 2
                }

                if (isComplaint && isComplaint == 1) {
                    conditionObj.complaint = { $gt: 0 }
                }

                if (isCampaignType && isCampaignType == 1) {
                    conditionObj.campaignType = { $exists: true, $ne: null }
                }

                if (starRating && !isNaN(starRating)) {
                    conditionObj.starRating = Number(starRating)
                }

                if (managerID && checkObjectIDs(managerID)) {
                    conditionObj.manager = managerID
                }

                // Phân loại theo thời khoảng
                if (isValidDate(fromDate) && isValidDate(toDate)) {
                    conditionObj.createAt = {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate),
                    }
                }

                if (populates && typeof populates === 'string') {
                    if (!IsJsonString(populates))
                        return resolve({
                            error: true,
                            message: 'Request params populates invalid',
                            status: 400,
                        })

                    populates = JSON.parse(populates)
                } else {
                    populates = {
                        path: '',
                        select: '',
                    }
                }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    const regSearch = new RegExp(keyword, 'i')

                    conditionObj.name = regSearch
                }
                // console.log(conditionObj)

                if (select && typeof select === 'string') {
                    if (!IsJsonString(select))
                        return resolve({
                            error: true,
                            message: 'Request params select invalid',
                            status: 400,
                        })

                    select = JSON.parse(select)
                }

                let conditionObjOrg = { ...conditionObj }
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoData = await FNB_ORDER_COLL.findById(lastestID)
                    if (!infoData)
                        return resolve({
                            error: true,
                            message: "Can't get info last message",
                            status: 400,
                        })

                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: infoData,
                        objectQuery: conditionObjOrg,
                    })
                    if (!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({
                            error: true,
                            message: "Can't get range pagination",
                            status: 400,
                        })
                    conditionObj = dataPagingAndSort.data.find
                    sortBy = dataPagingAndSort.data.sort
                } else {
                    let dataPagingAndSort = RANGE_BASE_PAGINATION_V2({
                        keys,
                        latestRecord: null,
                        objectQuery: conditionObjOrg,
                    })
                    sortBy = dataPagingAndSort.data.sort
                }

                let infoDataAfterGet = await FNB_ORDER_COLL.find(conditionObj)
                    .limit(limit + 1)
                    .sort(sortBy)
                    .select(select)
                    .populate(populates)
                    .lean()

                if (!infoDataAfterGet)
                    return resolve({
                        error: true,
                        message: "Can't get data",
                        status: 403,
                    })

                let nextCursor = null
                if (infoDataAfterGet && infoDataAfterGet.length) {
                    if (infoDataAfterGet.length > limit) {
                        nextCursor = infoDataAfterGet[limit - 1]?._id
                        infoDataAfterGet.length = limit
                    }
                }
                let totalRecord = await FNB_ORDER_COLL.count(conditionObjOrg)
                let totalPage = Math.ceil(totalRecord / limit)

                // console.log({totalRecord})

                return resolve({
                    error: false,
                    data: {
                        listRecords: infoDataAfterGet,
                        limit: limit,
                        totalRecord,
                        totalPage,
                        nextCursor,
                    },
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Name: Danh sách theo phân loại
     * Author: HiepNH
     * Code: 24/11/2022
     */
    getListByProperty({
        companyID,
        fundasID,
        fundas,
        customerID,
        optionFixFunda,
        option,
        optionGroup,
        optionStatus,
        optionTime,
        year,
        month,
        fromDate,
        toDate,
        voucherType,
        userID,
        staffID,
        optionStar,
        duration,
        ctx,
    }) {
        // console.log({ companyID, fundasID, fundas, customerID, optionFixFunda, option, optionGroup, optionStatus, optionTime, year, month, fromDate, toDate, voucherType, userID, staffID, optionStar, duration })
        return new Promise(async (resolve) => {
            try {
                // Record Traffic
                //await ctx.call(`${CF_DOMAIN_SERVICES.ANALYSIS}.${CF_ACTIONS_ANALYSIS.HISTORY_TRAFFIC_INSERT}`, dataTF)

                let duration = getTimeBetween(toDate, fromDate)
                // console.log({duration:duration/86400})
                if (Number(duration / 86400) > 370) {
                    return resolve({
                        error: true,
                        message:
                            'Chỉ tra cứu được trong khoảng thời gian <= 90 ngày',
                        keyError: KEY_ERROR.PARAMS_INVALID,
                    })
                } else {
                    let yearFilter
                    let currentYear = new Date().getFullYear()
                    if (year && !isNaN(year)) {
                        yearFilter = Number(year)
                    } else {
                        yearFilter = Number(currentYear)
                    }

                    let conditionObj = { company: ObjectID(companyID) }
                    let conditionGroup = {}
                    let conditionObjYear = {},
                        conditionPopulate = {},
                        sortBy = { total: -1 }

                    const validation = validateParamsObjectID({
                        fundasID: { value: fundasID, isRequire: false },
                    })
                    if (validation.error) return resolve(validation)

                    if (!checkObjectIDs(customerID)) {
                        // Gom nhóm theo đơn vị cơ sở
                        if (fundasID && fundasID.length) {
                            let arrFun = fundasID.map((item) => ObjectID(item))
                            conditionObj.funda = { $in: arrFun }
                        } else {
                            let listFundaIsMember = await ITEM__FUNDA_COLL.find(
                                { members: { $in: [userID] } }
                            )
                            let fundasIDIsMember = listFundaIsMember.map(
                                (item) => ObjectID(item._id)
                            )
                            if (fundasIDIsMember.length) {
                                conditionObj.funda = { $in: fundasIDIsMember }
                            } else {
                                conditionObj.funda = { $in: [] }
                            }
                        }
                    } else {
                        conditionObj.customer = ObjectID(customerID)
                    }

                    // Xử lý lỗi fundas[] trên Mobile
                    if (optionFixFunda && Number(optionFixFunda) === 1) {
                        if (fundas && Number(fundas.length) > 2) {
                            let arr = fundas.split('"')
                            let arrFun2 = arr[1]
                                .split(' ')
                                .map((item) => ObjectID(item))
                            conditionObj.funda = { $in: arrFun2 }
                        } else {
                            let listFundaIsMember = await ITEM__FUNDA_COLL.find(
                                { members: { $in: [userID] } }
                            )
                            let fundasIDIsMember = listFundaIsMember.map(
                                (item) => ObjectID(item._id)
                            )
                            if (fundasIDIsMember.length) {
                                conditionObj.funda = { $in: fundasIDIsMember }
                            } else {
                                conditionObj.funda = { $in: [] }
                            }
                        }
                    }

                    /**
                     * Phân loại theo trạng thái đơn hàng
                     * - Xử lý tình huống tạm thời
                     */
                    if (!optionStatus) {
                        conditionObj.status = Number(5)
                    } else {
                        // Đơn hủy
                        conditionObj.status = Number(4)
                    }

                    // Phân loại theo thời khoảng
                    if (fromDate && toDate) {
                        conditionObj.createAt = {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate),
                        }
                    }

                    /**
                     * Gom nhóm theo Phân loại căn bản
                     */
                    if (option && Number(option) == 1) {
                        conditionGroup = {
                            // _id: { new: "$new", shiftType: "$shiftType", internal: "$internal", salesChannel: "$salesChannel", paymentMethod: "$paymentMethod", doctype: "$doctype" },
                            _id: {
                                new: '$new',
                                internal: '$internal',
                                salesChannel: '$salesChannel',
                                paymentMethod: '$paymentMethod',
                            },
                            quantity: { $sum: 1 },
                            total: { $sum: '$total' },
                            discount: { $sum: '$discount' },
                            salesoff: { $sum: '$salesoff' },
                            credit: { $sum: '$credit' },
                            offer: { $sum: '$offer' },
                            amount: { $sum: '$amount' },
                            vatAmount: { $sum: '$vatAmount' },
                            numberOfProducts: { $sum: '$numberOfProducts' },
                        }
                    }

                    /**
                     * Gom nhóm theo Thời gian
                     * - Số lượng đơn hàng
                     * - Giá trị đơn hàng
                     * - Số lượng sản phẩm
                     */
                    if (option && Number(option) == 2) {
                        // Theo năm
                        if (optionTime && Number(optionTime) == 1) {
                            conditionGroup = {
                                _id: { year: '$year' },
                                quantity: { $sum: 1 },
                                total: { $sum: '$total' },
                                discount: { $sum: '$discount' },
                                salesoff: { $sum: '$salesoff' },
                                credit: { $sum: '$credit' },
                                offer: { $sum: '$offer' },
                                amount: { $sum: '$amount' },
                                vatAmount: { $sum: '$vatAmount' },
                                numberOfProducts: { $sum: '$numberOfProducts' },
                            }
                        }

                        // Theo tháng trong năm
                        if (optionTime && Number(optionTime) == 2) {
                            conditionObjYear = {
                                year: Number(yearFilter),
                            }

                            // Gom nhóm theo số sao
                            if (optionStar && !isNaN(optionStar)) {
                                conditionObj.starRating = Number(optionStar)
                            }
                            // else{
                            //     conditionObj.starRating = {$gte: 4}
                            // }

                            // Gom nhóm theo khiếu nại của khách
                            if (optionGroup && Number(optionGroup) == 1) {
                                conditionObj.complaint = { $gte: 1 }
                            }

                            conditionGroup = {
                                _id: { month: '$month', year: '$year' },
                                quantity: { $sum: 1 },
                                total: { $sum: '$total' },
                                discount: { $sum: '$discount' },
                                salesoff: { $sum: '$salesoff' },
                                credit: { $sum: '$credit' },
                                offer: { $sum: '$offer' },
                                amount: { $sum: '$amount' },
                                vatAmount: { $sum: '$vatAmount' },
                                numberOfProducts: { $sum: '$numberOfProducts' },
                            }
                        }

                        // Theo giờ trong ngày (trả về kết quả +7 giờ => bằng giờ trong DB)
                        if (optionTime && Number(optionTime) == 3) {
                            conditionGroup = {
                                _id: { hour: '$hour' },
                                quantity: { $sum: 1 },
                                total: { $sum: '$total' },
                                discount: { $sum: '$discount' },
                                salesoff: { $sum: '$salesoff' },
                                credit: { $sum: '$credit' },
                                offer: { $sum: '$offer' },
                                amount: { $sum: '$amount' },
                                vatAmount: { $sum: '$vatAmount' },
                                numberOfProducts: { $sum: '$numberOfProducts' },
                            }
                        }

                        // Theo ngày trong tuần
                        if (optionTime && Number(optionTime) == 4) {
                            // Gom nhóm theo số sao
                            if (optionStar && !isNaN(optionStar)) {
                                conditionObj.starRating = Number(optionStar)
                            }
                            // else{
                            //     conditionObj.starRating = {$gte: 4}
                            // }

                            // Gom nhóm theo khiếu nại của khách
                            if (optionGroup && Number(optionGroup) == 1) {
                                conditionObj.complaint = { $gte: 1 }
                            }

                            conditionGroup = {
                                _id: { dayOfWeek: '$dayOfWeek' },
                                quantity: { $sum: 1 },
                                total: { $sum: '$total' },
                                discount: { $sum: '$discount' },
                                salesoff: { $sum: '$salesoff' },
                                credit: { $sum: '$credit' },
                                offer: { $sum: '$offer' },
                                amount: { $sum: '$amount' },
                                vatAmount: { $sum: '$vatAmount' },
                                numberOfProducts: { $sum: '$numberOfProducts' },
                            }
                        }

                        // Theo ngày trong tháng
                        if (optionTime && Number(optionTime) == 5) {
                            // Gom nhóm theo số sao
                            if (optionStar && !isNaN(optionStar)) {
                                conditionObj.starRating = Number(optionStar)
                            }
                            // else{
                            //     conditionObj.starRating = {$gte: 4}
                            // }

                            // Gom nhóm theo khiếu nại của khách
                            if (optionGroup && Number(optionGroup) == 1) {
                                conditionObj.complaint = { $gte: 1 }
                            }

                            conditionGroup = {
                                _id: { day: '$day' },
                                quantity: { $sum: 1 },
                                total: { $sum: '$total' },
                                discount: { $sum: '$discount' },
                                salesoff: { $sum: '$salesoff' },
                                credit: { $sum: '$credit' },
                                offer: { $sum: '$offer' },
                                amount: { $sum: '$amount' },
                                vatAmount: { $sum: '$vatAmount' },
                                numberOfProducts: { $sum: '$numberOfProducts' },
                            }
                        }
                    }

                    /**
                     * Gom nhóm theo Đơn vị cơ sở
                     */
                    if (option && Number(option) == 3) {
                        // Gom nhóm theo số sao
                        if (optionStar && !isNaN(optionStar)) {
                            conditionObj.starRating = Number(optionStar)
                        } else {
                            conditionObj.starRating = { $gte: 4 }
                        }

                        // Gom nhóm theo khiếu nại của khách
                        if (optionGroup && Number(optionGroup) == 1) {
                            conditionObj.complaint = { $gte: 1 }
                        }

                        conditionGroup = {
                            _id: { funda: '$funda' },
                            quantity: { $sum: 1 },
                            total: { $sum: '$total' },
                            discount: { $sum: '$discount' },
                            salesoff: { $sum: '$salesoff' },
                            credit: { $sum: '$credit' },
                            offer: { $sum: '$offer' },
                            amount: { $sum: '$amount' },
                            vatAmount: { $sum: '$vatAmount' },
                            numberOfProducts: { $sum: '$numberOfProducts' },
                        }

                        conditionPopulate = {
                            path: '_id.funda',
                            select: '_id name sign image',
                            model: 'funda',
                        }
                    }

                    /**
                     * Gom nhóm theo Khách hàng
                     */
                    if (option && Number(option) == 4) {
                        conditionGroup = {
                            _id: { customer: '$customer' },
                            quantity: { $sum: 1 },
                            total: { $sum: '$total' },
                            discount: { $sum: '$discount' },
                            salesoff: { $sum: '$salesoff' },
                            credit: { $sum: '$credit' },
                            offer: { $sum: '$offer' },
                            amount: { $sum: '$amount' },
                            vatAmount: { $sum: '$vatAmount' },
                            numberOfProducts: { $sum: '$numberOfProducts' },
                            loyaltyPoints: { $sum: '$loyaltyPoints' },
                        }
                    }

                    /**
                     * Gom nhóm theo Nhân viên phục vụ
                     */
                    if (option && Number(option) == 5) {
                        conditionObj.assignee = { $in: [ObjectID(userID)] }
                        conditionGroup = {
                            _id: {},
                            avgQuantityPerStaff: {
                                $sum: '$avgQuantityPerStaff',
                            },
                            avgTotalPerStaff: { $sum: '$avgTotalPerStaff' },
                        }
                    }

                    /**
                     * Gom nhóm theo Khu vực
                     */
                    if (option && Number(option) == 6) {
                        conditionGroup = {
                            _id: { area: '$area1' },
                            quantity: { $sum: 1 },
                            total: { $sum: '$total' },
                            discount: { $sum: '$discount' },
                            salesoff: { $sum: '$salesoff' },
                            credit: { $sum: '$credit' },
                            offer: { $sum: '$offer' },
                            amount: { $sum: '$amount' },
                            vatAmount: { $sum: '$vatAmount' },
                            numberOfProducts: { $sum: '$numberOfProducts' },
                        }

                        conditionPopulate = {
                            path: '_id.area',
                            select: '_id name sign',
                            model: 'area',
                        }
                    }

                    /**
                     * Gom nhóm theo Nhân viên phục vụ
                     */
                    if (option && Number(option) == 7) {
                        conditionGroup = {
                            _id: { assignee: '$assignee._id' },
                            quantity: { $sum: 1 },
                            avgQuantityPerStaff: {
                                $sum: '$avgQuantityPerStaff',
                            },
                            avgTotalPerStaff: { $sum: '$avgTotalPerStaff' },
                        }

                        conditionPopulate = {
                            path: '_id.assignee',
                            select: '_id fullname',
                            model: 'user',
                        }

                        sortBy = { avgQuantityPerStaff: -1 }
                    }

                    /**
                     * Gom nhóm theo Khách hàng tiềm năng/Thời gian
                     */
                    if (option && Number(option) == 8) {
                        conditionGroup = {
                            _id: { customer: '$customer' },
                            numberOfOrders: { $sum: 1 },
                            numberOfProducts: { $sum: '$numberOfProducts' },
                            total: { $sum: '$total' },
                            discount: { $sum: '$discount' },
                            salesoff: { $sum: '$salesoff' },
                            credit: { $sum: '$credit' },
                            offer: { $sum: '$offer' },
                            amount: { $sum: '$amount' },
                            vatAmount: { $sum: '$vatAmount' },
                        }

                        conditionPopulate = {
                            path: '_id.customer',
                            select: '_id name phone address funda',
                            model: 'contact',
                            populate: {
                                path: 'funda',
                                select: 'name sign',
                                model: 'funda',
                            },
                        }

                        sortBy = { amount: -1 }
                    }

                    /**
                     * Gom nhóm theo Nhân sự-Sản phẩm
                     */
                    if (option && Number(option) == 9) {
                        delete conditionObj.company
                        delete conditionObj.funda
                        conditionObj.assignee = { $in: [ObjectID(staffID)] }

                        conditionGroup = {
                            _id: { shift: '$shift' },
                            avgQuantityPerStaff: {
                                $sum: '$avgQuantityPerStaff',
                            },
                            avgTotalPerStaff: { $sum: '$avgTotalPerStaff' },
                        }

                        sortBy = { '_id.shift': -1 }

                        conditionPopulate = {
                            path: '_id.shift',
                            select: '_id name funda createAt',
                            model: 'fnb_shift',
                            populate: {
                                path: 'funda',
                                select: '_id name',
                                model: 'funda',
                            },
                        }
                    }

                    /**
                     * Gom nhóm theo Quản lý điểm bán
                     */
                    if (option && Number(option) == 10) {
                        // Gom nhóm theo số sao
                        if (optionStar && !isNaN(optionStar)) {
                            conditionObj.starRating = Number(optionStar)
                        } else {
                            conditionObj.starRating = { $gte: 4 }
                        }

                        // Gom nhóm theo khiếu nại của khách
                        if (optionGroup && Number(optionGroup) == 1) {
                            conditionObj.complaint = { $gte: 1 }
                        }

                        // Chỉ lấy các mẩu tin có dữ liệu quản lý
                        conditionObj.manager = { $exists: true, $ne: null }

                        conditionGroup = {
                            _id: { manager: '$manager' },
                            quantity: { $sum: 1 },
                        }

                        conditionPopulate = {
                            path: '_id.manager',
                            select: '_id fullname',
                            model: 'user',
                        }
                    }

                    /**
                     * Gom nhóm theo Phân loại lỗi
                     */
                    if (option && Number(option) == 11) {
                        // Gom nhóm theo số sao
                        if (optionStar && !isNaN(optionStar)) {
                            conditionObj.starRating = Number(optionStar)
                        } else {
                            conditionObj.starRating = { $gte: 4 }
                        }

                        // Gom nhóm theo khiếu nại của khách
                        if (optionGroup && Number(optionGroup) == 1) {
                            conditionObj.complaint = { $gte: 1 }
                        }

                        conditionPopulate = {
                            path: '_id.doctype',
                            select: '_id name',
                            model: 'doctype',
                        }
                    }

                    /**
                     * GOM NHÓM THEO VOUCHER
                     */
                    if (option && Number(option) == 12) {
                        conditionObj.voucher = { $exists: true, $ne: null }

                        if (voucherType && !isNaN(voucherType)) {
                            conditionObj.voucherType = Number(voucherType)
                        }

                        conditionObjYear = {
                            year: Number(yearFilter),
                        }

                        // Theo năm
                        if (optionTime && Number(optionTime) == 1) {
                            conditionGroup = {
                                _id: { year: '$year' },
                                quantity: { $sum: 1 },
                            }
                        }

                        // Theo tháng trong năm
                        if (optionTime && Number(optionTime) == 2) {
                            conditionGroup = {
                                _id: { month: '$month', year: '$year' },
                                quantity: { $sum: 1 },
                            }
                        }

                        // Theo ngày trong tháng
                        if (optionTime && Number(optionTime) == 3) {
                            conditionObjYear = {
                                year: Number(yearFilter),
                                month: Number(month),
                            }

                            conditionGroup = {
                                _id: { day: '$day' },
                                quantity: { $sum: 1 },
                            }
                        }

                        // Theo phân loại voucher
                        if (optionTime && Number(optionTime) == 4) {
                            conditionObjYear = {
                                year: Number(yearFilter),
                                month: Number(month),
                            }

                            conditionGroup = {
                                _id: { voucherType: '$voucherType' },
                                quantity: { $sum: 1 },
                            }
                        }
                    }

                    /**
                     * Gom nhóm theo Quản lý
                     */
                    if (option && Number(option) == 13) {
                        conditionObj.manager = { $exists: true, $ne: null }

                        conditionGroup = {
                            _id: { manager: '$manager' },
                            quantity: { $sum: 1 },
                        }

                        conditionPopulate = {
                            path: '_id.manager',
                            select: '_id fullname',
                            model: 'user',
                        }
                    }

                    /**
                     * Gom nhóm theo nhân viên hủy đơn
                     */
                    if (option && Number(option) == 14) {
                        conditionObj.status = 4

                        conditionGroup = {
                            _id: { assignee: '$assignee._id' },
                            quantity: { $sum: 1 },
                        }

                        conditionPopulate = {
                            path: '_id.assignee',
                            select: '_id fullname department',
                            model: 'user',
                            populate: {
                                path: 'department',
                                select: '_id name',
                                model: 'department',
                            },
                        }

                        sortBy = { quantity: -1 }
                    }

                    /**
                     * Tỷ lệ khách hàng quay lại
                     */
                    // if(option && Number(option) == 15){
                    //     conditionGroup = {
                    //         _id: { customer: "$customer" },
                    //         numberOfOrders: { $sum: 1 },
                    //         numberOfProducts: { $sum: "$numberOfProducts" },
                    //         total: { $sum: "$total" },
                    //         amount: { $sum: "$amount" },
                    //     }

                    //     sortBy = {"numberOfOrders": -1}
                    // }

                    if (option && Number(option) == 16) {
                        conditionGroup = {
                            _id: {},
                            credit: { $sum: '$credit' },
                            loyaltyPoints: { $sum: '$loyaltyPoints' },
                            amount: { $sum: '$amount' },
                        }
                    }

                    // console.log(conditionObj)
                    // console.log(conditionObjYear)
                    // console.log(conditionGroup)

                    let listData

                    // Gom nhóm theo nhân viên phục vụ
                    if (option && Number(option) == 7) {
                        listData = await FNB_ORDER_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$createAt' },
                                    month: { $month: '$createAt' },
                                    day: { $dayOfMonth: '$createAt' },
                                    company: 1,
                                    funda: 1,
                                    createAt: 1,
                                    assignee: 1,
                                    executor: 1,
                                    numberOfProducts: 1,
                                    avgTotalPerStaff: 1,
                                    avgQuantityPerStaff: 1,
                                },
                            },
                            {
                                $match: conditionObjYear,
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'assignee',
                                    foreignField: '_id',
                                    as: 'assignee',
                                },
                            },
                            {
                                $unwind: '$assignee',
                            },
                            {
                                $group: conditionGroup,
                            },
                            {
                                $sort: sortBy,
                            },
                        ])
                    } else if (option && Number(option) == 11) {
                        // Gom nhóm theo phân loại khiếu nại
                        listData = await FNB_ORDER_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $lookup: {
                                    from: 'doctypes',
                                    localField: 'complaints',
                                    foreignField: '_id',
                                    as: 'doctype',
                                },
                            },
                            {
                                $unwind: '$doctype',
                            },
                            {
                                $group: {
                                    _id: { doctype: '$doctype._id' },
                                    quantity: { $sum: 1 },
                                },
                            },
                        ])
                    } else if (option && Number(option) == 14) {
                        // Gom nhóm theo nhân viên hủy đơn
                        listData = await FNB_ORDER_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$createAt' },
                                    month: { $month: '$createAt' },
                                    day: { $dayOfMonth: '$createAt' },
                                    company: 1,
                                    funda: 1,
                                    createAt: 1,
                                    assignee: 1,
                                },
                            },
                            {
                                $match: conditionObjYear,
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'assignee',
                                    foreignField: '_id',
                                    as: 'assignee',
                                },
                            },
                            {
                                $unwind: '$assignee',
                            },
                            {
                                $group: conditionGroup,
                            },
                            {
                                $sort: sortBy,
                            },
                        ])
                    } else {
                        listData = await FNB_ORDER_COLL.aggregate([
                            {
                                $match: conditionObj,
                            },
                            {
                                $project: {
                                    year: { $year: '$createAt' },
                                    month: { $month: '$createAt' },
                                    day: { $dayOfMonth: '$createAt' },
                                    dayOfWeek: { $dayOfWeek: '$createAt' },
                                    hour: { $hour: '$createAt' },
                                    funda: 1,
                                    customer: 1,
                                    new: 1,
                                    assignee: 1,
                                    campaign: 1,
                                    activeCampaign: 1,
                                    internal: 1,
                                    area1: 1,
                                    area2: 1,
                                    area3: 1,
                                    shift: 1,
                                    shiftType: 1,
                                    seasons: 1,
                                    salesChannel: 1,
                                    paymentMethod: 1,
                                    service: 1,
                                    status: 1,
                                    numberOfMistakes: 1,
                                    numberOfProducts: 1,
                                    total: 1,
                                    salesoff: 1,
                                    discount: 1,
                                    credit: 1,
                                    offer: 1,
                                    amount: 1,
                                    vatAmount: 1,
                                    avgQuantityPerStaff: 1,
                                    avgTotalPerStaff: 1,
                                    gender: 1,
                                    age: 1,
                                    loyaltyPoints: 1,
                                    manager: 1,
                                    starRating: 1,
                                    complaint: 1,
                                    voucherType: 1,
                                },
                            },
                            {
                                $match: conditionObjYear,
                            },
                            {
                                $group: conditionGroup,
                            },
                            {
                                $sort: sortBy,
                            },
                        ])
                    }
                    // console.log(listData.length)

                    if (
                        !isNaN(option) &&
                        [3, 6, 7, 8, 9, 10, 11, 13, 14].includes(Number(option))
                    ) {
                        await FNB_ORDER_COLL.populate(
                            listData,
                            conditionPopulate
                        )
                    }

                    return resolve({ error: false, data: listData })
                }
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Name: Import Excel
     * Code: Hiepnh
     * Date: 21/3/2024
     */
    importFromExcel({ option, companyID, dataImport, userID }) {
        // console.log({option, companyID, dataImport, userID})
        return new Promise(async (resolve) => {
            try {
                const dataImportJSON = JSON.parse(dataImport)
                let index = 0
                let errorNumber = 0

                // if(!option){
                //     for (const data of dataImportJSON) {
                //         if(index > 0 && index <= 250){
                //             let dataInsert = {
                //                 companyID,
                //                 userID,
                //                 parentID,
                //                 accountID: data?.__EMPTY_14,
                //                 customerID: data?.__EMPTY_15,
                //                 contractID: data?.__EMPTY_16,
                //                 name: data?.__EMPTY_1,
                //                 note: data?.__EMPTY_7,
                //                 date: data?.__EMPTY_13,
                //                 income: data?.__EMPTY_5,
                //                 expense: data?.__EMPTY_6
                //             }

                //             let infoAfterInsert = await this.insert(dataInsert);
                //             if(infoAfterInsert.error){
                //                 errorNumber++;
                //             }
                //         }
                //         index ++;
                //     }

                //     if(errorNumber != 0)
                //         return resolve({ error: true, message: "import field" });

                //     return resolve({ error: false, message: "import success" });
                // }else{

                // }
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: HiepNH
     * Func: Tải KPI
     * Date: 8/12/2022
     * LỖI GÂY CHẬM DO FROMDATE - TODATE KÉO DÀI CẢ NĂM
     * https://docs.google.com/document/d/1hRYD5pLK7G3n37-Cs-N732cifa1Z3-W1dV8sTSRInfY/edit
     */
    exportExcel({ companyID, year, month, email, userID, queryFnb }) {
        // console.log({ companyID, year, month, userID, queryFnb })
        return new Promise(async (resolve) => {
            try {
                // if(FNB_ACC.cskh.includes(email.toString()) || FNB_ACC.man.includes(email.toString()) || FNB_ACC.taichinh.includes(email.toString())){
                if (1 > 0) {
                    let yearFilter
                    let currentYear = new Date().getFullYear()
                    let currentMonth = new Date().getMonth() + 1

                    let obj = JSON.parse(queryFnb)
                    if (obj.fromDate && obj.toDate) {
                        currentMonth = new Date(obj.toDate).getMonth() + 1
                        currentYear = new Date(obj.toDate).getFullYear()
                    }

                    if (year && !isNaN(year)) {
                        yearFilter = Number(year)
                    } else {
                        yearFilter = Number(currentYear)
                    }

                    let conditionObj = {
                        company: ObjectID(companyID),
                        status: 5,
                        avgQuantityPerStaff: { $exists: true, $ne: null },
                    }
                    let projectObj = {
                        year: { $year: '$createAt' },
                        month: { $month: '$createAt' },
                        company: 1,
                        funda: 1,
                        createAt: 1,
                        assignee: 1,
                        executor: 1,
                        total: 1,
                        amount: 1,
                        avgQuantityPerStaff: 1,
                    }
                    let lookupObj = {
                        from: 'users',
                        localField: 'assignee',
                        foreignField: '_id',
                        as: 'staff',
                    }
                    let conditionGroup = {}
                    let conditionPopulate = {},
                        sortBy = { '_id.month': -1, avgQuantityPerStaff: -1 }

                    let conditionObjYear = {
                        year: Number(yearFilter),
                        month: {
                            $in: [
                                currentMonth - 2,
                                currentMonth - 1,
                                currentMonth,
                            ],
                        },
                    }

                    conditionGroup = {
                        _id: {
                            staff: '$staff._id',
                            month: '$month',
                            year: '$year',
                        },
                        avgQuantityPerStaff: { $sum: '$avgQuantityPerStaff' },
                    }

                    conditionPopulate = {
                        path: '_id.staff',
                        select: '_id fullname department',
                        populate: {
                            path: 'department',
                            select: '_id name',
                            model: 'department',
                        },
                        model: 'user',
                    }

                    /**
                     * LỖI MẮC PHẢI
                     */
                    let conditionGroupErr = {
                        _id: { executor: '$executor', month: '$month' },
                        number: { $sum: 1 },
                        amount: { $sum: '$amount' },
                    }
                    let conditionPopulateErr = {
                        path: '_id.executor',
                        select: '_id fullname department',
                        populate: {
                            path: 'department',
                            select: '_id name',
                            model: 'department',
                        },
                        model: 'user',
                    }
                    // console.log(conditionObjYear)

                    let listDataErr = await FNB_MISTAKE_COLL.aggregate([
                        {
                            $match: {
                                company: ObjectID(companyID),
                            },
                        },
                        {
                            $project: projectObj,
                        },
                        {
                            $match: conditionObjYear,
                        },
                        {
                            $group: conditionGroupErr,
                        },
                        {
                            $sort: { '_id.month': -1 },
                        },
                    ])
                    await FNB_MISTAKE_COLL.populate(
                        listDataErr,
                        conditionPopulateErr
                    )
                    // console.log(listDataErr)

                    /**
                     * DOANH SỐ
                     */
                    let listDataR = await FNB_ORDER_COLL.aggregate([
                        {
                            $match: conditionObj,
                        },
                        {
                            $project: projectObj,
                        },
                        {
                            $match: conditionObjYear,
                        },
                        {
                            $lookup: lookupObj,
                        },
                        {
                            $unwind: '$staff',
                        },
                        {
                            $group: conditionGroup,
                        },
                        {
                            $sort: sortBy,
                        },
                    ])
                    await FNB_SHIFT_COLL.populate(listDataR, conditionPopulate)
                    // console.log(listDataR)

                    // Modify the workbook.
                    XlsxPopulate.fromFileAsync(
                        path.resolve(
                            __dirname,
                            '../../../files/templates/excels/fnb_export_kpi.xlsx'
                        )
                    ).then(async (workbook) => {
                        var i = 3
                        listDataR?.forEach((item, index) => {
                            workbook
                                .sheet('DoanhSo')
                                .row(i)
                                .cell(1)
                                .value(Number(index + 1))
                            workbook
                                .sheet('DoanhSo')
                                .row(i)
                                .cell(2)
                                .value(item?._id?.staff.fullname)
                            workbook
                                .sheet('DoanhSo')
                                .row(i)
                                .cell(3)
                                .value(`${item?._id.staff?.department?.name}`)
                            // workbook.sheet("DoanhSo").row(i).cell(5).value(item?.number);
                            // workbook.sheet("DoanhSo").row(i).cell(6).value(item?.avgTotalPerStaff);
                            workbook
                                .sheet('DoanhSo')
                                .row(i)
                                .cell(4)
                                .value(Number(item?._id?.month))
                            workbook
                                .sheet('DoanhSo')
                                .row(i)
                                .cell(5)
                                .value(
                                    item?.avgQuantityPerStaff != null
                                        ? Number(item?.avgQuantityPerStaff)
                                        : 0
                                )

                            i++
                        })

                        /**
                         * PHẠT LỖI VI PHẠM
                         */
                        var i = 3
                        listDataErr?.forEach((item, index) => {
                            workbook
                                .sheet('Err')
                                .row(i)
                                .cell(1)
                                .value(Number(index + 1))
                            workbook
                                .sheet('Err')
                                .row(i)
                                .cell(2)
                                .value(item?._id?.executor.fullname)
                            workbook
                                .sheet('Err')
                                .row(i)
                                .cell(3)
                                .value(
                                    `${item?._id.executor?.department?.name}`
                                )
                            workbook
                                .sheet('Err')
                                .row(i)
                                .cell(4)
                                .value(item?._id.month)
                            workbook
                                .sheet('Err')
                                .row(i)
                                .cell(5)
                                .value(item?.number)
                            workbook
                                .sheet('Err')
                                .row(i)
                                .cell(6)
                                .value(item?.amount)

                            i++
                        })

                        const now = new Date()
                        const filePath = '../../../files/temporary_uploads/'
                        const fileName = `BaoCaoKPI_${now.getTime()}.xlsx`
                        const pathWriteFile = path.resolve(
                            __dirname,
                            filePath,
                            fileName
                        )

                        await workbook.toFileAsync(pathWriteFile)
                        const result = await uploadFileS3(
                            pathWriteFile,
                            fileName
                        )

                        fs.unlinkSync(pathWriteFile)
                        return resolve({
                            error: false,
                            data: result?.Location,
                            status: 200,
                        })
                    })
                } else {
                    return resolve({
                        error: true,
                        message: 'Bạn không có quyền',
                        status: 500,
                    })
                }
            } catch (error) {
                console.log({ error })
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: HiepNH
     * Func: Tải Đơn hàng và Doanh số
     * Date: 4/2/2023
     */
    exportExcel2({
        companyID,
        option,
        month,
        year,
        fromDate,
        toDate,
        filterParams,
        email,
        userID,
    }) {
        // console.log({ companyID, option, month, year, fromDate, toDate, filterParams, email, userID })
        return new Promise(async (resolve) => {
            try {
                if (
                    FNB_ACC.cskh.includes(email.toString()) ||
                    FNB_ACC.man.includes(email.toString()) ||
                    FNB_ACC.taichinh.includes(email.toString())
                ) {
                    // DANH SÁCH ĐƠN HÀNG
                    if (!option || option == undefined) {
                        let conditionObj = { company: companyID }

                        let obj = JSON.parse(filterParams)

                        let fundasID = obj.fundasID
                        let shiftTypes = obj.shiftTypes
                        let fromDate = obj.fromDate
                        let toDate = obj.toDate
                        let keyword = obj.keyword
                        let salesChannels = obj.salesChannels
                        let statuss = obj.statuss
                        let isMistake = obj.isMistake
                        let isDiscount = obj.isDiscount
                        let isSalesoff = obj.isSalesoff
                        let isCredit = obj.isCredit
                        let isOffer = obj.isOffer
                        let isNonResident = obj.isNonResident
                        let isCustomerType = obj.isCustomerType

                        if (fundasID && fundasID.length) {
                            let arrFun = fundasID.map((item) => ObjectID(item))

                            if (arrFun.length) {
                                conditionObj.funda = { $in: arrFun }
                            }
                        } else {
                            let listFundaIsMember = await ITEM__FUNDA_COLL.find(
                                { members: { $in: [userID] } }
                            )
                            let fundasIDIsMember = listFundaIsMember.map(
                                (item) => ObjectID(item._id)
                            )
                            if (fundasIDIsMember.length) {
                                conditionObj.funda = { $in: fundasIDIsMember }
                            } else {
                                conditionObj.funda = { $in: [] }
                            }
                        }

                        shiftTypes &&
                            shiftTypes.length &&
                            (conditionObj.shiftType = { $in: shiftTypes })
                        salesChannels &&
                            salesChannels.length &&
                            (conditionObj.salesChannel = { $in: salesChannels })
                        statuss &&
                            statuss.length &&
                            (conditionObj.status = { $in: statuss })

                        // Phân loại khác
                        if (isMistake && isMistake == 1) {
                            conditionObj.numberOfMistakes = { $gt: 0 }
                        }

                        if (isNonResident && isNonResident == 1) {
                            conditionObj.nonResident = 2
                        }

                        if (isDiscount && isDiscount == 1) {
                            conditionObj.discount = { $gt: 0 }
                        }

                        if (isSalesoff && isSalesoff == 1) {
                            conditionObj.salesoff = { $gt: 0 }
                        }

                        if (isCredit && isCredit == 1) {
                            conditionObj.credit = { $gt: 0 }
                        }

                        if (isOffer && isOffer == 1) {
                            conditionObj.offer = { $gt: 0 }
                        }

                        if (isCustomerType && isCustomerType == 1) {
                            conditionObj.customerType = 1
                        }
                        if (isCustomerType && isCustomerType == 2) {
                            conditionObj.customerType = 2
                        }
                        // console.log(conditionObj)

                        // Phân loại theo thời khoảng
                        if (fromDate && toDate) {
                            conditionObj.createAt = {
                                $gte: new Date(fromDate),
                                $lte: new Date(toDate),
                            }
                        }

                        if (keyword) {
                            keyword = keyword.split(' ')
                            keyword = '.*' + keyword.join('.*') + '.*'
                            const regSearch = new RegExp(keyword, 'i')

                            conditionObj.$or = [
                                { name: regSearch },
                                { sign: regSearch },
                            ]
                        }
                        // console.log(conditionObj)

                        let listData = await FNB_ORDER_COLL.find(conditionObj)
                            .populate({
                                path: 'campaignType',
                                select: 'name',
                            })
                            .populate({
                                path: 'referrer',
                                select: 'name phone',
                            })
                            .populate({
                                path: 'customer',
                                select: 'name phone',
                            })
                            .populate({
                                path: 'funda',
                                select: 'name sign',
                            })
                            .populate({
                                path: 'shift',
                                select: 'name sign',
                            })
                            .limit(2000)
                            .sort({ createAt: -1 })

                        let yearFilter
                        let currentYear = new Date().getFullYear()
                        if (year && !isNaN(year)) {
                            yearFilter = Number(year)
                        } else {
                            yearFilter = Number(currentYear)
                        }

                        // Modify the workbook.
                        XlsxPopulate.fromFileAsync(
                            path.resolve(
                                __dirname,
                                '../../../files/templates/excels/fnb_export_order.xlsx'
                            )
                        ).then(async (workbook) => {
                            var i = 3
                            listData?.forEach((item, index) => {
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(1)
                                    .value(Number(index + 1))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(2)
                                    .value(item?.funda?.name)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(3)
                                    .value(item.createAt)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(4)
                                    .value(item?.shift?.name)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(5)
                                    .value(
                                        `${FNB_SHIFT_TYPES[Number(item.shiftType) - 1].text}`
                                    )
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(6)
                                    .value(item.name)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(7)
                                    .value(item.sign)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(8)
                                    .value(
                                        `${FNB_SALES_CHANNEL[Number(item.salesChannel) - 1].text}`
                                    )
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(9)
                                    .value(item?.appOrderSign)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(10)
                                    .value(
                                        `${FNB_PAYMENT_METHOD[Number(item.paymentMethod) - 1].text}`
                                    )
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(11)
                                    .value(
                                        `${FNB_STATUS[Number(item.status) - 1].text}`
                                    )
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(12)
                                    .value(Number(item.total))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(13)
                                    .value(Number(item.discount))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(14)
                                    .value(Number(item.salesoff))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(15)
                                    .value(Number(item.credit))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(16)
                                    .value(Number(item.offer))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(17)
                                    .value(Number(item.amount))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(18)
                                    .value(Number(item?.shippingFeeTotal))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(19)
                                    .value(Number(item?.shippingFee))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(20)
                                    .value(Number(item.numberOfSizeM))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(21)
                                    .value(Number(item.numberOfSizeL))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(22)
                                    .value(Number(item.numberOfProducts))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(23)
                                    .value(Number(item.numberOfMistakes))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(24)
                                    .value(item.note)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(25)
                                    .value(Number(item.loyaltyPoints))
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(26)
                                    .value(
                                        item.amount != 0
                                            ? Number(item.loyaltyPoints) /
                                                  Number(item.amount)
                                            : 0
                                    )
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(27)
                                    .value(
                                        item.total != 0
                                            ? Number(item.salesoff) /
                                                  Number(item.total)
                                            : ''
                                    )
                                if (
                                    item.customerType &&
                                    Number(item.customerType) === 1 &&
                                    Number(item.nonResident) === 1
                                ) {
                                    workbook
                                        .sheet('Order')
                                        .row(i)
                                        .cell(28)
                                        .value('Đơn nhân viên')
                                }
                                if (Number(item.nonResident) === 2) {
                                    workbook
                                        .sheet('Order')
                                        .row(i)
                                        .cell(29)
                                        .value('Khách vãng lai')
                                }
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(30)
                                    .value(`${item?.customer?._id}`)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(31)
                                    .value(item?.customer?.phone)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(32)
                                    .value(item?.customer?.name)
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(33)
                                    .value(
                                        item?.referrer
                                            ? `${item?.referrer?._id}`
                                            : ''
                                    )
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(34)
                                    .value(
                                        item?.referrer
                                            ? item?.referrer?.phone
                                            : ''
                                    )
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(35)
                                    .value(
                                        item?.referrer
                                            ? item?.referrer?.name
                                            : ''
                                    )
                                workbook
                                    .sheet('Order')
                                    .row(i)
                                    .cell(36)
                                    .value(
                                        item?.campaignType
                                            ? item?.campaignType?.name
                                            : ''
                                    )

                                i++
                            })

                            const now = new Date()
                            const filePath = '../../../files/temporary_uploads/'
                            const fileName = `DanhSachDonHang_${now.getTime()}.xlsx`
                            const pathWriteFile = path.resolve(
                                __dirname,
                                filePath,
                                fileName
                            )

                            await workbook.toFileAsync(pathWriteFile)
                            const result = await uploadFileS3(
                                pathWriteFile,
                                fileName
                            )

                            fs.unlinkSync(pathWriteFile)
                            return resolve({
                                error: false,
                                data: result?.Location,
                                status: 200,
                            })
                        })
                    } else {
                        // QUẢN LÝ DOANH SỐ
                        if (option == 1) {
                            let conditionObj = {
                                company: ObjectID(companyID),
                                status: 5,
                            }

                            let yearFilter
                            let currentYear = new Date().getFullYear()
                            // let currentMonth = new Date().getMonth() + 1
                            let currentMonth = new Date(toDate).getMonth() + 1

                            if (year && !isNaN(year)) {
                                yearFilter = Number(year)
                            } else {
                                yearFilter = Number(currentYear)
                            }
                            let conditionObjYear = {
                                year: Number(yearFilter),
                                month: {
                                    $in: [
                                        currentMonth - 2,
                                        currentMonth - 1,
                                        currentMonth,
                                    ],
                                },
                            }

                            // Địa điểm cơ sở được quyền truy cập
                            let listFuda = await ITEM__FUNDA_COLL.find({
                                members: { $in: [userID] },
                            })
                                .select('_id name sign')
                                .sort({ _id: 1 })
                            let fundasIDIsMember = listFuda.map((item) =>
                                ObjectID(item._id)
                            )
                            if (fundasIDIsMember.length) {
                                conditionObj.funda = { $in: fundasIDIsMember }
                            } else {
                                conditionObj.funda = { $in: [] }
                            }

                            let projectObj = {
                                year: { $year: '$createAt' },
                                month: { $month: '$createAt' },
                                day: { $dayOfMonth: '$createAt' },
                                company: 1,
                                funda: 1,
                                createAt: 1,
                                total: 1,
                                discount: 1,
                                salesoff: 1,
                                credit: 1,
                                amount: 1,
                                salesChannel: 1,
                            }
                            let sortBy = { '_id.salesChannel': 1 }
                            let conditionGroup = {},
                                conditionPopulate = {}

                            conditionGroup = {
                                _id: {
                                    salesChannel: '$salesChannel',
                                    funda: '$funda',
                                    month: '$month',
                                },
                                number: { $sum: 1 },
                                total: { $sum: '$total' },
                                discount: { $sum: '$discount' },
                                salesoff: { $sum: '$salesoff' },
                                credit: { $sum: '$credit' },
                                amount: { $sum: '$amount' },
                            }

                            conditionPopulate = {
                                path: '_id.funda',
                                select: '_id name',
                                model: 'funda',
                            }

                            let conditionGroupDay = {
                                _id: {
                                    salesChannel: '$salesChannel',
                                    day: '$day',
                                    month: '$month',
                                },
                                number: { $sum: 1 },
                                total: { $sum: '$total' },
                                discount: { $sum: '$discount' },
                                salesoff: { $sum: '$salesoff' },
                                credit: { $sum: '$credit' },
                                amount: { $sum: '$amount' },
                            }

                            let listData = await FNB_ORDER_COLL.aggregate([
                                {
                                    $match: conditionObj,
                                },
                                {
                                    $project: projectObj,
                                },
                                {
                                    $match: conditionObjYear,
                                },
                                {
                                    $group: conditionGroup,
                                },
                                {
                                    $sort: sortBy,
                                },
                            ])

                            let listData2 = await FNB_ORDER_COLL.aggregate([
                                {
                                    $match: conditionObj,
                                },
                                {
                                    $project: projectObj,
                                },
                                {
                                    $match: conditionObjYear,
                                },
                                {
                                    $group: conditionGroupDay,
                                },
                                {
                                    $sort: { '_id.month': 1, '_id.day': 1 },
                                },
                            ])
                            // console.log(listData2)
                            // console.log(conditionObjYear)

                            // Modify the workbook.
                            XlsxPopulate.fromFileAsync(
                                path.resolve(
                                    __dirname,
                                    '../../../files/templates/excels/fnb_export_revenue_all.xlsx'
                                )
                            ).then(async (workbook) => {
                                for (var m = 1; m <= 12; m++) {
                                    var i = 3
                                    listFuda?.forEach((item, index) => {
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(1)
                                            .value(Number(index + 1))
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(2)
                                            .value(item.name)
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(3)
                                            .value(`${item._id}`)
                                        i++
                                    })
                                }

                                listData?.forEach((item, index) => {
                                    for (var m = 1; m <= 12; m++) {
                                        if (
                                            Number(item._id.month) === Number(m)
                                        ) {
                                            for (
                                                var i = 3;
                                                i <=
                                                Number(listFuda.length + 2);
                                                i++
                                            ) {
                                                let discount = 0,
                                                    salesoff = 0,
                                                    credit = 0,
                                                    amount = 0
                                                let fundaID = workbook
                                                    .sheet(`T${m}`)
                                                    .row(i)
                                                    .cell(3)
                                                    .value()

                                                if (
                                                    item._id.funda.toString() ===
                                                    fundaID.toString()
                                                ) {
                                                    for (
                                                        var j = 4;
                                                        j <= 10;
                                                        j++
                                                    ) {
                                                        if (
                                                            Number(
                                                                item._id
                                                                    .salesChannel
                                                            ) === Number(j - 3)
                                                        ) {
                                                            workbook
                                                                .sheet(`T${m}`)
                                                                .row(i)
                                                                .cell(j)
                                                                .value(
                                                                    Number(
                                                                        item.total
                                                                    )
                                                                )
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                })

                                for (var m = 1; m <= 12; m++) {
                                    for (
                                        var i = 3;
                                        i <= Number(listFuda.length + 2);
                                        i++
                                    ) {
                                        let discount = 0,
                                            salesoff = 0,
                                            credit = 0,
                                            amount = 0

                                        let fundaID = workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(3)
                                            .value()

                                        listData?.forEach((item, index) => {
                                            if (
                                                item._id.funda.toString() ===
                                                    fundaID.toString() &&
                                                Number(item._id.month) ===
                                                    Number(m)
                                            ) {
                                                discount =
                                                    Number(discount) +
                                                    Number(item.discount)
                                                salesoff =
                                                    Number(salesoff) +
                                                    Number(item.salesoff)
                                                credit =
                                                    Number(credit) +
                                                    Number(item.credit)
                                                amount =
                                                    Number(amount) +
                                                    Number(item.amount)
                                            }
                                        })

                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(11)
                                            .value(Number(discount))
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(12)
                                            .value(Number(salesoff))
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(13)
                                            .value(Number(credit))
                                        workbook
                                            .sheet(`T${m}`)
                                            .row(i)
                                            .cell(14)
                                            .value(Number(amount))
                                    }
                                }

                                workbook
                                    .sheet(`BaoCaoNgay`)
                                    .row(1)
                                    .cell(2)
                                    .value(Number(currentYear))
                                listData2?.forEach((item, index) => {
                                    for (var i = 3; i <= 379; i++) {
                                        let xlsDay = workbook
                                            .sheet(`BaoCaoNgay`)
                                            .row(i)
                                            .cell(3)
                                            .value()
                                        let xlsMonth = workbook
                                            .sheet(`BaoCaoNgay`)
                                            .row(i)
                                            .cell(4)
                                            .value()

                                        for (var j = 5; j <= 11; j++) {
                                            if (
                                                Number(
                                                    item._id.salesChannel
                                                ) === Number(j - 4) &&
                                                Number(item._id.day) ===
                                                    Number(xlsDay) &&
                                                Number(item._id.month) ===
                                                    Number(xlsMonth)
                                            ) {
                                                workbook
                                                    .sheet(`BaoCaoNgay`)
                                                    .row(i)
                                                    .cell(j)
                                                    .value(Number(item.total))
                                            }
                                        }
                                    }
                                })

                                for (var i = 3; i <= 379; i++) {
                                    let discount = 0,
                                        salesoff = 0,
                                        credit = 0,
                                        amount = 0
                                    let xlsDay = workbook
                                        .sheet(`BaoCaoNgay`)
                                        .row(i)
                                        .cell(3)
                                        .value()
                                    let xlsMonth = workbook
                                        .sheet(`BaoCaoNgay`)
                                        .row(i)
                                        .cell(4)
                                        .value()

                                    if (!isNaN(xlsDay)) {
                                        // console.log({xlsDay, xlsMonth})
                                        listData2?.forEach((item, index) => {
                                            if (
                                                Number(item._id.day) ===
                                                    Number(xlsDay) &&
                                                Number(item._id.month) ===
                                                    Number(xlsMonth)
                                            ) {
                                                discount =
                                                    Number(discount) +
                                                    Number(item.discount)
                                                salesoff =
                                                    Number(salesoff) +
                                                    Number(item.salesoff)
                                                credit =
                                                    Number(credit) +
                                                    Number(item.credit)
                                                amount =
                                                    Number(amount) +
                                                    Number(item.amount)
                                            }
                                        })

                                        workbook
                                            .sheet(`BaoCaoNgay`)
                                            .row(i)
                                            .cell(12)
                                            .value(Number(discount))
                                        workbook
                                            .sheet(`BaoCaoNgay`)
                                            .row(i)
                                            .cell(13)
                                            .value(Number(salesoff))
                                        workbook
                                            .sheet(`BaoCaoNgay`)
                                            .row(i)
                                            .cell(14)
                                            .value(Number(credit))
                                        workbook
                                            .sheet(`BaoCaoNgay`)
                                            .row(i)
                                            .cell(15)
                                            .value(Number(amount))
                                    }
                                }

                                const now = new Date()
                                const filePath =
                                    '../../../files/temporary_uploads/'
                                const fileName = `BaoCaoDoanhSo_${now.getTime()}.xlsx`
                                const pathWriteFile = path.resolve(
                                    __dirname,
                                    filePath,
                                    fileName
                                )

                                await workbook.toFileAsync(pathWriteFile)
                                const result = await uploadFileS3(
                                    pathWriteFile,
                                    fileName
                                )

                                fs.unlinkSync(pathWriteFile)
                                return resolve({
                                    error: false,
                                    data: result?.Location,
                                    status: 200,
                                })
                            })
                        }

                        // SỐ LIỆU KHÁCH HÀNG
                        if (option == 2) {
                            if (
                                FNB_ACC.bod.includes(email.toString()) ||
                                FNB_ACC.cskh.includes(email.toString())
                            ) {
                                /**
                                 * Mốc thời gian
                                 */
                                let yearFilter
                                let currentYear = new Date().getFullYear()

                                if (year && !isNaN(year)) {
                                    yearFilter = Number(year)
                                } else {
                                    yearFilter = Number(currentYear)
                                }
                                let conditionObjYear = {
                                    year: Number(yearFilter),
                                }

                                /**
                                 * Điều kiện tra cứu
                                 */
                                let conditionObj = {
                                    company: ObjectID(companyID),
                                }
                                let conditionContactObj = {
                                    company: ObjectID(companyID),
                                } //

                                let obj = JSON.parse(filterParams)

                                let fundasID = obj.fundasID
                                let shiftTypes = obj.shiftTypes
                                let fromDate = obj.fromDate
                                let toDate = obj.toDate
                                let keyword = obj.keyword
                                let salesChannels = obj.salesChannels
                                let statuss = obj.statuss
                                let isMistake = obj.isMistake
                                let isDiscount = obj.isDiscount
                                let isSalesoff = obj.isSalesoff
                                let isCredit = obj.isCredit
                                let isOffer = obj.isOffer
                                let isNonResident = obj.isNonResident
                                let isCustomerType = obj.isCustomerType

                                let listFundaIsMember = []
                                if (fundasID && fundasID.length) {
                                    listFundaIsMember =
                                        await ITEM__FUNDA_COLL.find({
                                            _id: { $in: fundasID },
                                        }).select('_id name')
                                    let arrFun = fundasID.map((item) =>
                                        ObjectID(item)
                                    )

                                    if (arrFun.length) {
                                        conditionObj.funda = { $in: arrFun }
                                        conditionContactObj.funda = {
                                            $in: arrFun,
                                        } //
                                    }
                                } else {
                                    listFundaIsMember =
                                        await ITEM__FUNDA_COLL.find({
                                            members: { $in: [userID] },
                                        }).select('_id name')
                                    let fundasIDIsMember =
                                        listFundaIsMember.map((item) =>
                                            ObjectID(item._id)
                                        )

                                    if (fundasIDIsMember.length) {
                                        conditionObj.funda = {
                                            $in: fundasIDIsMember,
                                        }
                                        conditionContactObj.funda = {
                                            $in: fundasIDIsMember,
                                        } //
                                    } else {
                                        conditionObj.funda = { $in: [] }
                                        conditionContactObj.funda = { $in: [] } //
                                    }
                                }
                                // console.log(listFundaIsMember)

                                shiftTypes &&
                                    shiftTypes.length &&
                                    (conditionObj.shiftType = {
                                        $in: shiftTypes,
                                    })
                                salesChannels &&
                                    salesChannels.length &&
                                    (conditionObj.salesChannel = {
                                        $in: salesChannels,
                                    })
                                statuss &&
                                    statuss.length &&
                                    (conditionObj.status = { $in: statuss })

                                // Phân loại khác
                                if (isMistake && isMistake == 1) {
                                    conditionObj.numberOfMistakes = { $gt: 0 }
                                }

                                if (isNonResident && isNonResident == 1) {
                                    conditionObj.nonResident = 2
                                }

                                if (isDiscount && isDiscount == 1) {
                                    conditionObj.discount = { $gt: 0 }
                                }

                                if (isSalesoff && isSalesoff == 1) {
                                    conditionObj.salesoff = { $gt: 0 }
                                }

                                if (isCredit && isCredit == 1) {
                                    conditionObj.credit = { $gt: 0 }
                                }

                                if (isOffer && isOffer == 1) {
                                    conditionObj.offer = { $gt: 0 }
                                }

                                if (isCustomerType && isCustomerType == 1) {
                                    conditionObj.customerType = 1
                                }
                                if (isCustomerType && isCustomerType == 2) {
                                    conditionObj.customerType = 2
                                }

                                // Phân loại theo thời khoảng
                                if (fromDate && toDate) {
                                    conditionObj.createAt = {
                                        $gte: new Date(fromDate),
                                        $lte: new Date(toDate),
                                    }
                                }

                                if (keyword) {
                                    keyword = keyword.split(' ')
                                    keyword = '.*' + keyword.join('.*') + '.*'
                                    const regSearch = new RegExp(keyword, 'i')

                                    conditionObj.$or = [
                                        { name: regSearch },
                                        { sign: regSearch },
                                    ]
                                }

                                let conditionGroup = {},
                                    conditionPopulate = {}

                                conditionPopulate = {
                                    path: '_id.customer',
                                    select: '_id name phone note funda customerType type nonResident',
                                    populate: {
                                        path: 'funda',
                                        select: '_id name',
                                        model: 'funda',
                                    },
                                    model: 'contact',
                                }

                                conditionGroup = {
                                    _id: { customer: '$customer' },
                                    number: { $sum: 1 },
                                    total: { $sum: '$total' },
                                    amount: { $sum: '$amount' },
                                }
                                // console.log(conditionObj)

                                let listData = await FNB_ORDER_COLL.aggregate([
                                    {
                                        $match: conditionObj,
                                    },
                                    {
                                        $group: conditionGroup,
                                    },
                                    // {
                                    //     $sort: {
                                    //         "number": -1, "total": -1, "amount": -1
                                    //     }
                                    // },
                                    {
                                        $sort: {
                                            total: -1,
                                        },
                                    },
                                ])
                                await FNB_ORDER_COLL.populate(
                                    listData,
                                    conditionPopulate
                                )

                                /**
                                 * Tổng hợp danh bạ
                                 */
                                let conditionGroupContact = {
                                    _id: {
                                        year: '$year',
                                        month: '$month',
                                        funda: '$funda',
                                    },
                                    quantity: { $sum: 1 },
                                }
                                let listDataContact =
                                    await ITEM__CONTACT_COLL.aggregate([
                                        {
                                            $match: conditionContactObj,
                                        },
                                        {
                                            $project: {
                                                year: { $year: '$joinedDate' },
                                                month: {
                                                    $month: '$joinedDate',
                                                },
                                                funda: 1,
                                                joinedDate: 1,
                                            },
                                        },
                                        {
                                            $match: conditionObjYear,
                                        },
                                        {
                                            $group: conditionGroupContact,
                                        },
                                        {
                                            $sort: { '_id.month': 1 },
                                        },
                                    ])
                                // console.log(listDataContact)

                                // Modify the workbook.
                                XlsxPopulate.fromFileAsync(
                                    path.resolve(
                                        __dirname,
                                        '../../../files/templates/excels/fnb_export_customer.xlsx'
                                    )
                                ).then(async (workbook) => {
                                    // Tổng số khách hàng
                                    workbook
                                        .sheet(`TongSoKhachHang`)
                                        .row(1)
                                        .cell(1)
                                        .value(
                                            `TỔNG SỐ KHÁCH HÀNG ${yearFilter}`
                                        )
                                    var j = 3
                                    listFundaIsMember?.forEach(
                                        (item, index) => {
                                            workbook
                                                .sheet(`TongSoKhachHang`)
                                                .row(1)
                                                .cell(j)
                                                .value(`${item._id}`)
                                            workbook
                                                .sheet(`TongSoKhachHang`)
                                                .row(2)
                                                .cell(j)
                                                .value(item.name)

                                            j++
                                        }
                                    )

                                    // Chi tiết khách hàng theo điểm bán
                                    listDataContact?.forEach((item, index) => {
                                        for (var m = 1; m <= 12; m++) {
                                            if (
                                                Number(item._id.month) ===
                                                Number(m)
                                            ) {
                                                for (
                                                    let j = 3;
                                                    j <=
                                                    Number(
                                                        listFundaIsMember.length +
                                                            2
                                                    );
                                                    j++
                                                ) {
                                                    let fundaID = workbook
                                                        .sheet(
                                                            `TongSoKhachHang`
                                                        )
                                                        .row(1)
                                                        .cell(j)
                                                        .value()

                                                    if (
                                                        item._id.funda.toString() ===
                                                        fundaID.toString()
                                                    ) {
                                                        workbook
                                                            .sheet(
                                                                `TongSoKhachHang`
                                                            )
                                                            .row(Number(m + 2))
                                                            .cell(j)
                                                            .value(
                                                                item.quantity
                                                            )
                                                    }
                                                }
                                            }
                                        }
                                    })

                                    // Khách hàng quay lại
                                    if (fromDate && toDate) {
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(1)
                                            .cell(1)
                                            .value(
                                                `Từ ${moment(fromDate).format('DD/MM/YYYY')}-${moment(toDate).format('DD/MM/YYYY')}`
                                            )
                                    }

                                    var i = 3
                                    listData?.forEach((item, index) => {
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(i)
                                            .cell(1)
                                            .value(Number(index + 1))
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(i)
                                            .cell(2)
                                            .value(`${item._id.customer.name}`)
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(i)
                                            .cell(3)
                                            .value(item._id.customer.phone)
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(i)
                                            .cell(4)
                                            .value(item._id.customer.funda.name)
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(i)
                                            .cell(5)
                                            .value(
                                                `${item._id.customer.funda._id}`
                                            )
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(i)
                                            .cell(6)
                                            .value(Number(item.number))
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(i)
                                            .cell(7)
                                            .value(Number(item.total))
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(i)
                                            .cell(8)
                                            .value(Number(item.amount))
                                        workbook
                                            .sheet(`KhachHangQuayLai`)
                                            .row(i)
                                            .cell(9)
                                            .value(`${item._id.customer._id}`)
                                        if (
                                            item._id.customer.type &&
                                            Number(item._id.customer.type) === 1
                                        ) {
                                            workbook
                                                .sheet('KhachHangQuayLai')
                                                .row(i)
                                                .cell(10)
                                                .value('Nhân viên')
                                        }
                                        if (
                                            Number(
                                                item._id.customer.nonResident
                                            ) === 2
                                        ) {
                                            workbook
                                                .sheet('KhachHangQuayLai')
                                                .row(i)
                                                .cell(11)
                                                .value('Khách vãng lai')
                                        }

                                        i++
                                    })

                                    const now = new Date()
                                    const filePath =
                                        '../../../files/temporary_uploads/'
                                    const fileName = `BaoCaoKhachHang_${now.getTime()}.xlsx`
                                    const pathWriteFile = path.resolve(
                                        __dirname,
                                        filePath,
                                        fileName
                                    )

                                    await workbook.toFileAsync(pathWriteFile)
                                    const result = await uploadFileS3(
                                        pathWriteFile,
                                        fileName
                                    )

                                    fs.unlinkSync(pathWriteFile)
                                    return resolve({
                                        error: false,
                                        data: result?.Location,
                                        status: 200,
                                    })
                                })
                            } else {
                                return resolve({
                                    error: true,
                                    message: 'Bạn không có quyền',
                                    status: 500,
                                })
                            }
                        }

                        // PHÂN LOẠI DOANH SỐ
                        if (option == 3) {
                            let conditionObj = { company: ObjectID(companyID) }

                            let obj = JSON.parse(filterParams)
                            // console.log(obj)

                            let fundasID = obj.fundasID
                            let shiftTypes = obj.shiftTypes
                            let fromDate = obj.fromDate
                            let toDate = obj.toDate
                            let keyword = obj.keyword
                            let salesChannels = obj.salesChannels
                            let statuss = obj.statuss
                            let isMistake = obj.isMistake
                            let isDiscount = obj.isDiscount
                            let isSalesoff = obj.isSalesoff
                            let isCredit = obj.isCredit
                            let isOffer = obj.isOffer
                            let isNonResident = obj.isNonResident
                            let isCustomerType = obj.isCustomerType

                            if (fundasID && fundasID.length) {
                                let arrFun = fundasID.map((item) =>
                                    ObjectID(item)
                                )

                                if (arrFun.length) {
                                    conditionObj.funda = { $in: arrFun }
                                }
                            } else {
                                let listFundaIsMember =
                                    await ITEM__FUNDA_COLL.find({
                                        members: { $in: [userID] },
                                    })
                                let fundasIDIsMember = listFundaIsMember.map(
                                    (item) => ObjectID(item._id)
                                )
                                if (fundasIDIsMember.length) {
                                    conditionObj.funda = {
                                        $in: fundasIDIsMember,
                                    }
                                } else {
                                    conditionObj.funda = { $in: [] }
                                }
                            }

                            shiftTypes &&
                                shiftTypes.length &&
                                (conditionObj.shiftType = { $in: shiftTypes })
                            salesChannels &&
                                salesChannels.length &&
                                (conditionObj.salesChannel = {
                                    $in: salesChannels,
                                })
                            statuss &&
                                statuss.length &&
                                (conditionObj.status = { $in: statuss })

                            // Phân loại khác
                            if (isMistake && isMistake == 1) {
                                conditionObj.numberOfMistakes = { $gt: 0 }
                            }

                            if (isNonResident && isNonResident == 1) {
                                conditionObj.nonResident = 2
                            }

                            if (isDiscount && isDiscount == 1) {
                                conditionObj.discount = { $gt: 0 }
                            }

                            if (isSalesoff && isSalesoff == 1) {
                                conditionObj.salesoff = { $gt: 0 }
                            }

                            if (isCredit && isCredit == 1) {
                                conditionObj.credit = { $gt: 0 }
                            }

                            if (isOffer && isOffer == 1) {
                                conditionObj.offer = { $gt: 0 }
                            }

                            if (isCustomerType && isCustomerType == 1) {
                                conditionObj.customerType = 1
                            }
                            if (isCustomerType && isCustomerType == 2) {
                                conditionObj.customerType = 2
                            }

                            // Phân loại theo thời khoảng
                            if (fromDate && toDate) {
                                conditionObj.createAt = {
                                    $gte: new Date(fromDate),
                                    $lte: new Date(toDate),
                                }
                            } else {
                                conditionObj.createAt = {
                                    $gte: new Date(),
                                    $lte: new Date(),
                                }
                            }

                            if (keyword) {
                                keyword = keyword.split(' ')
                                keyword = '.*' + keyword.join('.*') + '.*'
                                const regSearch = new RegExp(keyword, 'i')

                                conditionObj.$or = [
                                    { name: regSearch },
                                    { sign: regSearch },
                                ]
                            }
                            // console.log(conditionObj)

                            let sortBy = {
                                '_id.funda': 1,
                                '_id.salesChannel': 1,
                            }
                            let conditionGroup = {},
                                conditionPopulate = {}

                            conditionGroup = {
                                _id: {
                                    salesChannel: '$salesChannel',
                                    funda: '$funda',
                                },
                                total: { $sum: '$total' },
                                amount: { $sum: '$amount' },
                            }

                            conditionPopulate = {
                                path: '_id.funda',
                                select: '_id name sign',
                                model: 'funda',
                            }

                            let listData = await FNB_ORDER_COLL.aggregate([
                                {
                                    $match: conditionObj,
                                },
                                {
                                    $group: conditionGroup,
                                },
                                {
                                    $sort: sortBy,
                                },
                            ])
                            await FNB_ORDER_COLL.populate(
                                listData,
                                conditionPopulate
                            )
                            // console.log(listData)

                            // Modify the workbook.
                            XlsxPopulate.fromFileAsync(
                                path.resolve(
                                    __dirname,
                                    '../../../files/templates/excels/fnb_export_revenue_type.xlsx'
                                )
                            ).then(async (workbook) => {
                                if (fromDate && toDate) {
                                    workbook
                                        .sheet(`PhanLoaiDoanhSo`)
                                        .row(1)
                                        .cell(1)
                                        .value(`Từ ${fromDate} tới ${toDate}`)
                                } else {
                                    workbook
                                        .sheet(`PhanLoaiDoanhSo`)
                                        .row(1)
                                        .cell(1)
                                        .value(`Từ ${fromDate} tới ${toDate}`)
                                }

                                var i = 3
                                listData?.forEach((item, index) => {
                                    let str = ''
                                    if (Number(item._id.salesChannel) === 1) {
                                        str = 'Off'
                                    } else if (
                                        Number(item._id.salesChannel) === 2
                                    ) {
                                        str = 'Grab'
                                    } else if (
                                        Number(item._id.salesChannel) === 3
                                    ) {
                                        str = 'Shopee'
                                    } else if (
                                        Number(item._id.salesChannel) === 4
                                    ) {
                                        str = 'Gojek'
                                    } else if (
                                        Number(item._id.salesChannel) === 5
                                    ) {
                                        str = 'Baemin'
                                    } else if (
                                        Number(item._id.salesChannel) === 6
                                    ) {
                                        str = 'Loship'
                                    } else {
                                        str = 'Bee'
                                    }

                                    workbook
                                        .sheet(`PhanLoaiDoanhSo`)
                                        .row(i)
                                        .cell(1)
                                        .value(Number(index + 1))
                                    workbook
                                        .sheet(`PhanLoaiDoanhSo`)
                                        .row(i)
                                        .cell(2)
                                        .value(item._id.funda.name)
                                    workbook
                                        .sheet(`PhanLoaiDoanhSo`)
                                        .row(i)
                                        .cell(3)
                                        .value(`${item._id.funda._id}`)
                                    workbook
                                        .sheet(`PhanLoaiDoanhSo`)
                                        .row(i)
                                        .cell(4)
                                        .value(item._id.funda.sign)
                                    workbook
                                        .sheet(`PhanLoaiDoanhSo`)
                                        .row(i)
                                        .cell(5)
                                        .value(Number(item._id.salesChannel))
                                    workbook
                                        .sheet(`PhanLoaiDoanhSo`)
                                        .row(i)
                                        .cell(6)
                                        .value(str)
                                    workbook
                                        .sheet(`PhanLoaiDoanhSo`)
                                        .row(i)
                                        .cell(7)
                                        .value(Number(item.total))

                                    i++
                                })

                                const now = new Date()
                                const filePath =
                                    '../../../files/temporary_uploads/'
                                const fileName = `BaoCaoDoanhSo_${now.getTime()}.xlsx`
                                const pathWriteFile = path.resolve(
                                    __dirname,
                                    filePath,
                                    fileName
                                )

                                await workbook.toFileAsync(pathWriteFile)
                                const result = await uploadFileS3(
                                    pathWriteFile,
                                    fileName
                                )

                                fs.unlinkSync(pathWriteFile)
                                return resolve({
                                    error: false,
                                    data: result?.Location,
                                    status: 200,
                                })
                            })
                        }
                    }
                } else {
                    return resolve({
                        error: true,
                        message: 'Bạn không có quyền',
                        status: 500,
                    })
                }
            } catch (error) {
                // console.log({ error })
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: HiepNH
     * Func: Tải Khách hàng tiềm năng
     * Date: 4/2/2023
     */
    // exportExcel3({ companyID, email, year, month, userID }) {
    //     // console.log({ companyID, email, year, month, userID })
    //     const that = this
    //     return new Promise(async resolve => {
    //         try {
    //             if(FNB_ACC.bod.includes(email.toString()) || FNB_ACC.cskh.includes(email.toString()) || FNB_ACC.man.includes(email.toString()) ){
    //             // if(FNB_ACC.cskh.includes(email.toString()) || FNB_ACC.man.includes(email.toString()) ){
    //                 // console.log('1111111111111')
    //                 let { data: listData } = await that.getListByProperty({ companyID, option: 8, userID })

    //                 // Modify the workbook.
    //                 XlsxPopulate.fromFileAsync(path.resolve(__dirname, ('../../../files/templates/excels/fnb_export_loyalty_customer.xlsx')))
    //                 .then(async workbook => {
    //                     var i = 3;
    //                     listData?.forEach((item, index) => {
    //                         workbook.sheet("Customer").row(i).cell(1).value(Number(index+1));
    //                         workbook.sheet("Customer").row(i).cell(2).value(item?._id?.customer?.name);
    //                         workbook.sheet("Customer").row(i).cell(3).value(item?._id?.customer?.funda?.name);
    //                         workbook.sheet("Customer").row(i).cell(4).value(item?._id?.customer?.phone);
    //                         workbook.sheet("Customer").row(i).cell(5).value(item?.numberOfOrders);
    //                         workbook.sheet("Customer").row(i).cell(6).value(item?.numberOfProducts);
    //                         workbook.sheet("Customer").row(i).cell(7).value(item?.total);
    //                         workbook.sheet("Customer").row(i).cell(8).value(item?.discount);
    //                         workbook.sheet("Customer").row(i).cell(9).value(item?.salesoff);
    //                         workbook.sheet("Customer").row(i).cell(10).value(item?.credit);
    //                         workbook.sheet("Customer").row(i).cell(11).value(item?.amount);
    //                         workbook.sheet("Customer").row(i).cell(12).value(item?._id?.customer?.note);
    //                         i++
    //                     });

    //                     const now = new Date();
    //                     const filePath = '../../../files/temporary_uploads/';
    //                     const fileName = `BaoCaoKhachHang_${now.getTime()}.xlsx`;
    //                     const pathWriteFile = path.resolve(__dirname, filePath, fileName);

    //                     await workbook.toFileAsync(pathWriteFile);
    //                     const result = await uploadFileS3(pathWriteFile, fileName);

    //                     fs.unlinkSync(pathWriteFile);
    //                     return resolve({ error: false, data: result?.Location, status: 200 })
    //                 })
    //             }else{
    //                 // console.log('2222222222222222')
    //                 return resolve({ error: true, message: 'Bạn không có quyền', status: 500 })
    //             }
    //         } catch (error) {
    //             console.log({ error })
    //             return resolve({ error: true, message: error.message, status: 500 });
    //         }
    //     })
    // }
}

exports.MODEL = new Model()
