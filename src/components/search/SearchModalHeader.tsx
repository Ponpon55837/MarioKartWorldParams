"use client";

import { useTranslation } from "react-i18next";

interface SearchModalHeaderProps {
  onClose: () => void;
}

export function SearchModalHeader({ onClose }: SearchModalHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border theme-card sticky top-0 z-10">
      <h2 className="text-lg sm:text-xl font-bold text-foreground">
        {t("search.modal.title")}
      </h2>
      <button
        onClick={onClose}
        className="text-muted hover:text-foreground transition-colors"
        aria-label={t("common.close")}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
