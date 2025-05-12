/**
 * Định dạng số thành định dạng tiền tệ
 * @param value Giá trị cần định dạng
 * @param locale Locale để định dạng (mặc định: vi-VN)
 * @param currency Đơn vị tiền tệ (mặc định: VND)
 * @returns Chuỗi đã định dạng
 */
export const formatCurrency = (value: number, locale = 'vi-VN', currency = 'VND'): string => {
  if (isNaN(value)) return '0 ₫';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Định dạng ngày tháng từ string ISO thành định dạng dễ đọc
 * @param dateStr Chuỗi ngày đầu vào (định dạng: YYYY-MM-DD)
 * @returns Chuỗi ngày đã định dạng
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateStr;
  }
};

/**
 * Định dạng phần trăm
 * @param value Giá trị phần trăm cần format
 * @param decimals Số chữ số thập phân (mặc định: 2)
 * @returns Chuỗi đã định dạng
 */
export const formatPercent = (value: number, decimals = 2): string => {
  if (isNaN(value)) return '0%';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Rút gọn văn bản nếu quá dài
 * @param text Văn bản cần rút gọn
 * @param maxLength Độ dài tối đa (mặc định: 50)
 * @returns Văn bản đã rút gọn
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Định dạng kích thước file từ byte sang dạng dễ đọc
 * @param bytes Kích thước theo byte
 * @param decimals Số chữ số thập phân
 * @returns Chuỗi kích thước đã định dạng
 */
export const formatFileSize = (bytes: number, decimals: number = 1): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}; 