import { useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Hook để hiển thị thông báo (toast) trong ứng dụng
 * Trong trường hợp thực tế sẽ kết nối với thư viện toast hoặc context
 */
export const useToast = () => {
  /**
   * Hiển thị một thông báo
   * @param options - Các tùy chọn cho thông báo
   */
  const showToast = useCallback((options: ToastOptions) => {
    const { title, message, type = 'info', duration = 3000 } = options;
    
    // Log thông báo vào console (trong môi trường thực tế sẽ sử dụng thư viện toast)
    console.log(`Toast [${type}]: ${title} - ${message}`);
    
    // Giả lập hiển thị toast
    const toastElement = document.createElement('div');
    toastElement.className = `toast toast-${type}`;
    toastElement.style.position = 'fixed';
    toastElement.style.bottom = '20px';
    toastElement.style.right = '20px';
    toastElement.style.padding = '10px 20px';
    toastElement.style.borderRadius = '4px';
    toastElement.style.backgroundColor = getToastColor(type);
    toastElement.style.color = '#fff';
    toastElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    toastElement.style.zIndex = '1000';
    toastElement.style.minWidth = '250px';
    
    const titleElement = document.createElement('div');
    titleElement.style.fontWeight = 'bold';
    titleElement.style.marginBottom = '4px';
    titleElement.textContent = title;
    
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    
    toastElement.appendChild(titleElement);
    toastElement.appendChild(messageElement);
    
    document.body.appendChild(toastElement);
    
    // Xóa sau khi hiển thị xong
    setTimeout(() => {
      if (document.body.contains(toastElement)) {
        document.body.removeChild(toastElement);
      }
    }, duration);
  }, []);
  
  return { showToast };
};

/**
 * Lấy màu cho toast dựa vào loại
 * @param type - Loại toast
 * @returns Mã màu CSS
 */
const getToastColor = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '#10B981'; // green-500
    case 'error':
      return '#EF4444'; // red-500
    case 'warning':
      return '#F59E0B'; // amber-500
    case 'info':
    default:
      return '#3B82F6'; // blue-500
  }
}; 