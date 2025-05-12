/**
 * Cấu hình validation cho Contract Form
 * 
 * File này định nghĩa các quy tắc validation cho các trường dữ liệu 
 * trong form hợp đồng. Các giá trị này có thể được tùy chỉnh theo yêu cầu của dự án.
 */

import { COMMON_VALIDATION_MESSAGES } from './validationMessages';

// ==== Contract General Info ====
export const CONTRACT_CODE_VALIDATION = {
  required: { value: true, message: COMMON_VALIDATION_MESSAGES.REQUIRED_FIELD },
  pattern: { 
    value: /^CTR\d{3}-\d{4}$/, 
    message: 'Mã hợp đồng phải theo định dạng CTRXXX-YYYY'
  },
  minLength: { value: 9, message: COMMON_VALIDATION_MESSAGES.MIN_LENGTH(9) },
  maxLength: { value: 9, message: COMMON_VALIDATION_MESSAGES.MAX_LENGTH(9) }
};

export const CONTRACT_NAME_VALIDATION = {
  required: { value: true, message: COMMON_VALIDATION_MESSAGES.REQUIRED_FIELD },
  minLength: { value: 5, message: COMMON_VALIDATION_MESSAGES.MIN_LENGTH(5) },
  maxLength: { value: 200, message: COMMON_VALIDATION_MESSAGES.MAX_LENGTH(200) }
};

export const DESCRIPTION_VALIDATION = {
  maxLength: { value: 500, message: COMMON_VALIDATION_MESSAGES.MAX_LENGTH(500) }
};

// ==== Contract Value and Dates ====
export const CONTRACT_AMOUNT_VALIDATION = {
  required: { value: true, message: COMMON_VALIDATION_MESSAGES.REQUIRED_FIELD },
  min: { value: 1000, message: 'Giá trị hợp đồng phải lớn hơn 1.000' },
  valueAsNumber: true
};

export const DATE_VALIDATION = {
  required: { value: true, message: COMMON_VALIDATION_MESSAGES.REQUIRED_FIELD }
};

// ==== Payment Terms ====
export const PAYMENT_TERM_VALIDATION = {
  description: {
    required: { value: true, message: 'Mô tả đợt thanh toán là bắt buộc' },
    minLength: { value: 3, message: COMMON_VALIDATION_MESSAGES.MIN_LENGTH(3) },
    maxLength: { value: 100, message: COMMON_VALIDATION_MESSAGES.MAX_LENGTH(100) }
  },
  dueDate: {
    required: { value: true, message: 'Ngày thanh toán là bắt buộc' }
  },
  amount: {
    required: { value: true, message: 'Số tiền là bắt buộc' },
    min: { value: 1000, message: 'Số tiền phải lớn hơn 1.000' },
    valueAsNumber: true
  },
  notes: {
    maxLength: { value: 200, message: COMMON_VALIDATION_MESSAGES.MAX_LENGTH(200) }
  }
};

// ==== Attachment Section ====
export const ATTACHMENT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 20,
  totalMaxSize: 100 * 1024 * 1024, // 100MB
  acceptedFileTypes: {
    contract: ['pdf', 'docx', 'doc'],
    document: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'txt', 'rtf'],
    image: ['jpg', 'jpeg', 'png', 'gif'],
    spreadsheet: ['xlsx', 'xls', 'csv'],
    presentation: ['pptx', 'ppt']
  },
  fileNamePattern: /^[a-zA-Z0-9._-]+$/, // Chỉ cho phép chữ cái, số, dấu chấm, gạch dưới và gạch ngang
  warningThresholds: {
    fileCount: 15, // Cảnh báo khi số lượng file đạt 15 (75% giới hạn)
    totalSize: 75 * 1024 * 1024 // Cảnh báo khi tổng dung lượng đạt 75MB (75% giới hạn)
  }
};

// ==== Links Section ====
export const EMPLOYEE_ASSIGNMENT_VALIDATION = {
  role: {
    required: { value: true, message: 'Vai trò là bắt buộc' },
    maxLength: { value: 50, message: COMMON_VALIDATION_MESSAGES.MAX_LENGTH(50) }
  },
  allocation: {
    required: { value: true, message: 'Phần trăm phân bổ là bắt buộc' },
    min: { value: 1, message: 'Phần trăm phân bổ phải lớn hơn 0' },
    max: { value: 100, message: 'Phần trăm phân bổ không được vượt quá 100' },
    valueAsNumber: true
  }
};

