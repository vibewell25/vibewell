import React, { createContext, useContext, useState, useCallback } from 'react';

interface MeditationState {
  isActive: boolean;
  isPaused: boolean;
  duration: number;
  theme: string;
  soundscape: string;
  volume: number;
  lightingIntensity: number;
  particleEffects: boolean;
}

interface MeditationContextType {
  state: MeditationState;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  updateSettings: (settings: Partial<MeditationState>) => void;
}

const defaultState: MeditationState = {
  isActive: false,
  isPaused: false,
  duration: 0,
  theme: 'zen-garden',
  soundscape: 'rain',
  volume: 0.5,
  lightingIntensity: 0.8,
  particleEffects: true,
};

const MeditationContext = createContext<MeditationContextType | undefined>(undefined);

export const useMeditation = () => {
  const context = useContext(MeditationContext);
  if (!context) {
    throw new Error('useMeditation must be used within a MeditationProvider');
  }
  return context;
};

export const MeditationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MeditationState>(defaultState);

  const startSession = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isPaused: false }));
  }, []);

  const pauseSession = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeSession = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const endSession = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false, isPaused: false }));
  }, []);

  const updateSettings = useCallback((settings: Partial<MeditationState>) => {
    setState(prev => ({ ...prev, ...settings }));
  }, []);

  return (
    <MeditationContext.Provider
      value={{
        state,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        updateSettings,
      }}
    >
      {children}
    </MeditationContext.Provider>
  );
}; 