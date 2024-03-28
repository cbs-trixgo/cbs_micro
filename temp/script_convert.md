<!-- CONVERT ENDTIME FROM APP_COMPANIES TO APP_USERS -->(xong)
--------------------------------------------------------
let listAppCompany = db.app_companies.find({}).select("app company endTime").toArray()
for(let appCompany of listAppCompany){
    let { app, company, endTime } = appCompany;
    db.app_users.updateMany({  app: ObjectId(app), company: ObjectId(company) }, { $set: { endTime } })
}
--------------------------------------------------------

<!-- UPDATE VALUE TRƯỜNG NÀY CHO TRƯỜNG KIA -->(Xong)
--------------------------------------------------------
db.files.updateMany({nameOrg: {$exists: false}}, [{$set: { nameOrg: "$name" }}]);
--------------------------------------------------------

<!-- CONVERT FILE TO DOCUMENT_FILE -->(Xong)
--------------------------------------------------------
let fileDocuments = db.files.find({ document: {$exists: true, $ne: null} }).toArray()
for(let file of fileDocuments) {
    const { _id, createAt, modifyAt, company, project, author, document, name, type } = file;
    db.document_files.save({
        company,
        project,
        document,
        file: _id,
        type,
        nameOrg: name,
        name,
        author,
        createAt,
        modifyAt,
        isDataConvert: 1
    })
}
--------------------------------------------------------

<!-- Update numberFinishOfDocs cho department -->
--------------------------------------------------------
let listDepartment = db.departments.find({}).select("_id");

listDepartment.forEach(department => {
    let numberFinishOfDocs =  db.document_docs.count({ project: ObjectId(department._id), parent: { $exists: false }, completeStatus: 1 })
    db.departments.findOneAndUpdate({ _id: department._id}, { $set: { numberFinishOfDocs } })
})
--------------------------------------------------------

<!-- Update numberOfDocs cho document_package -->
--------------------------------------------------------
let listDocumentPackages = db.document_packages.find({}).select("_id");

listDocumentPackages.forEach(documentPackage => {
    let numberOfDocs =  db.document_docs.count({ package: ObjectId(documentPackage._id), parent: { $exists: false }})
    db.document_packages.findOneAndUpdate({ _id: documentPackage._id}, { $set: {numberOfDocs} })
})
--------------------------------------------------------

<!-- Update numberOfDocs cho department-coll -->
--------------------------------------------------------
let listDepartment = db.departments.find({}).select("_id");

listDepartment.forEach(department => {
    let numberOfDocs =  db.document_docs.count({ project: ObjectId(department._id), parent: { $exists: false }})
    db.departments.findOneAndUpdate({ _id: department._id}, { $set: {numberOfDocs} })
})
--------------------------------------------------------


<!-- CONVERT COMMENT PCM -->(Xong)
let listcommentPCM = db.comments.find({ task: { $exists: true, $ne: null } }).toArray();

for (const comment of listcommentPCM) {
    let { _id: commentCoreID, content, task, parent, childs, type, official, subType, files, author, userUpdate, createAt, modifyAt } = comment;

    let dataInsert = { official, type, task, author, userUpdate, createAt, modifyAt, isDataConvert: 1, commentCoreID, files: [], images: []};

    if(content){
        dataInsert.content =content;
    }

    if(parent){
        let infoCommentParent = db.pcm_comments.findOne({ commentCoreID: ObjectId(parent) })
        dataInsert.parent =infoCommentParent?._id;
    }

    if(subType){
        dataInsert.subType = subType;
    }

    if(files && files.length > 0){
        let listFileComment = db.files.find({ _id: { $in: files.map(file => ObjectId(file))} }).toArray();
        for (const file of listFileComment) {
            // db.pcm_files.save(dataInsertFilePcm);
            if(file.type == 1){
                // Hình ảnh
                dataInsert.images.push(file._id)
                // Tạo file bên pcm_file
            }else{
                // File
               dataInsert.files.push(file._id)
            }
        }
    }

    // Tính số lượng reaction
    let amountReaction = db.reactions.count({ comment: comment._id})
    dataInsert.amountReaction = amountReaction;

    // Tính số lượng comment con
    if(childs && childs.length){
        dataInsert.amountCommentReply = childs.length;
        dataInsert.lastestReplyID = childs.pop();
    }

    db.pcm_comments.save(dataInsert);
}

