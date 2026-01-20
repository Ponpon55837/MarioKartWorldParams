"use client";

import { useTranslation } from "react-i18next";
import CharacterCard from "@/components/CharacterCard";
import type { CharacterStats, SpeedType, HandlingType } from "@/types";

interface CharactersViewProps {
  characters: CharacterStats[];
  maxStats: {
    speed: number;
    acceleration: number;
    weight: number;
    handling: number;
  };
  speedFilter: SpeedType | "display";
  handlingFilter: HandlingType | "display";
}

export function CharactersView({
  characters,
  maxStats,
  speedFilter,
  handlingFilter,
}: CharactersViewProps) {
  const { t } = useTranslation();

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        🎮 {t("stats.characterCount", { count: characters.length })}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {characters.map((character) => (
          <CharacterCard
            key={character.name}
            character={character}
            maxStats={maxStats}
            speedFilter={speedFilter}
            handlingFilter={handlingFilter}
          />
        ))}
      </div>
    </section>
  );
}
