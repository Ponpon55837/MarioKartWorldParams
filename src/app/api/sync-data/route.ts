import { NextRequest, NextResponse } from "next/server";
import { parseMarioKartCSV } from "@/utils/csvParser";

// Google Sheets CSV 導出 URL
const GOOGLE_SHEETS_CSV_URL = process.env.GOOGLE_SHEETS_CSV_URL || "";

// 驗證同步請求是否包含有效的 secret token
// 本地開發環境（NODE_ENV=development）跳過驗證，方便開發測試
// 生產環境必須在 Authorization header 帶入正確的 Bearer token
function validateSyncToken(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  const SYNC_SECRET_TOKEN = process.env.SYNC_SECRET_TOKEN;
  if (!SYNC_SECRET_TOKEN) {
    // 生產環境未設定 token 時，拒絕所有請求
    console.error("❌ 生產環境未設定 SYNC_SECRET_TOKEN，拒絕同步請求");
    return false;
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice("Bearer ".length).trim();
  return token === SYNC_SECRET_TOKEN;
}

export async function POST(request: NextRequest) {
  // 身份驗證：驗證 Authorization header 中的 Bearer token
  if (!validateSyncToken(request)) {
    return NextResponse.json(
      { success: false, error: "未授權的請求" },
      { status: 401 },
    );
  }

  try {
    console.log("🔄 開始從 Google Sheets 同步資料...");

    // 從 Google Sheets 下載 CSV 資料
    const response = await fetch(GOOGLE_SHEETS_CSV_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MarioKartWorldParams/1.0)",
      },
      cache: "no-cache", // 確保獲取最新資料
    });

    if (!response.ok) {
      throw new Error(
        `Google Sheets API 回應錯誤: ${response.status} ${response.statusText}`,
      );
    }

    const csvData = await response.text();

    if (!csvData || csvData.trim().length === 0) {
      throw new Error("從 Google Sheets 獲取的資料為空");
    }

    console.log("✅ 成功下載 CSV 資料，長度:", csvData.length);

    // 解析 CSV 資料
    const parsedData = parseMarioKartCSV(csvData);

    if (parsedData.characters.length === 0) {
      throw new Error("解析後未找到角色資料");
    }
    if (parsedData.vehicles.length === 0) {
      throw new Error("解析後未找到載具資料");
    }

    console.log(
      `✅ 解析完成: ${parsedData.characters.length} 個角色, ${parsedData.vehicles.length} 個載具`,
    );

    // 轉換為 JSON 格式並儲存到 public 資料夾
    const jsonData = {
      version: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      data: parsedData,
      metadata: {
        characterCount: parsedData.characters.length,
        vehicleCount: parsedData.vehicles.length,
        source: "Google Sheets",
      },
    };

    // 使用 Node.js File System API 將 JSON 資料寫入檔案
    // 並行載入 fs 和 path 模組以減少等待時間
    const [fs, path] = await Promise.all([
      import("fs").then((m) => m.promises),
      import("path"),
    ]);

    const publicDir = path.join(process.cwd(), "public");
    const jsonFilePath = path.join(publicDir, "mario-kart-data.json");

    await fs.writeFile(
      jsonFilePath,
      JSON.stringify(jsonData, null, 2),
      "utf-8",
    );

    console.log("✅ JSON 資料已儲存到:", jsonFilePath);

    return NextResponse.json({
      success: true,
      message: `資料同步成功！共載入 ${parsedData.characters.length} 個角色和 ${parsedData.vehicles.length} 個載具`,
      timestamp: new Date().toISOString(),
      csvData: csvData,
      jsonData: jsonData,
      metadata: {
        characterCount: parsedData.characters.length,
        vehicleCount: parsedData.vehicles.length,
        dataSize: {
          csv: csvData.length,
          json: JSON.stringify(jsonData).length,
        },
      },
    });
  } catch (error) {
    console.error("❌ 資料同步失敗:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知錯誤",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// 也提供 GET 方法來檢查資料狀態
export async function GET() {
  try {
    // 並行載入 fs 和 path 模組以減少等待時間
    const [fs, path] = await Promise.all([
      import("fs").then((m) => m.promises),
      import("path"),
    ]);

    const jsonFilePath = path.join(
      process.cwd(),
      "public",
      "mario-kart-data.json",
    );

    try {
      const jsonContent = await fs.readFile(jsonFilePath, "utf-8");
      const jsonData = JSON.parse(jsonContent);

      return NextResponse.json({
        success: true,
        hasData: true,
        metadata: jsonData.metadata,
        lastUpdate: jsonData.lastUpdate,
        version: jsonData.version,
      });
    } catch (fileError) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message: "JSON 資料檔案不存在，請先執行同步",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "檢查資料狀態時發生錯誤",
      },
      { status: 500 },
    );
  }
}
