"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import type { EntityKind, PlayStyleFilter, SpeedFilter } from "@/types";
import {
  ENTITY_ATOMS,
  playStyleFilterAtom,
  selectedNameAtom,
  trackFilterAtom,
} from "@/store/dataAtoms";
import { PROFILE_AXES, axisKey } from "@/utils/profile";
import { prefersReducedMotion } from "@/utils/motion";
import { TRACK_FILTERS, TRACK_SWATCH_CLASS } from "@/constants/terrain";
import { PLAY_STYLE_FILTERS, PLAY_STYLE_TONE } from "@/constants/playStyle";
import { Segmented } from "@/components/ui/Segmented";
import { Spotlight } from "@/components/profile/Spotlight";
import { ProfileCard } from "@/components/profile/ProfileCard";

interface EntityBrowserProps {
  kind: EntityKind;
}

/** 角色／載具瀏覽頁：篩選列、焦點區與性能卡片 */
export function EntityBrowser({ kind }: EntityBrowserProps) {
  const { t } = useTranslation();
  const atoms = ENTITY_ATOMS[kind];
  const allGroups = useAtomValue(atoms.groups);
  const maxima = useAtomValue(atoms.maxima);
  const [track, setTrack] = useAtom(trackFilterAtom);
  const [playStyle, setPlayStyle] = useAtom(playStyleFilterAtom);
  const [selectedNames, setSelectedNames] = useAtom(selectedNameAtom);

  const groups = useMemo(
    () =>
      playStyle === "all"
        ? allGroups
        : allGroups.filter((group) => group.playStyle === playStyle),
    [allGroups, playStyle],
  );

  // 選取的名稱不在目前清單時（例如切換跑法），改用第一個群組
  const selectedName = selectedNames[kind];
  const selectedGroup =
    groups.find((group) =>
      group.members.some(({ name }) => name === selectedName),
    ) ?? groups[0];
  const selected =
    selectedGroup?.members.find(({ name }) => name === selectedName) ??
    selectedGroup?.lead;

  const axisMaxima = useMemo(
    () => PROFILE_AXES.map((axis) => maxima[axisKey(axis, track)]),
    [maxima, track],
  );

  // 焦點區若不在畫面上半部就捲過去：手機上卡片在焦點區下方很遠，不捲動看不到選取結果
  const spotlightRef = useRef<HTMLDivElement>(null);
  const revealSpotlight = useCallback(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;
    // scroll-margin-top 即固定頂部列的高度（手機版），被遮住也算不在畫面上
    const offset = parseFloat(getComputedStyle(spotlight).scrollMarginTop) || 0;
    const { top } = spotlight.getBoundingClientRect();
    if (top < offset || top > window.innerHeight / 2) {
      spotlight.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    }
  }, []);

  // 選取改變時（點卡片或從搜尋結果跳轉）
  useEffect(() => {
    if (selectedName) revealSpotlight();
  }, [selectedName, revealSpotlight]);

  // 以 ref 讀取目前選取，讓 handleSelect 保持穩定，memo 卡片不會因選取改變而全部重繪
  const selectedNameRef = useRef(selectedName);
  selectedNameRef.current = selectedName;

  const handleSelect = useCallback(
    (name: string) => {
      // 再點一次已選取的卡片：狀態不變，直接捲到焦點區
      if (name === selectedNameRef.current) revealSpotlight();
      else setSelectedNames((prev) => ({ ...prev, [kind]: name }));
    },
    [kind, setSelectedNames, revealSpotlight],
  );

  const trackOptions = TRACK_FILTERS.map((value) => ({
    value,
    label: t(`track.${value}`),
    swatchClass: value === "display" ? undefined : TRACK_SWATCH_CLASS[value],
  }));
  const playStyleOptions = PLAY_STYLE_FILTERS.map((value) => ({
    value,
    label: t(`playStyle.${value}`),
    swatchClass: value === "all" ? undefined : PLAY_STYLE_TONE[value].bg,
  }));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <span className="text-[13px] text-muted">{t("browser.trackLabel")}</span>
        <Segmented<SpeedFilter>
          label={t("browser.trackLabel")}
          value={track}
          options={trackOptions}
          onChange={setTrack}
        />
        <span className="ml-3 text-[13px] text-muted">
          {t("browser.playStyleLabel")}
        </span>
        <Segmented<PlayStyleFilter>
          label={t("browser.playStyleLabel")}
          value={playStyle}
          options={playStyleOptions}
          onChange={setPlayStyle}
        />
      </div>

      <div ref={spotlightRef} className="scroll-mt-32 lg:scroll-mt-4">
        {selectedGroup && selected ? (
          <Spotlight
            kind={kind}
            group={selectedGroup}
            selected={selected}
            maxima={maxima}
            filter={track}
          />
        ) : (
          <p className="mb-7 rounded-[20px] border-2 border-line bg-card p-7 text-secondary">
            {t("browser.empty")}
          </p>
        )}
      </div>

      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="font-display text-[26px]">
          {playStyle === "all" ? t("browser.allGroups") : t(`playStyle.${playStyle}`)}
        </h2>
        <span className="text-[13px] text-muted">
          {t("browser.groupCount", { count: groups.length })}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
        {groups.map((group) => (
          <ProfileCard
            key={group.key}
            group={group}
            axisMaxima={axisMaxima}
            filter={track}
            selected={group === selectedGroup}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </>
  );
}
