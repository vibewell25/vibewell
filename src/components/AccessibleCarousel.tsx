import React, { useState, useRef, useEffect } from 'react';

interface CarouselItem {
  id: string;
  content: React.ReactNode;
  alt?: string;
}

interface AccessibleCarouselProps {
  items: CarouselItem[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  onSlideChange?: (index: number) => void;
}

export const AccessibleCarousel: React.FC<AccessibleCarouselProps> = ({
  items,
  className = '',
  autoPlay = false,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  onSlideChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = (index: number) => {
    const newIndex = (index + items.length) % items.length;
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);
  };

  const goToNext = () => {
    goToSlide(currentIndex + 1);
  };

  const goToPrevious = () => {
    goToSlide(currentIndex - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(items.length - 1);
        break;
      case ' ':
        e.preventDefault();
        setIsPlaying(!isPlaying);
        break;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(goToNext, interval);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, currentIndex]);

  return (
    <div
      className={`relative ${className}`}
      role="region"
      aria-label="Image carousel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="overflow-hidden"
        role="group"
        aria-roledescription="carousel"
        aria-label={`Slide ${currentIndex + 1} of ${items.length}`}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="w-full flex-shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${items.length}`}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 transform -translate-y-1/2">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      )}

      {showIndicators && (
        <div
          className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"
          role="tablist"
          aria-label="Slide indicators"
        >
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-2 h-2 rounded-full
                ${currentIndex === index ? 'bg-primary' : 'bg-white bg-opacity-50'}
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              `}
              role="tab"
              aria-selected={currentIndex === index}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
};

export default AccessibleCarousel;
