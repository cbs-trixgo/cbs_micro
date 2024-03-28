"use strict";

const timeUtils = require('../utils/time_utils');
const { checkObjectIDs } = require('../utils/utils');
const PROMISE   = require('bluebird');
const OBJECT_ID = require('mongoose').Types.ObjectId;

class BaseModel {
    /**
     * @return {number}
     */
    static get FIND_ONE() {
        return 1
    }

    /**
     * @return {number}
     */
    static get FIND_MANY() {
        return 2
    }

    /**
     * @return {number}
     */
    FIND_ONE() {
        return 1
    }

    /**
     * @return {number}
     */
    FIND_MANY() {
        return 2
    }

    constructor(collection) {
        this.coll = collection;
    }

    /**
     *
     * @param {*} data
     * @param {*} authorID user tạo || add
     */
    insertData(data) {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            data.modifyAt = timeUtils.getCurrentTime();
            data.createAt = timeUtils.getCurrentTime();

            (new coll(data)).save(function (error, result) {
                if(error) {
                    console.info('insertData error:');
                    console.error(error);
                }
                return resolve(result, error);
            });
        });
    }

    /**
     *
     * @param {*} id cập nhật
     * @param {*} updatedata giá trị cập nhật
     */
    updateById(id, updatedata, opts = { new: true }) {
        return new Promise(async resolve => {
            if(!checkObjectIDs(id)) return resolve(null);

            updatedata.modifyAt = timeUtils.getCurrentTime();

            const infoAfterUpdate = await this.coll.findByIdAndUpdate(id, updatedata, opts);
            resolve(infoAfterUpdate);
        })
    }

    /**
     *
     * @param {*} condition  điều kiện
     * @param {*} updatedata giá trị cập nhật
     * @param {*} authorID   người cập nhật
     */
    updateWhereClause(condition, updatedata) {
        return new Promise(async resolve => {
            updatedata.modifyAt = timeUtils.getCurrentTime();

            const infoAfterUpdate = await this.coll.findOneAndUpdate(condition, updatedata, { new: true });
            resolve(infoAfterUpdate);
        })
    }

    getAllData() {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            coll.find({}).lean().exec().then(function (result) {
                return resolve(result);
            })
        });
    }

    getDocumentLatestUpdate() {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            coll.findOne({}).sort({modifyAt: -1}).lean().exec().then(function (result) {
                return resolve(result);
            })
        });
    }

    getDocumentLatestUpdateWhere(condition) {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            coll.findOne(condition).sort({modifyAt: -1}).lean().exec().then(function (result) {
                return resolve(result);
            })
        });
    }

    getDocumentOldUpdate() {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            coll.findOne({}).sort({modifyAt: 1}).lean().exec().then(function (result) {
                return resolve(result);
            })
        });
    }

    getDocumentLatestCreate() {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            coll.findOne({}).sort({createAt: -1}).lean().exec().then(function (result) {
                return resolve(result);
            })
        });
    }

    getDocumentOldCreate() {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            coll.findOne({}).sort({createAt: 1}).lean().exec().then(function (result) {
                return resolve(result);
            })
        });
    }

    countDataWhere(condition) {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            coll.count(condition, function (error, count) {
                return resolve(count);
            })
        });
    }


    getDataById(id) {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            if(!checkObjectIDs(id)) return resolve(null);

            coll.find({_id: OBJECT_ID(id)}).lean().exec().then(function (result) {
                if (result === null) {
                    return resolve(null);
                } else {
                    return resolve(result[0]);
                }
            })
        });
    }

    getDataWhere(whereClause, findType, sort = null, limit = null) {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            if (BaseModel.FIND_ONE == findType) {
                if (sort != null) {
                    coll.findOne(whereClause).sort(sort).lean().exec().then(function (result) {
                        return resolve(result);
                    })
                } else {
                    coll.findOne(whereClause).sort(sort).lean().exec().then(function (result) {
                        return resolve(result);
                    })
                }

            } else if (BaseModel.FIND_MANY == findType) {
                if (sort != null) {
                    if (limit != null) {
                        coll.find(whereClause).sort(sort).limit(limit).lean().exec().then(function (result) {
                            return resolve(result);
                        })
                    } else {
                        coll.find(whereClause).sort(sort).lean().exec().then(function (result) {
                            return resolve(result);
                        })
                    }

                } else {
                    if (limit != null) {
                        coll.find(whereClause).sort(sort).limit(limit).lean().exec().then(function (result) {
                            return resolve(result);
                        })
                    } else {
                        coll.find(whereClause).sort(sort).lean().exec().then(function (result) {
                            return resolve(result);
                        })
                    }
                }
            }
        });
    }

    removeDataWhere(condition) {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            coll.remove(condition, function (error) {
                return resolve();
            })
        });
    }

    removeDataById(id) {
        let coll = this.coll;
        return new PROMISE(function (resolve) {
            if(!checkObjectIDs(id)) return resolve(null);

            coll.remove({_id: OBJECT_ID(id)}, function (error) {
                return resolve();
            })
        }).catch(function () {
            return new PROMISE(function (resolve) {
                return resolve(null);
            })
        });
    }

}

module.exports = BaseModel;
