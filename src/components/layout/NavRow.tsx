import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

interface NavRowProps {
  icon: IconName;
  label: string;
  /** 右側的數量或狀態文字 */
  meta?: ReactNode;
  active?: boolean;
  /** 手機版只顯示圖示（文字保留給螢幕閱讀器） */
  iconOnlyOnMobile?: boolean;
  onClick?: () => void;
}

export const NAV_ROW_CLASS =
  "flex h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-left font-display text-[15px] transition-colors duration-150";

/** 手機版只留圖示時的寬度與文字隱藏規則 */
export const ICON_ONLY_MOBILE_CLASS = {
  row: "max-lg:w-10 max-lg:justify-center max-lg:px-0",
  text: "max-lg:sr-only",
} as const;

/** 側邊欄的一列：導覽項目或設定項目 */
export function NavRow({
  icon,
  label,
  meta,
  active = false,
  iconOnlyOnMobile = false,
  onClick,
}: NavRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={iconOnlyOnMobile ? label : undefined}
      className={`${NAV_ROW_CLASS} ${iconOnlyOnMobile ? ICON_ONLY_MOBILE_CLASS.row : ""} ${
        active
          ? "bg-gold text-ink shadow-press"
          : "text-secondary hover:bg-foreground/5 hover:text-foreground"
      }`}
    >
      <Icon name={icon} className={`h-4 w-4 ${active ? "text-kart-red" : "text-muted"}`} />
      <span
        className={`flex-1 truncate ${iconOnlyOnMobile ? ICON_ONLY_MOBILE_CLASS.text : ""}`}
      >
        {label}
      </span>
      {meta !== undefined && (
        <span
          className={`font-mono text-xs opacity-80 ${iconOnlyOnMobile ? ICON_ONLY_MOBILE_CLASS.text : ""}`}
        >
          {meta}
        </span>
      )}
    </button>
  );
}
