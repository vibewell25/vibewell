import React from 'react';

interface LogoutButtonProps {
  onLogout: () => void;
  isLoading?: boolean;
}

export function LogoutButton({ onLogout, isLoading = false }: LogoutButtonProps) {
  return (
    <button 
      onClick={onLogout}
      disabled={isLoading}
      className="logout-button"
      data-testid="logout-button"
    >
      {isLoading ? 'Logging Out...' : 'Log Out'}
    </button>
  );
} 