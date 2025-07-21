'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { loadDataAtom, charactersAtom, vehiclesAtom, loadingAtom, errorAtom } from '@/store/atoms';

export default function DebugDataLoading() {
  const { t } = useTranslation();
  const loading = useAtomValue(loadingAtom);
  const error = useAtomValue(errorAtom);
  const characters = useAtomValue(charactersAtom);
  const vehicles = useAtomValue(vehiclesAtom);
  const loadData = useSetAtom(loadDataAtom);

  const handleManualLoad = () => {
    console.log('手動觸發載入...');
    loadData();
  };

  const testDirectFetch = async () => {
    try {
      console.log('直接測試 fetch...');
      const response = await fetch('/mario-kart-data.csv');
      console.log('Response:', response.status, response.statusText);
      const text = await response.text();
      console.log('Content length:', text.length);
      console.log('First 500 chars:', text.slice(0, 500));
    } catch (err) {
      console.error('Direct fetch error:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🐛 {t('debug.title')}</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800">{t('debug.loadingState')}</div>
            <div className={`text-lg font-bold ${loading ? 'text-yellow-600' : 'text-blue-600'}`}>
              {loading ? t('debug.loading') : t('debug.idle')}
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-green-800">{t('debug.charactersCount')}</div>
            <div className="text-lg font-bold text-green-600">{characters.length}</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-purple-800">{t('debug.vehiclesCount')}</div>
            <div className="text-lg font-bold text-purple-600">{vehicles.length}</div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-red-800">{t('debug.errorState')}</div>
            <div className="text-sm text-red-600">{error || t('debug.noError')}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleManualLoad}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            🔄 {t('debug.manualLoad')}
          </button>
          
          <button
            onClick={testDirectFetch}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            🧪 {t('debug.testDirectFetch')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="text-red-800 font-medium">{t('debug.errorDetails')}</div>
            <div className="text-red-700 text-sm mt-1">{error}</div>
          </div>
        )}

        {characters.length > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="text-green-800 font-medium mb-2">{t('debug.loadSuccess')}{t('debug.firstCharacters')}</div>
            <div className="text-sm text-green-700">
              {characters.slice(0, 3).map((char, idx) => (
                <div key={idx}>
                  {idx + 1}. {char.name} ({char.englishName}) - {t('debug.speed')}: {char.displaySpeed}
                </div>
              ))}
            </div>
          </div>
        )}

        {vehicles.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="text-purple-800 font-medium mb-2">{t('debug.loadSuccess')}{t('debug.firstVehicles')}</div>
            <div className="text-sm text-purple-700">
              {vehicles.slice(0, 3).map((vehicle, idx) => (
                <div key={idx}>
                  {idx + 1}. {vehicle.name} ({vehicle.englishName}) - {t('debug.speed')}: {vehicle.displaySpeed}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
