import React, { useState, useEffect } from 'react';

interface AccessibleNotificationProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
  showCloseButton?: boolean;
}

export const AccessibleNotification: React.FC<AccessibleNotificationProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  className = '',
  showIcon = true,
  showCloseButton = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`
        fixed top-4 right-4 p-4 rounded-lg border
        ${getTypeStyles()}
        ${className}
      `}
    >
      <div className="flex items-start">
        {showIcon && (
          <span className="mr-2" aria-hidden="true">
            {getIcon()}
          </span>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="ml-2 text-current hover:text-opacity-75 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2"
            aria-label="Close notification"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default AccessibleNotification;
