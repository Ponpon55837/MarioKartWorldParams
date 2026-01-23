"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import StatBar from "@/components/StatBar";

import type { CharacterStats, SpeedType, HandlingType } from "@/types";

interface CharacterCardProps {
  character: CharacterStats;
  maxStats: {
    speed: number;
    acceleration: number;
    weight: number;
    handling: number;
  };
  speedFilter: SpeedType | "display";
  handlingFilter: HandlingType | "display";
}

/**
 * 角色卡片組件 - 顯示角色的詳細統計資料
 * 使用 React.memo 優化性能
 */
const CharacterCard: React.FC<CharacterCardProps> = React.memo(
  ({ character, maxStats, speedFilter, handlingFilter }) => {
    const { t } = useTranslation();

    // 根據篩選器取得當前顯示的速度值
    const getSpeedValue = () => {
      switch (speedFilter) {
        case "road":
          return character.roadSpeed;
        case "terrain":
          return character.terrainSpeed;
        case "water":
          return character.waterSpeed;
        default:
          return character.displaySpeed;
      }
    };

    // 根據篩選器取得當前顯示的轉向值
    const getHandlingValue = () => {
      switch (handlingFilter) {
        case "road":
          return character.roadHandling;
        case "terrain":
          return character.terrainHandling;
        case "water":
          return character.waterHandling;
        default:
          return character.displayHandling;
      }
    };

    // 取得速度標籤
    const getSpeedLabel = () => {
      switch (speedFilter) {
        case "road":
          return t("stats.speedTypes.road");
        case "terrain":
          return t("stats.speedTypes.terrain");
        case "water":
          return t("stats.speedTypes.water");
        default:
          return t("stats.speedTypes.default");
      }
    };

    // 取得轉向標籤
    const getHandlingLabel = () => {
      switch (handlingFilter) {
        case "road":
          return t("stats.handlingTypes.road");
        case "terrain":
          return t("stats.handlingTypes.terrain");
        case "water":
          return t("stats.handlingTypes.water");
        default:
          return t("stats.handlingTypes.default");
      }
    };

    return (
      <div className="theme-card rounded-lg shadow-md p-3 card-hover">
        {/* 角色名稱 */}
        <div className="text-center mb-3">
          <h3 className="text-base font-semibold text-foreground mb-0.5">
            {character.name}
          </h3>
          <p className="text-xs text-muted">{character.englishName}</p>
        </div>

        {/* 統計資料 */}
        <div className="space-y-2">
          <StatBar
            label={getSpeedLabel()}
            value={getSpeedValue()}
            maxValue={maxStats.speed}
            statType="speed"
          />

          <StatBar
            label={t("stats.acceleration")}
            value={character.acceleration}
            maxValue={maxStats.acceleration}
            statType="acceleration"
          />

          <StatBar
            label={t("stats.weight")}
            value={character.weight}
            maxValue={maxStats.weight}
            statType="weight"
          />

          <StatBar
            label={getHandlingLabel()}
            value={getHandlingValue()}
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
              <div>
                {t("stats.roadSpeed")}: {character.roadSpeed}
              </div>
              <div>
                {t("stats.terrainSpeed")}: {character.terrainSpeed}
              </div>
              <div>
                {t("stats.waterSpeed")}: {character.waterSpeed}
              </div>
              <div>
                {t("stats.roadHandling")}: {character.roadHandling}
              </div>
              <div>
                {t("stats.terrainHandling")}: {character.terrainHandling}
              </div>
              <div>
                {t("stats.waterHandling")}: {character.waterHandling}
              </div>
            </div>
          </div>
        </details>
      </div>
    );
  },
);

CharacterCard.displayName = "CharacterCard";

export default CharacterCard;
