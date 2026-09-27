import { atom, type Atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type {
  CharacterStats,
  VehicleStats,
  CombinationStats,
  StatType,
  SpeedFilter,
  HandlingFilter,
  PageType,
  MarioKartData,
  SearchResultItem,
  ThemeMode,
  ThemeState,
} from "@/types";
import { parseMarioKartCSV } from "@/utils/csvParser";
import { validateMarioKartData } from "@/utils/dataValidation";
import {
  combineStats,
  computeFieldMaxima,
  getSortKey,
  pickSummaryMax,
  sortByStatDesc,
} from "@/utils/stats";
import { computeRecommendations } from "@/utils/recommendation";
import { buildSearchIndex } from "@/utils/search";
import { combinationsAtom } from "@/store/combinations";

// 資料載入狀態 atom
export const loadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);

// 原始資料 atoms (不需要持久化，每次啟動重新載入)
export const charactersAtom = atom<CharacterStats[]>([]);
export const vehiclesAtom = atom<VehicleStats[]>([]);

// 過濾和排序狀態 atoms (會話級別，不需要持久化)
export const sortByAtom = atom<StatType>("speed");
export const speedFilterAtom = atom<SpeedFilter>("display");
export const handlingFilterAtom = atom<HandlingFilter>("display");
export const currentPageAtom = atom<PageType>("characters");

export const searchModalOpenAtom = atom<boolean>(false);
export const searchQueryAtom = atom<string>("");
export const searchResultsAtom = atom<SearchResultItem[]>([]);
export const searchLoadingAtom = atom<boolean>(false);
export const searchHistoryVisibleAtom = atom<boolean>(false);

// 語系相關 atoms
export type SupportedLanguage = "zh-TW" | "zh-CN" | "en" | "ja" | "ko";

// 語系選擇 atom (自動持久化到 localStorage)
export const languageAtom = atomWithStorage<SupportedLanguage>(
  "mario-kart-language",
  "zh-TW",
);

// ==========================================
// 衍生 Atoms（Jotai 依依賴自動快取，依賴不變時不重算）
// ==========================================

/**
 * 角色與載具每個欄位的最大值
 * 單次走訪 O(n·k)，僅在原始資料變更時重算
 */
export const fieldMaximaAtom = atom((get) =>
  computeFieldMaxima(get(charactersAtom), get(vehiclesAtom)),
);

/**
 * 四大能力值的全域最大值（不隨篩選器變動）
 */
export const maxStatsAtom = atom((get) => {
  const maxima = get(fieldMaximaAtom);
  return {
    speed: Math.max(
      maxima.displaySpeed,
      maxima.roadSpeed,
      maxima.terrainSpeed,
      maxima.waterSpeed,
    ),
    acceleration: maxima.acceleration,
    weight: maxima.weight,
    handling: Math.max(
      maxima.displayHandling,
      maxima.roadHandling,
      maxima.terrainHandling,
      maxima.waterHandling,
    ),
    _internal: maxima,
  };
});

/**
 * 依目前篩選器取得的最大值（O(1) 查表）
 */
export const dynamicMaxStatsAtom = atom((get) =>
  pickSummaryMax(
    get(fieldMaximaAtom),
    get(speedFilterAtom),
    get(handlingFilterAtom),
  ),
);

/** 目前排序使用的欄位 */
const sortKeyAtom = atom((get) =>
  getSortKey(get(sortByAtom), get(speedFilterAtom), get(handlingFilterAtom)),
);

const createSortedEntitiesAtom = <T extends CharacterStats | VehicleStats>(
  entitiesAtom: Atom<T[]>,
) => atom((get): T[] => sortByStatDesc(get(entitiesAtom), get(sortKeyAtom)));

/** 排序後的角色列表：根據當前排序設定和篩選器自動更新 */
export const sortedCharactersAtom = createSortedEntitiesAtom(charactersAtom);

/** 排序後的載具列表：根據當前排序設定和篩選器自動更新 */
export const sortedVehiclesAtom = createSortedEntitiesAtom(vehiclesAtom);

/** 搜尋索引：預先轉小寫，資料變更時才重建 */
export const searchIndexAtom = atom((get) =>
  buildSearchIndex(get(charactersAtom), get(vehiclesAtom)),
);

/**
 * 推薦組合（三種地形）
 * 使用 K 路合併演算法，詳見 utils/recommendation.ts
 */
export const recommendedCombinationsAtom = atom((get) =>
  computeRecommendations(get(charactersAtom), get(vehiclesAtom)),
);

// ==========================================
// 資料載入
// ==========================================

// 日誌輔助函數
const logDev = (message: string, ...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message, ...args);
  }
};

const logDevError = (message: string, ...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.error(message, ...args);
  }
};

