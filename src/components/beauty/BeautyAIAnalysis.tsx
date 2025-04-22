import React, { useState, useRef } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { analyzeSkinCondition, SkinAnalysisResult } from '@/lib/api/beauty';

export default function BeautyAIAnalysis() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkinAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    try {
      setLoading(true);
      const result = await analyzeSkinCondition(image);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing skin condition:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setPreviewUrl(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Skin Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Skin analysis"
                    className="max-w-full h-auto rounded"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleRetake} variant="outline">
                      Retake Photo
                    </Button>
                    <Button onClick={handleAnalyze} disabled={loading}>
                      {loading ? 'Analyzing...' : 'Analyze'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Upload Photo
                  </Button>
                  <p className="mt-2 text-sm text-gray-600">
                    Upload a clear, well-lit photo of your face
                  </p>
                </>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Tips for best results:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Use natural lighting</li>
                <li>Remove makeup</li>
                <li>Face the camera directly</li>
                <li>Keep hair away from face</li>
              </ul>
            </div>
          </div>
        </Card>

        {analysis && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Skin Concerns Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.concerns.map((concern, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {concern}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Skin Characteristics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(analysis.metrics).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-600">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 