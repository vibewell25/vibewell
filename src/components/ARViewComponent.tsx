import React, { useEffect, useState } from 'react';
import { useARService } from '@/hooks/useARService';
import { useARModels } from '@/hooks/useARModels';
import { ModelInfo } from '@/types/ar-types';

const ARViewComponent: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { initializeAR, loadModel, applyFilter, captureImage } = useARService();
  const { models, isLoading: modelsLoading, error } = useARModels();
  
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeAR();
      } catch (error) {
        console.error('Failed to initialize AR:', error);
      }
    };
    
    initialize();
  }, [initializeAR]);
  
  const handleModelSelect = async (modelId: string) => {
    setIsLoading(true);
    setSelectedModel(modelId);
    
    try {
      const result = await loadModel(modelId);
      if (result.success) {
        // Apply any default filter settings
        await applyFilter(1.0); // Default intensity
      }
    } catch (error) {
      console.error('Failed to load model:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCapture = async () => {
    try {
      const imageData = await captureImage();
      // Handle the captured image data
      console.log('Image captured:', imageData.substring(0, 50) + '...');
    } catch (error) {
      console.error('Failed to capture image:', error);
    }
  };
  
  return (
    <div data-testid="ar-container" className="ar-container">
      <h2>AR Experience</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="ar-viewport">
        {/* AR view would be rendered here */}
        {isLoading && (
          <div 
            data-testid="model-loading-indicator" 
            className="loading-indicator loading"
          >
            Loading model...
          </div>
        )}
      </div>
      
      <div className="model-selection">
        <h3>Select a Model</h3>
        <div className="models-grid">
          {models.map((model: ModelInfo) => (
            <button
              key={model.id}
              className={`model-btn ${selectedModel === model.id ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model.id)}
            >
              {model.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="ar-controls">
        <button 
          className="capture-btn"
          onClick={handleCapture}
          disabled={!selectedModel || isLoading}
        >
          Capture
        </button>
      </div>
    </div>
  );
};

export default ARViewComponent; 