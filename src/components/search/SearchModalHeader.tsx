"use client";

import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";

interface SearchModalHeaderProps {
  onClose: () => void;
}

export function SearchModalHeader({ onClose }: SearchModalHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between border-b-2 border-line px-4 py-3">
      <h2 id="search-modal-title" className="font-display text-xl">
        {t("search.modal.title")}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-muted transition-colors duration-150 hover:bg-raised hover:text-foreground"
        aria-label={t("common.close")}
      >
        <Icon name="x" className="h-5 w-5" />
      </button>
    </div>
  );
}
