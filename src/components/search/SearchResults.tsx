"use client";

import { useTranslation } from "react-i18next";
import type { EntityKind, SearchResultItem } from "@/types";
import { getPlayStyle } from "@/utils/profile";
import { PLAY_STYLE_TONE } from "@/constants/playStyle";
import { Avatar } from "@/components/ui/Avatar";

interface SearchResultsProps {
  results: SearchResultItem[];
  searchQuery: string;
  isLoading: boolean;
  onSelect: (kind: EntityKind, name: string) => void;
}

const KIND_BY_TYPE = { character: "characters", vehicle: "vehicles" } as const;

export function SearchResults({
  results,
  searchQuery,
  isLoading,
  onSelect,
}: SearchResultsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <p className="py-8 text-center text-muted">{t("search.loading")}</p>;
  }

  if (results.length === 0) {
    return (
      <div className="py-8 text-center text-muted">
        <p className="text-lg text-secondary">
          {searchQuery
            ? t("search.modal.noResultsFor", { query: searchQuery })
            : t("search.modal.startSearch")}
        </p>
        <p className="mt-2 text-sm">
          {searchQuery ? t("search.modal.tryOther") : t("search.modal.supportBoth")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        {t("search.modal.foundResults", { count: results.length })}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {results.map((result) => {
          const { name, englishName } = result.data;
          const playStyle = getPlayStyle(result.data);
          const tone = PLAY_STYLE_TONE[playStyle];
          return (
            <li key={`${result.type}-${name}`}>
              <button
                type="button"
                onClick={() => onSelect(KIND_BY_TYPE[result.type], name)}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-line bg-card p-3 text-left transition-colors duration-150 hover:border-line-strong hover:bg-raised"
              >
                <Avatar name={name} color={tone.color} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-base">{name}</span>
                  <span className="block truncate text-xs text-muted">{englishName}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {t(`types.${result.type}`)} ·{" "}
                  <span className={tone.text}>
                    {t(`playStyle.${playStyle}`)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
