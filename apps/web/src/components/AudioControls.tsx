import React from 'react';
import { useAudio } from '../contexts/AudioContext';

interface AudioControlsProps {
  soundscapes: {
    name: string;
    url: string;
[];
const AudioControls: React.FC<AudioControlsProps> = ({ soundscapes }) => {
  const {
    isPlaying,
    volume,
    currentSoundscape,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setVolume,
= useAudio();

  const handlePlayPause = () => {
    if (!currentSoundscape && soundscapes.length > 0) {
      // If nothing is playing, start with the first soundscape
      playAudio(soundscapes[0].url);
else if (isPlaying) {
      pauseAudio();
else {
      resumeAudio();
const handleSoundscapeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSoundscape = soundscapes.find((s) => s.url === event.target.value);
    if (selectedSoundscape) {
      playAudio(selectedSoundscape.url);
const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
return (
    <div className="audio-controls">
      <button onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? '⏸️' : '▶️'}
      </button>

      <button onClick={stopAudio} aria-label="Stop">
        ⏹️
      </button>

      <select
        value={currentSoundscape || ''}
        onChange={handleSoundscapeChange}
        aria-label="Select soundscape"
      >
        <option value="">Select a soundscape</option>
        {soundscapes.map((soundscape) => (
          <option key={soundscape.url} value={soundscape.url}>
            {soundscape.name}
          </option>
        ))}
      </select>

      <div className="volume-control">
        <label htmlFor="volume">Volume</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>

      <style jsx>{`
        .audio-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
button {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 1.5rem;
select {
          padding: 0.5rem;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: inherit;
          border: 1px solid rgba(255, 255, 255, 0.2);
.volume-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
input[type='range'] {
          width: 100px;
`}</style>
    </div>
export default AudioControls;
