export const AR_ROOM_THEMES = {
  zen: {
    name: 'Zen Garden',
    description: 'A peaceful Japanese garden setting with minimalist design',
    ambientLight: '#e8f3ff',
    backgroundColor: '#f5f9ff',
    fogColor: '#ffffff',
    modelPath: '/models/zen-garden.glb',
  },
  forest: {
    name: 'Forest Retreat',
    description: 'A serene forest clearing surrounded by tall trees',
    ambientLight: '#4a5d23',
    backgroundColor: '#2a3b13',
    fogColor: '#4a5d23',
    modelPath: '/models/forest-retreat.glb',
  },
  beach: {
    name: 'Coastal Calm',
    description: 'A tranquil beach setting with gentle waves',
    ambientLight: '#ffd700',
    backgroundColor: '#87ceeb',
    fogColor: '#ffffff',
    modelPath: '/models/beach-scene.glb',
  },
  mountain: {
    name: 'Mountain Sanctuary',
    description: 'A peaceful mountain vista with distant peaks',
    ambientLight: '#b8d8e8',
    backgroundColor: '#87ceeb',
    fogColor: '#ffffff',
    modelPath: '/models/mountain-scene.glb',
  },
} as const;

export const WORKOUT_TYPES = {
  squat: {
    name: 'Squat',
    description: 'Lower body exercise targeting quads, hamstrings, and glutes',
    keyPoints: ['hip', 'knee', 'ankle'],
    idealAngles: {
      knee: { min: 85, max: 95 },
      hip: { min: 85, max: 95 },
    },
    instructions: [
      'Keep feet shoulder-width apart',
      'Keep chest up and back straight',
      'Lower until thighs are parallel to ground',
      'Keep weight in heels',
    ],
  },
  pushup: {
    name: 'Push-up',
    description: 'Upper body exercise targeting chest, shoulders, and triceps',
    keyPoints: ['shoulder', 'elbow', 'wrist'],
    idealAngles: {
      elbow: { min: 85, max: 95 },
    },
    instructions: [
      'Keep body in straight line',
      'Position hands slightly wider than shoulders',
      'Lower chest to ground',
      'Keep core engaged',
    ],
  },
  plank: {
    name: 'Plank',
    description: 'Core exercise for stability and strength',
    keyPoints: ['shoulder', 'hip', 'ankle'],
    idealAngles: {
      shoulder: { min: 175, max: 185 },
      hip: { min: 175, max: 185 },
    },
    instructions: [
      'Keep body in straight line',
      'Engage core muscles',
      'Keep shoulders over elbows',
      'Look at floor between hands',
    ],
  },
} as const;

export const YOGA_POSES = {
  warrior: {
    name: 'Warrior I',
    description: 'A standing pose that strengthens legs and opens hips',
    difficulty: 'beginner',
    keyPoints: ['hip', 'knee', 'ankle', 'shoulder'],
    idealAngles: {
      knee: { min: 85, max: 95 },
      hip: { min: 85, max: 95 },
      shoulder: { min: 175, max: 185 },
    },
    instructions: [
      'Front knee bent at 90 degrees',
      'Back leg straight and strong',
      'Hips facing forward',
      'Arms reaching up',
    ],
  },
  tree: {
    name: 'Tree Pose',
    description: 'A standing balance pose that improves focus and stability',
    difficulty: 'beginner',
    keyPoints: ['hip', 'knee', 'ankle'],
    idealAngles: {
      knee: { min: 85, max: 95 },
      hip: { min: 175, max: 185 },
    },
    instructions: [
      'Stand on one leg',
      'Place foot on inner thigh or calf',
      'Keep hips level',
      'Hands at heart or overhead',
    ],
  },
  'downward-dog': {
    name: 'Downward-Facing Dog',
    description: 'An inversion that stretches and strengthens the whole body',
    difficulty: 'beginner',
    keyPoints: ['shoulder', 'hip', 'ankle', 'wrist'],
    idealAngles: {
      shoulder: { min: 170, max: 190 },
      hip: { min: 85, max: 95 },
    },
    instructions: [
      'Form inverted V-shape',
      'Press hands firmly into ground',
      'Lift hips high',
      'Heels reaching toward ground',
    ],
  },
} as const;

export const MEDITATION_SOUNDSCAPES = {
  rain: {
    name: 'Gentle Rain',
    description: 'Soothing rainfall sounds for deep relaxation',
    audioPath: '/sounds/rain.mp3',
    volume: 0.5,
  },
  waves: {
    name: 'Ocean Waves',
    description: 'Calming ocean waves for peace and tranquility',
    audioPath: '/sounds/waves.mp3',
    volume: 0.5,
  },
  wind: {
    name: 'Forest Wind',
    description: 'Gentle breeze through trees for natural ambiance',
    audioPath: '/sounds/wind.mp3',
    volume: 0.4,
  },
  birds: {
    name: 'Morning Birds',
    description: 'Peaceful birdsong for a natural awakening',
    audioPath: '/sounds/birds.mp3',
    volume: 0.4,
  },
} as const;

export type ARRoomTheme = keyof typeof AR_ROOM_THEMES;
export type WorkoutType = keyof typeof WORKOUT_TYPES;
export type YogaPose = keyof typeof YOGA_POSES;
export type MeditationSoundscape = keyof typeof MEDITATION_SOUNDSCAPES; 