// ==== Business Rules ====
export const BUSINESS_RULES = {
  // Quy tắc chung
  contractMinDuration: 7, // Số ngày tối thiểu của hợp đồng
  contractMaxDuration: 1095, // Số ngày tối đa (3 năm)
  
  // Quy tắc điều khoản thanh toán
  paymentTerms: {
    advancePaymentMaxPercentage: 70, // Tỷ lệ % tối đa cho đợt tạm ứng
    minPaymentPercentage: 5, // Tỷ lệ % tối thiểu cho mỗi đợt
    finalPaymentMinPercentage: 10, // Tỷ lệ % tối thiểu cho đợt cuối
    totalAmountTolerance: 1, // Độ chênh lệch cho phép (%) giữa tổng giá trị và giá trị hợp đồng
    minDueDateGap: 7, // Số ngày tối thiểu giữa các đợt thanh toán
    maxPaymentTerms: 10, // Số lượng tối đa đợt thanh toán trước khi cảnh báo
    minTermsForHighValue: 3, // Số lượng đợt tối thiểu cho hợp đồng giá trị lớn
    highValueThreshold: 500000000, // Ngưỡng giá trị hợp đồng lớn (500 triệu VND)
  },
  
  // Quy tắc tài liệu
  attachments: {
    requireContractFile: false, // Bắt buộc có file hợp đồng (PDF)
    minRequiredFiles: 0, // Số file tối thiểu
    preferredContractFormat: 'pdf', // Định dạng ưu tiên cho file hợp đồng
  }
};

// ==== Validation Functions ====
export const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const isValidFutureDate = (dateString: string): boolean => {
  if (!isValidDate(dateString)) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateString);
  
  return date >= today;
};

export const isDateAfter = (laterDate: string, earlierDate: string): boolean => {
  if (!isValidDate(laterDate) || !isValidDate(earlierDate)) return false;
  
  const date1 = new Date(laterDate);
  const date2 = new Date(earlierDate);
  
  return date1 > date2;
};

export const isContractCodeUnique = async (code: string): Promise<boolean> => {
  // Mock implementation - should be replaced with actual API call
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate checking code against existing contracts
      const existingCodes = ['CTR001-2023', 'CTR002-2023', 'CTR003-2023'];
      resolve(!existingCodes.includes(code));
    }, 300);
  });
};

export const validateMinDateGap = (dates: string[], minGapDays: number): boolean => {
  if (dates.length <= 1) return true;
  
  // Sắp xếp các ngày theo thứ tự tăng dần
  const sortedDates = [...dates].filter(date => isValidDate(date)).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  
  // Kiểm tra khoảng cách giữa các ngày liên tiếp
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = new Date(sortedDates[i]);
    const nextDate = new Date(sortedDates[i + 1]);
    
    const diffTime = Math.abs(nextDate.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < minGapDays) {
      return false;
    }
  }
  
  return true;
};

export const hasDuplicateDates = (dates: string[]): boolean => {
  const validDates = dates.filter(date => isValidDate(date));
  const dateMap = new Map();
  
  for (const date of validDates) {
    // Chuẩn hóa định dạng ngày để so sánh
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    
    if (dateMap.has(normalizedDate)) {
      return true;
    } else {
      dateMap.set(normalizedDate, true);
    }
  }
  
  return false;
};

export const hasDuplicateValues = (values: string[]): boolean => {
  const uniqueValues = new Set(values.filter(Boolean));
  return uniqueValues.size !== values.filter(Boolean).length;
};

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculatePercentage = (amount: number, totalAmount: number): number => {
  if (totalAmount === 0) return 0;
  return Math.round((amount / totalAmount) * 100 * 100) / 100; // Round to 2 decimal places
};

export const sanitizeFileName = (fileName: string): string => {
  // Thay thế các ký tự không hợp lệ bằng dấu gạch dưới
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}; 