"use client";

import { useTranslation } from "react-i18next";
import CombinationSelector from "@/components/CombinationSelector";
import CombinationCard from "@/components/CombinationCard";
import type { CharacterStats, VehicleStats, CombinationStats } from "@/types";

interface CombinationsViewProps {
  characters: CharacterStats[];
  vehicles: VehicleStats[];
  combinations: CombinationStats[];
  onAddCombination: (character: CharacterStats, vehicle: VehicleStats) => void;
  onRemoveCombination: (id: string) => void;
  onClearAll: () => void;
}

export function CombinationsView({
  characters,
  vehicles,
  combinations,
  onAddCombination,
  onRemoveCombination,
  onClearAll,
}: CombinationsViewProps) {
  const { t } = useTranslation();

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center flex-1">
          ⭐ {t("stats.combinationCount", { count: combinations.length })}
        </h2>
        {combinations.length > 0 && (
          <button
            onClick={onClearAll}
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
        onAddCombination={onAddCombination}
      />

      {combinations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg mt-4">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-gray-500 text-lg mb-2">
            {t("emptyCombination.title")}
          </p>
          <p className="text-gray-400 mb-4">{t("emptyCombination.subtitle")}</p>
          <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200 inline-block">
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
              onRemove={() => onRemoveCombination(combination.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
