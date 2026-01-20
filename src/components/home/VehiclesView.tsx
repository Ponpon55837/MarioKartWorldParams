"use client";

import { useTranslation } from "react-i18next";
import VehicleCard from "@/components/VehicleCard";
import type { VehicleStats, SpeedType, HandlingType } from "@/types";

interface VehiclesViewProps {
  vehicles: VehicleStats[];
  maxStats: {
    speed: number;
    acceleration: number;
    weight: number;
    handling: number;
  };
  speedFilter: SpeedType | "display";
  handlingFilter: HandlingType | "display";
}

export function VehiclesView({
  vehicles,
  maxStats,
  speedFilter,
  handlingFilter,
}: VehiclesViewProps) {
  const { t } = useTranslation();

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
