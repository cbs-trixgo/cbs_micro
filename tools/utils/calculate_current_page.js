/**
 * TOOLS
 */
const {
    checkParametersModel,
    checkPointDotsAndRoundingNumberForPagingChatting,
} = require('./utils')

/**
 * Dev: VinhVH
 * Func: Tính toán trang hiện tại (pagination)
 * Date: ...
 * Updated: MinhVH - 03/08/2021
 */
exports.calculateCurrentPage = async function ({
    totalRecord,
    totalCurrentPage,
    perPage,
}) {
    // let [totalPage, totalCurrentPage] = await Promise.all([
    // 	totalPagePromise, totalCurrentPagePromise
    // ])

    // Kiểm tra hai kết quả count là number thì tiếp tục tính toán toltalPage và xác định current Page
    // Xác định lại currentPage về khi nếu truyền current =3 mà req lấy lastestConversationID của page --> data đó của page
    // Nên nếu req có sai currentPage thì vẫn trả về data và currentPage đúng cũng dữ liệu này
    let currentPage = 0
    let checkParamsTotalPage = checkParametersModel(
        [{ totalCurrentPage }, { totalRecord }],
        'number'
    )

    if (!checkParamsTotalPage.error) {
        //Tính toán currentPage hiện tại chính xác (currentPageExcellent)
        let valueCurrentPage = totalRecord - totalCurrentPage

        if (valueCurrentPage > 0) {
            currentPage = checkPointDotsAndRoundingNumberForPagingChatting(
                valueCurrentPage,
                perPage
            )
        } else {
            currentPage = 1
        }

        // Tính toán total page
        totalRecord = checkPointDotsAndRoundingNumberForPagingChatting(
            totalRecord,
            perPage
        )
    } else {
        // Nếu không phải là số ---> các giá trị trả về là 1
        currentPage = checkPointDotsAndRoundingNumberForPagingChatting(
            0,
            perPage
        )
        totalRecord = checkPointDotsAndRoundingNumberForPagingChatting(
            0,
            perPage
        )
    }

    return {
        currentPage,
        totalRecord,
    }
}

/**
 * Dev: HiepNH + MinhHM
 * Func: Tính toán trang hiện tại (pagination)
 */
exports.getCurrentPage = function ({ totalRecord, totalCurrentPage, limit }) {
    //Tính toán currentPage hiện tại chính xác (currentPageExcellent)
    let valueCurrentPage = totalRecord - totalCurrentPage
    if (valueCurrentPage > 0) {
        currentPage = checkPointDotsAndRoundingNumberForPagingChatting(
            valueCurrentPage,
            limit
        )
    } else {
        currentPage = 1
    }
    return currentPage
}
