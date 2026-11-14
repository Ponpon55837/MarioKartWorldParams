"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  addCombinationAtom,
  characterByNameAtom,
  charactersAtom,
  comboDraftAtom,
  vehicleByNameAtom,
  vehiclesAtom,
} from "@/store/dataAtoms";
import { Button } from "@/components/ui/Button";

const SELECT_CLASS =
  "h-10 w-full rounded-xl border-2 border-line-strong bg-card px-2.5 text-foreground";

/** 挑一位角色與一台載具加入賽局 */
export function ComboBuilder() {
  const { t } = useTranslation();
  const characters = useAtomValue(charactersAtom);
  const vehicles = useAtomValue(vehiclesAtom);
  const characterByName = useAtomValue(characterByNameAtom);
  const vehicleByName = useAtomValue(vehicleByNameAtom);
  const [draft, setDraft] = useAtom(comboDraftAtom);
  const addCombination = useSetAtom(addCombinationAtom);

  const character = characterByName.get(draft.character);
  const vehicle = vehicleByName.get(draft.vehicle);

  const handleAdd = () => {
    if (!character || !vehicle) return;
    addCombination({ character, vehicle });
    setDraft({ character: "", vehicle: "" });
  };

  return (
    <div className="mb-5 grid items-end gap-3 rounded-[20px] border-2 border-line bg-card p-4 sm:grid-cols-[1fr_1fr_auto]">
      <label className="block">
        <span className="mb-1.5 block text-xs text-muted">{t("combos.character")}</span>
        <select
          className={SELECT_CLASS}
          value={draft.character}
          onChange={(event) => setDraft({ ...draft, character: event.target.value })}
        >
          <option value="">{t("combos.selectPlaceholder")}</option>
          {characters.map(({ name }) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs text-muted">{t("combos.vehicle")}</span>
        <select
          className={SELECT_CLASS}
          value={draft.vehicle}
          onChange={(event) => setDraft({ ...draft, vehicle: event.target.value })}
        >
          <option value="">{t("combos.selectPlaceholder")}</option>
          {vehicles.map(({ name }) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <Button
        variant="primary"
        icon="plus"
        onClick={handleAdd}
        disabled={!character || !vehicle}
      >
        {t("combos.add")}
      </Button>
    </div>
  );
}