<!-- CONVERT FILE PCM -->(Xong)
let listFilePCM = db.files.find({ planTask: { $exists: true, $ne: null }}).toArray();

for (const file of listFilePCM) {
    let { _id: fileCoreID, company, project, planGroup: group, planTask: task, type, name , author, createAt, modifyAt } = file;
    db.pcm_files.save({ company, project, group, task, file: fileCoreID, type, nameOrg: name, name, author, isDataConvert: 1, createAt, modifyAt });
}

<!-- CẬP NHẬT SỐ LƯỢNG CONTACT_DOCUMENT CHO CONTACT-->(Xong)
let listContact = db.contacts.find({}).select("_id")

listContact.forEach(contact => {
    let amountWorkHistory =  db.contact_documents.count({ contact: ObjectId(contact._id), type: 1 });
    let amountProjectHistory =  db.contact_documents.count({ contact: ObjectId(contact._id), type: 2 });
    let amountContractHistory =  db.contact_documents.count({ contact: ObjectId(contact._id), type: 3 });
    let amountEducationHistory =  db.contact_documents.count({ contact: ObjectId(contact._id), type: 4 });
    let amountCertificateHistory =  db.contact_documents.count({ contact: ObjectId(contact._id), type: 5 });

    db.contacts.findOneAndUpdate({ _id: contact._id}, { $set: {amountWorkHistory, amountProjectHistory, amountContractHistory, amountEducationHistory,  amountCertificateHistory } })
})

<!-- PRECALCULATE FOR TASK-->(Xong)
let listTask=  db.pcm_plan_tasks.find({}).toArray();

for (const task of listTask) {

    let author = db.users.findOne({ _id: ObjectId(task?.author)})
    let assignee = db.users.findOne({ _id: ObjectId(task?.assignee)})

    let amountChecklist = db.pcm_plan_tasks.count({ parent: task._id, type: 2 });
    let amountFinishedChecklist = db.pcm_plan_tasks.count({ parent: task._id, type: 2, status: 3 });

    let amountSubtask = db.pcm_plan_tasks.count({ parent: task._id, type: 1 });
    let amountFinishedSubtask = db.pcm_plan_tasks.count({ parent: task._id, type: 1, status: 3 });

    let amountResponse = db.pcm_comments.count({ task: task._id, type: 2 });
    let amountMarkedResponse = db.pcm_comments.count({ task: task._id, type: 2, official: 1 });

    db.pcm_plan_tasks.findOneAndUpdate({_id: ObjectId(task._id)},
        [
            {
                $set: {
                    subtype: "$isproposal",
                    companyOfAuthor: author?.company,
                    companyOfAssignee: assignee?.company,
                    amountChecklist,
                    amountFinishedChecklist,
                    amountSubtask,
                    amountFinishedSubtask,
                    amountResponse,
                    amountMarkedResponse
                }

            }
        ]
    );
}

<!-- UPDATE CONVERSATION-->(Xong)
let listConversations  = db.message_conversations.find({}).toArray();

listConversations.forEach(conversation => {
    let { _id, name, description, members, author, lastMessage, logo, pin, arrMissMessage, arrUserMuteMessage  } = conversation;
    let company = null;
    if(author && author[0]){
        let infoAuthor = db.users.findOne({ _id: ObjectId(author[0])})
        company = infoAuthor?.company;
    }

    let isPrivate = true;

    if(members && members.length > 2){
        isPrivate = false;
    }
    let isRename = false;

    let config = {
        configHighlight: 1,
        configSeeOldMessage: 1,
        configEditInfo: 1,
        configCreateNote: 1,
        configCreatePoll: 1,
        configPinMessage: 1,
        configSendMessage: 1
    }

    db.message_conversations.findOneAndUpdate({_id: ObjectId(_id)},{
        $set: {
            _id, company, authors: author, avatar: logo, messagesPin: pin, usersMissMessage: arrMissMessage, isPrivate, isRename, config,  isDataConvert: 1
        }
    })
})

<!-- UPDATE MESSAGE-->(Xong)
let listMessage = db.message_messages.find({}).toArray();
for(const messageInfo of listMessage){
    let usersSeen = messageInfo.listSeen?.map(item => item);
    if(!usersSeen){
        usersSeen = []
    }
    db.message_messages.findOneAndUpdate({ _id: messageInfo._id }, { $set: { usersSeen, isDataConvert: 1, type: 0 }})
}

