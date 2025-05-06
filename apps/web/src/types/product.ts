export type ProductType = 'makeup' | 'accessory';
export type MakeupType = 'lipstick' | 'eyeshadow' | 'foundation' | 'blush' | 'mascara';
export type AccessoryType = 'earrings' | 'necklace' | 'glasses' | 'hat';

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  currency: string;
  modelUrl: string;
  thumbnailUrl: string;
  color?: string;
  makeupType?: MakeupType;
  accessoryType?: AccessoryType;
  metalness?: number;
  roughness?: number;
  intensity?: number;
  metadata?: {
    brand?: string;
    collection?: string;
    season?: string;
    tags?: string[];
    dimensions?: {
      width: number;
      height: number;
      depth: number;
ar: {
    placement: {
      position: {
        x: number;
        y: number;
        z: number;
rotation: {
        x: number;
        y: number;
        z: number;
scale: {
        x: number;
        y: number;
        z: number;
tracking: {
      points: string[];
      regions: string[];
      constraints: {
        minScale: number;
        maxScale: number;
        minRotation: number;
        maxRotation: number;
materials: {
      type: string;
      properties: Record<string, any>;
[];
