import type {
  CharacterStats,
  MarioKartData,
  StatKey,
  VehicleStats,
} from "@/types";

/**
 * 單行 CSV 解析（雙指標掃描）
 *
 * - 以 start 指標記錄欄位起點，遇到分隔逗號時一次 slice，避免逐字元字串串接
 * - 支援以雙引號包住的欄位，以及欄位內以 "" 表示的跳脫引號
 * - 時間 O(n)，n 為該行長度
 */
export const parseCSVLine = (line: string): string[] => {
  const fields: string[] = [];
  const length = line.length;
  let i = 0;

  while (i <= length) {
    if (line[i] === '"') {
      // 引號欄位：掃描到對應的結尾引號
      let value = "";
      let start = ++i;
      while (i < length) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') {
            value += line.slice(start, i + 1);
            i += 2;
            start = i;
            continue;
          }
          break;
        }
        i++;
      }
      value += line.slice(start, i);
      i++; // 略過結尾引號

      // 結尾引號與逗號之間的多餘字元一併保留
      const next = line.indexOf(",", i);
      const end = next === -1 ? length : next;
      fields.push((value + line.slice(i, end)).trim());
      i = end + 1;
    } else {
      const next = line.indexOf(",", i);
      const end = next === -1 ? length : next;
      fields.push(line.slice(i, end).trim());
      i = end + 1;
    }
  }

  return fields;
};

/**
 * 解析整份 CSV 內容，支援 LF 與 CRLF 換行
 */
export const parseCSV = (csvContent: string): string[][] =>
  csvContent.split(/\r?\n/).map(parseCSVLine);

// ==========================================
// 欄位對應表
// ==========================================

/** 能力值欄位相對於名稱欄的偏移量（第 +5 欄為「未知」欄位，略過） */
const STAT_COLUMN_OFFSETS: ReadonlyArray<readonly [StatKey, number]> = [
  ["displaySpeed", 2],
  ["roadSpeed", 3],
  ["terrainSpeed", 4],
  ["waterSpeed", 5],
  ["acceleration", 7],
  ["weight", 8],
  ["displayHandling", 9],
  ["roadHandling", 10],
  ["terrainHandling", 11],
  ["waterHandling", 12],
];

/** 角色區塊的名稱欄位索引 */
const CHARACTER_NAME_COLUMN = 1;
/** 載具區塊的名稱欄位索引 */
const VEHICLE_NAME_COLUMN = 17;
/** 前兩行為標題 */
const HEADER_ROWS = 2;

/** 說明行與註解行的特徵 */
const NOTE_PATTERN = /能力值解析|重要說明|能力值顯示不一致|[¹²³]/;

const toInt = (value: string | undefined): number => parseInt(value ?? "") || 0;

/**
 * 從指定起始欄位讀出一個實體（角色或載具）
 */
const readEntity = (row: string[], nameColumn: number): CharacterStats => {
  const name = row[nameColumn];
  const entity = {
    name,
    englishName: row[nameColumn + 1] || name,
  } as CharacterStats;

  for (const [key, offset] of STAT_COLUMN_OFFSETS) {
    entity[key] = toInt(row[nameColumn + offset]);
  }
  return entity;
};

/**
 * 解析瑪利歐賽車 CSV 資料
 * 同一列左半部為角色、右半部為載具，單次走訪即可同時取出兩者。
 *
 * @example
 * ```typescript
 * const csvData = await fetch("/mario-kart-data.csv").then((r) => r.text());
 * const { characters, vehicles } = parseMarioKartCSV(csvData);
 * ```
 */
export const parseMarioKartCSV = (csvContent: string): MarioKartData => {
  const rows = parseCSV(csvContent);
  const characters: CharacterStats[] = [];
  const vehicles: VehicleStats[] = [];

  for (let i = HEADER_ROWS; i < rows.length; i++) {
    const row = rows[i];
    const characterName = row[CHARACTER_NAME_COLUMN];

    // 跳過空行、說明行與註解行
    if (row.length < 2 || !characterName || NOTE_PATTERN.test(characterName)) {
      continue;
    }

    if (row[CHARACTER_NAME_COLUMN + 1] && characterName !== "車輛") {
      characters.push(readEntity(row, CHARACTER_NAME_COLUMN));
    }

    if (row[VEHICLE_NAME_COLUMN] && row[VEHICLE_NAME_COLUMN + 1]) {
      vehicles.push(readEntity(row, VEHICLE_NAME_COLUMN));
    }
  }

  return { characters, vehicles };
};
