// LĨNH VỰC HOẠT ĐỘNG CỦA CÔNG TY
exports.FIELD_APP = [
    { value: 1, text: 'Công nghệ' },
    { value: 2, text: 'Xây dựng' },
    { value: 3, text: 'Thương mại' },
    { value: 4, text: 'Giáo dục' },
    { value: 5, text: 'Y tế' },
]

// QUY MÔ CÔNG TY
exports.SCALES_COMPANY = [
    { value: 1, text: '1-10' },
    { value: 2, text: '10-50' },
    { value: 3, text: '50-100' },
    { value: 4, text: '> 100' },
]

// NHÓM CHỨC NĂNG ỨNG DỤNG MẶC ĐỊNH (PHỤC VỤ CẤU HÌNH BAN ĐẦU)
exports.APP_ROLES = [
    { value: 11, text: 'Nhóm quản trị ứng dụng', permission: {read: 1, create: 1, update: 1, deleteIn: 1} },
    { value: 12, text: 'Nhóm ban lãnh đạo', permission: {read: 1, create: 1, update: 1, deleteIn: 0} },
    { value: 13, text: 'Nhóm nhân viên công ty', permission: {read: 1, create: 1, update: 1, deleteIn: 0} },
    { value: 14, text: 'Nhóm khách mời của công ty', permission: {read: 1, create: 0, update: 0, deleteIn: 0} },
]

// NHÓM CHỨC NĂNG ỨNG DỤNG MẶC ĐỊNH (PHỤC VỤ CẤU HÌNH BAN ĐẦU)
exports.PROJECT_ROLES = [
    { value: 21, text: 'Nhóm quản trị Dự án/Phòng ban/Hợp đồng', permission: {read: 1, create: 1, update: 1, deleteIn: 1} },
    { value: 22, text: 'Nhóm ban lãnh đạo', permission: {read: 1, create: 1, update: 1, deleteIn: 0} },
    { value: 23, text: 'Nhóm thành viên Dự án/Phòng ban/Hợp đồng', permission: {read: 1, create: 1, update: 1, deleteIn: 0} },
    { value: 24, text: 'Nhóm khách mời của Dự án/Phòng ban/Hợp đồng', permission: {read: 1, create: 0, update: 0, deleteIn: 0} }
]

// CÁC BÊN THAM GIA TRONG DỰ ÁN
exports.PROJECT_PARTIES = [
    { value: 0, text: 'Trợ lý viên', key: '' },
    { value: 1, text: 'Chủ đầu tư', key: '' },
    { value: 2, text: 'Tư vấn QLDA', key: '' },
    { value: 3, text: 'Tư vấn giám sát', key: '' },
    { value: 4, text: 'Tư vấn thiết kế', key: '' },
    { value: 5, text: 'Nhà thầu thi công', key: '' },
]

// For CONINCO only
exports.CNC_PROJECT_ROLES = [
    { value: 21, text: 'Ban TGĐ', permission: {read: 1, create: 0, update: 0, deleteIn: 0} },
    { value: 22, text: 'Phòng Kinh doanh', permission: {read: 1, create: 1, update: 1, deleteIn: 1} },
    { value: 23, text: 'Phòng Quản lý kỹ thuật', permission: {read: 1, create: 1, update: 1, deleteIn: 0} },
    { value: 24, text: 'Phòng Tài chính đầu tư', permission: {read: 1, create: 1, update: 1, deleteIn: 0} },
    { value: 25, text: 'Trung tâm', permission: {read: 1, create: 1, update: 1, deleteIn: 0} },
]

// PHÂN LOẠI PHÒNG BAN/DỰ ÁN
exports.DEPARTMENT_TYPES = [
    { value: 1, text: 'Phòng ban', key: 'department' },
    { value: 2, text: 'Dự án', key: 'project' }
]

// TRẠNG THÁI PHÒNG BAN/DỰ ÁN
exports.DEPARTMENT_STATUS = [
    { value: 1, text: 'Đang triển khai', class: 'tajic-status-btn-in-progress', backgroud: '00aaff', key: 'in_progress' },
    { value: 2, text: 'Bàn giao', class: 'tajic-status-btn-open', backgroud: '4d4dff', key: 'hand_over' },
    { value: 3, text: 'Hoàn thành', class: 'tajic-status-btn-completed', backgroud: '5fba7d', key: 'completed' },
    { value: 4, text: 'Tạm dừng', class: 'tajic-status-btn-follow-up', backgroud: '5bc0de', key: 'follow_up' },
]

// LOẠI DỰ ÁN
exports.PROJECT_TYPES = [
    { value: 1, text: 'Quan trọng quốc gia', key: 'in_progress' },
    { value: 2, text: 'Loại A', key: 'hand_over' },
    { value: 3, text: 'Loại B', key: 'completed' },
    { value: 4, text: 'Loại C', key: 'follow_up' },
]

// LOẠI CÔNG TRÌNH
exports.BUILDING_TYPES = [
    { value: 1, text: 'Công trình dân dụng', key: 'in_progress' },
    { value: 2, text: 'Công trình công nghiệp', key: 'hand_over' },
    { value: 3, text: 'Công trình giao thông', key: 'completed' },
    { value: 4, text: 'Công trình nông nghiệp và phát triển nông thôn', key: 'follow_up' },
    { value: 5, text: 'Công trình hạ tầng kỹ thuật', key: 'follow_up' },
    { value: 6, text: 'Công trình quốc phòng, an ninh', key: 'follow_up' },
]

// CẤP CÔNG TRÌNH
exports.BUILDING_GRADES = [
    { value: 1, text: 'Đặc biệt', key: 'in_progress' },
    { value: 2, text: 'Cấp 1', key: 'hand_over' },
    { value: 3, text: 'Cấp 2', key: 'completed' },
    { value: 4, text: 'Cấp 3', key: 'follow_up' },
    { value: 5, text: 'Cấp 4', key: 'follow_up' },
]

// NGUỒN VỐN DỰ ÁN
exports.PROJECT_CAPITAL = [
    { value: 1, text: 'Tư nhân', key: 'completed' },
    { value: 2, text: 'Ngân sách nhà nước', key: 'in_progress' },
    { value: 3, text: 'Nhà nước ngoài ngân sách', key: 'hand_over' },
    { value: 4, text: 'Vốn khác', key: 'follow_up' },
]

exports.PCM_CONFIG_TYPE = [
    { value: 0, 
        configs: {
            parent: 1,
            response: 1,
        }
    },
]

// LOẠI DANH BẠ
exports.CONTACT_TYPES = [
    { value: 1, text: 'Nhân viên' },
    { value: 2, text: 'Khách hàng' },
    { value: 3, text: 'Đối tác' },
    { value: 4, text: 'Thầu phụ' },
    { value: 5, text: 'Chuyên gia' },
    { value: 6, text: 'Khách mời' },
    { value: 7, text: 'Khác' },
]
// PHÂN LOẠI NHÂN SỰ
exports.CONTACT_SUB_TYPES = [
    { value: 1, text: 'Nhân viên' },
    { value: 2, text: 'Cộng tác viên' },
    { value: 3, text: 'Chuyên gia' },
]

// GIỚI TÍNH
exports.GENDER_TYPES = [
    { value: 1, text: 'Nam', gender: 'Ông' },
    { value: 2, text: 'Nữ', gender: 'Bà' },
    { value: 3, text: 'Khác', gender: 'Khác' }
]

// NHÂN SỰ THỰC/ẢO-GỬI BẢO HIỂM
exports.CONTACT_TA = [
    { value: 1, text: 'T' },
    { value: 2, text: 'A' },
]

// PHÂN LOẠI CHÍNH SÁCH
exports.CONTACT_POLICY = [
    { value: 1, text: 'Không' },
    { value: 2, text: 'Bộ đội phục viên' },
    { value: 3, text: 'Con thương bệnh binh' },
    { value: 4, text: 'Gia đình chính sách' },
]

// TÌNH TRẠNG NỘP SỔ BẢO HIỂM
exports.INSURANCE_STATUS = [
    { value: 1, text: 'Chưa nộp' },
    { value: 2, text: 'Đã nộp' },
    { value: 3, text: 'Thêm mới ' },
]

// TRẠNG THÁI HỒ SƠ CỦA NHÂN SỰ
exports.CONTACT_DOCUMENT_STATUS = [
    { value: 1, text: 'Còn hiệu lực', color: 'green' },
    { value: 2, text: 'Hết hiệu lực', color: 'red' },
]

// PHÂN HẠNG CHỨNG CHỈ
exports.CONTACT_DOCUMENT_GRADES = [
    { value: 1, text: 'Hạng 1' },
    { value: 2, text: 'Hạng 2' },
    { value: 3, text: 'Hạng 3' },
    { value: 4, text: 'Hạng 4' },
]

// TRẠNG THÁI TIẾP CẬN THỊ TRƯỜNG
exports.CRM_STATUS = [
    { value: 1, text: 'Đang triển khai', class: 'tajic-status-btn-in-progress', backgroud: '00aaff', key: 'in_progress' },
    { value: 2, text: 'Dừng tiếp cận', class: 'tajic-status-btn-follow-up', backgroud: '5bc0de', key: 'follow_up' },
    { value: 3, text: 'Trúng thầu', class: 'tajic-status-btn-completed', backgroud: '5fba7d', key: 'completed' },
    { value: 4, text: 'Thành hợp đồng', class: 'tajic-status-btn-completed', backgroud: '5fba7d', key: 'completed' },
]

// YẾU TỐ NƯỚC NGOÀI
exports.CRM_ABROAD = [
    { value: 0, text: 'Không', class: 'tajic-status-btn-in-progress', backgroud: '00aaff', key: 'in_progress' },
    { value: 1, text: 'Có', class: 'tajic-status-btn-completed', backgroud: '5fba7d', key: 'completed' },
]

// HÌNH THỨC THỰC HIỆN/HỢP TÁC
exports.CRM_COOPERATIONTYPE = [
    { value: 1, text: 'Độc lập', class: 'tajic-status-btn-in-progress', backgroud: '00aaff', key: 'in_progress' },
    { value: 2, text: 'Liên danh', class: 'tajic-status-btn-completed', backgroud: '5fba7d', key: 'completed' },
]

