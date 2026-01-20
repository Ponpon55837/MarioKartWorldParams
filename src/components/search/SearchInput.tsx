"use client";

import { useTranslation } from "react-i18next";
import { RefObject } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading: boolean;
  inputRef: RefObject<HTMLInputElement>;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  isLoading,
  inputRef,
  autoFocus = false,
}: SearchInputProps) {
  const { t } = useTranslation();

  return (
    <div className="p-3 sm:p-4 border-b border-gray-200 bg-white sticky top-12 sm:top-16 z-10">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("search.inputPlaceholder")}
          autoFocus={autoFocus}
          className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mario-blue focus:border-transparent text-sm sm:text-base"
        />
        <div className="absolute right-3 top-3">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mario-blue"></div>
          ) : value ? (
            <button
              onClick={onClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t("search.modal.clearSearch")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
