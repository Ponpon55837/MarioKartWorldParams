import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useCallback } from 'react';
import {
  loadingAtom,
  errorAtom,
  charactersAtom,
  vehiclesAtom,
  loadDataAtom,
  maxStatsAtom,
  dynamicMaxStatsAtom,
  sortedCharactersAtom,
  sortedVehiclesAtom,
  addCombinationAtom,
  removeCombinationAtom,
  clearAllCombinationsAtom,
  sortByAtom,
  speedFilterAtom,
  handlingFilterAtom,
  currentPageAtom,
} from '@/store/dataAtoms';
import { combinationsAtom } from '@/store/combinations';
import { useClientMounted } from '@/hooks/useClientMounted';
import type { CharacterStats, VehicleStats } from '@/types';

/**
 * 瑪利歐賽車資料管理 Hook
 * 使用 Jotai 進行全域狀態管理，包含資料載入、排序、過濾等功能
 */
export function useMarioKartStore() {
  // 客戶端掛載狀態
  const mounted = useClientMounted();
  
  // 基本狀態
  const loading = useAtomValue(loadingAtom);
  const error = useAtomValue(errorAtom);
  const characters = useAtomValue(charactersAtom);
  const vehicles = useAtomValue(vehiclesAtom);
  
  // 計算值
  const maxStats = useAtomValue(dynamicMaxStatsAtom);
  const sortedCharacters = useAtomValue(sortedCharactersAtom);
  const sortedVehicles = useAtomValue(sortedVehiclesAtom);
  
  // 過濾狀態
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const [speedFilter, setSpeedFilter] = useAtom(speedFilterAtom);
  const [handlingFilter, setHandlingFilter] = useAtom(handlingFilterAtom);
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  
  // 組合管理 - 只在客戶端掛載後才讀取
  const [combinations, setCombinations] = useAtom(combinationsAtom);
  const addCombination = useSetAtom(addCombinationAtom);
  const removeCombination = useSetAtom(removeCombinationAtom);
  const clearAllCombinations = useSetAtom(clearAllCombinationsAtom);
  
  // 資料載入
  const loadData = useSetAtom(loadDataAtom);

  // 初始化時載入資料
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 使用 useCallback 優化回調函數
  const handleAddCombination = useCallback((character: CharacterStats, vehicle: VehicleStats) => {
    addCombination({ character, vehicle });
  }, [addCombination]);

  const handleRemoveCombination = useCallback((id: string) => {
    removeCombination(id);
  }, [removeCombination]);

  const handleClearAllCombinations = useCallback(() => {
    clearAllCombinations();
  }, [clearAllCombinations]);

  // 重新載入資料
  const reloadData = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    // 基本狀態
    loading,
    error,
    characters,
    vehicles,
    
    // 計算值
    maxStats,
    sortedCharacters,
    sortedVehicles,
    
    // 過濾狀態
    sortBy,
    setSortBy,
    speedFilter,
    setSpeedFilter,
    handlingFilter,
    setHandlingFilter,
    currentPage,
    setCurrentPage,
    
    // 組合管理 - 在服務器端時返回空數組以避免水化不匹配
    combinations: mounted ? combinations : [],
    addCombination: handleAddCombination,
    removeCombination: handleRemoveCombination,
    clearAllCombinations: handleClearAllCombinations,
    
    // 工具函數
    reloadData,
  };
}

/**
 * 簡化版的 Hook，只提供基本的資料讀取功能
 */
export function useMarioKartData() {
  const loading = useAtomValue(loadingAtom);
  const error = useAtomValue(errorAtom);
  const characters = useAtomValue(charactersAtom);
  const vehicles = useAtomValue(vehiclesAtom);
  const loadData = useSetAtom(loadDataAtom);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    error,
    characters,
    vehicles,
  };
}

/**
 * 只管理過濾和排序狀態的 Hook
 */
export function useFilters() {
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const [speedFilter, setSpeedFilter] = useAtom(speedFilterAtom);
  const [handlingFilter, setHandlingFilter] = useAtom(handlingFilterAtom);
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);

  return {
    sortBy,
    setSortBy,
    speedFilter,
    setSpeedFilter,
    handlingFilter,
    setHandlingFilter,
    currentPage,
    setCurrentPage,
  };
}

/**
 * 只管理組合的 Hook
 */
export function useCombinations() {
  // 客戶端掛載狀態
  const mounted = useClientMounted();
  
  const [combinations, setCombinations] = useAtom(combinationsAtom);
  const addCombination = useSetAtom(addCombinationAtom);
  const removeCombination = useSetAtom(removeCombinationAtom);
  const clearAllCombinations = useSetAtom(clearAllCombinationsAtom);

  const handleAddCombination = (character: CharacterStats, vehicle: VehicleStats) => {
    addCombination({ character, vehicle });
  };

  const handleRemoveCombination = (id: string) => {
    removeCombination(id);
  };

  const handleClearAllCombinations = () => {
    clearAllCombinations();
  };

  return {
    combinations: mounted ? combinations : [], // 在服務器端時返回空數組
    addCombination: handleAddCombination,
    removeCombination: handleRemoveCombination,
    clearAllCombinations: handleClearAllCombinations,
  };
}
