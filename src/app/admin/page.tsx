'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useClientMounted } from '@/hooks/useClientMounted';
import { useMarioKartStore } from '@/hooks/useMarioKartStore';
import LanguageSelector from '@/components/LanguageSelector';

interface SyncResult {
  success: boolean;
  message?: string;
  error?: string;
  csvData?: string;
  jsonData?: any;
  timestamp?: string;
  metadata?: {
    characterCount: number;
    vehicleCount: number;
    dataSize: {
      csv: number;
      json: number;
    };
  };
}

interface DataStatus {
  success: boolean;
  hasData: boolean;
  metadata?: {
    characterCount: number;
    vehicleCount: number;
    source: string;
  };
  lastUpdate?: string;
  version?: string;
}

export default function AdminPage() {
  const { t } = useTranslation();
  const mounted = useClientMounted();
  const { reloadData } = useMarioKartStore();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // 檢查當前資料狀態
  const checkDataStatus = async () => {
    try {
      const response = await fetch('/api/sync-data', {
        method: 'GET',
      });
      
      const data = await response.json();
      setDataStatus(data);
    } catch (error) {
      console.error('檢查資料狀態失敗:', error);
      setDataStatus({ success: false, hasData: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  // 頁面載入時檢查資料狀態
  useEffect(() => {
    if (mounted) {
      checkDataStatus();
    }
  }, [mounted]);

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

      // 同步成功後重新檢查狀態並重新載入應用資料
      if (data.success) {
        await checkDataStatus();
        
        // 重新載入應用中的資料
        try {
          await reloadData();
          console.log('✅ 應用資料已重新載入');
        } catch (reloadError) {
          console.error('❌ 重新載入應用資料失敗:', reloadError);
        }
      }

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '同步時發生未知錯誤',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setSyncing(false);
    }
  };

  const downloadJsonData = () => {
    if (result?.jsonData) {
      const blob = new Blob([JSON.stringify(result.jsonData, null, 2)], { 
        type: 'application/json;charset=utf-8;' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `mario-kart-data-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-3">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🛠️ {t('admin.systemManagement')}           
          </h1>
           <div className="flex justify-center lg:justify-end lg:ml-4 p-1">
            <LanguageSelector className="w-full max-w-[200px] lg:w-auto" />
          </div>

          {/* 當前資料狀態 */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">📊 {t('admin.currentDataStatus')}</h2>
            {checkingStatus ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">{t('admin.checkingStatus')}</span>
              </div>
            ) : dataStatus ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('admin.jsonDataFile')}</span>
                  <span className={dataStatus.hasData ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {dataStatus.hasData ? `✅ ${t('admin.jsonDataFileExists')}` : `❌ ${t('admin.jsonDataFileNotExists')}`}
                  </span>
                </div>
                {dataStatus.hasData && dataStatus.metadata && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.characterCountNum')}:</span>
                      <span className="text-blue-600 font-medium">{dataStatus.metadata.characterCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.vehicleCountNum')}:</span>
                      <span className="text-blue-600 font-medium">{dataStatus.metadata.vehicleCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.dataSource')}:</span>
                      <span className="text-purple-600 font-medium">{dataStatus.metadata.source}</span>
                    </div>
                  </>
                )}
                {dataStatus.lastUpdate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('admin.lastUpdated')}:</span>
                    <span className="text-gray-800 font-medium">
                      {/* 自動抓取使用者當地時間 */}
                      {new Date(dataStatus.lastUpdate).toLocaleString('zh-TW')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-red-600">{t('admin.checkStatusFailed')}</span>
            )}
          </div>

          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">🚀 {t('admin.newFeatures')}</h2>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• {t('admin.syncFromSheets')}</li>
              <li>• {t('admin.autoConvertToJson')}</li>
              <li>• {t('admin.keepCsvBackup')}</li>
              <li>• {t('admin.realTimeUpdate')}</li>
              <li>• {t('admin.detailedSyncStatus')}</li>
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
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('admin.syncing')}...</span>
                </div>
              ) : (
                t('admin.syncFromSheets')
              )}
            </button>
          </div>

          {result && (
            <div className="mb-6">
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-green-500 text-xl mr-3">✅</div>
                    <div className="flex-1">
                      <h3 className="text-green-800 font-semibold mb-2">{t('admin.syncSuccess')}</h3>
                      <p className="text-green-700 text-sm mb-3">{result.message}</p>
                      
                      {result.metadata && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div className="bg-white p-2 rounded border border-green-200">
                            <div className="text-green-600 font-medium">{t('admin.characterCountNum')}</div>
                            <div className="text-xl font-bold text-green-800">{result.metadata.characterCount}</div>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-200">
                            <div className="text-green-600 font-medium">{t('admin.vehicleCountNum')}</div>
                            <div className="text-xl font-bold text-green-800">{result.metadata.vehicleCount}</div>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-200">
                            <div className="text-green-600 font-medium">{t('admin.csvSize')}</div>
                            <div className="text-xl font-bold text-green-800">
                              {(result.metadata.dataSize.csv / 1024).toFixed(1)}KB
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-200">
                            <div className="text-green-600 font-medium">{t('admin.jsonSize')}</div>
                            <div className="text-xl font-bold text-green-800">
                              {(result.metadata.dataSize.json / 1024).toFixed(1)}KB
                            </div>
                          </div>
                        </div>
                      )}

                      {result.csvData && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
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
                              📥 {t('admin.downloadCsv')}
                            </button>
                            
                            {result.jsonData && (
                              <button
                                onClick={downloadJsonData}
                                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
                              >
                                📥 {t('admin.downloadJson')}
                              </button>
                            )}
                          </div>
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
            <h3 className="text-yellow-800 font-semibold mb-2">⚠️ {t('admin.notice')}</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• {t('admin.syncWillOverwrite')}</li>
              <li>• {t('admin.ensureGoogleSheetsAccess')}</li>
              <li>• {t('admin.autoReload')}</li>
              <li>• {t('admin.jsonLoadingSpeed')}</li>
              <li>• {t('admin.regularSync')}</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← {t('admin.backToHome')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
