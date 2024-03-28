// string ~ set
const REDIS                 = require('redis');
const { REDIS_SEPERATOR }   = require('../config/cf_redis');

const { promisify }         = require('util'); // promisify -> convert cb to promise
const { CLIENT_REDIS }      = require('../config/cf_redis');

const SET_ASYNC         = promisify(CLIENT_REDIS.SET).bind(CLIENT_REDIS);
const SETnx_ASYNC       = promisify(CLIENT_REDIS.SETNX).bind(CLIENT_REDIS);

const MSET_ASYNC        = promisify(CLIENT_REDIS.MSET).bind(CLIENT_REDIS);
const MSETnx_ASYNC      = promisify(CLIENT_REDIS.MSETNX).bind(CLIENT_REDIS);

const STRlen_ASYNC      = promisify(CLIENT_REDIS.STRLEN).bind(CLIENT_REDIS);
const GET_ASYNC         = promisify(CLIENT_REDIS.GET).bind(CLIENT_REDIS);
const MGET_ASYNC        = promisify(CLIENT_REDIS.MGET).bind(CLIENT_REDIS);
const EXPIRE_ASYNC      = promisify(CLIENT_REDIS.EXPIRE).bind(CLIENT_REDIS);
const TTL_ASYNC         = promisify(CLIENT_REDIS.TTL).bind(CLIENT_REDIS);

module.exports = {
    SET: SET_ASYNC,
    SETnx: SETnx_ASYNC,
    MSET: MSET_ASYNC,
    MSETnx: MSETnx_ASYNC,
    STRlen: STRlen_ASYNC,
    GET: GET_ASYNC,
    MGET: MGET_ASYNC,
    EXPIRE: EXPIRE_ASYNC,
    TTL: TTL_ASYNC,
}