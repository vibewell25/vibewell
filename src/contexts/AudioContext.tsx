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

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentSoundscape, setCurrentSoundscape] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Initialize Web Audio API context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const playAudio = async (soundscape: string) => {
    if (!audioContextRef.current) return;

    try {
      const response = await fetch(soundscape);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }

      audioSourceRef.current = audioContextRef.current.createBufferSource();
      audioSourceRef.current.buffer = audioBuffer;
      audioSourceRef.current.connect(gainNodeRef.current!);
      audioSourceRef.current.loop = true;
      audioSourceRef.current.start();

      setIsPlaying(true);
      setCurrentSoundscape(soundscape);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const pauseAudio = () => {
    if (audioContextRef.current?.state === 'running') {
      audioContextRef.current.suspend();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      setIsPlaying(false);
      setCurrentSoundscape(null);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
      setVolume(newVolume);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        volume,
        currentSoundscape,
        playAudio,
        pauseAudio,
        resumeAudio,
        stopAudio,
        setVolume: handleVolumeChange,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
