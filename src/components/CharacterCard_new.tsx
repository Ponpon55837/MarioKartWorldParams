import { CharacterStats } from '@/types';
import StatBar from './StatBar';

interface CharacterCardProps {
  character: CharacterStats;
  maxStats: {
    speed: number;
    acceleration: number;
    weight: number;
    handling: number;
  };
}

/**
 * 角色卡片組件 - 顯示角色的詳細統計資料
 */
export default function CharacterCard({ character, maxStats }: CharacterCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 card-hover">
      {/* 角色名稱 */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          {character.name}
        </h3>
        <p className="text-sm text-gray-500">
          {character.englishName}
        </p>
      </div>

      {/* 統計資料 */}
      <div className="space-y-3">
        <StatBar
          label="速度"
          value={character.displaySpeed}
          maxValue={maxStats.speed}
          statType="speed"
        />
        
        <StatBar
          label="加速度"
          value={character.acceleration}
          maxValue={maxStats.acceleration}
          statType="acceleration"
        />
        
        <StatBar
          label="重量"
          value={character.weight}
          maxValue={maxStats.weight}
          statType="weight"
        />
        
        <StatBar
          label="操控性"
          value={character.displayHandling}
          maxValue={maxStats.handling}
          statType="handling"
        />
      </div>

      {/* 詳細統計 */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors">
          📊 詳細數據
        </summary>
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div>道路速度: {character.roadSpeed}</div>
            <div>地形速度: {character.terrainSpeed}</div>
            <div>水面速度: {character.waterSpeed}</div>
            <div>道路操控: {character.roadHandling}</div>
            <div>地形操控: {character.terrainHandling}</div>
            <div>水面操控: {character.waterHandling}</div>
          </div>
        </div>
      </details>
    </div>
  );
}
