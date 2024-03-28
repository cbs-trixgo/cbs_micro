"use strict";

const crypto = require('crypto');
const path   = require('path');

exports.md5 = function (value) {
    return crypto.createHash('md5').update(JSON.stringify(value)).digest("hex");
};

exports.sha1 = function (value) {
    return crypto.createHash('sha1').update(JSON.stringify(value)).digest('hex');
};

exports.randomString = function () {
    return crypto.randomBytes(64).toString('hex');
};

exports.generateRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
}

exports.randomStringFixLength = function (count) {

    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    for (let i = 0; i < count; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

exports.randomStringFixLengthCode = function (count) {

    let text = "";
    let possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < count; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

let randomStringFixLengthCodeWithOnlyText = function (count) {

    let text = "";
    let possible = "abcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < count; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

exports.randomStringFixLengthOnlyAlphabet = function (count) {

    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < count; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};


exports.getBytes = function (string) {
    string = (string == null) ? "" : string;
    return Buffer.byteLength(string, 'utf8')
};

exports.encode = function (text) {
    text = (text == null) ? "" : text;
    return new Buffer(text + '').toString('base64')
};

exports.decode = function (text) {
    text = (text == null) ? "" : text;
    return new Buffer(text + '', 'base64').toString('ascii');
};

exports.replaceAll = function (str, find, replace) {
    while (str.indexOf(find) > -1) {
        str = str.replace(find, replace);
    }
    return str;
};

exports.replaceSpaceWithChar = function (str, char = '') {
    return str.replace(/\s/g, char);
}

exports.validURL = function (str) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(str);
};

exports.validUserName = function (userName) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    var validUsername = userName.match(usernameRegex);
    return validUsername != null
};

exports.validEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

exports.checkValidPhoneNumber = function(phone) {
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if(phone !==''){
        if (vnf_regex.test(phone) == false)
            return false;
        return true;
    }else {
        return false;
    }
}

exports.nonAccentVietnamese = (str) => {
    // str = str.toLowerCase();
//     We can also use this instead of from line 11 to line 17
//     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
//     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
//     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
//     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
//     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
//     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
//     str = str.replace(/\u0111/g, "d");

    // Chữ in hoa
    str = str.replace(/Ô/g, "O");
    str = str.replace(/Ỗ/g, "O");
    str = str.replace(/(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/g, 'A');
    str = str.replace(/(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/g, 'E');
    str = str.replace(/(Ì|Í|Ị|Ỉ|Ĩ)/g, 'I');
    str = str.replace(/(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ô|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/g, 'O');
    str = str.replace(/(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/g, 'U');
    str = str.replace(/(Ỳ|Ý|Ỵ|Ỷ|Ỹ)/g, 'Y');
    str = str.replace(/(Đ)/g, 'D');

    // Chữ thường
    str = str.replace(/ô/g, "o");
    str = str.replace(/ỗ/g, "o");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");

    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u00D4|\u00F4|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}

exports.removeAccents = (str, toUpperCase = false) => {
    if(!str || typeof str !== 'string') return '';

    str = str.toLowerCase();
    // .replace(/(<([^>]+)>)/gi, "");
    str = str.replace(/<[^>]*>?/gm, '');
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư

    return (toUpperCase ? str.toUpperCase() : str).trim();
}

exports.convertViToEn = (str, toUpperCase = false) => {
    const newStr = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return toUpperCase ? newStr.toUpperCase() : newStr;
}

exports.listCharacter = function () {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
};

exports.cutWordsNotSpaceEnd = (yourString, maxLength) => {
    //trim the string to the maximum length
    var trimmedString = yourString.substr(0, maxLength);

    //re-trim if we are in the middle of a word
    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
    return trimmedString;
}

/**
 * input: xin chào mọi người
 * ouput: xinchaomoinguoi
 * SỬ DỤNG CHO CONVERT USERNAME
 */
exports.removeUtf8AndJoinSpace = str => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    // str = str.replace(/\W+/g, ' ');
    str = str.replace(/\s/g, '');
    str = str.replace(/[^a-zA-Z0-9]/g, '');

    let max = 10;
    for (let index = max; index >= 0; index--) {
        let inc_ = "";
        for (let index2 = 0; index2 <= index; index2++) {
            inc_ += "";
        }
        str = str.replace(inc_, '');
    }
    return str;
}

exports.makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

exports.getPathConvert = pathCurrent => {
    return path.join(__dirname, pathCurrent);
}

exports.nl2p = function (string){
    let urlRegex = /(https?:\/\/[^\s]+)/g;
    let paragraphs = '';
    let arr = string.split("\n");
    for (const item of arr) {
        paragraphs = paragraphs + '<p>' + item.replace(urlRegex, '<a style="font-weight: normal;" href="$1">$1</a>') + '</p>';
    }
    return paragraphs;
}

//__________Random và kiểm tra tồn tại
// Author: KhanhND
/**
 * @param {*} COLL collection cần kiểm tra
 * @param {*} fieldCheck trường cần kiểm tra trùng
 * Chức năng function: sẽ đảm bảo random: 6text+3number đảm bảo ko trùng
 */
exports.randomAndCheckExists = async (COLL, fieldCheck) => {
    let textRandom = randomStringFixLengthCodeWithOnlyText(6);
    let numRandom = Math.floor(Math.random() * (999 - 100)) + 100;

    let textResult = `${textRandom}${numRandom}`;

    /**
     * isExists: giả lập trường hợp tìm thấy tồn tại
     * A sẽ thay thêm vào colleciton nào để tìm record
     */
    let isExists = await COLL.findOne({ [fieldCheck]: textResult });
    if(isExists)
        return randomAndCheckExists(COLL, fieldCheck);

    return textResult;
}

//__________Convert ngày trong tuần sang thứ
// Author: HiepNH
exports.getDayOfWeek = function(date) {
    var d = new Date(date);
    var weekday = new Array(7);
    weekday[0] = "CN";
    weekday[1] = "Hai";
    weekday[2] = "Ba";
    weekday[3] = "Tư";
    weekday[4] = "Năm";
    weekday[5] = "Sáu";
    weekday[6] = "Bảy";

    return weekday[d.getDay()];
}
//__________Convert chữ cái đầu tiên thành chữ hoa
// Author: HiepNH
exports.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.removeHtmlTag = string => {
    string=string.replace(/&nbsp;/gi," ");
    string=string.replace(/&amp;/gi,"&");
    string=string.replace(/&quot;/gi,'"');
    string=string.replace(/&lt;/gi,'<');
    string=string.replace(/&gt;/gi,'>');
    return string.replace(/(<([^>]+)>)/gi, "");
}

exports.convertObjectToQueryParams = (obj) => {
    return Object.keys(obj)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
        .join('&');
}