<!-- XOÁ TẤT CẢ DỮ LIỆU THÔNG BÁO THÁNG 1 TRỞ VỀ TRƯỚC-->(Xong)
let dateRemove = new Date("2022-2-1");
db.notifications.deleteMany({ createAt: { $lt: dateRemove }})

<!--CONVERT NOTIFICATION-->(Xong)
let listNotification = db.notifications.find({}).toArray();
for(let noti of listNotification){
    let { _id, status, url, type } = noti;
    let taskID = url.substr(18, 24);
    let path = `/pcm/detail/${taskID}`
    let languageKey = type;

    // Api pcm
    let app = '5dfe4b9051dc622100bb9d89';

    if(status == 1){
        status = 3;
    }

    let mainColl = {
        kind: "pcm_plan_task",
        item: taskID
    };

    let isDataConvert = 1;
    let dataUpdate = { path, languageKey, app, status, mainColl, isDataConvert }
    db.notifications.findOneAndUpdate({ _id: ObjectId(_id)}, { $set: dataUpdate })
}

<!--CONVERT APP USER-->(Xong)
let listUser = db.users.find({}).select("company _id").toArray();
let listApp = ["61e049c9fdebf77b072d1b13", "5e47867080019357cce04746", "5dfe4c1b51dc622100bb9d8f", "5dfe4b9051dc622100bb9d89","5df4ce16506d9b3c587948ca"];
let createAt = new Date();
for(let user of listUser){
    let {_id, company } = user;
    for(let appID of listApp){
         db.app_users.insert({ company, app: ObjectId(appID), user: _id, endTime: new Date("2022-12-31"), level: 1, numLog: 0, userCreate: ObjectId("6078102a1283502250f8ba12"), createAt, isDataConvert: 1  })
    }
}


/**
* ============================ ********************************* ==============================
* ============================ 	 CONVERT MESSAGE CONVERSATION  	 ==============================
* ============================ ********************************* ==============================
*/

let listMessages = db.message_messages.find({}).toArray();

for(const infoMessage of listMessages){
    let { _id, listSeen, status, files } = infoMessage;
    let listFiles = [];
    let isImage = false;

    if(files && files.length) {
        files.map(file => {
            const fileInfo = db.files.findOne({ _id: ObjectId(file) });

            if(fileInfo) {
                const { name, nameOrg, path, size, type, author } = fileInfo;
                const fileAfterInsert = db.message_conversation_files.insertOne({
                    name,
                    nameOrg,
                    path,
                    size,
                    type,
                    mimeType: type == 1 ? "image/jpeg" : "",
                    conversation: _id,
                    file,
                    author
                })

                if(!isImage && type == 1) {
                    isImage = true;
                }

                listFiles[listFiles.length] = {
                    file: fileAfterInsert.insertedId,
                    status: 1,
                    usersDelete: []
                }
            }
        })
    }

    if(listSeen && listSeen.length) {
        listSeen = [...new Set(listSeen)];
    }

    db.message_messages.findOneAndUpdate({ _id: ObjectId(_id) }, {
        $unset: {
            listSeen: 1,
            bug: 1,
            taskID: 1,
            ticket: 1,
            priority: 1,
            expiredTime: 1,
            fixedbug: 1,
            __v: 1
        },
        $set: {
            usersSeen: listSeen || [],
            usersAssigned: [],
            reactions: [],
            usersDelete: [],
            files: listFiles,
            status: status == 1 ? 2 : 1,
            location: null,
            type: !listFiles.length ? 0 : (isImage ? 1 : 2),
            isDataConvert: 1,
        }
    }, { returnNewDocument: true })
}


/**
* ============================ **************************==============================
* ============================ 	 CONVERT CONVERSATION  	 ==============================
* ============================ **************************==============================
*/

let listConversations  = db.message_conversations.find({}).toArray();

let config = {
    configHighlight: 1,
    configSeeOldMessage: 1,
    configEditInfo: 1,
    configCreateNote: 1,
    configCreatePoll: 1,
    configPinMessage: 1,
    configSendMessage: 1
}