// VAI TRÒ TRONG VIỆC CỘNG TÁC (ĐỨNG ĐẦU, PHỤ)
exports.CRM_COOPERATIONROLE = [
    { value: 1, text: 'Đứng đầu liên danh', class: 'tajic-status-btn-in-progress', backgroud: '00aaff', key: 'in_progress' },
    { value: 2, text: 'Thành viên', class: 'tajic-status-btn-completed', backgroud: '5fba7d', key: 'completed' },
]

// HÌNH THỨC ĐẤU THẦU
exports.CRM_BIDDINGTYPE = [
    { value: 1, text: 'Đấu thầu rộng rãi', key: 'in_progress' },
    { value: 2, text: 'Đấu thầu hạn chế', key: 'completed' },
    { value: 3, text: 'Chỉ định thầu', key: 'completed' },
    { value: 4, text: 'Chào hàng cạnh tranh', key: 'completed' },
    { value: 5, text: 'Mua sắm trực tiếp', key: 'completed' },
    { value: 6, text: 'Tự thực hiện', key: 'completed' },
    { value: 7, text: 'Lựa chọn nhà thầu, nhà đầu tư trong trường hợp đặc biệt', key: 'completed' },
    { value: 8, text: 'Tham gia thực hiện của cộng đồng', key: 'completed' },
]

// HỒ SƠ MỜI QUAN TÂM/SƠ TUYỂN

// HỒ SƠ MỜI THẦU (XÂY LẮP VÀ TƯ VẤN)
exports.BIIDING_DOCUMENT = [
    { value: 1, text: 'Bảng dữ liệu gói thầu', key: 'no',
        conditions: [
            { value: 11, text: 'Số hiệu thư mời thầu', field: 'invitationLetter',  key: 'no', type: 'text' },
            { value: 12, text: 'Tên bên mời thầu', field: 'procuringEntity',  key: 'no', type: 'text' },
            { value: 13, text: 'Tên chủ đầu tư', field: 'client',  key: 'no', type: 'text' },
            { value: 14, text: 'Tên dự án', field: 'project',  key: 'no', type: 'text' },
            { value: 15, text: 'Tên gói thầu', field: 'package',  key: 'no', type: 'text' },
            { value: 16, text: 'Địa điểm dự án', field: 'projectAddress',  key: 'no', type: 'text' },
            { value: 17, text: 'Thông tin dự án', field: 'projectInfo',  key: 'no', type: 'text' },
            { value: 18, text: 'Phạm vi công việc gói thầu', field: 'scopeOfPackage',  key: 'no', type: 'text' },
            { value: 19, text: 'Thời gian thực hiện hợp đồng (ngày)', field: 'duration',  key: 'no', type: 'number' },
            { value: 110, text: 'Loại hợp đồng', field: 'contractType',  key: 'no', type: 'text' },
            { value: 111, text: 'Hồ sơ đính kèm (video, bản vẽ, spec,...)', field: 'documentIntroduction',  key: 'no', attach: 'yes', type: 'text' },
            { value: 112, text: 'Ngôn ngữ hồ sơ dự thầu', field: 'language',  key: 'no', type: 'text' },
            { value: 113, text: 'Đồng tiền dự thầu', field: 'currency',  key: 'no', type: 'text' },
            { value: 114, text: 'Cách thức tổ chức và chuẩn bị hồ sơ dự thầu', field: 'method',  key: 'no', type: 'text' },
            { value: 115, text: 'Hiệu lực của hồ sơ dự thầu tới ngày', field: 'validity',  key: 'no', type: 'date' },
            { value: 116, text: 'Giá trị đảm bảo dự thầu (hình thức đảm bảo bằng thư bảo lãnh của ngân hàng)', field: 'security',  key: 'no', type: 'number' },
            { value: 117, text: 'Hiệu lực của đảm bảo dự thầu tới ngày', field: 'securityValidity',  key: 'no', type: 'date' },
            { value: 118, text: 'Về việc làm rõ hồ sơ mời thầu', field: 'bidsClarification',  key: 'no', type: 'text' },
            { value: 119, text: 'Về việc làm rõ hồ sơ dự thầu trong quá trình chấm thầu', field: 'documentsClarification',  key: 'no', type: 'text' },
            { value: 120, text: 'Về việc đề xuất phương án thay thế', field: 'alternative',  key: 'no', type: 'text' },
            { value: 121, text: 'Về việc sử dụng thầu phụ', field: 'subcontractor',  key: 'no', type: 'text' },
            { value: 122, text: 'Thời hạn nộp hồ sơ dự thầu', field: 'deadline',  key: 'no', type: 'date' },
            { value: 123, text: 'Nguyên tắc lựa chọn nhà thầu của chủ đầu tư', field: 'evaluation',  key: 'no', type: 'text' },
            { value: 124, text: 'Về việc thương thảo hợp đồng', field: 'negotiation',  key: 'no', type: 'text' },
            { value: 125, text: 'Về cách thức tham dự thầu', field: 'biddingSolution',  key: 'no', type: 'text' },
            { value: 126, text: 'Về chi phí tham dự thầu trả cho nền tảng Trixgo', field: 'biddingExpense',  key: 'no', type: 'number' },
            { value: 127, text: 'Về thông tin/yêu cầu khác', field: 'biddingOther',  key: 'no', type: 'text'},
        ]
    },
    { value: 2, text: 'Yêu cầu về tư cách hợp lệ', key: 'no',
        conditions: [
            { value: 21, text: 'Ngành nghề kinh doanh hợp pháp và phù hợp với gói thầu theo quy định hiện hành', field: 'capacityBusiness', field2: 'capacityBusinessNotice', key: 'no', type: 'text' },
            { value: 22, text: 'Chứng chỉ năng lực hoạt động xây dựng phù hợp theo quy định hiện hành', field: 'capacityCertificate', field2: 'capacityCertificateNotice',  key: 'no', type: 'text' },
            { value: 23, text: 'Hạch toán tài chính độc lập', field: 'capacityIndependentAccounting', field2: 'capacityIndependentAccountingNotice',  key: 'no', type: 'text' },
            { value: 24, text: 'Đã đăng ký trên Hệ thống mạng đấu thầu quốc gia', field: 'capacityTNBNS', field2: 'capacityTNBNSNotice',  key: 'no', type: 'text' },
            { value: 25, text: 'Tham dự thầu với tư cách là nhà thầu độc lập', field: 'capacityIndependentContractor', field2: 'capacityIndependentContractorNotice',  key: 'no', type: 'text' },
            { value: 26, text: 'Tư cách hợp lệ khác', field: 'capacityOther', field2: 'capacityOtherNotice',  key: 'no', type: 'text' },
            // { value: 27, text: 'Không đang trong quá trình giải thể; không bị kết luận đang lâm vào tình trạng phá sản hoặc nợ không có khả năng chi trả theo quy định của pháp luật', field: '',  key: 'no', type: 'text' },
            // { value: 28, text: 'Bảo đảm cạnh tranh trong đấu thầu', field: '',  key: 'no', type: 'text' },
            // { value: 29, text: 'Không đang trong thời gian bị cấm tham gia hoạt động đấu thầu theo quy định của pháp luật về đấu thầu', field: '',  key: 'no', type: 'text' },
        ]
    },
    { value: 3, text: 'Yêu cầu về năng lực tài chính', key: 'no',
        conditions: [
            { value: 311, text: 'Từ thời điểm', field: 'financialFrom',  key: 'no', type: 'date'},
            { value: 312, text: 'Đến thời điểm', field: 'financialTo',  key: 'no', type: 'date'},
            { value: 313, text: 'Giá trị lợi nhuận trong khoảng (từ->đến) phải lớn hơn', field: 'financialProfit',  key: 'no', type: 'number'},
            { value: 314, text: 'Giá trị tài sản ròng trong năm gần nhất phải lớn hơn', field: 'financialNetWorth',  key: 'no', type: 'number'},
            { value: 315, text: 'Doanh thu bình quân hàng năm trong khoảng (từ->đến) từ hoạt động xây dựng phải lớn hơn', field: 'financialConstructionRevenue',  key: 'no', type: 'number'},
            { value: 316, text: 'Xác nhận của cơ quan Thuế về việc Nhà thầu hoàn tất nghĩa vụ thuế/không còn nợ thuế', field: 'financialProof',  key: 'no', type: 'text' },
        ]
    },
    { value: 4, text: 'Yêu cầu về năng lực kinh nghiệm/Hợp đồng tương tự', key: 'no',
        conditions: [
            { value: 41, text: 'Tính chất tương tự', field: 'contractProperty',  key: 'no', type: 'text' },
            { value: 42, text: 'Số năm gần đây (tính từ năm hiện tại trở về trước)', field: 'contractRecently',  key: 'no', type: 'number' },
            { value: 43, text: 'Số lượng hợp đồng tối thiểu', field: 'contractNumber',  key: 'no', type: 'number'},
            { value: 44, text: 'Giá trị tối thiểu của từng hợp đồng', field: 'contractMinValue',  key: 'no', type: 'number'},
            { value: 45, text: 'Tổng giá trị tối thiểu của tất cả các hợp đồng', field: 'contractMinTotalValue',  key: 'no', type: 'number'},
            { value: 46, text: 'Yêu cầu khác', field: 'contractOther',  key: 'no', type: 'text' },
        ]
    },
    { value: 5, text: 'Yêu cầu về năng lực nhân sự', key: 'no',
        conditions: [
            { value: 51, text: 'Vị trí công việc', field: 'humanPosition',  key: 'no', type: 'text'},
            { value: 52, text: 'Số lượng yêu cầu', field: 'humanNumber',  key: 'no', type: 'number'},
            { value: 53, text: 'Tổng số năm kinh nghiệm', field: 'humanYoExp',  key: 'no', type: 'number'},
            { value: 54, text: 'Số năm kinh nghiệm trong các công việc tương tự', field: 'humanYoExpInTheSame',  key: 'no', type: 'number'},
            { value: 55, text: 'Yêu cầu về số công trình tương tự đã thực hiện', field: 'humanProjectInTheSame',  key: 'no', type: 'number'},
            { value: 56, text: 'Yêu cầu về trình độ chuyên môn', field: 'humanMajor',  key: 'no', type: 'text'},
            { value: 57, text: 'Yêu cầu về văn bằng chứng chỉ', field: 'humanCertificate',  key: 'no', type: 'text'},
            { value: 58, text: 'Yêu cầu về hợp đồng lao động và bảo hiểm', field: 'humanContract',  key: 'no', type: 'text'},
            { value: 59, text: 'Yêu cầu về tính chất tương tự của các công trình đã thực hiện', field: 'humanExpHistory',  key: 'no', type: 'text'},
        ]
    },
    { value: 6, text: 'Yêu cầu về năng lực thiết bị', key: 'no',
        conditions: [
            { value: 61, text: 'Loại và đặc điểm thiết bị', field: 'machineType',  key: 'no', type: 'text'},
            { value: 62, text: 'Số lượng yêu cầu', field: 'machineNumber',  key: 'no', type: 'number'},
            { value: 63, text: 'Hồ sơ thiết bị đi kèm', field: 'machineDocument',  key: 'no', type: 'text'},
        ]
    },
    { value: 7, text: 'Yêu cầu về giải pháp tổ chức thực hiện', key: 'no',
        conditions: [
            { value: 71, text: 'Nội dung', field: 'methodContent',  key: 'no', type: 'text'},
            { value: 72, text: 'Mức độ đáp ứng', field: 'methodDescription',  key: 'no', type: 'text'},
            { value: 73, text: 'Điểm tối đa đạt được', field: 'methodMaxScore',  key: 'no', type: 'number'},
            { value: 74, text: 'Điểm tối thiểu đạt được', field: 'methodMinScore',  key: 'no', type: 'number'},
        ]
    },
    { value: 8, text: 'Điều khoản hợp đồng', key: 'no',
        conditions: [
            { value: 81, text: 'Điều khoản', field: 'conditionName',  key: 'no', type: 'text'},
            { value: 82, text: 'Nội dung', field: 'conditionDescription',  key: 'no', type: 'text'},
        ]
    },
    { value: 9, text: 'Thông tin nhà thầu, Đơn dự thầu, bảo lãnh dự thầu và thông tin khác', key: 'no',
        conditions: [
            { value: 91, text: 'Thông tin nhà thầu', field: 'key',  key: 'no', type: 'text'},
            { value: 92, text: 'Đơn dự thầu', field: 'key',  key: 'no', type: 'text'},
            { value: 93, text: 'Bảo lãnh dự thầu', field: 'key',  key: 'no', type: 'text'},
            // { value: 94, text: 'Giấy ủy quyền (nếu có)', field: 'key',  key: 'no', type: 'text'},
            // { value: 95, text: 'Thỏa thuận liên danh (nếu có)', field: 'key',  key: 'no', type: 'text'},
        ]
    }
]

