/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }           = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const PCM_FILE_MODEL                            = require('../model/subject_pcm.pcm_file-model').MODEL;

module.exports = {
    /**
	 * Dev: MinhVH
	 * Func: Get info and list
	 */
    getInfoAndGetList: {
        auth: "required",
        params: {
            companyID       : { type: "string", optional: true },
            projectID       : { type: "string", optional: true },
            groupID         : { type: "string", optional: true },
            taskID          : { type: "string", optional: true },
            authorID        : { type: "string", optional: true },
            type            : { type: "string", optional: true },
            fromDate        : { type: "string", optional: true },
            toDate          : { type: "string", optional: true },
            isFileOfProject : { type: "string", optional: true },
            isSearchFile    : { type: "string", optional: true },

            keyword         : { type: "string", optional: true },
            limit           : { type: "string", optional: true },
            lastestID       : { type: "string", optional: true },
            select          : { type: "string", optional: true },
            populates       : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;
                const {
                    keyword, companyID, projectID, groupID, taskID, authorID, type, fromDate, toDate,
                    limit, lastestID, select, populates, isFileOfProject, isSearchFile
                } = ctx.params;

                const resultAfterCallHandler = await PCM_FILE_MODEL.getList({
                    companyID, projectID, groupID, taskID, authorID, keyword, type, fromDate, toDate,
                    limit, lastestID, select, populates, isFileOfProject, isSearchFile, userID, ctx
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: MinhVH
     * Func: Lấy danh sách file, group theo tháng năm
     * Date: 02/04/2022
     */
    getListFilesGroupByDate: {
        auth: "required",
        params: {
            companyID    : { type: "string", optional: true },
            projectID    : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { companyID, projectID, year } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await PCM_FILE_MODEL.getListFilesGroupByDate({
                    companyID, projectID, userID, year, ctx
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: MinhVH
     * Func: Lấy danh sách file, group theo hợp đồng
     * Date: 02/04/2022
     */
    getListFilesGroupByContract: {
        auth: "required",
        params: {
            projectID   : { type: "string" },
            keyword     : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { keyword, projectID, year } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await PCM_FILE_MODEL.getListFilesGroupByContract({
                    keyword, projectID, year, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: HiepNH
     * Func: Tìm kiếm file
     * Date: 24/8/2022
     */
    getListByFilter: {
        auth: "required",
        params: {
            fromDate            : { type: 'string', optional: true },
            toDate              : { type: 'string', optional: true },
            authorsID           : { type: 'array', optional: true },
            companyOfAuthorsID  : { type: 'array', optional: true },
            projectsID          : { type: 'array', optional: true },

            keyword             : { type: "string", optional: true },
            limit               : { type: "string", optional: true },
            lastestID           : { type: "string", optional: true },
            select              : { type: "string", optional: true },
            populates           : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID } = ctx.meta.infoUser;

                const { fromDate, toDate, authorsID, companyOfAuthorsID, projectsID, keyword, limit, lastestID, select, populates } = ctx.params;

                const resultAfterCallHandler = await PCM_FILE_MODEL.getListByFilter({
                    fromDate, toDate, authorsID, companyOfAuthorsID, projectsID, keyword, limit, lastestID, select, populates, userID, ctx
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: MinhVH
     * Func: Download files
     * Date: 21/12/2022
     */
    downloadFiles: {
        auth: 'required',
        params: {
            taskID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                const { taskID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await PCM_FILE_MODEL.downloadFilesV2({
                    taskID, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },

    /**
     * Dev: MinhVH
     * Func: Download files in group
     * Date: 24/05/2023
     */
    downloadFilesInGroup: {
        auth: 'required',
        timeout: 0,
        params: {
            groupID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                console.log('==============dl here------------------')
                await this.validateEntity(ctx.params);
                const { groupID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                const resultAfterCallHandler = await PCM_FILE_MODEL.downloadFilesInGroup({
                    groupID, userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ error_message: error.message, ctx });
            }
        }
    },
}