// 重試機制型別定義
export interface FetchOptions {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  method?: string;
  body?: string;
  signal?: AbortSignal;
}

// 帶重試機制的 fetch 函數
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const {
    timeout = 10000,
    maxRetries = 3,
    retryDelay = 1000,
    headers = {},
    method = "GET",
    body,
    signal,
    ...fetchOptions
  } = options;

  let lastError: Error;

  // 建立超時控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // 如果有外部 signal，則與內部 controller 連動
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 如果是 4xx 錯誤，不重試
    if (response.status >= 400 && response.status < 500) {
      return response;
    }

    // 如果是 5xx 錯誤或網路錯誤，進行重試
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    lastError = error instanceof Error ? error : new Error("Unknown error");

    // 如果是客戶端錯誤 (4xx) 或被取消，不重試
    if (lastError.name === "AbortError") {
      throw lastError;
    }
  }

  // 重試邏輯
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // 等待重試延遲
    await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error("Unknown error");

      // 如果是客戶端錯誤或被取消，停止重試
      if (lastError.name === "AbortError") {
        throw lastError;
      }

      // 如果是最後一次重試，拋出錯誤
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }

  throw lastError;
}
