/**
 * 效能優化工具函數
 */

/**
 * 簡單的防抖函數
 * @param func 要防抖的函數
 * @param wait 等待時間（毫秒）
 * @returns 防抖後的函數
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * 簡單的節流函數
 * @param func 要節流的函數
 * @param limit 限制間隔（毫秒）
 * @returns 節流後的函數
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 記憶化函數
 * @param fn 要記憶化的函數
 * @returns 記憶化後的函數
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * 批次更新函數
 * @param updates 批次更新的函數數組
 */
export function batchUpdate(updates: (() => void)[]): void {
  // 在下一個事件循環中批次執行更新
  setTimeout(() => {
    updates.forEach((update) => update());
  }, 0);
}

/**
 * 深度比較兩個物件是否相等
 * @param obj1 第一個物件
 * @param obj2 第二個物件
 * @returns 是否相等
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return false;

  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  const keys1 = Object.keys(obj1 as Record<string, unknown>);
  const keys2 = Object.keys(obj2 as Record<string, unknown>);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (
      !deepEqual(
        (obj1 as Record<string, unknown>)[key],
        (obj2 as Record<string, unknown>)[key],
      )
    )
      return false;
  }

  return true;
}
