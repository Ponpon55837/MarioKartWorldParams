"use client";

import { useState, type CSSProperties } from "react";
import { useSetAtom } from "jotai";
import { Trans, useTranslation } from "react-i18next";
import type {
  EntityKind,
  EntityStats,
  SpeedFilter,
  StatGroup,
  StatKey,
  StatRecord,
} from "@/types";
import { startComboWithAtom } from "@/store/dataAtoms";
import {
  PROFILE_AXES,
  axisKey,
  axisValues,
  getFastestTerrain,
  getTraits,
} from "@/utils/profile";
import { TERRAINS } from "@/utils/recommendation";
import { HANDLING_KEY_BY_FILTER, SPEED_KEY_BY_FILTER } from "@/utils/stats";
import { PLAY_STYLE_TONE } from "@/constants/playStyle";
import { useListFormat } from "@/hooks/useListFormat";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { RadarChart } from "@/components/profile/RadarChart";
import { SpeedLanes } from "@/components/profile/SpeedLanes";
import { HIGHLIGHT } from "@/components/profile/Highlight";

interface SpotlightProps {
  kind: EntityKind;
  group: StatGroup;
  selected: EntityStats;
  maxima: StatRecord;
  filter: SpeedFilter;
}

/** 道路／地形／水面三個數值串成「6/5/5」 */
const byTrack = (
  stats: StatRecord,
  keyByTrack: Readonly<Record<SpeedFilter, StatKey>>,
) => TERRAINS.map((terrain) => stats[keyByTrack[terrain]]).join("/");

/** 依「有無強項-有無弱項」選擇說明句型 */
const TRAITS_KEY: Readonly<Record<string, string>> = {
  "true-true": "spotlight.traits",
  "true-false": "spotlight.traitsStrongOnly",
  "false-true": "spotlight.traitsWeakOnly",
  "false-false": "spotlight.traitsNone",
};

/** 焦點區：選中角色／載具的跑法說明、雷達圖與三條賽道 */
export function Spotlight({
  kind,
  group,
  selected,
  maxima,
  filter,
}: SpotlightProps) {
  const { t } = useTranslation();
  const formatList = useListFormat();
  const startComboWith = useSetAtom(startComboWithAtom);
  const [showRaw, setShowRaw] = useState(false);

  const tone = PLAY_STYLE_TONE[group.playStyle];
  const axisLabels = PROFILE_AXES.map((axis) => t(`axis.${axis}`));
  const { strong, weak } = getTraits(selected, maxima, filter);
  const traitNames = (axes: typeof strong) =>
    formatList(axes.map((axis) => t(`axis.${axis}`)));
  const traitsKey = TRAITS_KEY[`${strong.length > 0}-${weak.length > 0}`];
  const twins = group.members
    .filter((member) => member !== selected)
    .map(({ name }) => name);

  const style = {
    "--lift-color": tone.color,
    backgroundImage: `linear-gradient(100deg, color-mix(in srgb, ${tone.color} 10%, rgb(var(--card))) 0 38%, rgb(var(--card)) 38%)`,
  } as CSSProperties;

  return (
    <section
      aria-label={selected.name}
      className="mb-7 grid items-center gap-7 rounded-[20px] border-2 border-ink p-5 shadow-stage sm:p-7 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(260px,1fr)_240px_minmax(300px,1.2fr)]"
      style={style}
    >
      <div>
        <span
          className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-display text-[13px] text-white ${tone.bg}`}
        >
          {t(`playStyle.${group.playStyle}`)} · {t(`weightClass.${group.weightClass}`)}
        </span>

        <div className="mb-1 mt-3.5 flex items-center gap-4">
          <Avatar name={selected.name} color={tone.color} size="lg" />
          <div className="min-w-0">
            <h2 className="font-display text-[32px] leading-9 sm:text-[42px] sm:leading-[46px]">
              {selected.name}
            </h2>
            <p className="text-[13px] text-muted">{selected.englishName}</p>
          </div>
        </div>

        <p className="mt-4 max-w-[30em] text-base leading-[26px] text-secondary">
          <Trans
            i18nKey={traitsKey}
            values={{ strong: traitNames(strong), weak: traitNames(weak) }}
            components={{ mark: HIGHLIGHT }}
          />
          {t("spotlight.fastest", {
            track: t(`track.${getFastestTerrain(selected)}`),
          })}
        </p>
        {twins.length > 0 && (
          <p className="mt-2.5 text-[13px] text-muted">
            {t("spotlight.sameStats", { names: formatList(twins) })}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="primary"
            icon="plus"
            onClick={() => startComboWith({ kind, name: selected.name })}
          >
            {t(`spotlight.buildCombo.${kind}`)}
          </Button>
          <Button aria-expanded={showRaw} onClick={() => setShowRaw(!showRaw)}>
            {t("spotlight.rawToggle")}
          </Button>
        </div>
        {showRaw && (
          <p className="mt-3 font-mono text-xs leading-5 text-muted">
            {t("spotlight.raw", {
              speed: byTrack(selected, SPEED_KEY_BY_FILTER),
              handling: byTrack(selected, HANDLING_KEY_BY_FILTER),
              acceleration: selected.acceleration,
              weight: selected.weight,
            })}
          </p>
        )}
      </div>

      <RadarChart
        series={[{ values: axisValues(selected, filter), color: tone.color }]}
        maxima={PROFILE_AXES.map((axis) => maxima[axisKey(axis, filter)])}
        size={240}
        labels={axisLabels}
        fillOpacity={0.2}
        strokeWidth={2}
      />

      <div className="lg:col-span-2 xl:col-span-1">
        <SpeedLanes
          stats={selected}
          maxima={maxima}
          filter={filter}
          color={tone.color}
        />
      </div>
    </section>
  );
}
