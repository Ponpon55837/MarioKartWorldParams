/**
 * 統計資料顯示配置
 */
export const STAT_CONFIGS = {
  speed: {
    label: '速度',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '🏎️'
  },
  acceleration: {
    label: '加速度',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    lightBg: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '⚡'
  },
  weight: {
    label: '重量',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: '⚖️'
  },
  handling: {
    label: '操控性',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '🎮'
  }
} as const;

/**
 * 應用程式常數
 */
export const APP_CONSTANTS = {
  COMBINATION_BONUS: 3,
  MIN_PROGRESS_WIDTH: 5,
  LOADING_DELAY: 500,
} as const;
