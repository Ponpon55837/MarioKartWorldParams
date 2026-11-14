"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { DataStatus } from "@/types";
import { PANEL_CLASS } from "@/components/admin/panel";

interface DataStatusPanelProps {
  checking: boolean;
  status: DataStatus | null;
}

/** 資料狀態的一列：左側標籤、右側數值 */
function StatusRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

/** 目前伺服器上的資料檔案狀態 */
export function DataStatusPanel({ checking, status }: DataStatusPanelProps) {
  const { t, i18n } = useTranslation();

  return (
    <section className={PANEL_CLASS}>
      <h2 className="mb-3 font-display text-xl">{t("admin.currentDataStatus")}</h2>
      {checking ? (
        <p className="text-muted">{t("admin.checkingStatus")}</p>
      ) : status ? (
        <dl className="grid gap-2 text-sm">
          <StatusRow label={t("admin.jsonDataFile")}>
            <span className={status.hasData ? "text-kart-green" : "text-kart-red"}>
              {status.hasData
                ? t("admin.jsonDataFileExists")
                : t("admin.jsonDataFileNotExists")}
            </span>
          </StatusRow>
          {status.hasData && status.metadata && (
            <>
              <StatusRow label={t("admin.characterCountNum")}>
                {status.metadata.characterCount}
              </StatusRow>
              <StatusRow label={t("admin.vehicleCountNum")}>
                {status.metadata.vehicleCount}
              </StatusRow>
              <StatusRow label={t("admin.dataSource")}>
                {status.metadata.source}
              </StatusRow>
            </>
          )}
          {status.lastUpdate && (
            <StatusRow label={t("admin.lastUpdated")}>
              {new Date(status.lastUpdate).toLocaleString(i18n.language)}
            </StatusRow>
          )}
        </dl>
      ) : (
        <p className="text-kart-red">{t("admin.checkStatusFailed")}</p>
      )}
    </section>
  );
}
