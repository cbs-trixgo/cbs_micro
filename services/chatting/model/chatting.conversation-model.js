'use strict'

/**
 * EXTERNAL PACKAGE
 */
const ObjectID = require('mongoose').Types.ObjectId
const moment = require('moment')
const PromisePool = require('@supercharge/promise-pool')

/**
 * CONSTANTS
 */
const { CF_DOMAIN_SERVICES } = require('../../gateway/helper/domain.constant')
const { CF_ACTIONS_AUTH } = require('../../auth/helper/auth.actions-constant')
const {
    CF_ACTIONS_REMINDER,
} = require('../../reminder/helper/reminder.actions-constant')

/**
 * TOOLS
 */
const BaseModel = require('../../../tools/db/base_model')
const {
    RANGE_BASE_PAGINATION,
    RANGE_BASE_PAGINATION_V2,
} = require('../../../tools/cursor_base/playground/index')
const { checkObjectIDs, IsJsonString } = require('../../../tools/utils/utils')

/**
 * COLLECTIONS
 */
const CHATTING__MESSAGE_COLL = require('../database/chatting.message-coll')
const CHATTING__CONVERSATION_COLL = require('../database/chatting.conversation-coll')
const CHATTING__CONVERSATION_MEMBER_COLL = require('../database/chatting.conversation_member-coll')
const CHATTING__CONVERSATION_LINK_COLL = require('../database/chatting.conversation_link-coll')

/**
 * MODELS
 */
const CHATTING__MESSAGE_MODEL = require('../model/chatting.message-model').MODEL

class Model extends BaseModel {
    constructor() {
        super(CHATTING__CONVERSATION_COLL)
    }

