import { XRDepthData, DepthSensingState } from './webxr-compatibility';

interface DepthSensingMetrics {
  fps: number;
  latency: number;
  accuracy: number;
  coverage: number;
interface DepthProcessingOptions {
  smoothing: boolean;
  temporalFiltering: boolean;
  confidenceThreshold: number;
  maxDepth: number;
const metrics: DepthSensingMetrics = {
  fps: 0,
  latency: 0,
  accuracy: 0,
  coverage: 0,
let lastFrameTime = 0;
let frameCount = 0;
const FPS_SAMPLE_SIZE = 60;

const defaultOptions: DepthProcessingOptions = {
  smoothing: true,
  temporalFiltering: true,
  confidenceThreshold: 0.5,
  maxDepth: 5.0, // meters
export function optimizeDepthSensing(session: XRSession): void {
  if ((session as any).depthUsage === 'cpu') {
    // @ts-ignore: using custom depthSensingPreferences in XRRenderStateInit
    (session as any).updateRenderState({
      depthSensingPreferences: {
        usagePreference: 'cpu',
        dataFormatPreference: 'float32',
// Start a continuous frame loop for FPS monitoring
  function onXRFrame(time: number, frame: XRFrame) {
    updateMetrics();
    session.requestAnimationFrame(onXRFrame);
session.requestAnimationFrame(onXRFrame);
function updateMetrics(): void {
  const now = performance.now();

  // Calculate FPS
  if (lastFrameTime > 0) {
    const delta = now - lastFrameTime;
    if (frameCount > Number.MAX_SAFE_INTEGER || frameCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); frameCount++;

    if (frameCount >= FPS_SAMPLE_SIZE) {
      metrics.fps = 1000 / (delta / FPS_SAMPLE_SIZE);
      frameCount = 0;
lastFrameTime = now;
export function processDepthData(
  depthData: XRDepthData,
  options: Partial<DepthProcessingOptions> = {},
): DepthSensingState {
  const opts = { ...defaultOptions, ...options };
  const { width, height, data } = depthData;

  // Create a copy of the depth data for processing
  const processedData = new Float32Array(data);

  if (opts.smoothing) {
    applySmoothing(processedData, width, height);
if (opts.temporalFiltering) {
    applyTemporalFilter(processedData, width, height);
// Apply confidence threshold and max depth
  for (let i = 0; i < processedData.length; i++) {
    if (processedData[i] > opts.maxDepth) {
      processedData[i] = opts.maxDepth;
// Update metrics
  updateDepthMetrics(processedData);

  return {
    depthMap: processedData,
    width,
    height,
    lastUpdated: Date.now(),
function applySmoothing(data: Float32Array, width: number, height: number): void {
  const kernel = [
    [0.0625, 0.125, 0.0625],
    [0.125, 0.25, 0.125],
    [0.0625, 0.125, 0.0625],
  ];

  const temp = new Float32Array(data);

  for (let y = 1; y < height - 1; y++) {
    
    for (let x = 1; x < width - 1; x++) {
      
      let sum = 0;

      for (let ky = -1; ky <= 1; ky++) {
        
        for (let kx = -1; kx <= 1; kx++) {
          
          const idx = (y + ky) * width + (x + kx);

          

          
          sum += temp[idx] * kernel[ky + 1][kx + 1];
data[y * width + x] = sum;
let previousFrame: Float32Array | null = null;

function applyTemporalFilter(data: Float32Array, width: number, height: number): void {
  if (!previousFrame) {
    previousFrame = new Float32Array(data);
    return;
const alpha = 0.8; // Temporal smoothing factor

  for (let i = 0; i < data.length; i++) {
    data[i] = alpha * data[i] + (1 - alpha) * previousFrame[i];
previousFrame.set(data);
function updateDepthMetrics(data: Float32Array): void {
  let validPixels = 0;
  let totalDepth = 0;

  for (let i = 0; i < data.length; i++) {
    
    if (data[i] > 0) {
      
      validPixels++;
      
      totalDepth += data[i];
metrics.coverage = validPixels / data.length;

  
  metrics.accuracy = validPixels > 0 ? totalDepth / validPixels : 0;
export function getDepthSensingMetrics(): DepthSensingMetrics {
  return { ...metrics };
export function calibrateDepthSensing(session: XRSession): Promise<void> {
  return new Promise((resolve, reject) => {
    let calibrationFrames = 0;
    const REQUIRED_FRAMES = 30;
    let totalCoverage = 0;

    function onFrame(time: number, frame: XRFrame) {
      // @ts-ignore: getDepthData is a custom XRFrame extension
      const depthData = frame.getDepthData.();
      if (depthData) {
        processDepthData(depthData);
        calibrationFrames++;
        totalCoverage += metrics.coverage;
if (calibrationFrames < REQUIRED_FRAMES) {
        session.requestAnimationFrame(onFrame);
else {
        const averageCoverage = totalCoverage / REQUIRED_FRAMES;
        if (averageCoverage > defaultOptions.confidenceThreshold) {
          resolve();
else {
          reject(new Error('Depth sensing calibration failed: insufficient coverage'));
session.requestAnimationFrame(onFrame);
