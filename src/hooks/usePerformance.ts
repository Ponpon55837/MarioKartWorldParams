import { useRef, useCallback, useMemo } from "react";
import { debounce, throttle, memoize, deepEqual } from "@/utils/performance";

/**
 * 防抖 Hook
 * @param callback 要防抖的回調函數
 * @param delay 防抖延遲時間
 * @returns 防抖後的回調函數
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(
    () =>
      debounce((...args: Parameters<T>) => callbackRef.current(...args), delay),
    [delay],
  ) as T;
}

/**
 * 節流 Hook
 * @param callback 要節流的回調函數
 * @param limit 節流間隔時間
 * @returns 節流後的回調函數
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(
    () =>
      throttle((...args: Parameters<T>) => callbackRef.current(...args), limit),
    [limit],
  ) as T;
}

/**
 * 記憶化 Hook
 * @param fn 要記憶化的函數
 * @returns 記憶化後的函數
 */
export function useMemoize<T extends (...args: any[]) => any>(fn: T): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useMemo(
    () => memoize((...args: Parameters<T>) => fnRef.current(...args)),
    [],
  ) as T;
}

/**
 * 深度比較 Hook
 * @param value 要比較的值
 * @returns 深度比較後的穩定值
 */
export function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value);

  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * 穩定化回調 Hook
 * @param callback 回調函數
 * @param deps 依賴項
 * @returns 穩定的回調函數
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: unknown[],
): T {
  const callbackRef = useRef(callback);
  const stableDeps = useDeepMemo(deps);

  // 更新回調引用當依賴變化時
  callbackRef.current = callback;

  return useCallback(
    (...args: Parameters<T>) => callbackRef.current(...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stableDeps],
  ) as T;
}
