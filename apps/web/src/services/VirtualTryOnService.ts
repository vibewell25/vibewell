import { PrismaClient, TryOnType } from '@prisma/client';
import { OpenAI } from 'openai';

import { logger } from '@/lib/logger';

import * as tf from '@tensorflow/tfjs';

import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { ColorUtils } from '@/utils/color-utils';

import { MediaPipeService } from './mediapipe-service';

import { FaceApiService } from './face-api-service';

// Add ImageBitmapRenderingContext for offscreen canvas
type OffscreenRenderingContext = ImageBitmapRenderingContext | OffscreenCanvasRenderingContext2D;

const prisma = new PrismaClient();

interface ARSession {
  id: string;
  filters: ARFilter[];
  state: ARState;
}

interface ARFilter {
  id: string;
  type: 'makeup' | 'hair' | 'skin';
  settings: Record<string, any>;
}

interface ARState {
  lastFrame?: ImageData;
  camera?: THREE.PerspectiveCamera;
  scene?: THREE.Scene;
}

interface SkinAnalysisResult {
  skinType: string;
  concerns: string[];
  score: number;
  analysis: Record<string, any>;
  recommendations: Record<string, any>;
}

interface MakeupResult {
  foundationShade: string;
  colorPalette: Record<string, any>;
  products: Record<string, any>;
  facialFeatures: Record<string, any>;
}

/**
 * Image loading status for progressive loading
 */
type ImageLoadingStatus = 'loading' | 'loaded' | 'error';

/**
 * Cache for loaded images to prevent redundant loading
 */
interface ImageCache {
  [url: string]: {
    image: HTMLImageElement;
    status: ImageLoadingStatus;
    timestamp: number;
    lowResVersion?: HTMLImageElement;
  };
}

