import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  type: NotificationType;
  message: string;
  duration?: number;
  onClose?: () => void;
  show: boolean;
export default function Notification({
  type,
  message,
  duration = 3000,
  onClose,
  show,
: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Allow transition to complete
duration);
      return () => clearTimeout(timer);
return () => {};
[show, duration, onClose]);

  const notificationStyles = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
return (
    <div
      className={cn(
        'fixed bottom-20 left-1/2 z-50 transform -translate-x-1/2 p-4 rounded-lg border-l-4 shadow-lg transition-all duration-300 max-w-sm w-[90%]',
        notificationStyles[type],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      )}
      role="alert"
    >
      <div className="flex items-center">
        <div
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 font-bold',
            {
              'bg-green-500 text-white': type === 'success',
              'bg-red-500 text-white': type === 'error',
              'bg-yellow-500 text-white': type === 'warning',
              'bg-blue-500 text-white': type === 'info',
)}
        >
          {icons[type]}
        </div>
        <div className="text-sm font-medium">{message}</div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) {
              setTimeout(onClose, 300);
className="ml-auto pl-3 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
// Example usage:
// const [showNotification, setShowNotification] = useState(false);
// <Notification 
//   type="success" 
//   message="Appointment booked successfully!" 
//   show={showNotification} 
//   onClose={() => setShowNotification(false)} 
// />
