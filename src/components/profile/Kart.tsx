interface KartProps {
  color: string;
  scale?: number;
  /** 顯示車尾速度線（比賽進行中） */
  trail?: boolean;
}

/** 側面卡丁車圖示：車手、車身與兩個輪子 */
export function Kart({ color, scale = 1, trail = false }: KartProps) {
  return (
    <svg
      width={50 * scale}
      height={26 * scale}
      viewBox="-10 0 50 26"
      aria-hidden="true"
      className="block"
    >
      {trail && (
        <path
          d="M-8 10h7M-6 15h6M-9 20h8"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      )}
      <circle cx="19" cy="6" r="5" fill={color} stroke="#fff" strokeWidth="1.5" />
      <path
        d="M4 18c0-4 3-7 8-7h12l9 3c3 1 4 2 4 4z"
        fill={color}
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="4.5" fill="#111" stroke="#fff" strokeWidth="1.5" />
      <circle cx="31" cy="20" r="4.5" fill="#111" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}