exports.BIIDING_APPLY = [
    { value: 1, text: 'Bảng dữ liệu gói thầu', key: 'no',
        conditions: [
            
        ]
    },
    { value: 2, text: 'Yêu cầu về tư cách hợp lệ', key: 'no',
        conditions: [
          
        ]
    },
    { value: 3, text: '	Yêu cầu về năng lực tài chính', key: 'no',
    conditions: [
        { value: 31, text: 'Năm tài chính', field: 'fiscalYear',  key: 'no', type: 'number' },
        { value: 32, text: 'Tổng tài sản', field: 'asset',  key: 'no', type: 'number' },
        { value: 33, text: 'Tổng nợ', field: 'liabilitiy',  key: 'no', type: 'number' },
        { value: 34, text: 'Giá trị tài sản ròng', field: 'netWorth',  key: 'no', type: 'number' },
        { value: 35, text: 'Tài sản ngắn hạn', field: 'currentAsset',  key: 'no', type: 'number' },
        { value: 36, text: 'Nợ ngắn hạn', field: 'shortTermLiabilitiy',  key: 'no', type: 'number' },
        { value: 37, text: 'Vốn lưu động', field: 'workingCapital',  key: 'no', type: 'number' },
        { value: 38, text: 'Tổng doanh thu', field: 'grossRevenue',  key: 'no', type: 'number' },
        { value: 39, text: 'Tổng doanh thu trong lĩnh vực xây dựng', field: 'grossConstructionRevenue',  key: 'no', type: 'number' },
        { value: 310, text: 'Lợi nhuận trước thuế', field: 'grossProfit',  key: 'no', type: 'number' },
        { value: 311, text: 'Lợi nhuận sau thuế', field: 'grossProfitAfterTax',  key: 'no', type: 'number' },
        // { value: 38, text: 'Tài liệu đính kèm', field: 'fiscalAttachs',  key: 'no', type: 'text' },
    ]
    },
    { value: 4, text: 'Yêu cầu về năng lực kinh nghiệm/Hợp đồng tương tự', key: 'no',
        conditions: [
            { value: 41, text: 'Tên hợp đồng', field: 'contractName',  key: 'no', type: 'text' },
            { value: 42, text: 'Mã hiệu', field: 'contractSign',  key: 'no', type: 'text' },
            { value: 43, text: 'Ngày ký', field: 'contractDate',  key: 'no', type: 'date' },
            { value: 44, text: 'Bắt đầu thực hiện', field: 'contractStartTime',  key: 'no', type: 'date' },
            { value: 45, text: 'Kết thúc thực hiện', field: 'contractEndTime',  key: 'no', type: 'date' },
            { value: 46, text: 'Tổng giá trị thực hiện', field: 'contractValue',  key: 'no', type: 'number' },
            { value: 47, text: 'Mô tả khác', field: 'contractProperty',  key: 'no', type: 'area' },
            // { value: 48, text: 'Tài liệu xác nhận', field: 'contractAttachs',  key: 'no', type: 'text' },
        ]
    },
    { value: 5, text: 'Yêu cầu về năng lực nhân sự', key: 'no',
        conditions: [
            { value: 51, text: 'Họ và tên', field: 'humanName',  key: 'no', type: 'text' },
            { value: 52, text: 'Vị trí công việc đảm nhận', field: 'humanPosition',  key: 'no', type: 'text' },
            { value: 53, text: 'Ngày sinh', field: 'humanBirthday',  key: 'no', type: 'date' },
            { value: 54, text: 'Mã số định danh', field: 'humanIdentity',  key: 'no', type: 'text' },
            { value: 55, text: 'Tổng số năm kinh nghiệm', field: 'humanYoExp',  key: 'no', type: 'number' },
            { value: 56, text: 'Số năm kinh nghiệm trong lĩnh vực tương tự', field: 'humanYoExpInTheSame',  key: 'no', type: 'number' },
            { value: 57, text: 'Trình độ chuyên môn', field: 'humanMajor',  key: 'no', type: 'text' },
            { value: 58, text: 'Văn bằng chứng chỉ', field: 'humanCertificate',  key: 'no', type: 'text' },
            { value: 59, text: 'Hợp đồng lao động và bảo hiểm', field: 'humanContract',  key: 'no', type: 'text' },
            { value: 510, text: 'Số công trình đã thực hiện tương tự', field: 'humanProjectInTheSame',  key: 'no', type: 'number' },
            { value: 511, text: 'Lịch sử làm việc', field: 'humanExpHistory',  key: 'no', type: 'area' },
            // { value: 512, text: 'Tài liệu xác nhận', field: 'humanAttachs',  key: 'no', type: 'text' },
        ]
    },
    { value: 6, text: 'Yêu cầu về năng lực thiết bị', key: 'no',
        conditions: [
            { value: 61, text: 'Loại và đặc điểm thiết bị', field: 'machineType',  key: 'no', type: 'area' },
            { value: 62, text: 'Nhà sản xuất', field: 'machineProducer',  key: 'no', type: 'text' },
            { value: 63, text: 'Đời máy', field: 'machineModel',  key: 'no', type: 'number' },
            { value: 64, text: 'Công suất', field: 'machinePower',  key: 'no', type: 'text' },
            { value: 65, text: 'Năm sản xuất', field: 'machineYearOfManufacture',  key: 'no', type: 'number' },
            { value: 66, text: 'Tính năng', field: 'machineFeature',  key: 'no', type: 'text' },
            { value: 67, text: 'Xuất xứ', field: 'machineOrigin',  key: 'no', type: 'text' },
            { value: 68, text: 'Địa điểm hiện tại của thiết bị', field: 'machineCurrentLocation',  key: 'no', type: 'text' },
            { value: 69, text: 'Thông tin về tình hình huy động', field: 'machineMobilization',  key: 'no', type: 'text' },
            { value: 610, text: 'Nguồn thiết bị', field: 'machineOrgType',  key: 'no', type: 'text' },
            // { value: 611, text: 'Tài liệu xác nhận', field: 'humanAttachs',  key: 'no', type: 'text' },
        ]
    },
    { value: 7, text: 'Yêu cầu về giải pháp tổ chức thực hiện', key: 'no',
        conditions: [
            { value: 71, text: 'Nội dung', field: 'methodContent',  key: 'no', type: 'text' },
            // { value: 72, text: 'Tài liệu xác nhận', field: 'methodAttachs',  key: 'no', type: 'text' },
        ]
    },
    { value: 8, text: 'Điều khoản hợp đồng', key: 'no',
        conditions: [
            
        ]
    },
    { value: 9, text: 'Thông tin nhà thầu, đơn dự thầu, bảo lãnh dự thầu và thông tin khác', key: 'no',
        conditions: [
            { value: 911, text: 'Tên nhà thầu', field: 'contractorName',  key: 'no', type: 'text'},
            { value: 912, text: 'Nơi nhà thầu đăng ký kinh doanh, hoạt động', field: 'contractorPalace',  key: 'no', type: 'text'},
            { value: 913, text: 'Năm thành lập công ty', field: 'contractorDate',  key: 'no', type: 'Date'},
            { value: 914, text: 'Địa chỉ hợp pháp của nhà thầu', field: 'contractorAddress',  key: 'no', type: 'text'},
            { value: 915, text: 'Tên đại diện hợp pháp của nhà thầu', field: 'contractorLegalRep',  key: 'no', type: 'text'},
            { value: 916, text: 'Địa chỉ đại diện hợp pháp của nhà thầu', field: 'contractorRepAddress',  key: 'no', type: 'text'},
            { value: 917, text: 'Số điện thoại/fax đại diện hợp pháp của nhà thầu', field: 'contractorRepPhone',  key: 'no', type: 'text'},
            { value: 918, text: 'Địa chỉ email đại diện hợp pháp của nhà thầu', field: 'contractorRepEmail',  key: 'no', type: 'text'},
            { value: 91, text: 'Ngày ký đơn', field: 'invitationLetterDate',  key: 'no', type: 'date'},
            { value: 92, text: 'Thời gian dự kiến thực hiện hợp đồng (ngày)', field: 'invitationLetterExc',  key: 'no', type: 'number'},
            { value: 93, text: 'Số ngày có hiệu lực của hồ sơ dự thầu', field: 'invitationLetterDuration',  key: 'no', type: 'number'},
            { value: 94, text: 'Ngày bắt đầu có hiệu lực của hồ sơ dự thầu', field: 'invitationLetterStart',  key: 'no', type: 'date'},
            // { value: 931, text: 'Bên thụ hưởng', field: 'tgClient',  key: 'no', type: 'text'},
            { value: 932, text: 'Ngày phát hành bảo lãnh dự thầu', field: 'tgDate',  key: 'no', type: 'date'},
            { value: 933, text: 'Số bảo lãnh dự thầu', field: 'tgSign',  key: 'no', type: 'text'},
            { value: 934, text: 'Bên bảo lãnh dự thầu', field: 'tgBank',  key: 'no', type: 'text'},
            // { value: 935, text: 'Tên nhà thầu', field: 'tgContractor',  key: 'no', type: 'text'},
            // { value: 936, text: 'Tên gói thầu', field: 'tgPackageName',  key: 'no', type: 'text'},
            // { value: 937, text: 'Tên dự án', field: 'tgProject',  key: 'no', type: 'text'},
            // { value: 938, text: 'Số thư mời thầu', field: 'tgInvitationLetter',  key: 'no', type: 'text'},
            { value: 939, text: 'Số tiền bảo lãnh', field: 'tgAmount',  key: 'no', type: 'number'},
            { value: 9310, text: 'Số ngày có hiệu lực của bảo lãnh dự thầu', field: 'tgDuration',  key: 'no', type: 'number'},
            { value: 9311, text: 'Ngày bắt đầu có hiệu lực của bảo lãnh dự thầu', field: 'tgEffectiveDate',  key: 'no', type: 'date'},
            // { value: 941, text: 'Ngày tháng năm', field: 'key',  key: 'methodContent', type: 'date'},
            // { value: 942, text: 'Tên người uỷ quyền', field: 'key',  key: 'no', type: 'text'},
            // { value: 943, text: 'Số CMND người uỷ quyền', field: 'key',  key: 'no', type: 'text'},
            // { value: 944, text: 'Chức danh người uỷ quyền', field: 'key',  key: 'no', type: 'text'},
            // { value: 945, text: 'Tên người được uỷ quyền', field: 'key',  key: 'no', type: 'text'},
            // { value: 946, text: 'Số CMND người được uỷ quyền', field: 'key',  key: 'no', type: 'text'},
            // { value: 947, text: 'Chức danh người được uỷ quyền', field: 'key',  key: 'no', type: 'text'},
            // { value: 948, text: 'Nội dung ủy quyền', field: 'key',  key: 'no', type: 'text'},
            // { value: 949, text: 'Ngày bắt đầu có hiệu lực', field: 'key',  key: 'no', type: 'date'},
            // { value: 9410, text: 'Ngày kết thúc hiệu lực', field: 'key',  key: 'no', type: 'date'},
            // { value: 9411, text: 'Tổng số bản', field: 'key',  key: 'no', type: 'number'},
            // { value: 9412, text: 'Số bản người uỷ quyền giữ', field: 'key',  key: 'no', type: 'number'},
            // { value: 9413, text: 'Số bản ngượi được uỷ quyền giữ', field: 'key',  key: 'no', type: 'number'},
            // { value: 9414, text: 'Số bản bên mời thầu giữ', field: 'key',  key: 'no', type: 'number'},
            // { value: 951, text: '___', field: 'key',  key: 'no', type: 'number'},
            // { value: 952, text: '___', field: 'key',  key: 'no', type: 'number'},
            // { value: 953, text: '___', field: 'key',  key: 'no', type: 'number'},
            // { value: 954, text: '___', field: 'key',  key: 'no', type: 'number'},
        ],
    }
]

