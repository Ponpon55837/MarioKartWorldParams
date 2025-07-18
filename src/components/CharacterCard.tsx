import { CharacterStats } from '@/types';
import { getStatColor, getStatBarWidth } from '@/utils/csvParser';

interface CharacterCardProps {
  character: CharacterStats;
  maxStats: {
    speed: number;
    acceleration: number;
    weight: number;
    handling: number;
  };
}

export default function CharacterCard({ character, maxStats }: CharacterCardProps) {
  const stats = [
    { 
      label: '速度', 
      value: character.displaySpeed, 
      max: maxStats.speed,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      label: '加速度', 
      value: character.acceleration, 
      max: maxStats.acceleration,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      lightBg: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      label: '重量', 
      value: character.weight, 
      max: maxStats.weight,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      label: '操控性', 
      value: character.displayHandling, 
      max: maxStats.handling,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      lightBg: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-2 border-gray-200 hover:border-mario-blue">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{character.name}</h3>
        <p className="text-sm text-gray-600">{character.englishName}</p>
      </div>
      
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className={`p-3 rounded-lg ${stat.lightBg} border ${stat.borderColor}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-sm font-bold ${stat.color}`}>
                {stat.label}
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-1 mx-1">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stat.bgColor}`}
                    style={{ width: getStatBarWidth(stat.value, stat.max) }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 ml-2">
                {Math.round((stat.value / stat.max) * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600 font-semibold mb-2 text-center">詳細速度分佈</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
            <div className="font-semibold text-blue-700">道路</div>
            <div className="text-blue-600 font-bold text-sm">{character.roadSpeed}</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded border border-green-200">
            <div className="font-semibold text-green-700">地形</div>
            <div className="text-green-600 font-bold text-sm">{character.terrainSpeed}</div>
          </div>
          <div className="text-center p-2 bg-cyan-50 rounded border border-cyan-200">
            <div className="font-semibold text-cyan-700">水面</div>
            <div className="text-cyan-600 font-bold text-sm">{character.waterSpeed}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
