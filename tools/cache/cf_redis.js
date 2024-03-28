require("dotenv").config();

const redis = require("redis");

const REDIS_SEPERATOR = {
    HOST: process.env.REDIS_HOST || `0.0.0.0`,
    PORT: process.env.REDIS_PORT || `6379`,
    USR:  process.env.REDIS_USER || ``,
    PWD:  process.env.REDIS_PWD  || ``
}
exports.REDIS_SEPERATOR = REDIS_SEPERATOR;

exports.CLIENT_REDIS = redis.createClient({
    host: REDIS_SEPERATOR.HOST,
    port: REDIS_SEPERATOR.PORT,
    auth_pass: REDIS_SEPERATOR.PWD
});
