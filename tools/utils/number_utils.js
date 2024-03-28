'use strict'

exports.priceFormat = function (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

//HuynhVinh
exports.isInt = (value) => {
    if (isNaN(value)) {
        return false
    }
    var x = parseFloat(value)
    return (x | 0) === x
}
