/**
 * 效能優化工具函數
 */

/** 可取消的防抖函數 */
export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  /** 取消尚未執行的呼叫 */
  cancel: () => void;
}

/**
 * 防抖函數：連續呼叫時只在最後一次呼叫後 wait 毫秒執行
 * @param func 要防抖的函數
 * @param wait 等待時間（毫秒）
 * @returns 防抖後的函數（附帶 cancel）
 */
export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number,
): DebouncedFunction<Args> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}
