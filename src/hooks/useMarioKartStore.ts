import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import {
  currentPageAtom,
  errorAtom,
  loadDataAtom,
  loadingAtom,
} from "@/store/dataAtoms";

/**
 * 瑪利歐賽車頁面層級狀態 Hook
 *
 * 只訂閱頁面框架需要的狀態（載入、錯誤、目前頁面），
 * 列表、分組與篩選由各個 View 自行訂閱對應 atom，
 * 切換篩選時只有實際顯示的 View 會重新計算與渲染。
 */
export function useMarioKartStore() {
  const loading = useAtomValue(loadingAtom);
  const error = useAtomValue(errorAtom);
  const currentPage = useAtomValue(currentPageAtom);
  const loadData = useSetAtom(loadDataAtom);

  // 初始化時載入資料（重複呼叫會共用進行中的請求）
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 強制重新載入資料（例如資料同步後）
  const reloadData = useCallback(() => loadData({ force: true }), [loadData]);

  return { loading, error, currentPage, reloadData };
}
