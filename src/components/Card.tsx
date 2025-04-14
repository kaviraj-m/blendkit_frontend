import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-secondary-200">
          {title && (
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-secondary-600">{subtitle}</p>
          )}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 