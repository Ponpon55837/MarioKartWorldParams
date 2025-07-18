import { useState, useEffect } from 'react';
import { CharacterStats, VehicleStats } from '@/types';
import { parseMarioKartCSV } from '@/utils/csvParser';
import { ERROR_MESSAGES } from '@/constants';

interface UseMarioKartDataReturn {
  characters: CharacterStats[];
  vehicles: VehicleStats[];
  loading: boolean;
  error: string | null;
}

/**
 * 自定義 Hook 用於載入和管理瑪利歐賽車數據
 */
export const useMarioKartData = (): UseMarioKartDataReturn => {
  const [characters, setCharacters] = useState<CharacterStats[]>([]);
  const [vehicles, setVehicles] = useState<VehicleStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/mario-kart-data.csv');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvContent = await response.text();
        
        if (!csvContent.trim()) {
          throw new Error('CSV 文件為空');
        }
        
        const parsedData = parseMarioKartCSV(csvContent);
        
        if (parsedData.characters.length === 0 && parsedData.vehicles.length === 0) {
          throw new Error('無有效數據');
        }
        
        setCharacters(parsedData.characters);
        setVehicles(parsedData.vehicles);
        
      } catch (fetchError) {
        console.error('載入數據失敗:', fetchError);
        setError(ERROR_MESSAGES.LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { characters, vehicles, loading, error };
};
