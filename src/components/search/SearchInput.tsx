"use client";

import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef: RefObject<HTMLInputElement>;
}

export function SearchInput({ value, onChange, onClear, inputRef }: SearchInputProps) {
  const { t } = useTranslation();

  return (
    <div className="border-b-2 border-line p-4">
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("search.inputPlaceholder")}
          aria-label={t("header.search")}
          className="h-11 w-full rounded-xl border-2 border-line-strong bg-card pl-9 pr-10 text-foreground placeholder:text-muted"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors duration-150 hover:text-foreground"
            aria-label={t("search.modal.clearSearch")}
          >
            <Icon name="x" />
          </button>
        )}
      </div>
    </div>
  );
}
