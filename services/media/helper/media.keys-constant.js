/**
 * Loại bài viết
 * 1: Bài viết công ty (Thành viên trong công ty)
 * 2: Dự án, phòng ban
 * 3: Chuyển đổi số
 * 4: Hệ thống
 * 5: Bài viết cá nhân
 * ..... Sau bổ sung thêm vài loại bài viết
 */
// exports.MEDIA_TYPES = [1,2,3,4,5];
exports.MEDIA_TYPES = ['company', 'department', 'digital-conversion', 'system', 'just-me'];

exports.REACTION_TYPES = [1,2,3,4,5,6,7];

exports.FILE_PROCESSING            = 0;
exports.FILE_UPLOAD_ERROR          = -1;
exports.FILE_UPLOAD_SUCCESS        = 1;