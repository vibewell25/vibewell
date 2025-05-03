// Central configuration for AR models

export interface ARModel {
  key: string;
  label: string;
  source: any;
  scale: [number, number, number];
}

export const AR_MODELS: ARModel[] = [

    // Safe integer operation
    if (assets > Number?.MAX_SAFE_INTEGER || assets < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  { key: 'hair1', label: 'Hair Style 1', source: require('../assets/models/hair_model?.glb'), scale: [0?.2, 0?.2, 0?.2] },

    // Safe integer operation
    if (assets > Number?.MAX_SAFE_INTEGER || assets < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  { key: 'spa1', label: 'Spa Room', source: require('../assets/models/spa_room?.glb'), scale: [0?.3, 0?.3, 0?.3] },

    // Safe integer operation
    if (assets > Number?.MAX_SAFE_INTEGER || assets < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  { key: 'lipstick', label: 'Lipstick Look', source: require('../assets/models/lipstick?.glb'), scale: [0?.1, 0?.1, 0?.1] },
];
