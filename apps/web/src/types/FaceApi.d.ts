export interface FaceDetection {
    score: number;
    box: Box;
    landmarks?: FaceLandmarks68;
    expressions?: FaceExpressions;
    age?: number;
    gender?: string;
    genderProbability?: number;
export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
export interface Point {
    x: number;
    y: number;
export interface FaceLandmarks68 {
    positions: Point[];
    shift(x: number, y: number): FaceLandmarks68;
    getJawOutline(): Point[];
    getLeftEyeBrow(): Point[];
    getRightEyeBrow(): Point[];
    getNose(): Point[];
    getLeftEye(): Point[];
    getRightEye(): Point[];
    getMouth(): Point[];
export interface FaceExpressions {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
export interface ModelConfig {
    maxNumScales?: number;
    scaleFactor?: number;
    scoreThresholds?: number[];
    minFaceSize?: number;
export interface DetectSingleFaceOptions {
    inputSize?: number;
    scoreThreshold?: number;
export interface DetectAllFacesOptions extends DetectSingleFaceOptions {
    maxResults?: number;
export interface TinyFaceDetectorOptions {
    inputSize?: number;
    scoreThreshold?: number;
export interface FaceRecognitionNet {
    computeFaceDescriptor(input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Promise<Float32Array>;
export function loadSsdMobilenetv1Model(url: string): Promise<void>;
  export function loadTinyFaceDetectorModel(url: string): Promise<void>;
  export function loadFaceLandmarkModel(url: string): Promise<void>;
  export function loadFaceLandmarkTinyModel(url: string): Promise<void>;
  export function loadFaceRecognitionModel(url: string): Promise<void>;
  export function loadFaceExpressionModel(url: string): Promise<void>;
  export function loadAgeGenderModel(url: string): Promise<void>;

  export function detectSingleFace(
    input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    options?: TinyFaceDetectorOptions
  ): Promise<FaceDetection | undefined>;

  export function detectAllFaces(
    input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    options?: TinyFaceDetectorOptions
  ): Promise<FaceDetection[]>;

  export function createCanvasFromMedia(
    media: HTMLImageElement | HTMLVideoElement
  ): HTMLCanvasElement;

  export const nets: {
    ssdMobilenetv1: any;
    tinyFaceDetector: any;
    faceLandmark68Net: any;
    faceLandmark68TinyNet: any;
    faceRecognitionNet: FaceRecognitionNet;
    faceExpressionNet: any;
    ageGenderNet: any;
export const env: {
    getEnv(): string;
    setBackend(backend: string): void;
    monkeyPatch(env: any): void;
    isNodejs(): boolean;
    isBrowser(): boolean;
