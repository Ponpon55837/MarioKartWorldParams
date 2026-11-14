"use client";

import { memo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { SpeedFilter, StatGroup } from "@/types";
import { PLAY_STYLE_TONE } from "@/constants/playStyle";
import { axisValues } from "@/utils/profile";
import { useListFormat } from "@/hooks/useListFormat";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { RadarChart } from "@/components/profile/RadarChart";

interface ProfileCardProps {
  group: StatGroup;
  /** 雷達圖各軸最大值（與 PROFILE_AXES 對應） */
  axisMaxima: readonly number[];
  filter: SpeedFilter;
  selected: boolean;
  onSelect: (name: string) => void;
}

const WEIGHT_LEVEL = { light: 1, medium: 2, heavy: 3 } as const;

/** 三格體型刻度 */
function WeightMeter({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((step) => (
        <i
          key={step}
          className={`h-2.5 w-[5px] rounded-sm ${step <= level ? "bg-secondary" : "bg-foreground/10"}`}
        />
      ))}
    </span>
  );
}

/** 一種性能的選角卡：頭像、同數值成員、跑法與小雷達圖 */
export const ProfileCard = memo(function ProfileCard({
  group,
  axisMaxima,
  filter,
  selected,
  onSelect,
}: ProfileCardProps) {
  const { t } = useTranslation();
  const formatList = useListFormat();
  const tone = PLAY_STYLE_TONE[group.playStyle];
  const names = formatList(group.members.map(({ name }) => name));

  return (
    <button
      type="button"
      onClick={() => onSelect(group.lead.name)}
      aria-pressed={selected}
      title={names}
      className={`relative grid grid-cols-[56px_minmax(0,1fr)_44px] items-center gap-x-3 rounded-[20px] border-2 bg-card p-3.5 text-left transition-[transform,box-shadow,border-color] duration-150 ease-out hover:-translate-y-[3px] hover:border-[var(--lift-color)] hover:shadow-lift active:translate-y-0 active:shadow-none ${
        selected ? "border-ink shadow-lift" : "border-line"
      }`}
      style={{ "--lift-color": tone.color } as CSSProperties}
    >
      <span className="row-span-2">
        <Avatar name={group.lead.name} color={tone.color} />
      </span>
      <span className="line-clamp-2 self-end font-display text-base leading-5">
        {names}
      </span>
      <span className="col-start-3 row-span-2 row-start-1">
        <RadarChart
          series={[{ values: axisValues(group.lead, filter), color: tone.color }]}
          maxima={axisMaxima}
          size={44}
          fillOpacity={0.25}
          strokeWidth={1.5}
        />
      </span>
      <span className="col-start-2 mt-1 flex items-center gap-2 self-start text-xs text-muted">
        <span className={tone.text}>{t(`playStyle.${group.playStyle}`)}</span>
        <WeightMeter level={WEIGHT_LEVEL[group.weightClass]} />
        {t(`weightClass.${group.weightClass}`)}
      </span>
      {selected && (
        <span
          className="absolute -right-2 -top-2.5 grid h-[26px] w-[26px] place-items-center rounded-full border-2 border-ink bg-gold text-ink"
          aria-hidden="true"
        >
          <Icon name="star" />
        </span>
      )}
    </button>
  );
});
