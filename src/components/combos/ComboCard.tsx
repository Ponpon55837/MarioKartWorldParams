"use client";

import { memo } from "react";
import { Trans, useTranslation } from "react-i18next";
import type { Standing } from "@/types";
import { PROFILE_AXES, getBestTerrain, getPlayStyle } from "@/utils/profile";
import { HIGHLIGHT } from "@/components/profile/Highlight";
import { Icon } from "@/components/ui/Icon";
import type { RacerView } from "@/components/combos/types";

interface ComboCardProps {
  racer: RacerView;
  /** 與 PROFILE_AXES 對應的比較結果 */
  standings: readonly Standing[];
  onRemove: (id: string) => void;
}

/** 單一組合：最適合賽道與相對其他組合的強弱標籤 */
export const ComboCard = memo(function ComboCard({
  racer,
  standings,
  onRemove,
}: ComboCardProps) {
  const { t } = useTranslation();
  const { id, character, vehicle, combinedStats, color } = racer;
  const title = t("combos.title", {
    character: character.name,
    vehicle: vehicle.name,
  });

  return (
    <article
      className="flex flex-col gap-2.5 rounded-[20px] border-2 border-l-[6px] border-line bg-card px-[18px] py-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-[22px]">{title}</h3>
          <p className="text-xs text-muted">
            {t("combos.meta", {
              style: t(`playStyle.${getPlayStyle(combinedStats)}`),
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={t("combos.remove", { name: title })}
          className="rounded-md p-1 text-muted transition-colors duration-150 hover:bg-raised hover:text-foreground"
        >
          <Icon name="x" />
        </button>
      </div>
      <p className="text-sm text-secondary">
        <Trans
          i18nKey="combos.bestFor"
          values={{ track: t(`track.${getBestTerrain(combinedStats)}`) }}
          components={{ mark: HIGHLIGHT }}
        />
      </p>
      {standings.some(Boolean) && (
        <ul className="flex flex-wrap gap-1.5">
          {PROFILE_AXES.map((axis, column) => {
            const standing = standings[column];
            if (!standing) return null;
            return (
              <li
                key={axis}
                className={`rounded-lg px-2 py-0.5 font-display text-[13px] ${
                  standing === "best" ? "bg-gold/25 text-foreground" : "bg-raised text-muted"
                }`}
              >
                {t(`combos.${standing}`, { axis: t(`axis.${axis}`) })}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
});
