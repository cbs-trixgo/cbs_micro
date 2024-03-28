/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const PCM_PLAN_GROUP_MODEL            = require('../model/subject_pcm.pcm_plan_group').MODEL;

module.exports = {
    /**
	 * Dev: HiepNH
	 * Func: insert Group
	 */
    insert: {
        auth: "required",
        params: {
            projectID : { type: "string" },
            parentID  : { type: "string", optional: true },
            name      : { type: "string" },
            sign      : { type: "string" },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  projectID, parentID, name, sign } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await PCM_PLAN_GROUP_MODEL.insert({
                    projectID, parentID, name, sign, userID, ctx
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: update Group
	 */
    update: {
        auth: "required",
        params: {
            groupID      : { type: "string" },
            contractID   : { type: "string", optional: true },
            parentID     : { type: "string", optional: true },
            name         : { type: "string", optional: true },
            sign         : { type: "string", optional: true },
            image        : { type: "string", optional: true },
            members      : { type: "array", optional: true },
            admins       : { type: "array", optional: true },
            membersRemove: { type: "array", optional: true },
            adminsRemove : { type: "array", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  groupID, name, sign, contractID, parentID, image, members, membersRemove, admins, adminsRemove } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await PCM_PLAN_GROUP_MODEL.update({
                    groupID, name, sign, contractID, parentID, image, userID, members, membersRemove, admins, adminsRemove
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: remove Group
	 */
    remove: {
        auth: "required",
        params: {
            groupID   : { type: "string" }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  groupID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await PCM_PLAN_GROUP_MODEL.remove({
                    groupID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: remove Group
	 */
    removeMany: {
        auth: "required",
        params: {
            groupsID   : { type: "array" }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  groupsID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                let resultAfterCallHandler = await PCM_PLAN_GROUP_MODEL.removeMany({
                    groupsID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: getList and getInfo pcm_plan_report
	 */
    getInfoAndGetList: {
        auth: "required",
        params: {
            projectID               : { type: "string", optional: true },
            groupID                 : { type: "string", optional: true },
            parentID                : { type: "string", optional: true },
            isShowAll               : { type: "string", optional: true },
            isShowParentAndChild    : { type: "string", optional: true },

            //==============================================
            keyword     : { type: "string", optional: true },
            limit       : { type: "string", optional: true },
            lastestID   : { type: "string", optional: true },
            select      : { type: "string", optional: true },
            populates   : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let {  parentID, projectID, groupID, isShowAll, isShowParentAndChild, keyword, limit, lastestID, select, populates } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler;
                if(groupID){
                    resultAfterCallHandler = await PCM_PLAN_GROUP_MODEL.getInfo({
                        groupID, select, populates,
                    });
                }else{
                    resultAfterCallHandler = await PCM_PLAN_GROUP_MODEL.getList({
                        parentID, keyword, isShowAll, isShowParentAndChild, limit, userID, lastestID, projectID, select, populates,
                    });
                }

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 8/12/2022
     */
    downloadTemplateExcel: {
        auth: 'required',
        params: {
            option     : { type: "string", optional: true }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, company } = ctx.meta.infoUser;
                let { projectID } = ctx.params;
                // console.log(ctx.params)

                const resultAfterCallHandler = await PCM_PLAN_GROUP_MODEL.downloadTemplateExcel({
                    companyID: company._id, projectID, userID 
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 9/12/2022
     */
    importFromExcel: {
        auth: 'required',
        params: {
            projectID    : { type: 'string', optional: true },
            dataImport: { type: 'string' }
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { projectID, dataImport } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;
                // console.log(dataImport)

                const resultAfterCallHandler = await PCM_PLAN_GROUP_MODEL.importFromExcel({
                    projectID, dataImport, userID, ctx
                })
                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: Download Template Excel
     * Date: 9/12/2022
     */
    exportExcel: {
        auth: 'required',
        params: {
            companyID: { type: "string", optional: true },
            option: { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, email, company } = ctx.meta.infoUser;
                let { companyID, option, month, year, filterParams } = ctx.params;
                // console.log({ companyID, option, filterParams })

                if(!companyID) {
                    companyID = company._id;
                }

                const resultAfterCallHandler = await PCM_PLAN_GROUP_MODEL.exportExcel({
                    userID, email, companyID, option, month, year, filterParams, ctx
                })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },
}