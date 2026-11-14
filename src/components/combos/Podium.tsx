import { MEDAL_CLASS } from "@/constants/rank";
import type { RacerView } from "@/components/combos/types";
import { Kart } from "@/components/profile/Kart";

interface PodiumProps {
  /** 依名次排序的前三名 */
  winners: readonly RacerView[];
}

/** 台階高度，依名次（0 為冠軍） */
const BLOCK_HEIGHT = ["h-24", "h-[68px]", "h-12"] as const;

/** 頒獎台：亞軍、冠軍、季軍由左到右 */
export function Podium({ winners }: PodiumProps) {
  const slots = [1, 0, 2].filter((place) => place < winners.length);

  return (
    <div className="mt-5">
      <ol className="flex items-end justify-center gap-3">
        {slots.map((place) => {
          const { id, color, character, vehicle } = winners[place];
          return (
            <li key={id} className="flex w-44 flex-col items-center gap-1.5 text-center">
              <Kart color={color} scale={1.3} />
              <span className="font-display text-sm leading-[18px]">
                {character.name}
                <br />
                {vehicle.name}
              </span>
              <span
                className={`grid w-full place-items-center rounded-t-xl border-2 border-b-0 border-ink font-display text-[34px] ${BLOCK_HEIGHT[place]} ${MEDAL_CLASS[place + 1]}`}
              >
                {place + 1}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mx-auto h-1.5 max-w-[600px] rounded-sm bg-ink" />
    </div>
  );
}
