"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 錯誤邊界元件
 * 捕捉子元件中的 JavaScript 錯誤，記錄錯誤並顯示備用 UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 以便下次渲染時顯示備用 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 記錄錯誤到錯誤報告服務
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // 在開發環境中顯示更詳細的錯誤資訊
    if (process.env.NODE_ENV === "development") {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自訂 fallback，使用自訂的
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 預設錯誤 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                糟糕！發生了一些錯誤
              </h1>
              <p className="text-gray-600 mb-6">
                應用程式遇到了意外錯誤。請嘗試重新載入頁面。
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="text-left bg-gray-100 rounded p-4 mb-6">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    錯誤詳情（僅開發環境顯示）
                  </summary>
                  <pre className="text-xs text-red-600 overflow-auto">
                    {this.state.error.message}
                    {"\n\n"}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                重新載入頁面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
