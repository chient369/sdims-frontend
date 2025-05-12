/**
 * Các thông báo lỗi cho form hợp đồng
 * 
 * File này chứa các thông báo lỗi được sử dụng trong Contract Form.
 * Các thông báo được nhóm lại theo thành phần và loại lỗi.
 */

// ===== Thông báo lỗi chung =====
export const COMMON_VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Trường này là bắt buộc',
  INVALID_FORMAT: 'Định dạng không hợp lệ',
  MIN_VALUE: (min: number) => `Giá trị phải lớn hơn hoặc bằng ${min}`,
  MAX_VALUE: (max: number) => `Giá trị phải nhỏ hơn hoặc bằng ${max}`,
  MIN_LENGTH: (min: number) => `Độ dài tối thiểu là ${min} ký tự`,
  MAX_LENGTH: (max: number) => `Độ dài tối đa là ${max} ký tự`,
  FUTURE_DATE: 'Vui lòng chọn ngày trong tương lai',
  PAST_DATE: 'Vui lòng chọn ngày trong quá khứ',
  INVALID_DATE: 'Ngày không hợp lệ',
  NUMBER_REQUIRED: 'Vui lòng nhập một số',
  DUPLICATE_ENTRY: 'Giá trị này đã tồn tại, vui lòng chọn giá trị khác',
  SPECIAL_CHARS_NOT_ALLOWED: 'Không được chứa ký tự đặc biệt',
};

// ===== Thông báo lỗi cho thông tin chung =====
export const GENERAL_INFO_VALIDATION_MESSAGES = {
  CONTRACT_CODE_EXISTS: 'Mã hợp đồng đã tồn tại trong hệ thống',
  CONTRACT_CODE_FORMAT: 'Mã hợp đồng phải theo định dạng CTRXXX-YYYY',
  CUSTOMER_REQUIRED: 'Vui lòng chọn khách hàng',
  SALES_PERSON_REQUIRED: 'Vui lòng chọn người phụ trách Sales',
  STATUS_REQUIRED: 'Vui lòng chọn trạng thái hợp đồng',
  CONTRACT_TYPE_REQUIRED: 'Vui lòng chọn loại hợp đồng',
  DESCRIPTION_TOO_LONG: 'Mô tả không được vượt quá 500 ký tự',
};

// ===== Thông báo lỗi cho giá trị và ngày tháng =====
export const VALUE_DATES_VALIDATION_MESSAGES = {
  AMOUNT_REQUIRED: 'Vui lòng nhập giá trị hợp đồng',
  AMOUNT_POSITIVE: 'Giá trị hợp đồng phải lớn hơn 0',
  CURRENCY_REQUIRED: 'Vui lòng chọn đơn vị tiền tệ',
  SIGN_DATE_REQUIRED: 'Vui lòng chọn ngày ký hợp đồng',
  START_DATE_REQUIRED: 'Vui lòng chọn ngày hiệu lực',
  END_DATE_REQUIRED: 'Vui lòng chọn ngày hết hạn',
  END_DATE_AFTER_START: 'Ngày hết hạn phải sau ngày hiệu lực',
  START_DATE_AFTER_SIGN: 'Ngày hiệu lực phải sau hoặc bằng ngày ký',
  DATE_RANGE_TOO_LONG: 'Thời hạn hợp đồng không nên vượt quá 3 năm',
  DATE_RANGE_TOO_SHORT: 'Thời hạn hợp đồng quá ngắn, tối thiểu nên là 7 ngày',
  CONTRACT_VALUE_CHANGED: 'Giá trị hợp đồng đã thay đổi, vui lòng kiểm tra lại các đợt thanh toán',
};

