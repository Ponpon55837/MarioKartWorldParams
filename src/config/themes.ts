import { ThemeConfig } from "@/types";

// 亮色主題配置
export const lightTheme: ThemeConfig = {
  colors: {
    background: "from-blue-50 to-red-50",
    foreground: "text-gray-900",
    muted: "text-gray-600",
    accent: "text-blue-600",
    card: "bg-white",
    border: "border-gray-200",
    input: "bg-white border-gray-300",
    ring: "focus:ring-blue-500",
    // 瑪利歐賽車主題色
    marioRed: "text-red-600",
    marioBlue: "text-blue-600",
    marioYellow: "text-yellow-600",
    marioGreen: "text-green-600",
  },
  gradients: {
    background: "from-blue-50 to-red-50",
    card: "from-white to-gray-50",
  },
};

// 深色主題配置
export const darkTheme: ThemeConfig = {
  colors: {
    background: "from-gray-900 to-blue-900",
    foreground: "text-gray-100",
    muted: "text-gray-400",
    accent: "text-blue-400",
    card: "bg-gray-800",
    border: "border-gray-700",
    input: "bg-gray-800 border-gray-600",
    ring: "focus:ring-blue-400",
    // 瑪利歐賽車主題色（深色版本）
    marioRed: "text-red-400",
    marioBlue: "text-blue-400",
    marioYellow: "text-yellow-400",
    marioGreen: "text-green-400",
  },
  gradients: {
    background: "from-gray-900 to-blue-900",
    card: "from-gray-800 to-gray-700",
  },
};

// 主題映射
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

// 根據主題模式獲取配置
export function getThemeConfig(theme: "light" | "dark"): ThemeConfig {
  return themes[theme];
}
