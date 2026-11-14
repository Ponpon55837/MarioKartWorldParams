interface AvatarProps {
  name: string;
  /** 頭像底色（CSS 色彩，例如 PLAY_STYLE_TONE.speed.color） */
  color: string;
  size?: "md" | "lg";
}

const SIZE_CLASS = {
  md: "h-[52px] w-[52px] text-[22px]",
  lg: "h-[76px] w-[76px] text-[34px]",
} as const;

/** 以名稱第一個字作為頭像（資料沒有角色圖片） */
export function Avatar({ name, color, size = "md" }: AvatarProps) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border-[3px] border-card font-display text-white ${SIZE_CLASS[size]}`}
      style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}` }}
      aria-hidden="true"
    >
      {Array.from(name)[0]}
    </span>
  );
}
