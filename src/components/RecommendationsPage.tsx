"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { recommendedCombinationsAtom } from "@/store/dataAtoms";
import {
  getTerrainIcon,
  useTerrainName,
  useTerrainDescription,
} from "@/constants/terrain";

// 動態載入推薦卡片元件以優化初始載入
const RecommendationCard = dynamic(
  () => import("@/components/RecommendationCard"),
  {
    loading: () => (
      <div className="theme-card rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
      </div>
    ),
  },
);

const RecommendationsPage: React.FC = () => {
  const { t } = useTranslation();
  const getTerrainName = useTerrainName();
  const getTerrainDescription = useTerrainDescription();
  const [selectedTerrain, setSelectedTerrain] = useState<
    "road" | "terrain" | "water"
  >("road");
  const recommendations = useAtomValue(recommendedCombinationsAtom);

  // 使用 useMemo 優化當前推薦計算
  const currentRecommendations = useMemo(() => {
    return recommendations[selectedTerrain] || [];
  }, [recommendations, selectedTerrain]);

  // 使用 useCallback 優化事件處理
  const handleTerrainChange = useCallback(
    (terrain: "road" | "terrain" | "water") => {
      setSelectedTerrain(terrain);
    },
    [],
  );

  return (
    <div className="space-y-6">
      {/* 地形選擇器 */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-2">
        {(["road", "terrain", "water"] as const).map((terrain) => (
          <button
            key={terrain}
            onClick={() => handleTerrainChange(terrain)}
            className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex-1 sm:flex-none ${selectedTerrain === terrain ? "bg-blue-500 text-white shadow-lg transform scale-105" : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"}`}
          >
            <span className="text-xl sm:text-2xl">
              {getTerrainIcon(terrain)}
            </span>
            <div className="text-center sm:text-left">
              <div className="text-base sm:text-lg">
                {getTerrainName(terrain)}
              </div>
              <div className="text-xs opacity-80 hidden sm:block">
                {getTerrainDescription(terrain)}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 當前選擇的地形資訊 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-1">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("recommendations.scoreFormula")}
          </p>
        </div>
      </div>

      {/* 推薦組合列表 */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        }
      >
        {currentRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-gray-500 text-lg">
              {t("recommendations.calculating")}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t("recommendations.ensureDataLoaded")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                maxStats={recommendations.maxCombinedStats}
              />
            ))}
          </div>
        )}
      </Suspense>

      {/* 使用說明 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          {t("recommendations.instructions.title")}
        </h3>
        <ul className="text-sm text-yellow-700 space-y-2">
          <li>
            • <strong>{t("recommendations.instructions.step1")}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RecommendationsPage;
