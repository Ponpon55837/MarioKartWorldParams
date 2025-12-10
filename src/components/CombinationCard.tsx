'use client';
import { CharacterStats, VehicleStats } from '@/types';
import { getStatBarWidth } from '@/utils/csvParser';
import { useTranslation } from 'react-i18next';

interface CombinationCardProps {
  character: CharacterStats;
  vehicle: VehicleStats;
  onRemove: () => void;
}

export default function CombinationCard({ character, vehicle, onRemove }: CombinationCardProps) {
  const { t } = useTranslation();

  // 計算組合後的總能力值 (角色 + 載具 + 3 的遊戲加成)
  const combinedStats = {
    displaySpeed: character.displaySpeed + vehicle.displaySpeed + 3,
    roadSpeed: character.roadSpeed + vehicle.roadSpeed + 3,
    terrainSpeed: character.terrainSpeed + vehicle.terrainSpeed + 3,
    waterSpeed: character.waterSpeed + vehicle.waterSpeed + 3,
    acceleration: character.acceleration + vehicle.acceleration + 3,
    weight: character.weight + vehicle.weight + 3,
    displayHandling: character.displayHandling + vehicle.displayHandling + 3,
    roadHandling: character.roadHandling + vehicle.roadHandling + 3,
    terrainHandling: character.terrainHandling + vehicle.terrainHandling + 3,
    waterHandling: character.waterHandling + vehicle.waterHandling + 3
  };

  // 計算最大可能值（用於進度條比例）
  const maxPossibleValue = 10 + 7 + 3; // 最高角色值 + 最高載具值 + 遊戲加成

  const stats = [
    {
      label: t('stats.speed'),
      value: combinedStats.displaySpeed,
      charValue: character.displaySpeed,
      vehicleValue: vehicle.displaySpeed,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: t('stats.acceleration'),
      value: combinedStats.acceleration,
      charValue: character.acceleration,
      vehicleValue: vehicle.acceleration,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      lightBg: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: t('stats.weight'),
      value: combinedStats.weight,
      charValue: character.weight,
      vehicleValue: vehicle.weight,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      label: t('stats.handling'),
      value: combinedStats.displayHandling,
      charValue: character.displayHandling,
      vehicleValue: vehicle.displayHandling,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      lightBg: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 border border-yellow-300 relative">
      {/* 移除按鈕 */}
      <button onClick={onRemove} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold">
        ×
      </button>

      {/* 組合標題 */}
      <div className="text-center mb-3">
        <div className="bg-yellow-100 rounded-lg p-2 border border-yellow-300">
          <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
            {character.name} + {vehicle.name}
          </h3>
          <p className="text-xs text-gray-600">
            {character.englishName} + {vehicle.englishName}
          </p>
        </div>
      </div>

      {/* 能力值顯示 */}
      <div className="space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className={`p-2 rounded-lg ${stat.lightBg} border ${stat.borderColor}`}>
            <div className="flex items-center justify-between mb-1">
              <div className={`text-xs font-semibold ${stat.color}`}>{stat.label}</div>
              <div className={`text-sm font-semibold ${stat.color}`}>{stat.value}</div>
            </div>
            <div className="flex items-center mb-1">
              <div className="flex-1 mx-1">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${stat.bgColor}`} style={{ width: getStatBarWidth(stat.value, maxPossibleValue) }} />
                </div>
              </div>
              <div className="text-xs text-gray-500 ml-2">{Math.round((stat.value / maxPossibleValue) * 100)}%</div>
            </div>
            {/* 組成明細 */}
            <div className="text-xs text-gray-600 flex justify-between">
              <span>
                {t('types.character')}: {stat.charValue}
              </span>
              <span>
                {t('types.vehicle')}: {stat.vehicleValue}
              </span>
              <span className="text-yellow-600 font-semibold">+3</span>
            </div>
          </div>
        ))}
      </div>

      {/* 詳細速度分佈 */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-600 font-semibold mb-1 text-center">{t('combination.detailedSpeedDistribution')}</div>
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div className="text-center p-1 bg-blue-50 rounded border border-blue-200">
            <div className="font-semibold text-blue-700">{t('combination.terrainNames.road')}</div>
            <div className="text-blue-600 font-bold text-xs">{combinedStats.roadSpeed}</div>
            <div className="text-gray-500 text-xs">
              {character.roadSpeed}+{vehicle.roadSpeed}+3
            </div>
          </div>
          <div className="text-center p-1 bg-green-50 rounded border border-green-200">
            <div className="font-semibold text-green-700">{t('combination.terrainNames.terrain')}</div>
            <div className="text-green-600 font-bold text-xs">{combinedStats.terrainSpeed}</div>
            <div className="text-gray-500 text-xs">
              {character.terrainSpeed}+{vehicle.terrainSpeed}+3
            </div>
          </div>
          <div className="text-center p-1 bg-cyan-50 rounded border border-cyan-200">
            <div className="font-semibold text-cyan-700">{t('combination.terrainNames.water')}</div>
            <div className="text-cyan-600 font-bold text-xs">{combinedStats.waterSpeed}</div>
            <div className="text-gray-500 text-xs">
              {character.waterSpeed}+{vehicle.waterSpeed}+3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
