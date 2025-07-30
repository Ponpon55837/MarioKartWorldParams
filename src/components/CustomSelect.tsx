import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder, className = '' }: CustomSelectProps) {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('selection.pleaseSelect');

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options, onChange]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* 觸發按鈕 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 text-sm text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all duration-200 flex items-center justify-between"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>{selectedOption ? selectedOption.label : defaultPlaceholder}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉選項 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full p-2 text-sm text-left hover:bg-blue-50 transition-colors duration-150 ${index === highlightedIndex ? 'bg-blue-50' : ''} ${
                option.value === value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-900'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${index === options.length - 1 ? 'rounded-b-lg' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {option.value === value && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
