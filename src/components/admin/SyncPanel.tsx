"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { PANEL_CLASS } from "@/components/admin/panel";

interface SyncPanelProps {
  token: string;
  onTokenChange: (token: string) => void;
  syncing: boolean;
  onSync: () => void;
}

/** 同步說明與 token 輸入 */
export function SyncPanel({ token, onTokenChange, syncing, onSync }: SyncPanelProps) {
  const { t } = useTranslation();

  return (
    <section className={PANEL_CLASS}>
      <h2 className="mb-2 font-display text-xl">{t("admin.newFeatures")}</h2>
      <ul className="mb-5 list-disc space-y-1 pl-5 text-sm text-secondary">
        <li>{t("admin.syncFromSheets")}</li>
        <li>{t("admin.autoConvertToJson")}</li>
        <li>{t("admin.keepCsvBackup")}</li>
        <li>{t("admin.realTimeUpdate")}</li>
        <li>{t("admin.detailedSyncStatus")}</li>
      </ul>

      <label htmlFor="sync-token" className="mb-1.5 block text-sm">
        {t("admin.syncToken")}
      </label>
      <div className="flex max-w-xl flex-wrap gap-3">
        <input
          id="sync-token"
          type="password"
          autoComplete="off"
          value={token}
          onChange={(event) => onTokenChange(event.target.value)}
          placeholder={t("admin.syncTokenPlaceholder")}
          className="h-10 min-w-0 flex-1 rounded-xl border-2 border-line-strong bg-card px-3 text-foreground placeholder:text-muted"
        />
        <Button variant="primary" onClick={onSync} disabled={syncing}>
          {syncing ? t("admin.syncInProgress") : t("admin.syncFromSheets")}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-muted">{t("admin.syncTokenHint")}</p>
    </section>
  );
}
