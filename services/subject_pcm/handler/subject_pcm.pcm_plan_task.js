/**
 * TOOLS
 */
const {
    renderStatusCodeAndResponse,
} = require('../../../tools/utils/status_code')

/**
 * MODELS
 */
const PCM_PLAN_TASK_MODEL = require('../model/subject_pcm.pcm_plan_task').MODEL

module.exports = {
    /**
     * Dev: HiepNH
     * Func: insert pcm_plan_task
     */
    insert: {
        auth: 'required',
        params: {
            name: { type: 'string' },
            projectID: { type: 'string' },
            groupID: { type: 'string' },
            assigneeID: { type: 'string' },
            descriptioncv: { type: 'string', optional: true },
            taskID: { type: 'string', optional: true },
            contactID: { type: 'string', optional: true },
            authorAttachs: { type: 'array', optional: true },
            actualStartTime: { type: 'string', optional: true },
            type: { type: 'number', optional: true },
            description: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            startTime: { type: 'string', optional: true },
            startHour: { type: 'string', optional: true },
            expiredHour: { type: 'string', optional: true },
            expiredTime: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            docreID: { type: 'string', optional: true },
            messageID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            documentID: { type: 'string', optional: true },
            boardID: { type: 'string', optional: true },
            reportID: { type: 'string', optional: true },
            groupReportID: { type: 'string', optional: true },
            draft: { type: 'string', optional: true },
            template: { type: 'number', optional: true },
            workflowTemplate: { type: 'string', optional: true },
            amountoftime: { type: 'string', optional: true },
            amountPerHour: { type: 'string', optional: true },
            isNotiEmail: { type: 'boolean', optional: true },
            fieldID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                const {
                    _id: authorID,
                    bizfullname,
                    email,
                    fullname,
                    company,
                } = ctx.meta.infoUser
                // console.log(ctx.params)
                const {
                    projectID,
                    groupID,
                    taskID,
                    name,
                    description,
                    relatedIDs,
                    authorAttachs,
                    sign,
                    assigneeID,
                    startTime,
                    startHour,
                    expiredHour,
                    expiredTime,
                    actualStartTime,
                    parentID,
                    docreID,
                    messageID,
                    contractID,
                    documentID,
                    boardID,
                    reportID,
                    groupReportID,
                    draft,
                    template,
                    workflowTemplateID,
                    amountoftime,
                    amountPerHour,
                    fieldID,
                    type,
                    subType,
                    isNotiEmail,
                    amount,
                    vatAmount,
                    contactID,
                    descriptioncv,
                    select,
                    populates,
                } = ctx.params

                const resultAfterCallHandler = await PCM_PLAN_TASK_MODEL.insert(
                    {
                        projectID,
                        groupID,
                        taskID,
                        authorID,
                        name,
                        description,
                        relatedIDs,
                        sign,
                        assigneeID,
                        startTime,
                        startHour,
                        expiredHour,
                        expiredTime,
                        actualStartTime,
                        parentID,
                        docreID,
                        messageID,
                        contractID,
                        documentID,
                        boardID,
                        reportID,
                        groupReportID,
                        draft,
                        template,
                        workflowTemplateID,
                        amountoftime,
                        amountPerHour,
                        fieldID,
                        authorAttachs,
                        type,
                        subType,
                        isNotiEmail,
                        bizfullname,
                        amount,
                        vatAmount,
                        contactID,
                        select,
                        populates,
                        senderMail: { email, fullname },
                        company,
                        ctx,
                        descriptioncv,
                    }
                )

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: update pcm_plan_task
     */
    update: {
        auth: 'required',
        params: {
            taskID: { type: 'string' },
            sign: { type: 'string', optional: true },
            name: { type: 'string', optional: true },
            sign: { type: 'string', optional: true },
            description: { type: 'string', optional: true },
            descriptioncv: { type: 'string', optional: true },
            actualStartTime: { type: 'string', optional: true },
            actualFinishTime: { type: 'string', optional: true },
            expiredHour: { type: 'string', optional: true },
            alert: { type: 'number', optional: true },
            amountPerHour: { type: 'string', optional: true },
            assigneeID: { type: 'string', optional: true },
            progressType: { type: 'string', optional: true },
            fieldID: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            groupID: { type: 'string', optional: true },
            draft: { type: 'number', optional: true },
            userIDDelete: { type: 'number', optional: true },
            typeUpdate: { type: 'number', optional: true },
            flags: { type: 'array', optional: true },
            flagsRemoves: { type: 'array', optional: true },
            related: { type: 'array', optional: true },
            relatedRemoves: { type: 'array', optional: true },
            lastLogID: { type: 'string', optional: true },
            isAddSignature: { type: 'boolean', optional: true },
            isOpenBidding: { type: 'boolean', optional: true },
            authorAttachs: { type: 'array', optional: true },
            tasksLink: { type: 'array', optional: true },
            assigneeAttachs: { type: 'array', optional: true },
            milestone: { type: 'number', optional: true },
            subType: { type: 'number', optional: true },
            upcoming: { type: 'string', optional: true },
            isUpdateNews: { type: 'boolean', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const {
                    typeUpdate,
                    taskID,
                    sign,
                    name,
                    description,
                    note,
                    actualStartTime,
                    actualFinishTime,
                    amountPerHour,
                    assigneeID,
                    progressType,
                    fieldID,
                    expiredHour,
                    contractID,
                    draft,
                    subType,
                    upcoming,
                    usersDelete,
                    related,
                    relatedRemoves,
                    offtimeReason,
                    offbudgetReason,
                    templateID,
                    priority,
                    status,
                    lock,
                    signatures,
                    tasksLink,
                    links,
                    linksDocs,
                    authorAttachs,
                    assigneeAttachs,
                    percentage,
                    judgement,
                    overdue,
                    score,
                    urgent,
                    difficult,
                    finishTime,
                    punish,
                    approver,
                    timeApproved,
                    isUpdateNews,
                    valueApproved,
                    bidPrice,
                    bidPriceDiscount,
                    bidPriceAdjustment,
                    openedUsers,
                    openedStatus,
                    flags,
                    flagsRemoves,
                    lastLogID,
                    isAddSignature,
                    isOpenBidding,
                    milestone,
                    alert,
                    groupID,
                    unit,
                    unitPrice,
                    quantity,
                    vatAmount,
                    amountoftime,
                    ontime,
                    quality,
                    usersDeleteID,
                    descriptioncv,
                } = ctx.params
                const {
                    _id: userID,
                    bizfullname,
                    fullname,
                    email,
                    company,
                } = ctx.meta.infoUser

                const resultAfterCallHandler = await PCM_PLAN_TASK_MODEL.update(
                    {
                        typeUpdate,
                        taskID,
                        sign,
                        name,
                        description,
                        note,
                        actualStartTime,
                        actualFinishTime,
                        amountoftime,
                        amountPerHour,
                        assigneeID,
                        userID,
                        progressType,
                        fieldID,
                        expiredHour,
                        contractID,
                        draft,
                        subType,
                        upcoming,
                        usersDelete,
                        related,
                        relatedRemoves,
                        offtimeReason,
                        offbudgetReason,
                        templateID,
                        priority,
                        status,
                        lock,
                        signatures,
                        tasksLink,
                        links,
                        linksDocs,
                        authorAttachs,
                        assigneeAttachs,
                        percentage,
                        judgement,
                        overdue,
                        score,
                        urgent,
                        difficult,
                        finishTime,
                        punish,
                        approver,
                        timeApproved,
                        isUpdateNews,
                        valueApproved,
                        bidPrice,
                        bidPriceDiscount,
                        bidPriceAdjustment,
                        openedUsers,
                        openedStatus,
                        flags,
                        flagsRemoves,
                        lastLogID,
                        bizfullname,
                        isAddSignature,
                        isOpenBidding,
                        senderMail: { fullname, email },
                        unit,
                        unitPrice,
                        quantity,
                        vatAmount,
                        companyOfUser: company._id,
                        milestone,
                        alert,
                        groupID,
                        ontime,
                        quality,
                        fullnameUpdate: fullname,
                        usersDeleteID,
                        descriptioncv,
                        ctx,
                    }
                )

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: update status mutiple
     * type: 1-Việc con/ 2- checklist
     */
    updateStatusMutiple: {
        auth: 'required',
        params: {
            taskIDs: { type: 'array', optional: true },
            parentID: { type: 'string', optional: true },
            type: { type: 'number', optional: true }, // 1 việc con / 2 checklist
            option: { type: 'number', optional: true }, // 0-Update status, 1-Update user đã xem
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let { taskIDs, parentID, type, option } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                let resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.updateStatusMutiple({
                        parentID,
                        taskIDs,
                        type,
                        option,
                        userID,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Di chuyển công việc đến việc cha
     * Date: 22/04/2022
     */
    moveTaskToParent: {
        auth: 'required',
        params: {
            parentID: { type: 'string' },
            taskID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { parentID, taskID } = ctx.params

                const resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.moveTaskToParent({
                        parentID,
                        taskID,
                        userID,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Di chuyển công việc đến nhóm dữ liệu khác (trong cùng dự án)
     * Date: 22/04/2022
     */
    moveTaskToGroup: {
        auth: 'required',
        params: {
            groupID: { type: 'string' },
            taskID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                const { groupID, taskID } = ctx.params

                const resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.moveTaskToGroup({
                        groupID,
                        taskID,
                        userID,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Copy công việc
     * Date: 22/04/2022
     */
    copyTask: {
        auth: 'required',
        params: {
            taskID: { type: 'string' },
            name: { type: 'string' },
            projectID: { type: 'string' },
            groupID: { type: 'string' },
            assigneeID: { type: 'string' },
            relatedIDs: { type: 'array', optional: true },
            authorAttachs: { type: 'array', optional: true },
            type: { type: 'number', optional: true },
            subtype: { type: 'number', optional: true },
            description: { type: 'string', optional: true },
            startTime: { type: 'string', optional: true },
            expiredHour: { type: 'string', optional: true },
            expiredTime: { type: 'string', optional: true },
            contractID: { type: 'string', optional: true },
            isDraftTask: { type: 'boolean', optional: true },
            isCloneChildTask: { type: 'boolean', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company, bizfullname } = ctx.meta.infoUser
                const {
                    taskID,
                    name,
                    projectID,
                    groupID,
                    assigneeID,
                    relatedIDs,
                    authorAttachs,
                    type,
                    subtype,
                    description,
                    startTime,
                    expiredHour,
                    expiredTime,
                    contractID,
                    isDraftTask,
                    isCloneChildTask,
                } = ctx.params

                const resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.copyTask({
                        taskID,
                        name,
                        projectID,
                        groupID,
                        assigneeID,
                        relatedIDs,
                        authorAttachs,
                        type,
                        subtype,
                        description,
                        startTime,
                        expiredHour,
                        expiredTime,
                        contractID,
                        isDraftTask,
                        isCloneChildTask,
                        userID,
                        companyOfUser: company._id,
                        bizfullname,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: getList and getInfo pcm_plan_report
     */
    getInfoAndGetList: {
        auth: 'required',
        params: {
            // Field bổ sung
            projectID: { type: 'string', optional: true },
            draft: { type: 'string', optional: true },
            type: { type: 'string', optional: true },
            level: { type: 'string', optional: true },
            status: { type: 'string', optional: true },
            typeStatus: { type: 'string', optional: true },
            taskID: { type: 'string', optional: true },
            collection: { type: 'string', optional: true },
            assigneeID: { type: 'string', optional: true },
            authorID: { type: 'string', optional: true },
            subtype: { type: 'string', optional: true },
            isExpired: { type: 'string', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
            parentID: { type: 'string', optional: true },
            companyOfAuthor: { type: 'string', optional: true },
            companyOfAssignee: { type: 'string', optional: true },
            fieldID: { type: 'string', optional: true },
            isSortChecklist: { type: 'string', optional: true },
            isChecklist: { type: 'string', optional: true },
            isChildTask: { type: 'string', optional: true },
            isSortChildTask: { type: 'string', optional: true },
            isStatusNot3: { type: 'string', optional: true },
            isUsersDelete: { type: 'string', optional: true },
            statusNe: { type: 'string', optional: true },
            groupID: { type: 'string', optional: true },
            isPassPermision: { type: 'string', optional: true },
            milestone: { type: 'string', optional: true },
            sortKey: { type: 'string', optional: true },
            isParent: { type: 'string', optional: true },
            upcoming: { type: 'string', optional: true },
            isMileStone: { type: 'string', optional: true },

            // Field mặc định
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            unlimit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)

                let {
                    option,
                    taskID,
                    projectID,
                    status,
                    draft,
                    type,
                    level,
                    typeStatus,
                    collection,
                    assigneeID,
                    authorID,
                    subtype,
                    isExpired,
                    isStatusNot3,
                    isUsersDelete,
                    isChildTask,
                    isSortChildTask,
                    fromDate,
                    toDate,
                    parentID,
                    companyOfAuthor,
                    companyOfAssignee,
                    fieldID,
                    isSortChecklist,
                    isChecklist,
                    statusNe,
                    groupID,
                    sortKey,
                    keyword,
                    limit,
                    unlimit,
                    lastestID,
                    select,
                    populates,
                    isPassPermision,
                    milestone,
                    isParent,
                    upcoming,
                    isMileStone,
                } = ctx.params

                // console.log({select})

                const { _id: userID, company } = ctx.meta.infoUser

                let resultAfterCallHandler
                // Trường hợp nếu có taskID thì gọi function lấy chi tiết task, ngược lại gọi function lấy danh sách task
                if (taskID) {
                    resultAfterCallHandler = await PCM_PLAN_TASK_MODEL.getInfo({
                        taskID,
                        userID,
                        select,
                        populates,
                        companyID: company._id,
                        ctx,
                    })

                    // console.log(resultAfterCallHandler)
                } else {
                    resultAfterCallHandler = await PCM_PLAN_TASK_MODEL.getList({
                        option,
                        userID,
                        projectID,
                        status,
                        draft,
                        type,
                        level,
                        typeStatus,
                        collection,
                        assigneeID,
                        authorID,
                        subtype,
                        statusNe,
                        groupID,
                        sortKey,
                        isExpired,
                        fromDate,
                        toDate,
                        parentID,
                        companyOfAuthor,
                        companyOfAssignee,
                        fieldID,
                        isSortChecklist,
                        isChecklist,
                        isStatusNot3,
                        isUsersDelete,
                        isChildTask,
                        isSortChildTask,
                        keyword,
                        limit,
                        unlimit,
                        select,
                        lastestID,
                        populates,
                        isPassPermision,
                        milestone,
                        isParent,
                        upcoming,
                        isMileStone,
                        ctx,
                    })
                }

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: MinhVH
     * Func: Search Task
     * Date: 11/05/2022
     */
    getListByFilter: {
        auth: 'required',
        params: {
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
            assigneesID: { type: 'array', optional: true },
            companiesOfAssignee: { type: 'array', optional: true },
            authorsID: { type: 'array', optional: true },
            companiesOfAuthor: { type: 'array', optional: true },
            projectsID: { type: 'array', optional: true },
            subtypes: { type: 'array', optional: true },
            status: { type: 'array', optional: true },
            prioritys: { type: 'array', optional: true },
            fieldsID: { type: 'array', optional: true },
            isExpired: { type: 'string', optional: true },
            read: { type: 'string', optional: true },
            isParent: { type: 'string', optional: true },
            isGroup: { type: 'string', optional: true },
            reportType: { type: 'string', optional: true },
            priority: { type: 'string', optional: true },
            upcoming: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
            limit: { type: 'string', optional: true },
            lastestID: { type: 'string', optional: true },
            select: { type: 'string', optional: true },
            populates: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser

                const {
                    option,
                    fromDate,
                    toDate,
                    assigneesID,
                    companiesOfAssignee,
                    authorsID,
                    companiesOfAuthor,
                    projectsID,
                    subtypes,
                    status,
                    fieldsID,
                    isExpired,
                    read,
                    isParent,
                    isGroup,
                    reportType,
                    priority,
                    prioritys,
                    keyword,
                    limit,
                    lastestID,
                    select,
                    populates,
                    reportID,
                    upcoming,
                } = ctx.params

                const resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.getListByFilter({
                        option,
                        companyID: company._id,
                        fromDate,
                        toDate,
                        assigneesID,
                        companiesOfAssignee,
                        authorsID,
                        companiesOfAuthor,
                        projectsID,
                        subtypes,
                        status,
                        fieldsID,
                        isExpired,
                        read,
                        isParent,
                        isGroup,
                        reportType,
                        priority,
                        prioritys,
                        keyword,
                        limit,
                        lastestID,
                        select,
                        populates,
                        userID,
                        reportID,
                        upcoming,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Name: Gom nhóm theo thuộc tính
     * Dev: HiepNH
     * Date: 27/8/2023
     */
    getListByProperty: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            year: { type: 'string', optional: true },
            outin: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                let {
                    option,
                    fromDate,
                    toDate,
                    projectID,
                    companyID,
                    year,
                    outin,
                    keyword,
                } = ctx.params
                const { _id: userID, company } = ctx.meta.infoUser

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.getListByProperty({
                        option,
                        fromDate,
                        toDate,
                        projectID,
                        companyID,
                        userID,
                        year,
                        outin,
                        keyword,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Lấy thông báo công việc (chưa đọc)
     * Dev: HiepNH
     * Date: 31/7/2023
     */
    getAmountNotification: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
            upcoming: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser

                const { option, upcoming } = ctx.params

                let resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.getAmountNotification({
                        userID,
                        option,
                        upcoming,
                        ctx,
                    })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Báo cáo linh hoạt
     * Author: HiepNH
     * Date: 29/10/2022
     */
    getDynamicReport: {
        auth: 'required',
        params: {
            reportType: { type: 'string', optional: true },
            option: { type: 'string', optional: true },
            companyID: { type: 'string', optional: true },
            projectID: { type: 'string', optional: true },
            status: { type: 'array', optional: true },
            subtypes: { type: 'array', optional: true },
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
            upcoming: { type: 'string', optional: true },
            upcoming: { type: 'string', optional: true },
            isMilestone: { type: 'string', optional: true },
            year: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser

                let {
                    companyID,
                    reportType,
                    option,
                    projectID,
                    status,
                    fromDate,
                    toDate,
                    subtypes,
                    upcoming,
                    isMilestone,
                    year,
                } = ctx.params

                if (!companyID) {
                    companyID = company._id
                }

                let resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.getDynamicReport({
                        companyID,
                        userID,
                        reportType,
                        option,
                        projectID,
                        status,
                        fromDate,
                        toDate,
                        subtypes,
                        upcoming,
                        isMilestone,
                        year,
                        ctx,
                    })
                // console.log(resultAfterCallHandler)
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Lấy số lượng công việc của bạn để hiển thị ngoài trang chủ
     */
    getAmountTask: {
        auth: 'required',
        params: {},
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser

                // Bước check quyền
                let resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.getAmountTask({ userID, ctx })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Lấy số lượng công việc đấu thầu
     */
    getBadgeBidding: {
        auth: 'required',
        params: {},
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                // Bước check quyền
                let resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.getBadgeBidding({ userID, ctx })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Gửi email trong task
     * Updated: MinhVH - 12/05/2022
     */
    sendEmailToMembersInTask: {
        auth: 'required',
        params: {
            taskID: { type: 'string' },
            title: { type: 'string' },
            notice: { type: 'string' },
            members: { type: 'array' },
            emails: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, email, fullname } = ctx.meta.infoUser
                const { taskID, title, notice, members, emails } = ctx.params

                const resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.sendEmailToMembersInTask({
                        taskID,
                        title,
                        notice,
                        emails,
                        sender: { email, fullname },
                        receivers: members,
                        userID,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Lấy số lượng công việc của companyOfAssignee trong dự án
     * Author: HiepNH
     * Date: 27/8/2023
     */
    getAmountTaskOfCompanyOfAssignee: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
            // companyID: { type: "string", optional: true },
            projectID: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
            subtype: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                let { option, projectID, keyword, subtype } = ctx.params
                // console.log({option, company, projectID, keyword, subtype})

                if (!option) {
                    let resultAfterCallHandler =
                        await PCM_PLAN_TASK_MODEL.getAmountTaskOfCompanyOfAssigneeV2(
                            { projectID, keyword, subtype, ctx }
                        )
                    return renderStatusCodeAndResponse({
                        resultAfterCallHandler,
                        ctx,
                    })
                } else {
                    let resultAfterCallHandler =
                        await PCM_PLAN_TASK_MODEL.getAmountTaskOfCompanyOfAssigneeV1(
                            {
                                option,
                                companyID: company._id,
                                projectID,
                                keyword,
                                subtype,
                                ctx,
                            }
                        )
                    return renderStatusCodeAndResponse({
                        resultAfterCallHandler,
                        ctx,
                    })
                }
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Lấy số lượng công việc của companyOfAuthor trong dự án
     */
    getAmountTaskOfCompanyOfAuthor: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
            // companyID: { type: "string", optional: true },
            projectID: { type: 'string', optional: true },
            keyword: { type: 'string', optional: true },
            subtype: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID, company } = ctx.meta.infoUser
                let { option, projectID, keyword, subtype } = ctx.params

                if (!option) {
                    let resultAfterCallHandler =
                        await PCM_PLAN_TASK_MODEL.getAmountTaskOfCompanyOfAuthorV2(
                            { projectID, keyword, subtype, userID, ctx }
                        )
                    return renderStatusCodeAndResponse({
                        resultAfterCallHandler,
                        ctx,
                    })
                } else {
                }
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Lấy số lượng công việc của companyOfAssignee trong dự án theo milestone
     */
    getAmountTaskOfMilestone: {
        auth: 'required',
        params: {
            projectID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                let { projectID } = ctx.params
                let resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.getAmountTaskByMilestone({
                        projectID,
                        ctx,
                    })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Name: Lấy số lượng công việc của tất cả Project mà user là members
     * Author: HiepNH
     * Date: 27/8/2023
     */
    getAmountTaskByProjects: {
        auth: 'required',
        params: {
            fromDate: { type: 'string', optional: true },
            toDate: { type: 'string', optional: true },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { _id: userID } = ctx.meta.infoUser
                let { fromDate, toDate } = ctx.params
                let resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.getAmountTaskByProjects({
                        userID,
                        fromDate,
                        toDate,
                        ctx,
                    })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return { error: true, message: error.message }
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Download Excel
     * Date: 15/09/2022
     */
    downloadExcelTask: {
        auth: 'required',
        params: {
            option: { type: 'string', optional: true },
            conditionDownload: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { option, conditionDownload } = ctx.params
                const { _id: userID } = ctx.meta.infoUser

                const resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.downloadExcelTask({
                        option,
                        conditionDownload,
                        userID,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Download Excel
     * Date: 15/09/2022
     */
    downloadTemplateImportExcel: {
        auth: 'required',
        params: {
            projectID: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { option, projectID, taskID } = ctx.params

                const { _id: userID } = ctx.meta.infoUser
                const resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.downloadTemplateImportExcel({
                        option,
                        projectID,
                        taskID,
                        userID,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Tạo task từ dữ liệu excel
     * Date: 15/09/2022
     */
    importTaskFromExcel: {
        auth: 'required',
        params: {
            taskID: { type: 'string', optional: true },
            dataImport: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const { taskID, dataImport } = ctx.params
                const { _id: userID } = ctx.meta.infoUser
                // console.log(dataImport)

                const resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.importTaskFromExcel({
                        taskID,
                        dataImport,
                        userID,
                        ctx,
                    })
                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },

    /**
     * Dev: HiepNH
     * Func: Reset All Data
     * Date: 25/12/2022
     */
    repairData: {
        auth: 'required',
        params: {
            option: { type: 'string' },
            page: { type: 'string', optional: true },
            password: { type: 'string' },
        },
        async handler(ctx) {
            try {
                await this.validateEntity(ctx.params)
                const {
                    _id: userID,
                    email,
                    bizfullname,
                    company,
                } = ctx.meta.infoUser
                let { option, password, page, fromDate, toDate } = ctx.params

                const resultAfterCallHandler =
                    await PCM_PLAN_TASK_MODEL.repairData({
                        ctx,
                        option,
                        email,
                        password,
                        userID,
                        bizfullname,
                        companyID: company._id,
                        page,
                        fromDate,
                        toDate,
                        ctx,
                    })

                return renderStatusCodeAndResponse({
                    resultAfterCallHandler,
                    ctx,
                })
            } catch (error) {
                return renderStatusCodeAndResponse({
                    error_message: error.message,
                    ctx,
                })
            }
        },
    },
}