exports.BIIDING_EVALUATION = [
    { value: 1, text: 'Bảng dữ liệu gói thầu', key: 'no',
        conditions: [
            
        ]
    },
    { value: 2, text: 'Yêu cầu về tư cách hợp lệ', key: 'no',
        conditions: [
            { value: 21, text: 'Ngành nghề kinh doanh', field: 'capacityBusiness',  key: 'no', type: 'option' },
            { value: 22, text: 'Chứng chỉ năng lực hoạt động xây dựng', field: 'capacityCertificate',  key: 'no', type: 'option' },
            { value: 23, text: 'Hạch toán tài chính độc lập', field: 'capacityIndependentAccounting',  key: 'no', type: 'option' },
            { value: 24, text: 'Đã đăng ký trên Hệ thống mạng đấu thầu quốc gia', field: 'capacityTNBNS',  key: 'no', type: 'option' },
            { value: 25, text: 'Tham dự thầu với tư cách là nhà thầu độc lập', field: 'capacityIndependentContractor',  key: 'no', type: 'option' },
            { value: 26, text: 'Tư cách hợp lệ khác', field: 'capacityOther',  key: 'no', type: 'option' },
            { value: 27, text: 'Ngành nghề kinh doanh', field: 'capacityBusinessNotice',  key: 'no', type: 'area' },
            { value: 28, text: 'Chứng chỉ năng lực hoạt động xây dựng', field: 'capacityCertificateNotice',  key: 'no', type: 'area' },
            { value: 29, text: 'Hạch toán tài chính độc lập', field: 'capacityIndependentAccountingNotice',  key: 'no', type: 'area' },
            { value: 210, text: 'Đã đăng ký trên Hệ thống mạng đấu thầu quốc gia', field: 'capacityTNBNSNotice',  key: 'no', type: 'area' },
            { value: 211, text: 'Tham dự thầu với tư cách là nhà thầu độc lập', field: 'capacityIndependentContractorNotice',  key: 'no', type: 'area' },
            { value: 212, text: 'Tư cách hợp lệ khác', field: 'capacityOtherNotice',  key: 'no', type: 'area' },
        ]
    },
    { value: 3, text: '	Yêu cầu về năng lực tài chính', key: 'no',
    conditions: [
        { value: 31, text: 'Từ', field: 'financialFrom',  key: 'no', type: 'option' },
        { value: 32, text: 'Đến', field: 'financialTo',  key: 'no', type: 'option' },
        { value: 33, text: 'Giá trị lợi nhuận trong khoảng (từ->đến) phải lớn hơn', field: 'financialProfit',  key: 'no', type: 'option' },
        { value: 34, text: 'Giá trị tài sản ròng trong năm gần nhất', field: 'financialNetWorth',  key: 'no', type: 'option' },
        { value: 35, text: 'Doanh thu bình quân hàng năm từ hoạt động xây dựng', field: 'financialConstructionRevenue',  key: 'no', type: 'option' },
        { value: 36, text: 'Xác nhận của cơ quan Thuế về việc Nhà thầu hoàn tất nghĩa vụ thuế/không còn nợ thuế', field: 'financialProof',  key: 'no', type: 'option' },
        { value: 37, text: 'Từ', field: 'financialFromNotice',  key: 'no', type: 'area' },
        { value: 38, text: 'Đến', field: 'financialToNotice',  key: 'no', type: 'area' },
        { value: 39, text: 'Giá trị lợi nhuận trong khoảng (từ->đến) phải lớn hơn', field: 'financialProfitNotice',  key: 'no', type: 'area' },
        { value: 310, text: 'Giá trị tài sản ròng trong năm gần nhất', field: 'financialNetWorthNotice',  key: 'no', type: 'area' },
        { value: 311, text: 'Doanh thu bình quân hàng năm từ hoạt động xây dựng', field: 'financialConstructionRevenueNotice',  key: 'no', type: 'area' },
        { value: 312, text: 'Xác nhận của cơ quan Thuế về việc Nhà thầu hoàn tất nghĩa vụ thuế/không còn nợ thuế', field: 'financialProofNotice',  key: 'no', type: 'area' },
    ]
    },
    { value: 4, text: 'Yêu cầu về năng lực kinh nghiệm/Hợp đồng tương tự', key: 'no',
        conditions: [
            { value: 41, text: 'Tính chất tương tự', field: 'contractProperty',  key: 'no', type: 'option' },
            { value: 42, text: 'Số năm gần đây', field: 'contractRecently',  key: 'no', type: 'option' },
            { value: 43, text: 'Số lượng hợp đồng tối thiểu', field: 'contractNumber',  key: 'no', type: 'option' },
            { value: 44, text: 'Giá trị của từng hợp đồng phải đảm bảo lớn hơn', field: 'contractMinValue',  key: 'no', type: 'option' },
            { value: 45, text: 'Tổng giá trị của tất cả các hợp đồng phải lớn hơn', field: 'contractMinTotalValue',  key: 'no', type: 'option' },
            { value: 46, text: 'Yêu cầu khác', field: 'contractOther',  key: 'no', type: 'option' },
            { value: 47, text: 'Tính chất tương tự', field: 'contractPropertyNotice',  key: 'no', type: 'area' },
            { value: 48, text: 'Số năm gần đây', field: 'contractRecentlyNotice',  key: 'no', type: 'area' },
            { value: 49, text: 'Số lượng hợp đồng tối thiểu', field: 'contractNumberNotice',  key: 'no', type: 'area' },
            { value: 410, text: 'Giá trị của từng hợp đồng phải đảm bảo lớn hơn', field: 'contractMinValueNotice',  key: 'no', type: 'area' },
            { value: 411, text: 'Tổng giá trị của tất cả các hợp đồng phải lớn hơn', field: 'contractMinTotalValueNotice',  key: 'no', type: 'area' },
            { value: 412, text: 'Yêu cầu khác', field: 'contractOtherNotice',  key: 'no', type: 'area' },
        ]
    },
    { value: 5, text: 'Yêu cầu về năng lực nhân sự', key: 'no',
        conditions: [
            { value: 51, text: 'Họ và tên', field: 'humanName',  key: 'no', type: 'text' },
            { value: 52, text: 'Vị trí công việc đảm nhận', field: 'humanPosition',  key: 'no', type: 'text' },
            { value: 53, text: 'Ngày sinh', field: 'humanBirthday',  key: 'no', type: 'date' },
            { value: 54, text: 'Mã số định danh', field: 'humanIdentity',  key: 'no', type: 'text' },
            { value: 55, text: 'Tổng số năm kinh nghiệm', field: 'humanYoExp',  key: 'no', type: 'number' },
            { value: 56, text: 'Số năm kinh nghiệm trong lĩnh vực tương tự', field: 'humanYoExpInTheSame',  key: 'no', type: 'number' },
            { value: 57, text: 'Trình độ chuyên môn', field: 'humanMajor',  key: 'no', type: 'text' },
            { value: 58, text: 'Văn bằng chứng chỉ', field: 'humanCertificate',  key: 'no', type: 'text' },
            { value: 59, text: 'Hợp đồng lao động và bảo hiểm', field: 'humanContract',  key: 'no', type: 'text' },
            { value: 510, text: 'Số công trình đã thực hiện tương tự', field: 'humanProjectInTheSame',  key: 'no', type: 'number' },
            { value: 511, text: 'Lịch sử làm việc', field: 'humanExpHistory',  key: 'no', type: 'text' },
            // { value: 512, text: 'Tài liệu xác nhận', field: 'humanAttachs',  key: 'no', type: 'text' },
        ]
    },
    { value: 6, text: 'Yêu cầu về năng lực thiết bị', key: 'no',
        conditions: [
            { value: 61, text: 'Loại và đặc điểm thiết bị', field: 'machineType',  key: 'no', type: 'text' },
            { value: 62, text: 'Nhà sản xuất', field: 'machineProducer',  key: 'no', type: 'text' },
            { value: 63, text: 'Đời máy', field: 'machineModel',  key: 'no', type: 'number' },
            { value: 64, text: 'Công suất', field: 'machinePower',  key: 'no', type: 'text' },
            { value: 65, text: 'Năm sản xuất', field: 'machineYearOfManufacture',  key: 'no', type: 'number' },
            { value: 66, text: 'Tính năng', field: 'machineFeature',  key: 'no', type: 'text' },
            { value: 67, text: 'Xuất xứ', field: 'machineOrigin',  key: 'no', type: 'text' },
            { value: 68, text: 'Địa điểm hiện tại của thiết bị', field: 'machineCurrentLocation',  key: 'no', type: 'text' },
            { value: 69, text: 'Thông tin về tình hình huy động', field: 'machineMobilization',  key: 'no', type: 'text' },
            { value: 610, text: 'Nguồn thiết bị', field: 'machineOrgType',  key: 'no', type: 'text' },
            // { value: 611, text: 'Tài liệu xác nhận', field: 'humanAttachs',  key: 'no', type: 'text' },
        ]
    },
    { value: 7, text: 'Yêu cầu về giải pháp tổ chức thực hiện', key: 'no',
        conditions: [
            { value: 71, text: 'Nội dung', field: 'methodContent',  key: 'no', type: 'text' },
            // { value: 72, text: 'Tài liệu xác nhận', field: 'methodAttachs',  key: 'no', type: 'text' },
        ]
    },
    { value: 8, text: 'Điều khoản hợp đồng', key: 'no',
        conditions: [
            
        ]
    },
    { value: 9, text: 'Thông tin nhà thầu, Đơn dự thầu, bảo lãnh dự thầu và thông tin khác', key: 'no',
        conditions: [
            { value: 91, text: 'Thông tin nhà thầu', field: 'key',  key: 'no', type: 'text'},
            { value: 92, text: 'Đơn dự thầu', field: 'key',  key: 'no', type: 'text'},
            { value: 93, text: 'Bảo lãnh dự thầu', field: 'key',  key: 'no', type: 'text'},
            { value: 94, text: 'Giấy ủy quyền (nếu có)', field: 'key',  key: 'no', type: 'text'},
            { value: 95, text: 'Thỏa thuận liên danh (nếu có)', field: 'key',  key: 'no', type: 'text'},
        ]
    }
]