    /**
     * Dev: MinhVH
     * Func: Tạo cuộc hội thoại
     * Date: ...
     * Updated: MinhVH - 04/08/2021
     */
    insertConversation({
        name,
        description,
        bizfullname,
        authorID,
        membersID,
        isPrivate,
        company,
        ctx,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (
                    !checkObjectIDs([authorID, ...membersID]) ||
                    !membersID ||
                    !membersID.length
                ) {
                    return resolve({
                        error: true,
                        message: 'Tham số authorID or membersID không hợp lệ',
                        keyError: 'params_authorID_or_membersID_invalid',
                        status: 400,
                    })
                }

                // Tạo cuộc hội thoại 2 người
                if (isPrivate) {
                    if (membersID.length > 1) {
                        return resolve({
                            error: true,
                            message:
                                'Cuộc hội thoại riêng tư không được lớn hơn 1 thành viên',
                            keyError: 'number_of_members_must_equal_1',
                            status: 400,
                        })
                    }

                    // Kiểm tra nếu tồn tại cuộc hội thoại của hai người hoặc chính mình thì không tạo nữa
                    let checkExistConversation =
                        await CHATTING__CONVERSATION_COLL.findOne({
                            $or: [
                                { members: [authorID, ...membersID] },
                                { members: [...membersID, authorID] },
                                {
                                    members: [
                                        ...new Set([authorID, ...membersID]),
                                    ],
                                },
                            ],
                            // members: {
                            // 	$all: [ObjectID(authorID), ...membersID],
                            // 	$size: 2
                            // },
                        })
                            .populate('members', '_id bizfullname image')
                            .lean()

                    if (checkExistConversation)
                        return resolve({
                            error: false,
                            data: checkExistConversation,
                            status: 200,
                        })

                    let infoMember = await ctx.call(
                        `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_INFO_BY_ID}`,
                        {
                            userID: membersID[0],
                            select: 'bizfullname',
                        }
                    )

                    if (infoMember.error) {
                        return resolve({
                            error: true,
                            message: 'Không tìm thấy thành viên',
                            keyError: 'cannot_get_info_member',
                            status: 400,
                        })
                    }

                    name = `${bizfullname}_${infoMember?.data?.bizfullname}`
                } else {
                    // Tạo cuộc hội thoại nhiều hơn hai người ( Nhóm chat )
                    if (membersID.length <= 1) {
                        return resolve({
                            error: true,
                            message:
                                'Số lượngg thành viên của nhóm chat phải lớn hơn 1',
                            keyError: 'number_of_members_must_greater_than_1',
                            status: 400,
                        })
                    }

                    if (membersID.length >= 1000) {
                        return resolve({
                            error: true,
                            message:
                                'Số lượng thành viên không được lớn hơn 1000',
                            keyError: 'number_of_members_over_1000',
                            status: 400,
                        })
                    }
                }

                let infoConversationAfterInserted = await this.insertData({
                    name,
                    description,
                    isPrivate,
                    company: company._id,
                    authors: [authorID],
                    members: [...new Set([authorID, ...membersID])],
                    author: authorID,
                })

                if (!infoConversationAfterInserted) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

                if (isPrivate) {
                    membersID = [...new Set([authorID, ...membersID])]
                }

                await PromisePool.for(membersID)
                    .withConcurrency(2)
                    .process(async (memberID) => {
                        await CHATTING__CONVERSATION_MEMBER_COLL.create({
                            member: memberID,
                            conversation: infoConversationAfterInserted._id,
                            addedBy: authorID,
                            type: authorID === memberID ? 'owner' : 'member',
                        })
                    })

                const infoConversation =
                    await CHATTING__CONVERSATION_COLL.findById(
                        infoConversationAfterInserted._id
                    )
                        .populate('members', '_id bizfullname image')
                        .lean()

                return resolve({
                    error: false,
                    data: infoConversation,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Cập nhật thông tin cuộc hội thoại
     * Date: 04/08/2021
     */
    updateConversation({ conversationID, userID, name, description, avatar }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số conversation ID không hợp lệ',
                        keyError: 'params_conversationID_or_userID_invalid',
                        status: 403,
                    })
                }

                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $in: [userID] },
                    }).lean()

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message: 'Bạn không phải thành viên cuộc hội thoại',
                        keyError: 'you_are_not_member_of_conversation',
                        status: 403,
                    })
                }

                // Check cấu hình admin cuộc hội thoại
                if (
                    checkExistConversation.config &&
                    checkExistConversation.config.configEditInfo === 2
                ) {
                    const listAuthorsID = checkExistConversation.authors.map(
                        (author) => author.toString()
                    )
                    // User is not author of conversation
                    if (!listAuthorsID.includes(userID)) {
                        return resolve({
                            error: true,
                            message:
                                'Bạn không có quyền chỉnh sửa cuộc hội thoại',
                            keyError:
                                'you_do_not_permission_to_edit_conversation',
                            status: 403,
                        })
                    }
                }

                let infoMessageNotification = null
                let dataUpdate = {}
                name && (dataUpdate.name = name)
                description && (dataUpdate.description = description)

                // Cập nhật avatar cuộc hội thoại
                if (avatar && checkObjectIDs(avatar)) {
                    dataUpdate.avatar = avatar
                }

                let infoAfterUpdate =
                    await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                        conversationID,
                        {
                            $set: dataUpdate,
                        },
                        { new: true }
                    )

                if (!infoAfterUpdate) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

                if (name) {
                    infoMessageNotification =
                        await CHATTING__MESSAGE_MODEL.insertMessage({
                            senderID: userID,
                            receiversID: infoAfterUpdate.members,
                            conversationID,
                            type: 103,
                        })

                    if (infoAfterUpdate.isRename === false) {
                        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                            conversationID,
                            {
                                $set: { isRename: true },
                            }
                        )
                    }
                }

                if (avatar) {
                    infoMessageNotification =
                        await CHATTING__MESSAGE_MODEL.insertMessage({
                            senderID: userID,
                            receiversID: infoAfterUpdate.members,
                            conversationID,
                            type: 104,
                        })
                }

                return resolve({
                    error: false,
                    data: {
                        infoConversation: infoAfterUpdate,
                        infoMessage: infoMessageNotification,
                    },
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Cập nhật cuộc hội thoại theo điều kiện (service call service)
     * Date: 11/01/2022
     */
    updateConversationNamePrivate({ userID, bizfullname }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([userID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số userID không hợp lệ',
                        keyError: 'params_userID_invalid',
                        status: 400,
                    })
                }

                let condition = {
                    isPrivate: true,
                    members: { $in: [userID] },
                }

                const listConversation = await CHATTING__CONVERSATION_COLL.find(
                    condition
                )
                    .select('_id members')
                    .populate('members', '_id bizfullname')
                    .lean()

                const { results } = await PromisePool.for(listConversation)
                    .withConcurrency(2)
                    .process(async (conversation) => {
                        let friend = conversation.members.find(
                            (member) =>
                                member._id.toString() !== userID.toString()
                        )
                        let newNameConversationPrivate = `${friend && friend.bizfullname}_${bizfullname}`

                        if (!friend) return

                        // Update name for conversation private
                        const infoAfterUpdated =
                            await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                                conversation._id,
                                {
                                    name: newNameConversationPrivate,
                                },
                                { new: true }
                            )

                        return infoAfterUpdated
                    })

                if (!results || !results.length) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurred',
                        status: 422,
                    })
                }

                return resolve({ error: false, data: results, status: 200 })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Thêm thành viên cuộc hội thoại
     * Date: 06/08/2021
     */
    addMembersToConversation({ conversationID, authorID, membersID }) {
        return new Promise(async (resolve) => {
            try {
                if (
                    !checkObjectIDs([...membersID, conversationID, authorID]) ||
                    !Array.isArray(membersID) ||
                    !membersID.length
                ) {
                    return resolve({
                        error: true,
                        message: 'Tham số không hợp lệ',
                        keyError: 'params_invalid',
                        status: 400,
                    })
                }

                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        isPrivate: false,
                        authors: { $in: [authorID] },
                    }).populate('members')

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message: 'Bạn không phải admin cuộc hội thoại',
                        keyError: 'you_are_not_author',
                        status: 403,
                    })
                }

                for (const member of checkExistConversation.members) {
                    if (membersID.includes(member._id.toString())) {
                        return resolve({
                            error: true,
                            message: `Thành viên ${member.bizfullname || member.fullname} đã tồn tại trong cuộc hội thoại`,
                            keyError: 'member_is_added_in_conversation',
                            status: 403,
                        })
                    }
                }

                let infoConversationAfterUpdated =
                    await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                        conversationID,
                        {
                            $addToSet: {
                                members: { $each: membersID },
                            },
                        },
                        { new: true }
                    )

                if (!infoConversationAfterUpdated) {
                    return resolve({
                        error: true,
                        message: 'Có lỗi xảy ra',
                        keyError: 'error_occurs',
                        status: 422,
                    })
                }

                // INSERT USER MISS MESSAGE (DEFAULT 0)
                let usersMissMessage = membersID.map((memberID) => ({
                    userID: memberID,
                    amount: 0,
                }))

                await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                    conversationID,
                    {
                        $addToSet: { usersMissMessage },
                    }
                )

                // Check cấu hình admin cuộc hội thoại
                if (
                    checkExistConversation.config &&
                    checkExistConversation.config.configSeeOldMessage === 2
                ) {
                    // INSERT USER DELETE HISTORY
                    let usersDeleteHistory = membersID.map((memberID) => ({
                        userID: memberID,
                        lastMessage: checkExistConversation.lastMessage,
                        time: Date.now(),
                    }))

                    await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                        conversationID,
                        {
                            $addToSet: { usersDeleteHistory },
                        }
                    )
                }

                // INSERT MESSAGE ADD MEMBER TO CONVERSATION
                const infoMessageNotification =
                    await CHATTING__MESSAGE_MODEL.insertMessage({
                        senderID: authorID,
                        receiversID: infoConversationAfterUpdated.members,
                        usersAssigned: membersID,
                        conversationID,
                        type: 101,
                    })

                // INSERT MEMBER TO CONVERSATION
                await PromisePool.for(membersID)
                    .withConcurrency(2)
                    .process(async (memberID) => {
                        const infoMember =
                            await CHATTING__CONVERSATION_MEMBER_COLL.findOne({
                                member: memberID,
                                conversation: conversationID,
                            }).lean()

                        if (!infoMember) {
                            await CHATTING__CONVERSATION_MEMBER_COLL.create({
                                member: memberID,
                                conversation: conversationID,
                                addedBy: authorID,
                                type: 'member',
                            })
                        }
                    })

                return resolve({
                    error: false,
                    data: {
                        infoConversation: infoConversationAfterUpdated,
                        infoMessage: infoMessageNotification,
                    },
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Xóa thành viên khỏi cuộc hội thoại
     * Date: 06/08/2021
     */
    removeMemberInConversation({ conversationID, authorID, memberID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, authorID, memberID])) {
                    return resolve({
                        error: true,
                        message:
                            'Tham số conversationID hoặc memberID không hợp lệ',
                        keyError: 'params_conversationID_or_memberID_invalid',
                        status: 400,
                    })
                }

                if (memberID === authorID) {
                    return resolve({
                        error: true,
                        message: 'Bạn không thể xóa bạn khỏi cuộc hội thoại',
                        keyError: 'you_cannot_remove_you_from_conversation',
                        status: 400,
                    })
                }

                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        isPrivate: false,
                        authors: { $in: [authorID] },
                        members: { $in: [memberID] },
                    })

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message:
                            'Bạn không phải thành viên của cuộc hội thoại này (chỉ áp dụng trong nhóm chat)',
                        keyError: 'you_cannot_member_of_conversation',
                        status: 403,
                    })
                }

                let pullMemberObj = {}

                if (checkExistConversation.authors.includes(memberID)) {
                    // Nếu là root author -> dc xoá các author khác
                    if (checkExistConversation.author.toString() === authorID) {
                        pullMemberObj.authors = [memberID]
                        pullMemberObj.members = [memberID]
                    } else {
                        return resolve({
                            error: true,
                            message: 'Bạn không có quyền xóa admin',
                            keyError: 'you_do_not_permission_remove_admin',
                            status: 403,
                        })
                    }
                } else {
                    pullMemberObj.members = [memberID]
                }

                let infoConversationAfterUpdated =
                    await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                        conversationID,
                        {
                            $pullAll: pullMemberObj,
                            $pull: {
                                usersMissMessage: { userID: memberID },
                                usersDeleteHistory: { userID: memberID },
                            },
                        },
                        { new: true }
                    )

                if (!infoConversationAfterUpdated) {
                    return resolve({
                        error: true,
                        message: 'Không thể xóa thành viên khỏi cuộc hội thoại',
                        keyError: 'remove_member_of_conversation_failed',
                        status: 422,
                    })
                }

                // INSERT MESSAGE REMOVE MEMBER TO CONVERSATION
                const infoMessageNotification =
                    await CHATTING__MESSAGE_MODEL.insertMessage({
                        senderID: authorID,
                        receiversID: infoConversationAfterUpdated.members,
                        usersAssigned: [memberID],
                        conversationID,
                        type: 102,
                    })

                // DELETE MEMBER IN CONVERSATION
                await CHATTING__CONVERSATION_MEMBER_COLL.findOneAndDelete({
                    member: memberID,
                    conversation: conversationID,
                    type: { $ne: 'owner' },
                })

                return resolve({
                    error: false,
                    data: {
                        infoConversation: infoConversationAfterUpdated,
                        infoMessage: infoMessageNotification,
                    },
                    status: 200,
                })
            } catch (error) {
                console.error(error)
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Set member thành admin cho cuộc hội thoại (hoặc ngược lại)
     * Date: 07/08/2021
     */
    updateAdminConversation({
        conversationID,
        authorID,
        memberID,
        isSetAdmin,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, authorID, memberID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số không hợp lệ',
                        keyError:
                            'params_conversationID_or_authorID_or_memberID_invalid',
                        status: 400,
                    })
                }

                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        isPrivate: false,
                        authors: { $in: [authorID] },
                    })

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message:
                            'Bạn không có quyền set admin cho cuộc hội thoại',
                        keyError: 'you_are_not_author_conversation',
                        status: 403,
                    })
                }

                let infoConversationAfterUpdated = null
                let typeMember = ''
                let typeMessage = 0

                // Cập nhật member thành admin
                if (isSetAdmin) {
                    if (checkExistConversation.authors.includes(memberID)) {
                        return resolve({
                            error: true,
                            message: 'Thành viên đã được set admin',
                            keyError: 'member_is_already_an_author',
                            status: 400,
                        })
                    }

                    infoConversationAfterUpdated =
                        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                            conversationID,
                            {
                                $addToSet: {
                                    authors: memberID,
                                },
                            },
                            { new: true }
                        )

                    typeMessage = 105 // Xét thêm admin cuộc hội thoại
                    typeMember = 'admin'
                } else {
                    // Cập nhật admin thành member
                    if (
                        checkExistConversation.author.toString() ===
                        memberID.toString()
                    ) {
                        return resolve({
                            error: true,
                            message: 'Không thể xóa người tạo cuộc hội thoại',
                            keyError: 'cannot_remove_author_root',
                            status: 403,
                        })
                    }

                    infoConversationAfterUpdated =
                        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                            conversationID,
                            {
                                $pull: {
                                    authors: memberID,
                                },
                            },
                            { new: true }
                        )

                    typeMessage = 106 // Xoá bỏ quyền admin của member trong cuộc hội thoại
                    typeMember = 'member'
                }

                if (!infoConversationAfterUpdated) {
                    return resolve({
                        error: true,
                        message: 'Không thể cập nhật admin cho cuộc hội thoại',
                        keyError: 'cannot_update_admin_for_conversation',
                        status: 422,
                    })
                }

                const infoMessageNotification =
                    await CHATTING__MESSAGE_MODEL.insertMessage({
                        conversationID,
                        senderID: authorID,
                        type: typeMessage,
                        usersAssigned: [memberID],
                        receiversID: checkExistConversation.members,
                    })

                await CHATTING__CONVERSATION_MEMBER_COLL.findOneAndUpdate(
                    {
                        conversation: conversationID,
                        member: memberID,
                    },
                    {
                        $set: { type: typeMember },
                    }
                )

                return resolve({
                    error: false,
                    data: {
                        infoConversation: infoConversationAfterUpdated,
                        infoMessage: infoMessageNotification,
                    },
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Cài đặt cuộc hội thoại (group chat)
     * Date: 09/08/2021
     */
    updateConfigConversation({
        conversationID,
        authorID,
        typeConfig,
        valueConfig,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (
                    !checkObjectIDs([conversationID, authorID]) ||
                    ![1, 2].includes(+valueConfig)
                )
                    return resolve({
                        error: true,
                        message: 'Request params invalid',
                        status: 400,
                    })

                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        isPrivate: false,
                        authors: { $in: [authorID] },
                    })

                if (!checkExistConversation)
                    return resolve({
                        error: true,
                        message: "You aren't author conversation",
                        status: 403,
                    })

                let dataUpdate = { config: checkExistConversation.config }
                /**
                 * 1: Làm nổi bật tin của Admin
                 * 2: Member mới được xem tin nhắn cũ
                 * 3: Members được sửa thông tin nhóm
                 * 4: Members được tạo ghi chú, nhắc hẹn
                 * 5: Members được tạo bình chọn
                 * 6: Members được ghim tin nhắn
                 * 7: Members được gửi tin nhắn
                 */
                switch (+typeConfig) {
                    case 1:
                        dataUpdate.config['configHighlight'] = +valueConfig
                        break
                    case 2:
                        dataUpdate.config['configSeeOldMessage'] = +valueConfig
                        break
                    case 3:
                        dataUpdate.config['configEditInfo'] = +valueConfig
                        break
                    case 4:
                        dataUpdate.config['configCreateNote'] = +valueConfig
                        break
                    case 5:
                        dataUpdate.config['configCreatePoll'] = +valueConfig
                        break
                    case 6:
                        dataUpdate.config['configPinMessage'] = +valueConfig
                        break
                    case 7:
                        dataUpdate.config['configSendMessage'] = +valueConfig
                        break
                    default:
                        break
                }

                let infoConversationAfterUpdated =
                    await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                        conversationID,
                        {
                            $set: dataUpdate,
                        },
                        { new: true }
                    )

                if (!infoConversationAfterUpdated)
                    return resolve({
                        error: true,
                        message: "Can't update config conversation",
                        status: 403,
                    })

                return resolve({
                    error: false,
                    data: infoConversationAfterUpdated,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Cập nhật pin cuộc hội thoại
     * Date: 10/08/2021
     */
    updatePinConversation({ conversationID, userID, isPin, ctx }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID]))
                    return resolve({
                        error: true,
                        message: 'Request params invalid',
                        status: 400,
                    })

                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $in: [userID] },
                    })
                if (!checkExistConversation)
                    return resolve({
                        error: true,
                        message: "You aren't member of conversation",
                        status: 403,
                    })

                let infoUserAfterUpdated = await ctx.call(
                    `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.UPDATE_PIN_CONVERSATION}`,
                    {
                        conversationID,
                        userID,
                        isPin,
                    }
                )
                if (infoUserAfterUpdated.error)
                    return resolve(infoUserAfterUpdated)

                return resolve({
                    error: false,
                    data: infoUserAfterUpdated.data,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Lấy thông tin cuộc hội thoại của user
     * Date: 04/08/2021
     */
    getInfoConversationByID({
        conversationID,
        userID,
        filter = {},
        select = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID]))
                    return resolve({
                        error: true,
                        message: 'Request params invalid',
                        status: 400,
                    })

                if (filter && typeof filter === 'string') {
                    if (!IsJsonString(filter))
                        return resolve({
                            error: true,
                            message: 'Request params filter invalid',
                            status: 400,
                        })

                    filter = JSON.parse(filter)
                }

                if (select && typeof select === 'string') {
                    if (!IsJsonString(select))
                        return resolve({
                            error: true,
                            message: 'Request params select invalid',
                            status: 400,
                        })

                    select = JSON.parse(select)
                }

                let infoConversation =
                    await CHATTING__CONVERSATION_COLL.findOne(
                        {
                            _id: conversationID,
                            members: { $in: [userID] },
                        },
                        filter
                    )
                        .populate({
                            path: 'members',
                            select: select.members,
                        })
                        .populate({
                            path: 'authors',
                            select: select.authors,
                        })
                        .populate('lastMessage', select.lastMessage)
                        .populate({
                            path: 'messagesPin',
                            populate: {
                                path: 'sender poll reminder files.file',
                                select: '_id fullname bizfullname email image name options status content',
                                populate: {
                                    path: 'options.usersVote file',
                                    select: '_id bizfullname fullname image name nameOrg path size',
                                },
                            },
                            select: select.messagesPin,
                        })
                        .populate('avatar', select.avatar)
                        .lean()

                if (!infoConversation)
                    return resolve({
                        error: true,
                        message: "Can't get info conversation",
                        status: 403,
                    })

                return resolve({
                    error: false,
                    data: infoConversation,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Xem các nhóm chung với 1 thành viên
     * Date: 11/08/2021
     */
    getInfoGeneralGroupsByMember({ userID, memberID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([userID, memberID]))
                    return resolve({
                        error: true,
                        message: 'Request params invalid',
                        status: 400,
                    })

                const listGroupConversationsOfUser =
                    await CHATTING__CONVERSATION_COLL.find({
                        members: { $in: [userID] },
                        $nor: [
                            { members: { $exists: false } },
                            { members: { $size: 0 } },
                            { members: { $size: 2 } },
                        ],
                    })
                        .select('_id name description authors members avatar')
                        .populate({
                            path: 'avatar authors members',
                            select: '_id fullname username bizfullname image',
                            populate: {
                                path: 'file',
                                select: 'path',
                            },
                        })
                        .lean()

                const listGroupConversationsOfMember =
                    await CHATTING__CONVERSATION_COLL.find({
                        members: { $in: [memberID] },
                        $nor: [
                            { members: { $exists: false } },
                            { members: { $size: 0 } },
                            { members: { $size: 2 } },
                        ],
                    })
                        .select('_id name description authors members avatar')
                        .populate({
                            path: 'avatar authors members',
                            select: '_id fullname username bizfullname image path',
                        })
                        .lean()

                let listGeneralConversation = []

                listGroupConversationsOfUser.map((conversationOfUser) => {
                    listGroupConversationsOfMember.map(
                        (conversationOfMember) => {
                            // Kiểm tra chung nhóm hội thoại
                            if (
                                conversationOfUser._id.toString() ===
                                conversationOfMember._id.toString()
                            ) {
                                listGeneralConversation[
                                    listGeneralConversation.length
                                ] = {
                                    conversationID: conversationOfMember._id,
                                    name: conversationOfMember.name,
                                    description:
                                        conversationOfMember.description,
                                    members: conversationOfMember.members.slice(
                                        0,
                                        4
                                    ),
                                    infoOwner:
                                        conversationOfMember.authors &&
                                        conversationOfMember.author,
                                    avatar:
                                        conversationOfMember.avatar &&
                                        conversationOfMember.avatar.path,
                                }
                            }
                        }
                    )
                })

                return resolve({
                    error: false,
                    data: listGeneralConversation,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Lấy danh sách tin nhắn cuộc hội thoại (tìm kiếm tin nhắn, phân trang)
     * Date: 11/08/2021
     * Hàm chuẩn về lấy danh sách mẩu tin
     */
    getListMessagesConversationWithPage({
        conversationID,
        lastestID,
        userID,
        keyword,
        limit = 15,
        filter = {},
        select = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID])) {
                    return resolve({
                        error: true,
                        message:
                            'Tham số conversationID hoặc userID không hợp lệ',
                        keyError: 'params_conversationID_or_userID_invalid',
                        status: 400,
                    })
                }

                if (isNaN(limit) || +limit > 20) {
                    limit = 15
                } else {
                    limit = +limit
                }

                if (filter && typeof filter === 'string') {
                    if (!IsJsonString(filter))
                        return resolve({
                            error: true,
                            message: 'Request params filter invalid',
                            status: 400,
                        })

                    filter = JSON.parse(filter)
                }

                if (select && typeof select === 'string') {
                    if (!IsJsonString(select))
                        return resolve({
                            error: true,
                            message: 'Request params select invalid',
                            status: 400,
                        })

                    select = JSON.parse(select)
                }

                // Check user exist in conversation
                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $all: [userID] },
                    }).lean()

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message: 'Bạn không phải thành viên của cuộc hội thoại',
                        keyError: 'you_are_not_member_of_conversation',
                        status: 403,
                    })
                }

                // Init condition object
                let conditionObj = { conversation: conversationID }
                let conditionFind = {}
                let sortBy = {
                    createAt: -1,
                    modifyAt: -1,
                }

                // GET CONDITION PAGINATION
                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoMessage =
                        await CHATTING__MESSAGE_COLL.findById(lastestID)
                    if (!infoMessage)
                        return resolve({
                            error: true,
                            message: "Can't get info last message",
                            status: 400,
                        })

                    let nextInfo = `${infoMessage.createAt}_${infoMessage._id}`
                    let keys = ['createAt__-1', '_id__-1']

                    let dataPagingAndSort = await RANGE_BASE_PAGINATION({
                        nextInfo,
                        keys,
                    })
                    if (!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({
                            error: true,
                            message: "Can't get range pagination",
                            status: 400,
                        })

                    conditionFind = dataPagingAndSort.data.find
                }

                // CHECK USER DELETE HISTORY
                if (
                    checkExistConversation.usersDeleteHistory &&
                    checkExistConversation.usersDeleteHistory.length
                ) {
                    let checkExistInUserDeleteHistory =
                        checkExistConversation.usersDeleteHistory.find(
                            (user) => user.userID.toString() === userID
                        )

                    if (checkExistInUserDeleteHistory) {
                        conditionObj._id = {
                            $gt: checkExistInUserDeleteHistory.lastMessage,
                        }
                    }
                }

                // SEARCH TEXT
                // if(keyword){
                // 	conditionObj.$text = { $search: keyword };
                // 	objSort.score = { $meta: "textScore" };
                // 	sortBy.score  = { $meta: "textScore" };
                // }

                if (keyword) {
                    keyword = keyword.split(' ')
                    keyword = '.*' + keyword.join('.*') + '.*'
                    conditionObj.content = new RegExp(keyword, 'i')
                }

                let listMessages = await CHATTING__MESSAGE_COLL.find(
                    { ...conditionObj, ...conditionFind },
                    filter
                )
                    .populate('sender', select.sender)
                    .populate('usersSeen', select.usersSeen)
                    .populate('usersAssigned', select.usersAssigned)
                    .populate('receivers', select.receivers)
                    .populate({
                        path: 'reactions',
                        select: '_id type author',
                        options: { limit: 3 },
                        populate: {
                            path: 'author',
                            select: '_id bizfullname fullname image',
                        },
                    })
                    .populate({
                        path: 'parent',
                        select: select.parent,
                        populate: {
                            path: 'sender usersAssigned files.file',
                            select: `_id bizfullname fullname image ${select.files}`,
                            populate: {
                                path: 'file',
                                select: 'name nameOrg path size',
                            },
                        },
                    })
                    .populate({
                        path: 'poll',
                        populate: {
                            path: 'options.usersVote',
                            select: '_id bizfullname fullname image',
                        },
                        select: select.poll,
                    })
                    .populate('reminder', select.reminder)
                    .populate({
                        path: 'nps',
                        select: select.nps,
                        populate: {
                            path: 'service usersVote.reason usersVote.user',
                            select: 'name description type childs bizfullname position image',
                            populate: {
                                path: 'childs position',
                                select: 'name description type',
                            },
                        },
                    })
                    .populate({
                        path: 'files.file',
                        populate: {
                            path: 'file',
                            select: 'name nameOrg path description size',
                        },
                        select: select.files,
                    })
                    .sort(sortBy)
                    .limit(limit + 1)
                    .lean()

                // GET TOTAL RECORD
                let totalRecord =
                    await CHATTING__MESSAGE_COLL.countDocuments(conditionObj)
                let nextCursor = null

                if (listMessages && listMessages.length) {
                    if (listMessages.length > limit) {
                        nextCursor = listMessages[limit - 1]._id
                        listMessages.length = limit
                    }

                    if (!keyword) {
                        listMessages = listMessages.reverse()
                        nextCursor = listMessages[0]._id
                    }
                }

                return resolve({
                    error: false,
                    status: 200,
                    data: {
                        listRecords: listMessages,
                        limit,
                        totalRecord,
                        nextCursor,
                    },
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Tìm kiếm tin nhắn cuộc hội thoại (Dữ liệu trả về là 5 tin nhắn trước và sau tin nhắn tìm thấy)
     * Date: 23/08/2021
     * Updated: 10/02/2022
     */
    searchMessageConversationById({
        conversationID,
        userID,
        messageID,
        filter = {},
        select = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, messageID, userID])) {
                    return resolve({
                        error: true,
                        message:
                            'Tham số conversationID hoặc messageID không hợp lệ',
                        keyError: 'params_conversationID_or_messageID_invalid',
                        status: 400,
                    })
                }

                if (filter && typeof filter === 'string') {
                    if (!IsJsonString(filter))
                        return resolve({
                            error: true,
                            message: 'Request params filter invalid',
                            status: 400,
                        })

                    filter = JSON.parse(filter)
                }

                if (select && typeof select === 'string') {
                    if (!IsJsonString(select))
                        return resolve({
                            error: true,
                            message: 'Request params select invalid',
                            status: 400,
                        })

                    select = JSON.parse(select)
                }

                // Check user exist in conversation
                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $all: [userID] },
                    }).lean()

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message: 'Bạn không phải thành viên của cuộc hội thoại',
                        keyError: 'you_are_not_member_of_conversation',
                        status: 403,
                    })
                }

                let conditionObjFrontList = {
                    _id: { $lt: messageID },
                    conversation: conversationID,
                }
                let conditionObjBackList = {
                    _id: { $gt: messageID },
                    conversation: conversationID,
                }
                let conditionObjSearchMessage = {
                    _id: { $in: [messageID] },
                    conversation: conversationID,
                }

                // CHECK USER DELETE HISTORY
                if (
                    checkExistConversation.usersDeleteHistory &&
                    checkExistConversation.usersDeleteHistory.length
                ) {
                    let checkExistInUserDeleteHistory =
                        checkExistConversation.usersDeleteHistory.find(
                            (user) => user.userID.toString() === userID
                        )

                    if (checkExistInUserDeleteHistory) {
                        conditionObjSearchMessage._id.$gt =
                            checkExistInUserDeleteHistory.lastMessage
                        conditionObjFrontList._id.$gt =
                            checkExistInUserDeleteHistory.lastMessage
                    }
                }

                let infoMessage = await CHATTING__MESSAGE_COLL.findOne(
                    conditionObjSearchMessage,
                    filter
                )
                    .populate('sender', select.sender)
                    .populate('usersSeen', select.usersSeen)
                    .populate('usersAssigned', select.usersAssigned)
                    .populate('receivers', select.receivers)
                    .populate({
                        path: 'reactions',
                        select: '_id type',
                        populate: {
                            path: 'userCreate',
                            select: '_id bizfullname fullname image',
                        },
                    })
                    .populate({
                        path: 'parent',
                        select: select.parent,
                        populate: {
                            path: 'sender files.file',
                            populate: {
                                path: 'file',
                                select: 'name nameOrg path size',
                            },
                            select: `_id bizfullname fullname image ${select.files}`,
                        },
                    })
                    .populate({
                        path: 'poll',
                        populate: {
                            path: 'options.usersVote',
                            select: '_id bizfullname fullname image',
                        },
                        select: select.poll,
                    })
                    .populate('reminder', select.reminder)
                    .populate({
                        path: 'files.file',
                        populate: {
                            path: 'file',
                            select: 'name nameOrg path size',
                        },
                        select: select.files,
                    })
                    .lean()

                if (!infoMessage) {
                    return resolve({
                        error: true,
                        message: 'Tin nhắn không tồn tại',
                        keyError: 'message_not_exists',
                        status: 400,
                    })
                }

                let listMessagesFront = await CHATTING__MESSAGE_COLL.find(
                    conditionObjFrontList,
                    filter
                )
                    .limit(5)
                    .sort({ createAt: -1, _id: -1 })
                    .populate('sender', select.sender)
                    .populate('usersSeen', select.usersSeen)
                    .populate('usersAssigned', select.usersAssigned)
                    .populate('receivers', select.receivers)
                    .populate({
                        path: 'reactions',
                        select: '_id type',
                        populate: {
                            path: 'userCreate',
                            select: '_id bizfullname fullname image',
                        },
                    })
                    .populate({
                        path: 'parent',
                        select: select.parent,
                        populate: {
                            path: 'sender files.file',
                            populate: {
                                path: 'file',
                                select: 'name nameOrg path size',
                            },
                            select: `_id bizfullname fullname image ${select.files}`,
                        },
                    })
                    .populate({
                        path: 'poll',
                        populate: {
                            path: 'options.usersVote',
                            select: '_id bizfullname fullname image',
                        },
                        select: select.poll,
                    })
                    .populate('reminder', select.reminder)
                    .populate({
                        path: 'files.file',
                        populate: {
                            path: 'file',
                            select: 'name nameOrg path size',
                        },
                        select: select.files,
                    })
                    .lean()

                let listMessagesBack = await CHATTING__MESSAGE_COLL.find(
                    conditionObjBackList,
                    filter
                )
                    .limit(5)
                    .sort({ createAt: 1, _id: 1 })
                    .populate('sender', select.sender)
                    .populate('usersSeen', select.usersSeen)
                    .populate('usersAssigned', select.usersAssigned)
                    .populate('receivers', select.receivers)
                    .populate({
                        path: 'reactions',
                        select: '_id type',
                        populate: {
                            path: 'userCreate',
                            select: '_id bizfullname fullname image',
                        },
                    })
                    .populate({
                        path: 'parent',
                        select: select.parent,
                        populate: {
                            path: 'sender files.file',
                            populate: {
                                path: 'file',
                                select: 'name nameOrg path size',
                            },
                            select: `_id bizfullname fullname image ${select.files}`,
                        },
                    })
                    .populate({
                        path: 'poll',
                        populate: {
                            path: 'options.usersVote',
                            select: '_id bizfullname fullname image',
                        },
                        select: select.poll,
                    })
                    .populate('reminder', select.reminder)
                    .populate({
                        path: 'files.file',
                        populate: {
                            path: 'file',
                            select: 'name nameOrg path size',
                        },
                        select: select.files,
                    })
                    .lean()

                let listMessages = [
                    ...listMessagesFront.reverse(),
                    infoMessage,
                    ...listMessagesBack,
                ]

                const totalRecordFront =
                    await CHATTING__MESSAGE_COLL.countDocuments(
                        conditionObjFrontList
                    )
                const totalRecordBack =
                    await CHATTING__MESSAGE_COLL.countDocuments(
                        conditionObjBackList
                    )

                return resolve({
                    error: false,
                    status: 200,
                    data: {
                        listRecords: listMessages,
                        totalRecordFront,
                        totalRecordBack,
                    },
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Lấy danh sách tin nhắn media cuộc hội thoại
     * Date: 12/08/2021
     */
    getListMessagesMediaConversation({
        conversationID,
        userID,
        typeMessage,
        senderID,
        dateCreate,
        fromDate,
        toDate,
        page = 1,
        limit = 10,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (isNaN(typeMessage))
                    return resolve({
                        error: true,
                        message: 'Request param typeMessage invalid',
                        status: 400,
                    })

                if (!checkObjectIDs([conversationID, userID]))
                    return resolve({
                        error: true,
                        message: 'Request param invalid',
                        status: 400,
                    })

                // Check user exist in conversation
                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $all: [userID] },
                    }).lean()

                if (!checkExistConversation)
                    return resolve({
                        error: true,
                        message: "You are't member of conversation",
                        status: 403,
                    })

                if (!page || isNaN(page)) page = 1

                if (!limit || isNaN(limit) || +limit > 20) limit = 20

                page = +page
                limit = +limit
                typeMessage = +typeMessage

                let conditionObj = {
                    conversation: ObjectID(conversationID),
                }

                if (senderID && checkObjectIDs([senderID])) {
                    conditionObj.sender = ObjectID(senderID)
                }

                if (dateCreate) {
                    conditionObj.createAt = {
                        $gte: new Date(
                            moment(dateCreate).startOf('day').format()
                        ),
                        $lt: new Date(moment(dateCreate).endOf('day').format()),
                    }
                }

                if (fromDate && toDate) {
                    conditionObj.createAt = {
                        $gte: new Date(
                            moment(fromDate).startOf('day').format()
                        ),
                        $lte: new Date(moment(toDate).endOf('day').format()),
                    }
                }

                let groupObj = {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createAt',
                        },
                    },
                    dataFormat: {
                        $first: {
                            $dateToString: {
                                format: '%d/%m/%Y',
                                date: '$createAt',
                            },
                        },
                    },
                    // _id: { month: { $month: "$createAt" }, day: { $dayOfMonth: "$createAt" }, year: { $year: "$createAt" } },
                }

                let listMedia = []
                let totalRecord = 0

                // MESSAGE LINK
                if (typeMessage === 3) {
                    groupObj = {
                        ...groupObj,
                        messages: {
                            $push: {
                                _id: '$_id',
                                link: '$link',
                            },
                        },
                    }

                    let pipeline = [
                        { $match: conditionObj },
                        { $group: groupObj },
                        {
                            $facet: {
                                records: [
                                    { $sort: { _id: -1 } },
                                    { $skip: page * limit - limit },
                                    { $limit: limit },
                                ],
                                pageInfo: [
                                    {
                                        $group: {
                                            _id: null,
                                            count: { $sum: 1 },
                                        },
                                    },
                                ],
                            },
                        },
                    ]

                    listMedia =
                        await CHATTING__CONVERSATION_LINK_COLL.aggregate(
                            pipeline
                        )

                    if (!listMedia || !listMedia.length)
                        return resolve({
                            error: true,
                            message: "Can't get list message",
                            status: 404,
                        })

                    totalRecord = listMedia[0]?.pageInfo[0]?.count
                    listMedia = listMedia[0].records
                } else {
                    // MESSAGE FILE, IMAGE
                    groupObj = {
                        ...groupObj,
                        messages: {
                            $push: {
                                _id: '$_id',
                                type: '$type',
                                files: '$files',
                            },
                        },
                    }

                    let pipeline = [
                        {
                            $match: {
                                ...conditionObj,
                                type: typeMessage,
                            },
                        },
                        { $group: groupObj },
                        {
                            $facet: {
                                records: [
                                    { $sort: { _id: -1 } },
                                    { $skip: page * limit - limit },
                                    { $limit: limit },
                                ],
                                pageInfo: [
                                    {
                                        $group: {
                                            _id: null,
                                            count: { $sum: 1 },
                                        },
                                    },
                                ],
                            },
                        },
                    ]

                    listMedia = await CHATTING__MESSAGE_COLL.aggregate(pipeline)

                    if (!listMedia || !listMedia.length)
                        return resolve({
                            error: true,
                            message: "Can't get list message",
                            status: 404,
                        })

                    totalRecord = listMedia[0]?.pageInfo[0]?.count
                    listMedia = listMedia[0].records

                    if (listMedia && listMedia.length) {
                        listMedia = listMedia.map(async (media) => {
                            let listMessage = media.messages.map((message) =>
                                CHATTING__MESSAGE_COLL.findOne({
                                    _id: message._id,
                                })
                                    .select('_id files.file')
                                    .populate({
                                        path: 'files.file',
                                        select: '_id file',
                                        populate: {
                                            path: 'file',
                                            select: '_id name nameOrg path size',
                                        },
                                    })
                                    .lean()
                            )

                            listMessage = await Promise.all(listMessage)
                            let messages = []

                            for (const message of listMessage) {
                                if (message.files && message.files.length) {
                                    for (const fileInfo of message.files) {
                                        messages[messages.length] =
                                            fileInfo?.file?.file
                                    }
                                }
                            }

                            return { ...media, messages }
                        })

                        listMedia = await Promise.all(listMedia)
                    }
                }

                return resolve({
                    error: false,
                    data: {
                        listRecords: listMedia,
                        limit: +limit,
                        totalRecord,
                        page,
                    },
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Lấy danh sách thành viên gửi tin nhắn media cuộc hội thoại
     * Date: 13/08/2021
     */
    getListMemberSendMessagesMediaConversation({ conversationID, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID]))
                    return resolve({
                        error: true,
                        message: 'Request param invalid',
                        status: 400,
                    })

                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $all: [userID] },
                    })
                        .populate(
                            'members',
                            '_id fullname bizfullname email phone image'
                        )
                        .lean()

                if (!checkExistConversation)
                    return resolve({
                        error: true,
                        message: "You are't member of conversation",
                        status: 403,
                    })

                let listMemberSendMediaInConversation =
                    checkExistConversation.members.map(async (member) => {
                        let condition = {
                            conversation: conversationID,
                            sender: member._id,
                        }
                        let totalImagePromise =
                            CHATTING__MESSAGE_COLL.countDocuments({
                                ...condition,
                                type: 1,
                            })
                        let totalFilePromise =
                            CHATTING__MESSAGE_COLL.countDocuments({
                                ...condition,
                                type: 2,
                            })
                        let totalLinkPromise =
                            CHATTING__CONVERSATION_LINK_COLL.countDocuments({
                                ...condition,
                            })

                        let [totalImage, totalFile, totalLink] =
                            await Promise.all([
                                totalImagePromise,
                                totalFilePromise,
                                totalLinkPromise,
                            ])

                        if (totalImage || totalFile || totalLink) {
                            return {
                                infoMember: member,
                                totalImage,
                                totalFile,
                                totalLink,
                            }
                        }
                    })

                listMemberSendMediaInConversation = (
                    await Promise.all(listMemberSendMediaInConversation)
                ).filter(Boolean)

                return resolve({
                    error: false,
                    data: listMemberSendMediaInConversation,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Cập nhật trạng thái ẩn cuộc hội thoại của 1 user
     * Date: 14/08/2021
     */
    updateHideConversation({ conversationID, userID, isHide }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID])) {
                    return resolve({
                        error: true,
                        message: 'Request param invalid',
                        status: 400,
                    })
                }

                // Check user exist in conversation
                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $in: [userID] },
                    }).lean()

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message: "You are't member of conversation",
                        status: 403,
                    })
                }

                let infoAfterUpdated = null
                if (isHide) {
                    infoAfterUpdated =
                        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                            conversationID,
                            {
                                $addToSet: { usersHide: userID },
                            },
                            { new: true }
                        )
                } else {
                    infoAfterUpdated =
                        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                            conversationID,
                            {
                                $pull: { usersHide: userID },
                            },
                            { new: true }
                        )
                }

                if (!infoAfterUpdated)
                    return resolve({
                        error: true,
                        message: "Can't update hide conversation",
                        status: 403,
                    })

                return resolve({
                    error: false,
                    data: infoAfterUpdated,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Cập nhật on/off thông báo cuộc hội thoại của 1 user
     * Date: 14/08/2021
     */
    updateMuteConversation({ conversationID, userID, isMute, timeMute, ctx }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID]))
                    return resolve({
                        error: true,
                        message: 'Request param invalid',
                        status: 400,
                    })

                // Check user exist in conversation
                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $in: [userID] },
                    }).lean()

                if (!checkExistConversation)
                    return resolve({
                        error: true,
                        message: "You are't member of conversation",
                        status: 403,
                    })

                let infoAfterUpdated = null

                if (isMute) {
                    infoAfterUpdated =
                        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                            conversationID,
                            {
                                $addToSet: {
                                    usersMute: userID,
                                },
                            },
                            { new: true }
                        )
                } else {
                    infoAfterUpdated =
                        await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                            conversationID,
                            {
                                $pull: {
                                    usersMute: userID,
                                },
                            },
                            { new: true }
                        )
                }

                if (!infoAfterUpdated)
                    return resolve({
                        error: true,
                        message: "Can't update mute conversation",
                        status: 403,
                    })

                if ((isMute && !timeMute) || !isMute) {
                    await ctx.call(
                        `${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.DELETE_JOB_MUTE_CONVERSATION}`,
                        {
                            conversationID,
                            userID,
                        }
                    )
                }

                if (isMute && timeMute) {
                    await ctx.call(
                        `${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.DELETE_JOB_MUTE_CONVERSATION}`,
                        {
                            conversationID,
                            userID,
                        }
                    )

                    await ctx.call(
                        `${CF_DOMAIN_SERVICES.REMINDER}.${CF_ACTIONS_REMINDER.ADD_JOB_MUTE_CONVERSATION}`,
                        {
                            conversationID,
                            timeMute,
                            userID,
                        }
                    )
                }

                return resolve({
                    error: false,
                    data: infoAfterUpdated,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Đánh dấu đã đọc cuộc hội thoại của 1 user
     * Date: 14/08/2021
     */
    markReadConversation({ conversationID, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID]))
                    return resolve({
                        error: true,
                        message: 'Request param invalid',
                        status: 400,
                    })

                // Check user exist in conversation
                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $in: [userID] },
                    }).lean()

                if (!checkExistConversation)
                    return resolve({
                        error: true,
                        message: "You are't member of conversation",
                        status: 403,
                    })

                let infoAfterUpdated =
                    await CHATTING__CONVERSATION_COLL.findOneAndUpdate(
                        {
                            _id: conversationID,
                            usersMissMessage: {
                                $elemMatch: { userID },
                            },
                        },
                        {
                            $set: {
                                'usersMissMessage.$.amount': 0,
                            },
                        },
                        { new: true }
                    )

                return resolve({
                    error: false,
                    data: infoAfterUpdated,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Member rời khỏi cuộc hội thoại
     * Date: 14/08/2021
     */
    memberLeaveConversation({ conversationID, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số không hợp lệ',
                        keyError: 'params_conversationID_or_userID_invalid',
                        status: 400,
                    })
                }

                // Check user exist in conversation
                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        isPrivate: false,
                        members: { $in: [userID] },
                    }).lean()

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message:
                            'Bạn không phải thành viên của cuộc hội thoại hoặc cuộc hội thoại là riêng tư',
                        keyError: 'you_are_not_member_of_conversation',
                        status: 403,
                    })
                }

                let pullObj = { members: userID }
                if (checkExistConversation.authors.includes(userID)) {
                    pullObj.authors = userID
                }

                const infoMessageNotification =
                    await CHATTING__MESSAGE_MODEL.insertMessage({
                        conversationID,
                        senderID: userID,
                        type: 107,
                        usersAssigned: [userID],
                    })

                const infoAfterUpdated =
                    await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                        conversationID,
                        {
                            $pull: pullObj,
                        },
                        { new: true }
                    )

                if (!infoAfterUpdated) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurred',
                        status: 422,
                    })
                }

                await CHATTING__CONVERSATION_MEMBER_COLL.findOneAndDelete({
                    member: userID,
                    conversation: conversationID,
                })

                return resolve({
                    error: false,
                    data: {
                        infoConversation: infoAfterUpdated,
                        infoMessage: infoMessageNotification,
                    },
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Giải tán cuộc hội thoại (xóa nhóm)
     * Date: 14/08/2021
     */
    deleteConversation({ conversationID, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID]))
                    return resolve({
                        error: true,
                        message: 'Request param invalid',
                        status: 400,
                    })

                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        authors: { $in: [userID] },
                    }).lean()

                if (!checkExistConversation)
                    return resolve({
                        error: true,
                        message: "You are't author of conversation",
                        status: 403,
                    })

                if (
                    checkExistConversation.author.toString() !==
                    userID.toString()
                )
                    return resolve({
                        error: true,
                        message:
                            "You are't root author of conversation (access denined)",
                        status: 403,
                    })

                let infoAfterDelete =
                    await CHATTING__CONVERSATION_COLL.findByIdAndDelete(
                        conversationID
                    )

                if (!infoAfterDelete) {
                    return resolve({
                        error: true,
                        message:
                            'Là lỗi của chúng tôi không phải của bạn, chúng tôi đang tìm cách khắc phục',
                        keyError: 'error_occurred',
                        status: 422,
                    })
                }

                await CHATTING__CONVERSATION_MEMBER_COLL.deleteMany({
                    member: { $in: checkExistConversation.members },
                    conversation: conversationID,
                })

                return resolve({
                    error: false,
                    status: 200,
                    data: infoAfterDelete,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Xoá lịch sử cuộc hội thoại
     * Date: 15/08/2021
     */
    deleteHistoryConversation({ conversationID, userID }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([conversationID, userID])) {
                    return resolve({
                        error: true,
                        message: 'Tham số không hợp lệ',
                        keyEror: 'params_conversationID_or_userID_invalid',
                        status: 400,
                    })
                }

                // Check user exist in conversation
                let checkExistConversation =
                    await CHATTING__CONVERSATION_COLL.findOne({
                        _id: conversationID,
                        members: { $in: [userID] },
                    }).lean()

                if (!checkExistConversation) {
                    return resolve({
                        error: true,
                        message: 'Bạn không phải thành viên của cuộc hội thoại',
                        keyEror: 'you_are_not_member_of_conversation',
                        status: 403,
                    })
                }

                // Pull current user in array usersDeleteHistory if usersDeleteHistory.length > 0
                await CHATTING__CONVERSATION_COLL.findOneAndUpdate(
                    {
                        _id: conversationID,
                        usersDeleteHistory: {
                            $exists: true,
                            $not: { $size: 0 },
                        },
                    },
                    {
                        $pull: {
                            usersDeleteHistory: { userID },
                        },
                        $set: {
                            lastMessage: null,
                        },
                    }
                )

                // Push current user into array usersDeleteHistory
                let infoAfterDelete =
                    await CHATTING__CONVERSATION_COLL.findByIdAndUpdate(
                        conversationID,
                        {
                            $push: {
                                usersDeleteHistory: {
                                    userID,
                                    lastMessage:
                                        checkExistConversation.lastMessage,
                                    time: Date.now(),
                                },
                            },
                        },
                        { new: true }
                    )

                if (!infoAfterDelete) {
                    return resolve({
                        error: true,
                        message: 'Đã xảy ra lỗi',
                        keyEror: 'error_occurred',
                        status: 422,
                    })
                }

                return resolve({
                    error: false,
                    data: infoAfterDelete,
                    status: 200,
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Lấy danh sách cuộc hội thoại (hoặc tìm kiếm theo tên)
     * Date: 23/08/2021
     */
    getListConversationWithPage({
        lastestID,
        userID,
        keyword,
        bizfullname,
        limit = 20,
        filter = {},
        select = {},
        ctx,
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs(userID)) {
                    return resolve({
                        error: true,
                        message: 'Tham số userID không hợp lệ',
                        keyError: 'params_userID_invalid',
                        status: 400,
                    })
                }

                if (isNaN(limit) || limit > 20) {
                    limit = 20
                } else {
                    limit = +limit
                }

                if (filter && typeof filter === 'string') {
                    if (!IsJsonString(filter)) {
                        return resolve({
                            error: true,
                            message: 'Tham số filter không hợp lệ',
                            keyError: 'params_filter_invalid',
                            status: 400,
                        })
                    }

                    filter = JSON.parse(filter)
                }

                if (select && typeof select === 'string') {
                    if (!IsJsonString(select)) {
                        return resolve({
                            error: true,
                            message: 'Tham số select không hợp lệ',
                            keyError: 'params_select_invalid',
                            status: 400,
                        })
                    }

                    select = JSON.parse(select)
                }

                let listConversationFiltered = []
                let conditionObj = {
                    members: { $in: [userID] },
                    usersHide: { $nin: [userID] },
                }
                let amountMissMessage = 0
                let conditionFind = {}
                let sortBy = {
                    modifyAt: -1,
                    createAt: -1,
                }

                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoConversation =
                        await CHATTING__CONVERSATION_COLL.findById(lastestID)
                    if (!infoConversation) {
                        return resolve({
                            error: true,
                            message:
                                'Không thể lấy thông tin cuộc hội thoại theo lastestID',
                            keyError: 'cannot_get_info_by_lastestID',
                            status: 403,
                        })
                    }

                    let nextInfo = `${infoConversation.modifyAt}_${infoConversation._id}`
                    let keys = ['modifyAt__-1', '_id__-1']

                    let dataPagingAndSort = await RANGE_BASE_PAGINATION({
                        nextInfo,
                        keys,
                    })
                    if (!dataPagingAndSort || dataPagingAndSort.error) {
                        return resolve({
                            error: true,
                            message: 'Không thể lấy phạm vi phân trang',
                            keyError: 'cannot_get_range_pagination',
                            status: 403,
                        })
                    }

                    conditionFind = dataPagingAndSort.data.find
                }

                // SEARCH TEXT
                if (keyword) {
                    let key = keyword.split(' ')
                    key = '.*' + key.join('.*') + '.*'
                    conditionObj.name = new RegExp(key, 'i')
                }

                let listConversationPin = await ctx.call(
                    `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.GET_LIST_PIN_CONVERSATION}`,
                    {
                        userID,
                    }
                )

                if (
                    listConversationPin.data &&
                    listConversationPin.data.length
                ) {
                    let listConversationIDPined = listConversationPin.data

                    // Nếu là trang đầu thì lấy danh sách conversation đã pin
                    if (!lastestID) {
                        listConversationPin =
                            await CHATTING__CONVERSATION_COLL.find(
                                {
                                    _id: { $in: listConversationPin.data },
                                    ...conditionObj,
                                },
                                filter
                            )
                                .populate('members', select.members)
                                .populate({
                                    path: 'lastMessage',
                                    populate: {
                                        path: 'sender',
                                        select: select.sender,
                                    },
                                    select: select.lastMessage,
                                })
                                .populate({
                                    path: 'avatar',
                                    populate: {
                                        path: 'file',
                                        select: 'name nameOrg size path',
                                    },
                                    select: select.avatar,
                                })
                                .lean()

                        listConversationPin = listConversationPin.map(
                            (conversationPined) => {
                                conversationPined.isPin = true
                                return conversationPined
                            }
                        )
                    } else {
                        listConversationPin = []
                    }

                    conditionObj._id = { $nin: listConversationIDPined }
                } else {
                    listConversationPin = []
                }

                let listConversation = await CHATTING__CONVERSATION_COLL.find(
                    { ...conditionFind, ...conditionObj },
                    filter
                )
                    .populate('members', select.members)
                    .populate({
                        path: 'lastMessage',
                        populate: {
                            path: 'sender',
                            select: select.sender,
                        },
                        select: select.lastMessage,
                    })
                    .populate({
                        path: 'avatar',
                        populate: {
                            path: 'file',
                            select: 'name nameOrg size path',
                        },
                        select: select.avatar,
                    })
                    .limit(limit + 1)
                    .sort(sortBy)
                    .lean()

                listConversation = [...listConversationPin, ...listConversation]

                if (keyword) {
                    keyword = keyword?.toLowerCase()
                    for (const conversation of listConversation) {
                        // Nếu là cuộc hội thoại riêng tư và chưa đổi tên
                        if (conversation.isPrivate && !conversation.isRename) {
                            let [memberName1st, memberName2st] =
                                conversation.name?.split('_')
                            memberName1st = memberName1st?.toLowerCase() || ''
                            memberName2st = memberName2st?.toLowerCase() || ''
                            bizfullname = bizfullname?.toLowerCase() || ''

                            if (
                                bizfullname === memberName1st &&
                                memberName2st.includes(keyword)
                            ) {
                                listConversationFiltered[
                                    listConversationFiltered.length
                                ] = conversation
                            } else if (
                                bizfullname === memberName2st &&
                                memberName1st.includes(keyword)
                            ) {
                                listConversationFiltered[
                                    listConversationFiltered.length
                                ] = conversation
                            }

                            continue
                        }

                        listConversationFiltered[
                            listConversationFiltered.length
                        ] = conversation
                    }
                } else {
                    listConversationFiltered = listConversation
                }

                const listAllConversation =
                    await CHATTING__CONVERSATION_COLL.find({
                        members: { $in: [userID] },
                    })
                        .select('usersMissMessage')
                        .lean()

                listAllConversation.map((conversation) => {
                    const user = conversation?.usersMissMessage?.find(
                        (user) => user.userID.toString() === userID.toString()
                    )

                    user && (amountMissMessage += user.amount)
                })

                // GET TOTAL RECORD
                let totalRecord =
                    await CHATTING__CONVERSATION_COLL.countDocuments(
                        conditionObj
                    )
                let nextCursor = null

                if (
                    listConversationFiltered &&
                    listConversationFiltered.length
                ) {
                    if (listConversationFiltered.length > limit) {
                        nextCursor = listConversationFiltered[limit - 1]._id
                        listConversationFiltered.length = limit
                    }
                }

                return resolve({
                    error: false,
                    status: 200,
                    data: {
                        listRecords: listConversationFiltered,
                        limit,
                        totalRecord,
                        amountMissMessage,
                        nextCursor,
                    },
                })
            } catch (error) {
                console.error(error)
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }

    /**
     * Dev: MinhVH
     * Func: Lấy danh sách cuộc hội thoại chưa đọc
     * Date: 09/09/2021
     */
    getListConversationMissMessage({
        userID,
        lastestID,
        limit = 20,
        filter = {},
        select = {},
    }) {
        return new Promise(async (resolve) => {
            try {
                if (!checkObjectIDs([userID]))
                    return resolve({
                        error: true,
                        message: 'Request param userID invalid',
                        status: 400,
                    })

                if (isNaN(limit)) {
                    limit = 20
                } else {
                    limit = +limit
                }

                if (filter && typeof filter === 'string') {
                    if (!IsJsonString(filter))
                        return resolve({
                            error: true,
                            message: 'Request params filter invalid',
                            status: 400,
                        })

                    filter = JSON.parse(filter)
                }

                if (select && typeof select === 'string') {
                    if (!IsJsonString(select))
                        return resolve({
                            error: true,
                            message: 'Request params select invalid',
                            status: 400,
                        })

                    select = JSON.parse(select)
                }

                let conditionFind = {}
                let conditionObj = {
                    members: { $in: [userID] },
                    usersMissMessage: {
                        $elemMatch: {
                            userID,
                            amount: { $gt: 0 },
                        },
                    },
                }
                let sortBy = {
                    modifyAt: -1,
                    createAt: -1,
                }

                if (lastestID && checkObjectIDs(lastestID)) {
                    let infoConversation =
                        await CHATTING__CONVERSATION_COLL.findById(lastestID)
                    if (!infoConversation)
                        return resolve({
                            error: true,
                            message: "Can't get info last conversation",
                            status: 403,
                        })

                    let nextInfo = `${infoConversation.modifyAt}_${infoConversation._id}`
                    let keys = ['modifyAt__-1', '_id__-1']

                    let dataPagingAndSort = await RANGE_BASE_PAGINATION({
                        nextInfo,
                        keys,
                    })
                    if (!dataPagingAndSort || dataPagingAndSort.error)
                        return resolve({
                            error: true,
                            message: "Can't get range pagination",
                            status: 400,
                        })

                    conditionFind = dataPagingAndSort.data.find
                }

                let listConversationMissMessage =
                    await CHATTING__CONVERSATION_COLL.find(
                        { ...conditionObj, ...conditionFind },
                        filter
                    )
                        .populate({
                            path: 'lastMessage',
                            populate: {
                                path: 'sender',
                                select: select.sender,
                            },
                            select: select.lastMessage,
                        })
                        .populate({
                            path: 'avatar',
                            populate: {
                                path: 'file',
                                select: 'name nameOrg size path',
                            },
                            select: select.avatar,
                        })
                        .limit(limit + 1)
                        .sort(sortBy)

                // GET TOTAL RECORD
                let totalRecord =
                    await CHATTING__CONVERSATION_COLL.countDocuments(
                        conditionObj
                    )
                let nextCursor = null

                if (
                    listConversationMissMessage &&
                    listConversationMissMessage.length
                ) {
                    if (listConversationMissMessage.length > limit) {
                        nextCursor = listConversationMissMessage[limit - 1]._id
                        listConversationMissMessage.length = limit
                    }
                }

                return resolve({
                    error: false,
                    status: 200,
                    data: {
                        listRecords: listConversationMissMessage,
                        limit: +limit,
                        totalRecord,
                        nextCursor,
                    },
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message,
                    status: 500,
                })
            }
        })
    }
}

exports.MODEL = new Model()
