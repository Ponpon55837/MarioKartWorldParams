import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

type ButtonVariant = "primary" | "secondary" | "go";

const VARIANT_CLASS: Readonly<Record<ButtonVariant, string>> = {
  primary: "bg-gold text-ink hover:brightness-105",
  secondary: "bg-card text-foreground hover:bg-raised",
  go: "bg-kart-red text-white hover:brightness-105",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: IconName;
}

/**
 * 實體感按鈕：粗外框＋底部陰影，按下時下沉
 */
export function Button({
  variant = "secondary",
  icon,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-ink px-4 font-display text-[15px] shadow-press transition-[transform,box-shadow,filter,background-color] duration-100 ease-out active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-press ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
