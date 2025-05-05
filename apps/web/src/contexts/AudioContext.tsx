import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { Howl } from 'howler';

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  currentSoundscape: string | null;
  playAudio: (soundscape: string) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [currentSoundscape, setCurrentSoundscape] = useState<string | null>(null);
  const soundRef = useRef<Howl | null>(null);

  const playAudio = (soundscape: string) => {
    // Stop current audio if playing
    if (soundRef.current) {
      soundRef.current.stop();
// Create new Howl instance
    soundRef.current = new Howl({
      src: [soundscape],
      volume: volume,
      loop: true,
// Play the sound
    soundRef.current.play();
    setIsPlaying(true);
    setCurrentSoundscape(soundscape);
const pauseAudio = () => {
    if (soundRef.current && isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
const resumeAudio = () => {
    if (soundRef.current && !isPlaying) {
      soundRef.current.play();
      setIsPlaying(true);
const stopAudio = () => {
    if (soundRef.current) {
      soundRef.current.stop();
      setIsPlaying(false);
      setCurrentSoundscape(null);
const setVolume = (newVolume: number) => {
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
setVolumeState(newVolume);
// Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
[]);

  const value = {
    isPlaying,
    volume,
    currentSoundscape,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setVolume,
return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
return context;