// ===== Thông báo lỗi cho điều khoản thanh toán =====
export const PAYMENT_TERMS_VALIDATION_MESSAGES = {
  // Lỗi ở cấp độ đợt thanh toán riêng lẻ
  TERM_DESCRIPTION_REQUIRED: 'Vui lòng nhập mô tả đợt thanh toán',
  TERM_DUE_DATE_REQUIRED: 'Vui lòng chọn ngày thanh toán',
  TERM_AMOUNT_REQUIRED: 'Vui lòng nhập số tiền',
  TERM_AMOUNT_POSITIVE: 'Số tiền phải lớn hơn 0',
  TERM_AMOUNT_MIN: 'Số tiền phải lớn hơn 1.000',
  TERM_DUE_DATE_PAST: 'Ngày thanh toán không nên trong quá khứ',
  TERM_BEFORE_START_DATE: 'Ngày thanh toán không nên trước ngày bắt đầu hợp đồng',
  TERM_AFTER_END_DATE: 'Ngày thanh toán không nên sau ngày kết thúc hợp đồng',
  TERM_ADVANCE_PERCENTAGE: 'Đợt tạm ứng không nên vượt quá 70% giá trị hợp đồng',
  TERM_SMALL_PERCENTAGE: (percentage: number) => 
    `Đợt thanh toán quá nhỏ (${percentage}% < 5% giá trị hợp đồng)`,
  TERM_DUPLICATE_DESCRIPTION: 'Mô tả đợt thanh toán đã tồn tại, vui lòng sử dụng mô tả khác',
  TERM_DUPLICATE_DATE: 'Đã có một đợt thanh toán khác vào cùng ngày này',
  TERM_GAP_TOO_SMALL: 'Ngày thanh toán nên cách đợt trước ít nhất 7 ngày',
  TERM_FINAL_PERCENTAGE_LOW: 'Đợt thanh toán cuối cùng nên chiếm ít nhất 10% giá trị hợp đồng',
  TERM_CHANGED_UPDATE_PERCENTAGE: 'Số tiền đã thay đổi, % tương ứng đã được cập nhật',
  
  // Lỗi ở cấp độ tổng hợp tất cả các đợt thanh toán
  NO_PAYMENT_TERMS: 'Hợp đồng phải có ít nhất một đợt thanh toán',
  TOTAL_EXCEEDS_CONTRACT: 'Tổng giá trị các đợt thanh toán vượt quá giá trị hợp đồng',
  TOTAL_LESS_THAN_CONTRACT: (difference: string) => 
    `Tổng giá trị các đợt thanh toán còn thiếu ${difference} so với giá trị hợp đồng`,
  UNORDERED_TERMS: 'Các đợt thanh toán nên được sắp xếp theo thứ tự thời gian',
  TOO_MANY_TERMS: 'Có quá nhiều đợt thanh toán (>10), việc quản lý có thể phức tạp',
  TOO_FEW_TERMS_HIGH_VALUE: 'Hợp đồng giá trị lớn (>500 triệu) nên có ít nhất 3 đợt thanh toán',
  FIRST_TERM_NOT_ADVANCE: 'Đợt thanh toán đầu tiên nên là đợt tạm ứng/initial payment',
  PERCENTAGE_SUM_NOT_100: (sum: number) => `Tổng phần trăm các đợt thanh toán hiện tại là ${sum}%, nên bằng 100%`,
};

// ===== Thông báo lỗi cho tài liệu đính kèm =====
export const ATTACHMENTS_VALIDATION_MESSAGES = {
  // Lỗi về loại file
  UNSUPPORTED_FILE_TYPE: (fileName: string, supportedTypes: string[]) => 
    `File "${fileName}" có định dạng không được hỗ trợ. Các định dạng được hỗ trợ: ${supportedTypes.join(', ')}`,
  
  // Lỗi về kích thước file
  FILE_TOO_LARGE: (fileName: string, size: string, maxSize: string) => 
    `File "${fileName}" có kích thước ${size} vượt quá giới hạn cho phép (${maxSize})`,
  
  // Lỗi về số lượng file
  MAX_FILES_REACHED: (maxFiles: number) => 
    `Không thể tải lên thêm file. Số lượng file đã đạt giới hạn (tối đa ${maxFiles} file)`,
  
  // Lỗi về các yêu cầu nghiệp vụ 
  NO_CONTRACT_FILE: 'Cần đính kèm ít nhất một file hợp đồng (định dạng PDF)',
  CANT_DELETE_LAST_CONTRACT: 'Không thể xóa file hợp đồng cuối cùng. Hợp đồng cần có ít nhất một file đính kèm',
  UPLOAD_FAILED: 'Tải lên file thất bại. Vui lòng thử lại',
  FILE_ALREADY_EXISTS: (fileName: string) => `File "${fileName}" đã tồn tại. Bạn có muốn thay thế không?`,
  NON_PDF_CONTRACT: 'File hợp đồng nên ở định dạng PDF để đảm bảo tính chính xác và không thể thay đổi',
  SPECIAL_CHARS_IN_FILENAME: 'Tên file chứa ký tự đặc biệt, sẽ được thay thế bằng dấu gạch dưới',
  UPLOAD_INTERRUPTED: 'Quá trình tải lên bị gián đoạn. Vui lòng thử lại',
  TOTAL_SIZE_EXCEEDED: 'Tổng dung lượng file vượt quá 100MB, vui lòng xóa một số file hoặc giảm kích thước',
  UPLOAD_RETRY: 'Đang thử tải lên lại...',
  CATEGORY_AUTO_DETECTED: (fileName: string, category: string) => `File "${fileName}" được tự động phân loại là "${category}" dựa vào định dạng`,
};

// ===== Thông báo lỗi cho liên kết =====
export const LINKS_VALIDATION_MESSAGES = {
  NO_EMPLOYEE_SELECTED: 'Vui lòng chọn ít nhất một nhân viên tham gia',
  DUPLICATE_EMPLOYEE: 'Nhân viên này đã được thêm vào danh sách',
  ALLOCATION_SUM_INVALID: 'Tổng phần trăm phân bổ của tất cả nhân viên phải bằng 100%',
  ALLOCATION_REQUIRED: 'Vui lòng nhập phần trăm phân bổ',
  ROLE_REQUIRED: 'Vui lòng nhập vai trò',
  ALLOCATION_RANGE: 'Phần trăm phân bổ phải từ 1% đến 100%',
  ALLOCATION_TOO_LOW: 'Nhân sự có tỷ lệ phân bổ quá thấp (<10%) có thể không hiệu quả',
  ALLOCATION_TOO_HIGH: 'Nhân sự có tỷ lệ phân bổ quá cao (>70%) có thể không khả thi'
};

