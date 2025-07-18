import { CharacterStats, SpeedType, HandlingType } from '@/types';
import StatBar from '@/components/StatBar';

interface CharacterCardProps {
  character: CharacterStats;
  maxStats: {
    speed: number;
    acceleration: number;
    weight: number;
    handling: number;
  };
  speedFilter: SpeedType | 'display';
  handlingFilter: HandlingType | 'display';
}

/**
 * 角色卡片組件 - 顯示角色的詳細統計資料
 */
export default function CharacterCard({ character, maxStats, speedFilter, handlingFilter }: CharacterCardProps) {
  // 根據篩選器取得當前顯示的速度值
  const getSpeedValue = () => {
    switch (speedFilter) {
      case 'road': return character.roadSpeed;
      case 'terrain': return character.terrainSpeed;
      case 'water': return character.waterSpeed;
      default: return character.displaySpeed;
    }
  };

  // 根據篩選器取得當前顯示的轉向值
  const getHandlingValue = () => {
    switch (handlingFilter) {
      case 'road': return character.roadHandling;
      case 'terrain': return character.terrainHandling;
      case 'water': return character.waterHandling;
      default: return character.displayHandling;
    }
  };

  // 取得速度標籤
  const getSpeedLabel = () => {
    switch (speedFilter) {
      case 'road': return '道路速度';
      case 'terrain': return '地形速度';
      case 'water': return '水面速度';
      default: return '速度';
    }
  };

  // 取得轉向標籤
  const getHandlingLabel = () => {
    switch (handlingFilter) {
      case 'road': return '道路轉向';
      case 'terrain': return '地形轉向';
      case 'water': return '水面轉向';
      default: return '轉向';
    }
  };

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
          label={getSpeedLabel()}
          value={getSpeedValue()}
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
          label={getHandlingLabel()}
          value={getHandlingValue()}
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
            <div>道路轉向: {character.roadHandling}</div>
            <div>地形轉向: {character.terrainHandling}</div>
            <div>水面轉向: {character.waterHandling}</div>
          </div>
        </div>
      </details>
    </div>
  );
}
