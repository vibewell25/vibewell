import { PrismaClient, TryOnType, VirtualTryOn } from '@prisma/client';
import { OpenAI } from 'openai';
import { logger } from '@/lib/logger';
import * as tf from '@tensorflow/tfjs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ColorSpaces, ColorUtils } from '@/utils/color-utils';
import { MediaPipeService } from './mediapipe-service';
import { FaceApiService } from './face-api-service';

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

export class VirtualTryOnService {
  private openai: OpenAI;
  private faceModel!: tf.LayersModel;
  private arSessions: Map<string, ARSession>;
  private gltfLoader: GLTFLoader;
  private colorUtils: ColorUtils;
  private mediaPipeService: MediaPipeService;
  private faceApiService: FaceApiService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
    this.arSessions = new Map();
    this.gltfLoader = new GLTFLoader();
    this.colorUtils = new ColorUtils();
    this.mediaPipeService = new MediaPipeService();
    this.faceApiService = new FaceApiService();
    this.initializeFaceModel();
  }

  private async initializeFaceModel() {
    try {
      this.faceModel = await tf.loadLayersModel('/models/skin_analysis_model/model.json');
      logger.info('Face models initialized successfully', 'VirtualTryOn');
    } catch (error) {
      logger.error('Failed to initialize face models', 'VirtualTryOn', { error });
      throw error;
    }
  }

  async startARSession(userId: string, serviceId: string): Promise<string> {
    try {
      // Initialize Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      const session: ARSession = {
        id: Math.random().toString(36).substring(7),
        filters: [],
        state: {
          camera,
          scene
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
          resultUrl: ''
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
      
      if (!results?.multiFaceLandmarks?.length) {
        return frameData;
      }

      const landmarks = results.multiFaceLandmarks[0];
      
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
            await this.applyMakeupFilter(ctx, landmarks, filter.settings);
            break;
          case 'hair':
            await this.applyHairFilter(ctx, landmarks, filter.settings, session.state);
            break;
          case 'skin':
            await this.applySkinFilter(ctx, landmarks, filter.settings);
            break;
        }
      }

      // Update session state
      session.state.lastFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      return session.state.lastFrame;
    } catch (error) {
      logger.error('Error processing AR frame', 'VirtualTryOn', { error });
      throw error;
    }
  }

  private async applyMakeupFilter(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number; z: number }[],
    settings: Record<string, any>
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
      features.eyes.forEach(eye => {
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
    state: ARState
  ) {
    if (!state.scene || !state.camera) return;

    // Update hair model position based on head pose
    const headPose = await this.mediaPipeService.estimateHeadPose(landmarks);
    const hairModel = state.scene.getObjectByName('hairModel');
    
    if (hairModel) {
      hairModel.position.set(
        headPose.translation.x,
        headPose.translation.y,
        headPose.translation.z
      );
      hairModel.rotation.set(
        headPose.rotation.x,
        headPose.rotation.y,
        headPose.rotation.z
      );
    }

    // Render the 3D scene
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.render(state.scene, state.camera);

    // Composite 3D render with the original frame
    const threeCanvas = renderer.domElement;
    ctx.drawImage(threeCanvas, 0, 0);
  }

  private async applySkinFilter(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number; z: number }[],
    settings: Record<string, any>
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
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
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
        }
      }
    }
    
    return new ImageData(data, width, height);
  }

  private adjustSkinTone(imageData: ImageData, adjustment: { hue: number; saturation: number; brightness: number }): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    
    for (let i = 0; i < data.length; i += 4) {
      const [h, s, l] = this.colorUtils.rgbToHsl(data[i], data[i + 1], data[i + 2]);
      
      const newHue = (h + adjustment.hue) % 360;
      const newSat = Math.max(0, Math.min(100, s + adjustment.saturation));
      const newLight = Math.max(0, Math.min(100, l + adjustment.brightness));
      
      const [r, g, b] = this.colorUtils.hslToRgb(newHue, newSat, newLight);
      
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  }

  async analyzeSkin(userId: string, imageUrl: string): Promise<SkinAnalysisResult> {
    try {
      // Load and analyze image with face-api.js
      const image = await this.loadImage(imageUrl);
      const detections = await this.faceApiService.detectFace(image, {
        withLandmarks: true,
        withExpressions: true,
        withAgeAndGender: true
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
              recommendations
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
        recommendations
      };
    } catch (error) {
      logger.error('Error analyzing skin', 'VirtualTryOn', { error });
      throw error;
    }
  }

  async tryOnMakeup(userId: string, imageUrl: string, products: any[]): Promise<MakeupResult> {
    try {
      // Load and analyze image
      const image = await this.loadImage(imageUrl);
      const detections = await this.faceApiService.detectFace(image, {
        withLandmarks: true,
        withExpressions: true
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

      // Apply virtual makeup
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(image, 0, 0);
      await this.applyMakeupFilter(ctx, faceMeshResults.multiFaceLandmarks![0], {
        products,
        skinTone
      });

      const resultUrl = canvas.toDataURL();

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
              facialFeatures: detections[0].landmarks
            }
          }
        }
      });

      logger.info('Makeup try-on completed', 'VirtualTryOn', { userId });
      return {
        foundationShade: skinTone,
        colorPalette,
        products,
        facialFeatures: detections[0].landmarks
      };
    } catch (error) {
      logger.error('Error trying on makeup', 'VirtualTryOn', { error });
      throw error;
    }
  }

  async tryOnHairstyle(userId: string, imageUrl: string, hairstyleId: string): Promise<string> {
    try {
      // Load and analyze image
      const image = await this.loadImage(imageUrl);
      const detections = await this.faceApiService.detectFace(image, {
        withLandmarks: true
      });

      if (!detections.length) {
        throw new Error('No face detected');
      }

      // Convert to MediaPipe format
      const faceMeshResults = await this.faceApiService.convertToFaceMeshResults(detections);

      // Set up 3D scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, image.width / image.height, 0.1, 1000);

      // Load 3D hair model
      const hairModel = await this.load3DHairModel(hairstyleId);
      scene.add(hairModel);

      // Position hair model based on head pose
      const headPose = await this.mediaPipeService.estimateHeadPose(faceMeshResults.multiFaceLandmarks![0]);
      hairModel.position.set(
        headPose.translation.x,
        headPose.translation.y,
        headPose.translation.z
      );
      hairModel.rotation.set(
        headPose.rotation.x,
        headPose.rotation.y,
        headPose.rotation.z
      );

      // Render the result
      const renderer = new THREE.WebGLRenderer({ alpha: true });
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
          settings: { hairstyleId }
        }
      });

      logger.info('Hairstyle try-on completed', 'VirtualTryOn', { userId });
      return resultUrl;
    } catch (error) {
      logger.error('Error trying on hairstyle', 'VirtualTryOn', { error });
      throw error;
    }
  }

  // Helper methods

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private preprocessImage(image: tf.Tensor3D): tf.Tensor4D {
    return image
      .resizeBilinear([224, 224])
      .expandDims(0)
      .div(255);
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
      sensitivity: 0.6
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
          confidence: confidences[i]
        })),
        concerns: concerns.map(concern => ({
          type: concern,
          confidence: predArray[1].dataSync()[concerns.indexOf(concern)]
        }))
      }
    };
  }

  private async getProductRecommendations(analysis: any): Promise<Record<string, any>> {
    try {
      const prompt = `Based on the following skin analysis, recommend suitable skincare products:
        Skin Type: ${analysis.skinType}
        Concerns: ${analysis.concerns.join(', ')}
        Score: ${analysis.score}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a skincare expert providing product recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
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
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a makeup artist creating personalized color palettes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
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
        reject
      );
    });
  }
} 