// ===== Thông báo cảnh báo (warning) =====
export const WARNING_MESSAGES = {
  CONTRACT_ABOUT_TO_EXPIRE: 'Hợp đồng sẽ hết hạn trong thời gian ngắn',
  HIGH_VALUE_CONTRACT: 'Đây là hợp đồng có giá trị lớn, vui lòng kiểm tra kỹ thông tin',
  PAYMENT_TERM_SOON: 'Đợt thanh toán này sẽ đến hạn trong thời gian ngắn',
  MANY_PAYMENT_TERMS: 'Hợp đồng có nhiều đợt thanh toán, cân nhắc giảm số lượng',
  FEW_PAYMENT_TERMS: 'Hợp đồng có ít đợt thanh toán cho giá trị lớn, cân nhắc thêm đợt',
  FIRST_TERM_NOT_ADVANCE: 'Đợt thanh toán đầu tiên không phải là tạm ứng',
  NO_OPPORTUNITY_LINK: 'Hợp đồng chưa được liên kết với cơ hội kinh doanh',
  CONTRACT_VALUE_CHANGED: 'Giá trị hợp đồng đã thay đổi, vui lòng kiểm tra lại các đợt thanh toán',
  MISSING_CUSTOMER: 'Chưa chọn khách hàng cho hợp đồng',
  APPROACHING_FILE_LIMIT: (current: number, max: number) => `Đã tải lên ${current}/${max} file. Gần đạt đến giới hạn số lượng file`,
  APPROACHING_SIZE_LIMIT: (current: string, max: string) => `Tổng dung lượng file đã đạt ${current}/${max}. Gần đạt đến giới hạn dung lượng`,
  LONG_CONTRACT_DURATION: 'Thời hạn hợp đồng khá dài, vui lòng xác nhận lại ngày kết thúc',
  PAYMENT_TERMS_NOT_BALANCED: 'Các đợt thanh toán chưa được phân bổ hợp lý, cân nhắc điều chỉnh tỷ lệ',
  NO_PM_FOR_LARGE_TEAM: 'Nên có ít nhất một Project Manager cho dự án có từ 3 nhân sự trở lên'
};

// ===== Thông báo thành công =====
export const SUCCESS_MESSAGES = {
  CONTRACT_CREATED: 'Tạo hợp đồng thành công',
  CONTRACT_UPDATED: 'Cập nhật hợp đồng thành công',
  PAYMENT_TERMS_UPDATED: 'Cập nhật điều khoản thanh toán thành công',
  FILE_UPLOADED: 'Tải lên file thành công',
  FILE_DELETED: 'Xóa file thành công',
  EMPLOYEE_ADDED: 'Thêm nhân viên thành công',
  EMPLOYEE_REMOVED: 'Xóa nhân viên thành công',
  FILE_REPLACED: 'Thay thế file thành công',
  PAYMENT_TERM_ADDED: 'Thêm đợt thanh toán thành công',
  PAYMENT_TERM_REMOVED: 'Xóa đợt thanh toán thành công',
  PAYMENT_TERM_UPDATED: 'Cập nhật đợt thanh toán thành công',
  FORM_VALIDATED: 'Kiểm tra hợp đồng thành công, không có lỗi',
};

// ===== Thông báo hướng dẫn =====
export const GUIDANCE_MESSAGES = {
  PAYMENT_TERMS_HELP: 'Chia nhỏ giá trị hợp đồng thành nhiều đợt thanh toán, đảm bảo tổng số tiền bằng giá trị hợp đồng',
  UPLOAD_FILE_HELP: 'Kéo và thả file vào đây hoặc click để chọn file. Hỗ trợ định dạng PDF, DOCX, JPG, PNG, XLSX',
  DATE_FORMAT_HELP: 'Định dạng ngày: DD/MM/YYYY',
  CURRENCY_FORMAT_HELP: 'Nhập số không có dấu phẩy, hệ thống sẽ tự động định dạng',
  PAYMENT_TERM_TIPS: 'Thông thường, đợt đầu là đợt tạm ứng (20-30%), các đợt giữa là theo milestone, đợt cuối là nghiệm thu (20-30%)',
  ATTACHMENT_TIPS: 'File hợp đồng nên ở định dạng PDF và được ký số hoặc scan bản có chữ ký',
  REQUIRED_FIELDS_HELP: 'Các trường đánh dấu * là bắt buộc phải nhập',
};

// Tùy chỉnh thông báo lỗi theo environment
export const customizeMessages = (messages: Record<string, string | Function>, overrides: Record<string, string | Function>) => {
  return { ...messages, ...overrides };
}; 