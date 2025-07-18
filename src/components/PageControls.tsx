import { StatType, SpeedType, HandlingType } from '@/types';
import CustomSelect from '@/components/CustomSelect';

interface PageControlsProps {
  currentPage: 'characters' | 'vehicles' | 'combinations' | 'recommendations';
  setCurrentPage: (page: 'characters' | 'vehicles' | 'combinations' | 'recommendations') => void;
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
        <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-2 mb-3">
          <button
            onClick={() => setCurrentPage('characters')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-center ${
              currentPage === 'characters'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎮 角色 ({charactersCount})
          </button>
          <button
            onClick={() => setCurrentPage('vehicles')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-center ${
              currentPage === 'vehicles'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏎️ 載具 ({vehiclesCount})
          </button>
          <button
            onClick={() => setCurrentPage('recommendations')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-center ${
              currentPage === 'recommendations'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏆 推薦組合
          </button>
          <button
            onClick={() => setCurrentPage('combinations')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-center ${
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
            {currentPage === 'combinations' && '建立和管理您的角色+載具組合'}
            {currentPage === 'recommendations' && '根據地形特性推薦最適合的組合'}
          </p>
          {currentPage !== 'combinations' && currentPage !== 'recommendations' && (
            <p className="text-xs text-gray-500 mt-1">
              💡 想建立角色+載具組合？前往 
              <button 
                onClick={() => setCurrentPage('combinations')}
                className="text-purple-600 hover:text-purple-800 font-medium mx-1 underline"
              >
                組合頁面
              </button>
            </p>
          )}
        </div>
      </div>

      {/* 篩選與排序 */}
      {currentPage !== 'combinations' && currentPage !== 'recommendations' && (
        <div className="border-t border-gray-200 pt-3">
          <h3 className="text-base font-medium text-gray-700 mb-3 text-center">🔧 篩選與排序</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 排序依據 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                排序依據
              </label>
              <CustomSelect
                value={sortBy}
                onChange={(value) => setSortBy(value as StatType)}
                options={[
                  { value: 'speed', label: '速度' },
                  { value: 'acceleration', label: '加速度' },
                  { value: 'weight', label: '重量' },
                  { value: 'handling', label: '轉向' }
                ]}
              />
            </div>

            {/* 速度篩選 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                速度類型
              </label>
              <CustomSelect
                value={speedFilter}
                onChange={(value) => setSpeedFilter(value as SpeedType | 'display')}
                options={[
                  { value: 'display', label: '遊戲顯示' },
                  { value: 'road', label: '道路' },
                  { value: 'terrain', label: '地形' },
                  { value: 'water', label: '水面' }
                ]}
              />
            </div>

            {/* 轉向篩選 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                轉向類型
              </label>
              <CustomSelect
                value={handlingFilter}
                onChange={(value) => setHandlingFilter(value as HandlingType | 'display')}
                options={[
                  { value: 'display', label: '遊戲顯示' },
                  { value: 'road', label: '道路' },
                  { value: 'terrain', label: '地形' },
                  { value: 'water', label: '水面' }
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