// JSON 資料載入器
const loadJSONData = async (init?: RequestInit): Promise<MarioKartData> => {
  logDev("🚀 嘗試載入 JSON 格式資料...");

  const jsonResponse = await fetch("/mario-kart-data.json", init);
  if (!jsonResponse.ok) {
    throw new Error(`JSON 檔案回應錯誤: ${jsonResponse.status}`);
  }

  const jsonData = await jsonResponse.json();
  if (!jsonData.data?.characters || !jsonData.data?.vehicles) {
    throw new Error("JSON 資料格式不正確");
  }

  logDev("📊 資料版本:", jsonData.version, "🕐 最後更新:", jsonData.lastUpdate);
  return jsonData.data;
};

// CSV 資料載入器（JSON 失敗時的備援）
const loadCSVData = async (init?: RequestInit): Promise<MarioKartData> => {
  const csvResponse = await fetch("/mario-kart-data.csv", init);
  if (!csvResponse.ok) {
    throw new Error(`CSV 檔案也無法載入: ${csvResponse.status}`);
  }
  return parseMarioKartCSV(await csvResponse.text());
};

// 優先嘗試 JSON，失敗則回退到 CSV，最後驗證資料
const fetchMarioKartData = async (force: boolean): Promise<MarioKartData> => {
  // 強制重新載入時略過瀏覽器快取
  const init: RequestInit | undefined = force
    ? { cache: "no-store" }
    : undefined;

  let data: MarioKartData;
  try {
    data = await loadJSONData(init);
  } catch (jsonError) {
    logDev("⚠️ JSON 載入失敗，回退到 CSV 格式:", jsonError);
    data = await loadCSVData(init);
  }

  const validation = validateMarioKartData(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.slice(0, 3).join("；"));
  }
  if (validation.warnings.length > 0) {
    logDev("⚠️ 資料驗證警告:", validation.warnings);
  }

  logDev(
    `✅ 資料載入完成：${data.characters.length} 個角色，${data.vehicles.length} 個載具`,
  );
  return data;
};

/**
 * 進行中的請求（In-flight Deduplication）
 * 多個元件同時觸發載入時共用同一個 Promise，避免重複請求
 */
let inflightRequest: Promise<MarioKartData> | null = null;

/**
 * 資料載入 action atom
 * @param options.force 為 true 時忽略既有資料與快取，強制重新載入（例如同步後）
 */
export const loadDataAtom = atom(
  null,
  async (get, set, options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    const hasValidData =
      get(charactersAtom).length > 0 &&
      get(vehiclesAtom).length > 0 &&
      !get(errorAtom);

    if (hasValidData && !force) {
      logDev("資料已存在，跳過載入");
      return;
    }

    // 強制載入時不共用舊請求，確保取得最新資料
    const isOwner = force || inflightRequest === null;
    const request = isOwner ? fetchMarioKartData(force) : inflightRequest!;
    if (isOwner) inflightRequest = request;

    if (isOwner) {
      set(loadingAtom, true);
      set(errorAtom, null);
    }

    try {
      const data = await request;
      set(charactersAtom, data.characters);
      set(vehiclesAtom, data.vehicles);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "載入資料時發生未知錯誤";
      logDevError("❌ 載入資料錯誤:", error);
      set(errorAtom, errorMessage);
    } finally {
      if (isOwner) {
        if (inflightRequest === request) inflightRequest = null;
        set(loadingAtom, false);
      }
    }
  },
);

// ==========================================
// 組合管理
// ==========================================

// 新增組合 action atom
export const addCombinationAtom = atom(
  null,
  (
    get,
    set,
    {
      character,
      vehicle,
    }: { character: CharacterStats; vehicle: VehicleStats },
  ) => {
    const newCombination: CombinationStats = {
      id: `${character.name}-${vehicle.name}-${Date.now()}`,
      character,
      vehicle,
      combinedStats: combineStats(character, vehicle),
    };

    set(combinationsAtom, [...get(combinationsAtom), newCombination]);
  },
);

// 移除組合 action atom
export const removeCombinationAtom = atom(null, (get, set, id: string) => {
  set(
    combinationsAtom,
    get(combinationsAtom).filter((combo) => combo.id !== id),
  );
});

// 清除所有組合 action atom
export const clearAllCombinationsAtom = atom(null, (_get, set) => {
  set(combinationsAtom, []);
});

// ==========================================
// 主題系統
// ==========================================

// 主題模式偏好設定（持久化到 localStorage）
export const themeModeAtom = atomWithStorage<ThemeMode>(
  "mario-kart-theme",
  "light",
);

// 主題狀態
export const themeStateAtom = atom<ThemeState>((get) => {
  const mode = get(themeModeAtom);

  return {
    mode,
  };
});

// 主題切換動作
export const toggleThemeAtom = atom(null, (get, set, newMode?: ThemeMode) => {
  const currentMode = get(themeModeAtom);

  // 如果沒有指定新模式，就切換
  const nextMode: ThemeMode =
    newMode ?? (currentMode === "light" ? "dark" : "light");

  set(themeModeAtom, nextMode);
});
