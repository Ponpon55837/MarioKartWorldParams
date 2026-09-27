"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { APP_CONSTANTS, STAT_CONFIGS } from "@/constants";
import {
  combineStats,
  getStatBarWidth,
  getStatPercentage,
} from "@/utils/stats";
import type { CharacterStats, StatKey, VehicleStats } from "@/types";

interface CombinationCardProps {
  id: string;
  character: CharacterStats;
  vehicle: VehicleStats;
  onRemove: (id: string) => void;
}

/** 組合的理論最大值：最高角色值 + 最高載具值 + 遊戲加成 */
const MAX_POSSIBLE_VALUE = 10 + 7 + APP_CONSTANTS.COMBINATION_BONUS;
const BONUS = APP_CONSTANTS.COMBINATION_BONUS;

/** 主要能力值列：[統計類型, 欄位, i18n 鍵] */
const MAIN_STATS: ReadonlyArray<
  readonly [keyof typeof STAT_CONFIGS, StatKey, string]
> = [
  ["speed", "displaySpeed", "stats.speed"],
  ["acceleration", "acceleration", "stats.acceleration"],
  ["weight", "weight", "stats.weight"],
  ["handling", "displayHandling", "stats.handling"],
];

/**
 * 組合卡片 - 顯示角色 + 載具 + 遊戲加成的總能力值
 * 使用 React.memo，搭配穩定的 onRemove 避免清單中其他卡片重新渲染
 */
const CombinationCard = React.memo(function CombinationCard({
  id,
  character,
  vehicle,
  onRemove,
}: CombinationCardProps) {
  const { t } = useTranslation();

  // 計算組合後的總能力值 (角色 + 載具 + 遊戲加成)
  const combinedStats = combineStats(character, vehicle);
  const maxPossibleValue = MAX_POSSIBLE_VALUE;

  const stats = MAIN_STATS.map(([statType, key, i18nKey]) => ({
    ...STAT_CONFIGS[statType],
    label: t(i18nKey),
    value: combinedStats[key],
    charValue: character[key],
    vehicleValue: vehicle[key],
  }));

  return (
    <div className="theme-card rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 theme-border relative">
      {/* 移除按鈕 */}
      <button
        onClick={() => onRemove(id)}
        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
        aria-label={t("common.delete")}
      >
        ×
      </button>

      {/* 組合標題 */}
      <div className="text-center mb-3">
        <div className="bg-yellow-100 rounded-lg p-2 border border-yellow-300">
          <h3 className="text-sm font-semibold text-foreground mb-0.5">
            {character.name} + {vehicle.name}
          </h3>
          <p className="text-xs text-muted">
            {character.englishName} + {vehicle.englishName}
          </p>
        </div>
      </div>

      {/* 能力值顯示 */}
      <div className="space-y-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`p-2 rounded-lg ${stat.lightBg} border ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className={`text-xs font-semibold ${stat.color}`}>
                {stat.label}
              </div>
              <div className={`text-sm font-semibold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
            <div className="flex items-center mb-1">
              <div className="flex-1 mx-1">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stat.bgColor}`}
                    style={{
                      width: getStatBarWidth(stat.value, maxPossibleValue),
                    }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted ml-2">
                {getStatPercentage(stat.value, maxPossibleValue)}%
              </div>
            </div>
            {/* 組成明細 */}
            <div className="text-xs text-muted flex justify-between">
              <span>
                {t("types.character")}: {stat.charValue}
              </span>
              <span>
                {t("types.vehicle")}: {stat.vehicleValue}
              </span>
              <span className="text-yellow-600 font-semibold">+{BONUS}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 詳細速度分佈 */}
      <div className="mt-3 pt-2 border-t border-border">
        <div className="text-xs text-muted font-semibold mb-1 text-center">
          {t("combination.detailedSpeedDistribution")}
        </div>
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div className="text-center p-1 bg-blue-50 rounded border border-blue-200">
            <div className="font-semibold text-blue-700">
              {t("combination.terrainNames.road")}
            </div>
            <div className="text-blue-600 font-bold text-xs">
              {combinedStats.roadSpeed}
            </div>
            <div className="text-muted text-xs">
              {character.roadSpeed}+{vehicle.roadSpeed}+{BONUS}
            </div>
          </div>
          <div className="text-center p-1 bg-green-50 rounded border border-green-200">
            <div className="font-semibold text-green-700">
              {t("combination.terrainNames.terrain")}
            </div>
            <div className="text-green-600 font-bold text-xs">
              {combinedStats.terrainSpeed}
            </div>
            <div className="text-muted text-xs">
              {character.terrainSpeed}+{vehicle.terrainSpeed}+{BONUS}
            </div>
          </div>
          <div className="text-center p-1 bg-cyan-50 rounded border border-cyan-200">
            <div className="font-semibold text-cyan-700">
              {t("combination.terrainNames.water")}
            </div>
            <div className="text-cyan-600 font-bold text-xs">
              {combinedStats.waterSpeed}
            </div>
            <div className="text-muted text-xs">
              {character.waterSpeed}+{vehicle.waterSpeed}+{BONUS}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CombinationCard;
