'use strict'

let moment = require('moment-timezone')
let ISOdate = require('isodate')

function setTimeZone(date) {
    return moment.tz(date, 'Asia/Ho_Chi_Minh')
}
exports.setTimeZone = setTimeZone
exports.getCurrentTime = function () {
    return setTimeZone(new Date()).format('Y-MM-DD H:m:sZ')
}

exports.parseFormat1 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('Y-MM-DD | H:m')
}

exports.parseFormat2 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('H:mm DD-MM-Y')
}

exports.parseFormat3 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('MM-DD-Y')
}

exports.parseTimeFormat4 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('HH:mm DD/MM/Y')
}

exports.parseTimeFormat5 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('DD/MM/Y')
}

exports.parseTimeFormatOption = function (oldTimeFormat, format) {
    return setTimeZone(oldTimeFormat).format(format)
}

/**
 * compare time
 * if time1 > time2: return 1
 * if time1 < time2: return 2
 * if time1 = time2: return 0
 * @param time1
 * @param time2
 * @returns {number}
 */
exports.compareTwoTime = function (time1, time2) {
    let a = new Date(time1).getTime()
    let b = new Date(time2).getTime()
    if (a > b) {
        return 1
    } else if (b > a) {
        return 2
    } else {
        return 0
    }
}

exports.isValidDate = function (date) {
    try {
        const parse = Date.parse(date)
        if (isNaN(parse)) return false

        const d = new Date(date)

        if (d.toString() === 'Invalid Date') return false
        if (d instanceof Date) return true

        return false
    } catch (error) {
        console.error(error)
        return false
    }
}

/**
 * Get the number of seconds between two dates
 */
exports.getTimeBetween = function (time1, time2) {
    let a = new Date(time1).getTime()
    let b = new Date(time2).getTime()
    return (a - b) / 1000
}

exports.addMinuteToDate = function (dateAdded, minute) {
    return new Date(new Date(dateAdded).getTime() + minute * 60000)
}

exports.subMinuteToDate = function (subAdded, minute) {
    return new Date(new Date(subAdded).getTime() - minute * 60000)
}

exports.addDate = function (days) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
}

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000)
    return this
}

Date.prototype.addMinutes = function (m) {
    this.setTime(this.getTime() + m * 60 * 1000)
    return this
}

exports.addHoursToDate = function (dateAdded, hours) {
    return new Date(new Date(dateAdded).getTime() + hours * 60 * 60000)
}

exports.setHours = (date, h = 0, m = 0, s = 0) => {
    date = new Date(date)
    date.setHours(h, m, s) // Set hours, minutes and seconds
    return date
}

exports.calculateExpire = (
    currentTimestamp,
    expireTimestamp,
    type = 'minutes'
) => {
    const currentDate = new Date(currentTimestamp)
    const expireDate = new Date(expireTimestamp)

    // Get Seconds
    const secondsCurrent = currentDate.getSeconds()
    const secondsExpired = expireDate.getSeconds()

    // Get Minutes
    const minutesCurrent = currentDate.getMinutes()
    const minutesExpired = expireDate.getMinutes()

    // Get Hours
    const hoursCurrent = currentDate.getHours()
    const hoursExpired = expireDate.getHours()

    // Get date
    const dateCurrent = currentDate.getDate()
    const dateExpired = expireDate.getDate()

    // Get month
    const monthCurrent = currentDate.getMonth()
    const monthExpired = expireDate.getMonth()

    // Get year
    const yearCurrent = currentDate.getFullYear()
    const yearExpired = expireDate.getFullYear()

    const current = moment([
        yearCurrent,
        monthCurrent,
        dateCurrent,
        hoursCurrent,
        minutesCurrent,
        secondsCurrent,
    ])
    const expire = moment([
        yearExpired,
        monthExpired,
        dateExpired,
        hoursExpired,
        minutesExpired,
        secondsExpired,
    ])

    return expire.diff(current, type)
}

exports.calculateExpireTime = (
    currentTimestamp,
    expireTimestamp,
    type = 'minutes'
) => {
    const currentDate = new Date(currentTimestamp)
    const expireDate = new Date(expireTimestamp)

    // Get Hours
    const minutesCurrent = currentDate.getMinutes()
    const minutesExpire = expireDate.getMinutes()

    // Get Hours
    const hoursCurrent = currentDate.getHours()
    const hoursExpire = expireDate.getHours()

    // Get date
    const dateCurrent = currentDate.getDate()

    // Get month
    const monthCurrent = currentDate.getMonth()

    // Get year
    const yearCurrent = currentDate.getFullYear()

    const current = moment([
        yearCurrent,
        monthCurrent,
        dateCurrent,
        hoursCurrent,
        minutesCurrent,
    ])
    const expire = moment([
        yearCurrent,
        monthCurrent,
        dateCurrent,
        hoursExpire,
        minutesExpire,
    ])

    // console.log({ current, expire, type })

    return expire.diff(current, type)
}
