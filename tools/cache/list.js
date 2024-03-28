// implemention -> LIST (LPUSH, LRANGE, LTRIM, LREM)
const { promisify } = require('util') // promisify -> convert cb to promise
const { CLIENT_REDIS } = require('./cf_redis')

const LPUSH_PROMISIFY = promisify(CLIENT_REDIS.LPUSH).bind(CLIENT_REDIS)
const RPUSH_PROMISIFY = promisify(CLIENT_REDIS.RPUSH).bind(CLIENT_REDIS)
const LRANGE_PROMISIFY = promisify(CLIENT_REDIS.LRANGE).bind(CLIENT_REDIS)
const LTRIM_PROMISIFY = promisify(CLIENT_REDIS.LTRIM).bind(CLIENT_REDIS)

// fetch and trim (remove all element out-range)
const LRANGE_CUSTOM_WITH_TRIM = async (key, indexStart, indexEnd) => {
    return new Promise(async (resolve) => {
        let resultOfLrange = await LRANGE_PROMISIFY(key, indexStart, indexEnd)

        const INDEX_START_TRIM = indexStart
        const INDEX_END_TRIM = indexEnd

        let reusltOfLtrim = await LTRIM_PROMISIFY(
            key,
            INDEX_START_TRIM,
            INDEX_END_TRIM
        )

        return resolve(resultOfLrange)
    })
}

// (async function call(){ //~ test demo
//     let reusltOfCustom = await LRANGE_CUSTOM_WITH_TRIM('A_DEMO', 0, 2)
//     console.log({ reusltOfCustom: reusltOfCustom.message })
//     let listItems = await LRANGE_PROMISIFY('A_DEMO', 0, -1);
//     console.log({ listItems })

//     process.exit(1)
// })();

module.exports = {
    LPUSH: LPUSH_PROMISIFY,
    RPUSH: RPUSH_PROMISIFY,
    LRANGE: LRANGE_CUSTOM_WITH_TRIM,
}
