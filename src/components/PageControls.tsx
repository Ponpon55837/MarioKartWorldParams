import { StatType, SpeedType, HandlingType } from '@/types';
import CustomSelect from '@/components/CustomSelect';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
      {/* 分頁選擇 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">🎯 {t('navigation.dataPages')}</h3>
        <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-2 mb-3">
          <button
            onClick={() => setCurrentPage('characters')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-center ${
              currentPage === 'characters'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎮 {t('navigation.characters')} ({charactersCount})
          </button>
          <button
            onClick={() => setCurrentPage('vehicles')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-center ${
              currentPage === 'vehicles'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏎️ {t('navigation.vehicles')} ({vehiclesCount})
          </button>
          <button
            onClick={() => setCurrentPage('combinations')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-center ${
              currentPage === 'combinations'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⭐ {t('navigation.combinations')} ({combinationsCount})
          </button>
          <button
            onClick={() => setCurrentPage('recommendations')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-center ${
              currentPage === 'recommendations'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏆 {t('navigation.recommendations')}
          </button>          
        </div>
        
        {/* 當前頁面說明 */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {currentPage === 'characters' && t('navigation.descriptions.characters')}
            {currentPage === 'vehicles' && t('navigation.descriptions.vehicles')}
            {currentPage === 'combinations' && t('navigation.descriptions.combinations')}
            {currentPage === 'recommendations' && t('navigation.descriptions.recommendations')}
          </p>
          {currentPage !== 'combinations' && currentPage !== 'recommendations' && (
            <p className="text-xs text-gray-500 mt-1">
              💡 {t('navigation.goToCombinations')}
              <button 
                onClick={() => setCurrentPage('combinations')}
                className="text-purple-600 hover:text-purple-800 font-medium mx-1 underline"
              >
                {t('navigation.combinationsPage')}
              </button>
            </p>
          )}
        </div>
      </div>

      {/* 篩選與排序 */}
      {currentPage !== 'combinations' && currentPage !== 'recommendations' && (
        <div className="border-t border-gray-200 pt-3">
          <h3 className="text-base font-medium text-gray-700 mb-3 text-center">🔧 {t('navigation.filterAndSort')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 排序依據 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('sorting.sortBy')}
              </label>
              <CustomSelect
                value={sortBy}
                onChange={(value) => setSortBy(value as StatType)}
                options={[
                  { value: 'speed', label: t('stats.speed') },
                  { value: 'acceleration', label: t('stats.acceleration') },
                  { value: 'weight', label: t('stats.weight') },
                  { value: 'handling', label: t('stats.handling') }
                ]}
              />
            </div>

            {/* 速度篩選 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('stats.speedType')}
              </label>
              <CustomSelect
                value={speedFilter}
                onChange={(value) => setSpeedFilter(value as SpeedType | 'display')}
                options={[
                  { value: 'display', label: t('stats.display') },
                  { value: 'road', label: t('stats.road') },
                  { value: 'terrain', label: t('stats.terrain') },
                  { value: 'water', label: t('stats.water') }
                ]}
              />
            </div>

            {/* 轉向篩選 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('stats.handlingType')}
              </label>
              <CustomSelect
                value={handlingFilter}
                onChange={(value) => setHandlingFilter(value as HandlingType | 'display')}
                options={[
                  { value: 'display', label: t('stats.display') },
                  { value: 'road', label: t('stats.road') },
                  { value: 'terrain', label: t('stats.terrain') },
                  { value: 'water', label: t('stats.water') }
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
