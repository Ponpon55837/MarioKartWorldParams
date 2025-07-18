import { StatType, SpeedType, HandlingType } from '@/types';

interface FilterControlsProps {
  sortBy: StatType;
  setSortBy: (stat: StatType) => void;
  speedFilter: SpeedType | 'display';
  setSpeedFilter: (filter: SpeedType | 'display') => void;
  handlingFilter: HandlingType | 'display';
  setHandlingFilter: (filter: HandlingType | 'display') => void;
  showCharacters: boolean;
  setShowCharacters: (show: boolean) => void;
  showVehicles: boolean;
  setShowVehicles: (show: boolean) => void;
  showCombinations?: boolean;
  setShowCombinations?: (show: boolean) => void;
}

export default function FilterControls({
  sortBy,
  setSortBy,
  speedFilter,
  setSpeedFilter,
  handlingFilter,
  setHandlingFilter,
  showCharacters,
  setShowCharacters,
  showVehicles,
  setShowVehicles,
  showCombinations,
  setShowCombinations
}: FilterControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">篩選與排序</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 顯示類型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            顯示類型
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCharacters}
                onChange={(e) => setShowCharacters(e.target.checked)}
                className="mr-2"
              />
              角色
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showVehicles}
                onChange={(e) => setShowVehicles(e.target.checked)}
                className="mr-2"
              />
              載具
            </label>
            {showCombinations !== undefined && setShowCombinations && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showCombinations}
                  onChange={(e) => setShowCombinations(e.target.checked)}
                  className="mr-2"
                />
                組合
              </label>
            )}
          </div>
        </div>

        {/* 排序依據 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            排序依據
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as StatType)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mario-blue focus:border-transparent"
          >
            <option value="speed">速度</option>
            <option value="acceleration">加速度</option>
            <option value="weight">重量</option>
            <option value="handling">操控性</option>
          </select>
        </div>

        {/* 速度篩選 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            速度類型
          </label>
          <select
            value={speedFilter}
            onChange={(e) => setSpeedFilter(e.target.value as SpeedType | 'display')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mario-blue focus:border-transparent"
          >
            <option value="display">遊戲顯示</option>
            <option value="road">道路</option>
            <option value="terrain">地形</option>
            <option value="water">水面</option>
          </select>
        </div>

        {/* 操控性篩選 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            操控性類型
          </label>
          <select
            value={handlingFilter}
            onChange={(e) => setHandlingFilter(e.target.value as HandlingType | 'display')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-mario-blue focus:border-transparent"
          >
            <option value="display">遊戲顯示</option>
            <option value="road">道路</option>
            <option value="terrain">地形</option>
            <option value="water">水面</option>
          </select>
        </div>
      </div>
    </div>
  );
}
