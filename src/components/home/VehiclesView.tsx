"use client";

import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import VehicleCard from "@/components/VehicleCard";
import {
  sortedVehiclesAtom,
  dynamicMaxStatsAtom,
  speedFilterAtom,
  handlingFilterAtom,
} from "@/store/dataAtoms";

export function VehiclesView() {
  const { t } = useTranslation();

  // 使用全域狀態
  const vehicles = useAtomValue(sortedVehiclesAtom);
  const maxStats = useAtomValue(dynamicMaxStatsAtom);
  const speedFilter = useAtomValue(speedFilterAtom);
  const handlingFilter = useAtomValue(handlingFilterAtom);

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        🏎️ {t("stats.vehicleCount", { count: vehicles.length })}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.name}
            vehicle={vehicle}
            maxStats={maxStats}
            speedFilter={speedFilter}
            handlingFilter={handlingFilter}
          />
        ))}
      </div>
    </section>
  );
}
