'use client';

import { useState } from 'react';
import { MeditationEnvironment } from '@/components/ar/MeditationEnvironment';

export default function MeditationTest() {
  const [theme, setTheme] = useState<'forest' | 'beach' | 'mountain' | 'zen-garden'>('forest');
  const [soundscape, setSoundscape] = useState<'rain' | 'waves' | 'wind' | 'birds' | 'silence'>(
    'silence'
  );
  const [lightingIntensity, setLightingIntensity] = useState(1);
  const [particleEffects, setParticleEffects] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6">Meditation Environment Test</h1>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                className="w-full rounded border-gray-300 p-2"
                value={theme}
                onChange={e => setTheme(e.target.value as typeof theme)}
              >
                <option value="forest">Forest</option>
                <option value="beach">Beach</option>
                <option value="mountain">Mountain</option>
                <option value="zen-garden">Zen Garden</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Soundscape</label>
              <select
                className="w-full rounded border-gray-300 p-2"
                value={soundscape}
                onChange={e => setSoundscape(e.target.value as typeof soundscape)}
              >
                <option value="silence">Silence</option>
                <option value="rain">Rain</option>
                <option value="waves">Ocean Waves</option>
                <option value="wind">Gentle Wind</option>
                <option value="birds">Bird Songs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Lighting Intensity ({lightingIntensity.toFixed(1)})
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightingIntensity}
                onChange={e => setLightingIntensity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Particle Effects</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={particleEffects}
                  onChange={e => setParticleEffects(e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Enable particle effects</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <MeditationEnvironment
            theme={theme}
            soundscape={soundscape}
            lightingIntensity={lightingIntensity}
            particleEffects={particleEffects}
            onStateChange={state => {
              if (state.theme) setTheme(state.theme);
              if (state.soundscape) setSoundscape(state.soundscape);
              if (state.lightingIntensity !== undefined)
                setLightingIntensity(state.lightingIntensity);
            }}
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Try each theme (Forest, Beach, Mountain, Zen Garden) and verify the 3D models load
              correctly
            </li>
            <li>Test all soundscapes and ensure the audio plays/stops properly</li>
            <li>Adjust lighting intensity and check how it affects the environment</li>
            <li>Toggle particle effects and verify they appear/disappear</li>
            <li>Start a meditation session and confirm the timer works</li>
            <li>Test orbit controls (rotate, zoom, pan)</li>
            <li>Check that error messages appear if something fails to load</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
