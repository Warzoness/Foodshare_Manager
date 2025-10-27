'use client';

import React from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './DatePicker.module.css';

// Register Vietnamese locale
registerLocale('vi', vi);

interface DatePickerProps {
  label?: string;
  value: string; // yyyy-MM-dd format for API compatibility
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Chọn ngày',
  error,
  disabled = false,
  required = false,
  minDate,
  maxDate,
  className = '',
  onKeyDown
}) => {
  // Convert yyyy-MM-dd to Date object
  const dateValue = value ? new Date(value + 'T00:00:00') : null;

  // Handle date change
  const handleChange = (date: Date | null) => {
    if (date) {
      // Convert Date to yyyy-MM-dd format for API
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className={`${styles.datePickerWrapper} ${className} ${error ? styles.error : ''}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <ReactDatePicker
        selected={dateValue}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
        locale="vi"
        placeholderText={placeholder}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        className={styles.dateInput}
        wrapperClassName={styles.dateInputWrapper}
        calendarClassName={styles.calendar}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

