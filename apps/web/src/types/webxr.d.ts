export interface XRDepthData {
  data: Float32Array;
  width: number;
  height: number;
declare global {
  // Allow custom depth sensing preferences in render state
  interface XRRenderStateInit {
    depthSensingPreferences?: {
      usagePreference: 'cpu' | 'gpu';
      dataFormatPreference: 'luminance-alpha' | 'float32';
// Allow SESSION to optionally include depthUsage
  interface XRSession {
    depthUsage?: 'cpu' | 'gpu';
// Expose getDepthData on XRFrame
  interface XRFrame {
    getDepthData?(): XRDepthData;
export {}; 