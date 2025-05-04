

import * as faceapi from 'face-api.js';

import { logger } from '@/lib/logger';
import { Canvas, Image } from 'canvas';

import { FaceMeshResults } from './mediapipe-service';

faceapi.env.monkeyPatch({ Canvas, Image });

export interface FaceDetectionOptions {
  minConfidence?: number;
  withLandmarks?: boolean;
  withExpressions?: boolean;
  withAgeAndGender?: boolean;
  withDescriptors?: boolean;
}

export interface FaceAnalysisResult {
  detection: faceapi.FaceDetection;
  landmarks?: faceapi.FaceLandmarks68;
  expressions?: faceapi.FaceExpressions;
  age?: number;
  gender?: string;
  descriptor?: Float32Array;
}

export class FaceApiService {
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Load models from public directory
      await Promise.all([

        faceapi.nets.ssdMobilenetv1.loadFromUri('/models/face-api'),

        faceapi.nets.faceLandmark68Net.loadFromUri('/models/face-api'),

        faceapi.nets.faceExpressionNet.loadFromUri('/models/face-api'),

        faceapi.nets.ageGenderNet.loadFromUri('/models/face-api'),

        faceapi.nets.faceRecognitionNet.loadFromUri('/models/face-api'),
      ]);

      this.isInitialized = true;

      logger.info('Face-api models loaded successfully', 'FaceApiService');
    } catch (error) {

      logger.error('Failed to load face-api models', 'FaceApiService', { error });
      throw error;
    }
  }

  async detectFace(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageData,
    options: FaceDetectionOptions = {},
  ): Promise<FaceAnalysisResult[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const {
        minConfidence = 0.9,
        withLandmarks = true,
        withExpressions = false,
        withAgeAndGender = false,
        withDescriptors = false,
      } = options;

      // Create detection tasks array
      const tasks = [
        faceapi.detectAllFaces(image, new faceapi.SsdMobilenetv1Options({ minConfidence })),
      ];

      if (withLandmarks) {
        tasks[0] = tasks[0].withFaceLandmarks();
      }

      if (withExpressions) {
        tasks[0] = tasks[0].withFaceExpressions();
      }

      if (withAgeAndGender) {
        tasks[0] = tasks[0].withAgeAndGender();
      }

      if (withDescriptors) {
        tasks[0] = tasks[0].withFaceDescriptors();
      }

      // Run detection
      const results = await Promise.all(tasks);
      return results.map((result) => ({
        detection: result.detection,
        landmarks: result.landmarks,
        expressions: result.expressions,
        age: result.age,
        gender: result.gender,
        descriptor: result.descriptor,
      }));
    } catch (error) {
      logger.error('Face detection failed', 'FaceApiService', { error });
      throw error;
    }
  }

  async convertToFaceMeshResults(detections: FaceAnalysisResult[]): Promise<FaceMeshResults> {
    try {
      const multiFaceLandmarks = detections.map((detection) => {
        if (!detection.landmarks) {
          throw new Error('Face landmarks not detected');
        }


        // Convert face-api landmarks to normalized landmarks
        const points = detection.landmarks.positions;
        const imageSize = detection.detection.imageDims;

        return points.map((point) => ({

          x: point.x / imageSize.width,

          y: point.y / imageSize.height,


          z: 0, // face-api doesn't provide z-coordinates
        }));
      });

      return { multiFaceLandmarks };
    } catch (error) {

      logger.error('Failed to convert face-api results to FaceMesh format', 'FaceApiService', {
        error,
      });
      throw error;
    }
  }

  async analyzeFaceAttributes(detection: FaceAnalysisResult): Promise<{
    age?: number;
    gender?: string;
    expressions?: Record<string, number>;
    skinTone?: string;
  }> {
    try {
      const attributes: any = {};

      if (detection.age) {
        attributes.age = Math.round(detection.age);
      }

      if (detection.gender) {
        attributes.gender = detection.gender;
      }

      if (detection.expressions) {
        attributes.expressions = Object.fromEntries(
          Object.entries(detection.expressions).map(([key, value]) => [
            key,
            parseFloat(value.toFixed(2)),
          ]),
        );
      }

      // Estimate skin tone if landmarks are available
      if (detection.landmarks) {
        attributes.skinTone = await this.estimateSkinTone(detection);
      }

      return attributes;
    } catch (error) {
      logger.error('Failed to analyze face attributes', 'FaceApiService', { error });
      throw error;
    }
  }

  private async estimateSkinTone(detection: FaceAnalysisResult): Promise<string> {
    try {
      // This is a placeholder implementation
      // In a real implementation, you would:
      // 1. Extract skin pixels using face landmarks
      // 2. Convert to LAB color space
      // 3. Analyze color distribution
      // 4. Classify into skin tone categories
      return 'medium';
    } catch (error) {
      logger.error('Failed to estimate skin tone', 'FaceApiService', { error });
      throw error;
    }
  }
}
