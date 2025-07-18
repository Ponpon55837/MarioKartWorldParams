'use client';

import { useState } from 'react';
import TestPersistence from '@/components/TestPersistence';
import DebugDataLoading from '@/components/DebugDataLoading';

export default function AdminPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    csvData?: string;
    timestamp?: string;
  } | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const response = await fetch('/api/sync-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success && data.csvData) {
        // 可選：自動下載 CSV 檔案
        const blob = new Blob([data.csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mario-kart-data-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      });
    } finally {
      setSyncing(false);
    }
  };

  const copyCSVToClipboard = () => {
    if (result?.csvData) {
      navigator.clipboard.writeText(result.csvData);
      alert('CSV 資料已複製到剪貼簿！');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🔄 瑪利歐賽車資料同步管理
          </h1>

          {/* 資料載入調試區塊 */}
          <DebugDataLoading />

          {/* 持久化測試區塊 */}
          <TestPersistence />

          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">📋 使用說明</h2>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• 點擊「同步資料」按鈕從 Google Sheets 獲取最新資料</li>
              <li>• 同步成功後會自動下載轉換後的 CSV 檔案</li>
              <li>• 你可以用這個檔案替換 public/mario-kart-data.csv</li>
            </ul>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                syncing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {syncing ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  同步中...
                </>
              ) : (
                '🔄 同步資料'
              )}
            </button>
          </div>

          {result && (
            <div className="mt-6">
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-green-500 text-xl mr-3">✅</div>
                    <div className="flex-1">
                      <h3 className="text-green-800 font-semibold mb-2">同步成功！</h3>
                      <p className="text-green-700 text-sm mb-3">{result.message}</p>
                      {result.timestamp && (
                        <p className="text-green-600 text-xs mb-3">
                          同步時間：{new Date(result.timestamp).toLocaleString('zh-TW')}
                        </p>
                      )}
                      
                      {result.csvData && (
                        <div className="mt-4 space-y-3">
                          <div className="flex space-x-3">
                            <button
                              onClick={copyCSVToClipboard}
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                            >
                              📋 複製 CSV 到剪貼簿
                            </button>
                            <button
                              onClick={() => {
                                const blob = new Blob([result.csvData!], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                const url = URL.createObjectURL(blob);
                                link.setAttribute('href', url);
                                link.setAttribute('download', `mario-kart-data-${new Date().toISOString().split('T')[0]}.csv`);
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                            >
                              💾 重新下載 CSV
                            </button>
                          </div>
                          
                          <details className="mt-4">
                            <summary className="cursor-pointer text-green-800 font-medium hover:text-green-900">
                              📄 查看轉換後的 CSV 資料預覽
                            </summary>
                            <div className="mt-2 p-3 bg-white border border-green-200 rounded">
                              <pre className="text-xs text-gray-700 overflow-x-auto max-h-60 overflow-y-auto">
                                {result.csvData.split('\n').slice(0, 20).join('\n')}
                                {result.csvData.split('\n').length > 20 && '\n... (更多資料)'}
                              </pre>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-red-500 text-xl mr-3">❌</div>
                    <div>
                      <h3 className="text-red-800 font-semibold mb-2">同步失敗</h3>
                      <p className="text-red-700 text-sm">{result.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-yellow-800 font-semibold mb-2">⚠️ 注意事項</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• 同步後請手動替換 public/mario-kart-data.csv 檔案</li>
              <li>• 建議在替換前備份現有的 CSV 檔案</li>
              <li>• 如果同步失敗，請檢查 Google Sheets 是否為公開狀態</li>
              <li>• 資料轉換可能需要一些時間，請耐心等待</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← 返回主頁
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
