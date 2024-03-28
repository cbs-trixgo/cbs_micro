/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const TIMESHEET__EXPERT_SALARY_MODEL            = require('../model/timesheet.expert_salary-model').MODEL;

module.exports = {

    /**
     * Name: Insert
     * Author: HiepNH
     * Code: 22/11/2023
     */
    insert: {
        params: {
            name               : { type: "string"},
            parentID           : { type: "string", optional: true },
            date               : { type: "string", optional: true },
            type               : { type: "string", optional: true },
            note               : { type: "string", optional: true },
            projectID          : { type: "string", optional: true },
            humanID             : { type: "string", optional: true },
            salary              : { type: "number", optional: true },
            reward              : { type: "number", optional: true },
            punishment          : { type: "number", optional: true },
            advance             : { type: "number", optional: true },
            remaining           : { type: "number", optional: true },
            paid                : { type: "number", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { parentID, date, type, note, projectID, humanID, salary, onLeaveSalary, reward, punishment, advance, convertFactor, paid, name } = ctx.params;
				const { _id: userID, company } = ctx.meta.infoUser;
                // console.log(company)

                // console.log(ctx.params)

                let resultAfterCallHandler = await TIMESHEET__EXPERT_SALARY_MODEL.insert({
                    userCreate: userID,
                    companyID: company._id,
                    parentID, date, type, note, projectID, humanID, salary, onLeaveSalary, reward, punishment, advance, convertFactor, paid, name, ctx
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx })
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Update
     * Author: HiepNH
     * Code: 22/11/2023
     */
    update: {
        params: {
            expertSalaryID      : { type: "string" },
            members             : { type: "array", optional: true },
            admins              : { type: "array", optional: true },
            status              : { type: "string", optional: true },
            name                : { type: "string", optional: true},
            parentID            : { type: "string", optional: true },
            date                : { type: "string", optional: true },
            type                : { type: "string", optional: true },
            note                : { type: "string", optional: true },
            projectID           : { type: "string", optional: true },
            humanID             : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { expertSalaryID, admins, members, status, projectID, humanID, name, date, type, note, salary, onLeaveSalary, reward, punishment, advance, convertFactor, paid, revenueBonus, mealAllowance, insurance, pitax, union, share, other } = ctx.params;
                // console.log({ expertSalaryID, admins, members, status, projectID, humanID, name, date, type, note, salary, onLeaveSalary, reward, punishment, advance, convertFactor, paid, revenueBonus, mealAllowance, insurance, pitax, union, share, other })

                // console.log(ctx.params)

				const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler = await TIMESHEET__EXPERT_SALARY_MODEL.update({
                    expertSalaryID, admins, members, userID, status, projectID, humanID, name, date, type, note, salary, onLeaveSalary, reward, punishment, advance, convertFactor, paid, revenueBonus, mealAllowance, insurance, pitax, union, share, other, companyID: company._id
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Remove
     * Author: HiepNH
     * Code: 22/3/2024
     */
    remove: {
        auth: "required",
        params: {
            arraysRemove : { type: "array", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  arraysRemove } = ctx.params;
        				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await TIMESHEET__EXPERT_SALARY_MODEL.remove({
                    arraysRemove, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Name: syncData
     * Author: HiepNH
     * Code: 22/3/2024
     */
    syncData: {
        params: {
            salaryID : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { option, salaryID } = ctx.params;
                // console.log(ctx.params)

				const { _id: userID, company } = ctx.meta.infoUser;

                let resultAfterCallHandler = await TIMESHEET__EXPERT_SALARY_MODEL.syncData({
                    userID, companyID: company._id, option, salaryID, ctx
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Get list
     * Author: HiepNH
     * Code: 22/11/2023
     */
    getInfoAndGetList: {
        params: {
            sortOption        : { type: "string", optional: true },
            expertSalaryID    : { type: "string", optional: true },
            companyID         : { type: "string", optional: true },
            projectID         : { type: "string", optional: true },
            parentID          : { type: "string", optional: true },
            departmentsID     : { type: "array", optional: true },

            // Field mặc định
            limit           : { type: "string", optional: true },
            lastestID       : { type: "string", optional: true },
            keyword         : { type: "string", optional: true },
            select          : { type: "string", optional: true },
            populates       : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { expertSalaryID, companyID, parentID, projectID, keyword, limit, lastestID, select, populates, sortOption, positionsID, departmentsID } = ctx.params;

				const { _id: userID, company } = ctx.meta.infoUser;
                // console.log({ EXPERT_SALARY_PARAMS: ctx.params })

                if(!companyID){
                    companyID = company._id
                }

                let resultAfterCallHandler;
                if(expertSalaryID){
                    resultAfterCallHandler = await TIMESHEET__EXPERT_SALARY_MODEL.getInfo({
                        expertSalaryID, userID, select, populates, ctx
                    });
                } else {
                    resultAfterCallHandler = await TIMESHEET__EXPERT_SALARY_MODEL.getList({
                        parentID, companyID, projectID, userID, keyword, limit, lastestID, select, populates, sortOption, positionsID, departmentsID, ctx
                    })
                }

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

    /**
     * Name: Get
     * Author: HiepNH
     * Code: 22/11/2023
     */
    getListByProperty: {
        auth: "required",
        params: {
            option              : { type: "string", optional: true  },
            companyID           : { type: "string", optional: true  },
            projectID           : { type: "string", optional: true  },
            year                : { type: "string", optional: true  },
            month               : { type: "string", optional: true  },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { option, year, companyID, projectID, assigneeID, month } = ctx.params;
                const { _id: userID, company } = ctx.meta.infoUser;

                if(!companyID){
                    companyID = company._id
                }

                let resultAfterCallHandler = await TIMESHEET__EXPERT_SALARY_MODEL.getListByProperty({
                        option, year, companyID, projectID, userID, assigneeID, month, ctx
                    });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
}
