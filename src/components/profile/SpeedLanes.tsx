"use client";

import { useTranslation } from "react-i18next";
import type { SpeedFilter, StatRecord } from "@/types";
import { TERRAINS } from "@/utils/recommendation";
import { SPEED_KEY_BY_FILTER, getStatPercentage } from "@/utils/stats";
import { TrackLane } from "@/components/profile/TrackLane";
import { KartRunner } from "@/components/profile/KartRunner";

interface SpeedLanesProps {
  stats: StatRecord;
  maxima: StatRecord;
  filter: SpeedFilter;
  color: string;
}

/** 三種賽道的速度：卡丁車越靠右代表在該賽道越快 */
export function SpeedLanes({ stats, maxima, filter, color }: SpeedLanesProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <h3 className="mb-0.5 flex justify-between font-display text-[15px]">
        {t("spotlight.lanesTitle")}
        <span className="font-sans text-[13px] text-muted">
          {t("spotlight.lanesHint")}
        </span>
      </h3>
      {TERRAINS.map((terrain) => {
        const key = SPEED_KEY_BY_FILTER[terrain];
        return (
          <TrackLane
            key={terrain}
            terrain={terrain}
            label={t(`track.${terrain}`)}
            active={filter === terrain}
          >
            <KartRunner
              color={color}
              percent={getStatPercentage(stats[key], maxima[key])}
            />
          </TrackLane>
        );
      })}
    </div>
  );
}
