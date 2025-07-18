import { CharacterStats, VehicleStats, MarioKartData } from '@/types';

// 簡易 CSV 解析器
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

export const parseMarioKartCSV = (csvContent: string): MarioKartData => {
  const rows = parseCSV(csvContent);
  
  const characters: CharacterStats[] = [];
  const vehicles: VehicleStats[] = [];
  
  // 跳過前兩行標題，從第3行開始解析
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    
    // 跳過空行或只有標記符號的行
    if (!row || row.length < 2 || !row[1] || row[1].trim() === '') {
      continue;
    }
    
    // 如果這是解析說明行或包含特殊標記，跳過
    if (row[1]?.includes('能力值解析') || row[1]?.includes('重要說明') || 
        row[1]?.includes('能力值顯示不一致') || row[1]?.includes('未知的速度') ||
        row[1]?.includes('¹') || row[1]?.includes('²') || row[1]?.includes('³')) {
      continue;
    }
    
    // 解析角色資料 (列 1-14)
    if (row[1] && row[2] && row[1] !== '車輛') {
      const character: CharacterStats = {
        name: row[1],
        englishName: row[2] || row[1],
        displaySpeed: parseInt(row[3]) || 0,
        roadSpeed: parseInt(row[4]) || 0,
        terrainSpeed: parseInt(row[5]) || 0,
        waterSpeed: parseInt(row[6]) || 0,
        unknownSpeed: parseInt(row[7]) || 0,
        acceleration: parseInt(row[8]) || 0,
        weight: parseInt(row[9]) || 0,
        displayHandling: parseInt(row[10]) || 0,
        roadHandling: parseInt(row[11]) || 0,
        terrainHandling: parseInt(row[12]) || 0,
        waterHandling: parseInt(row[13]) || 0,
        unknownHandling: parseInt(row[14]) || 0,
      };
      characters.push(character);
    }
    
    // 解析載具資料 (列 17-30)
    if (row[17] && row[18]) {
      const vehicle: VehicleStats = {
        name: row[17],
        englishName: row[18] || row[17],
        displaySpeed: parseInt(row[19]) || 0,
        roadSpeed: parseInt(row[20]) || 0,
        terrainSpeed: parseInt(row[21]) || 0,
        waterSpeed: parseInt(row[22]) || 0,
        unknownSpeed: parseInt(row[23]) || 0,
        acceleration: parseInt(row[24]) || 0,
        weight: parseInt(row[25]) || 0,
        displayHandling: parseInt(row[26]) || 0,
        roadHandling: parseInt(row[27]) || 0,
        terrainHandling: parseInt(row[28]) || 0,
        waterHandling: parseInt(row[29]) || 0,
        unknownHandling: parseInt(row[30]) || 0,
      };
      vehicles.push(vehicle);
    }
  }
  
  console.log('Parsed characters:', characters.length);
  console.log('Parsed vehicles:', vehicles.length);
  
  return { characters, vehicles };
};

export const getStatColor = (value: number, maxValue: number): string => {
  const percentage = value / maxValue;
  if (percentage >= 0.8) return 'bg-green-500';
  if (percentage >= 0.6) return 'bg-yellow-500';
  if (percentage >= 0.4) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getStatBarWidth = (value: number, maxValue: number): string => {
  const percentage = Math.round((value / maxValue) * 100);
  return `${Math.max(percentage, 5)}%`; // 最小寬度 5%
};
