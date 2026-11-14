import type { KeyboardEvent } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** 選項前的小色塊（Tailwind 背景 class） */
  swatchClass?: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
}

/** 方向鍵 → 選項位移 */
const ARROW_STEP: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * 分段選擇器（單選 radiogroup）
 * 只有選中項目可用 Tab 聚焦，方向鍵切換選項並移動焦點
 */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_STEP[event.key];
    if (!step) return;
    event.preventDefault();

    const current = options.findIndex((option) => option.value === value);
    const next = (current + step + options.length) % options.length;
    onChange(options[next].value);
    const radios = event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
    radios[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="inline-flex flex-wrap gap-0.5 rounded-xl border-2 border-line bg-card p-1"
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={`flex h-[30px] items-center gap-1.5 rounded-[9px] px-3 font-display text-sm transition-colors duration-150 ${
              checked
                ? "bg-foreground text-background"
                : "text-secondary hover:text-foreground"
            }`}
          >
            {option.swatchClass && (
              <span
                className={`h-2.5 w-2.5 rounded-[3px] ${option.swatchClass}`}
                aria-hidden="true"
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
