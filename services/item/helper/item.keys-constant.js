//FILE CONFIG || VARIABLE CONSTANT

/**
 * PHÂN LOẠI
    1-Văn Bản Lĩnh vực hồ sơ
    2-Văn Bản Tính chất hồ sơ
    3-Lĩnh vực kinh doanh
    4-Khách hàng phân loại
    5-Công việc, Phân loại khác
    6-Nhân sự, Trình độ
    7-Nhân sự, Chuyên ngành
    8-Nhận sự, Loại HDLD
    9-Nhân sự tình trạng làm việc
    10-Nhân sự Thâm niên
    11-Hành trình khách hàng (CRM)
    12-Hồ sơ chi tiết từng hành trình khách hàng (CRM)
    13-Nhân sự, chúc vụ
    14-Nhân sự loại chứng chỉ
    15-Nhân sự, Nội dung chứng chỉ
    16-Hợp đồng phân loại công nợ
    17-Hợp đồng nguyên nhân phát sinh
    18-Chung-Nguyên nhân thất bại
    20-Chung các lỗi hay gặp
    21- Công việc, Đánh giá chất lượng
    22-Theo service (áp dụng cho message nps)
    23-Theo service (áp dụng cho message nps)(Không hài lòng)
    24-Kênh bán hàng
*/
exports.DOCTYPE_TYPE = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24,
]

exports.CONTACT_CLASSIFY = [
  { value: 1, text: 'Nhân viên' },
  { value: 2, text: 'Khách hàng' },
  { value: 3, text: 'Nhà cung cấp' },
]

exports.HUMAN_CLASSIFY = [
  { value: 1, text: 'Nhân viên' },
  { value: 2, text: 'Cộng tác viên' },
  { value: 3, text: 'Chuyên gia' },
]

exports.CONTACT_GENDER = [
  { value: 1, text: 'Nam' },
  { value: 2, text: 'Nữ' },
  { value: 3, text: 'Khác' },
]

exports.PERSONAL_STATUS = [
  { value: 1, text: 'T' },
  { value: 2, text: 'A' },
]

exports.INSURANCE_STATUS = [
  { value: 1, text: 'Chưa nộp' },
  { value: 2, text: 'Đã nộp' },
  { value: 3, text: 'Thêm mới' },
]

exports.CONTACT_POLICY = [
  { value: 1, text: 'Không' },
  { value: 2, text: 'Bộ đội phục viên' },
  { value: 3, text: 'Con thương bệnh binh' },
  { value: 4, text: 'Gia đình chính sách' },
]

exports.CONTACT_NEW = [
  { value: 1, text: 'Mới' },
  { value: 2, text: 'Cũ' },
  { value: 3, text: 'Vãng lai' },
]

exports.PAYMENT_STATUS = [
  { value: 1, text: 'Chưa giao dịch' },
  { value: 2, text: 'Đang giao dịch' },
  { value: 3, text: 'Ngừng giao dịch' },
]

exports.DOCUMENT_CLASSIFY = [
  { value: 1, text: 'Lịch sử làm việc ở các đơn vị' },
  { value: 2, text: 'Kinh nghiệm thực tế tham gia tại các Dự án' },
  { value: 3, text: 'Lịch sử làm việc theo Quyết định bổ nhiệm' },
  { value: 4, text: 'Trình độ học vấn + Chuyên ngành đào tạo' },
  { value: 5, text: 'Bằng cấp chứng chỉ' },
  { value: 6, text: 'Hồ sơ nhân sự khác' },
]

exports.DOCUMENT_GRADE = [
  { value: 1, text: 'Hạng 1' },
  { value: 2, text: 'Hạng 2' },
  { value: 3, text: 'Hạng 3' },
  { value: 4, text: 'Hạng 4' },
]

exports.DOCUMENT_STATUS = [
  { value: 1, text: 'Còn hiệu lực' },
  { value: 2, text: 'Hết hiệu lực' },
]