// CÁC YÊU CẦU ĐỐI VỚI NHÀ THẦU
exports.BIIDING_TERM = [
    { value: 1, text: 'Bảng kê khai thông tin về nhà thầu', key: 'no' },
    { value: 2, text: 'Tình hình tài chính trước đây của nhà thầu', key: 'no' },
    { value: 3, text: 'Doanh thu bình quân hàng năm từ hoạt động xây dựng', key: 'no' },
    { value: 4, text: 'Năng lực tài chính', key: 'no' },
    { value: 5, text: 'Nguồn lực tài chính hàng tháng cho các hợp đồng đang thực hiện', key: 'no' },
    { value: 6, text: 'Hợp đồng tương tự', key: 'no' },
    { value: 7, text: 'Đề xuất nhân sự chủ chốt', key: 'no' },
    { value: 8, text: 'Bản lý lịch chuyên môn của nhân sự chủ chốt', key: 'no' },
    { value: 9, text: 'Bản kinh nghiệm chuyên môn', key: 'no' },
    { value: 10, text: 'Bảng kê khai thiết bị', key: 'no' },
    { value: 11, text: 'Phạm vi công việc sử dụng nhà thầu phụ', key: 'no' },
    { value: 12, text: 'Giải pháp/biện pháp tổ chức thực hiện', key: 'no' },
]

// HÌNH THỨC HỢP ĐỒNG
// https://luatvietan.vn/cac-loai-hop-dong-xay-dung.html#:~:text=H%E1%BB%A3p%20%C4%91%E1%BB%93ng%20th%E1%BA%A7u%20ch%C3%ADnh%3A%20H%E1%BB%A3p,m%E1%BB%99t%20c%C6%A1%20quan%2C%20t%E1%BB%95%20ch%E1%BB%A9c.
// LOẠI HỢP ĐỒNG
exports.CONTRACT_TYPES = [
    { value: 1, text: 'Hợp đồng trọn gói', key: 'in_progress' },
    { value: 2, text: 'Hợp đồng theo đơn giá cố định', key: 'completed' },
    { value: 3, text: 'Hợp đồng theo đơn giá điều chỉnh', key: 'completed' },
    { value: 4, text: 'Hợp đồng theo thời gian', key: 'completed' },
    { value: 5, text: 'Hợp đồng theo giá kết hợp', key: 'completed' },
]

// HỢP ĐỒNG MUA VÀO BÁN RA
exports.CONTRACT_OUTIN = [
    { value: 1, text: 'Hợp đồng bán ra' },
    { value: 2, text: 'Hợp đồng mua vào' },
]

// HỢP ĐỒNG THỰC/ẢO-GỬI DẤU
exports.CONTRACT_TA = [
    { value: 1, text: 'T' },
    { value: 2, text: 'A' },
]

// PHÂN LOẠI THEO DÕI KHÁC
exports.CONTRACT_SUB_TYPES = [
    { value: 1, text: 'Thông thường' },
    { value: 2, text: 'Đặc biệt' },
]

// PHÂN LOẠI CÔNG NỢ
exports.CONTRACT_DEBT_TYPES = [
    { value: 1, text: 'Nợ khó đòi' },
    { value: 2, text: 'Nợ chờ quyết toán/bảo hành' },
    { value: 3, text: 'Nợ dự kiến tiền về' },
    { value: 4, text: 'Nợ khác' },
]

// LOẠI HÀNG HÓA, NGUYÊN VẬT LIỆU
exports.GOODS_TYPES = [
    { value: 1, text: 'Nguyên liệu, vật liệu' },
    { value: 2, text: 'Thành phẩm' },
    { value: 3, text: 'Hàng hóa' },
    { value: 4, text: 'Hàng gửi đi bán' },
    { value: 5, text: 'Vật tư' },
    { value: 6, text: 'Nhân công' },
    { value: 7, text: 'Thiết bị'  },
    { value: 8, text: 'Giao khoán' },
    { value: 9, text: 'Khác' },
]

// LOẠI HÀNG HÓA, NGUYÊN VẬT LIỆU
exports.PRODUCT_TYPES = [
    { value: 1, text: 'Vật tư' },
    { value: 2, text: 'Nhân công' },
    { value: 3, text: 'Máy'  },
]

// LOẠI CÔNG VIỆC PHÁT SINH
exports.PLUS_TYPES = [
    { value: 0, text: 'Không phát sinh' },
    { value: 1, text: 'Phát sinh được chấp thuận' },
    { value: 2, text: 'Phát sinh không được chấp thuận' },
]

// CÁC PHÂN LOẠI KHÁC
exports.DOCTYPE_TYPES = [
    { value: 1, text: 'Văn bản-Lĩnh vực hồ sơ' },
    { value: 2, text: 'Văn bản-Tính chất hồ sơ' },
    { value: 3, text: 'Lĩnh vực kinh doanh' },
    { value: 4, text: 'Khách hàng-Phân loại' },
    { value: 5, text: 'Công việc-Phân loại khác' },
    { value: 6, text: 'Nhân sự-Trình độ' },
    { value: 7, text: 'Nhân sự-Chuyên ngành' },
    { value: 8, text: 'Nhân sự-Loại HDLD' },
    { value: 9, text: 'Nhân sự-Tình trạng làm việc' },
    { value: 10, text: 'Nhân sự-Thâm niên' },
    { value: 11, text: 'CRM-Phân loại giai đoạn' },
    { value: 12, text: 'CRM-Hồ sơ chi tiết của giai đoạn' },
    { value: 13, text: 'Nhân sự-Chức vụ' },
    { value: 14, text: 'Nhân sự-Loại chứng chỉ' },
    { value: 15, text: 'Nhân sự-Nội dung chứng chỉ' },
    { value: 16, text: 'Hợp đồng-Phân loại công nợ' },
    { value: 17, text: 'Hợp đồng-Nguyên nhân phát sinh' },
    { value: 18, text: 'Chung-Nguyên nhân thất bại' },
    { value: 19, text: 'Chung-Các lỗi hay gặp' },
    { value: 20, text: 'Công việc-Đánh giá chất lượng' },
]

