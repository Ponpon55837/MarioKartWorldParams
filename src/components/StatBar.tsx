import { STAT_CONFIGS, APP_CONSTANTS } from '@/constants';
import { getStatColor } from '@/utils/csvParser';

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  statType: keyof typeof STAT_CONFIGS;
  showPercentage?: boolean;
}

/**
 * 統計條組件 - 顯示能力值的進度條
 */
export default function StatBar({ 
  label, 
  value, 
  maxValue, 
  statType, 
  showPercentage = true 
}: StatBarProps) {
  const config = STAT_CONFIGS[statType];
  const percentage = Math.round((value / maxValue) * 100);
  const width = Math.max(percentage, APP_CONSTANTS.MIN_PROGRESS_WIDTH);

  return (
    <div className={`p-3 rounded-lg ${config.lightBg} ${config.borderColor} border`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${config.color}`}>
          {config.icon} {label}
        </span>
        {showPercentage && (
          <span className={`text-xs ${config.color}`}>
            {value}/{maxValue} ({percentage}%)
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-in-out ${config.bgColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
