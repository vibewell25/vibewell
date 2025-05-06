import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
import { Icons } from '@/components/icons';
  CameraIcon, 
  PhotoIcon, 
  ArrowPathIcon,
  ShareIcon,
  BookmarkIcon,
  SparklesIcon,
  ScissorsIcon,
  PaintBrushIcon,
  FaceSmileIcon
from '@heroicons/react/24/outline';
interface VirtualStyle {
  id: string;
  name: string;
  category: 'hair' | 'makeup' | 'accessories';
  thumbnail: string;
  intensity: number;
  color?: string;
  variations: string[];
const virtualStyles: VirtualStyle[] = [
  {
    id: 'hair1',
    name: 'Long Wavy',
    category: 'hair',
    thumbnail: '/virtual-styles/hair/long-wavy.jpg',
    intensity: 0.5,
    color: '#8B4513',
    variations: ['Straight', 'Wavy', 'Curly']
{
    id: 'makeup1',
    name: 'Natural Glow',
    category: 'makeup',
    thumbnail: '/virtual-styles/makeup/natural-glow.jpg',
    intensity: 0.7,
    variations: ['Light', 'Medium', 'Full']
// Add more styles...
];
export default function VirtualTryOnPage() {
  const [activeTab, setActiveTab] = useState('hair');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<VirtualStyle | null>(null);
  const [styleIntensity, setStyleIntensity] = useState(0.5);
  const [isMirrorMode, setIsMirrorMode] = useState(true);
  const [isARMode, setIsARMode] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
else {
      stopCamera();
[isCameraActive]);
  const startCamera = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
if (videoRef.current) {
        videoRef.current.srcObject = stream;
catch (error) {
      console.error('Error accessing camera:', error);
const stopCamera = () => {
    if (videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
const handleStyleSelect = (style: VirtualStyle) => {
    setSelectedStyle(style);
    setStyleIntensity(style.intensity);
const handleCapture = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        // Apply virtual style to the captured image
        // This would be handled by your AR/ML model
return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Virtual Try-On</h1>
          <p className="text-xl text-muted-foreground">
            Preview beauty services in real-time using AR technology
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Preview</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsMirrorMode(!isMirrorMode)}
                    >
                      <Icons.ArrowPathIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsARMode(!isARMode)}
                    >
                      <Icons.SparklesIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className={`w-full h-full object-cover ${isMirrorMode ? 'scale-x-[-1]' : ''}`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Icons.CameraIcon className="h-12 w-12 mb-4" />
                      <p>Camera is inactive</p>
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="mt-4 flex justify-center gap-4">
                  <Button
                    variant={isCameraActive ? 'destructive' : 'default'}
                    onClick={() => setIsCameraActive(!isCameraActive)}
                  >
                    {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCapture}
                    disabled={!isCameraActive}
                  >
                    <Icons.PhotoIcon className="h-5 w-5 mr-2" />
                    Capture
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Style Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Style Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="hair">
                      <Icons.ScissorsIcon className="h-5 w-5 mr-2" />
                      Hair
                    </TabsTrigger>
                    <TabsTrigger value="makeup">
                      <Icons.PaintBrushIcon className="h-5 w-5 mr-2" />
                      Makeup
                    </TabsTrigger>
                    <TabsTrigger value="accessories">
                      <Icons.FaceSmileIcon className="h-5 w-5 mr-2" />
                      Accessories
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="hair" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {virtualStyles
                        .filter(style => style.category === 'hair')
                        .map(style => (
                          <Card
                            key={style.id}
                            className={`cursor-pointer transition-all ${
                              selectedStyle.id === style.id ? 'border-primary' : ''
`}
                            onClick={() => handleStyleSelect(style)}
                          >
                            <CardContent className="p-4">
                              <div className="aspect-square bg-muted rounded-lg mb-2" />
                              <p className="font-medium">{style.name}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="makeup" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {virtualStyles
                        .filter(style => style.category === 'makeup')
                        .map(style => (
                          <Card
                            key={style.id}
                            className={`cursor-pointer transition-all ${
                              selectedStyle.id === style.id ? 'border-primary' : ''
`}
                            onClick={() => handleStyleSelect(style)}
                          >
                            <CardContent className="p-4">
                              <div className="aspect-square bg-muted rounded-lg mb-2" />
                              <p className="font-medium">{style.name}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            {selectedStyle && (
              <Card>
                <CardHeader>
                  <CardTitle>Style Adjustments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Intensity</Label>
                    <Slider
                      value={[styleIntensity]}
                      onValueChange={([value]) => setStyleIntensity(value)}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>
                  {selectedStyle.color && (
                    <div>
                      <Label>Color</Label>
                      <div className="flex gap-2 mt-2">
                        {['#8B4513', '#4A2C0A', '#000000', '#FFFFFF'].map(color => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded-full border-2"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedStyle.variations && (
                    <div>
                      <Label>Variations</Label>
                      <div className="flex gap-2 mt-2">
                        {selectedStyle.variations.map(variation => (
                          <Button
                            key={variation}
                            variant="outline"
                            size="sm"
                          >
                            {variation}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            <div className="flex gap-4">
              <Button className="flex-1" variant="outline">
                <Icons.ShareIcon className="h-5 w-5 mr-2" />
                Share
              </Button>
              <Button className="flex-1" variant="outline">
                <Icons.BookmarkIcon className="h-5 w-5 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
