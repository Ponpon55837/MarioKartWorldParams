import { CharacterStats, VehicleStats, MarioKartData } from '@/types';

/**
 * 簡易 CSV 解析器
 * 處理包含引號的 CSV 格式
 */
const parseCSV = (csvContent: string): string[][] => {
  const lines = csvContent.split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
};

/**
 * 解析瑪利歐賽車 CSV 數據
 * @param csvContent CSV 文件內容
 * @returns 解析後的角色和載具數據
 */
export const parseMarioKartCSV = (csvContent: string): MarioKartData => {
  const rows = parseCSV(csvContent);
  
  const characters: CharacterStats[] = [];
  const vehicles: VehicleStats[] = [];
  
  // 跳過前兩行標題，從第3行開始解析
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    
    // 跳過空行或無效行
    if (!row || row.length < 2 || !row[1]?.trim()) {
      continue;
    }
    
    // 跳過說明行和註解行
    const cellContent = row[1];
    if (cellContent.includes('能力值解析') || 
        cellContent.includes('重要說明') || 
        cellContent.includes('能力值顯示不一致') || 
        /[¹²³]/.test(cellContent)) {
      continue;
    }
    
    // 解析角色資料 (列 1-12)
    if (row[1] && row[2] && row[1] !== '車輛') {
      const character: CharacterStats = {
        name: row[1],
        englishName: row[2] || row[1],
        displaySpeed: parseInt(row[3]) || 0,
        roadSpeed: parseInt(row[4]) || 0,
        terrainSpeed: parseInt(row[5]) || 0,
        waterSpeed: parseInt(row[6]) || 0,
        acceleration: parseInt(row[8]) || 0,
        weight: parseInt(row[9]) || 0,
        displayHandling: parseInt(row[10]) || 0,
        roadHandling: parseInt(row[11]) || 0,
        terrainHandling: parseInt(row[12]) || 0,
        waterHandling: parseInt(row[13]) || 0,
      };
      characters.push(character);
    }
    
    // 解析載具資料 (列 17-28)
    if (row[17] && row[18]) {
      const vehicle: VehicleStats = {
        name: row[17],
        englishName: row[18] || row[17],
        displaySpeed: parseInt(row[19]) || 0,
        roadSpeed: parseInt(row[20]) || 0,
        terrainSpeed: parseInt(row[21]) || 0,
        waterSpeed: parseInt(row[22]) || 0,
        acceleration: parseInt(row[24]) || 0,
        weight: parseInt(row[25]) || 0,
        displayHandling: parseInt(row[26]) || 0,
        roadHandling: parseInt(row[27]) || 0,
        terrainHandling: parseInt(row[28]) || 0,
        waterHandling: parseInt(row[29]) || 0,
      };
      vehicles.push(vehicle);
    }
  }
  
  console.log(`✅ 解析完成 - 角色: ${characters.length}, 載具: ${vehicles.length}`);
  
  return { characters, vehicles };
};

/**
 * 根據數值計算對應的顏色類別
 * @param value 當前值
 * @param maxValue 最大值
 * @returns Tailwind CSS 背景色類別
 */
export const getStatColor = (value: number, maxValue: number): string => {
  const percentage = value / maxValue;
  if (percentage >= 0.8) return 'bg-green-500';
  if (percentage >= 0.6) return 'bg-yellow-500';
  if (percentage >= 0.4) return 'bg-orange-500';
  return 'bg-red-500';
};

/**
 * 計算統計條的寬度百分比
 * @param value 當前值
 * @param maxValue 最大值
 * @returns 寬度百分比字符串
 */
export const getStatBarWidth = (value: number, maxValue: number): string => {
  const percentage = Math.round((value / maxValue) * 100);
  return `${Math.max(percentage, 5)}%`; // 最小寬度 5%
};
