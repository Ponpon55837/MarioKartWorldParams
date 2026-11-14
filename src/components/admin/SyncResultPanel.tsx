"use client";

import { useTranslation } from "react-i18next";
import type { SyncResult } from "@/types";
import { Button } from "@/components/ui/Button";
import { PANEL_CLASS } from "@/components/admin/panel";

interface SyncResultPanelProps {
  result: SyncResult;
}

const formatKB = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
const today = () => new Date().toISOString().split("T")[0];

/** 以 Blob 觸發瀏覽器下載；延後釋放 URL，避免部分瀏覽器取消下載 */
const downloadFile = (content: string, filename: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/** 同步結果：成功時顯示統計與下載，失敗時顯示錯誤 */
export function SyncResultPanel({ result }: SyncResultPanelProps) {
  const { t } = useTranslation();
  const { success, persisted, metadata, csvData, jsonData } = result;

  return (
    <section
      className={`${PANEL_CLASS} border-l-[6px] ${
        success ? "border-l-kart-green" : "border-l-kart-red"
      }`}
    >
      <h2 className="mb-1 font-display text-xl">
        {success ? t("admin.syncSuccess") : t("admin.syncFailed")}
      </h2>
      <p className="text-sm text-secondary">{success ? result.message : result.error}</p>
      {success && persisted === false && (
        <p className="mt-3 rounded-xl bg-gold/20 p-3 text-sm">{t("admin.notPersisted")}</p>
      )}
      {metadata && (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {[
            [t("admin.characterCountNum"), metadata.characterCount],
            [t("admin.vehicleCountNum"), metadata.vehicleCount],
            [t("admin.csvSize"), formatKB(metadata.dataSize.csv)],
            [t("admin.jsonSize"), formatKB(metadata.dataSize.json)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-raised p-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-mono text-xl">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {csvData && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() =>
              downloadFile(csvData, `mario-kart-data-${today()}.csv`, "text/csv;charset=utf-8;")
            }
          >
            {t("admin.downloadCsv")}
          </Button>
          {Boolean(jsonData) && (
            <Button
              onClick={() =>
                downloadFile(
                  JSON.stringify(jsonData, null, 2),
                  `mario-kart-data-${today()}.json`,
                  "application/json;charset=utf-8;",
                )
              }
            >
              {t("admin.downloadJson")}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
