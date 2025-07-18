import React, { useState, useMemo, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { recommendedCombinationsAtom } from '@/store/atoms';
import RecommendationCard from '@/components/RecommendationCard';
import { getTerrainIcon, getTerrainName, getTerrainDescription } from '@/constants/terrain';

const RecommendationsPage: React.FC = () => {
  const [selectedTerrain, setSelectedTerrain] = useState<'road' | 'terrain' | 'water'>('road');
  const recommendations = useAtomValue(recommendedCombinationsAtom);

  // 使用 useMemo 優化當前推薦計算
  const currentRecommendations = useMemo(() => {
    return recommendations[selectedTerrain] || [];
  }, [recommendations, selectedTerrain]);

  // 使用 useCallback 優化事件處理
  const handleTerrainChange = useCallback((terrain: 'road' | 'terrain' | 'water') => {
    setSelectedTerrain(terrain);
  }, []);

  return (
    <div className="space-y-6">
      {/* 地形選擇器 */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-2">
        {(['road', 'terrain', 'water'] as const).map((terrain) => (
          <button
            key={terrain}
            onClick={() => handleTerrainChange(terrain)}
            className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex-1 sm:flex-none ${
              selectedTerrain === terrain
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
            }`}
          >
            <span className="text-xl sm:text-2xl">{getTerrainIcon(terrain)}</span>
            <div className="text-center sm:text-left">
              <div className="text-base sm:text-lg">{getTerrainName(terrain)}</div>
              <div className="text-xs opacity-80 hidden sm:block">{getTerrainDescription(terrain)}</div>
            </div>
          </button>
        ))}
      </div>

      {/* 當前選擇的地形資訊 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-1">
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            綜合分數計算：速度 40% + 操控性 30% + 加速度 20% - 重量 10%
          </p>
        </div>
      </div>

      {/* 推薦組合列表 */}
      {currentRecommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-500 text-lg">正在計算推薦組合...</p>
          <p className="text-gray-400 text-sm mt-2">請確保角色和載具資料已載入</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              maxStats={recommendations.maxCombinedStats}
            />
          ))}
        </div>
      )}

      {/* 使用說明 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 使用說明</h3>
        <ul className="text-sm text-yellow-700 space-y-2">
          <li>• <strong>道路地形</strong>：適合大部分標準賽道，注重速度和操控性平衡</li>
          <li>• <strong>地形</strong>：適合越野賽道，更注重加速度和重量穩定性</li>
          <li>• <strong>水面</strong>：適合水上賽道，需要特殊的操控技巧</li>
          <li>• <strong>排名</strong>：根據綜合分數排列，金銀銅牌代表前三名</li>
          <li>• <strong>綜合分數</strong>：考慮所有能力值的加權計算結果</li>
        </ul>
      </div>
    </div>
  );
};

export default RecommendationsPage;
