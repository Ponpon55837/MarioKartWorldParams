"use client";

import type { ReactNode } from "react";
import { useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { searchModalOpenAtom } from "@/store/dataAtoms";
import { Sidebar } from "@/components/layout/Sidebar";
import { Icon } from "@/components/ui/Icon";

interface AppShellProps {
  title: string;
  subtitle?: string;
  /** 顯示搜尋入口（管理頁不需要） */
  searchable?: boolean;
  children: ReactNode;
}

/** macOS 顯示 ⌘K，其他平台顯示 Ctrl K（頁面只在客戶端渲染，可讀取 navigator） */
const getShortcutLabel = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "⌘K"
    : "Ctrl K";

/** 搜尋入口：點擊或按 ⌘K / Ctrl+K 開啟搜尋視窗 */
function SearchTrigger() {
  const { t } = useTranslation();
  const openSearch = useSetAtom(searchModalOpenAtom);

  return (
    <button
      type="button"
      onClick={() => openSearch(true)}
      className="flex h-10 w-full items-center gap-2 rounded-xl border-2 border-line-strong bg-card pl-3 pr-1.5 text-muted transition-colors duration-150 hover:text-foreground sm:w-64"
    >
      <Icon name="search" />
      <span className="flex-1 text-left">{t("header.search")}</span>
      <kbd className="rounded border border-b-2 border-line-strong bg-raised px-1.5 font-mono text-[11px] text-secondary">
        {getShortcutLabel()}
      </kbd>
    </button>
  );
}

/** 應用程式框架：左側導覽 + 頁首 + 內容 */
export function AppShell({
  title,
  subtitle,
  searchable = true,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <Sidebar />
      <main className="mx-auto w-full max-w-[1520px] px-4 pb-14 pt-6 sm:px-8 sm:pt-7">
        <header className="mb-6 flex flex-wrap items-end gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl leading-tight sm:text-[52px] sm:leading-[56px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-[15px] text-secondary">{subtitle}</p>
            )}
          </div>
          {searchable && <SearchTrigger />}
        </header>
        {children}
      </main>
    </div>
  );
}
