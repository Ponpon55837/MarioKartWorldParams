"use client";

import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import CharacterCard from "@/components/CharacterCard";
import {
  sortedCharactersAtom,
  dynamicMaxStatsAtom,
  speedFilterAtom,
  handlingFilterAtom,
} from "@/store/dataAtoms";

export function CharactersView() {
  const { t } = useTranslation();

  // 使用全域狀態
  const characters = useAtomValue(sortedCharactersAtom);
  const maxStats = useAtomValue(dynamicMaxStatsAtom);
  const speedFilter = useAtomValue(speedFilterAtom);
  const handlingFilter = useAtomValue(handlingFilterAtom);

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
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