// HƯỚNG HỒ SƠ VĂN BẢN
exports.DIRECTION_TYPES = [
    { value: 1, text: 'Đến', key: 'in' },
    { value: 2, text: 'Đi', key: 'out' },
    { value: 3, text: 'Nội bộ', key: 'internal' }
]

// PHÂN LOẠI HỒ SƠ VĂN BẢN
exports.DOCUMENT_TYPES = [
    { value: 1, text: 'Chung', key: 'key' },
    { value: 2, text: 'Hợp đồng', key: 'key' },
    { value: 3, text: 'Bản vẽ', key: 'key' },
]

// TRẠNG THÁI DOCRE
exports.PCM_STATUS_DOCRE = [
    { value: 0, text: 'Khởi tạo' },
    { value: 1, text: 'Hoàn thành' },
]

// TRẠNG THÁI TRIỂN KHAI CÔNG VIỆC
exports.PCM_STATUS_TASK = [
    { value: 1, text: 'Khởi tạo/sắp triển khai', class: 'tajic-status-btn-open', backgroud: 'ff0000', key: 'open' },
    { value: 2, text: 'Đang triển khai', class: 'tajic-status-btn-in-progress', backgroud: '00aaff', key: 'in_progress' },
    { value: 3, text: 'Hoàn thành', class: 'tajic-status-btn-completed', backgroud: '5fba7d', key: 'completed' },
    { value: 4, text: 'Treo lại', class: 'tajic-status-btn-deferred', backgroud: '8f1aac', key: 'deferred' },
    { value: 5, text: 'Chờ người khác giải quyết', class: 'tajic-status-btn-waiting', backgroud: '4d4dff', key: 'waiting_on_someone_else' },
    { value: 6, text: 'Tiếp tục theo dõi', class: 'tajic-status-btn-follow-up', backgroud: '5bc0de', key: 'follow_up' },
]

// TRẠNG THÁI CHECKLIST
exports.PCM_STATUS_CHECKLIST = [
    { value: 0, text: 'Khởi tạo', class: 'tajic-status-btn-open', backgroud: 'ff0000', key: 'open' },
    { value: 1, text: 'Hoàn thành', class: 'tajic-status-btn-completed', backgroud: '5fba7d', key: 'completed' },
    { value: 2, text: 'Đang triển khai', class: 'tajic-status-btn-in-progress', backgroud: '00aaff', key: 'in_progress' },
    { value: 3, text: 'Treo lại', class: 'tajic-status-btn-deferred', backgroud: '8f1aac', key: 'deferred' },
]

// MỨC ĐỘ QUAN TRỌNG
exports.PCM_PRIORITY_TASK = [
    { value: 1, text: 'Thấp', class: 'bg-grey', backgroud: '808080', key: 'low' },
    { value: 2, text: 'Trung bình', class: 'bg-blue', backgroud: '5bc0de', key: 'normal' },
    { value: 3, text: 'Cao', class: 'bg-red', backgroud: 'ff0000', key: 'high' },
    { value: 4, text: 'Siêu quan trọng', class: 'bg-red', backgroud: 'ff0000', key: 'supperhigh' }
]

// MỨC ĐỘ CẤP BÁCH
exports.ARR_URGENT = [
    { value: 1, text: 'Không cấp bách'},
    { value: 2, text: 'Trung bình' },
    { value: 3, text: 'Cấp bách' },
]

// MỨC ĐỘ PHỨC TẠP
exports.ARR_DIFFICULT = [
    { value: 1, text: 'Không phức tạp' },
    { value: 2, text: 'Phức tạp trung bình'},
    { value: 3, text: 'Phức tạp cao'},
]

// PHÂN LOẠI TIẾN ĐỘ
exports.PCM_SCHEDULE_TYPES = [
    { value: 1, text: 'Tiến độ thông thường', key: 'normal' },
    { value: 2, text: 'Tiến độ theo mốc', key: 'normal' },
    { value: 3, text: 'Tiến độ gói/nhóm', key: 'normal' },
]

// PHÂN LOẠI THỜI HẠN
exports.PCM_DEADLINE_TYPES = [
    { value: 1, text: 'Chậm', key: 'normal' },
    { value: 2, text: 'Đúng hạn', key: 'normal' },
    { value: 3, text: 'Sớm', key: 'normal' },
]

// PHÂN LOẠI CÔNG VIỆC/TRÌNH DUYỆT
exports.PCM_PROPOSAL_TASK = [
    { value: 0, text: 'Việc thông thường', sign: 'Tasks', key: 'task' },
    { value: 1, text: 'Yêu cầu thông tin', sign: 'RFis', key: 'rfi' },
    { value: 2, text: 'Yêu cầu phê duyệt', sign: 'RFa', key: 'rfa' },
    { value: 3, text: 'Thanh toán', sign: 'CRFa', key: 'crfa' },
    { value: 4, text: 'Lựa chọn nhà thầu', sign: 'BRFa', key: 'brfa' },
    { value: 5, text: 'Nghiệm thu chất lượng', sign: 'QRFa', key: 'inspection' },
    { value: 6, text: 'Yêu cầu sửa chữa', sign: 'Punch', key: 'punch' },
    { value: 7, text: 'Yêu cầu thay đổi', sign: 'RFc', key: 'rfc' },
    { value: 8, text: 'Yêu cầu thực hiện', sign: 'RFe', key: 'rfe' },
    { value: 9, text: 'Báo cáo', sign: 'Report', key: 'report' },
    { value: 10, text: 'Tiến độ', sign: 'Schedule', key: 'schedule' },
    { value: 11, text: 'Họp', sign: 'MOM', key: 'mom' },
]

// LOẠI TÀI LIỆU TẠO DỰNG
exports.DOCRE_TYPES = [
    { value: 1, text: 'Yêu cầu phê duyệt (RFA)', sign: 'rfa' },
    { value: 2, text: 'Yêu cầu thông tin (RFI)', sign: 'rfi' },
    { value: 3, text: 'Yêu cầu thay đổi (RFC)', sign: 'rfc' },
    { value: 4, text: 'Yêu cầu thực hiện (RFE)', sign: 'rfe' },
    { value: 5, text: 'Biên bản họp (MOM)', sign: 'mom' },
    { value: 6, text: 'Tài liệu soạn thảo (DOC)', sign: 'doc' },
    { value: 7, text: 'Bảng tính (SHEET)', sign: 'sheet' },
    { value: 8, text: 'Sự kiện (EVENT)', sign: 'event' },
    { value: 9, text: 'Sổ quỹ (CASHBOOK)', sign: 'cashbook' },
    { value: 10, text: 'Hồ sơ chất lượng (QAQC)', sign: 'qaqc' },
    { value: 11, text: 'Lịch tuần (WEEKLY PANNER)', sign: 'weekly' },
    // { value: 10, text: 'Bình chọn (POLL)', sign: 'poll' },
    // { value: 11, text: 'Trình chiếu (SLIDE)', sign: 'slide' },
    // { value: 12, text: 'Công việc (TASK)', sign: 'task' },
]

// LOẠI BẢNG TÍNH
exports.DOCRE_SHEET_TYPES = [
    { value: 1, text: 'Thông thường' },
    { value: 2, text: 'Theo dõi vật tư bê tông' },
    { value: 3, text: 'Theo dõi vật tư khác' },
]

// CÁC CỘT MẶC ĐỊNH CỦA BẢNG TÍNH
exports.DOCRE_COLUMNS_BANG_TINH = [
    // Status = 1 cho hiển thị
    // Status = 0 ẩn đi
    // Width: Chiều rộng cột (%)
    {
        key: 'no',
        value: 'TT',
        status: 1,
        width: 5,
    },
    {
        key: 'createAt',
        value: 'Ngày tạo',
        status: 1,
        width: 5,
    },
    {
        key: 'author',
        value: 'Người tạo',
        status: 1,
        width: 5,
    },
    {
        key: 'modifyAt',
        value: 'Ngày chỉnh sửa',
        status: 1,
        width: 5,
    },
    {
        key: 'userUpdate',
        value: 'Người chỉnh sửa',
        status: 1,
        width: 5,
    },
    {
        key: 'project',
        value: 'Dự án',
        status: 1,
        width: 5,
    },
    {
        key: 'contract',
        value: 'Hợp đồng',
        status: 1,
        width: 5,
    },
    {
        key: 'package',
        value: 'Gói',
        status: 1,
        width: 5,
    },
    {
        key: 'date',
        value: 'Ngày chứng từ',
        status: 1,
        width: 5,
    },
    {
        key: 'name',
        value: 'Nội dung',
        status: 1,
        width: 5,
    },
    {
        key: 'description',
        value: 'Mô tả',
        status: 1,
        width: 5,
    },
    {
        key: 'sign',
        value: 'Ký hiệu',
        status: 1,
        width: 5,
    },
    {
        key: 'startTime',
        value: 'Bắt đầu',
        status: 1,
        width: 5,
    },
    {
        key: 'expiredTime',
        value: 'Kết thúc',
        status: 1,
        width: 5,
    },
    {
        key: 'contact',
        value: 'Mã khách',
        status: 1,
        width: 5,
    },
    {
        key: 'goods',
        value: 'Sản phẩm',
        status: 1,
        width: 5,
    },
    {
        key: 'unit',
        value: 'Đơn vị',
        status: 1,
        width: 5,
    },
    {
        key: 'quantity',
        value: 'Số lượng',
        status: 1,
        width: 5,
    },
    {
        key: 'unitprice',
        value: 'Đơn giá',
        status: 1,
        width: 5,
    },
    {
        key: 'amount',
        value: 'Thành tiền',
        status: 1,
        width: 5,
    },
    {
        key: 'note',
        value: 'Ghi chú',
        status: 1,
        width: 5,
    },
    {
        key: 'note1',
        value: 'Khác 1',
        status: 1,
        width: 5,
    },
    {
        key: 'note2',
        value: 'Khác 2',
        status: 1,
        width: 5,
    },
    {
        key: 'note3',
        value: 'Khác 3',
        status: 1,
        width: 5,
    },
    {
        key: 'note4',
        value: 'Khác 4',
        status: 1,
        width: 5,
    },
    {
        key: 'note5',
        value: 'Khác 5',
        status: 1,
        width: 5,
    },
    {
        key: 'comments',
        value: 'Bình luận',
        status: 1,
        width: 5,
    },
    {
        key: 'status',
        value: 'Trạng thái',
        status: 1,
        width: 5,
    },
    
]

