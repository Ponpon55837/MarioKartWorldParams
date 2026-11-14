"use client";

import { useAtom, useAtomValue } from "jotai";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  charactersAtom,
  currentPageAtom,
  vehiclesAtom,
} from "@/store/dataAtoms";
import { combinationsAtom } from "@/store/combinations";
import { NavRow } from "@/components/layout/NavRow";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import type { IconName } from "@/components/ui/Icon";
import type { PageType } from "@/types";

const NAV_ITEMS: ReadonlyArray<{ page: PageType; icon: IconName }> = [
  { page: "characters", icon: "user" },
  { page: "vehicles", icon: "car" },
  { page: "combinations", icon: "flag" },
  { page: "recommendations", icon: "trophy" },
];

const ADMIN_PATH = "/admin";

/** 4×4 黑白格旗 */
function CheckeredFlag() {
  return (
    <span
      className="grid h-7 w-7 -rotate-6 grid-cols-4 overflow-hidden rounded-md border-2 border-ink shadow-[0_3px_0_rgb(var(--kart-red))]"
      aria-hidden="true"
    >
      {Array.from({ length: 16 }, (_, i) => (
        <i
          key={i}
          className={(Math.floor(i / 4) + i) % 2 ? "bg-ink" : "bg-white"}
        />
      ))}
    </span>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAdmin = usePathname() === ADMIN_PATH;
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);

  const counts: Partial<Record<PageType, number>> = {
    characters: useAtomValue(charactersAtom).length,
    vehicles: useAtomValue(vehiclesAtom).length,
    combinations: useAtomValue(combinationsAtom).length,
  };

  const goTo = (page: PageType) => {
    setCurrentPage(page);
    if (isAdmin) router.push("/");
    else window.scrollTo({ top: 0 });
  };

  // 手機版：頂部列固定，捲動時導覽切換仍在畫面上；桌面版：固定高度的側邊欄
  return (
    <aside className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 bg-sidebar px-3 pb-3.5 pt-2.5 lg:flex lg:h-screen lg:flex-col lg:items-stretch lg:gap-7 lg:py-5">
      <span
        className="racing-stripe absolute inset-x-0 bottom-0 h-1.5 lg:inset-x-auto lg:inset-y-0 lg:right-0 lg:h-auto lg:w-1.5"
        aria-hidden="true"
      />

      <div className="flex items-center gap-2.5 px-2">
        <CheckeredFlag />
        <div>
          <p className="font-display text-[19px] leading-5">{t("app.brand")}</p>
          <p className="text-xs text-muted">{t("app.brandSub")}</p>
        </div>
      </div>

      <nav aria-label={t("navigation.garage")} className="col-span-2">
        <p className="hidden px-2 pb-2 text-xs text-muted lg:block">
          {t("navigation.garage")}
        </p>
        <ul className="flex gap-0.5 overflow-x-auto [scrollbar-width:none] lg:flex-col">
          {NAV_ITEMS.map(({ page, icon }) => (
            <li key={page} className="shrink-0">
              <NavRow
                icon={icon}
                label={t(`navigation.${page}`)}
                meta={counts[page]}
                active={!isAdmin && currentPage === page}
                onClick={() => goTo(page)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* 手機版：與品牌同一列的圖示按鈕；桌面版：側邊欄底部 */}
      <div className="col-start-2 row-start-1 flex gap-0.5 lg:mt-auto lg:flex-col">
        <ThemeToggle />
        <LanguageSelector />
        <NavRow
          icon="database"
          label={t("admin.dataManagement")}
          active={isAdmin}
          iconOnlyOnMobile
          onClick={() => router.push(ADMIN_PATH)}
        />
      </div>
    </aside>
  );
}
