"use client";

import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import type { PageType } from "@/types";
import {
  characterGroupsAtom,
  charactersAtom,
  vehicleGroupsAtom,
  vehiclesAtom,
} from "@/store/dataAtoms";
import { combinationsAtom } from "@/store/combinations";
import { useMarioKartStore } from "@/hooks/useMarioKartStore";
import { useLanguagePersistence } from "@/hooks/useLanguagePersistence";
import ClientOnlyWrapper from "@/components/ClientOnlyWrapper";
import { AppShell } from "@/components/layout/AppShell";
import { EntityBrowser } from "@/components/browser/EntityBrowser";
import { CombinationsView } from "@/components/combos/CombinationsView";
import { RecommendationsPage } from "@/components/RecommendationsPage";
import { SearchModal } from "@/components/SearchModal";
import { Button } from "@/components/ui/Button";

/** 各頁副標題需要的數量 */
function usePageSubtitle(page: PageType): string {
  const { t } = useTranslation();
  const characters = useAtomValue(charactersAtom).length;
  const vehicles = useAtomValue(vehiclesAtom).length;
  const characterGroups = useAtomValue(characterGroupsAtom).length;
  const vehicleGroups = useAtomValue(vehicleGroupsAtom).length;
  const combinations = useAtomValue(combinationsAtom).length;

  switch (page) {
    case "characters":
      return t("browser.subtitle.characters", {
        count: characters,
        groups: characterGroups,
      });
    case "vehicles":
      return t("browser.subtitle.vehicles", {
        count: vehicles,
        groups: vehicleGroups,
      });
    case "combinations":
      return t("combos.subtitle", { count: combinations });
    case "recommendations":
      return t("recommendations.subtitle");
  }
}

function PageContent({ page }: { page: PageType }) {
  switch (page) {
    case "characters":
    case "vehicles":
      return <EntityBrowser kind={page} />;
    case "combinations":
      return <CombinationsView />;
    case "recommendations":
      return <RecommendationsPage />;
  }
}

/** 載入中與錯誤時的全頁訊息 */
function StatusScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>{children}</div>
    </div>
  );
}

function HomeContent() {
  const { t } = useTranslation();
  const { isInitialized } = useLanguagePersistence();
  const { loading, error, currentPage } = useMarioKartStore();
  const subtitle = usePageSubtitle(currentPage);

  if (!isInitialized || loading) {
    return (
      <StatusScreen>
        <p className="font-display text-xl text-secondary">
          {isInitialized ? t("loading.loadingData") : ""}
        </p>
      </StatusScreen>
    );
  }

  if (error) {
    return (
      <StatusScreen>
        <h1 className="font-display text-2xl">{t("loading.error")}</h1>
        <p className="mb-5 mt-2 max-w-md text-secondary">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          {t("loading.retry")}
        </Button>
      </StatusScreen>
    );
  }

  return (
    <AppShell title={t(`navigation.${currentPage}`)} subtitle={subtitle}>
      <PageContent page={currentPage} />
      <SearchModal />
    </AppShell>
  );
}

export default function Home() {
  return (
    <ClientOnlyWrapper>
      <HomeContent />
    </ClientOnlyWrapper>
  );
}