export class VirtualTryOnService {
  private openai: OpenAI;
  private faceModel!: tf.LayersModel;
  private arSessions: Map<string, ARSession>;
  private gltfLoader: GLTFLoader;
  private colorUtils: ColorUtils;
  private mediaPipeService: MediaPipeService;
  private faceApiService: FaceApiService;
  private imageCache: ImageCache = {};
  private imageProcessingWorker: Worker | null = null;
  private cacheExpiryTime = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    this.arSessions = new Map();
    this.gltfLoader = new GLTFLoader();
    this.colorUtils = new ColorUtils();
    this.mediaPipeService = new MediaPipeService();
    this.faceApiService = new FaceApiService();
    this.initializeFaceModel();
    this.initializeImageProcessingWorker();
  }

  /**
   * Initialize the face model for skin analysis
   */
  private async initializeFaceModel() {
    try {
      this.faceModel = await tf.loadLayersModel('/models/skin_analysis_model/model.json');
      logger.info('Face models initialized successfully', 'VirtualTryOn');
    } catch (error) {
      logger.error('Failed to initialize face models', 'VirtualTryOn', { error });
      throw error;
    }
  }

  /**
   * Initialize the Web Worker for image processing
   */
  private initializeImageProcessingWorker() {
    if (typeof window !== 'undefined' && window.Worker) {
      try {
        this.imageProcessingWorker = new Worker('/workers/image-processing-worker.js');
        logger.info('Image processing worker initialized', 'VirtualTryOn');
      } catch (error) {
        logger.error('Failed to initialize image processing worker', 'VirtualTryOn', { error });
        // Fallback to main thread processing if worker fails to initialize
        this.imageProcessingWorker = null;
      }
    }
  }

  async startARSession(userId: string, serviceId: string): Promise<string> {
    try {
      // Initialize Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      
      const session: ARSession = {
        id: Math.random().toString(36).substring(7),
        filters: [],
        state: {
          camera,
          scene,
        }
      };
      
      this.arSessions.set(session.id, session);

      // Create virtual try-on record
      const tryOn = await prisma.virtualTryOn.create({
        data: {
          userId,
          serviceId,
          type: TryOnType.AR_FILTER,
          arSessionId: session.id,
          settings: {},
          imageUrl: '',
          resultUrl: '',
        }
      });
      
      logger.info('AR session started', 'VirtualTryOn', { sessionId: session.id });
      return session.id;
    } catch (error) {
      logger.error('Error starting AR session', 'VirtualTryOn', { error });
      throw error;
    }
  }

  async processARFrame(sessionId: string, frameData: ImageData): Promise<ImageData> {
    try {
      const session = this.arSessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      // Update face mesh with new frame
      const results = await this.mediaPipeService.detectFace(frameData);

      if (!results.multiFaceLandmarks.length) {
        return frameData;
      }
      
      const landmarks = results.multiFaceLandmarks[0];

      // Check if we should use the Web Worker for processing
      if (this.imageProcessingWorker) {
        return await this.processFrameWithWorker(session, frameData, landmarks);
      }

      // Fallback to main thread processing
      return this.processFrameOnMainThread(session, frameData, landmarks);
    } catch (error) {
      logger.error('Error processing AR frame', 'VirtualTryOn', { error });
      // Return original frame on error to prevent display disruption
      return frameData;
    }
  }

  /**
   * Process a frame using a Web Worker for better performance
   */
  private async processFrameWithWorker(
    session: ARSession,
    frameData: ImageData,
    landmarks: { x: number; y: number; z: number }[]
  ): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const offscreen = new OffscreenCanvas(frameData.width, frameData.height);
      const ctx = offscreen.getContext('2d') as OffscreenCanvasRenderingContext2D;
      
      if (!ctx) {
        reject(new Error('Could not get offscreen canvas context'));
        return;
      }
      
      // Put the original frame data on the offscreen canvas
      ctx.putImageData(frameData, 0, 0);
      
      // Create a message with the canvas, landmarks, and filters
      const transferable = offscreen.transferToImageBitmap();
      
      // Set up the onmessage handler to receive the processed frame
      this.imageProcessingWorker!.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
          return;
        }
        
        // Convert the processed ImageBitmap back to ImageData
        const processedBitmap = event.data.processedFrame;
        const resultCanvas = document.createElement('canvas');
        resultCanvas.width = frameData.width;
        resultCanvas.height = frameData.height;
        const resultCtx = resultCanvas.getContext('2d');
        
        if (!resultCtx) {
          reject(new Error('Could not get result canvas context'));
          return;
        }
        
        resultCtx.drawImage(processedBitmap, 0, 0);
        const resultImageData = resultCtx.getImageData(0, 0, frameData.width, frameData.height);
        
        // Update session state
        session.state.lastFrame = resultImageData;
        
        resolve(resultImageData);
      };
      
      // Send the data to the worker
      this.imageProcessingWorker!.postMessage(
        {
          frame: transferable,
          landmarks: landmarks,
          filters: session.filters,
          dimensions: { width: frameData.width, height: frameData.height }
        },
        [transferable]
      );
    });
  }

  /**
   * Process a frame on the main thread as a fallback
   */
  private processFrameOnMainThread(
    session: ARSession,
    frameData: ImageData,
    landmarks: { x: number; y: number; z: number }[]
  ): ImageData {
    // Create canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = frameData.width;
    canvas.height = frameData.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not get canvas context');

    // Draw original frame
    ctx.putImageData(frameData, 0, 0);

    // Apply each filter
    for (const filter of session.filters) {
      switch (filter.type) {
        case 'makeup':
          this.applyMakeupFilter(ctx, landmarks, filter.settings);
          break;
        case 'hair':
          this.applyHairFilter(ctx, landmarks, filter.settings, session.state);
          break;
        case 'skin':
          this.applySkinFilter(ctx, landmarks, filter.settings);
          break;
      }
    }
    
    // Update session state
    session.state.lastFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return session.state.lastFrame;
  }

  private async applyMakeupFilter(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number; z: number }[],
    settings: Record<string, any>,
  ) {
    const features = await this.mediaPipeService.getFacialFeatures(landmarks);

    // Apply lipstick
    if (settings.lipstick) {
      ctx.fillStyle = settings.lipstick.color;
      ctx.beginPath();
      features.lips.forEach((point, index) => {
        const x = point.x * ctx.canvas.width;
        const y = point.y * ctx.canvas.height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
    }
    
    // Apply eye makeup
    if (settings.eyeMakeup) {
      features.eyes.forEach((eye) => {
        ctx.strokeStyle = settings.eyeMakeup.color;
        ctx.lineWidth = settings.eyeMakeup.width || 2;
        ctx.beginPath();
        eye.forEach((point, index) => {
          const x = point.x * ctx.canvas.width;
          const y = point.y * ctx.canvas.height;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      });
    }
  }

  private async applyHairFilter(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number; z: number }[],
    settings: Record<string, any>,
    state: ARState,
  ) {
    if (!state.scene || !state.camera) return;

    // Update hair model position based on head pose
    const headPose = await this.mediaPipeService.estimateHeadPose(landmarks);
    const hairModel = state.scene.getObjectByName('hairModel');

    if (hairModel) {
      hairModel.position.set(
        headPose.translation.x,
        headPose.translation.y,
        headPose.translation.z,
      );
      hairModel.rotation.set(headPose.rotation.x, headPose.rotation.y, headPose.rotation.z);
    }

    // Render the 3D scene
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.render(state.scene, state.camera);

    // Composite 3D render with the original frame
    const threeCanvas = renderer.domElement;
    ctx.drawImage(threeCanvas, 0, 0);
    
    // Clean up renderer to prevent memory leaks
    renderer.dispose();
  }

  private async applySkinFilter(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number; z: number }[],
    settings: Record<string, any>,
  ) {
    // Apply skin smoothing
    if (settings.smoothing) {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const smoothedData = this.applySkinSmoothing(imageData, settings.smoothing);
      ctx.putImageData(smoothedData, 0, 0);
    }

    // Apply skin tone adjustment
    if (settings.toneAdjustment) {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const adjustedData = this.adjustSkinTone(imageData, settings.toneAdjustment);
      ctx.putImageData(adjustedData, 0, 0);
    }
  }

  private applySkinSmoothing(imageData: ImageData, strength: number): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    // Performance optimization: Only process every other pixel for faster rendering
    // This is acceptable for real-time preview with minimal quality loss
    const skipFactor = strength > 0.7 ? 1 : 2;

    for (let y = 1; y < height - 1; y += skipFactor) {
      for (let x = 1; x < width - 1; x += skipFactor) {
        const idx = (y * width + x) * 4;

        // Apply gaussian blur
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          sum += data[idx - width * 4 + c] * 0.1;
          sum += data[idx - 4 + c] * 0.1;
          sum += data[idx + c] * 0.6;
          sum += data[idx + 4 + c] * 0.1;
          sum += data[idx + width * 4 + c] * 0.1;
          
          data[idx + c] = sum * strength + data[idx + c] * (1 - strength);
          
          // If we're skipping pixels, copy this pixel's value to the skipped neighboring pixels
          if (skipFactor > 1) {
            if (x + 1 < width) data[idx + 4 + c] = data[idx + c];
            if (y + 1 < height) data[idx + width * 4 + c] = data[idx + c];
          }
        }
      }
    }

    return new ImageData(data, width, height);
  }

  private adjustSkinTone(
    imageData: ImageData,
    adjustment: { hue: number; saturation: number; brightness: number },
  ): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const skipFactor = 2; // Process every other pixel for performance
    const totalPixels = data.length / 4;

    // Pre-compute HSL colors in smaller batches to avoid long-running loops
    for (let i = 0; i < totalPixels; i += skipFactor) {
      const pixelIndex = i * 4;
      
      if (pixelIndex >= data.length) break;
      
      const [h, s, l] = this.colorUtils.rgbToHsl(
        data[pixelIndex], 
        data[pixelIndex + 1], 
        data[pixelIndex + 2]
      );

      const newHue = (h + adjustment.hue) % 360;
      const newSat = Math.max(0, Math.min(100, s + adjustment.saturation));
      const newLight = Math.max(0, Math.min(100, l + adjustment.brightness));

      const [r, g, b] = this.colorUtils.hslToRgb(newHue, newSat, newLight);

      data[pixelIndex] = r;
      data[pixelIndex + 1] = g;
      data[pixelIndex + 2] = b;
      
      // If we're skipping pixels, copy this pixel's value to the skipped neighboring pixels
      if (skipFactor > 1 && i + 1 < totalPixels) {
        const nextPixelIndex = (i + 1) * 4;
        if (nextPixelIndex < data.length) {
          data[nextPixelIndex] = r;
          data[nextPixelIndex + 1] = g;
          data[nextPixelIndex + 2] = b;
        }
      }
    }

    return new ImageData(data, imageData.width, imageData.height);
  }

  async analyzeSkin(userId: string, imageUrl: string): Promise<SkinAnalysisResult> {
    try {
      // Load and analyze image with face-api.js using progressive loading
      const image = await this.loadImageProgressively(imageUrl);
      const detections = await this.faceApiService.detectFace(image, {
        withLandmarks: true,
        withExpressions: true,
        withAgeAndGender: true,
      });

      if (!detections.length) {
        throw new Error('No face detected in image');
      }

      // Get face attributes
      const attributes = await this.faceApiService.analyzeFaceAttributes(detections[0]);

      // Process image for skin analysis model
      const preprocessed = this.preprocessImage(await tf.browser.fromPixels(image));
      const predictions = await this.faceModel.predict(preprocessed);

      // Process predictions
      const analysis = this.processSkinAnalysis(predictions);

      // Get product recommendations
      const recommendations = await this.getProductRecommendations(analysis);

      // Create virtual try-on record
      const tryOn = await prisma.virtualTryOn.create({
        data: {
          userId,
          imageUrl,
          type: TryOnType.SKINCARE,
          settings: {},
          resultUrl: imageUrl,
          skinAnalysis: {
            create: {
              skinType: analysis.skinType,
              concerns: analysis.concerns,
              score: analysis.score,
              analysis: analysis.analysis,
              recommendations,
            }
          }
        }
      });
      
      logger.info('Skin analysis completed', 'VirtualTryOn', { userId });
      return {
        skinType: analysis.skinType,
        concerns: analysis.concerns,
        score: analysis.score,
        analysis: analysis.analysis,
        recommendations,
      };
    } catch (error) {
      logger.error('Error analyzing skin', 'VirtualTryOn', { error });
      throw error;
    }
  }

  async tryOnMakeup(userId: string, imageUrl: string, products: any[]): Promise<MakeupResult> {
    try {
      // Load and analyze image with progressive loading
      const image = await this.loadImageProgressively(imageUrl);
      const detections = await this.faceApiService.detectFace(image, {
        withLandmarks: true,
        withExpressions: true,
      });

      if (!detections.length) {
        throw new Error('No face detected');
      }

      // Convert to MediaPipe format for consistent processing
      const faceMeshResults = await this.faceApiService.convertToFaceMeshResults(detections);

      // Analyze skin tone for foundation matching
      const attributes = await this.faceApiService.analyzeFaceAttributes(detections[0]);
      const skinTone = attributes.skinTone || 'medium';

      // Generate color recommendations
      const colorPalette = await this.generateColorPalette(skinTone);

      // Create an OffscreenCanvas if available for better performance
      let canvas: HTMLCanvasElement | OffscreenCanvas;
      let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
      
      if (typeof OffscreenCanvas !== 'undefined') {
        canvas = new OffscreenCanvas(image.width, image.height);
        ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
      } else {
        canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      }

      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(image, 0, 0);
      await this.applyMakeupFilter(ctx as CanvasRenderingContext2D, faceMeshResults.multiFaceLandmarks![0], {
        products,
        skinTone,
      });

      // Convert the result to a URL
      let resultUrl: string;
      if (canvas instanceof OffscreenCanvas) {
        const blob = await canvas.convertToBlob({ type: 'image/png' });
        resultUrl = URL.createObjectURL(blob);
      } else {
        resultUrl = (canvas as HTMLCanvasElement).toDataURL();
      }

      // Create virtual try-on record
      const tryOn = await prisma.virtualTryOn.create({
        data: {
          userId,
          imageUrl,
          resultUrl,
          type: TryOnType.MAKEUP,
          settings: { products },
          makeupTryOn: {
            create: {
              foundationShade: skinTone,
              colorPalette,
              products,
              facialFeatures: detections[0].landmarks,
            }
          }
        }
      });
      
      logger.info('Makeup try-on completed', 'VirtualTryOn', { userId });
      return {
        foundationShade: skinTone,
        colorPalette,
        products,
        facialFeatures: detections[0].landmarks,
      };
    } catch (error) {
      logger.error('Error trying on makeup', 'VirtualTryOn', { error });
      throw error;
    }
  }

  async tryOnHairstyle(userId: string, imageUrl: string, hairstyleId: string): Promise<string> {
    try {
      // Load and analyze image with progressive loading
      const image = await this.loadImageProgressively(imageUrl);
      const detections = await this.faceApiService.detectFace(image, {
        withLandmarks: true,
      });

      if (!detections.length) {
        throw new Error('No face detected');
      }

      // Convert to MediaPipe format
      const faceMeshResults = await this.faceApiService.convertToFaceMeshResults(detections);

      // Set up 3D scene with optimized settings
      const scene = new THREE.Scene();
      // Use frustum culling to avoid rendering objects outside of view
      scene.frustumCulled = true;

      const camera = new THREE.PerspectiveCamera(75, image.width / image.height, 0.1, 1000);

      // Load 3D hair model with caching
      const hairModel = await this.load3DHairModel(hairstyleId);
      // Optimize the 3D model for performance
      this.optimizeModel(hairModel);
      scene.add(hairModel);

      // Position hair model based on head pose
      const headPose = await this.mediaPipeService.estimateHeadPose(
        faceMeshResults.multiFaceLandmarks![0],
      );

      hairModel.position.set(
        headPose.translation.x,
        headPose.translation.y,
        headPose.translation.z,
      );
      hairModel.rotation.set(headPose.rotation.x, headPose.rotation.y, headPose.rotation.z);

      // Render the result with optimized settings
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(image.width, image.height);
      renderer.render(scene, camera);

      // Composite the result
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(image, 0, 0);
      ctx.drawImage(renderer.domElement, 0, 0);

      const resultUrl = canvas.toDataURL();

      // Create virtual try-on record
      const tryOn = await prisma.virtualTryOn.create({
        data: {
          userId,
          imageUrl,
          resultUrl,
          type: TryOnType.HAIR,
          settings: { hairstyleId },
          hairTryOn: {
            create: {
              hairstyleId,
            }
          }
        }
      });
      
      // Clean up renderer and other resources
      renderer.dispose();
      
      logger.info('Hairstyle try-on completed', 'VirtualTryOn', { userId });
      return resultUrl;
    } catch (error) {
      logger.error('Error trying on hairstyle', 'VirtualTryOn', { error });
      throw error;
    }
  }

  // Helper methods

  /**
   * Optimize a THREE.js model for better performance
   */
  private optimizeModel(model: THREE.Object3D): void {
    // Traverse all children
    model.traverse((child) => {
      // Enable frustum culling
      child.frustumCulled = true;
      
      // If it's a mesh with geometry
      if ((child as THREE.Mesh).geometry) {
        const mesh = child as THREE.Mesh;
        
        // Convert to BufferGeometry if it's not already
        if (!(mesh.geometry instanceof THREE.BufferGeometry)) {
          mesh.geometry = new THREE.BufferGeometry().fromGeometry(mesh.geometry as any);
        }
        
        // Merge vertices to reduce draw calls
        mesh.geometry.mergeVertices();
        
        // Compute vertex normals for better lighting
        mesh.geometry.computeVertexNormals();
        
        // Dispose of unused attributes
        mesh.geometry.attributes = {
          position: mesh.geometry.attributes.position,
          normal: mesh.geometry.attributes.normal,
          uv: mesh.geometry.attributes.uv
        } as any;
      }
    });
  }

  /**
   * Load an image with progressive loading strategy
   * First loads a low-res version, then the full version
   */
  private async loadImageProgressively(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // Check if image is already in cache
      const now = Date.now();
      if (this.imageCache[url] && this.imageCache[url].status === 'loaded') {
        // If the cached image is not too old, use it
        if (now - this.imageCache[url].timestamp < this.cacheExpiryTime) {
          return resolve(this.imageCache[url].image);
        } else {
          // Otherwise remove it from cache
          delete this.imageCache[url];
        }
      }
      
      // Create a new entry in the cache
      if (!this.imageCache[url]) {
        this.imageCache[url] = {
          image: new Image(),
          status: 'loading',
          timestamp: now
        };
      }
      
      const img = this.imageCache[url].image;
      img.crossOrigin = 'anonymous';
      
      // Set up image load and error handlers
      img.onload = () => {
        this.imageCache[url].status = 'loaded';
        this.imageCache[url].timestamp = Date.now();
        resolve(img);
      };
      
      img.onerror = (e) => {
        this.imageCache[url].status = 'error';
        // Remove failed loads from cache
        delete this.imageCache[url];
        reject(new Error(`Failed to load image from ${url}`));
      };
      
      // Try to create a low-res version first for faster initial display
      // This is useful for progressive loading
      this.createLowResImage(url).then((lowResImg) => {
        // Store the low-res version in cache
        if (lowResImg) {
          this.imageCache[url].lowResVersion = lowResImg;
          // If we're still loading the high-res version, we can return the low-res one
          if (this.imageCache[url].status === 'loading') {
            resolve(lowResImg);
          }
        }
      }).catch(() => {
        // If low-res creation fails, just continue with normal loading
      });
      
      // Start loading the full resolution image
      img.src = url;
    });
  }

  /**
   * Create a low-resolution version of an image for faster initial loading
   */
  private async createLowResImage(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      // Create a new image element for the low-res version
      const lowResImg = new Image();
      lowResImg.crossOrigin = 'anonymous';
      
      // Create a smaller version of the image URL if possible
      // This could be done by adding query parameters for image services
      // that support dynamic resizing (e.g., ?w=100&q=50)
      const lowResUrl = this.getLowResImageUrl(url);
      
      lowResImg.onload = () => {
        // Create a small version using canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(null);
          return;
        }
        
        // Use a smaller size for low-res
        canvas.width = lowResImg.width / 4;
        canvas.height = lowResImg.height / 4;
        
        // Draw at reduced quality
        ctx.drawImage(lowResImg, 0, 0, canvas.width, canvas.height);
        
        // Create a new image from the canvas
        const resultImg = new Image();
        resultImg.src = canvas.toDataURL('image/jpeg', 0.5);
        resultImg.onload = () => resolve(resultImg);
      };
      
      lowResImg.onerror = () => {
        // If creating low-res fails, return null
        resolve(null);
      };
      
      // Start loading the low-res image
      lowResImg.src = lowResUrl;
    });
  }

  /**
   * Get a URL for a low-resolution version of an image
   */
  private getLowResImageUrl(url: string): string {
    // Check if the URL is from a known image service that supports resizing
    if (url.includes('cloudinary.com')) {
      // For Cloudinary, insert transformation parameters
      return url.replace('/upload/', '/upload/w_200,q_60/');
    } else if (url.includes('imagekit.io')) {
      // For ImageKit, append transformation parameters
      return `${url}?tr=w-200,q-60`;
    } else if (url.includes('imgix.net')) {
      // For Imgix, append transformation parameters
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}w=200&q=60`;
    }
    
    // For unknown services, just return the original URL
    return url;
  }

  /**
   * Load an image from a URL with caching
   */
  private async loadImage(url: string): Promise<HTMLImageElement> {
    // This method now uses loadImageProgressively internally
    return this.loadImageProgressively(url);
  }

  private preprocessImage(image: tf.Tensor3D): tf.Tensor4D {
    return image.resizeBilinear([224, 224]).expandDims(0).div(255);
  }

  private processSkinAnalysis(predictions: tf.Tensor | tf.Tensor[]): {
    skinType: string;
    concerns: string[];
    score: number;
    analysis: Record<string, any>;
  } {
    // Convert predictions to array if it's a single tensor
    const predArray = Array.isArray(predictions) ? predictions : [predictions];

    // Get the highest confidence prediction
    const confidences = predArray[0].dataSync();
    const maxIndex = confidences.indexOf(Math.max(...confidences));

    // Map index to skin type
    const skinTypes = ['oily', 'dry', 'combination', 'normal'];

    const skinType = skinTypes[maxIndex];

    // Analyze concerns based on other predictions
    const concerns = [];
    const thresholds = {
      acne: 0.6,
      wrinkles: 0.6,
      pigmentation: 0.6,
      sensitivity: 0.6,
    };

    if (predArray[1]) {
      const concernConfidences = predArray[1].dataSync();
      if (concernConfidences[0] > thresholds.acne) concerns.push('acne');
      if (concernConfidences[1] > thresholds.wrinkles) concerns.push('wrinkles');
      if (concernConfidences[2] > thresholds.pigmentation) concerns.push('pigmentation');
      if (concernConfidences[3] > thresholds.sensitivity) concerns.push('sensitivity');
    }

    return {
      skinType,
      concerns,
      score: confidences[maxIndex],
      analysis: {
        confidence: confidences[maxIndex],
        allTypes: skinTypes.map((type, i) => ({
          type,
          confidence: confidences[i],
        })),
        concerns: concerns.map((concern) => ({
          type: concern,
          confidence: predArray[1].dataSync()[concerns.indexOf(concern)],
        })),
      },
    };
  }

  private async getProductRecommendations(analysis: any): Promise<Record<string, any>> {
    try {
      const prompt = `Based on the following skin analysis, recommend suitable skincare products:
        Skin Type: ${analysis.skinType}
        Concerns: ${analysis.concerns.join(', ')}
        Score: ${analysis.score}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a skincare expert providing product recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      logger.error('Failed to get product recommendations', 'VirtualTryOn', { error });
      throw error;
    }
  }

  private async generateColorPalette(skinTone: string): Promise<Record<string, any>> {
    try {
      const prompt = `Generate a makeup color palette for ${skinTone} skin tone.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a makeup artist creating personalized color palettes.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      logger.error('Failed to generate color palette', 'VirtualTryOn', { error });
      throw error;
    }
  }

  private async load3DHairModel(hairstyleId: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        `/models/hairstyles/${hairstyleId}.glb`,
        (gltf) => {
          const model = gltf.scene;
          model.name = 'hairModel';
          resolve(model);
        },
        undefined,
        reject,
      );
    });
  }
  
  /**
   * Clean up method to dispose of resources when service is no longer needed
   */
  public dispose(): void {
    // Clean up worker
    if (this.imageProcessingWorker) {
      this.imageProcessingWorker.terminate();
      this.imageProcessingWorker = null;
    }
    
    // Dispose of TensorFlow models to free memory
    if (this.faceModel) {
      this.faceModel.dispose();
    }
    
    // Clear caches
    this.imageCache = {};
    
    // Clear AR sessions
    this.arSessions.clear();
    
    logger.info('VirtualTryOnService resources disposed', 'VirtualTryOn');
  }
}