/**
 * TÀI CHÍNH DOANH NGHIỆP
 */
// PHÂN LOẠI KẾ HOẠCH TÀI CHÍNH
exports.FINANCIAL_PLANNING_TYPES = [
    { value: 1, text: 'Kế hoạch Năm' },
    { value: 2, text: 'Kế hoạch Bán hàng' },
    { value: 3, text: 'Kế hoạch Nhập hàng' },
    { value: 4, text: 'Kế hoạch theo thực tế triển khai' },
]

// LOẠI PHIẾU KẾ TOÁN
exports.VOUCHER_TYPES = [
    { value: 1, text: 'Phiếu kế toán', sign: 'PKT', slug: 'accbill' },
    { value: 2, text: 'Phiếu thu', sign: 'PT', slug: 'receipt' },
    { value: 3, text: 'Phiếu chi', sign: 'PC', slug: 'payment' },
    { value: 4, text: 'Phiếu nhập', sign: 'PN', slug: 'goods-import' },
    { value: 5, text: 'Phiếu xuất', sign: 'PX', slug: 'goods-export' },
    { value: 6, text: 'Hóa đơn dịch vụ', sign: 'HDDV', slug: 'invoices' },
    { value: 7, text: 'Giấy báo nợ', sign: 'GBN', slug: 'debit-note' },
    { value: 8, text: 'Giấy báo có', sign: 'GBC', slug: 'credit-note' },
]

// LOẠI BÁO CÁO QUẢN TRỊ
// ['3','4','5','7'].includes(infoAccount.name.charAt(0)) => isDebit = false
// Doanh thu bán hàng: 511 
// Doanh thu thuần: Doanh thu bán hàng - Các khoản giảm trừ doanh thu
// '621','622','623','627' => 154 => 632
exports.ADREPORT_TYPES = [
    { value: 1, text: 'Quỹ', accounts: ['111','112'], isDebit: true },
    { value: 2, text: 'Doanh thu', accounts: ['511','515','521','711'], isDebit: false },
    { value: 3, text: 'Chi phí', accounts: ['621','622','623','627','631','632','635','641','642','811','821'], isDebit: true },
    { value: 4, text: 'Công nợ phải thu', accounts: ['128','131','136','138','141'], isDebit: true },
    { value: 5, text: 'Công nợ phải trả', accounts: ['331','334','336','338','341'], isDebit: false },
]

// PHÂN LOẠI NGUỒN KHÁCH HÀNG
exports.ORDER_SOURCE = [
    { value: 1, text: 'Facebook',  class: 'tajic-status-btn-open' },
    { value: 2, text: 'Website',  class: 'tajic-status-btn-open' },
    { value: 3, text: 'Zalo',  class: 'tajic-status-btn-in-progress' },
    { value: 4, text: 'Khác',  class: 'tajic-status-btn-in-progress' },
]

// PHÂN LOẠI ĐƠN HÀNG
exports.ORDER_NEW = [
    { value: 1, text: 'Đơn cũ',  class: 'tajic-status-btn-open' },
    { value: 2, text: 'Đơn mới',  class: 'tajic-status-btn-open' },
]

// CHÍNH SÁCH GIÁ BÁN
exports.ORDER_POLICY = [
    { value: 1, text: 'Bán lẻ',  class: 'tajic-status-btn-open' },
    { value: 2, text: 'Bán buôn',  class: 'tajic-status-btn-open' },
]

// TRẠNG THÁI KHÁCH HÀNG
exports.CONTACT_STATUS = [
    { value: 1, text: 'Chưa giao dịch', key: 'open' },
    { value: 2, text: 'Đang giao dịch', key: 'in_progress' },
    { value: 3, text: 'Ngừng giao dịch', key: 'completed' },
]

/**
 * CHUNG CHO CÁC ỨNG DỤNG
 */
// PHÂN LOẠI TƯƠNG TÁC
exports.REACTION_TYPES = [
    { value: 1, text: 'Thả tim', image: '2764.png' },
    { value: 2, text: 'Cười sặc sụa', image: '1f606.png' },
    { value: 3, text: 'Ngạc nhiên', image: '1f62e.png' },
    { value: 4, text: 'Buồn thương', image: '1f622.png' },
    { value: 5, text: 'Giận dữ', image: '1f620.png' },
    { value: 6, text: 'Thích', image: '1f44d.png' },
    { value: 7, text: 'Không thích', image: '1f44e.png' },
]
/**
 * Phân loại
 * 0-Trợ lý viên
 * 1-Chủ đầu tư
 * 2-Tư vấn QLDA
 * 3-Tư vấn giám sát
 * 4-Tư vấn thiết kế
 * 5-Nhà thầu thi công 
 */
exports.PCM_MEMBER_POSITION_TYPE = [
	{ value: 0, text: 'Trợ lý viên' },
	{ value: 1, text: 'Chủ đầu tư' },
	{ value: 2, text: 'Tư vấn QLDA' },
	{ value: 3, text: 'Tư vấn giám sát' },
	{ value: 4, text: 'Tư vấn thiết kế' },
	{ value: 5, text: 'Nhà thầu thi công' },
]

/**
 * 1. Hình ảnh
 * 2. Video
 * 3. Zip
 */
exports.PCM_TYPE_FILE = [
    { value: 1, type: [ 'jpg','jpeg', 'png', 'gif', 'heic'] },
    { value: 2, type: ['mp3', 'mp4', 'wav'] },
    { value: 3, type: ['zip', 'rar', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'ppt', 'pptx', 'dwg', 'mmap', 'mdb', 'rar', 'txt', 'mpp'] }
]

exports.MESSAGE_TYPE_FILE = [
    { value: 1, type: [ 'jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF',  'image/jpeg', 'image/pjpeg', 'image/png', 'image/svg+xml'] },
    { value: 2, type: ['mp3', 'MP3', 'mp4', 'MP4', 'wav', 'WAV'] },
    { value: 3, type: ['zip', 'rar', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'ppt', 'pptx', 'dwg', 'mmap', 'mdb', "application/x-zip", "application/zip", 'rar', 'txt', 'mpp'] }
]
exports.TEMPLATE_TYPE = [
	{ value: 1, text: 'Chung' },
	{ value: 2, text: 'Biểu đồ cột' },
	{ value: 3, text: 'Biểu đồ tròn' },
	{ value: 4, text: 'Biểu đồ Histogram' },
]
/**
 * MIME Types image
 */
exports.MIME_TYPES_IMAGE = [ 'image/jpeg', 'image/pjpeg', 'image/png', 'image/svg+xml' ];

exports.MIME_TYPES_PCM   = [ 'mov', 'mp4' , 'MP4', 'wav', 'WAV', 'jpg', 'jpeg', 'png', 'gif', 'heic', 'zip', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'ppt', 'pptx', 'dwg', 'mmap', 'mdb', 'rar', 'image/png', 'txt', 'mpp'];

exports.MIME_TYPES_MESSAGE   = [ 'jpg', 'jpeg', 'png', 'gif', 'heic', 'zip', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'ppt', 'pptx', 'dwg', 'mmap', 'mdb', 'rar', 'txt', 'mpp' ];

// DANH SÁCH TỈNH THÀNH
exports.PROVINCE_TYPES = [
    { value: 1, text: 'An Giang' },
    { value: 2, text: 'Bà Rịa – Vũng Tàu' },
    { value: 3, text: 'Bắc Giang' },
    { value: 4, text: 'Bắc Kạn' },
    { value: 5, text: 'Bạc Liêu' },
    { value: 6, text: 'Bắc Ninh' },
    { value: 7, text: 'Bến Tre' },
    { value: 8, text: 'Bình Định' },
    { value: 9, text: 'Bình Dương' },
    { value: 10, text: 'Bình Phước' },
    { value: 11, text: 'Bình Thuận' },
    { value: 12, text: 'Cà Mau' },
    { value: 13, text: 'Cần Thơ' },
    { value: 14, text: 'Cao Bằng' },
    { value: 15, text: 'Đà Nẵng' },
    { value: 16, text: 'Đắk Lắk' },
    { value: 17, text: 'Đắk Nông' },
    { value: 18, text: 'Điện Biên' },
    { value: 19, text: 'Đồng Nai' },
    { value: 20, text: 'Đồng Tháp' },
    { value: 21, text: 'Gia Lai' },
    { value: 22, text: 'Hà Giang' },
    { value: 23, text: 'Hà Nam' },
    { value: 24, text: 'Hà Nội' },
    { value: 25, text: 'Hà Tĩnh' },
    { value: 26, text: 'Hải Dương' },
    { value: 27, text: 'Hải Phòng' },
    { value: 28, text: 'Hậu Giang' },
    { value: 29, text: 'Hòa Bình' },
    { value: 30, text: 'Hưng Yên' },
    { value: 31, text: 'Khánh Hòa' },
    { value: 32, text: 'Kiên Giang' },
    { value: 33, text: 'Kon Tum' },
    { value: 34, text: 'Lai Châu' },
    { value: 35, text: 'Lâm Đồng' },
    { value: 36, text: 'Lạng Sơn' },
    { value: 37, text: 'Lào Cai' },
    { value: 38, text: 'Long An' },
    { value: 39, text: 'Nam Định' },
    { value: 40, text: 'Nghệ An' },
    { value: 41, text: 'Ninh Bình' },
    { value: 42, text: 'Ninh Thuận' },
    { value: 43, text: 'Phú Thọ' },
    { value: 44, text: 'Phú Yên' },
    { value: 45, text: 'Quảng Bình' },
    { value: 46, text: 'Quảng Nam' },
    { value: 47, text: 'Quảng Ngãi' },
    { value: 48, text: 'Quảng Ninh' },
    { value: 49, text: 'Quảng Trị' },
    { value: 50, text: 'Sóc Trăng' },
    { value: 51, text: 'Sơn La' },
    { value: 52, text: 'Tây Ninh' },
    { value: 53, text: 'Thái Bình' },
    { value: 54, text: 'Thái Nguyên' },
    { value: 55, text: 'Thanh Hóa' },
    { value: 56, text: 'Thừa Thiên Huế' },
    { value: 57, text: 'Tiền Giang' },
    { value: 58, text: 'TP Hồ Chí Minh' },
    { value: 59, text: 'Trà Vinh' },
    { value: 60, text: 'Tuyên Quang' },
    { value: 61, text: 'Vĩnh Long' },
    { value: 62, text: 'Vĩnh Phúc' },
    { value: 63, text: 'Yên Bái' },    
]

