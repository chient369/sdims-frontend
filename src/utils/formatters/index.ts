/**
 * Định dạng số thành định dạng tiền tệ
 * @param value Giá trị cần định dạng
 * @param currency Đơn vị tiền tệ (mặc định: VND)
 * @returns Chuỗi đã định dạng theo tiền tệ
 */
export const formatCurrency = (value: number, currency: string = 'VND'): string => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(value);
};

/**
 * Định dạng ngày tháng từ string ISO thành định dạng dễ đọc
 * @param dateString Chuỗi ngày tháng dạng ISO
 * @param includeTime Có hiển thị thời gian hay không
 * @returns Chuỗi ngày tháng đã định dạng (DD/MM/YYYY)
 */
export const formatDate = (dateString: string, includeTime: boolean = false): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };
  
  return new Intl.DateTimeFormat('vi-VN', options).format(date);
};

/**
 * Định dạng phần trăm
 * @param value Giá trị cần định dạng
 * @returns Chuỗi đã định dạng theo phần trăm
 */
export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
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
