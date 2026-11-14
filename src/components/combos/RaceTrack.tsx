"use client";

import { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import type { TerrainType } from "@/types";
import { combinedMaximaAtom } from "@/store/dataAtoms";
import { createRunner, rankRunners } from "@/utils/race";
import { TERRAINS } from "@/utils/recommendation";
import { SPEED_KEY_BY_FILTER } from "@/utils/stats";
import { TRACK_SWATCH_CLASS } from "@/constants/terrain";
import { COUNTDOWN_STEPS, useRaceAnimation } from "@/hooks/useRaceAnimation";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { TrackLane } from "@/components/profile/TrackLane";
import { KartRunner } from "@/components/profile/KartRunner";
import { Podium } from "@/components/combos/Podium";
import type { RacerView } from "@/components/combos/types";

interface RaceTrackProps {
  racers: readonly RacerView[];
}

/** 起跑燈：倒數時逐一亮紅燈，GO 與完賽時全綠 */
function StartLights({ lit, green }: { lit: number; green: boolean }) {
  return (
    <span className="flex gap-1.5 rounded-full bg-ink px-2.5 py-1.5" aria-hidden="true">
      {[0, 1, 2].map((light) => (
        <i
          key={light}
          className={`h-3.5 w-3.5 rounded-full ${
            green ? "bg-signal-green" : light < lit ? "bg-kart-red" : "bg-white/15"
          }`}
        />
      ))}
    </span>
  );
}

/** 模擬一圈：選賽道、倒數開跑、即時名次與頒獎台 */
export function RaceTrack({ racers }: RaceTrackProps) {
  const { t } = useTranslation();
  const maxima = useAtomValue(combinedMaximaAtom);
  const [track, setTrack] = useState<TerrainType>("road");

  const runners = useMemo(() => {
    const speedKey = SPEED_KEY_BY_FILTER[track];
    return racers.map(({ combinedStats }) =>
      createRunner(
        combinedStats[speedKey],
        combinedStats.acceleration,
        maxima[speedKey],
        maxima.acceleration,
      ),
    );
  }, [racers, track, maxima]);
  const order = useMemo(() => rankRunners(runners), [runners]);
  // 名次的反向索引：places[參賽者索引] = 名次，O(n)
  const places = useMemo(() => {
    const result: number[] = [];
    order.forEach((runnerIndex, place) => (result[runnerIndex] = place + 1));
    return result;
  }, [order]);
  const { phase, step, start, kartRefs } = useRaceAnimation(runners);

  const finished = phase === "finished";
  const countdownLabel = COUNTDOWN_STEPS[step];

  return (
    <section className="relative mb-5 overflow-hidden rounded-[20px] border-2 border-ink bg-card p-5 shadow-stage sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-[26px]">{t("combos.raceTitle")}</h2>
        <Segmented<TerrainType>
          label={t("combos.trackLabel")}
          value={track}
          options={TERRAINS.map((value) => ({
            value,
            label: t(`track.${value}`),
            swatchClass: TRACK_SWATCH_CLASS[value],
          }))}
          onChange={setTrack}
        />
        <span className="flex-1" />
        <StartLights
          lit={phase === "countdown" ? step + 1 : 0}
          green={phase === "racing" || finished || countdownLabel === "GO"}
        />
        <Button
          variant="go"
          icon="play"
          onClick={start}
          disabled={phase === "countdown" || phase === "racing"}
        >
          {t("combos.start")}
        </Button>
      </div>

      <ol className="flex flex-col gap-2.5" aria-live="polite">
        {racers.map((racer, index) => (
          <li key={racer.id}>
            <TrackLane
              terrain={track}
              size="lg"
              label={t("combos.title", {
                character: racer.character.name,
                vehicle: racer.vehicle.name,
              })}
              trailing={
                finished && (
                  <span className="absolute right-[74px] top-1/2 z-10 -translate-y-1/2 rounded-md bg-black/35 px-2 py-0.5 font-mono text-xs text-white">
                    {t("combos.place", { place: places[index] })}
                  </span>
                )
              }
            >
              <KartRunner
                ref={(element) => {
                  kartRefs.current[index] = element;
                }}
                color={racer.color}
                scale={1.15}
                percent={finished ? 100 : 0}
                trail={phase === "racing"}
                smooth={phase !== "racing"}
              />
            </TrackLane>
          </li>
        ))}
      </ol>

      {finished && <Podium winners={order.slice(0, 3).map((i) => racers[i])} />}
      <p className="mt-3 text-xs text-muted">{t("combos.raceHint")}</p>

      {phase === "countdown" && (
        <div
          className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-scrim/55"
          aria-hidden="true"
        >
          <span
            key={step}
            className={`animate-pop font-display text-[120px] leading-none [-webkit-text-stroke:4px_rgb(var(--ink))] [paint-order:stroke] ${
              countdownLabel === "GO" ? "text-gold" : "text-white"
            }`}
          >
            {countdownLabel}
          </span>
        </div>
      )}
    </section>
  );
}
