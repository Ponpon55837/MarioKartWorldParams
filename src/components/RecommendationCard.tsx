import React from 'react';
import { CharacterStats, VehicleStats } from '@/types';
import StatBar from '@/components/StatBar';

interface RecommendationCardProps {
  recommendation: {
    character: CharacterStats;
    vehicle: VehicleStats;
    score: number;
    totalSpeed: number;
    totalHandling: number;
    totalAcceleration: number;
    totalWeight: number;
    terrain: 'road' | 'terrain' | 'water';
    rank: number;
    id: string;
  };
  maxStats: {
    speed: number;
    acceleration: number;
    weight: number;
    handling: number;
  };
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  maxStats 
}) => {
  const { character, vehicle, score, totalSpeed, totalHandling, totalAcceleration, totalWeight, terrain, rank } = recommendation;

  const getTerrainIcon = (terrain: string) => {
    switch (terrain) {
      case 'road': return '🏁';
      case 'terrain': return '🌄';
      case 'water': return '🌊';
      default: return '🏁';
    }
  };

  const getTerrainName = (terrain: string) => {
    switch (terrain) {
      case 'road': return '道路';
      case 'terrain': return '地形';
      case 'water': return '水面';
      default: return '道路';
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
    return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 border-2 border-gray-100">
      {/* 排名徽章 */}
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(rank)}`}>
          {rank}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getTerrainIcon(terrain)}</span>
          <span className="text-sm font-medium text-gray-600">{getTerrainName(terrain)}</span>
        </div>
      </div>

      {/* 角色與載具組合 */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-gray-800">{character.name}</div>
          <div className="text-xs text-gray-500">角色</div>
        </div>
        <div className="text-2xl">+</div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-gray-800">{vehicle.name}</div>
          <div className="text-xs text-gray-500">載具</div>
        </div>
      </div>

      {/* 綜合分數 */}
      <div className="mb-4 text-center">
        <div className="text-sm text-gray-600">綜合分數</div>
        <div className="text-2xl font-bold text-green-600">{score.toFixed(1)}</div>
      </div>

      {/* 組合統計 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">速度</span>
          <span className="text-sm font-medium">{totalSpeed.toFixed(1)}</span>
        </div>
        <StatBar
          value={totalSpeed}
          maxValue={maxStats.speed}
          statType="speed"
          label="速度"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">操控性</span>
          <span className="text-sm font-medium">{totalHandling.toFixed(1)}</span>
        </div>
        <StatBar
          value={totalHandling}
          maxValue={maxStats.handling}
          statType="handling"
          label="操控性"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">加速度</span>
          <span className="text-sm font-medium">{totalAcceleration.toFixed(1)}</span>
        </div>
        <StatBar
          value={totalAcceleration}
          maxValue={maxStats.acceleration}
          statType="acceleration"
          label="加速度"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">重量</span>
          <span className="text-sm font-medium">{totalWeight.toFixed(1)}</span>
        </div>
        <StatBar
          value={totalWeight}
          maxValue={maxStats.weight}
          statType="weight"
          label="重量"
        />
      </div>

      {/* 地形特化提示 */}
      <div className="mt-4 p-2 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 text-center">
          專為 <span className="font-semibold text-gray-800">{getTerrainName(terrain)}</span> 地形優化
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
