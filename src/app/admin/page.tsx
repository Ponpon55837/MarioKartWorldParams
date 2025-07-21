'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClientMounted } from '@/hooks/useClientMounted';
import TestPersistence from '@/components/TestPersistence';
import DebugDataLoading from '@/components/DebugDataLoading';

export default function AdminPage() {
  const { t } = useTranslation();
  const mounted = useClientMounted();
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
      alert(t('admin.csvCopied'));
    }
  };

  // 避免 SSR 水合不匹配問題
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">載入中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {t('admin.title')}
          </h1>

          {/* 資料載入調試區塊 */}
          <DebugDataLoading />

          {/* 持久化測試區塊 */}
          <TestPersistence />

          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">{t('admin.instructions.title')}</h2>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>{t('admin.instructions.step1')}</li>
              <li>{t('admin.instructions.step2')}</li>
              <li>{t('admin.instructions.step3')}</li>
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
                  {t('admin.syncing')}
                </>
              ) : (
                t('admin.syncButton')
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
                      <h3 className="text-green-800 font-semibold mb-2">{t('admin.syncSuccess')}</h3>
                      <p className="text-green-700 text-sm mb-3">{result.message}</p>
                      {result.timestamp && (
                        <p className="text-green-600 text-xs mb-3">
                          {t('admin.syncTime')}{new Date(result.timestamp).toLocaleString('zh-TW')}
                        </p>
                      )}
                      
                      {result.csvData && (
                        <div className="mt-4 space-y-3">
                          <div className="flex space-x-3">
                            <button
                              onClick={copyCSVToClipboard}
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                            >
                              {t('admin.copyCSV')}
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
                              {t('admin.redownloadCSV')}
                            </button>
                          </div>
                          
                          <details className="mt-4">
                            <summary className="cursor-pointer text-green-800 font-medium hover:text-green-900">
                              {t('admin.previewCSV')}
                            </summary>
                            <div className="mt-2 p-3 bg-white border border-green-200 rounded">
                              <pre className="text-xs text-gray-700 overflow-x-auto max-h-60 overflow-y-auto">
                                {result.csvData.split('\n').slice(0, 20).join('\n')}
                                {result.csvData.split('\n').length > 20 && `\n... (${t('admin.moreData')})`}
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
                      <h3 className="text-red-800 font-semibold mb-2">{t('admin.syncFailed')}</h3>
                      <p className="text-red-700 text-sm">{result.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-yellow-800 font-semibold mb-2">{t('admin.warnings.title')}</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>{t('admin.warnings.warning1')}</li>
              <li>{t('admin.warnings.warning2')}</li>
              <li>{t('admin.warnings.warning3')}</li>
              <li>{t('admin.warnings.warning4')}</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              {t('admin.backToHome')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