listConversations.forEach(conversation => {
    let { _id, name, description, members, author, lastMessage, logo, pin, arrMissMessage, arrUserMuteMessage  } = conversation;
    let company = null;

    if(author && author.length && author[0]){
        let infoAuthor = db.users.findOne({ _id: ObjectId(author[0]) })
        company = infoAuthor?.company;
    }

    let isPrivate = true;
    let usersMissMessage = [];

    if(members && members.length > 2){
        isPrivate = false;
    }

    if(arrMissMessage && arrMissMessage.length) {
        arrMissMessage.map(user => {
            usersMissMessage[usersMissMessage.length] = {
                userID: user.userID,
                amount: user.amout
            }
        })
    }

    db.message_conversations.findOneAndUpdate({ _id: ObjectId(_id) },{
        $unset: {
            links: 1,
            arrMissMessage: 1,
            taskID: 1,
            arrUserMuteMessage: 1,
            arrMesageTypingUsers: 1,
            __v: 1
        },
        $set: {
            _id,
            company,
            authors: author,
            avatar: logo,
            messagesPin: pin ? [pin] : [],
            usersMissMessage,
            isPrivate,
            isRename: false,
            config,
            folders: [],
            usersMute: [],
            usersHide: [],
            usersDeleteHistory: [],
            lastMessage,
            author: (author && author.length) ? author[0] : null,
            isDataConvert: 1
        }
    }, { returnNewDocument: true })
})



/**
* ============================ *************************************** ===============================
* ============================ 	 CONVERT MEMBERS OF CONVERSATION  	   ===============================
* ============================ *************************************** ===============================
*/


const conversations = db.message_conversations.find({}).toArray()

for(let conversation of conversations) {
    let { _id: conversationID, members, authors, author } = conversation;

    if(authors && authors.length) {
        members = [...members, ...authors]
    }

    if(!author) {
        author = authors[0];
    }

    members[members.length] = author;

    if(members && members.length) {
        for(let memberID of members) {
            const infoUser = db.users.findOne({ _id: memberID })
            const infoMember = db.message_conversation_members.findOne({
                member: memberID,
                conversation: conversationID
            })

            if(infoUser && !infoMember) {
                db.message_conversation_members.insertOne({
                    name: infoUser.bizfullname || infoUser.fullname,
                    member: memberID,
                    conversation: conversationID,
                	addedBy: author,
                	type: author.toString() == memberID.toString() ? 'owner' : 'member',
                	timeLastSeen: Date.now(),
                	createAt: new Date()
                })
            }
        }
    }
}


/**
* ============================ ******************************************************* ===============================
* ============================ 	 UPDATE CONTRACT, PROJECT, GROUP FOR PCM_COMMENT  	   ===============================
* ============================ ******************************************************* ===============================
*/

const comments = db.pcm_comments.find({}).toArray();

for(let comment of comments) {
    const infoTask = db.pcm_plan_tasks.findOne({ _id: comment.task })
    if(infoTask) {
        const { contract, project, group } = infoTask;

        if(!comment.contract) {
            db.pcm_comments.updateOne({ _id: comment._id }, {
                $set: { contract }
            })
        }

        if(!comment.project) {
            db.pcm_comments.updateOne({ _id: comment._id }, {
                $set: { project }
            })
        }

        if(!comment.group) {
            db.pcm_comments.updateOne({ _id: comment._id }, {
                $set: { group }
            })
        }

    }
}


/**
* ============================ ********************************* ==============================
* ============================ 	 CONVERT FILE IN PCM_COMMENT  	 ==============================
* ============================ ********************************* ==============================
*/

const listComments = db.pcm_comments.find({
    task: { $exists: true, $ne: null },
    $or: [
        {
            $expr: {
                $gt: [
                    { $size: "$images" }, 0
                ]
            }
        },
        {
            $expr: {
                $gt: [
                    { $size: "$files" }, 0
                ]
            }
        }
    ]
})
.toArray();


