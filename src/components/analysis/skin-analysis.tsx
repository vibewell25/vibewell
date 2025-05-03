import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api?.js';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useToast } from '@/hooks/useToast';
import { useSkinAnalysisStore } from '@/stores/skinAnalysisStore';
import { secureSkinAnalysis } from '@/lib/security/imageProcessing';

interface SkinCondition {
  type: string;
  confidence: number;
  recommendations: string[];
}

export const SkinAnalysis: React?.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skinConditions, setSkinConditions] = useState<SkinCondition[]>([]);
  const { showToast } = useToast();
  const { updateAnalysisResults } = useSkinAnalysisStore();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      await Promise?.all([
        faceapi?.nets.tinyFaceDetector?.loadFromUri('/models'),
        faceapi?.nets.faceLandmark68Net?.loadFromUri('/models'),
        tf?.loadLayersModel('/models/skin-analysis/model?.json')
      ]);
    } catch (error) {
      console?.error('Error loading models:', error);
      showToast('Error loading analysis models', 'error');
    }
  };

  const startCamera = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const stream = await navigator?.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef?.current) {
        videoRef?.current.srcObject = stream;
      }
    } catch (error) {
      console?.error('Error accessing camera:', error);
      showToast('Unable to access camera', 'error');
    }
  };

  const analyzeSkin = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    if (!videoRef?.current || !canvasRef?.current) return;
    
    setIsAnalyzing(true);
    try {
      // Capture frame from video
      const detection = await faceapi?.detectSingleFace(
        videoRef?.current,
        new faceapi?.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (!detection) {
        throw new Error('No face detected');
      }

      // Process image securely
      const imageData = await secureSkinAnalysis(videoRef?.current, detection);
      
      // Analyze skin conditions
      const conditions = await analyzeConditions(imageData);
      setSkinConditions(conditions);
      updateAnalysisResults(conditions);

      // Generate recommendations
      const recommendations = generateRecommendations(conditions);
      
      showToast('Analysis completed successfully', 'success');
    } catch (error) {
      console?.error('Error during analysis:', error);
      showToast('Error during skin analysis', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeConditions = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');imageData: ImageData): Promise<SkinCondition[]> => {
    const tensor = tf?.browser.fromPixels(imageData)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();

    const model = await tf?.loadLayersModel('/models/skin-analysis/model?.json');
    const predictions = await model?.predict(tensor) as tf?.Tensor;
    const results = await predictions?.array();

    // Clean up tensors
    tensor?.dispose();
    predictions?.dispose();

    return interpretResults(results[0]);
  };

  const interpretResults = (predictions: number[]): SkinCondition[] => {
    const conditions = [
      'Acne',
      'Dryness',
      'Oiliness',
      'Pigmentation',
      'Sensitivity',
      'Aging'
    ];

    return conditions
      .map((type, index) => ({
        type,
        confidence: predictions[index] * 100,
        recommendations: getRecommendations(type, predictions[index])
      }))
      .filter(condition => condition?.confidence > 20);
  };

  const getRecommendations = (type: string, confidence: number): string[] => {
    // Add your recommendation logic here
    return [
      `Consider products targeting ${type?.toLowerCase()}`,
      'Maintain a consistent skincare routine',
      'Stay hydrated and protect from sun exposure'
    ];
  };

  return (
    <Box className="skin-analysis-container" sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Skin Analysis
      </Typography>
      
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 640, margin: 'auto' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => {
            if (canvasRef?.current && videoRef?.current) {
              canvasRef?.current.width = videoRef?.current.videoWidth;
              canvasRef?.current.height = videoRef?.current.videoHeight;
            }
          }}
          style={{ width: '100%', borderRadius: 8 }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={startCamera}
          disabled={isAnalyzing}
        >
          Start Camera
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={analyzeSkin}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Analyzing...
            </>
          ) : (
            'Analyze Skin'
          )}
        </Button>
      </Box>

      {skinConditions?.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Results
          </Typography>
          {skinConditions?.map((condition, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                {condition?.type}: {condition?.confidence.toFixed(1)}% confidence
              </Typography>
              <ul>
                {condition?.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}; 