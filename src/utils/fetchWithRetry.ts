import { fetchWithRetry, type FetchOptions } from "./retryFetch";

// 資料獲取配置
const DATA_FETCH_CONFIG = {
  timeout: 10000, // 10秒超時
  maxRetries: 3,
  retryDelay: 1000, // 1秒延遲
};

// API 端點
const API_ENDPOINTS = {
  MARIO_KART_DATA: "/api/mario-kart-data",
  SYNC_DATA: "/api/sync-data",
} as const;

// 錯誤類型
export class DataFetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "DataFetchError";
  }
}

export class DataTimeoutError extends DataFetchError {
  constructor(message: string) {
    super(message);
    this.name = "DataTimeoutError";
    this.code = "TIMEOUT";
  }
}

export class DataValidationError extends DataFetchError {
  constructor(message: string) {
    super(message);
    this.name = "DataValidationError";
    this.code = "VALIDATION_ERROR";
  }
}

// 預設的獲取選項
const defaultFetchOptions: Partial<FetchOptions> = {
  timeout: DATA_FETCH_CONFIG.timeout,
  maxRetries: DATA_FETCH_CONFIG.maxRetries,
  retryDelay: DATA_FETCH_CONFIG.retryDelay,
  headers: {
    "Content-Type": "application/json",
  },
};

// 安全的 fetch 包裝器
export async function safeFetch<T>(
  url: string,
  options: Partial<FetchOptions> = {},
): Promise<T> {
  try {
    const mergedOptions = { ...defaultFetchOptions, ...options };
    const response = await fetchWithRetry(url, mergedOptions);

    if (!response.ok) {
      throw new DataFetchError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
      );
    }

    const data = await response.json();

    // 驗證回應資料
    if (data === null || data === undefined) {
      throw new DataValidationError("回應資料為空");
    }

    return data as T;
  } catch (error) {
    if (error instanceof DataFetchError) {
      throw error;
    }

    // 處理網路錯誤
    if (error instanceof TypeError) {
      throw new DataFetchError("網路連線失敗", 0, "NETWORK_ERROR");
    }

    // 處理超時錯誤
    if (error instanceof Error && error.name === "AbortError") {
      throw new DataTimeoutError("請求超時，請檢查網路連線");
    }

    // 未知錯誤
    throw new DataFetchError(
      `未預期的錯誤: ${error instanceof Error ? error.message : "未知錯誤"}`,
      0,
      "UNKNOWN_ERROR",
    );
  }
}

// 獲取瑪利歐賽車資料
export async function fetchMarioKartData() {
  return safeFetch(API_ENDPOINTS.MARIO_KART_DATA, {
    method: "GET",
  });
}

// 同步資料
export async function syncData(csvData?: string) {
  const options: Partial<FetchOptions> = {
    method: "POST",
    body: csvData ? JSON.stringify({ csvData }) : undefined,
  };

  return safeFetch(API_ENDPOINTS.SYNC_DATA, options);
}

// 獲取資料狀態
export async function fetchDataStatus() {
  return safeFetch("/api/data-status", {
    method: "GET",
  });
}

// 錯誤處理工具
export function handleDataError(error: unknown): string {
  if (error instanceof DataTimeoutError) {
    return "請求超時，請檢查網路連線後重試";
  }

  if (error instanceof DataValidationError) {
    return "資料格式錯誤，請聯繫管理員";
  }

  if (error instanceof DataFetchError) {
    switch (error.code) {
      case "NETWORK_ERROR":
        return "網路連線失敗，請檢查網路設定";
      case "VALIDATION_ERROR":
        return "資料驗證失敗，請確認資料格式";
      default:
        if (error.status) {
          return `伺服器錯誤 (${error.status})，請稍後重試`;
        }
        return error.message || "發生未知錯誤";
    }
  }

  return "發生未預期的錯誤，請稍後重試";
}

// 重試機制配置
export function createRetryConfig(
  customConfig?: Partial<typeof DATA_FETCH_CONFIG>,
) {
  return {
    ...DATA_FETCH_CONFIG,
    ...customConfig,
  };
}

// 健康檢查
export async function performHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch("/api/health", {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5秒超時
    });
    return response.ok;
  } catch {
    return false;
  }
}
