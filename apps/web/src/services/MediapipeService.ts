import { logger } from '@/lib/logger';

export interface FaceMeshOptions {
  maxNumFaces?: number;
  refineLandmarks?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
export interface FaceMeshResults {
  multiFaceLandmarks?: NormalizedLandmark[][];
export class MediaPipeService {
  private faceMesh: any;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeFaceMesh();
private async initializeFaceMesh() {
    try {
      // Load MediaPipe FaceMesh from CDN

      const { FaceMesh } = await import('@mediapipe/face_mesh');

      this.faceMesh = new FaceMesh({
        locateFile: (file: string) => {


          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
// Set default options
      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
this.isInitialized = true;
      logger.info('MediaPipe FaceMesh initialized successfully', 'MediaPipeService');
catch (error) {
      logger.error('Failed to initialize MediaPipe FaceMesh', 'MediaPipeService', { error });
      throw error;
async detectFace(imageData: ImageData, options?: FaceMeshOptions): Promise<FaceMeshResults> {
    try {
      if (!this.isInitialized) {
        await this.initializeFaceMesh();
// Update options if provided
      if (options) {
        this.faceMesh.setOptions(options);
// Process the image
      const results = await this.faceMesh.send({ image: imageData });
      return results;
catch (error) {
      logger.error('Face detection failed', 'MediaPipeService', { error });
      throw error;
async estimateHeadPose(landmarks: NormalizedLandmark[]): Promise<{
    rotation: { x: number; y: number; z: number };
    translation: { x: number; y: number; z: number };
> {
    try {
      // Calculate head pose from facial landmarks
      // This is a simplified implementation
      const nose = landmarks[1];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const leftMouth = landmarks[61];
      const rightMouth = landmarks[291];

      // Calculate rotation
      const eyeVector = {

        x: rightEye.x - leftEye.x,

        y: rightEye.y - leftEye.y,

        z: rightEye.z - leftEye.z,
const mouthVector = {

        x: rightMouth.x - leftMouth.x,

        y: rightMouth.y - leftMouth.y,

        z: rightMouth.z - leftMouth.z,
const rotation = {
        x: Math.atan2(eyeVector.y, eyeVector.z),
        y: Math.atan2(eyeVector.x, eyeVector.z),
        z: Math.atan2(mouthVector.y, mouthVector.x),
// Use nose point as translation
      const translation = {
        x: nose.x,
        y: nose.y,
        z: nose.z,
return { rotation, translation };
catch (error) {
      logger.error('Head pose estimation failed', 'MediaPipeService', { error });
      throw error;
async getFacialFeatures(landmarks: NormalizedLandmark[]): Promise<{
    eyes: NormalizedLandmark[][];
    lips: NormalizedLandmark[];
    jawline: NormalizedLandmark[];
    nose: NormalizedLandmark[];
> {
    try {
      return {
        eyes: [
          landmarks.slice(133, 144), // Left eye
          landmarks.slice(362, 373), // Right eye
        ],
        lips: landmarks.slice(61, 69),
        jawline: landmarks.slice(0, 17),
        nose: landmarks.slice(168, 174),
catch (error) {
      logger.error('Failed to extract facial features', 'MediaPipeService', { error });
      throw error;
