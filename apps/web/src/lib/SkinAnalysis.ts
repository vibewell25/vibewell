import * as tf from '@tensorflow/tfjs';
import { logger } from './logger';

interface SkinConcern {
  type: 'acne' | 'wrinkles' | 'pigmentation' | 'redness' | 'dryness' | 'oiliness';
  severity: number; // 0-1
  confidence: number; // 0-1
  regions: Array<{ x: number; y: number; width: number; height: number }>;
interface SkinAnalysisResult {
  skinType: 'dry' | 'oily' | 'combination' | 'normal';
  concerns: SkinConcern[];
  overallHealth: number; // 0-1
  recommendations: {
    products: string[];
    treatments: string[];
    lifestyle: string[];
export class SkinAnalysisService {
  private model: tf.LayersModel | null = null;

  private readonly MODEL_PATH = '/models/skin_analysis/model.json';
  private readonly IMAGE_SIZE = 224; // Input size for the model

  constructor() {
    this.initializeModel();
/**
   * Initializes the TensorFlow.js model
   */
  private async initializeModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(this.MODEL_PATH);
      logger.info('Skin analysis model loaded successfully', 'SkinAnalysis');
catch (error) {
      logger.error('Failed to load skin analysis model', 'SkinAnalysis', { error });
      throw error;
/**
   * Analyzes skin from image data
   */
  public async analyzeSkin(imageData: ImageData): Promise<SkinAnalysisResult> {
    try {
      if (!this.model) {
        throw new Error('Model not initialized');
// Preprocess image
      const tensor = await this.preprocessImage(imageData);

      // Run inference
      const predictions = (await this.model.predict(tensor)) as tf.Tensor;
      const results = await this.processResults(predictions);

      // Cleanup
      tensor.dispose();
      predictions.dispose();

      return results;
catch (error) {
      logger.error('Failed to analyze skin', 'SkinAnalysis', { error });
      throw error;
/**
   * Preprocesses image for model input
   */
  private async preprocessImage(imageData: ImageData): Promise<tf.Tensor4D> {
    return tf.tidy(() => {
      // Convert ImageData to tensor
      const tensor = tf.browser
        .fromPixels(imageData)
        // Resize
        .resizeBilinear([this.IMAGE_SIZE, this.IMAGE_SIZE])
        // Normalize to [-1, 1]
        .toFloat()
        .sub(127.5)
        .div(127.5)
        .expandDims(0) as tf.Tensor4D; // Explicitly cast to Tensor4D

      return tensor;
/**
   * Processes model predictions
   */
  private async processResults(predictions: tf.Tensor): Promise<SkinAnalysisResult> {
    const [skinTypeProbs, concernProbs, healthScore] = await Promise.all([
      predictions.slice([0, 0], [1, 4]).data(), // Skin type
      predictions.slice([0, 4], [1, 10]).data(), // Concerns
      predictions.slice([0, 14], [1, 1]).data(), // Overall health
    ]);

    // Determine skin type
    const skinTypes = ['dry', 'oily', 'combination', 'normal'] as const;
    const skinType = skinTypes[tf.argMax(skinTypeProbs).dataSync()[0]];

    // Process concerns
    const concernTypes = [
      'acne',
      'wrinkles',
      'pigmentation',
      'redness',
      'dryness',
      'oiliness',
    ] as const;

    const concerns: SkinConcern[] = concernTypes
      .map((type, i) => ({
        type,

    severity: concernProbs[i],

        confidence: concernProbs[i + concernTypes.length],
        regions: [], // Would be populated by a separate detection model
))
      .filter((concern) => concern.confidence > 0.5);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(skinType, concerns, healthScore[0]);

    return {
      skinType,
      concerns,
      overallHealth: healthScore[0],
      recommendations,
/**
   * Generates personalized recommendations
   */
  private async generateRecommendations(
    skinType: SkinAnalysisResult['skinType'],
    concerns: SkinConcern[],
    healthScore: number,
  ): Promise<SkinAnalysisResult['recommendations']> {
    // This would typically involve a separate recommendation engine

    // For now, using basic rules-based recommendations
    const recommendations: SkinAnalysisResult['recommendations'] = {
      products: [],
      treatments: [],
      lifestyle: [],
// Product recommendations based on skin type
    switch (skinType) {
      case 'dry':
        recommendations.products.push('Hydrating cleanser', 'Rich moisturizer', 'Facial oil');
        break;
      case 'oily':

        recommendations.products.push('Oil-free cleanser', 'Light moisturizer', 'Clay mask');
        break;
      case 'combination':

        recommendations.products.push('Balanced cleanser', 'Zone-specific moisturizer', 'Toner');
        break;
      case 'normal':
        recommendations.products.push('Gentle cleanser', 'Daily moisturizer', 'Sunscreen');
        break;
// Treatment recommendations based on concerns
    for (const concern of concerns) {
      if (concern.severity > 0.7) {
        switch (concern.type) {
          case 'acne':
            recommendations.treatments.push('Salicylic acid treatment');
            break;
          case 'wrinkles':
            recommendations.treatments.push('Retinol treatment');
            break;
          case 'pigmentation':
            recommendations.treatments.push('Vitamin C serum');
            break;
          // Add more cases for other concerns
// Lifestyle recommendations based on overall health
    

    return recommendations;
/**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
