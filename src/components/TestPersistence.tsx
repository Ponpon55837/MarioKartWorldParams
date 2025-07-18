'use client';

import { useCombinations } from '@/hooks/useMarioKartStore';
import { useState } from 'react';

export default function TestPersistence() {
  const { combinations, addCombination, clearAllCombinations } = useCombinations();
  const [testResult, setTestResult] = useState<string>('');

  // 創建測試資料
  const testCharacter = {
    name: '測試瑪利歐',
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
    name: '測試車',
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
    
    setTestResult('測試組合已添加！請重新整理頁面檢查是否保持...');
    
    // 3秒後檢查結果
    setTimeout(() => {
      const stored = localStorage.getItem('mario-kart-combinations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setTestResult('✅ 持久化測試成功！組合已儲存到 localStorage');
        } else {
          setTestResult('❌ 持久化測試失敗：localStorage 中沒有找到組合');
        }
      } else {
        setTestResult('❌ 持久化測試失敗：localStorage 中沒有 mario-kart-combinations 鍵');
      }
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🧪 持久化測試工具</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>目前組合數量：</strong>{combinations.length}
          </p>
          <p className="text-xs text-blue-600">
            這些組合應該會自動儲存到 localStorage 中
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={testPersistence}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🧪 測試持久化
          </button>
          
          <button
            onClick={clearAllCombinations}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            🗑️ 清除測試資料
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
          <strong>測試說明：</strong>
          <ul className="mt-1 space-y-1">
            <li>• 點擊「測試持久化」會添加一個測試組合</li>
            <li>• 重新整理頁面後組合應該還在</li>
            <li>• 組合資料儲存在 localStorage 中的 &quot;mario-kart-combinations&quot; 鍵</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
