'use client';

import { useState } from 'react';
import { EnhancedHeader } from '@/components/enhanced-header';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { ResponsiveTester } from '@/components/ui/responsive-tester';
import { TouchHandler } from '@/components/ui/touch-handler';
import { useResponsive } from '@/hooks/useResponsive';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ResponsiveTestPage() {
  const { deviceType, isMobile, isTablet, isDesktop } = useResponsive();
  const [touchEvents, setTouchEvents] = useState<string[]>([]);
  const [lastGesture, setLastGesture] = useState<string>('None');

  // Handle touch gestures
  const handleGesture = (type: string, details?: string) => {
    const gesture = `${type}${details ? `: ${details}` : ''}`;
    setLastGesture(gesture);

    setTouchEvents((prev) => {
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
            <h1 className="mb-4 text-3xl font-bold">Responsive Components Test</h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Testing responsive behavior across different screen sizes and devices.
            </p>
          </div>

          <Card className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">Device Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-medium">Device Type</h3>
                <div className="text-xl font-bold">{deviceType}</div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-medium">Screen Category</h3>
                <div>
                  <span className={`text-xl font-bold ${isMobile ? 'text-primary' : ''}`}>
                    Mobile
                  </span>
                  <span className="mx-2">|</span>
                  <span className={`text-xl font-bold ${isTablet ? 'text-primary' : ''}`}>
                    Tablet
                  </span>
                  <span className="mx-2">|</span>
                  <span className={`text-xl font-bold ${isDesktop ? 'text-primary' : ''}`}>
                    Desktop
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-medium">Layout Adaptation</h3>
                <div className="text-xl font-bold">
                  {isMobile ? 'Compact Layout' : isTablet ? 'Medium Layout' : 'Full Layout'}
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
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
              className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50"
            >
              <div className="text-center">
                <p className="mb-2 font-medium">Touch Interaction Area</p>
                <p className="text-sm text-muted-foreground">Last gesture: {lastGesture}</p>
              </div>
            </TouchHandler>

            <div>
              <h3 className="mb-2 font-medium">Recent Touch Events:</h3>
              {touchEvents.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5">
                  {touchEvents.map((event, index) => (
                    <li key={index}>{event}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No touch events yet</p>
              )}
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">Responsive Image Test</h2>
            <p>This image will adapt based on your device:</p>

            <div className="overflow-hidden rounded-lg">
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
              <ul className="mt-2 list-disc pl-5">
                <li>Mobile: 400px width version</li>
                <li>Tablet: 800px width version</li>
                <li>Desktop: 1200px width version</li>
              </ul>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">Layout Adaptation Test</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-medium">Item {item}</h3>
                  <p className="text-muted-foreground">
                    This grid will adapt its columns based on screen size.
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <div className="sm:w-1/2">
                <h3 className="mb-2 font-medium">Column 1</h3>
                <p className="text-muted-foreground">
                  On small screens, these sections will stack vertically. On larger screens, they
                  will appear side by side.
                </p>
              </div>
              <div className="sm:w-1/2">
                <h3 className="mb-2 font-medium">Column 2</h3>
                <p className="text-muted-foreground">
                  Responsive design allows us to create layouts that work well on any device.
                </p>
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <Button size="lg">Take Action</Button>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Responsive Tester Tool */}
      <ResponsiveTester position="bottom-right" />
    </>
  );
}
