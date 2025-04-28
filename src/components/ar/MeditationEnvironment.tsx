import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Howl } from 'howler';
import { motion } from 'framer-motion';
import { Forest } from './models/Forest';
import { Beach } from './models/Beach';
import { Mountain } from './models/Mountain';
import { ZenGarden } from './models/ZenGarden';
import { ParticleSystem } from './effects/ParticleSystem';
import { useWebGL } from '../../contexts/WebGLContext';
import AudioControls from '../AudioControls';

/**
 * Props for the MeditationEnvironment component
 * @interface MeditationEnvironmentProps
 */
export interface MeditationEnvironmentProps {
  /** The visual theme of the meditation environment */
  theme: 'forest' | 'beach' | 'mountain' | 'zen-garden';
  /** The ambient sound to play during meditation */
  soundscape: 'rain' | 'waves' | 'wind' | 'birds' | 'silence';
  /** The intensity of the environment lighting (0-2) */
  lightingIntensity: number;
  /** Whether to show particle effects */
  particleEffects?: boolean;
  /** Callback for state changes in the environment */
  onStateChange?: (state: {
    theme?: 'forest' | 'beach' | 'mountain' | 'zen-garden';
    soundscape?: 'rain' | 'waves' | 'wind' | 'birds' | 'silence';
    lightingIntensity?: number;
  }) => void;
}

/**
 * Settings for different meditation environment themes
 */
const THEME_SETTINGS = {
  forest: {
    environmentPreset: 'forest',
    ambientLight: '#4a5d23',
    particleColor: '#ffffff',
    particleCount: 1000,
  },
  beach: {
    environmentPreset: 'sunset',
    ambientLight: '#ffd700',
    particleColor: '#87CEEB',
    particleCount: 500,
  },
  mountain: {
    environmentPreset: 'dawn',
    ambientLight: '#b8d8e8',
    particleColor: '#ffffff',
    particleCount: 2000,
  },
  'zen-garden': {
    environmentPreset: 'warehouse',
    ambientLight: '#e8d0a9',
    particleColor: '#FFC0CB',
    particleCount: 300,
  },
};

/**
 * Audio file paths for different soundscapes
 */
const SOUND_EFFECTS = {
  rain: '/sounds/rain.mp3',
  waves: '/sounds/waves.mp3',
  wind: '/sounds/wind.mp3',
  birds: '/sounds/birds.mp3',
};

/**
 * MeditationEnvironment is a 3D environment for meditation experiences.
 * It provides an immersive space with customizable themes, lighting,
 * ambient sounds, and particle effects.
 *
 * @component
 * @example
 * ```tsx
 * <MeditationEnvironment
 *   theme="forest"
 *   soundscape="rain"
 *   lightingIntensity={1}
 *   onStateChange={(state) => console.log('Environment updated:', state)}
 * />
 * ```
 */
export const MeditationEnvironment: React.FC<MeditationEnvironmentProps> = ({
  theme = 'forest',
  soundscape = 'silence',
  lightingIntensity = 1,
  particleEffects = true,
  onStateChange,
}) => {
  const { updateScene } = useWebGL();
  const [ambientSound, setAmbientSound] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [meditationTimer, setMeditationTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (soundscape !== 'silence') {
      try {
        const sound = new Howl({
          src: [SOUND_EFFECTS[soundscape]],
          loop: true,
          volume: 0.5,
          onloaderror: () => {
            setError(`Failed to load ${soundscape} sound effect`);
          },
        });
        setAmbientSound(sound);

        return () => {
          sound.stop();
          sound.unload();
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Error initializing ${soundscape} sound: ${errorMessage}`);
      }
    }
    return undefined;
  }, [soundscape]);

  // Add timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setMeditationTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying]);

  const toggleMeditation = () => {
    try {
      if (isPlaying) {
        ambientSound?.pause();
        setIsPlaying(false);
        setMeditationTimer(0);
      } else {
        ambientSound?.play();
        setIsPlaying(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error toggling meditation: ${errorMessage}`);
    }
  };

  const ThemeComponent = {
    forest: Forest,
    beach: Beach,
    mountain: Mountain,
    'zen-garden': ZenGarden,
  }[theme];

  if (!ThemeComponent) {
    setError(`Invalid theme: ${theme}`);
    return null;
  }

  // Define available soundscapes
  const availableSoundscapes = [
    { name: 'Rain', url: '/audio/rain.mp3' },
    { name: 'Ocean Waves', url: '/audio/waves.mp3' },
    { name: 'Forest', url: '/audio/forest.mp3' },
    { name: 'Zen Bells', url: '/audio/bells.mp3' },
  ];

  return (
    <div className="relative h-[600px] w-full">
      {error && (
        <div className="absolute left-4 right-4 top-4 z-50 rounded-lg bg-red-500 p-4 text-white">
          {error}
        </div>
      )}

      <Canvas camera={{ position: [0, 5, 10], fov: 75 }} shadows gl={{ antialias: true }}>
        <Environment preset={THEME_SETTINGS[theme].environmentPreset as any} />

        <ambientLight color={THEME_SETTINGS[theme].ambientLight} intensity={lightingIntensity} />

        <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />

        <ThemeComponent />

        {particleEffects && (
          <ParticleSystem
            count={THEME_SETTINGS[theme].particleCount}
            color={THEME_SETTINGS[theme].particleColor}
          />
        )}

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {theme
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}{' '}
              Meditation
            </h3>
            <button
              className={`rounded px-4 py-2 ${isPlaying ? 'bg-red-500' : 'bg-blue-500'} text-white`}
              onClick={toggleMeditation}
            >
              {isPlaying ? 'End Session' : 'Begin Meditation'}
            </button>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-4">
              <div className="text-lg font-medium">
                {Math.floor(meditationTimer / 60)}:
                {(meditationTimer % 60).toString().padStart(2, '0')}
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 60 * 20 }} // 20 minutes
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Ambient Sound</label>
              <select
                className="w-full rounded border-gray-300"
                value={soundscape}
                onChange={(e) =>
                  onStateChange?.({
                    soundscape: e.target.value as MeditationEnvironmentProps['soundscape'],
                  })
                }
              >
                <option value="silence">Silence</option>
                <option value="rain">Rain</option>
                <option value="waves">Ocean Waves</option>
                <option value="wind">Gentle Wind</option>
                <option value="birds">Bird Songs</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Lighting</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightingIntensity}
                onChange={(e) => onStateChange?.({ lightingIntensity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <AudioControls soundscapes={availableSoundscapes} />
    </div>
  );
};

export default MeditationEnvironment;
