'use client';

import { useState } from 'react';
import { EnhancedHeader } from '@/components/enhanced-header';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { ResponsiveTester } from '@/components/ui/responsive-tester';
import { TouchHandler } from '@/components/ui/touch-handler';
import { useResponsive } from '@/hooks/useResponsive';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ResponsiveTestPage() {
  const { deviceType, isMobile, isTablet, isDesktop } = useResponsive();
  const [touchEvents, setTouchEvents] = useState<string[]>([]);
  const [lastGesture, setLastGesture] = useState<string>('None');

  // Handle touch gestures
  const handleGesture = (type: string, details?: string) => {
    const gesture = `${type}${details ? `: ${details}` : ''}`;
    setLastGesture(gesture);
    
    setTouchEvents(prev => {
      const updated = [gesture, ...prev];
      // Keep only the last 5 events
      return updated.slice(0, 5);
    });
  };

  return (
    <>
      <EnhancedHeader />
      
      <ResponsiveContainer maxWidth="xl" className="py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Responsive Components Test</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Testing responsive behavior across different screen sizes and devices.
            </p>
          </div>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Device Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Device Type</h3>
                <div className="text-xl font-bold">{deviceType}</div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Screen Category</h3>
                <div>
                  <span className={`text-xl font-bold ${isMobile ? 'text-primary' : ''}`}>Mobile</span>
                  <span className="mx-2">|</span>
                  <span className={`text-xl font-bold ${isTablet ? 'text-primary' : ''}`}>Tablet</span>
                  <span className="mx-2">|</span>
                  <span className={`text-xl font-bold ${isDesktop ? 'text-primary' : ''}`}>Desktop</span>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Layout Adaptation</h3>
                <div className="text-xl font-bold">
                  {isMobile ? 'Compact Layout' : isTablet ? 'Medium Layout' : 'Full Layout'}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Touch Interaction Test</h2>
            <p>Try using touch gestures in the area below (tap, swipe, pinch, rotate):</p>
            
            <TouchHandler
              onGesture={(gesture) => {
                if (gesture.type === 'swipe' && gesture.direction) {
                  handleGesture('Swipe', gesture.direction);
                } else if (gesture.type === 'pinch' && gesture.scale) {
                  handleGesture('Pinch', `scale ${gesture.scale.toFixed(2)}`);
                } else if (gesture.type === 'rotate' && gesture.rotation) {
                  handleGesture('Rotate', `${gesture.rotation.toFixed(0)}°`);
                } else if (gesture.type === 'tap') {
                  handleGesture('Tap');
                } else if (gesture.type === 'longpress') {
                  handleGesture('Long Press');
                }
              }}
              className="h-64 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
            >
              <div className="text-center">
                <p className="font-medium mb-2">Touch Interaction Area</p>
                <p className="text-muted-foreground text-sm">Last gesture: {lastGesture}</p>
              </div>
            </TouchHandler>
            
            <div>
              <h3 className="font-medium mb-2">Recent Touch Events:</h3>
              {touchEvents.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {touchEvents.map((event, index) => (
                    <li key={index}>{event}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No touch events yet</p>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Responsive Image Test</h2>
            <p>This image will adapt based on your device:</p>
            
            <div className="rounded-lg overflow-hidden">
              <ResponsiveImage
                src="https://images.unsplash.com/photo-1607437817193-1892a4f1b1ec?w=1200"
                mobileSrc="https://images.unsplash.com/photo-1607437817193-1892a4f1b1ec?w=400"
                tabletSrc="https://images.unsplash.com/photo-1607437817193-1892a4f1b1ec?w=800"
                alt="Responsive test image"
                width={1200}
                height={800}
                className="w-full rounded-lg"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              This image uses different resolutions based on device type:
              <ul className="list-disc pl-5 mt-2">
                <li>Mobile: 400px width version</li>
                <li>Tablet: 800px width version</li>
                <li>Desktop: 1200px width version</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Layout Adaptation Test</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Item {item}</h3>
                  <p className="text-muted-foreground">
                    This grid will adapt its columns based on screen size.
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="sm:w-1/2">
                <h3 className="font-medium mb-2">Column 1</h3>
                <p className="text-muted-foreground">
                  On small screens, these sections will stack vertically. On larger screens, they will appear side by side.
                </p>
              </div>
              <div className="sm:w-1/2">
                <h3 className="font-medium mb-2">Column 2</h3>
                <p className="text-muted-foreground">
                  Responsive design allows us to create layouts that work well on any device.
                </p>
              </div>
            </div>
          </Card>

          <div className="text-center mt-8">
            <Button size="lg">
              Take Action
            </Button>
          </div>
        </div>
      </ResponsiveContainer>
      
      {/* Responsive Tester Tool */}
      <ResponsiveTester position="bottom-right" />
    </>
  );
} 