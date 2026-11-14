import { memo } from "react";

export interface RadarSeries {
  values: readonly number[];
  color: string;
}

interface RadarChartProps {
  series: readonly RadarSeries[];
  /** 各軸的最大值，與 values 一一對應 */
  maxima: readonly number[];
  size: number;
  /** 軸標籤（上、右、下、左）；省略時為不含格線與標籤的小圖示 */
  labels?: readonly string[];
  fillOpacity?: number;
  strokeWidth?: number;
}

const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
const MIN_RATIO = 0.08;
const LABEL_PADDING = 44;
const GLYPH_PADDING = 6;

/**
 * 四軸雷達圖（純 SVG，無外部函式庫）
 */
export const RadarChart = memo(function RadarChart({
  series,
  maxima,
  size,
  labels,
  fillOpacity = 0.16,
  strokeWidth = 1.75,
}: RadarChartProps) {
  const axisCount = maxima.length;
  const center = size / 2;
  const radius = center - (labels ? LABEL_PADDING : GLYPH_PADDING);

  const pointAt = (axis: number, ratio: number) => {
    const angle = -Math.PI / 2 + (axis * 2 * Math.PI) / axisCount;
    return [
      center + Math.cos(angle) * radius * ratio,
      center + Math.sin(angle) * radius * ratio,
    ] as const;
  };

  const polygon = (ratios: readonly number[]) =>
    ratios.map((ratio, axis) => pointAt(axis, ratio).join(",")).join(" ");

  const gridLevels = labels ? GRID_LEVELS : [1];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto block shrink-0"
      aria-hidden="true"
    >
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={polygon(maxima.map(() => level))}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
        />
      ))}
      {labels &&
        labels.map((label, axis) => {
          const [x2, y2] = pointAt(axis, 1);
          const [x, y] = pointAt(axis, axis % 2 ? 1.08 : 1.16);
          const anchor = axis === 1 ? "start" : axis === 3 ? "end" : "middle";
          return (
            <g key={label}>
              <line
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeOpacity={0.1}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor={anchor}
                className="fill-secondary text-xs font-medium"
              >
                {label}
              </text>
            </g>
          );
        })}
      {series.map(({ values, color }, index) => (
        <polygon
          key={index}
          points={polygon(
            values.map((value, axis) =>
              Math.max(MIN_RATIO, value / Math.max(maxima[axis], 1)),
            ),
          )}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
});
