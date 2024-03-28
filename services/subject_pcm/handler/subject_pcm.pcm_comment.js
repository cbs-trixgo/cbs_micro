/**
 * TOOLS
 */
const { renderStatusCodeAndResponse }       = require('../../../tools/utils/status_code');

/**
 * MODELS
 */
const PCM_COMMENT_MODEL                     = require('../model/subject_pcm.pcm_comment-model').MODEL;

module.exports = {
    /**
	 * Dev: MinhVH
	 * Func: Tạo comment
	 * Date: 17/08/2021
	 * Update: 22/02/2022
	 */
    insert: {
        auth: "required",
        params: {
			content    : { type: "string", optional: true },
			rawContent : { type: "string", optional: true },
            taskID     : { type: "string", optional: true },
            type       : { type: "number", optional: true },
            switchType : { type: "string", optional: true },
            receiversID: { type: "array", optional: true },
            projectID  : { type: "string", optional: true },
            parentID   : { type: "string", optional: true },
            files      : { type: "array", optional: true },
            images     : { type: "array", optional: true },
            isOfficial : { type: "boolean", optional: true },
            select     : { type: "string", optional: true },
            populates  : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID, bizfullname, company } = ctx.meta.infoUser;
                const { content, rawContent, taskID, projectID, type, parentID, files, images, switchType, isOfficial, receiversID, select, populates } = ctx.params

                const resultAfterCallHandler = await PCM_COMMENT_MODEL.insert({
					taskID, projectID, parentID, authorID, type, content, rawContent, files, images, switchType, isOfficial, receiversID, select, populates, bizfullname: bizfullname,
                    companyOfAuthor: company._id, ctx
				})

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

     /**
	 * Dev: MinhVH
	 * Func: Cập nhật comment
	 * Date: 22/02/2022
	 */
    update: {
        auth: "required",
        params: {
            taskID              : { type: "string", optional: true },
            projectID           : { type: "string", optional: true },
            commentID           : { type: "string" },
			content             : { type: "string", optional: true },
            files               : { type: "array", optional: true },
            images              : { type: "array", optional: true },
            isOfficial          : { type: "boolean", optional: true },
            switchType          : { type: "string", optional: true },
            select              : { type: "string", optional: true },
            populates           : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID, company } = ctx.meta.infoUser;
                const { taskID, commentID, projectID, switchType, content, files, images, isOfficial, select, populates } = ctx.params;

                const resultAfterCallHandler = await PCM_COMMENT_MODEL.update({
					taskID, commentID, projectID, switchType, authorID, content, files, images, isOfficial, select, populates, companyOfAuthor: company._id, ctx
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: MinhVH
	 * Func: Cập nhật đánh dấu comment
	 * Date: 17/08/2021
	 * Update: 22/02/2022
	 */
    updateMarkResponse: {
        auth: "required",
        params: {
			commentID   : { type: "string" },
			taskID      : { type: "string" },
            official    : { type: "boolean" },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
                const { taskID, commentID, official } = ctx.params;

                const resultAfterCallHandler = await PCM_COMMENT_MODEL.updateMarkResponse({
					taskID, commentID, official
				});

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: MinhVH
	 * Func: Xóa comment
	 * Date: 17/08/2021
	 * Update: 22/02/2022
	 */
    delete: {
        auth: "required",
        params: {
			commentID: { type: "string" },
        },
        async handler(ctx) {
            try {
				await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { commentID } = ctx.params;

                const resultAfterCallHandler = await PCM_COMMENT_MODEL.delete({ commentID, authorID });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: Danh sách hoặc chi tiết comment
	 * Date: 17/08/2021
	 * Update: 22/02/2022
	 */
    getInfoAndGetList: {
        auth: "required",
        params: {
            taskID              : { type: "string", optional: true },
            type                : { type: "string", optional: true },
            official            : { type: "string", optional: true },
            parentID            : { type: "string", optional: true },
            commentID           : { type: "string", optional: true },
            contractID          : { type: "string", optional: true },
            projectID           : { type: "string", optional: true },
            isHaveImage         : { type: "string", optional: true },
            isGetReaction       : { type: "string", optional: true },
            switchType          : { type: "string", optional: true },

            limit               : { type: "string", optional: true },
            lastestID           : { type: "string", optional: true },
            select              : { type: "string", optional: true },
            populates           : { type: "string", optional: true },
            sortKey             : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				let { _id: authorID } = ctx.meta.infoUser;
                let {
                    taskID, parentID, commentID, contractID, projectID, type, official, isHaveImage, isGetReaction, switchType,
                    limit, lastestID, sortKey, select, populates
                } = ctx.params;

                let resultAfterCallHandler = null;

                if(commentID){
                    resultAfterCallHandler = await PCM_COMMENT_MODEL.getInfo({
                        commentID, select, populates
                    });
                } else{
                    resultAfterCallHandler = await PCM_COMMENT_MODEL.getList({
                        taskID, contractID, projectID, parentID, type, official, isHaveImage, isGetReaction, switchType,
                        limit, lastestID, sortKey, select, populates, authorID
                    });
                }

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: MinhVH
	 * Func: Danh sách comment tìm kiếm theo id
	 * Date: ...
	 * Update: 22/02/2022
	 */
    searchCommentById: {
        auth: "required",
        params: {
            commentID   : { type: "string" },
            taskID      : { type: "string", optional: true },
            projectID   : { type: "string", optional: true },
            switchType  : { type: "string", optional: true },
            select      : { type: "string", optional: true },
            populates   : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: authorID } = ctx.meta.infoUser;
                const { taskID, commentID, projectID, switchType, select, populates } = ctx.params;

                const resultAfterCallHandler = await PCM_COMMENT_MODEL.searchCommentById({
                    taskID, commentID, projectID, switchType, select, populates, authorID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },

    /**
	 * Dev: HiepNH
	 * Func: Danh sách comment tìm kiếm theo các chủ đề được quyền truy cập
	 * Date: 19/8/2022  
	 */
    searchCommentBySubject: {
        auth: "required",
        params: {
            draft               : { type: 'string', optional: true },
            sortKey             : { type: 'string', optional: true },
            isParent            : { type: 'string', optional: true },
            isActive            : { type: 'string', optional: true },
            isGroup             : { type: 'string', optional: true },

            fromDate            : { type: 'string', optional: true },
            toDate              : { type: 'string', optional: true },
            authorsID           : { type: 'array', optional: true },
            companyOfAuthorsID  : { type: 'array', optional: true },
            projectsID          : { type: 'array', optional: true },
            // official            : { type: 'boolean', optional: true },

            keyword             : { type: "string", optional: true },
            limit               : { type: "string", optional: true },
            lastestID           : { type: "string", optional: true },
            select              : { type: "string", optional: true },
            populates           : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
				const { _id: userID, company } = ctx.meta.infoUser;
                // console.log({userID})

                const {
                    draft, sortKey, isParent, isActive, isGroup, 
                    fromDate, toDate, authorsID, companyOfAuthorsID, projectsID,
                    keyword, limit, lastestID, select, populates
                } = ctx.params;

                // console.log('=================>>>>>>>>>>>>>>Tìm kiếm dữ liệu Comment================')
                // console.log({draft, sortKey, isParent, isActive, isGroup, 
                //     fromDate, toDate, authorsID, companyOfAuthorsID, projectsID,
                //     keyword, limit, lastestID, select, populates})

                const resultAfterCallHandler = await PCM_COMMENT_MODEL.searchCommentBySubject({
                    draft, sortKey, isParent, isActive, isGroup, 
                    fromDate, toDate, authorsID, companyOfAuthorsID, projectsID,
                    keyword, limit, lastestID, select, populates, 
                    userID
                });

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return renderStatusCodeAndResponse({ ctx, error_message: error.message });
            }
        }
    },   

    /**
     * Dev: HiepNH
     * Func: Gom nhóm theo tính chất
     * Date: 24/9/2022
     */
    getListByProperty: {
        auth: "required",
        params: {
            option              : { type: "string", optional: true  },
            fromDate            : { type: 'string', optional: true },
            toDate              : { type: 'string', optional: true },
            projectID           : { type: "string", optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params);
                let { option, fromDate, toDate, projectID } = ctx.params;
				const { _id: userID } = ctx.meta.infoUser;

                let resultAfterCallHandler = await PCM_COMMENT_MODEL.getListByProperty({
                    option, fromDate, toDate, userID, projectID
                 })

                return renderStatusCodeAndResponse({ resultAfterCallHandler, ctx });
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },
}