// Danh sách Supporter của hệ thống (xử lý ticket)/Sẽ bỏ đi sau khi hoàn tất việc phân quyền chuyên nghiệp
exports.arrSupporters = [
    'hiepnh.trixgo@gmail.com',
    'toannd.trixgo@gmail.com',
    'khanhney.dev@gmail.com',
    'lucdeit1997@gmail.com',
    'huynhvinh.dev@gmail.com',
    'ivermin1123@gmail.com',
    'todat999@gmail.com',
    'tuyetkha2512@gmail.com',
    'lephuocson1999@gmail.com',
    'hdl120599@gmail.com',
    'ivermin1123@gmail.com',
    'huynhquocnguyen99@gmail.com',
    'vietphi99dh@gmail.com',
    'vuhuynhminh9221@gmail.com'
]

// Danh sách user test
exports.arrUsersTest = [
    'duongnt@conincopmi.com',
    'phongll@conincopmi.com',
    'thuyntt@conincopmi.com',
    'huongnpt@conincopmi.com',
    'tramnt@conincopmi.com',
    'hungnm@conincopmi.com',
    'cuongph@pcone.com.vn',
    'tamcm@pcone.com.vn',
    'hoangnh.trixgo@gmail.com',
    'hiepnh.trixgo@gmail.com',
    'huynhvinh.dev@gmail.com',
    'truongpv.dtc@gmail.com',
    'hongvv@dinhtan.vn',
    'phudd.dtc@gmail.com',
    'quantri.domi@gmail.com',
    'leha.domitravel@gmail.com',
    'cncpmico@conincopmi.com',
    'pc1trx@pcone.com.vn',
    'tramnt@pcone.com.vn',
    'admin@dongachem.vn',
    'tuan.hoang@dongachem.vn',
    'ngantran.26121992@gmail.com',
    'huongphan1238@gmail.com',
    'hongvv.domi@gmail.com',
    'hungnm@conincopmi.com',
    'hungnm@pcone.com.vn',
    'codong.pco.trixgo@gmail.com',
    'ad.pmt.trx@gmail.com'
]

// Danh sách user test datahub
exports.arrUsersTestDataHub = [
    'duongnt@conincopmi.com',
    'phongll@conincopmi.com',
    // 'hiepnh.trixgo@gmail.com',
    'huynhvinh.dev@gmail.com',
    'hongvv@dinhtan.vn',
    'phudd.dtc@gmail.com',
    'hiepnh@pgipartner.com',
    'truongpv@pgipartner.com',
    'toannd@trixgo.com',
    'lucdeit1997@gmail.com',
    'oanhtt@cnxgroup.vn'
]

// Danh sách user Supporter
exports.arrSpecial = [
    'hiepnh@trixgo.com',
    'hiepnh@conincopmi.com',
    'hiepnh@pgipartner.com',
    'toannd@trixgo.com',
    'tamcm@pcone.com.vn',
    'thupt@trixgo.com',
    'hapt@trixgo.com',
    'phongll@conincopmi.com',
    'trixgo@dinhtan.vn',
    'hongvv@dinhtan.vn',
    'truongpv.dtc@gmail.com',
    'test.ddc.trx@gmail.com',
    'mem.0304686687.trx@gmail.com',
    'test.biig2.trx@gmail.com',
    'assistant.mnd.trx@gmail.com',
    'test.tnt.trx@gmail.com',
    'assistant.har.trx@gmail.com',
    'assistant.armo.trx@gmail.com',
    'assistant.vnoil.trx@gmail.com',
    'assistant.pvssg.trx@gmail.com',
    'assistant.handiresco.trx@gmail.com',
    'assistant.bim.trx@gmail.com',
    'assistant.vgyb.trx@gmail.com',
    'assistant.mik.trx@gmail.com',
    'assistan.plf.trx@gmai.com',
    'assistant.thr.trx@gmail.com',
    'assistant.lic17.trx@gmail.com',
    'ad.itest.trx@gmail.com',
    'test.cnc.trx@gmail.com',
    'test.cncpmico@conincopmi.com',
    'assistant.vgyb.trx@gmail.com',
    'nghialt.dtc@gmail.com',
    'tranhoakttc@gmail.com',
    'huynhvinh.dev@gmail.com',
    'lucdeit1997@gmail.com',
    'khanhney.dev@gmail.com',
    'vuhuynhminh9221@gmail.com',
    'assistant.npv@gmail.com',
    'anthaicompanytnhh@gmail.com',
    'assistant.npvgroup.trx@gmail.com',
    'test.farc.trx@gmail.com',
    'assistant.thr.trx@gmail.com',
    'assistant.tmt.trx@gmail.com',
    'assistant.tnc.trx@gmail.com',
    'test.tri.trx@gmail.com',
    'assistant.trx@gmail.com',
    'admin@dongachem.vn',
    'ad.pmt.trx@gmail.com',
    'test.biig2.trx@gmail.com',
    'ad.ptl.trx@gmail.com',
    'assistant.plf.trx@gmail.com',
    'yennt.hvtc.anp@gmail.com',
    'assistant.cfc.trx@gmail.com',
    'assistant.ttp.trx@gmail.com',
    'ad.dsp.trx@gmail.com',
    'assistant.bkg.trx@gmail.com',
    'leminhhoang@coninco.com',
    'assistant.lgfc.trx@gmail.com',
    'assistant.bdc.trx@gmail.com',
    'leminhhoang@coninco.com.vn',
    'assistant.pvssg.trx@gmail.com',
    'assistant.fptdna.trx@gmail.com',
    'assistant.c146.trx@gmail.com',
    'assistant.c147.trx@gmail.com',
    'assistant.c148.trx@gmail.com',
    'assistant.c149.trx@gmail.com',
    'assistant.c150.trx@gmail.com',
    'assistant.c151.trx@gmail.com',
    'assistant.c152.trx@gmail.com',
    'assistant.c153.trx@gmail.com',
    'assistant.c154.trx@gmail.com',
    'assistant.c155.trx@gmail.com',
    'assistant.c156.trx@gmail.com',
    'assistant.c157.trx@gmail.com',
    'assistant.c158.trx@gmail.com',
    'assistant.c159.trx@gmail.com',
    'assistant.c160.trx@gmail.com',
    'assistant.c161.trx@gmail.com',
    'assistant.c162.trx@gmail.com',
    'assistant.c163.trx@gmail.com',
    'assistant.c164.trx@gmail.com',
    'assistant.c165.trx@gmail.com',
    'assistant.c166.trx@gmail.com',
    'assistant.c167.trx@gmail.com',
    'assistant.c168.trx@gmail.com',
    'assistant.c169.trx@gmail.com',
    'assistant.c170.trx@gmail.com',
    'assistant.c171.trx@gmail.com',
    'assistant.c172.trx@gmail.com',
    'assistant.c173.trx@gmail.com',
    'assistant.c174.trx@gmail.com',
    'assistant.c175.trx@gmail.com',
    'assistant.c176.trx@gmail.com',
    'assistant.c177.trx@gmail.com',
    'assistant.c178.trx@gmail.com',
    'assistant.c179.trx@gmail.com',
    'assistant.c180.trx@gmail.com',
    'assistant.c181.trx@gmail.com',
    'assistant.c182.trx@gmail.com',
    'assistant.c183.trx@gmail.com',
    'assistant.c184.trx@gmail.com',
    'assistant.c185.trx@gmail.com',
    'assistant.c186.trx@gmail.com',
    'assistant.c187.trx@gmail.com',
    'assistant.c188.trx@gmail.com',
    'assistant.c189.trx@gmail.com',
    'assistant.c190.trx@gmail.com',
    'assistant.c191.trx@gmail.com',
    'assistant.c192.trx@gmail.com',
    'assistant.c193.trx@gmail.com',
    'assistant.c194.trx@gmail.com',
    'assistant.c195.trx@gmail.com',
    'assistant.c196.trx@gmail.com',
    'assistant.c197.trx@gmail.com',
    'assistant.c198.trx@gmail.com',
    'assistant.c199.trx@gmail.com',
    'assistant.c200.trx@gmail.com',
    'assistant.pgi.trx@gmail.com',
    'tuan.hoang@dongachem.vn',
    'assistant.cub.trx@gmail.com',
    'com.asana.trx@gmail.com',
    'hoanglinh.calla@gmail.com',
    'assistant.chg.trx@gmail.com',
    'assistant.mduc.trx@gmail.com',
    'lienlt@pcone.com.vn',
    'phungthiha307@gmail.com',
    'thupt@pgipartner.com',
    'datpt.dtc@gmail.com',
    'trangvtt@dinhtan.vn',
    'phudd.dtc@gmail.com',
]