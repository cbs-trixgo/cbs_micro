const REDIS                 = require('redis');
const { REDIS_SEPERATOR }   = require('../config/cf_redis');

const { promisify }         = require('util'); // promisify -> convert cb to promise
const { CLIENT_REDIS }      = require('../config/cf_redis');

// set & get
const HMSET_ASYNC   = promisify(CLIENT_REDIS.HMSET).bind(CLIENT_REDIS);
const HMGET_ASYNC   = promisify(CLIENT_REDIS.HMGET).bind(CLIENT_REDIS);
const HGET_ASYNC    = promisify(CLIENT_REDIS.HGET).bind(CLIENT_REDIS);
const HVALS_ASYNC   = promisify(CLIENT_REDIS.HVALS).bind(CLIENT_REDIS);
const HGETALL_ASYNC = promisify(CLIENT_REDIS.HGETALL).bind(CLIENT_REDIS);
// check exists
const HEXISTS_ASYNC = promisify(CLIENT_REDIS.HEXISTS).bind(CLIENT_REDIS);
const HSETNX_ASYNC  = promisify(CLIENT_REDIS.HSETNX).bind(CLIENT_REDIS);
// incr & decr
const HINCRBY_ASYNC = promisify(CLIENT_REDIS.HINCRBY).bind(CLIENT_REDIS);

module.exports = {
    HMSET       : HMSET_ASYNC,
    HMGET       : HMGET_ASYNC,

    HGET        : HGET_ASYNC,
    HVALS       : HVALS_ASYNC,
    HGETALL     : HGETALL_ASYNC,

    HEXISTS     : HEXISTS_ASYNC,
    HSETNX      : HSETNX_ASYNC,
    HINCRBY     : HINCRBY_ASYNC,
};