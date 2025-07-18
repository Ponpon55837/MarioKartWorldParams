import { StatType, SpeedType, HandlingType } from '@/types';

interface PageControlsProps {
  currentPage: 'characters' | 'vehicles' | 'combinations';
  setCurrentPage: (page: 'characters' | 'vehicles' | 'combinations') => void;
  sortBy: StatType;
  setSortBy: (stat: StatType) => void;
  speedFilter: SpeedType | 'display';
  setSpeedFilter: (filter: SpeedType | 'display') => void;
  handlingFilter: HandlingType | 'display';
  setHandlingFilter: (filter: HandlingType | 'display') => void;
  charactersCount: number;
  vehiclesCount: number;
  combinationsCount: number;
}

export default function PageControls({
  currentPage,
  setCurrentPage,
  sortBy,
  setSortBy,
  speedFilter,
  setSpeedFilter,
  handlingFilter,
  setHandlingFilter,
  charactersCount,
  vehiclesCount,
  combinationsCount
}: PageControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
      {/* 分頁選擇 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">🎯 資料分頁</h3>
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <button
            onClick={() => setCurrentPage('characters')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage === 'characters'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎮 角色 ({charactersCount})
          </button>
          <button
            onClick={() => setCurrentPage('vehicles')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage === 'vehicles'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏎️ 載具 ({vehiclesCount})
          </button>
          <button
            onClick={() => setCurrentPage('combinations')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage === 'combinations'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⭐ 組合 ({combinationsCount})
          </button>
        </div>
        
        {/* 當前頁面說明 */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {currentPage === 'characters' && '瀏覽所有角色的能力值資料'}
            {currentPage === 'vehicles' && '瀏覽所有載具的能力值資料'}
            {currentPage === 'combinations' && '管理您建立的角色+載具組合'}
          </p>
        </div>
      </div>

      {/* 篩選與排序 */}
      <div className="border-t border-gray-200 pt-3">
        <h3 className="text-base font-medium text-gray-700 mb-3 text-center">🔧 篩選與排序</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 排序依據 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              排序依據
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as StatType)}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="speed">速度</option>
              <option value="acceleration">加速度</option>
              <option value="weight">重量</option>
              <option value="handling">轉向</option>
            </select>
          </div>

          {/* 速度篩選 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              速度類型
            </label>
            <select
              value={speedFilter}
              onChange={(e) => setSpeedFilter(e.target.value as SpeedType | 'display')}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="display">遊戲顯示</option>
              <option value="road">道路</option>
              <option value="terrain">地形</option>
              <option value="water">水面</option>
            </select>
          </div>

          {/* 轉向篩選 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              轉向類型
            </label>
            <select
              value={handlingFilter}
              onChange={(e) => setHandlingFilter(e.target.value as HandlingType | 'display')}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="display">遊戲顯示</option>
              <option value="road">道路</option>
              <option value="terrain">地形</option>
              <option value="water">水面</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
