exports.LANGUAGE_KEYS = {
    CREATE_NEW_MEDIA: "CREATE_NEW_MEDIA",
    CREATE_COMMENT_MEDIA: "CREATE_COMMENT_MEDIA",
    CREATE_RESPONSE_PCM: "CREATE_RESPONSE_PCM",
    CREATE_NEW_TASK: "CREATE_NEW_TASK",
    CREATE_COMMENT_PCM: "CREATE_COMMENT_PCM",
    CREATE_CHECKLIST_PCM: "CREATE_CHECKLIST_PCM",
    CREATE_CHILDTASK_PCM: "CREATE_CHILDTASK_PCM",
    ADD_RELATION_USER: "ADD_RELATION_USER",
    ADD_SIGNATURE_TASK: "ADD_SIGNATURE_TASK",
    OPEN_BIDDING: "OPEN_BIDDING",
    CHECK_DONE_CHECKLIST: "CHECK_DONE_CHECKLIST",
    ADD_FILE_TO_RESPONSE: "ADD_FILE_TO_RESPONSE",
    REMINDER_EXPIRED_TASK: "REMINDER_EXPIRED_TASK",
    UPDATE_STATUS_TASK: "UPDATE_STATUS_TASK",
}

module.exports.APP_KEYS = {
    MEDIA: "5df4ce16506d9b3c587948ca",
    CHATTING: "5dfe4c1b51dc622100bb9d8f",
    PCM_PLAN_TASK: "5dfe4b9051dc622100bb9d89",
    DOCUMENT: "5e47867080019357cce04746",
    HUMAN: "61e049c9fdebf77b072d1b13",
    WORKSHOP:"61e049e7fdebf77b072d1b15",
    DATAHUB: "60390cb12b367a1cdd9f3fb2",
    FNB: "60390cb12b367a1cdd9f3fb2",
}

exports.KEY_ERROR  = {
    PERMISSION_DENIED   : "permission_denied",
    INSERT_FAILED       : "insert_failed",
    UPDATE_FAILED       : "update_failed",
    DELETE_FAILED       : "delete_failed",
    GET_INFO_FAILED     : "get_info_failed",
    GET_LIST_FAILED     : "get_list_failed",
    PARAMS_INVALID      : "params_invalid",
    ITEM_EXISTED        : "item_existed",
}

exports.REACTION_TYPES = [1,2,3,4,5,6,7];

exports.APP_ID = {
    PCM: {
        id: "5dfe4b9051dc622100bb9d89",
        menuPcmApp: {                                       // type = 1
            id: "623ef213e998e94feda0ccd8",
            projects: {
                id: "623ef363e998e94feda0ccde",
                name: "Dự án đang triển khai"
            },
            dashboard_portfolio: {
                id: "623efd30e998e94feda0cd1b",
                name: "Báo cáo đầu tư"
            },
            dashboard_task: {
                id: "623efd51e998e94feda0cd1c",
                name: "Báo cáo quản trị công việc",
            },
            dashboard_document: {
                id: "623efd64e998e94feda0cd1d",
                name: "Báo cáo quản trị hồ sơ",
            }
        },
        menuPcmProject: {                                    // type = 2
            id: "623f04cce998e94feda0cd32",
            dashboard: {
                id: "623f05f9e998e94feda0cd33",
                name: "Báo cáo quản trị"
            },
            folder: {
                id: "623f061de998e94feda0cd34",
                name: "Thư mục dữ liệu"
            },
            document: {
                id: "623f062fe998e94feda0cd35",
                name: "Hồ sơ văn bản",
            },
            budget: {
                id: "623f063be998e94feda0cd36",
                name: "Ngân sách và hợp đồng",
            },
            photo: {
                id: "623f0657e998e94feda0cd37",
                name: "Hình ảnh",
            },
            drawing: {
                id: "623f066ae998e94feda0cd38",
                name: "Bản vẽ",
            }
        }
    },
    CMCS: {
        id: "6131d6f83f4b736dc93253b2",
        menuCmcsApp: {
            id: "623f22b1e998e94feda0cd8b",                   // type = 1
            dashboard: {
                id: "623f22c2e998e94feda0cd90",
                name: "Báo cáo quản trị"
            },
            income: {
                id: "623f22d1e998e94feda0cd91",
                name: "Hợp đồng bán ra"
            },
            expense: {
                id: "623f22dee998e94feda0cd92",
                name: "Hợp đồng mua vào"
            },
            guarantee: {
                id: "623f22eae998e94feda0cd93",
                name: "Theo dõi bảo lãnh"
            },
        },
        menuCmcsContract: {
            id: "623f22ffe998e94feda0cd94",                    // type = 3
            dashboard: {
                id: "623f2311e998e94feda0cd95",
                name: "Báo cáo quản trị"
            },
            produce: {
                id: "623f231de998e94feda0cd96",
                name: "Sản lượng"
            },
            ipc: {
                id: "623f2338e998e94feda0cd97",
                name: "Nghiệm thu hoàn thành"
            },
            payment: {
                id: "623f2344e998e94feda0cd98",
                name: "Tiền về"
            },
        }
    },
    FINANCIAL: {
        id: "5dfe4bc751dc622100bb9d8a",
        menuFinancialApp: {
            id: "623f2448e998e94feda0cda9",                   // type = 1
            dashboard: {
                id: "623f2465e998e94feda0cdaa",
                name: "Báo cáo quản trị"
            },
            cashbook: {
                id: "623f2472e998e94feda0cdab",
                name: "Theo dõi sổ quỹ"
            },
            expense: {
                id: "623f247fe998e94feda0cdac",
                name: "Kế hoạch tài chính"
            },
        },
    },
    DOCUMENT: {
        id: "5e47867080019357cce04746",
        menuDocumentApp: {
            id: "623f23f1e998e94feda0cda4",
            dashboard: {
                id: "623f2404e998e94feda0cda6",
                name: "Báo cáo quản trị"
            }
        },
        menuDocumentProject: {}
    },
    HUMAN: {
        id: "61e049c9fdebf77b072d1b13",
    },
    BUDGET: {
        id: "5fe58c9b95db3c6e1534ec78",
    },
    ACCOUNTING: {
        id: "61e049aefdebf77b072d1b12"
    }
};