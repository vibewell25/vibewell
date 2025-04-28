import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  currentSoundscape: string | null;
  playAudio: (soundscape: string) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export {};

export {};
