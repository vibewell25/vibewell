import React from 'react';
import { Vector3 } from 'three';

// Mock components as functions
export function MockCanvas(props: { children: React.ReactNode }) {


  return React.createElement('div', { 'data-testid': 'mock-canvas' }, props.children);
export function MockGL(props: { children: React.ReactNode }) {


  return React.createElement('div', { 'data-testid': 'mock-gl' }, props.children);
export function MockXR(props: { children: React.ReactNode }) {


  return React.createElement('div', { 'data-testid': 'mock-xr' }, props.children);
// Mock WebGL context
const mockWebGL = {
  getContext: () => ({
    canvas: document.createElement('canvas'),
    getExtension: () => null,
    getParameter: () => {},
    getShaderPrecisionFormat: () => ({
      precision: 1,
      rangeMin: 1,
      rangeMax: 1,
),
),
// Mock XR session
const mockXRSession = {
  requestReferenceSpace: () => Promise.resolve({}),
  requestAnimationFrame: (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
end: () => Promise.resolve(),
// Define XRSession interface to avoid 'any' type
interface XRSessionInterface {
  requestReferenceSpace: () => Promise<unknown>;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  end: () => Promise<void>;
interface XRWebGLLayerInterface {
  getViewport: () => { x: number; y: number; width: number; height: number };
// Custom render function for AR components
export function renderARComponent(ui: React.ReactElement) {
  // Mock canvas and WebGL context
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'getContext', { value: mockWebGL.getContext });

  // Setup mock XR
  (global as { XRSession?: XRSessionInterface }).XRSession = mockXRSession;
  (global as { XRWebGLLayer?: XRWebGLLayerInterface }).XRWebGLLayer = class {
    getViewport() {
      return { x: 0, y: 0, width: 1920, height: 1080 };
as unknown as XRWebGLLayerInterface;

  // Add the UI element to the container
  const container = document.createElement('div');
  container.appendChild(document.createElement('div')).appendChild(ui as unknown as Node);


  // Since we can't use @testing-library/react directly, provide a simple mock
  return {
    container,
    getByTestId: (id: string) => {
      const element = document.createElement('div');

      element.setAttribute('data-testid', id);
      return element;
// Helper to test AR transformations
export class ARTestHelper {
  static createTestVector(x: number, y: number, z: number) {
    return new Vector3(x, y, z);
static calculateDistance(v1: Vector3, v2: Vector3) {
    return v1.distanceTo(v2);
static isWithinBounds(position: Vector3, bounds: { min: Vector3; max: Vector3 }) {
    return (
      position.x >= bounds.min.x &&
      position.x <= bounds.max.x &&
      position.y >= bounds.min.y &&
      position.y <= bounds.max.y &&
      position.z >= bounds.min.z &&
      position.z <= bounds.max.z
// Performance testing utilities for AR
export class ARPerformanceTest {
  private startTime: number = 0;
  private measurements: { name: string; duration: number }[] = [];

  startMeasurement() {
    this.startTime = performance.now();
endMeasurement(name: string) {
    const duration = performance.now() - this.startTime;
    this.measurements.push({ name, duration });
getResults() {
    return {
      measurements: this.measurements,
      averageDuration:

        this.measurements.reduce((acc, m) => acc + m.duration, 0) / this.measurements.length,
      maxDuration: Math.max(...this.measurements.map((m) => m.duration)),
      minDuration: Math.min(...this.measurements.map((m) => m.duration)),
assertPerformance(maxDuration: number) {
    const results = this.getResults();
    if (results.averageDuration > maxDuration) {
      throw new Error(
        `Performance test failed: average duration ${results.averageDuration}ms exceeds maximum ${maxDuration}ms`,
// Asset loading test utilities
export class ARAssetTest {
  static async testAssetLoading(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load asset: ${response.statusText}`);

      const buffer = await response.arrayBuffer();
      return buffer.byteLength > 0;
catch (error) {
      console.error('Asset loading test failed:', error);
      return false;
static validateGLTF(buffer: ArrayBuffer): boolean {
    // Basic GLTF validation
    const header = new Uint32Array(buffer.slice(0, 20));
    const magic = header[0];
    const version = header[1];

    return magic === 0x46546c67 && version === 2; // Check for glTF magic number and version 2
