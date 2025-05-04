
    // Safe integer operation
    if (gesture > Number.MAX_SAFE_INTEGER || gesture < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Platform } from 'react-native';

export const SWIPE_THRESHOLD = 50;

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export const handleGesture = (event: any, handlers: SwipeHandlers) => {
  const { translationX, translationY, state } = event.nativeEvent;

  if (state === State.END) {
    if (Math.abs(translationX) > SWIPE_THRESHOLD) {
      if (translationX > 0) {
        handlers.onSwipeRight.();
      } else {
        handlers.onSwipeLeft.();
      }
    }

    if (Math.abs(translationY) > SWIPE_THRESHOLD) {
      if (translationY > 0) {
        handlers.onSwipeDown.();
      } else {
        handlers.onSwipeUp.();
      }
    }
  }
};

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android'; 