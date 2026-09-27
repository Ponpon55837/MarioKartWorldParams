"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import StatBar from "@/components/StatBar";
import { HANDLING_KEY_BY_FILTER, SPEED_KEY_BY_FILTER } from "@/utils/stats";

import type {
  EntityStats,
  HandlingFilter,
  SpeedFilter,
  StatKey,
  SummaryMaxStats,
} from "@/types";

interface EntityCardProps {
  entity: EntityStats;
  maxStats: SummaryMaxStats;
  speedFilter: SpeedFilter;
  handlingFilter: HandlingFilter;
}

/** 篩選器 → i18n 標籤鍵（"display" 對應 default） */
const labelKey = (filter: SpeedFilter | HandlingFilter) =>
  filter === "display" ? "default" : filter;

/** 詳細統計區塊顯示的欄位與對應 i18n 鍵 */
const DETAIL_FIELDS: ReadonlyArray<readonly [StatKey, string]> = [
  ["roadSpeed", "stats.roadSpeed"],
  ["terrainSpeed", "stats.terrainSpeed"],
  ["waterSpeed", "stats.waterSpeed"],
  ["roadHandling", "stats.roadHandling"],
  ["terrainHandling", "stats.terrainHandling"],
  ["waterHandling", "stats.waterHandling"],
];

/**
 * 實體卡片組件 - 顯示角色或載具的詳細統計資料
 * 角色與載具共用相同的資料結構，因此共用同一個卡片
 * 使用 React.memo 優化性能
 */
const EntityCard: React.FC<EntityCardProps> = React.memo(
  ({ entity, maxStats, speedFilter, handlingFilter }) => {
    const { t } = useTranslation();

    return (
      <div className="theme-card rounded-lg shadow-md p-3 card-hover">
        {/* 名稱 */}
        <div className="text-center mb-3">
          <h3 className="text-base font-semibold text-foreground mb-0.5">
            {entity.name}
          </h3>
          <p className="text-xs text-muted">{entity.englishName}</p>
        </div>

        {/* 統計資料 */}
        <div className="space-y-2">
          <StatBar
            label={t(`stats.speedTypes.${labelKey(speedFilter)}`)}
            value={entity[SPEED_KEY_BY_FILTER[speedFilter]]}
            maxValue={maxStats.speed}
            statType="speed"
          />

          <StatBar
            label={t("stats.acceleration")}
            value={entity.acceleration}
            maxValue={maxStats.acceleration}
            statType="acceleration"
          />

          <StatBar
            label={t("stats.weight")}
            value={entity.weight}
            maxValue={maxStats.weight}
            statType="weight"
          />

          <StatBar
            label={t(`stats.handlingTypes.${labelKey(handlingFilter)}`)}
            value={entity[HANDLING_KEY_BY_FILTER[handlingFilter]]}
            maxValue={maxStats.handling}
            statType="handling"
          />
        </div>

        {/* 詳細統計 */}
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-muted hover:text-foreground transition-colors">
            {t("stats.details")}
          </summary>
          <div className="mt-2 text-xs text-muted space-y-1">
            <div className="grid grid-cols-2 gap-1 text-xs">
              {DETAIL_FIELDS.map(([key, i18nKey]) => (
                <div key={key}>
                  {t(i18nKey)}: {entity[key]}
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>
    );
  },
);

EntityCard.displayName = "EntityCard";

export default EntityCard;
