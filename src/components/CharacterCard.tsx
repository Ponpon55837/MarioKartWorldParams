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
    <div className="bg-white rounded-lg shadow-md p-3 card-hover border border-gray-200">
      {/* 角色名稱 */}
      <div className="text-center mb-3">
        <h3 className="text-base font-semibold text-gray-800 mb-0.5">
          {character.name}
        </h3>
        <p className="text-xs text-gray-500">
          {character.englishName}
        </p>
      </div>

      {/* 統計資料 */}
      <div className="space-y-2">
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
      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800 transition-colors">
          📊 詳細資料
        </summary>
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <div className="grid grid-cols-2 gap-1 text-xs">
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
