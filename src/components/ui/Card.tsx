import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  actions,
}) => {
  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};
