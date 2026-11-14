"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import type { TerrainType } from "@/types";
import { recommendedCombinationsAtom } from "@/store/dataAtoms";
import { TERRAINS } from "@/utils/recommendation";
import { TRACK_SWATCH_CLASS } from "@/constants/terrain";
import { Segmented } from "@/components/ui/Segmented";
import { RecommendationCard } from "@/components/RecommendationCard";

const FEATURED_COUNT = 3;

/** 賽道推薦：前三名大卡片，其餘以清單呈現 */
export function RecommendationsPage() {
  const { t } = useTranslation();
  const [terrain, setTerrain] = useState<TerrainType>("road");
  const recommendations = useAtomValue(recommendedCombinationsAtom);
  const list = recommendations[terrain];
  const featured = list.slice(0, FEATURED_COUNT);
  const others = list.slice(FEATURED_COUNT);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <span className="text-[13px] text-muted">{t("browser.trackLabel")}</span>
        <Segmented<TerrainType>
          label={t("browser.trackLabel")}
          value={terrain}
          options={TERRAINS.map((value) => ({
            value,
            label: t(`track.${value}`),
            swatchClass: TRACK_SWATCH_CLASS[value],
          }))}
          onChange={setTerrain}
        />
      </div>

      {list.length === 0 ? (
        <p className="rounded-[20px] border-2 border-line bg-card p-7 text-secondary">
          {t("recommendations.ensureDataLoaded")}
        </p>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                maxStats={recommendations.maxCombinedStats}
                featured
              />
            ))}
          </div>
          <div className="grid gap-2.5 lg:grid-cols-2">
            {others.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                maxStats={recommendations.maxCombinedStats}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-6 space-y-1 text-xs text-muted">
        <p>{t("recommendations.scoreFormula")}</p>
        <p>{t("recommendations.instructions.step1")}</p>
      </div>
    </>
  );
}
