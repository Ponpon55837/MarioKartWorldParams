import React from 'react';

interface SearchButtonProps {
  onClick: () => void;
  className?: string;
}

export default function SearchButton({ onClick, className = '' }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-4 py-2 bg-mario-blue text-white rounded-lg
        hover:bg-blue-600 transition-all duration-200 hover:shadow-lg
        transform hover:scale-105 active:scale-95
        ${className}
      `}
      title="搜尋角色和載具"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="font-medium">搜尋</span>
    </button>
  );
}

// 迷你搜尋按鈕版本
export function MiniSearchButton({ onClick, className = '' }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        p-2 bg-mario-blue text-white rounded-full
        hover:bg-blue-600 transition-all duration-200 hover:shadow-lg
        transform hover:scale-105 active:scale-95
        ${className}
      `}
      title="搜尋角色和載具"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  );
}

// 搜尋快捷鍵提示組件
export function SearchShortcutHint({ onClick }: { onClick: () => void }) {
  return (
    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
      <span>按</span>
      <kbd 
        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={onClick}
      >
        Ctrl+K
      </kbd>
      <span>快速搜尋</span>
    </div>
  );
}
