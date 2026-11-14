"use client";

import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  clearAllCombinationsAtom,
  combinedMaximaAtom,
  removeCombinationAtom,
} from "@/store/dataAtoms";
import { combinationsAtom } from "@/store/combinations";
import { PROFILE_AXES, axisKey, axisValues, compareStandings } from "@/utils/profile";
import { RACER_COLORS } from "@/constants/playStyle";
import { RadarChart } from "@/components/profile/RadarChart";
import { ComboBuilder } from "@/components/combos/ComboBuilder";
import { ComboCard } from "@/components/combos/ComboCard";
import { RaceTrack } from "@/components/combos/RaceTrack";
import type { RacerView } from "@/components/combos/types";

/** 組合比較一律使用遊戲顯示數值 */
const COMPARE_FILTER = "display";
const COMPARE_KEYS = PROFILE_AXES.map((axis) => axisKey(axis, COMPARE_FILTER));

/** 組合賽跑頁：建立組合、模擬比賽、能力輪廓比較 */
export function CombinationsView() {
  const { t } = useTranslation();
  const combinations = useAtomValue(combinationsAtom);
  const maxima = useAtomValue(combinedMaximaAtom);
  const removeCombination = useSetAtom(removeCombinationAtom);
  const clearAll = useSetAtom(clearAllCombinationsAtom);

  const racers = useMemo<RacerView[]>(
    () =>
      combinations.map((combination, index) => ({
        ...combination,
        color: RACER_COLORS[index % RACER_COLORS.length],
      })),
    [combinations],
  );
  const standings = useMemo(
    () =>
      compareStandings(
        racers.map(({ combinedStats }) => combinedStats),
        COMPARE_KEYS,
      ),
    [racers],
  );
  const axisMaxima = COMPARE_KEYS.map((key) => maxima[key]);

  return (
    <>
      <ComboBuilder />

      {racers.length === 0 ? (
        <div className="rounded-[20px] border-2 border-dashed border-line-strong p-10 text-center">
          <p className="font-display text-xl">{t("combos.emptyTitle")}</p>
          <p className="mt-1.5 text-sm text-muted">{t("combos.emptyHint")}</p>
        </div>
      ) : (
        <>
          <RaceTrack racers={racers} />

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(340px,1fr)_1fr]">
            <section className="rounded-[20px] border-2 border-line bg-card p-5 sm:p-6">
              <h2 className="font-display text-[26px]">{t("combos.profileTitle")}</h2>
              <p className="text-[13px] text-muted">{t("combos.profileHint")}</p>
              <RadarChart
                series={racers.map(({ combinedStats, color }) => ({
                  values: axisValues(combinedStats, COMPARE_FILTER),
                  color,
                }))}
                maxima={axisMaxima}
                size={360}
                labels={PROFILE_AXES.map((axis) => t(`axis.${axis}`))}
                fillOpacity={0.12}
              />
              <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-secondary">
                {racers.map(({ id, color, character, vehicle }) => (
                  <li key={id} className="flex items-center gap-1.5">
                    <i className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
                    {t("combos.title", {
                      character: character.name,
                      vehicle: vehicle.name,
                    })}
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-col gap-3">
              {racers.map((racer, index) => (
                <ComboCard
                  key={racer.id}
                  racer={racer}
                  standings={standings[index]}
                  onRemove={removeCombination}
                />
              ))}
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span>{t("combos.autoSave")}</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-md px-2 py-1 transition-colors duration-150 hover:bg-raised hover:text-foreground"
                >
                  {t("combos.clearAll")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
