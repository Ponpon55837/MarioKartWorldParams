'use client';

import { useState, useEffect } from 'react';
import { CharacterStats, VehicleStats, StatType, SpeedType, HandlingType, CombinationStats } from '@/types';
import { parseMarioKartCSV } from '@/utils/csvParser';
import CharacterCard from '@/components/CharacterCard';
import VehicleCard from '@/components/VehicleCard';
import CombinationCard from '@/components/CombinationCard';
import CombinationSelector from '@/components/CombinationSelector';
import FilterControls from '@/components/FilterControls';

export default function Home() {
  const [characters, setCharacters] = useState<CharacterStats[]>([]);
  const [vehicles, setVehicles] = useState<VehicleStats[]>([]);
  const [combinations, setCombinations] = useState<CombinationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 篩選狀態
  const [sortBy, setSortBy] = useState<StatType>('speed');
  const [speedFilter, setSpeedFilter] = useState<SpeedType | 'display'>('display');
  const [handlingFilter, setHandlingFilter] = useState<HandlingType | 'display'>('display');
  const [showCharacters, setShowCharacters] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showCombinations, setShowCombinations] = useState(true);

  useEffect(() => {
    console.log('Starting to fetch CSV data...');
    fetch('/mario-kart-data.csv')
      .then(response => {
        console.log('CSV fetch response:', response.status);
        return response.text();
      })
      .then(csvContent => {
        console.log('CSV content length:', csvContent.length);
        console.log('First 200 chars:', csvContent.substring(0, 200));
        const parsedData = parseMarioKartCSV(csvContent);
        console.log('Parsed data:', parsedData);
        setCharacters(parsedData.characters);
        setVehicles(parsedData.vehicles);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  // 計算最大值用於進度條
  const maxStats = {
    speed: Math.max(
      1, // 設定最小值為1，避免空數組的問題
      ...characters.map(c => c.displaySpeed),
      ...vehicles.map(v => v.displaySpeed)
    ),
    acceleration: Math.max(
      1,
      ...characters.map(c => c.acceleration),
      ...vehicles.map(v => v.acceleration)
    ),
    weight: Math.max(
      1,
      ...characters.map(c => c.weight),
      ...vehicles.map(v => v.weight)
    ),
    handling: Math.max(
      1,
      ...characters.map(c => c.displayHandling),
      ...vehicles.map(v => v.displayHandling)
    ),
  };

  // 添加組合的函數
  const handleAddCombination = (character: CharacterStats, vehicle: VehicleStats) => {
    const id = `${character.name}-${vehicle.name}-${Date.now()}`;
    const newCombination: CombinationStats = {
      id,
      character,
      vehicle,
      combinedStats: {
        displaySpeed: character.displaySpeed + vehicle.displaySpeed + 3,
        roadSpeed: character.roadSpeed + vehicle.roadSpeed + 3,
        terrainSpeed: character.terrainSpeed + vehicle.terrainSpeed + 3,
        waterSpeed: character.waterSpeed + vehicle.waterSpeed + 3,
        acceleration: character.acceleration + vehicle.acceleration + 3,
        weight: character.weight + vehicle.weight + 3,
        displayHandling: character.displayHandling + vehicle.displayHandling + 3,
        roadHandling: character.roadHandling + vehicle.roadHandling + 3,
        terrainHandling: character.terrainHandling + vehicle.terrainHandling + 3,
        waterHandling: character.waterHandling + vehicle.waterHandling + 3,
      },
    };
    setCombinations(prev => [...prev, newCombination]);
  };

  // 移除組合的函數
  const handleRemoveCombination = (id: string) => {
    setCombinations(prev => prev.filter(combo => combo.id !== id));
  };

  // 排序函數
  const getSortValue = (item: CharacterStats | VehicleStats, stat: StatType) => {
    switch (stat) {
      case 'speed':
        return speedFilter === 'display' 
          ? item.displaySpeed 
          : speedFilter === 'road' 
            ? item.roadSpeed
            : speedFilter === 'terrain'
              ? item.terrainSpeed
              : item.waterSpeed;
      case 'acceleration':
        return item.acceleration;
      case 'weight':
        return item.weight;
      case 'handling':
        return handlingFilter === 'display'
          ? item.displayHandling
          : handlingFilter === 'road'
            ? item.roadHandling
            : handlingFilter === 'terrain'
              ? item.terrainHandling
              : item.waterHandling;
      default:
        return 0;
    }
  };

  // 排序後的數據
  const sortedCharacters = [...characters].sort((a, b) => 
    getSortValue(b, sortBy) - getSortValue(a, sortBy)
  );

  const sortedVehicles = [...vehicles].sort((a, b) => 
    getSortValue(b, sortBy) - getSortValue(a, sortBy)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mario-red mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          <h2 className="text-xl font-bold mb-2">載入錯誤</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 組合選擇器 */}
      <CombinationSelector
        characters={characters}
        vehicles={vehicles}
        onAddCombination={handleAddCombination}
      />

      <FilterControls
        sortBy={sortBy}
        setSortBy={setSortBy}
        speedFilter={speedFilter}
        setSpeedFilter={setSpeedFilter}
        handlingFilter={handlingFilter}
        setHandlingFilter={setHandlingFilter}
        showCharacters={showCharacters}
        setShowCharacters={setShowCharacters}
        showVehicles={showVehicles}
        setShowVehicles={setShowVehicles}
        showCombinations={showCombinations}
        setShowCombinations={setShowCombinations}
      />

      {/* 組合區塊 */}
      {showCombinations && (
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            ⭐ 角色+載具組合 ({combinations.length})
          </h2>
          {combinations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg mb-4">還沒有建立任何組合</p>
              <p className="text-gray-400">使用上方的組合選擇器來建立您的第一個組合！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combinations.map((combination) => (
                <CombinationCard
                  key={combination.id}
                  character={combination.character}
                  vehicle={combination.vehicle}
                  onRemove={() => handleRemoveCombination(combination.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 角色區塊 */}
      {showCharacters && (
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🎮 角色 ({sortedCharacters.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCharacters.map((character) => (
              <CharacterCard
                key={character.name}
                character={character}
                maxStats={maxStats}
              />
            ))}
          </div>
        </section>
      )}

      {/* 載具區塊 */}
      {showVehicles && (
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🏎️ 載具 ({sortedVehicles.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.name}
                vehicle={vehicle}
                maxStats={maxStats}
              />
            ))}
          </div>
        </section>
      )}

      {/* 說明區塊 */}
      <section className="bg-white rounded-lg shadow-lg p-6 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 能力值說明與圖例</h2>
        
        {/* 顏色圖例 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-lg mb-3 text-gray-800">🎨 能力值顏色圖例</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700 font-semibold">速度</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-semibold">加速度</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-purple-700 font-semibold">重量</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-orange-700 font-semibold">操控性</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h3 className="font-bold text-lg mb-2 text-blue-600">🏎️ 速度 (Speed)</h3>
            <ul className="space-y-1">
              <li><strong>道路：</strong>混凝土、瀝青、金屬等平滑地面</li>
              <li><strong>地形：</strong>泥土、沙子、雪地等粗糙地面</li>
              <li><strong>水面：</strong>觸發水上載具模式的水域</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2 text-green-600">⚡ 其他能力值</h3>
            <ul className="space-y-1">
              <li><strong>加速度：</strong>從靜止到最高速度的時間</li>
              <li><strong>重量：</strong>影響碰撞結果和金幣加成</li>
              <li><strong>操控性：</strong>載具轉彎的靈活程度</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-800">
            <strong>💡 使用提示：</strong>顏色越深的進度條代表該能力值越高。百分比顯示相對於最高值的比例，幫助您快速比較不同角色和載具的優劣！
          </p>
        </div>
        <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
          <p className="text-sm text-red-800">
            <strong>⚠️ 注意：</strong>遊戲中所有角色與載具組合都會額外獲得 +3 的能力值加成。
            表格中的數值為原始數據，實際遊戲中會有所調整。
          </p>
        </div>
      </section>
    </div>
  );
}
