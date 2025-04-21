import { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss?: (id: string) => void;
}

export function Toast({
  id,
  title,
  description,
  action,
  type = 'default',
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        setTimeout(() => onDismiss(id), 300); // Allow time for exit animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      setTimeout(() => onDismiss(id), 300); // Allow time for exit animation
    }
  };

  // Define background, text, and icon for different toast types
  const typeStyles = {
    default: {
      container: 'bg-white',
      title: 'text-gray-900',
      description: 'text-gray-600',
      icon: null,
    },
    success: {
      container: 'bg-green-50',
      title: 'text-green-800',
      description: 'text-green-700',
      icon: <Icons.checkCircle className="h-5 w-5 text-green-500" aria-hidden="true" />,
    },
    error: {
      container: 'bg-red-50',
      title: 'text-red-800',
      description: 'text-red-700',
      icon: <Icons.close className="h-5 w-5 text-red-500" aria-hidden="true" />,
    },
    warning: {
      container: 'bg-yellow-50',
      title: 'text-yellow-800',
      description: 'text-yellow-700',
      icon: <Icons.bell className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
    },
    info: {
      container: 'bg-blue-50',
      title: 'text-blue-800',
      description: 'text-blue-700',
      icon: <Icons.bell className="h-5 w-5 text-blue-500" aria-hidden="true" />,
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300',
        styles.container,
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          {styles.icon && <div className="flex-shrink-0 mr-3">{styles.icon}</div>}
          <div className="flex-1">
            {title && <div className={cn('text-sm font-medium', styles.title)}>{title}</div>}
            {description && (
              <div className={cn('mt-1 text-sm', styles.description)}>{description}</div>
            )}
            {action && <div className="mt-3">{action}</div>}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleDismiss}
            >
              <span className="sr-only">Close</span>
              <Icons.close className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  children: React.ReactNode;
}

export function ToastContainer({ 
  position = 'bottom-right', 
  children 
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-50 p-4 max-h-screen overflow-hidden pointer-events-none flex flex-col gap-2',
        positionClasses[position]
      )}
    >
      {children}
    </div>
  );
}

// Toast context and provider
import React, { createContext, useContext, useCallback, useReducer } from 'react';

type ToastState = ToastProps[];

type ToastAction =
  | { type: 'ADD_TOAST'; toast: ToastProps }
  | { type: 'REMOVE_TOAST'; id: string };

const ToastStateContext = createContext<ToastState | undefined>(undefined);
const ToastDispatchContext = createContext<React.Dispatch<ToastAction> | undefined>(undefined);

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.toast];
    case 'REMOVE_TOAST':
      return state.filter((toast) => toast.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  return (
    <ToastStateContext.Provider value={toasts}>
      <ToastDispatchContext.Provider value={dispatch}>
        {children}
        <ToastContainer>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onDismiss={(id) => dispatch({ type: 'REMOVE_TOAST', id })}
            />
          ))}
        </ToastContainer>
      </ToastDispatchContext.Provider>
    </ToastStateContext.Provider>
  );
}

export function useToast() {
  const dispatch = useContext(ToastDispatchContext);
  
  if (!dispatch) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const toast = useCallback(
    (props: Omit<ToastProps, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      dispatch({
        type: 'ADD_TOAST',
        toast: { id, ...props },
      });
      return id;
    },
    [dispatch]
  );

  const dismissToast = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_TOAST', id });
    },
    [dispatch]
  );

  return { toast, dismissToast };
}
