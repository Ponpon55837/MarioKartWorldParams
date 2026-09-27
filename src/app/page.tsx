"use client";

import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import SearchModal from "@/components/SearchModal";
import RecommendationsPage from "@/components/RecommendationsPage";
import PageControls from "@/components/PageControls";
import { useMarioKartStore } from "@/hooks/useMarioKartStore";
import { useLanguagePersistence } from "@/hooks/useLanguagePersistence";
import { searchModalOpenAtom } from "@/store/dataAtoms";
import LayoutContent from "@/components/LayoutContent";
import ClientOnlyWrapper from "@/components/ClientOnlyWrapper";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/components/home/SearchBar";
import { CombinationsView } from "@/components/home/CombinationsView";
import { CharactersView } from "@/components/home/CharactersView";
import { VehiclesView } from "@/components/home/VehiclesView";

function HomeContent() {
  const { t, i18n } = useTranslation();
  const { isInitialized } = useLanguagePersistence();
  const [isMounted, setIsMounted] = useState(false);

  // 確保組件已掛載
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 使用全域狀態管理搜尋模態框
  const setIsSearchModalOpen = useSetAtom(searchModalOpenAtom);

  // 頁面層級狀態；列表與最大值由各 View 自行訂閱
  const {
    loading,
    error,
    charactersCount,
    vehiclesCount,
    combinationsCount,
    sortBy,
    setSortBy,
    speedFilter,
    setSpeedFilter,
    handlingFilter,
    setHandlingFilter,
    currentPage,
    setCurrentPage,
  } = useMarioKartStore();

  // 搜尋快捷鍵
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchModalOpen]);

  // 語言初始化載入中 - 避免 hydration 錯誤
  if (!isMounted || !isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          {isMounted && i18n.isInitialized && (
            <p className="text-xl text-muted">{t("loading.initializing")}</p>
          )}
        </div>
      </div>
    );
  }

  // 載入中狀態
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mario-red mx-auto mb-4"></div>
          <p className="text-xl text-muted">{t("loading.loadingData")}</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">❌ {t("loading.error")}</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            {t("loading.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <LayoutContent>
      <div className="space-y-6">
        {/* 搜尋功能區 */}
        <SearchBar />

        <PageControls
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sortBy={sortBy}
          setSortBy={setSortBy}
          speedFilter={speedFilter}
          setSpeedFilter={setSpeedFilter}
          handlingFilter={handlingFilter}
          setHandlingFilter={setHandlingFilter}
          charactersCount={charactersCount}
          vehiclesCount={vehiclesCount}
          combinationsCount={combinationsCount}
        />

        {/* 組合頁面 */}
        {currentPage === "combinations" && <CombinationsView />}

        {/* 角色頁面 */}
        {currentPage === "characters" && <CharactersView />}

        {/* 載具頁面 */}
        {currentPage === "vehicles" && <VehiclesView />}

        {/* 推薦組合頁面 */}
        {currentPage === "recommendations" && (
          <section>
            <RecommendationsPage />
          </section>
        )}

        {/* 說明區塊 */}
        <section className="theme-card rounded-lg shadow-md p-4 mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">
            📊 {t("stats.legend.title")}
          </h2>

          {/* 顏色圖例 */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <h3 className="font-semibold text-base mb-2 text-foreground">
              🎨 {t("stats.legend.colorLegend")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 font-medium text-sm">
                  {t("stats.legend.speed")}
                </span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium text-sm">
                  {t("stats.legend.acceleration")}
                </span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-purple-700 font-medium text-sm">
                  {t("stats.legend.weight")}
                </span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-orange-700 font-medium text-sm">
                  {t("stats.legend.handling")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground">
            <div>
              <h3 className="font-semibold text-base mb-2 text-blue-600">
                🏎️ {t("stats.descriptions.speedTitle")}
              </h3>
              <ul className="space-y-1">
                <li>
                  <strong>{t("stats.road")}：</strong>
                  {t("stats.descriptions.roadSpeedDesc")}
                </li>
                <li>
                  <strong>{t("stats.terrain")}：</strong>
                  {t("stats.descriptions.terrainSpeedDesc")}
                </li>
                <li>
                  <strong>{t("stats.water")}：</strong>
                  {t("stats.descriptions.waterSpeedDesc")}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2 text-green-600">
                ⚡ {t("stats.descriptions.otherStatsTitle")}
              </h3>
              <ul className="space-y-1">
                <li>
                  <strong>{t("stats.acceleration")}：</strong>
                  {t("stats.descriptions.accelerationDesc")}
                </li>
                <li>
                  <strong>{t("stats.weight")}：</strong>
                  {t("stats.descriptions.weightDesc")}
                </li>
                <li>
                  <strong>{t("stats.handling")}：</strong>
                  {t("stats.descriptions.handlingDesc")}
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              <strong>💡 {t("stats.tips.usage")}</strong>
            </p>
          </div>
          <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
            <p className="text-sm text-red-800">
              <strong>⚠️ {t("stats.tips.notice")}</strong>
            </p>
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <p className="text-sm text-green-800">
              <strong>💾 </strong>
              {t("combination.autoSave")}
            </p>
          </div>
        </section>

        {/* 管理員快速入口 */}
        <div className="text-center mb-2">
          <a
            href="/admin"
            className="inline-flex items-center px-3 py-1 text-xs text-muted hover:text-accent transition-colors theme-border rounded-full hover:border-accent"
          >
            🔧 {t("admin.dataManagement")}
          </a>
        </div>

        {/* 搜尋模態框 */}
        <SearchModal onNavigate={setCurrentPage} />
      </div>
    </LayoutContent>
  );
}

export default function Home() {
  return (
    <ClientOnlyWrapper>
      <HomeContent />
    </ClientOnlyWrapper>
  );
}
