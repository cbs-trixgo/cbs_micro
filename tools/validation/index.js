"use strict";

const _ = require("lodash");

module.exports = {
    CHECK_PASSWOED : 
    {
        async check(value, errors, schema) {
            if (value.length < 5) 
                errors.push({ type: "Short password", expected: 5, actual: value });
            return value;
        }
    }
}

