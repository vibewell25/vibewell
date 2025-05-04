// Central configuration for AR models

export interface ARModel {
  key: string;
  label: string;
  source: any;
  scale: [number, number, number];
}

export const AR_MODELS: ARModel[] = [

      { key: 'hair1', label: 'Hair Style 1', source: require('../assets/models/hair_model.glb'), scale: [0.2, 0.2, 0.2] },

      { key: 'spa1', label: 'Spa Room', source: require('../assets/models/spa_room.glb'), scale: [0.3, 0.3, 0.3] },

      { key: 'lipstick', label: 'Lipstick Look', source: require('../assets/models/lipstick.glb'), scale: [0.1, 0.1, 0.1] },
];
