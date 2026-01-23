"use client";

import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import CombinationSelector from "@/components/CombinationSelector";
import CombinationCard from "@/components/CombinationCard";
import {
  charactersAtom,
  vehiclesAtom,
  addCombinationAtom,
  removeCombinationAtom,
  clearAllCombinationsAtom,
} from "@/store/dataAtoms";
import { combinationsAtom } from "@/store/combinations";

export function CombinationsView() {
  const { t } = useTranslation();

  // 使用全域狀態
  const characters = useAtomValue(charactersAtom);
  const vehicles = useAtomValue(vehiclesAtom);
  const combinations = useAtomValue(combinationsAtom);
  const addCombination = useSetAtom(addCombinationAtom);
  const removeCombination = useSetAtom(removeCombinationAtom);
  const clearAllCombinations = useSetAtom(clearAllCombinationsAtom);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-foreground text-center flex-1">
          ⭐ {t("stats.combinationCount", { count: combinations.length })}
        </h2>
        {combinations.length > 0 && (
          <button
            onClick={() => clearAllCombinations()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            🗑️ {t("stats.clearAll")}
          </button>
        )}
      </div>

      {/* 組合選擇器 */}
      <CombinationSelector
        characters={characters}
        vehicles={vehicles}
        onAddCombination={(character, vehicle) =>
          addCombination({ character, vehicle })
        }
      />

      {combinations.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-lg mt-4">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-muted text-lg mb-2">
            {t("emptyCombination.title")}
          </p>
          <p className="text-muted mb-4">{t("emptyCombination.subtitle")}</p>
          <div className="text-sm text-muted theme-card p-3 theme-border rounded-lg inline-block">
            💡 {t("emptyCombination.tip")}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {combinations.map((combination) => (
            <CombinationCard
              key={combination.id}
              character={combination.character}
              vehicle={combination.vehicle}
              onRemove={() => removeCombination(combination.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