const convertAsync = listComments.map(comment => {
    const { _id: commentID, task, files, images } = comment;

    const taskInfo = db.pcm_plan_tasks.findOne({ _id: task });

    if(taskInfo) {
        const dataUpdate = { $set: {} };
        const { _id: taskID, contract, project, company, group } = taskInfo;

        // File đính kèm
        if(files && files.length) {
            const filesCore = db.files.find({ _id: { $in: files } }).toArray();

            if(filesCore && filesCore.length) {
                const newFiles = [];

                for(let fileCore of filesCore) {
                    const {
                        _id: fileCoreID, name, nameOrg, description, path, size, mimeType, author, createAt, modifyAt
                    } = fileCore;

                    newFiles[newFiles.length] = {
                        company,
                        project,
                        group,
                        contract,
                        task: taskID,
                        comment: commentID,
                        file: fileCoreID,
                        type: 2,
                        name, nameOrg, description, path, size, mimeType, author,
                        isConvertedFromFileCore: true,
                        createAt, modifyAt
                    }
                }

                const { insertedIds } = db.pcm_files.insertMany(newFiles)
                dataUpdate.$set['files'] = insertedIds;
            }
        }

        // Hình ảnh
        if(images && images.length) {
            const filesCore = db.files.find({ _id: { $in: images } }).toArray();

            if(filesCore && filesCore.length) {
                const newFiles = [];

                for(let fileCore of filesCore) {
                    const {
                        _id: fileCoreID, name, nameOrg, description, path, size, mimeType, author, createAt, modifyAt
                    } = fileCore;

                    newFiles[newFiles.length] = {
                        company,
                        project,
                        group,
                        contract,
                        task: taskID,
                        comment: commentID,
                        file: fileCoreID,
                        type: 1,
                        name, nameOrg, description, path, size, mimeType, author,
                        isConvertedFromFileCore: true,
                        createAt, modifyAt
                    }
                }

                const { insertedIds } = db.pcm_files.insertMany(newFiles)
                dataUpdate.$set['images'] = insertedIds;
            }
        }

        if(Object.keys(dataUpdate.$set).length) {
            db.pcm_comments.updateOne({
                _id: commentID
            }, dataUpdate)
        }
    }
})

Promise.all(convertAsync)

/**
* ============================ ************************* ==============================
* ============================ 	 UPDATE PATH PCM FILE  	 ==============================
* ============================ ************************* ==============================
*/

const filesPcm = db.pcm_files.find({ isDataConvert: 1 }).toArray();

const convertAsync = filesPcm.map(f => {
    const infoFile = db.files.findOne({ _id: f.file });

    if(infoFile) {
        db.pcm_files.updateOne({
            _id: f._id
        }, {
            $set: {
                size: infoFile.size,
                path: infoFile.path
            }
        })
    }
})

Promise.all(convertAsync)


/**
* ============================ ************************* ==============================
* ============================ 	 UPDATE ACCESS_USERS  	 ==============================
* ============================ ************************* ==============================
*/
const listTasks = db.pcm_plan_tasks.find({}).projection({}).toArray()

const arrPromise = listTasks.map(task => {
    const { _id: taskId, related, author, assignee, accessUsers } = task;

    if(!accessUsers || !accessUsers.length) {
        const accessUsers = [author, assignee, ...related];

        db.pcm_plan_tasks.updateOne({ _id: ObjectId(taskId) }, {
            $set: {
                accessUsers
            }
        })
    }
})

Promise.all(arrPromise)


/**
* ================ ******************************************* ====================
* ================ 	 UPDATE COMPANY_OF_AUTHOR FOR PCM_COMMENT  ====================
* ================ ******************************************* ====================
*/
const listAuthors = db.pcm_comments.aggregate([
    {
        $group: {
            _id: "$author"
        }
    },
])

const arrPromise = listAuthors.map(({ _id: userId }) => {
    const infoUser = db.users.findOne({ _id: userId }, { company: 1 })

    if(infoUser) {
        db.pcm_comments.updateMany({
            author: userId
        }, {
            $set: {
                companyOfAuthor: infoUser.company
            }
        })
    }
})

Promise.all(arrPromise);

/**
* ================ **************************************** ====================
* ================ 	 UPDATE COMPANY_OF_AUTHOR FOR PCM_FILE  ====================
* ================ **************************************** ====================
*/
const listAuthors = db.pcm_files.aggregate([
    {
        $group: {
            _id: "$author"
        }
    },
])

const arrPromise = listAuthors.map(({ _id: userId }) => {
    const infoUser = db.users.findOne({ _id: userId }, { company: 1 })

    if(infoUser) {
        db.pcm_files.updateMany({
            author: userId
        }, {
            $set: {
                companyOfAuthor: infoUser.company
            }
        })
    }
})

Promise.all(arrPromise);