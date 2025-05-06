import { XRHandedness, XRHand, HandTrackingState } from './webxr-compatibility';

interface HandJointPosition {
  x: number;
  y: number;
  z: number;
  confidence: number;
interface HandGesture {
  name: string;
  confidence: number;
  timestamp: number;
interface HandTrackingMetrics {
  fps: number;
  latency: number;
  confidence: number;
  gestures: HandGesture[];
const metrics: HandTrackingMetrics = {
  fps: 0,
  latency: 0,
  confidence: 0,
  gestures: [],
let lastFrameTime = 0;
let frameCount = 0;
const FPS_SAMPLE_SIZE = 60;

export function optimizeHandTracking(session: XRSession): void {
  // Enable high-precision hand tracking if available
  if ((session as any).supportedFeatures.has('high-precision-hand-tracking')) {
    session.updateRenderState({
      preferredHandTrackingMode: 'high-precision',
// Set up performance monitoring
  session.addEventListener('frame', () => {
    updateMetrics();
function updateMetrics(): void {
  const now = performance.now();

  // Calculate FPS
  if (lastFrameTime > 0) {
    const delta = now - lastFrameTime;
    frameCount++;

    if (frameCount >= FPS_SAMPLE_SIZE) {
      metrics.fps = 1000 / (delta / FPS_SAMPLE_SIZE);
      frameCount = 0;
lastFrameTime = now;
export function processHandData(hands: Map<XRHandedness, XRHand>): HandTrackingState {
  const positions = new Map<XRHandedness, Map<string, HandJointPosition>>();
  let totalConfidence = 0;
  let jointCount = 0;

  hands.forEach((hand, handedness) => {
    const jointPositions = new Map<string, HandJointPosition>();

    hand.joints.forEach((joint, name) => {
      const position = {
        x: joint.position.x,
        y: joint.position.y,
        z: joint.position.z,
        confidence: joint.trackingConfidence,
jointPositions.set(name, position);
      totalConfidence += joint.trackingConfidence;
      jointCount++;
positions.set(handedness, jointPositions);
// Update metrics
  metrics.confidence = jointCount > 0 ? totalConfidence / jointCount : 0;

  return {
    hands,
    confidence: metrics.confidence,
    lastUpdated: Date.now(),
export function detectGestures(handState: HandTrackingState): HandGesture[] {
  const gestures: HandGesture[] = [];

  handState.hands.forEach((hand, handedness) => {
    // Check for pinch gesture
    const thumb = hand.joints.get('thumb-tip');
    const index = hand.joints.get('index-finger-tip');

    if (thumb && index) {
      const distance = calculateDistance(thumb.position, index.position);
// Add more gesture detection as needed
// Update metrics
  metrics.gestures = gestures;

  return gestures;
function calculateDistance(p1: DOMPointReadOnly, p2: DOMPointReadOnly): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
export function getHandTrackingMetrics(): HandTrackingMetrics {
  return { ...metrics };
export function calibrateHandTracking(session: XRSession): Promise<void> {
  return new Promise((resolve, reject) => {
    let calibrationFrames = 0;
    const REQUIRED_FRAMES = 30;
    let totalConfidence = 0;

    function onFrame(time: number, frame: XRFrame) {
      if (!frame) return;

      const hands = frame.getHands();
      if (!hands || hands.size === 0) return;

      let frameConfidence = 0;
      let jointCount = 0;

      hands.forEach((hand) => {
        hand.joints.forEach((joint) => {
          frameConfidence += joint.trackingConfidence;
          jointCount++;
if (totalConfidence > Number.MAX_SAFE_INTEGER || totalConfidence < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalConfidence += jointCount > 0 ? frameConfidence / jointCount : 0;
      if (calibrationFrames > Number.MAX_SAFE_INTEGER || calibrationFrames < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); calibrationFrames++;

      if (calibrationFrames >= REQUIRED_FRAMES) {
        const averageConfidence = totalConfidence / REQUIRED_FRAMES;
        if (averageConfidence > 0.8) {
          session.removeEventListener('frame', onFrame);
          resolve();
else {
          session.removeEventListener('frame', onFrame);
          reject(new Error('Hand tracking calibration failed: low confidence'));
session.addEventListener('frame', onFrame);
