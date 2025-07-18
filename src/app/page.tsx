'use client';

import CharacterCard from '@/components/CharacterCard';
import VehicleCard from '@/components/VehicleCard';
import CombinationCard from '@/components/CombinationCard';
import CombinationSelector from '@/components/CombinationSelector';
import PageControls from '@/components/PageControls';
import { useMarioKartStore } from '@/hooks/useMarioKartStore';

export default function Home() {
  // 使用 Jotai store 管理所有狀態
  const {
    loading,
    error,
    characters,
    vehicles,
    maxStats,
    sortedCharacters,
    sortedVehicles,
    sortBy,
    setSortBy,
    speedFilter,
    setSpeedFilter,
    handlingFilter,
    setHandlingFilter,
    currentPage,
    setCurrentPage,
    combinations,
    addCombination,
    removeCombination,
    clearAllCombinations,
  } = useMarioKartStore();

  // 載入中狀態
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mario-red mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">載入瑪利歐賽車資料中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">❌ 載入錯誤</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageControls
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sortBy={sortBy}
        setSortBy={setSortBy}
        speedFilter={speedFilter}
        setSpeedFilter={setSpeedFilter}
        handlingFilter={handlingFilter}
        setHandlingFilter={setHandlingFilter}
        charactersCount={sortedCharacters.length}
        vehiclesCount={sortedVehicles.length}
        combinationsCount={combinations.length}
      />

      {/* 管理員快速入口 */}
      <div className="text-center mb-4">
        <a
          href="/admin"
          className="inline-flex items-center px-3 py-1 text-xs text-gray-500 hover:text-blue-600 transition-colors border border-gray-300 rounded-full hover:border-blue-300"
        >
          🔧 數據管理
        </a>
      </div>

      {/* 組合頁面 */}
      {currentPage === 'combinations' && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center flex-1">
              ⭐ 角色+載具組合 ({combinations.length})
            </h2>
            {combinations.length > 0 && (
              <button
                onClick={clearAllCombinations}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                🗑️ 清除全部
              </button>
            )}
          </div>
          
          {/* 組合選擇器 */}
          <CombinationSelector
            characters={characters}
            vehicles={vehicles}
            onAddCombination={addCombination}
          />
          
          {combinations.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg mt-4">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 text-lg mb-2">還沒有建立任何組合</p>
              <p className="text-gray-400 mb-4">使用上方的選擇器來建立您的第一個組合！</p>
              <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200 inline-block">
                💡 選擇一個角色和一個載具，然後點擊「建立組合」按鈕
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {combinations.map((combination) => (
                <CombinationCard
                  key={combination.id}
                  character={combination.character}
                  vehicle={combination.vehicle}
                  onRemove={() => removeCombination(combination.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 角色頁面 */}
      {currentPage === 'characters' && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🎮 角色 ({sortedCharacters.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedCharacters.map((character) => (
              <CharacterCard
                key={character.name}
                character={character}
                maxStats={maxStats}
                speedFilter={speedFilter}
                handlingFilter={handlingFilter}
              />
            ))}
          </div>
        </section>
      )}

      {/* 載具頁面 */}
      {currentPage === 'vehicles' && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🏎️ 載具 ({sortedVehicles.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.name}
                vehicle={vehicle}
                maxStats={maxStats}
                speedFilter={speedFilter}
                handlingFilter={handlingFilter}
              />
            ))}
          </div>
        </section>
      )}

      {/* 說明區塊 */}
      <section className="bg-white rounded-lg shadow-md p-4 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">📊 能力值說明與圖例</h2>
        
        {/* 顏色圖例 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-base mb-2 text-gray-800">🎨 能力值顏色圖例</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700 font-medium text-sm">速度</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium text-sm">加速度</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-purple-700 font-medium text-sm">重量</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-orange-700 font-medium text-sm">轉向</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-base mb-2 text-blue-600">🏎️ 速度 (Speed)</h3>
            <ul className="space-y-1">
              <li><strong>道路：</strong>混凝土、瀝青、金屬等平滑地面</li>
              <li><strong>地形：</strong>泥土、沙子、雪地等粗糙地面</li>
              <li><strong>水面：</strong>觸發水上載具模式的水域</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-base mb-2 text-green-600">⚡ 其他能力值</h3>
            <ul className="space-y-1">
              <li><strong>加速度：</strong>從靜止到最高速度的時間</li>
              <li><strong>重量：</strong>影響碰撞結果和金幣加成</li>
              <li><strong>轉向：</strong>載具轉彎的靈活程度</li>
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
            表格中的數值為原始資料，實際遊戲中會有所調整。
          </p>
        </div>
        <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
          <p className="text-sm text-green-800">
            <strong>💾 自動儲存：</strong>您建立的組合會自動儲存到本地，下次開啟網站時會自動載入您的組合設定！
          </p>
        </div>
      </section>
    </div>
  );
}
