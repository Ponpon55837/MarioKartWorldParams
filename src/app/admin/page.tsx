"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMarioKartStore } from "@/hooks/useMarioKartStore";
import { useLanguagePersistence } from "@/hooks/useLanguagePersistence";
import ClientOnlyWrapper from "@/components/ClientOnlyWrapper";
import { AppShell } from "@/components/layout/AppShell";
import { DataStatusPanel } from "@/components/admin/DataStatusPanel";
import { SyncPanel } from "@/components/admin/SyncPanel";
import { SyncResultPanel } from "@/components/admin/SyncResultPanel";
import type { SyncResult, DataStatus } from "@/types";

export default function AdminPage() {
  return (
    <ClientOnlyWrapper>
      <AdminPageContent />
    </ClientOnlyWrapper>
  );
}

function AdminPageContent() {
  const { t } = useTranslation();
  // 初始化語言（與首頁相同的持久化設定）
  useLanguagePersistence();
  const { reloadData } = useMarioKartStore();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  // 同步 token 只保存在元件狀態中，不寫入任何儲存空間
  const [syncToken, setSyncToken] = useState("");

  // 檢查當前資料狀態
  const checkDataStatus = async () => {
    try {
      const response = await fetch("/api/sync-data", {
        method: "GET",
      });

      const data = await response.json();
      setDataStatus(data);
    } catch (error) {
      console.error("檢查資料狀態失敗:", error);
      setDataStatus({ success: false, hasData: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  // 頁面載入時檢查資料狀態
  useEffect(() => {
    checkDataStatus();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const token = syncToken.trim();
      const response = await fetch("/api/sync-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data: SyncResult = await response.json();
      setResult(
        response.status === 401
          ? { ...data, error: t("admin.unauthorized") }
          : data,
      );

      // 同步成功且已寫入檔案後，重新檢查狀態並重新載入應用資料
      if (data.success && data.persisted !== false) {
        await checkDataStatus();

        // 重新載入應用中的資料
        try {
          await reloadData();
          console.log("✅ 應用資料已重新載入");
        } catch (reloadError) {
          console.error("❌ 重新載入應用資料失敗:", reloadError);
        }
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : t("admin.unknownSyncError"),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppShell title={t("admin.dataManagement")} searchable={false}>
      <div className="grid max-w-4xl gap-5">
        <DataStatusPanel checking={checkingStatus} status={dataStatus} />
        <SyncPanel
          token={syncToken}
          onTokenChange={setSyncToken}
          syncing={syncing}
          onSync={handleSync}
        />
        {result && <SyncResultPanel result={result} />}

        <section className="rounded-[20px] bg-gold/15 p-5">
          <h2 className="mb-2 font-display text-lg">{t("admin.notice")}</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-secondary">
            <li>{t("admin.syncWillOverwrite")}</li>
            <li>{t("admin.ensureGoogleSheetsAccess")}</li>
            <li>{t("admin.autoReload")}</li>
            <li>{t("admin.jsonLoadingSpeed")}</li>
            <li>{t("admin.regularSync")}</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
