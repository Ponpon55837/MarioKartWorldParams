"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { RecommendedCombination, StatType, SummaryMaxStats } from "@/types";
import { PROFILE_AXES, getPlayStyle } from "@/utils/profile";
import { combineStats } from "@/utils/stats";
import { PLAY_STYLE_TONE } from "@/constants/playStyle";
import { DEFAULT_MEDAL_CLASS, MEDAL_CLASS } from "@/constants/rank";
import { RadarChart } from "@/components/profile/RadarChart";
import { Kart } from "@/components/profile/Kart";

interface RecommendationCardProps {
  recommendation: RecommendedCombination;
  maxStats: SummaryMaxStats;
  /** 前三名以大卡片呈現 */
  featured?: boolean;
}

/** 單一推薦組合：名次、組合名稱、能力輪廓與綜合評分 */
export const RecommendationCard = memo(function RecommendationCard({
  recommendation,
  maxStats,
  featured = false,
}: RecommendationCardProps) {
  const { t } = useTranslation();
  const { rank, character, vehicle, score } = recommendation;
  const totals: Readonly<Record<StatType, number>> = {
    speed: recommendation.totalSpeed,
    acceleration: recommendation.totalAcceleration,
    weight: recommendation.totalWeight,
    handling: recommendation.totalHandling,
  };
  // 跑法以組合後的數值判斷，與組合賽跑頁一致
  const tone = PLAY_STYLE_TONE[getPlayStyle(combineStats(character, vehicle))];
  const title = t("combos.title", {
    character: character.name,
    vehicle: vehicle.name,
  });

  const radar = (
    <RadarChart
      series={[{ values: PROFILE_AXES.map((axis) => totals[axis]), color: tone.color }]}
      maxima={PROFILE_AXES.map((axis) => maxStats[axis])}
      size={featured ? 72 : 44}
      fillOpacity={0.25}
      strokeWidth={1.5}
    />
  );
  const medalBadge = (
    <span
      className={`grid shrink-0 place-items-center rounded-xl border-2 border-ink font-display ${
        MEDAL_CLASS[rank] ?? DEFAULT_MEDAL_CLASS
      } ${featured ? "h-12 w-12 text-2xl" : "h-9 w-9 text-lg"}`}
    >
      {rank}
    </span>
  );
  const scoreLine = (
    <p className="text-xs text-muted">
      {t("recommendations.compositeScore")}{" "}
      <span className="font-mono text-secondary">{score.toFixed(1)}</span>
    </p>
  );

  // 前三名：上方名次與雷達圖，下方卡丁車與組合名稱
  if (featured) {
    return (
      <article className="flex flex-col gap-3 rounded-[20px] border-2 border-ink bg-card p-5 shadow-press">
        <div className="flex items-start justify-between">
          {medalBadge}
          <span>{radar}</span>
        </div>
        <Kart color={tone.color} />
        <div>
          <h3 className="font-display text-xl">{title}</h3>
          {scoreLine}
        </div>
      </article>
    );
  }

  return (
    <article className="flex items-center gap-4 rounded-[20px] border-2 border-line bg-card px-4 py-3">
      {medalBadge}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-base">{title}</h3>
        {scoreLine}
      </div>
      {radar}
    </article>
  );
});
