'use client';

import { useCombinations } from '@/hooks/useMarioKartStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClientMounted } from '@/hooks/useClientMounted';

export default function TestPersistence() {
  const { t } = useTranslation();
  const mounted = useClientMounted();
  const { combinations, addCombination, clearAllCombinations } = useCombinations();
  const [testResult, setTestResult] = useState<string>('');

  // 創建測試資料
  const testCharacter = {
    name: t('test.mario'),
    englishName: 'Test Mario',
    displaySpeed: 5,
    roadSpeed: 5,
    terrainSpeed: 5,
    waterSpeed: 5,
    acceleration: 5,
    weight: 5,
    displayHandling: 5,
    roadHandling: 5,
    terrainHandling: 5,
    waterHandling: 5,
  };

  const testVehicle = {
    name: t('test.vehicle'),
    englishName: 'Test Kart',
    displaySpeed: 3,
    roadSpeed: 3,
    terrainSpeed: 3,
    waterSpeed: 3,
    acceleration: 3,
    weight: 3,
    displayHandling: 3,
    roadHandling: 3,
    terrainHandling: 3,
    waterHandling: 3,
  };

  const testPersistence = () => {
    // 清除現有組合
    clearAllCombinations();
    
    // 添加測試組合
    addCombination(testCharacter, testVehicle);
    
    setTestResult(t('test.added'));
    
    // 3秒後檢查結果
    setTimeout(() => {
      const stored = localStorage.getItem('mario-kart-combinations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setTestResult(t('test.success'));
        } else {
          setTestResult(t('test.failNoData'));
        }
      } else {
        setTestResult(t('test.failNoKey'));
      }
    }, 1000);
  };

  // 避免 SSR 水合不匹配問題
  if (!mounted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🧪 {t('test.loading')}</h3>
        <div className="text-center py-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🧪 {t('test.title')}</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>{t('test.currentCount')}</strong>{combinations.length}
          </p>
          <p className="text-xs text-blue-600">
            {t('test.autoSaveInfo')}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={testPersistence}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🧪 {t('test.testPersistence')}
          </button>
          
          <button
            onClick={clearAllCombinations}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            🗑️ {t('test.clearTestData')}
          </button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg ${
            testResult.includes('✅') 
              ? 'bg-green-50 text-green-800' 
              : testResult.includes('❌')
              ? 'bg-red-50 text-red-800'
              : 'bg-yellow-50 text-yellow-800'
          }`}>
            {testResult}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>{t('test.instructions')}</strong>
          <ul className="mt-1 space-y-1">
            <li>• {t('test.instruction1')}</li>
            <li>• {t('test.instruction2')}</li>
            <li>• {t('test.instruction3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
