import { useEffect, useMemo, useRef } from "react";
import { debounce, type DebouncedFunction } from "@/utils/performance";

/**
 * 防抖 Hook
 * - 回傳的函數在元件生命週期內保持穩定
 * - 永遠呼叫最新的 callback（不會讀到過期的閉包）
 * - 元件卸載時自動取消尚未執行的呼叫
 *
 * @param callback 要防抖的回調函數
 * @param delay 防抖延遲時間（毫秒）
 */
export function useDebounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): DebouncedFunction<Args> {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debounced = useMemo(
    () => debounce((...args: Args) => callbackRef.current(...args), delay),
    [delay],
  );

  useEffect(() => debounced.cancel, [debounced]);

  return debounced;
}
