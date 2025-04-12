import { useCallback, useEffect, useRef } from 'react';

interface GestureConfig {
    threshold?: number;
    timeout?: number;
    preventDefault?: boolean;
}

export const useSwipeGesture = (
    onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void,
    config: GestureConfig = {}
) => {
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const { threshold = 50, timeout = 300, preventDefault = true } = config;

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }, [preventDefault]);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        if (!touchStart.current) return;

        const touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };

        const diffX = touchEnd.x - touchStart.current.x;
        const diffY = touchEnd.y - touchStart.current.y;

        if (Math.abs(diffX) > threshold || Math.abs(diffY) > threshold) {
            if (Math.abs(diffX) > Math.abs(diffY)) {
                onSwipe(diffX > 0 ? 'right' : 'left');
            } else {
                onSwipe(diffY > 0 ? 'down' : 'up');
            }
        }

        touchStart.current = null;
    }, [onSwipe, threshold, preventDefault]);

    useEffect(() => {
        const element = document.documentElement;
        element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
        element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchEnd, preventDefault]);
};

export const usePinchGesture = (
    onPinch: (scale: number) => void,
    config: GestureConfig = {}
) => {
    const initialDistance = useRef<number | null>(null);
    const { threshold = 0.1, preventDefault = true } = config;

    const getDistance = (touches: TouchList) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        if (e.touches.length === 2) {
            initialDistance.current = getDistance(e.touches);
        }
    }, [preventDefault]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        if (e.touches.length === 2 && initialDistance.current) {
            const currentDistance = getDistance(e.touches);
            const scale = currentDistance / initialDistance.current;
            if (Math.abs(scale - 1) > threshold) {
                onPinch(scale);
            }
        }
    }, [onPinch, threshold, preventDefault]);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        initialDistance.current = null;
    }, [preventDefault]);

    useEffect(() => {
        const element = document.documentElement;
        element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
        element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
        element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);
};
