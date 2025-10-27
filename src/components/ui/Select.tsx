'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  className = '',
  label,
  error,
  size = 'md'
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleSelect = (optionValue: string) => {
    if (!options.find(opt => opt.value === optionValue)?.disabled) {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className={`${styles.selectWrapper} ${className} ${isOpen ? styles.wrapperOpen : ''}`}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      
      <div
        ref={containerRef}
        className={`${styles.selectContainer} ${styles[size]} ${disabled ? styles.disabled : ''} ${error ? styles.error : ''} ${isOpen ? styles.containerOpen : ''}`}
      >
        <div
          className={`${styles.selectTrigger} ${isOpen ? styles.open : ''}`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={selectedOption ? styles.selectedValue : styles.placeholder}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
            ▼
          </span>
        </div>

        {isOpen && (
          <div className={styles.dropdown}>
            {options.length > 5 && (
              <div className={styles.searchContainer}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            <ul className={styles.optionsList} role="listbox">
              {filteredOptions.length === 0 ? (
                <li className={styles.noResults}>
                  Không tìm thấy kết quả
                </li>
              ) : (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={`${styles.option} ${option.value === value ? styles.selected : ''} ${option.disabled ? styles.optionDisabled : ''}`}
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                    {option.value === value && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  );
}

