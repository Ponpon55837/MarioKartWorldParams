import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useCallback } from "react";
import {
  loadingAtom,
  errorAtom,
  charactersAtom,
  vehiclesAtom,
  loadDataAtom,
  sortByAtom,
  speedFilterAtom,
  handlingFilterAtom,
  currentPageAtom,
} from "@/store/dataAtoms";
import { combinationsAtom } from "@/store/combinations";
import { useClientMounted } from "@/hooks/useClientMounted";

/**
 * 瑪利歐賽車頁面層級狀態 Hook
 *
 * 只訂閱頁面框架需要的狀態（載入、錯誤、篩選器與數量），
 * 排序後列表、最大值等由各個 View 自行訂閱對應 atom。
 * 如此一來，排序或篩選變更時只有實際顯示的 View 會重新計算與渲染，
 * 隱藏頁面的衍生 atom 也不會被計算。
 */
export function useMarioKartStore() {
  const mounted = useClientMounted();

  const loading = useAtomValue(loadingAtom);
  const error = useAtomValue(errorAtom);
  const charactersCount = useAtomValue(charactersAtom).length;
  const vehiclesCount = useAtomValue(vehiclesAtom).length;
  const combinations = useAtomValue(combinationsAtom);

  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const [speedFilter, setSpeedFilter] = useAtom(speedFilterAtom);
  const [handlingFilter, setHandlingFilter] = useAtom(handlingFilterAtom);
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);

  const loadData = useSetAtom(loadDataAtom);

  // 初始化時載入資料（重複呼叫會共用進行中的請求）
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 強制重新載入資料（例如資料同步後）
  const reloadData = useCallback(() => loadData({ force: true }), [loadData]);

  return {
    loading,
    error,
    charactersCount,
    vehiclesCount,
    // 在伺服器端時回傳 0 以避免水合不一致
    combinationsCount: mounted ? combinations.length : 0,

    sortBy,
    setSortBy,
    speedFilter,
    setSpeedFilter,
    handlingFilter,
    setHandlingFilter,
    currentPage,
    setCurrentPage,

    reloadData,
  };
}
